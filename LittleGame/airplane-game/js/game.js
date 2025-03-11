// 获取画布和上下文
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// 加载资源
const resources = {
  player: new Image(),
  enemy: new Image(),
  boss: new Image(),
  player_bullet: new Image(),
  enemy_bullet: new Image(),
  explosion: new Image(),
  item_life : new Image(),
  item_upgrade : new Image()
};
resources.startBackground = new Image();
resources.startBackground.src = 'assets/images/start_background.png';
resources.player.src = 'assets/images/player.png';
resources.enemy.src = 'assets/images/enemy.png';
resources.boss.src = 'assets/images/boss.png';
resources.player_bullet.src = 'assets/images/player_bullet.png';
resources.enemy_bullet.src = 'assets/images/enemy_bullet.png';
resources.explosion.src = 'assets/images/boss.png';

resources.item_life.src = 'assets/images/item_life.png';
resources.item_upgrade.src = 'assets/images/item_upgrade.png';


// 音效资源（使用 Audio 对象，注意跨浏览器支持）
const audio = {
  bgm: new Audio('assets/audio/bgm.mp3'),
  shoot: new Audio('assets/audio/shoot.mp3'),
  enemyExplosion: new Audio('assets/audio/enemy_explosion.mp3'),
  playerExplosion: new Audio('assets/audio/player_explosion.mp3')
};

audio.bgm.loop = true;
// 游戏状态
let gameOver = false;
let paused = false;
let score = 0;
let highScore = localStorage.getItem('highScore') || 0;
let gameStarted = false;



class Sprite {
    constructor(x, y, width, height, image) {
      this.x = x;
      this.y = y;
      this.width = width;
      this.height = height;
      this.image = image;
      this.speedX = 0;
      this.speedY = 0;
      this.alive = true;
    }
    
    draw() {
      if (this.alive) {
        ctx.drawImage(this.image, this.x, this.y, this.width, this.height);
      }
    }
    
    update() {
      this.x += this.speedX;
      this.y += this.speedY;
    }
    
    // 简单碰撞检测
    isColliding(other) {
      return this.x < other.x + other.width &&
             this.x + this.width > other.x &&
             this.y < other.y + other.height &&
             this.y + this.height > other.y;
    }
  }

  
  class Player extends Sprite {
    constructor(x, y) {
      super(x, y, 60, 60, resources.player);
      this.life = 100;
      this.upgradeLevel = 1;
      // 新增无敌状态属性
      this.invincible = false;
      this.invincibleTimer = 0; // 以帧为单位（例如 120 帧约2秒）
    }
  
    // 重写 update 方法，更新位置及无敌倒计时
    update() {
      super.update();
      // 边界检测：确保玩家不会移动出画布范围
    // 水平边界：不让 x 小于 0，也不让 x 超过 canvas 宽度减去玩家宽度
    if (this.x < 0) {
        this.x = 0;
      } else if (this.x > canvas.width - this.width) {
        this.x = canvas.width - this.width;
      }
  
      // 垂直边界：不让 y 小于 0，也不让 y 超过 canvas 高度减去玩家高度
      if (this.y < 0) {
        this.y = 0;
      } else if (this.y > canvas.height - this.height) {
        this.y = canvas.height - this.height;
      }
      if (this.invincible) {
        this.invincibleTimer--;
        if (this.invincibleTimer <= 0) {
          this.invincible = false;
          this.invincibleTimer = 0;
        }
      }
    }
  
    // 重写 draw 方法，如果无敌则闪烁显示
    draw() {
      if (!this.alive) return;
      if (this.invincible) {
        // 每 5 帧闪烁一次，控制闪烁效果
        if (Math.floor(this.invincibleTimer / 5) % 2 === 0) {
          ctx.drawImage(this.image, this.x, this.y, this.width, this.height);
        }
        // 否则本帧不绘制（即“闪烁”）
      } else {
        ctx.drawImage(this.image, this.x, this.y, this.width, this.height);
      }
    }


  
    // 玩家发射子弹（原有代码不变）
    shoot() {
      audio.shoot.currentTime = 0;
      audio.shoot.play();
      let bullets = [];
      if (this.upgradeLevel === 1) {
        bullets.push(new Bullet(this.x + this.width / 2 -10, this.y-15));
      } else if (this.upgradeLevel === 2) {
        bullets.push(new Bullet(this.x + this.width / 2 - 15, this.y-15));
        bullets.push(new Bullet(this.x + this.width / 2 + 5, this.y-15));
      } else {
        bullets.push(new Bullet(this.x + this.width / 2 - 20, this.y-15));
        bullets.push(new Bullet(this.x + this.width / 2 - 5, this.y-15));
        bullets.push(new Bullet(this.x + this.width / 2 + 10, this.y-15));
      }
      return bullets;
    }
  
    // 接收道具效果（原有代码不变）
    applyItem(item) {
      if (item.type === 'life') {
        this.life = Math.min(this.life + 20, 100);
      } else if (item.type === 'upgrade') {
        this.upgradeLevel = Math.min(this.upgradeLevel + 1, 3);
      }
    }
  }
  

  class Bullet extends Sprite {
    constructor(x, y) {
      super(x, y, 20, 30, resources.player_bullet);
      this.speedY = -5; // 子弹向上飞
    }
    
    update() {
      this.y += this.speedY;
      // 子弹超出画布范围后设置为死亡
      if (this.y < 0) this.alive = false;
    }
  }
  
  let nextBossScore = 500;  // 下一个生成 boss 的分数


  class Enemy extends Sprite {
    constructor(x, y, type = 'normal') {
      // 如果是 boss，用 boss 图片和更大尺寸；否则用普通敌机图片和尺寸
      let image, width, height;
      if (type === 'boss') {
        image = resources.boss;
        width = 100;   // boss 更大
        height = 100;  // boss 更大
      } else {
        image = resources.enemy;
        width = 50;
        height = 50;
      }
      
      // 调用父类构造函数
      super(x, y, width, height, image);
      this.type = type;
      this.baseY = y;  // 用于正弦波运动
      this.counter = 0;
      // 设置生命值，boss 血量较高
      this.life = (type === 'boss') ? 800 : 20;
      // 普通敌机（或其他类型）可发射子弹
      this.canShoot = (type === 'normal' || type === 'advanced');
      this.shootInterval = Math.random() * 100 + 100;
    }
    
    update(player) {
      if (this.type === 'normal') {
        // 简单直线下落
        this.speedY = 2;
      } else if (this.type === 'sine') {
        // 正弦波运动
        this.speedY = 2;
        this.x += Math.sin(this.counter * 0.05) * 2;
        this.counter++;
      } else if (this.type === 'tracking') {
        // 追踪玩家
        let dx = player.x - this.x;
        let dy = player.y - this.y;
        let dist = Math.hypot(dx, dy);
        if (dist > 0) {
          this.speedX = (dx / dist) * 2;
          this.speedY = (dy / dist) * 2;
        }
      } else if (this.type === 'boss') {
        // BOSS 特殊移动模式：左右摇摆
        this.speedX = Math.sin(this.counter * 0.03) * 3;
        this.speedY = 1;
        this.counter++;
      }
      
      super.update();
      
      // 敌机若超出下边界则标记为死亡
      if (this.y > canvas.height) {
        this.alive = false;
      }
    }
    
    tryShoot() {
      if (this.canShoot && (this.counter % Math.floor(this.shootInterval) === 0)) {
        // 发射朝下的子弹
        return new EnemyBullet(this.x + this.width / 2 - 5, this.y + this.height);
      }
      return null;
    }
  }
  
  
  class EnemyBullet extends Sprite {
    constructor(x, y) {
      super(x, y, 30, 30, resources.enemy_bullet);
      this.speedY = 4;
    }
    
    update() {
      this.y += this.speedY;
      if (this.y > canvas.height) this.alive = false;
    }
  }
  

  class Item extends Sprite {
    constructor(x, y, type) {
      // 根据类型选择对应的图片
      let image;
      if (type === 'life') {
        image = resources.item_life;
      } else if (type === 'upgrade') {
        image = resources.item_upgrade;
      } else {
        // 如果类型不匹配，则默认使用 explosion 图片
        image = resources.explosion;
      }
      
      // 调用父类构造函数，传入对应图片
      super(x, y, 50, 40, image);
      
      this.type = type; // 'life' 或 'upgrade'
      this.speedY = 2;
    }
    
    update() {
      this.y += this.speedY;
      if (this.y > canvas.height) this.alive = false;
    }
  }
  

  // 玩家实例
let player = new Player(canvas.width/2 - 30, canvas.height - 80);

// 子弹和敌机列表
let bullets = [];
let enemyBullets = [];
let enemies = [];
let items = [];

// 控制子弹发射节奏
let shootTimer = 0;

// 主游戏循环
function gameLoop() {
  if (!gameStarted) {
    // 绘制开始界面的背景图
    ctx.drawImage(resources.startBackground, 0, 0, canvas.width, canvas.height);
    
    // 在背景上覆盖文字提示
    ctx.fillStyle = 'rgba(0,0,0,0.5)';  // 可选：半透明遮罩
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    ctx.fillStyle = '#fff';
    ctx.font = '40px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('点击开始游戏', canvas.width / 2, canvas.height / 2);
    
    requestAnimationFrame(gameLoop);
    return;
  }
  
  if (paused) {
    requestAnimationFrame(gameLoop);
    return;
  }
  
  // 清除画布
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  
  // 更新和绘制玩家
  player.update();
    player.draw();
  
  // 处理子弹
  bullets.forEach(bullet => {
    bullet.update();
    bullet.draw();
  });
  bullets = bullets.filter(b => b.alive);
  
  // 处理敌机
  enemies.forEach(enemy => {
    enemy.update(player);
    enemy.draw();
    // 敌机发射子弹
    let eb = enemy.tryShoot();
    if (eb) enemyBullets.push(eb);
  });
  enemies = enemies.filter(e => e.alive);
  
  // 处理敌机子弹
  enemyBullets.forEach(bullet => {
    bullet.update();
    bullet.draw();
  });
  enemyBullets = enemyBullets.filter(b => b.alive);
  
  // 处理道具
  items.forEach(item => {
    item.update();
    item.draw();
  });
  items = items.filter(i => i.alive);
  
  // 检测碰撞（子弹与敌机、敌机子弹与玩家、玩家与道具）
  checkCollisions();
  
  // 更新 UI（生命条、分数等）
  drawUI();
  
  // 每隔一定时间发射玩家子弹
  shootTimer++;
  if (shootTimer % 15 === 0) {
    bullets.push(...player.shoot());
  }
  
  // 随机生成敌机
  if (Math.random() < 0.02) {
    let enemyType = ['normal', 'sine', 'tracking'][Math.floor(Math.random()*3)];
    let x = Math.random() * (canvas.width - 50);
    enemies.push(new Enemy(x, -50, enemyType));
  }
  
  // 特定分数生成BOSS
  if (score >= nextBossScore && !enemies.some(e => e.type === 'boss')) {
    // 使 boss 在屏幕正中，y 设为 -100（初始在屏幕上方），随后下降进入屏幕
    enemies.push(new Enemy(canvas.width/2 - 50, -100, 'boss'));
    nextBossScore += 500;
  }
  
  
  // 生成道具的逻辑（例如敌机爆炸掉落道具）
  // 可根据概率在敌机爆炸时添加道具
  
  if (!gameOver) {
    requestAnimationFrame(gameLoop);
  } else {
    showGameOver();
  }
}


// 开始背景音乐
const musicButton = document.getElementById('toggleMusic');
let musicPlaying = true; // 记录音乐是否正在播放
// audio.bgm.play();
musicButton.addEventListener('click', () => {
    if (musicPlaying) {
        audio.bgm.pause();
        musicButton.textContent = '🎵 开启音乐';
    } else {
        audio.bgm.play();
        musicButton.textContent = '🎵 关闭音乐';
    }
    musicPlaying = !musicPlaying;
});


// 开始游戏循环
gameLoop();


function checkCollisions() {
    // 子弹与敌机（原有逻辑）
    bullets.forEach(bullet => {
      enemies.forEach(enemy => {
        if (bullet.alive && enemy.alive && bullet.isColliding(enemy)) {
          bullet.alive = false;
          enemy.life -= 10;
          if (enemy.life <= 0) {
            enemy.alive = false;
            score += (enemy.type === 'boss') ? 200 : 50;
            if (enemy.type === 'boss') {
              audio.enemyExplosion.play();
            } else {
              audio.enemyExplosion.play();
            }
            // 敌机爆炸后有几率掉落道具
            if (Math.random() < 0.3) {
              let type = (Math.random() < 0.5) ? 'life' : 'upgrade';
              items.push(new Item(enemy.x, enemy.y, type));
            }
          }
        }
      });
    });
  
    // 敌机子弹与玩家（修改后的逻辑，增加无敌判断）
    enemyBullets.forEach(bullet => {
      if (bullet.alive && player.alive && bullet.isColliding(player)) {
        if (!player.invincible) {
          bullet.alive = false;
          player.life -= 10;
          if (player.life <= 0) {
            player.alive = false;
            gameOver = true;
            audio.playerExplosion.play();
          } else {
            player.invincible = true;
            player.invincibleTimer = 120;
          }
        }
      }
    });
  
    // 敌机本体与玩家的直接碰撞检测
    enemies.forEach(enemy => {
      if (enemy.alive && player.alive && enemy.isColliding(player)) {
        if (!player.invincible) {
          enemy.alive = false;  // 碰撞后敌机也消失（可根据需要调整）
          player.life -= 20;    // 调整碰撞伤害
          if (player.life <= 0) {
            player.alive = false;
            gameOver = true;
            audio.playerExplosion.play();
          } else {
            player.invincible = true;
            player.invincibleTimer = 120;
          }
        }
      }
    });
  
    // 玩家与道具（原有逻辑）
    items.forEach(item => {
      if (item.alive && player.alive && item.isColliding(player)) {
        item.alive = false;
        player.applyItem(item);
      }
    });
  }
  
  canvas.addEventListener('click', function startHandler(e) {
    if (!gameStarted) {
      gameStarted = true;
      // 可选：让背景音乐播放
      audio.bgm.play();
      // 移除开始监听（如果不需要重复点击）
      canvas.removeEventListener('click', startHandler);
    }
  });
  canvas.addEventListener('touchend', function startHandler(e) {
    if (!gameStarted) {
      gameStarted = true;
      // 可选：让背景音乐播放
      audio.bgm.play();
      // 移除开始监听（如果不需要重复点击）
      canvas.removeEventListener('touchend', startHandler);
    }
  });

  function drawUI() {
    // 血条
    ctx.fillStyle = 'red';
    ctx.fillRect(20, 20, 100, 10);
    ctx.fillStyle = 'green';
    ctx.fillRect(20, 20, player.life, 10);
    
    // 分数
    ctx.fillStyle = '#fff';
    ctx.font = '20px Arial';
    ctx.fillText('Score: ' + score, canvas.width - 120, 30);
    
    // 高分
    ctx.fillText('High Score: ' + highScore, canvas.width - 180, 60);
    
    // 暂停提示
    if (paused) {
      ctx.fillStyle = 'rgba(0,0,0,0.5)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = '#fff';
      ctx.font = '40px Arial';
      ctx.fillText('Paused', canvas.width/2 - 70, canvas.height/2);
    }
  }
  
  function showGameOver() {
    // 更新高分
    if (score > highScore) {
      highScore = score;
      localStorage.setItem('highScore', highScore);
    }
    ctx.fillStyle = 'rgba(0,0,0,0.7)';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = '#fff';
  ctx.font = '40px Arial';
  ctx.fillText('Game Over', canvas.width/2 - 100, canvas.height/2 - 20);
  ctx.font = '20px Arial';
  ctx.fillText('点击或触摸屏幕重新开始', canvas.width/2 - 70, canvas.height/2 + 20);
  
  // 监听点击和触摸重启游戏
  canvas.addEventListener('click', restartGame);
  canvas.addEventListener('touchend', restartGame);
  }
  
  function restartGame() {
    // 重置变量
    gameOver = false;
    player = new Player(canvas.width/2 - 30, canvas.height - 80);
    bullets = [];
    enemyBullets = [];
    enemies = [];
    items = [];
    score = 0;
    shootTimer = 0;

    canvas.removeEventListener('click', restartGame);
    canvas.removeEventListener('touchend', restartGame);

    // audio.bgm.currentTime = 0;
    // audio.bgm.play();
    gameLoop();

  }
  
  // 键盘控制（左右移动）
document.addEventListener('keydown', function(e) {
  // 左右移动（支持方向键和 A/D 键）
  if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
    player.speedX = -5;
  } else if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
    player.speedX = 5;
  }
  // 上下移动（支持方向键和 W/S 键）
  if (e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') {
    player.speedY = -5;
  } else if (e.key === 'ArrowDown' || e.key === 's' || e.key === 'S') {
    player.speedY = 5;
  }
  // 暂停
  if (e.key === 'p' || e.key === 'P') {
    paused = !paused;
  }
});

document.addEventListener('keyup', function(e) {
  // 当左右键松开时，将水平速度设为0
  if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A' ||
      e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
    player.speedX = 0;
  }
  // 当上下键松开时，将垂直速度设为0
  if (e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W' ||
      e.key === 'ArrowDown' || e.key === 's' || e.key === 'S') {
    player.speedY = 0;
  }
});

  
  
  // 触摸控制（简单示例，触摸屏左右滑动移动玩家）
  canvas.addEventListener('touchstart', handleTouch, false);
  canvas.addEventListener('touchmove', handleTouch, false);
  
  function handleTouch(e) {
    e.preventDefault();
    const touch = e.touches[0];
    const rect = canvas.getBoundingClientRect();
    const touchX = touch.clientX - rect.left;
    const touchY = touch.clientY - rect.top;
    // 将玩家中心设定为触摸点
    player.x = touchX - player.width / 2;
    player.y = touchY - player.height / 2;
  }
  
