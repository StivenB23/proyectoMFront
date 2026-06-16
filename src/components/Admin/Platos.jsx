import { useEffect, useState } from "react"
import axios from "axios"
import '../../../Hojas_de_Estilo/Administrador.css';
import '../../App.css';

// Imagenes por categoria (las que ya tienes en /public)
const IMG_CATEGORIA = {
    "1": "/CartaCorriente.png",
    "2": "/CartaComidaRapida.png",
    "3": "/CartaEspecial.png",
    "4": "/CartaBebidas.png",
}

function Platos() {
    const [platos, setPlatos] = useState([])
    const [categorias, setCategorias] = useState([])
    const [cargando, setCargando] = useState(true)
    const [error, setError] = useState(null)
    const [busqueda, setBusqueda] = useState("")
    const [filtroCategoria, setFiltroCategoria] = useState("todas")

    // Estados del modal de edicion
    const [platoEditando, setPlatoEditando] = useState(null)
    const [formEdicion, setFormEdicion] = useState({ Descripcion: "", Precio: "" })
    const [guardando, setGuardando] = useState(false)
    const [mensaje, setMensaje] = useState(null)

    useEffect(() => {
        cargarDatos()
    }, [])

    const cargarDatos = async () => {
        try {
            const resPlatos = await axios.get("http://localhost:3000/Platos")
            const resCategorias = await axios.get("http://localhost:3000/Categoria")
            setPlatos(resPlatos.data)
            setCategorias(resCategorias.data)
        } catch (err) {
            setError("No se pudo conectar con el servidor")
        } finally {
            setCargando(false)
        }
    }

    // Abre el modal con los datos actuales del plato
    const abrirEdicion = (plato) => {
        setPlatoEditando(plato)
        setFormEdicion({ Descripcion: plato.Descripcion, Precio: plato.Precio })
        setMensaje(null)
    }

    const cerrarEdicion = () => {
        setPlatoEditando(null)
        setFormEdicion({ Descripcion: "", Precio: "" })
        setMensaje(null)
    }

    const guardarCambios = async () => {
        setGuardando(true)
        try {
            await axios.patch(`http://localhost:3000/Platos/${platoEditando.id}`, {
                Descripcion: formEdicion.Descripcion,
                Precio: Number(formEdicion.Precio)
            })
            await cargarDatos()
            setMensaje({ tipo: "ok", texto: "Plato actualizado correctamente" })
            setTimeout(() => cerrarEdicion(), 1200)
        } catch (err) {
            setMensaje({ tipo: "error", texto: "Error al guardar los cambios" })
        } finally {
            setGuardando(false)
        }
    }

    // Filtra por busqueda y categoria al mismo tiempo
    const platosFiltrados = platos.filter(p => {
        const coincideBusqueda = p.NombrePlato.toLowerCase().includes(busqueda.toLowerCase())
        const coincideCategoria = filtroCategoria === "todas" || p.CategoriaId === filtroCategoria
        return coincideBusqueda && coincideCategoria
    })

    const nombreCategoria = (id) =>
        categorias.find(c => c.id === id)?.NombreCategoria ?? "Sin categoría"

    const formatPrecio = (precio) => `$${precio.toLocaleString("es-CO")}`

    if (cargando) return <p className="emp-estado-msg">Cargando platos...</p>
    if (error) return <p className="emp-estado-msg emp-error">{error}</p>

    return (
        <div className="emp-contenedor">

            {/* Header */}
            <div className="emp-header">
                <h1 className="emp-titulo-pagina">Gestión de Platos</h1>
                <p className="emp-subtitulo">{platos.length} platos registrados</p>
            </div>

            {/* Buscador */}
            <div className="platos-buscador-wrap">
                <input
                    className="platos-buscador"
                    type="text"
                    placeholder="Buscar..."
                    value={busqueda}
                    onChange={e => setBusqueda(e.target.value)}
                />
                <span className="platos-buscador-icon"></span>
            </div>

            {/* Filtro por categoria */}
            <div className="platos-filtros">
                <button
                    className={`platos-filtro-btn ${filtroCategoria === "todas" ? "activo" : ""}`}
                    onClick={() => setFiltroCategoria("todas")}
                >
                    Todos los Platos ↓
                </button>
                {categorias.map(cat => (
                    <button
                        key={cat.id}
                        className={`platos-filtro-btn ${filtroCategoria === cat.id ? "activo" : ""}`}
                        onClick={() => setFiltroCategoria(cat.id)}
                    >
                        {cat.NombreCategoria}
                    </button>
                ))}
            </div>

            {/* Grid de platos */}
            {platosFiltrados.length === 0 ? (
                <p className="emp-estado-msg">No se encontraron platos</p>
            ) : (
                <div className="platos-grid">
                    {platosFiltrados.map(plato => (
                        <div key={plato.id} className="plato-card">
                            <div className="plato-card-img-wrap">
                                <img
                                    src={IMG_CATEGORIA[plato.CategoriaId] ?? "/CartaCorriente.png"}
                                    alt={plato.NombrePlato}
                                    className="plato-card-img"
                                />
                                <span className="plato-card-categoria">{nombreCategoria(plato.CategoriaId)}</span>
                            </div>
                            <div className="plato-card-body">
                                <p className="plato-card-nombre">{plato.NombrePlato}</p>
                                <p className="plato-card-descripcion">{plato.Descripcion}</p>
                                <p className="plato-card-precio">{formatPrecio(plato.Precio)}</p>
                            </div>
                            <button className="emp-btn-editar" onClick={() => abrirEdicion(plato)}>
                                Editar
                            </button>
                        </div>
                    ))}
                </div>
            )}

            {/* Modal de edicion */}
            {platoEditando && (
                <div className="emp-modal-overlay" onClick={cerrarEdicion}>
                    <div className="emp-modal" onClick={e => e.stopPropagation()}>

                        <div className="emp-modal-header">
                            <h2 className="emp-modal-titulo">EDICIÓN</h2>
                            <p className="emp-modal-nombre">{platoEditando.NombrePlato}</p>
                        </div>

                        <div className="emp-modal-body">

                            {/* Imagen (solo visual, la imagen viene de la categoria) */}
                            <div className="plato-modal-img-wrap">
                                <img
                                    src={IMG_CATEGORIA[platoEditando.CategoriaId] ?? "/CartaCorriente.png"}
                                    alt={platoEditando.NombrePlato}
                                    className="plato-modal-img"
                                />
                                <span className="plato-modal-img-label">
                                    {nombreCategoria(platoEditando.CategoriaId)}
                                </span>
                            </div>

                            {/* Descripcion */}
                            <label className="emp-modal-label">Cambiar Descripción:</label>
                            <textarea
                                className="plato-modal-textarea"
                                value={formEdicion.Descripcion}
                                onChange={e => setFormEdicion({ ...formEdicion, Descripcion: e.target.value })}
                                rows={3}
                            />

                            {/* Precio */}
                            <label className="emp-modal-label">Cambiar Precio:</label>
                            <div className="plato-modal-precio-wrap">
                                <input
                                    className="emp-modal-input"
                                    type="number"
                                    min="0"
                                    value={formEdicion.Precio}
                                    onChange={e => setFormEdicion({ ...formEdicion, Precio: e.target.value })}
                                />
                                <span className="plato-modal-cop">COP</span>
                            </div>

                            {mensaje && (
                                <p className={`emp-modal-mensaje ${mensaje.tipo === "ok" ? "emp-modal-ok" : "emp-modal-err"}`}>
                                    {mensaje.texto}
                                </p>
                            )}
                        </div>

                        <div className="emp-modal-footer">
                            <button className="emp-btn-cancelar" onClick={cerrarEdicion} disabled={guardando}>
                                Cancelar
                            </button>
                            <button className="emp-btn-guardar" onClick={guardarCambios} disabled={guardando}>
                                {guardando ? "Guardando..." : "Editar"}
                            </button>
                        </div>

                    </div>
                </div>
            )}

        </div>
    )
}

export default Platos;