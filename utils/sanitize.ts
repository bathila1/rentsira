// ─── Strip HTML tags and dangerous characters ───
export function sanitizeText(input: string): string {
  return input
    .replace(/<[^>]*>/g, '')           // remove HTML tags
    .replace(/[<>'"`;]/g, '')          // remove dangerous chars
    .trim()
    .slice(0, 500)                     // max length
}

export function sanitizeNumber(input: string): number | null {
  const num = parseFloat(input)
  return isNaN(num) ? null : num
}

export function sanitizeYear(input: string): number | null {
  const year = parseInt(input)
  if (isNaN(year) || year < 1950 || year > new Date().getFullYear() + 1) return null
  return year
}

export function sanitizePhone(input: string): string {
  return input.replace(/[^\d+\s\-()]/g, '').trim().slice(0, 20)
}

/**
 * Sanitizes and validates a price string input.
 * @param input - The price string to sanitize
 * @returns The parsed number if valid, or null if the input is invalid, negative, or exceeds 10,000,000
 */
export function sanitizePrice(input: string): number | null {
  const num = parseFloat(input)
  if (isNaN(num) || num < 0 || num > 10_000_000) return null
  return num
}

export function sanitizeEmail(input: string): string | boolean{
  const trimedAndLoweCased = input.trim().toLowerCase()
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(trimedAndLoweCased)){
    return false
  }
  return trimedAndLoweCased
  }



// phone validator fun
  export function formatAndValidateSLNumber(input: string): string | boolean {
    if (/[a-zA-Z]/.test(input)) {
      return false;
    }
    // 1. Remove everything except numbers
    let cleaned = input.replace(/\D/g, "");

    // 2. Remove '94' prefix if it exists at the start
    if (cleaned.startsWith("94")) {
      cleaned = cleaned.substring(2);
    }

    // 3. Remove leading '0' if it exists to get the core 9 digits
    if (cleaned.startsWith("0")) {
      cleaned = cleaned.substring(1);
    }

    // 4. Validate: Must be 9 digits and start with '7' (Mobile)
    // Sri Lankan mobile networks: 70, 71, 72, 74, 75, 76, 77, 78
    const mobileRegex = /^7[01245678]\d{7}$/;

    if (mobileRegex.test(cleaned)) {
      // 5. Return in 0XXXXXXXXX format
      return `0${cleaned}`;
    }

    // Return null if invalid
    return false;
  };