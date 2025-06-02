//Constantes para consumo de la API
const API_KEY = 'd54db03074c8f0f6a36490e2819756ec';
const BASE_URL = 'https://api.themoviedb.org/3/discover/movie';
const GENEROS_URL = 'https://api.themoviedb.org/3/genre/movie/list';

let pagina = 1;
let cantidadMostrar = 4;
let generosMap = {};
let totalPaginas = 1;

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

// Cargar datos iniciales
cargarGeneros();
cargarPeliculas();

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

//Funcion para obtener peliculas desde la API
async function cargarPeliculas() {
  mostrarSpinner(true);

  //Realizamos la definicion de los filtros que se enviaran para el consumo de la API
  const genero = generoSelect.value !== "todos" ? `&with_genres=${generoSelect.value}` : '';
  const ordenar = ordenarSelect.value === "az" ? '&sort_by=original_title.asc' : ordenarSelect.value === "za" ? '&sort_by=original_title.desc' : '';
  const fechaDesde = fechaDesdeInput.value ? `&primary_release_date.gte=${fechaDesdeInput.value}` : '';
  const fechaHasta = fechaHastaInput.value ? `&primary_release_date.lte=${fechaHastaInput.value}` : '';

  const url = `${BASE_URL}?api_key=${API_KEY}&language=es-ES&page=${pagina}${genero}${ordenar}${fechaDesde}${fechaHasta}`; // Consumimos la API con los valores seleccionados

  const respuesta = await fetch(url);
  const datos = await respuesta.json();
  let peliculas = datos.results; // Guardamos el resultado en una variable local
  totalPaginas = datos.total_pages; // Obtenemos el total de paginas

  // Filtrar por texto (search solo disponible con /search/movie)
  const busqueda = busquedaInput.value.toLowerCase();
  if (busqueda) {
    peliculas = peliculas.filter(p => p.title.toLowerCase().includes(busqueda));
  }

  mostrarPeliculas(peliculas);
  paginaActual.textContent = `${pagina} / ${totalPaginas}`;
  mostrarSpinner(false);
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

anterior.addEventListener("click", () => {
  if (pagina > 1) {
    pagina--;
    cargarPeliculas();
  }
});

siguiente.addEventListener("click", () => {
  if (pagina < totalPaginas) {
    pagina++;
    cargarPeliculas();
  }
});

[busquedaInput, generoSelect, ordenarSelect, fechaDesdeInput, fechaHastaInput].forEach(input => {
  input.addEventListener("input", () => {
    pagina = 1;
    cargarPeliculas();
  });
});

cantidadSelect.addEventListener("change", () => {
  cantidadMostrar = parseInt(cantidadSelect.value);
  cargarPeliculas();
});
