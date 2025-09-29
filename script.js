const canvas = document.getElementById('pongCanvas');
const ctx = canvas.getContext('2d');

// Game objects
const paddleWidth = 14;
const paddleHeight = 100;
const ballSize = 18;

// Colors
const leftPaddleColor = "#08f7fe";    // Cyan
const rightPaddleColor = "#f7096b";   // Pink
const ballColor = "#ffde00";          // Yellow
const scoreColorLeft = "#08f7fe";
const scoreColorRight = "#f7096b";
const scoreShadow = "#222";

// Paddles and ball
let leftPaddle = {
    x: 0,
    y: canvas.height / 2 - paddleHeight / 2,
    width: paddleWidth,
    height: paddleHeight,
    color: leftPaddleColor
};

let rightPaddle = {
    x: canvas.width - paddleWidth,
    y: canvas.height / 2 - paddleHeight / 2,
    width: paddleWidth,
    height: paddleHeight,
    color: rightPaddleColor
};

let ball = {
    x: canvas.width / 2 - ballSize / 2,
    y: canvas.height / 2 - ballSize / 2,
    size: ballSize,
    speed: 6,
    dx: 6,
    dy: 6,
    color: ballColor
};

// Scores
let leftScore = 0;
let rightScore = 0;

// Mouse control for left paddle
canvas.addEventListener('mousemove', function(e) {
    const rect = canvas.getBoundingClientRect();
    const mouseY = e.clientY - rect.top;
    leftPaddle.y = mouseY - leftPaddle.height / 2;
    leftPaddle.y = Math.max(0, Math.min(canvas.height - leftPaddle.height, leftPaddle.y));
});

// Draw everything
function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw scores
    ctx.font = "48px Arial Black";
    ctx.textAlign = "center";
    ctx.shadowColor = scoreShadow;
    ctx.shadowBlur = 10;

    // Left score
    ctx.fillStyle = scoreColorLeft;
    ctx.fillText(leftScore, canvas.width / 4, 60);

    // Right score
    ctx.fillStyle = scoreColorRight;
    ctx.fillText(rightScore, canvas.width * 3 / 4, 60);

    ctx.shadowBlur = 0;

    // Draw paddles
    ctx.fillStyle = leftPaddle.color;
    ctx.fillRect(leftPaddle.x, leftPaddle.y, leftPaddle.width, leftPaddle.height);

    ctx.fillStyle = rightPaddle.color;
    ctx.fillRect(rightPaddle.x, rightPaddle.y, rightPaddle.width, rightPaddle.height);

    // Draw ball
    ctx.fillStyle = ball.color;
    ctx.beginPath();
    ctx.arc(ball.x + ball.size / 2, ball.y + ball.size / 2, ball.size / 2, 0, Math.PI * 2);
    ctx.fill();
}

// Collision detection
function checkCollision(paddle) {
    return (
        ball.x < paddle.x + paddle.width &&
        ball.x + ball.size > paddle.x &&
        ball.y < paddle.y + paddle.height &&
        ball.y + ball.size > paddle.y
    );
}

// AI for right paddle
function moveAIPaddle() {
    const paddleCenter = rightPaddle.y + rightPaddle.height / 2;
    const ballCenter = ball.y + ball.size / 2;
    const aiSpeed = 5;

    if (ballCenter < paddleCenter - 10) {
        rightPaddle.y -= aiSpeed;
    } else if (ballCenter > paddleCenter + 10) {
        rightPaddle.y += aiSpeed;
    }
    rightPaddle.y = Math.max(0, Math.min(canvas.height - rightPaddle.height, rightPaddle.y));
}

// Update game state
function update() {
    ball.x += ball.dx;
    ball.y += ball.dy;

    // Bounce off top/bottom walls
    if (ball.y <= 0 || ball.y + ball.size >= canvas.height) {
        ball.dy *= -1;
    }

    // Bounce off left paddle
    if (checkCollision(leftPaddle)) {
        ball.dx *= -1;
        ball.x = leftPaddle.x + leftPaddle.width;
    }

    // Bounce off right paddle
    if (checkCollision(rightPaddle)) {
        ball.dx *= -1;
        ball.x = rightPaddle.x - ball.size;
    }

    // Ball out of bounds
    if (ball.x < 0) {
        rightScore++;
        resetBall(-1); // Ball goes towards player after score
    }
    if (ball.x + ball.size > canvas.width) {
        leftScore++;
        resetBall(1); // Ball goes towards AI after score
    }

    moveAIPaddle();
}

// Reset ball after score
function resetBall(direction) {
    ball.x = canvas.width / 2 - ballSize / 2;
    ball.y = canvas.height / 2 - ballSize / 2;
    ball.dx = ball.speed * direction;
    ball.dy = ball.speed * (Math.random() > 0.5 ? 1 : -1);
}

// Game loop
function loop() {
    update();
    draw();
    requestAnimationFrame(loop);
}

loop();