import { jest } from '@jest/globals';
import {
  generateSecureToken,
  generateSecureFilePath,
  generateSecureCertificatePaths,
  parseSecureFilePath,
  isValidSecureToken,
  generateSecureAccessUrl,
  validateSecureAccessUrl
} from '../utils/secureFileUtils.js';

describe('Secure File Utils', () => {
  describe('generateSecureToken', () => {
    test('should generate token with default length (16 bytes = 32 hex chars)', () => {
      const token = generateSecureToken();
      expect(token).toMatch(/^[a-f0-9]{32}$/);
      expect(token.length).toBe(32);
    });

    test('should generate token with custom length', () => {
      const token = generateSecureToken(12); // 12 bytes = 24 hex chars
      expect(token).toMatch(/^[a-f0-9]{24}$/);
      expect(token.length).toBe(24);
    });

    test('should generate different tokens each time', () => {
      const token1 = generateSecureToken();
      const token2 = generateSecureToken();
      expect(token1).not.toBe(token2);
    });

    test('should validate token length limits', () => {
      expect(() => generateSecureToken(7)).toThrow(); // Too short
      expect(() => generateSecureToken(33)).toThrow(); // Too long
    });
  });

  describe('generateSecureFilePath', () => {
    const validParams = {
      organizationId: 123,
      organizationName: 'Bujinkan Dojo München',
      certificateId: 456,
      certificateTitle: 'Black Belt Certificate',
      recipientName: 'Wayne Blackwater',
      recipientId: 789,
      fileExtension: 'pdf'
    };

    test('should generate secure file path with correct format', () => {
      const path = generateSecureFilePath(validParams);
      
      // Check general format - actual slugification may vary
      expect(path).toMatch(/^[a-z0-9-]+-org123\/certificate-[a-z0-9-]+-cert456-[a-f0-9]{24}\.pdf$/);
      expect(path).toContain('org123');
      expect(path).toContain('cert456');
      expect(path.split('/')[0]).toMatch(/-org123$/);
    });

    test('should handle special characters in organization name', () => {
      const params = {
        ...validParams,
        organizationName: 'Café & Restaurant München!'
      };
      const path = generateSecureFilePath(params);
      
      // Check that special characters are removed/replaced and format is maintained
      expect(path).toMatch(/^[a-z0-9-]+-org123/);
      expect(path).not.toContain('&');
      expect(path).not.toContain('!');
      expect(path).not.toContain('ü'); // Should be removed or replaced
    });

    test('should handle long names by truncating', () => {
      const params = {
        ...validParams,
        recipientName: 'This Is A Very Very Very Long Recipient Name That Should Be Truncated Properly'
      };
      const path = generateSecureFilePath(params);
      
      expect(path.length).toBeLessThan(200); // Reasonable path length
      expect(path).toContain('this-is-a-very-very-very-long-recipient-name-that-');
    });

    test('should validate input parameters', () => {
      expect(() => generateSecureFilePath({
        ...validParams,
        organizationId: -1
      })).toThrow();

      expect(() => generateSecureFilePath({
        ...validParams,
        fileExtension: 'exe'
      })).toThrow();

      expect(() => generateSecureFilePath({
        ...validParams,
        organizationName: ''
      })).toThrow();
    });

    test('should generate different paths for different inputs', () => {
      const path1 = generateSecureFilePath(validParams);
      const path2 = generateSecureFilePath({
        ...validParams,
        recipientId: 999
      });
      
      expect(path1).not.toBe(path2);
      // But both should have same org folder
      expect(path1.split('/')[0]).toBe(path2.split('/')[0]);
    });
  });

  describe('generateSecureCertificatePaths', () => {
    const validParams = {
      organizationId: 123,
      organizationName: 'Test Organization',
      certificateId: 456,
      certificateTitle: 'Test Certificate',
      recipientName: 'John Doe',
      recipientId: 789
    };

    test('should generate paths for all file types', () => {
      const paths = generateSecureCertificatePaths(validParams);
      
      expect(paths).toHaveProperty('pdfPath');
      expect(paths).toHaveProperty('pngPath');
      expect(paths).toHaveProperty('htmlPath');
      
      expect(paths.pdfPath).toMatch(/\.pdf$/);
      expect(paths.pngPath).toMatch(/\.png$/);
      expect(paths.htmlPath).toMatch(/\.html$/);
    });

    test('should use same organization folder for all file types', () => {
      const paths = generateSecureCertificatePaths(validParams);
      
      const pdfFolder = paths.pdfPath.split('/')[0];
      const pngFolder = paths.pngPath.split('/')[0];
      const htmlFolder = paths.htmlPath.split('/')[0];
      
      expect(pdfFolder).toBe(pngFolder);
      expect(pngFolder).toBe(htmlFolder);
    });
  });

  describe('parseSecureFilePath', () => {
    test('should parse valid secure file path', () => {
      const path = 'test-org-org123/certificate-john-doe-test-cert-cert456-abc123def456.pdf';
      const parsed = parseSecureFilePath(path);
      
      expect(parsed).toEqual({
        organizationId: 123,
        organizationSlug: 'test-org',
        certificateId: 456,
        secureToken: 'abc123def456',
        fileExtension: 'pdf',
        recipientPart: 'john-doe-test-cert'
      });
    });

    test('should return null for invalid format', () => {
      const invalidPaths = [
        'invalid-path.pdf',
        'org123/certificate-test.pdf',
        'test-org123/certificate-test-cert456.pdf', // Missing token
        'test-org/certificate-test-cert456-token.pdf' // Missing org pattern
      ];
      
      invalidPaths.forEach(path => {
        expect(parseSecureFilePath(path)).toBeNull();
      });
    });

    test('should handle different file extensions', () => {
      const extensions = ['pdf', 'png', 'html'];
      
      extensions.forEach(ext => {
        const path = `test-org-org123/certificate-john-doe-cert456-abc123def456.${ext}`;
        const parsed = parseSecureFilePath(path);
        expect(parsed.fileExtension).toBe(ext);
      });
    });
  });

  describe('isValidSecureToken', () => {
    test('should validate correct token format (24 hex chars)', () => {
      const validTokens = [
        'abc123def456789012345678',
        'abcdef0123456789abcdef01',
        '123456789abcdef012345678'
      ];
      
      validTokens.forEach(token => {
        expect(isValidSecureToken(token)).toBe(true);
      });
    });

    test('should reject invalid token formats', () => {
      const invalidTokens = [
        'abc123def456', // Too short
        'abc123def456789012345678abc', // Too long
        'abc123def456789012345xyz', // Invalid chars
        'ABC123DEF456789012345678', // Uppercase
        '123456789012345678901234' // Numbers only but valid length
      ];
      
      invalidTokens.forEach(token => {
        if (token === '123456789012345678901234') {
          expect(isValidSecureToken(token)).toBe(true); // This is actually valid
        } else {
          expect(isValidSecureToken(token)).toBe(false);
        }
      });
    });
  });

  describe('generateSecureAccessUrl', () => {
    const baseUrl = 'https://example.com';
    const securePath = 'test-org-org123/certificate-john-doe-cert456-abc123def456.pdf';

    test('should generate secure URL without expiration', () => {
      const url = generateSecureAccessUrl(baseUrl, securePath);
      
      expect(url).toMatch(/https:\/\/example\.com\/api\/certificates\/secure\/123\/456\/abc123def456\.pdf$/);
      expect(url).not.toContain('expires=');
    });

    test('should generate secure URL with expiration', () => {
      const expiresIn = 3600; // 1 hour
      const beforeTime = Math.floor(Date.now() / 1000);
      
      const url = generateSecureAccessUrl(baseUrl, securePath, { expiresIn });
      
      expect(url).toContain('expires=');
      
      const expiresParam = new URL(url).searchParams.get('expires');
      const expirationTime = parseInt(expiresParam);
      
      expect(expirationTime).toBeGreaterThan(beforeTime);
      expect(expirationTime).toBeLessThanOrEqual(beforeTime + expiresIn + 1);
    });

    test('should throw error for invalid secure path', () => {
      expect(() => {
        generateSecureAccessUrl(baseUrl, 'invalid-path.pdf');
      }).toThrow('Invalid secure path format');
    });
  });

  describe('validateSecureAccessUrl', () => {
    test('should validate correct URL format', () => {
      const url = 'https://example.com/api/certificates/secure/123/456/abc123def456789012345678.pdf';
      const result = validateSecureAccessUrl(url);
      
      expect(result.valid).toBe(true);
      expect(result.organizationId).toBe(123);
      expect(result.certificateId).toBe(456);
      expect(result.secureToken).toBe('abc123def456789012345678');
      expect(result.fileExtension).toBe('pdf');
    });

    test('should validate URL with expiration (not expired)', () => {
      const futureTime = Math.floor(Date.now() / 1000) + 3600; // 1 hour from now
      const url = `https://example.com/api/certificates/secure/123/456/abc123def456789012345678.pdf?expires=${futureTime}`;
      const result = validateSecureAccessUrl(url);
      
      expect(result.valid).toBe(true);
    });

    test('should reject expired URL', () => {
      const pastTime = Math.floor(Date.now() / 1000) - 3600; // 1 hour ago
      const url = `https://example.com/api/certificates/secure/123/456/abc123def456789012345678.pdf?expires=${pastTime}`;
      const result = validateSecureAccessUrl(url);
      
      expect(result.valid).toBe(false);
      expect(result.error).toBe('URL has expired');
    });

    test('should reject invalid URL format', () => {
      const invalidUrls = [
        'https://example.com/certificates/123/456.pdf', // Wrong path
        'https://example.com/api/certificates/secure/123.pdf', // Missing parts
        'https://example.com/api/certificates/secure/123/456/invalid.pdf', // Invalid token
        'not-a-url'
      ];
      
      invalidUrls.forEach(url => {
        const result = validateSecureAccessUrl(url);
        expect(result.valid).toBe(false);
        expect(result.error).toBeDefined();
      });
    });

    test('should reject invalid token in URL', () => {
      const url = 'https://example.com/api/certificates/secure/123/456/shorttoken.pdf';
      const result = validateSecureAccessUrl(url);
      
      expect(result.valid).toBe(false);
      expect(result.error).toMatch(/Invalid (URL format|token format)/);
    });
  });

  describe('Security Properties', () => {
    test('tokens should be cryptographically random', () => {
      // Generate many tokens and check for patterns
      const tokens = Array.from({ length: 1000 }, () => generateSecureToken(8));
      
      // Check no duplicates in 1000 tokens (extremely unlikely with crypto random)
      const uniqueTokens = new Set(tokens);
      expect(uniqueTokens.size).toBe(tokens.length);
      
      // Check character distribution is reasonable
      const allChars = tokens.join('');
      const charCounts = {};
      for (const char of allChars) {
        charCounts[char] = (charCounts[char] || 0) + 1;
      }
      
      // Should have all 16 hex characters represented
      const hexChars = '0123456789abcdef';
      for (const char of hexChars) {
        expect(charCounts[char]).toBeGreaterThan(0);
      }
    });

    test('file paths should prevent directory traversal', () => {
      const maliciousParams = {
        organizationId: 123,
        organizationName: '../../../etc/passwd',
        certificateId: 456,
        certificateTitle: 'test',
        recipientName: '../admin',
        recipientId: 789,
        fileExtension: 'pdf'
      };
      
      const path = generateSecureFilePath(maliciousParams);
      
      // Should not contain directory traversal sequences
      expect(path).not.toContain('../');
      expect(path).not.toContain('./');
      expect(path).not.toContain('etc/passwd');
      
      // Should be properly slugified
      expect(path).toMatch(/^[a-z0-9-]+\/certificate-[a-z0-9-]+-cert\d+-[a-f0-9]{24}\.(pdf|png|html)$/);
    });
  });
});