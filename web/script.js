function toggleSettingsModal() {
const modal = document.getElementById('settingsModal');
if (modal) {
    modal.classList.toggle('hidden');
    updateSettingsUI();
}
}

function closeSettingsModal() {
const modal = document.getElementById('settingsModal');
if (modal) modal.classList.add('hidden');
}

function updateSettingsUI() {
document.querySelectorAll('.theme-card').forEach(card => {
    const theme = card.dataset.theme;
    if (theme === gameState.settings.theme) card.classList.add('active');
    else card.classList.remove('active');
});
document.querySelectorAll('.language-card').forEach(card => {
    const lang = card.dataset.lang;
    if (lang === gameState.settings.language) card.classList.add('active');
    else card.classList.remove('active');
});
}

function changeTheme(theme) {
gameState.settings.theme = theme;
document.body.setAttribute('data-theme', theme);
updateSettingsUI();
saveGame();
}

function changeLanguage(lang) {
if (gameState.settings.language === lang) return;
const languageOptions = document.querySelector('.language-options');
if (lang === 'en') languageOptions.classList.add('en-active');
else languageOptions.classList.remove('en-active');
const clickedCard = document.querySelector(`.language-card[data-lang="${lang}"]`);
if (clickedCard) {
    const ripple = document.createElement('span');
    ripple.className = 'language-ripple';
    const rect = clickedCard.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    ripple.style.width = ripple.style.height = size + 'px';
    ripple.style.left = '50%';
    ripple.style.top = '50%';
    ripple.style.transform = 'translate(-50%, -50%) scale(0)';
    clickedCard.appendChild(ripple);
    setTimeout(() => ripple.remove(), 600);
}
const overlay = document.createElement('div');
overlay.className = 'language-transition-overlay';
document.body.appendChild(overlay);
requestAnimationFrame(() => {
    overlay.classList.add('active');
    setTimeout(() => {
        gameState.settings.language = lang;
        updateSettingsUI();
        saveGame();
        updateAllTexts();
        setTimeout(() => {
            overlay.classList.add('fade-out');
            setTimeout(() => overlay.remove(), 400);
        }, 300);
    }, 300);
});
}

function t(key) {
const lang = gameState.settings?.language || 'ru';
return translations[lang][key] || translations['ru'][key] || key;
}

function updateAllTexts() {
const menuTitle = document.querySelector('.menu-title');
if (menuTitle) menuTitle.textContent = t('casinoTitle');
const menuSubtitle = document.querySelector('.menu-subtitle');
if (menuSubtitle) menuSubtitle.textContent = t('welcome');
const slotsCard = document.querySelector('#playSlotsBtn h3');
if (slotsCard) slotsCard.textContent = t('slots');
const slotsDesc = document.querySelector('#playSlotsBtn p');
if (slotsDesc) slotsDesc.textContent = t('slotsDesc');
const wheelCard = document.querySelector('#playWheelBtn h3');
if (wheelCard) wheelCard.textContent = t('roulette');
const wheelDesc = document.querySelector('#playWheelBtn p');
if (wheelDesc) wheelDesc.textContent = t('rouletteDesc');
const minesCard = document.querySelector('#playMinesBtn h3');
if (minesCard) minesCard.textContent = t('mines');
const minesDesc = document.querySelector('#playMinesBtn p');
if (minesDesc) minesDesc.textContent = t('minesDesc');
const backBtn = document.getElementById('backBtn');
if (backBtn) backBtn.innerHTML = t('back');
const spinBtn = document.getElementById('spinBtn');
if (spinBtn) spinBtn.textContent = t('spin');
const minesStartBtn = document.getElementById('minesStartBtn');
if (minesStartBtn) minesStartBtn.textContent = t('startGame');
const minesCashoutBtn = document.getElementById('minesCashoutBtn');
if (minesCashoutBtn) minesCashoutBtn.textContent = t('cashout');
document.querySelectorAll('.bet-label').forEach(el => el.textContent = t('bet'));
const betRed = document.querySelector('#betRed .bet-label-text');
if (betRed) betRed.textContent = t('red');
const betBlack = document.querySelector('#betBlack .bet-label-text');
if (betBlack) betBlack.textContent = t('black');
const betGreen = document.querySelector('#betGreen .bet-label-text');
if (betGreen) betGreen.textContent = t('green');
renderAchievements();
}

function addCoins() {
gameState.balance += 1000;
updateUI();
saveGame();
showCoinAnimation();
showMessage(t('coinsAdded'), 'win');
}

function showCoinAnimation() {
const addBtn = document.getElementById('addCoinsBtn');
if (!addBtn) return;
const coin = document.createElement('div');
coin.className = 'coin-animation';
coin.textContent = '🪙';
coin.style.left = addBtn.offsetLeft + 'px';
coin.style.top = addBtn.offsetTop + 'px';
document.body.appendChild(coin);
setTimeout(() => coin.remove(), 1000);
}

function changeBet(delta) {
const newBet = gameState.bet + delta;
if (newBet >= 10 && newBet <= 100 && newBet <= gameState.balance) {
    gameState.bet = newBet;
    updateUI();
}
}

function showMessage(text, type = '') {
const messageEl = document.getElementById('message');
if (!messageEl) return;
messageEl.textContent = text;
messageEl.className = 'message ' + type;
setTimeout(() => {
    messageEl.textContent = '';
    messageEl.className = 'message';
}, 3000);
}

function updateWinStreakDisplay() {
let streakEl = document.getElementById('winStreakIndicator');
if (gameState.winStreak >= 2) {
    if (!streakEl) {
        streakEl = document.createElement('div');
        streakEl.id = 'winStreakIndicator';
        streakEl.className = 'win-streak-indicator';
        document.body.appendChild(streakEl);
    }
    streakEl.innerHTML = `
        <div class="win-streak-flame">🔥</div>
        <div class="win-streak-count">${gameState.winStreak}</div>
        <div class="win-streak-text">ПОБЕДЫ ПОДРЯД!</div>
    `;
    streakEl.classList.add('show');
    if (gameState.winStreak >= 5) streakEl.classList.add('mega');
    else if (gameState.winStreak >= 3) streakEl.classList.add('big');
} else {
    if (streakEl) streakEl.classList.remove('show', 'big', 'mega');
}
}

// ============= СЛОТЫ =============

async function spin() {
if (gameState.isSpinning || gameState.balance < gameState.bet) {
    if (gameState.balance < gameState.bet) showMessage(t('notEnoughCoins'), 'lose');
    return;
}
gameState.isSpinning = true;
gameState.totalSpins++;
const spinBtn = document.getElementById('spinBtn');
if (spinBtn) spinBtn.disabled = true;
const betAmount = gameState.bet;
gameState.balance -= betAmount;
updateUI();
const messageEl = document.getElementById('message');
if (messageEl) messageEl.textContent = '';
const slot1 = document.getElementById('slot1');
const slot2 = document.getElementById('slot2');
const slot3 = document.getElementById('slot3');
if (!slot1 || !slot2 || !slot3) return;
const slots = [slot1, slot2, slot3];
const intervals = [];
slots.forEach((slot) => {
    slot.parentElement.classList.add('spinning');
    const interval = setInterval(() => {
        slot.textContent = symbols[Math.floor(Math.random() * symbols.length)];
    }, 100);
    intervals.push(interval);
});
setTimeout(() => {
    clearInterval(intervals[0]);
    slot1.parentElement.classList.remove('spinning');
    slot1.textContent = symbols[Math.floor(Math.random() * symbols.length)];
}, 1500);
setTimeout(() => {
    clearInterval(intervals[1]);
    slot2.parentElement.classList.remove('spinning');
    slot2.textContent = symbols[Math.floor(Math.random() * symbols.length)];
}, 2000);
setTimeout(() => {
    clearInterval(intervals[2]);
    slot3.parentElement.classList.remove('spinning');
    slot3.textContent = symbols[Math.floor(Math.random() * symbols.length)];
    checkWin(betAmount);
}, 2500);
}

function checkWin(betAmount) {
const slot1 = document.getElementById('slot1');
const slot2 = document.getElementById('slot2');
const slot3 = document.getElementById('slot3');
if (!slot1 || !slot2 || !slot3) return;
const symbol1 = slot1.textContent;
const symbol2 = slot2.textContent;
const symbol3 = slot3.textContent;
let winAmount = 0;
if (symbol1 === symbol2 && symbol2 === symbol3) {
    if (symbol1 === '💎') winAmount = betAmount * 10;
    else if (symbol1 === '⭐') winAmount = betAmount * 7;
    else winAmount = betAmount * 5;
} else if (symbol1 === symbol2 || symbol2 === symbol3 || symbol1 === symbol3) {
    winAmount = betAmount * 2;
}
if (winAmount > 0) {
    gameState.balance += winAmount;
    gameState.totalWins++;
    gameState.winStreak++;
    if (winAmount > gameState.biggestWin) gameState.biggestWin = winAmount;
    createWinEffects(winAmount);
    addXP(10);
    addToHistory('slots', betAmount, 'win', winAmount);
    updateUI();
    saveGame();
    updateWinStreakDisplay();
    updateAchievements();
    showMessage(`${t('youWon')} ${winAmount} ${t('coins')} 🎉`, 'win');
} else {
    addXP(2);
    gameState.winStreak = 0;
    addToHistory('slots', betAmount, 'lose', -betAmount);
    updateWinStreakDisplay();
    showMessage(t('notLucky'), 'lose');
    saveGame();
    updateAchievements();
}
gameState.isSpinning = false;
const spinBtn = document.getElementById('spinBtn');
if (spinBtn) spinBtn.disabled = false;
}

// ============= РУЛЕТКА =============

let rouletteSpinning = false;

function spinRoulette(betType) {
const wheelBet = parseInt(document.getElementById('wheelBetAmount').textContent);
if (rouletteSpinning || gameState.balance < wheelBet) {
    if (gameState.balance < wheelBet) showWheelMessage(t('notEnoughCoins'), 'lose');
    return;
}
rouletteSpinning = true;
gameState.totalSpins++;
document.getElementById('betRed').disabled = true;
document.getElementById('betBlack').disabled = true;
document.getElementById('betGreen').disabled = true;
gameState.balance -= wheelBet;
updateUI();
const wheel = document.getElementById('rouletteWheel');
const numberEl = document.getElementById('rouletteNumber');
wheel.classList.add('spinning');
numberEl.textContent = '?';
const random = Math.random();
let winningNumber, winningColor;
if (random < 0.027) {
    winningNumber = 0;
    winningColor = 'green';
} else if (random < 0.5135) {
    winningNumber = rouletteNumbers.red[Math.floor(Math.random() * rouletteNumbers.red.length)];
    winningColor = 'red';
} else {
    winningNumber = rouletteNumbers.black[Math.floor(Math.random() * rouletteNumbers.black.length)];
    winningColor = 'black';
}
setTimeout(() => {
    wheel.classList.remove('spinning');
    numberEl.textContent = winningNumber;
    let won = false, multiplier = 0;
    if (betType === 'red' && winningColor === 'red') { won = true; multiplier = 2; }
    else if (betType === 'black' && winningColor === 'black') { won = true; multiplier = 2; }
    else if (betType === 'green' && winningColor === 'green') { won = true; multiplier = 14; }
    if (won) {
        const winAmount = wheelBet * multiplier;
        gameState.balance += winAmount;
        gameState.totalWins++;
        gameState.winStreak++;
        if (winAmount > gameState.biggestWin) gameState.biggestWin = winAmount;
        addXP(15);
        createWinEffects(winAmount);
        addToHistory('wheel', wheelBet, 'win', winAmount);
        updateUI();
        saveGame();
        updateWinStreakDisplay();
        updateAchievements();
        const colorName = betType === 'red' ? t('red') : betType === 'black' ? t('black') : t('green');
        showWheelMessage(`${colorName} ${winningNumber}! ${t('youWon')} ${winAmount} ${t('coins')} 🎉`, 'win');
    } else {
        addXP(3);
        gameState.winStreak = 0;
        addToHistory('wheel', wheelBet, 'lose', -wheelBet);
        updateWinStreakDisplay();
        const colorName = winningColor === 'red' ? t('red') : winningColor === 'black' ? t('black') : t('green');
        showWheelMessage(`${colorName} ${winningNumber}. ${t('notLucky')}`, 'lose');
        saveGame();
        updateAchievements();
    }
    rouletteSpinning = false;
    document.getElementById('betRed').disabled = false;
    document.getElementById('betBlack').disabled = false;
    document.getElementById('betGreen').disabled = false;
}, 3000);
}

function changeWheelBet(delta) {
const betEl = document.getElementById('wheelBetAmount');
if (!betEl) return;
let bet = parseInt(betEl.textContent);
bet = Math.max(10, Math.min(1000, bet + delta));
betEl.textContent = bet;
}

function showWheelMessage(text, type = '') {
const messageEl = document.getElementById('wheelMessage');
if (!messageEl) return;
messageEl.textContent = text;
messageEl.className = 'message ' + type;
setTimeout(() => {
    messageEl.textContent = '';
    messageEl.className = 'message';
}, 3000);
}

// ============= МИНЫ =============

const minesState = {
grid: [],
minesCount: 5,
revealed: 0,
gameActive: false,
bet: 10
};

function resetMinesGame() {
minesState.grid = [];
minesState.revealed = 0;
minesState.gameActive = false;
const grid = document.getElementById('minesGrid');
if (!grid) return;
grid.innerHTML = '';
for (let i = 0; i < 25; i++) {
    const cell = document.createElement('div');
    cell.className = 'mine-cell';
    cell.dataset.index = i;
    cell.textContent = '?';
    cell.addEventListener('click', () => handleMineClick(i));
    grid.appendChild(cell);
}
document.getElementById('minesMultiplier').textContent = 'x1.00';
document.getElementById('minesPotentialWin').textContent = '0';
document.getElementById('minesBetContainer').classList.remove('hidden');
document.getElementById('minesStartBtn').classList.remove('hidden');
document.getElementById('minesCashoutBtn').classList.add('hidden');
}

function startMinesGame() {
    const bet = parseInt(document.getElementById('minesBetAmount').textContent);
    if (gameState.balance < bet) {
        showMinesMessage(t('notEnoughCoins'), 'lose');
        return;
    }
    gameState.balance -= bet;
    minesState.bet = bet;
    minesState.gameActive = true;
    minesState.revealed = 0;
    gameState.totalSpins++;
    updateUI();
    minesState.grid = Array(25).fill(false);
    const minePositions = [];
    while (minePositions.length < minesState.minesCount) {
        const pos = Math.floor(Math.random() * 25);
        if (!minePositions.includes(pos)) {
            minePositions.push(pos);
            minesState.grid[pos] = true;
        }
    }
    const cells = document.querySelectorAll('.mine-cell');
    cells.forEach(cell => {
        cell.classList.remove('disabled', 'revealed', 'mine');
        cell.textContent = '?';
    });
    document.getElementById('minesBetContainer').classList.add('hidden');
    document.getElementById('minesStartBtn').classList.add('hidden');
    document.getElementById('minesCashoutBtn').classList.remove('hidden');
    updateMinesMultiplier();
}

function handleMineClick(index) {
if (!minesState.gameActive) return;
const cell = document.querySelector(`.mine-cell[data-index="${index}"]`);
if (cell.classList.contains('revealed') || cell.classList.contains('mine')) return;
if (minesState.grid[index]) {
    cell.classList.add('mine');
    cell.textContent = '💣';
    createMineExplosion(cell);
    setTimeout(() => endMinesGame(false), 1000);
} else {
    cell.classList.add('revealed');
    cell.textContent = '💎';
    minesState.revealed++;
    updateMinesMultiplier();
    if (minesState.revealed >= 25 - minesState.minesCount) endMinesGame(true);
}
}

function updateMinesMultiplier() {
const multiplier = 1 + (minesState.revealed * 0.4);
const potentialWin = Math.floor(minesState.bet * multiplier);
document.getElementById('minesMultiplier').textContent = 'x' + multiplier.toFixed(2);
document.getElementById('minesPotentialWin').textContent = potentialWin;
}

function cashoutMines() {
if (!minesState.gameActive || minesState.revealed === 0) return;
const multiplier = 1 + (minesState.revealed * 0.4);
const winAmount = Math.floor(minesState.bet * multiplier);
gameState.balance += winAmount;
gameState.totalWins++;
gameState.winStreak++;
if (winAmount > gameState.biggestWin) gameState.biggestWin = winAmount;
addXP(20);
if (winAmount >= 100) createWinEffects(winAmount);
else createConfetti(30);
addToHistory('mines', minesState.bet, 'win', winAmount);
updateUI();
saveGame();
updateWinStreakDisplay();
updateAchievements();
showMinesMessage(`${t('youCashed')} ${winAmount} ${t('coins')} 💰`, 'win');
minesState.gameActive = false;
const cells = document.querySelectorAll('.mine-cell');
cells.forEach((cell, index) => {
    cell.classList.add('disabled');
    if (minesState.grid[index] && !cell.classList.contains('mine')) {
        cell.textContent = '💣';
        cell.style.opacity = '0.5';
    }
});
document.getElementById('minesCashoutBtn').classList.add('hidden');
setTimeout(() => resetMinesGame(), 2000);
}

function endMinesGame(won) {
minesState.gameActive = false;
const cells = document.querySelectorAll('.mine-cell');
cells.forEach((cell, index) => {
    cell.classList.add('disabled');
    if (minesState.grid[index]) {
        cell.classList.add('mine');
        cell.textContent = '💣';
    } else if (!cell.classList.contains('revealed')) {
        cell.textContent = '💎';
        cell.style.opacity = '0.5';
    }
});
if (won) {
    const multiplier = 1 + (minesState.revealed * 0.4);
    const winAmount = Math.floor(minesState.bet * multiplier);
    gameState.balance += winAmount;
    gameState.totalWins++;
    gameState.winStreak++;
    if (winAmount > gameState.biggestWin) gameState.biggestWin = winAmount;
    addXP(20);
    if (winAmount >= 100) createWinEffects(winAmount);
    else createConfetti(30);
    addToHistory('mines', minesState.bet, 'win', winAmount);
    updateUI();
    saveGame();
    updateWinStreakDisplay();
    updateAchievements();
    showMinesMessage(`${t('youWonAmount')} ${winAmount} ${t('coins')} 🎉`, 'win');
} else {
    addXP(5);
    gameState.winStreak = 0;
    addToHistory('mines', minesState.bet, 'lose', -minesState.bet);
    updateWinStreakDisplay();
    showMinesMessage(t('exploded'), 'lose');
    saveGame();
    updateAchievements();
}
document.getElementById('minesCashoutBtn').classList.add('hidden');
setTimeout(() => resetMinesGame(), 2000);
}

function showMinesMessage(text, type = '') {
const messageEl = document.getElementById('minesMessage');
if (!messageEl) return;
messageEl.textContent = text;
messageEl.className = 'message ' + type;
setTimeout(() => {
    messageEl.textContent = '';
    messageEl.className = 'message';
}, 3000);
}

// ============= МАКСИМАЛЬНЫЕ ЭФФЕКТЫ =============

function createWinEffects(winAmount) {
createExplosionWave();
createEnhancedConfetti(50);
createFlyingCoins(10);

if (winAmount >= 500) {
    createLightBeams();
    createCornerFlashes();
    createFloatingParticles(30);
    createRainbowWaves();
    createSoundWaves();
    createStarBurst(20);
    createRadialPulse();
    createFireworks(5);
}

if (winAmount >= 1000) {
    createRotatingRings();
    createGoldRain(20);
    createSpiralSparks(25);
    createCoinMatrix(15);
    createBackgroundPulse();
    showBigWinEffect(winAmount);
    createFireworks(10);
    createGoldRain(40);
}

animateWinningSlots();
}

function createExplosionWave() {
const wave = document.createElement('div');
wave.className = 'win-explosion';
document.body.appendChild(wave);
setTimeout(() => wave.remove(), 800);
}

function createEnhancedConfetti(count) {
const colors = ['#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff', '#00ffff', '#ffd700', '#ff6347'];
for (let i = 0; i < count; i++) {
    setTimeout(() => {
        const confetti = document.createElement('div');
        confetti.className = 'confetti-enhanced';
        const startX = Math.random() * window.innerWidth;
        const endX = (Math.random() - 0.5) * 400;
        const duration = 2 + Math.random() * 2;
        confetti.style.left = startX + 'px';
        confetti.style.top = '-20px';
        confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
        confetti.style.setProperty('--x-end', endX + 'px');
        confetti.style.setProperty('--fall-duration', duration + 's');
        const shapes = ['square', 'circle', 'triangle'];
        const shape = shapes[Math.floor(Math.random() * shapes.length)];
        if (shape === 'circle') confetti.style.borderRadius = '50%';
        else if (shape === 'triangle') confetti.style.clipPath = 'polygon(50% 0%, 0% 100%, 100% 100%)';
        document.body.appendChild(confetti);
        setTimeout(() => confetti.remove(), duration * 1000);
    }, i * 15);
}
}

function createFlyingCoins(count) {
const balanceEl = document.getElementById('balance');
if (!balanceEl) return;
const targetRect = balanceEl.getBoundingClientRect();
const targetX = targetRect.left + targetRect.width / 2;
const targetY = targetRect.top + targetRect.height / 2;
for (let i = 0; i < count; i++) {
    setTimeout(() => {
        const coin = document.createElement('div');
        coin.className = 'flying-coin';
        coin.textContent = '🪙';
        const startX = window.innerWidth / 2 + (Math.random() - 0.5) * 300;
        const startY = window.innerHeight / 2 + (Math.random() - 0.5) * 300;
        coin.style.left = startX + 'px';
        coin.style.top = startY + 'px';
        coin.style.setProperty('--tx', (targetX - startX) + 'px');
        coin.style.setProperty('--ty', (targetY - startY) + 'px');
        document.body.appendChild(coin);
        setTimeout(() => coin.remove(), 1000);
    }, i * 40);
}
}

function createLightBeams() {
const slots = document.querySelectorAll('.slot');
slots.forEach((slot, index) => {
    setTimeout(() => {
        const rect = slot.getBoundingClientRect();
        const beam = document.createElement('div');
        beam.className = 'light-beam';
        beam.style.left = (rect.left + rect.width / 2 - 50) + 'px';
        beam.style.bottom = '0px';
        document.body.appendChild(beam);
        setTimeout(() => beam.remove(), 2000);
    }, index * 100);
});
}

function createCornerFlashes() {
const positions = ['top-left', 'top-right', 'bottom-left', 'bottom-right'];
positions.forEach((pos, index) => {
    setTimeout(() => {
        const flash = document.createElement('div');
        flash.className = `corner-flash ${pos}`;
        document.body.appendChild(flash);
        setTimeout(() => flash.remove(), 1000);
    }, index * 100);
});
}

function createFireworks(count) {
for (let i = 0; i < count; i++) {
    setTimeout(() => {
        const x = Math.random() * (window.innerWidth - 200) + 100;
        const y = Math.random() * (window.innerHeight * 0.6);
        launchFirework(x, y);
    }, i * 300);
}
}

function launchFirework(x, y) {
const colors = ['#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff', '#ffd700'];
const color = colors[Math.floor(Math.random() * colors.length)];
const trail = document.createElement('div');
trail.className = 'firework';
trail.innerHTML = '<div class="firework-trail"></div>';
trail.style.left = x + 'px';
trail.style.bottom = '0px';
trail.style.setProperty('--firework-color', color);
document.body.appendChild(trail);
setTimeout(() => {
    trail.remove();
    const burst = document.createElement('div');
    burst.className = 'firework';
    burst.innerHTML = '<div class="firework-burst"></div>';
    burst.style.left = x + 'px';
    burst.style.top = y + 'px';
    burst.style.setProperty('--firework-color', color);
    document.body.appendChild(burst);
    setTimeout(() => burst.remove(), 800);
}, 1000);
}

function createFloatingParticles(count) {
const colors = ['#ffd700', '#ffed4e', '#ffc700', '#fff700'];
for (let i = 0; i < count; i++) {
    setTimeout(() => {
        const particle = document.createElement('div');
        particle.className = 'float-particle';
        const startX = Math.random() * window.innerWidth;
        const startY = Math.random() * window.innerHeight;
        const endX = (Math.random() - 0.5) * 400;
        const endY = -200 - Math.random() * 300;
        particle.style.left = startX + 'px';
        particle.style.top = startY + 'px';
        particle.style.setProperty('--tx', endX + 'px');
        particle.style.setProperty('--ty', endY + 'px');
        particle.style.setProperty('--particle-color', colors[Math.floor(Math.random() * colors.length)]);
        document.body.appendChild(particle);
        setTimeout(() => particle.remove(), 3000);
    }, i * 40);
}
}

function createRainbowWaves() {
for (let i = 0; i < 6; i++) {
    const wave = document.createElement('div');
    wave.className = 'rainbow-wave';
    document.body.appendChild(wave);
    setTimeout(() => wave.remove(), 2000);
}
}

function createSoundWaves() {
for (let i = 0; i < 5; i++) {
    setTimeout(() => {
        const wave = document.createElement('div');
        wave.className = 'sound-wave';
        document.body.appendChild(wave);
        setTimeout(() => wave.remove(), 800);
    }, i * 150);
}
}

function createStarBurst(count) {
const centerX = window.innerWidth / 2;
const centerY = window.innerHeight / 2;
for (let i = 0; i < count; i++) {
    setTimeout(() => {
        const star = document.createElement('div');
        star.className = 'star-burst';
        star.textContent = '⭐';
        const angle = (Math.PI * 2 * i) / count;
        const distance = 150 + Math.random() * 250;
        const tx = Math.cos(angle) * distance;
        const ty = Math.sin(angle) * distance;
        star.style.left = centerX + 'px';
        star.style.top = centerY + 'px';
        star.style.setProperty('--tx', tx + 'px');
        star.style.setProperty('--ty', ty + 'px');
        document.body.appendChild(star);
        setTimeout(() => star.remove(), 1500);
    }, i * 25);
}
}

function createRadialPulse() {
for (let i = 0; i < 5; i++) {
    setTimeout(() => {
        const pulse = document.createElement('div');
        pulse.className = 'radial-pulse';
        document.body.appendChild(pulse);
        setTimeout(() => pulse.remove(), 1000);
    }, i * 150);
}
}

function createRotatingRings() {
for (let i = 0; i < 4; i++) {
    setTimeout(() => {
        const ring = document.createElement('div');
        ring.className = 'rotating-ring';
        ring.style.animationDelay = (i * 0.2) + 's';
        document.body.appendChild(ring);
        setTimeout(() => ring.remove(), 2200);
    }, i * 200);
}
}

function createGoldRain(count) {
for (let i = 0; i < count; i++) {
    setTimeout(() => {
        const rain = document.createElement('div');
        rain.className = 'gold-rain';
        rain.style.left = Math.random() * window.innerWidth + 'px';
        rain.style.top = '-20px';
        rain.style.setProperty('--duration', (2 + Math.random() * 2) + 's');
        document.body.appendChild(rain);
        setTimeout(() => rain.remove(), 4000);
    }, i * 50);
}
}

function createSpiralSparks(count) {
const colors = ['#ffd700', '#ff6b00', '#ff0000', '#ffed4e'];
for (let i = 0; i < count; i++) {
    setTimeout(() => {
        const spark = document.createElement('div');
        spark.className = 'spiral-spark';
        spark.style.setProperty('--rotation', (720 + Math.random() * 360) + 'deg');
        spark.style.setProperty('--spark-color', colors[Math.floor(Math.random() * colors.length)]);
        spark.style.animationDelay = (Math.random() * 0.5) + 's';
        document.body.appendChild(spark);
        setTimeout(() => spark.remove(), 2500);
    }, i * 50);
}
}

function createCoinMatrix(count) {
const coinSymbols = ['💰', '💎', '🪙', '💵', '💴'];
for (let i = 0; i < count; i++) {
    setTimeout(() => {
        const coin = document.createElement('div');
        coin.className = 'matrix-coin';
        coin.textContent = coinSymbols[Math.floor(Math.random() * coinSymbols.length)];
        coin.style.left = Math.random() * window.innerWidth + 'px';
        coin.style.top = '-50px';
        coin.style.setProperty('--duration', (3 + Math.random() * 3) + 's');
        document.body.appendChild(coin);
        setTimeout(() => coin.remove(), 6000);
    }, i * 100);
}
}

function createBackgroundPulse() {
const pulse = document.createElement('div');
pulse.className = 'win-background-pulse';
document.body.appendChild(pulse);
setTimeout(() => pulse.remove(), 3000);
}

function showBigWinEffect(amount) {
    let wrapper = document.getElementById('bigWinEffectWrapper');
    if (!wrapper) {
        wrapper = document.createElement('div');
        wrapper.id = 'bigWinEffectWrapper';
        wrapper.className = 'big-win-effect-wrapper';
        document.body.appendChild(wrapper);
    }
    wrapper.innerHTML = '';
    // Big win banner
    const banner = document.createElement('div');
    banner.className = 'big-win-banner';
    banner.textContent = 'BIG WIN!';
    wrapper.appendChild(banner);
    // Coin counter
    const counter = document.createElement('div');
    counter.className = 'coin-counter';
    counter.textContent = '+0';
    wrapper.appendChild(counter);
    // Анимация "+amount"
    let currentAmount = 0;
    const increment = Math.ceil(amount / 50);
    const interval = setInterval(() => {
        currentAmount += increment;
        if (currentAmount >= amount) {
            currentAmount = amount;
            clearInterval(interval);
            setTimeout(() => {
                wrapper.style.transition = 'opacity 0.5s';
                wrapper.style.opacity = '0';
                setTimeout(() => wrapper.remove(), 500);
            }, 1500);
        }
        counter.textContent = '+' + currentAmount;
    }, 30);
}

function animateWinningSlots() {
const slots = document.querySelectorAll('.slot');
slots.forEach(slot => slot.classList.add('win-animation'));
setTimeout(() => {
    slots.forEach(slot => slot.classList.remove('win-animation'));
}, 1800);
}

// ============= АНИМАЦИЯ ВЗРЫВА МИНЫ =============

function createMineExplosion(cellElement) {
const minesGame = document.getElementById('minesGame');
if (minesGame) {
    minesGame.classList.add('shake-screen');
    setTimeout(() => minesGame.classList.remove('shake-screen'), 500);
}
createRedFlash();
createExplosionWaveOnCell(cellElement);
createExplosionParticles(cellElement, 30);
createFireParticles(cellElement, 20);
createSmokeEffect(cellElement);
}

function createRedFlash() {
const flash = document.createElement('div');
flash.className = 'red-flash-overlay';
document.body.appendChild(flash);
setTimeout(() => flash.remove(), 600);
}

function createExplosionWaveOnCell(cell) {
const wave = document.createElement('div');
wave.className = 'explosion-wave';
cell.style.position = 'relative';
cell.appendChild(wave);
setTimeout(() => wave.remove(), 600);
}

function createExplosionParticles(cell, count) {
const rect = cell.getBoundingClientRect();
const centerX = rect.left + rect.width / 2;
const centerY = rect.top + rect.height / 2;
const colors = ['#ff4500', '#ff6347', '#ff0000', '#dc143c', '#8b0000', '#ffa500'];
for (let i = 0; i < count; i++) {
    const particle = document.createElement('div');
    particle.className = 'explosion-particle';
    const angle = (Math.PI * 2 * i) / count + (Math.random() * 0.3);
    const distance = 60 + Math.random() * 120;
    const tx = Math.cos(angle) * distance;
    const ty = Math.sin(angle) * distance;
    particle.style.left = centerX + 'px';
    particle.style.top = centerY + 'px';
    particle.style.setProperty('--tx', tx + 'px');
    particle.style.setProperty('--ty', ty + 'px');
    particle.style.setProperty('--particle-color', colors[Math.floor(Math.random() * colors.length)]);
    document.body.appendChild(particle);
    setTimeout(() => particle.remove(), 800);
}
}

function createFireParticles(cell, count) {
const rect = cell.getBoundingClientRect();
const centerX = rect.left + rect.width / 2;
const centerY = rect.top + rect.height / 2;
for (let i = 0; i < count; i++) {
    setTimeout(() => {
        const fire = document.createElement('div');
        fire.className = 'fire-particle';
        const angle = Math.random() * Math.PI * 2;
        const distance = 40 + Math.random() * 80;
        const tx = Math.cos(angle) * distance;
        const ty = Math.sin(angle) * distance - 30;
        fire.style.left = centerX + 'px';
        fire.style.top = centerY + 'px';
        fire.style.setProperty('--tx', tx + 'px');
        fire.style.setProperty('--ty', ty + 'px');
        document.body.appendChild(fire);
        setTimeout(() => fire.remove(), 800);
    }, i * 25);
}
}

function createSmokeEffect(cell) {
for (let i = 0; i < 8; i++) {
    setTimeout(() => {
        const smoke = document.createElement('div');
        smoke.className = 'smoke-particle';
        smoke.style.animationDelay = (i * 0.1) + 's';
        smoke.style.animationDuration = (1.5 + Math.random() * 0.5) + 's';
        cell.style.position = 'relative';
        cell.appendChild(smoke);
        setTimeout(() => smoke.remove(), 2000);
    }, i * 80);
}
}

// ============= ИНИЦИАЛИЗАЦИЯ =============

document.addEventListener('DOMContentLoaded', () => {
console.log('🎰 Casino Bot загружен!');
loadGame();
updateAllTexts();

const settingsBtn = document.getElementById('settingsBtn');
if (settingsBtn) settingsBtn.addEventListener('click', toggleSettingsModal);
const settingsBtn2 = document.getElementById('settingsBtn2');
if (settingsBtn2) settingsBtn2.addEventListener('click', toggleSettingsModal);
const closeSettingsBtn = document.getElementById('closeSettingsBtn');
if (closeSettingsBtn) closeSettingsBtn.addEventListener('click', closeSettingsModal);
const settingsModal = document.getElementById('settingsModal');
if (settingsModal) {
    settingsModal.addEventListener('click', (e) => {
        if (e.target === settingsModal) closeSettingsModal();
    });
}

document.querySelectorAll('.theme-card').forEach(card => {
    card.addEventListener('click', () => {
        const theme = card.dataset.theme;
        changeTheme(theme);
    });
});

document.querySelectorAll('.language-card').forEach(card => {
    card.addEventListener('click', () => {
        const lang = card.dataset.lang;
        changeLanguage(lang);
    });
});

const achievementsBtn = document.getElementById('achievementsBtn');
if (achievementsBtn) achievementsBtn.addEventListener('click', toggleAchievementsModal);
const achievementsBtn2 = document.getElementById('achievementsBtn2');
if (achievementsBtn2) achievementsBtn2.addEventListener('click', toggleAchievementsModal);
const closeAchievementsBtn = document.getElementById('closeAchievementsBtn');
if (closeAchievementsBtn) closeAchievementsBtn.addEventListener('click', closeAchievementsModal);
const achievementsModal = document.getElementById('achievementsModal');
if (achievementsModal) {
    achievementsModal.addEventListener('click', (e) => {
        if (e.target === achievementsModal) closeAchievementsModal();
    });
}

const statsBtn = document.getElementById('statsBtn');
if (statsBtn) statsBtn.addEventListener('click', toggleStatsModal);
const statsBtn2 = document.getElementById('statsBtn2');
if (statsBtn2) statsBtn2.addEventListener('click', toggleStatsModal);
const closeStatsBtn = document.getElementById('closeStatsBtn');
if (closeStatsBtn) closeStatsBtn.addEventListener('click', closeStatsModal);
const statsModal = document.getElementById('statsModal');
if (statsModal) {
    statsModal.addEventListener('click', (e) => {
        if (e.target === statsModal) closeStatsModal();
    });
}

const backBtn = document.getElementById('backBtn');
if (backBtn) backBtn.addEventListener('click', () => showPage('menu'));
const playSlotsBtn = document.getElementById('playSlotsBtn');
if (playSlotsBtn) playSlotsBtn.addEventListener('click', () => showPage('slots'));
const playWheelBtn = document.getElementById('playWheelBtn');
if (playWheelBtn) playWheelBtn.addEventListener('click', () => showPage('wheel'));
const playMinesBtn = document.getElementById('playMinesBtn');
if (playMinesBtn) playMinesBtn.addEventListener('click', () => showPage('mines'));

const addCoinsBtn = document.getElementById('addCoinsBtn');
if (addCoinsBtn) addCoinsBtn.addEventListener('click', addCoins);

const decreaseBet = document.getElementById('decreaseBet');
if (decreaseBet) decreaseBet.addEventListener('click', () => changeBet(-10));
const increaseBet = document.getElementById('increaseBet');
if (increaseBet) increaseBet.addEventListener('click', () => changeBet(10));
const spinBtn = document.getElementById('spinBtn');
if (spinBtn) spinBtn.addEventListener('click', spin);

const wheelDecreaseBet = document.getElementById('wheelDecreaseBet');
if (wheelDecreaseBet) wheelDecreaseBet.addEventListener('click', () => changeWheelBet(-10));
const wheelIncreaseBet = document.getElementById('wheelIncreaseBet');
if (wheelIncreaseBet) wheelIncreaseBet.addEventListener('click', () => changeWheelBet(10));
const betRed = document.getElementById('betRed');
if (betRed) betRed.addEventListener('click', () => spinRoulette('red'));
const betBlack = document.getElementById('betBlack');
if (betBlack) betBlack.addEventListener('click', () => spinRoulette('black'));
const betGreen = document.getElementById('betGreen');
if (betGreen) betGreen.addEventListener('click', () => spinRoulette('green'));

function getValidatedBetValue(input) {
    let value = parseInt(input.value, 10);
    if (isNaN(value)) value = 10;
    value = Math.max(10, Math.min(100000, value));
    input.value = value;
    return value;
}

const minesDecreaseBet = document.getElementById('minesDecreaseBet');
if (minesDecreaseBet) minesDecreaseBet.addEventListener('click', () => {
    const betEl = document.getElementById('minesBetAmount');
    let bet = parseInt(betEl.textContent);
    bet = Math.max(10, bet - 10);
    betEl.textContent = bet;
});

const minesIncreaseBet = document.getElementById('minesIncreaseBet');
if (minesIncreaseBet) minesIncreaseBet.addEventListener('click', () => {
    const betEl = document.getElementById('minesBetAmount');
    let bet = parseInt(betEl.textContent);
    bet = Math.min(1000, bet + 10);
    betEl.textContent = bet;
});

const minesBetAmountInput = document.getElementById('minesBetAmount');
if (minesBetAmountInput) minesBetAmountInput.addEventListener('change', () => {
    getValidatedBetValue(minesBetAmountInput);
});

const minesStartBtn = document.getElementById('minesStartBtn');
if (minesStartBtn) minesStartBtn.addEventListener('click', startMinesGame);
const minesCashoutBtn = document.getElementById('minesCashoutBtn');
if (minesCashoutBtn) minesCashoutBtn.addEventListener('click', cashoutMines);

console.log('✅ Все обработчики событий подключены');
console.log('🎆 МАКСИМАЛЬНЫЕ ЭФФЕКТЫ ЗАГРУЖЕНЫ! 🎆');
});// ЗАМЕНИ ПОЛНОСТЬЮ СОДЕРЖИМОЕ script.js НА ЭТОТ КОД

// ============= ИНИЦИАЛИЗАЦИЯ =============

// Инициализация Telegram Web App
let tg = window.Telegram?.WebApp;
if (tg) {
tg.expand();
tg.ready();
}

// Переводы
const translations = {
ru: {
    casinoTitle: '🎰 CASINO',
    welcome: 'Добро пожаловать в казино!',
    level: 'Уровень',
    slots: 'Слоты',
    slotsDesc: 'Классический игровой автомат',
    roulette: 'Рулетка',
    rouletteDesc: 'Красное, чёрное или зелёное?',
    mines: 'Мины',
    minesDesc: 'Найди сокровища, избегая мин',
    back: '← Назад',
    spin: '🎰 КРУТИТЬ',
    bet: 'Ставка',
    startGame: '💣 НАЧАТЬ ИГРУ',
    cashout: '💰 ЗАБРАТЬ',
    red: 'КРАСНОЕ',
    black: 'ЧЁРНОЕ',
    green: 'ЗЕЛЁНОЕ (0)',
    achievements: '🏆 Достижения',
    stats: '📊 Твоя статистика',
    settings: '⚙️ Настройки',
    balance: 'Баланс',
    totalGames: 'Всего игр',
    wins: 'Выигрышей',
    biggestWin: 'Лучший выигрыш',
    history: '📜 История последних игр',
    historyEmpty: 'История пуста',
    theme: '🎨 Тема оформления',
    language: '🌐 Язык',
    themeLight: 'Светлая',
    themeDark: 'Тёмная',
    themeOled: 'OLED',
    multiplier: 'Множитель:',
    potentialWin: 'Возможный выигрыш:',
    notEnoughCoins: 'Недостаточно монет! 😢',
    youWon: 'Выигрыш:',
    coins: 'монет!',
    notLucky: 'Не повезло! Попробуй ещё! 😔',
    newLevel: '🎊 Новый уровень:',
    achievementUnlocked: '🏆 Достижение разблокировано:',
    coinsAdded: '+ 1000 монет! 🎉',
    youCashed: 'Ты забрал',
    youWonAmount: 'Ты выиграл',
    exploded: 'Взорвался! 💥 Попробуй ещё раз!',
    achFirstWin: 'Первая победа',
    achFirstWinDesc: 'Выиграй первую игру',
    achRich: 'Богач',
    achRichDesc: 'Накопи 5000 монет',
    achGambler: 'Азартный',
    achGamblerDesc: 'Сыграй 50 игр',
    achLucky: 'Везунчик',
    achLuckyDesc: 'Выиграй 1000+ за раз',
    achVeteran: 'Ветеран',
    achVeteranDesc: 'Достигни 5 уровня',
    achMillionaire: 'Миллионер',
    achMillionaireDesc: 'Накопи 10000 монет',
    achSlotsMaster: 'Мастер слотов',
    achSlotsMasterDesc: 'Сыграй 100 раз в слоты',
    achRouletteKing: 'Король рулетки',
    achRouletteKingDesc: 'Сыграй 100 раз в рулетку',
    achMinesExpert: 'Эксперт мин',
    achMinesExpertDesc: 'Сыграй 100 раз в мины',
    achWinStreak: 'Серия побед',
    achWinStreakDesc: 'Выиграй 5 раз подряд',
    achBigSpender: 'Крупный игрок',
    achBigSpenderDesc: 'Поставь 100+ за раз',
    achJackpot: 'Джекпот!',
    achJackpotDesc: 'Выиграй 5000+ за раз',
    achPersistent: 'Настойчивый',
    achPersistentDesc: 'Сыграй 200 игр',
    achLegend: 'Легенда',
    achLegendDesc: 'Достигни 10 уровня',
    achChampion: 'Чемпион',
    achChampionDesc: 'Выиграй 100 игр'
},
en: {
    casinoTitle: '🎰 CASINO',
    welcome: 'Welcome to the casino!',
    level: 'Level',
    slots: 'Slots',
    slotsDesc: 'Classic slot machine',
    roulette: 'Roulette',
    rouletteDesc: 'Red, black or green?',
    mines: 'Mines',
    minesDesc: 'Find treasures, avoid mines',
    back: '← Back',
    spin: '🎰 SPIN',
    bet: 'Bet',
    startGame: '💣 START GAME',
    cashout: '💰 CASHOUT',
    red: 'RED',
    black: 'BLACK',
    green: 'GREEN (0)',
    achievements: '🏆 Achievements',
    stats: '📊 Your Statistics',
    settings: '⚙️ Settings',
    balance: 'Balance',
    totalGames: 'Total Games',
    wins: 'Wins',
    biggestWin: 'Biggest Win',
    history: '📜 Recent Game History',
    historyEmpty: 'History is empty',
    theme: '🎨 Theme',
    language: '🌐 Language',
    themeLight: 'Light',
    themeDark: 'Dark',
    themeOled: 'OLED',
    multiplier: 'Multiplier:',
    potentialWin: 'Potential Win:',
    notEnoughCoins: 'Not enough coins! 😢',
    youWon: 'You won:',
    coins: 'coins!',
    notLucky: 'Not lucky! Try again! 😔',
    newLevel: '🎊 New level:',
    achievementUnlocked: '🏆 Achievement unlocked:',
    coinsAdded: '+ 1000 coins! 🎉',
    youCashed: 'You cashed out',
    youWonAmount: 'You won',
    exploded: 'Exploded! 💥 Try again!',
    achFirstWin: 'First Victory',
    achFirstWinDesc: 'Win your first game',
    achRich: 'Rich',
    achRichDesc: 'Earn 5000 coins',
    achGambler: 'Gambler',
    achGamblerDesc: 'Play 50 games',
    achLucky: 'Lucky',
    achLuckyDesc: 'Win 1000+ at once',
    achVeteran: 'Veteran',
    achVeteranDesc: 'Reach level 5',
    achMillionaire: 'Millionaire',
    achMillionaireDesc: 'Earn 10000 coins',
    achSlotsMaster: 'Slots Master',
    achSlotsMasterDesc: 'Play slots 100 times',
    achRouletteKing: 'Roulette King',
    achRouletteKingDesc: 'Play roulette 100 times',
    achMinesExpert: 'Mines Expert',
    achMinesExpertDesc: 'Play mines 100 times',
    achWinStreak: 'Win Streak',
    achWinStreakDesc: 'Win 5 times in a row',
    achBigSpender: 'Big Spender',
    achBigSpenderDesc: 'Bet 100+ at once',
    achJackpot: 'Jackpot!',
    achJackpotDesc: 'Win 5000+ at once',
    achPersistent: 'Persistent',
    achPersistentDesc: 'Play 200 games',
    achLegend: 'Legend',
    achLegendDesc: 'Reach level 10',
    achChampion: 'Champion',
    achChampionDesc: 'Win 100 games'
}
};

// Состояние игры
const gameState = {
balance: 1000,
bet: 10,
isSpinning: false,
totalSpins: 0,
totalWins: 0,
biggestWin: 0,
currentPage: 'menu',
currentGame: null,
level: 1,
xp: 0,
maxXP: 100,
achievements: [],
gameHistory: [],
gamesPlayed: { slots: 0, wheel: 0, mines: 0 },
winStreak: 0,
maxBet: 10,
settings: {
    theme: 'light',
    language: 'ru'
}
};

// Достижения
const achievements = [
{ id: 'first_win', nameKey: 'achFirstWin', descKey: 'achFirstWinDesc', icon: '🎉', reward: 100, requirement: () => gameState.totalWins >= 1 },
{ id: 'rich', nameKey: 'achRich', descKey: 'achRichDesc', icon: '💰', reward: 500, requirement: () => gameState.balance >= 5000 },
{ id: 'gambler', nameKey: 'achGambler', descKey: 'achGamblerDesc', icon: '🎰', reward: 250, requirement: () => gameState.totalSpins >= 50 },
{ id: 'lucky', nameKey: 'achLucky', descKey: 'achLuckyDesc', icon: '🍀', reward: 300, requirement: () => gameState.biggestWin >= 1000 },
{ id: 'veteran', nameKey: 'achVeteran', descKey: 'achVeteranDesc', icon: '⭐', reward: 1000, requirement: () => gameState.level >= 5 },
{ id: 'millionaire', nameKey: 'achMillionaire', descKey: 'achMillionaireDesc', icon: '💎', reward: 2000, requirement: () => gameState.balance >= 10000 },
{ id: 'slots_master', nameKey: 'achSlotsMaster', descKey: 'achSlotsMasterDesc', icon: '🎰', reward: 400, requirement: () => (gameState.gamesPlayed?.slots || 0) >= 100 },
{ id: 'roulette_king', nameKey: 'achRouletteKing', descKey: 'achRouletteKingDesc', icon: '👑', reward: 400, requirement: () => (gameState.gamesPlayed?.wheel || 0) >= 100 },
{ id: 'mines_expert', nameKey: 'achMinesExpert', descKey: 'achMinesExpertDesc', icon: '💣', reward: 400, requirement: () => (gameState.gamesPlayed?.mines || 0) >= 100 },
{ id: 'win_streak_5', nameKey: 'achWinStreak', descKey: 'achWinStreakDesc', icon: '🔥', reward: 600, requirement: () => gameState.winStreak >= 5 },
{ id: 'big_spender', nameKey: 'achBigSpender', descKey: 'achBigSpenderDesc', icon: '💵', reward: 200, requirement: () => gameState.maxBet >= 100 },
{ id: 'jackpot', nameKey: 'achJackpot', descKey: 'achJackpotDesc', icon: '🎊', reward: 1500, requirement: () => gameState.biggestWin >= 5000 },
{ id: 'persistent', nameKey: 'achPersistent', descKey: 'achPersistentDesc', icon: '💪', reward: 800, requirement: () => gameState.totalSpins >= 200 },
{ id: 'level_10', nameKey: 'achLegend', descKey: 'achLegendDesc', icon: '🏆', reward: 3000, requirement: () => gameState.level >= 10 },
{ id: 'winner_100', nameKey: 'achChampion', descKey: 'achChampionDesc', icon: '🥇', reward: 1000, requirement: () => gameState.totalWins >= 100 }
];

// Символы для слотов
const symbols = ['🎯', '🍋', '🍊', '🍇', '🍉', '⭐', '💎'];

// Числа рулетки
const rouletteNumbers = {
red: [1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36],
black: [2, 4, 6, 8, 10, 11, 13, 15, 17, 20, 22, 24, 26, 28, 29, 31, 33, 35],
green: [0]
};

// Загрузка сохранённых данных
function loadGame() {
const saved = localStorage.getItem('casinoGame');
if (saved) {
    const data = JSON.parse(saved);
    Object.assign(gameState, data);
    if (!gameState.gamesPlayed) gameState.gamesPlayed = { slots: 0, wheel: 0, mines: 0 };
    if (gameState.winStreak === undefined) gameState.winStreak = 0;
    if (gameState.maxBet === undefined) gameState.maxBet = 10;
    if (!gameState.settings) gameState.settings = { theme: 'light', language: 'ru' };
}
const theme = gameState.settings?.theme || 'light';
document.body.setAttribute('data-theme', theme);
updateUI();
updateAchievements();
updateHistory();
updateWinStreakDisplay();
}

// Сохранение данных
function saveGame() {
localStorage.setItem('casinoGame', JSON.stringify({
    balance: gameState.balance,
    bet: gameState.bet,
    totalSpins: gameState.totalSpins,
    totalWins: gameState.totalWins,
    biggestWin: gameState.biggestWin,
    level: gameState.level,
    xp: gameState.xp,
    maxXP: gameState.maxXP,
    achievements: gameState.achievements,
    gameHistory: gameState.gameHistory,
    gamesPlayed: gameState.gamesPlayed,
    winStreak: gameState.winStreak,
    maxBet: gameState.maxBet,
    settings: gameState.settings
}));
}

// Обновление UI
function updateUI() {
const balanceEl = document.getElementById('balance');
const betAmountEl = document.getElementById('betAmount');
if (balanceEl) balanceEl.textContent = gameState.balance;
if (betAmountEl) betAmountEl.textContent = gameState.bet;
updateMenuStats();
updateLevelUI();
}

// Обновление статистики в меню
function updateMenuStats() {
const menuBalanceTop = document.getElementById('menuBalanceTop');
const modalBalance = document.getElementById('modalBalance');
const modalSpins = document.getElementById('modalSpins');
const modalWins = document.getElementById('modalWins');
const modalBiggest = document.getElementById('modalBiggest');
if (menuBalanceTop) menuBalanceTop.textContent = gameState.balance;
if (modalBalance) modalBalance.textContent = gameState.balance;
if (modalSpins) modalSpins.textContent = gameState.totalSpins;
if (modalWins) modalWins.textContent = gameState.totalWins;
if (modalBiggest) modalBiggest.textContent = gameState.biggestWin;
}

// Обновление уровня
function updateLevelUI() {
const levelEl = document.getElementById('playerLevel');
const currentXPEl = document.getElementById('currentXP');
const maxXPEl = document.getElementById('maxXP');
const xpProgressEl = document.getElementById('xpProgress');
if (levelEl) levelEl.textContent = gameState.level;
if (currentXPEl) currentXPEl.textContent = gameState.xp;
if (maxXPEl) maxXPEl.textContent = gameState.maxXP;
if (xpProgressEl) {
    const percent = (gameState.xp / gameState.maxXP) * 100;
    xpProgressEl.style.width = percent + '%';
}
}

// Добавление опыта
function addXP(amount) {
gameState.xp += amount;
while (gameState.xp >= gameState.maxXP) {
    gameState.xp -= gameState.maxXP;
    gameState.level++;
    gameState.maxXP = Math.floor(gameState.maxXP * 1.5);
    showMessage(`${t('newLevel')} ${gameState.level}!`, 'win');
}
updateLevelUI();
saveGame();
}

// Обновление достижений
function updateAchievements() {
achievements.forEach(ach => {
    if (!gameState.achievements.includes(ach.id) && ach.requirement()) {
        gameState.achievements.push(ach.id);
        showAchievementUnlock(ach);
    }
});
renderAchievements();
saveGame();
}

// Отображение достижений
function renderAchievements() {
const grid = document.getElementById('achievementsGrid');
if (!grid) return;
grid.innerHTML = '';
achievements.forEach(ach => {
    const div = document.createElement('div');
    div.className = 'achievement-card ' + (gameState.achievements.includes(ach.id) ? 'unlocked' : 'locked');
    div.innerHTML = `
        <div class="achievement-card-icon">${ach.icon}</div>
        <div class="achievement-card-name">${t(ach.nameKey)}</div>
        <div class="achievement-card-desc">${t(ach.descKey)}</div>
    `;
    grid.appendChild(div);
});
}

function toggleAchievementsModal() {
const modal = document.getElementById('achievementsModal');
if (modal) {
    modal.classList.toggle('hidden');
    renderAchievements();
}
}

function closeAchievementsModal() {
const modal = document.getElementById('achievementsModal');
if (modal) modal.classList.add('hidden');
}

function showAchievementUnlock(achievement) {
showMessage(`${t('achievementUnlocked')} ${t(achievement.nameKey)}!`, 'win');
createConfetti(30);
}

function createConfetti(count) {
const colors = ['#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff', '#00ffff'];
for (let i = 0; i < count; i++) {
    setTimeout(() => {
        const confetti = document.createElement('div');
        confetti.className = 'confetti';
        confetti.style.left = Math.random() * 100 + '%';
        confetti.style.top = '-10px';
        confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
        confetti.style.animation = `confetti-fall ${2 + Math.random() * 2}s linear forwards`;
        confetti.style.animationDelay = Math.random() * 0.5 + 's';
        document.body.appendChild(confetti);
        setTimeout(() => confetti.remove(), 4000);
    }, i * 50);
}
}

// История игр
function addToHistory(game, bet, result, amount) {
const historyItem = { game, bet, result, amount, timestamp: Date.now() };
gameState.gameHistory.unshift(historyItem);
if (!gameState.gamesPlayed) gameState.gamesPlayed = { slots: 0, wheel: 0, mines: 0 };
if (gameState.gamesPlayed[game] !== undefined) gameState.gamesPlayed[game]++;
if (bet > gameState.maxBet) gameState.maxBet = bet;
if (gameState.gameHistory.length > 20) gameState.gameHistory = gameState.gameHistory.slice(0, 20);
updateHistory();
saveGame();
}

function updateHistory() {
const historyList = document.getElementById('historyList');
if (!historyList) return;
if (gameState.gameHistory.length === 0) {
    historyList.innerHTML = '<p class="empty-history">История пуста</p>';
    return;
}
historyList.innerHTML = '';
const gameIcons = { 'slots': '🎰', 'wheel': '🎡', 'mines': '💣', 'dice': '🎲' };
gameState.gameHistory.forEach(item => {
    const div = document.createElement('div');
    div.className = 'history-item';
    div.innerHTML = `
        <div class="history-game">${gameIcons[item.game] || '🎮'} ${item.game}</div>
        <div class="history-result">
            <span>Ставка: ${item.bet}</span>
            <span class="history-amount ${item.result}">${item.result === 'win' ? '+' : ''}${item.amount}</span>
        </div>
    `;
    historyList.appendChild(div);
});
}

function toggleStatsModal() {
const modal = document.getElementById('statsModal');
if (modal) {
    modal.classList.toggle('hidden');
    updateMenuStats();
    updateHistory();
}
}

function closeStatsModal() {
const modal = document.getElementById('statsModal');
if (modal) modal.classList.add('hidden');
}

function showPage(game) {
const menu = document.getElementById('mainMenu');
const gameSection = document.getElementById('gameSection');
const slotsGame = document.getElementById('slotsGame');
const wheelGame = document.getElementById('wheelGame');
const minesGame = document.getElementById('minesGame');
if (game === 'menu') {
    menu.classList.remove('hidden');
    gameSection.classList.add('hidden');
    updateMenuStats();
    updateAchievements();
    return;
}
menu.classList.add('hidden');
gameSection.classList.remove('hidden');
slotsGame.classList.add('hidden');
wheelGame.classList.add('hidden');
minesGame.classList.add('hidden');
if (game === 'slots') slotsGame.classList.remove('hidden');
else if (game === 'wheel') wheelGame.classList.remove('hidden');
else if (game === 'mines') {
    minesGame.classList.remove('hidden');
    resetMinesGame();
}
updateUI();
}