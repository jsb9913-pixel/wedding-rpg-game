const WORLD_WIDTH = 1660;
const GROUND_BOTTOM = 160;
const PLAYER_START_X = 126;
const GROUND_PATH = [
  { x: 0, bottom: GROUND_BOTTOM },
  { x: 1080, bottom: GROUND_BOTTOM },
  { x: 1150, bottom: 145 },
  { x: 1220, bottom: 120 },
  { x: WORLD_WIDTH, bottom: 120 }
];
const FOOT_OFFSET = {
  player: 4,
  groom: 19,
  bride: 12,
  mushroom: 28,
  arch: 0
};
const ACTOR_X = {
  groom: 478,
  bride: 1068,
  arch: 1550
};
const STORAGE_KEYS = {
  profile: "weddingRpg.profile",
  progress: "weddingRpg.progress"
};
const BACKGROUND_SCENES = ["./assets/backgrounds/wedding-map-unified.png"];
const GUEST_SPRITES = Array.from({ length: 60 }, (_, index) => {
  const number = String(index + 1).padStart(2, "0");
  return `./assets/characters/guests/guest-${number}.png`;
});
const MOBILE_INVITATION_URL = "https://toourguest.com/cards/weddingws";
const PROGRESS_VERSION = 15;
const ATTACK_COOLDOWN = 420;

const state = {
  screen: "intro",
  guestName: "김포포",
  guestSprite: GUEST_SPRITES[0],
  questStarted: false,
  questCompleted: false,
  invitationCount: 0,
  mushroomKilled: false,
  invitationDropped: false,
  submittedInvitation: false,
  playerHP: 1024,
  playerMaxHP: 1024,
  love: 100,
  exp: 24.1,
  droppedItems: [],
  lastAttackTime: 0,
  player: {
    x: PLAYER_START_X,
    y: 0,
    vx: 0,
    vy: 0,
    facing: "right",
    grounded: true
  }
};

const input = {
  left: false,
  right: false,
  jumpQueued: false
};

const ui = {};
let lastTime = 0;
let cameraX = 0;
let activeDialogue = null;
let currentNearTarget = null;
let toastTimer = null;
let miniPanelMode = null;
let itemSequence = 0;

const interactables = [
  { id: "mushroomA", type: "mushroom", x: 250, radius: 58 },
  { id: "groom", type: "questNpc", x: ACTOR_X.groom, radius: 84 },
  { id: "arch", type: "arch", x: ACTOR_X.arch, radius: 126 },
  { id: "mushroomB", type: "mushroom", x: 900, radius: 58 },
  { id: "bride", type: "questNpc", x: ACTOR_X.bride, radius: 86 },
  { id: "mushroomC", type: "mushroom", x: 1468, radius: 58 }
];

const mushrooms = [
  { id: "mushroomA", el: null, hpBar: null, x: 250, start: 230, end: 292, speed: 18, dir: 1, hp: 3, maxHp: 3, active: true, respawnAt: 0 },
  { id: "mushroomB", el: null, hpBar: null, x: 900, start: 852, end: 930, speed: 22, dir: -1, hp: 3, maxHp: 3, active: true, respawnAt: 0 },
  { id: "mushroomC", el: null, hpBar: null, x: 1468, start: 1428, end: 1512, speed: 16, dir: 1, hp: 3, maxHp: 3, active: true, respawnAt: 0 }
];

function init() {
  cacheDom();
  setRandomBackground();
  selectRandomGuestSprite();
  loadStoredState();
  bindEvents();
  createPetals();
  updateQuestUI();
  updateHUD();
  render();
  requestAnimationFrame(update);
}

function cacheDom() {
  ui.gameFrame = document.getElementById("gameFrame");
  ui.sceneBg = document.getElementById("sceneBg");
  ui.introScreen = document.getElementById("introScreen");
  ui.gameScreen = document.getElementById("gameScreen");
  ui.nameInput = document.getElementById("guestNameInput");
  ui.startButton = document.getElementById("startButton");
  ui.viewport = document.getElementById("viewport");
  ui.world = document.getElementById("world");
  ui.player = document.getElementById("player");
  ui.playerSprite = document.getElementById("playerSprite");
  ui.playerNameTag = document.getElementById("playerNameTag");
  ui.npcGroom = document.getElementById("npcGroom");
  ui.npcBride = document.getElementById("npcBride");
  ui.weddingArch = document.getElementById("weddingArch");
  ui.questBox = document.getElementById("questBox");
  ui.questTitle = document.getElementById("questTitle");
  ui.questLineOne = document.getElementById("questLineOne");
  ui.questLineTwo = document.getElementById("questLineTwo");
  ui.questLineThree = document.getElementById("questLineThree");
  ui.questMarkerGroom = document.getElementById("questMarkerGroom");
  ui.questMarkerBride = document.getElementById("questMarkerBride");
  ui.questMarkerArch = document.getElementById("questMarkerArch");
  ui.prompt = document.getElementById("interactionPrompt");
  ui.dialogue = document.getElementById("dialogue");
  ui.dialoguePortrait = document.getElementById("dialoguePortrait");
  ui.dialogueName = document.getElementById("dialogueName");
  ui.dialogueText = document.getElementById("dialogueText");
  ui.dialogueSummary = document.getElementById("dialogueSummary");
  ui.dialogueActions = document.getElementById("dialogueActions");
  ui.dialogueAction = document.getElementById("dialogueAction");
  ui.dialogueHint = document.getElementById("dialogueHint");
  ui.acceptQuestButton = document.getElementById("acceptQuestButton");
  ui.rejectQuestButton = document.getElementById("rejectQuestButton");
  ui.toast = document.getElementById("toast");
  ui.petalLayer = document.getElementById("petalLayer");
  ui.dropsLayer = document.getElementById("dropsLayer");
  ui.slashEffect = document.getElementById("slashEffect");
  ui.hudName = document.getElementById("hudName");
  ui.hudHp = document.getElementById("hudHp");
  ui.hudLove = document.getElementById("hudLove");
  ui.hudExp = document.getElementById("hudExp");
  ui.hudInvitation = document.getElementById("hudInvitation");
  ui.hpGauge = document.getElementById("hpGauge");
  ui.loveGauge = document.getElementById("loveGauge");
  ui.expGauge = document.getElementById("expGauge");
  ui.menuButton = document.getElementById("menuButton");
  ui.inventoryButton = document.getElementById("inventoryButton");
  ui.questButton = document.getElementById("questButton");
  ui.attackButton = document.getElementById("attackButton");
  ui.miniPanel = document.getElementById("miniPanel");
  ui.miniPanelTitle = document.getElementById("miniPanelTitle");
  ui.miniPanelBody = document.getElementById("miniPanelBody");
  ui.miniCloseButton = document.getElementById("miniCloseButton");
  ui.questCompleteModal = document.getElementById("questCompleteModal");
  ui.openInvitationButton = document.getElementById("openInvitationButton");

  mushrooms.forEach((mushroom) => {
    mushroom.el = document.getElementById(mushroom.id);
    mushroom.hpBar = mushroom.el.querySelector(".hp-bar i");
  });
}

function setRandomBackground() {
  const selected = BACKGROUND_SCENES[Math.floor(Math.random() * BACKGROUND_SCENES.length)];
  ui.sceneBg.src = selected;
}

function selectRandomGuestSprite() {
  state.guestSprite = GUEST_SPRITES[Math.floor(Math.random() * GUEST_SPRITES.length)];
}

function loadStoredState() {
  const profile = readJson(STORAGE_KEYS.profile, null);
  const progress = readJson(STORAGE_KEYS.progress, null);

  if (profile?.guestName) {
    state.guestName = profile.guestName;
    ui.nameInput.value = profile.guestName;
  }

  if (progress?.version !== PROGRESS_VERSION) {
    localStorage.removeItem(STORAGE_KEYS.progress);
    return;
  }

  state.questStarted = Boolean(progress.questStarted);
  state.questCompleted = Boolean(progress.questCompleted);
  state.invitationCount = Number(progress.invitationCount) || 0;
  state.mushroomKilled = Boolean(progress.mushroomKilled);
  state.invitationDropped = Boolean(progress.invitationDropped);
  state.submittedInvitation = Boolean(progress.submittedInvitation);
}

function bindEvents() {
  ui.startButton.addEventListener("click", startGame);
  ui.nameInput.addEventListener("keydown", (event) => {
    if (event.key === "Enter") startGame();
  });

  document.addEventListener("keydown", handleKeyDown);
  document.addEventListener("keyup", handleKeyUp);

  ui.acceptQuestButton.addEventListener("click", startQuest);
  ui.rejectQuestButton.addEventListener("click", () => {
    closeDialogue();
    showToast("원중&수빈에게 다시 말을 걸면 수락할 수 있어요.");
  });
  ui.dialogueAction.addEventListener("click", () => {
    activeDialogue?.action?.();
  });

  ui.menuButton.addEventListener("click", openMenuPanel);
  ui.inventoryButton.addEventListener("click", openInventory);
  ui.questButton.addEventListener("click", openQuestMiniPanel);
  ui.attackButton.addEventListener("click", attack);
  ui.miniCloseButton.addEventListener("click", closeMiniPanel);
  ui.openInvitationButton.addEventListener("click", openMobileInvitation);

  document.querySelectorAll("[data-close]").forEach((button) => {
    button.addEventListener("click", () => closeModal(button.dataset.close));
  });

  bindTouchControls();
}

function bindTouchControls() {
  document.querySelectorAll("[data-control]").forEach((button) => {
    const control = button.dataset.control;
    const setActive = (isActive) => {
      button.classList.toggle("is-active", isActive);
      if (control === "left") input.left = isActive;
      if (control === "right") input.right = isActive;
      if (control === "jump" && isActive) input.jumpQueued = true;
    };

    button.addEventListener("pointerdown", (event) => {
      event.preventDefault();
      if (control === "action") {
        interact();
        return;
      }
      setActive(true);
      button.setPointerCapture(event.pointerId);
    });

    button.addEventListener("pointerup", () => setActive(false));
    button.addEventListener("pointercancel", () => setActive(false));
    button.addEventListener("lostpointercapture", () => setActive(false));
  });
}

function handleInput(event, isDown) {
  const key = event.key.toLowerCase();
  if (key === "arrowleft" || key === "a") input.left = isDown;
  if (key === "arrowright" || key === "d") input.right = isDown;
  if ((key === "arrowup" || key === "w") && isDown) input.jumpQueued = true;
}

function handleKeyDown(event) {
  if (["ArrowLeft", "ArrowRight", "ArrowUp", " "].includes(event.key)) event.preventDefault();

  if (event.key === "Escape") {
    closeTopLayer();
    return;
  }

  if (event.key === "Enter") {
    if (state.screen === "intro") {
      startGame();
      return;
    }
    interact();
    return;
  }

  if (event.key === " " || event.key === "Control") {
    attack();
    return;
  }

  handleInput(event, true);
}

function handleKeyUp(event) {
  handleInput(event, false);
}

function startGame() {
  const guestName = ui.nameInput.value.trim() || "김포포";
  state.guestName = guestName;
  state.screen = "game";
  localStorage.setItem(STORAGE_KEYS.profile, JSON.stringify({ guestName }));
  ui.introScreen.hidden = true;
  ui.gameScreen.hidden = false;
  showToast(`${guestName}님, 웨딩 정원에 입장했습니다!`);
  updateHUD();
  updateQuestUI();
  render();
}

function update(time = 0) {
  const dt = Math.min((time - lastTime) / 1000 || 0, 0.032);
  lastTime = time;

  if (state.screen === "game" && !hasOpenModal()) {
    const canMove = !activeDialogue;
    updatePlayer(dt, canMove);
    updateMushrooms(dt, time);
    updateDroppedItems();
    updateCamera();
    updateInteractionPrompt();
    render();
  }

  requestAnimationFrame(update);
}

function updatePlayer(dt, canMove) {
  const move = canMove ? Number(input.right) - Number(input.left) : 0;
  const speed = 228;
  const gravity = 1900;
  const jumpPower = 690;

  state.player.vx = move * speed;
  if (move < 0) state.player.facing = "left";
  if (move > 0) state.player.facing = "right";

  if (canMove && input.jumpQueued && state.player.grounded) {
    state.player.vy = jumpPower;
    state.player.grounded = false;
  }
  input.jumpQueued = false;

  state.player.x = clamp(state.player.x + state.player.vx * dt, 44, WORLD_WIDTH - 52);

  if (!state.player.grounded || state.player.vy !== 0) {
    state.player.y += state.player.vy * dt;
    state.player.vy -= gravity * dt;

    if (state.player.y <= 0) {
      state.player.y = 0;
      state.player.vy = 0;
      state.player.grounded = true;
    }
  }
}

function updateMushrooms(dt, time) {
  mushrooms.forEach((mushroom) => {
    if (!mushroom.active) {
      if (time >= mushroom.respawnAt && state.invitationCount < 1 && !state.questCompleted) {
        respawnMonster(mushroom);
      }
      return;
    }

    mushroom.x += mushroom.dir * mushroom.speed * dt;
    if (mushroom.x > mushroom.end) mushroom.dir = -1;
    if (mushroom.x < mushroom.start) mushroom.dir = 1;
    updateMonsterElement(mushroom);
  });
}

function updateMonsterElement(mushroom) {
  mushroom.el.style.left = `${mushroom.x}px`;
  mushroom.el.style.bottom = `${groundBottomAt(mushroom.x + 26) - FOOT_OFFSET.mushroom}px`;
  mushroom.el.classList.toggle("facing-left", mushroom.dir < 0);
  mushroom.el.classList.toggle("is-defeated", !mushroom.active);
  mushroom.el.classList.toggle("is-quest-active", state.questStarted && !state.questCompleted);
  mushroom.hpBar.style.width = `${(mushroom.hp / mushroom.maxHp) * 100}%`;

  const target = interactables.find((item) => item.id === mushroom.id);
  if (target) target.x = mushroom.x + 26;
}

function respawnMonster(mushroom) {
  mushroom.active = true;
  mushroom.hp = mushroom.maxHp;
  mushroom.x = mushroom.start + Math.random() * (mushroom.end - mushroom.start);
  mushroom.el.hidden = false;
  updateMonsterElement(mushroom);
}

function updateDroppedItems() {
  for (const item of state.droppedItems) {
    if (item.collected) continue;
    if (Math.abs(state.player.x - item.x) < 48) {
      collectInvitation(item.id);
      break;
    }
  }
}

function updateCamera() {
  const viewportWidth = ui.viewport.clientWidth;
  cameraX = clamp(state.player.x - viewportWidth * 0.44, 0, WORLD_WIDTH - viewportWidth);
}

function updateInteractionPrompt() {
  currentNearTarget = getNearestTarget();
  if (!currentNearTarget) {
    ui.prompt.hidden = true;
    return;
  }

  ui.prompt.hidden = false;
  ui.prompt.textContent = labelForTarget(currentNearTarget);
}

function render() {
  const playerGround = groundBottomAt(state.player.x);
  ui.player.style.left = `${state.player.x}px`;
  ui.player.style.bottom = `${playerGround - FOOT_OFFSET.player + state.player.y}px`;
  ui.player.classList.toggle("walking", Math.abs(state.player.vx) > 1 && state.player.grounded);
  ui.player.classList.toggle("jumping", !state.player.grounded);
  ui.player.classList.toggle("facing-left", state.player.facing === "left");
  ui.world.style.transform = `translate3d(${-Math.round(cameraX)}px, 0, 0)`;

  setActorGround(ui.npcGroom, ACTOR_X.groom, FOOT_OFFSET.groom);
  setActorGround(ui.npcBride, ACTOR_X.bride, FOOT_OFFSET.bride);
  setActorGround(ui.weddingArch, ACTOR_X.arch, FOOT_OFFSET.arch);

  ui.hudName.textContent = state.guestName;
  ui.playerNameTag.textContent = state.guestName;
  if (ui.playerSprite.getAttribute("src") !== state.guestSprite) {
    ui.playerSprite.src = state.guestSprite;
  }

  mushrooms.forEach(updateMonsterElement);
}

function interact() {
  if (activeDialogue?.type === "questOffer") return;
  if (activeDialogue?.action) {
    activeDialogue.action();
    return;
  }
  if (activeDialogue) {
    closeDialogue();
    return;
  }
  if (hasOpenModal()) return;

  const item = getNearbyDroppedItem();
  if (item) {
    collectInvitation(item.id);
    return;
  }

  const target = currentNearTarget || getNearestTarget();
  if (!target) {
    showToast("가까이 다가가서 Enter 또는 A를 눌러주세요.");
    return;
  }

  if (target.type === "questNpc") {
    openQuestOffer();
    return;
  }
  if (target.type === "arch") {
    handleArchInteraction();
    return;
  }
  if (target.type === "mushroom") {
    attack();
  }
}

function openQuestOffer() {
  if (state.questStarted || state.questCompleted) {
    showSimpleDialogue({
      speaker: "원중 & 수빈",
      portrait: "./assets/characters/lookbook-bride.png",
      text: state.invitationCount > 0
        ? "청첩장을 찾았구나! 이제 웨딩 아치에 제출해줘."
        : "주황버섯을 처치하고 청첩장을 찾아줘!"
    });
    return;
  }

  activeDialogue = { type: "questOffer" };
  ui.dialogue.hidden = false;
  ui.dialogueName.textContent = "원중 & 수빈";
  ui.dialoguePortrait.src = "./assets/characters/lookbook-bride.png";
  ui.dialogueText.textContent = "큰일이야! 주황버섯들이 우리의 청첩장을 훔쳐갔어.\n청첩장을 찾아서 웨딩 아치에 제출해줄래?";
  ui.dialogueSummary.hidden = false;
  ui.dialogueSummary.innerHTML = "<b>[웨딩퀘스트] 잃어버린 청첩장</b><span>주황버섯을 처치하고 청첩장을 찾아주세요.</span>";
  ui.dialogueActions.hidden = false;
  ui.dialogueAction.hidden = true;
  ui.dialogueHint.hidden = true;
}

function startQuest() {
  state.questStarted = true;
  closeDialogue();
  saveProgress();
  updateQuestUI();
  updateHUD();
  showToast("[웨딩퀘스트] 잃어버린 청첩장을 수락했습니다!");
}

function showSimpleDialogue({ speaker, portrait, text, actionLabel = "", action = null }) {
  activeDialogue = { type: "simple", action };
  ui.dialogue.hidden = false;
  ui.dialogueName.textContent = speaker;
  ui.dialoguePortrait.src = portrait;
  ui.dialogueText.textContent = text;
  ui.dialogueSummary.hidden = true;
  ui.dialogueSummary.innerHTML = "";
  ui.dialogueActions.hidden = true;
  ui.dialogueAction.hidden = !action;
  ui.dialogueAction.textContent = actionLabel;
  ui.dialogueHint.hidden = Boolean(action);
}

function closeDialogue() {
  activeDialogue = null;
  ui.dialogue.hidden = true;
  ui.dialogueSummary.hidden = true;
  ui.dialogueActions.hidden = true;
  ui.dialogueAction.hidden = true;
  ui.dialogueHint.hidden = false;
  ui.dialogueText.textContent = "";
}

function handleArchInteraction() {
  if (state.questCompleted) {
    showQuestCompletePopup();
    return;
  }
  if (!state.questStarted || state.invitationCount < 1) {
    showToast("청첩장이 필요합니다.");
    return;
  }
  submitInvitation();
}

function attack() {
  if (state.screen !== "game" || activeDialogue || hasOpenModal()) return;
  const now = performance.now();
  if (now - state.lastAttackTime < ATTACK_COOLDOWN) return;
  state.lastAttackTime = now;

  showSlashEffect();
  if (!state.questStarted || state.questCompleted) {
    showToast("먼저 원중&수빈에게 퀘스트를 받아주세요.");
    return;
  }

  const direction = state.player.facing === "left" ? -1 : 1;
  const attackCenter = state.player.x + direction * 62;
  const target = mushrooms.find((mushroom) => {
    if (!mushroom.active) return false;
    const distance = Math.abs((mushroom.x + 26) - attackCenter);
    const sameSide = direction > 0 ? mushroom.x + 26 >= state.player.x - 8 : mushroom.x + 26 <= state.player.x + 8;
    return sameSide && distance < 88;
  });

  if (!target) return;
  damageMonster(target);
}

function showSlashEffect() {
  const direction = state.player.facing === "left" ? -1 : 1;
  ui.slashEffect.hidden = false;
  ui.slashEffect.classList.toggle("facing-left", direction < 0);
  ui.slashEffect.style.left = `${state.player.x + direction * 58}px`;
  ui.slashEffect.style.bottom = `${groundBottomAt(state.player.x) + state.player.y + 42}px`;
  ui.slashEffect.classList.remove("is-active");
  void ui.slashEffect.offsetWidth;
  ui.slashEffect.classList.add("is-active");
  window.setTimeout(() => {
    ui.slashEffect.hidden = true;
    ui.slashEffect.classList.remove("is-active");
  }, 220);
}

function damageMonster(mushroom) {
  mushroom.hp = Math.max(0, mushroom.hp - 1);
  mushroom.el.classList.remove("is-hit");
  void mushroom.el.offsetWidth;
  mushroom.el.classList.add("is-hit");
  updateMonsterElement(mushroom);

  if (mushroom.hp <= 0) {
    killMonster(mushroom);
  }
}

function killMonster(mushroom) {
  state.mushroomKilled = true;
  mushroom.active = false;
  mushroom.el.hidden = true;
  mushroom.respawnAt = performance.now() + 1200 + Math.random() * 800;

  if (state.invitationCount < 1 && state.droppedItems.length === 0) {
    tryDropInvitation(mushroom.x + 26);
  }

  saveProgress();
  updateQuestUI();
}

function tryDropInvitation(x) {
  if (Math.random() >= 0.5) {
    state.invitationDropped = false;
    showToast("청첩장을 찾지 못했습니다. 다시 도전해보세요!");
    return;
  }

  state.invitationDropped = true;
  const id = `invitation-${itemSequence}`;
  itemSequence += 1;
  const item = { id, x, collected: false };
  state.droppedItems.push(item);

  const el = document.createElement("button");
  el.type = "button";
  el.className = "drop-item";
  el.dataset.itemId = id;
  el.setAttribute("aria-label", "청첩장 줍기");
  el.innerHTML = '<span class="envelope-icon"></span>';
  el.style.left = `${x}px`;
  el.style.bottom = `${groundBottomAt(x) + 10}px`;
  el.addEventListener("click", () => collectInvitation(id));
  ui.dropsLayer.appendChild(el);

  showToast("청첩장이 떨어졌습니다!");
}

function getNearbyDroppedItem() {
  return state.droppedItems.find((item) => !item.collected && Math.abs(state.player.x - item.x) < 52);
}

function collectInvitation(id) {
  const item = state.droppedItems.find((entry) => entry.id === id);
  if (!item || item.collected || state.invitationCount > 0) return;
  item.collected = true;
  state.invitationCount = 1;
  state.droppedItems = state.droppedItems.filter((entry) => entry.id !== id);
  const el = ui.dropsLayer.querySelector(`[data-item-id="${id}"]`);
  el?.remove();
  saveProgress();
  updateHUD();
  updateQuestUI();
  showToast("청첩장을 획득했습니다!");
}

function submitInvitation() {
  if (state.invitationCount < 1) {
    showToast("청첩장이 필요합니다.");
    return;
  }
  state.submittedInvitation = true;
  saveProgress();
  updateQuestUI();
  showQuestCompletePopup();
}

function showQuestCompletePopup() {
  ui.questCompleteModal.hidden = false;
}

function openMobileInvitation() {
  state.questCompleted = true;
  state.submittedInvitation = true;
  saveProgress();
  updateQuestUI();
  closeModal("questCompleteModal");
  window.open(MOBILE_INVITATION_URL, "_blank", "noopener");
}

function updateQuestUI() {
  if (state.questCompleted) {
    ui.questTitle.textContent = "QUEST COMPLETE";
    setQuestLines(["✓ 모바일 청첩장 열기"]);
  } else if (!state.questStarted) {
    ui.questTitle.textContent = "QUEST";
    setQuestLines(["□ 원중&수빈에게 말 걸기"]);
  } else {
    ui.questTitle.textContent = "QUEST";
    setQuestLines([
      `${state.mushroomKilled ? "✓" : "□"} 주황버섯 처치하기`,
      `${state.invitationCount > 0 ? "✓" : "□"} 청첩장 획득하기`,
      `${state.submittedInvitation ? "✓" : "□"} 웨딩 아치에 제출하기`
    ]);
  }
  updateQuestMarkers();
  if (miniPanelMode === "quest") renderQuestMiniPanel();
  if (miniPanelMode === "inventory") renderInventoryPanel();
}

function setQuestLines(lines) {
  [ui.questLineOne, ui.questLineTwo, ui.questLineThree].forEach((line, index) => {
    line.hidden = !lines[index];
    line.textContent = lines[index] || "";
  });
}

function updateQuestMarkers() {
  const showStart = !state.questStarted && !state.questCompleted;
  setQuestMarker(ui.questMarkerGroom, showStart ? "available" : "hidden");
  setQuestMarker(ui.questMarkerBride, showStart ? "available" : "hidden");

  const archReady = state.invitationCount > 0 && !state.questCompleted;
  setQuestMarker(ui.questMarkerArch, archReady ? "complete" : "hidden");
}

function setQuestMarker(marker, status) {
  if (!marker) return;
  const img = marker.querySelector("img");
  marker.classList.toggle("is-complete", status === "complete");

  if (status === "hidden") {
    marker.hidden = true;
    return;
  }

  marker.hidden = false;
  if (status === "complete") {
    marker.setAttribute("aria-label", "퀘스트 완료 가능");
    img.src = "./assets/ui/quest-book.png";
  } else {
    marker.setAttribute("aria-label", "퀘스트 시작 가능");
    img.src = "./assets/ui/quest-bulb.png";
  }
}

function updateHUD() {
  ui.hudName.textContent = state.guestName;
  ui.hudHp.textContent = `${state.playerHP} / ${state.playerMaxHP}`;
  ui.hudLove.textContent = `${state.love}%`;
  ui.hudExp.textContent = `${state.exp.toFixed(2)}%`;
  ui.hudInvitation.textContent = `청첩장 x ${state.invitationCount}`;
  ui.hpGauge.style.width = `${(state.playerHP / state.playerMaxHP) * 100}%`;
  ui.loveGauge.style.width = `${state.love}%`;
  ui.expGauge.style.width = `${state.exp}%`;
}

function openQuestMiniPanel() {
  miniPanelMode = "quest";
  renderQuestMiniPanel();
  ui.miniPanel.hidden = false;
}

function renderQuestMiniPanel() {
  ui.miniPanelTitle.textContent = "QUEST";
  if (!state.questStarted && !state.questCompleted) {
    ui.miniPanelBody.innerHTML = "<p>진행 중인 퀘스트가 없습니다.</p><p>원중&수빈에게 말을 걸어보세요.</p>";
    return;
  }
  if (state.questCompleted) {
    ui.miniPanelTitle.textContent = "QUEST COMPLETE";
    ui.miniPanelBody.innerHTML = "<p><b>[웨딩퀘스트] 잃어버린 청첩장</b></p><p>✓ 모바일 청첩장 열기</p><p>모바일 청첩장을 확인할 수 있어요.</p>";
    return;
  }

  const nextGuide = state.invitationCount > 0
    ? "청첩장을 웨딩 아치에 제출하세요."
    : state.mushroomKilled
      ? "청첩장을 획득하세요."
      : "주황버섯을 처치하세요.";
  ui.miniPanelBody.innerHTML = `
    <p><b>[웨딩퀘스트] 잃어버린 청첩장</b></p>
    <p>${state.mushroomKilled ? "✓" : "□"} 주황버섯 처치하기</p>
    <p>${state.invitationCount > 0 ? "✓" : "□"} 청첩장 획득하기</p>
    <p>${state.submittedInvitation ? "✓" : "□"} 웨딩 아치에 제출하기</p>
    <p>${nextGuide}</p>
  `;
}

function openInventory() {
  miniPanelMode = "inventory";
  renderInventoryPanel();
  ui.miniPanel.hidden = false;
}

function renderInventoryPanel() {
  ui.miniPanelTitle.textContent = "ITEM";
  ui.miniPanelBody.innerHTML = `
    <p><b>청첩장 x ${state.invitationCount}</b></p>
    <p>웨딩 아치에 제출하면 모바일 청첩장이 열린다.</p>
  `;
}

function openMenuPanel() {
  miniPanelMode = "menu";
  ui.miniPanelTitle.textContent = "MENU";
  ui.miniPanelBody.innerHTML = "<p>준비 중입니다.</p>";
  ui.miniPanel.hidden = false;
}

function closeMiniPanel() {
  miniPanelMode = null;
  ui.miniPanel.hidden = true;
}

function getNearestTarget() {
  let nearest = null;
  let bestScore = Infinity;

  for (const item of interactables) {
    if (item.type === "mushroom") {
      const monster = mushrooms.find((mushroom) => mushroom.id === item.id);
      if (!monster?.active) continue;
    }

    const distance = Math.abs(state.player.x - item.x);
    const priority = item.type === "arch" && state.invitationCount > 0 ? 7 : item.type === "questNpc" ? 3 : item.type === "arch" ? 2 : 1;
    const score = distance - priority * 24;

    if (distance < item.radius && score < bestScore) {
      nearest = item;
      bestScore = score;
    }
  }

  return nearest;
}

function labelForTarget(target) {
  if (target.type === "questNpc") return "Enter / A 대화";
  if (target.type === "arch") {
    if (state.invitationCount > 0) return "Enter / A 청첩장 제출";
    return "청첩장이 필요합니다.";
  }
  if (target.type === "mushroom") return "ATTACK / Space";
  return "Enter / A 확인";
}

function closeTopLayer() {
  if (!ui.miniPanel.hidden) {
    closeMiniPanel();
    return;
  }
  const openModal = [...document.querySelectorAll(".modal")].find((modal) => !modal.hidden);
  if (openModal) {
    closeModal(openModal.id);
    return;
  }
  if (activeDialogue) closeDialogue();
}

function closeModal(id) {
  const modal = document.getElementById(id);
  if (modal) modal.hidden = true;
}

function hasOpenModal() {
  return [...document.querySelectorAll(".modal")].some((modal) => !modal.hidden);
}

function saveProgress() {
  localStorage.setItem(
    STORAGE_KEYS.progress,
    JSON.stringify({
      version: PROGRESS_VERSION,
      questStarted: state.questStarted,
      questCompleted: state.questCompleted,
      invitationCount: state.invitationCount,
      mushroomKilled: state.mushroomKilled,
      invitationDropped: state.invitationDropped,
      submittedInvitation: state.submittedInvitation
    })
  );
}

function readJson(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function createPetals() {
  const count = 24;
  ui.petalLayer.innerHTML = "";
  for (let index = 0; index < count; index += 1) {
    const petal = document.createElement("span");
    petal.className = "petal";
    petal.style.left = `${Math.random() * 100}%`;
    petal.style.setProperty("--start-x", `${Math.random() * 40 - 20}px`);
    petal.style.setProperty("--end-x", `${Math.random() * 160 - 80}px`);
    petal.style.animationDuration = `${7 + Math.random() * 7}s`;
    petal.style.animationDelay = `${Math.random() * -10}s`;
    petal.style.opacity = String(0.45 + Math.random() * 0.45);
    ui.petalLayer.appendChild(petal);
  }
}

function burstParticles() {
  const frame = ui.gameFrame;
  for (let index = 0; index < 34; index += 1) {
    const particle = document.createElement("span");
    particle.className = `particle ${index % 2 ? "heart" : "star"}`;
    const angle = (Math.PI * 2 * index) / 34;
    const radius = 70 + Math.random() * 86;
    particle.style.setProperty("--dx", `${Math.cos(angle) * radius}px`);
    particle.style.setProperty("--dy", `${Math.sin(angle) * radius}px`);
    frame.appendChild(particle);
    window.setTimeout(() => particle.remove(), 900);
  }
}

function showToast(message) {
  clearTimeout(toastTimer);
  ui.toast.textContent = message;
  ui.toast.hidden = false;
  toastTimer = window.setTimeout(() => {
    ui.toast.hidden = true;
  }, 2600);
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function groundBottomAt(x) {
  for (let index = 0; index < GROUND_PATH.length - 1; index += 1) {
    const left = GROUND_PATH[index];
    const right = GROUND_PATH[index + 1];
    if (x >= left.x && x <= right.x) {
      const progress = (x - left.x) / (right.x - left.x);
      return left.bottom + (right.bottom - left.bottom) * progress;
    }
  }

  return GROUND_PATH[GROUND_PATH.length - 1].bottom;
}

function setActorGround(element, x, footOffset = 0) {
  if (!element) return;
  element.style.bottom = `${groundBottomAt(x) - footOffset}px`;
}

window.addEventListener("DOMContentLoaded", init);
