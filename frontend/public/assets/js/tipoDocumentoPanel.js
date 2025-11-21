import { showAlert, showLoading } from '../../assets/js/utils.js';

let modalTipoDocumento;
const URL = "http://127.0.0.1:3000/renard/tipo-documento";

let tipoDocumentosData = [];
let filtroBusqueda = '';

/* =======================
   Cargar registros
======================= */
async function cargarTipoDocumentos() {
    try {
        showLoading(true);
        const response = await fetch(URL);
        if (!response.ok) throw new Error('Error al cargar los Tipos de Documento');

        tipoDocumentosData = await response.json();
        renderizarTipoDocumentos();
        showLoading(false);
    } catch (error) {
        showLoading(false);
        console.error(error);
        showAlert('error', 'No se pudieron cargar los Tipos de Documento.');
    }
}

/* =======================
   Renderizar tabla
======================= */
function renderizarTipoDocumentos() {
    const tbody = document.querySelector('#tablaTipoDocumento tbody');
    tbody.innerHTML = '';

    const filtrados = tipoDocumentosData.filter(td => {
        const nombre = td.nombre.toLowerCase();
        const descripcion = td.descripcion.toLowerCase();
        return nombre.includes(filtroBusqueda) || descripcion.includes(filtroBusqueda);
    });

    if (filtrados.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="6" class="text-center">No hay tipos de documento registrados</td>
            </tr>
        `;
        return;
    }

    filtrados.forEach(td => {
        const fechaCreacion = td.created_at ? new Date(td.created_at).toLocaleString() : '-';
        const fechaActualizacion = td.updated_at ? new Date(td.updated_at).toLocaleString() : '-';

        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${td.id_tipo_documento}</td>
            <td>${td.nombre}</td>
            <td>${td.descripcion}</td>
            <td>${fechaCreacion}</td>
            <td>${fechaActualizacion}</td>  
            <td>
                <div class="action-buttons">
                    <button class="btn-action btn-edit" onclick="abrirModalEditarTipoDocumento(${td.id_tipo_documento})" title="Editar">
                        <i class="bi bi-pencil-square"></i>
                    </button>
                    <button class="btn-action btn-delete" onclick="eliminarTipoDocumento(${td.id_tipo_documento})" title="Eliminar">
                        <i class="bi bi-trash3-fill"></i>
                    </button>
                </div>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

/* =======================
   Modal Crear/Editar
======================= */
function abrirModal(tipo, data = null) {
    const form = document.getElementById('formTipoDocumento');
    form.reset();

    document.getElementById('id_TipoDocumento').value = data ? data.id_tipo_documento : '';
    document.getElementById('nombre').value = data ? data.nombre : '';
    document.getElementById('descripcion').value = data ? data.descripcion : '';
    document.getElementById('modalTitulo').textContent = tipo === 'editar' ? 'Editar Tipo Documento' : 'Agregar Tipo Documento';

    modalTipoDocumento.show();
}

/* =======================
   Abrir modal en edición
======================= */
async function abrirModalEditarTipoDocumento(id) {
    try {
        const response = await fetch(`${URL}/${id}`);
        if (!response.ok) throw new Error('Error al obtener datos');

        const td = await response.json();
        abrirModal('editar', td);
    } catch (error) {
        console.error(error);
        showAlert('error', 'No se pudo cargar la información del Tipo Documento.');
    }
}

/* =======================
   Eliminar registro
======================= */
async function eliminarTipoDocumento(id) {
    try {
        const result = await Swal.fire({
            title: '¿Está seguro de eliminar este Tipo Documento?',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Sí, eliminar',
            cancelButtonText: 'Cancelar',
            reverseButtons: true
        });

        if (!result.isConfirmed) return;

        showLoading(true);
        const response = await fetch(`${URL}/${id}`, { method: 'DELETE' });
        if (!response.ok) throw new Error('Error al eliminar');

        showLoading(false);
        showAlert('success', 'Tipo Documento eliminado correctamente.');
        cargarTipoDocumentos();
    } catch (error) {
        showLoading(false);
        console.error(error);
        showAlert('error', 'No se pudo eliminar el Tipo Documento.');
    }
}

/* =======================
   Eventos principales
======================= */
document.addEventListener('DOMContentLoaded', () => {
    modalTipoDocumento = new bootstrap.Modal(document.getElementById('modalTipoDocumento'));
    cargarTipoDocumentos();
    console.log("Página lista");

    // Exponer funciones globalmente para onclick inline
    window.abrirModalEditarTipoDocumento = abrirModalEditarTipoDocumento;
    window.eliminarTipoDocumento = eliminarTipoDocumento;

    /* Buscar en tabla */
    const buscarInput = document.getElementById('buscarInput');
    buscarInput.addEventListener('input', e => {
        filtroBusqueda = e.target.value.toLowerCase();
        renderizarTipoDocumentos();
    });

    /* Guardar formulario */
    const form = document.getElementById('formTipoDocumento');
    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const id = document.getElementById('id_TipoDocumento').value;
        const nombre = document.getElementById('nombre').value.trim();
        const descripcion = document.getElementById('descripcion').value.trim();

        if (!nombre || !descripcion) {
            showAlert('warning', 'Por favor complete todos los campos.');
            return;
        }

        const data = { nombre, descripcion };

        try {
            let response;
            if (id) {
                // PUT (Editar)
                response = await fetch(`${URL}/${id}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(data)
                });
            } else {
                // POST (Crear)
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

            showAlert('success', id ? 'Tipo Documento actualizado correctamente.' : 'Tipo Documento creado correctamente.');
            modalTipoDocumento.hide();
            cargarTipoDocumentos();
            form.reset();
        } catch (error) {
            console.error(error);
            showAlert('error', 'Error al guardar el Tipo Documento.');
        }
    });

    /* Abrir modal en modo crear */
    document.getElementById('btnAgregar').addEventListener('click', () => abrirModal('crear'));

    /* Cancelar modal */
    document.getElementById('btnCancelar').addEventListener('click', (e) => {
        e.preventDefault();
        modalTipoDocumento.hide();
    });
});
export { abrirModalEditarTipoDocumento, eliminarTipoDocumento };