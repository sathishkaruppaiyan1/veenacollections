// Sales tax rule (must match the constants in wordpress-plugin/veena-stripe-checkout.php):
// 7.75% on the purchase, added on top of the price, only for deliveries to California, USA.
// Every other state / country pays no sales tax.
export const TAX_COUNTRY = 'US';
export const TAX_STATE = 'CA';
export const TAX_RATE_PERCENT = 7.75;

export const taxApplies = (country?: string, state?: string): boolean =>
  (country || '').trim().toUpperCase() === TAX_COUNTRY && (state || '').trim().toUpperCase() === TAX_STATE;

/** Sales tax on an amount that is already after discounts and before tax. */
export const calcSalesTax = (taxableAmount: number, country?: string, state?: string): number =>
  taxApplies(country, state) ? Math.round(taxableAmount * TAX_RATE_PERCENT) / 100 : 0;

export const TAX_LABEL = `Sales Tax (${TAX_STATE} ${TAX_RATE_PERCENT}%)`;

export const US_STATES: Array<[string, string]> = [
  ['AL', 'Alabama'], ['AK', 'Alaska'], ['AZ', 'Arizona'], ['AR', 'Arkansas'], ['CA', 'California'],
  ['CO', 'Colorado'], ['CT', 'Connecticut'], ['DE', 'Delaware'], ['DC', 'District of Columbia'], ['FL', 'Florida'],
  ['GA', 'Georgia'], ['HI', 'Hawaii'], ['ID', 'Idaho'], ['IL', 'Illinois'], ['IN', 'Indiana'],
  ['IA', 'Iowa'], ['KS', 'Kansas'], ['KY', 'Kentucky'], ['LA', 'Louisiana'], ['ME', 'Maine'],
  ['MD', 'Maryland'], ['MA', 'Massachusetts'], ['MI', 'Michigan'], ['MN', 'Minnesota'], ['MS', 'Mississippi'],
  ['MO', 'Missouri'], ['MT', 'Montana'], ['NE', 'Nebraska'], ['NV', 'Nevada'], ['NH', 'New Hampshire'],
  ['NJ', 'New Jersey'], ['NM', 'New Mexico'], ['NY', 'New York'], ['NC', 'North Carolina'], ['ND', 'North Dakota'],
  ['OH', 'Ohio'], ['OK', 'Oklahoma'], ['OR', 'Oregon'], ['PA', 'Pennsylvania'], ['RI', 'Rhode Island'],
  ['SC', 'South Carolina'], ['SD', 'South Dakota'], ['TN', 'Tennessee'], ['TX', 'Texas'], ['UT', 'Utah'],
  ['VT', 'Vermont'], ['VA', 'Virginia'], ['WA', 'Washington'], ['WV', 'West Virginia'], ['WI', 'Wisconsin'],
  ['WY', 'Wyoming'],
];

// Countries the shop delivers to (United States first: it is the main market).
export const SHIP_COUNTRIES: Array<[string, string]> = [
  ['US', 'United States'], ['CA', 'Canada'], ['GB', 'United Kingdom'], ['AU', 'Australia'],
  ['IN', 'India'], ['AE', 'United Arab Emirates'], ['SG', 'Singapore'], ['MY', 'Malaysia'],
  ['DE', 'Germany'], ['FR', 'France'],
];
