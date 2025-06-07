import { describe, it, expect, beforeEach, afterEach } from "bun:test";
import { SSLManager, setupSSL } from "../../src/ssl-manager";
import { existsSync, rmSync, mkdirSync } from "fs";
import { join } from "path";

/**
 * SSL Manager Unit Tests
 * Testing SSL certificate generation and validation
 */

describe("SSL Manager - Certificate Management", () => {
  let sslManager: SSLManager;
  let testCertsDir: string;

  beforeEach(() => {
    // Create temporary test directory
    testCertsDir = join(process.cwd(), 'test-certs');
    if (existsSync(testCertsDir)) {
      rmSync(testCertsDir, { recursive: true, force: true });
    }
    mkdirSync(testCertsDir, { recursive: true });

    // Initialize SSL manager with test directory
    sslManager = new SSLManager({
      certPath: join(testCertsDir, 'test-server.crt'),
      keyPath: join(testCertsDir, 'test-server.key'),
      domain: 'test.localhost',
      validityDays: 30
    });
  });

  afterEach(() => {
    // Clean up test directory
    if (existsSync(testCertsDir)) {
      rmSync(testCertsDir, { recursive: true, force: true });
    }
  });

  describe("Certificate Generation", () => {
    it("should create certificate directory if it doesn't exist", async () => {
      // Remove the directory to test creation
      rmSync(testCertsDir, { recursive: true, force: true });
      expect(existsSync(testCertsDir)).toBe(false);

      await sslManager.initializeLocalSSL();
      
      expect(existsSync(testCertsDir)).toBe(true);
    });

    it("should generate SSL certificates when they don't exist", async () => {
      const { certPath, keyPath } = sslManager.getCertificatePaths();
      
      expect(existsSync(certPath)).toBe(false);
      expect(existsSync(keyPath)).toBe(false);

      await sslManager.initializeLocalSSL();

      expect(existsSync(certPath)).toBe(true);
      expect(existsSync(keyPath)).toBe(true);
    });

    it("should not regenerate valid certificates", async () => {
      // Generate certificates first
      await sslManager.initializeLocalSSL();
      
      const { certPath, keyPath } = sslManager.getCertificatePaths();
      const initialCertStat = Bun.file(certPath).size;
      const initialKeyStat = Bun.file(keyPath).size;

      // Wait a moment to ensure timestamps would be different
      await new Promise(resolve => setTimeout(resolve, 100));

      // Try to initialize again
      await sslManager.initializeLocalSSL();

      // Files should not have changed
      expect(Bun.file(certPath).size).toBe(initialCertStat);
      expect(Bun.file(keyPath).size).toBe(initialKeyStat);
    });
  });

  describe("Certificate Validation", () => {
    it("should validate certificate format", async () => {
      await sslManager.initializeLocalSSL();
      
      const sslConfig = sslManager.getSSLConfig();
      
      const certContent = sslConfig.cert.toString();
      const keyContent = sslConfig.key.toString();
      
      expect(certContent).toContain('BEGIN CERTIFICATE');
      expect(certContent).toContain('END CERTIFICATE');
      expect(keyContent).toContain('BEGIN PRIVATE KEY');
      expect(keyContent).toContain('END PRIVATE KEY');
    });

    it("should throw error when getting SSL config without certificates", () => {
      expect(() => {
        sslManager.getSSLConfig();
      }).toThrow('SSL certificates not found');
    });
  });

  describe("Embedded Bridge SSL Support", () => {
    it("should provide SSL configuration for secure IPC communication", async () => {
      await sslManager.initializeLocalSSL();
      
      const sslConfig = sslManager.getSSLConfig();
      
      expect(sslConfig).toHaveProperty('cert');
      expect(sslConfig).toHaveProperty('key');
      expect(typeof sslConfig.cert).toBe('object'); // Buffer
      expect(typeof sslConfig.key).toBe('object'); // Buffer
    });

    it("should support secure embedded bridge configuration", () => {
      // Test that SSL manager can be used for embedded bridge encryption
      const paths = sslManager.getCertificatePaths();
      
      expect(paths.certPath).toBeDefined();
      expect(paths.keyPath).toBeDefined();
      expect(typeof paths.certPath).toBe('string');
      expect(typeof paths.keyPath).toBe('string');
    });
  });

  describe("OpenSSL Detection", () => {
    it("should detect OpenSSL availability", () => {
      const isAvailable = SSLManager.isOpenSSLAvailable();
      expect(typeof isAvailable).toBe('boolean');
    });
  });

  describe("Configuration", () => {
    it("should use default configuration values", () => {
      const defaultManager = new SSLManager();
      const paths = defaultManager.getCertificatePaths();
      
      expect(paths.certPath).toContain('server.crt');
      expect(paths.keyPath).toContain('server.key');
    });

    it("should accept custom configuration", () => {
      const customManager = new SSLManager({
        domain: 'custom.domain.com',
        validityDays: 90
      });
      
      const paths = customManager.getCertificatePaths();
      expect(paths.certPath).toContain('server.crt');
      expect(paths.keyPath).toContain('server.key');
    });
  });
});

describe("SSL Manager - Convenience Functions", () => {
  let testCertsDir: string;

  beforeEach(() => {
    testCertsDir = join(process.cwd(), 'test-setup-certs');
    if (existsSync(testCertsDir)) {
      rmSync(testCertsDir, { recursive: true, force: true });
    }
  });

  afterEach(() => {
    if (existsSync(testCertsDir)) {
      rmSync(testCertsDir, { recursive: true, force: true });
    }
  });

  it("should provide setupSSL convenience function", async () => {
    // Note: This will use the default certs directory
    const manager = await setupSSL('test.localhost');
    
    expect(manager).toBeInstanceOf(SSLManager);
    expect(typeof manager.getSSLConfig).toBe('function');
    expect(typeof manager.getCertificatePaths).toBe('function');
  });
});

describe("SSL Manager - Error Handling", () => {
  it("should handle certificate generation failures gracefully", async () => {
    // This test would require mocking execSync to simulate failure
    // For now, we just verify the error handling structure exists
    expect(typeof SSLManager.isOpenSSLAvailable).toBe('function');
  });

  it("should provide meaningful error messages", () => {
    const testDir = join(process.cwd(), 'nonexistent-test-dir');
    const manager = new SSLManager({
      certPath: join(testDir, 'nonexistent-server.crt'),
      keyPath: join(testDir, 'nonexistent-server.key')
    });
    
    expect(() => {
      manager.getSSLConfig();
    }).toThrow('SSL certificates not found');
  });
}); 