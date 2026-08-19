function mulberry32(seed) {
  return function random() {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const rand = mulberry32(20260806);
const pick = (arr) => arr[Math.floor(rand() * arr.length)];
const pickN = (arr, n) => [...arr].sort(() => rand() - 0.5).slice(0, n);
const int = (min, max) => Math.floor(rand() * (max - min + 1)) + min;
const uid = (prefix, i) => `${prefix}-${String(i).padStart(4, "0")}`;

const NOW = new Date("2026-08-06T10:00:00Z");
function daysAgo(days) {
  return new Date(NOW.getTime() - days * 86_400_000).toISOString();
}
function daysFromNow(days) {
  return new Date(NOW.getTime() + days * 86_400_000).toISOString();
}

const CATEGORY_DEFS = [
  { name: "Necklaces", desc: "Statement and everyday necklaces" },
  { name: "Earrings", desc: "Studs, hoops and drops" },
  { name: "Rings", desc: "Engagement, wedding and fashion rings" },
  { name: "Bangles & Bracelets", desc: "Gold and diamond bangles" },
  { name: "Pendants", desc: "Solitaire and temple pendants" },
  { name: "Mangalsutra", desc: "Traditional and modern mangalsutra" },
  { name: "Chains", desc: "Gold and platinum chains" },
  { name: "Anklets", desc: "Silver and gold anklets" },
];

const MATERIALS = ["22K Gold", "18K Gold", "Platinum", "Sterling Silver", "Rose Gold"];
const GEMSTONES = ["Diamond", "Ruby", "Emerald", "Sapphire", "Pearl", "Kundan", "Polki", undefined];
const PRODUCT_ADJECTIVES = ["Vatika", "Zara", "Meera", "Vintage", "Royal", "Celeste", "Ananya", "Ivy", "Nova", "Radiance"];
const PRODUCT_NOUNS = ["Solitaire", "Halo", "Drop", "Hoop", "Cluster", "Chain", "Bloom", "Infinity", "Weave", "Motif"];

const FIRST_NAMES = ["Aarav", "Vivaan", "Aditi", "Diya", "Kabir", "Meera", "Ishaan", "Ananya", "Rohan", "Sara", "Vikram", "Priya", "Arjun", "Neha", "Karan", "Pooja", "Rahul", "Simran", "Aditya", "Kavya"];
const LAST_NAMES = ["Sharma", "Verma", "Iyer", "Gupta", "Nair", "Kapoor", "Reddy", "Chopra", "Malhotra", "Bhatt", "Joshi", "Menon", "Rao", "Desai"];

const CITIES = [
  { city: "Mumbai", state: "Maharashtra" },
  { city: "Delhi", state: "Delhi" },
  { city: "Bengaluru", state: "Karnataka" },
  { city: "Ahmedabad", state: "Gujarat" },
  { city: "Jaipur", state: "Rajasthan" },
  { city: "Chennai", state: "Tamil Nadu" },
  { city: "Pune", state: "Maharashtra" },
  { city: "Hyderabad", state: "Telangana" },
];

function randomName() {
  return `${pick(FIRST_NAMES)} ${pick(LAST_NAMES)}`;
}

function randomAddress() {
  const loc = pick(CITIES);
  return {
    line1: `${int(1, 199)}, ${pick(["MG Road", "Park Street", "Church Street", "Linking Road", "Ring Road", "Station Road"])}`,
    city: loc.city,
    state: loc.state,
    postalCode: String(int(110001, 682001)),
    country: "India",
  };
}

export function seedCategories() {
  return CATEGORY_DEFS.map((c, i) => ({
    id: uid("cat", i + 1),
    name: c.name,
    slug: c.name.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
    description: c.desc,
    productCount: 0,
    status: "active",
    createdAt: daysAgo(int(60, 400)),
  }));
}

export function seedProducts(categories) {
  const products = [];
  const perCategory = 6;
  categories.forEach((cat, ci) => {
    for (let i = 0; i < perCategory; i++) {
      const idx = ci * perCategory + i + 1;
      const material = pick(MATERIALS);
      const gemstone = pick(GEMSTONES);
      const weight = Number((int(15, 250) / 10).toFixed(1));
      const price = int(8000, 250000);
      const stock = int(0, 60);
      products.push({
        id: uid("prod", idx),
        sku: `AV-${cat.slug.slice(0, 3).toUpperCase()}-${String(idx).padStart(4, "0")}`,
        name: `${pick(PRODUCT_ADJECTIVES)} ${pick(PRODUCT_NOUNS)} ${cat.name.split(" ")[0].replace(/s$/, "")}`,
        categoryId: cat.id,
        categoryName: cat.name,
        material,
        gemstone,
        weightGrams: weight,
        price,
        costPrice: Math.round(price * 0.68),
        stock,
        reorderLevel: 8,
        status: rand() > 0.12 ? "active" : rand() > 0.5 ? "draft" : "archived",
        imageUrl: undefined,
        description: `Handcrafted ${material.toLowerCase()} ${cat.name.toLowerCase().replace(/s$/, "")}${gemstone ? ` studded with ${gemstone.toLowerCase()}` : ""}.`,
        createdAt: daysAgo(int(5, 300)),
        updatedAt: daysAgo(int(0, 5)),
      });
    }
  });
  return products;
}

export function seedCustomers() {
  return Array.from({ length: 60 }, (_, i) => {
    const name = randomName();
    const totalOrders = int(0, 24);
    return {
      id: uid("cust", i + 1),
      name,
      email: `${name.toLowerCase().replace(/\s+/g, ".")}@example.com`,
      phone: `+91 ${int(70000, 99999)}${int(10000, 99999)}`,
      totalOrders,
      totalSpent: totalOrders * int(4000, 60000),
      loyaltyTier: totalOrders > 15 ? "platinum" : totalOrders > 6 ? "gold" : "silver",
      address: randomAddress(),
      status: rand() > 0.06 ? "active" : "blocked",
      createdAt: daysAgo(int(10, 500)),
    };
  });
}

const ORDER_STATUSES = ["pending", "processing", "shipped", "delivered", "cancelled", "refunded"];
const PAYMENT_METHODS = ["UPI", "Credit Card", "Debit Card", "Net Banking", "Cash on Delivery"];

export function seedOrders(products, customers) {
  return Array.from({ length: 90 }, (_, i) => {
    const customer = pick(customers);
    const items = pickN(products, int(1, 3)).map((p, ii) => ({
      id: uid(`ordit-${i + 1}`, ii + 1),
      productId: p.id,
      productName: p.name,
      sku: p.sku,
      quantity: int(1, 2),
      unitPrice: p.price,
    }));
    const subtotal = items.reduce((sum, it) => sum + it.unitPrice * it.quantity, 0);
    const discount = rand() > 0.7 ? Math.round(subtotal * 0.05) : 0;
    const tax = Math.round((subtotal - discount) * 0.03);
    const total = subtotal - discount + tax;
    const status = i < 14 ? "pending" : pick(ORDER_STATUSES);
    const placedAt = daysAgo(int(0, 365));
    return {
      id: uid("ord", i + 1),
      orderNumber: `AV${24000 + i}`,
      customerId: customer.id,
      customerName: customer.name,
      customerEmail: customer.email,
      items,
      subtotal,
      discount,
      tax,
      total,
      status,
      paymentStatus:
        status === "delivered" ? "paid" : status === "cancelled" ? "refunded" : pick(["paid", "unpaid", "partially_paid"]),
      paymentMethod: pick(PAYMENT_METHODS),
      shippingAddress: customer.address,
      placedAt,
      updatedAt: placedAt,
    };
  }).sort((a, b) => new Date(b.placedAt).getTime() - new Date(a.placedAt).getTime());
}

export function seedInvoices(orders) {
  return orders.slice(0, 50).map((o, i) => ({
    id: uid("inv", i + 1),
    invoiceNumber: `INV-${2026}${String(i + 1).padStart(4, "0")}`,
    orderId: o.id,
    orderNumber: o.orderNumber,
    customerName: o.customerName,
    amount: o.total,
    amountPaid: o.paymentStatus === "paid" ? o.total : o.paymentStatus === "partially_paid" ? Math.round(o.total * 0.5) : 0,
    status: o.paymentStatus,
    dueDate: daysFromNow(int(-10, 20)),
    issuedAt: o.placedAt,
  }));
}

export function seedInventoryMovements(products) {
  const types = ["restock", "sale", "adjustment", "return"];
  return Array.from({ length: 70 }, (_, i) => {
    const p = pick(products);
    const type = pick(types);
    const qty = type === "sale" ? -int(1, 4) : int(1, 20);
    return {
      id: uid("mov", i + 1),
      productId: p.id,
      productName: p.name,
      sku: p.sku,
      type,
      quantity: qty,
      stockAfter: Math.max(0, p.stock + int(-5, 5)),
      note: type === "adjustment" ? "Manual stock correction" : undefined,
      createdAt: daysAgo(int(0, 90)),
      createdBy: pick(["Lubomir Dvorak", "Aarav Sharma", "Priya Kapoor"]),
    };
  }).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export function seedOffers() {
  const defs = [
    { code: "FESTIVE10", title: "Festive Season 10% Off", type: "percentage", value: 10 },
    { code: "WELCOME500", title: "Welcome Offer", type: "flat", value: 500 },
    { code: "GOLD5", title: "Gold Collection Discount", type: "percentage", value: 5 },
    { code: "BRIDAL15", title: "Bridal Edit Special", type: "percentage", value: 15 },
    { code: "FREESHIP", title: "Free Shipping Weekend", type: "flat", value: 0 },
    { code: "LOYALTY1K", title: "Loyalty Members Reward", type: "flat", value: 1000 },
  ];
  return defs.map((d, i) => {
    const starts = daysAgo(int(-20, 40));
    const ends = daysFromNow(int(-5, 45));
    const status = new Date(ends) < NOW ? "expired" : new Date(starts) > NOW ? "scheduled" : rand() > 0.15 ? "active" : "disabled";
    return {
      id: uid("off", i + 1),
      code: d.code,
      title: d.title,
      description: `${d.title} on select jewellery pieces.`,
      type: d.type,
      value: d.value,
      minOrderValue: int(0, 5) * 5000,
      usageLimit: int(50, 500),
      usedCount: int(0, 50),
      startsAt: starts,
      endsAt: ends,
      status,
    };
  });
}

export function seedNotifications() {
  const defs = [
    { type: "order", title: "New order placed", message: "Order AV24036 was placed by Meera Iyer for ₹1,15,6370." },
    { type: "inventory", title: "Low stock alert", message: "Vatika Solitaire Ring (AV-RIN-0012) has only 3 units left." },
    { type: "payment", title: "Payment received", message: "Payment of ₹42,500 received for invoice INV-20260031." },
    { type: "customer", title: "New customer registered", message: "Rohan Verma created an account." },
    { type: "system", title: "Scheduled maintenance", message: "Platform maintenance scheduled for Sunday 2 AM IST." },
    { type: "order", title: "Order shipped", message: "Order AV24022 has been shipped via BlueDart." },
    { type: "inventory", title: "Restock completed", message: "40 units of gold chains restocked in inventory." },
    { type: "order", title: "Order cancelled", message: "Order AV24018 was cancelled by the customer." },
  ];
  return defs.map((d, i) => ({
    id: uid("notif", i + 1),
    ...d,
    read: i > 3,
    createdAt: daysAgo(i),
  }));
}

export function seedUsers() {
  const defs = [
    { name: "Lubomir Dvorak", role: "superadmin" },
    { name: "Aarav Sharma", role: "admin" },
    { name: "Priya Kapoor", role: "manager" },
    { name: "Neha Malhotra", role: "staff" },
    { name: "Karan Bhatt", role: "staff" },
    { name: "Simran Joshi", role: "manager" },
  ];
  return defs.map((d, i) => ({
    id: uid("usr", i + 1),
    name: d.name,
    email: `${d.name.toLowerCase().replace(/\s+/g, ".")}@abhushanvatika.com`,
    role: d.role,
    status: i === 4 ? "invited" : "active",
    lastActiveAt: daysAgo(int(0, 10)),
    createdAt: daysAgo(int(30, 600)),
  }));
}
