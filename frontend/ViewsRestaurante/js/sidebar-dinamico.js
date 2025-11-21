// sidebar-dinamico.js - Sidebar dinámico para Dashboard Restaurante
function renderDynamicSidebar(containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;

  // Obtener la ruta actual para determinar el item activo
  const currentPath = window.location.pathname;
  
  // Array de elementos del menú con navegación a las vistas admin
  const menuItems = [
    {
      href: "../homerestaurante/homerestaurante.html",
      icon: "bi bi-speedometer2",
      text: "Dashboard",
      matchPatterns: ["dashboard", "homerestaurante"]
    },
    {
      href: "../restauranteadmin/restauranteadmin.html",
      icon: "bi bi-shop",
      text: "Mi Restaurante",
      matchPatterns: ["restauranteadmin", "restaurante"]
    },
    {
      href: "../menuadmin/menuadmin.html",
      icon: "bi bi-menu-button-wide",
      text: "Menús",
      matchPatterns: ["menuadmin", "menu"]
    },
    {
      href: "../productoadmin/productoadmin.html",
      icon: "bi bi-basket",
      text: "Productos",
      matchPatterns: ["productoadmin", "producto"]
    },
    {
      href: "../categoriadmin/categoriadmin.html",
      icon: "bi bi-list-ul",
      text: "Categorías",
      matchPatterns: ["categoriadmin", "categoriaMenu", "categoria"]
    },
    {
      href: "../sucursaladmin/sucursaladmin.html",
      icon: "bi bi-geo-alt",
      text: "Sucursales",
      matchPatterns: ["sucursaladmin", "sucursal"]
    },
    {
      href: "../zonadmin/zonadmin.html",
      icon: "bi bi-pin-map",
      text: "Zonas",
      matchPatterns: ["zonadmin", "zona"]
    },
    {
      href: "../reservadmin/reservadmin.html",
      icon: "bi bi-calendar-event",
      text: "Reservaciones",
      matchPatterns: ["reservadmin", "reservacion"]
    },
    {
      href: "../historialreservadmin/historialreservadmin.html",
      icon: "bi bi-calendar-check",
      text: "Historial Reservas",
      matchPatterns: ["historialreservadmin", "reservas", "reserva"]
    },
    {
      href: "../mesadmin/mesadmin.html",
      icon: "bi bi-table",
      text: "Mesas",
      matchPatterns: ["mesadmin", "mesa"]
    },
    /**{
      href: "../productomenuadmin/productomenuadmin.html",
      icon: "bi bi-card-list",
      text: "Producto Menú",
      matchPatterns: ["productomenuadmin", "productomenu"]
    },**/
    {
      href: "../../views/login/login.html",
      icon: "bi bi-box-arrow-right",
      text: "Cerrar Sesión",
      matchPatterns: ["login"]
    }
  ];

  // Determinar qué item está activo basado en la URL actual
  const menuItemsWithActive = menuItems.map(item => {
    const isActive = item.matchPatterns.some(pattern => 
      currentPath.toLowerCase().includes(pattern.toLowerCase())
    );
    return { ...item, active: isActive };
  });

  const sidebarHTML = `
    <div class="admin-sidebar">
      <div class="sidebar-header">
        <img src="../../assets/img/renard.png" alt="Logo" />
        <h4>Panel Restaurante</h4>
      </div>
      <ul class="sidebar-menu">
        ${menuItemsWithActive.map(item => `
          <li class="${item.active ? 'active' : ''}">
            <a href="${item.href}" class="sidebar-item" ${item.active ? 'data-active="true"' : ''}>
              <i class="${item.icon}"></i>
              <span>${item.text}</span>
            </a>
          </li>
        `).join('')}
      </ul>
    </div>
  `;

  container.innerHTML = sidebarHTML;

  // Añadir funcionalidad para manejar clics en los enlaces
  addSidebarEventListeners();
}

function addSidebarEventListeners() {
  const sidebarLinks = document.querySelectorAll('.sidebar-menu a');

  sidebarLinks.forEach(link => {
    link.addEventListener('click', function(e) {
      // Navegar a la página sin cambiar el estado visual del sidebar
      if (this.getAttribute('href') !== '#') {
        e.preventDefault();

        // Guardar estado del sidebar antes de navegar (opcional para funcionalidades futuras)
        const sidebarState = document.querySelector('.admin-sidebar').classList.contains('collapsed');
        if (sidebarState) {
          localStorage.setItem('sidebarCollapsed', 'true');
        } else {
          localStorage.removeItem('sidebarCollapsed');
        }

        window.location.href = this.getAttribute('href');
      }
    });
  });
}

// Función para inicializar el sidebar
function initDynamicSidebar() {
  // Renderizar el sidebar en el contenedor existente
  renderDynamicSidebar('sidebar-container');
  
  // Aplicar estado colapsado guardado (si existe)
  const isCollapsed = localStorage.getItem('sidebarCollapsed') === 'true';
  if (isCollapsed) {
    const sidebar = document.querySelector('.admin-sidebar');
    if (sidebar) {
      sidebar.classList.add('collapsed');
      document.querySelector('.admin-content').style.marginLeft = '80px';
    }
  }
}

// Inicializar cuando el DOM esté cargado
document.addEventListener('DOMContentLoaded', initDynamicSidebar);
