let modalEditarSucursal;
let modalCrearSucursal;

let restaurantes = [];
let sucursales = []; // almacenamos todas para poder filtrar en frontend

// Variables globales de filtros
let textoBusqueda = "";
let restauranteFiltro = "";
let itemsPorPagina = 10;
let paginaActual = 1;

const URL = "http://127.0.0.1:3000/renard/sucursal"; 
const RESTAURANTE = "http://127.0.0.1:3000/renard/restaurante";


document.addEventListener('DOMContentLoaded', async () => {
  modalEditarSucursal = new bootstrap.Modal(document.getElementById('editSucursalModal'));
  modalCrearSucursal = new bootstrap.Modal(document.getElementById('createSucursalModal'));

  await cargarSelects();
  await cargarSucursales();

  // formularios
  document.getElementById('editSucursalForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    await guardarCambiosSucursal();
  });

  document.getElementById('createSucursalForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    await crearSucursal();
  });

  // filtros
  document.getElementById("buscarSucursal").addEventListener("input", (e) => {
    textoBusqueda = e.target.value.toLowerCase();
    paginaActual = 1;
    aplicarFiltros();
  });

  document.getElementById("filtroRestaurante").addEventListener("change", (e) => {
    restauranteFiltro = e.target.value;
    paginaActual = 1;
    aplicarFiltros();
  });

  document.getElementById("itemsPorPagina").addEventListener("change", (e) => {
    itemsPorPagina = Number.parseInt(e.target.value, 10);
    paginaActual = 1;
    aplicarFiltros();
  });
});

async function cargarSelects() {
  [restaurantes] = await Promise.all([
    fetch(RESTAURANTE).then(r => r.json())
  ]);

  llenarSelect(restaurantes, 'createRestaurante', 'nombre', 'id_restaurante');
  llenarSelect(restaurantes, 'editRestaurante', 'nombre', 'id_restaurante');
  llenarSelect(restaurantes, 'filtroRestaurante', 'nombre', 'id_restaurante', true);
}

function llenarSelect(data, selectId, textProp, valueProp, incluirTodos = false) {
  const select = document.getElementById(selectId);
  select.innerHTML = incluirTodos
    ? '<option value="">Todos los restaurantes</option>'
    : '<option value="">Seleccione una opción</option>';

  data.forEach(item => {
    const option = document.createElement('option');
    option.value = item[valueProp];
    option.textContent = item[textProp];
    select.appendChild(option);
  });
}

async function cargarSucursales() {
  try {
    showLoading(true);
    const response = await fetch(URL);
    sucursales = await response.json();
    aplicarFiltros(); // aplicamos filtros al renderizar
  } catch (error) {
    console.error('Error al cargar Sucursales:', error);
    showAlert('error', 'No se pudieron cargar las Sucursales');
  } finally {
    showLoading(false);
  }
}

function aplicarFiltros() {
  let filtradas = [...sucursales];

  // 🔎 Filtro por texto (nombre o dirección)
  if (textoBusqueda) {
    filtradas = filtradas.filter(s =>
      s.nombre.toLowerCase().includes(textoBusqueda) ||
      s.direccion.toLowerCase().includes(textoBusqueda)
    );
  }

  // 🍔 Filtro por restaurante
  if (restauranteFiltro) {
    filtradas = filtradas.filter(s => String(s.restaurante_fk) === restauranteFiltro);
  }

  // 📄 Paginación
  const totalItems = filtradas.length;
  const totalPaginas = Math.ceil(totalItems / itemsPorPagina);
  const inicio = (paginaActual - 1) * itemsPorPagina;
  const fin = inicio + itemsPorPagina;
  const sucursalesPaginadas = filtradas.slice(inicio, fin);

  renderizarSucursales(sucursalesPaginadas);
  renderizarPaginacion(totalPaginas);
}

function renderizarSucursales(lista) {
  const tbody = document.querySelector('#sucursalTableBody');
  tbody.innerHTML = '';

  if (lista.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="10" class="text-center">No hay Sucursales registradas</td>
      </tr>
    `;
    return;
  }

  lista.forEach(res => {
    const restaurante = restaurantes.find(r => r.id_restaurante === res.restaurante_fk);

    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${res.id_sucursal}</td>
      <td>${res.nombre}</td>
      <td>${res.direccion}</td>
      <td>${formatearHora12(res.horario_apertura)}</td>
      <td>${formatearHora12(res.horario_cierre)}</td>
      <td>${restaurante?.nombre || res.restaurante_fk}</td>
      <td>${new Date(res.created_at).toLocaleString()}</td>
      <td>${new Date(res.updated_at).toLocaleString()}</td>
      <td>
        <div class="action-buttons">
          <button class="btn-action btn-edit" onclick="abrirModalEditarSucursal(${res.id_sucursal})" title="Editar">
            <i class="bi bi-pencil-square"></i>
          </button>
          <button class="btn-action btn-delete" onclick="confirmarEliminarSucursal(${res.id_sucursal})" title="Eliminar">
            <i class="bi bi-trash3-fill"></i>
          </button>
        </div>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

function renderizarPaginacion(totalPaginas) {
  const contenedor = document.getElementById("paginacion");
  if (!contenedor) return;

  contenedor.innerHTML = "";

  for (let i = 1; i <= totalPaginas; i++) {
    const btn = document.createElement("button");
    btn.textContent = i;
    btn.className = `btn btn-sm ${i === paginaActual ? "btn-primary" : "btn-light"}`;
    btn.addEventListener("click", () => {
      paginaActual = i;
      aplicarFiltros();
    });
    contenedor.appendChild(btn);
  }
}



async function abrirModalEditarSucursal(id) {
  try {
    showLoading(true);

    const response = await fetch(`${URL}/${id}`);
    const Sucursal = await response.json();

    document.getElementById('editSucursalId').value = Sucursal.id_sucursal || "";
    document.getElementById('editNombre').value = Sucursal.nombre || "";
    document.getElementById('editDireccion').value = Sucursal.direccion || "";

    // convertir HH:MM:SS → HH:MM para que el input time lo acepte
    document.getElementById('editHoraApertura').value = 
      Sucursal.horario_apertura ? Sucursal.horario_apertura.substring(0,5) : "";

    document.getElementById('editHoraCierre').value = 
      Sucursal.horario_cierre ? Sucursal.horario_cierre.substring(0,5) : "";

    document.getElementById('editRestaurante').value = Sucursal.restaurante_fk || "";

    modalEditarSucursal.show();
  } catch (error) {
    console.error('Error al abrir modal de edición:', error);
    showAlert('error', 'No se pudo cargar la Sucursal');
  } finally {
    showLoading(false);
  }
}

async function guardarCambiosSucursal() {
  try {
    const id_sucursal = document.getElementById('editSucursalId').value;
    const nombre = document.getElementById('editNombre').value.trim();
    const direccion = document.getElementById('editDireccion').value.trim();
    const horario_apertura = document.getElementById('editHoraApertura').value.trim();
    const horario_cierre = document.getElementById('editHoraCierre').value.trim();
    const restaurante_fk = document.getElementById('editRestaurante').value.trim();

    if (!nombre || !direccion || !horario_apertura || !horario_cierre || !restaurante_fk) {
      showAlert('warning', 'Por favor, complete todos los campos obligatorios.');
      return;
    }

    showLoading(true);

    const response = await fetch(`${URL}/${id_sucursal}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nombre, direccion, horario_apertura, horario_cierre, restaurante_fk})
    });

    if (!response.ok) throw new Error(await response.text());

    showAlert('success', 'Sucursal actualizada correctamente');
    modalEditarSucursal.hide();
    cargarSucursales();
  } catch (error) {
    console.error('Error al guardar cambios:', error);
    showAlert('error', 'Error al actualizar la Sucursal');
  } finally {
    showLoading(false);
  }
}

function abrirModalCrearSucursal() {
  document.getElementById('createSucursalForm').reset();
  modalCrearSucursal.show();
}

async function crearSucursal() {
  try {
    const nombre = document.getElementById('createNombre').value.trim();
    const direccion = document.getElementById('createDireccion').value.trim();
    const horario_apertura = document.getElementById('createHoraApertura').value.trim();
    const horario_cierre = document.getElementById('createHoraCierre').value.trim();
    const restaurante_fk = document.getElementById('createRestaurante').value.trim();

    if (!nombre || !direccion || !horario_apertura || !horario_cierre || !restaurante_fk) {
      showAlert('warning', 'Por favor, complete todos los campos obligatorios.');
      return;
    }

    showLoading(true);

    const response = await fetch(URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nombre, direccion, horario_apertura, horario_cierre, restaurante_fk })
    });

    if (!response.ok) throw new Error(await response.text());

    showAlert('success', 'Sucursal creada correctamente');
    modalCrearSucursal.hide();
    cargarSucursales();
  } catch (error) {
    console.error('Error al crear Sucursal:', error);
    showAlert('error', 'Error al crear la Sucursal');
  } finally {
    showLoading(false);
  }
}

function confirmarEliminarSucursal(id) {
  Swal.fire({
    title: '¿Está seguro de eliminar esta Sucursal?',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: 'Sí, eliminar',
    cancelButtonText: 'Cancelar'
  }).then((result) => {
    if (result.isConfirmed) eliminarSucursal(id);
  });
}

async function eliminarSucursal(id) {
  try {
    showLoading(true);
    const response = await fetch(`${URL}/${id}`, {
      method: 'DELETE'
    });

    if (!response.ok) throw new Error(await response.text());

    showAlert('success', 'Sucursal eliminada correctamente');
    cargarSucursales();
  } catch (error) {
    console.error('Error al eliminar Sucursal:', error);
    showAlert('error', 'Error al eliminar la Sucursal');
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

function formatearHora12(horaDB) {
  if (!horaDB) return "";
  const [h, m] = horaDB.split(":");
  const horas = Number.parseInt(h);
  const ampm = horas >= 12 ? "PM" : "AM";
  const horas12 = horas % 12 || 12;
  return `${horas12}:${m} ${ampm}`;
}


function showLoading(show) {
  const loadingElement = document.getElementById('loadingOverlay');
  if (loadingElement) {
    loadingElement.style.display = show ? 'flex' : 'none';
  }
}
