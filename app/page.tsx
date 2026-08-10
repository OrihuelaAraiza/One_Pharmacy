"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import Image from "next/image";

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
const categoryMarks: Record<string, string> = { "Soporte oncológico": "✦", Medicamentos: "+", Suplementos: "◌", Dispositivos: "⌁", "Cuidado diario": "☀" };
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
  const [toast, setToast] = useState("");
  const [authTab, setAuthTab] = useState<"register" | "login">("register");
  const [doctorTab, setDoctorTab] = useState<"login" | "register">("login");
  const [pay, setPay] = useState<"card" | "cash">("card");
  const [redeem, setRedeem] = useState(false);
  const [adminBranch, setAdminBranch] = useState<BranchId | null>(null);

  useEffect(() => {
    window.localStorage.setItem("one-pharmacy-state", JSON.stringify({ branch, cart, user, orders }));
  }, [branch, cart, user, orders]);

  const notify = (message: string) => {
    setToast(message);
    window.setTimeout(() => setToast(""), 2600);
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
          {doctor && <span className="doctor-chip">⚕ Dra. {user.last.split(" ")[0]} · −10%</span>}
          <label className="branch-picker"><span>Ubicación</span><select value={branch} onChange={(event) => changeBranch(event.target.value as BranchId)}>{branches.map((item) => <option value={item.id} key={item.id}>{item.name}{item.featured ? " · insignia" : ""}</option>)}</select></label>
          <button className="text-action account-action" onClick={() => navigate(user ? "account" : "auth")}>{user ? `Mi cuenta · ${user.points} pts` : "Iniciar sesión"}</button>
          <button className="cart-button" onClick={() => setCartOpen(true)}><span>Bolsa</span><b>{cartCount}</b></button>
        </div>
      </> : <div className="header-actions"><span className="admin-label">Portal de sucursales</span>{view !== "adminLogin" && <button className="text-action" onClick={() => { setAdminBranch(null); navigate("adminLogin"); }}>Cerrar sesión</button>}</div>}
    </header>

    {view === "home" && <main>
      <section className="hero">
        <div className="hero-copy">
          <span className="eyebrow">Puebla · Tlaxcala — 4 sucursales</span>
          <h1>La farmacia del <em>paciente oncológico</em></h1>
          <p>Medicamentos de soporte y cuidado diario con los precios de tu sucursal. Compra en línea, acumula puntos y recoge sin filas.</p>
          <div className="hero-actions"><button className="primary" onClick={() => navigate("catalog")}>Comprar ahora <span>→</span></button><button className="secondary" onClick={() => navigate("doctor")}>Soy médico · −10%</button></div>
          <div className="trust-line"><span>✓ Recoge el mismo día</span><span>✓ Paga en línea o en caja</span></div>
        </div>
        <div className="hero-image"><Image src="/one-pharmacy-hero.webp" alt="Atención personalizada en una sucursal One Pharmacy" width={1000} height={1000} priority /><div className="floating-card"><b>1×10</b><span>1 punto por cada $10</span><small>Cada 100 pts valen $50</small></div><div className="branch-count"><b>04</b><span>sucursales<br />cerca de ti</span></div></div>
      </section>
      <section className="category-section page-width">
        <span className="eyebrow">Compra por categoría</span><h2>Todo lo que necesitas durante el tratamiento, <em>en un solo lugar.</em></h2>
        <div className="category-grid">{categories.slice(1).map((item) => <button key={item} onClick={() => { setCategory(item); navigate("catalog"); }}><i>{categoryMarks[item]}</i><span>{item}</span><b>→</b></button>)}</div>
      </section>
      <section className="how-it-works"><div className="page-width"><span className="eyebrow light">Así de sencillo</span><h2>Tu pedido, listo cuando tú llegues.</h2><div className="steps">{[["01", "Elige tu sucursal", "Cada sucursal maneja sus precios e inventario."], ["02", "Compra y paga como prefieras", "Con tarjeta en línea o en caja al recoger."], ["03", "Recoge y gana puntos", "Te avisamos cuando esté listo y cada compra suma."]].map(([n, title, copy]) => <article key={n}><b>{n}</b><h3>{title}</h3><p>{copy}</p></article>)}</div></div></section>
      <section className="doctor-cta page-width"><div><span className="eyebrow">Programa profesional</span><h2>¿Eres profesional de la salud?</h2><p>Valida tu cédula una sola vez y obtén 10% de descuento permanente, con facturación automática.</p></div><button className="primary" onClick={() => navigate("doctor")}>Entrar al portal médico →</button></section>
    </main>}

    {view === "catalog" && <main className="catalog page-width">
      <div className="catalog-heading"><div><span className="eyebrow">Compra local</span><h1>Sucursal {selectedBranch.name}</h1><p>{doctor ? "Tu descuento médico ya está aplicado. " : ""}Precios locales, inventario disponible y recolección el mismo día.</p></div><label className="search"><span>⌕</span><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Buscar medicamentos y productos" aria-label="Buscar productos" /></label></div>
      <div className="category-tabs">{categories.map((item) => <button className={category === item ? "active" : ""} key={item} onClick={() => setCategory(item)}>{item}</button>)}</div>
      {visibleProducts.length ? <div className="product-grid">{visibleProducts.map((product) => { const base = product.prices[branch]; const price = doctor ? base * .9 : base; return <article className="product-card" key={product.id}><div className={`product-art art-${(product.id % 5) + 1}`}><span>{categoryMarks[product.cat]}</span>{product.rx && <b>℞</b>}</div><div className="product-content"><small>{product.cat}</small><h3>{product.name}</h3><p>{product.desc}</p>{product.rx && <span className="rx-note">Receta al recoger</span>}<div className="price-row"><div><strong>{money(price)}</strong>{doctor && <del>{money(base)}</del>}</div><button onClick={() => addToCart(product.id)} aria-label={`Agregar ${product.name}`}>Agregar <b>+</b></button></div></div></article>})}</div> : <div className="empty-state"><b>Sin resultados</b><p>Prueba con otra palabra o quita el filtro.</p></div>}
      <p className="catalog-note">Precios en MXN, IVA incluido. Los productos ℞ requieren receta al recoger en sucursal.</p>
    </main>}

    {(view === "auth" || view === "doctor") && <main className="auth-layout">
      <section className={`auth-story ${view === "doctor" ? "doctor-story" : ""}`}><button className="back-link" onClick={() => navigate("home")}>← Volver al inicio</button><div><Logo /><span className="eyebrow light">{view === "doctor" ? "Profesionales de la salud" : "One Lealtad"}</span><h1>{view === "doctor" ? "Tu conocimiento merece beneficios." : "Tu salud también te recompensa."}</h1><p>{view === "doctor" ? "Accede a precios preferenciales y facturación automática con tu cédula verificada." : "Compra, acumula puntos y recibe promociones exclusivas de tu sucursal."}</p></div></section>
      <section className="auth-panel"><div className="form-card"><span className="eyebrow">{view === "doctor" ? "Portal médico" : "Cuenta de paciente"}</span><h2>{view === "doctor" ? "Bienvenido, doctor" : "Crea tu cuenta"}</h2><p>{view === "doctor" ? "10% permanente en todo el catálogo." : "Obtén tu tarjeta One Lealtad desde tu primera compra."}</p>
        <div className="segmented">{view === "doctor" ? <><button className={doctorTab === "login" ? "active" : ""} onClick={() => setDoctorTab("login")}>Iniciar sesión</button><button className={doctorTab === "register" ? "active" : ""} onClick={() => setDoctorTab("register")}>Registrarme</button></> : <><button className={authTab === "register" ? "active" : ""} onClick={() => setAuthTab("register")}>Crear cuenta</button><button className={authTab === "login" ? "active" : ""} onClick={() => setAuthTab("login")}>Ya tengo cuenta</button></>}</div>
        {view === "doctor" ? <form onSubmit={submitDoctor}>{doctorTab === "register" && <div className="two-fields"><label>Nombre(s)<input name="name" required /></label><label>Apellidos<input required /></label></div>}{doctorTab === "register" && <><label>Cédula profesional<input name="license" inputMode="numeric" pattern="[0-9]{7,8}" required placeholder="7 u 8 dígitos" /></label><label>Especialidad<select name="specialty"><option>Medicina general</option><option>Oncología</option><option>Medicina interna</option><option>Pediatría</option></select></label></>}<label>Correo electrónico<input name="email" type="email" defaultValue={doctorTab === "login" ? "dra.garcia@onepharmacy.mx" : ""} required /></label><label>Contraseña<input type="password" defaultValue={doctorTab === "login" ? "demo1234" : ""} minLength={8} required /></label><button className="primary submit">{doctorTab === "login" ? "Entrar con cuenta demo" : "Verificar cédula y crear cuenta"}</button></form> : <form onSubmit={submitPatient}>{authTab === "register" && <div className="two-fields"><label>Nombre(s)<input name="name" required /></label><label>Apellidos<input required /></label></div>}{authTab === "register" && <label>Teléfono celular<input type="tel" inputMode="tel" minLength={10} required /></label>}<label>Correo electrónico<input name="email" type="email" defaultValue={authTab === "login" ? "maria@onepharmacy.mx" : ""} required /></label><label>Contraseña<input type="password" defaultValue={authTab === "login" ? "demo1234" : ""} minLength={8} required /></label><button className="primary submit">{authTab === "login" ? "Entrar con cuenta demo" : "Crear cuenta y obtener mi tarjeta"}</button></form>}
      </div></section>
    </main>}

    {view === "checkout" && <main className="checkout page-width"><button className="back-link dark" onClick={() => setCartOpen(true)}>← Volver al carrito</button><div className="checkout-grid"><section><span className="eyebrow">Último paso</span><h1>Finalizar compra</h1><p>Recoges tu pedido en {selectedBranch.name}, {selectedBranch.location}.</p><form id="payment-form" onSubmit={placeOrder}><h3>¿Cómo quieres pagar?</h3><div className="payment-options"><button type="button" className={pay === "card" ? "active" : ""} onClick={() => setPay("card")}><b>◫ Tarjeta en línea</b><span>Paga ahora y solo pasa a recoger.</span></button><button type="button" className={pay === "cash" ? "active" : ""} onClick={() => setPay("cash")}><b>▣ Pagar en caja</b><span>Generamos tu número de pedido.</span></button></div>{pay === "card" && <div className="card-fields"><label>Nombre en la tarjeta<input required /></label><label>Número de tarjeta<input required inputMode="numeric" defaultValue="4242 4242 4242 4242" /></label><div className="two-fields"><label>Vencimiento<input required defaultValue="12/29" /></label><label>CVV<input required inputMode="numeric" defaultValue="123" /></label></div></div>}</form></section><aside className="order-summary"><h2>Tu pedido</h2>{Object.entries(cart).map(([id, quantity]) => { const product = products.find((item) => item.id === Number(id))!; return <div className="summary-line" key={id}><span>{quantity}× {product.name}</span><b>{money(unitPrice(Number(id)) * quantity)}</b></div>})}{saving > 0 && <div className="summary-line discount"><span>Descuento médico</span><b>−{money(saving)}</b></div>}{user && redeemValue > 0 && <div className="redeem"><input id="redeem-points" type="checkbox" checked={redeem} onChange={(event) => setRedeem(event.target.checked)} /><label htmlFor="redeem-points"><b>Usar mis puntos</b><small>{user.points} puntos disponibles · ahorra {money(redeemValue)}</small></label></div>}<div className="summary-total"><span>Total</span><b>{money(Math.max(total - (redeem ? redeemValue : 0), 0))}</b></div><button form="payment-form" className="primary submit">{pay === "card" ? "Pagar ahora" : "Generar número de pedido"} →</button><small className="secure-note">Compra segura · Datos protegidos · Recoge hoy</small></aside></div></main>}

    {view === "order" && lastOrder && <main className="success page-width"><div className="success-mark">✓</div><span className="eyebrow">{lastOrder.method === "card" ? "Pago aprobado" : "Pedido generado"}</span><h1>{lastOrder.method === "card" ? "Tu pedido está confirmado." : "Paga al recoger en sucursal."}</h1><p className="order-number">{lastOrder.number}</p><div className="receipt"><div><span>Sucursal</span><b>{lastOrder.branch}</b></div><div><span>Total</span><b>{money(lastOrder.total)}</b></div><div><span>Puntos ganados</span><b>+{lastOrder.points}</b></div></div><div className="hero-actions center"><button className="primary" onClick={() => navigate("account")}>Ver mi cuenta y puntos</button><button className="secondary" onClick={() => navigate("catalog")}>Seguir comprando</button></div></main>}

    {view === "account" && user && <main className="account page-width"><div className="account-heading"><div><span className="eyebrow">Mi cuenta</span><h1>Hola, {user.name}</h1><p>{doctor ? `Médico verificado · Cédula ${user.license}` : user.email}</p></div><button className="text-action danger" onClick={logout}>Cerrar sesión</button></div><div className="account-grid"><section className={`loyalty-card ${doctor ? "medical" : ""}`}><Logo /><span>{doctor ? "One Médico" : "One Lealtad"}</span><strong>{user.points}</strong><small>puntos disponibles</small><div><b>{user.name} {user.last}</b><span>{user.card}</span></div></section><section className="benefits"><h2>Beneficios de tu tarjeta</h2>{(doctor ? ["10% permanente en todo el catálogo.", "Facturación automática de tus compras.", "Atención prioritaria en mostrador."] : ["1 punto por cada $10 MXN.", "Cada 100 puntos = $50 de descuento.", "Promociones exclusivas de tu sucursal."]).map((item) => <p key={item}>✓ <span>{item}</span></p>)}</section></div><section className="orders"><h2>Mis pedidos</h2>{orders.length ? orders.map((order) => <article key={order.number}><div><b>{order.number}</b><span>{order.branch} · {order.date}</span></div><strong>{money(order.total)}</strong><em>{order.method === "card" ? "Pagado" : "Pagar en caja"}</em></article>) : <div className="empty-state"><b>Aún no tienes pedidos</b><p>Tu primera compra ya suma puntos.</p></div>}</section></main>}

    {view === "adminLogin" && <main className="admin-login"><div className="form-card"><span className="eyebrow">Operación One Pharmacy</span><h1>Portal de sucursales</h1><p>Cada gerencia administra precios y métricas de su sucursal. Dirección consulta el consolidado.</p><div className="demo-accounts">{branches.map((item) => <button key={item.id} onClick={() => { setAdminBranch(item.id); navigate("admin"); }}>{item.name}<span>Entrar →</span></button>)}<button className="corp-button" onClick={() => navigate("corp")}>Dirección General<span>Ver grupo →</span></button></div></div></main>}

    {view === "admin" && adminBranch && <AdminDashboard branchId={adminBranch} notify={notify} />}
    {view === "corp" && <CorporateDashboard />}

    {shoppingView && <footer><Logo compact /><p>© 2026 One Pharmacy · Puebla y Tlaxcala</p><button onClick={() => navigate("adminLogin")}>Portal de sucursales →</button></footer>}

    {cartOpen && <><button className="cart-overlay" aria-label="Cerrar carrito" onClick={() => setCartOpen(false)} /><aside className="cart-drawer" aria-label="Carrito de compras"><header><h2>Tu carrito <em>({cartCount})</em></h2><button onClick={() => setCartOpen(false)} aria-label="Cerrar">×</button></header><div className="cart-items">{cartCount ? Object.entries(cart).map(([id, quantity]) => { const product = products.find((item) => item.id === Number(id))!; return <article key={id}><div><b>{product.name}</b><span>{money(unitPrice(Number(id)))} c/u</span></div><div className="quantity"><button onClick={() => changeQuantity(Number(id), -1)}>−</button><b>{quantity}</b><button onClick={() => changeQuantity(Number(id), 1)}>+</button></div></article>}) : <div className="empty-cart"><i><b /><em /></i><h3>Tu carrito está vacío</h3><p>Agrega productos del catálogo.</p></div>}</div><div className="cart-footer">{saving > 0 && <div className="summary-line discount"><span>Ahorro médico</span><b>−{money(saving)}</b></div>}<div className="summary-total"><span>Total</span><b>{money(total)}</b></div><button className="primary submit" disabled={!cartCount} onClick={() => { if (!user) navigate("auth"); else navigate("checkout"); }}>{user ? "Continuar al pago" : "Iniciar sesión para comprar"} →</button></div></aside></>}
    {toast && <div className="toast" role="status">{toast}</div>}
  </div>;
}

function AdminDashboard({ branchId, notify }: { branchId: BranchId; notify: (message: string) => void }) {
  const branch = branches.find((item) => item.id === branchId)!;
  const data = metrics[branchId];
  const [edits, setEdits] = useState<Record<number, string>>({});
  const maxWeek = Math.max(...data.weeks);
  return <main className="dashboard page-width"><span className="eyebrow">Gerencia · {branch.location}</span><h1>Sucursal {branch.name}</h1><p>Resultados del mes y precios locales. Esta cuenta no tiene acceso a otras sucursales.</p><div className="kpi-grid">{[["Ventas del mes", money(data.sales)], ["Pedidos", data.orders.toLocaleString("es-MX")], ["Tasa de recompra", `${data.repeat}%`], ["Nivel de surtido", `${data.stock}%`]].map(([label, value]) => <article key={label}><span>{label}</span><b>{value}</b></article>)}</div><section className="chart-panel"><div><h2>Ventas de las últimas 8 semanas</h2><p>Miles de MXN por semana.</p></div><div className="bars">{data.weeks.map((week, index) => <i key={index} style={{ height: `${(week / maxWeek) * 100}%` }}><b>${week}k</b><span>S{index + 1}</span></i>)}</div></section><section className="price-admin"><div><h2>Precios de mi sucursal</h2><p>Los cambios se reflejan en la tienda local.</p></div><div className="price-list">{products.slice(0, 9).map((product) => <label key={product.id}><span><b>{product.name}</b><small>{product.cat}</small></span><i>$</i><input type="number" value={edits[product.id] ?? product.prices[branchId]} onChange={(event) => setEdits((current) => ({ ...current, [product.id]: event.target.value }))} /></label>)}</div><div className="admin-actions"><button className="secondary" onClick={() => setEdits({})}>Descartar</button><button className="primary" onClick={() => { setEdits({}); notify("Precios actualizados en esta demostración"); }}>Guardar cambios</button></div></section></main>;
}

function CorporateDashboard() {
  const totalSales = Object.values(metrics).reduce((sum, item) => sum + item.sales, 0);
  const totalOrders = Object.values(metrics).reduce((sum, item) => sum + item.orders, 0);
  const maxSales = Math.max(...Object.values(metrics).map((item) => item.sales));
  return <main className="dashboard page-width"><span className="eyebrow">Consolidado · Mes en curso</span><h1>Dirección General</h1><p>Indicadores comparables de las cuatro sucursales del grupo.</p><div className="kpi-grid">{[["Venta total del grupo", money(totalSales)], ["Pedidos totales", totalOrders.toLocaleString("es-MX")], ["Ticket promedio", money(totalSales / totalOrders)], ["Sucursal líder", "Palmas Plaza"]].map(([label, value]) => <article key={label}><span>{label}</span><b>{value}</b></article>)}</div><section className="corp-chart"><h2>Ventas del mes por sucursal</h2>{branches.map((branch) => <div key={branch.id}><span>{branch.name}</span><i><b style={{ width: `${metrics[branch.id].sales / maxSales * 100}%` }} /></i><strong>{money(metrics[branch.id].sales)}</strong></div>)}</section><section className="corp-table"><h2>Comparativo por sucursal</h2><div className="table-scroll"><table><thead><tr><th>Sucursal</th><th>Ventas</th><th>Pedidos</th><th>Ticket prom.</th><th>Recompra</th><th>Crecimiento</th><th>Producto top</th></tr></thead><tbody>{branches.map((branch) => { const item = metrics[branch.id]; return <tr key={branch.id}><td><b>{branch.name}</b><small>{branch.location}</small></td><td>{money(item.sales)}</td><td>{item.orders.toLocaleString("es-MX")}</td><td>{money(item.ticket)}</td><td>{item.repeat}%</td><td className={item.growth >= 0 ? "positive" : "negative"}>{item.growth >= 0 ? "+" : ""}{item.growth}%</td><td>{item.top}</td></tr>})}</tbody></table></div></section></main>;
}
