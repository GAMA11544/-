const game = document.getElementById("game");
const panda = document.getElementById("panda");
const scoreDisplay = document.getElementById("score");
const gameOverDiv = document.getElementById("gameOver");
const restartBtn = document.getElementById("restartBtn");

const groundLevel = 0;
let score = 0;
let bambooSpeed = 1;
let bambooInterval = 2500;
let bambooTimer;
let bambooElements = [];
let isJumping = false;
let jumpHeight = 250;
let jumpDuration = 700;

let jumpSound = document.getElementById("jumpSound");
let failSound = document.getElementById("failSound");

let animationId;
let isGameOver = false;

function createBamboo() {
  if (isGameOver) return;

  if (score >= 50) {
    // إنشاء عمودين بامبو ملتصقين
    const bamboo1 = document.createElement("div");
    bamboo1.classList.add("bamboo");
    bamboo1.style.bottom = groundLevel - 5 + "px";
    bamboo1.style.left = window.innerWidth + "px";
    game.appendChild(bamboo1);
    bambooElements.push(bamboo1);

    const bamboo2 = document.createElement("div");
    bamboo2.classList.add("bamboo");
    bamboo2.style.bottom = groundLevel - 5 + "px";
    bamboo2.style.left = window.innerWidth + 40 + "px"; // 40 بكسل إلى اليمين
    game.appendChild(bamboo2);
    bambooElements.push(bamboo2);
  } else {
    // عمود بامبو واحد فقط
    const bamboo = document.createElement("div");
    bamboo.classList.add("bamboo");
    bamboo.style.bottom = groundLevel - 5 + "px";
    bamboo.style.left = window.innerWidth + "px";
    game.appendChild(bamboo);
    bambooElements.push(bamboo);
  }
}

function moveBamboo() {
  if (isGameOver) return; // إيقاف الحركة بعد الخسارة

  for (let i = 0; i < bambooElements.length; i++) {
    let bamboo = bambooElements[i];
    let currentLeft = parseFloat(bamboo.style.left);
    currentLeft -= bambooSpeed;
    if (currentLeft < -140) {
      bamboo.remove();
      bambooElements.splice(i, 1);
      i--;
      score++;
      scoreDisplay.textContent = "النقاط: " + score;

      if (score % 10 === 0) {
        bambooSpeed += 0.5;
        if (bambooInterval > 800) bambooInterval -= 100;
        clearInterval(bambooTimer);
        bambooTimer = setInterval(createBamboo, bambooInterval);
      }
    } else {
      bamboo.style.left = currentLeft + "px";

      if (!isGameOver && collision(panda, bamboo)) {
        endGame();
      }
    }
  }
}

function collision(p1, p2) {
  const rect1 = p1.getBoundingClientRect();
  const rect2 = p2.getBoundingClientRect();
  return !(
    rect1.top > rect2.bottom ||
    rect1.bottom < rect2.top ||
    rect1.right < rect2.left ||
    rect1.left > rect2.right
  );
}

function jump() {
  if (isGameOver) return; // لا تقفز إذا انتهت اللعبة

  const pandaBottomValue = parseFloat(window.getComputedStyle(panda).bottom);

  if (pandaBottomValue <= groundLevel + 1 && !isJumping) {
    isJumping = true;
    let start = null;
    let initialBottom = pandaBottomValue;

    // تشغيل صوت القفز فوراً
    jumpSound.pause();
    jumpSound.currentTime = 0;
    jumpSound.play().catch(() => {});

    function animateJump(timestamp) {
      if (!start) start = timestamp;
      let elapsed = timestamp - start;

      if (elapsed < jumpDuration / 2) {
        let newBottom =
          initialBottom + jumpHeight * (elapsed / (jumpDuration / 2));
        panda.style.bottom = newBottom + "px";
      } else if (elapsed < jumpDuration) {
        let newBottom =
          initialBottom +
          jumpHeight -
          jumpHeight * ((elapsed - jumpDuration / 2) / (jumpDuration / 2));
        panda.style.bottom = newBottom + "px";
      } else {
        panda.style.bottom = initialBottom + "px";
        isJumping = false;
        return;
      }
      requestAnimationFrame(animateJump);
    }
    requestAnimationFrame(animateJump);
  }
}

function endGame() {
  isGameOver = true;
  clearInterval(bambooTimer);
  cancelAnimationFrame(animationId);

  failSound.currentTime = 0;
  failSound.play();

  failSound.onended = () => {
    gameOverDiv.style.display = "block";
  };
}

function restartGame() {
  bambooElements.forEach((b) => b.remove());
  bambooElements = [];
  score = 0;
  scoreDisplay.textContent = "النقاط: 0";
  bambooSpeed = 3;
  bambooInterval = 2000;
  panda.style.bottom = groundLevel + "px";
  isJumping = false;
  isGameOver = false;
  gameOverDiv.style.display = "none";
  bambooTimer = setInterval(createBamboo, bambooInterval);
  animationId = requestAnimationFrame(gameLoop);
}

function gameLoop() {
  moveBamboo();
  animationId = requestAnimationFrame(gameLoop);
}

restartBtn.addEventListener("click", () => {
  restartGame();
});

window.addEventListener(
  "touchstart",
  (e) => {
    // لا تمنع الافتراضي إذا ضغطت على زر إعادة المحاولة
    if (e.target === restartBtn) return;
    e.preventDefault();

    const pandaBottomValue = parseFloat(window.getComputedStyle(panda).bottom);
    if (pandaBottomValue <= groundLevel + 1 && !isJumping && !isGameOver) {
      jump();
    }
  },
  { passive: false }
);

window.addEventListener("mousedown", (e) => {
  jump();
});

restartGame();
