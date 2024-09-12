import React, { Component } from "react";
import { CartConsumer } from "../CartContext";
import "bootstrap/dist/css/bootstrap.min.css";
import plusButton from "../assets/plus-square.svg";
import minusButton from "../assets/dash-square.svg";

class CartOverlay extends Component {

  placeOrder = async (cart, clearCart) => {
    try {
      for (const item of cart) {
        const orderData = {
          order_number: Math.random().toString(36).substring(2, 15),
          product_name: item.name, 
          product_option: JSON.stringify(item.options), 
          price: item.price * item.quantity,
          order_date: new Date().toISOString(),
        };
  
        const mutation = `
          mutation CreateOrder($order_number: String!, $product_name: String!, $product_option: String!, $price: Float!, $order_date: String!) {
            createOrder(order_number: $order_number, product_name: $product_name, product_option: $product_option, price: $price, order_date: $order_date)
          }
        `;
  
        const response = await fetch('https://mcicishvilii.serv00.net/graphql', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            query: mutation,
            variables: orderData,
          }),
        });
  
        const text = await response.text(); 
  
        const result = JSON.parse(text);
  
        if (result.errors) {
          console.error('GraphQL Error:', result.errors);
          alert('Order failed for item: ' + item.name);
          return; 
        }
      }
  

      alert('All orders placed successfully');
      clearCart();
  
    } catch (error) {
      console.error('Error:', error);
      alert('An error occurred while placing the order.');
    }
  };
  
  renderOptions(item) {
    const { options, attributes, category } = item;

    return (
      <>
        {attributes.map((attr) => {
          const selectedValue = options[attr.id];
          return (
            <div key={attr.id} className="py-0">
              <div className="fw-bold mb-1">{attr.name}:</div>
              {attr.name.toLowerCase() === "size" ? (
                <div className="d-flex gap-1">
                  {attr.items.map((size) => (
                    <button
                      key={size.id}
                      className={`btn btn-outline-secondary btn-sm ${
                        selectedValue === size.value ? "active" : ""
                      }`}
                      style={{ minWidth: "30px" }}
                    >
                      {size.value}
                    </button>
                  ))}
                </div>
              ) : attr.name.toLowerCase() === "color" ? (
                <div className="d-flex gap-1">
                  {attr.items.map((color) => (
                    <button
                      key={color.id}
                      className={`${
                        selectedValue === color.value
                          ? "border border-2 border-primary"
                          : "border"
                      }`}
                      style={{
                        backgroundColor: color.value,
                        width: "24px",
                        height: "24px",
                        padding: 0,
                        borderRadius: 0,
                        cursor: "pointer",
                      }}
                    />
                  ))}
                </div>
              ) : (
                <span>{selectedValue}</span>
              )}
            </div>
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

          return (
            <>
              {/* Backdrop */}
              <div
                className="position-fixed top-0 start-0 w-100 h-100"
                style={{
                  backgroundColor: "rgba(0, 0, 0, 0.5)",
                  zIndex: 1040,
                }}
                onClick={toggleCart}
              ></div>

              {/* Cart Overlay */}
              <div
                className="position-fixed top-0 end-0 h-100 bg-white border-start border-secondary shadow-lg"
                style={{
                  width: "350px",
                  zIndex: 1050,
                  overflowY: "auto",
                }}
              >
                <div className="p-3">
                  <div className="d-flex justify-content-between align-items-center border-bottom pb-2 mb-3">
                    <h5 className="m-0">
                      My Bag,{" "}
                      {cart.reduce((sum, item) => sum + item.quantity, 0)} {cart.length === 1 ? "item" : "items"}
                    </h5>
                  </div>
                  <div className="mb-2">
                    {cart.map((item) => (
                      <div
                        key={`${item.id}-${JSON.stringify(item.options)}`}
                        className="d-flex mb-4 align-items-center"
                        style={{ height: "200px" }}
                      >
                        <div className="flex-grow-1 me-2">
                          <div className="fw-bold mb-1">{item.name}</div>
                          <div className="fw-bold mb-2">
                            ${item.price.toFixed(2)}
                          </div>
                          {this.renderOptions(item)}
                        </div>

                        <div
                          className="d-flex flex-column justify-content-between align-items-center mx-2"
                          style={{ height: "100%" }}
                        >
                          <button
                            className="btn btn-link text-dark p-1"
                            onClick={() =>
                              updateQuantity(
                                item.id,
                                item.options,
                                item.quantity + 1
                              )
                            }
                          >
                            <img
                              src={plusButton}
                              alt="Increase Quantity"
                              style={{ width: "20px", height: "20px" }}
                            />
                          </button>

                          <span className="px-2">{item.quantity}</span>

                          <button
                            className="btn btn-link text-dark p-1"
                            onClick={() =>
                              updateQuantity(
                                item.id,
                                item.options,
                                item.quantity - 1
                              )
                            }
                          >
                            <img
                              src={minusButton}
                              alt="Decrease Quantity"
                              style={{ width: "20px", height: "20px" }}
                            />
                          </button>
                        </div>

                        <div className="ms-2" style={{ width: "100px" }}>
                          <img
                            src={item.gallery[0]}
                            alt={item.name}
                            className="img-fluid"
                            style={{ maxHeight: "120px", objectFit: "cover" }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="cart-footer border-top pt-3 mt-3">
                    <div className="d-flex justify-content-between align-items-center mb-3">
                      <h6 className="fw-bold m-0">Total</h6>
                      <h6 className="fw-bold m-0">
                        $
                        {cart
                          .reduce(
                            (sum, item) => sum + item.quantity * item.price,
                            0
                          )
                          .toFixed(2)}
                      </h6>
                    </div>
                    <button
                      className="btn btn-success w-100"
                      style={{
                        backgroundColor: "#5ECE7B",
                        borderColor: "#5ECE7B",
                      }}
                      onClick={() => {
                        this.placeOrder(cart, clearCart);
                      }}
                      disabled={cart.length === 0}
                    >
                      PLACE ORDER
                    </button>
                  </div>
                </div>
              </div>
            </>
          );
        }}
      </CartConsumer>
    );
  }
}

export default CartOverlay;
