import React from 'react';
import { Product } from '../utils/airtable';

interface ProductCardProps {
  product: Product;
  onEdit?: (product: Product) => void;
  onDelete?: (productId: string) => void;
  isAdmin?: boolean;
}

const ProductCard: React.FC<ProductCardProps> = ({ 
  product, 
  onEdit, 
  onDelete, 
  isAdmin = false 
}) => {
  return (
    <div className="product-card bg-white rounded-lg shadow-md overflow-hidden">
      <div className="relative aspect-square">
        <img
          src={product.imageUrl || '/placeholder-image.jpg'}
          alt={product.name}
          className="w-full h-72 object-cover rounded"
        />
      </div>
      <div className="p-4">
        <h3 className="text-lg font-semibold mb-2">{product.name}</h3>
        <p className="text-gray-600 mb-2">${product.price.toFixed(2)}</p>
        <p className="text-sm text-gray-500 mb-2">{product.category}</p>
        {!isAdmin && (
          <p className="text-sm text-gray-600 line-clamp-2">{product.description}</p>
        )}
        {isAdmin && (
          <div className="mt-4 flex gap-2">
            <button
              onClick={() => onEdit?.(product)}
              className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Edit
            </button>
            <button
              onClick={() => onDelete?.(product.id)}
              className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
            >
              Delete
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductCard; 