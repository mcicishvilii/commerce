import React, { useState, useEffect } from "react";
import { useCart } from "../CartContext";
import { useNavigate, useLocation } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faShoppingCart } from "@fortawesome/free-solid-svg-icons";
import './styles/Header.css';

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
    const response = await fetch("https://mcicishvilii.serv00.net/graphql", {
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
    <header className="header">
      <nav className="nav">
        {categories.map((category) => (
          <button
            key={category.id}
            onClick={() => handleCategoryClick(category.name)}
            className={`category-button ${selectedCategory === category.name ? 'active' : ''}`}
          >
            {category.name}
          </button>
        ))}
      </nav>
      <button
        data-testid="cart-btn"
        onClick={toggleCart}
        className="cart-button"
      >
        <FontAwesomeIcon icon={faShoppingCart} />
        {itemCount > 0 && <span className="cart-count">{itemCount}</span>}
      </button>
    </header>
  );
};

export default Header;
