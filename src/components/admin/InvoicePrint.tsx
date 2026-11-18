import { Button } from "@/components/ui/button";
import { Printer, Tag } from "lucide-react";
import { useSiteSettings } from "@/hooks/useSiteSettings";
import { getInvoiceColors } from "@/lib/invoiceTheme";
import { getStickerCss, getStickerHtml } from "@/lib/stickerTemplates";

interface InvoiceItem {
  product_name: string;
  quantity: number;
  product_price: number;
  product_id?: string | null;
  products?: { image_url: string | null } | null;
}

interface InvoiceOrder {
  id: string;
  customer_name: string;
  customer_phone: string;
  customer_address: string;
  customer_city: string;
  total_amount: number;
  shipping_cost: number | null;
  payment_method: string;
  status: string;
  created_at: string;
  coupon_discount?: number | null;
  notes?: string | null;
}

interface InvoicePrintProps {
  order: InvoiceOrder;
  items: InvoiceItem[];
}

const InvoicePrint = ({ order, items }: InvoicePrintProps) => {
  const { getSetting } = useSiteSettings();

  const brandName = getSetting("invoice_brand_name", getSetting("site_name", "BRANDNAME"));
  const brandTagline = getSetting("invoice_brand_tagline", "Your Trusted Store");
  const shopName = getSetting("invoice_shop_name", getSetting("site_name", "Your Shop Name"));
  const shopPhone = getSetting("invoice_shop_phone", getSetting("support_phone", "01XXXXXXXXX"));
  const footerText = getSetting("invoice_footer_text", "Thank you for shopping with us!");
  const logoUrl = getSetting("invoice_logo_url", getSetting("site_logo_url", ""));
  const c = getInvoiceColors(getSetting);
  const showImage = c.show_product_image !== "false";

  const formatOrderId = (id: string) => {
    const hash = id.replace(/-/g, "").slice(-6);
    const num = parseInt(hash, 16) % 10000;
    return `INV-${new Date(order.created_at).getFullYear()}-${num.toString().padStart(3, "0")}`;
  };

  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });

  const subtotal = items.reduce((sum, i) => sum + i.product_price * i.quantity, 0);
  const shipping = order.shipping_cost || 0;
  const discount = order.coupon_discount || 0;

  const esc = (str: string) =>
    String(str || "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  const fmt = (n: number) => `৳${n.toFixed(0)}`;

  const handlePrint = (mode: "both" | "invoice" | "sticker" = "both") => {
    const w = window.open("", "_blank");
    if (!w) return;

    const itemsHtml = items
      .map(
        (item) => {
          const img = showImage && item.products?.image_url
            ? `<img src="${esc(item.products.image_url)}" alt="" class="prod-img" />`
            : "";
          return `
      <div class="row">
        <div class="c-desc">${img}<span>${esc(item.product_name)}</span></div>
        <div class="c-price">${fmt(item.product_price)}</div>
        <div class="c-qty">${item.quantity}</div>
        <div class="c-total">${fmt(item.product_price * item.quantity)}</div>
      </div>`;
        }
      )
      .join("");

    // ===== Sticker (dynamic template) =====
    const productSummary = items.map((i) => `${i.product_name} × ${i.quantity}`).join(", ");
    const totalQty = items.reduce((s, i) => s + i.quantity, 0);
    const hotline = c.sticker_hotline || shopPhone;
    const stickerHtml = (c.sticker_enabled === "false" && mode !== "sticker") ? "" : getStickerHtml(c, {
      brandName, shopName, shopPhone, hotline, logoUrl,
      slogan: c.sticker_slogan,
      customerName: order.customer_name,
      customerAddress: order.customer_address,
      customerCity: order.customer_city,
      customerPhone: order.customer_phone,
      productSummary,
      totalAmount: order.total_amount,
      totalQty,
      orderId: formatOrderId(order.id),
      paymentMethod: order.payment_method,
    }, esc);

    const logoHtml = logoUrl
      ? `<img src="${esc(logoUrl)}" alt="" class="logo-img" />`
      : "";

    const html = `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<title>Invoice ${esc(formatOrderId(order.id))}</title>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet">
<style>
  * { margin:0; padding:0; box-sizing:border-box; }
  body { font-family:'Inter',sans-serif; background:#e8e8e8; color:${c.body_text_color}; padding:24px; -webkit-print-color-adjust:exact; print-color-adjust:exact; }
  .page { max-width:820px; margin:0 auto; background:${c.page_bg}; box-shadow:0 6px 30px rgba(0,0,0,0.15); position:relative; overflow:hidden; }

  /* HEADER */
  .header { position:relative; height:130px; background:${c.header_bg}; overflow:hidden; }
  .h-orange { position:absolute; top:0; left:0; width:55%; height:100%; background:${c.header_accent_bg}; clip-path:polygon(0 0, 88% 0, 100% 100%, 0 100%); }
  .h-brown  { position:absolute; top:0; left:48%; width:10%; height:100%; background:${c.header_brown_bg}; clip-path:polygon(20% 0, 100% 0, 80% 100%, 0 100%); opacity:0.85; }
  .h-navy   { position:absolute; top:0; left:0; width:45%; height:100%; background:${c.header_bg}; clip-path:polygon(0 0, 100% 0, 80% 100%, 0 100%); }
  .brand    { position:absolute; left:36px; top:0; height:100%; display:flex; flex-direction:column; justify-content:center; z-index:2; }
  .logo-img { max-height:36px; margin-bottom:6px; object-fit:contain; align-self:flex-start; }
  .brand-name { color:${c.brand_name_color}; font-size:22px; font-weight:800; letter-spacing:1.2px; line-height:1; text-transform:uppercase; }
  .brand-slogan { color:${c.brand_tagline_color}; font-size:11px; letter-spacing:5px; margin-top:7px; text-transform:uppercase; }
  .invoice-label { position:absolute; right:36px; top:0; height:100%; display:flex; flex-direction:column; justify-content:center; align-items:flex-end; z-index:2; }
  .invoice-label .big { color:${c.invoice_label_color}; font-size:34px; font-weight:800; letter-spacing:2.5px; line-height:1; }
  .invoice-label .id  { color:${c.invoice_id_color}; font-size:11px; margin-top:7px; letter-spacing:0.5px; }

  /* Orange separator */
  .sep { position:relative; height:18px; background:${c.page_bg}; }
  .sep .o { position:absolute; top:0; left:0; width:22%; height:100%; background:${c.separator_left_bg}; clip-path:polygon(0 0, 100% 0, 90% 100%, 0 100%); }
  .sep .l { position:absolute; top:0; left:20%; width:4%; height:100%; background:${c.separator_right_bg}; clip-path:polygon(0 0, 100% 0, 80% 100%, 0 100%); }

  /* BODY */
  .body { padding:26px 36px 0; }
  .addr-row { display:flex; justify-content:space-between; gap:24px; margin-bottom:22px; }
  .badge { display:inline-block; background:${c.badge_bg}; color:${c.badge_text_color}; font-size:10px; font-weight:700; padding:5px 11px 5px 9px; border-left:3px solid ${c.badge_border_color}; letter-spacing:0.4px; margin-bottom:8px; }
  .name { font-weight:700; font-size:14px; color:${c.section_name_color}; }
  .info { font-size:11px; color:${c.section_info_color}; line-height:1.7; margin-top:3px; }

  /* TABLE */
  .table { margin-bottom:18px; }
  .thead { display:grid; grid-template-columns:2.4fr 0.8fr 0.6fr 0.8fr; background:${c.table_header_bg}; color:${c.table_header_text}; font-size:11px; font-weight:700; letter-spacing:0.5px; }
  .thead > div { padding:11px 16px; position:relative; }
  .thead .center { padding:11px 0; text-align:center; }
  .thead .right { padding:11px 16px; text-align:right; }
  .slash { position:absolute; right:-1px; top:5px; bottom:5px; width:11px; background:${c.page_bg}; clip-path:polygon(60% 0, 100% 0, 40% 100%, 0 100%); opacity:0.85; }
  .row { display:grid; grid-template-columns:2.4fr 0.8fr 0.6fr 0.8fr; font-size:12px; color:${c.table_row_text}; border-bottom:1px solid ${c.table_row_border}; align-items:center; }
  .c-desc { padding:9px 16px; font-weight:500; display:flex; align-items:center; gap:10px; }
  .prod-img { width:38px; height:38px; border-radius:4px; object-fit:cover; border:1px solid ${c.table_row_border}; flex-shrink:0; }
  .c-price { padding:11px 0; text-align:center; }
  .c-qty { padding:11px 0; text-align:center; }
  .c-total { padding:11px 16px; text-align:right; font-weight:600; }

  /* Bottom info row */
  .info-row { display:grid; grid-template-columns:1fr 1fr 1fr; gap:20px; margin-top:20px; margin-bottom:16px; }
  .info-row .info-block { font-size:11px; line-height:1.8; color:${c.summary_text}; }
  .info-block b { font-weight:700; }
  .summary-line { display:flex; justify-content:space-between; padding:3px 16px; font-size:12px; color:${c.summary_text}; }
  .summary-line b { font-weight:600; }
  .total-bar { margin-top:8px; position:relative; height:36px; }
  .total-bar > div { position:absolute; inset:0; background:${c.total_bar_bg}; clip-path:polygon(8% 0, 100% 0, 100% 100%, 0 100%); display:flex; align-items:center; justify-content:space-between; padding:0 18px 0 26px; color:${c.total_bar_text}; font-weight:800; font-size:14px; letter-spacing:0.5px; }

  /* Thanks + Signature */
  .footer-row { display:flex; justify-content:space-between; align-items:flex-end; margin-top:26px; margin-bottom:22px; gap:24px; }
  .thanks-title { font-weight:700; font-size:14px; color:${c.thanks_title_color}; margin-bottom:5px; }
  .thanks-text { font-size:10px; color:${c.thanks_text_color}; line-height:1.6; max-width:380px; }
  .sign { text-align:center; min-width:140px; }
  .sign .line { border-bottom:1px solid ${c.signature_color}; padding-bottom:5px; font-weight:700; font-size:13px; color:${c.signature_color}; }
  .sign .lbl { font-size:10px; color:${c.signature_label_color}; margin-top:4px; letter-spacing:1.2px; }

  /* Bottom band */
  .bottom-band { position:relative; height:32px; margin-top:8px; }
  .bottom-band .o { position:absolute; bottom:0; left:0; width:35%; height:100%; background:${c.bottom_band_left_bg}; clip-path:polygon(0 0, 100% 0, 92% 100%, 0 100%); }
  .bottom-band .n { position:absolute; bottom:0; right:0; width:35%; height:100%; background:${c.bottom_band_right_bg}; clip-path:polygon(8% 0, 100% 0, 100% 100%, 0 100%); }

  .no-print { display:block; margin:24px auto; padding:12px 30px; background:${c.print_button_bg}; color:${c.print_button_text}; border:none; border-radius:6px; font-size:14px; font-family:'Inter',sans-serif; cursor:pointer; font-weight:600; }
  ${mode === "sticker" ? ".page{display:none;}" : ""}
  ${mode === "invoice" ? ".sticker-page,.sticker{display:none;}" : ""}

  ${getStickerCss(c)}

  @media print {
    body { padding:0; background:#fff; }
    .page, .sticker { box-shadow:none; }
    .no-print { display:none; }
    .sticker-page { page-break-before:always; margin-top:0; padding:24px; }
  }
</style>
</head>
<body>
  <div class="page">

    <!-- HEADER -->
    <div class="header">
      <div class="h-orange"></div>
      <div class="h-brown"></div>
      <div class="h-navy"></div>
      <div class="brand">
        ${logoHtml}
        <div class="brand-name">${esc(brandName)}</div>
        <div class="brand-slogan">${esc(brandTagline)}</div>
      </div>
      <div class="invoice-label">
        <div class="big">INVOICE</div>
        <div class="id">ID NO : ${esc(formatOrderId(order.id))}</div>
      </div>
    </div>

    <div class="sep"><div class="o"></div><div class="l"></div></div>

    <div class="body">
      <!-- Addresses -->
      <div class="addr-row">
        <div>
          <div class="badge">Invoice To :</div>
          <div class="name">${esc(order.customer_name)}</div>
          <div class="info">
            Phone : ${esc(order.customer_phone)}<br/>
            ${esc(order.customer_address)}<br/>
            ${esc(order.customer_city)}
          </div>
        </div>
        <div>
          <div class="badge">Invoice From :</div>
          <div class="name">${esc(shopName)}</div>
          <div class="info">
            Phone : ${esc(shopPhone)}<br/>
            ${esc(brandName)}<br/>
            Date : ${esc(formatDate(order.created_at))}
          </div>
        </div>
      </div>

      <!-- Table -->
      <div class="table">
        <div class="thead">
          <div>DESCRIPTION<div class="slash"></div></div>
          <div class="center" style="position:relative;">PRICE<div class="slash"></div></div>
          <div class="center" style="position:relative;">QTY<div class="slash"></div></div>
          <div class="right">TOTAL</div>
        </div>
        ${itemsHtml}
      </div>

      <!-- Info row -->
      <div class="info-row">
        <div>
          <div class="badge">Payment Method :</div>
          <div class="info-block">
            <div><b>Type :</b> ${order.payment_method === "cod" ? "Cash on Delivery" : "Online Payment"}</div>
            <div><b>Account Name :</b> ${esc(shopName)}</div>
            <div><b>Status :</b> ${esc(order.status)}</div>
          </div>
        </div>
        <div>
          <div class="badge">Contact Info :</div>
          <div class="info-block">
            <div><b>Phone :</b> ${esc(shopPhone)}</div>
            <div><b>Order :</b> ${esc(formatOrderId(order.id))}</div>
            <div><b>Date :</b> ${esc(formatDate(order.created_at))}</div>
          </div>
        </div>
        <div>
          <div class="summary-line"><b>Subtotal :</b><span>${fmt(subtotal)}</span></div>
          <div class="summary-line"><b>Shipping :</b><span>${fmt(shipping)}</span></div>
          <div class="summary-line"><b>Discount :</b><span>${fmt(discount)}</span></div>
          <div class="total-bar"><div><span>TOTAL</span><span>${fmt(order.total_amount)}</span></div></div>
        </div>
      </div>

      <!-- Thanks -->
      <div class="footer-row">
        <div>
          <div class="thanks-title">Thanks for your business</div>
          <div class="thanks-text">${esc(footerText)}</div>
        </div>
        <div class="sign">
          <div class="line">${esc(brandName).slice(0, 22)}</div>
          <div class="lbl">SIGNATURE</div>
        </div>
      </div>
    </div>

    <!-- Bottom band -->
    <div class="bottom-band"><div class="o"></div><div class="n"></div></div>
  </div>

  ${mode === "invoice" ? "" : stickerHtml}
  <button class="no-print" onclick="window.print()">🖨️ Print ${mode === "sticker" ? "Sticker" : mode === "invoice" ? "Invoice" : "Invoice & Sticker"}</button>
</body>
</html>`;

    w.document.write(html);
    w.document.close();
  };

  return (
    <div className="flex gap-2 flex-wrap">
      <Button onClick={() => handlePrint("invoice")} variant="outline" size="sm" className="gap-2">
        <Printer className="h-4 w-4" />
        Print Invoice
      </Button>
      {c.sticker_enabled !== "false" && (
        <Button onClick={() => handlePrint("sticker")} variant="outline" size="sm" className="gap-2">
          <Tag className="h-4 w-4" />
          Print Sticker
        </Button>
      )}
    </div>
  );
};

export default InvoicePrint;
