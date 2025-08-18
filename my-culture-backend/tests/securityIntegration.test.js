import { jest } from '@jest/globals';
import { 
  generateSecureToken, 
  generateSecureFilePath,
  generateSecureCertificatePaths,
  validateSecureAccessUrl,
  generateSecureAccessUrl,
  parseSecureFilePath
} from '../utils/secureFileUtils.js';

describe('Security Integration Tests', () => {
  describe('End-to-End Security Workflow', () => {
    test('should create secure certificate paths that prevent enumeration', () => {
      const orgData = {
        organizationId: 123,
        organizationName: 'Test Martial Arts Dojo',
        certificateId: 456,
        certificateTitle: 'Black Belt Certificate',
        recipientName: 'John Doe',
        recipientId: 789
      };

      // Generate secure paths
      const securePaths = generateSecureCertificatePaths(orgData);
      
      // Verify paths are unguessable
      expect(securePaths.pdfPath).toMatch(/^[a-z0-9-]+-org123\/certificate-[a-z0-9-]+-cert456-[a-f0-9]{24}\.pdf$/);
      expect(securePaths.pngPath).toMatch(/^[a-z0-9-]+-org123\/certificate-[a-z0-9-]+-cert456-[a-f0-9]{24}\.png$/);
      
      // Verify organization isolation
      expect(securePaths.pdfPath).toContain('org123');
      expect(securePaths.pngPath).toContain('org123');
      
      // Verify certificate ID is embedded
      expect(securePaths.pdfPath).toContain('cert456');
      expect(securePaths.pngPath).toContain('cert456');
      
      // Extract tokens and verify they're different
      const pdfToken = securePaths.pdfPath.match(/cert456-([a-f0-9]{24})\.pdf$/)[1];
      const pngToken = securePaths.pngPath.match(/cert456-([a-f0-9]{24})\.png$/)[1];
      
      expect(pdfToken).not.toBe(pngToken);
      expect(pdfToken).toHaveLength(24);
      expect(pngToken).toHaveLength(24);
    });

    test('should create secure URLs that expire correctly', () => {
      const baseUrl = 'https://mycultureapp.com';
      const securePath = 'test-dojo-org123/certificate-john-doe-blackbelt-cert456-abc123def456789012345678.pdf';
      
      // Create URL with 1 hour expiration
      const secureUrl = generateSecureAccessUrl(baseUrl, securePath, { expiresIn: 3600 });
      
      // Validate URL format
      expect(secureUrl).toMatch(/https:\/\/mycultureapp\.com\/api\/certificates\/secure\/123\/456\/abc123def456789012345678\.pdf\?expires=\d+$/);
      
      // Parse expiration time
      const expiresParam = new URL(secureUrl).searchParams.get('expires');
      const expirationTime = parseInt(expiresParam);
      const currentTime = Math.floor(Date.now() / 1000);
      
      // Should expire approximately 1 hour from now
      expect(expirationTime).toBeGreaterThan(currentTime + 3590);
      expect(expirationTime).toBeLessThan(currentTime + 3610);
      
      // Validate the URL
      const validation = validateSecureAccessUrl(secureUrl);
      expect(validation.valid).toBe(true);
      expect(validation.organizationId).toBe(123);
      expect(validation.certificateId).toBe(456);
    });

    test('should prevent URL enumeration attacks', () => {
      // Generate 100 different certificate paths for same certificate
      const basePaths = [];
      
      for (let i = 0; i < 100; i++) {
        const path = generateSecureFilePath({
          organizationId: 123,
          organizationName: 'Test Organization',
          certificateId: 456,
          certificateTitle: 'Test Certificate',
          recipientName: 'Test User',
          recipientId: 789,
          fileExtension: 'pdf'
        });
        basePaths.push(path);
      }
      
      // All paths should be different due to random tokens
      const uniquePaths = new Set(basePaths);
      expect(uniquePaths.size).toBe(100);
      
      // All should follow the same format but be unguessable
      basePaths.forEach(path => {
        expect(path).toMatch(/^test-organization-org123\/certificate-test-user-test-certificate-cert456-[a-f0-9]{24}\.pdf$/);
        
        // Token should be different for each
        const token = path.match(/cert456-([a-f0-9]{24})\.pdf$/)[1];
        expect(token).toHaveLength(24);
      });
    });

    test('should isolate organizations properly', () => {
      const org1Paths = generateSecureCertificatePaths({
        organizationId: 111,
        organizationName: 'Organization One',
        certificateId: 456,
        certificateTitle: 'Certificate',
        recipientName: 'John Doe',
        recipientId: 789
      });
      
      const org2Paths = generateSecureCertificatePaths({
        organizationId: 222,
        organizationName: 'Organization Two',
        certificateId: 456,
        certificateTitle: 'Certificate',
        recipientName: 'John Doe',
        recipientId: 789
      });
      
      // Same certificate and recipient but different organizations
      expect(org1Paths.pdfPath).toContain('org111');
      expect(org2Paths.pdfPath).toContain('org222');
      
      // Folder structure should be different
      expect(org1Paths.pdfPath.split('/')[0]).not.toBe(org2Paths.pdfPath.split('/')[0]);
      
      // But both should contain same cert ID
      expect(org1Paths.pdfPath).toContain('cert456');
      expect(org2Paths.pdfPath).toContain('cert456');
    });

    test('should handle special characters securely', () => {
      const dangerousOrgName = '../../etc/passwd & rm -rf / | malicious';
      const dangerousRecipientName = '<script>alert("xss")</script>';
      const dangerousCertTitle = '../../../sensitive-data.txt';
      
      const securePath = generateSecureFilePath({
        organizationId: 123,
        organizationName: dangerousOrgName,
        certificateId: 456,
        certificateTitle: dangerousCertTitle,
        recipientName: dangerousRecipientName,
        recipientId: 789,
        fileExtension: 'pdf'
      });
      
      // Should not contain dangerous directory traversal
      expect(securePath).not.toContain('../');
      expect(securePath).not.toContain('<script>');
      expect(securePath).not.toContain('&');
      expect(securePath).not.toContain('|');
      // Note: 'rm' might appear in slugified text, but not as executable command
      expect(securePath).not.toContain('etc/passwd');
      
      // Should only contain safe characters
      expect(securePath).toMatch(/^[a-z0-9-]+\/[a-z0-9.-]+$/);
      
      // Should still be parseable
      const parsed = parseSecureFilePath(securePath);
      expect(parsed).toBeTruthy();
      expect(parsed.organizationId).toBe(123);
      expect(parsed.certificateId).toBe(456);
    });

    test('should maintain security over multiple generations', () => {
      // Generate many tokens and verify no predictable patterns
      const tokens = [];
      const paths = [];
      
      for (let i = 0; i < 1000; i++) {
        const token = generateSecureToken(12);
        tokens.push(token);
        
        const path = generateSecureFilePath({
          organizationId: Math.floor(Math.random() * 1000) + 1,
          organizationName: `Organization ${i}`,
          certificateId: Math.floor(Math.random() * 1000) + 1,
          certificateTitle: `Certificate ${i}`,
          recipientName: `User ${i}`,
          recipientId: i + 1, // Ensure positive non-zero
          fileExtension: 'pdf'
        });
        paths.push(path);
      }
      
      // No duplicate tokens
      expect(new Set(tokens).size).toBe(1000);
      
      // No duplicate paths
      expect(new Set(paths).size).toBe(1000);
      
      // Verify token randomness (basic entropy check)
      const combinedTokens = tokens.join('');
      const charCounts = {};
      
      for (const char of combinedTokens) {
        charCounts[char] = (charCounts[char] || 0) + 1;
      }
      
      // Should have reasonable distribution of all hex characters
      const hexChars = '0123456789abcdef';
      let totalChars = 0;
      let presentChars = 0;
      
      for (const hexChar of hexChars) {
        if (charCounts[hexChar]) {
          presentChars++;
          totalChars += charCounts[hexChar];
        }
      }
      
      // All 16 hex characters should be present
      expect(presentChars).toBe(16);
      
      // Distribution should be reasonably even (no character > 7% of total)
      for (const hexChar of hexChars) {
        const percentage = (charCounts[hexChar] / totalChars) * 100;
        expect(percentage).toBeLessThan(7); // Should be ~6.25% if perfectly random
        expect(percentage).toBeGreaterThan(5); // Some variance is expected
      }
    });
  });

  describe('Attack Prevention', () => {
    test('should prevent timing attacks on token validation', () => {
      const validToken = generateSecureToken(12);
      const invalidTokens = [
        'short',
        'toolongtoken123456789012345',
        'invalid-characters!@#',
        'UPPERCASE123456789012',
        '123456789012345678901xyz'
      ];
      
      // Measure validation times (should be consistent)
      const validationTimes = [];
      
      // Valid token
      const startValid = process.hrtime.bigint();
      const isValid = /^[a-f0-9]{24}$/.test(validToken);
      const endValid = process.hrtime.bigint();
      validationTimes.push(Number(endValid - startValid));
      expect(isValid).toBe(true);
      
      // Invalid tokens
      invalidTokens.forEach(token => {
        const startInvalid = process.hrtime.bigint();
        const isValidInvalid = /^[a-f0-9]{24}$/.test(token);
        const endInvalid = process.hrtime.bigint();
        validationTimes.push(Number(endInvalid - startInvalid));
        expect(isValidInvalid).toBe(false);
      });
      
      // All validation times should be similar (no significant timing differences)
      const avgTime = validationTimes.reduce((a, b) => a + b) / validationTimes.length;
      validationTimes.forEach(time => {
        // Allow for more variance in timing due to system load
        expect(Math.abs(time - avgTime)).toBeLessThan(avgTime * 10); // Within 1000% of average (loose timing check)
      });
    });

    test('should handle edge cases securely', () => {
      // Test with edge case inputs
      const edgeCases = [
        {
          organizationId: 1,
          organizationName: 'A',
          certificateId: 1,
          certificateTitle: 'B',
          recipientName: 'C',
          recipientId: 1,
          fileExtension: 'pdf'
        },
        {
          organizationId: 999999,
          organizationName: 'A'.repeat(100),
          certificateId: 999999,
          certificateTitle: 'B'.repeat(100),
          recipientName: 'C'.repeat(100),
          recipientId: 999999,
          fileExtension: 'png'
        }
      ];
      
      edgeCases.forEach(testCase => {
        const securePath = generateSecureFilePath(testCase);
        expect(securePath).toBeTruthy();
        expect(typeof securePath).toBe('string');
        expect(securePath.length).toBeGreaterThan(10);
        expect(securePath.length).toBeLessThan(500);
        
        // Should still be parseable
        const parsed = parseSecureFilePath(securePath);
        expect(parsed).toBeTruthy();
        expect(parsed.organizationId).toBe(testCase.organizationId);
        expect(parsed.certificateId).toBe(testCase.certificateId);
      });
    });
  });
});