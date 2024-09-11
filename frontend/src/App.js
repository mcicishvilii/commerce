import React, { Component } from "react";
import { Routes, Route, useLocation, useSearchParams } from "react-router-dom";
import Header from "./components/Header";
import CartOverlay from "./components/CartOverlay";
import { CartConsumer } from "./CartContext";
import ProductList from "./components/ProductListScreen";
import DetailsScreen from "./components/ProductDetails";

class App extends Component {
  constructor(props) {
    super(props);

    const searchParams = new URLSearchParams(this.props.location.search);
    const category = searchParams.get("category") || "all";

    this.state = {
      category,
    };
  }

  render() {
    const { category } = this.state;

    return (
      <div style={{ paddingLeft: "250px", paddingRight: "250px" }}>
        <Header />
        <CartConsumer>
          {({ isOpen, toggleCart }) => (
            <>
              <CartOverlay />
              {isOpen && (
                <div
                  style={{
                    position: "fixed",
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: "rgba(0,0,0,0.5)",
                    zIndex: 999,
                  }}
                  onClick={toggleCart}
                />
              )}
            </>
          )}
        </CartConsumer>
        <Routes>
          <Route path="/" element={<ProductList category={category} />} />
          <Route path="/product/:id" element={<DetailsScreen />} />
        </Routes>
      </div>
    );
  }
}

function AppWrapper() {
  const location = useLocation();
  const [searchParams] = useSearchParams();

  return <App location={location} searchParams={searchParams} />;
}

export default AppWrapper;