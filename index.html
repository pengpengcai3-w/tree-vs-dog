(() => {
  const rows = 5;
  const cols = 9;

  const plantList = [
    { id: "sprout", name: "豆苗", cost: 50, hp: 135, kind: "shooter", cooldown: 1120, damage: 28, speed: 340, note: "稳定射击" },
    { id: "sunbloom", name: "日葵", cost: 25, hp: 95, kind: "sun", sunEvery: 6600, note: "生产阳光" },
    { id: "bark", name: "木盾", cost: 75, hp: 520, kind: "wall", note: "抗踩踏" },
    { id: "frost", name: "冰芽", cost: 90, hp: 120, kind: "shooter", cooldown: 1480, damage: 18, speed: 310, slow: 0.46, slowTime: 2600, note: "减速狗狗" },
    { id: "twin", name: "双豆", cost: 125, hp: 130, kind: "shooter", cooldown: 1450, damage: 24, speed: 345, shots: 2, note: "连射两发" },
    { id: "pepper", name: "爆椒", cost: 150, hp: 1, kind: "burst", damage: 270, note: "横排爆发" }
  ];

  const plants = Object.fromEntries(plantList.map((plant) => [plant.id, plant]));

  const dogTypes = {
    bichon: { name: "比熊", hp: 115, speed: 18, nibble: 26, score: 10, className: "bichon", bark: 660 },
    schnauzer: { name: "雪纳瑞", hp: 155, speed: 22, nibble: 30, score: 15, className: "schnauzer", bark: 560 },
    corgi: { name: "柯基", hp: 95, speed: 33, nibble: 23, score: 13, className: "corgi", bark: 760 },
    husky: { name: "哈士奇", hp: 210, speed: 20, nibble: 34, score: 24, className: "husky", dodge: 0.18, bark: 430 },
    mastiff: { name: "藏獒", hp: 470, speed: 9, nibble: 50, score: 38, className: "mastiff", bark: 290 }
  };

  const levels = [
    { id: "yard", name: "后院晨光", startSun: 180, waves: 4, sunDrop: 7000, mix: ["bichon", "bichon", "corgi"] },
    { id: "lane", name: "黄昏小径", startSun: 155, waves: 5, sunDrop: 7700, mix: ["bichon", "corgi", "schnauzer"] },
    { id: "fog", name: "雾色花坛", startSun: 140, waves: 6, sunDrop: 8400, mix: ["bichon", "schnauzer", "corgi", "husky"] },
    { id: "gate", name: "终夜大门", startSun: 165, waves: 7, sunDrop: 9000, mix: ["schnauzer", "corgi", "husky", "mastiff"] }
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
  const toolText = document.querySelector("#toolText");
  const overlay = document.querySelector("#overlay");
  const overlayTitle = document.querySelector("#overlayTitle");
  const overlayText = document.querySelector("#overlayText");
  const startBtn = document.querySelector("#startBtn");
  const shovelBtn = document.querySelector("#shovelBtn");
  const soundBtn = document.querySelector("#soundBtn");
  const pauseBtn = document.querySelector("#pauseBtn");
  const restartBtn = document.querySelector("#restartBtn");

  let selectedPlant = "sprout";
  let selectedLevel = 0;
  let tool = "plant";
  let grid = [];
  let projectiles = [];
  let dogs = [];
  let suns = [];
  let sun = levels[selectedLevel].startSun;
  let currentWave = 1;
  let score = 0;
  let running = false;
  let paused = false;
  let gameOver = false;
  let soundOn = false;
  let audioCtx = null;
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
        tool = "plant";
        sfx("select");
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
        sfx("select");
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
        cell.addEventListener("click", () => handleCell(row, col, cell));
        board.appendChild(cell);
      }
    }
  }

  function resetState() {
    const level = levels[selectedLevel];
    grid = Array.from({ length: rows }, () => Array(cols).fill(null));
    projectiles = [];
    dogs = [];
    suns = [];
    sun = level.startSun;
    currentWave = 1;
    score = 0;
    running = false;
    paused = false;
    gameOver = false;
    tool = "plant";
    lastTime = 0;
    spawnTimer = 0;
    spawnBudget = waveSize();
    waveRest = 0;
    skySunTimer = 2200;
    nextId = 1;
    pauseBtn.querySelector("span").textContent = "||";
    entitiesLayer.innerHTML = "";
    projectileLayer.innerHTML = "";
    floatingLayer.innerHTML = "";
    board.classList.remove("shovel-mode");
    updateHud();
    setOverlay("选择关卡并开始", `${level.name}：共 ${level.waves} 波，别让狗狗冲过花园。`, "开始", false);
  }

  function updateHud() {
    const level = levels[selectedLevel];
    sunCount.textContent = Math.floor(sun);
    waveCount.textContent = `${currentWave}/${level.waves}`;
    levelName.textContent = level.name;
    scoreCount.textContent = score;
    toolText.textContent = tool === "shovel" ? "铲子已选中：点击植物移除" : "选择植物后点击草坪种下";
    shovelBtn.classList.toggle("active", tool === "shovel");
    soundBtn.classList.toggle("active", soundOn);
    soundBtn.querySelector("span").textContent = soundOn ? "♫" : "♪";
    board.classList.toggle("shovel-mode", tool === "shovel");

    [...deck.querySelectorAll(".plant-card")].forEach((card) => {
      const enough = sun >= plants[card.dataset.plant].cost;
      card.classList.toggle("disabled", !enough);
      card.classList.toggle("selected", tool === "plant" && card.dataset.plant === selectedPlant);
    });
    [...levelTabs.querySelectorAll(".level-tab")].forEach((tab, index) => {
      tab.classList.toggle("selected", index === selectedLevel);
      tab.disabled = running && !gameOver;
    });
    if (!gameOver) {
      statusText.textContent = paused ? "花园暂停中" : "守住会被狗狗踩乱的花园";
    }
  }

  function setOverlay(title, text, buttonText, hide) {
    overlayTitle.textContent = title;
    overlayText.textContent = text;
    startBtn.textContent = buttonText;
    overlay.classList.toggle("hidden", hide);
  }

  function ensureAudio() {
    if (!audioCtx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (AudioContext) audioCtx = new AudioContext();
    }
    if (audioCtx && audioCtx.state === "suspended") audioCtx.resume();
  }

  function tone(freq, duration = 0.08, type = "sine", gainValue = 0.035, delay = 0) {
    if (!soundOn) return;
    ensureAudio();
    if (!audioCtx) return;
    const start = audioCtx.currentTime + delay;
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, start);
    gain.gain.setValueAtTime(0.0001, start);
    gain.gain.exponentialRampToValueAtTime(gainValue, start + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.start(start);
    osc.stop(start + duration + 0.02);
  }

  function sfx(name, extra = 0) {
    if (name === "select") tone(520, 0.05, "triangle", 0.025);
    if (name === "plant") {
      tone(330, 0.06, "triangle", 0.03);
      tone(460, 0.08, "triangle", 0.025, 0.05);
    }
    if (name === "shovel") tone(190, 0.08, "square", 0.025);
    if (name === "sun") {
      tone(620, 0.05, "sine", 0.025);
      tone(860, 0.09, "sine", 0.02, 0.04);
    }
    if (name === "shoot") tone(740, 0.035, "square", 0.012);
    if (name === "hit") tone(130, 0.04, "sawtooth", 0.014);
    if (name === "boom") {
      tone(95, 0.18, "sawtooth", 0.05);
      tone(180, 0.1, "square", 0.025, 0.04);
    }
    if (name === "dog") tone(extra || 420, 0.07, "triangle", 0.018);
    if (name === "win") [520, 660, 820].forEach((f, i) => tone(f, 0.12, "sine", 0.03, i * 0.1));
    if (name === "lose") [240, 180, 120].forEach((f, i) => tone(f, 0.14, "sawtooth", 0.035, i * 0.12));
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

  function handleCell(row, col, cell) {
    if (!running || paused || gameOver) return;
    if (tool === "shovel") {
      removePlant(row, col, cell);
      return;
    }
    placePlant(row, col, cell);
  }

  function placePlant(row, col, cell) {
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
      sunTimer: 1500 + Math.random() * 900,
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
    } else {
      sfx("plant");
    }
    updateHud();
  }

  function removePlant(row, col, cell) {
    const plant = grid[row][col];
    if (!plant) {
      denyCell(cell);
      return;
    }
    plant.el.remove();
    grid[row][col] = null;
    pop("铲除", ...Object.values(cellCenter(row, col)));
    sfx("shovel");
    tool = "plant";
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
    el.innerHTML = '<span class="leaf leaf-a"></span><span class="leaf leaf-b"></span><span class="head"></span><span class="stem"></span><span class="spark"></span>';
    return el;
  }

  function explodePepper(plant) {
    if (!grid[plant.row] || grid[plant.row][plant.col] !== plant) return;
    const size = cellSize();
    const pos = cellCenter(plant.row, plant.col);
    pop("BOOM", pos.x, pos.y - 8, "boom-pop");
    dogs.forEach((dog) => {
      const nearRow = Math.abs(dog.row - plant.row) <= 1;
      if (nearRow) {
        dog.hp -= plants.pepper.damage * (dog.row === plant.row ? 1 : 0.55);
        dog.startled = 900;
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
    sfx("boom");
  }

  function makeDog(row, typeId) {
    const size = cellSize();
    const type = dogTypes[typeId];
    const waveBoost = currentWave - 1 + selectedLevel * 0.8;
    const dog = {
      id: nextId += 1,
      type: typeId,
      row,
      x: boardRect.width + size.width * 0.45,
      y: row * size.height + size.height / 2 + 2,
      hp: type.hp + waveBoost * 22,
      maxHp: type.hp + waveBoost * 22,
      baseSpeed: type.speed + selectedLevel * 1.2,
      nibble: type.nibble,
      score: type.score,
      slowTimer: 0,
      slowFactor: 1,
      nibbleTimer: 0,
      barkTimer: 800 + Math.random() * 2000,
      startled: 0,
      dodge: type.dodge || 0,
      bark: type.bark,
      el: document.createElement("div")
    };
    dog.el.className = `dog ${type.className}`;
    dog.el.innerHTML = '<span class="tail"></span><span class="ear ear-a"></span><span class="ear ear-b"></span><span class="body"></span><span class="head"></span><span class="snout"></span><span class="feet"></span><span class="hpbar"></span><span class="dog-name"></span>';
    dog.el.querySelector(".dog-name").textContent = type.name;
    entitiesLayer.appendChild(dog.el);
    dogs.push(dog);
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
    sfx("sun");
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
          const dogAhead = dogs.some((dog) => dog.row === plant.row && dog.x > plant.col * size.width);
          if (plant.shootTimer <= 0 && dogAhead) {
            if (data.shots === 2) {
              makeProjectile(plant, -8);
              makeProjectile(plant, 8);
            } else {
              makeProjectile(plant);
            }
            plant.shootTimer = data.cooldown;
            sfx("shoot");
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
      const hit = dogs.find((dog) => (
        dog.row === projectile.row
        && Math.abs(dog.x - projectile.x) < size.width * 0.23
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
          sfx("hit");
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

  function updateDogs(dt) {
    const size = cellSize();
    dogs.forEach((dog) => {
      dog.slowTimer -= dt;
      dog.startled -= dt;
      dog.barkTimer -= dt;
      if (dog.slowTimer <= 0) {
        dog.slowFactor = 1;
        dog.el.classList.remove("slowed");
      }
      dog.el.classList.toggle("startled", dog.startled > 0);
      if (dog.barkTimer <= 0) {
        sfx("dog", dog.bark);
        dog.barkTimer = 2600 + Math.random() * 3200;
      }

      const col = Math.floor((dog.x - size.width * 0.24) / size.width);
      const plant = col >= 0 && col < cols ? grid[dog.row][col] : null;
      if (plant) {
        dog.nibbleTimer -= dt;
        if (dog.nibbleTimer <= 0) {
          plant.hp -= dog.nibble;
          dog.nibbleTimer = 640;
          plant.el.style.filter = `brightness(${Math.max(0.56, plant.hp / plants[plant.type].hp)})`;
          if (plant.hp <= 0) {
            plant.el.remove();
            grid[plant.row][plant.col] = null;
          }
        }
      } else {
        dog.x -= dog.baseSpeed * dog.slowFactor * dt / 1000;
      }

      if (dog.hp <= 0) {
        dog.dead = true;
        score += dog.score;
        if (Math.random() < 0.25 + selectedLevel * 0.035) makeSun(dog.x, dog.y - 22);
      }

      if (dog.x < -20) loseGame();

      const health = Math.max(0, dog.hp / dog.maxHp);
      dog.el.style.left = `${dog.x}px`;
      dog.el.style.top = `${dog.y}px`;
      dog.el.querySelector(".hpbar").style.transform = `scaleX(${health})`;
      dog.el.style.opacity = `${Math.max(0.46, health)}`;
    });

    dogs = dogs.filter((dog) => {
      if (dog.dead) dog.el.remove();
      return !dog.dead;
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

  function pickDogType() {
    const level = levels[selectedLevel];
    const mix = [...level.mix];
    if (currentWave >= 3) mix.push("schnauzer");
    if (currentWave >= 4 && selectedLevel >= 1) mix.push("corgi", "husky");
    if (currentWave >= 5 && selectedLevel >= 2) mix.push("mastiff");
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
          makeDog(Math.floor(Math.random() * rows), pickDogType());
          spawnBudget -= 1;
        }
        spawnTimer = Math.max(680, 2250 - currentWave * 170 - selectedLevel * 130) + Math.random() * 900;
      }
    } else if (dogs.length === 0) {
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
        statusText.textContent = `第 ${currentWave} 队狗狗正在靠近`;
      }
    }
  }

  function loseGame() {
    if (gameOver) return;
    gameOver = true;
    running = false;
    statusText.textContent = "花园被狗狗冲破";
    setOverlay("花园被踩乱了", `得分 ${score}。换个关卡或多用木盾会更稳。`, "重开", false);
    sfx("lose");
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
    sfx("win");
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
      updateDogs(dt);
      updateSuns(dt);
      updateSpawning(dt);
      updateHud();
    }

    requestAnimationFrame(tick);
  }

  function startGame() {
    ensureAudio();
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
  restartBtn.addEventListener("click", () => {
    sfx("select");
    resetState();
  });
  shovelBtn.addEventListener("click", () => {
    tool = tool === "shovel" ? "plant" : "shovel";
    sfx("select");
    updateHud();
  });
  soundBtn.addEventListener("click", () => {
    soundOn = !soundOn;
    ensureAudio();
    updateHud();
    sfx("select");
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

  buildDeck();
  buildLevels();
  makeGrid();
  resetState();
})();
