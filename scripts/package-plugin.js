#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Simple Figma Plugin Packaging Script
 * Creates installation bundle for local Figma Desktop deployment
 */

class FigmaPluginPackager {
  constructor() {
    const projectRoot = path.dirname(__dirname);
    this.sourceDir = path.join(projectRoot, 'src', 'cursor_mcp_plugin');
    this.outputDir = path.join(projectRoot, 'dist', 'figma-plugin');
    this.packageDir = path.join(this.outputDir, 'package');
    this.version = '1.0.0';
  }

  async package() {
    console.log('🚀 Starting Figma Plugin Packaging...');
    
    try {
      this.validateSource();
      this.prepareDirectories();
      this.copyPluginFiles();
      this.createInstallationFiles();
      
      console.log('✅ Figma Plugin packaging completed successfully!');
      this.printSummary();
    } catch (error) {
      console.error('❌ Packaging failed:', error.message);
      process.exit(1);
    }
  }

  validateSource() {
    console.log('📋 Validating source files...');
    
    const requiredFiles = ['manifest.json', 'code.js', 'ui.html'];
    
    for (const file of requiredFiles) {
      const filePath = path.join(this.sourceDir, file);
      if (!fs.existsSync(filePath)) {
        throw new Error(`Required file not found: ${filePath}`);
      }
    }
    
    console.log('✅ Source validation complete');
  }

  prepareDirectories() {
    console.log('📁 Preparing output directories...');
    
    if (fs.existsSync(this.outputDir)) {
      fs.rmSync(this.outputDir, { recursive: true, force: true });
    }
    
    fs.mkdirSync(this.packageDir, { recursive: true });
    console.log('✅ Directories prepared');
  }

  copyPluginFiles() {
    console.log('📋 Copying plugin files...');
    
    const filesToCopy = ['manifest.json', 'code.js', 'ui.html', 'setcharacters.js'];
    let copiedCount = 0;
    
    for (const file of filesToCopy) {
      const sourcePath = path.join(this.sourceDir, file);
      const destPath = path.join(this.packageDir, file);
      
      if (fs.existsSync(sourcePath)) {
        fs.copyFileSync(sourcePath, destPath);
        copiedCount++;
        console.log(`  ✅ Copied: ${file}`);
      } else {
        console.log(`  ⚠️  Optional file not found: ${file}`);
      }
    }
    
    console.log(`✅ Copied ${copiedCount} plugin files`);
  }

  createInstallationFiles() {
    console.log('📦 Creating installation files...');
    
    // Create package.json
    const pluginPackageJson = {
      name: "cursor-mcp-plugin",
      version: this.version,
      description: "Cursor MCP Plugin for Figma - Local Installation Bundle",
      main: "code.js",
      ui: "ui.html",
      type: "figma-plugin",
      keywords: ["figma", "plugin", "cursor", "mcp", "ai", "design"],
      author: "Figma MCP Team",
      license: "MIT"
    };

    fs.writeFileSync(
      path.join(this.packageDir, 'package.json'),
      JSON.stringify(pluginPackageJson, null, 2)
    );

    // Create installation instructions
    const instructions = `# Cursor MCP Plugin - Installation Guide

## Quick Setup

### Step 1: Install Plugin in Figma Desktop
1. Open Figma Desktop
2. Go to Plugins → Development → Import plugin from manifest...
3. Select the \`manifest.json\` file from this directory
4. Click "Import"

### Step 2: Configure MCP Server
1. Install: \`npm install -g sparq-figma-mcp\`
2. Add to PROJECT-LEVEL \`{WORKSPACE-ROOT}\\.cursor\\mcp.json\`:
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

### Step 3: Use the Plugin
1. Open the plugin: Plugins → Development → SPARQ Figma MCP Plugin
2. Click "Connect to Cursor AI" to activate secure embedded bridge
3. Start designing with AI assistance through Cursor!

## Files in this package:
- \`manifest.json\` - Plugin configuration
- \`code.js\` - Main plugin logic with embedded bridge
- \`ui.html\` - Plugin user interface with security warnings
- \`setcharacters.js\` - Additional functionality
- \`package.json\` - Package metadata

## Security Features:
- 🔒 Zero external network exposure (no ports)
- 🛡️ Secure embedded bridge architecture
- ⚡ Encrypted IPC communication only
- 🚀 40+ AI design tools via MCP protocol

For detailed setup instructions, see the main project README.

**Version**: ${this.version}  
**Build Date**: ${new Date().toISOString()}
`;

    fs.writeFileSync(path.join(this.packageDir, 'README.md'), instructions);
    
    // Create setup script
    const setupScript = `@echo off
echo 🚀 Cursor MCP Plugin - Quick Setup
echo ==================================
echo.
echo Plugin files are ready in this directory
echo.
echo Next steps:
echo 1. Open Figma Desktop
echo 2. Go to Plugins → Development → Import plugin from manifest...
echo 3. Select manifest.json from this directory
echo 4. Start MCP server with: bun run start
echo.
echo See README.md for detailed instructions
pause`;

    fs.writeFileSync(path.join(this.packageDir, 'setup.bat'), setupScript);
    
    console.log('✅ Installation files created');
  }

  printSummary() {
    console.log('\n📋 PACKAGING SUMMARY');
    console.log('===================');
    console.log(`Plugin: Cursor MCP Plugin v${this.version}`);
    console.log(`Package: ${this.packageDir}`);
    console.log('');
    console.log('📦 Ready for Installation:');
    console.log('1. Import manifest.json into Figma Desktop');
    console.log('2. Start MCP server');
    console.log('3. See README.md for setup guide');
    console.log('');
    console.log('🎉 Plugin packaging complete!');
  }
}

// Run the packager
const packager = new FigmaPluginPackager();
packager.package(); 