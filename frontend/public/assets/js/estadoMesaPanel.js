import { TableManager } from '../../assets/js/tableFilters.js';

// Variables globales
let modalEstadoMesa;
const URL = "http://192.168.0.9:3000/renard/estado-mesa";

// Inicialización cuando el DOM está listo
document.addEventListener('DOMContentLoaded', () => {
  modalEstadoMesa = new bootstrap.Modal(document.getElementById('modalEstadoMesa'));
  cargarEstadoMesas();

  const form = document.getElementById('formEstadoMesa');
  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const id = document.getElementById('id_estado_mesa').value;
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

      showAlert('success', id ? 'Estado de mesa actualizado' : 'Estado de mesa agregado');
      modalEstadoMesa.hide();
      cargarEstadoMesas();
    } catch (error) {
      console.error(error);
      showAlert('error', 'Error al guardar el estado de mesa.');
    } finally {
      showLoading(false);
    }
  });

  const btnAgregar = document.getElementById('btnAgregar');
  btnAgregar.addEventListener('click', () => {
    document.getElementById('formEstadoMesa').reset();
    document.getElementById('id_estado_mesa').value = '';
    document.getElementById('modalEstadoMesaTitulo').textContent = 'Agregar estado de mesa';
    modalEstadoMesa.show();
  });

  const btnCancelar = document.getElementById('btnCancelar');
  btnCancelar.addEventListener('click', (e) => {
    e.preventDefault();
    modalEstadoMesa.hide();
  });
});

// Cargar estados de mesa
async function cargarEstadoMesas() {
  try {
    showLoading(true);

    const response = await fetch(URL);
    if (!response.ok) {
      throw new Error(`Error ${response.status}: ${response.statusText}`);
    }

    const estados = await response.json();
    // renderizarEstadoMesas(estados);
    // Normalizar para búsquedas y filtros
      const normalizados = estados.map(e => ({
        ...e,
        nombre_norm: e.nombre?.trim().toLowerCase() || "",
      }));

      // Poblar filtro dinámico
      const filtro = document.getElementById("filtroEstadoMesa");
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
        textFilterId: "buscarEstadoMesa",
        selectFilters: [{ id: "filtroEstadoMesa", field: "nombre_norm" }],
        tbodyId: "tablaEstadoMesasBody",
        renderRow: (estado) => `
          <td>${estado.id_estado_mesa}</td>
          <td>${estado.nombre}</td>
          <td>${estado.descripcion || ''}</td>
          <td>${new Date(estado.created_at || '').toLocaleString()}</td>
          <td>${new Date(estado.updated_at || '').toLocaleString()}</td>
          <td>
            <button class="btn-action btn-edit" title="Editar" data-id="${estado.id_estado_mesa}">
              <i class="bi bi-pencil-square"></i>
            </button>
          </td>
          <td>
            <button class="btn-action btn-delete" title="Eliminar" data-id="${estado.id_estado_mesa}">
              <i class="bi bi-trash3-fill"></i>
            </button>
          </td>
        `
      });

      // Delegación de eventos para editar/eliminar
      const tbody = document.getElementById("tablaEstadoMesasBody");
      if (tbody) {
        tbody.addEventListener("click", (e) => {
          const btn = e.target.closest("button");
          if (!btn) return;

          const id = btn.dataset.id;
          if (btn.classList.contains("btn-edit")) abrirModalEditarEstadoMesa(id);
          if (btn.classList.contains("btn-delete")) confirmarEliminarEstadoMesa(id);
        });
      }
  } catch (error) {
    console.error('Error al cargar estados de mesa:', error);
    showAlert('error', 'No se pudieron cargar los estados de mesa');
  } finally {
    showLoading(false);
  }
} 

// Abrir modal de edición
async function abrirModalEditarEstadoMesa(id) {
  try {
    showLoading(true);

    const response = await fetch(`${URL}/${id}`);
    if (!response.ok) {
      throw new Error(`Error ${response.status}: ${response.statusText}`);
    }

    const estado = await response.json();

    document.getElementById('id_estado_mesa').value = estado.id_estado_mesa;
    document.getElementById('nombre').value = estado.nombre;
    document.getElementById('descripcion').value = estado.descripcion || '';

    document.getElementById('modalEstadoMesaTitulo').textContent = 'Editar Estado de Mesa';
    modalEstadoMesa.show();

  } catch (error) {
    console.error('Error al abrir modal de edición:', error);
    showAlert('error', 'No se pudo cargar el estado de mesa');
  } finally {
    showLoading(false);
  }
}

function confirmarEliminarEstadoMesa(id) {
  Swal.fire({
    title: '¿Está seguro de eliminar este estado de mesa?',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: 'Sí, eliminar',
    cancelButtonText: 'Cancelar'
  }).then((result) => {
    if (result.isConfirmed) {
      eliminarEstadoMesa(id);
    }
  });
}

// Eliminar estado de mesa
async function eliminarEstadoMesa(id) {
  try {
    showLoading(true);

    const response = await fetch(`${URL}/${id}`, {
      method: 'DELETE'
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Error al eliminar');
    }

    showAlert('success', 'Estado de mesa eliminado correctamente');
    cargarEstadoMesas();

  } catch (error) {
    console.error('Error al eliminar estado de mesa:', error);
    showAlert('error', 'Error al eliminar el estado de mesa');
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
