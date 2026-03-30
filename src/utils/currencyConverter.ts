import axios from 'axios';

let exchangeRates: Record<string, number> = {
  'USD': 1,
  'EUR': 0.92,
  'GBP': 0.79,
  'JPY': 149.23,
  'CAD': 1.34,
  'AUD': 1.51,
  'CHF': 0.88,
  'CNY': 7.18,
  'HKD': 7.81,
  'SGD': 1.34,
  'INR': 83.21,
  'BRL': 5.08,
  'RUB': 90.12,
  'KRW': 1328.45,
  'ZAR': 19.02,
  'TRY': 30.12,
  'MXN': 17.12,
  'AED': 3.67,
  'SAR': 3.75,
  'SEK': 10.23,
  'NOK': 10.45,
  'DKK': 6.89,
  'PLN': 4.08,
  'CZK': 22.89,
  'HUF': 345.67,
  'ILS': 3.68,
  'CLP': 808.92,
  'COP': 4012.34,
  'PEN': 3.78,
  'ARS': 1080.12
};

let ratesLastUpdated = Date.now();

const RATE_EXPIRY_MS = 24 * 60 * 60 * 1000;

export const convertCurrency = (amount: number, from: string, to: string): number => {
  const fromCode = from.toUpperCase();
  const toCode = to.toUpperCase();

  if (fromCode === toCode) {
    return amount;
  }

  const fromRate = exchangeRates[fromCode];
  const toRate = exchangeRates[toCode];

  if (!fromRate || !toRate) {
    console.warn(`Currency rates not available for ${fromCode} or ${toCode}, using fallback`);
    return amount;
  }

  return (amount / fromRate) * toRate;
};

export const updateExchangeRates = async (): Promise<void> => {
  if (!process.env.EXCHANGE_RATE_API_KEY) {
    console.warn('Exchange rate API key not configured, using default rates');
    return;
  }

  const now = Date.now();
  if (now - ratesLastUpdated < RATE_EXPIRY_MS) {
    return;
  }

  try {
    const response = await axios.get(
      `https://api.exchangerate-api.com/v4/latest/USD`,
      {
        params: {
          apikey: process.env.EXCHANGE_RATE_API_KEY,
        },
        timeout: 5000,
      }
    );

    if (response.data && response.data.rates) {
      exchangeRates = { ...exchangeRates, ...response.data.rates };
      ratesLastUpdated = now;
      console.log('Exchange rates updated successfully');
    }
  } catch (error) {
    console.error('Failed to update exchange rates:', error);
  }
};

export const getCurrencySymbol = (currencyCode: string): string => {
  const symbols: Record<string, string> = {
    'USD': '$',
    'EUR': '€',
    'GBP': '£',
    'JPY': '¥',
    'CAD': 'C$',
    'AUD': 'A$',
    'CHF': 'Fr',
    'CNY': '¥',
    'HKD': 'HK$',
    'SGD': 'S$',
    'INR': '₹',
    'BRL': 'R$',
    'RUB': '₽',
    'KRW': '₩',
    'ZAR': 'R',
    'TRY': '₺',
    'MXN': 'MX$',
    'AED': 'د.إ',
    'SAR': 'ر.س',
    'SEK': 'kr',
    'NOK': 'kr',
    'DKK': 'kr',
    'PLN': 'zł',
    'CZK': 'Kč',
    'HUF': 'Ft',
    'ILS': '₪',
    'CLP': '$',
    'COP': '$',
    'PEN': 'S/',
    'ARS': '$'
  };

  return symbols[currencyCode.toUpperCase()] || currencyCode;
};