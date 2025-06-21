import { convertCurrency } from './convertCurrency';

/**
 * Configuration interface for currency formatting
 * Defines symbol, locale, and code for each supported currency
 */
export interface CurrencyConfig {
  /** ISO 4217 currency code (e.g., 'USD', 'EUR') */
  code: string;
  /** Currency symbol for display (e.g., '$', '€') */
  symbol: string;
  /** Locale string for number formatting (e.g., 'en-US', 'de-DE') */
  locale: string;
}

/**
 * Currency configurations for all supported currencies
 * Maps currency codes to their formatting settings
 * Includes proper symbols and locales for international formatting
 */
export const CURRENCY_CONFIGS: Record<string, CurrencyConfig> = {
  CAD: { code: 'CAD', symbol: 'C$', locale: 'en-CA' },
  USD: { code: 'USD', symbol: '$', locale: 'en-US' },
  EUR: { code: 'EUR', symbol: '€', locale: 'de-DE' },
  GBP: { code: 'GBP', symbol: '£', locale: 'en-GB' },
  JPY: { code: 'JPY', symbol: '¥', locale: 'ja-JP' },
  AUD: { code: 'AUD', symbol: 'A$', locale: 'en-AU' },
  CHF: { code: 'CHF', symbol: 'CHF', locale: 'de-CH' },
  CNY: { code: 'CNY', symbol: '¥', locale: 'zh-CN' },
  INR: { code: 'INR', symbol: '₹', locale: 'en-IN' },
  NGN: { code: 'NGN', symbol: '₦', locale: 'en-NG' },
  ZAR: { code: 'ZAR', symbol: 'R', locale: 'en-ZA' },
  BRL: { code: 'BRL', symbol: 'R$', locale: 'pt-BR' },
  MXN: { code: 'MXN', symbol: '$', locale: 'es-MX' },
  KRW: { code: 'KRW', symbol: '₩', locale: 'ko-KR' },
  SGD: { code: 'SGD', symbol: 'S$', locale: 'en-SG' },
  HKD: { code: 'HKD', symbol: 'HK$', locale: 'en-HK' },
  NOK: { code: 'NOK', symbol: 'kr', locale: 'nb-NO' },
  SEK: { code: 'SEK', symbol: 'kr', locale: 'sv-SE' },
  DKK: { code: 'DKK', symbol: 'kr', locale: 'da-DK' },
  PLN: { code: 'PLN', symbol: 'zł', locale: 'pl-PL' },
  CZK: { code: 'CZK', symbol: 'Kč', locale: 'cs-CZ' },
  HUF: { code: 'HUF', symbol: 'Ft', locale: 'hu-HU' },
  RUB: { code: 'RUB', symbol: '₽', locale: 'ru-RU' },
  TRY: { code: 'TRY', symbol: '₺', locale: 'tr-TR' },
  ILS: { code: 'ILS', symbol: '₪', locale: 'he-IL' },
  AED: { code: 'AED', symbol: 'د.إ', locale: 'ar-AE' },
  SAR: { code: 'SAR', symbol: '﷼', locale: 'ar-SA' },
  EGP: { code: 'EGP', symbol: 'E£', locale: 'ar-EG' },
  THB: { code: 'THB', symbol: '฿', locale: 'th-TH' },
  MYR: { code: 'MYR', symbol: 'RM', locale: 'ms-MY' },
  IDR: { code: 'IDR', symbol: 'Rp', locale: 'id-ID' },
  PHP: { code: 'PHP', symbol: '₱', locale: 'en-PH' },
  VND: { code: 'VND', symbol: '₫', locale: 'vi-VN' },
};

/**
 * Format price with currency conversion and localization
 * 
 * Converts a price from CAD to the target currency and formats it
 * according to the currency's locale and formatting rules.
 * 
 * @param {number} amountInCAD - Price in Canadian dollars (base currency)
 * @param {string} targetCurrency - Target currency code (e.g., 'USD', 'EUR')
 * @param {Object} options - Formatting options
 * @param {boolean} options.showCAD - Whether to show CAD equivalent in parentheses
 * @param {boolean} options.compact - Whether to use compact notation for large amounts
 * @param {boolean} options.showCurrencyCode - Whether to append currency code
 * @returns {Promise<string>} Formatted price string
 * 
 * @example
 * // Basic formatting
 * await formatPrice(29.99, 'USD'); // "$22.45"
 * 
 * // With CAD equivalent
 * await formatPrice(29.99, 'USD', { showCAD: true }); // "$22.45 ($29.99 CAD)"
 * 
 * // Compact notation
 * await formatPrice(1500, 'USD', { compact: true }); // "$1.1K"
 */
export async function formatPrice(
  amountInCAD: number, 
  targetCurrency: string, 
  options: {
    showCAD?: boolean;
    compact?: boolean;
    showCurrencyCode?: boolean;
  } = {}
): Promise<string> {
  // Destructure options with defaults
  const { showCAD = false, compact = false, showCurrencyCode = false } = options;
  
  try {
    // Convert the price from CAD to target currency using exchange rates
    const convertedAmount = await convertCurrency(amountInCAD, targetCurrency);
    
    // Get currency configuration for formatting
    const currencyConfig = CURRENCY_CONFIGS[targetCurrency] || CURRENCY_CONFIGS.CAD;
    
    // Format the number using Intl.NumberFormat for proper localization
    let formattedPrice: string;
    
    if (compact && convertedAmount >= 1000) {
      // Use compact notation (e.g., "1.2K", "1.5M") for large amounts
      formattedPrice = new Intl.NumberFormat(currencyConfig.locale, {
        style: 'currency',
        currency: currencyConfig.code,
        notation: 'compact',
        compactDisplay: 'short'
      }).format(convertedAmount);
    } else {
      // Standard currency formatting with 2 decimal places
      formattedPrice = new Intl.NumberFormat(currencyConfig.locale, {
        style: 'currency',
        currency: currencyConfig.code,
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      }).format(convertedAmount);
    }
    
    // Append currency code if requested (e.g., "€25.99 EUR")
    if (showCurrencyCode && targetCurrency !== 'CAD') {
      formattedPrice += ` ${targetCurrency}`;
    }
    
    // Add CAD equivalent in parentheses if requested
    if (showCAD && targetCurrency !== 'CAD') {
      const cadFormatted = new Intl.NumberFormat('en-CA', {
        style: 'currency',
        currency: 'CAD',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      }).format(amountInCAD);
      
      formattedPrice += ` (${cadFormatted} CAD)`;
    }
    
    return formattedPrice;
    
  } catch (error) {
    console.error('Error formatting price:', error);
    
    // Fallback to CAD formatting if conversion fails
    return new Intl.NumberFormat('en-CA', {
      style: 'currency',
      currency: 'CAD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amountInCAD);
  }
}

/**
 * Synchronous price formatting without currency conversion
 * 
 * Formats a price in the specified currency using proper locale formatting.
 * Does not perform currency conversion - assumes amount is already in target currency.
 * 
 * @param {number} amount - Price amount in the target currency
 * @param {string} currency - Currency code for formatting
 * @returns {string} Formatted price string
 * 
 * @example
 * formatPriceSync(25.99, 'USD'); // "$25.99"
 * formatPriceSync(19.99, 'EUR'); // "19,99 €"
 */
export function formatPriceSync(amount: number, currency: string): string {
  // Get currency configuration or fallback to CAD
  const currencyConfig = CURRENCY_CONFIGS[currency] || CURRENCY_CONFIGS.CAD;
  
  // Format using Intl.NumberFormat for proper locale handling
  return new Intl.NumberFormat(currencyConfig.locale, {
    style: 'currency',
    currency: currencyConfig.code,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount);
}

/**
 * Get currency symbol for a given currency code
 * 
 * Returns the appropriate symbol for display purposes.
 * Falls back to the currency code if no symbol is configured.
 * 
 * @param {string} currencyCode - ISO 4217 currency code
 * @returns {string} Currency symbol or code
 * 
 * @example
 * getCurrencySymbol('USD'); // "$"
 * getCurrencySymbol('EUR'); // "€"
 * getCurrencySymbol('XYZ'); // "XYZ" (fallback)
 */
export function getCurrencySymbol(currencyCode: string): string {
  return CURRENCY_CONFIGS[currencyCode]?.symbol || currencyCode;
}