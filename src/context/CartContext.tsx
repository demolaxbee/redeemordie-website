import React, { createContext, useContext, useState, useEffect } from 'react';
import { Product } from '../utils/airtable';
import { formatPrice } from '../utils/formatPrice';
import { useCurrency } from './CurrencyContext';

interface CartItem {
  product: Product;
  quantity: number;
  selectedSize?: string;
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

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cartItems, setCartItems] = useState<CartItem[]>(() => {
    const savedCart = localStorage.getItem('cart');
    return savedCart ? JSON.parse(savedCart) : [];
  });
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [formattedSubtotal, setFormattedSubtotal] = useState('C$0.00');
  const [formattedTax, setFormattedTax] = useState('C$0.00');
  const [formattedShipping, setFormattedShipping] = useState('C$25.00');
  const [formattedTotal, setFormattedTotal] = useState('C$25.00');
  const { currencyCode } = useCurrency();

  useEffect(() => {
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
    // Validate product availability
    const isOutOfStock = !product.sizes || product.sizes.length === 0;
    
    if (isOutOfStock) {
      console.warn('Cannot add out of stock product to cart:', product.name);
      return false; // Don't add to cart
    }

    // If product has sizes, validate the selected size
    if (product.sizes && product.sizes.length > 0) {
      if (!selectedSize || !product.sizes.includes(selectedSize)) {
        console.warn('Invalid size selected for product:', product.name, selectedSize);
        return false; // Don't add to cart
      }
    }

    setCartItems(prevItems => {
      const existingItem = prevItems.find(
        item => item.product.id === product.id && item.selectedSize === selectedSize
      );
      if (existingItem) {
        return prevItems.map(item =>
          item.product.id === product.id && item.selectedSize === selectedSize
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prevItems, { product, quantity: 1, selectedSize }];
    });
    
    return true; // Successfully added to cart
  };

  const removeFromCart = (productId: string, selectedSize?: string) => {
    setCartItems(prevItems =>
      prevItems.filter(item =>
        !(item.product.id === productId && item.selectedSize === selectedSize)
      )
    );
  };
  

  const updateQuantity = (productId: string, quantity: number, selectedSize?: string) => {
    if (quantity < 1) return;
    setCartItems(prevItems =>
      prevItems.map(item =>
        item.product.id === productId && item.selectedSize === selectedSize
          ? { ...item, quantity }
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