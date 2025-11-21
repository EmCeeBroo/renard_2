/**
 * Lógica para gestionar mesas en mesadmin.html
 * Adaptada para usar rutas definidas en mesaRoutes.js
 */

const apiBase = '/mesa';

document.addEventListener('DOMContentLoaded', () => {
  cargarSucursales();
  cargarMesas();

  const filtroSucursal = document.getElementById('filtroSucursal');
  if (filtroSucursal) {
    filtroSucursal.addEventListener('change', () => {
      cargarMesas(filtroSucursal.value);
    });
  }

  const formCrearMesa = document.getElementById('createMesaForm');
  if (formCrearMesa) {
    formCrearMesa.addEventListener('submit', async (e) => {
      e.preventDefault();
      const numero_mesa = document.getElementById('createNumeroMesa').value.trim();
      const sucursal_fk = document.getElementById('createSucursal').value;
      const zona_fk = document.getElementById('createZona').value;
      const estado_mesa_fk = document.getElementById('createEstadoMesa').value;

      if (!numero_mesa || !sucursal_fk || !zona_fk || !estado_mesa_fk) {
        Swal.fire('Error', 'Todos los campos son obligatorios', 'error');
        return;
      }

      try {
        const response = await fetch(apiBase, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ numero_mesa, sucursal_fk, zona_fk, estado_mesa_fk })
        });
        if (!response.ok) throw new Error('Error al crear mesa');
        $('#createMesaModal').modal('hide');
        formCrearMesa.reset();
        cargarMesas();
        Swal.fire('Éxito', 'Mesa creada correctamente', 'success');
      } catch (error) {
        Swal.fire('Error', error.message, 'error');
      }
    });
  }

  const formEditarMesa = document.getElementById('editMesaForm');
  if (formEditarMesa) {
    formEditarMesa.addEventListener('submit', async (e) => {
      e.preventDefault();
      const id_mesa = document.getElementById('editMesaId').value;
      const numero_mesa = document.getElementById('editNumeroMesa').value.trim();
      const sucursal_fk = document.getElementById('editSucursal').value;
      const zona_fk = document.getElementById('editZona').value;
      const estado_mesa_fk = document.getElementById('editEstadoMesa').value;

      if (!numero_mesa || !sucursal_fk || !zona_fk || !estado_mesa_fk) {
        Swal.fire('Error', 'Todos los campos son obligatorios', 'error');
        return;
      }

      try {
        const response = await fetch(`${apiBase}/${id_mesa}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ numero_mesa, sucursal_fk, zona_fk, estado_mesa_fk })
        });
        if (!response.ok) throw new Error('Error al actualizar mesa');
        $('#editMesaModal').modal('hide');
        cargarMesas();
        Swal.fire('Éxito', 'Mesa actualizada correctamente', 'success');
      } catch (error) {
        Swal.fire('Error', error.message, 'error');
      }
    });
  }
});

async function cargarSucursales() {
  try {
    const response = await fetch('/sucursal');
    if (!response.ok) throw new Error('Error al obtener sucursales');
    const sucursales = await response.json();

    const selects = [
      document.getElementById('createSucursal'),
      document.getElementById('editSucursal')
    ];

    selects.forEach(select => {
      if (select) {
        select.innerHTML = '<option value="">Seleccione una sucursal</option>';
        sucursales.forEach(sucursal => {
          const option = `<option value="${sucursal.id_sucursal}">${sucursal.nombre}</option>`;
          select.insertAdjacentHTML('beforeend', option);
        });
      }
    });
  } catch (error) {
    Swal.fire('Error', error.message, 'error');
  }
}

async function cargarMesas(sucursalId = '') {
  try {
    let url = apiBase;
    if (sucursalId) {
      url = `${apiBase}/sucursal/${sucursalId}`;
    }
    const response = await fetch(url);
    if (!response.ok) throw new Error('Error al obtener mesas');
    const mesas = await response.json();

    const tbody = document.getElementById('mesaTableBody');
    if (!tbody) return;
    tbody.innerHTML = '';

    if (mesas.length === 0) {
      tbody.innerHTML = '<tr><td colspan="8">No se encontraron mesas</td></tr>';
      return;
    }

    mesas.forEach(mesa => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${mesa.id_mesa}</td>
        <td>${mesa.numero_mesa}</td>
        <td>${mesa.nombre_sucursal || ''}</td>
        <td>${mesa.nombre_zona || ''}</td>
        <td>${mesa.nombre_estado || ''}</td>
        <td>${mesa.created_at ? new Date(mesa.created_at).toLocaleString() : ''}</td>
        <td>${mesa.updated_at ? new Date(mesa.updated_at).toLocaleString() : ''}</td>
        <td>
          <button class="btn btn-sm btn-warning me-2" onclick="abrirEditarMesa(${mesa.id_mesa})">
            <i class="fas fa-edit"></i>
          </button>
          <button class="btn btn-sm btn-danger" onclick="eliminarMesa(${mesa.id_mesa})">
            <i class="fas fa-trash-alt"></i>
          </button>
        </td>
      `;
      tbody.appendChild(tr);
    });
  } catch (error) {
    Swal.fire('Error', error.message, 'error');
  }
}

async function abrirEditarMesa(id) {
  try {
    const response = await fetch(`${apiBase}/${id}`);
    if (!response.ok) throw new Error('Error al obtener mesa');
    const mesa = await response.json();

    document.getElementById('editMesaId').value = mesa.id_mesa;
    document.getElementById('editNumeroMesa').value = mesa.numero_mesa;
    document.getElementById('editSucursal').value = mesa.sucursal_fk;
    document.getElementById('editZona').value = mesa.zona_fk;
    document.getElementById('editEstadoMesa').value = mesa.estado_mesa_fk;

    const modal = new bootstrap.Modal(document.getElementById('editMesaModal'));
    modal.show();
  } catch (error) {
    Swal.fire('Error', error.message, 'error');
  }
}

async function eliminarMesa(id) {
  const result = await Swal.fire({
    title: '¿Estás seguro?',
    text: "Esta acción no se puede deshacer",
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: 'Sí, eliminar',
    cancelButtonText: 'Cancelar'
  });

  if (result.isConfirmed) {
    try {
      const response = await fetch(`${apiBase}/${id}`, { method: 'DELETE' });
      if (!response.ok) throw new Error('Error al eliminar mesa');
      cargarMesas();
      Swal.fire('Eliminado', 'Mesa eliminada correctamente', 'success');
    } catch (error) {
      Swal.fire('Error', error.message, 'error');
    }
  }
}
