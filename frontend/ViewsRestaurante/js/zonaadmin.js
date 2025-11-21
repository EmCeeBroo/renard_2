import { showAlert, showLoading } from '../../assets/js/utils.js';

let createZonaModal;
let editZonaModal;
let ZonaData = [];
let filtroBusqueda = '';

document.addEventListener('DOMContentLoaded', () => {
  createZonaModal = new bootstrap.Modal(document.getElementById('createZonaModal'));
  editZonaModal = new bootstrap.Modal(document.getElementById('editZonaModal'));

  // Obtener el ID del restaurante del usuario logueado (igual que en categorías)
  const usuarioData = JSON.parse(localStorage.getItem('usuario') || '{}');
  const restauranteId = usuarioData.restaurante_fk;

  if (!restauranteId) {
    console.error('No se encontró el ID del restaurante del usuario');
    return;
  }

  cargarZona();

  const buscarInput = document.getElementById('buscarInput');
  if (buscarInput) {
    buscarInput.addEventListener('input', (e) => {
      filtroBusqueda = e.target.value.toLowerCase();
      filtrarZona();
    });
  }

  const createZonaForm = document.getElementById('createZonaForm');
  if (createZonaForm) {
    createZonaForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      const nombre = document.getElementById('createNombre').value.trim();
      const descripcion = document.getElementById('createDescripcion').value.trim();

      if (!nombre) {
        showAlert('warning', 'El nombre es obligatorio');
        return;
      }

      // Obtener el restaurante_fk del contexto (localStorage, usuario actual, etc.)
      const restaurante_fk = getRestauranteFk();
      
      if (!restaurante_fk) {
        showAlert('error', 'No se pudo identificar el restaurante. Por favor, inicie sesión nuevamente.');
        return;
      }

      const data = { nombre, descripcion, restaurante_fk };

      try {
        showLoading(true);
        const response = await fetch('http://127.0.0.1:3000/renard/zona', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(data)
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Error en la operación');
        }

        showAlert('success', 'Zona creada correctamente');
        createZonaModal.hide();
        createZonaForm.reset();
        cargarZona();
      } catch (error) {
        console.error(error);
        showAlert('error', error.message || 'Error al crear el zona');
      } finally {
        showLoading(false);
      }
    });
  }

  const editZonaForm = document.getElementById('editZonaForm');
  if (editZonaForm) {
    editZonaForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      const id = document.getElementById('editZonaId').value;
      const nombre = document.getElementById('editNombre').value.trim();
      const descripcion = document.getElementById('editDescripcion').value.trim();

      if (!nombre) {
        showAlert('warning', 'El nombre es obligatorio');
        return;
      }

      // Obtener el restaurante_fk del contexto
      const restaurante_fk = getRestauranteFk();
      
      if (!restaurante_fk) {
        showAlert('error', 'No se pudo identificar el restaurante. Por favor, inicie sesión nuevamente.');
        return;
      }

      const data = { nombre, descripcion, restaurante_fk };

      try {
        showLoading(true);
        const response = await fetch(`http://127.0.0.1:3000/renard/zona/${id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(data)
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Error en la operación');
        }

        showAlert('success', 'Zona actualizado correctamente');
        editZonaModal.hide();
        cargarZona();
      } catch (error) {
        console.error(error);
        showAlert('error', error.message || 'Error al actualizar la zona');
      } finally {
        showLoading(false);
      }
    });
  }

  const btnAgregar = document.getElementById('btnAgregar');
  if (btnAgregar) {
    btnAgregar.addEventListener('click', () => {
      const createForm = document.getElementById('createZonaForm');
      if (createForm) createForm.reset();
      createZonaModal.show();
    });
  }

  const btnCancelar = document.getElementById('btnCancelar');
  if (btnCancelar) {
    btnCancelar.addEventListener('click', (e) => {
      e.preventDefault();
      createZonaModal.hide();
    });
  }
});

// Función para obtener el restaurante_fk del contexto actual
function getRestauranteFk() {
  // Obtener el ID del restaurante del usuario logueado (igual que en categorías)
  const usuarioData = JSON.parse(localStorage.getItem('usuario') || '{}');
  const restauranteId = usuarioData.restaurante_fk;

  if (!restauranteId) {
    console.error('No se encontró el ID del restaurante del usuario');
    return null;
  }

  return restauranteId;
}

async function cargarZona() {
  try {
    showLoading(true);
    
    // Obtener el restaurante_fk para filtrar las zonas
    const restauranteFk = getRestauranteFk();
    
    // Construir la URL con o sin filtro de restaurante
    const url = restauranteFk 
      ? `renard/zona?restaurante_fk=${restauranteFk}`
      : 'renard/zona';
    
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Error ${response.status}: ${response.statusText}`);
    }
    
    ZonaData = await response.json();
    filtrarZona();
  } catch (error) {
    console.error('Error al cargar zonas:', error);
    showAlert('error', 'No se pudieron cargar las zonas');
  } finally {
    showLoading(false);
  }
}

function filtrarZona() {
  const filtrados = ZonaData.filter(zona =>
    zona.nombre.toLowerCase().includes(filtroBusqueda) ||
    (zona.descripcion && zona.descripcion.toLowerCase().includes(filtroBusqueda))
  );
  renderizarZona(filtrados);
}

function renderizarZona(zona) {
  const tbody = document.getElementById('zonaTableBody');
  if (!tbody) return;
  tbody.innerHTML = '';

  if (zona.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="7" class="text-center">No hay zonas registradas</td>
      </tr>
    `;
    return;
  }

  zona.forEach(zona => {
    const fechaCreacion = zona.created_at
      ? new Date(zona.created_at).toLocaleDateString('es-ES')
      : 'N/A';

    const fechaActualizacion = zona.updated_at
      ? new Date(zona.updated_at).toLocaleDateString('es-ES')
      : 'N/A';

    /*const nombreRestaurante = zona.restaurante && zona.restaurante.nombre
      ? zona.restaurante.nombre
      : 'Sin restaurante';*/

    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${zona.id_zona}</td>
      <td>${zona.nombre}</td>
      <td>${zona.descripcion || ''}</td>
      <td>${fechaCreacion}</td>
      <td>${fechaActualizacion}</td>
      <td>
        <div class="action-buttons">
          <button class="btn-action btn-edit" onclick="abrirModalEditarZona(${zona.id_zona})" title="Editar">
            <i class="bi bi-pencil-square"></i>
          </button>
          <button class="btn-action btn-delete" onclick="confirmarEliminarZona(${zona.id_zona})" title="Eliminar">
            <i class="bi bi-trash3-fill"></i>
          </button>
        </div>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

async function abrirModalEditarZona(id) {
  try {
    showLoading(true);
    const response = await fetch(`http://127.0.0.1:3000/renard/zona/${id}`);
    if (!response.ok) {
      throw new Error(`Error ${response.status}: ${response.statusText}`);
    }
    const zona = await response.json();
    document.getElementById('editZonaId').value = zona.id_zona;
    document.getElementById('editNombre').value = zona.nombre;
    document.getElementById('editDescripcion').value = zona.descripcion || '';
    editZonaModal.show();
  } catch (error) {
    console.error('Error al abrir modal de edición:', error);
    showAlert('error', 'No se pudo cargar la zona');
  } finally {
    showLoading(false);
  }
}

function confirmarEliminarZona(id) {
  Swal.fire({
    title: '¿Está seguro de eliminar esta zona?',
    text: 'Esta acción no se puede deshacer',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#d33',
    cancelButtonColor: '#3085d6',
    confirmButtonText: 'Sí, eliminar',
    cancelButtonText: 'Cancelar'
  }).then((result) => {
    if (result.isConfirmed) {
      eliminarZona(id);
    }
  });
}

async function eliminarZona(id) {
  try {
    showLoading(true);
    const response = await fetch(`http://127.0.0.1:3000/renard/zona/${id}`, {
      method: 'DELETE'
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || errorData.message || 'Error al eliminar');
    }
    showAlert('success', 'Zona eliminado correctamente');
    cargarZona();
  } catch (error) {
    console.error('Error al eliminar zona:', error);
    showAlert('error', error.message || 'Error al eliminar el zona');
  } finally {
    showLoading(false);
  }
}

// Exportar funciones al objeto window para que sean accesibles desde HTML
window.abrirModalEditarZona = abrirModalEditarZona;
window.confirmarEliminarZona = confirmarEliminarZona;