/*
 * BlockAdBlock (TypeScript port)
 * Original: Copyright (c) 2015 Valentin Allaire <valentin.allaire@sitexw.fr>
 * Released under the MIT license
 * https://github.com/sitexw/BlockAdBlock
 */

type DetectionHandler = () => void;

interface BlockAdBlockOptions {
  checkOnLoad: boolean;
  resetOnEnd: boolean;
  loopCheckTime: number;
  loopMaxNumber: number;
  baitClass: string;
  baitStyle: string;
  debug: boolean;
}

const DEFAULT_OPTIONS: BlockAdBlockOptions = {
  checkOnLoad: false,
  resetOnEnd: false,
  loopCheckTime: 50,
  loopMaxNumber: 5,
  baitClass: 'pub_300x250 pub_300x250m pub_728x90 text-ad textAd text_ad text_ads text-ads text-ad-links',
  baitStyle: 'width: 1px !important; height: 1px !important; position: absolute !important; left: -10000px !important; top: -1000px !important;',
  debug: false,
};

export class BlockAdBlock {
  static readonly VERSION = '3.2.1';

  private options: BlockAdBlockOptions;

  private bait: HTMLDivElement | null = null;
  private checking = false;
  private loopHandle: ReturnType<typeof setInterval> | null = null;
  private loopNumber = 0;
  private readonly events: { detected: DetectionHandler[]; notDetected: DetectionHandler[] } = {
    detected: [],
    notDetected: [],
  };

  constructor(options?: Partial<BlockAdBlockOptions>) {
    this.options = { ...DEFAULT_OPTIONS, ...options };

    window.addEventListener('load', this.handleWindowLoad, false);
  }

  private handleWindowLoad = (): void => {
    setTimeout(() => {
      if (!this.options.checkOnLoad) return;

      this.log('onload->eventCallback', 'A check loading is launched');

      if (this.bait === null) {
        this.createBait();
      }
      setTimeout(() => this.check(), 1);
    }, 1);
  };

  private log(method: string, message: string): void {
    if (this.options.debug) {
      console.log(`[BlockAdBlock][${method}] ${message}`);
    }
  }

  setOption<K extends keyof BlockAdBlockOptions>(key: K, value: BlockAdBlockOptions[K]): this;
  setOption(options: Partial<BlockAdBlockOptions>): this;
  setOption(optionsOrKey: Partial<BlockAdBlockOptions> | keyof BlockAdBlockOptions, value?: BlockAdBlockOptions[keyof BlockAdBlockOptions]): this {
    const options: Partial<BlockAdBlockOptions> = value !== undefined ? { [optionsOrKey as string]: value } : (optionsOrKey as Partial<BlockAdBlockOptions>);

    for (const key in options) {
      if (Object.prototype.hasOwnProperty.call(options, key)) {
        (this.options as any)[key] = (options as any)[key];
        this.log('setOption', `The option "${key}" was assigned to "${(options as any)[key]}"`);
      }
    }
    return this;
  }

  private createBait(): void {
    const bait = document.createElement('div');
    bait.setAttribute('class', this.options.baitClass);
    bait.setAttribute('style', this.options.baitStyle);
    this.bait = document.body.appendChild(bait);

    // Force layout/style calculation so offset/client properties are populated.
    void this.bait.offsetParent;
    void this.bait.offsetHeight;
    void this.bait.offsetLeft;
    void this.bait.offsetTop;
    void this.bait.offsetWidth;
    void this.bait.clientHeight;
    void this.bait.clientWidth;

    this.log('createBait', 'Bait has been created');
  }

  private destroyBait(): void {
    if (this.bait) {
      document.body.removeChild(this.bait);
      this.bait = null;
    }
    this.log('destroyBait', 'Bait has been removed');
  }

  check(loop = true): boolean {
    this.log('check', `An audit was requested ${loop ? 'with a' : 'without'} loop`);

    if (this.checking) {
      this.log('check', 'A check was canceled because there is already one ongoing');
      return false;
    }
    this.checking = true;

    if (this.bait === null) {
      this.createBait();
    }

    this.loopNumber = 0;
    if (loop) {
      this.loopHandle = setInterval(() => this.checkBait(loop), this.options.loopCheckTime);
    }
    setTimeout(() => this.checkBait(loop), 1);

    this.log('check', 'A check is in progress ...');
    return true;
  }

  private checkBait(loop: boolean): void {
    if (this.bait === null) {
      this.createBait();
    }
    const bait = this.bait!;

    let detected =
      document.body.getAttribute('abp') !== null ||
      bait.offsetParent === null ||
      bait.offsetHeight === 0 ||
      bait.offsetLeft === 0 ||
      bait.offsetTop === 0 ||
      bait.offsetWidth === 0 ||
      bait.clientHeight === 0 ||
      bait.clientWidth === 0;

    if (window.getComputedStyle !== undefined) {
      const style = window.getComputedStyle(bait, null);
      if (style && (style.getPropertyValue('display') === 'none' || style.getPropertyValue('visibility') === 'hidden')) {
        detected = true;
      }
    }

    this.log(
      'checkBait',
      `A check (${this.loopNumber + 1}/${this.options.loopMaxNumber} ~${1 + this.loopNumber * this.options.loopCheckTime}ms) was conducted and detection is ${
        detected ? 'positive' : 'negative'
      }`,
    );

    if (loop) {
      this.loopNumber++;
      if (this.loopNumber >= this.options.loopMaxNumber) {
        this.stopLoop();
      }
    }

    if (detected) {
      this.stopLoop();
      this.destroyBait();
      this.emitEvent(true);
      if (loop) this.checking = false;
    } else if (this.loopHandle === null || !loop) {
      this.destroyBait();
      this.emitEvent(false);
      if (loop) this.checking = false;
    }
  }

  private stopLoop(): void {
    if (this.loopHandle !== null) {
      clearInterval(this.loopHandle);
    }
    this.loopHandle = null;
    this.loopNumber = 0;
    this.log('stopLoop', 'A loop has been stopped');
  }

  emitEvent(detected: boolean): this {
    this.log('emitEvent', `An event with a ${detected ? 'positive' : 'negative'} detection was called`);

    const handlers = detected ? this.events.detected : this.events.notDetected;
    handlers.forEach((fn, i) => {
      this.log('emitEvent', `Call function ${i + 1}/${handlers.length}`);
      fn();
    });

    if (this.options.resetOnEnd) {
      this.clearEvent();
    }
    return this;
  }

  clearEvent(): void {
    this.events.detected = [];
    this.events.notDetected = [];
    this.log('clearEvent', 'The event list has been cleared');
  }

  on(detected: boolean, fn: DetectionHandler): this {
    (detected ? this.events.detected : this.events.notDetected).push(fn);
    this.log('on', `A type of event "${detected ? 'detected' : 'notDetected'}" was added`);
    return this;
  }

  onDetected(fn: DetectionHandler): this {
    return this.on(true, fn);
  }

  onNotDetected(fn: DetectionHandler): this {
    return this.on(false, fn);
  }
}
