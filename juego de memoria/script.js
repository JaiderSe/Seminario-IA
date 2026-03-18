/**
 * ============================================
 * Juego de Memoria - Lógica del Juego
 * ============================================
 */

// ============================================
// Constantes y Variables Globales
// ============================================

// Emojis para los pares de cartas
const EMOJIS = ['🍎', '🍌', '🍓', '🍇', '🍍', '🥝', '🍑', '🍉'];

// Variables del juego
let cards = [];           // Array de cartas (2 de cada emoji)
let flippedCards = [];    // Cartas actualmente volteadas
let matchedPairs = 0;     // Parejas encontradas
let moves = 0;            // Contador de movimientos
let timer = 0;            // Tiempo en segundos
let timerInterval = null; // Intervalo del temporizador
let isLocked = false;     // Bloquea el tablero durante comparación

// Elementos del DOM
const gameBoard = document.getElementById('game-board');
const movesDisplay = document.getElementById('moves');
const timerDisplay = document.getElementById('timer');
const restartBtn = document.getElementById('restart-btn');
const victoryMessage = document.getElementById('victory-message');
const finalTime = document.getElementById('final-time');
const finalMoves = document.getElementById('final-moves');

// ============================================
// Funciones del Juego
// ============================================

/**
 * Inicializa el juego
 */
function initGame() {
    // Reiniciar variables
    flippedCards = [];
    matchedPairs = 0;
    moves = 0;
    timer = 0;
    isLocked = false;
    
    // Detener temporizador anterior si existe
    if (timerInterval) {
        clearInterval(timerInterval);
        timerInterval = null;
    }
    
    // Actualizar displays
    movesDisplay.textContent = moves;
    timerDisplay.textContent = formatTime(timer);
    
    // Ocultar mensaje de victoria
    victoryMessage.classList.add('d-none');
    
    // Crear y mezclar cartas
    createCards();
    
    // Renderizar el tablero
    renderBoard();
    
    // Iniciar temporizador
    startTimer();
}

/**
 * Crea el array de cartas duplicando los emojis
 */
function createCards() {
    // Crear array con 2 de cada emoji
    cards = [...EMOJIS, ...EMOJIS];
    
    // Barajar usando Fisher-Yates
    shuffle(cards);
}

/**
 * Algoritmo de barajado Fisher-Yates
 * @param {Array} array - Array a barajar
 */
function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

/**
 * Renderiza el tablero de juego
 */
function renderBoard() {
    gameBoard.innerHTML = '';
    
    cards.forEach((emoji, index) => {
        const card = createCardElement(emoji, index);
        gameBoard.appendChild(card);
    });
}

/**
 * Crea un elemento de carta
 * @param {string} emoji - Emoji de la carta
 * @param {number} index - Índice de la carta
 * @returns {HTMLElement} Elemento de la carta
 */
function createCardElement(emoji, index) {
    const card = document.createElement('div');
    card.className = 'card';
    card.dataset.emoji = emoji;
    card.dataset.index = index;
    
    // Cara frontal (con emoji)
    const front = document.createElement('div');
    front.className = 'card-front';
    front.textContent = emoji;
    
    // Cara trasera (con signo de interrogación)
    const back = document.createElement('div');
    back.className = 'card-back';
    
    card.appendChild(front);
    card.appendChild(back);
    
    // Evento click
    card.addEventListener('click', () => flipCard(card));
    
    return card;
}

/**
 * Maneja el volteo de una carta
 * @param {HTMLElement} card - Elemento de la carta
 */
function flipCard(card) {
    // No permitir voltear si:
    // - El tablero está bloqueado
    // - La carta ya está volteada
    // - La carta ya está emparejada
    if (isLocked || 
        card.classList.contains('flipped') || 
        card.classList.contains('matched')) {
        return;
    }
    
    // Voltear la carta
    card.classList.add('flipped');
    flippedCards.push(card);
    
    // Verificar si hay 2 cartas volteadas
    if (flippedCards.length === 2) {
        // Incrementar contador de movimientos
        moves++;
        movesDisplay.textContent = moves;
        
        // Comparar las cartas
        checkMatch();
    }
}

/**
 * Compara las dos cartas volteadas
 */
function checkMatch() {
    const [card1, card2] = flippedCards;
    const isMatch = card1.dataset.emoji === card2.dataset.emoji;
    
    if (isMatch) {
        // Las cartas coinciden
        handleMatch(card1, card2);
    } else {
        // Las cartas no coinciden
        handleMismatch(card1, card2);
    }
}

/**
 * Maneja cuando las cartas coinciden
 * @param {HTMLElement} card1 - Primera carta
 * @param {HTMLElement} card2 - Segunda carta
 */
function handleMatch(card1, card2) {
    // Marcar como encontradas
    card1.classList.add('matched');
    card2.classList.add('matched');
    
    // Incrementar contador de parejas
    matchedPairs++;
    
    // Limpiar array de cartas volteadas
    flippedCards = [];
    
    // Verificar si es victoria
    if (matchedPairs === EMOJIS.length) {
        handleVictory();
    }
}

/**
 * Maneja cuando las cartas no coinciden
 * @param {HTMLElement} card1 - Primera carta
 * @param {HTMLElement} card2 - Segunda carta
 */
function handleMismatch(card1, card2) {
    // Bloquear el tablero
    isLocked = true;
    
    // Voltear las cartas después de 1 segundo
    setTimeout(() => {
        card1.classList.remove('flipped');
        card2.classList.remove('flipped');
        
        // Limpiar array de cartas volteadas
        flippedCards = [];
        
        // Desbloquear el tablero
        isLocked = false;
    }, 1000);
}

/**
 * Maneja la victoria del juego
 */
function handleVictory() {
    // Detener temporizador
    clearInterval(timerInterval);
    timerInterval = null;
    
    // Mostrar mensaje de victoria con tiempo y movimientos
    finalTime.textContent = formatTime(timer);
    finalMoves.textContent = moves;
    victoryMessage.classList.remove('d-none');
}

// ============================================
// Temporizador
// ============================================

/**
 * Inicia el temporizador
 */
function startTimer() {
    timerInterval = setInterval(() => {
        timer++;
        timerDisplay.textContent = formatTime(timer);
    }, 1000);
}

/**
 * Formatea el tiempo en formato MM:SS
 * @param {number} seconds - Tiempo en segundos
 * @returns {string} Tiempo formateado
 */
function formatTime(seconds) {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

// ============================================
// Event Listeners
// ============================================

// Botón de reiniciar
restartBtn.addEventListener('click', initGame);

// ============================================
// Inicialización
// ============================================

// Iniciar el juego cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', initGame);
