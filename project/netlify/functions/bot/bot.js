import { Telegraf, Markup } from 'telegraf';
import { products } from './products.js';
import { formatPrice, formatCart } from './utils.js';
import { getCart, addToCart, clearCart, createOrder } from './database.js';

export function createBot(token) {
  const bot = new Telegraf(token);

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

  return bot;
}