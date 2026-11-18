import { ReactNode } from "react";
import { InvoiceColors } from "./invoiceTheme";

export interface StickerData {
  brandName: string;
  shopName: string;
  shopPhone: string;
  hotline: string;
  logoUrl: string;
  slogan: string;
  // order
  customerName: string;
  customerAddress: string;
  customerCity: string;
  customerPhone: string;
  productSummary: string;
  totalAmount: number;
  totalQty: number;
  orderId: string;
  paymentMethod: string;
}

export const STICKER_TEMPLATES = [
  { id: "classic", label: "Classic — Round Logo & Hotline" },
  { id: "modern", label: "Modern — Two-tone Bold Header" },
  { id: "compact", label: "Compact — Side Accent Bar" },
  { id: "minimal", label: "Minimal — Clean Lines" },
] as const;

const fmt = (n: number) => `৳${n.toFixed(0)}`;

const payOpts = (pm: string) => {
  const p = (pm || "").toLowerCase();
  return {
    cod: p === "cod" || p.includes("cash"),
    bkash: p.includes("bkash"),
    nagad: p.includes("nagad"),
    rocket: p.includes("rocket"),
  };
};

const Barcode = ({ scale = 1 }: { scale?: number }) => (
  <div style={{ display: "inline-flex", gap: 1, alignItems: "flex-end", height: 38 * scale, padding: "4px 6px" }}>
    {Array.from({ length: 50 }).map((_, i) => (
      <span key={i} style={{ display: "inline-block", height: "100%", width: `${(i * 7) % 4 + 1}px`, background: "#000" }} />
    ))}
  </div>
);

// ====== REACT PREVIEW RENDERERS ======
export function renderStickerReact(c: InvoiceColors, d: StickerData): ReactNode {
  const tpl = c.sticker_template || "classic";
  const pay = payOpts(d.paymentMethod);

  const Logo = ({ size = 44, round = true }: { size?: number; round?: boolean }) => (
    <div style={{ width: size, height: size, background: "#fff", border: `2px solid ${c.sticker_accent}`, borderRadius: round ? "50%" : 6, display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden", flexShrink: 0 }}>
      {d.logoUrl ? (
        <img src={d.logoUrl} alt="" style={{ maxWidth: "80%", maxHeight: "80%", objectFit: "contain" }} />
      ) : (
        <span style={{ color: c.sticker_header_bg, fontWeight: 900, fontSize: size * 0.28 }}>{(d.brandName || "LOGO").slice(0, 4).toUpperCase()}</span>
      )}
    </div>
  );

  const Field = ({ l, v, lblW = 70 }: { l: string; v: ReactNode; lblW?: number }) => (
    <div style={{ display: "flex", gap: 10, padding: "5px 0", borderBottom: "1px dashed #d8d8d8", fontSize: 11 }}>
      <span style={{ minWidth: lblW, fontWeight: 700, color: c.sticker_label_color }}>{l}</span>
      <span style={{ color: c.sticker_value_color, flex: 1, wordBreak: "break-word" }}>{v}</span>
    </div>
  );

  const PayRow = () => (
    <div style={{ display: "flex", flexWrap: "wrap", gap: "8px 16px", padding: "8px 0 4px", fontSize: 10, fontWeight: 600, color: c.sticker_label_color, borderTop: "1px dashed #d8d8d8", marginTop: 6 }}>
      <span style={{ color: pay.cod ? c.sticker_accent : undefined }}>{pay.cod ? "■" : "☐"} Cash on Delivery</span>
      <span style={{ color: pay.bkash ? c.sticker_accent : undefined }}>{pay.bkash ? "■" : "☐"} bKash</span>
      <span style={{ color: pay.nagad ? c.sticker_accent : undefined }}>{pay.nagad ? "■" : "☐"} Nagad</span>
      <span style={{ color: pay.rocket ? c.sticker_accent : undefined }}>{pay.rocket ? "■" : "☐"} Rocket</span>
    </div>
  );

  const Slogan = () => (
    <div style={{ textAlign: "center", fontSize: 11, fontWeight: 700, color: c.sticker_slogan_color, margin: "10px 0 8px", padding: "5px 0", borderTop: `1px dashed ${c.sticker_accent}`, borderBottom: `1px dashed ${c.sticker_accent}` }}>
      {d.slogan}
    </div>
  );

  const BarcodeBlock = () => (
    <div style={{ textAlign: "center" }}>
      <Barcode />
      <div style={{ fontFamily: "'Courier New', monospace", fontSize: 10, letterSpacing: 2, color: "#000" }}>{d.orderId}</div>
    </div>
  );

  // Common shell
  const Shell = ({ children, accent = "border" }: { children: ReactNode; accent?: "border" | "left" | "none" }) => (
    <div style={{
      marginTop: 24,
      border: accent === "border" ? `2px solid ${c.sticker_border}` : accent === "none" ? "1px solid #ddd" : "1px solid #ddd",
      borderLeft: accent === "left" ? `8px solid ${c.sticker_accent}` : undefined,
      borderRadius: 6,
      overflow: "hidden",
      background: "#fff",
    }}>{children}</div>
  );

  // ============ CLASSIC ============
  if (tpl === "classic") {
    return (
      <Shell accent="border">
        <div style={{ display: "flex", alignItems: "center", gap: 14, padding: "14px 18px", background: c.sticker_header_bg, color: c.sticker_header_text, borderBottom: `3px solid ${c.sticker_accent}` }}>
          <Logo size={56} />
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 24, fontWeight: 800, letterSpacing: 0.5, lineHeight: 1, marginBottom: 6 }}>{d.brandName}</div>
            <div style={{ display: "flex", gap: 18, fontSize: 11, opacity: 0.95 }}>
              <span>📞 হট লাইন: {d.hotline}</span>
              <span>📞 ফোন: {d.shopPhone}</span>
            </div>
          </div>
        </div>
        <div style={{ padding: "14px 18px 16px" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", columnGap: 24 }}>
            <div>
              <Field l="Name" v={<b>{d.customerName}</b>} lblW={70} />
              <Field l="Address" v={`${d.customerAddress}, ${d.customerCity}`} lblW={70} />
              <Field l="Mobile" v={<b>{d.customerPhone}</b>} lblW={70} />
            </div>
            <div>
              <Field l="Product" v={<b>{d.productSummary}</b>} lblW={70} />
              <Field l="Price" v={<b style={{ fontSize: 14 }}>{fmt(d.totalAmount)}</b>} lblW={70} />
              <Field l="Qty" v={<b>{d.totalQty}</b>} lblW={70} />
            </div>
          </div>
          <div style={{ textAlign: "center", fontSize: 11, fontWeight: 700, color: c.sticker_label_color, margin: "12px 0 4px" }}>পেমেন্ট মেথড</div>
          <div style={{ border: `1px solid ${c.sticker_border}`, borderRadius: 4, padding: "8px 12px", display: "flex", justifyContent: "space-around", flexWrap: "wrap", gap: 8, fontSize: 11, fontWeight: 600 }}>
            <span style={{ color: pay.cod ? c.sticker_accent : undefined }}>{pay.cod ? "☑" : "☐"} Cash on Delivery</span>
            <span style={{ color: pay.bkash ? c.sticker_accent : undefined }}>{pay.bkash ? "☑" : "☐"} bKash</span>
            <span style={{ color: pay.nagad ? c.sticker_accent : undefined }}>{pay.nagad ? "☑" : "☐"} Nagad</span>
            <span style={{ color: pay.rocket ? c.sticker_accent : undefined }}>{pay.rocket ? "☑" : "☐"} Rocket</span>
            <span>☐ Others</span>
          </div>
          <Slogan />
          <BarcodeBlock />
        </div>
      </Shell>
    );
  }

  // ============ MODERN ============
  if (tpl === "modern") {
    return (
      <Shell accent="none">
        <div style={{ background: c.sticker_header_bg, color: c.sticker_header_text, padding: "16px 18px", position: "relative" }}>
          <div style={{ position: "absolute", top: 0, right: 0, bottom: 0, width: "40%", background: c.sticker_accent, clipPath: "polygon(20% 0, 100% 0, 100% 100%, 0 100%)" }} />
          <div style={{ position: "relative", display: "flex", alignItems: "center", gap: 12 }}>
            <Logo size={48} round={false} />
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 18, fontWeight: 900, letterSpacing: 1, lineHeight: 1, textTransform: "uppercase" }}>{d.brandName}</div>
              <div style={{ fontSize: 9, opacity: 0.85, marginTop: 4, letterSpacing: 2 }}>SHIPPING LABEL</div>
            </div>
            <div style={{ textAlign: "right", fontSize: 9, lineHeight: 1.4, color: c.sticker_header_text, fontWeight: 700, position: "relative", zIndex: 2 }}>
              <div style={{ fontSize: 11 }}>{d.hotline}</div>
              <div style={{ opacity: 0.85 }}>{d.shopPhone}</div>
            </div>
          </div>
        </div>
        <div style={{ padding: "12px 18px 14px", background: "#fafafa" }}>
          <div style={{ background: "#fff", border: "1px solid #e6e6e6", borderRadius: 4, padding: "8px 12px", marginBottom: 10 }}>
            <Field l="Recipient" v={<b>{d.customerName}</b>} />
            <Field l="Address" v={`${d.customerAddress}, ${d.customerCity}`} />
            <Field l="Mobile" v={d.customerPhone} />
          </div>
          <div style={{ background: "#fff", border: "1px solid #e6e6e6", borderRadius: 4, padding: "8px 12px" }}>
            <Field l="Product" v={d.productSummary} />
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>
              <Field l="Qty" v={d.totalQty} lblW={40} />
              <Field l="Order" v={d.orderId} lblW={50} />
              <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", padding: "5px 0", borderBottom: "1px dashed #d8d8d8" }}>
                <span style={{ fontSize: 14, fontWeight: 800, color: c.sticker_accent }}>{fmt(d.totalAmount)}</span>
              </div>
            </div>
            <PayRow />
          </div>
          <Slogan />
          <BarcodeBlock />
        </div>
      </Shell>
    );
  }

  // ============ COMPACT (left accent bar) ============
  if (tpl === "compact") {
    return (
      <Shell accent="left">
        <div style={{ padding: "12px 14px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, paddingBottom: 10, borderBottom: `2px solid ${c.sticker_header_bg}` }}>
            <Logo size={36} />
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 14, fontWeight: 800, color: c.sticker_header_bg, letterSpacing: 0.5, textTransform: "uppercase" }}>{d.brandName}</div>
              <div style={{ fontSize: 9, color: "#666" }}>{d.shopName} • {d.shopPhone}</div>
            </div>
            <div style={{ background: c.sticker_accent, color: "#fff", padding: "4px 10px", borderRadius: 3, fontSize: 10, fontWeight: 700 }}>
              {d.orderId}
            </div>
          </div>
          <div style={{ paddingTop: 10 }}>
            <Field l="Name" v={<b>{d.customerName}</b>} />
            <Field l="Address" v={`${d.customerAddress}, ${d.customerCity}`} />
            <Field l="Mobile" v={d.customerPhone} />
            <Field l="Product" v={d.productSummary} />
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <Field l="Total" v={<b style={{ color: c.sticker_accent }}>{fmt(d.totalAmount)}</b>} />
              <Field l="Qty" v={d.totalQty} lblW={50} />
            </div>
            <PayRow />
            <Slogan />
            <BarcodeBlock />
          </div>
        </div>
      </Shell>
    );
  }

  // ============ MINIMAL ============
  return (
    <Shell accent="none">
      <div style={{ padding: 14, borderBottom: `1px solid ${c.sticker_accent}` }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ fontSize: 16, fontWeight: 900, letterSpacing: 1, color: c.sticker_header_bg, textTransform: "uppercase" }}>{d.brandName}</div>
          <div style={{ fontSize: 9, color: "#666", textAlign: "right" }}>
            <div>{d.hotline}</div>
            <div>{d.shopPhone}</div>
          </div>
        </div>
      </div>
      <div style={{ padding: 14 }}>
        <Field l="Name" v={d.customerName} />
        <Field l="Address" v={`${d.customerAddress}, ${d.customerCity}`} />
        <Field l="Mobile" v={d.customerPhone} />
        <Field l="Product" v={d.productSummary} />
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <Field l="Price" v={fmt(d.totalAmount)} />
          <Field l="Qty" v={d.totalQty} lblW={50} />
        </div>
        <PayRow />
        <Slogan />
        <BarcodeBlock />
      </div>
    </Shell>
  );
}

// ====== HTML PRINT RENDERERS ======
export function getStickerCss(c: InvoiceColors): string {
  return `
  /* ===== STICKER COMMON ===== */
  .sticker-page { max-width:820px; margin:32px auto 0; }
  .sticker { background:#fff; border-radius:6px; overflow:hidden; box-shadow:0 6px 30px rgba(0,0,0,0.15); }
  .sticker .row { display:flex; gap:10px; padding:6px 0; border-bottom:1px dashed #d8d8d8; font-size:13px; }
  .sticker .row:last-of-type { border-bottom:none; }
  .sticker .lbl { min-width:80px; font-weight:700; color:${c.sticker_label_color}; }
  .sticker .val { color:${c.sticker_value_color}; flex:1; word-break:break-word; }
  .sticker .pay { display:flex; flex-wrap:wrap; gap:10px 22px; padding:10px 0 6px; font-size:12px; font-weight:600; color:${c.sticker_label_color}; border-top:1px dashed #d8d8d8; margin-top:6px; }
  .sticker .pay .on { color:${c.sticker_accent}; }
  .sticker .slogan { text-align:center; font-size:13px; font-weight:700; color:${c.sticker_slogan_color}; margin:14px 0 10px; padding:6px 0; border-top:1px dashed ${c.sticker_accent}; border-bottom:1px dashed ${c.sticker_accent}; }
  .sticker .barcode-wrap { text-align:center; }
  .sticker .barcode { display:inline-flex; gap:1px; align-items:flex-end; height:46px; padding:6px 8px; }
  .sticker .barcode span { display:inline-block; height:100%; background:#000; }
  .sticker .barcode-num { font-family:'Courier New', monospace; font-size:11px; letter-spacing:3px; color:#000; }
  .sticker .logo-circle { width:56px; height:56px; background:#fff; border:2px solid ${c.sticker_accent}; border-radius:50%; display:flex; align-items:center; justify-content:center; overflow:hidden; flex-shrink:0; }
  .sticker .logo-square { width:48px; height:48px; background:#fff; border:2px solid ${c.sticker_accent}; border-radius:6px; display:flex; align-items:center; justify-content:center; overflow:hidden; flex-shrink:0; }
  .sticker .logo-circle img, .sticker .logo-square img { max-width:80%; max-height:80%; object-fit:contain; }
  .sticker .logo-text { color:${c.sticker_header_bg}; font-weight:900; font-size:13px; letter-spacing:1px; }

  /* CLASSIC */
  .sticker.classic { border:2px solid ${c.sticker_border}; }
  .sticker.classic .head { display:flex; align-items:center; gap:16px; padding:16px 20px; background:${c.sticker_header_bg}; color:${c.sticker_header_text}; border-bottom:3px solid ${c.sticker_accent}; }
  .sticker.classic .head .info { flex:1; }
  .sticker.classic .brand-name { font-size:28px; font-weight:800; letter-spacing:0.5px; line-height:1; margin-bottom:8px; }
  .sticker.classic .contacts { display:flex; gap:22px; font-size:12px; opacity:0.95; }
  .sticker.classic .body { padding:16px 20px 18px; }
  .sticker.classic .cols { display:grid; grid-template-columns:1fr 1fr; column-gap:28px; }
  .sticker.classic .pay-title { text-align:center; font-size:13px; font-weight:700; color:${c.sticker_label_color}; margin:14px 0 6px; }
  .sticker.classic .pay-box { border:1px solid ${c.sticker_border}; border-radius:4px; padding:10px 14px; display:flex; justify-content:space-around; flex-wrap:wrap; gap:10px; font-size:12px; font-weight:600; color:${c.sticker_label_color}; }
  .sticker.classic .pay-box .on { color:${c.sticker_accent}; }

  /* MODERN */
  .sticker.modern { border:1px solid #ddd; }
  .sticker.modern .head { background:${c.sticker_header_bg}; color:${c.sticker_header_text}; padding:18px 20px; position:relative; overflow:hidden; }
  .sticker.modern .head::after { content:""; position:absolute; top:0; right:0; bottom:0; width:42%; background:${c.sticker_accent}; clip-path:polygon(20% 0, 100% 0, 100% 100%, 0 100%); }
  .sticker.modern .head-inner { position:relative; display:flex; align-items:center; gap:14px; z-index:2; }
  .sticker.modern .brand-name { font-size:20px; font-weight:900; letter-spacing:1px; line-height:1; text-transform:uppercase; }
  .sticker.modern .label-sub { font-size:10px; letter-spacing:3px; opacity:0.85; margin-top:5px; }
  .sticker.modern .contact { text-align:right; font-size:11px; font-weight:700; line-height:1.4; }
  .sticker.modern .body { padding:14px 20px 16px; background:#fafafa; }
  .sticker.modern .card { background:#fff; border:1px solid #e6e6e6; border-radius:4px; padding:8px 14px; margin-bottom:10px; }
  .sticker.modern .grid3 { display:grid; grid-template-columns:1fr 1fr 1fr; gap:8px; }
  .sticker.modern .price-big { font-size:16px; font-weight:800; color:${c.sticker_accent}; text-align:right; padding:5px 0; border-bottom:1px dashed #d8d8d8; }

  /* COMPACT */
  .sticker.compact { border:1px solid #ddd; border-left:8px solid ${c.sticker_accent}; }
  .sticker.compact .head { display:flex; align-items:center; gap:12px; padding:12px 16px; border-bottom:2px solid ${c.sticker_header_bg}; }
  .sticker.compact .brand-name { font-size:16px; font-weight:800; color:${c.sticker_header_bg}; letter-spacing:0.5px; text-transform:uppercase; }
  .sticker.compact .meta { font-size:10px; color:#666; margin-top:2px; }
  .sticker.compact .pill { background:${c.sticker_accent}; color:#fff; padding:5px 12px; border-radius:3px; font-size:11px; font-weight:700; }
  .sticker.compact .body { padding:12px 16px 14px; }
  .sticker.compact .grid2 { display:grid; grid-template-columns:1fr 1fr; gap:14px; }
  .sticker.compact .accent { color:${c.sticker_accent}; font-weight:700; }

  /* MINIMAL */
  .sticker.minimal { border:1px solid #ddd; }
  .sticker.minimal .head { padding:14px 18px; border-bottom:1px solid ${c.sticker_accent}; display:flex; justify-content:space-between; align-items:center; }
  .sticker.minimal .brand-name { font-size:18px; font-weight:900; letter-spacing:1px; color:${c.sticker_header_bg}; text-transform:uppercase; }
  .sticker.minimal .contact { font-size:10px; color:#666; text-align:right; line-height:1.5; }
  .sticker.minimal .body { padding:14px 18px 16px; }
  .sticker.minimal .grid2 { display:grid; grid-template-columns:1fr 1fr; gap:14px; }
  `;
}

export function getStickerHtml(c: InvoiceColors, d: StickerData, esc: (s: string) => string): string {
  const tpl = c.sticker_template || "classic";
  const pay = payOpts(d.paymentMethod);
  const ck = (on: boolean) => (on ? "■" : "☐");
  const cls = (on: boolean) => (on ? "on" : "");

  const logoCircle = d.logoUrl
    ? `<div class="logo-circle"><img src="${esc(d.logoUrl)}" alt="" /></div>`
    : `<div class="logo-circle"><span class="logo-text">${esc((d.brandName || "LOGO").slice(0, 4).toUpperCase())}</span></div>`;
  const logoSquare = d.logoUrl
    ? `<div class="logo-square"><img src="${esc(d.logoUrl)}" alt="" /></div>`
    : `<div class="logo-square"><span class="logo-text">${esc((d.brandName || "LOGO").slice(0, 4).toUpperCase())}</span></div>`;

  const barsHtml = Array.from({ length: 60 }).map((_, i) => `<span style="width:${(i * 7) % 4 + 1}px"></span>`).join("");
  const barcodeBlock = `
    <div class="barcode-wrap">
      <div class="barcode">${barsHtml}</div>
      <div class="barcode-num">${esc(d.orderId)}</div>
    </div>`;

  const payHtml = `
    <div class="pay">
      <span class="${cls(pay.cod)}">${ck(pay.cod)} Cash on Delivery</span>
      <span class="${cls(pay.bkash)}">${ck(pay.bkash)} bKash</span>
      <span class="${cls(pay.nagad)}">${ck(pay.nagad)} Nagad</span>
      <span class="${cls(pay.rocket)}">${ck(pay.rocket)} Rocket</span>
      <span>${ck(false)} Others</span>
    </div>`;

  const slogan = `<div class="slogan">${esc(d.slogan)}</div>`;

  const F = (l: string, v: string) =>
    `<div class="row"><span class="lbl">${esc(l)}</span><span class="val">${v}</span></div>`;

  const fullAddress = `${esc(d.customerAddress)}, ${esc(d.customerCity)}`;

  if (tpl === "modern") {
    return `
    <div class="sticker-page">
      <div class="sticker modern">
        <div class="head">
          <div class="head-inner">
            ${logoSquare}
            <div style="flex:1">
              <div class="brand-name">${esc(d.brandName)}</div>
              <div class="label-sub">SHIPPING LABEL</div>
            </div>
            <div class="contact">
              <div>${esc(d.hotline)}</div>
              <div style="opacity:0.85">${esc(d.shopPhone)}</div>
            </div>
          </div>
        </div>
        <div class="body">
          <div class="card">
            ${F("Recipient", `<b>${esc(d.customerName)}</b>`)}
            ${F("Address", fullAddress)}
            ${F("Mobile", esc(d.customerPhone))}
          </div>
          <div class="card">
            ${F("Product", esc(d.productSummary))}
            <div class="grid3">
              ${F("Qty", String(d.totalQty))}
              ${F("Order", esc(d.orderId))}
              <div class="price-big">${fmt(d.totalAmount)}</div>
            </div>
            ${payHtml}
          </div>
          ${slogan}
          ${barcodeBlock}
        </div>
      </div>
    </div>`;
  }

  if (tpl === "compact") {
    return `
    <div class="sticker-page">
      <div class="sticker compact">
        <div class="head">
          ${logoCircle}
          <div style="flex:1">
            <div class="brand-name">${esc(d.brandName)}</div>
            <div class="meta">${esc(d.shopName)} • ${esc(d.shopPhone)}</div>
          </div>
          <div class="pill">${esc(d.orderId)}</div>
        </div>
        <div class="body">
          ${F("Name", `<b>${esc(d.customerName)}</b>`)}
          ${F("Address", fullAddress)}
          ${F("Mobile", esc(d.customerPhone))}
          ${F("Product", esc(d.productSummary))}
          <div class="grid2">
            ${F("Total", `<span class="accent">${fmt(d.totalAmount)}</span>`)}
            ${F("Qty", String(d.totalQty))}
          </div>
          ${payHtml}
          ${slogan}
          ${barcodeBlock}
        </div>
      </div>
    </div>`;
  }

  if (tpl === "minimal") {
    return `
    <div class="sticker-page">
      <div class="sticker minimal">
        <div class="head">
          <div class="brand-name">${esc(d.brandName)}</div>
          <div class="contact">
            <div>${esc(d.hotline)}</div>
            <div>${esc(d.shopPhone)}</div>
          </div>
        </div>
        <div class="body">
          ${F("Name", esc(d.customerName))}
          ${F("Address", fullAddress)}
          ${F("Mobile", esc(d.customerPhone))}
          ${F("Product", esc(d.productSummary))}
          <div class="grid2">
            ${F("Price", fmt(d.totalAmount))}
            ${F("Qty", String(d.totalQty))}
          </div>
          ${payHtml}
          ${slogan}
          ${barcodeBlock}
        </div>
      </div>
    </div>`;
  }

  // CLASSIC (default)
  return `
  <div class="sticker-page">
    <div class="sticker classic">
      <div class="head">
        ${logoCircle}
        <div class="info">
          <div class="brand-name">${esc(d.brandName)}</div>
          <div class="contacts">
            <span>📞 হট লাইন: ${esc(d.hotline)}</span>
            <span>📞 ফোন: ${esc(d.shopPhone)}</span>
          </div>
        </div>
      </div>
      <div class="body">
        <div class="cols">
          <div>
            ${F("Name", `<b>${esc(d.customerName)}</b>`)}
            ${F("Address", fullAddress)}
            ${F("Mobile", `<b>${esc(d.customerPhone)}</b>`)}
          </div>
          <div>
            ${F("Product", `<b>${esc(d.productSummary)}</b>`)}
            ${F("Price", `<b style="font-size:15px">${fmt(d.totalAmount)}</b>`)}
            ${F("Qty", `<b>${String(d.totalQty)}</b>`)}
          </div>
        </div>
        <div class="pay-title">পেমেন্ট মেথড</div>
        <div class="pay-box">
          <span class="${cls(pay.cod)}">${pay.cod ? "☑" : "☐"} Cash on Delivery</span>
          <span class="${cls(pay.bkash)}">${pay.bkash ? "☑" : "☐"} bKash</span>
          <span class="${cls(pay.nagad)}">${pay.nagad ? "☑" : "☐"} Nagad</span>
          <span class="${cls(pay.rocket)}">${pay.rocket ? "☑" : "☐"} Rocket</span>
          <span>☐ Others</span>
        </div>
        ${slogan}
        ${barcodeBlock}
      </div>
    </div>
  </div>`;
}