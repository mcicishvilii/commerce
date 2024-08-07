import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { useCart } from "../CartContext";
import './ProductDetailsScreen.css';

const ProductDetailsScreen = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { addToCart } = useCart();
  const [selectedOptions, setSelectedOptions] = useState({});
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    fetchProductDetails();
  }, [id]);

  const fetchProductDetails = async () => {
    try {
      setLoading(true);
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
        setProduct(data.data.product);
        setCurrentImageIndex(0);
      } else {
        setError("Product not found");
      }
    } catch (err) {
      setError("An error occurred while fetching the product");
    } finally {
      setLoading(false);
    }
  };

  const handleOptionChange = (attributeId, value) => {
    setSelectedOptions((prev) => ({
      ...prev,
      [attributeId]: value,
    }));
  };

  const filterAttributes = (categoryName, attributes, productId) => {
    if (!categoryName || !attributes) return [];
  
    const filteredAttributes = attributes.filter((attribute) => {
      if (categoryName === "clothes") {
        if (attribute.name === "Size" || attribute.name === "Color") {
          return true;
        }
      }
      if (categoryName === "tech" && (attribute.name === "Capacity" || attribute.name === "Color")) {
        return true;
      }

      if (attribute.name === "With USB 3 Ports" || attribute.name === "Touch ID in Keyboard") {
        return true;
      }

      return false;
    });
  
    return filteredAttributes;
  };

  const showNextImage = () => {
    setCurrentImageIndex(
      (prevIndex) => (prevIndex + 1) % product.gallery.length
    );
  };

  const showPrevImage = () => {
    setCurrentImageIndex(
      (prevIndex) =>
        (prevIndex - 1 + product.gallery.length) % product.gallery.length
    );
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  if (!product) {
    return <div>Product not found</div>;
  }

  const filteredAttributes = filterAttributes(
    product.category?.name,
    product.attributes,
    product.id
  );

  return (
    <div className="container">
      <div className="gallery">
        <div className="thumbnail-container">
          {product.gallery &&
            product.gallery.map((image, index) => (
              <img
                key={index}
                src={image}
                alt={`${product.name} - ${index + 1}`}
                className="thumbnail"
                style={{
                  border:
                    currentImageIndex === index
                      ? "2px solid black"
                      : "1px solid gray",
                }}
                onClick={() => setCurrentImageIndex(index)}
              />
            ))}
        </div>
        <div className="main-image-container">
          <button className="arrow-button" onClick={showPrevImage} style={{ left: '10px' }}>
            &lt;
          </button>
          <img
            src={product.gallery[currentImageIndex]}
            alt={product.name}
            className="main-image"
          />
          <button className="arrow-button" onClick={showNextImage} style={{ right: '10px' }}>
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
          {filteredAttributes &&
            filteredAttributes.map((attribute) => (
              <div key={attribute.id}>
                <h3>{attribute.name}</h3>
                <div className="options">
                  {attribute.items &&
                    attribute.items.map((item) => (
                      <button
                        key={item.id}
                        onClick={() => handleOptionChange(attribute.id, item.value)}
                        className="option-button"
                        style={{
                          border:
                            selectedOptions[attribute.id] === item.value
                              ? "2px solid black"
                              : "1px solid gray",
                          backgroundColor: attribute.type === 'swatch' ? item.value : 'transparent',
                          width: attribute.type === 'swatch' ? '30px' : 'auto',
                          height: attribute.type === 'swatch' ? '30px' : 'auto',
                        }}
                      >
                        {attribute.type === 'swatch' ? '' : item.value}
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
        >
          {product.in_stock ? "Add to Cart" : "Out of Stock"}
        </button>
      </div>
    </div>
  );
};

export default ProductDetailsScreen;