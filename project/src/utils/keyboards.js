import { Markup } from 'telegraf';

export const createProductKeyboard = (products) => {
  const productButtons = products.map(product => [
    Markup.button.callback(
      `${product.name} - $${product.price.toFixed(2)}`,
      `product_${product.id}`
    )
  ]);

  return Markup.inlineKeyboard([
    ...productButtons,
    [
      Markup.button.callback('📂 Categories', 'categories'),
      Markup.button.callback('🛒 Cart', 'view_cart')
    ],
    [
      Markup.button.callback('❓ FAQ', 'faq'),
      Markup.button.callback('📦 Shipping', 'shipping_info')
    ]
  ]);
};

export const createCategoryKeyboard = () => {
  return Markup.inlineKeyboard([
    [Markup.button.callback('🌟 Best Sellers', 'best_sellers')],
    [Markup.button.callback('💧 Oils & Tinctures', 'category_oils')],
    [Markup.button.callback('🍬 Edibles & Gummies', 'category_edibles')],
    [Markup.button.callback('🧴 Topicals & Creams', 'category_topicals')],
    [Markup.button.callback('🐕 Pet Products', 'category_pets')],
    [Markup.button.callback('🛍 View All Products', 'browse_products')],
    [Markup.button.callback('🛒 View Cart', 'view_cart')]
  ]);
};