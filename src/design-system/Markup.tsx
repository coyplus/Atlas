import { createElement, memo, useCallback, useState, type ReactNode } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { flushSync } from 'react-dom';
import { htmlToDOM, attributesToProps, Element, Text, type DOMNode } from 'html-react-parser';

/** Fidelity renderer for migrated feature templates. No raw HTML injection.
 * React owns element identity and reconciliation; controllers update named regions.
 * This boundary lets feature templates be replaced by authored TSX independently.
 */
const regions = new WeakMap<Element | HTMLElement, (markup: string) => void>();
const roots = new WeakMap<HTMLElement, Root>();
const activeRoots = new Set<Root>();
export function disposeAllRegions() {
  for (const root of activeRoots) flushSync(() => root.unmount());
  activeRoots.clear();
}
function childrenMarkup(nodes: DOMNode[]): ReactNode[] {
  const seen = new Map<string, number>();
  return nodes.map((node, index) => {
    if (node instanceof Text) return node.data;
    if (!(node instanceof Element) || ['script', 'style'].includes(node.name)) return null;
    const identity =
      node.attribs.id ||
      node.attribs['data-module'] ||
      node.attribs['data-condition'] ||
      node.attribs['data-action'] ||
      `${node.name}-${index}`;
    const count = seen.get(identity) || 0;
    seen.set(identity, count + 1);
    const key = count ? identity + '-' + count : identity;
    return <TemplateElement key={key} node={node} />;
  });
}
const TemplateElement = memo(function TemplateElement({ node }: { node: Element }) {
  const [override, setOverride] = useState<{ source: Element; markup: string } | null>(null);
  // Reuse manually-updated descendants only while their source template is unchanged.
  const source = node.children.map((n) => serialize(n as DOMNode)).join('');
  const [lastSource, setLastSource] = useState(source);
  if (source !== lastSource) {
    setLastSource(source);
    if (override) setOverride(null);
  }
  const ref = useCallback(
    (el: HTMLElement | null) => {
      if (el) regions.set(el as never, (markup) => setOverride({ source: node, markup }));
    },
    [node],
  );
  const props: Record<string, unknown> = attributesToProps(node.attribs);
  delete props.onclick;
  delete props.onClick;
  if ('value' in props && ['input', 'textarea', 'select'].includes(node.name)) {
    props.defaultValue = props.value;
    delete props.value;
  }
  if ('checked' in props) {
    props.defaultChecked = props.checked;
    delete props.checked;
  }
  if (node.name === 'select') {
    const selected = node.children.flatMap((n) =>
      n instanceof Element && n.name === 'option' && 'selected' in n.attribs
        ? [n.attribs.value]
        : [],
    );
    if (selected.length) props.defaultValue = selected[0];
  }
  // html-react-parser does not yet normalize the newer inert boolean attribute.
  if ('inert' in node.attribs) props.inert = true;
  delete props.selected;
  if (props.style && typeof props.style === 'object')
    for (const [k, v] of Object.entries(props.style))
      if (typeof v === 'string' && v.endsWith('!important'))
        (props.style as Record<string, unknown>)[k] = v.replace(/\s*!important$/, '');
  const content = override && source === lastSource ? htmlToDOM(override.markup) : node.children;
  return createElement(
    node.name,
    { ...props, ref },
    ['input', 'img', 'br', 'hr', 'meta', 'link', 'source', 'wbr'].includes(node.name)
      ? undefined
      : childrenMarkup(content as DOMNode[]),
  );
});
function serialize(node: DOMNode): string {
  if (node instanceof Text) return node.data;
  if (!(node instanceof Element)) return '';
  return `<${node.name} ${Object.entries(node.attribs)
    .map(([k, v]) => `${k}="${v.replaceAll('&', '&amp;').replaceAll('"', '&quot;')}"`)
    .join(' ')}>${(node.children as DOMNode[]).map(serialize).join('')}</${node.name}>`;
}
export function Markup({ html }: { html: string }) {
  return <>{childrenMarkup(htmlToDOM(html))}</>;
}
export function renderRegion(el: HTMLElement | null, markup: unknown) {
  if (!el) return;
  const html = String(markup ?? '');
  const update = regions.get(el as never);
  if (update) {
    flushSync(() => update(html));
    return;
  }
  let root = roots.get(el);
  if (!root) {
    root = createRoot(el);
    roots.set(el, root);
    activeRoots.add(root);
  }
  flushSync(() => root!.render(<Markup html={html} />));
}
export function disposeRegion(el: HTMLElement | null) {
  if (!el) return;
  const root = roots.get(el);
  if (root) {
    flushSync(() => root.unmount());
    roots.delete(el);
    activeRoots.delete(root);
  }
  el.remove();
}
export function snapshotElement(el: HTMLElement) {
  const clone = el.cloneNode(true) as HTMLElement;
  [...el.querySelectorAll('input,textarea,select')].forEach((input, i) => {
    const target = clone.querySelectorAll('input,textarea,select')[i] as HTMLInputElement;
    if (input instanceof HTMLInputElement) {
      target.setAttribute('value', input.value);
      if (input.checked) target.setAttribute('checked', '');
      else target.removeAttribute('checked');
    } else if (input instanceof HTMLTextAreaElement) target.textContent = input.value;
    else if (input instanceof HTMLSelectElement)
      target
        .querySelectorAll('option')
        .forEach((o) => o.toggleAttribute('selected', o.value === input.value));
  });
  return clone.outerHTML;
}
export function replaceRegion(el: HTMLElement | null, markup: unknown) {
  if (!el?.parentElement) return;
  renderRegion(
    el.parentElement,
    el.parentElement.innerHTML.replace(el.outerHTML, String(markup ?? '')),
  );
}
