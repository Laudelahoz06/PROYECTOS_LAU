// Archivo: game.js
const inicio = new Audio('../sounds/inicio.mp3');
inicio.preload = 'auto';

// 1. Configuración del Canvas
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// 2. Variables del Juego
const tileSize = 20; // Tamaño de cada casilla (20x20 píxeles)
let score = 0;
let dots = 0;

const soundsEatDot = new Audio('../sounds/comer.mp3');
function eatDot() {
    if (squares[pacmanCurrentIndex].classList.contains('pac-dot')) {
        score++;
        scoreDisplay.textContent = score;
        squares[pacmanCurrentIndex].classList.remove('pac-dot');
        soundsEatDot.play();
        
    }
}

const soundsDeadh = new Audio('../sounds/Muerte.mp3');
function dieSound() {
    if (squares[pacmanCurrentIndex].classList.contains('ghost') && 
        !squares[pacmanCurrentIndex].classList.contains('scared-ghost')) {
        soundsDeadh.play();
    }
}




// 3. El Jugador (Pac-Man)
// Usamos x, y en términos de casillas, no píxeles
const player = {
    x: 9, 
    y: 3,
    size: tileSize,
    color: 'yellow',
    dx: 0, // Dirección X (1, -1, o 0)
    dy: 0  // Dirección Y (1, -1, o 0)
};


// 4. El Laberinto
// 0 = Punto ⚪
// 2 = Punto especial ⚪⚪
// 1 = Pared 🧱
// 3 = Camino vacío ⬜


const map = [
  [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
  [1,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,1],
  [1,2,1,1,0,1,1,1,0,1,0,1,1,1,0,1,1,2,1],
  [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
  [1,0,1,1,0,1,0,1,1,1,1,1,0,1,0,1,1,0,1],
  [1,0,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,0,1],
  [1,1,1,1,0,1,1,1,0,1,0,1,1,1,0,1,1,1,1],
  [3,3,3,1,0,1,0,0,0,0,0,0,0,1,0,1,3,3,3],
  [1,1,1,1,0,1,0,1,1,3,1,1,0,1,0,1,1,1,1],
  [3,3,3,3,0,0,0,1,3,3,3,1,0,0,0,3,3,3,3],
  [1,1,1,1,0,1,0,1,1,1,1,1,0,1,0,1,1,1,1],
  [3,3,3,1,0,1,0,0,0,0,0,0,0,1,0,1,3,3,3],
  [1,1,1,1,0,1,0,1,1,1,1,1,0,1,0,1,1,1,1],
  [1,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,1],
  [1,0,1,1,0,1,1,1,0,1,0,1,1,1,0,1,1,0,1],
  [1,0,0,1,0,0,0,0,0,0,0,0,0,0,0,1,0,0,1],
  [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]
];
// Guardar copia inicial del mapa para poder recargar todo más tarde
const initialMap = map.map(row => row.slice());
// Vidas de Pac-Man

let lives = 3;
function dibujarpuntuacion() {
    ctx.fillStyle = "white";
    ctx.font = "20px Arial"
    ctx.fillText("Puntuación: " + score, 10, 20);
}

// Dibuja las vidas (bolitas amarillas) en la esquina superior derecha
function drawLives() {
    const radius = 6;
    const padding = 8;
    // Empezar desde la esquina derecha
    for (let i = 0; i < lives; i++) {
        const x = canvas.width - padding - i * (radius * 2 + 6) - radius;
        const y = 14; // cerca de la parte superior, junto a la puntuación
        ctx.fillStyle = 'yellow';
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.fill();
        // pequeño borde negro
        ctx.strokeStyle = 'black';
        ctx.stroke();
    }
}
// Funciones para crear/actualizar la puntuación
function setScore(newScore) {
    score = newScore;
    // Redibujar la puntuación en el canvas
    dibujarpuntuacion();
}

function addScore(amount) {
    score += amount;
    // Redibujar la puntuación en el canvas cada vez que cambia
    dibujarpuntuacion();
}
// Ajustar el tamaño del canvas al mapa
canvas.width = map[0].length * tileSize;
canvas.height = map.length * tileSize;
// (Continuación de game.js)

// Dibuja todo el mapa (paredes y puntos)
function drawMap() {
    for (let y = 0; y < map.length; y++) {
        for (let x = 0; x < map[y].length; x++) {
            const tile = map[y][x];

            if (tile === 1) { // Pared
                ctx.fillStyle = 'blue';
                ctx.fillRect(x * tileSize, y * tileSize, tileSize, tileSize);
            } else if (tile === 0) { // Punto pequeño (camino)
                ctx.fillStyle = 'white';
                // Dibuja un círculo pequeño
                ctx.beginPath();
                ctx.arc(
                    x * tileSize + tileSize / 2,
                    y * tileSize + tileSize / 2,
                    tileSize / 5, // Radio del punto pequeño
                    0,
                    Math.PI * 2
                );
                ctx.fill();
            } else if (tile === 2) { // Punto especial/más grande
                ctx.fillStyle = 'white';
                // Dibuja un círculo más grande para el "2"
                ctx.beginPath();
                ctx.arc(
                    x * tileSize + tileSize / 2,
                    y * tileSize + tileSize / 2,
                    tileSize / 3, // Radio más grande para el punto '2'
                    0,
                    Math.PI * 2
                );
                ctx.fill();
            }
        }
    }
}

// Dibuja a Pac-Man
function drawPlayer() {
    ctx.fillStyle = player.color;
    // Dibuja un círculo
    ctx.beginPath();
    ctx.arc(
        player.x * tileSize + tileSize / 2, 
        player.y * tileSize + tileSize / 2, 
        player.size / 2.5, // Radio de Pac-Man
        0, 
        Math.PI * 2
    );
    ctx.fill();
}
// --- GHOSTS -----------------------------------------------------
// Array de ghosts (posiciones en tiles y color)
const ghosts = [
    { x: 9, y: 7, color: 'red', dx: 0, dy: 0, size: tileSize },
    { x: 9, y: 9, color: 'pink', dx: 0, dy: 0, size: tileSize },
    { x: 8, y: 9, color: 'cyan', dx: 0, dy: 0, size: tileSize },
    { x: 10, y: 9, color: 'orange', dx: 0, dy: 0, size: tileSize }
];

// Guardar posiciones iniciales para poder resetear los ghosts si hace falta
const ghostStartPositions = ghosts.map(g => ({ x: g.x, y: g.y }));

// Dibuja un ghost simple (cuerpo circular y ojos)
function drawGhost(ghost) {
    const cx = ghost.x * tileSize + tileSize / 2;
    const cy = ghost.y * tileSize + tileSize / 2;
    const radius = tileSize / 2.5;

    // Cuerpo (círculo)
    ctx.fillStyle = ghost.color;
    ctx.beginPath();
    ctx.arc(cx, cy, radius, Math.PI, 0, false); // arco superior
    ctx.lineTo(cx + radius, cy + radius); // bajar para cerrar forma
    ctx.lineTo(cx - radius, cy + radius);
    ctx.closePath();
    ctx.fill();
}

function drawGhosts() {
    ghosts.forEach(g => drawGhost(g));
}

// ----------------- Movimiento de ghosts -----------------
let tick = 0;
const ghostMoveRate = 2; // mover cada N ticks (ajustable, 1 = cada frame)

function getValidDirections(x, y) {
    const dirs = [
        { dx: 0, dy: -1 }, // arriba
        { dx: 0, dy: 1 },  // abajo
        { dx: -1, dy: 0 }, // izquierda
        { dx: 1, dy: 0 }   // derecha
    ];
    const valid = [];
    dirs.forEach(d => {
        const nx = x + d.dx;
        const ny = y + d.dy;
        if (ny >= 0 && ny < map.length && nx >= 0 && nx < map[0].length) {
            if (map[ny][nx] !== 1) valid.push(d);
        }
    });
    return valid;
}

function chooseRandomDirection(validDirs) {
    if (!validDirs || validDirs.length === 0) return { dx: 0, dy: 0 };
    return validDirs[Math.floor(Math.random() * validDirs.length)];
}

function moveGhosts() {
    // Mover ghosts sólo cada ghostMoveRate ticks
    if (tick % ghostMoveRate !== 0) return;

    ghosts.forEach(ghost => {
        // Si no tiene dirección asignada, escoger una válida
        if (ghost.dx === 0 && ghost.dy === 0) {
            const val = getValidDirections(ghost.x, ghost.y);
            const d = chooseRandomDirection(val);
            ghost.dx = d.dx; ghost.dy = d.dy;
        }

        // Ocasionalmente cambiar dirección aleatoriamente (10% prob)
        if (Math.random() < 0.10) {
            const valDirs = getValidDirections(ghost.x, ghost.y);
            if (valDirs.length > 0) {
                const d = chooseRandomDirection(valDirs);
                ghost.dx = d.dx; ghost.dy = d.dy;
            }
        }

        const nextX = ghost.x + ghost.dx;
        const nextY = ghost.y + ghost.dy;

        // Si la siguiente casilla es válida, mover; si no, elegir nueva dirección
        if (nextY >= 0 && nextY < map.length && nextX >= 0 && nextX < map[0].length && map[nextY][nextX] !== 1) {
            ghost.x = nextX;
            ghost.y = nextY;
        } else {
            const val = getValidDirections(ghost.x, ghost.y);
            const d = chooseRandomDirection(val);
            ghost.dx = d.dx; ghost.dy = d.dy;
            // intentar mover en la nueva dirección si es posible
            const nx = ghost.x + ghost.dx;
            const ny = ghost.y + ghost.dy;
            if (ny >= 0 && ny < map.length && nx >= 0 && nx < map[0].length && map[ny][nx] !== 1) {
                ghost.x = nx; ghost.y = ny;
            }
        }
    });
}

// Comprueba colisión entre Pac-Man y ghosts (por casilla)
function ComprobarCol() {
    for (const [i, ghost] of ghosts.entries()) {
        // Coordenadas en píxeles
        const playerPx = player.x * tileSize;
        const playerPy = player.y * tileSize;
        const ghostPx = ghost.x * tileSize;
        const ghostPy = ghost.y * tileSize;

        const ghostSize = ghost.size || tileSize; // fallback

        // Detección por caja (similar al snippet que enviaste)
        if (
            playerPx < ghostPx + ghostSize &&
            playerPx + player.size > ghostPx &&
            playerPy < ghostPy + ghostSize &&
            playerPy + player.size > ghostPy
        ) {
            // El jugador perdió una vida
            lives = Math.max(0, lives - 1);
            soundsDeadh.play();


            if (lives > 0) {
                // Avisar y reiniciar posiciones (sin recargar todo)
                alert(`¡ATRPADO! Te quedan ${lives} vidas`);
                player.x = 1;
                player.y = 1;
                player.dx = 0;
                player.dy = 0;
                ghosts.forEach((g, idx) => {
                    g.x = ghostStartPositions[idx].x;
                    g.y = ghostStartPositions[idx].y;
                    g.dx = 0;
                    g.dy = 0;
                });
            } else {
                // Se acabaron las vidas: recargar todo
                alert('Game Over');
                inicio.play();
                // Restaurar mapa desde initialMap
                for (let y = 0; y < map.length; y++) {
                    for (let x = 0; x < map[y].length; x++) {
                        map[y][x] = initialMap[y][x];
                    }
                }

                // Reiniciar puntuación
                setScore(0);

                // Reiniciar vidas
                lives = 3;

                // Recontar puntos especiales (si aplica)
                dots = 0;
                map.forEach(row => {
                    row.forEach(tile => {
                        if (tile === 2) dots++;
                    });
                });

                // Reiniciar posiciones del jugador y ghosts
                player.x = 1;
                player.y = 1;
                player.dx = 0;
                player.dy = 0;
                ghosts.forEach((g, idx) => {
                    g.x = ghostStartPositions[idx].x;
                    g.y = ghostStartPositions[idx].y;
                    g.dx = 0;
                    g.dy = 0;
                });
            }

            // Salir después de manejar la colisión
            break;
        }
    }
}
// (Continuación de game.js)

// Escuchar las teclas (Flechas)
document.addEventListener('keydown', e => {
    switch (e.key) {
        case 'ArrowUp':
            player.dx = 0; player.dy = -1;
            break;
        case 'ArrowDown':
            player.dx = 0; player.dy = 1;
            break;
        case 'ArrowLeft':
            player.dx = -1; player.dy = 0;
            break;
        case 'ArrowRight':
            player.dx = 1; player.dy = 0;
            break;
    }
});
// (Continuación de game.js)
  
// Función principal del juego (Game Loop)
function gameLoop() {

    
    // 1. Calcular la próxima posición
    let nextX = player.x + player.dx;
    let nextY = player.y + player.dy;
    

    // 2. Comprobar colisiones con las paredes
    if (map[nextY][nextX] !== 1) {
        // No hay pared, ¡muévete!
        player.x = nextX;
        player.y = nextY;
    }

    // Actualizar tick y mover ghosts (antes de la comprobación de puntos para evitar solapamientos raros)
    tick++;
    moveGhosts();
    // Comprobar colisiones entre Pac-Man y ghosts
    ComprobarCol();
    

    // 3. Comprobar si come un punto (0 = punto pequeño, 2 = punto grande)
    const currentTile = map[player.y][player.x];
    if (currentTile === 0 || currentTile === 2) {
        map[player.y][player.x] = 3; // El punto desaparece
        // Usar la función para actualizar puntuación
        addScore(1);
        // reproducir sonido de comer
        try { soundsEatDot.play(); } catch (e) { /* no bloquear juego si falla audio */ }
        // Reducir el contador de puntos comestibles (0 y 2)
        dots--;
        // Si no quedan puntos, ganar el juego
        if (dots <= 0) {
            setTimeout(() => {
                alert(`¡Ganaste! Puntuación: ${score}`);
                // Reiniciar el juego (simple)
                document.location.reload();
            }, 50);
        }
        // (Aquí podrías actualizar un marcador de puntuación adicional si hace falta)
    }
    // limite
    if (player.x <0) player.x = 0;
    if (player.y <0) player.y = 0;
    if (player.x + player.size > canvas.width) player.x = canvas.width - player.size;
    if (player.y + player.size > canvas.height) player.y = canvas.height - player.size

    
    
    // 4. Comprobar si no hay mas puntos ganar

    // 5. Borrar y volver a dibujar todo
    ctx.clearRect(0, 0, canvas.width, canvas.height); // Limpiar canvas
    drawMap();
    drawPlayer();
    // Dibujar ghosts detrás de la puntuación (por encima del mapa, debajo del HUD)
    drawGhosts();
    // Dibujar la puntuación encima (overlay)
    dibujarpuntuacion();
    // Dibujar vidas
    drawLives();
    eatDot();

}

// --- INICIAR EL JUEGO ---

// Contar cuántos puntos hay al inicio (tanto 0 como 2 son comestibles)
dots = 0;
map.forEach(row => {
    row.forEach(tile => {
        if (tile === 0 || tile === 2) {
            dots++;
        }
    });
});

// Dibujar la puntuación inicial antes de empezar
dibujarpuntuacion();

// Iniciar el bucle del juego (se ejecuta 5 veces por segundo)
setInterval(gameLoop, 200); // 200ms = 5 veces por segundo