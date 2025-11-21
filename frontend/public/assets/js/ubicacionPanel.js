let modalEditarUbicacion;
let modalCrearUbicacion;

let restaurantes = [];

const URL = "http://127.0.0.1:3000/renard/ubicacion"; 
const RESTAURANTE = "http://127.0.0.1:3000/renard/restaurante"; 



document.addEventListener('DOMContentLoaded', async () => {
  modalEditarUbicacion = new bootstrap.Modal(document.getElementById('editUbicacionModal'));
  modalCrearUbicacion = new bootstrap.Modal(document.getElementById('createUbicacionModal'));

  await cargarSelects();
  await cargarUbicacion();

  document.getElementById('editUbicacionForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    await guardarCambiosUbicacion();
  });

  document.getElementById('createUbicacionForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    await crearUbicacion();
  });
});

async function cargarSelects() {
  [restaurantes ] = await Promise.all([
    fetch(RESTAURANTE).then(r => r.json()),
  ]);

  llenarSelect(restaurantes, 'createRestaurante', 'nombre', 'id_restaurante');
  llenarSelect(restaurantes, 'editRestaurante', 'nombre', 'id_restaurante');

}

function llenarSelect(data, selectId, textProp, valueProp) {
  const select = document.getElementById(selectId);
  select.innerHTML = '<option value="">Seleccione una opción</option>';

  data.forEach(item => {
    const option = document.createElement('option');
    option.value = item[valueProp];
    option.textContent = item[textProp];
    select.appendChild(option);
  });
}

async function cargarUbicacion() {
  try {
    showLoading(true);
    const response = await fetch(URL);
    const ubicaciones = await response.json();
    renderizarUbicaciones(ubicaciones);
  } catch (error) {
    console.error('Error al cargar ubicaciones', error);
    showAlert('error', 'No se pudieron cargar las ubicaciones');
  } finally {
    showLoading(false);
  }
}

function renderizarUbicaciones(ubicaciones) {
  const tbody = document.querySelector('#ubicacionTableBody');
  tbody.innerHTML = '';

  if (ubicaciones.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="10" class="text-center">No hay productos-menu registrados</td>
      </tr>
    `;
    return;
  }

  ubicaciones.forEach(res => {
    const restaurante = restaurantes.find(u => u.id_restaurante === res.restaurante_fk);

    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${res.id_ubicacion}</th>
      <td>${res.nombre}</th>
      <td>${res.direccion}</th>
      <td>${res.ciudad}</th>
      <td>${res.descripcion}</th>
      <td>${restaurante?.nombre || res.restaurante_fk}</td>
      <td>${new Date(res.created_at || '').toLocaleString()}</td>
      <td>${new Date(res.updated_at || '').toLocaleString()}</td>  
      <td>
        <div class="action-buttons">
          <button class="btn-action btn-edit" onclick="abrirModalEditarUbicacion(${res.id_ubicacion})" title="Editar">
            <i class="bi bi-pencil-square"></i>
          </button>
          <button class="btn-action btn-delete" onclick="confirmarEliminarUbicacion(${res.id_ubicacion})" title="Eliminar">
            <i class="bi bi-trash3-fill"></i>
          </button>
        </div>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

async function abrirModalEditarUbicacion(id) {
  try {
    showLoading(true);
    const response = await fetch(`${URL}/${id}`);
    const ubicacion = await response.json();

    document.getElementById('editUbicacionId').value = ubicacion.id_ubicacion;
    document.getElementById('editNombre').value = ubicacion.nombre;
    document.getElementById('editDireccion').value = ubicacion.direccion;
    document.getElementById('editCiudad').value = ubicacion.ciudad;
    document.getElementById('editDescripcion').value = ubicacion.descripcion;
    document.getElementById('editRestaurante').value = ubicacion.restaurante_fk;


    modalEditarUbicacion.show();
  } catch (error) {
    console.error('Error al abrir modal de edición:', error);
    showAlert('error', 'No se pudo cargar la ubicacion');
  } finally {
    showLoading(false);
  }
}

async function guardarCambiosUbicacion() {
  try {
    const id = document.getElementById('editUbicacionId').value;
    const nombre = document.getElementById('editNombre').value.trim();
    const direccion = document.getElementById('editDireccion').value.trim();
    const ciudad = document.getElementById('editCiudad').value.trim();
    const descripcion = document.getElementById('editDescripcion').value.trim();
    const restaurante_fk = document.getElementById('editRestaurante').value.trim();

    if ( !nombre || !direccion || !ciudad || !descripcion || !restaurante_fk ) {
      showAlert('warning', 'Por favor, complete todos los campos obligatorios.');
      return;
    }

    showLoading(true);

    const response = await fetch(`${URL}/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nombre, direccion, ciudad, descripcion, restaurante_fk })
    });

    if (!response.ok) throw new Error(await response.text());

    showAlert('success', 'Ubicacion actualizado correctamente');
    modalEditarUbicacion.hide();
    cargarUbicacion();
  } catch (error) {
    console.error('Error al guardar cambios:', error);
    showAlert('error', 'Error al actualizar la ubicacion');
  } finally {
    showLoading(false);
  }
}

function abrirModalCrearUbicacion() {
  document.getElementById('createUbicacionForm').reset();
  modalCrearUbicacion.show();
}

async function crearUbicacion() {
  try {
    const nombre = document.getElementById('createNombre').value.trim();
    const direccion = document.getElementById('createDireccion').value.trim();
    const ciudad = document.getElementById('createCiudad').value.trim();
    const descripcion = document.getElementById('createDescripcion').value.trim();
    const restaurante_fk = document.getElementById('createRestaurante').value.trim();
   

    if ( !nombre || !direccion || !ciudad || !descripcion || !restaurante_fk ) {
      showAlert('warning', 'Por favor, complete todos los campos obligatorios.');
      return;
    }

    showLoading(true);

    const response = await fetch(URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nombre, direccion, ciudad, descripcion, restaurante_fk })
    });

    if (!response.ok) throw new Error(await response.text());

    showAlert('success', 'ubicacion creada correctamente');
    modalCrearUbicacion.hide();
    cargarUbicacion();
  } catch (error) {
    console.error('Error al crear ubicacion:', error);
    showAlert('error', 'Error al crear el ubicacion');
  } finally {
    showLoading(false);
  }
}

function confirmarEliminarUbicacion(id) {
  Swal.fire({
    title: '¿Está seguro de eliminar este ubicacion?',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: 'Sí, eliminar',
    cancelButtonText: 'Cancelar'
  }).then((result) => {
    if (result.isConfirmed) eliminarUbicacion(id);
  });
}

async function eliminarUbicacion(id) {
  try {
    showLoading(true);
    const response = await fetch(`${URL}/${id}`, {
      method: 'DELETE'
    });

    if (!response.ok) throw new Error(await response.text());

    showAlert('success', 'ubicacion eliminado correctamente');
    cargarUbicacion();
  } catch (error) {
    console.error('Error al eliminar ubicacion:', error);
    showAlert('error', 'Error al eliminar la ubicacion');
  } finally {
    showLoading(false);
  }
}

function showAlert(type, message) {
  Swal.fire({
    icon: type,
    title: message,
    showConfirmButton: false,
    timer: 2000
  });
}

function showLoading(show) {
  const loadingElement = document.getElementById('loadingOverlay');
  if (loadingElement) {
    loadingElement.style.display = show ? 'flex' : 'none';
  }
}