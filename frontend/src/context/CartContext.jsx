import React, { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext(null);

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);

  // Load cart state from localStorage on startup
  useEffect(() => {
    const savedCart = localStorage.getItem('shopping_cart');
    if (savedCart) {
      try {
        setCartItems(JSON.parse(savedCart));
      } catch (err) {
        console.error('Failed to parse shopping cart from localStorage:', err);
      }
    }
  }, []);

  // Sync cart items to localStorage
  const saveCart = (items) => {
    setCartItems(items);
    localStorage.setItem('shopping_cart', JSON.stringify(items));
  };

  // Add item to cart (prevents duplicate designs in cart)
  const addToCart = (design) => {
    const exists = cartItems.find((item) => item.id === design.id);
    if (!exists) {
      const updated = [...cartItems, design];
      saveCart(updated);
      return true; // Item added
    }
    return false; // Already in cart
  };

  // Remove item from cart
  const removeFromCart = (designId) => {
    const updated = cartItems.filter((item) => item.id !== designId);
    saveCart(updated);
  };

  // Check if item is already added
  const isInCart = (designId) => {
    return cartItems.some((item) => item.id === designId);
  };

  // Clear shopping cart
  const clearCart = () => {
    saveCart([]);
  };

  // Calculate cart total subtotal
  const cartTotal = cartItems.reduce((sum, item) => sum + parseFloat(item.price), 0);

  return (
    <CartContext.Provider value={{
      cartItems,
      cartTotal,
      addToCart,
      removeFromCart,
      isInCart,
      clearCart
    }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
