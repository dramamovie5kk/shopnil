import { ArrowRight, Check, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { SalesPage } from '@/types/salesPage';
import { renderSalesText } from './SalesRichText';
import { extraSectionData, extraTheme, extraComponentStyle, isExtraDesign, supportsExtraDesigns, type ExtraSectionNumber } from '@/lib/extraSectionDesigns';

export default function ExtraSection({ page, number }: { page: SalesPage; number: ExtraSectionNumber }) {
  const { heading, points, enabled, settings: s } = extraSectionData(page, number);
  if (!enabled || !supportsExtraDesigns(page.template_id) || !isExtraDesign(s.design)) return null;
  const component = (name: string, base?: string) => extraComponentStyle(s, name, base);
  const title = s.text_heading ?? heading;
  const itemContent = (point: string, i: number, accordion = false) => <>
    <span className="extra-icon" style={component(`point_${i}_icon`, 'icon')} aria-hidden="true">
      {s[`point_${i}_icon_text`] !== undefined ? renderSalesText(s[`point_${i}_icon_text`]) : s.design === '03' || s.design === '06' ? String(i + 1).padStart(2, '0') : <Check size={20} />}
    </span>
    <div className="extra-item-copy">
      <div className="extra-item-text" style={component(`point_${i}_text`, 'text')}>{renderSalesText(point)}</div>
      {!accordion && s[`point_${i}_description`] && <div className="extra-description" style={component(`point_${i}_description`, 'description')}>{renderSalesText(s[`point_${i}_description`])}</div>}
    </div>
  </>;
  return <section data-extra-section={number} className={`sales-extra sales-extra--${s.design}`} style={extraTheme(s)}>
    <div className="extra-inner">
      <header className="extra-header">
        {s.text_badge && <div className="extra-badge" style={component('badge')}>{renderSalesText(s.text_badge)}</div>}
        <h2 className="extra-heading" style={component('heading')}>{renderSalesText(title)}</h2>
        {s.text_subtitle && <div className="extra-subtitle" style={component('subtitle')}>{renderSalesText(s.text_subtitle)}</div>}
      </header>
      <div className="extra-list">
        {points.map((point, i) => s.design === '05' ? <details key={i} className="extra-item extra-details" style={component(`point_${i}_item`, 'item')}>
          <summary>{itemContent(point, i, true)}<ChevronDown className="extra-chevron" size={18} /></summary>
          {s[`point_${i}_description`] && <div className="extra-description" style={component(`point_${i}_description`, 'description')}>{renderSalesText(s[`point_${i}_description`])}</div>}
        </details> : <article key={i} className="extra-item" style={component(`point_${i}_item`, 'item')}>{itemContent(point, i)}</article>)}
      </div>
      {s.button_enabled !== '0' && <div className="extra-actions"><Button type="button" className="extra-button" style={component('button')} onClick={() => document.getElementById('checkout')?.scrollIntoView({ behavior: 'smooth' })}>
        <span>{renderSalesText(s.text_button ?? (page.cta_button_text || 'এখনই অর্ডার করুন'))}</span><ArrowRight size={18} />
      </Button></div>}
    </div>
  </section>;
}
