import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { fetchProducts, Product } from '../utils/airtable';

const ProductDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedSize, setSelectedSize] = useState<string>('');

  useEffect(() => {
    const loadProduct = async () => {
      try {
        const products = await fetchProducts();
        const found = products.find((p) => p.id === id);
        setProduct(found || null);
        // If product has sizes, default to first size
        if (found && (found as any).sizes && (found as any).sizes.length > 0) {
          setSelectedSize((found as any).sizes[0]);
        }
      } catch (err) {
        setError('Failed to load product.');
      } finally {
        setLoading(false);
      }
    };
    loadProduct();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-black"></div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <div className="text-red-500 mb-4">{error || 'Product not found.'}</div>
        <button onClick={() => navigate(-1)} className="underline text-black">Back to Shop</button>
      </div>
    );
  }

  // Example: sizes field (optional, if you want to add it to Airtable)
  const sizes: string[] = (product as any).sizes || ['XS', 'S', 'M', 'L', 'XL'];

  return (
    <div className="container mx-auto px-4 py-12">
      <button onClick={() => navigate(-1)} className="mb-8 text-sm underline text-black">&larr; Back to Shop</button>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-start">
        {/* Left: Image */}
        <div className="bg-white rounded-lg shadow-sm flex items-center justify-center p-6">
          <img
            src={product.imageUrl || '/placeholder-image.jpg'}
            alt={product.name}
            className="object-cover w-full max-h-[200px] rounded"
          />
        </div>
        {/* Right: Info */}
        <div className="flex flex-col gap-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-semibold mb-2">{product.name}</h1>
            <div className="text-lg font-medium text-gray-700 mb-2">${product.price} CAD</div>
            <div className="text-sm text-gray-500 mb-2">{product.category}</div>
          </div>
          {/* Size Selector (if available) */}
          {sizes && sizes.length > 0 && (
            <div>
              <label className="block text-sm font-medium mb-1">Size</label>
              <select
                className="border border-gray-300 rounded px-3 py-2 w-full max-w-xs"
                value={selectedSize}
                onChange={(e) => setSelectedSize(e.target.value)}
              >
                {sizes.map((size) => (
                  <option key={size} value={size}>{size}</option>
                ))}
              </select>
            </div>
          )}
          <div>
            <p className="text-gray-600 text-base whitespace-pre-line">{product.description}</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-4 mt-4">
            <button className="border border-black text-black bg-white py-2 px-4 rounded font-semibold hover:bg-black hover:text-white transition">ADD TO CART</button>
            <button className="bg-orange-500 text-white py-2 px-4 rounded font-semibold hover:bg-orange-600 transition">BUY IT NOW</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail; 