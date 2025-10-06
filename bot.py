from telegram import Update, WebAppInfo
from telegram.ext import Application, CommandHandler, ContextTypes
import os

# Укажи свой токен бота
BOT_TOKEN = "8234769062:AAHtki4WnMnvN31hDVYWO55fD6lMxmYCYQU"
# URL где будет размещено веб-приложение (например, GitHub Pages, Vercel, или локальный ngrok)
WEB_APP_URL = "YOUR_WEB_APP_URL_HERE"

async def start(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """Отправляет приветственное сообщение с кнопкой для открытия веб-приложения"""
    keyboard = [
        [{"text": "🎰 Открыть Казино", "web_app": {"url": WEB_APP_URL}}]
    ]
    
    await update.message.reply_text(
        "🎰 Добро пожаловать в Casino Bot!\n\n"
        "Нажми на кнопку ниже, чтобы начать играть в слоты.\n"
        "Стартовый капитал: 1000 монет 🪙",
        reply_markup={"inline_keyboard": keyboard}
    )

async def help_command(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """Показывает справку"""
    await update.message.reply_text(
        "🎰 Casino Bot - Команды:\n\n"
        "/start - Открыть казино\n"
        "/help - Показать эту справку\n\n"
        "Играй в слоты, выигрывай монеты! 🎊"
    )

def main():
    """Запуск бота"""
    print("🤖 Запуск Casino Bot...")
    
    # Создаём приложение
    application = Application.builder().token(BOT_TOKEN).build()
    
    # Регистрируем обработчики команд
    application.add_handler(CommandHandler("start", start))
    application.add_handler(CommandHandler("help", help_command))
    
    # Запускаем бота
    print("✅ Бот запущен и готов к работе!")
    application.run_polling(allowed_updates=Update.ALL_TYPES)

if __name__ == "__main__":
    main()