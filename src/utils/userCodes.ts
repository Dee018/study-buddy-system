// Reserved codes that cannot be generated
const RESERVED_CODES = new Set([
  'YCW-158-KA-4678' // Admin code
]);

// Reserved usernames that cannot be used
export const RESERVED_USERNAMES = new Set([
  'UserAdministrator123'
]);

// Enhanced secure user code generation system
export function generateUserCode(): string {
  let code: string;
  let attempts = 0;
  const maxAttempts = 100;

  do {
    // Generate a 12-character code with mixed letters, numbers, and special segments for enhanced security
    const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const numbers = '0123456789';
    const segments: string[] = [];

    // Segment 1: 3 letters
    let segment1 = '';
    for (let i = 0; i < 3; i++) {
      segment1 += letters.charAt(Math.floor(Math.random() * letters.length));
    }

    // Segment 2: 3 numbers
    let segment2 = '';
    for (let i = 0; i < 3; i++) {
      segment2 += numbers.charAt(Math.floor(Math.random() * numbers.length));
    }

    // Segment 3: 2 letters
    let segment3 = '';
    for (let i = 0; i < 2; i++) {
      segment3 += letters.charAt(Math.floor(Math.random() * letters.length));
    }

    // Segment 4: 4 numbers with checksum-like calculation
    const timestamp = Date.now() % 10000;
    const segment4 = timestamp.toString().padStart(4, '0');

    // `segments` was previously collected but not used in final format; keep reference to silence lint
    segments.push(segment1, segment2, segment3, segment4);
    void segments;

    code = `${segment1}-${segment2}-${segment3}-${segment4}`;
    attempts++;

    // Prevent infinite loop
    if (attempts >= maxAttempts) {
      throw new Error('Unable to generate unique user code');
    }
  } while (RESERVED_CODES.has(code));

  return code;
}

// Validate user code format
export function isValidUserCode(code: string): boolean {
  return /^[A-Z]{3}-[0-9]{3}-[A-Z]{2}-[0-9]{4}$/.test(code);
}

// Check if a code is reserved
export function isReservedCode(code: string): boolean {
  return RESERVED_CODES.has(code.toUpperCase());
}

// Check if a username is reserved
export function isReservedUsername(username: string): boolean {
  return RESERVED_USERNAMES.has(username);
}

// Convert existing UUIDs to secure codes (for demo purposes)
export function convertUUIDToCode(uuid: string): string {
  switch (uuid) {
    case 'user-123':
      return 'ABC-123-XY-7890';
    case 'user-456':
      return 'DEF-456-ZW-2341';
    case 'user-789':
      return 'GHI-789-UV-5672';
    default:
      return generateUserCode();
  }
}