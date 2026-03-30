import crypto from 'crypto';

export const hashString = (input: string): string => {
  return crypto.createHash('sha256').update(input).digest('hex');
};

export const hashObject = (obj: any): string => {
  return hashString(JSON.stringify(obj));
};

export const hashApiKey = (apiKey: string): string => {
  return crypto.createHash('sha256').update(apiKey).digest('hex');
};

export const generateCacheKey = (...parts: string[]): string => {
  return parts.map(part => hashString(part)).join(':');
};