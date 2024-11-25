import { Markup } from 'telegraf';
import { products } from '../config/products.js';
import { 
  getCart, 
  addToCart, 
  clearCart, 
  updateCartQuantity, 
  removeFromCart,
  createOrder 
} from '../database.js';
import { formatCartSummary } from '../utils/formatters.js';

export const handleCart = (ctx) => {
  const cart = getCart(ctx.from.id);
  
  if (cart.length === 0) {
    return ctx.reply(
      'Your cart is empty! 🛒\n\n' +
      'Browse our products to add items.',
      Markup.keyboard([
        ['🛍 Products', '📂 Categories'],
        ['ℹ️ About', '📞 Contact']
      ]).resize()
    );
  }

  return ctx.reply(
    formatCartSummary(cart),
    Markup.inlineKeyboard([
      ...cart.map(item => [
        Markup.button.callback('➖', `decrease_${item.productId}`),
        Markup.button.callback(`${item.quantity}x`, `quantity_${item.productId}`),
        Markup.button.callback('➕', `increase_${item.productId}`),
        Markup.button.callback('🗑️', `remove_${item.productId}`)
      ]),
      [Markup.button.callback('🗑 Clear Cart', 'clear_cart')],
      [Markup.button.callback('💳 Checkout', 'checkout')],
      [Markup.button.callback('🛍 Continue Shopping', 'browse_products')]
    ])
  );
};

export const handleAddToCart = (ctx) => {
  const productId = parseInt(ctx.match[1]);
  const product = products.find(p => p.id === productId);
  
  if (!product) {
    return ctx.reply('Product not found');
  }
  
  const cart = addToCart(ctx.from.id, product);
  
  return ctx.reply(
    `✅ Added ${product.name} to your cart!\n\n` +
    'What would you like to do next?',
    Markup.inlineKeyboard([
      [Markup.button.callback('🛒 View Cart', 'view_cart')],
      [Markup.button.callback('🛍 Continue Shopping', 'browse_products')]
    ])
  );
};

export const handleUpdateQuantity = (ctx) => {
  const match = ctx.match[0].match(/^(increase|decrease|quantity)_(\d+)$/);
  if (!match) return;

  const [, action, productId] = match;
  const cart = getCart(ctx.from.id);
  const item = cart.find(i => i.productId === parseInt(productId));

  if (!item) return;

  let newQuantity = item.quantity;
  if (action === 'increase') newQuantity++;
  if (action === 'decrease') newQuantity--;

  updateCartQuantity(ctx.from.id, parseInt(productId), newQuantity);
  return handleCart(ctx);
};

export const handleRemoveFromCart = (ctx) => {
  const productId = parseInt(ctx.match[1]);
  removeFromCart(ctx.from.id, productId);
  return handleCart(ctx);
};

export const handleClearCart = (ctx) => {
  clearCart(ctx.from.id);
  
  return ctx.reply(
    '🗑 Cart cleared!\n\n' +
    'Ready to start fresh? Browse our products!',
    Markup.keyboard([
      ['🛍 Products', '📂 Categories'],
      ['ℹ️ About', '📞 Contact']
    ]).resize()
  );
};

export const handleCheckout = (ctx) => {
  const cart = getCart(ctx.from.id);
  if (cart.length === 0) {
    return ctx.reply('Your cart is empty! Add some products first.');
  }

  const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const order = createOrder(ctx.from.id, {
    items: cart,
    total,
    status: 'pending'
  });

  clearCart(ctx.from.id);

  return ctx.reply(
    '🎉 Thank you for your order!\n\n' +
    `Order #: ${order.id}\n\n` +
    'Our team will contact you shortly to confirm your order and arrange payment.\n\n' +
    '📦 Track your order status using your order number.'
  );
};