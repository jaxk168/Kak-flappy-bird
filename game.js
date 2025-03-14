const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Set canvas size based on screen size for better mobile support
const WIDTH = window.innerWidth * 0.8;
const HEIGHT = window.innerHeight * 0.7;
canvas.width = WIDTH;
canvas.height = HEIGHT;

// Game constants
const GRAVITY = 0.4;
const FLAP_STRENGTH = -8;
const PIPE_WIDTH = 70;
const PIPE_GAP = 200;
const PIPE_VELOCITY = 4;
let birdX = 50, birdY = HEIGHT / 2, birdVelocity = 0;
let pipes = [];
let score = 0;
let gameOver = false;

// Load the bird image
const birdImg = new Image();
birdImg.src = 'images/bird.png';  // Make sure the image exists in this path
birdImg.onload = function() {
    birdImg.width = WIDTH * 0.07;
    birdImg.height = birdImg.width * (50 / 60);
};

// Load the logo image
const logoImg = new Image();
logoImg.src = 'images/logo.png';  // Make sure the image exists in this path
logoImg.onload = function() {
    logoImg.width = birdImg.width;
    logoImg.height = logoImg.width;
};

// Generate random colors for pipes
function randomColor() {
    return `rgb(${Math.floor(Math.random() * 256)}, ${Math.floor(Math.random() * 256)}, ${Math.floor(Math.random() * 256)})`;
}

// Create new pipes
function createPipe() {
    const pipeHeight = Math.floor(Math.random() * (HEIGHT - PIPE_GAP));
    const topPipe = { x: WIDTH, y: 0, width: PIPE_WIDTH, height: pipeHeight };
    const bottomPipe = { x: WIDTH, y: pipeHeight + PIPE_GAP, width: PIPE_WIDTH, height: HEIGHT - pipeHeight - PIPE_GAP };
    return { topPipe, bottomPipe };
}

// Handle the bird flap (Spacebar or Tap to flap)
window.addEventListener('keydown', function(event) {
    if (event.code === 'Space' && !gameOver) {
        flap();
    }
});
canvas.addEventListener('click', function() {
    if (!gameOver) {
        flap(); // Make bird flap when clicking
    } else {
        restartGame(); // Restart game when button is clicked
    }
});

// Function to start/restart the game
function restartGame() {
    birdY = HEIGHT / 2;
    birdVelocity = 0;
    pipes = [];
    score = 0;
    gameOver = false;
    document.getElementById('playAgainButton').style.display = 'none'; // Hide the button
    document.getElementById('totalScore').style.display = 'none'; // Hide total score when restarting
    // Restart game and set button listener
    setButtonListener();
}

// Flap function to change bird's velocity
function flap() {
    birdVelocity = FLAP_STRENGTH;
}

// Update the game state
function update() {
    if (gameOver) return;

    birdVelocity += GRAVITY;
    birdY += birdVelocity;

    // Add new pipes if needed
    if (pipes.length === 0 || pipes[pipes.length - 1].topPipe.x < WIDTH - 300) {
        pipes.push(createPipe());
    }

    // Move pipes
    for (let pipePair of pipes) {
        pipePair.topPipe.x -= PIPE_VELOCITY;
        pipePair.bottomPipe.x -= PIPE_VELOCITY;
    }

    // Remove off-screen pipes and increase score
    if (pipes[0].topPipe.x < -PIPE_WIDTH) {
        pipes.shift();
        score++;
    }

    // Collision detection
    for (let pipePair of pipes) {
        if (birdX + birdImg.width > pipePair.topPipe.x && birdX < pipePair.topPipe.x + PIPE_WIDTH &&
            (birdY < pipePair.topPipe.height || birdY + birdImg.height > pipePair.bottomPipe.y)) {
            gameOver = true;
        }
    }

    // Check if bird hits top or bottom bounds
    if (birdY + birdImg.height > HEIGHT || birdY < 0) {
        gameOver = true;
    }
}

// Function to convert Arabic numbers to Khmer numbers
function convertToKhmer(num) {
    const khmerDigits = ["០", "១", "២", "៣", "៤", "៥", "៦", "៧", "៨", "៩"];
    return num.toString().split('').map(digit => khmerDigits[parseInt(digit)]).join('');
}

// Draw everything on the canvas
function draw() {
    ctx.clearRect(0, 0, WIDTH, HEIGHT);

    // Set the background color inside the game box to light blue
    ctx.fillStyle = '#ADD8E6';  // Light blue color
    ctx.fillRect(0, 0, WIDTH, HEIGHT);

    // Draw pipes with random colors
    let pipeColor = randomColor();
    for (let pipePair of pipes) {
        ctx.fillStyle = pipeColor;
        ctx.fillRect(pipePair.topPipe.x, pipePair.topPipe.y, PIPE_WIDTH, pipePair.topPipe.height);
        ctx.fillRect(pipePair.bottomPipe.x, pipePair.bottomPipe.y, PIPE_WIDTH, pipePair.bottomPipe.height);
    }

    // Draw bird
    ctx.drawImage(birdImg, birdX, birdY, birdImg.width, birdImg.height);

    // Draw score in Khmer with black color
    ctx.fillStyle = 'black'; 
    ctx.font = '30px Arial';
    ctx.fillText("ពិន្ទុ: " + convertToKhmer(score), 10, 30);

    // Draw the logo as a circle at the top-right corner with a blue border
    ctx.save();
    const logoSize = birdImg.width;
    const logoX = WIDTH - logoSize - 10;
    const logoY = logoSize / 2 + 10;

    ctx.lineWidth = 5;
    ctx.strokeStyle = 'blue';
    ctx.beginPath();
    ctx.arc(logoX + logoSize / 2, logoY + logoSize / 2, logoSize / 2, 0, Math.PI * 2);
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(logoX + logoSize / 2, logoY + logoSize / 2, logoSize / 2, 0, Math.PI * 2);
    ctx.clip();

    ctx.drawImage(logoImg, logoX, logoY, logoSize, logoSize);
    ctx.restore();

    // Draw game over text in the center
    if (gameOver) {
        ctx.fillStyle = 'red';
        ctx.font = '40px Arial';
        const gameOverText = "កាកម៉េសចាញ់បាត់";
        const textWidth = ctx.measureText(gameOverText).width;
        ctx.fillText(gameOverText, (WIDTH - textWidth) / 2, HEIGHT / 2);

        // Show "Play Again" button and total score section
        document.getElementById('playAgainButton').style.display = 'inline-block';
        document.getElementById('totalScore').style.display = 'inline-block';
        document.getElementById('totalScore').textContent = 'ពិន្ទុសរុប: ' + convertToKhmer(score);
    }
}

// Set up button click listener after game over
function setButtonListener() {
    const playAgainButton = document.getElementById('playAgainButton');
    playAgainButton.addEventListener('click', restartGame);
}

// Game loop
function gameLoop() {
    if (!gameOver) {
        update();
        draw();
    }
    requestAnimationFrame(gameLoop);
}

// Start game
gameLoop();
