// utils.js

// Llena cualquier <select> con data
export function llenarSelect(data, selectId, textField, valueField) {
  const select = document.getElementById(selectId);
  select.innerHTML = '<option value="">Seleccione una opción</option>';

  data.forEach(item => {
    const option = document.createElement('option');
    option.value = item[valueField];
    option.textContent = item[textField];
    select.appendChild(option);
  });
}

// Valida duración mínima y máxima de una reservación
export function validarHoraFin() {
  const horaInicio = document.getElementById('hora_inicio').value;
  const horaFin = document.getElementById('hora_fin').value;

  if (horaInicio && horaFin) {
    const inicio = new Date(`2000-01-01T${horaInicio}`);
    const fin = new Date(`2000-01-01T${horaFin}`);

    const diferenciaMinutos = (fin - inicio) / (1000 * 60);

    if (diferenciaMinutos <= 30) {
      showAlert('warning', 'La duración mínima de la reservación debe ser de 30 minutos');
      document.getElementById('hora_fin').value = '';
      return false;
    }

    if (diferenciaMinutos >= 120) {
      showAlert('warning', 'La duración máxima de la reservación debe ser de 2 horas');
      document.getElementById('hora_fin').value = '';
      return false;
    }

    return true;
  }
  return true;
}

// Muestra alertas con SweetAlert2
export function showAlert(type, message) {
  Swal.fire({
    icon: type,
    title: message,
    showConfirmButton: false,
    timer: 2000
  });
}

// Mostrar/ocultar overlay de carga
export function showLoading(show) {
  const loadingElement = document.getElementById('loadingOverlay');
  if (loadingElement) {
    loadingElement.style.display = show ? 'flex' : 'none';
  }
}
