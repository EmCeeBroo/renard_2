document.addEventListener('DOMContentLoaded', () => {
  const tablaBody = document.getElementById('historialReservasTableBody');

  // Obtener el ID del restaurante del usuario logueado desde localStorage
  const usuarioData = JSON.parse(localStorage.getItem('usuario') || '{}');
  const restauranteId = usuarioData.restaurante_fk;

  if (!restauranteId) {
    console.error('No se encontró el ID del restaurante del usuario');
    return;
  }

  // Función para cargar las reservas del historial
  async function cargarHistorialReservas() {
    try {
      const response = await fetch(`http://127.0.0.1:3000/renard/historial-reservacion?restaurante_fk=${restauranteId}`);
      if (!response.ok) {
        throw new Error(`Error HTTP: ${response.status}`);
      }
      const reservas = await response.json();

      if (!Array.isArray(reservas)) {
        console.error('La respuesta no es un arreglo:', reservas);
        return;
      }

      tablaBody.innerHTML = '';

      reservas.forEach(reserva => {
        const fila = document.createElement('tr');

        fila.innerHTML = `
          <td>${reserva.id_reservacion}</td>
          <td>${reserva.numero_personas}</td>
          <td>${new Date(reserva.fecha).toLocaleDateString()}</td>
          <td>${reserva.hora_inicio}</td>
          <td>${reserva.hora_fin || ''}</td>
          <td>${reserva.estado_reservacion}</td>
          <td>${reserva.anotaciones || ''}</td>
          <td>${reserva.nombre_restaurante || ''}</td>
          <td>${reserva.nombre_usuario || ''} ${reserva.apellido_usuario || ''}</td>
          <td>${reserva.numero_mesa || ''}</td>
          <td>${new Date(reserva.created_at).toLocaleString()}</td>
          <td>${new Date(reserva.updated_at).toLocaleString()}</td>
        `;

        tablaBody.appendChild(fila);
      });
    } catch (error) {
      console.error('Error al cargar el historial de reservas:', error);
    }
  }

  cargarHistorialReservas();
});
