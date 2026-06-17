import { useEffect, useState } from "react";
import api from "../services/api";
import { marcarPedidoEntregado } from "../services/pedidos";
import '../styles/Cocinero.css';
import '../App.css';

function Panel_Cocinero({ usuario, setPagina }) {
  const [pedidosCocina, setPedidosCocina] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [marcandoEntregado, setMarcandoEntregado] = useState(null);

  if (!usuario) {
    const usuarioGuardado = JSON.parse(localStorage.getItem("usuario"));
    if (usuarioGuardado) { usuario = usuarioGuardado; }
  }

  useEffect(() => {
    cargarPedidosCocina();
    // Refresca cada 15 segundos para ver nuevos pedidos
    const intervalo = setInterval(cargarPedidosCocina, 15000);
    return () => clearInterval(intervalo);
  }, []);

  const cargarPedidosCocina = async () => {
    try {
      const res = await api.get("/mesas/pedidos/activos/cocina");
      const pedidos = res.data?.datos || [];
      setPedidosCocina(pedidos);
      setCargando(false);
    } catch (error) {
      console.error("Error cargando pedidos de cocina:", error);
      setCargando(false);
    }
  };

  const marcarComoEntregado = async (pedidoId) => {
    if (!pedidoId) return;
    
    setMarcandoEntregado(pedidoId);
    try {
      await marcarPedidoEntregado(pedidoId);
      // Refresca la lista inmediatamente después de cambiar estado
      await cargarPedidosCocina();
    } catch (error) {
      alert(error?.response?.data?.error || "No se pudo marcar el pedido como entregado");
    } finally {
      setMarcandoEntregado(null);
    }
  };

  const formatearTiempo = (minutos) => {
    if (minutos < 1) return "< 1 min";
    if (minutos < 60) return `${Math.floor(minutos)} min`;
    const horas = Math.floor(minutos / 60);
    const mins = Math.floor(minutos % 60);
    return `${horas}h ${mins}m`;
  };

  return (
    <div className="kitchen-container">
      <header className="kitchen-header">
        <div className="kitchen-header-center">
          <h1 className="kitchen-main-title">PANEL DE COCINA</h1>
          <p className="kitchen-chef-info">Chef: {usuario?.nombre} {usuario?.apellido}</p>
        </div>
        <button onClick={() => { localStorage.removeItem("usuario"); localStorage.removeItem("paginaActual"); setPagina("login"); }} className="kitchen-btn-salir">
          SALIR
        </button>
      </header>

      <div className="kitchen-board">
        <h2 className="kitchen-subtitle">ÓRDENES PENDIENTES POR ENTREGAR</h2>

        {cargando ? (
          <div className="kitchen-loading">
            <p>Cargando pedidos...</p>
          </div>
        ) : pedidosCocina.length === 0 ? (
          <div className="kitchen-no-orders">
            <p>✓ No hay pedidos pendientes. ¡Buen trabajo, Chef!</p>
          </div>
        ) : (
          <div className="kitchen-orders-grid">
            {pedidosCocina.map((pedido) => (
              <div key={pedido.id} className="kitchen-order-card">
                
                {/* Header: Mesa, Mesero, Tiempo */}
                <div className="kitchen-order-header">
                  <div className="kitchen-order-mesa">
                    <span className="kitchen-mesa-number">MESA {pedido.mesa_numero}</span>
                  </div>
                  <div className="kitchen-order-meta">
                    {pedido.usuario?.nombre && (
                      <span className="kitchen-mesero">Mesero: {pedido.usuario.nombre}</span>
                    )}
                    <span className={`kitchen-tiempo ${Number(pedido.minutos_abierto || 0) > 20 ? "alerta" : ""}`}>
                      ⏱ {formatearTiempo(pedido.minutos_abierto || 0)}
                    </span>
                  </div>
                </div>

                {/* Body: Items a cocinar */}
                <div className="kitchen-order-body">
                  {(pedido.detalles || []).length === 0 ? (
                    <p className="kitchen-sin-items">Sin ítems para cocinar</p>
                  ) : (
                    <ul className="kitchen-items-list">
                      {pedido.detalles.map((detalle) => (
                        <li key={detalle.id} className="kitchen-item">
                          <span className="kitchen-item-qty">{detalle.cantidad}x</span>
                          <span className="kitchen-item-nombre">{detalle.platillo_nombre}</span>
                          {detalle.notas && (
                            <span className="kitchen-item-notas">→ {detalle.notas}</span>
                          )}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                {/* Footer: Botón Entregado */}
                <div className="kitchen-order-footer">
                  <button
                    className="kitchen-btn-entregado"
                    onClick={() => marcarComoEntregado(pedido.id)}
                    disabled={marcandoEntregado === pedido.id}
                  >
                    {marcandoEntregado === pedido.id ? "Procesando..." : "✓ LISTO PARA ENTREGAR"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Pie de página con contador */}
      <footer className="kitchen-footer">
        <p className="kitchen-footer-text">
          Total de pedidos pendientes: <strong>{pedidosCocina.length}</strong>
        </p>
      </footer>
    </div>
  );
}

export default Panel_Cocinero;