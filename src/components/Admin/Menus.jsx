import { useEffect, useState } from "react"
import axios from "axios"
import '../../../Hojas_de_Estilo/Administrador.css';
import '../../App.css';

const IMG_CATEGORIA = {
    "1": "/CartaCorriente.png",
    "2": "/CartaComidaRapida.png",
    "3": "/CartaEspecial.png",
    "4": "/CartaBebidas.png",
}

function Menus() {
    const [platos, setPlatos] = useState([])
    const [categorias, setCategorias] = useState([])
    const [cargando, setCargando] = useState(true)
    const [error, setError] = useState(null)
    const [menuDelDia, setMenuDelDia] = useState([])
    const [filtro, setFiltro] = useState("todas")
    const [modalConfirmar, setModalConfirmar] = useState(false)
    const [menuSubido, setMenuSubido] = useState(false)

    useEffect(() => {
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
        cargarDatos()

        // Si ya habia un menu subido, lo muestra
        const menuGuardado = localStorage.getItem("menuDelDia")
        if (menuGuardado) setMenuSubido(true)
    }, [])

    const agregarAlMenu = (plato) => {
        setMenuDelDia(prev => [...prev, { ...plato, _uid: Date.now() + Math.random() }])
        setMenuSubido(false) // si agrega platos nuevos, el menu ya no esta subido
    }

    const quitarDelMenu = (uid) => {
        setMenuDelDia(prev => prev.filter(p => p._uid !== uid))
        setMenuSubido(false)
    }

    const limpiarMenu = () => {
        setMenuDelDia([])
        setMenuSubido(false)
    }

    // Guarda el menu en localStorage y cierra el modal
    const confirmarSubida = () => {
        const menuAGuardar = menuDelDia.map(({ _uid, ...resto }) => resto) // quita el _uid temporal
        localStorage.setItem("menuDelDia", JSON.stringify(menuAGuardar))
        setModalConfirmar(false)
        setMenuSubido(true)
    }

    const nombreCategoria = (id) =>
        categorias.find(c => c.id === id)?.NombreCategoria ?? "Sin categoría"

    const formatPrecio = (precio) => `$${precio.toLocaleString("es-CO")}`

    const platosFiltrados = platos.filter(p =>
        filtro === "todas" || p.CategoriaId === filtro
    )

    const menuPlatos = menuDelDia.filter(p => p.CategoriaId !== "4")
    const menuBebidas = menuDelDia.filter(p => p.CategoriaId === "4")

    if (cargando) return <p className="emp-estado-msg">Cargando platos...</p>
    if (error) return <p className="emp-estado-msg emp-error">{error}</p>

    return (
        <div className="emp-contenedor">

            <div className="emp-header">
                <h1 className="emp-titulo-pagina">MENU HOY</h1>
                <p className="emp-subtitulo">¡Arma el menú de hoy jefecillo!</p>
            </div>

            <div className="menus-layout">

                {/* ── Columna izquierda: platos ── */}
                <div className="menus-col-platos">
                    <h3 className="menus-col-titulo">Platos</h3>

                    <div className="menus-filtros">
                        <button className={`platos-filtro-btn ${filtro === "todas" ? "activo" : ""}`} onClick={() => setFiltro("todas")}>Todos</button>
                        {categorias.map(cat => (
                            <button key={cat.id} className={`platos-filtro-btn ${filtro === cat.id ? "activo" : ""}`} onClick={() => setFiltro(cat.id)}>
                                {cat.NombreCategoria}
                            </button>
                        ))}
                    </div>

                    <div className="menus-platos-lista">
                        {platosFiltrados.map(plato => (
                            <div key={plato.id} className="menus-plato-item" onClick={() => agregarAlMenu(plato)} title="Click para agregar al menú">
                                <img src={IMG_CATEGORIA[plato.CategoriaId] ?? "/CartaCorriente.png"} alt={plato.NombrePlato} className="menus-plato-img" />
                                <div className="menus-plato-info">
                                    <p className="menus-plato-nombre">{plato.NombrePlato}</p>
                                    <p className="menus-plato-desc">{plato.Descripcion}</p>
                                    <p className="menus-plato-precio">{formatPrecio(plato.Precio)}</p>
                                </div>
                                <span className="menus-plato-add">＋</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* ── Columna derecha: menu armado ── */}
                <div className="menus-col-menu">
                    <div className="menus-menu-header">
                        <h3 className="menus-col-titulo">Menú del Día</h3>
                        {menuDelDia.length > 0 && (
                            <button className="menus-btn-limpiar" onClick={limpiarMenu}>Limpiar todo</button>
                        )}
                    </div>

                    {/* Badge de menu activo */}
                    {menuSubido && (
                        <div className="menus-badge-subido">Menú activo — visible para clientes y meseros</div>
                    )}

                    {menuDelDia.length === 0 ? (
                        <div className="menus-menu-vacio">
                            <p>Aún no hay platos</p>
                            <span>Click en un plato para agregarlo</span>
                        </div>
                    ) : (
                        <>
                            {menuPlatos.length > 0 && (
                                <div className="menus-menu-grupo">
                                    <p className="menus-menu-grupo-label"> Platos</p>
                                    {menuPlatos.map((plato, i) => (
                                        <div key={plato._uid} className="menus-menu-item">
                                            <span className="menus-menu-num">{i + 1}</span>
                                            <span className="menus-menu-nombre">{plato.NombrePlato}</span>
                                            <span className="menus-menu-precio">{formatPrecio(plato.Precio)}</span>
                                            <button className="menus-btn-quitar" onClick={() => quitarDelMenu(plato._uid)}>✕</button>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {menuBebidas.length > 0 && (
                                <div className="menus-menu-grupo">
                                    <p className="menus-menu-grupo-label"> Bebidas</p>
                                    {menuBebidas.map((plato, i) => (
                                        <div key={plato._uid} className="menus-menu-item">
                                            <span className="menus-menu-num">{i + 1}</span>
                                            <span className="menus-menu-nombre">{plato.NombrePlato}</span>
                                            <span className="menus-menu-precio">{formatPrecio(plato.Precio)}</span>
                                            <button className="menus-btn-quitar" onClick={() => quitarDelMenu(plato._uid)}>✕</button>
                                        </div>
                                    ))}
                                </div>
                            )}

                            <div className="menus-menu-total">
                                <span>Total platos en menú:</span>
                                <span className="menus-total-num">{menuDelDia.length}</span>
                            </div>

                            {/* Boton subir */}
                            <button className="menus-btn-subir" onClick={() => setModalConfirmar(true)}>
                                ↑ Subir Menú del Día
                            </button>
                        </>
                    )}
                </div>
            </div>

            {/* ── Modal de confirmacion ── */}
            {modalConfirmar && (
                <div className="emp-modal-overlay" onClick={() => setModalConfirmar(false)}>
                    <div className="emp-modal menus-modal-confirmar" onClick={e => e.stopPropagation()}>

                        <div className="emp-modal-header">
                            <h2 className="emp-modal-titulo">MENÚ DE HOY</h2>
                        </div>

                        <div className="emp-modal-body">
                            <p className="menus-confirmar-texto">
                                Este será el menú de hoy.<br />¿Está todo correcto?
                            </p>

                            {/* Resumen rapido */}
                            <div className="menus-confirmar-resumen">
                                <span>{menuPlatos.length} platos</span>
                                <span>{menuBebidas.length} bebidas</span>
                            </div>
                        </div>

                        <div className="emp-modal-footer">
                            <button className="emp-btn-cancelar" onClick={() => setModalConfirmar(false)}>
                                No
                            </button>
                            <button className="emp-btn-guardar" onClick={confirmarSubida}>
                                ¡Sí, subir!
                            </button>
                        </div>

                    </div>
                </div>
            )}

        </div>
    )
}

export default Menus;