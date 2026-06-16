import '../../Hojas_de_Estilo/Mesero.css';
import '../App.css';
import axios from "axios";
import { useEffect, useState } from "react";

function Panel_Mesero({ usuario, setPagina }) {
  const [mesas, setMesas] = useState([]);
  const [countClientes, setCountClientes] = useState(0);
  const [countCocina, setCountCocina] = useState(0);

  if (!usuario) {
    const usuarioGuardado = JSON.parse(localStorage.getItem("usuario"));
    if (usuarioGuardado) { usuario = usuarioGuardado; }
  }

  const cargarDatosPanel = async () => {
    try {
      const resMesas = await axios.get('http://localhost:3000/Mesas');
      setMesas(resMesas.data);

      const resClientes = await axios.get('http://localhost:3000/Pedido?estadoPedido=esperando_mesero');
      setCountClientes(resClientes.data.length);

      const resCocina = await axios.get('http://localhost:3000/Pedido?estadoPedido=listo');
      setCountCocina(resCocina.data.length);
    } catch (error) {
      console.error("Error al cargar datos del panel:", error);
    }
  };

  useEffect(() => {
    cargarDatosPanel();
  }, []);

  const cambiarEstadoMesa = async (e, mesaId, estadoActual) => {
    e.stopPropagation();
    const nuevoEstado = estadoActual === "disponible" ? "ocupada" : "disponible";
    try {
      await axios.patch(`http://localhost:3000/Mesas/${mesaId}`, { estado: nuevoEstado });
      cargarDatosPanel();
    } catch (error) {
      console.error("Error al cambiar estado de la mesa:", error);
    }
  };

  const cerrarSesion = () => {
    localStorage.removeItem("usuario");
    localStorage.removeItem("paginaActual");
    setPagina("login");
  };

  return (
    <div className="Panel-container">      
      <div className="header">
        <h1 className="titulo-panel">PANEL MESERO</h1>
        <div className="perfil-info">
          <div>
            <span className="label-rol">MESERO ACTIVO</span>
            <h2 className="nombre-usuario">{usuario?.nombre}</h2>
          </div>
          <button className="btn-salir-header" onClick={cerrarSesion}>SALIR</button>
        </div>
      </div>

      <div className='seccion-mesas'>
        <div className='titulo-seccion'>
          <h3>MESAS</h3>
        </div>
        <div className='mesas-grid'>
          {mesas.map((mesa) => (
            <div key={mesa.id}
              className={`mesa-card ${mesa.estado}`}
              onClick={() => {
                localStorage.setItem("mesaSeleccionada", mesa.numero);
                setPagina("menu");
              }}
            >
              <span className='numero-mesa'>{mesa.numero}</span>
              <span className='estado-texto'>{mesa.estado.toUpperCase()}</span>
              <button 
                className="btn-cambiar-estado"
                onClick={(e) => cambiarEstadoMesa(e, mesa.id, mesa.estado)}
              >
                {mesa.estado === "disponible" ? "OCUPAR" : "LIBERAR"}
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className='contenedor-mensajes'>
        <div className="btn-mensaje1" onClick={() => setPagina("mensajecliente")}>
          <h3>Mensajes Clientes</h3>
          <p className={countClientes > 0 ? "notificacion-activa" : ""}>{countClientes}</p>
        </div>
        <div className="btn-mensaje2" onClick={() => setPagina("mensajecocina")}>
          <h3>Mensajes Cocina</h3>
          <p className={countCocina > 0 ? "notificacion-activa" : ""}>{countCocina}</p>
        </div>
      </div>

      <div className="Botones">
        <button className="btn-1" onClick={() => setPagina("menu")}>Menu del Día</button>
        <button className="btn-2" onClick={() => setPagina("mensajecliente")}>Mensajes Clientes</button>
        <button className="btn-3" onClick={() => setPagina("mensajecocina")}>Mensajes Cocina</button>
      </div>
    </div>
  );
}

export default Panel_Mesero;