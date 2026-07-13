export type CountryCode = {
  dialCode: string;
  countryCode: string;
  label: string;
};

export const countryCodes: CountryCode[] = [
  { countryCode: "91", dialCode: "+91", label: "🇮🇳 India" },
  { countryCode: "1", dialCode: "+1", label: "🇺🇸 United States" },
  { countryCode: "44", dialCode: "+44", label: "🇬🇧 United Kingdom" },
  { countryCode: "61", dialCode: "+61", label: "🇦🇺 Australia" },
  { countryCode: "49", dialCode: "+49", label: "🇩🇪 Germany" },
  { countryCode: "33", dialCode: "+33", label: "🇫🇷 France" },
  { countryCode: "39", dialCode: "+39", label: "🇮🇹 Italy" },
  { countryCode: "34", dialCode: "+34", label: "🇪🇸 Spain" },
  { countryCode: "55", dialCode: "+55", label: "🇧🇷 Brazil" },
  { countryCode: "52", dialCode: "+52", label: "🇲🇽 Mexico" },
  { countryCode: "81", dialCode: "+81", label: "🇯🇵 Japan" },
  { countryCode: "82", dialCode: "+82", label: "🇰🇷 South Korea" },
  { countryCode: "86", dialCode: "+86", label: "🇨🇳 China" },
  { countryCode: "7", dialCode: "+7", label: "🇷🇺 Russia" },
  { countryCode: "27", dialCode: "+27", label: "🇿🇦 South Africa" },
  { countryCode: "234", dialCode: "+234", label: "🇳🇬 Nigeria" },
  { countryCode: "20", dialCode: "+20", label: "🇪🇬 Egypt" },
  { countryCode: "92", dialCode: "+92", label: "🇵🇰 Pakistan" },
  { countryCode: "880", dialCode: "+880", label: "🇧🇩 Bangladesh" },
];

export const getCountryByCode = (code: string | null): CountryCode | undefined => {
  if (!code) return undefined;
  return countryCodes.find((c) => c.countryCode === code);
};
