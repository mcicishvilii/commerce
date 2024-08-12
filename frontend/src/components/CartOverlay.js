import React from "react";
import { useCart } from "../CartContext";
import "./CartOverlay.css";

const CartOverlay = () => {
  const {
    cart,
    isOpen,
    toggleCart,
    updateQuantity,
    clearCart,
  } = useCart();

  if (!isOpen) return null;

  const total = cart.reduce((sum, item) => sum + item.quantity, 0);
  const cartTotal = cart.reduce(
    (sum, item) => sum + item.quantity * item.price,
    0
  );

  const placeOrder = async () => {
    const orderItems = cart.map((item) => ({
      product_id: item.id,
      quantity: item.quantity,
      options: JSON.stringify(item.options),
    }));
  
    try {
      const response = await fetch("https://mcicishvilii.serv00.net/graphql", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query: `mutation PlaceOrder($items: [order_items!]!) {
            placeOrder(items: $items) {
              success
              message
            }
          }`,
          variables: { items: orderItems },
        }),
      });

      console.log("Response status:", response.status);
      const responseText = await response.text();
      console.log("Response text:", responseText);

      const data = JSON.parse(responseText);
      console.log("Parsed response data:", data);

      if (data.data && data.data.placeOrder.success) {
        alert(data.data.placeOrder.message);
        clearCart();
      } else {
        console.error("Order placement failed:", data.data.placeOrder.message);
        alert(`Failed to place order: ${data.data.placeOrder.message}`);
      }
    } catch (error) {
      console.error("Error during order placement:", error);
      alert("An error occurred while placing the order. Please try again.");
    }
  };

  const renderOptions = (item) => {
    const { options, attributes, category } = item;

    return (
      <>
        {attributes.map((attr) => {
          const attrName = attr.name.toLowerCase();
          const selectedValue = options[attr.id];
          const attrNameKebab = attr.name.toLowerCase().replace(/\s+/g, '-');

          const renderOption = (content) => (
            <div 
              key={attr.id} 
              className="option-item"
              data-testid={`cart-item-attribute-${attrNameKebab}`}
            >
              {content}
            </div>
          );

          if (category.name === "clothes") {
            if (attrName === "size") {
              return renderOption(
                <>
                  <span className="option-name">Size:</span>
                  <span 
                    data-testid={`cart-item-attribute-${attrNameKebab}-${selectedValue.toLowerCase()}-selected`}
                  >
                    {selectedValue}
                  </span>
                </>
              );
            } 
          } else if (category.name === "tech") {
            if (attrName === "capacity") {
              return renderOption(
                <>
                  <span className="option-name">Capacity:</span>
                  <span 
                    data-testid={`cart-item-attribute-${attrNameKebab}-${selectedValue.toLowerCase()}-selected`}
                  >
                    {selectedValue}
                  </span>
                </>
              );
            }
            else if (attrName === "color") {
              return renderOption(
                <>
                  <span className="option-name">Color:</span>
                  <div 
                    className="color-swatch"
                    style={{ 
                      backgroundColor: selectedValue,
                      width: '20px',
                      height: '20px',
                      display: 'inline-block',
                      marginLeft: '5px',
                      border: '1px solid #ccc',
                    }}
                    data-testid={`cart-item-attribute-${attrNameKebab}-${selectedValue.toLowerCase()}-selected`}
                  />
                </>
              );
            }
          }
          return renderOption(
            <>
              <span className="option-name">{attr.name}:</span>
              <span 
                data-testid={`cart-item-attribute-${attrNameKebab}-${selectedValue.toLowerCase()}-selected`}
              >
                {selectedValue}
              </span>
            </>
          );
        })}
      </>
    );
  };

  return (
    <div className="cart-overlay">
      <div className="cart-header">
        <h2>
          Your Cart ({total} {total === 1 ? "Item" : "Items"})
        </h2>
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
              <div className="cart-item-options">{renderOptions(item)}</div>
            </div>
            <div className="quantity-control-vertical">
              <button
                onClick={() =>
                  updateQuantity(item.id, item.options, item.quantity + 1)
                }
                data-testid="cart-item-amount-increase"
              >
                +
              </button>

              <span data-testid="cart-item-amount">{item.quantity}</span>
              <button
                onClick={() =>
                  updateQuantity(item.id, item.options, item.quantity - 1)
                }
                data-testid="cart-item-amount-decrease"
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
        <h3 data-testid="cart-total">Total: ${cartTotal.toFixed(2)}</h3>
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
};

export default CartOverlay;
