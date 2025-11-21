let urlMenuGlobal = null;

// `${URL}/${id}`
const URL = "http://127.0.0.1:3000/renard/restaurante"; 


// Geocodificar dirección → coordenadas
async function getCoords(direccion) {
  const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(direccion)}`;
  const resp = await fetch(url, {
    headers: {
      "User-Agent": "MiAppRestaurantes/1.0 (afgonzalez925@soy.sena.edu.co)" 
    }
  });
  if (!resp.ok) {
    console.error("Error en Nominatim:", resp.status, resp.statusText);
    return null;
  }
  const data = await resp.json();
  if (data.length > 0) {
    return [Number.parseFloat(data[0].lat), Number.parseFloat(data[0].lon)];
  }
  return null;
}

// Cargar restaurante desde backend
async function cargarRestaurante(id) {
  try {
    const resp = await fetch(`${URL}/${id}`);
    if (!resp.ok) throw new Error(`Error en la solicitud: ${resp.status} ${resp.statusText}`);
    const restaurante = await resp.json();

    // Guardar URL del menú
    urlMenuGlobal = restaurante.url_menu;

    // Mostrar info
    document.getElementById("nombre").textContent = restaurante.nombre || "Sin nombre";
    document.getElementById("eslogan").textContent = restaurante.eslogan || "Sin eslogan";
    document.getElementById("descripcion").textContent = restaurante.descripcion || "Sin descripción";

    // Limpiar mapa previo si existe
    if (window.myMap) window.myMap.remove();
    window.myMap = L.map("map");

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "&copy; OpenStreetMap contributors",
    }).addTo(window.myMap);

    const bounds = [];

    // Recorrer sucursales y poner marcadores
    for (const sucursal of restaurante.sucursales || []) {
      const coords = await getCoords(sucursal.direccion);
      console.log(`${sucursal.nombre} =>`, coords);

      if (coords) {
        bounds.push(coords);
        L.marker(coords)
          .addTo(window.myMap)
          .bindPopup(`<b>${sucursal.nombre}</b><br>${sucursal.direccion}`);
      } else {
        console.warn("⚠️ No se encontró ubicación:", sucursal.direccion);
      }
    }

    // Ajustar mapa a todos los marcadores
    if (bounds.length > 0) {
      window.myMap.fitBounds(bounds, { padding: [50, 50] });
    } else {
      window.myMap.setView([4.7111, -74.0721], 12);
    }
  } catch (err) {
    console.error("Error cargando restaurante:", err);
  }
}

async function cargarPlatos(idRestaurante) {
  try {
    const resp = await fetch(`http://127.0.0.1:5500/productos/restaurante?restaurante_fk=${idRestaurante}`);
    if (!resp.ok) throw new Error(`Error al cargar platos: ${resp.status} ${resp.statusText}`);
    const platos = await resp.json();

    const container = document.getElementById("dishes-container");
    container.innerHTML = "";

    if (platos.length === 0) {
      container.innerHTML = "<p>No hay platos disponibles para este restaurante.</p>";
      return;
    }

    platos.array.forEach(plato => {
      const platoDiv = document.createElement("div");
      platoDiv.classList.add("plato-item");

      platoDiv.innerHTML = `
        <h3>${plato.nombre}</h3>
        <p>${plato.descripcion || ""}</p>
        <p><strong>Precio:</strong> $${plato.precio.toFixed(2)}</p>
        ${plato.imagenproducto ? `<img src="../assets/img/producto/${plato.imagenproducto}" alt="${plato.nombre}" class="plato-img" />` : ""}
      `;

      container.appendChild(platoDiv);
    });

  } catch (err) {
    console.error("Error cargando platos:", err);
  }
}

// Al cargar la página
document.addEventListener("DOMContentLoaded", () => {
  const params = new URLSearchParams(window.location.search);
  const id = params.get("id");
  if (id) {
    cargarRestaurante(id);
    cargarPlatos(id);
  }

  // Botón QR
  document.getElementById("btnQr").addEventListener("click", () => {
    if (!urlMenuGlobal) {
      Swal.fire("Ups", "No hay URL de menú disponible", "warning");
      return;
    }

    const qrContainer = document.getElementById("qrContainer");
    qrContainer.style.display = "block";

    document.getElementById("qrcode").innerHTML = "";
    try {
      new QRCode(document.getElementById("qrcode"), {
      text: urlMenuGlobal,
      width: 200,
      height: 200
    });
    } catch{
      console.error("No se puede generar el codigo:", err);
    }
  });
});
