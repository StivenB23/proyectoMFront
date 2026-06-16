import { useEffect, useState } from "react";
import axios from "axios";
import '../../Hojas_de_Estilo/Cocinero.css';
import '../App.css';

function Panel_Cocinero({ usuario, setPagina }) {
  const [pedidosAgrupados, setPedidosAgrupados] = useState([]);

  if (!usuario) {
    const usuarioGuardado = JSON.parse(localStorage.getItem("usuario"));
    if (usuarioGuardado) { usuario = usuarioGuardado; }
  }

  useEffect(() => {
    cargarPedidosCocina();
  }, []);

  const cargarPedidosCocina = async () => {
    try {
      const resPedidos = await axios.get("http://localhost:3000/Pedido?estadoPedido=en_cocina");
      const resDetalles = await axios.get("http://localhost:3000/Detalle_pedidos");

      // Agrupar todos los detalles bajo su pedido
      const agrupados = resPedidos.data.map(pedido => {
        const detalles = resDetalles.data.filter(d => d.PedidoId === pedido.id);
        const platos = detalles.filter(d => d.CategoriaId !== "4");
        const bebidas = detalles.filter(d => d.CategoriaId === "4");
        return { ...pedido, detalles, platos, bebidas };
      });

      setPedidosAgrupados(agrupados);
    } catch (error) {
      console.error("Error cargando pedidos para cocina:", error);
    }
  };

  const marcarComoListo = async (id) => {
    try {
      await axios.patch(`http://localhost:3000/Pedido/${id}`, {
        estadoPedido: "listo"
      });
      cargarPedidosCocina();
      alert("¡El pedido está listo para ser entregado!");
    } catch (error) {
      console.error("Error al actualizar el estado:", error);
    }
  };

  return (
    <div className="kitchen-container">

      <header className="kitchen-header">
        <div className="kitchen-header-center">
          <h1 className="kitchen-main-title">Panel de Cocina</h1>
          <p className="kitchen-chef-info">Chef: {usuario?.nombre} {usuario?.apellido}</p>
        </div>
        <button onClick={() => setPagina("login")} className="kitchen-btn-salir">SALIR</button>
      </header>

      <div className="kitchen-board">
        <h2 className="kitchen-subtitle">ÓRDENES POR PREPARAR</h2>

        <div className="orders-list">
          {pedidosAgrupados.length === 0 ? (
            <div className="no-orders-msg">
              <p>No hay pedidos pendientes. ¡Buen trabajo, Chef!</p>
            </div>
          ) : (
            pedidosAgrupados.map(pedido => (
              <div key={pedido.id} className="order-card">

                <div className="order-card-header">
                  <span className="order-table-badge">MESA {pedido.mesa}</span>
                  <span className="order-total">${pedido.totalPagar?.toLocaleString("es-CO")}</span>
                  <span className="order-fecha">{pedido.fecha_pedido}</span>
                </div>

                <div className="order-card-body">

                  {/* Platos */}
                  {pedido.platos.length > 0 && (
                    <div className="order-grupo">
                      <p className="order-grupo-label">Platos</p>
                      {pedido.platos.map((d, i) => (
                        <div key={i} className="order-detalle-item">
                          <div className="order-detalle-info">
                            <span className="order-detalle-nombre">{d.cantidadPedido}x {d.NombrePlato}</span>
                            {d.notasEspeciales && (
                              <span className="order-detalle-nota">{d.notasEspeciales}</span>
                            )}
                          </div>
                          <span className="order-detalle-precio">${d.precioFinal?.toLocaleString("es-CO")}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Bebidas */}
                  {pedido.bebidas.length > 0 && (
                    <div className="order-grupo">
                      <p className="order-grupo-label">Bebidas</p>
                      {pedido.bebidas.map((d, i) => (
                        <div key={i} className="order-detalle-item">
                          <div className="order-detalle-info">
                            <span className="order-detalle-nombre">{d.cantidadPedido}x {d.NombrePlato}</span>
                            {d.notasEspeciales && (
                              <span className="order-detalle-nota">{d.notasEspeciales}</span>
                            )}
                          </div>
                          <span className="order-detalle-precio">${d.precioFinal?.toLocaleString("es-CO")}</span>
                        </div>
                      ))}
                    </div>
                  )}

                </div>

                <div className="order-card-footer">
                  <button
                    onClick={() => marcarComoListo(pedido.id)}
                    className="btn-order-ready"
                  >
                    PEDIDO LISTO 
                  </button>
                </div>

              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

export default Panel_Cocinero;