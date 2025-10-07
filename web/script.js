// Инициализация Telegram Web App
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
    currentPage: 'menu'
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
function showPage(page) {
    gameState.currentPage = page;
    
    const menu = document.getElementById('mainMenu');
    const game = document.getElementById('gameSection');
    
    if (page === 'menu') {
        menu.classList.remove('hidden');
        game.classList.add('hidden');
        updateMenuStats();
    } else {
        menu.classList.add('hidden');
        game.classList.remove('hidden');
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
});