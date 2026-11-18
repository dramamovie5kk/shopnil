## Admin প্যানেল রিডিজাইন প্ল্যান

পুরো অ্যাডমিন এরিয়াকে একটা মডার্ন, কনসিস্টেন্ট ও প্রিমিয়াম লুক দেওয়া হবে — একটা শেয়ার্ড ডিজাইন সিস্টেম দিয়ে যাতে সব পেজ অটোমেটিক সুন্দর হয়।

### ১. ডিজাইন টোকেন (`src/index.css`)
নতুন admin-specific HSL টোকেন যোগ করব:
- `--admin-bg` — সফট গ্রেডিয়েন্ট ব্যাকগ্রাউন্ড
- `--admin-card`, `--admin-card-hover` — এলিভেটেড কার্ড
- `--admin-sidebar-bg`, `--admin-sidebar-active`
- 4টা stat card gradient (primary/success/warning/info)
- `--shadow-admin-card`, `--shadow-admin-elevated` — সফট, লেয়ার্ড শ্যাডো

### ২. AdminLayout রিডিজাইন (`src/components/admin/AdminLayout.tsx`)
- **Sidebar**: হোয়াইট → soft gradient + thin border, ব্র্যান্ড লোগো ব্লকে পলিশ, active item-এ rounded pill + subtle glow, hover state smooth
- **Page header**: শুধু title না — title + subtitle + breadcrumb + ডানপাশে action slot, soft gradient background
- **Main content area**: `bg-admin-bg` (subtle gradient), proper padding rhythm
- Mobile sidebar overlay: blur + smoother transition

### ৩. Reusable StatCard কম্পোনেন্ট (`src/components/admin/StatCard.tsx` — new)
Props: `label, value, icon, variant ("primary"|"success"|"warning"|"info"|"danger"), trend?, href?`
- Gradient accent strip বাম পাশে
- আইকনে soft tinted circle background
- Number animation (count-up subtle)
- Hover: lift + শ্যাডো গ্রো
- Optional trend pill (↑ 12% etc.)

### ৪. AdminDashboard পলিশ (`src/pages/admin/AdminDashboard.tsx`)
- সব inline `<Card>` stat → নতুন `<StatCard>` দিয়ে রিপ্লেস
- Low Stock Alert: gradient red-to-transparent, larger icon, "View Inventory →" CTA
- Quick Actions (moderator): card hover effect আরও alive
- Recent Orders: list row → রাউন্ডেড card row, status badge পলিশ, amount-এ tabular-nums, avatar circle (initials)
- Section headings + subtle dividers

### ৫. অন্যান্য admin পেজ অটো-উন্নতি
যেহেতু সব পেজ `AdminLayout` + shadcn `Card` ইউজ করে, লেআউট+টোকেন আপডেটেই AdminOrders, AdminProducts, AdminInventory, AdminSettings, AdminUsers ইত্যাদি সব পেজ একই কনসিস্টেন্ট লুক পাবে। কোনো পেজে যদি কাস্টম স্টাইলিং বেশি থাকে, সেটা পরে আলাদা পাসে রিফাইন করা যাবে।

### স্কোপের বাইরে
- Functionality / business logic অপরিবর্তিত
- ডেটাবেস, API, রুটিং অপরিবর্তিত
- শুধু visual + tokens + একটা নতুন helper component

### ফাইলস
- Edit: `src/index.css`, `src/components/admin/AdminLayout.tsx`, `src/pages/admin/AdminDashboard.tsx`
- New: `src/components/admin/StatCard.tsx`