import { useState, useEffect } from "react"
import axios from "axios"
import bcrypt from "bcryptjs"
import '../../Hojas_de_Estilo/Login.css'; // Importamos la nueva hoja de estilo
import '../App.css';

function Login({ setPagina, setUsuario }) {
  const [credentials, setCredentials] = useState({ user: "", pass: "" })
  const [mesas, setMesas] = useState([]);
  const [mesaSeleccionada, setMesaSeleccionada] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault()
    const usuarios = (await axios.get("http://localhost:3000/users")).data

    const usuarioEncontrado = usuarios.find((u) => u.email === credentials.user)

    if (!usuarioEncontrado) {
      alert("Usuario no encontrado")
      return
    }

    const passwordValida = await bcrypt.compare(credentials.pass, usuarioEncontrado.password)

    if (!passwordValida) {
      alert("contraseña incorrecta")
      return
    }

    const rolUsuario = usuarioEncontrado.rol
    localStorage.setItem("usuario", JSON.stringify(usuarioEncontrado))
    setUsuario(usuarioEncontrado)

    if (rolUsuario === "Mesero") {
      setPagina("mesero")
    } else if (rolUsuario === "Cocinero") {
      setPagina("cocinero")
    } else if (rolUsuario === "Administrador") {
      setPagina("admin")
    } else {
      alert("Rol no permitido")
    }
  }

  useEffect(() => {
    const obtenerMesas = async () => {
      try {
        const res = await axios.get("http://localhost:3000/Mesas");
        setMesas(res.data);
      } catch (error) {
        console.error("Error al traer mesas:", error);
      }
    };
    obtenerMesas();
  }, []);

  const handleIngresoCliente = async (e) => {
    e.preventDefault();
    if (!mesaSeleccionada) {
      alert("Por favor, selecciona una mesa primero");
      return;
    }

    try {
      const mesaEncontrada = mesas.find(m => m.numero.toString() === mesaSeleccionada.toString());
      if (mesaEncontrada) {
        await axios.patch(`http://localhost:3000/Mesas/${mesaEncontrada.id}`, {
          estado: "ocupada"
        });
      }
      localStorage.setItem("mesa_activa", mesaSeleccionada);
      setPagina("vistacliente");
    } catch (error) {
      console.error("Error al actualizar la mesa:", error);
      alert("No se pudo conectar con el servidor para asignar la mesa.");
    }
  };

  return (
    <div className='login-page-container'>
      
      {/* FORMULARIO EMPLEADOS / ADMIN */}
      <form className='login-form-staff' onSubmit={handleSubmit}>
        <h2 className='login-title-staff'>Inicio de Sesión</h2>
        <input 
          type="text" 
          placeholder="Nombre de usuario" 
          value={credentials.user} 
          onChange={(e) => setCredentials({...credentials, user: e.target.value})}
          className="login-input-staff"
        />

        <input 
          type="password" 
          placeholder="Contraseña" 
          value={credentials.pass} 
          onChange={(e) => setCredentials({...credentials, pass: e.target.value})}
          className="login-input-staff"
        />

        <button type="submit" className="login-button-staff">Siguiente</button>
        
        <p className="login-forgot-pass" onClick={() => setPagina("recuperacion")}>
          Recuperación contraseña
        </p>
      </form>

      {/* FORMULARIO CLIENTE */}
      <form className="login-form-client" onSubmit={handleIngresoCliente}>
        <h2 className="login-title-client">Menú Digital - Cliente</h2>
        
        <select 
          value={mesaSeleccionada} 
          onChange={(e) => setMesaSeleccionada(e.target.value)}
          className="login-select-client"
        >
          <option value="">-- Elige tu Mesa --</option>
          {mesas.map((m) => (
            <option key={m.id} value={m.numero} disabled={m.estado === "ocupada"}>
              Mesa #{m.numero} {m.estado === "ocupada" ? "(Ocupada)" : ""}
            </option>
          ))}
        </select>

        <button type="submit" className="login-button-client">
          Ver Menú y Ordenar
        </button>
      </form>
    </div>
  )
}

export default Login;