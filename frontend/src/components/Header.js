import React, { Component } from "react";
import { CartConsumer } from "../CartContext";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faShoppingCart } from "@fortawesome/free-solid-svg-icons";
import { useNavigate, useLocation } from "react-router-dom";
import "./Header.css";

class Header extends Component {
  constructor(props) {
    super(props);
    this.state = {
      categories: [],
      selectedCategory: null,
    };
  }

  componentDidMount() {
    this.fetchCategories();
    this.updateSelectedCategory();
  }

  componentDidUpdate(prevProps) {
    if (prevProps.location !== this.props.location) {
      this.updateSelectedCategory();
    }
  }

  updateSelectedCategory = () => {
    const params = new URLSearchParams(this.props.location.search);
    const category = params.get("category");
    this.setState({ selectedCategory: category || "all" });
  }

  fetchCategories = async () => {
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
  };

  handleCategoryClick = (category) => {
    this.setState({ selectedCategory: category });
    this.props.navigate(category === "all" ? "/" : `/?category=${category}`);
  };

  render() {
    const { categories, selectedCategory } = this.state;

    return (
      <CartConsumer>
        {({ cart, toggleCart }) => {
          const itemCount = cart.reduce((total, item) => total + item.quantity, 0);

          return (
            <header className="header">
              <nav className="nav">
                {categories.map((category) => (
                  <button
                    key={category.id}
                    onClick={() => this.handleCategoryClick(category.name)}
                    className={`category-button ${selectedCategory === category.name ? 'active' : ''}`}
                    data-testid={selectedCategory === category.name ? "active-category-link" : "category-link"}
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
        }}
      </CartConsumer>
    );
  }
}


function HeaderWrapper(props) {
  const navigate = useNavigate();
  const location = useLocation();

  return <Header {...props} navigate={navigate} location={location} />;
}

export default HeaderWrapper;