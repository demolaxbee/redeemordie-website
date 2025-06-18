import { convertCurrency } from './convertCurrency';

export interface CurrencyConfig {
  code: string;
  symbol: string;
  locale: string;
}

// Currency configurations with proper symbols and locales
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

export async function formatPrice(
  amountInCAD: number, 
  targetCurrency: string, 
  options: {
    showCAD?: boolean;
    compact?: boolean;
    showCurrencyCode?: boolean;
  } = {}
): Promise<string> {
  const { showCAD = false, compact = false, showCurrencyCode = false } = options;
  
  try {
    // Convert the price to target currency
    const convertedAmount = await convertCurrency(amountInCAD, targetCurrency);
    
    // Get currency configuration
    const currencyConfig = CURRENCY_CONFIGS[targetCurrency] || CURRENCY_CONFIGS.CAD;
    
    // Format the number using Intl.NumberFormat
    let formattedPrice: string;
    
    if (compact && convertedAmount >= 1000) {
      // Use compact notation for large amounts
      formattedPrice = new Intl.NumberFormat(currencyConfig.locale, {
        style: 'currency',
        currency: currencyConfig.code,
        notation: 'compact',
        compactDisplay: 'short'
      }).format(convertedAmount);
    } else {
      // Standard formatting
      formattedPrice = new Intl.NumberFormat(currencyConfig.locale, {
        style: 'currency',
        currency: currencyConfig.code,
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      }).format(convertedAmount);
    }
    
    // Add currency code if requested
    if (showCurrencyCode && targetCurrency !== 'CAD') {
      formattedPrice += ` ${targetCurrency}`;
    }
    
    // Add CAD equivalent if requested and not already in CAD
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
    
    // Fallback to CAD formatting
    return new Intl.NumberFormat('en-CA', {
      style: 'currency',
      currency: 'CAD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amountInCAD);
  }
}

export function formatPriceSync(amount: number, currency: string): string {
  const currencyConfig = CURRENCY_CONFIGS[currency] || CURRENCY_CONFIGS.CAD;
  
  return new Intl.NumberFormat(currencyConfig.locale, {
    style: 'currency',
    currency: currencyConfig.code,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount);
}

export function getCurrencySymbol(currencyCode: string): string {
  return CURRENCY_CONFIGS[currencyCode]?.symbol || currencyCode;
}