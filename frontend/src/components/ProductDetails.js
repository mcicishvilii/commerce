import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useCart } from '../CartContext';

const ProductDetails = () => {
    const { productId } = useParams();
    const { addToCart } = useCart();
    const [product, setProduct] = useState(null);
    const [selectedAttributes, setSelectedAttributes] = useState({});
    const [mainImageIndex, setMainImageIndex] = useState(0);

    useEffect(() => {
        fetchProductDetails(productId);
    }, [productId]);

    const fetchProductDetails = async (id) => {
        const response = await fetch('http://localhost:8000/graphql', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                query: `
                    query {
                        product(id: ${id}) {
                            id
                            name
                            description
                            price
                            currency
                            gallery
                            attributes {
                                name
                                type
                                items {
                                    value
                                    displayValue
                                }
                            }
                        }
                    }
                `,
            }),
        });
        const data = await response.json();
        if (data.data.product) {
            setProduct(data.data.product);
        }
    };

    const handleAttributeChange = (attributeName, itemValue) => {
        setSelectedAttributes((prev) => ({
            ...prev,
            [attributeName]: itemValue,
        }));
    };

    const handleAddToCart = () => {
        addToCart(product, selectedAttributes);
    };

    if (!product) {
        return <div>Loading...</div>;
    }

    const allAttributesSelected = product.attributes.every(
        (attr) => selectedAttributes[attr.name]
    );

    return (
        <div>
            <div data-testid="product-gallery">
                <div>
                    {product.gallery.map((image, index) => (
                        <img
                            key={index}
                            src={image}
                            alt={`Product image ${index + 1}`}
                            style={{
                                width: '50px',
                                height: '50px',
                                objectFit: 'cover',
                                cursor: 'pointer',
                                border: index === mainImageIndex ? '2px solid green' : 'none'
                            }}
                            onClick={() => setMainImageIndex(index)}
                        />
                    ))}
                </div>
                <div>
                    <img
                        src={product.gallery[mainImageIndex]}
                        alt={`Main product image`}
                        style={{ width: '400px', height: '400px', objectFit: 'cover' }}
                    />
                </div>
            </div>
            <h1>{product.name}</h1>
            <div>
                {product.attributes.map((attr) => (
                    <div key={attr.name} data-testid={`product-attribute-${attr.name.toLowerCase().replace(/\s+/g, '-')}`}>
                        <h3>{attr.name}</h3>
                        {attr.type === 'swatch' ? (
                            attr.items.map((item) => (
                                <button
                                    key={item.value}
                                    style={{
                                        backgroundColor: item.value,
                                        width: '30px',
                                        height: '30px',
                                        border: selectedAttributes[attr.name] === item.value ? '2px solid black' : '1px solid #ccc',
                                        cursor: 'pointer',
                                    }}
                                    onClick={() => handleAttributeChange(attr.name, item.value)}
                                ></button>
                            ))
                        ) : (
                            attr.items.map((item) => (
                                <button
                                    key={item.value}
                                    style={{
                                        padding: '10px',
                                        backgroundColor: selectedAttributes[attr.name] === item.value ? 'green' : 'transparent',
                                        border: '1px solid #ccc',
                                        cursor: 'pointer',
                                    }}
                                    onClick={() => handleAttributeChange(attr.name, item.value)}
                                >
                                    {item.displayValue}
                                </button>
                            ))
                        )}
                    </div>
                ))}
            </div>
            <p>Price: {product.price.toFixed(2)} {product.currency}</p>
            <button
                data-testid="add-to-cart"
                onClick={handleAddToCart}
                disabled={!allAttributesSelected}
                style={{
                    backgroundColor: allAttributesSelected ? 'green' : 'grey',
                    color: 'white',
                    padding: '10px 20px',
                    border: 'none',
                    cursor: allAttributesSelected ? 'pointer' : 'not-allowed',
                }}
            >
                Add to Cart
            </button>
            <div data-testid="product-description" dangerouslySetInnerHTML={{ __html: product.description }} />
        </div>
    );
};

export default ProductDetails;