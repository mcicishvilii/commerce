// src/components/Header.js
import React from 'react';
import { useCart } from '../CartContext';

const Header = () => {
  const { cart, toggleCart } = useCart();

  const itemCount = cart.reduce((total, item) => total + item.quantity, 0);

  return (
    <header style={{ display: 'flex', justifyContent: 'space-between', padding: '20px', backgroundColor: '#f0f0f0' }}>
      <h1>Your Store</h1>
      <button 
        data-testid="cart-btn"
        onClick={toggleCart}
        style={{ position: 'relative', padding: '10px', cursor: 'pointer' }}
      >
        Cart
        {itemCount > 0 && (
          <span style={{
            position: 'absolute',
            top: '-10px',
            right: '-10px',
            backgroundColor: 'red',
            color: 'white',
            borderRadius: '50%',
            padding: '2px 6px',
            fontSize: '12px'
          }}>
            {itemCount}
          </span>
        )}
      </button>
    </header>
  );
};

export default Header;