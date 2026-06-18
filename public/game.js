(() => {
  const rows = 5;
  const cols = 9;

  const plantList = [
    { id: "sprout", name: "豆苗", cost: 50, hp: 130, kind: "shooter", cooldown: 1180, damage: 28, speed: 330, note: "稳定射击" },
    { id: "sunbloom", name: "日葵", cost: 25, hp: 95, kind: "sun", sunEvery: 6900, note: "生产阳光" },
    { id: "bark", name: "木盾", cost: 75, hp: 500, kind: "wall", note: "高耐久" },
    { id: "frost", name: "冰芽", cost: 90, hp: 120, kind: "shooter", cooldown: 1550, damage: 18, speed: 300, slow: 0.48, slowTime: 2600, note: "减速敌人" },
    { id: "twin", name: "双豆", cost: 125, hp: 130, kind: "shooter", cooldown: 1500, damage: 24, speed: 340, shots: 2, note: "连射两发" },
    { id: "pepper", name: "爆椒", cost: 150, hp: 1, kind: "burst", damage: 260, note: "横排爆发" }
  ];

  const plants = Object.fromEntries(plantList.map((plant) => [plant.id, plant]));

  const zombieTypes = {
    walker: { name: "普通尸", hp: 125, speed: 16, bite: 31, score: 10, className: "walker" },
    runner: { name: "疾行尸", hp: 90, speed: 30, bite: 24, score: 13, className: "runner" },
    bucket: { name: "铁桶尸", hp: 285, speed: 13, bite: 34, score: 22, className: "bucket" },
    brute: { name: "巨块尸", hp: 430, speed: 9, bite: 48, score: 34, className: "brute" },
    shade: { name: "影步尸", hp: 150, speed: 22, bite: 30, score: 26, className: "shade", dodge: 0.28 }
  };

  const levels = [
    { id: "yard", name: "后院晨光", startSun: 175, waves: 4, sunDrop: 7200, mix: ["walker", "walker", "runner"] },
    { id: "lane", name: "黄昏小径", startSun: 150, waves: 5, sunDrop: 7900, mix: ["walker", "runner", "runner", "bucket"] },
    { id: "fog", name: "雾色花坛", startSun: 135, waves: 6, sunDrop: 8600, mix: ["walker", "runner", "bucket", "shade", "shade"] },
    { id: "gate", name: "终夜大门", startSun: 160, waves: 7, sunDrop: 9300, mix: ["runner", "bucket", "bucket", "shade", "brute"] }
  ];

  const board = document.querySelector("#board");
  const entitiesLayer = document.querySelector("#entities");
  const projectileLayer = document.querySelector("#projectiles");
  const floatingLayer = document.querySelector("#floating");
  const deck = document.querySelector("#deck");
  const levelTabs = document.querySelector("#levelTabs");
  const sunCount = document.querySelector("#sunCount");
  const waveCount = document.querySelector("#waveCount");
  const levelName = document.querySelector("#levelName");
  const scoreCount = document.querySelector("#scoreCount");
  const statusText = document.querySelector("#statusText");
  const overlay = document.querySelector("#overlay");
  const overlayTitle = document.querySelector("#overlayTitle");
  const overlayText = document.querySelector("#overlayText");
  const startBtn = document.querySelector("#startBtn");
  const pauseBtn = document.querySelector("#pauseBtn");
  const restartBtn = document.querySelector("#restartBtn");

  let selectedPlant = "sprout";
  let selectedLevel = 0;
  let grid = [];
  let projectiles = [];
  let zombies = [];
  let suns = [];
  let sun = levels[selectedLevel].startSun;
  let currentWave = 1;
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

  function buildDeck() {
    deck.innerHTML = "";
    plantList.forEach((plant) => {
      const card = document.createElement("button");
      card.className = "plant-card";
      card.type = "button";
      card.dataset.plant = plant.id;
      card.innerHTML = `
        <span class="plant-art ${plant.id}-art" aria-hidden="true"></span>
        <span class="plant-name">${plant.name}</span>
        <span class="plant-note">${plant.note}</span>
        <span class="plant-cost">${plant.cost}</span>
      `;
      card.addEventListener("click", () => {
        selectedPlant = plant.id;
        updateHud();
      });
      deck.appendChild(card);
    });
  }

  function buildLevels() {
    levelTabs.innerHTML = "";
    levels.forEach((level, index) => {
      const button = document.createElement("button");
      button.className = "level-tab";
      button.type = "button";
      button.textContent = level.name;
      button.addEventListener("click", () => {
        if (running && !gameOver) return;
        selectedLevel = index;
        resetState();
      });
      levelTabs.appendChild(button);
    });
  }

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
    const level = levels[selectedLevel];
    grid = Array.from({ length: rows }, () => Array(cols).fill(null));
    projectiles = [];
    zombies = [];
    suns = [];
    sun = level.startSun;
    currentWave = 1;
    score = 0;
    running = false;
    paused = false;
    gameOver = false;
    lastTime = 0;
    spawnTimer = 0;
    spawnBudget = waveSize();
    waveRest = 0;
    skySunTimer = 2300;
    nextId = 1;
    pauseBtn.querySelector("span").textContent = "||";
    entitiesLayer.innerHTML = "";
    projectileLayer.innerHTML = "";
    floatingLayer.innerHTML = "";
    updateHud();
    setOverlay("选择关卡并开始", `${level.name}：共 ${level.waves} 波，守住左侧防线。`, "开始", false);
  }

  function updateHud() {
    const level = levels[selectedLevel];
    sunCount.textContent = Math.floor(sun);
    waveCount.textContent = `${currentWave}/${level.waves}`;
    levelName.textContent = level.name;
    scoreCount.textContent = score;
    [...deck.querySelectorAll(".plant-card")].forEach((card) => {
      const enough = sun >= plants[card.dataset.plant].cost;
      card.classList.toggle("disabled", !enough);
      card.classList.toggle("selected", card.dataset.plant === selectedPlant);
    });
    [...levelTabs.querySelectorAll(".level-tab")].forEach((tab, index) => {
      tab.classList.toggle("selected", index === selectedLevel);
      tab.disabled = running && !gameOver;
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
      denyCell(cell);
      return;
    }

    sun -= data.cost;
    const plant = {
      id: nextId += 1,
      type: selectedPlant,
      row,
      col,
      hp: data.hp,
      shootTimer: 520,
      sunTimer: 1600 + Math.random() * 900,
      burstTimer: 300,
      el: makePlantEl(selectedPlant)
    };
    const pos = cellCenter(row, col);
    plant.el.style.left = `${pos.x}px`;
    plant.el.style.top = `${pos.y + 2}px`;
    entitiesLayer.appendChild(plant.el);
    grid[row][col] = plant;

    if (data.kind === "burst") {
      plant.el.classList.add("arming");
      setTimeout(() => explodePepper(plant), 260);
    }
    updateHud();
  }

  function denyCell(cell) {
    cell.classList.remove("denied");
    void cell.offsetWidth;
    cell.classList.add("denied");
  }

  function makePlantEl(type) {
    const el = document.createElement("div");
    el.className = `plant ${type}`;
    el.innerHTML = '<span class="head"></span><span class="stem"></span><span class="spark"></span>';
    return el;
  }

  function explodePepper(plant) {
    if (!grid[plant.row] || grid[plant.row][plant.col] !== plant) return;
    const size = cellSize();
    const pos = cellCenter(plant.row, plant.col);
    pop("BOOM", pos.x, pos.y - 8, "boom-pop");
    zombies.forEach((zombie) => {
      const nearRow = Math.abs(zombie.row - plant.row) <= 1;
      if (nearRow) {
        zombie.hp -= plants.pepper.damage * (zombie.row === plant.row ? 1 : 0.55);
        zombie.burn = 900;
      }
    });
    const flame = document.createElement("div");
    flame.className = "flame-line";
    flame.style.left = `${size.width * 0.1}px`;
    flame.style.top = `${pos.y}px`;
    flame.style.width = `${size.width * 8.8}px`;
    floatingLayer.appendChild(flame);
    setTimeout(() => flame.remove(), 520);
    plant.el.remove();
    grid[plant.row][plant.col] = null;
  }

  function makeZombie(row, typeId) {
    const size = cellSize();
    const type = zombieTypes[typeId];
    const waveBoost = currentWave - 1 + selectedLevel * 0.8;
    const zombie = {
      id: nextId += 1,
      type: typeId,
      row,
      x: boardRect.width + size.width * 0.45,
      y: row * size.height + size.height / 2 + 2,
      hp: type.hp + waveBoost * 22,
      maxHp: type.hp + waveBoost * 22,
      baseSpeed: type.speed + selectedLevel * 1.2,
      bite: type.bite,
      score: type.score,
      slowTimer: 0,
      slowFactor: 1,
      biteTimer: 0,
      burn: 0,
      dodge: type.dodge || 0,
      el: document.createElement("div")
    };
    zombie.el.className = `zombie ${type.className}`;
    zombie.el.innerHTML = '<span class="head"></span><span class="body"></span><span class="gear"></span><span class="feet"></span><span class="hpbar"></span>';
    entitiesLayer.appendChild(zombie.el);
    zombies.push(zombie);
  }

  function makeProjectile(plant, offset = 0) {
    const data = plants[plant.type];
    const pos = cellCenter(plant.row, plant.col);
    const el = document.createElement("div");
    el.className = `pea ${plant.type === "frost" ? "frost-pea" : ""}`;
    projectileLayer.appendChild(el);
    projectiles.push({
      row: plant.row,
      x: pos.x + 18,
      y: pos.y - 9 + offset,
      speed: data.speed,
      damage: data.damage,
      slow: data.slow || 1,
      slowTime: data.slowTime || 0,
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

  function pop(text, x, y, className = "") {
    const el = document.createElement("div");
    el.className = `hit-pop ${className}`;
    el.textContent = text;
    el.style.left = `${x}px`;
    el.style.top = `${y}px`;
    floatingLayer.appendChild(el);
    setTimeout(() => el.remove(), 650);
  }

  function updatePlants(dt) {
    for (const row of grid) {
      for (const plant of row) {
        if (!plant) continue;
        const data = plants[plant.type];
        if (data.kind === "shooter") {
          plant.shootTimer -= dt;
          const size = cellSize();
          const enemyAhead = zombies.some((zombie) => zombie.row === plant.row && zombie.x > plant.col * size.width);
          if (plant.shootTimer <= 0 && enemyAhead) {
            if (data.shots === 2) {
              makeProjectile(plant, -8);
              makeProjectile(plant, 8);
            } else {
              makeProjectile(plant);
            }
            plant.shootTimer = data.cooldown;
          }
        }
        if (data.kind === "sun") {
          plant.sunTimer -= dt;
          if (plant.sunTimer <= 0) {
            const pos = cellCenter(plant.row, plant.col);
            makeSun(pos.x + 8, pos.y - 34);
            plant.sunTimer = data.sunEvery;
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
        const dodged = hit.dodge && Math.random() < hit.dodge;
        if (!dodged) {
          hit.hp -= projectile.damage;
          if (projectile.slowTime) {
            hit.slowFactor = projectile.slow;
            hit.slowTimer = projectile.slowTime;
            hit.el.classList.add("slowed");
          }
        } else {
          pop("闪避", projectile.x, projectile.y - 10);
        }
        projectile.dead = true;
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
      zombie.slowTimer -= dt;
      zombie.burn -= dt;
      if (zombie.slowTimer <= 0) {
        zombie.slowFactor = 1;
        zombie.el.classList.remove("slowed");
      }
      if (zombie.burn > 0) {
        zombie.hp -= 18 * dt / 1000;
        zombie.el.classList.add("burning");
      } else {
        zombie.el.classList.remove("burning");
      }

      const col = Math.floor((zombie.x - size.width * 0.24) / size.width);
      const plant = col >= 0 && col < cols ? grid[zombie.row][col] : null;
      if (plant) {
        zombie.biteTimer -= dt;
        if (zombie.biteTimer <= 0) {
          plant.hp -= zombie.bite;
          zombie.biteTimer = 640;
          plant.el.style.filter = `brightness(${Math.max(0.55, plant.hp / plants[plant.type].hp)})`;
          if (plant.hp <= 0) {
            plant.el.remove();
            grid[plant.row][plant.col] = null;
          }
        }
      } else {
        zombie.x -= zombie.baseSpeed * zombie.slowFactor * dt / 1000;
      }

      if (zombie.hp <= 0) {
        zombie.dead = true;
        score += zombie.score;
        if (Math.random() < 0.25 + selectedLevel * 0.035) makeSun(zombie.x, zombie.y - 20);
      }

      if (zombie.x < -20) loseGame();

      const health = Math.max(0, zombie.hp / zombie.maxHp);
      zombie.el.style.left = `${zombie.x}px`;
      zombie.el.style.top = `${zombie.y}px`;
      zombie.el.querySelector(".hpbar").style.transform = `scaleX(${health})`;
      zombie.el.style.opacity = `${Math.max(0.45, health)}`;
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
        token.y = Math.min(token.targetY, token.y + 54 * dt / 1000);
      }
      token.el.style.left = `${token.x}px`;
      token.el.style.top = `${token.y}px`;
      token.el.style.opacity = `${Math.min(1, token.life / 1400)}`;
      if (token.life <= 0) token.dead = true;
    });
    suns = suns.filter((token) => {
      if (token.dead) token.el.remove();
      return !token.dead;
    });
  }

  function waveSize() {
    return 3 + currentWave * 2 + selectedLevel * 2;
  }

  function pickZombieType() {
    const level = levels[selectedLevel];
    const mix = [...level.mix];
    if (currentWave >= 3) mix.push("bucket");
    if (currentWave >= 4 && selectedLevel >= 1) mix.push("runner", "shade");
    if (currentWave >= 5 && selectedLevel >= 2) mix.push("brute");
    return mix[Math.floor(Math.random() * mix.length)];
  }

  function updateSpawning(dt) {
    const level = levels[selectedLevel];
    skySunTimer -= dt;
    if (skySunTimer <= 0) {
      const size = cellSize();
      makeSun(size.width * (1 + Math.random() * 6.5), size.height * (0.55 + Math.random() * 3.9), true);
      skySunTimer = level.sunDrop + Math.random() * 3200;
    }

    if (spawnBudget > 0) {
      spawnTimer -= dt;
      if (spawnTimer <= 0) {
        const burst = currentWave === level.waves && Math.random() < 0.35 ? 2 : 1;
        for (let i = 0; i < burst && spawnBudget > 0; i += 1) {
          makeZombie(Math.floor(Math.random() * rows), pickZombieType());
          spawnBudget -= 1;
        }
        spawnTimer = Math.max(680, 2300 - currentWave * 170 - selectedLevel * 130) + Math.random() * 900;
      }
    } else if (zombies.length === 0) {
      waveRest += dt;
      if (waveRest > 2100) {
        currentWave += 1;
        if (currentWave > level.waves) {
          winGame();
          return;
        }
        spawnBudget = waveSize();
        spawnTimer = 580;
        waveRest = 0;
        statusText.textContent = `第 ${currentWave} 波正在靠近`;
      }
    }
  }

  function loseGame() {
    if (gameOver) return;
    gameOver = true;
    running = false;
    statusText.textContent = "防线被突破";
    setOverlay("防线被突破", `得分 ${score}。换个关卡或调整卡组顺序再来。`, "重开", false);
    updateHud();
  }

  function winGame() {
    if (gameOver) return;
    gameOver = true;
    running = false;
    score += Math.floor(sun / 4) + selectedLevel * 35;
    updateHud();
    statusText.textContent = "花园守住了";
    setOverlay("花园守住了", `${levels[selectedLevel].name} 通关，最终得分 ${score}。`, "再来一局", false);
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
    if (running && paused && !gameOver) {
      paused = false;
      pauseBtn.querySelector("span").textContent = "||";
      setOverlay("", "", "", true);
      updateHud();
      return;
    }
    if (gameOver) resetState();
    running = true;
    paused = false;
    lastTime = 0;
    pauseBtn.querySelector("span").textContent = "||";
    setOverlay("", "", "", true);
    updateHud();
    requestAnimationFrame(tick);
  }

  startBtn.addEventListener("click", startGame);
  restartBtn.addEventListener("click", resetState);
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

  buildDeck();
  buildLevels();
  makeGrid();
  resetState();
})();
