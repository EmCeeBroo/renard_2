// Variables globales
let modalEditarUsuario;
let modalCrearUsuario;
let estadosMap = {};
let rolesMap = {};
let paginaActual = 1;
let itemsPorPagina = 10;
let filtroBusqueda = '';
let filtroRol = ''; // filtro de rol seleccionado
let usuariosData = [];

const URL = "http://192.168.0.9:3000/renard/usuario"; 



// Inicialización cuando el DOM está listo
document.addEventListener('DOMContentLoaded', () => {
  // Ocultar preload
  setTimeout(function() {
    const preload = document.getElementById('preloadId');
    if (preload) {
      preload.style.opacity = '0';
      preload.style.visibility = 'hidden';
    }
  }, 500);

  modalEditarUsuario = new bootstrap.Modal(document.getElementById('modalEditarUsuario'));
  modalCrearUsuario = new bootstrap.Modal(document.getElementById('createUsuarioModal'));
  cargarUsuarios();

  // Eventos búsqueda y filtro
  document.getElementById('buscarInput')?.addEventListener('input', e => {
    filtroBusqueda = e.target.value;
    paginaActual = 1;
    renderizarTabla();
  });

  document.getElementById('filtroRol')?.addEventListener('change', e => {
    filtroRol = e.target.value;
    paginaActual = 1;
    renderizarTabla();
  });
});

// Cargar estados y roles
async function cargarEstadosYRoles() {
  try {
    const [estadosResponse, rolesResponse] = await Promise.all([
      fetch('http://192.168.0.9:3000/renard/estado-usuario'),
      fetch('http://192.168.0.9:3000/renard/rol')
    ]);

    if (!estadosResponse.ok || !rolesResponse.ok) {
      throw new Error('Error al cargar estados o roles');
    }

    const estados = await estadosResponse.json();
    const roles = await rolesResponse.json();

    // Limpiar y cargar selects de edición
    const editEstadoSelect = document.getElementById('editEstadoUsuario');
    const editRolSelect = document.getElementById('editRol');
    editEstadoSelect.innerHTML = '<option value="">Seleccione un estado</option>';
    editRolSelect.innerHTML = '<option value="">Seleccione un rol</option>';

    // Limpiar y cargar selects de creación
    const createEstadoSelect = document.getElementById('createEstadoUsuario');
    const createRolSelect = document.getElementById('createRol');
    createEstadoSelect.innerHTML = '<option value="">Seleccione un estado</option>';
    createRolSelect.innerHTML = '<option value="">Seleccione un rol</option>';

    // Limpiar y cargar select de filtro
    const filtroRolSelect = document.getElementById('filtroRol');
    if (filtroRolSelect) {
      filtroRolSelect.innerHTML = '<option value="">Todos los roles</option>';
    }

    estados.forEach(estado => {
      const optionEdit = document.createElement('option');
      optionEdit.value = estado.id_estado_usuario;
      optionEdit.textContent = estado.nombre_estado || estado.descripcion || estado.id_estado_usuario;
      editEstadoSelect.appendChild(optionEdit);

      const optionCreate = document.createElement('option');
      optionCreate.value = estado.id_estado_usuario;
      optionCreate.textContent = estado.nombre_estado || estado.descripcion || estado.id_estado_usuario;
      createEstadoSelect.appendChild(optionCreate);

      estadosMap[estado.id_estado_usuario] = optionEdit.textContent;
    });

    roles.forEach(rol => {
      const optionEdit = document.createElement('option');
      optionEdit.value = rol.id_rol;
      optionEdit.textContent = rol.nombre_rol || rol.nombre || rol.id_rol;
      editRolSelect.appendChild(optionEdit);

      const optionCreate = document.createElement('option');
      optionCreate.value = rol.id_rol;
      optionCreate.textContent = rol.nombre_rol || rol.nombre || rol.id_rol;
      createRolSelect.appendChild(optionCreate);

      rolesMap[rol.id_rol] = optionEdit.textContent;

      // Agregar al filtro
      if (filtroRolSelect) {
        const optionFiltro = document.createElement('option');
        optionFiltro.value = rol.id_rol;
        optionFiltro.textContent = optionEdit.textContent;
        filtroRolSelect.appendChild(optionFiltro);
      }
    });
  } catch (error) {
    console.error(error);
    alert('No se pudieron cargar los estados o roles.');
  }
}

// Cargar usuarios desde API
async function cargarUsuarios() {
  try {
    await cargarEstadosYRoles();

    const response = await fetch(URL);
    if (!response.ok) {
      throw new Error('Error al cargar los usuarios: ' + response.statusText);
    }

    usuariosData = await response.json();
    renderizarTabla();
  } catch (error) {
    console.error("Error al cargar usuarios:", error);
  }
}


// Renderizar tabla con filtros y paginación
function renderizarTabla() {
  const tbody = document.querySelector('#usuariosTable tbody');
  tbody.innerHTML = '';

  // Aplicar filtros
  let usuariosFiltrados = usuariosData.filter(usuario => {
    const coincideBusqueda = !filtroBusqueda ||
      usuario.correo.toLowerCase().includes(filtroBusqueda.toLowerCase()) ||
      (usuario.nombre && usuario.nombre.toLowerCase().includes(filtroBusqueda.toLowerCase()));
      const coincideRol = !filtroRol || usuario.rol_fk == filtroRol;    
    return coincideBusqueda && coincideRol;
  });

  // Calcular paginación
  const totalPaginas = Math.ceil(usuariosFiltrados.length / itemsPorPagina);
  const inicio = (paginaActual - 1) * itemsPorPagina;
  const fin = inicio + itemsPorPagina;
  const usuariosPagina = usuariosFiltrados.slice(inicio, fin);

  if (usuariosPagina.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="8" class="text-center py-4">
          <i class="bi bi-inbox display-4 text-muted"></i>
          <p class="text-muted mt-2">No se encontraron usuarios</p>
        </td>
      </tr>`;
  } else {
    usuariosPagina.forEach(usuario => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${usuario.id_usuario}</td>
        <td>${usuario.correo}</td>
        <td>••••••••</td>
        <td>
          <span class="badge ${usuario.estado_usuario_fk === 1 ? 'badge-success' : usuario.estado_usuario_fk === 2 ? 'badge-danger' : 'badge-warning'}">
            ${estadosMap[usuario.estado_usuario_fk] || usuario.estado_usuario_fk}
          </span>
        </td>
        <td>${rolesMap[usuario.rol_fk] || usuario.rol_fk}</td>
        <td>${new Date(usuario.created_at).toLocaleString()}</td>
        <td>${new Date(usuario.updated_at).toLocaleString()}</td>
        <td>
          <div class="action-buttons">
            <button class="btn-action btn-edit" onclick="abrirModalEditar(${usuario.id_usuario})" title="Editar">
              <i class="bi bi-pencil-square"></i>
            </button>
            <button class="btn-action btn-delete" onclick="eliminarUsuario(${usuario.id_usuario})" title="Eliminar">
              <i class="bi bi-trash3-fill"></i>
            </button>
          </div>
        </td>
      `;
      tbody.appendChild(tr);
    });
  }

  renderizarPaginacion(totalPaginas);
}

// Renderizar controles de paginación
function renderizarPaginacion(totalPaginas) {
  const paginacion = document.getElementById('paginacion');
  paginacion.innerHTML = '';

  if (totalPaginas <= 1) return;

  // Botón anterior
  const liAnterior = document.createElement('li');
  liAnterior.className = `page-item ${paginaActual === 1 ? 'disabled' : ''}`;
  liAnterior.innerHTML = `
    <a class="page-link" href="#" onclick="cambiarPagina(${paginaActual - 1})">
      <i class="bi bi-chevron-left"></i>
    </a>
  `;
  paginacion.appendChild(liAnterior);

  // Números de página
  for (let i = 1; i <= totalPaginas; i++) {
    if (i === 1 || i === totalPaginas || (i >= paginaActual - 2 && i <= paginaActual + 2)) {
      const li = document.createElement('li');
      li.className = `page-item ${i === paginaActual ? 'active' : ''}`;
      li.innerHTML = `<a class="page-link" href="#" onclick="cambiarPagina(${i})">${i}</a>`;
      paginacion.appendChild(li);
    } else if (i === paginaActual - 3 || i === paginaActual + 3) {
      const li = document.createElement('li');
      li.className = 'page-item disabled';
      li.innerHTML = '<span class="page-link">...</span>';
      paginacion.appendChild(li);
    }
  }

  // Botón siguiente
  const liSiguiente = document.createElement('li');
  liSiguiente.className = `page-item ${paginaActual === totalPaginas ? 'disabled' : ''}`;
  liSiguiente.innerHTML = `
    <a class="page-link" href="#" onclick="cambiarPagina(${paginaActual + 1})">
      <i class="bi bi-chevron-right"></i>
    </a>
  `;
  paginacion.appendChild(liSiguiente);
}

// Cambiar página
function cambiarPagina(nuevaPagina) {
  const totalPaginas = Math.ceil(usuariosData.length / itemsPorPagina);
  if (nuevaPagina >= 1 && nuevaPagina <= totalPaginas) {
    paginaActual = nuevaPagina;
    renderizarTabla();
  }
}

// Abrir modal de edición
async function abrirModalEditar(id) {
  try {
    const response = await fetch(`${URL}/${id}`);
    if (!response.ok) {
      throw new Error('Error al obtener datos del usuario: ' + response.statusText);
    }
    const usuario = await response.json();
    document.getElementById('editIdUsuario').value = usuario.id_usuario;
    document.getElementById('editCorreo').value = usuario.correo;
    document.getElementById('editContraseña').value = usuario.contraseña;
    await cargarEstadosYRoles();
    document.getElementById('editEstadoUsuario').value = usuario.estado_usuario_fk;
    document.getElementById('editRol').value = usuario.rol_fk;
    modalEditarUsuario.show();
  } catch (error) {
    console.error(error);
    alert('No se pudo cargar la información del usuario.');
  }
}

// Guardar cambios de usuario
async function guardarCambiosUsuario() {
  try {
    const id = document.getElementById('editIdUsuario').value;
    const correo = document.getElementById('editCorreo').value;
    const contraseña = document.getElementById('editContraseña').value;
    const estado_usuario_fk = Number.parseInt(document.getElementById('editEstadoUsuario').value, 10);
    const rol_fk = Number.parseInt(document.getElementById('editRol').value, 10);
    if (!correo || !contraseña || !estado_usuario_fk || !rol_fk) {
      alert('Por favor, complete todos los campos obligatorios.');
      return;
    }
    const response = await fetch(`${URL}/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ correo, contraseña, estado_usuario_fk, rol_fk })
    });
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Error al actualizar el usuario:', errorText);
      alert('No se pudo actualizar el usuario. Ver consola para más detalles.');
      return;
    }
    alert('Usuario actualizado correctamente.');
    modalEditarUsuario.hide();
    cargarUsuarios();
  } catch (error) {
    console.error('Error en la petición de actualización:', error);
    alert('No se pudo actualizar el usuario.');
  }
}

// Crear nuevo usuario
async function crearUsuario() {
  try {
    const correo = document.getElementById('createCorreo').value;
    const contraseña = document.getElementById('createContraseña').value;
    const estado_usuario_fk = Number.parseInt(document.getElementById('createEstadoUsuario').value, 10);
    const rol_fk = Number.parseInt(document.getElementById('createRol').value, 10);
    if (!correo || !contraseña || !estado_usuario_fk || !rol_fk) {
      alert('Por favor, complete todos los campos obligatorios.');
      return;
    }
    const response = await fetch(URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ correo, contraseña, estado_usuario_fk, rol_fk })
    });
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Error al crear el usuario:', errorText);
      alert('No se pudo crear el usuario. Ver consola para más detalles.');
      return;
    }
    alert('Usuario creado correctamente.');
    modalCrearUsuario.hide();
    cargarUsuarios();
  } catch (error) {
    console.error('Error en la petición de creación:', error);
    alert('No se pudo crear el usuario.');
  }
}

// Eliminar usuario
async function eliminarUsuario(id) {
  try {
    if (!confirm('¿Está seguro de eliminar este usuario?')) return;
    const response = await fetch(`${URL}/${id}`, {
      method: 'DELETE'
    });
    if (!response.ok) {
      throw new Error('Error al eliminar el usuario: ' + response.statusText);
    }
    alert('Usuario eliminado correctamente.');
    cargarUsuarios();
  } catch (error) {
    console.error(error);
    alert('No se pudo eliminar el usuario.');
  }
}
