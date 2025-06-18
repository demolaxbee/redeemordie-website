import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { getUserCurrency, UserLocationData } from '../utils/getUserCurrency';

interface CurrencyContextType {
  currency: string;
  country: string;
  currencyCode: string;
  countryCode: string;
  isLoading: boolean;
  refreshCurrency: () => Promise<void>;
  setCurrency: (currency: string) => void;
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

export const useCurrency = (): CurrencyContextType => {
  const context = useContext(CurrencyContext);
  if (!context) {
    throw new Error('useCurrency must be used within a CurrencyProvider');
  }
  return context;
};

interface CurrencyProviderProps {
  children: ReactNode;
}

export const CurrencyProvider: React.FC<CurrencyProviderProps> = ({ children }) => {
  const [locationData, setLocationData] = useState<UserLocationData>({
    country: 'Canada',
    currency: 'CAD',
    currencyCode: 'CAD',
    countryCode: 'CA'
  });
  const [isLoading, setIsLoading] = useState(true);

  const loadCurrencyData = async () => {
    setIsLoading(true);
    try {
      const data = await getUserCurrency();
      setLocationData(data);
    } catch (error) {
      console.error('Error loading currency data:', error);
      // Keep default values on error
    } finally {
      setIsLoading(false);
    }
  };

  const refreshCurrency = async () => {
    await loadCurrencyData();
  };

  const setCurrency = (currency: string) => {
    setLocationData(prev => ({
      ...prev,
      currency,
      currencyCode: currency
    }));
  };

  useEffect(() => {
    loadCurrencyData();
  }, []);

  const value: CurrencyContextType = {
    currency: locationData.currency,
    country: locationData.country,
    currencyCode: locationData.currencyCode,
    countryCode: locationData.countryCode,
    isLoading,
    refreshCurrency,
    setCurrency
  };

  return (
    <CurrencyContext.Provider value={value}>
      {children}
    </CurrencyContext.Provider>
  );
}; 