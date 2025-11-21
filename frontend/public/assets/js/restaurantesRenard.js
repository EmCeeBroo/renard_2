const URL = "http://127.0.0.1:3000/renard/restaurante"; 


// Función para obtener datos de restaurantes y ubicaciones
async function fetchData() {
    try {
        const [restaurantesRes] = await Promise.all([
            fetch(URL)]);

        if (!restaurantesRes.ok) {
            throw new Error('Error al obtener datos');
        }

        const restaurantes = await restaurantesRes.json();

        return { restaurantes};
    } catch (error) {
        console.error('Error fetching data:', error);
        return { restaurantes: []};
    }
}

function renderRestaurantes(restaurantes) {
    const container = document.querySelector('.grid-restaurantes');
    container.innerHTML = ''; // Limpiar contenido previo

    restaurantes.forEach(restaurante => {
        // Crear el contenedor del restaurante
        const restauranteDiv = document.createElement('a');
        restauranteDiv.classList.add('restaurante');
        
        // 👉 Aquí en lugar de ir a un archivo por nombre,
        // mandamos a restaurante.html con el id en la URL
        restauranteDiv.href = `../viewsrenard/restaurante.html?id=${restaurante.id_restaurante}`;

        // Fondo de la card
        restauranteDiv.style.backgroundImage = `url('../public/assets/img/restaurantes/${restaurante.url_imagen}')`;

        // Crear el div para el nombre
        const nombreDiv = document.createElement('div');
        nombreDiv.classList.add('nombre');
        nombreDiv.textContent = restaurante.nombre;
        restauranteDiv.appendChild(nombreDiv);

        // Crear el div para el eslogan
        const esloganDiv = document.createElement('div');
        esloganDiv.classList.add('eslogan');
        esloganDiv.textContent = restaurante.eslogan;
        restauranteDiv.appendChild(esloganDiv);

        container.appendChild(restauranteDiv);
    });
}


// Función principal para cargar y mostrar los datos
async function init() {
    const { restaurantes} = await fetchData();
    renderRestaurantes(restaurantes);
}

// Ejecutar al cargar el DOM
document.addEventListener('DOMContentLoaded', init);
