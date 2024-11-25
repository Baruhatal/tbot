export const formatPrice = (price) => `$${price.toFixed(2)}`;

export const formatCart = (cart) => {
  if (!cart?.length) return 'Your cart is empty!';
  
  const items = cart.map((item, i) => 
    `${i + 1}. ${item.name} x${item.quantity}\n   ${formatPrice(item.price * item.quantity)}`
  ).join('\n\n');
  
  const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  
  return `🛒 Your Cart:\n\n${items}\n\n` +
    `Total: ${formatPrice(total)}`;
};