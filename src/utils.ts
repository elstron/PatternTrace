export const $ = (el: string): Element | null => document.querySelector(el);
const logEl = $('#log');

export function log(line: string): void {
  if (!logEl) return;
  const time = new Date().toLocaleTimeString();
  const div = document.createElement('div');
  div.innerHTML = `<span class="muted">[${time}]</span> ${line}`;
  logEl.prepend(div);
}

export function byId(id: string): HTMLElement {
  const el = document.getElementById(id);
  if (!el) throw new Error(`Missing element: #${id}`);
  return el;
}

export function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}
