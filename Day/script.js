const player = document.getElementById('player');
const gameContainer = document.getElementById('game-container');
const scoreDisplay = document.getElementById('score');
const gameOverScreen = document.getElementById('game-over');
const finalScoreDisplay = document.getElementById('final-score');
const restartButton = document.getElementById('restart-button');
const meterFill = document.getElementById('meter-fill');
const backgroundMusic = document.getElementById('background-music');
backgroundMusic.play();

let playerX = 50;
let playerY = 250;
let playerSpeed = 4;
let score = 0;
let gameFrozen = false;
let speedBoostActive = false;
let meterValue = 0;

const keysPressed = {};

function movePlayer() {
    document.addEventListener('keydown', function (event) {
        keysPressed[event.key] = true;
        if (event.key === ' ' && meterValue === 100) {
            activateSpeedBoost();
        }
    });

    document.addEventListener('keyup', function (event) {
        delete keysPressed[event.key];
    });
}

function movePlayerAlternate() {
    document.addEventListener('keydown', function (event) {
        if (!keysPressed[event.key] && ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(event.key)) {
            keysPressed[event.key] = true;
        }
    });

    document.addEventListener('keyup', function (event) {
        if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(event.key)) {
            delete keysPressed[event.key];
        }
    });
}

function updatePlayerPosition() {
    if (!gameFrozen) {
        if ('w' in keysPressed || 'ArrowUp' in keysPressed) {
            if (playerY > 0) playerY -= playerSpeed;
        }
        if ('s' in keysPressed || 'ArrowDown' in keysPressed) {
            if (playerY < gameContainer.clientHeight - player.clientHeight) playerY += playerSpeed;
        }
        if ('a' in keysPressed || 'ArrowLeft' in keysPressed) {
            if (playerX > 0) playerX -= playerSpeed;
        }
        if ('d' in keysPressed || 'ArrowRight' in keysPressed) {
            if (playerX < gameContainer.clientWidth - player.clientWidth) playerX += playerSpeed;
        }

        player.style.left = playerX + 'px';
        player.style.top = playerY + 'px';
        checkCollisions();
    }

    requestAnimationFrame(updatePlayerPosition);
}

function checkCollisions() {
    const items = document.querySelectorAll('.item');
    const obstacles = document.querySelectorAll('.obstacle');

    items.forEach(function (item) {
        if (!item.classList.contains('collected')) {
            const itemRect = item.getBoundingClientRect();
            const playerRect = player.getBoundingClientRect();

            if (
                playerRect.left < itemRect.right &&
                playerRect.right > itemRect.left &&
                playerRect.top < itemRect.bottom &&
                playerRect.bottom > itemRect.top
            ) {
                item.classList.add('collected');
                item.style.display = 'none';
                score++;
                scoreDisplay.innerText = 'Score: ' + score;
                increaseMeter();
            }
        }
    });

    obstacles.forEach(function (obstacle1) {
        const obstacleRect1 = obstacle1.getBoundingClientRect();
        const playerRect = player.getBoundingClientRect();

        if (
            playerRect.left < obstacleRect1.right &&
            playerRect.right > obstacleRect1.left &&
            playerRect.top < obstacleRect1.bottom &&
            playerRect.bottom > obstacleRect1.top
        ) {
            endGame();
        }
    });
}

function createItem() {
    const item = document.createElement('div');
    item.className = 'item';
    const x = Math.random() * (gameContainer.clientWidth - 20);
    const y = Math.random() * (gameContainer.clientHeight - 20);
    item.style.left = x + 'px';
    item.style.top = y + 'px';
    gameContainer.appendChild(item);
}

function createObstacle() {
    const obstacle = document.createElement('div');
    obstacle.className = 'obstacle';
    const x = Math.random() * (gameContainer.clientWidth - 40);
    const y = Math.random() * (gameContainer.clientHeight - 40);
    obstacle.style.left = x + 'px';
    obstacle.style.top = y + 'px';
    gameContainer.appendChild(obstacle);
}

function moveRedDots() {
    const obstacles = document.querySelectorAll('.obstacle');

    obstacles.forEach(function (obstacle1) {
        if (!gameFrozen) {
            const obstacleRect1 = obstacle1.getBoundingClientRect();
            const playerRect = player.getBoundingClientRect();
            const dxPlayer = playerRect.left - obstacleRect1.left;
            const dyPlayer = playerRect.top - obstacleRect1.top;
            const distancePlayer = Math.sqrt(dxPlayer * dxPlayer + dyPlayer * dyPlayer);

            // Initialize variables to keep track of avoidance movement
            let avoidanceX = 0;
            let avoidanceY = 0;

            obstacles.forEach(function (obstacle2) {
                if (obstacle1 !== obstacle2) {
                    const obstacleRect2 = obstacle2.getBoundingClientRect();
                    const dxObstacle = obstacleRect1.left - obstacleRect2.left;
                    const dyObstacle = obstacleRect1.top - obstacleRect2.top;
                    const distanceObstacle = Math.sqrt(dxObstacle * dxObstacle + dyObstacle * dyObstacle);
                    const minDistance = 40; // Adjust this value to control the minimum distance

                    if (distanceObstacle < minDistance) {
                        const avoidanceAngle = Math.atan2(dyObstacle, dxObstacle);
                        const moveX = Math.cos(avoidanceAngle) * (minDistance - distanceObstacle);
                        const moveY = Math.sin(avoidanceAngle) * (minDistance - distanceObstacle);

                        avoidanceX += moveX;
                        avoidanceY += moveY;
                    }
                }
            });

            // Update the position based on collision avoidance
            obstacle1.style.left = obstacleRect1.left + avoidanceX + 'px';
            obstacle1.style.top = obstacleRect1.top + avoidanceY + 'px';

            if (distancePlayer < 500) {
                const speed = 2;
                const velocityX = (dxPlayer / distancePlayer) * speed;
                const velocityY = (dyPlayer / distancePlayer) * speed;
                const newX = obstacleRect1.left + velocityX;
                const newY = obstacleRect1.top + velocityY;

                obstacle1.style.left = newX + 'px';
                obstacle1.style.top = newY + 'px';
            }
        }
    });
}




function endGame() {
    gameFrozen = true;
    finalScoreDisplay.innerText = score;
    gameOverScreen.style.display = 'block';

    const obstacles = document.querySelectorAll('.obstacle');
    obstacles.forEach(function (obstacle) {
        obstacle.style.animation = 'none';
    });

    restartButton.addEventListener('click', function () {
        localStorage.removeItem('speedBoostActive'); // Remove the speed boost flag from local storage
        location.reload(); // Reload the game
        backgroundMusic.play(); // Play the background music again
    });
}

function changePlayerColor() {
    if (speedBoostActive) {
        let hue = 0;

        function updateColor() {
            const color = `hsl(${hue}, 100%, 50%)`;
            player.style.backgroundColor = color;
            hue = (hue + 1) % 360;
            if (speedBoostActive) {
                requestAnimationFrame(updateColor);
            }
        }

        updateColor();
    } else {
        // If speed boost is not active, set the player's color to blue or any other desired color.
        player.style.backgroundColor = 'blue'; // You can replace 'blue' with the desired color.
    }
}
function increaseMeter() {
    if (meterValue < 100) {
        meterValue += 20;
        meterFill.style.width = meterValue + '%';
    }
}

function rainbowColorEffect() {
    let hue = 0;
    let rotation = 0; // Initialize rotation angle

    function updateColorAndRotation() {
        const color = `hsl(${hue}, 100%, 50%)`;
        player.style.backgroundColor = color;
        
        // Rotate the player element
        rotation += 10; // You can adjust the rotation speed
        player.style.transform = `rotate(${rotation}deg)`;
        
        hue = (hue + 1) % 360;

        if (speedBoostActive) {
            requestAnimationFrame(updateColorAndRotation);
        }
    }

    updateColorAndRotation();
}

function activateSpeedBoost() {
    if (meterValue === 100 && !speedBoostActive) {
        playerSpeed *= 2;
        meterValue = 0;
        meterFill.style.width = '0';
        speedBoostActive = true;
        changePlayerColor(); // Apply rainbow colors during the speed boost.
        localStorage.setItem('speedBoostActive', 'true'); // Set the speed boost flag in local storage
        setTimeout(deactivateSpeedBoost, 5000);
    }
}

function deactivateSpeedBoost() {
    playerSpeed /= 2;
    speedBoostActive = false;
    player.style.backgroundColor = 'blue';
}

function initGame() {
    movePlayer();
    movePlayerAlternate();
    setInterval(createItem, 2000);
    setInterval(createObstacle, 3000);
    setInterval(moveRedDots, 10);
    requestAnimationFrame(updatePlayerPosition);
}

initGame();