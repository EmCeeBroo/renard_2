import { TableManager } from '../../assets/js/tableFilters.js';

// Variables globales
let modalEstadoReservacion;
//
const URL = "http://127.0.0.1:3000/renard/estado-reservacion"; 


// Inicialización cuando el DOM está listo
document.addEventListener('DOMContentLoaded', () => {
  modalEstadoReservacion = new bootstrap.Modal(document.getElementById('modalEstadoReservacion'));
  cargarEstadoReservaciones();

  const form = document.getElementById('formEstadoReservacion');
  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const id = document.getElementById('id_estado_reservacion').value;
    const nombre = document.getElementById('nombre').value.trim();
    const descripcion = document.getElementById('descripcion').value.trim();

    if (!nombre) {
      showAlert('warning', 'El nombre es obligatorio');
      return;
    }

    const data = { nombre, descripcion };

    try {
      showLoading(true);
      let response;
      if (id) {
        response = await fetch(`${URL}/${id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data)
        });
      } else {
        response = await fetch(URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data)
        });
      }

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error en la operación');
      }

      showAlert('success', id ? 'Estado de reservación actualizado' : 'Estado de reservación agregado');
      modalEstadoReservacion.hide();
      cargarEstadoReservaciones();
    } catch (error) {
      console.error(error);
      showAlert('error', 'Error al guardar el estado de reservación.');
    } finally {
      showLoading(false);
    }
  });

  const btnAgregar = document.getElementById('btnAgregar');
  btnAgregar.addEventListener('click', () => {
    document.getElementById('formEstadoReservacion').reset();
    document.getElementById('id_estado_reservacion').value = '';
    document.getElementById('modalTitulo').textContent = 'Agregar estado de reservación';
    modalEstadoReservacion.show();
  });

  const btnCancelar = document.getElementById('btnCancelar');
  btnCancelar.addEventListener('click', (e) => {
    e.preventDefault();
    modalEstadoReservacion.hide();
  });
});

// Cargar estados de reservación
async function cargarEstadoReservaciones() {
  try {
    showLoading(true);

    const response = await fetch(URL);
    if (!response.ok) {
      throw new Error(`Error ${response.status}: ${response.statusText}`);
    }

    const estados = await response.json();
    // Normalizar para búsquedas y filtros
    const normalizados = estados.map(e => ({
      ...e,
      nombre_norm: e.nombre?.trim().toLowerCase() || "",
    }));

    // Poblar filtro dinámico
    const filtro = document.getElementById("filtroEstadoReservacion");
    if (filtro) {
      filtro.innerHTML = '<option value="">Todos los estados</option>';
      [...new Set(normalizados.map(e => e.nombre_norm))].forEach(nombre => {
        const opt = document.createElement("option");
        opt.value = nombre;
        opt.textContent = nombre.charAt(0).toUpperCase() + nombre.slice(1); // Capitalizar para mostrar
        filtro.appendChild(opt);
      });
    }

    // TableManager con filtro por nombre_norm
    new TableManager({
      data: normalizados,
      textFilterId: "buscarEstadoReservacion",
      selectFilters: [{ id: "filtroEstadoReservacion", field: "nombre_norm" }],
      tbodyId: "tablaEstadoReservacionBody",
      renderRow: (estado) => `
        <td>${estado.id_estado_reservacion}</td>
        <td>${estado.nombre}</td>
        <td>${estado.descripcion || ''}</td>
        <td>${new Date(estado.created_at || '').toLocaleString()}</td>
        <td>${new Date(estado.updated_at || '').toLocaleString()}</td>
        <td>
          <button class="btn-action btn-edit" title="Editar" data-id="${estado.id_estado_reservacion}">
            <i class="bi bi-pencil-square"></i>
          </button>
          <button class="btn-action btn-delete" title="Eliminar" data-id="${estado.id_estado_reservacion}">
            <i class="bi bi-trash3-fill"></i>
          </button>
        </td>
      `
    });

    // Delegación de eventos para editar/eliminar
    const tbody = document.getElementById("tablaEstadoReservacionBody");
    if (tbody) {
      tbody.addEventListener("click", (e) => {
        const btn = e.target.closest("button");
        if (!btn) return;

        const id = btn.dataset.id;
        if (btn.classList.contains("btn-edit")) abrirModalEditarEstadoReservacion(id);
        if (btn.classList.contains("btn-delete")) confirmarEliminarEstadoReservacion(id);
      });
    }
  } catch (error) {
    console.error('Error al cargar estados de reservación:', error);
    showAlert('error', 'No se pudieron cargar los estados de reservación');
  } finally {
    showLoading(false);
  }
}

// Abrir modal de edición
async function abrirModalEditarEstadoReservacion(id) {
  try {
    showLoading(true);

    const response = await fetch(`${URL}/${id}`);
    if (!response.ok) {
      throw new Error(`Error ${response.status}: ${response.statusText}`);
    }

    const estado = await response.json();

    document.getElementById('id_estado_reservacion').value = estado.id_estado_reservacion;
    document.getElementById('nombre').value = estado.nombre;
    document.getElementById('descripcion').value = estado.descripcion || '';

    document.getElementById('modalTitulo').textContent = 'Editar Estado de Reservación';
    modalEstadoReservacion.show();

  } catch (error) {
    console.error('Error al abrir modal de edición:', error);
    showAlert('error', 'No se pudo cargar el estado de reservación');
  } finally {
    showLoading(false);
  }
}

function confirmarEliminarEstadoReservacion(id) {
  Swal.fire({
    title: '¿Está seguro de eliminar este estado de reservación?',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: 'Sí, eliminar',
    cancelButtonText: 'Cancelar'
  }).then((result) => {
    if (result.isConfirmed) {
      eliminarEstadoReservacion(id);
    }
  });
}

// Eliminar estado de reservación
async function eliminarEstadoReservacion(id) {
  try {
    showLoading(true);

    const response = await fetch(`${URL}/${id}`, {
      method: 'DELETE'
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Error al eliminar');
    }

    showAlert('success', 'Estado de reservación eliminado correctamente');
    cargarEstadoReservaciones();

  } catch (error) {
    console.error('Error al eliminar estado de reservación:', error);
    showAlert('error', 'Error al eliminar el estado de reservación');
  } finally {
    showLoading(false);
  }
}

// Mostrar alerta
function showAlert(type, message) {
  Swal.fire({
    icon: type,
    title: message,
    showConfirmButton: false,
    timer: 2000
  });
}

// Mostrar/ocultar loading
function showLoading(show) {
  const loadingElement = document.getElementById('loadingOverlay');
  if (loadingElement) {
    loadingElement.style.display = show ? 'flex' : 'none';
  }
}
