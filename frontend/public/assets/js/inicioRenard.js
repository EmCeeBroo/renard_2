// inicioRenard.js - Lógica para la página de inicio conectada a la base de datos

document.addEventListener('DOMContentLoaded', () => {
  // Inicializar navbar
  renderNavbar('navbar-container');
  
  // Cargar datos del usuario real
  cargarDatosUsuario();
  
  // Cargar historial de reservas real
  cargarHistorialReservas();
  
  // Inicializar efectos y animaciones
  inicializarEfectos();
});

/**
 * Función para cargar información REAL del usuario desde la sesión
 * Adaptada a tu estructura de auth.js
 */
async function cargarDatosUsuario() {
  try {
    // Obtener datos tal como los guardas en tu auth.js
    const userToken = localStorage.getItem('token'); // Usas 'token', no 'userToken'
    const usuarioData = localStorage.getItem('usuario'); 
    
    // Verificar si hay sesión activa
    if (!userToken || !usuarioData) {
      console.warn('No hay sesión activa');
      // Redirigir al login usando tu ruta exacta
      window.location.href = '../login/login.html';
      return;
    }
    
    // Parsear los datos del usuario
    const usuario = JSON.parse(usuarioData);
    
    // Crear el saludo igual que en tu auth.js
    const saludo = usuario.nombre && usuario.apellido 
      ? `${usuario.nombre} ${usuario.apellido}` 
      : usuario.correo;
    
    // Actualizar saludo personalizado con el nombre real del usuario
    const userGreeting = document.getElementById('userGreeting');
    if (userGreeting) {
      userGreeting.innerHTML = `<i class='bx bx-user'></i> Hola, ${saludo}`;
    }
    
    // Guardar en variables globales para usar en otras funciones
    window.currentUser = {
      id: usuario.id_usuario,
      token: userToken,
      nombre: saludo,
      correo: usuario.correo,
      rol: usuario.rol_fk
    };
    
  } catch (error) {
    //console.error('Error al cargar datos de usuario:', error);
    // En caso de error, mostrar nombre genérico
    const userGreeting = document.getElementById('userGreeting');
    if (userGreeting) {
      userGreeting.innerHTML = `<i class='bx bx-user'></i> Hola, Usuario`;
    }
    
    // Si hay error parseando, limpiar localStorage y redirigir
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');
    window.location.href = '../login/login.html';
  }
}

/**
 * Función CORRECTA adaptada a tu auth.js
 */
async function cargarHistorialReservas() {
  const contenedor = document.getElementById('recentReservations');
  
  if (!contenedor) {
    console.warn('Contenedor de reservas no encontrado');
    return;
  }
  
  try {
    // USAR TUS CLAVES REALES del localStorage (como en tu auth.js)
    const userToken = localStorage.getItem('token');     // ← TU CLAVE REAL
    const usuarioData = localStorage.getItem('usuario'); // ← TU CLAVE REAL
    
    if (!userToken || !usuarioData) {
      console.warn('No hay datos de sesión para cargar reservas');
      mostrarEstadoPrimeraReserva(contenedor); // Cambié esto también
      return;
    }
    
    // Parsear el usuario tal como lo guardas
    const usuario = JSON.parse(usuarioData);    
    // Mostrar loading mientras carga
    contenedor.innerHTML = `
      <div class="loading-state">
        <i class='bx bx-loader-alt bx-spin'></i>
        <p>Cargando tus reservas...</p>
      </div>
    `;
    
    // Llamada REAL usando el ID del usuario parseado
    const response = await fetch(`http://192.168.0.9:3000/renard/historial-reservacion/usuario?id_usuario=${usuario.id_usuario}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${userToken}`,
        'Content-Type': 'application/json'
      }
    });
        
    if (!response.ok) {
      throw new Error(`Error HTTP: ${response.status}`);
    }
    
    const reservas = await response.json();
    
    // Verificar si tiene reservas
    if (reservas && reservas.length > 0) {
      // Si tiene reservas, mostrar las últimas 3
      mostrarReservasRecientes(contenedor, reservas.slice(0, 3));
    } else {
      // Si NO tiene reservas, mostrar estado para hacer primera reserva
      mostrarEstadoPrimeraReserva(contenedor);
    }
    
  } catch (error) {
    console.error('Error al cargar historial de reservas:', error);
    mostrarErrorCargaReservas(contenedor);
  }
}

/**
 * Mostrar las reservas recientes del usuario
 * @param {HTMLElement} contenedor - Elemento donde mostrar las reservas
 * @param {Array} reservas - Array de reservas del usuario
 */
function mostrarReservasRecientes(contenedor, reservas) {
  contenedor.innerHTML = '';
  
  reservas.forEach(reserva => {
    const reservaElement = crearElementoReserva(reserva);
    contenedor.appendChild(reservaElement);
  });
  
  // Agregar botón para ver todas las reservas
  const verTodasBtn = document.createElement('div');
  verTodasBtn.className = 'ver-todas-btn';
  verTodasBtn.innerHTML = `
    <a href="../viewsrenard/historialReservacion.html" class="btn-secondary">
      <i class='bx bx-list-ul'></i> Ver todas mis reservas
    </a>
  `;
  contenedor.appendChild(verTodasBtn);
}

/**
 * Mostrar estado cuando el usuario NO tiene reservas (primera vez)
 * @param {HTMLElement} contenedor - Elemento donde mostrar el estado
 */
function mostrarEstadoPrimeraReserva(contenedor) {
  contenedor.innerHTML = `
    <div class="empty-state">
      <i class='bx bx-calendar-x'></i>
      <h3>¡Haz tu primera reserva!</h3>
      <p>Aún no tienes reservas. Comienza tu experiencia gastronómica reservando en los mejores restaurantes.</p>
      <br>
      <a href="../viewsrenard/reservaRenard.html" class="btn-primary">
        <i class='bx bx-calendar-plus'></i> Hacer Primera Reserva
      </a>
    </div>
  `;
}

/**
 * Mostrar error al cargar reservas
 * @param {HTMLElement} contenedor - Elemento donde mostrar el error
 */
function mostrarErrorCargaReservas(contenedor) {
  contenedor.innerHTML = `
    <div class="empty-state">
      <i class='bx bx-error-circle'></i>
      <h3>Error al cargar reservas</h3>
      <p>No pudimos cargar tu historial en este momento. Por favor, intenta más tarde.</p>
      <br>
      <button onclick="cargarHistorialReservas()" class="btn-secondary">
        <i class='bx bx-refresh'></i> Intentar de nuevo
      </button>
    </div>
  `;
}

/**
 * Mostrar estado cuando no hay sesión
 * @param {HTMLElement} contenedor - Elemento donde mostrar el estado
 */
function mostrarEstadoSinSesion(contenedor) {
  contenedor.innerHTML = `
    <div class="empty-state">
      <i class='bx bx-user-x'></i>
      <h3>Sesión expirada</h3>
      <p>Tu sesión ha expirado. Por favor, inicia sesión nuevamente.</p>
      <br>
      <a href="../login/login.html" class="btn-primary">
        <i class='bx bx-log-in'></i> Iniciar Sesión
      </a>
    </div>
  `;
}

/**
 * Función para crear el elemento HTML de una reserva REAL
 * @param {Object} reserva - Objeto con datos reales de la reserva desde tu BD
 * @returns {HTMLElement} - Elemento div con la información de la reserva
 */
function crearElementoReserva(reserva) {
  const div = document.createElement('div');
  div.className = 'reservation-item';
  
  // Formatear fecha de la reserva real
  const fechaFormateada = formatearFecha(reserva.fecha);
  
  // Determinar estado de la reserva
  const estadoReserva = determinarEstadoReserva(reserva);

  //Obtener nombre del Restaurante (NECESITAMOS HACER UN JOIN O TENERLO EN LA RESPUESTA)
  const nombreRestaurante = reserva.nombre_restaurante || `Restaurante ID: ${reserva.restaurante_fk}`;
  
  div.innerHTML = `
    <h4><i class='bx bx-store'></i> ${nombreRestaurante}</h4>
    <p><i class='bx bx-calendar'></i> <strong>Fecha:</strong> ${fechaFormateada}</p>
    <p><i class='bx bx-time'></i> <strong>Hora:</strong> ${reserva.hora_inicio}${reserva.hora_fin ? ` - ${reserva.hora_fin}` : ''}</p>
    <p><i class='bx bx-user'></i> <strong>Personas:</strong> ${reserva.numero_personas}</p>
    <p><i class='bx bx-info-circle'></i> <strong>Estado:</strong> 
      <span class="status-${estadoReserva.toLowerCase()}">${estadoReserva}</span>
    </p>
    ${reserva.anotaciones ? `<p><i class='bx bx-note'></i> <strong>Notas:</strong> ${reserva.anotaciones}</p>` : ''}
    ${reserva.mesa_fk ? `<p><i class='bx bx-table'></i> <strong>Mesa:</strong> ${reserva.mesa_fk}</p>` : ''}
  `;
  
  // Agregar evento click para ver detalles (si tienes esa página)
  div.addEventListener('click', () => {
    verDetallesReserva(reserva.id_reservacion);
  });
  
  return div;
}

/**
 * Determinar el estado de la reserva basado en fecha y estado
 * @param {Object} reserva - Objeto de reserva
 * @returns {string} - Estado formateado
 */
function determinarEstadoReserva(reserva) {
  // Si ya tiene un estado definido, usarlo
  if (reserva.estado_reservacion) {

    //Mapear los posibles estados de tu DB a texto legible
    const estadosMap = {
        1: 'Confirmada',
        2: 'Pendiente',
        3: 'Cancelada',
        4: 'Completada',
        'confirmada': 'Confirmada',
        'pendiente': 'Pendiente',
        'cancelada' : 'Cancelada',
        'completada': 'Completada'
    };

    return estadosMap[reserva.estado_reservacion] || reserva.estado_reservacion;
  }
  
  // Si no, determinar por fecha
  const fechaReserva = new Date(reserva.fecha);
  const hoy = new Date();
  
  if (fechaReserva < hoy) {
    return 'Completada';
  } else if (fechaReserva.toDateString() === hoy.toDateString()) {
    return 'Hoy';
  } else {
    return 'Próxima';
  }
}

/**
 * Función para formatear fecha
 * @param {string} fecha - Fecha en formato de base de datos
 * @returns {string} - Fecha formateada para mostrar
 */
function formatearFecha(fecha) {
  try {
    const fechaObj = new Date(fecha);
    return fechaObj.toLocaleDateString('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  } catch (error) {
    console.error('Error al formatear fecha:', error);
    return fecha; // Devolver fecha original si hay error
  }
}

/**
 * Función para navegar a detalles de reserva
 * @param {number} id_reservacion - ID real de la reserva
 */
function verDetallesReserva(reservaId) {
  if (reservaId) {
    // Si tienes página de detalles, redirigir
    window.location.href = `../viewrenard/historialReservacion.html?id=${reservaId}`;
  } else {
    console.warn('ID de reserva no válido');
  }
}

/**
 * Función para inicializar efectos y animaciones (adaptada al nuevo HTML)
 */
function inicializarEfectos() {
  // Efectos para las tarjetas informativas
  const infoCards = document.querySelectorAll('.info-card');
  
  infoCards.forEach(card => {
    card.addEventListener('mouseenter', function() {
      this.style.transform = 'translateY(-5px) scale(1.02)';
    });
    
    card.addEventListener('mouseleave', function() {
      this.style.transform = 'translateY(0) scale(1)';
    });
  });
  
  // Efectos para los botones principales
  const primaryBtns = document.querySelectorAll('.primary-btn');
  
  primaryBtns.forEach(btn => {
    btn.addEventListener('mouseenter', function() {
      this.style.transform = 'translateY(-2px)';
    });
    
    btn.addEventListener('mouseleave', function() {
      this.style.transform = 'translateY(0)';
    });
  });
  
  // Animación de entrada para las secciones
  observarElementos();
}

/**
 * Función para observar elementos y animar su entrada
 */
function observarElementos() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.opacity = '1';
        entry.target.style.transform = 'translateY(0)';
      }
    });
  }, {
    threshold: 0.1
  });
  
  // Observar secciones para animaciones (adaptado a las nuevas clases)
  const secciones = document.querySelectorAll('.info-cards, .recent-section, .main-actions');
  secciones.forEach(seccion => {
    seccion.style.opacity = '0';
    seccion.style.transform = 'translateY(20px)';
    seccion.style.transition = 'all 0.6s ease';
    observer.observe(seccion);
  });
}

/**
 * Función para refrescar datos de la página
 */
function refrescarDatos() {
  cargarDatosUsuario();
  cargarHistorialReservas();
}

/**
 * Función para cerrar sesión
 * Adaptada a tu estructura de localStorage
 */
function cerrarSesion() {
  // Limpiar datos de sesión tal como los guardas en tu auth.js
  localStorage.removeItem('token');
  localStorage.removeItem('usuario');
  
  // Redirigir al login usando tu ruta exacta
  window.location.href = '../login/login.html';
}

// Exportar funciones para uso global
window.refrescarDatos = refrescarDatos;
window.cerrarSesion = cerrarSesion;
window.cargarHistorialReservas = cargarHistorialReservas;