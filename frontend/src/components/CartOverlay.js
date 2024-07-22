import React from 'react';
import { useCart } from '../CartContext';
import './CartOverlay.css';

const CartOverlay = () => {
  const { cart, isOpen, toggleCart, updateQuantity, removeFromCart, clearCart } = useCart();

  if (!isOpen) return null;

  const total = cart.reduce((sum, item) => sum + item.quantity, 0);
  const cartTotal = cart.reduce((sum, item) => sum + item.quantity * item.price, 0);

  const placeOrder = async () => {
    const response = await fetch('http://localhost:8000/graphql', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        query: `
          mutation PlaceOrder($items: [OrderItem!]!) {
            placeOrder(items: $items)
          }
        `,
        variables: {
          items: cart.map(item => ({
            productId: item.id,
            quantity: item.quantity,
            options: JSON.stringify(item.options)
          }))
        }
      }),
    });

    const data = await response.json();
    if (data.data.placeOrder) {
      alert('Order placed successfully!');
      clearCart();
    } else {
      alert('Failed to place order. Please try again.');
    }
  };

  const renderOptions = (item) => {
    const { options, attributes, category } = item;
    
    return (
      <>
        {attributes.map(attr => {
          const attrName = attr.name.toLowerCase();
          const selectedValue = options[attr.id];

          if (category.name === 'clothes') {
            if (attrName === 'size') {
              return (
                <div key={attr.id} className="option-item">
                  <span className="option-name">Size:</span> {selectedValue}
                </div>
              );
            } else if (attrName === 'color') {
              return (
                <div key={attr.id} className="option-item">
                  <span className="option-name">Color:</span>
                  <div className="color-options">
                    {attr.items.map(colorItem => (
                      <div
                        key={colorItem.id}
                        className={`color-swatch ${selectedValue === colorItem.value ? 'selected' : ''}`}
                        style={{ backgroundColor: colorItem.value }}
                        title={colorItem.displayValue}
                      />
                    ))}
                  </div>
                </div>
              );
            }
          } else if (category.name === 'tech') {
            if (attrName === 'capacity') {
              return (
                <div key={attr.id} className="option-item">
                  <span className="option-name">Capacity:</span> {selectedValue}
                </div>
              );
            }
          }
          
          // For any other attributes or categories
          return (
            <div key={attr.id} className="option-item">
              <span className="option-name">{attr.name}:</span> {selectedValue}
            </div>
          );
        })}
      </>
    );
  };

  return (
    <div className="cart-overlay">
      <div className="cart-header">
        <h2>Your Cart ({total} {total === 1 ? 'Item' : 'Items'})</h2>
        <button className="close-button" onClick={toggleCart}>✕</button>
      </div>
      <div className="cart-items">
        {cart.map((item) => (
          <div key={`${item.id}-${JSON.stringify(item.options)}`} className="cart-item">
            <img src={item.gallery[0]} alt={item.name} className="cart-item-image" />
            <div className="cart-item-details">
              <h3>{item.name}</h3>
              <div className="cart-item-options">
                {renderOptions(item)}
              </div>
              <div className="quantity-control">
                <button onClick={() => updateQuantity(item.id, item.options, item.quantity - 1)}>-</button>
                <span>{item.quantity}</span>
                <button onClick={() => updateQuantity(item.id, item.options, item.quantity + 1)}>+</button>
              </div>
              <button className="remove-button" onClick={() => removeFromCart(item.id, item.options)}>Remove</button>
            </div>
            <div className="cart-item-price">
              ${(item.price * item.quantity).toFixed(2)}
            </div>
          </div>
        ))}
      </div>
      <div className="cart-footer">
        <h3>Total: ${cartTotal.toFixed(2)}</h3>
        <button className="clear-cart-button" onClick={clearCart} disabled={cart.length === 0}>Clear Cart</button>
        <button className="place-order-button" onClick={placeOrder} disabled={cart.length === 0}>Place Order</button>
      </div>
    </div>
  );
};

export default CartOverlay;