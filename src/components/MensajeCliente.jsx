import { useState, useEffect } from "react";
import axios from "axios";
import '../App.css';
import '../../Hojas_de_Estilo/MensajeCliente.css';

function MensajeCliente({ setPagina }) {
  const [pedidosAgrupados, setPedidosAgrupados] = useState([]);

  useEffect(() => {
    cargarPedidos();
  }, []);

  const cargarPedidos = async () => {
    try {
      const resPedidos = await axios.get("http://localhost:3000/Pedido?estadoPedido=esperando_mesero");
      const resDetalles = await axios.get("http://localhost:3000/Detalle_pedidos");

      // Agrupar todos los detalles de cada pedido bajo su PedidoId
      const agrupados = resPedidos.data.map(pedido => {
        const detalles = resDetalles.data.filter(d => d.PedidoId === pedido.id);
        const platos = detalles.filter(d => d.CategoriaId !== "4");
        const bebidas = detalles.filter(d => d.CategoriaId === "4");
        return { ...pedido, detalles, platos, bebidas };
      });

      setPedidosAgrupados(agrupados);
    } catch (error) {
      console.error("Error cargando pedidos", error);
    }
  };

  const aprobarPedido = async (pedidoId, totalPagar) => {
    try {
      await axios.patch(`http://localhost:3000/Pedido/${pedidoId}`, {
        estadoPedido: "en_cocina",
        totalPagar
      });
      alert("¡Pedido enviado a cocina!");
      cargarPedidos();
    } catch (error) {
      console.error("Error aprobando pedido", error);
    }
  };

  return (
    <div className="mc-container">

      <header className="mc-header">
        <div className="mc-header-center">
          <h1 className="mc-titulo">Mensajes Clientes</h1>
          <div className="mc-titulo-linea"></div>
        </div>
      </header>

      <div className="mc-lista">
        {pedidosAgrupados.length === 0 ? (
          <div className="mc-vacio">
            <p>No hay pedidos pendientes.</p>
          </div>
        ) : (
          pedidosAgrupados.map(pedido => (
            <div key={pedido.id} className="mc-card">

              {/* Cabecera de la card */}
              <div className="mc-card-header">
                <span className="mc-badge-mesa">MESA {pedido.mesa}</span>
                <span className="mc-fecha">{pedido.fecha_pedido}</span>
                <span className="mc-total-header">${pedido.totalPagar?.toLocaleString("es-CO")}</span>
              </div>

              <div className="mc-card-body">

                {/* Platos */}
                {pedido.platos.length > 0 && (
                  <div className="mc-grupo">
                    <p className="mc-grupo-label">Platos</p>
                    {pedido.platos.map((d, i) => (
                      <div key={i} className="mc-detalle-item">
                        <div className="mc-detalle-info">
                          <span className="mc-detalle-nombre">{d.cantidadPedido}x {d.NombrePlato}</span>
                          {d.notasEspeciales && (
                            <span className="mc-detalle-nota">{d.notasEspeciales}</span>
                          )}
                        </div>
                        <span className="mc-detalle-precio">${d.precioFinal?.toLocaleString("es-CO")}</span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Bebidas */}
                {pedido.bebidas.length > 0 && (
                  <div className="mc-grupo">
                    <p className="mc-grupo-label">Bebidas</p>
                    {pedido.bebidas.map((d, i) => (
                      <div key={i} className="mc-detalle-item">
                        <div className="mc-detalle-info">
                          <span className="mc-detalle-nombre">{d.cantidadPedido}x {d.NombrePlato}</span>
                          {d.notasEspeciales && (
                            <span className="mc-detalle-nota">{d.notasEspeciales}</span>
                          )}
                        </div>
                        <span className="mc-detalle-precio">${d.precioFinal?.toLocaleString("es-CO")}</span>
                      </div>
                    ))}
                  </div>
                )}

              </div>

              {/* Botón confirmar */}
              <div className="mc-card-footer">
                <button
                  className="mc-btn-confirmar"
                  onClick={() => aprobarPedido(pedido.id, pedido.totalPagar)}
                >
                  Enviar a Cocina
                </button>
              </div>

            </div>
          ))
        )}
      </div>

      <button className="mc-btn-volver" onClick={() => setPagina("mesero")}>
        ← Volver al Panel
      </button>

    </div>
  );
}

export default MensajeCliente;