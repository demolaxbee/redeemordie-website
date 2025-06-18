import Cookies from 'js-cookie';

export interface ExchangeRateData {
  rate: number;
  timestamp: number;
}

const CACHE_DURATION = 12 * 60 * 60 * 1000; // 12 hours in milliseconds

export async function getExchangeRate(fromCurrency: string, toCurrency: string): Promise<number> {
  // If converting to the same currency, return 1
  if (fromCurrency === toCurrency) {
    return 1;
  }

  const cacheKey = `rate_${fromCurrency}_${toCurrency}`;
  
  try {
    // Check if exchange rate is cached and still valid
    const cachedRate = Cookies.get(cacheKey);
    if (cachedRate) {
      const rateData: ExchangeRateData = JSON.parse(cachedRate);
      const now = Date.now();
      
      // Check if cached rate is still valid (within cache duration)
      if (now - rateData.timestamp < CACHE_DURATION) {
        return rateData.rate;
      }
    }

    // First try to get the exchange rate from environment variable API
    let rate: number;
    
    if (process.env.REACT_APP_EXCHANGE_API_KEY) {
      try {
        const response = await fetch(
          `https://v6.exchangerate-api.com/v6/${process.env.REACT_APP_EXCHANGE_API_KEY}/pair/${fromCurrency}/${toCurrency}`
        );
        
        if (response.ok) {
          const data = await response.json();
          if (data.result === 'success') {
            rate = data.conversion_rate;
          } else {
            throw new Error('Exchange API failed');
          }
        } else {
          throw new Error('Exchange API request failed');
        }
      } catch (error) {
        console.warn('Primary exchange API failed, trying backend fallback:', error);
        throw error; // Re-throw to trigger backend fallback
      }
    } else {
      // No API key, try backend fallback
      throw new Error('No exchange API key');
    }

    // Cache the successful rate
    const rateData: ExchangeRateData = {
      rate,
      timestamp: Date.now()
    };
    
    // Cache for 12 hours
    const expires = new Date();
    expires.setTime(expires.getTime() + CACHE_DURATION);
    
    Cookies.set(cacheKey, JSON.stringify(rateData), { 
      expires, 
      sameSite: 'lax' as const 
    });
    
    return rate;
    
  } catch (error) {
    console.warn('Primary exchange rate fetch failed, trying backend:', error);
    
    // Fallback to backend API
    try {
      const response = await fetch(`/api/rates?from=${fromCurrency}&to=${toCurrency}`);
      if (response.ok) {
        const data = await response.json();
        
        // Cache the backend rate as well
        const rateData: ExchangeRateData = {
          rate: data.rate,
          timestamp: Date.now()
        };
        
        const expires = new Date();
        expires.setTime(expires.getTime() + CACHE_DURATION);
        
        Cookies.set(cacheKey, JSON.stringify(rateData), { 
          expires, 
          sameSite: 'lax' as const 
        });
        
        return data.rate;
      }
    } catch (backendError) {
      console.error('Backend exchange rate fallback also failed:', backendError);
    }
    
    // Final fallback: return cached rate if available, even if expired
    const cachedRate = Cookies.get(cacheKey);
    if (cachedRate) {
      const rateData: ExchangeRateData = JSON.parse(cachedRate);
      console.warn('Using expired cached exchange rate due to API failures');
      return rateData.rate;
    }
    
    // Ultimate fallback: return 1 (no conversion)
    console.error('All exchange rate sources failed, using 1:1 conversion');
    return 1;
  }
}

export async function convertCurrency(amountInCAD: number, toCurrency: string): Promise<number> {
  if (toCurrency === 'CAD') {
    return amountInCAD;
  }
  
  const rate = await getExchangeRate('CAD', toCurrency);
  return amountInCAD * rate;
}