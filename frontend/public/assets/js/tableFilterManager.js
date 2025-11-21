// Clase específica para manejar filtros en tablas ya renderizadas
export class TableFilterManager {
  constructor(tableElement, options = {}) {
    this.table = tableElement;
    this.tbody = this.table.querySelector('tbody');
    this.searchInput = options.searchInput;
    this.filterSelect = options.filterSelect;
    this.filterColumnIndex = options.filterColumnIndex || 0;
    this.paginationContainer = options.paginationContainer;
    this.rowsPerPage = options.rowsPerPage || 10;
    this.currentPage = 1;
    this.originalRows = [];
    this.filteredRows = [];
    
    this.init();
  }
  
  init() {
    // Guardar las filas originales
    this.saveOriginalRows();
    
    // Configurar listeners
    this.setupListeners();
    
    // Aplicar filtros iniciales
    this.applyFilters();
  }
  
  saveOriginalRows() {
    // Guardar todas las filas de la tabla como elementos HTML
    this.originalRows = Array.from(this.tbody.querySelectorAll('tr')).map(row => row.cloneNode(true));
  }
  
  setupListeners() {
    // Listener para búsqueda por texto
    if (this.searchInput) {
      this.searchInput.addEventListener('input', () => {
        this.currentPage = 1;
        this.applyFilters();
      });
    }
    
    // Listener para filtro por select
    if (this.filterSelect) {
      this.filterSelect.addEventListener('change', () => {
        this.currentPage = 1;
        this.applyFilters();
      });
    }
  }
  
  applyFilters() {
    let filteredRows = [...this.originalRows];
    
    // Aplicar filtro de búsqueda por texto
    if (this.searchInput && this.searchInput.value.trim() !== '') {
      const searchTerm = this.searchInput.value.toLowerCase();
      filteredRows = filteredRows.filter(row => {
        const rowText = row.textContent.toLowerCase();
        return rowText.includes(searchTerm);
      });
    }
    
    // Aplicar filtro por select (estado)
    if (this.filterSelect && this.filterSelect.value !== '') {
      const filterValue = this.filterSelect.value;
      filteredRows = filteredRows.filter(row => {
        const cells = row.querySelectorAll('td');
        if (cells[this.filterColumnIndex]) {
          const cellText = cells[this.filterColumnIndex].textContent.trim();
          return cellText === filterValue;
        }
        return false;
      });
    }
    
    this.filteredRows = filteredRows;
    this.renderTable();
    this.renderPagination();
  }
  
  renderTable() {
    // Limpiar tbody
    this.tbody.innerHTML = '';
    
    // Calcular índices de paginación
    const startIndex = (this.currentPage - 1) * this.rowsPerPage;
    const endIndex = startIndex + this.rowsPerPage;
    const pageRows = this.filteredRows.slice(startIndex, endIndex);
    
    // Mostrar filas de la página actual
    if (pageRows.length === 0) {
      const noDataRow = document.createElement('tr');
      noDataRow.innerHTML = `<td colspan="${this.table.querySelectorAll('thead th').length}" class="text-center">No se encontraron registros</td>`;
      this.tbody.appendChild(noDataRow);
    } else {
      pageRows.forEach(row => {
        this.tbody.appendChild(row.cloneNode(true));
      });
    }
  }
  
  renderPagination() {
    if (!this.paginationContainer) return;
    
    this.paginationContainer.innerHTML = '';
    
    const totalPages = Math.ceil(this.filteredRows.length / this.rowsPerPage);
    
    if (totalPages <= 1) return;
    
    // Botón anterior
    if (this.currentPage > 1) {
      const prevBtn = this.createPaginationButton('Anterior', () => {
        this.currentPage--;
        this.applyFilters();
      }, 'btn-outline-primary');
      this.paginationContainer.appendChild(prevBtn);
    }
    
    // Números de página
    for (let i = 1; i <= totalPages; i++) {
      const isActive = i === this.currentPage;
      const pageBtn = this.createPaginationButton(i.toString(), () => {
        this.currentPage = i;
        this.applyFilters();
      }, isActive ? 'btn-primary' : 'btn-outline-primary');
      
      this.paginationContainer.appendChild(pageBtn);
    }
    
    // Botón siguiente
    if (this.currentPage < totalPages) {
      const nextBtn = this.createPaginationButton('Siguiente', () => {
        this.currentPage++;
        this.applyFilters();
      }, 'btn-outline-primary');
      this.paginationContainer.appendChild(nextBtn);
    }
    
    // Información de páginas
    const info = document.createElement('span');
    info.className = 'ms-3 text-muted';
    info.textContent = `Página ${this.currentPage} de ${totalPages} (${this.filteredRows.length} registros)`;
    this.paginationContainer.appendChild(info);
  }
  
  createPaginationButton(text, onClick, className = 'btn-outline-primary') {
    const button = document.createElement('button');
    button.className = `btn btn-sm ${className} me-1`;
    button.textContent = text;
    button.addEventListener('click', onClick);
    return button;
  }
  
  // Método para actualizar los datos cuando se recarga la tabla
  updateData() {
    this.saveOriginalRows();
    this.currentPage = 1;
    this.applyFilters();
  }
}