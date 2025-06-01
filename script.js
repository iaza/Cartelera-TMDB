//Constantes para consumo de la API
const API_KEY = 'd54db03074c8f0f6a36490e2819756ec';
const BASE_URL = 'https://api.themoviedb.org/3/movie/now_playing';
const GENEROS_URL = 'https://api.themoviedb.org/3/genre/movie/list';

let pagina = 1;
let carteleraPeliculas = [];
let cantidadMostrar = 4;
let generosMap = {};

const cartelera = document.getElementById("cartelera");
const paginaActual = document.getElementById("paginaActual");
const anterior = document.getElementById("anterior");
const siguiente = document.getElementById("siguiente");
const spinner = document.createElement("div");
spinner.className = "spinner";
cartelera.parentNode.insertBefore(spinner, cartelera);

const busquedaInput = document.getElementById("buscar");
const generoSelect = document.getElementById("genero");
const ordenarSelect = document.getElementById("ordenar");
const fechaDesdeInput = document.getElementById("fechaDesde");
const fechaHastaInput = document.getElementById("fechaHasta");
const cantidadSelect = document.getElementById("cantidad");

//Funcion que obtiene los generos de las peliculas
async function cargarGeneros() {
  const url = `${GENEROS_URL}?api_key=${API_KEY}&language=es-ES`;
  const respuesta = await fetch(url);
  const datos = await respuesta.json();
  datos.genres.forEach(genero => {
    generosMap[genero.id] = genero.name;
    const option = document.createElement("option");
    option.value = genero.id;
    option.textContent = genero.name;
    generoSelect.appendChild(option);
  });
}

//Funcion para obtener peliculas en cartelera
async function cargarPeliculas() {
  mostrarSpinner(true); // Activamos spinner mientras se obtienen los datos
  const url = `${BASE_URL}?api_key=${API_KEY}&language=es-ES&page=${pagina}`;
  const respuesta = await fetch(url);
  const datos = await respuesta.json();
  carteleraPeliculas = datos.results; // Guardamos el resultado
  aplicarFiltros(); // Ejectumos funcion para aplicar los filtros seleccionados
  paginaActual.textContent = pagina;
  mostrarSpinner(false); // Ocultamos spinner
}

//Funcion donde declaramos los datos que se mostraran
function mostrarPeliculas(peliculas) {
  cartelera.innerHTML = "";
  peliculas.slice(0, cantidadMostrar).forEach(pelicula => {
    const descripcionCorta = pelicula.overview.length > 200 
      ? pelicula.overview.substring(0, 200) + "..."
      : pelicula.overview;  // Limitamos la descripcion a 200 caracteres

    const div = document.createElement("div");
    div.className = "pelicula";
    div.innerHTML = `
      <img src="https://image.tmdb.org/t/p/w500${pelicula.poster_path}" alt="${pelicula.title}">
      <div class="contenido">
        <h2>${pelicula.title}</h2>
        <p><strong>Fecha de estreno:</strong> ${pelicula.release_date}</p>
        <p><strong>Popularidad:</strong> ${pelicula.popularity}</p>
        <p><strong>Votos:</strong> ${pelicula.vote_count}</p>
        <p><strong>Promedio de votos:</strong> ${pelicula.vote_average}</p>
        
        <p><strong>Sinopsis:</strong></p>
        <p class="descripcion">
          <span class="corta">${descripcionCorta}</span>
          <span class="completa">${pelicula.overview}</span>
        </p>
      </div>
    `;
    cartelera.appendChild(div);
  });
}

function mostrarSpinner(estado) {
  spinner.classList.toggle("visible", estado);
}

//Funcion para realizar los filtros de busqueda de peliculas
function aplicarFiltros() {
  mostrarSpinner(true);
  let filtradas = [...carteleraPeliculas];

  const busqueda = busquedaInput.value.toLowerCase();
  if (busqueda) {
    filtradas = filtradas.filter(p => p.title.toLowerCase().includes(busqueda));
  }

  const desde = fechaDesdeInput.value;
  const hasta = fechaHastaInput.value;
  if (desde) {
    filtradas = filtradas.filter(p => p.release_date >= desde);
  }
  if (hasta) {
    filtradas = filtradas.filter(p => p.release_date <= hasta);
  }

  const genero = generoSelect.value;
  if (genero && genero !== "todos") {
    filtradas = filtradas.filter(p => p.genre_ids.includes(parseInt(genero)));
  }

  if (ordenarSelect.value === "az") {
    filtradas.sort((a, b) => a.title.localeCompare(b.title));
  } else if (ordenarSelect.value === "za") {
    filtradas.sort((a, b) => b.title.localeCompare(a.title));
  }

  mostrarPeliculas(filtradas);
  mostrarSpinner(false);
}

anterior.addEventListener("click", () => {
  if (pagina > 1) {
    pagina--;
    cargarPeliculas();
  }
});

siguiente.addEventListener("click", () => {
  pagina++;
  cargarPeliculas();
});

[busquedaInput, generoSelect, ordenarSelect, fechaDesdeInput, fechaHastaInput].forEach(input => {
  input.addEventListener("input", aplicarFiltros);
});

cantidadSelect.addEventListener("change", () => {
  cantidadMostrar = parseInt(cantidadSelect.value);
  aplicarFiltros();
});

cargarGeneros();
cargarPeliculas();
