import { InvoiceColors } from "@/lib/invoiceTheme";
import { renderStickerReact, StickerData } from "@/lib/stickerTemplates";

interface InvoiceLivePreviewProps {
  brandName: string;
  brandTagline: string;
  shopName: string;
  shopPhone: string;
  footerText: string;
  logoUrl: string;
  colors: InvoiceColors;
}

const sampleItems = [
  { name: "পাঞ্জাবি (সাদা)", price: 1200, qty: 1, image: "https://images.unsplash.com/photo-1622445275576-721325763afe?w=80&h=80&fit=crop" },
  { name: "অর্গানিক মধু ৫০০g", price: 650, qty: 2, image: "https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=80&h=80&fit=crop" },
  { name: "ফেস ওয়াশ", price: 350, qty: 1, image: "https://images.unsplash.com/photo-1556228720-195a672e8a03?w=80&h=80&fit=crop" },
];

const InvoiceLivePreview = ({
  brandName,
  brandTagline,
  shopName,
  shopPhone,
  footerText,
  logoUrl,
  colors: c,
}: InvoiceLivePreviewProps) => {
  const subtotal = sampleItems.reduce((a, i) => a + i.qty * i.price, 0);
  const shipping = 60;
  const discount = 0;
  const total = subtotal + shipping - discount;
  const fmt = (n: number) => `৳${n.toFixed(0)}`;
  const showImage = c.show_product_image !== "false";

  const Badge = ({ text }: { text: string }) => (
    <div
      style={{
        display: "inline-block",
        background: c.badge_bg,
        color: c.badge_text_color,
        fontSize: 9,
        fontWeight: 700,
        padding: "4px 10px 4px 8px",
        borderLeft: `3px solid ${c.badge_border_color}`,
        letterSpacing: 0.3,
        marginBottom: 6,
      }}
    >
      {text}
    </div>
  );

  return (
    <div
      style={{
        fontFamily: "'Inter', sans-serif",
        background: c.page_bg,
        color: c.body_text_color,
        boxShadow: "0 4px 24px rgba(0,0,0,0.12)",
        borderRadius: 4,
        overflow: "hidden",
        fontSize: 11,
        position: "relative",
      }}
    >
      {/* HEADER */}
      <div style={{ position: "relative", height: 110, background: c.header_bg, overflow: "hidden" }}>
        <div style={{ position: "absolute", top: 0, left: 0, width: "55%", height: "100%", background: c.header_accent_bg, clipPath: "polygon(0 0, 88% 0, 100% 100%, 0 100%)" }} />
        <div style={{ position: "absolute", top: 0, left: "48%", width: "10%", height: "100%", background: c.header_brown_bg, clipPath: "polygon(20% 0, 100% 0, 80% 100%, 0 100%)", opacity: 0.85 }} />
        <div style={{ position: "absolute", top: 0, left: 0, width: "45%", height: "100%", background: c.header_bg, clipPath: "polygon(0 0, 100% 0, 80% 100%, 0 100%)" }} />

        <div style={{ position: "absolute", top: 0, left: 0, height: "100%", display: "flex", flexDirection: "column", justifyContent: "center", paddingLeft: 28, zIndex: 2 }}>
          {logoUrl ? (
            <img src={logoUrl} alt="" style={{ maxHeight: 30, marginBottom: 4, objectFit: "contain", alignSelf: "flex-start" }} />
          ) : null}
          <div style={{ color: c.brand_name_color, fontSize: 18, fontWeight: 800, letterSpacing: 1, lineHeight: 1 }}>
            {(brandName || "YOUR LOGO").toUpperCase()}
          </div>
          <div style={{ color: c.brand_tagline_color, fontSize: 10, fontWeight: 400, letterSpacing: 4, marginTop: 5 }}>
            {(brandTagline || "SLOGAN").toUpperCase()}
          </div>
        </div>

        <div style={{ position: "absolute", top: 0, right: 0, height: "100%", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "flex-end", paddingRight: 28, zIndex: 2 }}>
          <div style={{ color: c.invoice_label_color, fontSize: 28, fontWeight: 800, letterSpacing: 2, lineHeight: 1 }}>INVOICE</div>
          <div style={{ color: c.invoice_id_color, fontSize: 9, marginTop: 6, letterSpacing: 0.5 }}>ID NO : INV-2026-001</div>
        </div>
      </div>

      {/* Separator */}
      <div style={{ position: "relative", height: 14, background: c.page_bg }}>
        <div style={{ position: "absolute", top: 0, left: 0, width: "20%", height: "100%", background: c.separator_left_bg, clipPath: "polygon(0 0, 100% 0, 90% 100%, 0 100%)" }} />
        <div style={{ position: "absolute", top: 0, left: "18%", width: "4%", height: "100%", background: c.separator_right_bg, clipPath: "polygon(0 0, 100% 0, 80% 100%, 0 100%)" }} />
      </div>

      {/* BODY */}
      <div style={{ padding: "20px 28px 0" }}>
        <div style={{ display: "flex", justifyContent: "space-between", gap: 20, marginBottom: 18 }}>
          <div>
            <Badge text="Invoice To :" />
            <div style={{ fontWeight: 700, fontSize: 13, color: c.section_name_color }}>আবদুল করিম</div>
            <div style={{ fontSize: 10, color: c.section_info_color, lineHeight: 1.6, marginTop: 2 }}>
              Phone : 01712345678<br />
              ১২৩ মেইন রোড, ধানমন্ডি<br />
              ঢাকা ১২০৫
            </div>
          </div>
          <div>
            <Badge text="Invoice From :" />
            <div style={{ fontWeight: 700, fontSize: 13, color: c.section_name_color }}>{shopName || "Your Shop Name"}</div>
            <div style={{ fontSize: 10, color: c.section_info_color, lineHeight: 1.6, marginTop: 2 }}>
              Phone : {shopPhone || "01XXXXXXXXX"}<br />
              {brandName || "BRANDNAME"}<br />
              বাংলাদেশ
            </div>
          </div>
        </div>

        {/* TABLE */}
        <div style={{ marginBottom: 16 }}>
          <div style={{ display: "grid", gridTemplateColumns: "2.4fr 0.8fr 0.6fr 0.8fr", background: c.table_header_bg, color: c.table_header_text, fontSize: 10, fontWeight: 700, letterSpacing: 0.5 }}>
            <div style={{ padding: "9px 14px", position: "relative" }}>DESCRIPTION<Slash bg={c.page_bg} /></div>
            <div style={{ padding: "9px 0", textAlign: "center", position: "relative" }}>PRICE<Slash bg={c.page_bg} /></div>
            <div style={{ padding: "9px 0", textAlign: "center", position: "relative" }}>QTY<Slash bg={c.page_bg} /></div>
            <div style={{ padding: "9px 14px", textAlign: "right" }}>TOTAL</div>
          </div>

          {sampleItems.map((item, idx) => (
            <div key={idx} style={{ display: "grid", gridTemplateColumns: "2.4fr 0.8fr 0.6fr 0.8fr", fontSize: 11, color: c.table_row_text, borderBottom: `1px solid ${c.table_row_border}`, alignItems: "center" }}>
              <div style={{ padding: "8px 14px", fontWeight: 500, display: "flex", alignItems: "center", gap: 8 }}>
                {showImage && (
                  <img src={item.image} alt="" style={{ width: 32, height: 32, borderRadius: 4, objectFit: "cover", flexShrink: 0, border: `1px solid ${c.table_row_border}` }} />
                )}
                <span>{item.name}</span>
              </div>
              <div style={{ padding: "9px 0", textAlign: "center" }}>{fmt(item.price)}</div>
              <div style={{ padding: "9px 0", textAlign: "center" }}>{item.qty}</div>
              <div style={{ padding: "9px 14px", textAlign: "right", fontWeight: 600 }}>{fmt(item.price * item.qty)}</div>
            </div>
          ))}
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16, marginTop: 18, marginBottom: 16 }}>
          <div>
            <Badge text="Payment Method :" />
            <div style={{ fontSize: 10, lineHeight: 1.7, color: c.summary_text }}>
              <div><b>Type :</b> Cash on Delivery</div>
              <div><b>Account :</b> {shopName || "Shop"}</div>
              <div><b>Status :</b> Pending</div>
            </div>
          </div>
          <div>
            <Badge text="Contact Info :" />
            <div style={{ fontSize: 10, lineHeight: 1.7, color: c.summary_text }}>
              <div><b>Phone :</b> {shopPhone || "01XXXXXXXXX"}</div>
              <div><b>Order :</b> INV-2026-001</div>
              <div><b>Date :</b> Today</div>
            </div>
          </div>

          <div style={{ fontSize: 11, color: c.summary_text }}>
            <SummaryLine label="Subtotal :" value={fmt(subtotal)} />
            <SummaryLine label="Shipping :" value={fmt(shipping)} />
            <SummaryLine label="Discount :" value={fmt(discount)} />
            <div style={{ marginTop: 6, position: "relative", height: 32 }}>
              <div style={{ position: "absolute", inset: 0, background: c.total_bar_bg, clipPath: "polygon(8% 0, 100% 0, 100% 100%, 0 100%)", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 14px 0 22px", color: c.total_bar_text, fontWeight: 800, fontSize: 13, letterSpacing: 0.5 }}>
                <span>TOTAL</span>
                <span>{fmt(total)}</span>
              </div>
            </div>
          </div>
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginTop: 22, marginBottom: 18, gap: 20 }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 700, fontSize: 13, color: c.thanks_title_color, marginBottom: 4 }}>Thanks for your business</div>
            <div style={{ fontSize: 9, color: c.thanks_text_color, lineHeight: 1.6 }}>
              {footerText || "আমাদের সাথে কেনাকাটা করার জন্য ধন্যবাদ।"}
            </div>
          </div>
          <div style={{ textAlign: "center", minWidth: 120 }}>
            <div style={{ borderBottom: `1px solid ${c.signature_color}`, paddingBottom: 4, fontWeight: 700, fontSize: 12, color: c.signature_color }}>
              {(brandName || "Authorized").slice(0, 18)}
            </div>
            <div style={{ fontSize: 9, color: c.signature_label_color, marginTop: 3, letterSpacing: 1 }}>SIGNATURE</div>
          </div>
        </div>
      </div>

      <div style={{ position: "relative", height: 28, marginTop: 6 }}>
        <div style={{ position: "absolute", bottom: 0, left: 0, width: "35%", height: "100%", background: c.bottom_band_left_bg, clipPath: "polygon(0 0, 100% 0, 92% 100%, 0 100%)" }} />
        <div style={{ position: "absolute", bottom: 0, right: 0, width: "35%", height: "100%", background: c.bottom_band_right_bg, clipPath: "polygon(8% 0, 100% 0, 100% 100%, 0 100%)" }} />
      </div>

      {/* ===== STICKER PREVIEW ===== */}
      {c.sticker_enabled !== "false" && renderStickerReact(c, {
        brandName: brandName || "BRANDNAME",
        shopName: shopName || "Your Shop",
        shopPhone: shopPhone || "01XXXXXXXXX",
        hotline: shopPhone || "01XXXXXXXXX",
        logoUrl,
        slogan: c.sticker_slogan || "আপনাদের সেবা আমাদের ধর্ম",
        customerName: "আবদুল করিম",
        customerAddress: "১২৩ মেইন রোড, ধানমন্ডি",
        customerCity: "ঢাকা ১২০৫",
        customerPhone: "01712345678",
        productSummary: "পাঞ্জাবি × 1, মধু × 2",
        totalAmount: total,
        totalQty: sampleItems.reduce((s, i) => s + i.qty, 0),
        orderId: "INV-2026-001",
        paymentMethod: "cod",
      } as StickerData)}
    </div>
  );
};

const Slash = ({ bg }: { bg: string }) => (
  <div style={{ position: "absolute", right: -1, top: 4, bottom: 4, width: 10, background: bg, clipPath: "polygon(60% 0, 100% 0, 40% 100%, 0 100%)", opacity: 0.85 }} />
);

const SummaryLine = ({ label, value }: { label: string; value: string }) => (
  <div style={{ display: "flex", justifyContent: "space-between", padding: "3px 14px", fontSize: 11 }}>
    <span style={{ fontWeight: 600 }}>{label}</span>
    <span>{value}</span>
  </div>
);

export default InvoiceLivePreview;