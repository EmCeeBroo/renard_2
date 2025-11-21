// sidebar.js
function renderSidebar(containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;

  container.innerHTML = `
    <div class="admin-sidebar">
      <div class="sidebar-header">
        <img src="../public/assets/img/renard.png" class="img img-fluid" alt="Logo" style="height: 70px; width: auto;">
        <h4>Panel de Administración</h4>
      </div>
      <ul class="sidebar-menu">
        <li><a href="../categoriaPanel/categoriaPanel.html"><i class="bi bi-list-ul"></i> <span>Categorías</span></a></li>
        <li><a href="../dashboard/dashboard.html"><i class="bi bi-speedometer2"></i> <span>Dashboard</span></a></li>
        <li><a href="../estadoMesaPanel/estadoMesaPanel.html"><i class="bi bi-table"></i> <span>Estado Mesa</span></a></li>
        <li><a href="../estadoReservacionPanel/estadoReservacionPanel.html"><i class="bi bi-clipboard-check"></i> <span>Estado Reservación</span></a></li>
        <li><a href="../estadoUsuarioPanel/estadoUsuarioPanel.html"><i class="bi bi-person-check"></i> <span>Estado Usuario</span></a></li>
        <li><a href="../historiaReservacionPanel/historiaReservacionPanel.html"><i class="bi bi-journal-text"></i> <span>Historia Reservación</span></a></li>
        <li><a href="../menu/menu.html"><i class="bi bi-menu-button-wide"></i> <span>Menús</span></a></li>
        <li><a href="../mesa/mesa.html"><i class="bi bi-columns-gap"></i> <span>Mesas</span></a></li>
        <li><a href="../producto/productoPanel.html"><i class="bi bi-basket"></i> <span>Productos</span></a></li>
        <li><a href="../qrMenu/qrMenuPanel.html"><i class="bi bi-qr-code"></i> <span>QR Menú</span></a></li>
        <li><a href="../reservas/reservas.html"><i class="bi bi-calendar-check"></i> <span>Reservas</span></a></li>
        <li><a href="../restaurante/restaurante.html"><i class="bi bi-shop"></i> <span>Restaurantes</span></a></li>
        <li><a href="../rolPanel/rolPanel.html"><i class="bi bi-person-badge-fill"></i> <span>Roles</span></a></li>
        <li><a href="../sucursal/sucursal.html"><i class="bi bi-geo-alt"></i> <span>Sucursales</span></a></li>
        <li><a href="../tipoDocumento/tipoDocumentoPanel.html"><i class="bi bi-file-earmark-text"></i> <span>Tipos de Documento</span></a></li>
        <li><a href="../usuarioPanel/usuarioPanel.html"><i class="bi bi-people"></i> <span>Usuarios</span></a></li>
        <li><a href="../zona/zona.html"><i class="bi bi-pin-map-fill"></i> <span>Zonas</span></a></li>
        
        <!-- Opciones de sesión al final -->
        <li><a href="../registro/registro.html"><i class="bi bi-pencil-square"></i> <span>Registro</span></a></li>
        <li><a href="../login/login.html"><i class="bi bi-box-arrow-in-right"></i> <span>Login</span></a></li>
        <li><a href="../login/login.html"><i class="bi bi-box-arrow-right"></i> <span>Cerrar Sesión</span></a></li>
      </ul> 
    </div>
  `;
}