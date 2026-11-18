import { salesPlainText } from '@/lib/salesRichText';
import { renderSalesText } from '@/components/salespage/SalesRichText';
import { useEffect, useState, type CSSProperties } from 'react';
import { Timer } from 'lucide-react';
import type { SalesPage } from '@/types/salesPage';
import { getOfferCountdown, getOfferTimerStyle, getOfferTimerUnitLabels } from '@/lib/offerCountdown';

export default function OfferCountdown({ page }: { page: SalesPage }) {
  const [now, setNow] = useState(Date.now);
  useEffect(() => {
    setNow(Date.now());
    const interval = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(interval);
  }, [page.countdown_end_date]);
  const remaining = getOfferCountdown(page.countdown_end_date, now);
  if (!remaining) return null;
  const settings = page.template_styles?.hero;
  const style = getOfferTimerStyle(settings) as CSSProperties;
  const labels = getOfferTimerUnitLabels(settings, page);
  const units = [
    { value: remaining?.days, label: labels.days },
    { value: remaining?.hours, label: labels.hours },
    { value: remaining?.minutes, label: labels.minutes },
    { value: remaining?.seconds, label: labels.seconds },
  ];
  const title = settings?.text_timer_title === '' ? '' : settings?.text_timer_title || 'অফার শেষ হতে বাকি';
  const expiredText = settings?.text_timer_expired === '' ? '' : settings?.text_timer_expired || 'অফারের সময় শেষ';
  const headingText = remaining?.expired ? expiredText : title;
  return <div className="sales-offer-countdown" style={style} role="timer" aria-label={salesPlainText(remaining?.expired ? 'অফারের সময় শেষ' : 'অফারের অবশিষ্ট সময়')}>
    <div className="sales-offer-countdown-inner">
      {headingText.trim() !== '' && <p className="sales-offer-countdown-title"><Timer size={18} aria-hidden="true" />{renderSalesText(headingText)}</p>}
      <div className="sales-offer-countdown-units">{renderSalesText(units.map(unit => <div className="sales-offer-countdown-unit" key={unit.label}>
        <strong>{renderSalesText(unit.value === undefined ? '—' : unit.value.toLocaleString('bn-BD', { minimumIntegerDigits: 2 }))}</strong><span>{renderSalesText(unit.label)}</span>
      </div>))}</div>
    </div>
  </div>;
}
