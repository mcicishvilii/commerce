import React, { useState, useEffect } from "react";
import { useCart } from "../CartContext";
import cartIcon from "../assets/green-shopping-cart-10909.png";
import { useNavigate, useLocation } from "react-router-dom";
import './styles/ProductListScreen.css';

const ProductListScreen = () => {
  const { addToCart, isOpen, toggleCart } = useCart();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [hoveredProduct, setHoveredProduct] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    fetchCategories();
    const searchParams = new URLSearchParams(location.search);
    const category = searchParams.get("category") || "all";
    setSelectedCategory(category);
    fetchProducts(category);
  }, [location]);

  const handleProductClick = (product) => {
    navigate(`/product/${product.id}`);
  };

  const fetchProducts = async (category = null) => {
    const response = await fetch("https://mcicishvilii.serv00.net/graphql", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        query: `
                    query GetProducts($category: String) {
                        products(filter: $category) {
                            id
                            name
                            in_stock
                            description
                            brand
                            price
                            currency
                            category {
                                name
                            }
                            gallery
                            attributes {
                                id
                                name
                                type
                                items {
                                    displayValue
                                    value
                                    id
                                }
                            }
                        }
                    }
                `,
        variables: {
          category: category === "all" ? null : category,
        },
      }),
    });
    const data = await response.json();
    if (data.data.products) {
      setProducts(data.data.products);
    }
  };

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

  const getDefaultOptions = (attributes) => {
    const defaultOptions = {};
    attributes.forEach((attribute) => {
      if (attribute.items.length > 0) {
        defaultOptions[attribute.id] = attribute.items[0].value;
      }
    });
    return defaultOptions;
  };

  return (
    <div className="product-list">
      {isOpen && (
        <div className="cart-overlay" onClick={() => toggleCart()} />
      )}

      <h1>
        {selectedCategory ? selectedCategory.toUpperCase() : "ALL PRODUCTS"}
      </h1>
      <div className="product-grid">
        {products.map((product) => (
          <div
            key={product.id}
            onClick={() => handleProductClick(product)}
            onMouseEnter={() => setHoveredProduct(product.id)}
            onMouseLeave={() => setHoveredProduct(null)}
            className="product-card"
          >
            <div className="product-image-wrapper">
              <img
                src={product.gallery[0]}
                alt={product.name}
                className={`product-image ${!product.in_stock ? 'grayscale' : ''}`}
              />
              {!product.in_stock && (
                <div className="out-of-stock">
                  Out of Stock
                </div>
              )}
            </div>
            <div className="product-details">
              <h2 className="product-name">{product.name}</h2>
              <p className="product-price">
                Price: ${product.price ? product.price.toFixed(2) : "N/A"}
              </p>
            </div>
            {product.in_stock && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  const defaultOptions = getDefaultOptions(product.attributes);
                  addToCart(product, defaultOptions);
                }}
                className="add-to-cart-button"
              >
                <img
                  src={cartIcon}
                  alt="Add to Cart"
                />
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProductListScreen;
