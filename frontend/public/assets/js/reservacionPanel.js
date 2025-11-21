import { TableManager } from "./tableFilters.js";
import { llenarSelect, validarHoraFin, showAlert, showLoading } from "./utils.js";

let modalReservacion;
let usuarios = [];
let estadosReservacion = [];
let restaurantes = [];
let sucursales = [];
let mesas = [];

const URL = "http://127.0.0.1:3000/renard/reservacion"; 


document.addEventListener('DOMContentLoaded', async () => {
  modalReservacion = new bootstrap.Modal(document.getElementById('modalReservacion'));

  // Botón Agregar
  document.getElementById('btnAgregarReservacion')
    .addEventListener('click', abrirModalCrearReservacion);

  // Validación de horas
  const horaInicio = document.getElementById('hora_inicio');
  const horaFin = document.getElementById('hora_fin');
  if (horaInicio && horaFin) {
    horaInicio.addEventListener('change', validarHoraFin);
    horaFin.addEventListener('change', validarHoraFin);
  }

  // Selects dependientes
  const restauranteSelect = document.getElementById('restaurante_fk');
  const sucursalSelect = document.getElementById('sucursal_fk');
  if (restauranteSelect) restauranteSelect.addEventListener('change', cargarSucursalesPorRestaurante);
  if (sucursalSelect) sucursalSelect.addEventListener('change', cargarMesasPorSucursal);

  // Cargar combos + data
  await cargarSelects();
  await cargarReservaciones();

  // Submit del form
  const form = document.getElementById('formReservacion');
  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const id = document.getElementById('id_reservacion').value;
      if (id) {
        await guardarCambiosReservacion();
      } else {
        await crearReservacion();
      }
    });
  }
});

async function cargarSelects() {
  [usuarios, estadosReservacion, restaurantes, sucursales, mesas] = await Promise.all([
    fetch('http://127.0.0.1:3000/renard/usuario').then(r => r.json()),
    fetch('http://127.0.0.1:3000/renard/estado-reservacion').then(r => r.json()),
    fetch('http://127.0.0.1:3000/renard/restaurante').then(r => r.json()),
    fetch('http://127.0.0.1:3000/renard/sucursal').then(r => r.json()),
    fetch('http://127.0.0.1:3000/renard/mesa').then(r => r.json())
  ]);

  llenarSelect(usuarios, 'usuario_fk', 'correo', 'id_usuario');
  llenarSelect(estadosReservacion, 'estado_reservacion', 'nombre', 'id_estado_reservacion');
  llenarSelect(restaurantes, 'restaurante_fk', 'nombre', 'id_restaurante');
}


async function cargarSucursalesPorRestaurante() {
  const restauranteId = document.getElementById('restaurante_fk').value;
  const sucursalSelect = document.getElementById('sucursal_fk');

  if (!restauranteId) {
    sucursalSelect.innerHTML = '<option value="">Primero seleccione un restaurante</option>';
    sucursalSelect.disabled = true;
    return;
  }

  // llenar filtro de restaurantes
  const filtroRestaurante = document.getElementById("filtroRestaurante");
  if (filtroRestaurante) {
    filtroRestaurante.innerHTML = '<option value="">Todos los restaurantes</option>';
    restaurantes.forEach(rest => {
      const option = document.createElement("option");
      option.value = rest.nombre;   // 👈 debe coincidir con el field que usas en TableManager
      option.textContent = rest.nombre;
      filtroRestaurante.appendChild(option);
    });
  }



  // llenar filtro de sucursales
  const filtroSucursal = document.getElementById("filtroSucursalReservacion");
  if (filtroSucursal) {
    filtroSucursal.innerHTML = '<option value="">Todas las sucursales</option>';
    sucursales.forEach(suc => {
      const option = document.createElement("option");
      option.value = suc.nombre;   // 👈 coincide con field "sucursal"
      option.textContent = suc.nombre;
      filtroSucursal.appendChild(option);
    });
  }

  const response = await fetch('http://127.0.0.1:3000/renard/sucursal');
  const todasLasSucursales = await response.json();
  const sucursalesFiltradas = todasLasSucursales.filter(s => s.restaurante_fk == restauranteId);

  llenarSelect(sucursalesFiltradas, 'sucursal_fk', 'nombre', 'id_sucursal');
  sucursalSelect.disabled = false;
}

async function cargarMesasPorSucursal() {
  const sucursalId = document.getElementById('sucursal_fk').value;
  const mesaSelect = document.getElementById('mesa_fk');

  if (!sucursalId) {
    mesaSelect.innerHTML = '<option value="">Primero seleccione una sucursal</option>';
    mesaSelect.disabled = true;
    return;
  }

  const response = await fetch(`http://127.0.0.1:3000/renard/mesa/sucursal/${sucursalId}`);
  const mesas = await response.json();
  llenarSelect(mesas, 'mesa_fk', 'numero_mesa', 'id_mesa');
  mesaSelect.disabled = false;
}


async function cargarReservaciones() {
  try {
    showLoading(true);
    const response = await fetch(URL);
    const reservaciones = await response.json();

    // Normaliza y añade campos para comparación insensible a mayúsculas/espacios
    const normalizadas = reservaciones.map(r => {
      const restauranteNombre = restaurantes.find(rest => rest.id_restaurante === r.restaurante_fk)?.nombre || '';
      const sucursalNombre = sucursales.find(s => s.id_sucursal === r.sucursal_fk)?.nombre || '';
      const estadoNombre = estadosReservacion.find(e => e.id_estado_reservacion === r.estado_reservacion)?.nombre || '';
      return {
        ...r,
        usuario: usuarios.find(u => u.id_usuario === r.usuario_fk)?.correo || '',
        estado: estadoNombre,
        estado_norm: estadoNombre.trim().toLowerCase(),
        restaurante: restauranteNombre,
        restaurante_norm: restauranteNombre.trim().toLowerCase(),
        sucursal: sucursalNombre,
        sucursal_norm: sucursalNombre.trim().toLowerCase(),
        mesa: mesas.find(m => m.id_mesa === r.mesa_fk)?.numero_mesa || '',
      };
    });

    // Poblar filtroRestaurante (value = restaurante_norm, text = nombre legible)
    const filtroRestaurante = document.getElementById("filtroRestaurante");
    if (filtroRestaurante) {
      filtroRestaurante.innerHTML = '<option value="">Todos los restaurantes</option>';
      const uniques = Array.from(new Set(normalizadas.map(n => n.restaurante_norm).filter(Boolean)));
      uniques.forEach(norm => {
        // encontrar nombre legible para mostrar (puede eliminarse si no lo necesitas)
        const display = normalizadas.find(n => n.restaurante_norm === norm)?.restaurante || norm;
        const opt = document.createElement('option');
        opt.value = norm;
        opt.textContent = display;
        filtroRestaurante.appendChild(opt);
      });

      // debug: ver valor seleccionado y los nombres únicos
      filtroRestaurante.addEventListener('change', () => {
        console.log('Filtro restaurante seleccionado ->', filtroRestaurante.value);
      });
    }

    // (Opcional) poblar filtroEstadoReservacion de forma similar si lo usas:
    const filtroEstado = document.getElementById("filtroEstadoReservacion");
    if (filtroEstado) {
      filtroEstado.innerHTML = '<option value="">Todos los estados</option>';
      const uniquesE = Array.from(new Set(normalizadas.map(n => n.estado.trim().toLowerCase()).filter(Boolean)));
      uniquesE.forEach(norm => {
        const display = normalizadas.find(n => n.estado && n.estado.trim().toLowerCase() === norm)?.estado || norm;
        const opt = document.createElement('option');
        opt.value = norm;
        opt.textContent = display;
        filtroEstado.appendChild(opt);
      });
    }

    // Inicializar TableManager usando el campo normalizado para filtros
    new TableManager({
      data: normalizadas,
      textFilterId: "buscarReservacion",
      selectFilters: [
        { id: "filtroRestaurante", field: "restaurante_norm" },
        { id: "filtroEstadoReservacion", field: "estado_norm" } // usar campo normalizado para comparación case-insensitive
      ],
      itemsPerPageId: "itemsPorPaginaReservacion",
      tbodyId: "reservacionTableBody",
      paginationId: "paginacionReservaciones",
      renderRow: (res) => `
        <td>${res.id_reservacion}</td>
        <td>${res.numero_personas}</td>
        <td>${new Date(res.fecha).toLocaleDateString()}</td>
        <td>${res.hora_inicio || 'N/A'}</td>
        <td>${res.hora_fin || 'N/A'}</td>
        <td>${res.usuario || 'N/A'}</td>
        <td>
          <span class="badge ${getEstadoBadgeClass(res.estado_reservacion)}">
            ${res.estado || 'Desconocido'}
          </span>
        </td>
        <td>${res.restaurante || 'N/A'}</td>
        <td>${res.sucursal || 'N/A'}</td>
        <td>${res.mesa || 'Sin asignar'}</td>
        <td>${res.anotaciones || 'Sin anotaciones'}</td>
        <td>${new Date(res.created_at).toLocaleString()}</td>
        <td>${new Date(res.updated_at).toLocaleString()}</td>
        <td>
          <button class="btn-action btn-edit" data-id="${res.id_reservacion}" data-action="edit">
            <i class="bi bi-pencil-square"></i>
          </button>
          <button class="btn-action btn-delete" data-id="${res.id_reservacion}" data-action="delete">
            <i class="bi bi-trash3-fill"></i>
          </button>
        </td>
      `
    });

    // delegación de eventos (como ya tenías)
    const tbody = document.getElementById("reservacionTableBody");
    if (tbody) {
      tbody.addEventListener("click", (e) => {
        const btn = e.target.closest("button[data-action]");
        if (!btn) return;
        const id = btn.dataset.id;
        const action = btn.dataset.action;
        if (action === "edit") abrirModalEditarReservacion(id);
        if (action === "delete") confirmarEliminarReservacion(id);
      });
    }
  } catch (error) {
    console.error('Error al cargar reservaciones:', error);
    showAlert('error', 'No se pudieron cargar las reservaciones');
  } finally {
    showLoading(false);
  }
}


function getEstadoBadgeClass(estadoId) {
  const clases = {
    1: 'bg-warning text-dark',
    2: 'bg-success',
    3: 'bg-danger'
  };
  return clases[estadoId] || 'bg-secondary';
}

async function abrirModalCrearReservacion() {
  try {
    document.getElementById('formReservacion').reset();
    document.getElementById('id_reservacion').value = '';

    // Llenar selects de usuarios y restaurantes usando datos globales
    llenarSelect(usuarios, 'usuario_fk', 'correo', 'id_usuario');
    llenarSelect(restaurantes, 'restaurante_fk', 'nombre', 'id_restaurante');

    // Resetear sucursales y mesas
    const sucursalSelect = document.getElementById('sucursal_fk');
    sucursalSelect.innerHTML = '<option value="">Primero seleccione un restaurante</option>';
    sucursalSelect.disabled = true;

    const mesaSelect = document.getElementById('mesa_fk');
    mesaSelect.innerHTML = '<option value="">Primero seleccione una sucursal</option>';
    mesaSelect.disabled = true;

    document.getElementById('modalTituloReservacion').textContent = 'Agregar Reservación';

    modalReservacion.show();
  } catch (error) {
    console.error('Error al abrir modal de creación:', error);
    showAlert('error', 'No se pudo abrir el formulario de nueva reservación');
  }
}

async function abrirModalEditarReservacion(id) {
  try {
    showLoading(true);
    const response = await fetch(`${URL}/${id}`);
    const reservacion = await response.json();

    document.getElementById('formReservacion').reset();

    // Llenar selects de usuarios y restaurantes usando datos globales
    llenarSelect(usuarios, 'usuario_fk', 'correo', 'id_usuario');
    llenarSelect(restaurantes, 'restaurante_fk', 'nombre', 'id_restaurante');

    // Asignar valores a los inputs
    document.getElementById('id_reservacion').value = reservacion.id_reservacion;
    document.getElementById('numero_personas').value = reservacion.numero_personas;
    document.getElementById('fecha').value = reservacion.fecha.split('T')[0];
    document.getElementById('hora_inicio').value = reservacion.hora_inicio || '';
    document.getElementById('hora_fin').value = reservacion.hora_fin || '';
    document.getElementById('usuario_fk').value = reservacion.usuario_fk || '';
    document.getElementById('estado_reservacion').value = reservacion.estado_reservacion;
    document.getElementById('restaurante_fk').value = reservacion.restaurante_fk;

    // Cargar sucursales y mesas en cascada
    await cargarSucursalesPorRestaurante();//reservacion.restaurante_fk
    document.getElementById('sucursal_fk').value = reservacion.sucursal_fk || '';

    await cargarMesasPorSucursal();//reservacion.sucursal_fk
    document.getElementById('mesa_fk').value = reservacion.mesa_fk || '';

    document.getElementById('anotaciones').value = reservacion.anotaciones || '';

    document.getElementById('modalTituloReservacion').textContent = 'Editar Reservación';
    modalReservacion.show();
  } catch (error) {
    console.error('Error al abrir modal de edición:', error);
    showAlert('error', 'No se pudo cargar la reservación');
  } finally {
    showLoading(false);
  }
}


async function guardarCambiosReservacion() {
  try {
    const id = document.getElementById('id_reservacion').value;
    
    const data = {
      numero_personas: Number.Number.parseInt(document.getElementById('numero_personas').value),
      fecha: document.getElementById('fecha').value,
      hora_inicio: document.getElementById('hora_inicio').value,
      hora_fin: document.getElementById('hora_fin').value,
      usuario_fk: Number.Number.parseInt(document.getElementById('usuario_fk').value) || null,
      estado_reservacion: Number.parseInt(document.getElementById('estado_reservacion').value),
      restaurante_fk: Number.parseInt(document.getElementById('restaurante_fk').value),
      mesa_fk: Number.parseInt(document.getElementById('mesa_fk').value),
      sucursal_fk: Number.parseInt(document.getElementById('sucursal_fk').value),
      anotaciones: document.getElementById('anotaciones').value.trim()
    };

    // Validaciones
    if (!data.numero_personas || !data.fecha || !data.hora_inicio || !data.estado_reservacion || !data.restaurante_fk || !data.mesa_fk || !data.sucursal_fk) {
      showAlert('warning', 'Por favor, complete todos los campos obligatorios.');
      return false;
    }

    // Validar horas
    if (!validarHoraFin()) {
      return false;
    }

    showLoading(true);

    const response = await fetch(`${URL}/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });

    if (!response.ok) throw new Error(await response.text());

    showAlert('success', 'Reservación actualizada correctamente');
    modalReservacion.hide();
    cargarReservaciones();
  } catch (error) {
    console.error('Error al guardar cambios:', error);
    showAlert('error', 'Error al actualizar la reservación');
  } finally {
    showLoading(false);
  }
}


async function crearReservacion() {
  try {
    const data = {
      numero_personas: Number.parseInt(document.getElementById('numero_personas').value),
      fecha: document.getElementById('fecha').value,
      hora_inicio: document.getElementById('hora_inicio').value,
      hora_fin: document.getElementById('hora_fin').value,
      usuario_fk: Number.parseInt(document.getElementById('usuario_fk').value) || null,
      estado_reservacion: Number.parseInt(document.getElementById('estado_reservacion').value),
      restaurante_fk: Number.parseInt(document.getElementById('restaurante_fk').value),
      mesa_fk: Number.parseInt(document.getElementById('mesa_fk').value),
      sucursal_fk: Number.parseInt(document.getElementById('sucursal_fk').value),
      anotaciones: document.getElementById('anotaciones').value.trim()
    };

    // Validaciones
    if (!data.numero_personas || !data.fecha || !data.hora_inicio || !data.estado_reservacion || !data.restaurante_fk || !data.mesa_fk || !data.sucursal_fk) {
      showAlert('warning', 'Por favor, complete todos los campos obligatorios.');
      return false;
    }

    // Validar horas
    if (!validarHoraFin()) {
      return false;
    }

    showLoading(true);

    const response = await fetch(URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });

    if (!response.ok) throw new Error(await response.text());

    showAlert('success', 'Reservación creada correctamente');
    modalReservacion.hide();
    cargarReservaciones();
  } catch (error) {
    console.error('Error al crear reservación:', error);
    showAlert('error', 'Error al crear la reservación');
  } finally {
    showLoading(false);
  }
}

function confirmarEliminarReservacion(id) {
  Swal.fire({
    title: '¿Está seguro de eliminar esta reservación?',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: 'Sí, eliminar',
    cancelButtonText: 'Cancelar'
  }).then((result) => {
    if (result.isConfirmed) eliminarReservacion(id);
  });
}

async function eliminarReservacion(id) { 
  try {
    showLoading(true);
    const response = await fetch(`${URL}/${id}`, {
      method: 'DELETE'
    });

    if (!response.ok) throw new Error(await response.text());

    showAlert('success', 'Reservación eliminada correctamente');
    cargarReservaciones();
  } catch (error) {
    console.error('Error al eliminar reservación:', error);
    showAlert('error', 'Error al eliminar la reservación');
  } finally {
    showLoading(false);
  }
}

