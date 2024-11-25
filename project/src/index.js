import express from 'express';
import { Telegraf, Markup } from 'telegraf';
import { config } from 'dotenv';
import { products } from './config/products.js';
import { formatPrice, formatCart } from './utils/formatters.js';
import { getCart, addToCart, clearCart, createOrder } from './database.js';

// Load environment variables
config();

if (!process.env.BOT_TOKEN) {
  throw new Error('BOT_TOKEN must be provided!');
}

const bot = new Telegraf(process.env.BOT_TOKEN);
const app = express();

// Parse JSON bodies
app.use(express.json());

// Health check endpoint
app.get('/', (req, res) => {
  res.send('Bot is running!');
});

// Webhook endpoint
app.post('/webhook', async (req, res) => {
  try {
    await bot.handleUpdate(req.body);
    res.sendStatus(200);
  } catch (error) {
    console.error('Webhook error:', error);
    res.sendStatus(500);
  }
});

// Command handlers
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

// Product details
bot.action(/product_(\d+)/, async (ctx) => {
  const productId = parseInt(ctx.match[1]);
  const product = products.find(p => p.id === productId);
  
  if (!product) {
    return ctx.reply('Product not found');
  }
  
  await ctx.reply(
    `🌿 ${product.name}\n\n` +
    `💰 Price: ${formatPrice(product.price)}\n\n` +
    `📝 Description:\n${product.description}`,
    Markup.inlineKeyboard([
      [Markup.button.callback('🛒 Add to Cart', `add_${product.id}`)],
      [Markup.button.callback('« Back to Products', 'products')]
    ])
  );
});

// Cart management
bot.hears('🛒 Cart', (ctx) => {
  const cart = getCart(ctx.from.id);
  
  if (!cart.length) {
    return ctx.reply(
      'Your cart is empty! 🛒\n\n' +
      'Browse our products to add items.',
      Markup.keyboard([
        ['🛍 Products', '🛒 Cart'],
        ['ℹ️ About', '📞 Contact']
      ]).resize()
    );
  }
  
  return ctx.reply(
    formatCart(cart),
    Markup.inlineKeyboard([
      [Markup.button.callback('🗑 Clear Cart', 'clear_cart')],
      [Markup.button.callback('💳 Checkout', 'checkout')],
      [Markup.button.callback('🛍 Continue Shopping', 'products')]
    ])
  );
});

bot.action(/add_(\d+)/, async (ctx) => {
  const productId = parseInt(ctx.match[1]);
  const product = products.find(p => p.id === productId);
  
  if (!product) {
    return ctx.reply('Product not found');
  }
  
  addToCart(ctx.from.id, product);
  
  return ctx.reply(
    `✅ Added ${product.name} to your cart!\n\n` +
    'What would you like to do next?',
    Markup.inlineKeyboard([
      [Markup.button.callback('🛒 View Cart', 'view_cart')],
      [Markup.button.callback('🛍 Continue Shopping', 'products')]
    ])
  );
});

bot.action('clear_cart', (ctx) => {
  clearCart(ctx.from.id);
  return ctx.reply(
    '🗑 Cart cleared!\n\n' +
    'Ready to start fresh? Browse our products!',
    Markup.keyboard([
      ['🛍 Products', '🛒 Cart'],
      ['ℹ️ About', '📞 Contact']
    ]).resize()
  );
});

bot.action('checkout', (ctx) => {
  const cart = getCart(ctx.from.id);
  if (!cart.length) {
    return ctx.reply('Your cart is empty! Add some products first.');
  }
  
  const order = createOrder(ctx.from.id, cart);
  clearCart(ctx.from.id);
  
  return ctx.reply(
    '🎉 Thank you for your order!\n\n' +
    `Order #: ${order.id}\n\n` +
    'Our team will contact you shortly to confirm your order and arrange payment.\n\n' +
    '📦 Track your order status using your order number.'
  );
});

// Info handlers
bot.hears('ℹ️ About', (ctx) => {
  return ctx.reply(
    '🌿 About Premium CBD Store\n\n' +
    'We offer high-quality CBD products:\n' +
    '• Lab-tested for purity\n' +
    '• Full spectrum CBD\n' +
    '• Organic ingredients\n' +
    '• Fast shipping\n' +
    '• Expert support'
  );
});

bot.hears('📞 Contact', (ctx) => {
  return ctx.reply(
    '📞 Contact Us\n\n' +
    '🕐 Customer Service:\n' +
    'Mon-Fri: 9:00 - 18:00\n' +
    'Sat: 10:00 - 16:00\n\n' +
    '📧 Email: support@cbdstore.com\n' +
    '📱 Phone: +1-800-CBD-HELP'
  );
});

// Error handling
bot.catch((err, ctx) => {
  console.error('Bot error:', err);
  return ctx.reply('Sorry, something went wrong. Please try again later.');
});

// Set webhook
const PORT = process.env.PORT || 3000;
const WEBHOOK_DOMAIN = process.env.WEBHOOK_DOMAIN;

if (WEBHOOK_DOMAIN) {
  const webhookUrl = `${WEBHOOK_DOMAIN}/webhook`;
  bot.telegram.setWebhook(webhookUrl)
    .then(() => {
      console.log('Webhook set:', webhookUrl);
      app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
      });
    })
    .catch(err => {
      console.error('Failed to set webhook:', err);
      process.exit(1);
    });
} else {
  console.log('Starting bot in polling mode...');
  bot.launch()
    .then(() => console.log('Bot is running!'))
    .catch(err => {
      console.error('Failed to start bot:', err);
      process.exit(1);
    });
}

// Enable graceful stop
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));