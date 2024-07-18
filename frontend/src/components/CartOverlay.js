// src/components/CartOverlay.js
import React from 'react';
import { useCart } from '../CartContext';

const CartOverlay = () => {
  const { cart, isOpen, toggleCart, updateQuantity, removeFromCart, clearCart } = useCart();

  if (!isOpen) return null;

  const total = cart.reduce((sum, item) => sum + item.quantity, 0);
  const cartTotal = cart.reduce((sum, item) => sum + item.quantity * item.price, 0);

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      right: 0,
      bottom: 0,
      width: '300px',
      backgroundColor: 'white',
      boxShadow: '-2px 0 5px rgba(0,0,0,0.1)',
      padding: '20px',
      zIndex: 1000
    }}>
      <h2>Your Cart ({total} {total === 1 ? 'Item' : 'Items'})</h2>
      <button onClick={toggleCart}>Close</button>
      {cart.map((item) => (
        <div key={`${item.id}-${JSON.stringify(item.options)}`} style={{ marginBottom: '10px' }}>
          <img src={item.gallery[0]} alt={item.name} style={{ width: '50px', height: '50px', objectFit: 'cover' }} />
          <h3>{item.name}</h3>
          <p>Options: {JSON.stringify(item.options)}</p>
          <button onClick={() => updateQuantity(item.id, item.options, item.quantity - 1)}>-</button>
          <span>{item.quantity}</span>
          <button onClick={() => updateQuantity(item.id, item.options, item.quantity + 1)}>+</button>
          <button onClick={() => removeFromCart(item.id, item.options)}>Remove</button>
        </div>
      ))}
      <h3>Total: ${cartTotal.toFixed(2)}</h3>
      <button onClick={clearCart} disabled={cart.length === 0}>Place Order</button>
    </div>
  );
};

export default CartOverlay;