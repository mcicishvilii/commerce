import React from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import Header from "./components/Header";
import CartOverlay from "./components/CartOverlay";
import { useCart } from "./CartContext";
import ProductList from "./components/ProductListScreen";
import DetailsScreen from "./components/ProductDetails";

const App = () => {
  const { isOpen, toggleCart } = useCart();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const category = searchParams.get("category") || "all";

  return (
    <div style={{ paddingLeft: "80px", paddingRight: "80px" }}>
      <Header />
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
          onClick={() => toggleCart()}
        />
      )}
      <Routes>
        <Route path="/" element={<ProductList category={category} />} />
        <Route path="/product/:id" element={<DetailsScreen />} />
      </Routes>
    </div>
  );
};

export default App;
