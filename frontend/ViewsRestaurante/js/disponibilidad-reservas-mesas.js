// Variables globales
let sucursales = [];
let zonas = [];
let estadosMesa = [];
let estadoMesasChart = null;
let reservasHoraChart = null;

// Función para mostrar alertas
function showAlert(type, message) {
    Swal.fire({
        icon: type,
        title: message,
        showConfirmButton: false,
        timer: 2000
    });
}

// Función para mostrar/ocultar loading
function showLoading(show) {
    const loadingElement = document.getElementById('loadingOverlay');
    if (loadingElement) {
        loadingElement.style.display = show ? 'flex' : 'none';
    }
}

// Función para llenar selects
function llenarSelect(data, selectId, textProp, valueProp) {
    const select = document.getElementById(selectId);
    if (!select) return;
    
    select.innerHTML = '<option value="">Todas las sucursales</option>';
    
    data.forEach(item => {
        const option = document.createElement('option');
        option.value = item[valueProp];
        option.textContent = item[textProp];
        select.appendChild(option);
    });
}

// Cargar sucursales (restaurantes)
async function cargarSucursales() {
    try {
        showLoading(true);
        const response = await fetch('http://127.0.0.1:3000/renard/restaurante');
        if (!response.ok) throw new Error('Error al cargar sucursales');
        
        sucursales = await response.json();
        llenarSelect(sucursales, 'sucursal', 'nombre', 'id_restaurante');
    } catch (error) {
        console.error('Error al cargar sucursales:', error);
        showAlert('error', 'No se pudieron cargar las sucursales');
    } finally {
        showLoading(false);
    }
}

// Cargar datos de zonas y estados de mesa
async function cargarDatosAuxiliares() {
    try {
        [zonas, estadosMesa] = await Promise.all([
            fetch('http://127.0.0.1:3000/renard/zona').then(r => r.json()),
            fetch('http://127.0.0.1:3000/renard/estado-mesa').then(r => r.json())
        ]);
    } catch (error) {
        console.error('Error al cargar datos auxiliares:', error);
    }
}

// Función principal para cargar datos de disponibilidad
async function cargarDatos() {
    try {
        showLoading(true);
        
        // Obtener valores de los filtros
        const fecha = document.getElementById('fecha').value;
        const hora = document.getElementById('hora').value;
        const sucursalId = document.getElementById('sucursal').value;
        
        if (!fecha || !hora) {
            showAlert('warning', 'Por favor, seleccione fecha y hora');
            return;
        }
        
        // Cargar mesas y reservaciones
        const [mesas, reservaciones] = await Promise.all([
            cargarMesas(sucursalId),
            cargarReservaciones(fecha, hora, sucursalId)
        ]);
        
        // Calcular estadísticas
        const estadisticas = calcularEstadisticas(mesas, reservaciones);
        
        // Actualizar UI
        actualizarContadores(estadisticas);
        actualizarGraficos(estadisticas);
        actualizarTablaDisponibilidad(mesas, reservaciones);
        
    } catch (error) {
        console.error('Error al cargar datos:', error);
        showAlert('error', 'Error al cargar los datos de disponibilidad');
    } finally {
        showLoading(false);
    }
}

// Cargar mesas por sucursal
async function cargarMesas(sucursalId) {
    try {
        let url = 'http://127.0.0.1:3000/renard/mesa';
        if (sucursalId) {
            url = `http://127.0.0.1:3000/renard/mesa/sucursal/${sucursalId}`;
        }
        
        const response = await fetch(url);
        if (!response.ok) throw new Error('Error al cargar mesas');
        
        return await response.json();
    } catch (error) {
        console.error('Error al cargar mesas:', error);
        showAlert('error', 'Error al cargar las mesas');
        return [];
    }
}

// Cargar reservaciones filtradas
async function cargarReservaciones(fecha, hora, sucursalId) {
    try {
        let url = `http://127.0.0.1:3000/renard/reservacion/filtradas?fecha=${fecha}&hora=${hora}`;
        if (sucursalId) {
            url += `&restaurante_fk=${sucursalId}`;
        }
        
        const response = await fetch(url);
        if (!response.ok) throw new Error('Error al cargar reservaciones');
        
        return await response.json();
    } catch (error) {
        console.error('Error al cargar reservaciones:', error);
        showAlert('error', 'Error al cargar las reservaciones');
        return [];
    }
}

// Calcular estadísticas
function calcularEstadisticas(mesas, reservaciones) {
    const totalMesas = mesas.length;
    const mesasDisponibles = mesas.filter(mesa => mesa.estado_mesa_fk === 1).length;
    
    const reservasPendientes = reservaciones.filter(res => res.estado_reservacion === 1 || res.estado_reservacion === 'Pendiente').length;
    const reservasConfirmadas = reservaciones.filter(res => res.estado_reservacion === 2 || res.estado_reservacion === 'Confirmada').length;
    
    // Calcular distribución por estado de mesa
    const estadoMesasData = estadosMesa.map(estado => {
        const count = mesas.filter(mesa => mesa.estado_mesa_fk === estado.id_estado_mesa).length;
        return {
            estado: estado.nombre,
            count: count,
            porcentaje: totalMesas > 0 ? (count / totalMesas * 100).toFixed(1) : 0
        };
    });
    
    // Calcular distribución por hora (simplificado)
    const horas = ['12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00', '21:00'];
    const reservasPorHora = horas.map(hora => {
        const count = reservaciones.filter(res => res.hora_inicio === hora).length;
        return count;
    });
    
    return {
        totalMesas,
        mesasDisponibles,
        reservasPendientes,
        reservasConfirmadas,
        estadoMesasData,
        reservasPorHora,
        horas
    };
}

// Actualizar contadores
function actualizarContadores(estadisticas) {
    document.getElementById('total-mesas').textContent = estadisticas.totalMesas;
    document.getElementById('mesas-disponibles').textContent = estadisticas.mesasDisponibles;
    document.getElementById('reservas-pendientes').textContent = estadisticas.reservasPendientes;
    document.getElementById('reservas-confirmadas').textContent = estadisticas.reservasConfirmadas;
}

// Actualizar gráficos
function actualizarGraficos(estadisticas) {
    actualizarGraficoEstadoMesas(estadisticas.estadoMesasData);
    actualizarGraficoReservasPorHora(estadisticas.reservasPorHora, estadisticas.horas);
}

// Gráfico de estado de mesas
function actualizarGraficoEstadoMesas(data) {
    const ctx = document.getElementById('estadoMesasChart');
    if (!ctx) return;
    
    if (estadoMesasChart) {
        estadoMesasChart.destroy();
    }
    
    estadoMesasChart = new Chart(ctx, {
        type: 'pie',
        data: {
            labels: data.map(item => item.estado),
            datasets: [{
                data: data.map(item => item.count),
                backgroundColor: [
                    '#28a745', // Disponible - verde
                    '#ffc107', // Ocupada - amarillo
                    '#dc3545', // Reservada - rojo
                    '#6c757d', // Mantenimiento - gris
                    '#17a2b8'  // Limpieza - azul
                ]
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: 'bottom'
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const label = context.label || '';
                            const value = context.raw || 0;
                            const total = context.dataset.data.reduce((a, b) => a + b, 0);
                            const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : 0;
                            return `${label}: ${value} (${percentage}%)`;
                        }
                    }
                }
            }
        }
    });
}

// Gráfico de reservas por hora
function actualizarGraficoReservasPorHora(data, labels) {
    const ctx = document.getElementById('reservasHoraChart');
    if (!ctx) return;
    
    if (reservasHoraChart) {
        reservasHoraChart.destroy();
    }
    
    reservasHoraChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Reservas por Hora',
                data: data,
                backgroundColor: '#007bff',
                borderColor: '#0056b3',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            scales: {
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Número de Reservas'
                    }
                },
                x: {
                    title: {
                        display: true,
                        text: 'Hora del Día'
                    }
                }
            }
        }
    });
}

// Actualizar tabla de disponibilidad por zona
function actualizarTablaDisponibilidad(mesas, reservaciones) {
    const tbody = document.getElementById('tabla-disponibilidad');
    if (!tbody) return;
    
    // Agrupar mesas por zona
    const mesasPorZona = {};
    mesas.forEach(mesa => {
        const zonaId = mesa.zona_fk;
        if (!mesasPorZona[zonaId]) {
            mesasPorZona[zonaId] = {
                total: 0,
                disponibles: 0,
                ocupadas: 0
            };
        }
        
        mesasPorZona[zonaId].total++;
        if (mesa.estado_mesa_fk === 1) {
            mesasPorZona[zonaId].disponibles++;
        } else {
            mesasPorZona[zonaId].ocupadas++;
        }
    });
    
    // Generar filas de la tabla
    let html = '';
    
    Object.entries(mesasPorZona).forEach(([zonaId, datos]) => {
        const zona = zonas.find(z => z.id_zona == zonaId);
        const zonaNombre = zona ? zona.nombre : `Zona ${zonaId}`;
        const porcentajeDisponible = datos.total > 0 ? ((datos.disponibles / datos.total) * 100).toFixed(1) : 0;
        
        html += `
            <tr>
                <td>${zonaNombre}</td>
                <td>${datos.total}</td>
                <td>${datos.disponibles}</td>
                <td>${datos.ocupadas}</td>
                <td>${porcentajeDisponible}%</td>
            </tr>
        `;
    });
    
    if (html === '') {
        html = '<tr><td colspan="5" class="text-center">No hay datos disponibles</td></tr>';
    }
    
    tbody.innerHTML = html;
}

// Inicialización cuando el DOM está listo
document.addEventListener('DOMContentLoaded', async () => {
    await cargarDatosAuxiliares();
    await cargarSucursales();
    
    // Establecer fecha de hoy por defecto si no está ya establecida
    const fechaInput = document.getElementById('fecha');
    if (fechaInput && !fechaInput.value) {
        const hoy = new Date().toISOString().split('T')[0];
        fechaInput.value = hoy;
    }
    
    // Cargar datos iniciales
    await cargarDatos();
});

// Hacer la función cargarDatos global para que pueda ser llamada desde el HTML
window.cargarDatos = cargarDatos;
