import { useLayoutEffect, useRef, useId, type ReactNode } from 'react';
import type { SalesPage } from '@/types/salesPage';
import { appearanceCss, appearanceNamespace, readAppearance, type AppearanceGroup } from '@/lib/sectionAppearance';
import CustomSectionSlot from './CustomSectionSlot';

export default function SectionAppearance({ page, section, children }: { page: SalesPage; section: string; children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const id = useId().replace(/[^a-zA-Z0-9]/g, '');
  const settings = page.template_styles?.[section] ?? {};
  const values = readAppearance(settings, appearanceNamespace(page.template_id, settings.design));
  useLayoutEffect(() => {
    const host = ref.current;
    if (!host) return;
    let observer: MutationObserver | undefined;
    const mark = () => {
    observer?.disconnect();
    host.querySelectorAll('[data-sales-part],[data-sales-section-root]').forEach(el => {
      el.removeAttribute('data-sales-part'); el.removeAttribute('data-sales-kind'); el.removeAttribute('data-sales-section-root');
    });
    [...host.children].filter(el => el.tagName !== 'STYLE').forEach(el => el.setAttribute('data-sales-section-root', ''));
    const counters: Partial<Record<AppearanceGroup, number>> = {};
    host.querySelectorAll('h1,h2,h3,h4,h5,h6,p,span,button,a,img,video,iframe,svg,article,li,details,label,input,textarea,select,div').forEach(el => {
      if (el.closest('[data-sales-appearance]') !== host || el.closest('[data-sales-html-root]')) return;
      const tag = el.tagName.toLowerCase();
      let kind: AppearanceGroup | undefined;
      if (/^h[1-6]$/.test(tag)) kind = 'heading';
      else if (['button','a'].includes(tag)) kind = 'button';
      else if (tag === 'img') kind = 'image';
      else if (['iframe','video'].includes(tag)) kind = 'video';
      else if (tag === 'svg') kind = 'icon';
      else if (tag === 'label') kind = 'label';
      else if (['input','textarea','select'].includes(tag)) kind = 'input';
      else if (['article','li','details'].includes(tag)) kind = 'box';
      else if (['p','span','div'].includes(tag)) {
        if (el.textContent?.trim() && !el.querySelector('h1,h2,h3,h4,p,span,div,button,a,input,textarea,select,svg,img,iframe,video')) kind = 'text';
        else if (tag === 'div') {
          const style = el.ownerDocument.defaultView?.getComputedStyle(el);
          if (style && (parseFloat(style.borderTopWidth) > 0 || (style.backgroundColor !== 'rgba(0, 0, 0, 0)' && style.backgroundColor !== 'transparent'))) kind = 'box';
        }
      }
      if (!kind) return;
      const index = counters[kind] ?? 0; counters[kind] = index + 1;
      el.setAttribute('data-sales-kind', kind); el.setAttribute('data-sales-part', `${kind}-${index}`);
    });
    observer?.observe(host, { childList: true, subtree: true });
    };
    mark();
    observer = new MutationObserver(mark);
    observer.observe(host, { childList: true, subtree: true });
    return () => observer?.disconnect();
  }, [children, page.template_id, settings.design]);
  if (section.startsWith('cs-')) return page.template_id === 'template-15-universal' ? <>{children}</> : <CustomSectionSlot page={page} sectionId={section} />;
  if (!children) return null;
  return <div ref={ref} data-sales-appearance={section} data-appearance-scope={id} className="contents">
    {children}<style>{appearanceCss(`[data-appearance-scope="${id}"]`, values)}</style>
  </div>;
}