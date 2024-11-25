import { Markup } from 'telegraf';
import { products } from '../config/products.js';
import { createProductKeyboard, createCategoryKeyboard } from '../utils/keyboards.js';
import { formatProductDetails } from '../utils/formatters.js';

export const handleProducts = (ctx, showBestSellers = false) => {
  const displayProducts = showBestSellers 
    ? products.filter(p => p.isBestSeller)
    : products;

  const title = showBestSellers 
    ? '💫 Our Best Sellers:\n\n'
    : '🌿 Our Premium CBD Products:\n\n';

  return ctx.reply(
    title + 'Select a product to view details:',
    createProductKeyboard(displayProducts)
  );
};

export const handleCategories = (ctx) => {
  return ctx.reply(
    '📂 Product Categories\n\n' +
    'Choose a category to explore:',
    createCategoryKeyboard()
  );
};

export const handleProductDetails = async (ctx) => {
  const productId = parseInt(ctx.match[1]);
  const product = products.find(p => p.id === productId);

  if (!product) {
    return ctx.reply('Product not found');
  }

  await ctx.replyWithPhoto(product.image, {
    caption: `📸 ${product.name}`
  });

  return ctx.reply(
    formatProductDetails(product),
    Markup.inlineKeyboard([
      [Markup.button.callback('🛒 Add to Cart', `add_${product.id}`)],
      [
        Markup.button.callback('« Back', 'browse_products'),
        Markup.button.callback('🛒 Cart', 'view_cart')
      ],
      [
        Markup.button.callback('❓ FAQ', 'faq'),
        Markup.button.callback('📦 Shipping', 'shipping_info')
      ]
    ])
  );
};