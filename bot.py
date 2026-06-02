import logging
from telegram import Update, InlineKeyboardButton, InlineKeyboardMarkup
from telegram.ext import Application, MessageHandler, CallbackQueryHandler, filters, ContextTypes

BOT_TOKEN = "8847266024:AAGA00Bqrw3ekbo5TCSmusK3Yd0FU2exTsM"
ADMIN_ID = 8042807902

logging.basicConfig(level=logging.INFO)

pending = {}


async def handle_message(update: Update, context: ContextTypes.DEFAULT_TYPE):
    message = update.message
    if not message or message.chat.type not in ['group', 'supergroup']:
        return

    sender = message.from_user
    sender_name = sender.full_name
    username = f"@{sender.username}" if sender.username else "username yo'q"
    chat_id = message.chat_id
    key = f"{chat_id}_{message.message_id}"

    pending[key] = {
        'sender_name': sender_name,
        'username': username,
        'chat_id': chat_id,
        'message': message
    }

    keyboard = [[
        InlineKeyboardButton("✅ Tasdiqlash", callback_data=f"approve_{key}"),
        InlineKeyboardButton("❌ Rad etish", callback_data=f"reject_{key}")
    ]]
    reply_markup = InlineKeyboardMarkup(keyboard)
    header = f"👤 Yuboruvchi: {sender_name}\n📱 Username: {username}\n\n"

    if message.text:
        await context.bot.send_message(
            chat_id=ADMIN_ID,
            text=header + message.text,
            reply_markup=reply_markup
        )
    elif message.photo:
        await context.bot.send_photo(
            chat_id=ADMIN_ID,
            photo=message.photo[-1].file_id,
            caption=header + (message.caption or ""),
            reply_markup=reply_markup
        )
    elif message.video:
        await context.bot.send_video(
            chat_id=ADMIN_ID,
            video=message.video.file_id,
            caption=header + (message.caption or ""),
            reply_markup=reply_markup
        )
    elif message.document:
        await context.bot.send_document(
            chat_id=ADMIN_ID,
            document=message.document.file_id,
            caption=header + (message.caption or ""),
            reply_markup=reply_markup
        )


async def handle_callback(update: Update, context: ContextTypes.DEFAULT_TYPE):
    query = update.callback_query
    await query.answer()

    action, key = query.data.split('_', 1)

    if key not in pending:
        await query.edit_message_text("Bu xabar allaqachon ko'rib chiqilgan.")
        return

    info = pending.pop(key)
    message = info['message']
    sender_name = info['sender_name']
    username = info['username']
    chat_id = info['chat_id']

    status = "✅ Boshliq tasdiqladi" if action == "approve" else "❌ Boshliq rad etdi"
    header = f"👤 Yuboruvchi: {sender_name}\n📱 Username: {username}\n\n"

    if message.text:
        await context.bot.send_message(
            chat_id=chat_id,
            text=header + message.text + f"\n\n{status}"
        )
    elif message.photo:
        await context.bot.send_photo(
            chat_id=chat_id,
            photo=message.photo[-1].file_id,
            caption=header + (message.caption or "") + f"\n\n{status}"
        )
    elif message.video:
        await context.bot.send_video(
            chat_id=chat_id,
            video=message.video.file_id,
            caption=header + (message.caption or "") + f"\n\n{status}"
        )
    elif message.document:
        await context.bot.send_document(
            chat_id=chat_id,
            document=message.document.file_id,
            caption=header + (message.caption or "") + f"\n\n{status}"
        )

    await query.edit_message_reply_markup(reply_markup=None)


def main():
    app = Application.builder().token(BOT_TOKEN).build()
    app.add_handler(MessageHandler(
        filters.ChatType.GROUPS & ~filters.COMMAND,
        handle_message
    ))
    app.add_handler(CallbackQueryHandler(handle_callback))
    app.run_polling()


if __name__ == '__main__':
    main()
