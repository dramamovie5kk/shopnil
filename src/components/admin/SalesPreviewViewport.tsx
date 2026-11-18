import { useEffect, useRef, useState, type ReactNode } from 'react';
import { createPortal } from 'react-dom';

// A separate document makes media queries follow the preview, not the editor.
export default function SalesPreviewViewport({ children, device = 'mobile' }: { children: ReactNode; device?: 'mobile' | 'desktop' }) {
  const hostRef = useRef<HTMLDivElement>(null);
  const frameRef = useRef<HTMLIFrameElement>(null);
  const [mount, setMount] = useState<HTMLElement | null>(null);
  const [size, setSize] = useState({ width: 393, height: 800 });
  const width = device === 'mobile' ? 393 : 1280;
  const scale = Math.min(1, size.width / width);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    const observer = new ResizeObserver(([entry]) => {
      if (entry) setSize({ width: entry.contentRect.width, height: entry.contentRect.height });
    });
    observer.observe(host);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const targetHead = mount?.ownerDocument.head;
    if (!targetHead) return;
    const syncStyles = () => {
      targetHead.querySelectorAll('[data-preview-style]').forEach(node => node.remove());
      document.head.querySelectorAll('style, link[rel="stylesheet"]').forEach(node => {
        const copy = node.cloneNode(true) as HTMLElement;
        copy.setAttribute('data-preview-style', '');
        targetHead.appendChild(copy);
      });
    };
    syncStyles();
    const observer = new MutationObserver(syncStyles);
    observer.observe(document.head, { childList: true, subtree: true, characterData: true });
    return () => observer.disconnect();
  }, [mount]);

  return <div ref={hostRef} className="h-full min-h-0 w-full overflow-hidden" aria-label="সেলস পেজ প্রিভিউ">
    <div className="mx-auto overflow-hidden rounded-lg border border-border bg-background shadow-lg" style={{ width: width * scale, height: size.height }}>
      <iframe
        ref={frameRef}
        title={device === 'mobile' ? 'মোবাইল লাইভ প্রিভিউ' : 'ডেস্কটপ লাইভ প্রিভিউ'}
        className="block origin-top-left border-0 bg-background"
        style={{ width, height: size.height / scale, transform: `scale(${scale})` }}
        srcDoc={'<!doctype html><html><head><meta name="viewport" content="width=device-width, initial-scale=1"></head><body style="margin:0"><div id="sales-preview-root"></div></body></html>'}
        onLoad={() => {
          const doc = frameRef.current?.contentDocument;
          if (!doc) return;
          doc.documentElement.className = document.documentElement.className;
          setMount(doc.getElementById('sales-preview-root'));
        }}
      />
      {mount && createPortal(<div onClickCapture={event => {
        const target = event.target as Element;
        if (target.closest?.('a,button[type="submit"]')) event.preventDefault();
      }} onSubmitCapture={event => event.preventDefault()}>{children}</div>, mount)}
    </div>
  </div>;
}