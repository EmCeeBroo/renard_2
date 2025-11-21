import { TableFilterManager } from "../js/tableFilterManager.js";

const URL = "http://127.0.0.1:3000/renard/historial-reservacion"; 


document.addEventListener('DOMContentLoaded', () => {
  const tablaHistorial = document.getElementById('tablaHistorialReservacion');
  const cuerpoTabla = document.getElementById('tablaHistorialReservacionBody');
  const paginacion = document.getElementById('paginacionHistorial');
  
  // Filtros
  const inputBusqueda = document.getElementById('buscarHistorialReservacion');
  const selectEstado = document.getElementById('filtroEstadoHistorial');
  
  // Diccionario para mapear estados de reservación
  const estados = {
    1: { text: 'Pendiente', color: "warning" },   // Amarillo
    2: { text: 'Confirmada', color: "primary" }, // Azul
    3: { text: 'Cancelada', color: "danger" },   // Rojo
    4: { text: 'Completada', color: "success" }  // Verde
  };
  
  let tableFilterManager;
  
  // Función para obtener y mostrar los registros
  async function listarHistorial() {
    try {
      const response = await fetch(URL);
      const data = await response.json();
      
      // Limpiar cuerpo tabla
      cuerpoTabla.innerHTML = '';
      
      // Pintar filas
      data.forEach(item => {
        const fila = cuerpoTabla.insertRow();
        
        // Columna 1: ID
        fila.insertCell(0).textContent = item.id_reservacion;
        
        // Columna 2: Fecha
        const fecha = new Date(item.updated_at);
        fila.insertCell(1).textContent = fecha.toLocaleString('es-CO', {
          timeZone: 'America/Bogota',
          dateStyle: 'medium',
          timeStyle: 'short'
        });
        
        // Columna 3: Restaurante
        fila.insertCell(2).textContent = item.nombre_restaurante;
        
        // Columna 4: Estado
        const estado = estados[item.estado_reservacion] || { text: 'Desconocido', color: "secondary" };
        fila.insertCell(3).innerHTML = `<span class="badge bg-${estado.color}">${estado.text}</span>`;
      });
      
      // Inicializar TableFilterManager después de cargar los datos
      if (tableFilterManager) {
        // Si ya existe, actualizar los datos
        tableFilterManager.updateData();
      } else {
        // Crear nuevo manejador de filtros
        tableFilterManager = new TableFilterManager(tablaHistorial, {
          searchInput: inputBusqueda,
          filterSelect: selectEstado,
          filterColumnIndex: 3, // El estado está en la columna 3
          paginationContainer: paginacion,
          rowsPerPage: 5
        });
      }
      
    } catch (error) {
      console.error('Error al cargar historial:', error);
      // Mostrar mensaje de error en la tabla
      cuerpoTabla.innerHTML = `
        <tr>
          <td colspan="4" class="text-center text-danger">
            <i class="bi bi-exclamation-triangle"></i> 
            Error al cargar los datos. Por favor, inténtelo nuevamente.
          </td>
        </tr>
      `;
    }
  }
  
  // Función para recargar los datos
  Window.recargarHistorial = function() {
    listarHistorial();
  };
  
  // Inicializar listado
  listarHistorial();
});