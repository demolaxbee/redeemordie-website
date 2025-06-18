import React from 'react';
import { useCurrency } from '../context/CurrencyContext';
import { CURRENCY_CONFIGS } from '../utils/formatPrice';

const CurrencySelector: React.FC = () => {
  const { currencyCode, setCurrency } = useCurrency();

  const popularCurrencies = [
    'CAD', 'USD', 'EUR', 'GBP', 'JPY', 'AUD', 'NGN', 'INR', 'CNY', 'BRL'
  ];

  const handleCurrencyChange = (newCurrency: string) => {
    setCurrency(newCurrency);
    // Update cookies manually to ensure immediate effect
    const expires = new Date();
    expires.setTime(expires.getTime() + (24 * 60 * 60 * 1000));
    document.cookie = `currency=${newCurrency}; expires=${expires.toUTCString()}; path=/; SameSite=Lax`;
    document.cookie = `currencyCode=${newCurrency}; expires=${expires.toUTCString()}; path=/; SameSite=Lax`;
  };

  return (
    <div className="currency-selector">
      <select 
        value={currencyCode} 
        onChange={(e) => handleCurrencyChange(e.target.value)}
        className="currency-select"
        title="Change display currency"
      >
        {popularCurrencies.map(currency => (
          <option key={currency} value={currency}>
            {CURRENCY_CONFIGS[currency]?.symbol || currency} {currency}
          </option>
        ))}
      </select>
    </div>
  );
};

export default CurrencySelector; 