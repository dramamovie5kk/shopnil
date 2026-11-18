import { useId, useMemo, type ReactNode } from 'react';
import { hasSalesMarkup, sanitizeSalesHtml } from '@/lib/salesRichText';

export function SalesRichText({ text, layout = false }: { text: string; layout?: boolean }) {
  const scope = useId().replace(/[^a-zA-Z0-9_-]/g, '');
  const content = useMemo(() => sanitizeSalesHtml(text, scope, true), [text, scope]);
  if (layout) return <div data-sales-rich-text={scope} className="relative isolate overflow-clip">
    {content.fonts.map(href => <link key={href} rel="stylesheet" href={href} />)}
    <style>{`[data-sales-rich-text="${scope}"] > [data-sales-html-root]{all:initial;display:block;box-sizing:border-box;min-width:0}:where([data-sales-rich-text="${scope}"] [data-sales-html-root] *){font-family:inherit}`}</style>
    {content.css && <style>{content.css}</style>}
    <div data-sales-html-root dangerouslySetInnerHTML={{ __html: content.html }} />
  </div>;
  // Text fields get the same full safe HTML/CSS as the HTML section, but keep inheriting the field's own font and color.
  const block = /<(div|section|article|header|footer|main|aside|nav|figure|p|h[1-6]|ul|ol|blockquote|pre|hr|img|svg)\b/i.test(text);
  const Tag = block ? 'div' : 'span';
  return <Tag data-sales-rich-text={scope} className={block ? 'relative isolate block' : 'relative'}>
    {content.fonts.map(href => <link key={href} rel="stylesheet" href={href} />)}
    {content.css && <style>{content.css}</style>}
    <Tag data-sales-html-root style={{ display: block ? 'block' : 'inline' }} dangerouslySetInnerHTML={{ __html: content.html }} />
  </Tag>;
}

// Preserve the original React tree and plain strings, including conditional rendering.
export function renderSalesText(value: ReactNode): ReactNode {
  if (typeof value === 'string' && hasSalesMarkup(value)) return <SalesRichText text={value} />;
  return value;
}