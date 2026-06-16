import { useEffect, useState } from "react";
import axios from "axios";
import '../../Hojas_de_Estilo/MensajeCocina.css';
import '../App.css';

function MensajeCocina({ usuario, setPagina }) {
  const [pedidosListos, setPedidosListos] = useState([]);

  if (!usuario) {
    const usuarioGuardado = JSON.parse(localStorage.getItem("usuario"));
    if (usuarioGuardado) { usuario = usuarioGuardado; }
  }

  useEffect(() => {
    cargarNotificacionesCocina();
  }, []);

  const cargarNotificacionesCocina = async () => {
    try {
      const resPedidos = await axios.get("http://localhost:3000/Pedido?estadoPedido=listo");
      const resDetalles = await axios.get("http://localhost:3000/Detalle_pedidos");

      // Agrupar detalles por pedido
      const agrupados = resPedidos.data.map(pedido => {
        const detalles = resDetalles.data.filter(d => d.PedidoId === pedido.id);
        const platos = detalles.filter(d => d.CategoriaId !== "4");
        const bebidas = detalles.filter(d => d.CategoriaId === "4");
        return { ...pedido, detalles, platos, bebidas };
      });

      setPedidosListos(agrupados);
    } catch (error) {
      console.error("Error cargando pedidos listos:", error);
    }
  };

  const entregarPedido = async (id) => {
    try {
      await axios.patch(`http://localhost:3000/Pedido/${id}`, {
        estadoPedido: "entregado"
      });
      alert("¡Pedido entregado en mesa!");
      cargarNotificacionesCocina();
    } catch (error) {
      console.error("Error al entregar pedido:", error);
    }
  };

  return (
    <div className="mco-container">

      <header className="mco-header">
        <div className="mco-header-center">
          <h1 className="mco-titulo">Avisos de Cocina</h1>
          <p className="mco-mesero">Mesero: {usuario?.nombre}</p>
          <div className="mco-titulo-linea"></div>
        </div>
      </header>

      <div className="mco-lista">
        {pedidosListos.length === 0 ? (
          <div className="mco-vacio">
            <p>No hay pedidos listos por entregar.</p>
          </div>
        ) : (
          pedidosListos.map(pedido => (
            <div key={pedido.id} className="mco-card">

              <div className="mco-card-header">
                <span className="mco-badge-mesa">MESA {pedido.mesa}</span>
                <span className="mco-badge-listo">¡LISTO!</span>
                <span className="mco-total">${pedido.totalPagar?.toLocaleString("es-CO")}</span>
              </div>

              <div className="mco-card-body">

                {pedido.platos.length > 0 && (
                  <div className="mco-grupo">
                    <p className="mco-grupo-label">Platos</p>
                    {pedido.platos.map((d, i) => (
                      <div key={i} className="mco-detalle-item">
                        <div className="mco-detalle-info">
                          <span className="mco-detalle-nombre">{d.cantidadPedido}x {d.NombrePlato}</span>
                          {d.notasEspeciales && (
                            <span className="mco-detalle-nota">{d.notasEspeciales}</span>
                          )}
                        </div>
                        <span className="mco-detalle-precio">${d.precioFinal?.toLocaleString("es-CO")}</span>
                      </div>
                    ))}
                  </div>
                )}

                {pedido.bebidas.length > 0 && (
                  <div className="mco-grupo">
                    <p className="mco-grupo-label">Bebidas</p>
                    {pedido.bebidas.map((d, i) => (
                      <div key={i} className="mco-detalle-item">
                        <div className="mco-detalle-info">
                          <span className="mco-detalle-nombre">{d.cantidadPedido}x {d.NombrePlato}</span>
                          {d.notasEspeciales && (
                            <span className="mco-detalle-nota">{d.notasEspeciales}</span>
                          )}
                        </div>
                        <span className="mco-detalle-precio">${d.precioFinal?.toLocaleString("es-CO")}</span>
                      </div>
                    ))}
                  </div>
                )}

              </div>

              <div className="mco-card-footer">
                <button
                  className="mco-btn-entregar"
                  onClick={() => entregarPedido(pedido.id)}
                >
                  Confirmar Entrega en Mesa
                </button>
              </div>

            </div>
          ))
        )}
      </div>

      <button className="mco-btn-volver" onClick={() => setPagina("mesero")}>
        ← Volver al Panel
      </button>

    </div>
  );
}

export default MensajeCocina;