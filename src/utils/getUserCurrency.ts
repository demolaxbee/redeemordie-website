import Cookies from 'js-cookie';

export interface UserLocationData {
  country: string;
  currency: string;
  currencyCode: string;
  countryCode: string;
}

const DEFAULT_LOCATION: UserLocationData = {
  country: 'Canada',
  currency: 'CAD',
  currencyCode: 'CAD',
  countryCode: 'CA'
};

export async function getUserCurrency(): Promise<UserLocationData> {
  try {
    // First, check if data exists in cookies
    const cachedCountry = Cookies.get('country');
    const cachedCurrency = Cookies.get('currency');
    const cachedCurrencyCode = Cookies.get('currencyCode');
    const cachedCountryCode = Cookies.get('countryCode');
    
    if (cachedCountry && cachedCurrency && cachedCurrencyCode && cachedCountryCode) {
      return {
        country: cachedCountry,
        currency: cachedCurrency,
        currencyCode: cachedCurrencyCode,
        countryCode: cachedCountryCode
      };
    }

    // If not cached, fetch from IP API
    const response = await fetch('https://ipapi.co/json/');
    
    if (!response.ok) {
      throw new Error('Failed to fetch location data');
    }
    
    const data = await response.json();

    
    const locationData: UserLocationData = {
      country: data.country_name || DEFAULT_LOCATION.country,
      currency: data.currency || DEFAULT_LOCATION.currency,
      currencyCode: data.currency || DEFAULT_LOCATION.currencyCode,
      countryCode: data.country_code || DEFAULT_LOCATION.countryCode
    };

    // Cache the data in cookies with 24-hour expiry
    const expires = new Date();
    expires.setTime(expires.getTime() + (24 * 60 * 60 * 1000)); // 24 hours
    
    const cookieOptions = { expires, sameSite: 'lax' as const };
    
    Cookies.set('country', locationData.country, cookieOptions);
    Cookies.set('currency', locationData.currency, cookieOptions);
    Cookies.set('currencyCode', locationData.currencyCode, cookieOptions);
    Cookies.set('countryCode', locationData.countryCode, cookieOptions);
    
    return locationData;
    
  } catch (error) {
    
    // Return cached data if available, otherwise default
    const cachedCountry = Cookies.get('country');
    const cachedCurrency = Cookies.get('currency');
    const cachedCurrencyCode = Cookies.get('currencyCode');
    const cachedCountryCode = Cookies.get('countryCode');
    
    if (cachedCountry && cachedCurrency && cachedCurrencyCode && cachedCountryCode) {
      return {
        country: cachedCountry,
        currency: cachedCurrency,
        currencyCode: cachedCurrencyCode,
        countryCode: cachedCountryCode
      };
    }
    
    return DEFAULT_LOCATION;
  }
}