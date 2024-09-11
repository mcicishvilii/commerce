import React, { Component } from "react";
import { CartConsumer } from "../CartContext";
import cartIcon from "../assets/green-shopping-cart-10909.png";
import { useNavigate, useLocation, useSearchParams } from "react-router-dom";

class ProductListScreen extends Component {
  constructor(props) {
    super(props);
    this.state = {
      products: [],
      categories: [],
      selectedCategory: null,
      hoveredProduct: null,
    };

    this.handleProductClick = this.handleProductClick.bind(this);
    this.fetchProducts = this.fetchProducts.bind(this);
    this.fetchCategories = this.fetchCategories.bind(this);
    this.getDefaultOptions = this.getDefaultOptions.bind(this);
  }

  componentDidMount() {
    this.fetchCategories();
    const searchParams = new URLSearchParams(this.props.location.search);
    const category = searchParams.get("category") || "all";
    this.setState({ selectedCategory: category });
    this.fetchProducts(category);
  }

  componentDidUpdate(prevProps) {
    if (prevProps.location.search !== this.props.location.search) {
      const searchParams = new URLSearchParams(this.props.location.search);
      const category = searchParams.get("category") || "all";
      this.setState({ selectedCategory: category });
      this.fetchProducts(category);
    }
  }

  handleProductClick(product) {
    this.props.navigate(`/product/${product.id}`);
  }


  async fetchProducts(category = null) {
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
      this.setState({ products: data.data.products });
    }
  }

  async fetchCategories() {
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
      this.setState({ categories: data.data.categories });
    }
  }

  getDefaultOptions(attributes) {
    const defaultOptions = {};
    attributes.forEach((attribute) => {
      if (attribute.items.length > 0) {
        defaultOptions[attribute.id] = attribute.items[0].value;
      }
    });
    return defaultOptions;
  }

  render() {
    const { products, selectedCategory, hoveredProduct } = this.state;

    return (
      <CartConsumer>
        {({ addToCart, isOpen, toggleCart }) => (
          <div style={{ paddingLeft: "80px", paddingRight: "80px" }}>
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

            <h1>{selectedCategory ? selectedCategory.toUpperCase() : "ALL PRODUCTS"}</h1>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(3, 1fr)",
                gap: "20px",
              }}
            >
              {products.map((product) => (
                <div
                  key={product.id}
                  onClick={() => this.handleProductClick(product)}
                  onMouseEnter={() => this.setState({ hoveredProduct: product.id })}
                  onMouseLeave={() => this.setState({ hoveredProduct: null })}
                  style={{
                    cursor: "pointer",
                    border: "1px solid #ccc",
                    padding: "10px",
                    borderRadius: "5px",
                    textAlign: "center",
                    position: "relative",
                    boxShadow: "0 4px 8px 0 rgba(0, 0, 0, 0.2)",
                    transition: "box-shadow 0.3s ease",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                  }}
                >
                  <div style={{ position: "relative", flex: "1 0 auto" }}>
                    <img
                      src={product.gallery[0]}
                      alt={product.name}
                      style={{
                        width: "100%",
                        height: "200px",
                        objectFit: "contain",
                        filter: product.in_stock ? "none" : "grayscale(100%)",
                      }}
                    />
                    {!product.in_stock && (
                      <div
                        style={{
                          position: "absolute",
                          top: 0,
                          left: 0,
                          width: "100%",
                          height: "100%",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          backgroundColor: "rgba(0, 0, 0, 0.5)",
                          color: "white",
                          fontSize: "1.5em",
                        }}
                      >
                        Out of Stock
                      </div>
                    )}
                  </div>
                  <div style={{ textAlign: "left", padding: "10px 0" }}>
                    <h2 style={{ margin: "0 0 10px 0" }}>{product.name}</h2>
                    <p style={{ margin: 0 }}>
                      Price: ${product.price ? product.price.toFixed(2) : "N/A"}
                    </p>
                  </div>
                  {product.in_stock && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        const defaultOptions = this.getDefaultOptions(product.attributes);
                        addToCart(product, defaultOptions);
                      }}
                      style={{
                        position: "absolute",
                        bottom: "10px",
                        right: "10px",
                        backgroundColor: "transparent",
                        border: "none",
                        cursor: "pointer",
                        width: "40px",
                        height: "40px",
                        borderRadius: "50%",
                        display: hoveredProduct === product.id ? "flex" : "none",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <img
                        src={cartIcon}
                        alt="Add to Cart"
                        style={{ width: "24px", height: "24px" }}
                      />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </CartConsumer>
    );
  }
}

function ProductListScreenWrapper(props) {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();

  return <ProductListScreen {...props} navigate={navigate} location={location} searchParams={searchParams} />;
}

export default ProductListScreenWrapper;
