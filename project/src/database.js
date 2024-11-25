// In-memory storage
const db = {
  carts: new Map(),
  orders: new Map()
};

export const getCart = (userId) => db.carts.get(userId) || [];

export const addToCart = (userId, product, quantity = 1) => {
  const cart = getCart(userId);
  const existingItem = cart.find(item => item.productId === product.id);
  
  if (existingItem) {
    existingItem.quantity += quantity;
  } else {
    cart.push({
      productId: product.id,
      name: product.name,
      price: product.price,
      quantity: quantity
    });
  }
  
  db.carts.set(userId, cart);
  return cart;
};

export const clearCart = (userId) => {
  db.carts.delete(userId);
};

export const createOrder = (userId, cart) => {
  const orderId = Date.now().toString(36);
  const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  
  const order = {
    id: orderId,
    userId,
    items: cart,
    total,
    status: 'pending',
    createdAt: new Date()
  };
  
  db.orders.set(orderId, order);
  return order;
};