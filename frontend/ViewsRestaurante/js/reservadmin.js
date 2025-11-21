document.addEventListener('DOMContentLoaded', () => {
    const reservTableBody = document.getElementById('reservTableBody');
    const editReservForm = document.getElementById('editReservForm');

    // Verificar que los elementos existan
    if (!reservTableBody || !editReservForm) {
        console.error('No se encontraron elementos necesarios en el DOM');
        return;
    }

    // Obtener el ID del restaurante del usuario logueado
    const usuarioData = JSON.parse(localStorage.getItem('usuario') || '{}');
    const restauranteId = usuarioData.restaurante_fk;

    if (!restauranteId) {
        console.error('No se encontró el ID del restaurante del usuario');
        mostrarError('No se pudo identificar el restaurante. Por favor, inicie sesión nuevamente.');
        return;
    }

    // Objetos para cachear nombres de usuarios, sucursales y mesas
    window.usuariosCache = {};
    window.sucursalesCache = {};
    window.mesasCache = {};
    window.reservacionesData = {};

    // Cargar reservaciones al cargar la página
    fetchReservaciones();

    async function fetchReservaciones() {
        try {
            mostrarCargando(true);
            
            const res = await fetch(`http://127.0.0.1:3000/renard/reservacion/restaurante/${restauranteId}`);
            
            if (!res.ok) {
                throw new Error(`Error HTTP! estado: ${res.status}`);
            }
            
            const data = await res.json();

            // Manejar diferentes estructuras de respuesta
            let reservaciones = [];
            if (Array.isArray(data)) {
                reservaciones = data;
            } else if (data && Array.isArray(data.data)) {
                reservaciones = data.data;
            } else if (data && typeof data === 'object' && data.id_reservacion) {
                // Si es un solo objeto, convertirlo a array
                reservaciones = [data];
            } else {
                console.warn('Estructura de respuesta de API inesperada:', data);
                reservaciones = [];
            }

            // Pre-cargar información de usuarios, sucursales y mesas
            await Promise.all([
                preloadUsuarios(reservaciones),
                preloadSucursales(reservaciones),
                preloadMesas(reservaciones)
            ]);

            renderReservaciones(reservaciones);
        } catch (error) {
            console.error('Error al obtener reservaciones:', error);
            mostrarError('Error al cargar las reservaciones. Por favor, intente nuevamente.');
            // Mostrar tabla vacía si hay un error
            renderReservaciones([]);
        } finally {
            mostrarCargando(false);
        }
    }

    // Función para mostrar estado de carga
    function mostrarCargando(mostrar) {
        if (mostrar) {
            reservTableBody.innerHTML = `
                <tr>
                    <td colspan="13" class="text-center py-4">
                        <div class="spinner-border text-primary" role="status">
                            <span class="visually-hidden">Cargando...</span>
                        </div>
                        <p class="mt-2">Cargando reservaciones...</p>
                    </td>
                </tr>
            `;
        }
    }

    // Función para mostrar errores
    function mostrarError(mensaje) {
        reservTableBody.innerHTML = `
            <tr>
                <td colspan="13" class="text-center py-4 text-danger">
                    <i class="bi bi-exclamation-triangle-fill fs-1"></i>
                    <p class="mt-2">${mensaje}</p>
                    <button class="btn btn-primary mt-2" onclick="fetchReservaciones()">Reintentar</button>
                </td>
            </tr>
        `;
    }

    // Pre-cargar información de usuarios
    async function preloadUsuarios(reservaciones) {
        const usuarioIds = [...new Set(reservaciones.map(r => r.usuario_fk).filter(id => id))];
        
        for (const usuarioId of usuarioIds) {
            if (!window.usuariosCache[usuarioId]) {
                try {
                    const res = await fetch(`http://127.0.0.1:3000/renard/usuario/${usuarioId}`);
                    if (res.ok) {
                        const usuario = await res.json();
                        // Verificar diferentes posibles estructuras de respuesta
                        if (usuario.email) {
                            window.usuariosCache[usuarioId] = usuario.email;
                        } else if (usuario.nombre && usuario.apellido) {
                            window.usuariosCache[usuarioId] = `${usuario.nombre} ${usuario.apellido}`;
                        } else if (usuario.data && usuario.data.email) {
                            window.usuariosCache[usuarioId] = usuario.data.email;
                        } else {
                            window.usuariosCache[usuarioId] = `Usuario ${usuarioId}`;
                        }
                    } else {
                        window.usuariosCache[usuarioId] = `Usuario ${usuarioId}`;
                    }
                } catch (error) {
                    console.error(`Error al cargar usuario ${usuarioId}:`, error);
                    window.usuariosCache[usuarioId] = `Usuario ${usuarioId}`;
                }
            }
        }
    }

    // Pre-cargar información de sucursales
    async function preloadSucursales(reservaciones) {
        const sucursalIds = [...new Set(reservaciones.map(r => r.sucursal_fk).filter(id => id))];
        
        for (const sucursalId of sucursalIds) {
            if (!window.sucursalesCache[sucursalId]) {
                try {
                    const res = await fetch(`http://127.0.0.1:3000/renard/sucursal/${sucursalId}`);
                    if (res.ok) {
                        const sucursal = await res.json();
                        // Verificar diferentes posibles estructuras de respuesta
                        if (sucursal.nombre_sucursal) {
                            window.sucursalesCache[sucursalId] = sucursal.nombre_sucursal;
                        } else if (sucursal.nombre) {
                            window.sucursalesCache[sucursalId] = sucursal.nombre;
                        } else if (sucursal.data && sucursal.data.nombre_sucursal) {
                            window.sucursalesCache[sucursalId] = sucursal.data.nombre_sucursal;
                        } else {
                            window.sucursalesCache[sucursalId] = `Sucursal ${sucursalId}`;
                        }
                    } else {
                        window.sucursalesCache[sucursalId] = `Sucursal ${sucursalId}`;
                    }
                } catch (error) {
                    console.error(`Error al cargar sucursal ${sucursalId}:`, error);
                    window.sucursalesCache[sucursalId] = `Sucursal ${sucursalId}`;
                }
            }
        }
    }

    // Pre-cargar información de mesas
    async function preloadMesas(reservaciones) {
        const mesaIds = [...new Set(reservaciones.map(r => r.mesa_fk).filter(id => id))];
        
        for (const mesaId of mesaIds) {
            if (!window.mesasCache[mesaId]) {
                try {
                    const res = await fetch(`http://127.0.0.1:3000/renard/mesa/${mesaId}`);
                    if (res.ok) {
                        const mesa = await res.json();
                        // Verificar diferentes posibles estructuras de respuesta
                        if (mesa.nombre_mesa) {
                            window.mesasCache[mesaId] = mesa.nombre_mesa;
                        } else if (mesa.nombre) {
                            window.mesasCache[mesaId] = mesa.nombre;
                        } else if (mesa.numero_mesa) {
                            window.mesasCache[mesaId] = `Mesa ${mesa.numero_mesa}`;
                        } else if (mesa.data && mesa.data.nombre_mesa) {
                            window.mesasCache[mesaId] = mesa.data.nombre_mesa;
                        } else {
                            window.mesasCache[mesaId] = `Mesa ${mesaId}`;
                        }
                    } else {
                        window.mesasCache[mesaId] = `Mesa ${mesaId}`;
                    }
                } catch (error) {
                    console.error(`Error al cargar mesa ${mesaId}:`, error);
                    window.mesasCache[mesaId] = `Mesa ${mesaId}`;
                }
            }
        }
    }

    function renderReservaciones(reservaciones) {
        reservTableBody.innerHTML = '';
        
        if (!Array.isArray(reservaciones)) {
            console.error('reservaciones no es un array:', reservaciones);
            mostrarError('Error al procesar los datos de reservaciones.');
            return;
        }

        if (reservaciones.length === 0) {
            reservTableBody.innerHTML = `
                <tr>
                    <td colspan="13" class="text-center py-4">
                        <i class="bi bi-calendar-x fs-1 text-muted"></i>
                        <p class="mt-2 text-muted">No hay reservaciones registradas</p>
                    </td>
                </tr>
            `;
            return;
        }

        reservaciones.forEach(reserv => {
            // Almacenar datos de reserva en un objeto global para acceso por manejadores onclick
            window.reservacionesData[reserv.id_reservacion] = reserv;

            // Obtener nombres en lugar de IDs
            const usuarioNombre = reserv.usuario_fk ? 
                (window.usuariosCache[reserv.usuario_fk] || `Usuario ${reserv.usuario_fk}`) : 
                'Sin usuario';
                
            const sucursalNombre = reserv.sucursal_fk ? 
                (window.sucursalesCache[reserv.sucursal_fk] || `Sucursal ${reserv.sucursal_fk}`) : 
                'Sin sucursal';

            const mesaNombre = reserv.mesa_fk ? 
                (window.mesasCache[reserv.mesa_fk] || `Mesa ${reserv.mesa_fk}`) : 
                'Sin asignar';

            const estadoTexto = getEstadoTexto(reserv.estado_reservacion);
            const estadoClase = getEstadoClase(reserv.estado_reservacion);

            reservTableBody.innerHTML += `
                <tr>
                    <td>${reserv.id_reservacion}</td>
                    <td>${reserv.numero_personas || '0'}</td>
                    <td>${formatearFecha(reserv.fecha)}</td>
                    <td>${reserv.hora_inicio || ''}</td>
                    <td>${reserv.hora_fin || ''}</td>
                    <td>${usuarioNombre}</td>
                    <td><span class="badge ${estadoClase}">${estadoTexto}</span></td>
                    <td>${sucursalNombre}</td>
                    <td>${mesaNombre}</td>
                    <td>${reserv.anotaciones || 'Ninguna'}</td>
                    <td>${formatearFechaHora(reserv.created_at)}</td>
                    <td>${formatearFechaHora(reserv.updated_at)}</td>
                    <td>
                        <div class="btn-group" role="group">
                            <button class="btn btn-sm btn-outline-primary" onclick="abrirModalVerReserv(${reserv.id_reservacion})" title="Ver detalles">
                                <i class="bi bi-eye"></i>
                            </button>
                            <button class="btn btn-sm btn-outline-warning" onclick="abrirModalEditarReserv(${reserv.id_reservacion})" title="Editar">
                                <i class="bi bi-pencil-square"></i>
                            </button>
                            <button class="btn btn-sm btn-outline-danger" onclick="eliminarReserv(${reserv.id_reservacion})" title="Eliminar">
                                <i class="bi bi-trash3-fill"></i>
                            </button>
                        </div>
                    </td>
                </tr>
            `;
        });
    }

    // Función para formatear fecha
    function formatearFecha(fecha) {
        if (!fecha) return 'N/A';
        try {
            return new Date(fecha).toLocaleDateString('es-ES');
        } catch (e) {
            return 'Fecha inválida';
        }
    }

    // Función para formatear fecha y hora
    function formatearFechaHora(fechaHora) {
        if (!fechaHora) return 'N/A';
        try {
            return new Date(fechaHora).toLocaleString('es-ES');
        } catch (e) {
            return 'Fecha inválida';
        }
    }

    // Función para convertir el código de estado a texto
    function getEstadoTexto(codigoEstado) {
        const estados = {
            1: 'Pendiente',
            2: 'Confirmada',
            3: 'Cancelada',
            4: 'Completada'
        };
        return estados[codigoEstado] || codigoEstado;
    }

    // Función para obtener la clase CSS según el estado
    function getEstadoClase(codigoEstado) {
        const clases = {
            1: 'bg-warning text-dark',  // Pendiente
            2: 'bg-success',            // Confirmada
            3: 'bg-danger',             // Cancelada
            4: 'bg-info'                // Completada
        };
        return clases[codigoEstado] || 'bg-secondary';
    }

    // Función para manejar el foco de manera segura
    function safeBlur() {
        if (document.activeElement && document.activeElement.blur) {
            document.activeElement.blur();
        }
    }

    // Abrir modal y rellenar datos para editar
    window.abrirModalEditarReserv = (id_reservacion) => {
        const reserv = window.reservacionesData[id_reservacion];
        if (!reserv) {
            console.error('Reservación no encontrada:', id_reservacion);
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'No se pudo encontrar la reservación seleccionada.'
            });
            return;
        }

        safeBlur();
        document.getElementById('editReservId').value = reserv.id_reservacion;
        document.getElementById('editEstado').value = reserv.estado_reservacion || '1';
        
        const modalElement = document.getElementById('editReservModal');
        if (modalElement) {
            const modal = new bootstrap.Modal(modalElement);
            modal.show();
        }
    };

    // Abrir modal para ver detalles
    window.abrirModalVerReserv = (id_reservacion) => {
        const reserv = window.reservacionesData[id_reservacion];
        if (!reserv) {
            console.error('Reservación no encontrada:', id_reservacion);
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'No se pudo encontrar la reservación seleccionada.'
            });
            return;
        }

        // Obtener nombres para el modal
        const usuarioNombre = reserv.usuario_fk ? 
            (window.usuariosCache[reserv.usuario_fk] || `Usuario ${reserv.usuario_fk}`) : 
            'Sin usuario';
            
        const sucursalNombre = reserv.sucursal_fk ? 
            (window.sucursalesCache[reserv.sucursal_fk] || `Sucursal ${reserv.sucursal_fk}`) : 
            'Sin sucursal';

        const mesaNombre = reserv.mesa_fk ? 
            (window.mesasCache[reserv.mesa_fk] || `Mesa ${reserv.mesa_fk}`) : 
            'Sin asignar';

        safeBlur();
        document.getElementById('viewReservId').textContent = reserv.id_reservacion;
        document.getElementById('viewPersonas').textContent = reserv.numero_personas || '0';
        document.getElementById('viewFecha').textContent = formatearFecha(reserv.fecha);
        document.getElementById('viewHoraInicio').textContent = reserv.hora_inicio || '';
        document.getElementById('viewHoraFin').textContent = reserv.hora_fin || '';
        document.getElementById('viewUsuario').textContent = usuarioNombre;
        document.getElementById('viewEstado').textContent = getEstadoTexto(reserv.estado_reservacion);
        document.getElementById('viewSucursal').textContent = sucursalNombre;
        document.getElementById('viewMesa').textContent = mesaNombre;
        document.getElementById('viewAnotaciones').textContent = reserv.anotaciones || 'Ninguna';
        document.getElementById('viewCreatedAt').textContent = formatearFechaHora(reserv.created_at);
        document.getElementById('viewUpdatedAt').textContent = formatearFechaHora(reserv.updated_at);
        
        const modalElement = document.getElementById('viewReservModal');
        if (modalElement) {
            const modal = new bootstrap.Modal(modalElement);
            modal.show();
        }
    };

    // Enviar edición - USANDO LA RUTA ESPECÍFICA DE ACTUALIZACIÓN DE ESTADO
    editReservForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const id_reservacion = document.getElementById('editReservId').value;
        const estado_reservacion = document.getElementById('editEstado').value;

        if (!id_reservacion) {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'ID de reservación no válido.'
            });
            return;
        }

        // Solo enviamos el estado_reservacion como requiere el controlador
        const reservData = {
            estado_reservacion: parseInt(estado_reservacion)
        };

        try {
            // Usar la ruta específica para actualizar solo el estado
            const res = await fetch(`http://127.0.0.1:3000/renard/reservacion/${id_reservacion}/estado`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(reservData)
            });

            if (res.ok) {
                const responseData = await res.json();
                await fetchReservaciones();
                safeBlur();
                
                const modalElement = document.getElementById('editReservModal');
                if (modalElement) {
                    const modal = bootstrap.Modal.getInstance(modalElement);
                    if (modal) modal.hide();
                }
                
                Swal.fire({
                    icon: 'success',
                    title: '¡Éxito!',
                    text: responseData.message || 'Estado de reservación actualizado correctamente',
                    showConfirmButton: false,
                    timer: 2000
                });
            } else {
                const errorData = await res.json().catch(() => ({}));
                console.error('Error al editar reservación:', errorData);
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: errorData.error || 'No se pudo actualizar el estado de la reservación.'
                });
            }
        } catch (error) {
            console.error('Error en la solicitud PUT:', error);
            Swal.fire({
                icon: 'error',
                title: 'Error de conexión',
                text: 'No se pudo conectar con el servidor. Verifique su conexión a internet.'
            });
        }
    });

    // Eliminar reservación
    window.eliminarReserv = async (id_reservacion) => {
        const reserv = window.reservacionesData[id_reservacion];
        if (!reserv) {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'No se pudo encontrar la reservación seleccionada.'
            });
            return;
        }

        const resultado = await Swal.fire({
            title: '¿Estás seguro?',
            text: `Esta acción eliminará la reservación #${id_reservacion}. Esta acción no se puede deshacer.`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Sí, eliminar',
            cancelButtonText: 'Cancelar'
        });

        if (resultado.isConfirmed) {
            try {
                const res = await fetch(`http://127.0.0.1:3000/renard/reservacion/${id_reservacion}`, {
                    method: 'DELETE'
                });

                if (res.ok) {
                    await fetchReservaciones();
                    Swal.fire({
                        icon: 'success',
                        title: '¡Eliminada!',
                        text: 'La reservación ha sido eliminada correctamente.',
                        showConfirmButton: false,
                        timer: 2000
                    });
                } else {
                    const errorData = await res.json().catch(() => ({}));
                    console.error('Error al eliminar reservación:', errorData);
                    Swal.fire({
                        icon: 'error',
                        title: 'Error',
                        text: errorData.error || 'No se pudo eliminar la reservación.'
                    });
                }
            } catch (error) {
                console.error('Error en la solicitud DELETE:', error);
                Swal.fire({
                    icon: 'error',
                    title: 'Error de conexión',
                    text: 'No se pudo conectar con el servidor. Verifique su conexión a internet.'
                });
            }
        }
    };

    // Hacer funciones disponibles globalmente para reintentos
    window.fetchReservaciones = fetchReservaciones;
});