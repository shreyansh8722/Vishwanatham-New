import React, { createContext, useContext, useState, useEffect } from 'react';
// IMPORT LOCAL FILE (Instant Load)
// Ensure you have created this file at src/data/products.json
import localProducts from '../data/products.json'; 

const ProductContext = createContext();

export const ProductProvider = ({ children }) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load data instantly on mount
    // Verify localProducts is an array to prevent crashes
    if (Array.isArray(localProducts)) {
      setProducts(localProducts);
    } else {
      console.error("products.json is not an array. Please check the file format.");
      setProducts([]);
    }
    setLoading(false);
  }, []);

  const refreshProducts = () => {
    window.location.reload();
  };

  return (
    <ProductContext.Provider value={{ products, loading, refreshProducts }}>
      {children}
    </ProductContext.Provider>
  );
};

export const useProducts = () => useContext(ProductContext);