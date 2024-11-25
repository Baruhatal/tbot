import { Markup } from 'telegraf';

export const handleAbout = (ctx) => {
  return ctx.reply(
    '🌿 About Premium CBD Store\n\n' +
    'We offer high-quality CBD products:\n' +
    '• Lab-tested for purity\n' +
    '• Full spectrum CBD\n' +
    '• Organic ingredients\n' +
    '• Fast shipping\n' +
    '• Expert support\n\n' +
    '🏆 Trusted by thousands of customers',
    Markup.inlineKeyboard([
      [Markup.button.callback('📞 Contact Us', 'contact')],
      [Markup.button.callback('🛍 Browse Products', 'browse_products')]
    ])
  );
};

export const handleContact = (ctx) => {
  return ctx.reply(
    '📞 Contact Us\n\n' +
    '🕐 Customer Service:\n' +
    'Mon-Fri: 9:00 - 18:00\n' +
    'Sat: 10:00 - 16:00\n\n' +
    '📧 Email: support@cbdstore.com\n' +
    '📱 Phone: +1-800-CBD-HELP',
    Markup.inlineKeyboard([
      [Markup.button.callback('📦 Shipping Info', 'shipping_info')],
      [Markup.button.callback('🛍 Browse Products', 'browse_products')]
    ])
  );
};

export const handleFAQ = (ctx) => {
  return ctx.reply(
    '❓ Frequently Asked Questions\n\n' +
    '1. What is CBD?\n' +
    'CBD is a natural compound from hemp plants.\n\n' +
    '2. Is CBD legal?\n' +
    'Yes, our products contain <0.3% THC.\n\n' +
    '3. Shipping time?\n' +
    'Standard: 3-5 business days',
    Markup.inlineKeyboard([
      [Markup.button.callback('📞 Contact Support', 'contact')],
      [Markup.button.callback('🛍 Browse Products', 'browse_products')]
    ])
  );
};

export const handleShipping = (ctx) => {
  return ctx.reply(
    '📦 Shipping Information\n\n' +
    '🚚 Options:\n' +
    '1. Standard (FREE)\n' +
    '   • 3-5 business days\n\n' +
    '2. Express ($15)\n' +
    '   • 1-2 business days\n\n' +
    '✈️ We ship to all 50 states\n' +
    '📋 Tracking provided\n' +
    '✅ Discreet packaging',
    Markup.inlineKeyboard([
      [Markup.button.callback('🛍 Browse Products', 'browse_products')],
      [Markup.button.callback('❓ FAQ', 'faq')]
    ])
  );
};