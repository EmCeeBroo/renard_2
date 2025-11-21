// Función para cargar dinámicamente el dashboard del restaurante
function loadDashboardRestaurante() {
  const dashboardHTML = `
    <!-- Sidebar Container for Dynamic Sidebar -->
    <div id="sidebar-container"></div>

    <!-- Main Content -->
    <div class="admin-content">
      <div class="admin-header">
        <img src="../public/assets/img/renard.png" alt="Logo" style="height: 90px; margin-right: 15px;">
        <h2><i class="bi bi-speedometer2"></i> Dashboard Restaurante</h2>
        <h3>Bienvenido administrador restaurante</h3>
      </div>

      <!-- Icon grid organized by categories -->
      
        

        <div class="category-group">
          <h3 class="section-title"><i class="bi bi-gear"></i> Configuración</h3>
          <div class="icon-grid">
         
          </div>
        </div>
      </div>
    </div>
  `;

  // Insertar el HTML en el contenedor del dashboard
  const container = document.getElementById('dashboard-container');
  if (container) {
    container.innerHTML = dashboardHTML;
  } else {
    console.error('Contenedor del dashboard no encontrado');
  }
}

// Función para inicializar el sidebar dinámico
function initDynamicSidebar() {
  // Aquí puedes agregar la lógica para inicializar el sidebar si es necesario
  console.log('Sidebar dinámico inicializado');
}

// Ejecutar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
  loadDashboardRestaurante();
  initDynamicSidebar();
});
