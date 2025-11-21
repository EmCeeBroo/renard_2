import { TableManager } from '../../assets/js/tableFilters.js';
//
const URL = "http://192.168.0.9:3000/renard/estado-usuario"; 


document.addEventListener('DOMContentLoaded', () => {
  const modalEditarEstadoUsuario = new bootstrap.Modal(document.getElementById('modalEditarEstadoUsuario'));
  const formEditarEstadoUsuario = document.getElementById('formEditarEstadoUsuario');
  const btnAgregarEstadoUsuario = document.getElementById('btnAgregarEstadoUsuario');
  const modalTitulo = document.getElementById('modalEditarEstadoUsuarioLabel');

  cargarEstadosUsuario();

  // 👉 Crear
  btnAgregarEstadoUsuario.addEventListener('click', () => {
    modalTitulo.textContent = 'Agregar Estado de Usuario';
    formEditarEstadoUsuario.reset();
    document.getElementById('editIdEstadoUsuario').value = ""; // limpiar hidden
    modalEditarEstadoUsuario.show();
  });

  // 👉 Editar
  function abrirModalEditar(id, estados) {
    const estado = estados.find(e => e.id_estado_usuario == id);
    if (!estado) {
      Swal.fire({ icon: 'error', title: 'Estado no encontrado' });
      return;
    }
    modalTitulo.textContent = 'Editar Estado de Usuario';
    document.getElementById('editIdEstadoUsuario').value = estado.id_estado_usuario;
    document.getElementById('editNombre').value = estado.nombre;
    document.getElementById('editDescripcion').value = estado.descripcion;
    modalEditarEstadoUsuario.show();
  }

  // 👉 Guardar (crear o editar según hidden)
  formEditarEstadoUsuario.addEventListener('submit', async (e) => {
    e.preventDefault();

    const id = document.getElementById('editIdEstadoUsuario').value.trim();
    const nombre = document.getElementById('editNombre').value.trim();
    const descripcion = document.getElementById('editDescripcion').value.trim();

    if (!nombre || !descripcion) {
      Swal.fire({ icon: 'warning', title: 'Completa todos los campos' });
      return;
    }

    try {
      const url = id
        ? `${URL}/${id}` // editar
        : URL;      // crear

      const method = id ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nombre, descripcion })
      });

      if (!response.ok) throw new Error("Error en la petición");

      Swal.fire({
        icon: 'success',
        title: id ? 'Estado actualizado correctamente' : 'Estado creado correctamente',
        showConfirmButton: false,
        timer: 2000
      });

      modalEditarEstadoUsuario.hide();
      cargarEstadosUsuario();

    } catch (err) {
      console.error(err);
      Swal.fire({ icon: 'error', title: 'No se pudo guardar el estado' });
    }
  });

  // 👉 Eliminar (ya lo tienes bien)
  function confirmarEliminarEstadoUsuario(id) {
    Swal.fire({
      title: '¿Eliminar este estado?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    }).then(async (result) => {
      if (!result.isConfirmed) return;
      try {
        const response = await fetch(`${URL}/${id}`, {
          method: 'DELETE'
        });
        if (!response.ok) throw new Error("Error al eliminar");
        Swal.fire({ icon: 'success', title: 'Eliminado', timer: 2000, showConfirmButton: false });
        cargarEstadosUsuario();
      } catch (err) {
        console.error(err);
        Swal.fire({ icon: 'error', title: 'Error al eliminar' });
      }
    });
  }

  
  async function cargarEstadosUsuario() {
    try {
      const response = await fetch(URL);
      if (!response.ok) throw new Error('Error al cargar los estados de usuario');
      const estados = await response.json();

      // Normalizar para búsquedas y filtros
      const normalizados = estados.map(e => ({
        ...e,
        nombre_norm: e.nombre?.trim().toLowerCase() || "",
      }));

      // Poblar filtro dinámico
      const filtro = document.getElementById("filtroEstadoUsuario");
      if (filtro) {
        filtro.innerHTML = '<option value="">Todos los estados</option>';
        [...new Set(normalizados.map(e => e.nombre_norm))].forEach(nombre => {
          const opt = document.createElement("option");
          opt.value = nombre;
          opt.textContent = nombre; // 👈 se muestra limpio en minúsculas
          filtro.appendChild(opt);
        });
      }

      // TableManager con filtro por nombre_norm
      new TableManager({
        data: normalizados,
        textFilterId: "buscarEstadoUsuario",
        selectFilters: [{ id: "filtroEstadoUsuario", field: "nombre_norm" }],
        itemsPerPageId: "itemsPorPaginaEstadosUsuario",
        tbodyId: "estadosUsuarioTableBody",
        renderRow: (estado) => `
          <td>${estado.id_estado_usuario}</td>
          <td>${estado.nombre}</td>
          <td>${estado.descripcion}</td>
          <td>${new Date(estado.created_at || '').toLocaleString()}</td>
          <td>${new Date(estado.updated_at || '').toLocaleString()}</td>
          <td>
            <button class="btn-action btn-edit" title="Editar" data-id="${estado.id_estado_usuario}">
              <i class="bi bi-pencil-square"></i>
            </button>
          </td>
          <td>
            <button class="btn-action btn-delete" title="Eliminar" data-id="${estado.id_estado_usuario}">
              <i class="bi bi-trash3-fill"></i>
            </button>
          </td>
        `
      });

      // Delegación de eventos para editar/eliminar
      const tbody = document.getElementById("estadosUsuarioTableBody");
      if (tbody) {
        tbody.addEventListener("click", (e) => {
          const btn = e.target.closest("button");
          if (!btn) return;

          const id = btn.dataset.id;
          if (btn.classList.contains("btn-edit")) abrirModalEditar(id, estados);
          if (btn.classList.contains("btn-delete")) confirmarEliminarEstadoUsuario(id);
        });
      }

    } catch (error) {
      console.error(error);
      Swal.fire({
        icon: 'error',
        title: 'No se pudieron cargar los estados de usuario.',
        showConfirmButton: true
      });
    }
  }

});

