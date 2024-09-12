import React, { createContext, Component } from "react";

const CartContext = createContext();

export class CartProvider extends Component {
  constructor(props) {
    super(props);

    this.state = {
      cart: [],
      isOpen: false,
    };

    this.addToCart = this.addToCart.bind(this);
    this.removeFromCart = this.removeFromCart.bind(this);
    this.updateQuantity = this.updateQuantity.bind(this);
    this.clearCart = this.clearCart.bind(this);
    this.toggleCart = this.toggleCart.bind(this);
  }

  componentDidMount() {
    const savedCart = localStorage.getItem("cart");
    if (savedCart) {
      this.setState({ cart: JSON.parse(savedCart) });
    }
  }

  componentDidUpdate(_, prevState) {
    if (prevState.cart !== this.state.cart) {
      localStorage.setItem("cart", JSON.stringify(this.state.cart));
    }
  }

  addToCart(product, options) {
    this.setState((prevState) => {
      const existingItemIndex = prevState.cart.findIndex(
        (item) =>
          item.id === product.id &&
          JSON.stringify(item.options) === JSON.stringify(options)
      );

      if (existingItemIndex !== -1) {
        const updatedCart = [...prevState.cart];
        updatedCart[existingItemIndex].quantity += 1;
        return { cart: updatedCart };
      } else {
        return {
          cart: [...prevState.cart, { ...product, options, quantity: 1 }],
        };
      }
    });
  }

  removeFromCart(id, options) {
    this.setState((prevState) => ({
      cart: prevState.cart.filter(
        (item) =>
          !(
            item.id === id &&
            JSON.stringify(item.options) === JSON.stringify(options)
          )
      ),
    }));
  }

  updateQuantity(id, options, quantity) {
    this.setState((prevState) => ({
      cart: prevState.cart
        .map((item) =>
          item.id === id &&
          JSON.stringify(item.options) === JSON.stringify(options)
            ? { ...item, quantity: Math.max(0, quantity) }
            : item
        )
        .filter((item) => item.quantity > 0),
    }));
  }

  clearCart() {
    this.setState({ cart: [] });
  }

  toggleCart() {
    this.setState((prevState) => ({ isOpen: !prevState.isOpen }));
  }

  render() {
    const { cart, isOpen } = this.state;

    return (
      <CartContext.Provider
        value={{
          cart,
          isOpen,
          addToCart: this.addToCart,
          removeFromCart: this.removeFromCart,
          updateQuantity: this.updateQuantity,
          clearCart: this.clearCart,
          toggleCart: this.toggleCart,
        }}
      >
        {this.props.children}
      </CartContext.Provider>
    );
  }
}

// Consumer for class components
export const CartConsumer = CartContext.Consumer;

