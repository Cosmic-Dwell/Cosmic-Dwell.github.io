const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const player = {
    x: canvas.width / 2 - 15,
    y: canvas.height - 80,
    width: 30,
    height: 60,
    speed: 7,
    dx: 0,
    bullets: [],
    color: 'white'
};

const enemies = [];
const enemySize = 30;
const enemySpeed = 2;
let score = 0;
let hits = 0;  // Times the player has been hit

function spawnEnemy() {
    const positionX = Math.random() * (canvas.width - enemySize);
    enemies.push({
        x: positionX,
        y: -enemySize,
        width: enemySize,
        height: enemySize,
        color: 'red'
    });
}

// Increase enemy spawn rate
setInterval(spawnEnemy, 500);

function drawPlayer() {
    ctx.fillStyle = player.color;
    ctx.beginPath();
    ctx.moveTo(player.x, player.y);
    ctx.lineTo(player.x + player.width, player.y);
    ctx.lineTo(player.x + player.width / 2, player.y - player.height);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = 'blue';
    ctx.beginPath();
    ctx.arc(player.x + player.width / 2, player.y - 20, 5, 0, Math.PI * 2, true);
    ctx.fill();
}

function drawEnemies() {
    enemies.forEach(enemy => {
        ctx.fillStyle = enemy.color;
        ctx.fillRect(enemy.x, enemy.y, enemy.width, enemy.height);
    });
}

function updateEnemies() {
    enemies.forEach((enemy, index) => {
        enemy.y += enemySpeed;
        if (enemy.y > canvas.height) {
            enemies.splice(index, 1);
        }
    });
}

function updateBullets() {
    player.bullets.forEach((bullet, bIndex) => {
        bullet.y -= 10;
        if (bullet.y < 0) {
            player.bullets.splice(bIndex, 1);
        } else {
            ctx.fillStyle = bullet.color;
            ctx.fillRect(bullet.x, bullet.y, bullet.width, bullet.height);
            enemies.forEach((enemy, eIndex) => {
                if (bullet.x < enemy.x + enemy.width &&
                    bullet.x + bullet.width > enemy.x &&
                    bullet.y < enemy.y + enemy.height &&
                    bullet.y + bullet.height > enemy.y) {
                    // Bullet hits an enemy
                    player.bullets.splice(bIndex, 1);
                    enemies.splice(eIndex, 1);
                    score += 1;  // Increment score
                    return;
                }
            });
        }
    });
}

function checkCollisions() {
    enemies.forEach((enemy, eIndex) => {
        if (player.x < enemy.x + enemy.width &&
            player.x + player.width > enemy.x &&
            player.y < enemy.y + enemy.height &&
            player.y + player.height > enemy.y) {
            enemies.splice(eIndex, 1);
            hits += 1;  // Increment hit count
        }
    });
}

function update() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    player.x += player.dx;
    drawPlayer();
    drawEnemies();
    updateEnemies();
    updateBullets();
    checkCollisions();
    displayScore();
    if (score >= 25 || hits >= 5) {
        displayEndScreen();
        return; // Stop the game loop
    }
    requestAnimationFrame(update);
}

function displayScore() {
    ctx.font = '20px Arial';
    ctx.fillStyle = 'white';
    ctx.fillText(`Score: ${score}`, canvas.width - 120, 30);
    ctx.fillText(`Hits: ${hits}`, canvas.width - 120, 60);
}

function displayEndScreen() {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.font = '40px Arial';
    ctx.fillStyle = 'white';
    ctx.textAlign = 'center';
    const message = score >= 25 ? 'You win!' : 'You lose!';
    ctx.fillText(message, canvas.width / 2, canvas.height / 2);
    ctx.font = '20px Arial';
    ctx.fillText('Refresh to play again', canvas.width / 2, canvas.height / 2 + 40);
}

function shootBullet() {
    const bullet = {
        x: player.x + player.width / 2 - 2.5,
        y: player.y - 30,
        width: 5,
        height: 10,
        color: 'yellow'
    };
    player.bullets.push(bullet);
}

document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft') {
        player.dx = -player.speed;
    } else if (e.key === 'ArrowRight') {
        player.dx = player.speed;
    } else if (e.key === ' ' || e.key === 'ArrowUp') {
        shootBullet();
    }
});

document.addEventListener('keyup', (e) => {
    if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
        player.dx = 0;
    }
});

update();
