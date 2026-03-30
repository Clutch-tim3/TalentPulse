const costOfLivingData: Record<string, number> = {
  'New York, NY': 182,
  'San Francisco, CA': 187,
  'Los Angeles, CA': 147,
  'Chicago, IL': 107,
  'Houston, TX': 86,
  'Austin, TX': 121,
  'Seattle, WA': 146,
  'Boston, MA': 165,
  'Washington, DC': 159,
  'Atlanta, GA': 98,
  'Dallas, TX': 94,
  'Miami, FL': 115,
  'Denver, CO': 120,
  'Phoenix, AZ': 103,
  'Philadelphia, PA': 105,
  'San Diego, CA': 137,
  'Portland, OR': 130,
  'Detroit, MI': 83,
  'Minneapolis, MN': 110,
  'Charlotte, NC': 90,
  
  'London, UK': 152,
  'Berlin, Germany': 107,
  'Paris, France': 133,
  'Tokyo, Japan': 135,
  'Singapore': 141,
  'Hong Kong': 138,
  'Toronto, Canada': 110,
  'Vancouver, Canada': 130,
  'Sydney, Australia': 127,
  'Melbourne, Australia': 121,
};

export const getCostOfLivingIndex = (location: string): number => {
  const normalizedLocation = location.toLowerCase().trim();
  
  for (const [city, index] of Object.entries(costOfLivingData)) {
    if (city.toLowerCase().includes(normalizedLocation) || normalizedLocation.includes(city.toLowerCase())) {
      return index;
    }
  }
  
  return 100; 
};

export const adjustSalaryForCOL = (salary: number, location: string): number => {
  const colIndex = getCostOfLivingIndex(location);
  return Math.round(salary * (100 / colIndex));
};