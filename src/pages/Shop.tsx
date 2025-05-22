import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { fetchProducts, Product } from '../utils/airtable';

const Shop: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadProducts = async () => {
      try {
        const data = await fetchProducts();
        setProducts(data);
      } catch (err) {
        setError('Failed to load products. Please try again later.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    loadProducts();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-black"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-red-500">{error}</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-10 text-center">Shop</h1>
      <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
        {products.map((product) => (
          <Link
            to={`/product/${product.id}`}
            key={product.id}
            className="group block bg-white rounded-lg shadow-sm overflow-hidden transition-transform duration-200 hover:scale-105"
            style={{ minHeight: 340 }}
          >
            <div className="w-full h-64 bg-gray-100 flex items-center justify-center overflow-hidden">
              <img
                src={product.imageUrl || '/placeholder-image.jpg'}
                alt={product.name}
                className="object-cover w-full h-full transition-transform duration-200 group-hover:scale-105"
                style={{ maxHeight: 256 }}
              />
            </div>
            <div className="p-4 flex flex-col items-start">
              <h2 className="text-lg font-semibold mb-1 text-black">{product.name}</h2>
              <span className="text-base font-medium text-gray-700">${product.price} CAD</span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default Shop; 