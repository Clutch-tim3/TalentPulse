export const formatCurrency = (amount: number, currency: string = 'USD'): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
  }).format(amount);
};

export const formatPercentage = (value: number): string => {
  return `${value > 0 ? '+' : ''}${value.toFixed(1)}%`;
};

export const delay = (ms: number): Promise<void> => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

export const generateRequestId = (): string => {
  return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

export const validateCurrency = (currencyCode: string): boolean => {
  const validCurrencies = new Set([
    'USD', 'EUR', 'GBP', 'JPY', 'CAD', 'AUD', 'CHF', 'CNY', 'HKD', 'SGD',
    'INR', 'BRL', 'RUB', 'KRW', 'ZAR', 'TRY', 'MXN', 'AED', 'SAR', 'SEK',
    'NOK', 'DKK', 'PLN', 'CZK', 'HUF', 'ILS', 'CLP', 'COP', 'PEN', 'ARS'
  ]);
  return validCurrencies.has(currencyCode.toUpperCase());
};

export const parseDuration = (durationStr: string): number => {
  const match = durationStr.match(/(\d+)\s*(h|hours?|m|minutes?|d|days?|w|weeks?)/);
  if (!match) return 0;
  
  const value = parseInt(match[1]);
  const unit = match[2].toLowerCase();
  
  switch (unit) {
    case 'h':
    case 'hour':
    case 'hours':
      return value * 60 * 60 * 1000;
    case 'm':
    case 'minute':
    case 'minutes':
      return value * 60 * 1000;
    case 'd':
    case 'day':
    case 'days':
      return value * 24 * 60 * 60 * 1000;
    case 'w':
    case 'week':
    case 'weeks':
      return value * 7 * 24 * 60 * 60 * 1000;
    default:
      return 0;
  }
};