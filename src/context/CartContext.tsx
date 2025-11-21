import React, { createContext, useContext, useState, useEffect } from 'react';
import { Product, ProductStock, EMPTY_STOCK } from '../utils/airtable';
import { formatPrice } from '../utils/formatPrice';
import { useCurrency } from './CurrencyContext';

interface CartItem {
  productId: string;
  product: Product;
  quantity: number;
  selectedSize: string;
  sizeStock: number;
}

interface CartContextType {
  cartItems: CartItem[];
  addToCart: (product: Product, selectedSize?: string) => boolean;
  removeFromCart: (productId: string, selectedSize?: string) => void;
  updateQuantity: (productId: string, quantity: number, selectedSize?: string) => void;
  clearCart: () => void;
  totalItems: number;
  subtotalCAD: number;
  taxCAD: number;
  shippingCAD: number;
  totalPriceCAD: number;
  totalPrice: number;
  formattedSubtotal: string;
  formattedTax: string;
  formattedShipping: string;
  formattedTotal: string;
  isCartOpen: boolean;        
  toggleCart: () => void;
  closeCart: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

const sizeKeys: (keyof ProductStock)[] = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];

const normalizeProductStock = (product: Product): Product => {
  if (product && typeof (product as any).stock === 'number') {
    const legacyStock = (product as any).stock as number;
    const fallbackStock = sizeKeys.reduce<ProductStock>((acc, size) => {
      acc[size] = legacyStock;
      return acc;
    }, { ...EMPTY_STOCK });
    return {
      ...product,
      stock: fallbackStock
    };
  }
  if (!product?.stock) {
    return {
      ...product,
      stock: { ...EMPTY_STOCK }
    };
  }
  return product;
};

const getSizeStockValue = (product: Product, size?: string) => {
  if (!product || !size) return 0;
  const normalizedSize = size as keyof ProductStock;
  return product.stock?.[normalizedSize] ?? 0;
};

const hydrateCartItems = (): CartItem[] => {
  if (typeof window === 'undefined' || typeof localStorage === 'undefined') {
    return [];
  }
  const savedCart = localStorage.getItem('cart');
  if (!savedCart) return [];

  try {
    const parsed: any[] = JSON.parse(savedCart);
    if (!Array.isArray(parsed)) return [];

    return parsed
      .map(rawItem => {
        if (!rawItem?.product) return null;
        const normalizedProduct = normalizeProductStock(rawItem.product);
        const selectedSize: string = rawItem.selectedSize || '';
        const productId = rawItem.productId || normalizedProduct.id;
        if (!productId || !selectedSize) return null;

        const sizeStock = getSizeStockValue(normalizedProduct, selectedSize);
        if (sizeStock <= 0) {
          return null;
        }
        const quantity = Math.max(1, Math.min(rawItem.quantity || 1, sizeStock));

        return {
          productId,
          product: normalizedProduct,
          quantity,
          selectedSize,
          sizeStock: sizeStock || 0
        } as CartItem;
      })
      .filter((item): item is CartItem => Boolean(item));
  } catch (error) {
    console.error('Failed to parse saved cart, resetting.', error);
    return [];
  }
};

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cartItems, setCartItems] = useState<CartItem[]>(() => {
    return hydrateCartItems();
  });
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [formattedSubtotal, setFormattedSubtotal] = useState('C$0.00');
  const [formattedTax, setFormattedTax] = useState('C$0.00');
  const [formattedShipping, setFormattedShipping] = useState('C$25.00');
  const [formattedTotal, setFormattedTotal] = useState('C$25.00');
  const { currencyCode } = useCurrency();

  useEffect(() => {
    if (typeof window === 'undefined' || typeof localStorage === 'undefined') {
      return;
    }
    localStorage.setItem('cart', JSON.stringify(cartItems));
  }, [cartItems]);

  const totalItems = cartItems.reduce((total, item) => total + item.quantity, 0);
  
  // Calculate subtotal (sum of all items)
  const subtotalCAD = cartItems.reduce(
    (total, item) => total + item.product.price * item.quantity,
    0
  );
  
  // Calculate tax (2% of subtotal)
  const taxCAD = subtotalCAD * 0.02;
  
  // Shipping is $25 CAD
  const shippingCAD = cartItems.length > 0 ? 25.00 : 0;
  
  // Calculate total (subtotal + tax + shipping)
  const totalPriceCAD = subtotalCAD + taxCAD + shippingCAD;
  const totalPrice = totalPriceCAD; // Keep backward compatibility

  useEffect(() => {
    const updateFormattedPrices = async () => {
      try {
        if (subtotalCAD > 0) {
          const formattedSub = await formatPrice(subtotalCAD, currencyCode);
          const formattedTaxAmount = await formatPrice(taxCAD, currencyCode);
          const formattedShip = await formatPrice(shippingCAD, currencyCode);
          const formattedTot = await formatPrice(totalPriceCAD, currencyCode);
          
          setFormattedSubtotal(formattedSub);
          setFormattedTax(formattedTaxAmount);
          setFormattedShipping(formattedShip);
          setFormattedTotal(formattedTot);
        } else {
          // Empty cart - only show zero values
          const zeroValue = currencyCode === 'CAD' ? 'C$0.00' : '0.00';
          const shippingValue = currencyCode === 'CAD' ? 'C$0.00' : '0.00';
          
          setFormattedSubtotal(zeroValue);
          setFormattedTax(zeroValue);
          setFormattedShipping(shippingValue);
          setFormattedTotal(zeroValue);
        }
      } catch (error) {
        console.error('Error formatting prices:', error);
        // Fallback to CAD values
        setFormattedSubtotal(`C$${subtotalCAD.toFixed(2)}`);
        setFormattedTax(`C$${taxCAD.toFixed(2)}`);
        setFormattedShipping(`C$${shippingCAD.toFixed(2)}`);
        setFormattedTotal(`C$${totalPriceCAD.toFixed(2)}`);
      }
    };
    
    updateFormattedPrices();
  }, [subtotalCAD, taxCAD, shippingCAD, totalPriceCAD, currencyCode]);

  const addToCart = (product: Product, selectedSize?: string) => {
    if (!selectedSize) {
      console.warn('Size selection required for product:', product.name);
      return false;
    }

    const availableStock = getSizeStockValue(product, selectedSize);
    if (availableStock <= 0) {
      console.warn('Size out of stock:', product.name, selectedSize);
      return false;
    }

    let added = false;
    setCartItems(prevItems => {
      const existingItem = prevItems.find(
        item => item.productId === product.id && item.selectedSize === selectedSize
      );

      if (existingItem) {
        if (existingItem.quantity >= availableStock) {
          console.warn('Cannot add more than available stock for', product.name, selectedSize);
          return prevItems;
        }
        added = true;
        return prevItems.map(item =>
          item.productId === product.id && item.selectedSize === selectedSize
            ? {
                ...item,
                quantity: item.quantity + 1,
                product,
                sizeStock: availableStock
              }
            : item
        );
      }

      added = true;
      return [
        ...prevItems,
        {
          productId: product.id,
          product,
          quantity: 1,
          selectedSize,
          sizeStock: availableStock
        }
      ];
    });
    
    return added;
  };

  const removeFromCart = (productId: string, selectedSize?: string) => {
    setCartItems(prevItems =>
      prevItems.filter(item =>
        !(item.productId === productId && item.selectedSize === selectedSize)
      )
    );
  };
  

  const updateQuantity = (productId: string, quantity: number, selectedSize?: string) => {
    if (quantity < 1) return;
    setCartItems(prevItems =>
      prevItems.map(item =>
        item.productId === productId && item.selectedSize === selectedSize
          ? (() => {
              const latestStock = getSizeStockValue(item.product, item.selectedSize) || item.sizeStock;
              return {
                ...item,
                quantity: Math.max(1, Math.min(quantity, latestStock)),
                sizeStock: latestStock
              };
            })()
          : item
      )
    );
  };
  

  const clearCart = () => {
    setCartItems([]);
  };

  const toggleCart = () => {
    setIsCartOpen(prev => !prev);
  };
  
  const closeCart = () => setIsCartOpen(false);

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        totalItems,
        subtotalCAD,
        taxCAD,
        shippingCAD,
        totalPriceCAD,
        totalPrice,
        formattedSubtotal,
        formattedTax,
        formattedShipping,
        formattedTotal,
        isCartOpen, 
        toggleCart,
        closeCart
      }}
    >
      {children}
    </CartContext.Provider>
  );
}; 
