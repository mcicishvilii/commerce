import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import CartOverlay from './components/CartOverlay';
import { useCart } from './CartContext';

const App = () => {
    const { addToCart } = useCart();
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState(null);


    //test 
    // comments

    useEffect(() => {

        fetchProducts();
        fetchCategories();
    }, []);

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
        <div style={{ paddingLeft: '80px', paddingRight: '80px' }} >
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
            <h1>{selectedCategory ? selectedCategory : 'All Products'}</h1>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px' }}>
                {products.map((product) => (
                    <div key={product.id}>
                        <h2>{product.name}</h2>
                        <p>Brand: {product.brand}</p>
                        <p>Category: {product.category.name}</p>
                        <p>In Stock: {product.in_stock ? 'Yes' : 'No'}</p>
                        <p>{product.description}</p>
                        {product.gallery && product.gallery.length > 0 && (
                            <img src={product.gallery[0]} alt={product.name} style={{width: '100%', height: '200px', objectFit: 'cover'}} />
                        )}
                        <button onClick={() => addToCart(product, {})}>Add to Cart</button>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default App;