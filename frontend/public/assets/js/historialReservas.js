// historialReservas.js - Gestión completa del historial de reservas

let todasLasReservas = []; // Array para almacenar todas las reservas
let reservasFiltradas = []; // Array para reservas después de filtros

document.addEventListener('DOMContentLoaded', () => {
  // Inicializar navbar
  renderNavbar('navbar-container');
  
  // Verificar autenticación y cargar reservas
  iniciarHistorialReservas();
});

/**
 * Función principal que gestiona la autenticación y la carga de reservas.
 */
function iniciarHistorialReservas() {
  const userToken = localStorage.getItem('token');
  const usuarioData = localStorage.getItem('usuario');

  if (!userToken || !usuarioData) {
    // Si no hay token o usuario, redirige y detén la ejecución.
    Window.location.href = '../login/login.html';
    return;
  }
  
  try {
    const usuario = JSON.parse(usuarioData);

    // CORRECCIÓN: Usar el ID correcto, que a veces viene como 'id_usuario'
    const idUsuario = usuario.id || usuario.id_usuario;

    if (!idUsuario) {
        throw new Error('ID de usuario no encontrado en los datos de sesión.');
    }

    // Ahora que el ID está garantizado, llama a la función de carga
    cargarTodasLasReservas(idUsuario, userToken);

  } catch (error) {
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');
    Window.location.href = '../login/login.html';
  }
}

/**
 * Cargar TODAS las reservas del usuario específico desde la BD
 * @param {string|number} id_usuario - El ID del usuario actual.
 * @param {string} userToken - El token de autenticación del usuario.
 */
async function cargarTodasLasReservas(id_usuario = null, userToken = null) {
  const contenedor = document.getElementById('reservasContainer');
  
  try {
    // Si no se pasan los parámetros, intentar obtenerlos de localStorage
    if (!id_usuario || !userToken) {
      const storedToken = localStorage.getItem('token');
      const usuarioData = localStorage.getItem('usuario');

      if (!storedToken || !usuarioData) {
        Window.location.href = '../login/login.html';
        return;
      }

      const usuario = JSON.parse(usuarioData);
      id_usuario = usuario.id || usuario.id_usuario;
      userToken = storedToken;

      if (!id_usuario) {
          throw new Error('ID de usuario no encontrado en los datos de sesión.');
      }
    }
    // Mostrar loading
    contenedor.innerHTML = `
      <div class="loading-state">
        <i class='bx bx-loader-alt bx-spin'></i>
        <p>Cargando todas tus reservas...</p>
      </div>
    `;
        
    // IMPORTANTE: Verificar que tu backend filtre correctamente por usuario_fk
    const response = await fetch(`http://127.0.0.1:3000/renard/historial-reservacion/usuario?id_usuario=${id_usuario}`, {
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
    
    // DEBUG: Verificar qué está devolviendo el backend
    //console.log('Respuesta completa del backend:', reservas);
    //console.log('Usuario actual ID:', id_usuario);
    
    // FILTRO TOTAL en frontend (solo si no puedes modificar el backend)
    const reservasDelUsuario = reservas.filter(reserva => {
      return Number.parseInt(reserva.usuario_fk) === Number.parseInt(id_usuario);
    });

    // Guardar reservas globalmente
    todasLasReservas = reservasDelUsuario;
    reservasFiltradas = [...reservasDelUsuario]; // Copia inicial
    
    if (reservasDelUsuario && reservasDelUsuario.length > 0) {
      mostrarReservas(reservasDelUsuario);
    } else {
      mostrarEstadoVacio();
    }
    
  } catch (error) {
    mostrarErrorCarga();
  }
}

/**
 * Mostrar las reservas en la interfaz
 * @param {Array} reservas - Array de reservas a mostrar
 */
function mostrarReservas(reservas) {
  const contenedor = document.getElementById('reservasContainer');
  contenedor.innerHTML = '';
  
  reservas.forEach(reserva => {
    const reservaCard = crearTarjetaReserva(reserva);
    contenedor.appendChild(reservaCard);
  });
}

/**
 * Crear tarjeta individual de reserva
 * @param {Object} reserva - Datos de la reserva
 * @returns {HTMLElement} - Elemento de la tarjeta
 */
function crearTarjetaReserva(reserva) {
  const div = document.createElement('div');
  div.className = 'reserva-card';
  div.dataset.reservaId = reserva.id_reservacion;
  
  // Formatear datos
  const fechaFormateada = formatearFecha(reserva.fecha);
  const estadoInfo = obtenerEstadoInfo(reserva);
  const nombreRestaurante = reserva.nombre_restaurante || `Restaurante #${reserva.restaurante_fk}`;
  
  div.innerHTML = `
    <div class="reserva-header">
      <h3 class="reserva-title">
        <i class='bx bx-store'></i> ${nombreRestaurante}
      </h3>
      <span class="reserva-id">#${reserva.id_reservacion}</span>
    </div>
    
    <div class="reserva-info">
      <div class="info-row">
        <i class='bx bx-calendar'></i>
        <strong>Fecha:</strong>
        <span>${fechaFormateada}</span>
      </div>
      
      <div class="info-row">
        <i class='bx bx-time'></i>
        <strong>Hora:</strong>
        <span>${reserva.hora_inicio}${reserva.hora_fin ? ` - ${reserva.hora_fin}` : ''}</span>
      </div>
      
      <div class="info-row">
        <i class='bx bx-user'></i>
        <strong>Personas:</strong>
        <span>${reserva.numero_personas}</span>
      </div>
      
      <div class="info-row">
        <i class='bx bx-info-circle'></i>
        <strong>Estado:</strong>
        <span class="estado-badge estado-${estadoInfo.clase}">${estadoInfo.texto}</span>
      </div>
      
      ${reserva.mesa_fk ? `
        <div class="info-row">
          <i class='bx bx-table'></i>
          <strong>Mesa:</strong>
          <span>#${reserva.mesa_fk}</span>
        </div>
      ` : ''}
      
      ${reserva.anotaciones ? `
        <div class="info-row">
          <i class='bx bx-note'></i>
          <strong>Notas:</strong>
          <span>${reserva.anotaciones}</span>
        </div>
      ` : ''}
      
      <div class="info-row">
        <i class='bx bx-calendar-plus'></i>
        <strong>Creada:</strong>
        <span>${formatearFecha(reserva.created_at)}</span>
      </div>
    </div>
    
    <div class="reserva-actions">
      <button class="btn-action btn-detalle" onclick="verDetalleReserva(${reserva.id_reservacion})">
        <i class='bx bx-show'></i> Ver Detalle
      </button>
      
      ${estadoInfo.puedeConfirmar ? `
        <button class="btn-action btn-confirmar" onclick="confirmarReserva(${reserva.id_reservacion})">
          <i class='bx bx-check-circle'></i> Confirmar
        </button>
      ` : ''}
      
      ${estadoInfo.puedeCancelar ? `
        <button class="btn-action btn-cancelar" onclick="cancelarReserva(${reserva.id_reservacion})">
          <i class='bx bx-x'></i> Cancelar
        </button>
      ` : ''}
    </div>
  `;
  
  return div;
}

/**
 * Obtener información del estado de la reserva (ACTUALIZADA)
 * @param {Object} reserva - Datos de la reserva
 * @returns {Object} - Info del estado con texto, clase CSS y permisos
 */
function obtenerEstadoInfo(reserva) {
  const estadosMap = {
    1: { texto: 'Confirmada', clase: 'confirmada', puedeConfirmar: false, puedeCancelar: true },
    2: { texto: 'Pendiente', clase: 'pendiente', puedeConfirmar: true, puedeCancelar: true },
    3: { texto: 'Cancelada', clase: 'cancelada', puedeConfirmar: false, puedeCancelar: false },
    4: { texto: 'Completada', clase: 'completada', puedeConfirmar: false, puedeCancelar: false },
    'confirmada': { texto: 'Confirmada', clase: 'confirmada', puedeConfirmar: false, puedeCancelar: true },
    'pendiente': { texto: 'Pendiente', clase: 'pendiente', puedeConfirmar: true, puedeCancelar: true },
    'cancelada': { texto: 'Cancelada', clase: 'cancelada', puedeConfirmar: false, puedeCancelar: false },
    'completada': { texto: 'Completada', clase: 'completada', puedeConfirmar: false, puedeCancelar: false }
  };
  
  const estado = estadosMap[reserva.estado_reservacion] || estadosMap[2]; // Por defecto pendiente
  
  // Verificar si la fecha ya pasó para marcar como completada automáticamente
  const fechaReserva = new Date(reserva.fecha);
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);
  fechaReserva.setHours(0, 0, 0, 0);
  
  if (fechaReserva < hoy && estado.clase !== 'cancelada' && estado.clase !== 'completada') {
    return { texto: 'Completada', clase: 'completada', puedeConfirmar: false, puedeCancelar: false };
  }
  
  return estado;
}

/**
 * Filtrar reservas según los criterios seleccionados
 */
function filtrarReservas() {
  const filtroEstado = document.getElementById('filtroEstado').value;
  const filtroFecha = document.getElementById('filtroFecha').value;
  
  let reservasFiltradas = [...todasLasReservas];
  
  // Filtro por estado
  if (filtroEstado !== 'todos') {
    reservasFiltradas = reservasFiltradas.filter(reserva => {
      const estadoInfo = obtenerEstadoInfo(reserva);
      return estadoInfo.clase === filtroEstado;
    });
  }
  
  // Filtro por fecha
  if (filtroFecha !== 'todos') {
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    
    reservasFiltradas = reservasFiltradas.filter(reserva => {
      const fechaReserva = new Date(reserva.fecha);
      fechaReserva.setHours(0, 0, 0, 0);
      
      switch (filtroFecha) {
        case 'proximas':
          return fechaReserva >= hoy;
        case 'pasadas':
          return fechaReserva < hoy;
        case 'este-mes':
          return fechaReserva.getMonth() === hoy.getMonth() && 
                 fechaReserva.getFullYear() === hoy.getFullYear();
        default:
          return true;
      }
    });
  }
  
  mostrarReservas(reservasFiltradas);
  
  if (reservasFiltradas.length === 0) {
    document.getElementById('reservasContainer').innerHTML = `
      <div class="empty-state">
        <i class='bx bx-search-alt'></i>
        <h3>No se encontraron reservas</h3>
        <p>No hay reservas que coincidan con los filtros seleccionados.</p>
      </div>
    `;
  }
}

/**
 * Ver detalle completo de una reserva
 * @param {number} reservaId - ID de la reserva
 */
function verDetalleReserva(reservaId) {
  const reserva = todasLasReservas.find(r => r.id_reservacion == reservaId);
  if (!reserva) return;
  
  const estadoInfo = obtenerEstadoInfo(reserva);
  
  document.getElementById('modalContent').innerHTML = `
    <h2><i class='bx bx-info-circle'></i> Detalle de Reserva #${reserva.id_reservacion}</h2>
    <div style="margin-top: 20px;">
      <p><strong>Restaurante:</strong> ${reserva.nombre_restaurante || `Restaurante #${reserva.restaurante_fk}`}</p>
      <p><strong>Fecha:</strong> ${formatearFecha(reserva.fecha)}</p>
      <p><strong>Hora:</strong> ${reserva.hora_inicio}${reserva.hora_fin ? ` - ${reserva.hora_fin}` : ''}</p>
      <p><strong>Número de personas:</strong> ${reserva.numero_personas}</p>
      <p><strong>Estado:</strong> <span class="estado-badge estado-${estadoInfo.clase}">${estadoInfo.texto}</span></p>
      ${reserva.mesa_fk ? `<p><strong>Mesa asignada:</strong> #${reserva.mesa_fk}</p>` : ''}
      ${reserva.anotaciones ? `<p><strong>Notas especiales:</strong> ${reserva.anotaciones}</p>` : ''}
      <p><strong>Reserva creada:</strong> ${formatearFecha(reserva.created_at)}</p>
      ${reserva.updated_at ? `<p><strong>Última actualización:</strong> ${formatearFecha(reserva.updated_at)}</p>` : ''}
    </div>
  `;
  
  document.getElementById('reservaModal').style.display = 'block';
}

/**
 * NUEVA FUNCIÓN: Confirmar una reserva (cambiar de pendiente a confirmada)
 * @param {number} reservaId - ID de la reserva a confirmar
 */
async function confirmarReserva(reservaId) {
  const reserva = todasLasReservas.find(r => r.id_reservacion == reservaId);
  if (!reserva) {
    Swal.fire({
      title: 'Error',
      text: 'No se encontró la reserva.',
      icon: 'error'
    });
    return;
  }

  // Verificar que la reserva esté en estado pendiente
  if (reserva.estado_reservacion !== 2 && reserva.estado_reservacion !== 'pendiente') {
    Swal.fire({
      title: 'No disponible',
      text: 'Esta reserva ya no puede ser confirmada.',
      icon: 'info'
    });
    return;
  }

  const confirmacion = await Swal.fire({
    title: '¿Confirmar reserva?',
    html: `
      <p>¿Deseas confirmar tu reserva?</p>
      <br>
      <strong>Detalles de la reserva:</strong><br>
      📅 <strong>Fecha:</strong> ${formatearFecha(reserva.fecha)}<br>
      ⏰ <strong>Hora:</strong> ${reserva.hora_inicio}<br>
      👥 <strong>Personas:</strong> ${reserva.numero_personas}<br>
      🏪 <strong>Restaurante:</strong> ${reserva.nombre_restaurante || `Restaurante #${reserva.restaurante_fk}`}
    `,
    icon: 'question',
    showCancelButton: true,
    confirmButtonColor: '#28a745',
    cancelButtonColor: '#6c757d',
    confirmButtonText: 'Sí, confirmar',
    cancelButtonText: 'Cancelar'
  });
  
  if (!confirmacion.isConfirmed) return;
  
  try {
    const userToken = localStorage.getItem('token');
    
    const response = await fetch(`http://127.0.0.1:3000/renard/historial-reservacion/${reservaId}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${userToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ 
        estado_reservacion: 1 // 1 = Confirmada
      })
    });
    
    if (response.ok) {
      Swal.fire({
        title: '¡Reserva confirmada!',
        text: 'Tu reserva ha sido confirmada exitosamente.',
        icon: 'success',
        timer: 2500,
        showConfirmButton: false
      });
      
      // Actualizar el estado local y recargar vista
      const usuarioData = localStorage.getItem('usuario');
      const usuario = JSON.parse(usuarioData);
      const idUsuario = usuario.id || usuario.id_usuario;
      cargarTodasLasReservas(idUsuario, userToken);
      
    } else {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Error al confirmar la reserva');
    }
    
  } catch (error) {
    Swal.fire({
      title: 'Error',
      text: 'No se pudo confirmar la reserva. Intenta nuevamente.',
      icon: 'error'
    });
  }
}

/**
 * FUNCIÓN ACTUALIZADA: Cancelar una reserva (sin redirección)
 * @param {number} reservaId - ID de la reserva a cancelar
 */
async function cancelarReserva(reservaId) {
  const reserva = todasLasReservas.find(r => r.id_reservacion == reservaId);
  if (!reserva) {
    Swal.fire({
      title: 'Error',
      text: 'No se encontró la reserva.',
      icon: 'error'
    });
    return;
  }

  // Verificar que la reserva pueda ser cancelada
  if (reserva.estado_reservacion === 3 || reserva.estado_reservacion === 'cancelada') {
    Swal.fire({
      title: 'Ya cancelada',
      text: 'Esta reserva ya está cancelada.',
      icon: 'info'
    });
    return;
  }

  if (reserva.estado_reservacion === 4 || reserva.estado_reservacion === 'completada') {
    Swal.fire({
      title: 'No disponible',
      text: 'No puedes cancelar una reserva que ya fue completada.',
      icon: 'warning'
    });
    return;
  }

  const confirmacion = await Swal.fire({
    title: '¿Cancelar reserva?',
    html: `
      <p>¿Estás seguro de que deseas cancelar tu reserva?</p>
      <br>
      <strong>Detalles de la reserva:</strong><br>
      📅 <strong>Fecha:</strong> ${formatearFecha(reserva.fecha)}<br>
      ⏰ <strong>Hora:</strong> ${reserva.hora_inicio}<br>
      👥 <strong>Personas:</strong> ${reserva.numero_personas}<br>
      🏪 <strong>Restaurante:</strong> ${reserva.nombre_restaurante || `Restaurante #${reserva.restaurante_fk}`}
      <br><br>
      <small style="color: #dc3545;">⚠️ Esta acción no se puede deshacer</small>
    `,
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#dc3545',
    cancelButtonColor: '#6c757d',
    confirmButtonText: 'Sí, cancelar reserva',
    cancelButtonText: 'No, mantener reserva',
    reverseButtons: true
  });
  
  if (!confirmacion.isConfirmed) return;
  
  try {
    const userToken = localStorage.getItem('token');
    
    const response = await fetch(`http://127.0.0.1:3000/renard/reservacion/${reservaId}/estado`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${userToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ 
        estado_reservacion: 3 // 3 = Cancelada
      })
    });
    
    if (response.ok) {
      Swal.fire({
        title: '¡Reserva cancelada!',
        text: 'Tu reserva ha sido cancelada exitosamente.',
        icon: 'success',
        timer: 2500,
        showConfirmButton: false
      });
      
      // Actualizar el estado local y recargar vista
      const usuarioData = localStorage.getItem('usuario');
      const usuario = JSON.parse(usuarioData);
      const idUsuario = usuario.id_usuario;
      cargarTodasLasReservas(idUsuario, userToken);
      
    } else {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Error al cancelar la reserva');
    }
    
  } catch (error) {
    Swal.fire({
      title: 'Error',
      text: 'No se pudo cancelar la reserva. Por favor, intenta nuevamente.',
      icon: 'error'
    });
  }
}

/**
 * Formatear fecha para mostrar
 * @param {string} fecha - Fecha en formato de BD
 * @returns {string} - Fecha formateada
 */
function formatearFecha(fecha) {
  if (!fecha) return 'No especificada';
  
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
    return fecha;
  }
}

/**
 * Formatear fecha y hora para mostrar
 * @param {string} fechaHora - Fecha y hora en formato de BD
 * @returns {string} - Fecha y hora formateadas
 */
function formatearFechaHora(fechaHora) {
  if (!fechaHora) return 'No especificada';
  
  try {
    const fechaObj = new Date(fechaHora);
    return fechaObj.toLocaleString('es-ES', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch (error) {
    return fechaHora;
  }
}

/**
 * Mostrar estado cuando no hay reservas
 */
function mostrarEstadoVacio() {
  document.getElementById('reservasContainer').innerHTML = `
    <div class="empty-state">
      <i class='bx bx-calendar-x'></i>
      <h3>No tienes reservas aún</h3>
      <p>¡Haz tu primera reserva y comienza a disfrutar de increíbles experiencias gastronómicas!</p>
      <br>
      <a href="./reservaRenard.html" class="btn-action btn-detalle">
        <i class='bx bx-calendar-plus'></i> Hacer Primera Reserva
      </a>
    </div>
  `;
}

/**
 * Mostrar error al cargar reservas
 */
function mostrarErrorCarga() {
  document.getElementById('reservasContainer').innerHTML = `
    <div class="empty-state">
      <i class='bx bx-error-circle'></i>
      <h3>Error al cargar reservas</h3>
      <p>No pudimos cargar tu historial en este momento. Por favor, intenta más tarde.</p>
      <br>
      <button onclick="iniciarHistorialReservas()" class="btn-action btn-detalle">
        <i class='bx bx-refresh'></i> Intentar de nuevo
      </button>
    </div>
  `;
}

/**
 * Cerrar modal
 */
function cerrarModal() {
  document.getElementById('reservaModal').style.display = 'none';
}

/**
 * Cerrar modal al hacer clic fuera de él
 */
Window.onclick = function(event) {
  const modal = document.getElementById('reservaModal');
  if (event.target == modal) {
    modal.style.display = 'none';
  }
}

/**
 * Función para exportar reservas (opcional - funcionalidad adicional)
 */
function exportarReservas() {
  if (todasLasReservas.length === 0) {
    Swal.fire({
      title: 'No hay datos',
      text: 'No tienes reservas para exportar',
      icon: 'info'
    });
    return;
  }
  
  let csvContent = "data:text/csv;charset=utf-8,";
  csvContent += "ID,Restaurante,Fecha,Hora,Personas,Estado,Mesa,Notas,Creada\n";
  
  todasLasReservas.forEach(reserva => {
    const estadoInfo = obtenerEstadoInfo(reserva);
    const row = [
      reserva.id_reservacion,
      `"${reserva.nombre_restaurante}"`, //|| `Restaurante #${reserva.restaurante_fk}
      reserva.fecha,
      `"${reserva.hora_inicio}${reserva.hora_fin ? ` - ${reserva.hora_fin}` : ''}"`,
      reserva.numero_personas,
      estadoInfo.texto,
      reserva.mesa_fk || 'Sin asignar',
      `"${reserva.anotaciones || 'Sin notas'}"`,
      reserva.created_at
    ].join(',');
    
    csvContent += row + "\n";
  });
  
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  link.setAttribute("download", `mis_reservas_${new Date().now()}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.childNode.remove(link); 
  
  Swal.fire({
    title: '¡Exportado!',
    text: 'Tus reservas se han descargado exitosamente',
    icon: 'success',
    timer: 2000,
    showConfirmButton: false
  });
}

// FUNCIONES GLOBALES (ACTUALIZADAS)
Window.iniciarHistorialReservas = iniciarHistorialReservas;
Window.filtrarReservas = filtrarReservas;
Window.verDetalleReserva = verDetalleReserva;
Window.confirmarReserva = confirmarReserva; // NUEVA
Window.cancelarReserva = cancelarReserva; // ACTUALIZADA
Window.cerrarModal = cerrarModal;
Window.exportarReservas = exportarReservas;