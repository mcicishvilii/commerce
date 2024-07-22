// src/CartContext.js
import React, { createContext, useState, useContext, useEffect } from 'react';

const CartContext = createContext();

export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState([]);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      setCart(JSON.parse(savedCart));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cart));
  }, [cart]);

  const addToCart = (product, options) => {
    setCart(prevCart => {
      const existingItemIndex = prevCart.findIndex(item => 
        item.id === product.id && JSON.stringify(item.options) === JSON.stringify(options)
      );
  
      if (existingItemIndex !== -1) {
        // Update quantity of existing item
        const updatedCart = [...prevCart];
        updatedCart[existingItemIndex].quantity += 1;
        return updatedCart;
      } else {
        // Add new item to cart
        return [...prevCart, { ...product, options, quantity: 1 }];
      }
    });
  };

  const removeFromCart = (id, options) => {
    setCart(prevCart => prevCart.filter(item => 
      !(item.id === id && JSON.stringify(item.options) === JSON.stringify(options))
    ));
  };

  const updateQuantity = (id, options, quantity) => {
    setCart(prevCart => prevCart.map(item => 
      item.id === id && JSON.stringify(item.options) === JSON.stringify(options)
        ? { ...item, quantity: Math.max(0, quantity) }
        : item
    ).filter(item => item.quantity > 0));
  };

  const clearCart = () => {
    setCart([]);
  };

  const toggleCart = () => {
    setIsOpen(prev => !prev);
  };

  return (
    <CartContext.Provider value={{
      cart,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
      isOpen,
      toggleCart
    }}>
      {children}
    </CartContext.Provider>
  );
};