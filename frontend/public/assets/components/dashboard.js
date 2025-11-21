const { useState, useEffect } = React;

// Contexto para el tema
const ThemeContext = React.createContext();

// Componente Navbar
function Navbar() {
  const { darkMode, toggleDarkMode } = React.useContext(ThemeContext);
  return (
    <nav className="navbar navbar-expand-lg bg-primary navbar-dark">
      <div className="container-fluid">
        <a className="navbar-brand" href="#">
          <i className="bi bi-app-indicator me-2"></i>
          RENARD
        </a>
        <button className="navbar-toggler" type="button">
          <span className="navbar-toggler-icon"></span>
        </button>
        <div className="collapse navbar-collapse">
          <div className="d-flex ms-auto align-items-center">
            <button
              className="btn btn-outline-light me-2"
              onClick={toggleDarkMode}
            >
              <i className={`bi ${darkMode ? 'bi-sun' : 'bi-moon'}`}></i>
            </button>
            <div className="dropdown">
              <button className="btn btn-light dropdown-toggle" type="button" data-bs-toggle="dropdown">
                <i className="bi bi-person-circle me-1"></i>
                Usuario
              </button>
              <ul className="dropdown-menu dropdown-menu-end">
                <li><a className="dropdown-item" href="#">Perfil</a></li>
                <li><a className="dropdown-item" href="#">Configuración</a></li>
                <li><hr className="dropdown-divider" /></li>
                <li><a className="dropdown-item" href="#">Cerrar sesión</a></li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}

// Componente Sidebar
function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const { darkMode } = React.useContext(ThemeContext);

  const menuItems = [
    { icon: 'bi-house', text: 'Inicio', active: true },
    { icon: 'bi-person', text: 'Perfil' },
    { icon: 'bi-gear', text: 'Configuración' },
    { icon: 'bi-envelope', text: 'Mensajes' },
    { icon: 'bi-graph-up', text: 'Estadísticas' },
    { icon: 'bi-question-circle', text: 'Ayuda' }
  ];

  return (
    <aside className={`sidebar ${darkMode ? 'bg-dark' : 'bg-light'} ${collapsed ? 'sidebar-collapsed' : ''}`}>
      <div className="d-flex flex-column h-100">
        <div className="p-3 border-bottom">
          <button
            className="btn btn-link text-decoration-none"
            onClick={() => setCollapsed(!collapsed)}
          >
            <i className={`bi ${collapsed ? 'bi-chevron-right' : 'bi-chevron-left'}`}></i>
          </button>
        </div>
        <ul className="nav nav-pills flex-column mb-auto p-2">
          {menuItems.map((item, index) => (
            <li key={index} className="nav-item">
              <a
                href="#"
                className={`nav-link ${item.active ? 'active' : ''} ${darkMode ? 'text-white' : ''}`}
              >
                <div className="d-flex align-items-center menu-item">
                  <i className={`bi ${item.icon} me-3`}></i>
                  <span className="menu-text">{item.text}</span>
                </div>
              </a>
            </li>
          ))}
        </ul>
        <div className="mt-auto p-3 border-top">
          <small className={`${darkMode ? 'text-white-50' : 'text-muted'}`}>
            {collapsed ? 'v1.0' : 'Versión 1.0.0'}
          </small>
        </div>
      </div>
    </aside>
  );
}

// Componente Footer
function Footer() {
  const { darkMode } = React.useContext(ThemeContext);

  return (
    <footer className={`py-3 ${darkMode ? 'bg-dark text-white' : 'bg-light'}`}>
      <div className="container-fluid">
        <div className="row">
          <div className="col-md-6">
            <p className="mb-0">&copy; 2025 RENARD. Todos los derechos reservados.</p>
          </div>
          <div className="col-md-6 text-md-end">
            <a href="#" className={`text-decoration-none ${darkMode ? 'text-white-50' : 'text-muted'}`}>Términos</a>
            <span className="mx-2">•</span>
            <a href="#" className={`text-decoration-none ${darkMode ? 'text-white-50' : 'text-muted'}`}>Privacidad</a>
            <span className="mx-2">•</span>
            <a href="#" className={`text-decoration-none ${darkMode ? 'text-white-50' : 'text-muted'}`}>Contacto</a>
          </div>
        </div>
      </div>
    </footer>
  );
}

// Componente principal App (solo dashboard)
function App() {
  const [darkMode, setDarkMode] = useState(false);

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  useEffect(() => {
    if (darkMode) {
      document.body.classList.add('dark-mode');
    } else {
      document.body.classList.remove('dark-mode');
    }
  }, [darkMode]);

  return (
    <ThemeContext.Provider value={{ darkMode, toggleDarkMode }}>
      <div className="app-container">
        <Navbar />
        <Sidebar />
        <main className="p-4">
          <div className="container">
            <h2>Panel administrativo</h2>
            <p>Aquí iría el contenido del panel administrativo.</p>
          </div>
        </main>
        <Footer />
      </div>
    </ThemeContext.Provider>
  );
}

// Renderizar
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);
