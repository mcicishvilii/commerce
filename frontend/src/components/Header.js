import React, { useState, useEffect } from "react";
import { useCart } from "../CartContext";
import { useNavigate, useLocation } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faShoppingCart } from "@fortawesome/free-solid-svg-icons";

const Header = () => {
  const { cart, toggleCart } = useCart();
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();

  const itemCount = cart.reduce((total, item) => total + item.quantity, 0);

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const category = params.get("category");
    setSelectedCategory(category || "all");
  }, [location]);

  const fetchCategories = async () => {
    const response = await fetch("http://localhost:8000/graphql", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        query: `
          query {
            categories {
              id
              name
            }
          }
        `,
      }),
    });
    const data = await response.json();
    if (data.data.categories) {
      setCategories(data.data.categories);
    }
  };

  const handleCategoryClick = (category) => {
    setSelectedCategory(category);
    navigate(category === "all" ? "/" : `/?category=${category}`);
  };

  return (
    <header style={styles.header}>
      <nav style={styles.nav}>
        {categories.map((category) => (
          <button
            key={category.id}
            onClick={() => handleCategoryClick(category.name)}
            style={{
              ...styles.categoryButton,
              color: selectedCategory === category.name ? "green" : "black",
              borderBottom:
                selectedCategory === category.name ? "2px solid green" : "none",
            }}
          >
            {category.name}
          </button>
        ))}
      </nav>
      <button
        data-testid="cart-btn"
        onClick={toggleCart}
        style={styles.cartButton}
      >
        <FontAwesomeIcon icon={faShoppingCart} />
        {itemCount > 0 && <span style={styles.cartCount}>{itemCount}</span>}
      </button>
    </header>
  );
};

const styles = {
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "20px",
    backgroundColor: "transparent",
  },
  nav: {
    display: "flex",
    gap: "20px",
  },
  categoryButton: {
    padding: "10px",
    backgroundColor: "transparent",
    color: "#000",
    border: "none",
    cursor: "pointer",
    fontSize: "16px",
    textTransform: "uppercase",
  },
  cartButton: {
    position: "relative",
    padding: "10px",
    cursor: "pointer",
    backgroundColor: "transparent",
    border: "none",
    fontSize: "16px",
  },
  cartCount: {
    position: "absolute",
    top: "-10px",
    right: "-10px",
    backgroundColor: "red",
    color: "white",
    borderRadius: "50%",
    padding: "2px 6px",
    fontSize: "12px",
  },
};

export default Header;
