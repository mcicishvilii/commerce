import React, { Component } from "react";
import { CartConsumer } from "../CartContext";
import "./ProductDetailsScreen.css";
import cartIcon from "../assets/green-shopping-cart-10909.png";
import { useNavigate, useLocation, useParams } from "react-router-dom";

class ProductDetailsScreen extends Component {
  constructor(props) {
    super(props);
    this.state = {
      product: null,
      loading: true,
      error: null,
      selectedOptions: {},
      currentImageIndex: 0,
    };

    this.fetchProductDetails = this.fetchProductDetails.bind(this);
    this.handleOptionChange = this.handleOptionChange.bind(this);
    this.showNextImage = this.showNextImage.bind(this);
    this.showPrevImage = this.showPrevImage.bind(this);
  }

  componentDidMount() {
    this.fetchProductDetails();
  }

  componentDidUpdate(prevProps) {
    if (prevProps.router.params.id !== this.props.router.params.id) {
      this.fetchProductDetails();
    }
  }

  async fetchProductDetails() {
    const { id } = this.props.router.params;
    try {
      this.setState({ loading: true });
      const response = await fetch("https://mcicishvilii.serv00.net/graphql", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query: `
            query($id: Int!) {
              product(id: $id) {
                id
                name
                in_stock
                description
                brand
                price
                currency
                gallery
                category {
                  name
                }
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
          variables: { id: parseInt(id) },
        }),
      });
      const data = await response.json();
      if (data.data && data.data.product) {
        this.setState({
          product: data.data.product,
          currentImageIndex: 0,
          loading: false,
          error: null,
        });
      } else {
        this.setState({ error: "Product not found", loading: false });
      }
    } catch (err) {
      this.setState({ error: "An error occurred while fetching the product", loading: false });
    }
  }

  handleOptionChange(attributeId, value) {
    this.setState((prevState) => ({
      selectedOptions: {
        ...prevState.selectedOptions,
        [attributeId]: value,
      },
    }));
  }

  showNextImage() {
    this.setState((prevState) => ({
      currentImageIndex: (prevState.currentImageIndex + 1) % prevState.product.gallery.length,
    }));
  }

  showPrevImage() {
    this.setState((prevState) => ({
      currentImageIndex:
        (prevState.currentImageIndex - 1 + prevState.product.gallery.length) % prevState.product.gallery.length,
    }));
  }

  filterAttributes(categoryName, attributes) {
    if (!categoryName || !attributes) return [];

    return attributes.filter((attribute) => {
      if (categoryName === "clothes") {
        return attribute.name === "Size" || attribute.name === "Color";
      }
      if (categoryName === "tech") {
        return attribute.name === "Capacity" || attribute.name === "Color";
      }
      return attribute.name === "With USB 3 Ports" || attribute.name === "Touch ID in Keyboard";
    });
  }

  render() {
    const { product, loading, error, selectedOptions, currentImageIndex } = this.state;

    if (loading) {
      return <div>Loading...</div>;
    }

    if (error) {
      return <div>Error: {error}</div>;
    }

    if (!product) {
      return <div>Product not found</div>;
    }

    const filteredAttributes = this.filterAttributes(product.category?.name, product.attributes);

    return (
      <CartConsumer>
        {({ addToCart }) => (
          <div className="container">
            <div className="gallery" data-testid="product-gallery">
              <div className="thumbnail-container">
                {product.gallery &&
                  product.gallery.map((image, index) => (
                    <img
                      key={index}
                      src={image}
                      alt={`${product.name} - ${index + 1}`}
                      className="thumbnail"
                      style={{
                        border: currentImageIndex === index ? "2px solid black" : "1px solid gray",
                      }}
                      onClick={() => this.setState({ currentImageIndex: index })}
                    />
                  ))}
              </div>
              <div className="main-image-container">
                <button className="arrow-button" onClick={this.showPrevImage} style={{ left: "10px" }}>
                  &lt;
                </button>
                <img
                  src={product.gallery[currentImageIndex]}
                  alt={product.name}
                  className="main-image"
                />
                <button className="arrow-button" onClick={this.showNextImage} style={{ right: "10px" }}>
                  &gt;
                </button>
              </div>
            </div>
            <div className="details">
              <h1>{product.name}</h1>
              <div className="price">
                {product.price} {product.currency}
              </div>
              <div className="attributes">
                {filteredAttributes.map((attribute) => (
                  <div key={attribute.id} data-testid={`product-attribute-${attribute.name.toLowerCase().replace(/\s+/g, "-")}`}>
                    <h3>{attribute.name}</h3>
                    <div className="options">
                      {attribute.items.map((item) => (
                        <button
                          key={item.id}
                          onClick={() => this.handleOptionChange(attribute.id, item.value)}
                          className="option-button"
                          style={{
                            border: selectedOptions[attribute.id] === item.value ? "2px solid black" : "1px solid gray",
                            backgroundColor: attribute.type === "swatch" ? item.value : "transparent",
                            width: attribute.type === "swatch" ? "30px" : "auto",
                            height: attribute.type === "swatch" ? "30px" : "auto",
                          }}
                        >
                          {attribute.type === "swatch" ? "" : item.value}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              <button
                className="add-to-cart-button"
                onClick={() => addToCart(product, selectedOptions)}
                disabled={!product.in_stock}
                data-testid="add-to-cart"
              >
                {product.in_stock ? "Add to Cart" : "Out of Stock"}
              </button>
              <div className="description" data-testid="product-description">
                {product.description}
              </div>
            </div>
          </div>
        )}
      </CartConsumer>
    );
  }
}


function ProductDetailsScreenWrapper(props) {
  const navigate = useNavigate();
  const location = useLocation();
  const params = useParams();

  return <ProductDetailsScreen {...props} router={{ navigate, location, params }} />;
}

export default ProductDetailsScreenWrapper;
