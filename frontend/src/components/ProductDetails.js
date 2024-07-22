import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useCart } from '../CartContext';

const ProductDetailsScreen = () => {
    const { id } = useParams();
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { addToCart } = useCart();
    const [selectedOptions, setSelectedOptions] = useState({});

    useEffect(() => {
        fetchProductDetails();
    }, [id]);

    const fetchProductDetails = async () => {
        try {
            setLoading(true);
            const response = await fetch('http://localhost:8000/graphql', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
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
                    variables: { id: parseInt(id) }
                }),
            });
            const data = await response.json();
            if (data.data && data.data.product) {
                setProduct(data.data.product);
                console.log('Product data:', data.data.product);
                console.log('Product attributes:', data.data.product.attributes);
            } else {
                setError('Product not found');
            }
        } catch (err) {
            setError('An error occurred while fetching the product');
        } finally {
            setLoading(false);
        }
    };

    const handleOptionChange = (attributeId, value) => {
        setSelectedOptions(prev => ({
            ...prev,
            [attributeId]: value
        }));
    };

    const filterAttributes = (categoryName, attributes) => {
        if (!categoryName || !attributes) return [];
        
        const filteredAttributes = attributes.filter(attribute => {
            if (categoryName === 'clothes' && (attribute.name === 'Size' || attribute.name === 'Color')) {
                return true;
            }
            if (categoryName === 'tech' && attribute.name === 'Capacity') {
                return true;
            }
            return false;
        });
        
        return filteredAttributes;
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

    const filteredAttributes = filterAttributes(product.category?.name, product.attributes);

    return (
        <div className="product-details">
            <h1>{product.name}</h1>
            <p>{product.brand}</p>
            <p>{product.description}</p>
            <p>Price: {product.price} {product.currency}</p>
            <p>Category: {product.category?.name}</p>
            <p>{product.in_stock ? 'In Stock' : 'Out of Stock'}</p>
            
            <div className="product-gallery">
                {product.gallery && product.gallery.map((image, index) => (
                    <img key={index} src={image} alt={`${product.name} - ${index + 1}`} style={{ width: '140px', height: '140px', objectFit: 'cover' }} />
                ))}
            </div>
            
            <div className="product-attributes">
                {filteredAttributes && filteredAttributes.map(attribute => (
                    <div key={attribute.id}>
                        <h3>{attribute.name}</h3>
                        {attribute.items && attribute.items.map(item => (
                            <button
                                key={item.id}
                                onClick={() => handleOptionChange(attribute.id, item.value)}
                                style={{
                                    border: selectedOptions[attribute.id] === item.value ? '2px solid black' : '1px solid gray',
                                    margin: '5px',
                                    padding: '5px'
                                }}
                            >
                                {item.displayValue}
                            </button>
                        ))}
                    </div>
                ))}
            </div>
            
            {product.in_stock && (
                <button onClick={() => addToCart(product, selectedOptions)}>
                    Add to Cart
                </button>
            )}
        </div>
    );
};

export default ProductDetailsScreen;
