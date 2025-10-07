// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', () => {
    console.log('🎰 Casino Bot загружен!');
    loadGame();
    
    // Регистрация обработчиков для меню
    const themeToggle = document.getElementById('themeToggle');
    const backBtn = document.getElementById('backBtn');
    const playSlotsBtn = document.getElementById('playSlotsBtn');
    const playWheelBtn = document.getElementById('playWheelBtn');
    const playMinesBtn = document.getElementById('playMinesBtn');
    
    if (themeToggle) themeToggle.addEventListener('click', toggleTheme);
    if (backBtn) backBtn.addEventListener('click', () => showPage('menu'));
    if (playSlotsBtn) playSlotsBtn.addEventListener('click', () => showPage('game', 'slots'));
    if (playWheelBtn) playWheelBtn.addEventListener('click', () => showPage('game', 'wheel'));
    if (playMinesBtn) playMinesBtn.addEventListener('click', () => showPage('game', 'mines'));
    
    // Обработчики для слотов
    const addCoinsBtn = document.getElementById('addCoinsBtn');
    const decreaseBet = document.getElementById('decreaseBet');
    const increaseBet = document.getElementById('increaseBet');
    const spinBtn = document.getElementById('spinBtn');
    
    if (addCoinsBtn) addCoinsBtn// Инициализация Telegram Web App
let tg = window.Telegram?.WebApp;
if (tg) {
    tg.expand();
    tg.ready();
}

// Состояние игры
const gameState = {
    balance: 1000,
    bet: 10,
    isSpinning: false,
    totalSpins: 0,
    totalWins: 0,
    biggestWin: 0,
    currentPage: 'menu',
    currentGame: null // 'slots', 'wheel', 'mines'
};

// Символы для слотов
const symbols = ['🍒', '🍋', '🍊', '🍇', '🍉', '⭐', '💎'];

// Загрузка сохраненных данных
function loadGame() {
    const saved = localStorage.getItem('casinoGame');
    if (saved) {
        const data = JSON.parse(saved);
        Object.assign(gameState, data);
    }
    
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
        document.body.setAttribute('data-theme', savedTheme);
        const themeToggle = document.getElementById('themeToggle');
        if (themeToggle) {
            themeToggle.textContent = savedTheme === 'dark' ? '☀️' : '🌙';
        }
    }
    
    updateUI();
}

// Сохранение данных
function saveGame() {
    localStorage.setItem('casinoGame', JSON.stringify({
        balance: gameState.balance,
        bet: gameState.bet,
        totalSpins: gameState.totalSpins,
        totalWins: gameState.totalWins,
        biggestWin: gameState.biggestWin
    }));
}

// Обновление UI
function updateUI() {
    const balanceEl = document.getElementById('balance');
    const betAmountEl = document.getElementById('betAmount');
    
    if (balanceEl) balanceEl.textContent = gameState.balance;
    if (betAmountEl) betAmountEl.textContent = gameState.bet;
    
    updateMenuStats();
}

// Обновление статистики в меню
function updateMenuStats() {
    const menuBalance = document.getElementById('menuBalance');
    const menuSpins = document.getElementById('menuSpins');
    const menuWins = document.getElementById('menuWins');
    const menuBiggest = document.getElementById('menuBiggest');
    
    if (menuBalance) menuBalance.textContent = gameState.balance;
    if (menuSpins) menuSpins.textContent = gameState.totalSpins;
    if (menuWins) menuWins.textContent = gameState.totalWins;
    if (menuBiggest) menuBiggest.textContent = gameState.biggestWin;
}

// Навигация между страницами
function showPage(page, game = null) {
    gameState.currentPage = page;
    gameState.currentGame = game;
    
    const menu = document.getElementById('mainMenu');
    const gameSection = document.getElementById('gameSection');
    const slotsGame = document.getElementById('slotsGame');
    const wheelGame = document.getElementById('wheelGame');
    const minesGame = document.getElementById('minesGame');
    
    if (page === 'menu') {
        menu.classList.remove('hidden');
        gameSection.classList.add('hidden');
        updateMenuStats();
    } else {
        menu.classList.add('hidden');
        gameSection.classList.remove('hidden');
        
        // Скрываем все игры
        slotsGame.classList.add('hidden');
        wheelGame.classList.add('hidden');
        minesGame.classList.add('hidden');
        
        // Показываем нужную игру
        if (game === 'slots') {
            slotsGame.classList.remove('hidden');
        } else if (game === 'wheel') {
            wheelGame.classList.remove('hidden');
            initWheel();
        } else if (game === 'mines') {
            minesGame.classList.remove('hidden');
            resetMinesGame();
        }
        
        updateUI();
    }
}

// Смена темы
function toggleTheme() {
    const currentTheme = document.body.getAttribute('data-theme');
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    document.body.setAttribute('data-theme', newTheme);
    const themeToggle = document.getElementById('themeToggle');
    if (themeToggle) {
        themeToggle.textContent = newTheme === 'dark' ? '☀️' : '🌙';
    }
    localStorage.setItem('theme', newTheme);
}

// Добавить монеты
function addCoins() {
    gameState.balance += 1000;
    updateUI();
    saveGame();
    showCoinAnimation();
    showMessage('+ 1000 монет! 🎉', 'win');
}

// Анимация монет
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

// Изменение ставки
function changeBet(delta) {
    const newBet = gameState.bet + delta;
    if (newBet >= 10 && newBet <= 100 && newBet <= gameState.balance) {
        gameState.bet = newBet;
        updateUI();
    }
}

// Показать сообщение
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

// Функция вращения слотов
async function spin() {
    if (gameState.isSpinning || gameState.balance < gameState.bet) {
        if (gameState.balance < gameState.bet) {
            showMessage('Недостаточно монет! 😢', 'lose');
        }
        return;
    }

    gameState.isSpinning = true;
    gameState.totalSpins++;
    
    const spinBtn = document.getElementById('spinBtn');
    if (spinBtn) spinBtn.disabled = true;
    
    gameState.balance -= gameState.bet;
    updateUI();
    saveGame();
    
    const messageEl = document.getElementById('message');
    if (messageEl) messageEl.textContent = '';

    const slot1 = document.getElementById('slot1');
    const slot2 = document.getElementById('slot2');
    const slot3 = document.getElementById('slot3');
    
    if (!slot1 || !slot2 || !slot3) return;
    
    const slots = [slot1, slot2, slot3];
    const intervals = [];
    
    // Запускаем вращение каждого слота
    slots.forEach((slot) => {
        slot.parentElement.classList.add('spinning');
        
        const interval = setInterval(() => {
            slot.textContent = symbols[Math.floor(Math.random() * symbols.length)];
        }, 100);
        
        intervals.push(interval);
    });

    // Останавливаем слоты по очереди с задержкой
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
        checkWin();
    }, 2500);
}

// Проверка выигрыша
function checkWin() {
    const slot1 = document.getElementById('slot1');
    const slot2 = document.getElementById('slot2');
    const slot3 = document.getElementById('slot3');
    
    if (!slot1 || !slot2 || !slot3) return;
    
    const symbol1 = slot1.textContent;
    const symbol2 = slot2.textContent;
    const symbol3 = slot3.textContent;

    let winAmount = 0;

    // Все три символа совпадают
    if (symbol1 === symbol2 && symbol2 === symbol3) {
        if (symbol1 === '💎') {
            winAmount = gameState.bet * 10; // x10 для алмаза
        } else if (symbol1 === '⭐') {
            winAmount = gameState.bet * 7; // x7 для звезды
        } else {
            winAmount = gameState.bet * 5; // x5 для фруктов
        }
    }
    // Два символа совпадают
    else if (symbol1 === symbol2 || symbol2 === symbol3 || symbol1 === symbol3) {
        winAmount = gameState.bet * 2; // x2 за пару
    }

    if (winAmount > 0) {
        gameState.balance += winAmount;
        gameState.totalWins++;
        if (winAmount > gameState.biggestWin) {
            gameState.biggestWin = winAmount;
        }
        updateUI();
        saveGame();
        showMessage(`Выигрыш: ${winAmount} монет! 🎉`, 'win');
    } else {
        showMessage('Не повезло! Попробуй еще! 😔', 'lose');
        saveGame();
    }

    gameState.isSpinning = false;
    const spinBtn = document.getElementById('spinBtn');
    if (spinBtn) spinBtn.disabled = false;
}

// ============= КОЛЕСО ФОРТУНЫ =============

const wheelSegments = [
    { multiplier: 2, color: '#3b82f6', label: 'x2' },
    { multiplier: 5, color: '#8b5cf6', label: 'x5' },
    { multiplier: 3, color: '#10b981', label: 'x3' },
    { multiplier: 10, color: '#f59e0b', label: 'x10' },
    { multiplier: 2, color: '#3b82f6', label: 'x2' },
    { multiplier: 20, color: '#ef4444', label: 'x20' },
    { multiplier: 3, color: '#10b981', label: 'x3' },
    { multiplier: 50, color: '#ec4899', label: 'x50' }
];

let wheelCanvas, wheelCtx;
let wheelRotation = 0;
let wheelSpinning = false;

function initWheel() {
    wheelCanvas = document.getElementById('wheelCanvas');
    if (!wheelCanvas) return;
    
    wheelCtx = wheelCanvas.getContext('2d');
    drawWheel();
}

function drawWheel() {
    if (!wheelCtx || !wheelCanvas) return;
    
    const centerX = wheelCanvas.width / 2;
    const centerY = wheelCanvas.height / 2;
    const radius = 160;
    const segmentAngle = (2 * Math.PI) / wheelSegments.length;
    
    wheelCtx.clearRect(0, 0, wheelCanvas.width, wheelCanvas.height);
    wheelCtx.save();
    wheelCtx.translate(centerX, centerY);
    wheelCtx.rotate(wheelRotation);
    
    // Рисуем сегменты
    wheelSegments.forEach((segment, index) => {
        const startAngle = index * segmentAngle;
        const endAngle = startAngle + segmentAngle;
        
        // Сегмент
        wheelCtx.beginPath();
        wheelCtx.arc(0, 0, radius, startAngle, endAngle);
        wheelCtx.lineTo(0, 0);
        wheelCtx.fillStyle = segment.color;
        wheelCtx.fill();
        wheelCtx.strokeStyle = '#ffffff';
        wheelCtx.lineWidth = 3;
        wheelCtx.stroke();
        
        // Текст
        wheelCtx.save();
        wheelCtx.rotate(startAngle + segmentAngle / 2);
        wheelCtx.textAlign = 'center';
        wheelCtx.fillStyle = '#ffffff';
        wheelCtx.font = 'bold 24px Arial';
        wheelCtx.fillText(segment.label, radius * 0.7, 8);
        wheelCtx.restore();
    });
    
    // Центральный круг
    wheelCtx.beginPath();
    wheelCtx.arc(0, 0, 30, 0, 2 * Math.PI);
    wheelCtx.fillStyle = '#1a1a1a';
    wheelCtx.fill();
    wheelCtx.strokeStyle = '#ffffff';
    wheelCtx.lineWidth = 3;
    wheelCtx.stroke();
    
    wheelCtx.restore();
}

async function spinWheel() {
    const wheelBet = parseInt(document.getElementById('wheelBetAmount').textContent);
    
    if (wheelSpinning || gameState.balance < wheelBet) {
        if (gameState.balance < wheelBet) {
            showWheelMessage('Недостаточно монет! 😢', 'lose');
        }
        return;
    }
    
    wheelSpinning = true;
    gameState.totalSpins++;
    document.getElementById('wheelSpinBtn').disabled = true;
    gameState.balance -= wheelBet;
    updateUI();
    saveGame();
    
    // Определяем выигрышный сегмент
    const winningIndex = Math.floor(Math.random() * wheelSegments.length);
    const winningSegment = wheelSegments[winningIndex];
    
    // Рассчитываем конечный угол
    const segmentAngle = (2 * Math.PI) / wheelSegments.length;
    const targetAngle = (winningIndex * segmentAngle) + (segmentAngle / 2);
    const spins = 5; // Количество полных оборотов
    const finalRotation = (spins * 2 * Math.PI) + (2 * Math.PI - targetAngle);
    
    // Анимация вращения
    const duration = 4000;
    const startTime = Date.now();
    const startRotation = wheelRotation;
    
    function animate() {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        // Easing function для замедления
        const easeOut = 1 - Math.pow(1 - progress, 3);
        
        wheelRotation = startRotation + finalRotation * easeOut;
        drawWheel();
        
        if (progress < 1) {
            requestAnimationFrame(animate);
        } else {
            // Подсчет выигрыша
            const winAmount = wheelBet * winningSegment.multiplier;
            gameState.balance += winAmount;
            gameState.totalWins++;
            if (winAmount > gameState.biggestWin) {
                gameState.biggestWin = winAmount;
            }
            updateUI();
            saveGame();
            showWheelMessage(`Выигрыш ${winningSegment.label}: ${winAmount} монет! 🎉`, 'win');
            
            wheelSpinning = false;
            document.getElementById('wheelSpinBtn').disabled = false;
        }
    }
    
    animate();
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
    
    // Создаем 25 клеток (5x5)
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
        showMinesMessage('Недостаточно монет! 😢', 'lose');
        return;
    }
    
    gameState.balance -= bet;
    minesState.bet = bet;
    minesState.gameActive = true;
    minesState.revealed = 0;
    updateUI();
    saveGame();
    
    // Генерируем мины
    minesState.grid = Array(25).fill(false);
    const minePositions = [];
    while (minePositions.length < minesState.minesCount) {
        const pos = Math.floor(Math.random() * 25);
        if (!minePositions.includes(pos)) {
            minePositions.push(pos);
            minesState.grid[pos] = true;
        }
    }
    
    // Делаем клетки кликабельными
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
        // Мина!
        cell.classList.add('mine');
        cell.textContent = '💣';
        endMinesGame(false);
    } else {
        // Безопасно
        cell.classList.add('revealed');
        cell.textContent = '💎';
        minesState.revealed++;
        updateMinesMultiplier();
        
        // Проверяем победу (все безопасные клетки открыты)
        if (minesState.revealed >= 25 - minesState.minesCount) {
            endMinesGame(true);
        }
    }
}

function updateMinesMultiplier() {
    const safeSpots = 25 - minesState.minesCount;
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
    if (winAmount > gameState.biggestWin) {
        gameState.biggestWin = winAmount;
    }
    updateUI();
    saveGame();
    
    showMinesMessage(`Ты забрал ${winAmount} монет! 💰`, 'win');
    minesState.gameActive = false;
    
    // Показываем все мины
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
    
    // Показываем все мины
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
        if (winAmount > gameState.biggestWin) {
            gameState.biggestWin = winAmount;
        }
        updateUI();
        saveGame();
        showMinesMessage(`Ты выиграл ${winAmount} монет! 🎉`, 'win');
    } else {
        showMinesMessage('Взорвался! 💥 Попробуй еще раз!', 'lose');
        saveGame();
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

// ============= ОБРАБОТЧИКИ ДЛЯ КОЛЕСА ФОРТУНЫ =============
function changeWheelBet(delta) {
    const betEl = document.getElementById('wheelBetAmount');
    if (!betEl) return;
    let bet = parseInt(betEl.textContent);
    bet = Math.max(10, Math.min(1000, bet + delta));
    betEl.textContent = bet;
}

function initWheelHandlers() {
    const spinBtn = document.getElementById('wheelSpinBtn');
    const decreaseBet = document.getElementById('wheelDecreaseBet');
    const increaseBet = document.getElementById('wheelIncreaseBet');
    if (spinBtn) spinBtn.addEventListener('click', spinWheel);
    if (decreaseBet) decreaseBet.addEventListener('click', () => changeWheelBet(-10));
    if (increaseBet) increaseBet.addEventListener('click', () => changeWheelBet(10));
}

// Модифицируем initWheel для вызова обработчиков
const _oldInitWheel = initWheel;
initWheel = function() {
    _oldInitWheel();
    initWheelHandlers();
};

// ============= ИНИЦИАЛИЗАЦИЯ =============

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', () => {
    console.log('🎰 Casino Bot загружен!');
    loadGame();
    
    // Регистрация обработчиков событий
    const themeToggle = document.getElementById('themeToggle');
    const addCoinsBtn = document.getElementById('addCoinsBtn');
    const decreaseBet = document.getElementById('decreaseBet');
    const increaseBet = document.getElementById('increaseBet');
    const spinBtn = document.getElementById('spinBtn');
    const backBtn = document.getElementById('backBtn');
    const playSlotsBtn = document.getElementById('playSlotsBtn');
    
    if (themeToggle) themeToggle.addEventListener('click', toggleTheme);
    if (addCoinsBtn) addCoinsBtn.addEventListener('click', addCoins);
    if (decreaseBet) decreaseBet.addEventListener('click', () => changeBet(-10));
    if (increaseBet) increaseBet.addEventListener('click', () => changeBet(10));
    if (spinBtn) spinBtn.addEventListener('click', spin);
    if (backBtn) backBtn.addEventListener('click', () => showPage('menu'));
    if (playSlotsBtn) playSlotsBtn.addEventListener('click', () => showPage('slots'));
    
    console.log('✅ Все обработчики событий подключены');
})