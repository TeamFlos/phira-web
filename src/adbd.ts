/**
 * AdBlockDetector
 * 核心检测逻辑：诱饵元素可见性 + AdSense <ins> 属性异常 + 用户自定义容器 + iframe 尺寸压缩监控
 * 不含任何 UI 展示逻辑，检测结果通过回调 / EventTarget 对外暴露。
 */

export interface AdBlockDetectorConfig {
  /** 轮询检测间隔（ms） */
  checkInterval?: number;
  /** 需要额外监控的“真实”广告容器 ID 列表（缺失或被隐藏则判定为拦截） */
  watchedAdContainers?: string[];
  /** 前期高频率检测的轮次上限，超过后转为被动检测以节省 CPU */
  aggressiveCycles?: number;
  /** 检测到拦截时的回调 */
  onDetected?: (reason: DetectionReason) => void;
  /** 从“已检测到拦截”恢复正常时的回调（可选） */
  onCleared?: () => void;
}

export type DetectionReason = 'bait-generic' | 'bait-adsense' | 'adsense-suspicious-attr' | 'watched-container' | 'iframe-squeeze';

interface DetectorElements {
  baitGeneric: HTMLDivElement | null;
  baitAdsense: HTMLModElement | null;
}

const IDS = {
  baitGeneric: 'ad-detection-bait',
  baitAdsense: 'ad-detection-bait-ins',
} as const;

const CLASSES = {
  baitGeneric: 'ad-banner adsbygoogle ad-unit advertisement adbox sponsored-ad',
  baitAdsense: 'adsbygoogle',
  baitAdsensePermittedPrefix: 'adsbygoogle-',
} as const;

const BAIT_STYLE =
  'display: block !important; visibility: visible !important; opacity: 1 !important; ' +
  'height: 1px !important; width: 1px !important; position: absolute !important; ' +
  'left: -10000px !important; top: -10000px !important; background-color: transparent !important; ' +
  'pointer-events: none !important;';

const IFRAME_SQUEEZE_RULES: RegExp[] = [
  /height\s*:\s*1px\s*!important/i,
  /width\s*:\s*1px\s*!important/i,
  /max-height\s*:\s*1px\s*!important/i,
  /max-width\s*:\s*1px\s*!important/i,
];

export class AdBlockDetector {
  private readonly config: Required<Omit<AdBlockDetectorConfig, 'onDetected' | 'onCleared'>> & Pick<AdBlockDetectorConfig, 'onDetected' | 'onCleared'>;

  private elements: DetectorElements = { baitGeneric: null, baitAdsense: null };
  private detected = false;
  private cycles = 0;
  private intervalId: number | undefined;
  private iframeObserver: MutationObserver | undefined;
  private iframePollId: number | undefined;

  constructor(config: AdBlockDetectorConfig = {}) {
    this.config = {
      checkInterval: config.checkInterval ?? 2000,
      watchedAdContainers: config.watchedAdContainers ?? [],
      aggressiveCycles: config.aggressiveCycles ?? 30,
      onDetected: config.onDetected,
      onCleared: config.onCleared,
    };
  }

  /** 启动检测：创建诱饵、开始轮询、监听可见性变化和 iframe 变化 */
  init(): void {
    this.runInitialChecks();
    this.startLoop();
    this.bindLifecycleEvents();
    this.startIframeMonitor();
  }

  /** 停止所有定时器与观察者 */
  destroy(): void {
    if (this.intervalId !== undefined) window.clearInterval(this.intervalId);
    if (this.iframePollId !== undefined) window.clearInterval(this.iframePollId);
    this.iframeObserver?.disconnect();
  }

  get isDetected(): boolean {
    return this.detected;
  }

  // --- 诱饵元素管理 ---

  private createBaits(): void {
    if (!this.elements.baitGeneric || !document.getElementById(IDS.baitGeneric)) {
      const el = document.createElement('div');
      el.id = IDS.baitGeneric;
      el.className = CLASSES.baitGeneric;
      el.style.cssText = BAIT_STYLE;
      document.body.appendChild(el);
      this.elements.baitGeneric = el;
    }

    if (!this.elements.baitAdsense || !document.getElementById(IDS.baitAdsense)) {
      const el = document.createElement('ins');
      el.id = IDS.baitAdsense;
      el.className = CLASSES.baitAdsense;
      el.style.cssText = BAIT_STYLE;
      document.body.appendChild(el);
      this.elements.baitAdsense = el;
    }
  }

  private refreshBaits(): void {
    if (this.detected) return;
    (['baitGeneric', 'baitAdsense'] as const).forEach((key) => {
      const el = this.elements[key];
      if (el && el.isConnected) {
        document.body.appendChild(el); // 重新插入触发样式重算
      } else {
        this.createBaits();
      }
    });
  }

  private isHidden(element: Element | null): boolean {
    if (!element) return true;
    const htmlEl = element as HTMLElement;
    if (htmlEl.offsetHeight === 0 || htmlEl.offsetWidth === 0) return true;
    const style = getComputedStyle(element);
    return style.display === 'none' || style.visibility === 'hidden' || style.opacity === '0';
  }

  // --- 核心检测 ---

  private checkState(): void {
    this.createBaits();

    let reason: DetectionReason | null = null;

    if (this.isHidden(this.elements.baitGeneric)) {
      reason = 'bait-generic';
    }

    if (!reason && this.isHidden(this.elements.baitAdsense)) {
      reason = 'bait-adsense';
    }

    if (!reason) {
      const adElements = document.querySelectorAll(`ins.${CLASSES.baitAdsense}`);
      for (const ad of Array.from(adElements)) {
        const classNames = Array.from(ad.classList);
        const suspicious = classNames.some((cls) => cls !== CLASSES.baitAdsense && !cls.startsWith(CLASSES.baitAdsensePermittedPrefix));
        if (suspicious || ad.hasAttribute('title')) {
          reason = 'adsense-suspicious-attr';
          break;
        }
      }
    }

    if (!reason) {
      for (const containerId of this.config.watchedAdContainers) {
        const el = document.getElementById(containerId);
        if (!el || this.isHidden(el)) {
          reason = 'watched-container';
          break;
        }
      }
    }

    if (reason) {
      this.setDetected(reason);
    } else if (this.detected) {
      this.setCleared();
    }
  }

  private setDetected(reason: DetectionReason): void {
    if (!this.detected) {
      this.detected = true;
      this.config.onDetected?.(reason);
    }
  }

  private setCleared(): void {
    this.detected = false;
    this.config.onCleared?.();
  }

  // --- 主循环与事件绑定 ---

  private runInitialChecks(): void {
    this.checkState();
    [100, 500, 1000, 2000].forEach((delay) => window.setTimeout(() => this.checkState(), delay));
  }

  private startLoop(): void {
    this.intervalId = window.setInterval(() => {
      this.checkState();
      if (!this.detected && this.cycles < this.config.aggressiveCycles) {
        this.refreshBaits();
        this.cycles++;
      }
    }, this.config.checkInterval);

    document.addEventListener('visibilitychange', () => {
      if (!document.hidden) {
        this.checkState();
        this.cycles = 0;
      }
    });
  }

  private bindLifecycleEvents(): void {
    window.addEventListener('pageshow', (event) => {
      if ((event as PageTransitionEvent).persisted) this.checkState();
    });
    window.addEventListener('load', () => {
      window.setTimeout(() => this.checkState(), 100);
    });
  }

  /**
   * 监控 <ins> 内的 AdSense iframe 是否被压缩为 1px（部分拦截器采用 CSS 隐藏而非移除元素）
   */
  private startIframeMonitor(): void {
    const check = () => {
      const iframes = document.querySelectorAll<HTMLIFrameElement>('ins iframe[id^="aswift_"]');
      for (const iframe of Array.from(iframes)) {
        const style = iframe.getAttribute('style');
        if (!style) continue;
        const matchCount = IFRAME_SQUEEZE_RULES.reduce((count, rule) => count + (rule.test(style) ? 1 : 0), 0);
        if (matchCount >= 2) {
          this.setDetected('iframe-squeeze');
          this.iframeObserver?.disconnect();
          if (this.iframePollId !== undefined) window.clearInterval(this.iframePollId);
          return;
        }
      }
    };

    this.iframeObserver = new MutationObserver((mutations) => {
      const shouldCheck = mutations.some((m) => m.type === 'childList' || (m.type === 'attributes' && (m.target as Element).tagName in { IFRAME: 1, INS: 1 }));
      if (shouldCheck) check();
    });

    this.iframeObserver.observe(document.documentElement, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['style'],
    });

    this.iframePollId = window.setInterval(check, 3500);
  }
}
