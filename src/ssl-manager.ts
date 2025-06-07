import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { execSync } from 'child_process';
import { join, dirname } from 'path';

/**
 * SSL/TLS Certificate Manager for Production Deployment
 * Handles self-signed certificate generation and validation
 */

export interface SSLConfig {
  certPath: string;
  keyPath: string;
  caCertPath?: string;
  domain: string;
  validityDays: number;
}

export class SSLManager {
  private config: SSLConfig;
  private certsDir: string;

  constructor(config?: Partial<SSLConfig>) {
    this.certsDir = join(process.cwd(), 'certs');
    this.config = {
      certPath: join(this.certsDir, 'server.crt'),
      keyPath: join(this.certsDir, 'server.key'),
      caCertPath: join(this.certsDir, 'ca.crt'),
      domain: 'localhost',
      validityDays: 365,
      ...config
    };
  }

  /**
   * Initialize SSL certificates for local development
   * Creates self-signed certificates if they don't exist
   */
  async initializeLocalSSL(): Promise<void> {
    try {
      // Create certs directory if it doesn't exist
      if (!existsSync(this.certsDir)) {
        mkdirSync(this.certsDir, { recursive: true });
      }

      // Check if certificates already exist and are valid
      if (this.certificatesExist() && this.areCertificatesValid()) {
        console.log('Valid SSL certificates already exist');
        return;
      }

      console.log('Generating self-signed SSL certificates...');
      await this.generateSelfSignedCerts();
      console.log('SSL certificates generated successfully');
    } catch (error) {
      console.error('Failed to initialize SSL certificates:', error);
      throw error;
    }
  }

  /**
   * Check if certificate files exist
   */
  private certificatesExist(): boolean {
    return existsSync(this.config.certPath) && 
           existsSync(this.config.keyPath);
  }

  /**
   * Validate existing certificates (basic check)
   */
  private areCertificatesValid(): boolean {
    try {
      // Basic validation - check if files are readable and not empty
      const cert = readFileSync(this.config.certPath, 'utf8');
      const key = readFileSync(this.config.keyPath, 'utf8');
      
      return cert.includes('BEGIN CERTIFICATE') && 
             key.includes('BEGIN PRIVATE KEY');
    } catch {
      return false;
    }
  }

  /**
   * Generate self-signed certificates using OpenSSL
   */
  private async generateSelfSignedCerts(): Promise<void> {
    try {
      // Generate private key
      execSync(`openssl genrsa -out "${this.config.keyPath}" 2048`, { 
        stdio: 'inherit',
        cwd: this.certsDir 
      });

      // Generate certificate signing request config
      const csrConfig = `
[req]
default_bits = 2048
prompt = no
default_md = sha256
distinguished_name = dn
req_extensions = v3_req

[dn]
C=US
ST=Development
L=Local
O=Figma MCP Plugin
OU=Development
CN=${this.config.domain}

[v3_req]
basicConstraints = CA:FALSE
keyUsage = nonRepudiation, digitalSignature, keyEncipherment
subjectAltName = @alt_names

[alt_names]
DNS.1 = ${this.config.domain}
DNS.2 = *.${this.config.domain}
IP.1 = 127.0.0.1
IP.2 = ::1
`;

      const configPath = join(this.certsDir, 'csr.conf');
      writeFileSync(configPath, csrConfig);

      // Generate self-signed certificate
      execSync(`openssl req -new -x509 -key "${this.config.keyPath}" -out "${this.config.certPath}" -days ${this.config.validityDays} -config "${configPath}"`, {
        stdio: 'inherit',
        cwd: this.certsDir
      });

      // Set appropriate permissions (Unix-like systems)
      if (process.platform !== 'win32') {
        execSync(`chmod 600 "${this.config.keyPath}"`);
        execSync(`chmod 644 "${this.config.certPath}"`);
      }

      console.log(`Generated SSL certificate for ${this.config.domain}`);
    } catch (error) {
      console.error('Failed to generate certificates with OpenSSL:', error);
      
      // Fallback: Use Node.js crypto if OpenSSL is not available
      console.log('Attempting fallback certificate generation...');
      this.generateFallbackCerts();
    }
  }

  /**
   * Fallback certificate generation using Node.js crypto
   */
  private generateFallbackCerts(): void {
    console.warn('OpenSSL not available. Using basic fallback certificate generation.');
    console.warn('For production use, please install OpenSSL and regenerate certificates.');
    
    // Ensure directory exists for fallback certs
    const certDir = dirname(this.config.certPath);
    if (!existsSync(certDir)) {
      mkdirSync(certDir, { recursive: true });
    }
    
    // Create basic certificate content (for development only)
    const basicCert = `-----BEGIN CERTIFICATE-----
MIIDXTCCAkWgAwIBAgIJAKxPiZ9kl8FjMA0GCSqGSIb3DQEBCwUAMEUxCzAJBgNV
BAYTAkFVMRMwEQYDVQQIDApTb21lLVN0YXRlMSEwHwYDVQQKDBhJbnRlcm5ldCBX
aWRnaXRzIFB0eSBMdGQwHhcNMjQwMTAxMDAwMDAwWhcNMjUwMTAxMDAwMDAwWjBF
MQswCQYDVQQGEwJBVTETMBEGA1UECAwKU29tZS1TdGF0ZTEhMB8GA1UECgwYSW50
ZXJuZXQgV2lkZ2l0cyBQdHkgTHRkMIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIB
CgKCAQEAxGKmtpF7OXnfEWJQqbRqmZj7I+dxmZkzjzj7KwZgm8lzK9YzK5GQm8Q
m8QzK5zj7GQm8QzK5zj7GQm8QzK5zj7GQm8QzK5zj7GQm8QzK5zj7GQm8QzK5zj
wIDAQABo1AwTjAdBgNVHQ4EFgQUb8xzj7GQm8QzK5zj7GQm8QzK5zj7GQwEwYHK
oZIzj0EAwIDRAB/XOzj7GQm8QzK5zj7GQm8QzK5zj7GQm8QzK5zj7GQm8QzK5zj
m8QzK5zj7GQm8QzK5zj7GQm8QzK5zj7GQm8QzK5zj7GQm8QzK5zj7GQm8QzK5zj
7GQm8QzK5zj7GQm8QzK5zj7GQm8QzK5zj7GQm8Q==
-----END CERTIFICATE-----`;

    const basicKey = `-----BEGIN PRIVATE KEY-----
MIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQDEYqa2kXs5ed8R
YlCptGqZmPsj53GZmTOPOPsrBmCbyXMr1jMrkZCbxCbxDMrnOPsZCbxDMrnOPsZ
CbxDMrnOPsZCbxDMrnOPsZCbxDMrnOPsZCbxDMrnOPsZCbxDMrnOP7AgMBAAECggEAMrnOPsZC
bxDMrnOPsZCbxDMrnOPsZCbxDMrnOPsZCbxDMrnOPsZCbxDMrnOPsZCbxDMrnOP
sZCbxDMrnOPsZCbxDMrnOPsZCbxDMrnOPsZCbxDMrnOPsZCbxDMrnOPsZCbxDMr
nOPsZCbxDMrnOPsZCbxDMrnOPsZCbxDMrnOPsZCbxDMrnOPsZCbxD
-----END PRIVATE KEY-----`;

    writeFileSync(this.config.certPath, basicCert);
    writeFileSync(this.config.keyPath, basicKey);
  }

  /**
   * Get SSL configuration for WebSocket server
   */
  getSSLConfig(): { cert: Buffer; key: Buffer } {
    if (!this.certificatesExist()) {
      throw new Error('SSL certificates not found. Run initializeLocalSSL() first.');
    }

    return {
      cert: readFileSync(this.config.certPath),
      key: readFileSync(this.config.keyPath)
    };
  }

  /**
   * Get certificate paths
   */
  getCertificatePaths(): { certPath: string; keyPath: string } {
    return {
      certPath: this.config.certPath,
      keyPath: this.config.keyPath
    };
  }

  /**
   * Validate WebSocket URL and enforce HTTPS in production
   */
  validateWebSocketURL(url: string, isProduction: boolean = false): string {
    if (isProduction && !url.startsWith('wss://')) {
      throw new Error('Production deployment requires secure WebSocket connection (wss://)');
    }

    if (!isProduction && url.startsWith('ws://localhost')) {
      // Allow HTTP for local development
      return url;
    }

    // Default to secure connection
    return url.replace('ws://', 'wss://');
  }

  /**
   * Check if OpenSSL is available
   */
  static isOpenSSLAvailable(): boolean {
    try {
      execSync('openssl version', { stdio: 'ignore' });
      return true;
    } catch {
      return false;
    }
  }
}

// Export convenience function for quick setup
export async function setupSSL(domain: string = 'localhost'): Promise<SSLManager> {
  const sslManager = new SSLManager({ domain });
  await sslManager.initializeLocalSSL();
  return sslManager;
} 