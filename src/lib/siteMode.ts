export type SiteMode = 'landing' | 'website';

// Existing sites keep their sales-page homepage until an administrator switches modes.
export const getSiteMode = (value: string | null | undefined): SiteMode =>
  value === 'website' ? 'website' : 'landing';
