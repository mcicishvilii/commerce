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
    const [currentImageIndex, setCurrentImageIndex] = useState(0);

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
                setCurrentImageIndex(0); // Reset image index on new product load
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

    const showNextImage = () => {
        setCurrentImageIndex((prevIndex) => (prevIndex + 1) % product.gallery.length);
    };

    const showPrevImage = () => {
        setCurrentImageIndex((prevIndex) => (prevIndex - 1 + product.gallery.length) % product.gallery.length);
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
        <div style={styles.container}>
            <div style={styles.gallery}>
                <div style={styles.thumbnailContainer}>
                    {product.gallery && product.gallery.map((image, index) => (
                        <img
                            key={index}
                            src={image}
                            alt={`${product.name} - ${index + 1}`}
                            style={{
                                ...styles.thumbnail,
                                border: currentImageIndex === index ? '2px solid black' : '1px solid gray'
                            }}
                            onClick={() => setCurrentImageIndex(index)}
                        />
                    ))}
                </div>
                <div style={styles.mainImageContainer}>
                    <button style={styles.arrowButton} onClick={showPrevImage}>&lt;</button>
                    <img src={product.gallery[currentImageIndex]} alt={product.name} style={styles.mainImage} />
                    <button style={styles.arrowButton} onClick={showNextImage}>&gt;</button>
                </div>
            </div>
            <div style={styles.details}>
                <h1>{product.name}</h1>
                <div style={styles.price}>{product.price} {product.currency}</div>
                <div style={styles.attributes}>
                    {filteredAttributes && filteredAttributes.map(attribute => (
                        <div key={attribute.id}>
                            <h3>{attribute.name}</h3>
                            <div style={styles.options}>
                                {attribute.items && attribute.items.map(item => (
                                    <button
                                        key={item.id}
                                        onClick={() => handleOptionChange(attribute.id, item.value)}
                                        style={{
                                            ...styles.optionButton,
                                            border: selectedOptions[attribute.id] === item.value ? '2px solid black' : '1px solid gray'
                                        }}
                                    >
                                        {item.displayValue}
                                    </button>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
                <button
                    style={styles.addToCartButton}
                    onClick={() => addToCart(product, selectedOptions)}
                    disabled={!product.in_stock}
                >
                    {product.in_stock ? 'Add to Cart' : 'Out of Stock'}
                </button>
            </div>
        </div>
    );
};

const styles = {
    container: {
        display: 'flex',
        padding: '20px',
    },
    gallery: {
        display: 'flex',
    },
    thumbnailContainer: {
        display: 'flex',
        flexDirection: 'column',
    },
    thumbnail: {
        width: '50px',
        height: '50px',
        objectFit: 'cover',
        marginBottom: '10px',
        cursor: 'pointer',
    },
    mainImageContainer: {
        display: 'flex',
        alignItems: 'center',
        position: 'relative',
        marginLeft: '20px',
    },
    mainImage: {
        width: '300px',
        height: '300px',
        objectFit: 'cover',
    },
    arrowButton: {
        position: 'absolute',
        top: '50%',
        transform: 'translateY(-50%)',
        background: 'none',
        border: 'none',
        fontSize: '24px',
        cursor: 'pointer',
    },
    details: {
        marginLeft: '20px',
        display: 'flex',
        flexDirection: 'column',
    },
    price: {
        fontSize: '24px',
        margin: '10px 0',
    },
    attributes: {
        margin: '20px 0',
    },
    options: {
        display: 'flex',
        flexWrap: 'wrap',
    },
    optionButton: {
        margin: '5px',
        padding: '10px',
        cursor: 'pointer',
    },
    addToCartButton: {
        marginTop: '20px',
        padding: '10px 20px',
        backgroundColor: 'green',
        color: 'white',
        border: 'none',
        cursor: 'pointer',
    },
};

export default ProductDetailsScreen;
