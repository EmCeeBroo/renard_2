import { showAlert, showLoading } from '../../assets/js/utils.js';

let modalCategoria;
let modalEditCategoria;
let categoriasData = [];
let filtroBusqueda = '';

document.addEventListener('DOMContentLoaded', () => {
  modalCategoria = new bootstrap.Modal(document.getElementById('createCategoriaModal'));
  modalEditCategoria = new bootstrap.Modal(document.getElementById('editCategoriaModal'));

  // Obtener el ID del restaurante del usuario logueado (igual que en sucursales)
  const usuarioData = JSON.parse(localStorage.getItem('usuario') || '{}');
  const restauranteId = usuarioData.restaurante_fk;

  if (!restauranteId) {
    console.error('No se encontró el ID del restaurante del usuario');
    return;
  }

  cargarCategorias();

  const buscarInput = document.getElementById('buscarInput');
  if (buscarInput) {
    buscarInput.addEventListener('input', (e) => {
      filtroBusqueda = e.target.value.toLowerCase();
      filtrarCategorias();
    });
  }

  const createForm = document.getElementById('createCategoriaForm');
  if (createForm) {
    createForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      const nombre = document.getElementById('createNombre').value.trim();

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

      const data = { nombre, restaurante_fk };

      try {
        showLoading(true);
        const response = await fetch('http://127.0.0.1:3000/renard/categoria', {
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

        showAlert('success', 'Categoría agregada correctamente');
        modalCategoria.hide();
        createForm.reset();
        cargarCategorias();
      } catch (error) {
        console.error(error);
        showAlert('error', error.message || 'Error al guardar la categoría.');
      } finally {
        showLoading(false);
      }
    });
  }

  const editForm = document.getElementById('editCategoriaForm');
  if (editForm) {
    editForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      const id = document.getElementById('editCategoriaIdEdit').value;
      const nombre = document.getElementById('editNombre').value.trim();

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

      const data = { nombre, restaurante_fk };

      try {
        showLoading(true);
        const response = await fetch(`http://127.0.0.1:3000/renard/categoria/${id}`, {
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

        showAlert('success', 'Categoría actualizada correctamente');
        modalEditCategoria.hide();
        cargarCategorias();
      } catch (error) {
        console.error(error);
        showAlert('error', error.message || 'Error al actualizar la categoría.');
      } finally {
        showLoading(false);
      }
    });
  }

  const btnAgregar = document.getElementById('btnAgregar');
  if (btnAgregar) {
    btnAgregar.addEventListener('click', () => {
      const createForm = document.getElementById('createCategoriaForm');
      if (createForm) createForm.reset();
      modalCategoria.show();
    });
  }

  const btnCancelar = document.getElementById('btnCancelar');
  if (btnCancelar) {
    btnCancelar.addEventListener('click', (e) => {
      e.preventDefault();
      modalCategoria.hide();
    });
  }
});

// Función para obtener el restaurante_fk del contexto actual
function getRestauranteFk() {
  // Obtener el ID del restaurante del usuario logueado (igual que en sucursales)
  const usuarioData = JSON.parse(localStorage.getItem('usuario') || '{}');
  const restauranteId = usuarioData.restaurante_fk;

  if (!restauranteId) {
    console.error('No se encontró el ID del restaurante del usuario');
    return null;
  }

  return restauranteId;
}

async function cargarCategorias() {
  try {
    showLoading(true);
    
    // Obtener el restaurante_fk para filtrar las categorías
    const restauranteFk = getRestauranteFk();
    
    // Construir la URL con o sin filtro de restaurante
    const url = restauranteFk 
      ? `renard/categoria?restaurante_fk=${restauranteFk}`
      : 'renard/categoria';
    
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Error ${response.status}: ${response.statusText}`);
    }
    
    categoriasData = await response.json();
    renderizarCategorias(categoriasData);
  } catch (error) {
    console.error('Error al cargar categorías:', error);
    showAlert('error', 'No se pudieron cargar las categorías');
  } finally {
    showLoading(false);
  }
}

function filtrarCategorias() {
  const filtradas = categoriasData.filter(categoria =>
    categoria.nombre.toLowerCase().includes(filtroBusqueda)
  );
  renderizarCategorias(filtradas);
}

function renderizarCategorias(categorias) {
  const tbody = document.querySelector('#categoriaTableBody');
  if (!tbody) return;
  tbody.innerHTML = '';

  if (categorias.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="6" class="text-center">No hay categorías registradas</td>
      </tr>
    `;
    return;
  }

  categorias.forEach(categoria => {
    const fechaCreacion = categoria.created_at 
      ? new Date(categoria.created_at).toLocaleDateString('es-ES')
      : 'N/A';
    
    const fechaActualizacion = categoria.updated_at 
      ? new Date(categoria.updated_at).toLocaleDateString('es-ES')
      : 'N/A';

    const nombreRestaurante = categoria.restaurante && categoria.restaurante.nombre 
      ? categoria.restaurante.nombre 
      : 'Sin restaurante';

    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${categoria.id_categoria}</td>
      <td>${categoria.nombre}</td>
      <td>${nombreRestaurante}</td>
      <td>${fechaCreacion}</td>
      <td>${fechaActualizacion}</td>
      <td>
        <div class="action-buttons">
          <button class="btn-action btn-edit" onclick="abrirModalEditarCategoria(${categoria.id_categoria})" title="Editar">
            <i class="bi bi-pencil-square"></i>
          </button>
          <button class="btn-action btn-delete" onclick="confirmarEliminarCategoria(${categoria.id_categoria})" title="Eliminar">
            <i class="bi bi-trash3-fill"></i>
          </button>
        </div>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

async function abrirModalEditarCategoria(id) {
  try {
    showLoading(true);
    const response = await fetch(`http://127.0.0.1:3000/renard/categoria/${id}`);
    if (!response.ok) {
      throw new Error(`Error ${response.status}: ${response.statusText}`);
    }
    const categoria = await response.json();
    document.getElementById('editCategoriaIdEdit').value = categoria.id_categoria;
    document.getElementById('editNombre').value = categoria.nombre;
    modalEditCategoria.show();
  } catch (error) {
    console.error('Error al abrir modal de edición:', error);
    showAlert('error', 'No se pudo cargar la categoría');
  } finally {
    showLoading(false);
  }
}

function confirmarEliminarCategoria(id) {
  Swal.fire({
    title: '¿Está seguro de eliminar esta categoría?',
    text: 'Esta acción no se puede deshacer',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#d33',
    cancelButtonColor: '#3085d6',
    confirmButtonText: 'Sí, eliminar',
    cancelButtonText: 'Cancelar'
  }).then((result) => {
    if (result.isConfirmed) {
      eliminarCategoria(id);
    }
  });
}

async function eliminarCategoria(id) {
  try {
    showLoading(true);
    const response = await fetch(`http://127.0.0.1:3000/renard/categoria/${id}`, {
      method: 'DELETE'
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || errorData.message || 'Error al eliminar');
    }
    showAlert('success', 'Categoría eliminada correctamente');
    cargarCategorias();
  } catch (error) {
    console.error('Error al eliminar categoría:', error);
    showAlert('error', error.message || 'Error al eliminar la categoría');
  } finally {
    showLoading(false);
  }
}

// Exportar funciones al objeto window para que sean accesibles desde HTML
window.abrirModalEditarCategoria = abrirModalEditarCategoria;
window.confirmarEliminarCategoria = confirmarEliminarCategoria;