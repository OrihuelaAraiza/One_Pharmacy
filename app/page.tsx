"use client";
/* eslint-disable jsx-a11y/label-has-associated-control -- Checkbox labels wrap their controls and styled copy. */

import { FormEvent, type PointerEvent, type ReactNode, useEffect, useMemo, useState } from "react";
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
  ChevronDown,
  Clock3,
  CreditCard,
  CircleCheck,
  Heart,
  HeartPulse,
  House,
  LogOut,
  MapPin,
  Minus,
  PackagePlus,
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
  Trash2,
  UserRound,
  UserCog,
  X,
  type LucideIcon,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { Toaster, toast as showToast } from "sonner";

type View = "home" | "catalog" | "auth" | "doctor" | "checkout" | "order" | "account" | "adminLogin" | "admin" | "corp";
type BranchId = "analco" | "palmas" | "mirador" | "apizaco";
type User = { name: string; last: string; email: string; type: "patient" | "doctor"; points: number; card: string; license?: string; specialty?: string };
type Order = { number: string; total: number; points: number; branch: string; method: "card" | "cash"; date: string; status?: "confirmed" | "preparing" | "ready"; pickupCode?: string; items?: number };
type Product = { id: number; name: string; desc: string; cat: string; rx: boolean; active: boolean; prices: Record<BranchId, number>; stock: Record<BranchId, number> };

const branches: { id: BranchId; name: string; location: string; featured?: boolean }[] = [
  { id: "analco", name: "Analco", location: "Puebla", featured: true },
  { id: "palmas", name: "Palmas Plaza", location: "Puebla" },
  { id: "mirador", name: "El Mirador", location: "Puebla" },
  { id: "apizaco", name: "Apizaco", location: "Tlaxcala" },
];

const initialProducts: Product[] = [
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
].map((product, index) => ({
  ...product,
  active: true,
  stock: {
    analco: 12 + (index * 7) % 31,
    palmas: 9 + (index * 5) % 27,
    mirador: 8 + (index * 3) % 24,
    apizaco: 6 + (index * 4) % 22,
  },
}));

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

function loadStoredState(): { branch?: BranchId; cart?: Record<number, number>; user?: User; orders?: Order[]; favorites?: number[]; products?: Product[]; branchStatus?: Record<BranchId, boolean> } {
  if (typeof window === "undefined") return {};
  try { return JSON.parse(window.localStorage.getItem("one-pharmacy-state") || "{}"); }
  catch { return {}; }
}

function Logo({ compact = false }: { compact?: boolean }) {
  return <span className={`logo ${compact ? "logo-compact" : ""}`}><svg viewBox="0 0 50 64" aria-hidden="true"><path className="logo-mint" d="M14 0h10v29H0V14C0 6.3 6.3 0 14 0Z" /><path className="logo-mint" d="M0 35h24v15c0 7.7-6.3 14-14 14H0V35Z" /><path className="logo-blue-gray" d="M27 0h9c7.7 0 14 6.3 14 14H27V0Z" /><path className="logo-navy" d="M27 17h23c0 6.6-5.4 12-12 12H27V17Z" /></svg><span className="logo-words"><strong>One</strong><b>Pharmacy</b></span></span>;
}

function PillLoader({ label = "Preparando tu experiencia" }: { label?: string }) {
  return <motion.div className="pill-loader" role="status" aria-live="polite" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
    <div className="pill-loader-mark" aria-hidden="true"><svg viewBox="0 0 100 100"><circle cx="50" cy="50" r="18" fill="#5DA895" /><rect x="42" y="32" width="8" height="36" fill="#1B2388" /></svg><i /></div>
    <Logo compact /><p>{label}</p><span>ONE CARE · ONE PLACE</span>
  </motion.div>;
}

const reveal = {
  hidden: { opacity: 0, y: 22 },
  visible: { opacity: 1, y: 0 },
};

const serviceHighlights = [
  [Store, "Inventario por sucursal"],
  [Clock3, "Recoge el mismo día"],
  [ShieldCheck, "Pago protegido"],
  [Stethoscope, "Programa One Médico"],
  [BadgePercent, "1 punto por cada $10"],
] as const;

function BrandMarquee() {
  return <div className="brand-marquee" aria-label="Beneficios de One Pharmacy"><div className="marquee-track">{[...serviceHighlights, ...serviceHighlights].map(([Icon, label], index) => <span key={`${label}-${index}`} aria-hidden={index >= serviceHighlights.length}><Icon /> {label}<i /></span>)}</div></div>;
}

function SpotlightCard({ className = "", children }: { className?: string; children: ReactNode }) {
  const moveSpotlight = (event: PointerEvent<HTMLElement>) => {
    const bounds = event.currentTarget.getBoundingClientRect();
    event.currentTarget.style.setProperty("--spotlight-x", `${event.clientX - bounds.left}px`);
    event.currentTarget.style.setProperty("--spotlight-y", `${event.clientY - bounds.top}px`);
  };
  return <article className={`spotlight-card ${className}`} onPointerMove={moveSpotlight}>{children}</article>;
}

const patientBenefits = [
  { icon: BadgePercent, title: "Puntos que sí rinden", copy: "1 punto por cada $10 y $50 por cada 100 puntos." },
  { icon: Store, title: "Promociones locales", copy: "Beneficios disponibles en tu sucursal seleccionada." },
  { icon: Clock3, title: "Recolección simple", copy: "Consulta tus pedidos y recoge sin volver a formarte." },
];

const professionalBenefits = [
  { icon: BadgePercent, title: "10% permanente", copy: "Se aplica automáticamente en todo el catálogo." },
  { icon: ReceiptText, title: "Facturación ágil", copy: "Tus datos profesionales quedan listos para cada compra." },
  { icon: Store, title: "Atención prioritaria", copy: "Identificación inmediata al recoger en mostrador." },
];

function MembershipCard({ user, doctor }: { user: User; doctor: boolean }) {
  const progress = user.points % 100;
  const rewardValue = Math.floor(user.points / 100) * 50;
  return <motion.section className={`membership-card ${doctor ? "professional" : "patient"}`} whileHover={{ y: -5, rotateX: 1.5, rotateY: -1.5 }} transition={{ type: "spring", stiffness: 220, damping: 18 }}>
    <i className="membership-orbit" aria-hidden="true" />
    <header><Logo compact /><span className="verified-chip"><ShieldCheck /> {doctor ? "Cédula verificada" : "Cuenta activa"}</span></header>
    <div className="member-identity"><small>{doctor ? "Credencial profesional" : "Tarjeta de beneficios"}</small><h2>{doctor ? `Dra. ${user.name} ${user.last}` : `${user.name} ${user.last}`}</h2><p>{doctor ? user.specialty : "Miembro One Lealtad"}</p></div>
    <div className="membership-balance"><div><span>Saldo disponible</span><strong>{user.points}<small> pts</small></strong></div><div><span>Valor acumulado</span><b>{money(rewardValue)}</b></div></div>
    <div className="membership-progress"><div><span>Próxima recompensa</span><b>{100 - progress} pts por sumar</b></div><i><b style={{ width: `${progress}%` }} /></i></div>
    <div className="membership-footer"><span>{doctor ? `Cédula ${user.license}` : user.card}</span><span>ONE · {doctor ? "MED" : "LTL"}</span></div>
  </motion.section>;
}

function BenefitsPanel({ doctor, onCatalog }: { doctor: boolean; onCatalog: () => void }) {
  const benefits = doctor ? professionalBenefits : patientBenefits;
  return <section className={`benefits benefits-panel ${doctor ? "medical-benefits" : ""}`}><header><div><span className="eyebrow">{doctor ? "Programa One Médico" : "Tu membresía"}</span><h2>Beneficios activos</h2></div><span className="benefit-count">03</span></header><div className="benefit-list">{benefits.map(({ icon: Icon, title, copy }) => <article key={title}><i><Icon /></i><div><b>{title}</b><p>{copy}</p></div><CircleCheck /></article>)}</div><button className="benefits-action" onClick={onCatalog}>Usar mis beneficios <ArrowRight /></button></section>;
}

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
  const [favorites, setFavorites] = useState<number[]>(initialState.favorites || []);
  const [lastOrder, setLastOrder] = useState<Order | null>(null);
  const [authTab, setAuthTab] = useState<"register" | "login">("register");
  const [doctorTab, setDoctorTab] = useState<"login" | "register">("login");
  const [pay, setPay] = useState<"card" | "cash">("card");
  const [redeem, setRedeem] = useState(false);
  const [adminBranch, setAdminBranch] = useState<BranchId | null>(null);
  const [catalogProducts, setCatalogProducts] = useState<Product[]>(initialState.products || initialProducts);
  const [branchStatus, setBranchStatus] = useState<Record<BranchId, boolean>>(initialState.branchStatus || { analco: true, palmas: true, mirador: true, apizaco: true });
  const [branchMenuOpen, setBranchMenuOpen] = useState(false);
  const [appLoading, setAppLoading] = useState(true);
  const [orderProcessing, setOrderProcessing] = useState(false);
  const [checkoutError, setCheckoutError] = useState("");

  useEffect(() => {
    window.localStorage.setItem("one-pharmacy-state", JSON.stringify({ branch, cart, user, orders, favorites, products: catalogProducts, branchStatus }));
  }, [branch, cart, user, orders, favorites, catalogProducts, branchStatus]);

  useEffect(() => {
    const timer = window.setTimeout(() => setAppLoading(false), 500);
    return () => window.clearTimeout(timer);
  }, []);

  const notify = (message: string) => {
    showToast(message);
  };
  const navigate = (next: View) => { setView(next); setCartOpen(false); window.scrollTo({ top: 0, behavior: "smooth" }); };
  const selectedBranch = branches.find((item) => item.id === branch)!;
  const doctor = user?.type === "doctor";
  const visibleProducts = useMemo(() => catalogProducts.filter((product) => product.active &&
    (category === "Todos" || product.cat === category) && `${product.name} ${product.desc}`.toLowerCase().includes(query.toLowerCase())
  ), [catalogProducts, category, query]);
  const unitPrice = (id: number) => {
    const product = catalogProducts.find((item) => item.id === id)!;
    const base = product.prices[branch];
    return doctor ? base * .9 : base;
  };
  const cartCount = Object.values(cart).reduce((sum, quantity) => sum + quantity, 0);
  const total = Object.entries(cart).reduce((sum, [id, quantity]) => sum + unitPrice(Number(id)) * quantity, 0);
  const saving = doctor ? total / .9 - total : 0;
  const redeemValue = user ? Math.min(Math.floor(user.points / 100) * 50, total) : 0;

  const addToCart = (id: number) => {
    const product = catalogProducts.find((item) => item.id === id);
    if (!product || !product.active || product.stock[branch] <= (cart[id] || 0)) return notify("No hay más unidades disponibles en esta sucursal");
    setCart((current) => ({ ...current, [id]: (current[id] || 0) + 1 }));
    notify("Producto agregado al carrito");
  };
  const toggleFavorite = (id: number) => {
    setFavorites((current) => current.includes(id) ? current.filter((item) => item !== id) : [...current, id]);
  };
  const changeQuantity = (id: number, delta: number) => setCart((current) => {
    const available = catalogProducts.find((item) => item.id === id)?.stock[branch] || 0;
    if (delta > 0 && (current[id] || 0) >= available) { notify("Alcanzaste el inventario disponible"); return current; }
    const next = { ...current, [id]: (current[id] || 0) + delta };
    if (next[id] <= 0) delete next[id];
    return next;
  });
  const changeBranch = (next: BranchId) => {
    if (next === branch) return;
    if (!branchStatus[next]) return notify("Esta sucursal no está recibiendo pedidos por el momento");
    if (cartCount && !window.confirm("Cambiar de sucursal vaciará tu carrito porque cambian precios e inventario. ¿Deseas continuar?")) return;
    setBranch(next);
    setBranchMenuOpen(false);
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
    const last = String(data.get("last") || "Hernández Ríos");
    afterLogin({ name, last, email: String(data.get("email") || "maria@onepharmacy.mx"), type: "patient", points: authTab === "login" ? 185 : 0, card: "•••• 4128" }, authTab === "login" ? [{ number: "OP-P-3021", total: 214, points: 21, branch: "Palmas Plaza", method: "card", date: "12 jul, 11:24" }] : []);
  };
  const submitDoctor = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    afterLogin({ name: String(data.get("name") || "Ana"), last: String(data.get("last") || "García López"), email: String(data.get("email") || "dra.garcia@onepharmacy.mx"), type: "doctor", points: 320, card: "•••• 9034", license: String(data.get("license") || "87654321"), specialty: String(data.get("specialty") || "Medicina general") });
  };
  const placeOrder = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setCheckoutError("");
    if (!user) { navigate("auth"); return notify("Inicia sesión para validar tu compra"); }
    if (!cartCount) return notify("Tu carrito está vacío");
    if (!branchStatus[branch]) { setCheckoutError("La sucursal seleccionada no está disponible."); return; }
    const invalidStock = Object.entries(cart).find(([id, quantity]) => {
      const product = catalogProducts.find((item) => item.id === Number(id));
      return !product?.active || quantity > (product?.stock[branch] || 0);
    });
    if (invalidStock) { setCheckoutError("El inventario cambió. Revisa las cantidades antes de continuar."); return; }
    const form = new FormData(event.currentTarget);
    const requiresPrescription = Object.keys(cart).some((id) => catalogProducts.find((item) => item.id === Number(id))?.rx);
    if (requiresPrescription && form.get("rx-confirm") !== "on") { setCheckoutError("Confirma que presentarás la receta vigente al recoger."); return; }
    setOrderProcessing(true);
    await new Promise((resolve) => window.setTimeout(resolve, 1150));
    const charged = Math.max(total - (redeem ? redeemValue : 0), 0);
    const earned = Math.floor(charged / 10);
    const order: Order = { number: `OP-${doctor ? "M" : "P"}-${Math.floor(1000 + Math.random() * 9000)}`, total: charged, points: earned, branch: selectedBranch.name, method: pay, date: new Date().toLocaleString("es-MX", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" }), status: "confirmed", pickupCode: String(Math.floor(100000 + Math.random() * 900000)), items: cartCount };
    setLastOrder(order); setOrders((current) => [order, ...current]); setCart({});
    setCatalogProducts((current) => current.map((product) => cart[product.id] ? { ...product, stock: { ...product.stock, [branch]: product.stock[branch] - cart[product.id] } } : product));
    setUser((current) => current ? { ...current, points: current.points - (redeem ? Math.floor(current.points / 100) * 100 : 0) + earned } : current);
    setOrderProcessing(false);
    navigate("order");
  };

  const shoppingView = !["adminLogin", "admin", "corp"].includes(view);

  return <div className="app-shell">
    <AnimatePresence>{(appLoading || orderProcessing) && <PillLoader label={orderProcessing ? "Validando inventario y pedido" : "Preparando tu experiencia"} />}</AnimatePresence>
    <a className="skip-link" href="#main-content">Saltar al contenido</a>
    <header className="site-header">
      <button className="brand-button" onClick={() => navigate(shoppingView ? "home" : "adminLogin")} aria-label="Ir al inicio"><Logo compact /></button>
      {shoppingView ? <>
        <nav aria-label="Navegación principal">
          <button className={view === "home" ? "active" : ""} aria-current={view === "home" ? "page" : undefined} onClick={() => navigate("home")}>Inicio</button>
          <button className={view === "catalog" ? "active" : ""} aria-current={view === "catalog" ? "page" : undefined} onClick={() => navigate("catalog")}>Catálogo</button>
          <button className={view === "doctor" ? "active" : ""} aria-current={view === "doctor" ? "page" : undefined} onClick={() => navigate(user?.type === "doctor" ? "account" : "doctor")}>Médicos</button>
        </nav>
        <div className="header-actions">
          {doctor && <span className="doctor-chip"><Stethoscope size={14} /> Dra. {user.last.split(" ")[0]} · −10%</span>}
          <div className="branch-switcher"><button className="branch-picker" type="button" aria-haspopup="listbox" aria-expanded={branchMenuOpen} onClick={() => setBranchMenuOpen((open) => !open)}><MapPin size={16} aria-hidden="true" /><span><small>Recoge en</small><b>{selectedBranch.name}</b></span><ChevronDown size={15} /></button>{branchMenuOpen && <><button className="branch-menu-backdrop" aria-label="Cerrar selector" onClick={() => setBranchMenuOpen(false)} /><div className="branch-menu" role="listbox" aria-label="Seleccionar sucursal"><header><div><small>Tu sucursal</small><b>¿Dónde quieres recoger?</b></div><button onClick={() => setBranchMenuOpen(false)} aria-label="Cerrar"><X /></button></header>{branches.map((item) => { const available = branchStatus[item.id]; const itemCount = catalogProducts.filter((product) => product.active && product.stock[item.id] > 0).length; return <button key={item.id} role="option" aria-selected={branch === item.id} disabled={!available} className={branch === item.id ? "active" : ""} onClick={() => changeBranch(item.id)}><i><Store /></i><span><b>{item.name}</b><small>{item.location} · {available ? `${itemCount} productos disponibles` : "Temporalmente cerrada"}</small></span>{branch === item.id ? <CircleCheck /> : <ArrowRight />}</button>; })}<p>El precio y el inventario se actualizan según la sucursal.</p></div></>}</div>
          <button className="text-action account-action" onClick={() => navigate(user ? "account" : "auth")}><UserRound size={16} aria-hidden="true" />{user ? `Mi cuenta · ${user.points} pts` : "Iniciar sesión"}</button>
          <button className="cart-button" onClick={() => setCartOpen(true)}><ShoppingBag size={17} aria-hidden="true" /><span>Bolsa</span><b>{cartCount}</b></button>
        </div>
      </> : <div className="header-actions"><span className="admin-label">Portal de sucursales</span>{view !== "adminLogin" && <button className="text-action" onClick={() => { setAdminBranch(null); navigate("adminLogin"); }}>Cerrar sesión</button>}</div>}
    </header>

    <div id="main-content" tabIndex={-1}>

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
      <BrandMarquee />
      <section className="role-gateway page-width" aria-labelledby="role-title"><div><span className="eyebrow">Tres accesos · Una misma atención</span><h2 id="role-title">Tu experiencia cambia contigo.</h2></div><div className="role-cards"><button onClick={() => navigate(user?.type === "patient" ? "account" : "auth")}><span><UserRound /></span><small>01 · Pacientes</small><b>Compra, puntos y pedidos</b><ArrowRight /></button><button onClick={() => navigate(user?.type === "doctor" ? "account" : "doctor")}><span><Stethoscope /></span><small>02 · Médicos</small><b>Perfil profesional y −10%</b><ArrowRight /></button><button onClick={() => navigate("adminLogin")}><span><Building2 /></span><small>03 · Sucursales</small><b>Operación y catálogo</b><ArrowRight /></button></div></section>
      <motion.section className="category-section page-width" initial="hidden" whileInView="visible" viewport={{ once: true, amount: .2 }} variants={reveal} transition={{ duration: .55 }}>
        <span className="eyebrow">Compra por categoría</span><h2>Todo lo que necesitas durante el tratamiento, <em>en un solo lugar.</em></h2>
        <div className="category-grid">{categories.slice(1).map((item, index) => { const Icon = categoryIcons[item]; return <motion.button key={item} whileHover={{ y: -8 }} whileTap={{ scale: .98 }} onClick={() => { setCategory(item); navigate("catalog"); }}><i><Icon aria-hidden="true" /></i><small>0{index + 1}</small><span>{item}</span><b><ArrowRight size={18} /></b></motion.button>; })}</div>
      </motion.section>
      <motion.section className="experience-section page-width" initial="hidden" whileInView="visible" viewport={{ once: true, amount: .15 }} variants={reveal} transition={{ duration: .6 }}>
        <div className="section-heading"><div><span className="eyebrow">La experiencia One</span><h2>Más claridad para decidir, <em>más calma para cuidarte.</em></h2></div><p>Diseñamos cada paso alrededor de lo que importa: disponibilidad real, precios locales y acompañamiento cercano.</p></div>
        <div className="experience-bento">
          <SpotlightCard className="care-story">
            <Image src="/pharmacist-shelves-pexels.jpg" alt="Profesional de farmacia frente a un anaquel de medicamentos" fill sizes="(max-width: 720px) 100vw, 58vw" />
            <div className="care-overlay"><span className="eyebrow light">Atención especializada</span><h3>No somos una farmacia genérica.</h3><p>Un catálogo pensado para acompañar tratamientos y resolver necesidades cotidianas.</p><small>Fotografía: Ivan S · Pexels</small></div>
          </SpotlightCard>
          <SpotlightCard className="price-clarity">
            <span className="bento-icon"><MapPin /></span><small>Precio local transparente</small><h3>Elige dónde te conviene recoger.</h3>
            <div className="mini-price-list">{branches.slice(0, 3).map((item, index) => <div className={item.id === branch ? "active" : ""} key={item.id}><span><i />{item.name}</span><b>{money([349, 385, 362][index])}</b></div>)}</div>
          </SpotlightCard>
          <SpotlightCard className="loyalty-story">
            <div><Logo compact /><BadgePercent /></div><span>One Lealtad</span><strong>185</strong><small>puntos disponibles</small><div className="points-progress"><i /></div><p>15 puntos más y desbloqueas $100 para tu próxima compra.</p>
          </SpotlightCard>
          <SpotlightCard className="pickup-story">
            <span className="bento-icon"><PackageCheck /></span><small>Seguimiento claro</small><h3>Tu pedido, sin incertidumbre.</h3><div className="pickup-flow"><span className="done"><Check /> Confirmado</span><i /><span className="current"><Clock3 /> Preparando</span><i /><span><Store /> Listo para recoger</span></div>
          </SpotlightCard>
        </div>
      </motion.section>
      <section className="how-it-works"><div className="page-width"><span className="eyebrow light">Así de sencillo</span><h2>Tu pedido, listo cuando tú llegues.</h2><div className="steps">{[["01", "Elige tu sucursal", "Cada sucursal maneja sus precios e inventario."], ["02", "Compra y paga como prefieras", "Con tarjeta en línea o en caja al recoger."], ["03", "Recoge y gana puntos", "Te avisamos cuando esté listo y cada compra suma."]].map(([n, title, copy]) => <article key={n}><b>{n}</b><h3>{title}</h3><p>{copy}</p></article>)}</div></div></section>
      <section className="doctor-cta page-width"><div className="doctor-cta-copy"><span className="eyebrow">Programa profesional</span><h2>Una experiencia a la altura de tu práctica.</h2><p>Valida tu cédula una sola vez y accede a beneficios que permanecen activos en cada compra.</p><div className="doctor-cta-benefits"><span><BadgePercent /> 10% permanente</span><span><ReceiptText /> Facturación ágil</span><span><ShieldCheck /> Perfil verificado</span></div></div><div className="doctor-cta-pass"><span><Stethoscope /></span><small>One Médico</small><strong>Beneficios activos</strong><i><Check /> Cédula validada</i><button className="primary" onClick={() => navigate("doctor")}>Conocer el programa <ArrowRight size={17} /></button></div></section>
    </main>}

    {view === "catalog" && <main className="catalog page-width">
      <div className="catalog-heading"><div><span className="eyebrow">Compra local</span><h1>Sucursal {selectedBranch.name}</h1><p>{doctor ? "Tu descuento médico ya está aplicado. " : ""}Precios locales, inventario disponible y recolección el mismo día.</p></div><label className="search"><Search size={21} aria-hidden="true" /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Buscar medicamentos y productos" aria-label="Buscar productos" /></label></div>
      <div className="catalog-toolbar"><div className="category-tabs" role="group" aria-label="Filtrar por categoría">{categories.map((item) => <button className={category === item ? "active" : ""} aria-pressed={category === item} key={item} onClick={() => setCategory(item)}>{item}</button>)}</div><div className="catalog-results" aria-live="polite"><span><b>{visibleProducts.length}</b> {visibleProducts.length === 1 ? "resultado" : "resultados"}</span>{(category !== "Todos" || query) && <button onClick={() => { setCategory("Todos"); setQuery(""); }}><X /> Limpiar filtros</button>}</div></div>
      <div className="catalog-service-banner"><div><span className="banner-icon"><Store /></span><p><small>Recolecta hoy</small><b>{selectedBranch.name}, {selectedBranch.location}</b></p></div><span><CircleCheck /> Inventario de esta sucursal</span>{doctor ? <strong><Stethoscope /> 10% médico aplicado</strong> : <button onClick={() => navigate("doctor")}>Activa precio médico <ArrowRight /></button>}</div>
      {visibleProducts.length ? <motion.div layout className="product-grid">{visibleProducts.map((product) => { const base = product.prices[branch]; const price = doctor ? base * .9 : base; const ProductIcon = categoryIcons[product.cat] || Pill; const favorite = favorites.includes(product.id); const stock = product.stock[branch]; return <motion.article layout className={`product-card ${stock ? "" : "out-of-stock"}`} key={product.id} initial={{ opacity: 0, scale: .98 }} animate={{ opacity: 1, scale: 1 }} whileHover={{ y: stock ? -6 : 0 }}><div className={`product-art art-${(product.id % 5) + 1}`}><button className={`favorite-button ${favorite ? "active" : ""}`} onClick={() => toggleFavorite(product.id)} aria-label={`${favorite ? "Quitar" : "Agregar"} ${product.name} ${favorite ? "de" : "a"} favoritos`}><Heart fill={favorite ? "currentColor" : "none"} /></button><span className={`availability ${stock ? "" : "unavailable"}`}>{stock ? <><CircleCheck /> {stock <= 5 ? `Últimas ${stock}` : "Disponible hoy"}</> : <><Clock3 /> Agotado</>}</span><span className="product-orbit" /><ProductIcon aria-hidden="true" />{product.rx && <b>Requiere receta</b>}</div><div className="product-content"><small>{product.cat}</small><h3>{product.name}</h3><p>{product.desc}</p><div className="product-branch"><MapPin /> {selectedBranch.name} · {stock ? "recolección hoy" : "sin existencias"}</div>{product.rx && <span className="rx-note"><ReceiptText size={13} /> Presenta tu receta al recoger</span>}<div className="price-row"><div><strong>{money(price)}</strong>{doctor && <del>{money(base)}</del>}</div><motion.button whileTap={{ scale: stock ? .92 : 1 }} disabled={!stock} onClick={() => addToCart(product.id)} aria-label={`Agregar ${product.name}`}>{stock ? "Agregar" : "Agotado"} {stock ? <Plus size={16} /> : null}</motion.button></div></div></motion.article>})}</motion.div> : <div className="empty-state"><Search size={28} /><b>Sin resultados</b><p>No encontramos productos con esos filtros.</p><button className="secondary" onClick={() => { setCategory("Todos"); setQuery(""); }}>Restablecer búsqueda</button></div>}
      <p className="catalog-note">Precios en MXN, IVA incluido. Los productos ℞ requieren receta al recoger en sucursal.</p>
    </main>}

    {(view === "auth" || view === "doctor") && <main className="auth-layout">
      <section className={`auth-story ${view === "doctor" ? "doctor-story" : ""}`}><button className="back-link" onClick={() => navigate("home")}><ChevronLeft size={17} /> Volver al inicio</button><div><Logo /><span className="eyebrow light">{view === "doctor" ? "Profesionales de la salud" : "One Lealtad"}</span><h1>{view === "doctor" ? "Tu práctica, reconocida en cada compra." : "Tu salud también te recompensa."}</h1><p>{view === "doctor" ? "Una cuenta profesional con precio preferencial, facturación simplificada e identificación prioritaria en sucursal." : "Compra, acumula puntos y recibe promociones exclusivas de tu sucursal."}</p>{view === "doctor" && <div className="doctor-story-benefits">{professionalBenefits.map(({ icon: Icon, title, copy }) => <article key={title}><Icon /><div><b>{title}</b><span>{copy}</span></div></article>)}</div>}</div>{view === "doctor" && <span className="doctor-security"><ShieldCheck /> Validación segura de cédula profesional</span>}</section>
      <section className="auth-panel"><div className="form-card"><span className="eyebrow">{view === "doctor" ? "Portal médico" : "Cuenta de paciente"}</span><h2>{view === "doctor" ? "Bienvenido, doctor" : "Crea tu cuenta"}</h2><p>{view === "doctor" ? "10% permanente en todo el catálogo." : "Obtén tu tarjeta One Lealtad desde tu primera compra."}</p>
        <div className="segmented">{view === "doctor" ? <><button className={doctorTab === "login" ? "active" : ""} onClick={() => setDoctorTab("login")}>Iniciar sesión</button><button className={doctorTab === "register" ? "active" : ""} onClick={() => setDoctorTab("register")}>Registrarme</button></> : <><button className={authTab === "register" ? "active" : ""} onClick={() => setAuthTab("register")}>Crear cuenta</button><button className={authTab === "login" ? "active" : ""} onClick={() => setAuthTab("login")}>Ya tengo cuenta</button></>}</div>
        {view === "doctor" ? <form onSubmit={submitDoctor}>{doctorTab === "register" && <div className="two-fields"><label>Nombre(s)<input name="name" autoComplete="given-name" required /></label><label>Apellidos<input name="last" autoComplete="family-name" required /></label></div>}{doctorTab === "register" && <><label>Cédula profesional<input name="license" inputMode="numeric" pattern="[0-9]{7,8}" required placeholder="7 u 8 dígitos" /></label><label>Especialidad<select name="specialty"><option>Medicina general</option><option>Oncología</option><option>Medicina interna</option><option>Pediatría</option></select></label></>}<label>Correo electrónico<input name="email" type="email" autoComplete="email" defaultValue={doctorTab === "login" ? "dra.garcia@onepharmacy.mx" : ""} required /></label><label>Contraseña<input name="password" type="password" autoComplete={doctorTab === "login" ? "current-password" : "new-password"} defaultValue={doctorTab === "login" ? "demo1234" : ""} minLength={8} required /></label><button className="primary submit">{doctorTab === "login" ? "Entrar a mi cuenta profesional" : "Verificar cédula y crear cuenta"}</button><div className="professional-assurance"><ShieldCheck /><span><b>Acceso profesional protegido</b><small>Tus datos se usan únicamente para validar y operar tu cuenta.</small></span></div></form> : <form onSubmit={submitPatient}>{authTab === "register" && <div className="two-fields"><label>Nombre(s)<input name="name" autoComplete="given-name" required /></label><label>Apellidos<input name="last" autoComplete="family-name" required /></label></div>}{authTab === "register" && <label>Teléfono celular<input name="phone" type="tel" autoComplete="tel" inputMode="tel" minLength={10} required /></label>}<label>Correo electrónico<input name="email" type="email" autoComplete="email" defaultValue={authTab === "login" ? "maria@onepharmacy.mx" : ""} required /></label><label>Contraseña<input name="password" type="password" autoComplete={authTab === "login" ? "current-password" : "new-password"} defaultValue={authTab === "login" ? "demo1234" : ""} minLength={8} required /></label><button className="primary submit">{authTab === "login" ? "Entrar con cuenta demo" : "Crear cuenta y obtener mi tarjeta"}</button></form>}
      </div></section>
    </main>}

    {view === "checkout" && <main className="checkout page-width"><button className="back-link dark" onClick={() => setCartOpen(true)}><ChevronLeft size={17} /> Volver al carrito</button><div className="checkout-grid"><section><span className="eyebrow">Pedido protegido</span><h1>Revisar y confirmar</h1><p>Recoges en {selectedBranch.name}, {selectedBranch.location}. Validaremos inventario antes de generar el pedido.</p><div className="checkout-checks"><span><CircleCheck /> Sesión verificada</span><span><CircleCheck /> Sucursal seleccionada</span><span><CircleCheck /> Inventario reservado al confirmar</span></div><form id="payment-form" onSubmit={placeOrder}><h3>Datos de contacto</h3><div className="two-fields"><label>Persona que recoge<input name="pickup-name" defaultValue={user ? `${user.name} ${user.last}` : ""} required /></label><label>Teléfono<input name="phone" type="tel" inputMode="tel" minLength={10} placeholder="10 dígitos" required /></label></div><h3>¿Cómo quieres pagar?</h3><div className="payment-options"><button type="button" className={pay === "card" ? "active" : ""} onClick={() => setPay("card")}><CreditCard /><b>Tarjeta en línea</b><span>Paga ahora y solo pasa a recoger.</span></button><button type="button" className={pay === "cash" ? "active" : ""} onClick={() => setPay("cash")}><Store /><b>Pagar en caja</b><span>Generamos tu número de pedido.</span></button></div>{pay === "card" && <div className="card-fields"><label>Nombre en la tarjeta<input required /></label><label>Número de tarjeta<input required inputMode="numeric" pattern="[0-9 ]{15,19}" defaultValue="4242 4242 4242 4242" /></label><div className="two-fields"><label>Vencimiento<input required pattern="[0-9]{2}/[0-9]{2}" defaultValue="12/29" /></label><label>CVV<input required inputMode="numeric" pattern="[0-9]{3,4}" defaultValue="123" /></label></div></div>}{Object.keys(cart).some((id) => catalogProducts.find((item) => item.id === Number(id))?.rx) && <label className="rx-confirm"><input name="rx-confirm" type="checkbox" /><span><b>Confirmo que presentaré la receta vigente</b><small>El personal de sucursal la validará antes de entregar medicamentos controlados.</small></span></label>}{checkoutError && <p className="form-error" role="alert">{checkoutError}</p>}</form></section><aside className="order-summary"><span className="summary-icon"><ShoppingBag /></span><h2>Tu pedido</h2>{Object.entries(cart).map(([id, quantity]) => { const product = catalogProducts.find((item) => item.id === Number(id))!; return <div className="summary-line" key={id}><span>{quantity}× {product.name}</span><b>{money(unitPrice(Number(id)) * quantity)}</b></div>})}{saving > 0 && <div className="summary-line discount"><span>Descuento médico</span><b>−{money(saving)}</b></div>}{user && redeemValue > 0 && <div className="redeem"><input id="redeem-points" type="checkbox" checked={redeem} onChange={(event) => setRedeem(event.target.checked)} /><label htmlFor="redeem-points"><b>Usar mis puntos</b><small>{user.points} puntos disponibles · ahorra {money(redeemValue)}</small></label></div>}<div className="summary-total"><span>Total</span><b>{money(Math.max(total - (redeem ? redeemValue : 0), 0))}</b></div><button form="payment-form" className="primary submit" disabled={orderProcessing}>{orderProcessing ? "Validando pedido…" : pay === "card" ? "Validar y pagar" : "Validar y generar pedido"} <ArrowRight size={17} /></button><small className="secure-note"><ShieldCheck size={14} /> Compra demo segura · No se realiza ningún cargo real</small></aside></div></main>}

    {view === "order" && lastOrder && <motion.main className="success page-width" initial={{ opacity: 0, scale: .97 }} animate={{ opacity: 1, scale: 1 }}><div className="success-mark"><Check /></div><span className="eyebrow">Pedido validado · Inventario reservado</span><h1>{lastOrder.method === "card" ? "Tu compra está confirmada." : "Tu pedido espera en sucursal."}</h1><p className="order-number">{lastOrder.number}</p><div className="pickup-code"><small>Código de recolección</small><b>{lastOrder.pickupCode}</b><span>Muéstralo en mostrador junto con una identificación.</span></div><div className="order-timeline"><span className="done"><Check /> Validado</span><i /><span className="current"><Clock3 /> En preparación</span><i /><span><Store /> Listo para recoger</span></div><div className="receipt"><div><span>Sucursal</span><b>{lastOrder.branch}</b></div><div><span>Artículos</span><b>{lastOrder.items}</b></div><div><span>Total</span><b>{money(lastOrder.total)}</b></div><div><span>Puntos ganados</span><b>+{lastOrder.points}</b></div></div><div className="hero-actions center"><button className="primary" onClick={() => navigate("account")}>Ver seguimiento</button><button className="secondary" onClick={() => navigate("catalog")}>Seguir comprando</button></div></motion.main>}

    {view === "account" && user && <main className={`account page-width ${doctor ? "professional-account" : ""}`}><div className="account-heading"><div><span className="eyebrow">{doctor ? "Cuenta profesional" : "Mi cuenta"}</span><h1>{doctor ? `Bienvenida, Dra. ${user.name}` : `Hola, ${user.name}`}</h1><p>{doctor ? `${user.specialty} · Cédula ${user.license}` : user.email}</p></div><button className="text-action danger" onClick={logout}><LogOut size={16} /> Cerrar sesión</button></div>{doctor && <motion.section className="professional-overview" initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }}><div className="professional-welcome"><span><Stethoscope /></span><div><small>Perfil profesional verificado</small><h2>Tu 10% ya está activo.</h2><p>Compra en cualquier sucursal y el precio médico se aplicará automáticamente.</p></div></div><div className="professional-stats"><div><BadgePercent /><span><b>10%</b> en catálogo</span></div><div><Sparkles /><span><b>{user.points}</b> puntos</span></div><div><Store /><span><b>04</b> sucursales</span></div></div></motion.section>}<div className="account-grid"><MembershipCard user={user} doctor={doctor} /><BenefitsPanel doctor={doctor} onCatalog={() => navigate("catalog")} /></div><section className="orders"><div className="orders-heading"><div><span className="eyebrow">Actividad reciente</span><h2>{doctor ? "Compras profesionales" : "Mis pedidos"}</h2></div><button className="secondary" onClick={() => navigate("catalog")}>Nueva compra <ArrowRight /></button></div>{orders.length ? orders.map((order) => <article key={order.number}><div><b>{order.number}</b><span>{order.branch} · {order.date}</span></div><strong>{money(order.total)}</strong><em>{order.method === "card" ? "Pagado" : "Pagar en caja"}</em></article>) : <div className="empty-state"><ShoppingBag /><b>Aún no tienes pedidos</b><p>Tu primera compra ya suma puntos.</p></div>}</section></main>}

    {view === "adminLogin" && <main className="admin-login"><div className="portal-intro"><span><Building2 /></span><small>Acceso operativo</small><h1>Una operación, cuatro sucursales.</h1><p>Selecciona un perfil demo. Cada sesión respeta el alcance asignado y conserva los cambios en este navegador.</p><div className="portal-security"><ShieldCheck /> Acceso por rol y permisos</div></div><div className="form-card"><span className="eyebrow">Portal de sucursales</span><h2>¿Cómo quieres entrar?</h2><p>Gerencia administra una sede; Super Admin controla toda la red.</p><div className="portal-role"><UserCog /><div><b>Gerencia de sucursal</b><small>Precios, existencias y alta de medicamentos en una sede.</small></div></div><div className="demo-accounts">{branches.map((item) => <button key={item.id} disabled={!branchStatus[item.id]} onClick={() => { setAdminBranch(item.id); navigate("admin"); }}><span><b>{item.name}</b><small>{item.location}</small></span><ArrowRight /></button>)}</div><button className="super-admin-button" onClick={() => navigate("corp")}><ShieldCheck /><span><b>Entrar como Super Admin</b><small>CRUD global y gestión de las cuatro sucursales</small></span><ArrowRight /></button><small className="demo-note">Demostración funcional · No solicita credenciales reales</small></div></main>}

    {view === "admin" && adminBranch && <AdminDashboard branchId={adminBranch} products={catalogProducts} onProductsChange={setCatalogProducts} notify={notify} />}
    {view === "corp" && <CorporateDashboard products={catalogProducts} onProductsChange={setCatalogProducts} branchStatus={branchStatus} onBranchStatusChange={setBranchStatus} notify={notify} />}
    </div>

    {shoppingView && <nav className="mobile-dock" aria-label="Navegación móvil"><button className={view === "home" ? "active" : ""} aria-current={view === "home" ? "page" : undefined} onClick={() => navigate("home")}><House /><span>Inicio</span></button><button className={view === "catalog" ? "active" : ""} aria-current={view === "catalog" ? "page" : undefined} onClick={() => navigate("catalog")}><Search /><span>Catálogo</span></button><button className={view === "account" || view === "auth" || view === "doctor" ? "active" : ""} aria-current={view === "account" || view === "auth" || view === "doctor" ? "page" : undefined} onClick={() => navigate(user ? "account" : "auth")}><UserRound /><span>Cuenta</span></button><button className={cartOpen ? "active" : ""} onClick={() => setCartOpen(true)}><ShoppingBag /><span>Bolsa</span>{cartCount > 0 && <b>{cartCount}</b>}</button></nav>}

    {shoppingView && <footer><Logo compact /><p>© 2026 One Pharmacy · Puebla y Tlaxcala</p><button onClick={() => navigate("adminLogin")}>Portal de sucursales →</button></footer>}

    <Dialog.Root open={cartOpen} onOpenChange={setCartOpen}>
      <AnimatePresence>
        {cartOpen && <Dialog.Portal forceMount><Dialog.Overlay className="cart-overlay" /><Dialog.Content className="cart-drawer" aria-describedby={undefined}><header><div><span className="eyebrow">Tu selección</span><Dialog.Title>Tu carrito <em>({cartCount})</em></Dialog.Title></div><Dialog.Close aria-label="Cerrar"><X /></Dialog.Close></header><div className="cart-items">{cartCount ? Object.entries(cart).map(([id, quantity]) => { const product = catalogProducts.find((item) => item.id === Number(id))!; return <article key={id}><div className="cart-product-icon"><Pill /></div><div><b>{product.name}</b><span>{money(unitPrice(Number(id)))} c/u · {product.stock[branch]} disponibles</span><button className="remove-item" onClick={() => setCart((current) => { const next = { ...current }; delete next[Number(id)]; return next; })}><Trash2 /> Eliminar</button></div><div className="quantity"><button onClick={() => changeQuantity(Number(id), -1)} aria-label={`Quitar una unidad de ${product.name}`}><Minus /></button><b>{quantity}</b><button onClick={() => changeQuantity(Number(id), 1)} aria-label={`Agregar una unidad de ${product.name}`}><Plus /></button></div></article>}) : <div className="empty-cart"><span><ShoppingBag /></span><h3>Tu carrito está vacío</h3><p>Explora el catálogo y agrega lo que necesitas.</p><Dialog.Close asChild><button className="secondary" onClick={() => navigate("catalog")}>Ver catálogo</button></Dialog.Close></div>}</div><div className="cart-footer">{saving > 0 && <div className="summary-line discount"><span>Ahorro médico</span><b>−{money(saving)}</b></div>}<div className="summary-total"><span>Total</span><b>{money(total)}</b></div><button className="primary submit" disabled={!cartCount} onClick={() => { if (!user) { setAuthTab("login"); navigate("auth"); notify("Inicia sesión para completar tu compra"); } else navigate("checkout"); }}>{user ? "Continuar al pago" : "Iniciar sesión para comprar"} <ArrowRight size={17} /></button><small><ShieldCheck size={14} /> Validamos tu cuenta, sucursal e inventario</small></div></Dialog.Content></Dialog.Portal>}
      </AnimatePresence>
    </Dialog.Root>
    <Toaster position="bottom-center" richColors closeButton toastOptions={{ duration: 2600 }} />
  </div>;
}

function AdminDashboard({ branchId, products, onProductsChange, notify }: { branchId: BranchId; products: Product[]; onProductsChange: (products: Product[]) => void; notify: (message: string) => void }) {
  const branch = branches.find((item) => item.id === branchId)!;
  const data = metrics[branchId];
  const [edits, setEdits] = useState<Record<number, { price?: string; stock?: string }>>({});
  const weeklySales = data.weeks.map((value, index) => ({ week: `S${index + 1}`, value }));
  const kpis = [
    { label: "Ventas del mes", value: money(data.sales), icon: BarChart3 },
    { label: "Pedidos", value: data.orders.toLocaleString("es-MX"), icon: ReceiptText },
    { label: "Tasa de recompra", value: `${data.repeat}%`, icon: UserRound },
    { label: "Nivel de surtido", value: `${data.stock}%`, icon: PackageCheck },
  ];
  const saveInventory = () => {
    onProductsChange(products.map((product) => edits[product.id] ? { ...product, prices: { ...product.prices, [branchId]: Math.max(0, Number(edits[product.id].price ?? product.prices[branchId])) }, stock: { ...product.stock, [branchId]: Math.max(0, Number(edits[product.id].stock ?? product.stock[branchId])) } } : product));
    setEdits({});
    notify(`Inventario de ${branch.name} actualizado`);
  };
  const addLocalProduct = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const price = Math.max(1, Number(data.get("price")) || 1);
    const stock = Math.max(0, Number(data.get("stock")) || 0);
    const blankPrices = Object.fromEntries(branches.map((item) => [item.id, price])) as Record<BranchId, number>;
    const blankStock = Object.fromEntries(branches.map((item) => [item.id, item.id === branchId ? stock : 0])) as Record<BranchId, number>;
    onProductsChange([...products, { id: Math.max(0, ...products.map((item) => item.id)) + 1, name: String(data.get("name")), desc: String(data.get("desc") || "Producto agregado desde el portal de sucursal."), cat: String(data.get("cat")), rx: data.get("rx") === "on", active: true, prices: blankPrices, stock: blankStock }]);
    event.currentTarget.reset();
    notify("Medicamento agregado al catálogo de la sucursal");
  };
  return <main className="dashboard page-width">
    <div className="dashboard-heading"><div><span className="eyebrow">Gerencia · {branch.location}</span><h1>Sucursal {branch.name}</h1><p>Esta cuenta administra únicamente precios y existencias de su sede.</p></div><span className="permission-chip"><ShieldCheck /> Alcance: una sucursal</span></div>
    <div className="kpi-grid">{kpis.map(({ label, value, icon: Icon }) => <motion.article key={label} whileHover={{ y: -4 }}><Icon /><span>{label}</span><b>{value}</b></motion.article>)}</div>
    <section className="chart-panel"><div><span className="panel-icon"><BarChart3 /></span><h2>Ventas de las últimas 8 semanas</h2><p>Miles de MXN por semana.</p></div><div className="chart-canvas"><WeeklySalesChart data={weeklySales} gradientId={`sales-${branchId}`} /></div></section>
    <section className="price-admin"><div className="panel-heading"><div><span className="panel-icon"><Store /></span><h2>Inventario local</h2><p>Actualiza precio y existencias; los cambios se reflejan en la tienda demo.</p></div><span>{products.filter((product) => product.active).length} productos activos</span></div><div className="inventory-head"><span>Medicamento</span><span>Precio</span><span>Existencias</span></div><div className="price-list">{products.filter((product) => product.active).map((product) => <div className="inventory-row" key={product.id}><span><b>{product.name}</b><small>{product.cat}{product.rx ? " · Requiere receta" : ""}</small></span><label><i>$</i><input aria-label={`Precio de ${product.name}`} type="number" min="0" value={edits[product.id]?.price ?? product.prices[branchId]} onChange={(event) => setEdits((current) => ({ ...current, [product.id]: { ...current[product.id], price: event.target.value } }))} /></label><label><input aria-label={`Existencias de ${product.name}`} type="number" min="0" value={edits[product.id]?.stock ?? product.stock[branchId]} onChange={(event) => setEdits((current) => ({ ...current, [product.id]: { ...current[product.id], stock: event.target.value } }))} /><i>uds.</i></label></div>)}</div><div className="admin-actions"><button className="secondary" onClick={() => setEdits({})}>Descartar</button><button className="primary" disabled={!Object.keys(edits).length} onClick={saveInventory}>Guardar cambios</button></div></section>
    <section className="product-create"><div><span className="panel-icon"><PackagePlus /></span><h2>Alta de medicamento</h2><p>Se crea con existencias únicamente para {branch.name}; Super Admin puede distribuirlo después.</p></div><form onSubmit={addLocalProduct}><label>Nombre<input name="name" required /></label><label>Categoría<select name="cat">{categories.slice(1).map((item) => <option key={item}>{item}</option>)}</select></label><label>Precio<input name="price" type="number" min="1" required /></label><label>Existencias<input name="stock" type="number" min="0" required /></label><label className="checkbox-field"><input name="rx" type="checkbox" /> Requiere receta</label><label className="wide-field">Descripción<input name="desc" required /></label><button className="primary" type="submit"><Plus /> Agregar producto</button></form></section>
  </main>;
}

function CorporateDashboard({ products, onProductsChange, branchStatus, onBranchStatusChange, notify }: { products: Product[]; onProductsChange: (products: Product[]) => void; branchStatus: Record<BranchId, boolean>; onBranchStatusChange: (status: Record<BranchId, boolean>) => void; notify: (message: string) => void }) {
  const [managedBranch, setManagedBranch] = useState<BranchId>("analco");
  const totalSales = Object.values(metrics).reduce((sum, item) => sum + item.sales, 0);
  const totalOrders = Object.values(metrics).reduce((sum, item) => sum + item.orders, 0);
  const branchSales = branches.map((branch) => ({ name: branch.name, sales: metrics[branch.id].sales }));
  const kpis = [
    { label: "Venta total del grupo", value: money(totalSales), icon: BarChart3 },
    { label: "Pedidos totales", value: totalOrders.toLocaleString("es-MX"), icon: ReceiptText },
    { label: "Ticket promedio", value: money(totalSales / totalOrders), icon: CreditCard },
    { label: "Sucursal líder", value: "Palmas Plaza", icon: Building2 },
  ];
  const addGlobalProduct = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const price = Math.max(1, Number(data.get("price")) || 1);
    const stock = Math.max(0, Number(data.get("stock")) || 0);
    onProductsChange([...products, { id: Math.max(0, ...products.map((item) => item.id)) + 1, name: String(data.get("name")), desc: String(data.get("desc") || "Producto incorporado al catálogo One Pharmacy."), cat: String(data.get("cat")), rx: data.get("rx") === "on", active: true, prices: Object.fromEntries(branches.map((item) => [item.id, price])) as Record<BranchId, number>, stock: Object.fromEntries(branches.map((item) => [item.id, stock])) as Record<BranchId, number> }]);
    event.currentTarget.reset();
    notify("Producto creado en las cuatro sucursales");
  };
  const updateProduct = (id: number, changes: Partial<Product>) => onProductsChange(products.map((product) => product.id === id ? { ...product, ...changes } : product));
  const deleteProduct = (product: Product) => {
    if (!window.confirm(`¿Eliminar ${product.name} del catálogo demo?`)) return;
    onProductsChange(products.filter((item) => item.id !== product.id));
    notify("Producto eliminado del catálogo demo");
  };
  return <main className="dashboard page-width"><div className="dashboard-heading"><div><span className="eyebrow">Consolidado · Mes en curso</span><h1>Super Admin</h1><p>Control global de sucursales, catálogo, precios y existencias.</p></div><span className="permission-chip super"><ShieldCheck /> Alcance: toda la red</span></div><div className="kpi-grid">{kpis.map(({ label, value, icon: Icon }) => <motion.article key={label} whileHover={{ y: -4 }}><Icon /><span>{label}</span><b>{value}</b></motion.article>)}</div><section className="corp-chart"><div><span className="panel-icon"><Building2 /></span><h2>Ventas del mes por sucursal</h2></div><div className="chart-canvas"><BranchSalesChart data={branchSales} /></div></section><section className="branch-management"><div><span className="panel-icon"><Store /></span><h2>Gestión de sucursales</h2><p>Abre o pausa la recepción de pedidos en cada sede.</p></div><div className="branch-admin-grid">{branches.map((branch) => <article key={branch.id}><i><Store /></i><span><b>{branch.name}</b><small>{branch.location} · {products.filter((product) => product.active && product.stock[branch.id] > 0).length} productos disponibles</small></span><button className={branchStatus[branch.id] ? "active" : ""} onClick={() => { const next = { ...branchStatus, [branch.id]: !branchStatus[branch.id] }; onBranchStatusChange(next); notify(`${branch.name}: ${next[branch.id] ? "recibiendo pedidos" : "pedidos pausados"}`); }}>{branchStatus[branch.id] ? "Abierta" : "Pausada"}</button></article>)}</div></section><section className="global-catalog"><div className="panel-heading"><div><span className="panel-icon"><PackagePlus /></span><h2>CRUD global de medicamentos</h2><p>Crea, consulta, actualiza, archiva o elimina productos del catálogo demo.</p></div><label>Sucursal a editar<select value={managedBranch} onChange={(event) => setManagedBranch(event.target.value as BranchId)}>{branches.map((branch) => <option key={branch.id} value={branch.id}>{branch.name}</option>)}</select></label></div><form className="quick-create" onSubmit={addGlobalProduct}><input name="name" placeholder="Nombre del medicamento" required /><select name="cat">{categories.slice(1).map((item) => <option key={item}>{item}</option>)}</select><input name="price" type="number" min="1" placeholder="Precio inicial" required /><input name="stock" type="number" min="0" placeholder="Existencias" required /><input name="desc" placeholder="Descripción breve" required /><label><input name="rx" type="checkbox" /> Receta</label><button className="primary" type="submit"><Plus /> Crear</button></form><div className="table-scroll"><table className="catalog-admin-table"><thead><tr><th>Medicamento</th><th>Categoría</th><th>Precio · {branches.find((item) => item.id === managedBranch)?.name}</th><th>Stock</th><th>Estado</th><th>Acciones</th></tr></thead><tbody>{products.map((product) => <tr key={product.id}><td><b>{product.name}</b><small>{product.rx ? "Con receta" : "Venta libre"}</small></td><td><select value={product.cat} onChange={(event) => updateProduct(product.id, { cat: event.target.value })}>{categories.slice(1).map((item) => <option key={item}>{item}</option>)}</select></td><td><input aria-label={`Precio de ${product.name}`} type="number" min="0" value={product.prices[managedBranch]} onChange={(event) => updateProduct(product.id, { prices: { ...product.prices, [managedBranch]: Math.max(0, Number(event.target.value)) } })} /></td><td><input aria-label={`Stock de ${product.name}`} type="number" min="0" value={product.stock[managedBranch]} onChange={(event) => updateProduct(product.id, { stock: { ...product.stock, [managedBranch]: Math.max(0, Number(event.target.value)) } })} /></td><td><button className={`status-button ${product.active ? "active" : ""}`} onClick={() => updateProduct(product.id, { active: !product.active })}>{product.active ? "Activo" : "Archivado"}</button></td><td><button className="icon-danger" onClick={() => deleteProduct(product)} aria-label={`Eliminar ${product.name}`}><Trash2 /></button></td></tr>)}</tbody></table></div></section><section className="corp-table"><h2>Comparativo por sucursal</h2><div className="table-scroll"><table><thead><tr><th>Sucursal</th><th>Ventas</th><th>Pedidos</th><th>Ticket prom.</th><th>Recompra</th><th>Crecimiento</th><th>Producto top</th></tr></thead><tbody>{branches.map((branch) => { const item = metrics[branch.id]; return <tr key={branch.id}><td><b>{branch.name}</b><small>{branch.location}</small></td><td>{money(item.sales)}</td><td>{item.orders.toLocaleString("es-MX")}</td><td>{money(item.ticket)}</td><td>{item.repeat}%</td><td className={item.growth >= 0 ? "positive" : "negative"}>{item.growth >= 0 ? "+" : ""}{item.growth}%</td><td>{item.top}</td></tr>})}</tbody></table></div></section></main>;
}
