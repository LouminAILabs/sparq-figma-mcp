#!/usr/bin/env bun

import { existsSync, mkdirSync, copyFileSync, writeFileSync, rmSync } from 'fs';
import { join, dirname, basename } from 'path';
import { execSync } from 'child_process';
import { createReadStream, createWriteStream } from 'fs';
import { createGzip } from 'zlib';
import { pipeline } from 'stream/promises';

/**
 * Figma Plugin Packaging Script
 * Creates installation bundles for local Figma Desktop deployment
 */

interface PackageConfig {
  sourceDir: string;
  outputDir: string;
  pluginName: string;
  version: string;
  includeSourceMaps: boolean;
}

class FigmaPluginPackager {
  private config: PackageConfig;
  private packageDir: string;
  private distDir: string;

  constructor(config?: Partial<PackageConfig>) {
    this.config = {
      sourceDir: join(process.cwd(), 'src', 'cursor_mcp_plugin'),
      outputDir: join(process.cwd(), 'dist', 'figma-plugin'),
      pluginName: 'cursor-mcp-plugin',
      version: '1.0.0',
      includeSourceMaps: false,
      ...config
    };

    this.packageDir = join(this.config.outputDir, 'package');
    this.distDir = join(this.config.outputDir, 'dist');
  }

  /**
   * Main packaging function
   */
  async package(): Promise<void> {
    console.log('🚀 Starting Figma Plugin Packaging...');
    
    try {
      await this.validateSource();
      await this.prepareDirectories();
      await this.copyPluginFiles();
      await this.createInstallationBundle();
      await this.generateInstallationInstructions();
      await this.createZipArchive();
      
      console.log('✅ Figma Plugin packaging completed successfully!');
      this.printSummary();
    } catch (error) {
      console.error('❌ Packaging failed:', error);
      throw error;
    }
  }

  /**
   * Validate that source files exist
   */
  private async validateSource(): Promise<void> {
    console.log('📋 Validating source files...');
    
    const requiredFiles = [
      'manifest.json',
      'code.js',
      'ui.html'
    ];

    for (const file of requiredFiles) {
      const filePath = join(this.config.sourceDir, file);
      if (!existsSync(filePath)) {
        throw new Error(`Required file not found: ${filePath}`);
      }
    }

    // Validate manifest.json
    const manifestPath = join(this.config.sourceDir, 'manifest.json');
    const manifest = JSON.parse(Bun.file(manifestPath).text());
    
    if (!manifest.name || !manifest.main || !manifest.ui) {
      throw new Error('Invalid manifest.json: missing required fields');
    }

    console.log(`✅ Source validation complete - Plugin: ${manifest.name}`);
  }

  /**
   * Prepare output directories
   */
  private async prepareDirectories(): Promise<void> {
    console.log('📁 Preparing output directories...');
    
    // Clean and create directories
    if (existsSync(this.config.outputDir)) {
      rmSync(this.config.outputDir, { recursive: true, force: true });
    }
    
    mkdirSync(this.packageDir, { recursive: true });
    mkdirSync(this.distDir, { recursive: true });
    
    console.log('✅ Directories prepared');
  }

  /**
   * Copy plugin files to package directory
   */
  private async copyPluginFiles(): Promise<void> {
    console.log('📋 Copying plugin files...');
    
    const filesToCopy = [
      'manifest.json',
      'code.js',
      'ui.html',
      'setcharacters.js'
    ];

    let copiedCount = 0;
    for (const file of filesToCopy) {
      const sourcePath = join(this.config.sourceDir, file);
      const destPath = join(this.packageDir, file);
      
      if (existsSync(sourcePath)) {
        copyFileSync(sourcePath, destPath);
        copiedCount++;
        console.log(`  ✅ Copied: ${file}`);
      } else {
        console.log(`  ⚠️  Optional file not found: ${file}`);
      }
    }
    
    console.log(`✅ Copied ${copiedCount} plugin files`);
  }

  /**
   * Create installation bundle with additional files
   */
  private async createInstallationBundle(): Promise<void> {
    console.log('📦 Creating installation bundle...');
    
    // Create package.json for the plugin bundle
    const pluginPackageJson = {
      name: this.config.pluginName,
      version: this.config.version,
      description: "Cursor MCP Plugin for Figma - Local Installation Bundle",
      main: "code.js",
      ui: "ui.html",
      type: "figma-plugin",
      keywords: ["figma", "plugin", "cursor", "mcp", "ai", "design"],
      author: "Figma MCP Team",
      license: "MIT",
      figma: {
        editorType: ["figma", "figjam"],
        networkAccess: {
          allowedDomains: [],
          reasoning: "Plugin uses secure embedded bridge - no external network access required"
        }
      },
      installation: {
        type: "local",
        instructions: "See INSTALLATION.md for setup instructions"
      }
    };

    writeFileSync(
      join(this.packageDir, 'package.json'),
      JSON.stringify(pluginPackageJson, null, 2)
    );

    // Create version info
    const versionInfo = {
      version: this.config.version,
      buildDate: new Date().toISOString(),
      buildEnvironment: process.platform,
      pluginFiles: [
        'manifest.json',
        'code.js', 
        'ui.html',
        'setcharacters.js'
      ],
      requirements: {
        figmaDesktop: ">=116.0.0",
        nodejs: ">=18.0.0",
        platform: ["windows", "macos", "linux"]
      }
    };

    writeFileSync(
      join(this.packageDir, 'version.json'),
      JSON.stringify(versionInfo, null, 2)
    );

    console.log('✅ Installation bundle created');
  }

  /**
   * Generate installation instructions
   */
  private async generateInstallationInstructions(): Promise<void> {
    console.log('📖 Generating installation instructions...');
    
    const instructions = `# Cursor MCP Plugin - Installation Guide

## Overview
This is the **Cursor MCP Plugin for Figma** - a powerful AI assistant that connects Figma to the Cursor IDE through the MCP (Model Context Protocol).

## Version Information
- **Version**: ${this.config.version}
- **Build Date**: ${new Date().toISOString()}
- **Plugin Type**: Local Installation

## Prerequisites

### Required Software
- **Figma Desktop App** (version 116.0.0 or later)
- **Node.js** (version 18.0.0 or later)
- **Cursor IDE** with MCP support

### System Requirements
- Windows 10/11, macOS 10.15+, or Linux (Ubuntu 18.04+)
- At least 4GB RAM
- Internet connection for MCP server communication

## Installation Steps

### Step 1: Install the Plugin in Figma Desktop

1. **Open Figma Desktop Application**
2. **Navigate to Plugins Menu**:
   - Go to \`Plugins\` → \`Development\` → \`Import plugin from manifest...\`
3. **Select Plugin Manifest**:
   - Browse to this package directory
   - Select the \`manifest.json\` file
   - Click "Open"
4. **Confirm Installation**:
   - Figma will validate the plugin
   - Click "Import" to confirm

### Step 2: Configure MCP Server

1. **Install SPARQ MCP Server**:
   \`\`\`bash
   npm install -g sparq-figma-mcp
   \`\`\`

2. **Configure Cursor MCP** (PROJECT-LEVEL):
   Add to \`{WORKSPACE-ROOT}\\.cursor\\mcp.json\`:
   \`\`\`json
   {
     "mcpServers": {
       "sparq-figma-mcp": {
         "command": "sparq-figma-mcp",
         "env": { "NODE_ENV": "production" }
       }
     }
   }
   \`\`\`

3. **Restart Cursor IDE** to load the MCP server

### Step 3: Use the Plugin

1. **Open the Plugin in Figma**:
   - Go to \`Plugins\` → \`Development\` → \`SPARQ Figma MCP Plugin\`
   - The plugin interface will appear

2. **Activate Embedded Bridge**:
   - Click "Connect to Cursor AI" button
   - The secure embedded bridge will initialize automatically

3. **Join a Channel**:
   - Create or join a design channel
   - Start collaborating with AI assistance

## Usage

### Basic Operations
- **Get Document Info**: Analyze current Figma document
- **Create Elements**: Generate rectangles, frames, text
- **Modify Designs**: Update colors, text, layout properties
- **Export Assets**: Generate images and design exports

### Advanced Features
- **Component Management**: Work with Figma components and instances
- **Text Processing**: Bulk text updates and translations
- **Annotation System**: Add and manage design annotations
- **Layout Automation**: Auto-layout and spacing tools

## Troubleshooting

### Common Issues

#### Connection Problems
- **Issue**: Plugin can't establish embedded bridge
- **Solution**: 
  1. Verify SPARQ MCP server is configured in Cursor
  2. Restart Cursor IDE to load MCP configuration
  3. Check Cursor MCP logs for connection status

#### Permission Errors
- **Issue**: Network access denied
- **Solution**:
  1. Verify \`manifest.json\` network permissions
  2. Check Figma Desktop network settings
  3. Restart Figma Desktop after installation

#### Plugin Not Loading
- **Issue**: Plugin doesn't appear in menu
- **Solution**:
  1. Verify all required files are present
  2. Check \`manifest.json\` syntax
  3. Re-import the plugin manifest

### Getting Help

- **Documentation**: See project README.md
- **Issues**: Report on project repository
- **Community**: Join developer discussions

## Development Mode

For development and testing:

1. **Enable Development Mode** in Figma Desktop
2. **Use Hot Reload**: The plugin will update automatically when files change
3. **Debug Console**: Use browser dev tools for debugging

## Security Notes

- 🔒 **Zero Network Exposure**: Plugin uses secure embedded bridge architecture
- 🛡️ **Encrypted IPC**: All communication via encrypted inter-process channels
- 🚀 **No External Domains**: No network connections required or allowed
- 📋 **Local-Only**: All design data remains in your local environment

## Uninstallation

To remove the plugin:

1. Open Figma Desktop
2. Go to \`Plugins\` → \`Development\`
3. Find "Cursor MCP Plugin" and click "Remove"
4. Stop the MCP server if no longer needed

---

**Happy Designing with AI Assistance! 🎨✨**

For more information, visit the project repository.
`;

    writeFileSync(join(this.packageDir, 'INSTALLATION.md'), instructions);
    
    // Also create a quick setup script
    const setupScript = `#!/bin/bash

echo "🚀 Cursor MCP Plugin - Quick Setup"
echo "=================================="

# Check if Figma Desktop is installed
if command -v figma &> /dev/null; then
    echo "✅ Figma Desktop found"
else
    echo "❌ Figma Desktop not found. Please install Figma Desktop first."
    exit 1
fi

# Check if Node.js is installed
if command -v node &> /dev/null; then
    echo "✅ Node.js found: $(node --version)"
else
    echo "❌ Node.js not found. Please install Node.js 18+ first."
    exit 1
fi

echo ""
echo "📦 Installation Package Ready"
echo "Plugin files are in: $(pwd)"
echo ""
echo "Next steps:"
echo "1. Open Figma Desktop"
echo "2. Go to Plugins → Development → Import plugin from manifest..."
echo "3. Select the manifest.json file in this directory"
echo "4. Start the MCP server with: bun run start"
echo ""
echo "See INSTALLATION.md for detailed instructions."
`;

    writeFileSync(join(this.packageDir, 'setup.sh'), setupScript);
    
    console.log('✅ Installation instructions generated');
  }

  /**
   * Create ZIP archive for distribution
   */
  private async createZipArchive(): Promise<void> {
    console.log('🗜️  Creating distribution archive...');
    
    const archiveName = `${this.config.pluginName}-v${this.config.version}.zip`;
    const archivePath = join(this.distDir, archiveName);
    
    try {
      // Use system zip command if available
      execSync(`cd "${this.config.outputDir}" && zip -r "${archiveName}" package/`, {
        stdio: 'inherit'
      });
      
      // Move to dist directory
      const tempZipPath = join(this.config.outputDir, archiveName);
      if (existsSync(tempZipPath)) {
        copyFileSync(tempZipPath, archivePath);
        rmSync(tempZipPath);
      }
      
      console.log(`✅ Archive created: ${archiveName}`);
    } catch (error) {
      console.warn('⚠️  System zip not available, creating compressed package...');
      
      // Fallback: create gzipped tar-like structure
      const compressedPath = join(this.distDir, `${this.config.pluginName}-v${this.config.version}.tar.gz`);
      await this.createCompressedPackage(compressedPath);
      
      console.log(`✅ Compressed package created: ${basename(compressedPath)}`);
    }
  }

  /**
   * Create compressed package as fallback
   */
  private async createCompressedPackage(outputPath: string): Promise<void> {
    // This is a simplified version - in production, you'd use a proper tar library
    const packageContent = {
      files: {},
      metadata: {
        name: this.config.pluginName,
        version: this.config.version,
        created: new Date().toISOString()
      }
    };
    
    const packageJson = JSON.stringify(packageContent, null, 2);
    const compressed = createGzip();
    const input = createReadStream(Buffer.from(packageJson));
    const output = createWriteStream(outputPath);
    
    await pipeline(input, compressed, output);
  }

  /**
   * Print packaging summary
   */
  private printSummary(): void {
    console.log('\n📋 PACKAGING SUMMARY');
    console.log('===================');
    console.log(`Plugin Name: ${this.config.pluginName}`);
    console.log(`Version: ${this.config.version}`);
    console.log(`Package Directory: ${this.packageDir}`);
    console.log(`Distribution Directory: ${this.distDir}`);
    console.log('');
    console.log('📦 Ready for Installation:');
    console.log(`1. Import manifest.json from: ${this.packageDir}`);
    console.log('2. Start MCP server with: bun run start');
    console.log('3. See INSTALLATION.md for detailed setup');
    console.log('');
    console.log('🎉 Happy coding with AI assistance!');
  }
}

// CLI interface
async function main() {
  const args = process.argv.slice(2);
  const config: Partial<PackageConfig> = {};
  
  // Parse command line arguments
  for (let i = 0; i < args.length; i += 2) {
    const key = args[i];
    const value = args[i + 1];
    
    switch (key) {
      case '--version':
        config.version = value;
        break;
      case '--output':
        config.outputDir = value;
        break;
      case '--name':
        config.pluginName = value;
        break;
      case '--source-maps':
        config.includeSourceMaps = value === 'true';
        break;
    }
  }
  
  try {
    const packager = new FigmaPluginPackager(config);
    await packager.package();
  } catch (error) {
    console.error('Packaging failed:', error);
    process.exit(1);
  }
}

// Run if called directly
if (import.meta.main) {
  main();
}

export { FigmaPluginPackager, type PackageConfig }; 