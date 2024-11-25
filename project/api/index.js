import express from 'express';
import { Telegraf } from 'telegraf';
import { config } from 'dotenv';
import { products } from '../src/config/products.js';
import { formatPrice, formatCart } from '../src/utils/formatters.js';
import { getCart, addToCart, clearCart, createOrder } from '../src/database.js';

// Load environment variables
config();

const app = express();
app.use(express.json());

// Initialize bot
const bot = new Telegraf(process.env.BOT_TOKEN);

// Bot command handlers
bot.command('start', async (ctx) => {
  const keyboard = {
    keyboard: [
      ['🛍 Products', '🛒 Cart'],
      ['ℹ️ About', '📞 Contact']
    ],
    resize_keyboard: true
  };
  
  await ctx.reply(
    '🌿 Welcome to Premium CBD Store!\n\n' +
    'Explore our high-quality CBD products.',
    { reply_markup: keyboard }
  );
});

// Product listing
bot.hears('🛍 Products', async (ctx) => {
  const productButtons = products.map(product => [
    Markup.button.callback(
      `${product.name} - ${formatPrice(product.price)}`,
      `product_${product.id}`
    )
  ]);
  
  await ctx.reply(
    '🌿 Our Products:\n\nSelect a product to view details:',
    Markup.inlineKeyboard([
      ...productButtons,
      [Markup.button.callback('🛒 View Cart', 'view_cart')]
    ])
  );
});

// Webhook handler
app.post('/webhook', async (req, res) => {
  try {
    await bot.handleUpdate(req.body);
    res.sendStatus(200);
  } catch (error) {
    console.error('Webhook error:', error);
    res.sendStatus(500);
  }
});

// Health check
app.get('/', (req, res) => {
  res.send('Bot is running!');
});

// Set webhook on startup
const WEBHOOK_DOMAIN = process.env.WEBHOOK_DOMAIN;
if (WEBHOOK_DOMAIN) {
  const webhookUrl = `${WEBHOOK_DOMAIN}/webhook`;
  bot.telegram.setWebhook(webhookUrl)
    .then(() => console.log('Webhook set:', webhookUrl))
    .catch(console.error);
}

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

export default app;