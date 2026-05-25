// --- CONFIGURACIÓN ---
// Cambia esto a la ruta donde tengas levantada la BibliAPI
const BASE_URL = 'https://apiversiculos.onrender.com';
const MIN_LOADING_TIME = 2000; // 2 segundos de tiempo mínimo de carga

// Elementos del DOM
const loaderContainer = document.getElementById('loader-container');
const verseContainer = document.getElementById('verse-container');
const verseTextElement = document.getElementById('verse-text');
const verseCitationElement = document.getElementById('verse-citation');

/**
 * Función principal que orquesta la carga del versículo
 */
async function initVerseApp() {
    const startTime = Date.now();

    try {
        // 1. Obtener el versículo aleatorio
        const verseData = await fetchRandomVerse();
        
        // 2. Calcular cuánto tiempo ha pasado y si necesitamos esperar un poco más
        const elapsedTime = Date.now() - startTime;
        const remainingTime = Math.max(0, MIN_LOADING_TIME - elapsedTime);

        // 3. Imprimir los datos en el DOM
        verseTextElement.textContent = verseData.texto;
        // Aplicamos el formato católico: Libro Capítulo, Versículo
        verseCitationElement.textContent = `${verseData.libro} ${verseData.capitulo}, ${verseData.versiculo}`;

        // 4. Esperar el tiempo restante (si la API fue muy rápida) y hacer la transición
        setTimeout(() => {
            showVerse();
        }, remainingTime);

    } catch (error) {
        console.error("Error al obtener el versículo:", error);
        verseTextElement.textContent = "El cielo y la tierra pasarán, pero mis palabras no pasarán.";
        verseCitationElement.textContent = "Mateo 24, 35";
        
        // Si hay error, mostramos un versículo de fallback tras el tiempo de espera
        setTimeout(() => showVerse(), MIN_LOADING_TIME);
    }
}

/**
 * Lógica para extraer un versículo aleatorio de la BibliAPI
 */
async function fetchRandomVerse() {
    // Paso A: Obtener todos los libros
    const responseLibros = await fetch(`${BASE_URL}/libros/`);
    if (!responseLibros.ok) throw new Error("Fallo al conectar con la API de libros");
    const libros = await responseLibros.json();

    // Paso B: Elegir un libro al azar
    const libroAleatorio = libros[Math.floor(Math.random() * libros.length)];
    
    // Paso C: Elegir un capítulo al azar basado en la cantidad de capítulos del libro
    const capituloAleatorio = Math.floor(Math.random() * libroAleatorio.totalCapitulos) + 1; // Nota: el campo suele ser 'totalCapitulos'

    // Paso D: Obtener todos los versículos de ese libro
    const responseVersiculos = await fetch(`${BASE_URL}/versiculos/${libroAleatorio.abreviatura}`);
    if (!responseVersiculos.ok) throw new Error("Fallo al conectar con la API de versículos");
    const versiculosPorCapitulo = await responseVersiculos.json();

    // Paso E: Extraer la lista de versículos usando el capítulo convertido a string
    const versiculosDelCapitulo = versiculosPorCapitulo[capituloAleatorio.toString()];
    
    if (!versiculosDelCapitulo) {
        throw new Error("No se encontraron versículos para el capítulo seleccionado");
    }

    // Paso F: Elegir un versículo al azar de ese capítulo
    const versiculoAleatorio = versiculosDelCapitulo[Math.floor(Math.random() * versiculosDelCapitulo.length)];

    return {
        libro: libroAleatorio.nombre,
        capitulo: capituloAleatorio,
        versiculo: versiculoAleatorio.numero,
        texto: versiculoAleatorio.texto
    };
}

/**
 * Gestiona la transición CSS entre la pantalla de carga y el versículo
 */
function showVerse() {
    loaderContainer.classList.remove('active');
    verseContainer.classList.add('active');
}

// Iniciar la aplicación en cuanto cargue el script
initVerseApp();