function stripComment(value: string): string {
  let quote: string | null = null;
  for (let i = 0; i < value.length; i++) {
    const ch = value[i];
    if (quote) {
      if (ch === quote && value[i - 1] !== '\\') quote = null;
    } else if (ch === '"' || ch === "'") {
      quote = ch;
    } else if (ch === '#' && (i === 0 || /\s/.test(value[i - 1]))) {
      return value.slice(0, i).trimEnd();
    }
  }
  return value.trimEnd();
}

function unquote(value: string): string {
  const text = value.trim();
  if (text.length >= 2 && ((text[0] === '"' && text[text.length - 1] === '"') || (text[0] === "'" && text[text.length - 1] === "'"))) {
    return text.slice(1, -1).replace(/\\(["'\\n])/g, (_, c: string) => (c === 'n' ? '\n' : c));
  }
  return text;
}

function scalar(value: string): unknown {
  const text = unquote(value);
  if (text === '' || text === '~' || text === 'null') return null;
  if (text === 'true') return true;
  if (text === 'false') return false;
  if (/^[-+]?(?:\d+\.?\d*|\.\d+)(?:[eE][-+]?\d+)?$/.test(text)) return Number(text);
  return text;
}

/**
 * Minimal YAML reader for flat Phira `info.yml` files.
 * Handles `key: value`, quoted strings, and one level of `- item` lists.
 */
export function parseInfoYaml(text: string): Record<string, unknown> {
  const result: Record<string, unknown> = {};
  let listKey: string | null = null;
  for (const rawLine of text.split(/\r?\n/)) {
    const line = rawLine.trimEnd();
    if (!line.trim() || line.trimStart().startsWith('#')) continue;
    const item = line.match(/^\s*-\s*(.*)$/);
    if (item && listKey) {
      (result[listKey] as unknown[]).push(scalar(item[1]));
      continue;
    }
    const entry = line.match(/^([A-Za-z0-9_]+)\s*:\s*(.*)$/);
    if (!entry) continue;
    const [, key, rest] = entry;
    const value = stripComment(rest);
    if (value === '') {
      result[key] = [];
      listKey = key;
    } else {
      result[key] = scalar(value);
      listKey = null;
    }
  }
  return result;
}
