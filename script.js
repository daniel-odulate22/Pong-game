const canvas = document.getElementById('pongCanvas');
const ctx = canvas.getContext('2d');

// For animated background INSIDE play area
const bgCanvas = document.createElement('canvas');
bgCanvas.width = canvas.width;
bgCanvas.height = canvas.height;
const bgCtx = bgCanvas.getContext('2d');

// Aurora effect params
const auroraBands = [
    { amplitude: 80, frequency: 0.009, phase: 0, color: "#08f7fe22", speed: 0.004 },
    { amplitude: 60, frequency: 0.013, phase: Math.PI / 3, color: "#f7096b22", speed: 0.003 },
    { amplitude: 40, frequency: 0.017, phase: Math.PI, color: "#ffde0022", speed: 0.002 }
];

// Game objects
const paddleWidth = 16;
const paddleHeight = 140;
const ballSize = 40; // Increased ball size

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
    speed: 9,
    dx: 9,
    dy: 9,
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

// Draw animated background effect (inside play area)
function drawBackground(time) {
    bgCtx.clearRect(0, 0, bgCanvas.width, bgCanvas.height);

    for (let band of auroraBands) {
        bgCtx.save();
        bgCtx.globalAlpha = 0.7;
        bgCtx.beginPath();
        for (let x = 0; x <= bgCanvas.width; x++) {
            let y = band.amplitude * Math.sin(band.frequency * x + band.phase + band.speed * time) +
                    bgCanvas.height / 2 +
                    band.amplitude * Math.sin(band.frequency * x / 2 + band.phase * 2 + band.speed * time / 2);
            if (x === 0) {
                bgCtx.moveTo(x, y);
            } else {
                bgCtx.lineTo(x, y);
            }
        }
        bgCtx.lineTo(bgCanvas.width, bgCanvas.height);
        bgCtx.lineTo(0, bgCanvas.height);
        bgCtx.closePath();
        bgCtx.fillStyle = band.color;
        bgCtx.fill();
        bgCtx.restore();
    }

    // Overlay subtle vertical gradient
    let vGrad = bgCtx.createLinearGradient(0, 0, 0, bgCanvas.height);
    vGrad.addColorStop(0, "#2226");
    vGrad.addColorStop(1, "#1e3c72cc");
    bgCtx.fillStyle = vGrad;
    bgCtx.fillRect(0, 0, bgCanvas.width, bgCanvas.height);

    // Draw onto main canvas
    ctx.drawImage(bgCanvas, 0, 0);
}

// Draw everything
function draw(time) {
    drawBackground(time);

    // Draw scores
    ctx.font = "64px Arial Black";
    ctx.textAlign = "center";
    ctx.shadowColor = scoreShadow;
    ctx.shadowBlur = 10;

    // Left score
    ctx.fillStyle = scoreColorLeft;
    ctx.fillText(leftScore, canvas.width / 4, 90);

    // Right score
    ctx.fillStyle = scoreColorRight;
    ctx.fillText(rightScore, canvas.width * 3 / 4, 90);

    ctx.shadowBlur = 0;

    // Draw paddles (no glow)
    ctx.fillStyle = leftPaddle.color;
    ctx.fillRect(leftPaddle.x, leftPaddle.y, leftPaddle.width, leftPaddle.height);

    ctx.fillStyle = rightPaddle.color;
    ctx.fillRect(rightPaddle.x, rightPaddle.y, rightPaddle.width, rightPaddle.height);

    // Draw ball as a solid circle (no glow)
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

// AI for right paddle (smooth movement)
function moveAIPaddle() {
    const paddleCenter = rightPaddle.y + rightPaddle.height / 2;
    const ballCenter = ball.y + ball.size / 2;
    const aiSpeed = 7;

    // Predict ball position slightly ahead for more natural movement
    let targetY = ballCenter + ball.dy * 8;
    if (targetY < paddleCenter - 10) {
        rightPaddle.y -= aiSpeed;
    } else if (targetY > paddleCenter + 10) {
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
        ball.dy += (Math.random() - 0.5) * 2;
    }

    // Bounce off right paddle
    if (checkCollision(rightPaddle)) {
        ball.dx *= -1;
        ball.x = rightPaddle.x - ball.size;
        ball.dy += (Math.random() - 0.5) * 2;
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

// Game loop with animation time
function loop(time) {
    update();
    draw(time);
    requestAnimationFrame(loop);
}

loop(performance.now());