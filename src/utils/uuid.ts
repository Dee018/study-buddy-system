export function generateUUID(): string {
  // Generate a highly secure and complex user code
  const timestamp = Date.now().toString(36).toUpperCase();
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  const specialChars = '!@#$%^&*+-=';
  
  // Generate cryptographically secure random bytes
  const secureBytes = crypto.getRandomValues(new Uint8Array(16));
  const secureHex = Array.from(secureBytes)
    .map(b => b.toString(16).padStart(2, '0')).join('').toUpperCase();
  
  // Create multi-part secure code
  let result = 'SB'; // Study Buddy prefix
  
  // Add timestamp component (first 6 chars)
  result += '-' + timestamp.substring(0, 6);
  
  // Add secure random hex (8 chars)
  result += '-' + secureHex.substring(0, 8);
  
  // Add mixed random section with special chars
  result += '-';
  for (let i = 0; i < 4; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  result += specialChars.charAt(Math.floor(Math.random() * specialChars.length));
  
  // Add final secure component
  result += '-' + secureHex.substring(8, 16);
  
  // Add final random component
  result += '-';
  for (let i = 0; i < 6; i++) {
    const char = chars.charAt(Math.floor(Math.random() * chars.length));
    result += Math.random() > 0.5 ? char : char.toLowerCase();
  }
  
  return result;
}

export function isValidUUID(uuid: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
}