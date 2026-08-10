"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import Image from "next/image";
import * as Dialog from "@radix-ui/react-dialog";
import {
  Activity,
  ArrowRight,
  BadgePercent,
  BarChart3,
  Building2,
  Check,
  ChevronLeft,
  Clock3,
  CreditCard,
  HeartPulse,
  LogOut,
  MapPin,
  Minus,
  PackageCheck,
  Pill,
  Plus,
  ReceiptText,
  Search,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  Store,
  Stethoscope,
  SunMedium,
  UserRound,
  X,
  type LucideIcon,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { Toaster, toast as showToast } from "sonner";

type View = "home" | "catalog" | "auth" | "doctor" | "checkout" | "order" | "account" | "adminLogin" | "admin" | "corp";
type BranchId = "analco" | "palmas" | "mirador" | "apizaco";
type User = { name: string; last: string; email: string; type: "patient" | "doctor"; points: number; card: string; license?: string; specialty?: string };
type Order = { number: string; total: number; points: number; branch: string; method: "card" | "cash"; date: string };

const branches: { id: BranchId; name: string; location: string; featured?: boolean }[] = [
  { id: "analco", name: "Analco", location: "Puebla", featured: true },
  { id: "palmas", name: "Palmas Plaza", location: "Puebla" },
  { id: "mirador", name: "El Mirador", location: "Puebla" },
  { id: "apizaco", name: "Apizaco", location: "Tlaxcala" },
];

const products = [
  { id: 1, name: "Ondansetrón 8 mg", desc: "10 tabletas. Náusea por quimioterapia.", cat: "Soporte oncológico", rx: true, prices: { palmas: 385, analco: 349, mirador: 362, apizaco: 335 } },
  { id: 2, name: "Suplemento nutricional 237 ml", desc: "Nutrición clínica completa, vainilla.", cat: "Soporte oncológico", rx: false, prices: { palmas: 62, analco: 55, mirador: 58, apizaco: 52 } },
  { id: 3, name: "Crema para radioterapia 100 g", desc: "Calma y repara la piel irradiada.", cat: "Soporte oncológico", rx: false, prices: { palmas: 289, analco: 265, mirador: 272, apizaco: 255 } },
  { id: 4, name: "Enjuague para mucositis 250 ml", desc: "Alivio de llagas por tratamiento.", cat: "Soporte oncológico", rx: false, prices: { palmas: 148, analco: 135, mirador: 139, apizaco: 128 } },
  { id: 5, name: "Paracetamol 500 mg", desc: "20 tabletas. Dolor y fiebre.", cat: "Medicamentos", rx: false, prices: { palmas: 38, analco: 32, mirador: 34, apizaco: 29 } },
  { id: 6, name: "Ibuprofeno 400 mg", desc: "10 tabletas. Antiinflamatorio.", cat: "Medicamentos", rx: false, prices: { palmas: 52, analco: 45, mirador: 48, apizaco: 42 } },
  { id: 7, name: "Amoxicilina 500 mg", desc: "12 cápsulas. Antibiótico.", cat: "Medicamentos", rx: true, prices: { palmas: 118, analco: 105, mirador: 110, apizaco: 98 } },
  { id: 8, name: "Omeprazol 20 mg", desc: "14 cápsulas. Protector gástrico.", cat: "Medicamentos", rx: false, prices: { palmas: 89, analco: 78, mirador: 82, apizaco: 74 } },
  { id: 9, name: "Loratadina 10 mg", desc: "10 tabletas. Antialérgico.", cat: "Medicamentos", rx: false, prices: { palmas: 64, analco: 55, mirador: 58, apizaco: 52 } },
  { id: 10, name: "Vitamina C 1 g", desc: "10 tabletas efervescentes.", cat: "Suplementos", rx: false, prices: { palmas: 75, analco: 68, mirador: 70, apizaco: 64 } },
  { id: 11, name: "Multivitamínico adulto", desc: "Frasco con 60 tabletas.", cat: "Suplementos", rx: false, prices: { palmas: 185, analco: 169, mirador: 175, apizaco: 159 } },
  { id: 12, name: "Proteína clínica en polvo 400 g", desc: "Apoyo nutricional durante el tratamiento.", cat: "Suplementos", rx: false, prices: { palmas: 329, analco: 299, mirador: 312, apizaco: 285 } },
  { id: 13, name: "Termómetro digital", desc: "Lectura rápida y punta flexible.", cat: "Dispositivos", rx: false, prices: { palmas: 129, analco: 115, mirador: 119, apizaco: 109 } },
  { id: 14, name: "Baumanómetro digital", desc: "Presión arterial, brazalete de brazo.", cat: "Dispositivos", rx: false, prices: { palmas: 649, analco: 599, mirador: 615, apizaco: 579 } },
  { id: 15, name: "Oxímetro de pulso", desc: "Medición de SpO₂ y frecuencia cardiaca.", cat: "Dispositivos", rx: false, prices: { palmas: 249, analco: 219, mirador: 229, apizaco: 209 } },
  { id: 16, name: "Suero oral electrolitos", desc: "Botella de 625 ml, sabor natural.", cat: "Cuidado diario", rx: false, prices: { palmas: 28, analco: 24, mirador: 25, apizaco: 22 } },
  { id: 17, name: "Cubrebocas KN95 (10 pzas)", desc: "Paquete con 10 piezas.", cat: "Cuidado diario", rx: false, prices: { palmas: 59, analco: 49, mirador: 52, apizaco: 45 } },
  { id: 18, name: "Bloqueador solar FPS 50", desc: "120 ml, toque seco. Piel en tratamiento.", cat: "Cuidado diario", rx: false, prices: { palmas: 219, analco: 199, mirador: 205, apizaco: 189 } },
] as const;

const categories = ["Todos", "Soporte oncológico", "Medicamentos", "Suplementos", "Dispositivos", "Cuidado diario"];
const categoryIcons: Record<string, LucideIcon> = {
  "Soporte oncológico": HeartPulse,
  Medicamentos: Pill,
  Suplementos: Sparkles,
  Dispositivos: Activity,
  "Cuidado diario": SunMedium,
};
const metrics = {
  analco: { sales: 486200, orders: 2114, ticket: 230, repeat: 64, growth: 9.2, stock: 97.4, top: "Suplemento nutricional", weeks: [52, 58, 61, 55, 63, 67, 70, 74] },
  palmas: { sales: 512940, orders: 1486, ticket: 345, repeat: 57, growth: 6.8, stock: 98.1, top: "Bloqueador solar FPS 50", weeks: [60, 63, 59, 66, 68, 64, 71, 75] },
  mirador: { sales: 298410, orders: 1102, ticket: 271, repeat: 49, growth: -1.7, stock: 95.2, top: "Omeprazol 20 mg", weeks: [41, 39, 37, 40, 38, 36, 35, 34] },
  apizaco: { sales: 224780, orders: 1538, ticket: 146, repeat: 71, growth: 12.6, stock: 96, top: "Suero oral electrolitos", weeks: [24, 26, 28, 27, 30, 31, 33, 36] },
};

const money = (value: number) => value.toLocaleString("es-MX", { style: "currency", currency: "MXN" });

function loadStoredState(): { branch?: BranchId; cart?: Record<number, number>; user?: User; orders?: Order[] } {
  if (typeof window === "undefined") return {};
  try { return JSON.parse(window.localStorage.getItem("one-pharmacy-state") || "{}"); }
  catch { return {}; }
}

function Logo({ compact = false }: { compact?: boolean }) {
  return <span className={`logo ${compact ? "logo-compact" : ""}`}><i aria-hidden="true"><b /><em /></i><strong>One</strong> Pharmacy</span>;
}

const reveal = {
  hidden: { opacity: 0, y: 22 },
  visible: { opacity: 1, y: 0 },
};

const WeeklySalesChart = dynamic(
  () => import("./components/DashboardCharts").then((module) => module.WeeklySalesChart),
  { ssr: false, loading: () => <div className="chart-loading" aria-label="Cargando gráfica" /> },
);

const BranchSalesChart = dynamic(
  () => import("./components/DashboardCharts").then((module) => module.BranchSalesChart),
  { ssr: false, loading: () => <div className="chart-loading" aria-label="Cargando gráfica" /> },
);

export default function Home() {
  const [initialState] = useState(loadStoredState);
  const [view, setView] = useState<View>("home");
  const [branch, setBranch] = useState<BranchId>(initialState.branch || "analco");
  const [category, setCategory] = useState("Todos");
  const [query, setQuery] = useState("");
  const [cart, setCart] = useState<Record<number, number>>(initialState.cart || {});
  const [cartOpen, setCartOpen] = useState(false);
  const [user, setUser] = useState<User | null>(initialState.user || null);
  const [orders, setOrders] = useState<Order[]>(initialState.orders || []);
  const [lastOrder, setLastOrder] = useState<Order | null>(null);
  const [authTab, setAuthTab] = useState<"register" | "login">("register");
  const [doctorTab, setDoctorTab] = useState<"login" | "register">("login");
  const [pay, setPay] = useState<"card" | "cash">("card");
  const [redeem, setRedeem] = useState(false);
  const [adminBranch, setAdminBranch] = useState<BranchId | null>(null);

  useEffect(() => {
    window.localStorage.setItem("one-pharmacy-state", JSON.stringify({ branch, cart, user, orders }));
  }, [branch, cart, user, orders]);

  const notify = (message: string) => {
    showToast(message);
  };
  const navigate = (next: View) => { setView(next); setCartOpen(false); window.scrollTo({ top: 0, behavior: "smooth" }); };
  const selectedBranch = branches.find((item) => item.id === branch)!;
  const doctor = user?.type === "doctor";
  const visibleProducts = useMemo(() => products.filter((product) =>
    (category === "Todos" || product.cat === category) && `${product.name} ${product.desc}`.toLowerCase().includes(query.toLowerCase())
  ), [category, query]);
  const unitPrice = (id: number) => {
    const product = products.find((item) => item.id === id)!;
    const base = product.prices[branch];
    return doctor ? base * .9 : base;
  };
  const cartCount = Object.values(cart).reduce((sum, quantity) => sum + quantity, 0);
  const total = Object.entries(cart).reduce((sum, [id, quantity]) => sum + unitPrice(Number(id)) * quantity, 0);
  const saving = doctor ? total / .9 - total : 0;
  const redeemValue = user ? Math.min(Math.floor(user.points / 100) * 50, total) : 0;

  const addToCart = (id: number) => {
    setCart((current) => ({ ...current, [id]: (current[id] || 0) + 1 }));
    notify("Producto agregado al carrito");
  };
  const changeQuantity = (id: number, delta: number) => setCart((current) => {
    const next = { ...current, [id]: (current[id] || 0) + delta };
    if (next[id] <= 0) delete next[id];
    return next;
  });
  const changeBranch = (next: BranchId) => {
    if (next === branch) return;
    setBranch(next);
    if (cartCount) { setCart({}); notify("Cambiamos de sucursal y vaciamos el carrito porque los precios varían."); }
    else notify(`Ahora compras en ${branches.find((item) => item.id === next)?.name}`);
  };
  const afterLogin = (nextUser: User, demoOrders: Order[] = []) => {
    setUser(nextUser); setOrders(demoOrders); notify(`Bienvenida${nextUser.type === "doctor" ? ", doctora. Tu 10% ya está activo" : " de nuevo"}`);
    navigate(cartCount ? "checkout" : "catalog");
  };
  const logout = () => { setUser(null); setOrders([]); setCart({}); navigate("home"); notify("Sesión cerrada"); };

  const submitPatient = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const name = String(data.get("name") || "María");
    afterLogin({ name, last: "Hernández Ríos", email: String(data.get("email") || "maria@onepharmacy.mx"), type: "patient", points: authTab === "login" ? 185 : 0, card: "•••• 4128" }, authTab === "login" ? [{ number: "OP-P-3021", total: 214, points: 21, branch: "Palmas Plaza", method: "card", date: "12 jul, 11:24" }] : []);
  };
  const submitDoctor = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    afterLogin({ name: String(data.get("name") || "Ana"), last: "García López", email: String(data.get("email") || "dra.garcia@onepharmacy.mx"), type: "doctor", points: 320, card: "•••• 9034", license: String(data.get("license") || "87654321"), specialty: String(data.get("specialty") || "Medicina general") });
  };
  const placeOrder = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!cartCount) return notify("Tu carrito está vacío");
    const charged = Math.max(total - (redeem ? redeemValue : 0), 0);
    const earned = Math.floor(charged / 10);
    const order: Order = { number: `OP-${doctor ? "M" : "P"}-${Math.floor(1000 + Math.random() * 9000)}`, total: charged, points: earned, branch: selectedBranch.name, method: pay, date: new Date().toLocaleString("es-MX", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" }) };
    setLastOrder(order); setOrders((current) => [order, ...current]); setCart({});
    setUser((current) => current ? { ...current, points: current.points - (redeem ? Math.floor(current.points / 100) * 100 : 0) + earned } : current);
    navigate("order");
  };

  const shoppingView = !["adminLogin", "admin", "corp"].includes(view);

  return <div className="app-shell">
    <header className="site-header">
      <button className="brand-button" onClick={() => navigate(shoppingView ? "home" : "adminLogin")} aria-label="Ir al inicio"><Logo compact /></button>
      {shoppingView ? <>
        <nav aria-label="Navegación principal">
          <button className={view === "home" ? "active" : ""} onClick={() => navigate("home")}>Inicio</button>
          <button className={view === "catalog" ? "active" : ""} onClick={() => navigate("catalog")}>Catálogo</button>
          <button className={view === "doctor" ? "active" : ""} onClick={() => navigate(user?.type === "doctor" ? "account" : "doctor")}>Médicos</button>
        </nav>
        <div className="header-actions">
          {doctor && <span className="doctor-chip"><Stethoscope size={14} /> Dra. {user.last.split(" ")[0]} · −10%</span>}
          <label className="branch-picker"><MapPin size={15} aria-hidden="true" /><span>Ubicación</span><select value={branch} onChange={(event) => changeBranch(event.target.value as BranchId)}>{branches.map((item) => <option value={item.id} key={item.id}>{item.name}{item.featured ? " · insignia" : ""}</option>)}</select></label>
          <button className="text-action account-action" onClick={() => navigate(user ? "account" : "auth")}><UserRound size={16} aria-hidden="true" />{user ? `Mi cuenta · ${user.points} pts` : "Iniciar sesión"}</button>
          <button className="cart-button" onClick={() => setCartOpen(true)}><ShoppingBag size={17} aria-hidden="true" /><span>Bolsa</span><b>{cartCount}</b></button>
        </div>
      </> : <div className="header-actions"><span className="admin-label">Portal de sucursales</span>{view !== "adminLogin" && <button className="text-action" onClick={() => { setAdminBranch(null); navigate("adminLogin"); }}>Cerrar sesión</button>}</div>}
    </header>

    {view === "home" && <main>
      <motion.section className="hero" initial="hidden" animate="visible" variants={reveal} transition={{ duration: .65, ease: [0.22, 1, 0.36, 1] }}>
        <div className="hero-copy">
          <span className="eyebrow">Puebla · Tlaxcala — 4 sucursales</span>
          <h1>La farmacia del <em>paciente oncológico</em></h1>
          <p>Medicamentos de soporte y cuidado diario con los precios de tu sucursal. Compra en línea, acumula puntos y recoge sin filas.</p>
          <div className="hero-actions"><motion.button whileTap={{ scale: .97 }} className="primary" onClick={() => navigate("catalog")}>Comprar ahora <ArrowRight size={17} /></motion.button><button className="secondary" onClick={() => navigate("doctor")}><Stethoscope size={17} /> Soy médico · −10%</button></div>
          <div className="trust-line"><span><Clock3 size={15} /> Recoge el mismo día</span><span><ShieldCheck size={15} /> Compra protegida</span></div>
        </div>
        <div className="hero-image"><Image src="/one-pharmacy-hero.webp" alt="Atención personalizada en una sucursal One Pharmacy" width={1000} height={1000} sizes="(max-width: 900px) 100vw, 48vw" priority /><motion.div className="floating-card" initial={{ opacity: 0, x: -18 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: .55 }}><BadgePercent size={24} /><b>1×10</b><span>1 punto por cada $10</span><small>Cada 100 pts valen $50</small></motion.div><div className="branch-count"><Store size={20} /><b>04</b><span>sucursales<br />cerca de ti</span></div></div>
      </motion.section>
      <motion.section className="category-section page-width" initial="hidden" whileInView="visible" viewport={{ once: true, amount: .2 }} variants={reveal} transition={{ duration: .55 }}>
        <span className="eyebrow">Compra por categoría</span><h2>Todo lo que necesitas durante el tratamiento, <em>en un solo lugar.</em></h2>
        <div className="category-grid">{categories.slice(1).map((item, index) => { const Icon = categoryIcons[item]; return <motion.button key={item} whileHover={{ y: -8 }} whileTap={{ scale: .98 }} onClick={() => { setCategory(item); navigate("catalog"); }}><i><Icon aria-hidden="true" /></i><small>0{index + 1}</small><span>{item}</span><b><ArrowRight size={18} /></b></motion.button>; })}</div>
      </motion.section>
      <section className="how-it-works"><div className="page-width"><span className="eyebrow light">Así de sencillo</span><h2>Tu pedido, listo cuando tú llegues.</h2><div className="steps">{[["01", "Elige tu sucursal", "Cada sucursal maneja sus precios e inventario."], ["02", "Compra y paga como prefieras", "Con tarjeta en línea o en caja al recoger."], ["03", "Recoge y gana puntos", "Te avisamos cuando esté listo y cada compra suma."]].map(([n, title, copy]) => <article key={n}><b>{n}</b><h3>{title}</h3><p>{copy}</p></article>)}</div></div></section>
      <section className="doctor-cta page-width"><div><span className="eyebrow">Programa profesional</span><h2>¿Eres profesional de la salud?</h2><p>Valida tu cédula una sola vez y obtén 10% de descuento permanente, con facturación automática.</p></div><button className="primary" onClick={() => navigate("doctor")}>Entrar al portal médico <ArrowRight size={17} /></button></section>
    </main>}

    {view === "catalog" && <main className="catalog page-width">
      <div className="catalog-heading"><div><span className="eyebrow">Compra local</span><h1>Sucursal {selectedBranch.name}</h1><p>{doctor ? "Tu descuento médico ya está aplicado. " : ""}Precios locales, inventario disponible y recolección el mismo día.</p></div><label className="search"><Search size={21} aria-hidden="true" /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Buscar medicamentos y productos" aria-label="Buscar productos" /></label></div>
      <div className="category-tabs">{categories.map((item) => <button className={category === item ? "active" : ""} key={item} onClick={() => setCategory(item)}>{item}</button>)}</div>
      {visibleProducts.length ? <motion.div layout className="product-grid">{visibleProducts.map((product) => { const base = product.prices[branch]; const price = doctor ? base * .9 : base; const ProductIcon = categoryIcons[product.cat]; return <motion.article layout className="product-card" key={product.id} initial={{ opacity: 0, scale: .98 }} animate={{ opacity: 1, scale: 1 }} whileHover={{ y: -6 }}><div className={`product-art art-${(product.id % 5) + 1}`}><span className="product-orbit" /><ProductIcon aria-hidden="true" />{product.rx && <b>Requiere receta</b>}</div><div className="product-content"><small>{product.cat}</small><h3>{product.name}</h3><p>{product.desc}</p>{product.rx && <span className="rx-note"><ReceiptText size={13} /> Presenta tu receta al recoger</span>}<div className="price-row"><div><strong>{money(price)}</strong>{doctor && <del>{money(base)}</del>}</div><motion.button whileTap={{ scale: .92 }} onClick={() => addToCart(product.id)} aria-label={`Agregar ${product.name}`}>Agregar <Plus size={16} /></motion.button></div></div></motion.article>})}</motion.div> : <div className="empty-state"><Search size={28} /><b>Sin resultados</b><p>Prueba con otra palabra o quita el filtro.</p></div>}
      <p className="catalog-note">Precios en MXN, IVA incluido. Los productos ℞ requieren receta al recoger en sucursal.</p>
    </main>}

    {(view === "auth" || view === "doctor") && <main className="auth-layout">
      <section className={`auth-story ${view === "doctor" ? "doctor-story" : ""}`}><button className="back-link" onClick={() => navigate("home")}><ChevronLeft size={17} /> Volver al inicio</button><div><Logo /><span className="eyebrow light">{view === "doctor" ? "Profesionales de la salud" : "One Lealtad"}</span><h1>{view === "doctor" ? "Tu conocimiento merece beneficios." : "Tu salud también te recompensa."}</h1><p>{view === "doctor" ? "Accede a precios preferenciales y facturación automática con tu cédula verificada." : "Compra, acumula puntos y recibe promociones exclusivas de tu sucursal."}</p></div></section>
      <section className="auth-panel"><div className="form-card"><span className="eyebrow">{view === "doctor" ? "Portal médico" : "Cuenta de paciente"}</span><h2>{view === "doctor" ? "Bienvenido, doctor" : "Crea tu cuenta"}</h2><p>{view === "doctor" ? "10% permanente en todo el catálogo." : "Obtén tu tarjeta One Lealtad desde tu primera compra."}</p>
        <div className="segmented">{view === "doctor" ? <><button className={doctorTab === "login" ? "active" : ""} onClick={() => setDoctorTab("login")}>Iniciar sesión</button><button className={doctorTab === "register" ? "active" : ""} onClick={() => setDoctorTab("register")}>Registrarme</button></> : <><button className={authTab === "register" ? "active" : ""} onClick={() => setAuthTab("register")}>Crear cuenta</button><button className={authTab === "login" ? "active" : ""} onClick={() => setAuthTab("login")}>Ya tengo cuenta</button></>}</div>
        {view === "doctor" ? <form onSubmit={submitDoctor}>{doctorTab === "register" && <div className="two-fields"><label>Nombre(s)<input name="name" required /></label><label>Apellidos<input required /></label></div>}{doctorTab === "register" && <><label>Cédula profesional<input name="license" inputMode="numeric" pattern="[0-9]{7,8}" required placeholder="7 u 8 dígitos" /></label><label>Especialidad<select name="specialty"><option>Medicina general</option><option>Oncología</option><option>Medicina interna</option><option>Pediatría</option></select></label></>}<label>Correo electrónico<input name="email" type="email" defaultValue={doctorTab === "login" ? "dra.garcia@onepharmacy.mx" : ""} required /></label><label>Contraseña<input type="password" defaultValue={doctorTab === "login" ? "demo1234" : ""} minLength={8} required /></label><button className="primary submit">{doctorTab === "login" ? "Entrar con cuenta demo" : "Verificar cédula y crear cuenta"}</button></form> : <form onSubmit={submitPatient}>{authTab === "register" && <div className="two-fields"><label>Nombre(s)<input name="name" required /></label><label>Apellidos<input required /></label></div>}{authTab === "register" && <label>Teléfono celular<input type="tel" inputMode="tel" minLength={10} required /></label>}<label>Correo electrónico<input name="email" type="email" defaultValue={authTab === "login" ? "maria@onepharmacy.mx" : ""} required /></label><label>Contraseña<input type="password" defaultValue={authTab === "login" ? "demo1234" : ""} minLength={8} required /></label><button className="primary submit">{authTab === "login" ? "Entrar con cuenta demo" : "Crear cuenta y obtener mi tarjeta"}</button></form>}
      </div></section>
    </main>}

    {view === "checkout" && <main className="checkout page-width"><button className="back-link dark" onClick={() => setCartOpen(true)}><ChevronLeft size={17} /> Volver al carrito</button><div className="checkout-grid"><section><span className="eyebrow">Último paso</span><h1>Finalizar compra</h1><p>Recoges tu pedido en {selectedBranch.name}, {selectedBranch.location}.</p><form id="payment-form" onSubmit={placeOrder}><h3>¿Cómo quieres pagar?</h3><div className="payment-options"><button type="button" className={pay === "card" ? "active" : ""} onClick={() => setPay("card")}><CreditCard /><b>Tarjeta en línea</b><span>Paga ahora y solo pasa a recoger.</span></button><button type="button" className={pay === "cash" ? "active" : ""} onClick={() => setPay("cash")}><Store /><b>Pagar en caja</b><span>Generamos tu número de pedido.</span></button></div>{pay === "card" && <div className="card-fields"><label>Nombre en la tarjeta<input required /></label><label>Número de tarjeta<input required inputMode="numeric" defaultValue="4242 4242 4242 4242" /></label><div className="two-fields"><label>Vencimiento<input required defaultValue="12/29" /></label><label>CVV<input required inputMode="numeric" defaultValue="123" /></label></div></div>}</form></section><aside className="order-summary"><span className="summary-icon"><ShoppingBag /></span><h2>Tu pedido</h2>{Object.entries(cart).map(([id, quantity]) => { const product = products.find((item) => item.id === Number(id))!; return <div className="summary-line" key={id}><span>{quantity}× {product.name}</span><b>{money(unitPrice(Number(id)) * quantity)}</b></div>})}{saving > 0 && <div className="summary-line discount"><span>Descuento médico</span><b>−{money(saving)}</b></div>}{user && redeemValue > 0 && <div className="redeem"><input id="redeem-points" type="checkbox" checked={redeem} onChange={(event) => setRedeem(event.target.checked)} /><label htmlFor="redeem-points"><b>Usar mis puntos</b><small>{user.points} puntos disponibles · ahorra {money(redeemValue)}</small></label></div>}<div className="summary-total"><span>Total</span><b>{money(Math.max(total - (redeem ? redeemValue : 0), 0))}</b></div><button form="payment-form" className="primary submit">{pay === "card" ? "Pagar ahora" : "Generar número de pedido"} <ArrowRight size={17} /></button><small className="secure-note"><ShieldCheck size={14} /> Compra segura · Datos protegidos · Recoge hoy</small></aside></div></main>}

    {view === "order" && lastOrder && <motion.main className="success page-width" initial={{ opacity: 0, scale: .97 }} animate={{ opacity: 1, scale: 1 }}><div className="success-mark"><Check /></div><span className="eyebrow">{lastOrder.method === "card" ? "Pago aprobado" : "Pedido generado"}</span><h1>{lastOrder.method === "card" ? "Tu pedido está confirmado." : "Paga al recoger en sucursal."}</h1><p className="order-number">{lastOrder.number}</p><div className="receipt"><div><span>Sucursal</span><b>{lastOrder.branch}</b></div><div><span>Total</span><b>{money(lastOrder.total)}</b></div><div><span>Puntos ganados</span><b>+{lastOrder.points}</b></div></div><div className="hero-actions center"><button className="primary" onClick={() => navigate("account")}>Ver mi cuenta y puntos</button><button className="secondary" onClick={() => navigate("catalog")}>Seguir comprando</button></div></motion.main>}

    {view === "account" && user && <main className="account page-width"><div className="account-heading"><div><span className="eyebrow">Mi cuenta</span><h1>Hola, {user.name}</h1><p>{doctor ? `Médico verificado · Cédula ${user.license}` : user.email}</p></div><button className="text-action danger" onClick={logout}><LogOut size={16} /> Cerrar sesión</button></div><div className="account-grid"><motion.section className={`loyalty-card ${doctor ? "medical" : ""}`} whileHover={{ rotateX: 2, rotateY: -2 }}><Logo /><span>{doctor ? "One Médico" : "One Lealtad"}</span><strong>{user.points}</strong><small>puntos disponibles</small><div><b>{user.name} {user.last}</b><span>{user.card}</span></div></motion.section><section className="benefits"><h2>Beneficios de tu tarjeta</h2>{(doctor ? ["10% permanente en todo el catálogo.", "Facturación automática de tus compras.", "Atención prioritaria en mostrador."] : ["1 punto por cada $10 MXN.", "Cada 100 puntos = $50 de descuento.", "Promociones exclusivas de tu sucursal."]).map((item) => <p key={item}><Check size={17} /> <span>{item}</span></p>)}</section></div><section className="orders"><h2>Mis pedidos</h2>{orders.length ? orders.map((order) => <article key={order.number}><div><b>{order.number}</b><span>{order.branch} · {order.date}</span></div><strong>{money(order.total)}</strong><em>{order.method === "card" ? "Pagado" : "Pagar en caja"}</em></article>) : <div className="empty-state"><ShoppingBag /><b>Aún no tienes pedidos</b><p>Tu primera compra ya suma puntos.</p></div>}</section></main>}

    {view === "adminLogin" && <main className="admin-login"><div className="form-card"><span className="eyebrow">Operación One Pharmacy</span><h1>Portal de sucursales</h1><p>Cada gerencia administra precios y métricas de su sucursal. Dirección consulta el consolidado.</p><div className="demo-accounts">{branches.map((item) => <button key={item.id} onClick={() => { setAdminBranch(item.id); navigate("admin"); }}>{item.name}<span>Entrar →</span></button>)}<button className="corp-button" onClick={() => navigate("corp")}>Dirección General<span>Ver grupo →</span></button></div></div></main>}

    {view === "admin" && adminBranch && <AdminDashboard branchId={adminBranch} notify={notify} />}
    {view === "corp" && <CorporateDashboard />}

    {shoppingView && <footer><Logo compact /><p>© 2026 One Pharmacy · Puebla y Tlaxcala</p><button onClick={() => navigate("adminLogin")}>Portal de sucursales →</button></footer>}

    <Dialog.Root open={cartOpen} onOpenChange={setCartOpen}>
      <AnimatePresence>
        {cartOpen && <Dialog.Portal forceMount><Dialog.Overlay className="cart-overlay" /><Dialog.Content className="cart-drawer" aria-describedby={undefined}><header><div><span className="eyebrow">Tu selección</span><Dialog.Title>Tu carrito <em>({cartCount})</em></Dialog.Title></div><Dialog.Close aria-label="Cerrar"><X /></Dialog.Close></header><div className="cart-items">{cartCount ? Object.entries(cart).map(([id, quantity]) => { const product = products.find((item) => item.id === Number(id))!; return <article key={id}><div className="cart-product-icon"><Pill /></div><div><b>{product.name}</b><span>{money(unitPrice(Number(id)))} c/u</span></div><div className="quantity"><button onClick={() => changeQuantity(Number(id), -1)} aria-label={`Quitar una unidad de ${product.name}`}><Minus /></button><b>{quantity}</b><button onClick={() => changeQuantity(Number(id), 1)} aria-label={`Agregar una unidad de ${product.name}`}><Plus /></button></div></article>}) : <div className="empty-cart"><span><ShoppingBag /></span><h3>Tu carrito está vacío</h3><p>Explora el catálogo y agrega lo que necesitas.</p><Dialog.Close asChild><button className="secondary" onClick={() => navigate("catalog")}>Ver catálogo</button></Dialog.Close></div>}</div><div className="cart-footer">{saving > 0 && <div className="summary-line discount"><span>Ahorro médico</span><b>−{money(saving)}</b></div>}<div className="summary-total"><span>Total</span><b>{money(total)}</b></div><button className="primary submit" disabled={!cartCount} onClick={() => { if (!user) navigate("auth"); else navigate("checkout"); }}>{user ? "Continuar al pago" : "Iniciar sesión para comprar"} <ArrowRight size={17} /></button><small><ShieldCheck size={14} /> Pago y datos protegidos</small></div></Dialog.Content></Dialog.Portal>}
      </AnimatePresence>
    </Dialog.Root>
    <Toaster position="bottom-center" richColors closeButton toastOptions={{ duration: 2600 }} />
  </div>;
}

function AdminDashboard({ branchId, notify }: { branchId: BranchId; notify: (message: string) => void }) {
  const branch = branches.find((item) => item.id === branchId)!;
  const data = metrics[branchId];
  const [edits, setEdits] = useState<Record<number, string>>({});
  const weeklySales = data.weeks.map((value, index) => ({ week: `S${index + 1}`, value }));
  const kpis = [
    { label: "Ventas del mes", value: money(data.sales), icon: BarChart3 },
    { label: "Pedidos", value: data.orders.toLocaleString("es-MX"), icon: ReceiptText },
    { label: "Tasa de recompra", value: `${data.repeat}%`, icon: UserRound },
    { label: "Nivel de surtido", value: `${data.stock}%`, icon: PackageCheck },
  ];
  return <main className="dashboard page-width">
    <span className="eyebrow">Gerencia · {branch.location}</span><h1>Sucursal {branch.name}</h1><p>Resultados del mes y precios locales. Esta cuenta no tiene acceso a otras sucursales.</p>
    <div className="kpi-grid">{kpis.map(({ label, value, icon: Icon }) => <motion.article key={label} whileHover={{ y: -4 }}><Icon /><span>{label}</span><b>{value}</b></motion.article>)}</div>
    <section className="chart-panel"><div><span className="panel-icon"><BarChart3 /></span><h2>Ventas de las últimas 8 semanas</h2><p>Miles de MXN por semana.</p></div><div className="chart-canvas"><WeeklySalesChart data={weeklySales} gradientId={`sales-${branchId}`} /></div></section>
    <section className="price-admin"><div><span className="panel-icon"><Store /></span><h2>Precios de mi sucursal</h2><p>Los cambios se reflejan en la tienda local.</p></div><div className="price-list">{products.slice(0, 9).map((product) => <label key={product.id}><span><b>{product.name}</b><small>{product.cat}</small></span><i>$</i><input type="number" value={edits[product.id] ?? product.prices[branchId]} onChange={(event) => setEdits((current) => ({ ...current, [product.id]: event.target.value }))} /></label>)}</div><div className="admin-actions"><button className="secondary" onClick={() => setEdits({})}>Descartar</button><button className="primary" onClick={() => { setEdits({}); notify("Precios actualizados en esta demostración"); }}>Guardar cambios</button></div></section>
  </main>;
}

function CorporateDashboard() {
  const totalSales = Object.values(metrics).reduce((sum, item) => sum + item.sales, 0);
  const totalOrders = Object.values(metrics).reduce((sum, item) => sum + item.orders, 0);
  const branchSales = branches.map((branch) => ({ name: branch.name, sales: metrics[branch.id].sales }));
  const kpis = [
    { label: "Venta total del grupo", value: money(totalSales), icon: BarChart3 },
    { label: "Pedidos totales", value: totalOrders.toLocaleString("es-MX"), icon: ReceiptText },
    { label: "Ticket promedio", value: money(totalSales / totalOrders), icon: CreditCard },
    { label: "Sucursal líder", value: "Palmas Plaza", icon: Building2 },
  ];
  return <main className="dashboard page-width"><span className="eyebrow">Consolidado · Mes en curso</span><h1>Dirección General</h1><p>Indicadores comparables de las cuatro sucursales del grupo.</p><div className="kpi-grid">{kpis.map(({ label, value, icon: Icon }) => <motion.article key={label} whileHover={{ y: -4 }}><Icon /><span>{label}</span><b>{value}</b></motion.article>)}</div><section className="corp-chart"><div><span className="panel-icon"><Building2 /></span><h2>Ventas del mes por sucursal</h2></div><div className="chart-canvas"><BranchSalesChart data={branchSales} /></div></section><section className="corp-table"><h2>Comparativo por sucursal</h2><div className="table-scroll"><table><thead><tr><th>Sucursal</th><th>Ventas</th><th>Pedidos</th><th>Ticket prom.</th><th>Recompra</th><th>Crecimiento</th><th>Producto top</th></tr></thead><tbody>{branches.map((branch) => { const item = metrics[branch.id]; return <tr key={branch.id}><td><b>{branch.name}</b><small>{branch.location}</small></td><td>{money(item.sales)}</td><td>{item.orders.toLocaleString("es-MX")}</td><td>{money(item.ticket)}</td><td>{item.repeat}%</td><td className={item.growth >= 0 ? "positive" : "negative"}>{item.growth >= 0 ? "+" : ""}{item.growth}%</td><td>{item.top}</td></tr>})}</tbody></table></div></section></main>;
}
