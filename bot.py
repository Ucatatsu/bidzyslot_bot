from telegram import Update, InlineKeyboardButton, InlineKeyboardMarkup, KeyboardButton, ReplyKeyboardMarkup
from telegram.ext import Application, CommandHandler, ContextTypes
import logging

# Настройка логирования
logging.basicConfig(
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    level=logging.INFO
)

# Укажи свой токен бота
BOT_TOKEN = "8234769062:AAHtki4WnMnvN31hDVYWO55fD6lMxmYCYQU"
# URL где будет размещено веб-приложение
WEB_APP_URL = "https://bidzyslot-bot.vercel.app/"

async def start(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """Отправляет приветственное сообщение с кнопкой для открытия веб-приложения"""
    
    # Создаем кнопку с веб-приложением
    keyboard = [
        [KeyboardButton(text="🎰 Открыть Казино", web_app={"url": WEB_APP_URL})]
    ]
    reply_markup = ReplyKeyboardMarkup(keyboard, resize_keyboard=True)
    
    welcome_message = (
        "🎰 *Добро пожаловать в Casino Bot!*\n\n"
        "🎮 Играй в слоты и выигрывай монеты!\n"
        "💰 Стартовый капитал: 1000 монет\n"
        "🎁 Бесплатное пополнение в любой момент\n\n"
        "Нажми на кнопку ниже, чтобы начать играть! 👇"
    )
    
    await update.message.reply_text(
        welcome_message,
        reply_markup=reply_markup,
        parse_mode='Markdown'
    )
    
    logging.info(f"Пользователь {update.effective_user.id} запустил бота")

async def help_command(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """Показывает справку"""
    help_text = (
        "📖 *Справка по Casino Bot*\n\n"
        "🎰 *Игры:*\n"
        "• Слоты - классический игровой автомат\n\n"
        "💎 *Выигрыши:*\n"
        "• 💎💎💎 - x10 ставки\n"
        "• ⭐⭐⭐ - x7 ставки\n"
        "• 🍒🍒🍒 - x5 ставки\n"
        "• Два одинаковых - x2 ставки\n\n"
        "⚙️ *Команды:*\n"
        "/start - Главное меню\n"
        "/help - Эта справка\n\n"
        "Удачи! 🍀"
    )
    
    await update.message.reply_text(help_text, parse_mode='Markdown')

async def stats_command(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """Показывает статистику (в будущем можно добавить серверное хранение)"""
    stats_text = (
        "📊 *Твоя статистика*\n\n"
        "Статистика сохраняется в твоем браузере.\n"
        "Открой казино, чтобы посмотреть свой баланс!"
    )
    
    await update.message.reply_text(stats_text, parse_mode='Markdown')

def main():
    """Запуск бота"""
    print("🤖 Запуск Casino Bot...")
    print(f"🌐 Web App URL: {WEB_APP_URL}")
    
    # Создаём приложение
    application = Application.builder().token(BOT_TOKEN).build()
    
    # Регистрируем обработчики команд
    application.add_handler(CommandHandler("start", start))
    application.add_handler(CommandHandler("help", help_command))
    application.add_handler(CommandHandler("stats", stats_command))
    
    # Запускаем бота
    print("✅ Бот запущен и готов к работе!")
    print("📱 Отправь /start боту в Telegram")
    application.run_polling(allowed_updates=Update.ALL_TYPES)

if __name__ == "__main__":
    main()