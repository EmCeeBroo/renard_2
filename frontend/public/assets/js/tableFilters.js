// tableFilters.js
import { llenarSelect, showAlert } from './utils.js';

export class TableManager {
  constructor({ data, textFilterId, selectFilters = [], itemsPerPageId, tbodyId, paginationId, renderRow }) {
    this.originalData = data;
    this.data = data;
    this.currentPage = 1;
    this.itemsPerPage = 10;

    this.textFilter = document.getElementById(textFilterId);
    this.selectFilters = selectFilters.map(f => ({
      element: document.getElementById(f.id),
      field: f.field
    }));
    this.itemsPerPageSelect = document.getElementById(itemsPerPageId);
    this.tbody = document.getElementById(tbodyId);
    this.pagination = document.getElementById(paginationId);
    this.renderRow = renderRow;

    this.initListeners();
    this.render();
  }

  initListeners() {
    if (this.textFilter) {
      this.textFilter.addEventListener("input", () => {
        this.currentPage = 1;
        this.render();
      });
    }

    this.selectFilters.forEach(f => {
      f.element.addEventListener("change", () => {
        this.currentPage = 1;
        this.render();
      });
    });

    if (this.itemsPerPageSelect) {
      this.itemsPerPageSelect.addEventListener("change", (e) => {
        this.itemsPerPage = Number.parseInt(e.target.value);
        this.currentPage = 1;
        this.render();
      });
    }
  }

  getFilteredData() {
    const search = this.textFilter?.value.toLowerCase() || "";

    return this.originalData.filter(item => {
      // filtro de texto en todos los campos string
      const texto = Object.values(item)
        .filter(v => typeof v === "string")
        .join(" ")
        .toLowerCase();

      const matchTexto = search === "" || texto.includes(search);

      // filtros por select
      const matchSelects = this.selectFilters.every(f =>
        f.element.value === "" || String(item[f.field]) === String(f.element.value)
      );

      return matchTexto && matchSelects;
    });
  }

  render() {
    this.data = this.getFilteredData();

    const start = (this.currentPage - 1) * this.itemsPerPage;
    const end = start + this.itemsPerPage;
    const pageData = this.data.slice(start, end);

    this.tbody.innerHTML = "";
    if (pageData.length === 0) {
      this.tbody.innerHTML = `<tr><td colspan="10" class="text-center">No hay registros</td></tr>`;
      return;
    }

    pageData.forEach(item => {
      const tr = document.createElement("tr");
      tr.innerHTML = this.renderRow(item);
      this.tbody.appendChild(tr);
    });

    this.renderPagination();
  }

  renderPagination() {
    if (!this.pagination) return;

    this.pagination.innerHTML = "";
    const totalPages = Math.ceil(this.data.length / this.itemsPerPage);

    for (let i = 1; i <= totalPages; i++) {
      const btn = document.createElement("button");
      btn.className = `btn btn-sm ${i === this.currentPage ? "btn-primary" : "btn-outline-primary"} me-1`;
      btn.textContent = i;
      btn.onclick = () => {
        this.currentPage = i;
        this.render();
      };
      this.pagination.appendChild(btn);
    }
  }
}

// utils.js

export async function cargarSelect(endpoint, selectId, valueField, textField) {
  try {
    const response = await fetch(endpoint);
    const data = await response.json();
    llenarSelect(data, selectId, textField, valueField);
  } catch (error) {
    console.error(`Error cargando select ${selectId}:`, error);
    showAlert("error", "No se pudo cargar la información");
  }
}

