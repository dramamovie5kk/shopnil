import { Banknote } from 'lucide-react';
const methods = [
  { name: 'বিকাশ', logo: '/payment-logos/bkash.webp', brand: 'bKash', color: '#d91d67' },
  { name: 'নগদ', logo: '/payment-logos/nagad.webp', brand: '', color: '#ed5425' },
  { name: 'রকেট', logo: '/payment-logos/rocket.webp', brand: '', color: '#893b91' },
  { name: 'ক্যাশ অন ডেলিভারি', logo: '', brand: 'Cash on Delivery', color: '#137246' },
];
export default function FooterPayments() {
  return <section data-footer-payments className="mt-3 min-w-0" aria-label="পেমেন্ট মাধ্যম">
    <h4 className="mb-1 text-[10px] font-medium opacity-90">পেমেন্ট মাধ্যম</h4>
    <ul className="flex flex-nowrap gap-1">
      {methods.map(method => <li key={method.name} aria-label={method.name} className="flex h-9 w-14 shrink-0 flex-col items-center justify-center gap-0.5 rounded border border-white/15 bg-white p-0.5 text-center shadow-sm" style={{ color: method.color }}>
        {method.logo ? <img src={method.logo} alt={method.name} width={36} height={22} loading="lazy" decoding="async" className={method.brand ? 'h-4 w-7 object-contain' : 'h-5 w-9 max-w-full object-contain'} /> : <Banknote aria-hidden="true" className="h-3 w-3" />}
        {method.brand && <span className="text-[8px] font-bold leading-[9px]">{method.brand}</span>}
      </li>)}
    </ul>
  </section>;
}
