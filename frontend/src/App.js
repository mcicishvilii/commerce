import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import CartOverlay from './components/CartOverlay';
import { useCart } from './CartContext';
import cartIcon from './assets/green-shopping-cart-10909.png';  // Import the cart icon

const App = () => {
    const { addToCart } = useCart();
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState(null);
    const { isOpen, toggleCart } = useCart();

    useEffect(() => {
        fetchProducts();
        fetchCategories();
    }, []);

    const handleProductClick = (product) => {
        window.location.href = `/product/${product.id}`;
    };

    const fetchProducts = async (category = null) => {
        const response = await fetch('http://localhost:8000/graphql', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                query: `
                    query {
                        products${category ? `(filter: "${category}")` : ''} {
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
                        }
                    }
                `,
            }),
        });
        const data = await response.json();
        if (data.data.products) {
            setProducts(data.data.products);
        }
    };

    const fetchCategories = async () => {
        const response = await fetch('http://localhost:8000/graphql', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
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
        fetchProducts(category === "all" ? null : category);
    };

    return (
        <div style={{ paddingLeft: '80px', paddingRight: '80px' }}>
            <Header />
            <CartOverlay />
            <div style={{ display: 'flex', gap: '10px', margin: '20px' }}>
                {categories.map((category) => (
                    <button
                        style={{
                            padding: '10px',
                            backgroundColor: 'transparent',
                            color: '#000',
                            border: 'none',
                            borderBottom: selectedCategory === category.name ? '2px solid green' : 'none',
                            cursor: 'pointer',
                        }}
                        key={category.id} onClick={() => handleCategoryClick(category.name)}>
                        {category.name}
                    </button>
                ))}
            </div>
            {isOpen && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: 'rgba(0,0,0,0.5)',
                    zIndex: 999
                }} onClick={() => toggleCart()} />
            )}

            <h1>{selectedCategory ? selectedCategory : 'All Products'}</h1>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px' }}>
                {products.map((product) => (
                    <div
                        key={product.id}
                        onClick={() => handleProductClick(product)}
                        style={{
                            cursor: 'pointer',
                            border: '1px solid #ccc',
                            padding: '10px',
                            borderRadius: '5px',
                            textAlign: 'center',
                            position: 'relative'
                        }}
                    >
                        <div style={{ position: 'relative' }}>
                            <img
                                src={product.gallery[0]}
                                alt={product.name}
                                style={{
                                    width: '100%',
                                    height: '200px',
                                    objectFit: 'cover',
                                    filter: product.in_stock ? 'none' : 'grayscale(100%)',
                                }}
                            />
                            {!product.in_stock && (
                                <div style={{
                                    position: 'absolute',
                                    top: 0,
                                    left: 0,
                                    width: '100%',
                                    height: '100%',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    backgroundColor: 'rgba(0, 0, 0, 0.5)',
                                    color: 'white',
                                    fontSize: '1.5em',
                                }}>
                                    Out of Stock
                                </div>
                            )}
                        </div>
                        <h2>{product.name}</h2>
                        <p>Price: {product.price} {product.currency}</p>
                        {product.in_stock && (
                            <button 
                                onClick={(e) => {
                                    e.stopPropagation();
                                    addToCart(product, {});
                                }}
                                style={{
                                    position: 'absolute',
                                    bottom: '10px',
                                    right: '10px',
                                    backgroundColor: 'transparent',
                                    border: 'none',
                                    cursor: 'pointer',
                                    width: '40px',
                                    height: '40px',
                                    borderRadius: '50%',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                }}
                            >
                                <img src={cartIcon} alt="Add to Cart" style={{ width: '24px', height: '24px' }} />
                            </button>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default App;
