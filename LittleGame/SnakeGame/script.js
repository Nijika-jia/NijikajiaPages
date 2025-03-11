const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreElement = document.getElementById('score');
const restartBtn = document.getElementById('restartBtn');

// 游戏参数
const gridSize = 20;
const tileCount = canvas.width / gridSize;
let score = 0;
let speed = 200; // 速度（毫秒），数值越大越慢

// 蛇初始状态
let snake = [{ x: 10, y: 10 }];
let dx = 1; // 方向
let dy = 0;

// 食物位置
let food = {
    x: Math.floor(Math.random() * tileCount),
    y: Math.floor(Math.random() * tileCount)
};

// 游戏状态
let isGameOver = false;
let gameLoop;

// 监听按键
document.addEventListener('keydown', changeDirection);
restartBtn.addEventListener('click', resetGame);

// 游戏循环
function update() {
    if (isGameOver) return;

    gameUpdate();
    gameLoop = setTimeout(update, speed); // 控制速度
}

// 逻辑更新
function gameUpdate() {
    // 移动蛇头
    const head = { x: snake[0].x + dx, y: snake[0].y + dy };
    snake.unshift(head);

    // 检测是否吃到食物
    if (head.x === food.x && head.y === food.y) {
        score += 10;
        scoreElement.textContent = score;
        generateFood();
    } else {
        snake.pop();
    }

    // 碰撞检测
    if (isCollision()) {
        gameOver();
        return;
    }

    // 清空画布
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // 画食物
    ctx.fillStyle = 'red';
    ctx.fillRect(food.x * gridSize, food.y * gridSize, gridSize - 2, gridSize - 2);

    // 画蛇
    ctx.fillStyle = 'green';
    snake.forEach(segment => {
        ctx.fillRect(segment.x * gridSize, segment.y * gridSize, gridSize - 2, gridSize - 2);
    });
}

// 方向控制
function changeDirection(event) {
    const { keyCode } = event;
    const LEFT = 37, RIGHT = 39, UP = 38, DOWN = 40;
    const goingUp = dy === -1, goingDown = dy === 1;
    const goingRight = dx === 1, goingLeft = dx === -1;

    if (keyCode === LEFT && !goingRight) { dx = -1; dy = 0; }
    if (keyCode === UP && !goingDown) { dx = 0; dy = -1; }
    if (keyCode === RIGHT && !goingLeft) { dx = 1; dy = 0; }
    if (keyCode === DOWN && !goingUp) { dx = 0; dy = 1; }
}

// 生成食物
function generateFood() {
    food.x = Math.floor(Math.random() * tileCount);
    food.y = Math.floor(Math.random() * tileCount);
    
    snake.forEach(segment => {
        if (segment.x === food.x && segment.y === food.y) {
            generateFood();
        }
    });
}

// 碰撞检测
function isCollision() {
    const head = snake[0];
    return (
        head.x < 0 || head.x >= tileCount || 
        head.y < 0 || head.y >= tileCount ||
        snake.slice(1).some(segment => segment.x === head.x && segment.y === head.y)
    );
}

// 游戏结束
function gameOver() {
    isGameOver = true;
    ctx.fillStyle = 'black';
    ctx.font = '30px Arial';
    ctx.fillText('游戏结束！', canvas.width / 2 - 80, canvas.height / 2);
}

// 重置游戏
function resetGame() {
    snake = [{ x: 10, y: 10 }];
    dx = 1;
    dy = 0;
    score = 0;
    scoreElement.textContent = score;
    isGameOver = false;
    generateFood();
    clearTimeout(gameLoop);
    update();
}

// 启动游戏
resetGame();
