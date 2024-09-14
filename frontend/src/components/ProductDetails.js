import React, { Component } from "react";
import { CartConsumer } from "../CartContext";
import leftArrow from "../assets/left-arrow.svg";
import rightArrow from "../assets/right-arrow.svg";
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
      this.setState({
        error: "An error occurred while fetching the product",
        loading: false,
      });
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
      currentImageIndex:
        (prevState.currentImageIndex + 1) % prevState.product.gallery.length,
    }));
  }

  showPrevImage() {
    this.setState((prevState) => ({
      currentImageIndex:
        (prevState.currentImageIndex - 1 + prevState.product.gallery.length) %
        prevState.product.gallery.length,
    }));
  }

  filterAttributes(categoryName, attributes) {
    if (!categoryName || !attributes) return [];
  
    const filtered = attributes.filter((attribute) => {
      if (categoryName === "clothes") {
        return attribute.name === "Size" || attribute.name === "Color";
      }
      if (categoryName === "tech" && (attribute.name === "Capacity" || attribute.name === "Color")) {
        return attribute.name === "Capacity" || attribute.name === "Color";
      }
      return (
        attribute.name === "With USB 3 Ports" ||
        attribute.name === "Touch ID in Keyboard"
      );
    });
  
    // Remove duplicates
    filtered.forEach(attribute => {
      if (attribute.name === "Touch ID in Keyboard") {
        const uniqueItems = Array.from(new Set(attribute.items.map(item => item.value)))
          .map(value => attribute.items.find(item => item.value === value));
        attribute.items = uniqueItems;
      }
    });
  
    console.log('Filtered attributes with unique items:', filtered);
  
    return filtered;
  }
  
  render() {
    const { product, loading, error, selectedOptions, currentImageIndex } =
      this.state;
  
    if (loading) {
      return <div className="text-center">Loading...</div>;
    }
  
    if (error) {
      return <div className="alert alert-danger">Error: {error}</div>;
    }
  
    if (!product) {
      return <div className="alert alert-warning">Product not found</div>;
    }
  
    const filteredAttributes = this.filterAttributes(
      product.category?.name,
      product.attributes
    );
  
    return (
      <CartConsumer>
        {({ addToCart }) => (
          <div className="container mt-5">
            <div className="row">
              {/* Thumbnails Vertical List */}
              <div className="col-md-2 d-flex flex-column align-items-center">
                {product.gallery &&
                  product.gallery.map((image, index) => (
                    <img
                      key={index}
                      src={image}
                      alt={`${product.name} - ${index + 1}`}
                      className={`img-thumbnail mb-2 ${
                        currentImageIndex === index
                          ? "border-dark"
                          : "border-light"
                      }`}
                      onClick={() =>
                        this.setState({ currentImageIndex: index })
                      }
                      style={{
                        cursor: "pointer",
                        width: "60px",
                        height: "60px",
                      }}
                    />
                  ))}
              </div>
  
              {/* Main Image */}
              <div className="col-md-5">
                <div className="position-relative text-center">
                  <button
                    className="btn position-absolute d-flex align-items-center justify-content-center"
                    style={{
                      left: "10px",
                      top: "50%",
                      transform: "translateY(-50%)",
                      background: "rgba(0, 0, 0, 1)",
                      width: "40px",
                      height: "40px",
                    }}
                    onClick={this.showPrevImage}
                  >
                    <img
                      src={leftArrow}
                      alt="Previous Image"
                      style={{ width: "24px", height: "24px" }}
                    />
                  </button>
                  <img
                    src={product.gallery[currentImageIndex]}
                    alt={product.name}
                    className="img-fluid rounded"
                    style={{ width: '600px', height: '400px', objectFit: 'scale-down' }}
                  />
                  <button
                    className="btn position-absolute d-flex align-items-center justify-content-center"
                    style={{
                      right: "10px",
                      top: "50%",
                      transform: "translateY(-50%)",
                      background: "rgba(0, 0, 0, 1)",
                      width: "40px",
                      height: "40px",
                    }}
                    onClick={this.showNextImage}
                  >
                    <img
                      src={rightArrow}
                      alt="Next Image"
                      style={{ width: "24px", height: "24px" }}
                    />
                  </button>
                </div>
              </div>
  
              {/* Product Details and Description */}
              <div className="col-md-5">
                <h3
                  style={{ fontFamily: "Raleway", fontWeight: "600" }}
                  className="mb-3"
                >
                  {product.name}
                </h3>
  
                {/* Attributes Section */}
                <div>
                  {filteredAttributes.map((attribute) => (
                    <div key={attribute.id} className="mb-3">
                      <h6
                        style={{
                          fontFamily: "Roboto Condensed",
                          fontWeight: "700",
                          textTransform: "uppercase",
                        }}
                      >
                        {attribute.name + ":"}
                      </h6>
                      <div className="btn-toolbar">
                        {attribute.items.map((item) => {
                          const isSelected =
                            selectedOptions[attribute.id] === item.value;
                          const isColor = attribute.type === "swatch";
  
                          return (
                            <button
                              key={item.id}
                              onClick={() =>
                                this.handleOptionChange(attribute.id, item.value)
                              }
                              className={`btn ${
                                isSelected
                                  ? isColor
                                    ? "btn-color-selected"
                                    : "btn-selected"
                                  : isColor
                                  ? "btn-color-default"
                                  : "btn-default"
                              }`}
                              style={{
                                backgroundColor: isSelected
                                  ? (isColor ? item.value : "black")
                                  : isColor
                                  ? item.value
                                  : "transparent",
                                color: isSelected
                                  ? (isColor ? "black" : "white")
                                  : "inherit",
                                width: isColor ? "25px" : "50px",
                                height: isColor ? "25px" : "40px",
                                marginRight: '8px',
                                padding: '0px',
                                borderRadius: '0',
                                border: isSelected
                                  ? (isColor ? "1px solid green" : "none")
                                  : (isColor ? "none" : "1px solid black"),
                                  outlineOffset: "-3px",
                                  outline: isSelected && isColor ? "1px solid white" : "none",
                              }}
                            >
                              {isColor ? "" : item.value}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
  
                <h6
                  style={{
                    fontFamily: "Roboto Condensed",
                    fontWeight: "700",
                    textTransform: "uppercase",
                  }}
                >
                  {"price:"}
                </h6>
  
                <div
                  style={{
                    fontFamily: "Raleway",
                    fontWeight: "700",
                    color: "#1D1F22",
                  }}
                  className="h5 mb-3"
                >
                  ${product.price}
                </div>
  
                <button
                  className={`btn ${
                    product.in_stock ? "btn-success" : "btn btn-secondary"
                  } w-50 mb-3`}
                  onClick={() => addToCart(product, selectedOptions)}
                  disabled={!product.in_stock}
                  style={{ borderRadius: 0 }}
                >
                  {product.in_stock ? "Add to Cart" : "Out of Stock"}
                </button>
  
                <div>
                  <p style={{ fontFamily: "Roboto", fontWeight: "400" }}>
                    {product.description}
                  </p>
                </div>
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

  return (
    <ProductDetailsScreen {...props} router={{ navigate, location, params }} />
  );
}

export default ProductDetailsScreenWrapper;
