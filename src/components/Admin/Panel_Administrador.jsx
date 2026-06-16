import { useState, useEffect } from "react"
import axios from "axios"
import Empleados from './Empleados'
import Platos from './Platos'
import Menus from './Menus'
import '../../../Hojas_de_Estilo/Administrador.css';
import '../../App.css';

function Panel_Administrador({usuario, setPagina}){
  const [seccion, setSeccion] = useState("panel");

  // ── Estado del dashboard ──
  const [pedidosRealizados, setPedidosRealizados] = useState(0);
  const [gananciasHoy, setGananciasHoy] = useState(0);
  const [totalEntregados, setTotalEntregados] = useState(0);
  const [mesasOcupadas, setMesasOcupadas] = useState(0);
  const [totalMesas, setTotalMesas] = useState(0);
  const [menuDelDia, setMenuDelDia] = useState([]);

  const cargarDashboard = async () => {
    try {
      // Fecha de hoy en formato dd/mm/aaaa (igual al formato del backend)
      const hoy = new Date();
      const diaStr = `${hoy.getDate()}/${hoy.getMonth() + 1}/${hoy.getFullYear()}`;

      const [resPedidos, resMesas] = await Promise.all([
        axios.get("http://localhost:3000/Pedido"),
        axios.get("http://localhost:3000/Mesas"),
      ]);

      const pedidos = resPedidos.data;
      const mesas   = resMesas.data;

      // Pedidos del día (fecha_pedido empieza con el día de hoy)
      const pedidosHoy = pedidos.filter(p => p.fecha_pedido?.startsWith(diaStr));

      // Ganancias de hoy: suma de totalPagar de pedidos de hoy
      const ganancias = pedidosHoy.reduce((acc, p) => acc + (Number(p.totalPagar) || 0), 0);

      // Total entregados del día
      const entregados = pedidosHoy.filter(p => p.estadoPedido === "entregado").length;

      // Mesas ocupadas
      const ocupadas = mesas.filter(m => m.estado === "ocupada").length;

      setPedidosRealizados(pedidosHoy.length);
      setGananciasHoy(ganancias);
      setTotalEntregados(entregados);
      setMesasOcupadas(ocupadas);
      setTotalMesas(mesas.length);

    } catch (err) {
      console.error("Error cargando dashboard:", err);
    }

    // Cargar menú del día desde localStorage (armado por admin en sección Menús)
    const menuGuardado = localStorage.getItem("menuDelDia");
    setMenuDelDia(menuGuardado ? JSON.parse(menuGuardado) : []);
  };

  useEffect(() => {
    cargarDashboard();
    // Refresca cada 30 segundos para ver cambios en tiempo real
    const intervalo = setInterval(cargarDashboard, 30000);
    return () => clearInterval(intervalo);
  }, []);

  // Si entramos a sección menús puede que el admin suba un nuevo menú, recargamos al volver al panel
  useEffect(() => {
    if (seccion === "panel") cargarDashboard();
  }, [seccion]);

  const porcentajeOcupadas = totalMesas > 0 ? Math.round((mesasOcupadas / totalMesas) * 100) : 0;
  const menuPlatos  = menuDelDia.filter(p => p.CategoriaId !== "4");
  const menuBebidas = menuDelDia.filter(p => p.CategoriaId === "4");
  const formatPrecio = (precio) => `$${Number(precio).toLocaleString("es-CO")}`;

  return(
    <div className="admin-layout-container">
      
      <aside className="sidebar-admin">
        <div className="sidebar-header">
          <h2 className="logo-mangata">MANGATA</h2>
          <p className="admin-label">ADMINISTRADOR</p>
          <div className="admin-perfil">
            <p className="admin-welcome">Bienvenido,</p>
            <p className="admin-name">{usuario?.nombre || "Admin"}</p>
          </div>
        </div>

        <nav className="sidebar-menu">
          <button className={`menu-item ${seccion === "panel" ? "active" : ""}`} onClick={() => setSeccion("panel")}>Panel</button>
          <button className={`menu-item ${seccion === "empleados" ? "active" : ""}`} onClick={() => setSeccion("empleados")}>Empleados</button>
          <button className={`menu-item ${seccion === "platos" ? "active" : ""}`} onClick={() => setSeccion("platos")}>Platos</button>
          <button className={`menu-item ${seccion === "menus" ? "active" : ""}`} onClick={() => setSeccion("menus")}>Menús</button>
          <button className="menu-item">Ganancias</button>
          <button className="menu-item">Reservaciones</button>
        </nav>

        <div className="sidebar-footer">
          <button className="btn-logout-admin" onClick={() => { localStorage.removeItem("usuario"); 
            localStorage.removeItem("paginaActual"); setPagina("login"); }}>
            CERRAR SESIÓN
          </button>
        </div>
      </aside>

      <main className="admin-content-area">
        {seccion === "panel" && (
          <div className="dashboard-grid">
            <div className="stats-row">
              <div className="stat-card">
                <h3>Pedidos Realizados</h3>
                <p className="stat-number">{pedidosRealizados}</p>
              </div>
              <div className="stat-card">
                <h3>Ganancias de hoy</h3>
                <p className="stat-number">{formatPrecio(gananciasHoy)} COP</p>
              </div>
              <div className="stat-card">
                <h3>Total Entregados</h3>
                <p className="stat-number">{totalEntregados}</p>
              </div>
            </div>

            <div className="main-stats-row">

              {/* ── MENU DEL DIA ── */}
              <div className="info-box menu-dia">
                <h2>MENU DEL DIA</h2>
                {menuDelDia.length === 0 ? (
                  <div className="empty-placeholder">
                    <p>Menú {`{Hoy}`}</p>
                    <span>Sin platos asignados — ve a <strong>Menús</strong> para armar el menú</span>
                  </div>
                ) : (
                  <div style={{ overflowY: "auto", maxHeight: "260px", paddingRight: "4px" }}>
                    {menuPlatos.length > 0 && (
                      <div style={{ marginBottom: "0.5rem" }}>
                        <p style={{ color: "#e87d2a", fontSize: "0.8rem", fontWeight: "700", marginBottom: "0.3rem" }}>PLATOS</p>
                        {menuPlatos.map((p, i) => (
                          <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "4px 0", borderBottom: "1px solid rgba(255,255,255,0.07)", fontSize: "0.85rem" }}>
                            <span style={{ color: "#eee" }}>{p.NombrePlato}</span>
                            <span style={{ color: "#e87d2a", fontWeight: "600" }}>{formatPrecio(p.Precio)}</span>
                          </div>
                        ))}
                      </div>
                    )}
                    {menuBebidas.length > 0 && (
                      <div>
                        <p style={{ color: "#e87d2a", fontSize: "0.8rem", fontWeight: "700", marginBottom: "0.3rem" }}>BEBIDAS</p>
                        {menuBebidas.map((p, i) => (
                          <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "4px 0", borderBottom: "1px solid rgba(255,255,255,0.07)", fontSize: "0.85rem" }}>
                            <span style={{ color: "#eee" }}>{p.NombrePlato}</span>
                            <span style={{ color: "#e87d2a", fontWeight: "600" }}>{formatPrecio(p.Precio)}</span>
                          </div>
                        ))}
                      </div>
                    )}
                    <p style={{ color: "#888", fontSize: "0.75rem", marginTop: "0.5rem", textAlign: "right" }}>
                      {menuDelDia.length} ítems en el menú
                    </p>
                  </div>
                )}
              </div>

              {/* ── MESAS OCUPADAS ── */}
              <div className="info-box mesas-ocupadas">
                <h2>Mesas Ocupadas</h2>
                <div className="circle-progress">
                  <svg viewBox="0 0 100 100" style={{ width: "120px", height: "120px" }}>
                    <circle cx="50" cy="50" r="40" fill="none" stroke="#333" strokeWidth="10"/>
                    <circle
                      cx="50" cy="50" r="40"
                      fill="none"
                      stroke="#e87d2a"
                      strokeWidth="10"
                      strokeDasharray={`${2 * Math.PI * 40}`}
                      strokeDashoffset={`${2 * Math.PI * 40 * (1 - porcentajeOcupadas / 100)}`}
                      strokeLinecap="round"
                      transform="rotate(-90 50 50)"
                      style={{ transition: "stroke-dashoffset 0.5s ease" }}
                    />
                    <text x="50" y="55" textAnchor="middle" fill="white" fontSize="22" fontWeight="bold">
                      {mesasOcupadas}
                    </text>
                  </svg>
                </div>
                <p>Mesas ocupadas</p>
                <p style={{ color: "#888", fontSize: "0.8rem" }}>{mesasOcupadas} de {totalMesas} ({porcentajeOcupadas}%)</p>
              </div>
            </div>
          </div>
        )}

        {seccion === "empleados" && <Empleados />}
        {seccion === "platos" && <Platos />}
        {seccion === "menus" && <Menus />}
      </main>

    </div>
  )
}

export default Panel_Administrador;