import { Telegraf } from 'telegraf';
import 'dotenv/config';
import { handleProducts, handleProductDetails, handleCategories } from './handlers/productHandler.js';
import { handleCart, handleAddToCart, handleClearCart, handleCheckout } from './handlers/cartHandler.js';
import { handleAbout, handleContact, handleFAQ, handleShipping } from './handlers/infoHandler.js';

if (!process.env.BOT_TOKEN) {
  throw new Error('BOT_TOKEN must be provided!');
}

const bot = new Telegraf(process.env.BOT_TOKEN);

bot.command('start', async (ctx) => {
  try {
    console.log('Start command received from:', ctx.from.id);
    
    const keyboard = {
      keyboard: [
        ['🛍 Products', '📂 Categories'],
        ['🛒 Cart', '💫 Best Sellers'],
        ['ℹ️ About', '📞 Contact'],
        ['📦 Shipping', '❓ FAQ']
      ],
      resize_keyboard: true
    };

    await ctx.reply('🌿 Welcome to Premium CBD Store! 🌿\n\nExplore our high-quality CBD products.', {
      reply_markup: keyboard
    });
  } catch (error) {
    console.error('Start command error:', error);
    await ctx.reply('Sorry, there was an error. Please try again.');
  }
});

// Enhanced text command handlers
bot.hears('🛍 Products', (ctx) => {
  console.log('Products menu accessed by:', ctx.from.id);
  return handleProducts(ctx);
});

bot.hears('📂 Categories', (ctx) => {
  console.log('Categories accessed by:', ctx.from.id);
  return handleCategories(ctx);
});

bot.hears('🛒 Cart', (ctx) => {
  console.log('Cart accessed by:', ctx.from.id);
  return handleCart(ctx);
});

bot.hears('💫 Best Sellers', (ctx) => {
  console.log('Best Sellers accessed by:', ctx.from.id);
  return handleProducts(ctx, true);
});

bot.hears('ℹ️ About', (ctx) => {
  console.log('About section accessed by:', ctx.from.id);
  return handleAbout(ctx);
});

bot.hears('📞 Contact', (ctx) => {
  console.log('Contact section accessed by:', ctx.from.id);
  return handleContact(ctx);
});

bot.hears('📦 Shipping', (ctx) => {
  console.log('Shipping info accessed by:', ctx.from.id);
  return handleShipping(ctx);
});

bot.hears('❓ FAQ', (ctx) => {
  console.log('FAQ accessed by:', ctx.from.id);
  return handleFAQ(ctx);
});

// Enhanced callback queries
bot.action(/product_(\d+)/, async (ctx) => {
  try {
    await handleProductDetails(ctx);
  } catch (error) {
    console.error('Product details error:', error);
    await ctx.reply('Sorry, could not load product details. Please try again.');
  }
});

bot.action(/add_(\d+)/, async (ctx) => {
  try {
    await handleAddToCart(ctx);
  } catch (error) {
    console.error('Add to cart error:', error);
    await ctx.reply('Sorry, could not add to cart. Please try again.');
  }
});

bot.action('clear_cart', async (ctx) => {
  try {
    await handleClearCart(ctx);
  } catch (error) {
    console.error('Clear cart error:', error);
    await ctx.reply('Sorry, could not clear cart. Please try again.');
  }
});

bot.action('checkout', async (ctx) => {
  try {
    await handleCheckout(ctx);
  } catch (error) {
    console.error('Checkout error:', error);
    await ctx.reply('Sorry, could not process checkout. Please try again.');
  }
});

bot.action('browse_products', (ctx) => handleProducts(ctx));
bot.action('view_cart', (ctx) => handleCart(ctx));
bot.action('categories', (ctx) => handleCategories(ctx));
bot.action('best_sellers', (ctx) => handleProducts(ctx, true));
bot.action('shipping_info', (ctx) => handleShipping(ctx));
bot.action('faq', (ctx) => handleFAQ(ctx));

bot.catch((err, ctx) => {
  console.error('Bot error:', err);
  return ctx.reply('Sorry, something went wrong. Please try again later.');
});

console.log('Starting bot...');
bot.launch()
  .then(() => {
    console.log('Bot successfully started!');
  })
  .catch(err => {
    console.error('Failed to start bot:', err);
    process.exit(1);
  });

process.once('SIGINT', () => {
  console.log('SIGINT received. Stopping bot...');
  bot.stop('SIGINT');
});

process.once('SIGTERM', () => {
  console.log('SIGTERM received. Stopping bot...');
  bot.stop('SIGTERM');
});