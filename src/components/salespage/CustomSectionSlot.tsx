import { useLayoutEffect, useRef, useState, type CSSProperties } from 'react';
import type { SalesPage } from '@/types/salesPage';
import { salesCustomSections } from '@/lib/salesCustomSections';
import { Universal15CustomSection } from './CustomSectionContent';

export default function CustomSectionSlot({ page, sectionId }: { page: SalesPage; sectionId: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [bounds, setBounds] = useState<{ width: number; left: number }>();
  const section = salesCustomSections(page).find(item => item.id === sectionId);
  useLayoutEffect(() => {
    const host = ref.current;
    const parent = host?.parentElement;
    const card = host?.ownerDocument.querySelector('.checkout-container');
    if (!host || !parent || !card || section?.type === 'html') return;
    const update = () => {
      const rect = card.getBoundingClientRect();
      const parentRect = parent.getBoundingClientRect();
      const next = { width: Math.min(rect.width, parentRect.width), left: Math.max(0, rect.left - parentRect.left) };
      if (next.width > 0) setBounds(prev => prev?.width === next.width && prev.left === next.left ? prev : next);
    };
    const observer = new ResizeObserver(update);
    observer.observe(parent);
    observer.observe(card);
    update();
    return () => observer.disconnect();
  }, [page, section?.type]);
  if (!section) return null;
  return <div ref={ref} data-custom-section={section.id} className={section.type === 'html' ? 'w-full' : 'w-full custom-checkout-aligned-section'} style={{
    '--custom-checkout-width': bounds ? `${bounds.width}px` : '100%',
    '--custom-checkout-left': bounds ? `${bounds.left}px` : 'auto',
  } as CSSProperties}>
    <Universal15CustomSection section={section} s={page.template_styles ?? {}} onOrderClick={() => ref.current?.ownerDocument.getElementById('checkout')?.scrollIntoView({ behavior: 'smooth' })} />
  </div>;
}