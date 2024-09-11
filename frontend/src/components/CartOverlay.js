import React, { Component } from "react";
import { CartConsumer } from "../CartContext";
import "./CartOverlay.css";

class CartOverlay extends Component {
  renderOptions(item) {
    const { options, attributes, category } = item;

    return (
      <>
        {attributes.map((attr) => {
          const attrName = attr.name.toLowerCase();
          const selectedValue = options[attr.id];
          const attrNameKebab = attr.name.toLowerCase().replace(/\s+/g, "-");

          const renderOption = (content) => (
            <div key={attr.id} className="option-item">
              {content}
            </div>
          );

          if (category.name === "clothes" && attrName === "size") {
            return renderOption(
              <>
                <span className="option-name">Size:</span>
                <span>{selectedValue}</span>
              </>
            );
          } else if (category.name === "tech" && attrName === "capacity") {
            return renderOption(
              <>
                <span className="option-name">Capacity:</span>
                <span>{selectedValue}</span>
              </>
            );
          } else if (category.name === "tech" && attrName === "color") {
            return renderOption(
              <>
                <span className="option-name">Color:</span>
                <div
                  className="color-swatch"
                  style={{
                    backgroundColor: selectedValue,
                    width: "20px",
                    height: "20px",
                    display: "inline-block",
                    marginLeft: "5px",
                    border: "1px solid #ccc",
                  }}
                />
              </>
            );
          }
          return renderOption(
            <>
              <span className="option-name">{attr.name}:</span>
              <span>{selectedValue}</span>
            </>
          );
        })}
      </>
    );
  }

  render() {
    return (
      <CartConsumer>
        {({ cart, isOpen, toggleCart, updateQuantity, clearCart }) => {
          if (!isOpen) return null;

          const total = cart.reduce((sum, item) => sum + item.quantity, 0);
          const cartTotal = cart.reduce(
            (sum, item) => sum + item.quantity * item.price,
            0
          );

          const placeOrder = () => {
            alert("Order placed successfully");
            clearCart();
          };

          return (
            <div className="cart-overlay">
              <div className="cart-header">
                <h2>Your Cart ({total} {total === 1 ? "Item" : "Items"})</h2>
                <button className="close-button" onClick={toggleCart}>
                  ✕
                </button>
              </div>
              <div className="cart-items">
                {cart.map((item) => (
                  <div
                    key={`${item.id}-${JSON.stringify(item.options)}`}
                    className="cart-item"
                  >
                    <div className="cart-item-details">
                      <h5>{item.name}</h5>
                      <div className="cart-item-price">
                        ${(item.price * item.quantity).toFixed(2)}
                      </div>
                      <div className="cart-item-options">
                        {this.renderOptions(item)}
                      </div>
                    </div>
                    <div className="quantity-control-vertical">
                      <button
                        onClick={() =>
                          updateQuantity(item.id, item.options, item.quantity + 1)
                        }
                      >
                        +
                      </button>
                      <span>{item.quantity}</span>
                      <button
                        onClick={() =>
                          updateQuantity(item.id, item.options, item.quantity - 1)
                        }
                      >
                        -
                      </button>
                    </div>
                    <div className="cart-item-image-container">
                      <img
                        src={item.gallery[0]}
                        alt={item.name}
                        className="cart-item-image"
                      />
                    </div>
                  </div>
                ))}
              </div>
              <div className="cart-footer">
                <h3>Total: ${cartTotal.toFixed(2)}</h3>
                <button
                  className="place-order-button"
                  onClick={placeOrder}
                  disabled={cart.length === 0}
                >
                  Place Order
                </button>
              </div>
            </div>
          );
        }}
      </CartConsumer>
    );
  }
}

export default CartOverlay;
