import { useState, useEffect } from 'react';

export const useCart = () => {
  const [cart, setCart] = useState([]);

  useEffect(() => {
    const savedCart = localStorage.getItem('swadhan_cart');
    if (savedCart) {
      setCart(JSON.parse(savedCart));
    }
  }, []);

  const saveCart = (newCart) => {
    setCart(newCart);
    localStorage.setItem('swadhan_cart', JSON.stringify(newCart));
  };

  const addToCart = (dish) => {
    const existing = cart.find(item => item.dish._id === dish._id);
    if (existing) {
      saveCart(cart.map(item =>
        item.dish._id === dish._id ? { ...item, quantity: item.quantity + 1 } : item
      ));
    } else {
      saveCart([...cart, { dish, quantity: 1 }]);
    }
  };

  const updateQuantity = (dishId, quantity) => {
    if (quantity <= 0) {
      removeFromCart(dishId);
    } else {
      saveCart(cart.map(item =>
        item.dish._id === dishId ? { ...item, quantity } : item
      ));
    }
  };

  const removeFromCart = (dishId) => {
    saveCart(cart.filter(item => item.dish._id !== dishId));
  };

  const clearCart = () => {
    saveCart([]);
  };

  const getTotal = () => {
    return cart.reduce((total, item) => total + item.dish.price * item.quantity, 0).toFixed(2);
  };

  return { cart, addToCart, updateQuantity, removeFromCart, clearCart, getTotal };
};
