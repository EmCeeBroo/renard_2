import { showAlert, showLoading } from "./utils.js";

let modalEditarMesa;
let modalCrearMesa;
let zonas = [];
let estadosMesa = [];
let sucursales = [];

// 
const URL = "http://127.0.0.1:3000/renard/mesa"; 

// ===============================
// INIT
// ===============================
document.addEventListener('DOMContentLoaded', async () => {
  modalEditarMesa = new bootstrap.Modal(document.getElementById('editMesaModal'));
  modalCrearMesa = new bootstrap.Modal(document.getElementById('createMesaModal'));

  await cargarSelects();
  await cargarMesas();

  // Eventos formularios
  document.getElementById('editMesaForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    await guardarCambiosMesa();
  });

  document.getElementById('createMesaForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    await crearMesa();
  });

  // Resetear form al cerrar modal de crear
  document.getElementById('createMesaModal').addEventListener('hidden.bs.modal', () => {
    document.getElementById('createMesaForm').reset();
  });

});

// ===============================
// SELECTS
// ===============================
async function cargarSelects() {
  [zonas, estadosMesa, sucursales] = await Promise.all([
    fetch('http://127.0.0.1:3000/renard/zona').then(r => r.json()),
    fetch('http://127.0.0.1:3000/renard/estado-mesa').then(r => r.json()),
    fetch('http://127.0.0.1:3000/renard/sucursal').then(r => r.json()),
  ]);

  llenarSelect(zonas, 'createZona', 'nombre', 'id_zona');
  llenarSelect(zonas, 'editZona', 'nombre', 'id_zona');

  llenarSelect(estadosMesa, 'createEstadoMesa', 'nombre', 'id_estado_mesa');
  llenarSelect(estadosMesa, 'editEstadoMesa', 'nombre', 'id_estado_mesa');

  llenarSelect(sucursales, 'createSucursal', 'nombre', 'id_sucursal');
  llenarSelect(sucursales, 'editSucursal', 'nombre', 'id_sucursal');

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


function filtrarSucursales(restauranteId, selectId) {
  const select = document.getElementById(selectId);
  select.innerHTML = '<option value="">Seleccione una sucursal</option>';

  const sucursalesFiltradas = sucursales.filter(s => s.restaurante_fk === restauranteId);

  sucursalesFiltradas.forEach(s => {
    const option = document.createElement('option');
    option.value = s.id_sucursal;
    option.textContent = s.nombre;
    select.appendChild(option);
  });
}

// ===============================
// TABLA MESAS
// ===============================
let mesasNormalizadas = [];
let mesasFiltradas = [];

async function cargarMesas() {
  const response = await fetch(URL);
  const data = await response.json();

  mesasNormalizadas = data.map(m => ({
    ...m,
    zona: zonas.find(z => z.id_zona === m.zona_fk)?.nombre || '',
    estado: estadosMesa.find(e => e.id_estado_mesa === m.estado_mesa_fk)?.nombre || '',
    sucursal: sucursales.find(s => s.id_sucursal === m.sucursal_fk)?.nombre || '',
    // Campos para búsqueda (normalizados para búsqueda insensible a mayúsculas)
    zona_norm: (zonas.find(z => z.id_zona === m.zona_fk)?.nombre || '').toString().trim().toLowerCase(),
    estado_norm: (estadosMesa.find(e => e.id_estado_mesa === m.estado_mesa_fk)?.nombre || '').toString().trim().toLowerCase(),
    sucursal_norm: (sucursales.find(s => s.id_sucursal === m.sucursal_fk)?.nombre || '').toString().trim().toLowerCase(),
    numero_mesa_str: m.numero_mesa.toString()
  }));

  mesasFiltradas = [...mesasNormalizadas];
  renderMesas(mesasFiltradas);

  // Configurar búsqueda
  configurarBusqueda();
}

function configurarBusqueda() {
  const buscarInput = document.getElementById('buscarMesa');
  if (buscarInput) {
    buscarInput.addEventListener('input', (e) => {
      filtrarMesas(e.target.value);
    });
  }
}

function filtrarMesas(termino) {
  if (!termino || termino.trim() === '') {
    mesasFiltradas = [...mesasNormalizadas];
  } else {
    const terminoLower = termino.toLowerCase().trim();
    mesasFiltradas = mesasNormalizadas.filter(mesa =>
      mesa.zona_norm.includes(terminoLower) ||
      mesa.estado_norm.includes(terminoLower) ||
      mesa.sucursal_norm.includes(terminoLower) ||
      mesa.numero_mesa_str.includes(terminoLower) ||
      mesa.id_mesa.toString().includes(terminoLower)
    );
  }
  renderMesas(mesasFiltradas);
}

function renderMesas(mesas) {
  const tbody = document.getElementById('mesaTableBody');
  tbody.innerHTML = '';

  if (mesas.length === 0) {
    tbody.innerHTML = '<tr><td colspan="7" class="text-center">No hay mesas registradas</td></tr>';
    return;
  }

  mesas.forEach(mesa => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${mesa.id_mesa}</td>
      <td>${mesa.zona}</td>
      <td>${mesa.estado}</td>
      <td>${mesa.sucursal}</td>
      <td>${mesa.numero_mesa}</td>
      <td>${new Date(mesa.created_at).toLocaleString()}</td>
      <td>${new Date(mesa.updated_at).toLocaleString()}</td>
      <td>
        <button class="btn-action btn-edit" onclick="abrirModalEditarMesa(${mesa.id_mesa})">
          <i class="bi bi-pencil-square"></i>
        </button>
        <button class="btn-action btn-delete" onclick="confirmarEliminarMesa(${mesa.id_mesa})">
          <i class="bi bi-trash3-fill"></i>
        </button>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

// ===============================
// MODAL EDITAR
// ===============================
async function abrirModalEditarMesa(id) {
  try {
    showLoading(true);
    const response = await fetch(`${URL}/${id}`);
    const mesa = await response.json();

    document.getElementById('editMesaId').value = mesa.id_mesa;
    document.getElementById('editZona').value = mesa.zona_fk;
    document.getElementById('editEstadoMesa').value = mesa.estado_mesa_fk;
    document.getElementById('editNumeroMesa').value = mesa.numero_mesa;
    document.getElementById('editSucursal').value = mesa.sucursal_fk;

    modalEditarMesa.show();
  } catch (error) {
    console.error('Error al abrir modal de edición:', error);
    showAlert('error', 'No se pudo cargar la mesa');
  } finally {
    showLoading(false);
  }
}

async function guardarCambiosMesa() {
  try {
    const id = document.getElementById('editMesaId').value;
    const zona_fk = document.getElementById('editZona').value.trim();
    const estado_mesa_fk = document.getElementById('editEstadoMesa').value.trim();
    const sucursal_fk = document.getElementById('editSucursal').value.trim();
    const numero_mesa = document.getElementById('editNumeroMesa').value.trim();

    if ( !zona_fk || !estado_mesa_fk || !numero_mesa || !sucursal_fk ) {
      showAlert('warning', 'Por favor, complete todos los campos obligatorios.');
      return;
    }

    showLoading(true);

    const response = await fetch(`${URL}/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ zona_fk, estado_mesa_fk, numero_mesa, sucursal_fk })
    });

    if (!response.ok) throw new Error(await response.text());

    showAlert('success', 'Mesa actualizada correctamente');
    modalEditarMesa.hide();
    cargarMesas();
  } catch (error) {
    console.error('Error al guardar cambios:', error);
    showAlert('error', 'Error al actualizar la mesa');
  } finally {
    showLoading(false);
  }
}

async function crearMesa() {
  try {
    const zona_fk = document.getElementById('createZona').value.trim();
    const estado_mesa_fk = document.getElementById('createEstadoMesa').value.trim();
    const numero_mesa = document.getElementById('createNumeroMesa').value.trim();
    const sucursal_fk = document.getElementById('createSucursal').value.trim();


    if ( !zona_fk || !estado_mesa_fk || !numero_mesa || !sucursal_fk ) {
      showAlert('warning', 'Por favor, complete todos los campos obligatorios.');
      return;
    }

    showLoading(true);

    const response = await fetch(URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ zona_fk, estado_mesa_fk, numero_mesa, sucursal_fk })
    });

    if (!response.ok) throw new Error(await response.text());

    showAlert('success', 'Mesa creada correctamente');
    modalCrearMesa.hide();
    cargarMesas();
  } catch (error) {
    console.error('Error al crear mesa:', error);
    showAlert('error', 'Error al crear la mesa');
  } finally {
    showLoading(false);
  }
}

function confirmarEliminarMesa(id) {
  Swal.fire({
    title: '¿Está seguro de eliminar esta mesa?',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: 'Sí, eliminar',
    cancelButtonText: 'Cancelar'
  }).then((result) => {
    if (result.isConfirmed) eliminarMesa(id);
  });
}

async function eliminarMesa(id) {
  try {
    showLoading(true);
    const response = await fetch(`${URL}/${id}`, {
      method: 'DELETE'
    });

    if (!response.ok) throw new Error(await response.text());

    showAlert('success', 'Mesa eliminada correctamente');
    cargarMesas();
  } catch (error) {
    console.error('Error al eliminar mesaa:', error);
    showAlert('error', 'Error al eliminar la mesa');
  } finally {
    showLoading(false);
  }
}


// Exponer funciones usadas por los onclick en renderRow (por ser módulo)
window.abrirModalEditarMesa = abrirModalEditarMesa;
window.confirmarEliminarMesa = confirmarEliminarMesa;
window.eliminarMesa = eliminarMesa; // si usas onclick para eliminar también
