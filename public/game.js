(() => {
  const rows = 5;
  const cols = 9;
  const plants = {
    sprout: { name: "豆苗", cost: 50, hp: 120, cooldown: 1200, damage: 28 },
    sunbloom: { name: "日葵", cost: 25, hp: 90, sunEvery: 7800 },
    bark: { name: "木盾", cost: 75, hp: 430 }
  };

  const board = document.querySelector("#board");
  const entitiesLayer = document.querySelector("#entities");
  const projectileLayer = document.querySelector("#projectiles");
  const floatingLayer = document.querySelector("#floating");
  const sunCount = document.querySelector("#sunCount");
  const waveCount = document.querySelector("#waveCount");
  const scoreCount = document.querySelector("#scoreCount");
  const statusText = document.querySelector("#statusText");
  const overlay = document.querySelector("#overlay");
  const overlayTitle = document.querySelector("#overlayTitle");
  const overlayText = document.querySelector("#overlayText");
  const startBtn = document.querySelector("#startBtn");
  const pauseBtn = document.querySelector("#pauseBtn");
  const restartBtn = document.querySelector("#restartBtn");
  const cards = [...document.querySelectorAll(".plant-card")];

  let selectedPlant = "sprout";
  let grid = [];
  let projectiles = [];
  let zombies = [];
  let suns = [];
  let sun = 120;
  let wave = 1;
  let score = 0;
  let running = false;
  let paused = false;
  let gameOver = false;
  let lastTime = 0;
  let spawnTimer = 0;
  let spawnBudget = 0;
  let waveRest = 0;
  let skySunTimer = 2800;
  let nextId = 1;
  let boardRect = null;

  function makeGrid() {
    board.innerHTML = "";
    for (let row = 0; row < rows; row += 1) {
      for (let col = 0; col < cols; col += 1) {
        const cell = document.createElement("button");
        cell.type = "button";
        cell.className = "cell";
        cell.dataset.row = row;
        cell.dataset.col = col;
        cell.setAttribute("aria-label", `${row + 1} 行 ${col + 1} 列`);
        cell.addEventListener("click", () => placePlant(row, col, cell));
        board.appendChild(cell);
      }
    }
  }

  function resetState() {
    grid = Array.from({ length: rows }, () => Array(cols).fill(null));
    projectiles = [];
    zombies = [];
    suns = [];
    sun = 120;
    wave = 1;
    score = 0;
    running = false;
    paused = false;
    gameOver = false;
    lastTime = 0;
    spawnTimer = 0;
    spawnBudget = 4;
    waveRest = 0;
    skySunTimer = 2500;
    nextId = 1;
    pauseBtn.querySelector("span").textContent = "||";
    entitiesLayer.innerHTML = "";
    projectileLayer.innerHTML = "";
    floatingLayer.innerHTML = "";
    updateHud();
    setOverlay("准备开始", "点击开始后，第一波会从右侧出现。", "开始", false);
  }

  function updateHud() {
    sunCount.textContent = Math.floor(sun);
    waveCount.textContent = wave;
    scoreCount.textContent = score;
    cards.forEach((card) => {
      const enough = sun >= plants[card.dataset.plant].cost;
      card.classList.toggle("disabled", !enough);
      card.classList.toggle("selected", card.dataset.plant === selectedPlant);
    });
    if (!gameOver) {
      statusText.textContent = paused ? "花园暂停中" : "守住夜幕前的花园";
    }
  }

  function setOverlay(title, text, buttonText, hide) {
    overlayTitle.textContent = title;
    overlayText.textContent = text;
    startBtn.textContent = buttonText;
    overlay.classList.toggle("hidden", hide);
  }

  function cellSize() {
    boardRect = board.getBoundingClientRect();
    return {
      width: boardRect.width / cols,
      height: boardRect.height / rows
    };
  }

  function cellCenter(row, col) {
    const size = cellSize();
    return {
      x: col * size.width + size.width / 2,
      y: row * size.height + size.height / 2
    };
  }

  function placePlant(row, col, cell) {
    if (!running || paused || gameOver) return;
    const data = plants[selectedPlant];
    if (grid[row][col] || sun < data.cost) {
      cell.classList.remove("denied");
      void cell.offsetWidth;
      cell.classList.add("denied");
      return;
    }

    sun -= data.cost;
    const plant = {
      id: nextId += 1,
      type: selectedPlant,
      row,
      col,
      hp: data.hp,
      shootTimer: 700,
      sunTimer: 1800 + Math.random() * 1200,
      el: makePlantEl(selectedPlant)
    };
    const pos = cellCenter(row, col);
    plant.el.style.left = `${pos.x}px`;
    plant.el.style.top = `${pos.y + 2}px`;
    entitiesLayer.appendChild(plant.el);
    grid[row][col] = plant;
    updateHud();
  }

  function makePlantEl(type) {
    const el = document.createElement("div");
    el.className = `plant ${type}`;
    el.innerHTML = '<span class="head"></span><span class="stem"></span>';
    return el;
  }

  function makeZombie(row) {
    const size = cellSize();
    const tough = wave >= 3 && Math.random() < 0.28;
    const zombie = {
      id: nextId += 1,
      row,
      x: boardRect.width + size.width * 0.45,
      y: row * size.height + size.height / 2 + 2,
      hp: tough ? 190 + wave * 18 : 120 + wave * 16,
      maxHp: tough ? 190 + wave * 18 : 120 + wave * 16,
      speed: tough ? 10 + wave * 1.1 : 16 + wave * 1.5,
      biteTimer: 0,
      el: document.createElement("div")
    };
    zombie.el.className = "zombie";
    zombie.el.innerHTML = '<span class="head"></span><span class="body"></span><span class="feet"></span>';
    if (tough) zombie.el.style.filter = "saturate(1.1) brightness(0.82)";
    entitiesLayer.appendChild(zombie.el);
    zombies.push(zombie);
  }

  function makeProjectile(row, x, y) {
    const el = document.createElement("div");
    el.className = "pea";
    projectileLayer.appendChild(el);
    projectiles.push({
      row,
      x,
      y,
      speed: 310,
      damage: plants.sprout.damage,
      el
    });
  }

  function makeSun(x, y, fromSky = false) {
    const el = document.createElement("button");
    el.type = "button";
    el.className = "sun-token";
    el.setAttribute("aria-label", "收集阳光");
    const token = {
      id: nextId += 1,
      x,
      y: fromSky ? -28 : y,
      targetY: y,
      life: 9000,
      el
    };
    el.style.left = `${token.x}px`;
    el.style.top = `${token.y}px`;
    el.addEventListener("click", () => collectSun(token));
    floatingLayer.appendChild(el);
    suns.push(token);
  }

  function collectSun(token) {
    if (!suns.includes(token)) return;
    sun += 25;
    token.el.remove();
    suns = suns.filter((item) => item !== token);
    pop("+25", token.x, token.y);
    updateHud();
  }

  function pop(text, x, y) {
    const el = document.createElement("div");
    el.className = "hit-pop";
    el.textContent = text;
    el.style.left = `${x}px`;
    el.style.top = `${y}px`;
    floatingLayer.appendChild(el);
    setTimeout(() => el.remove(), 620);
  }

  function updatePlants(dt) {
    for (const row of grid) {
      for (const plant of row) {
        if (!plant) continue;
        const size = cellSize();
        if (plant.type === "sprout") {
          plant.shootTimer -= dt;
          const enemyAhead = zombies.some((zombie) => zombie.row === plant.row && zombie.x > plant.col * size.width);
          if (plant.shootTimer <= 0 && enemyAhead) {
            const pos = cellCenter(plant.row, plant.col);
            makeProjectile(plant.row, pos.x + 18, pos.y - 8);
            plant.shootTimer = plants.sprout.cooldown;
          }
        }
        if (plant.type === "sunbloom") {
          plant.sunTimer -= dt;
          if (plant.sunTimer <= 0) {
            const pos = cellCenter(plant.row, plant.col);
            makeSun(pos.x + 8, pos.y - 34);
            plant.sunTimer = plants.sunbloom.sunEvery;
          }
        }
      }
    }
  }

  function updateProjectiles(dt) {
    const size = cellSize();
    projectiles.forEach((projectile) => {
      projectile.x += projectile.speed * dt / 1000;
      const hit = zombies.find((zombie) => (
        zombie.row === projectile.row
        && Math.abs(zombie.x - projectile.x) < size.width * 0.22
      ));
      if (hit) {
        hit.hp -= projectile.damage;
        projectile.dead = true;
        pop("*", projectile.x, projectile.y - 12);
      }
      if (projectile.x > boardRect.width + 40) projectile.dead = true;
      projectile.el.style.left = `${projectile.x}px`;
      projectile.el.style.top = `${projectile.y}px`;
    });
    projectiles = projectiles.filter((projectile) => {
      if (projectile.dead) projectile.el.remove();
      return !projectile.dead;
    });
  }

  function updateZombies(dt) {
    const size = cellSize();
    zombies.forEach((zombie) => {
      const col = Math.floor((zombie.x - size.width * 0.24) / size.width);
      const plant = col >= 0 && col < cols ? grid[zombie.row][col] : null;
      if (plant) {
        zombie.biteTimer -= dt;
        if (zombie.biteTimer <= 0) {
          plant.hp -= 32;
          zombie.biteTimer = 620;
          if (plant.hp <= 0) {
            plant.el.remove();
            grid[plant.row][plant.col] = null;
          }
        }
      } else {
        zombie.x -= zombie.speed * dt / 1000;
      }

      if (zombie.hp <= 0) {
        zombie.dead = true;
        score += 10;
        if (Math.random() < 0.34) makeSun(zombie.x, zombie.y - 20);
      }

      if (zombie.x < -20) {
        loseGame();
      }

      const health = Math.max(0.46, zombie.hp / zombie.maxHp);
      zombie.el.style.left = `${zombie.x}px`;
      zombie.el.style.top = `${zombie.y}px`;
      zombie.el.style.opacity = `${health}`;
    });

    zombies = zombies.filter((zombie) => {
      if (zombie.dead) zombie.el.remove();
      return !zombie.dead;
    });
  }

  function updateSuns(dt) {
    suns.forEach((token) => {
      token.life -= dt;
      if (token.y < token.targetY) {
        token.y = Math.min(token.targetY, token.y + 52 * dt / 1000);
      }
      token.el.style.left = `${token.x}px`;
      token.el.style.top = `${token.y}px`;
      token.el.style.opacity = `${Math.min(1, token.life / 1400)}`;
      if (token.life <= 0) {
        token.dead = true;
      }
    });
    suns = suns.filter((token) => {
      if (token.dead) token.el.remove();
      return !token.dead;
    });
  }

  function updateSpawning(dt) {
    skySunTimer -= dt;
    if (skySunTimer <= 0) {
      const size = cellSize();
      makeSun(size.width * (1 + Math.random() * 6.5), size.height * (0.6 + Math.random() * 3.8), true);
      skySunTimer = 7600 + Math.random() * 4800;
    }

    if (spawnBudget > 0) {
      spawnTimer -= dt;
      if (spawnTimer <= 0) {
        makeZombie(Math.floor(Math.random() * rows));
        spawnBudget -= 1;
        spawnTimer = Math.max(800, 2400 - wave * 180) + Math.random() * 1100;
      }
    } else if (zombies.length === 0) {
      waveRest += dt;
      if (waveRest > 2200) {
        wave += 1;
        if (wave > 5) {
          winGame();
          return;
        }
        spawnBudget = 3 + wave * 2;
        spawnTimer = 650;
        waveRest = 0;
        statusText.textContent = `第 ${wave} 波正在靠近`;
      }
    }
  }

  function loseGame() {
    if (gameOver) return;
    gameOver = true;
    running = false;
    statusText.textContent = "防线被突破";
    setOverlay("防线被突破", `得分 ${score}，再摆一局会更稳。`, "重开", false);
  }

  function winGame() {
    if (gameOver) return;
    gameOver = true;
    running = false;
    score += Math.floor(sun / 5);
    updateHud();
    statusText.textContent = "花园守住了";
    setOverlay("花园守住了", `最终得分 ${score}，这片草坪今晚安全。`, "再来一局", false);
  }

  function tick(time) {
    if (!running || gameOver) return;
    if (!lastTime) lastTime = time;
    const dt = Math.min(34, time - lastTime);
    lastTime = time;

    if (!paused) {
      cellSize();
      updatePlants(dt);
      updateProjectiles(dt);
      updateZombies(dt);
      updateSuns(dt);
      updateSpawning(dt);
      updateHud();
    }

    requestAnimationFrame(tick);
  }

  function startGame() {
    if (gameOver) {
      resetState();
    }
    running = true;
    paused = false;
    lastTime = 0;
    pauseBtn.querySelector("span").textContent = "||";
    setOverlay("", "", "", true);
    updateHud();
    requestAnimationFrame(tick);
  }

  cards.forEach((card) => {
    card.addEventListener("click", () => {
      selectedPlant = card.dataset.plant;
      updateHud();
    });
  });

  startBtn.addEventListener("click", startGame);
  restartBtn.addEventListener("click", () => {
    resetState();
  });
  pauseBtn.addEventListener("click", () => {
    if (!running || gameOver) return;
    paused = !paused;
    pauseBtn.querySelector("span").textContent = paused ? "▶" : "||";
    setOverlay("暂停", "花园会在你回来时继续。", "继续", !paused);
    updateHud();
  });

  window.addEventListener("resize", () => {
    for (const row of grid) {
      for (const plant of row) {
        if (!plant) continue;
        const pos = cellCenter(plant.row, plant.col);
        plant.el.style.left = `${pos.x}px`;
        plant.el.style.top = `${pos.y + 2}px`;
      }
    }
  });

  makeGrid();
  resetState();
})();
