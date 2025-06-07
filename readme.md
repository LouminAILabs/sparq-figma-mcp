# 🚀 SPARQ Figma MCP

**Secure Model Context Protocol server for Figma-Cursor AI integration**

[![NPM Version](https://img.shields.io/npm/v/sparq-figma-mcp)](https://www.npmjs.com/package/sparq-figma-mcp)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![GitHub](https://img.shields.io/badge/GitHub-LouminAILabs%2Fsparq--figma--mcp-blue)](https://github.com/LouminAILabs/sparq-figma-mcp)

Developed by **[LouminAI Labs](https://github.com/LouminAILabs)** - *R&D for Human-AI Enablement*

---

## 🎯 **What is SPARQ Figma MCP?**

SPARQ is a secure, zero-network-exposure MCP (Model Context Protocol) server that enables **Cursor AI** to communicate directly with **Figma** for AI-assisted design operations. Built with enterprise-grade security and modern architecture principles.

### **🔒 Security-First Architecture**
- **Zero External Network Exposure**: No ports, no WebSockets, no attack surfaces
- **Encrypted IPC Communication**: All data transmission is secured
- **Embedded Bridge Technology**: Direct process communication without network vulnerabilities
- **Session-based Authentication**: Secure, time-limited connections

### **⚡ Key Features**
- 🎨 **40+ Design Tools** via MCP protocol
- 🚀 **Works in all Figma modes**: Design, FigJam, and Dev Mode
- ⚡ **Real-time document manipulation** 
- 🛡️ **Enterprise-grade security**
- 🔧 **Hyper-modular architecture**
- 📦 **Zero-configuration setup**

---

## 📦 **Quick Installation**

### ⚠️ **IMPORTANT: Project-Level Configuration Recommended**

Due to the high number of available MCP tools (40+ design tools), it's **HIGHLY RECOMMENDED** to use **project-level MCP configuration** rather than global Cursor settings to avoid tool limit conflicts.

**Configure per-project**: `{WORKSPACE-ROOT}\.cursor\mcp.json` ✅  
**Avoid global config**: `~/.cursor/mcp.json` ❌

### **Option 1: Bunx + Project Configuration (Recommended - Fastest)**

```bash
# No installation required - bunx runs latest version with best performance
# {WORKSPACE-ROOT}\.cursor\mcp.json
{
  "mcpServers": {
    "sparq-figma-mcp": {
      "command": "bunx",
      "args": ["sparq-figma-mcp@latest"],
      "env": {
        "NODE_ENV": "production"
      }
    }
  }
}
```

### **Option 2: NPX + Project Configuration (Universal)**

```bash
# No installation required - npx works with any npm installation
# {WORKSPACE-ROOT}\.cursor\mcp.json
{
  "mcpServers": {
    "sparq-figma-mcp": {
      "command": "npx",
      "args": ["sparq-figma-mcp@latest"],
      "env": {
        "NODE_ENV": "production"
      }
    }
  }
}
```

### **Option 3: Global Installation + Project Configuration**

```bash
# Install the MCP server globally
npm install -g sparq-figma-mcp@latest

# Add to your PROJECT-LEVEL Cursor MCP configuration
# {WORKSPACE-ROOT}\.cursor\mcp.json
{
  "mcpServers": {
    "sparq-figma-mcp": {
      "command": "sparq-figma-mcp@latest",
      "env": {
        "NODE_ENV": "production"
      }
    }
  }
}
```

> 💡 **Why Project-Level?** Most AI models have ~40 tool limits. SPARQ provides 40+ design tools - using project-level configuration prevents conflicts with other MCPs and future user-customizable tool profiles.

---

## 🎮 **Usage**

### **1. Install the Figma Plugin**

1. Download the plugin from: `dist/figma-plugin/package/`
2. In Figma Desktop: `Plugins` → `Development` → `Import plugin from manifest...`
3. Select the `manifest.json` file
4. Plugin appears as "SPARQ Figma MCP Plugin"

### **2. Connect to Cursor AI**

1. Open the plugin: `Plugins` → `Development` → `SPARQ Figma MCP Plugin` → `Connect to Cursor AI`
2. Plugin automatically establishes secure embedded bridge
3. Copy the MCP configuration to your `~/.cursor/mcp.json`
4. Restart Cursor to load the MCP server

### **3. AI-Powered Design Operations**

Once connected, use Cursor AI to:

```
// Example AI commands you can use in Cursor:
"Create a red rectangle in Figma"
"Change the selected element's fill color to blue"
"Read the current Figma selection and describe the design"
"Move all text elements 10px to the right"
"Create a responsive button component"
```

---

## 🛠️ **Available MCP Tools**

SPARQ provides 40+ tools for comprehensive Figma manipulation:

### **Document Operations**
- `get_document_info` - Get current document details
- `get_selection` - Read current selection
- `read_my_design` - Comprehensive design analysis

### **Node Management**
- `create_rectangle`, `create_frame`, `create_text` - Create design elements
- `move_node`, `resize_node`, `delete_node` - Manipulate elements
- `clone_node` - Duplicate elements

### **Styling & Properties**
- `set_fill_color`, `set_stroke_color` - Color management
- `set_corner_radius` - Border radius control
- `set_text_content` - Text manipulation

### **Layout & Auto Layout**
- `set_layout_mode` - Configure auto layout
- `set_padding`, `set_axis_align` - Layout controls
- `set_layout_sizing` - Responsive behavior

### **Advanced Features**
- `scan_text_nodes` - Text content analysis
- `get_annotations`, `set_annotation` - Comment management
- `create_connections` - Connector tools

---

## 🏗️ **Architecture**

### **Secure Embedded Bridge**
```
Cursor AI ←→ MCP Server ←→ Embedded Bridge ←→ Figma Plugin
```

- **No Network Exposure**: All communication via secure IPC
- **Encrypted Channels**: Data protection at transport layer
- **Session Management**: Time-limited, authenticated connections
- **Error Boundaries**: Graceful failure handling

### **Technology Stack**
- **MCP Protocol**: Industry-standard AI-tool communication
- **TypeScript**: Type-safe development
- **Bun Runtime**: High-performance JavaScript runtime
- **IPC Communications**: Zero-network security model

---

## 📋 **Requirements**

- **Figma Desktop**: Latest version recommended
- **Cursor IDE**: With MCP support enabled
- **Node.js**: 16.0.0 or higher (for NPM installation)
- **Operating System**: Windows, macOS, or Linux

---

## 🚀 **Development**

### **Building from Source**

```bash
# Clone the repository
git clone https://github.com/LouminAILabs/sparq-figma-mcp.git
cd sparq-figma-mcp

# Install dependencies
npm install

# Build the project
npm run build

# Run tests
npm test

# Package the Figma plugin
npm run package:plugin
```

### **Project Structure**
```
sparq-figma-mcp/
├── src/
│   ├── talk_to_figma_mcp/     # MCP server implementation
│   ├── cursor_mcp_plugin/     # Figma plugin source
│   └── embedded-communication.ts # Secure bridge
├── dist/
│   ├── server.js              # Compiled MCP server
│   └── figma-plugin/          # Packaged plugin
└── tests/                     # Test suites
```

---

## 🤝 **Contributing**

We welcome contributions from the community! 

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

### **Development Guidelines**
- Follow TypeScript best practices
- Maintain test coverage above 80%
- Use conventional commit messages
- Test security implications of changes

---

## 📜 **License**

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 **Credits & Attribution**

**Developed by**: [LouminAI Labs](https://github.com/LouminAILabs) - *R&D for Human-AI Enablement*

**Inspiration**: This project was inspired by the Figma plugin development community. Special thanks to [Sonny Lazuardi](https://github.com/sonnylazuardi) for early plugin development patterns that influenced this architecture.

**Core Technologies**: Built on the Model Context Protocol (MCP) standard and leverages the Figma Plugin API.

---

## 🔗 **Links**

- **🏠 Homepage**: [https://louminai.com](https://louminai.com)
- **📧 Support**: [support@louminai.com](mailto:support@louminai.com)
- **🐙 GitHub**: [https://github.com/LouminAILabs/sparq-figma-mcp](https://github.com/LouminAILabs/sparq-figma-mcp)
- **📦 NPM**: [https://www.npmjs.com/package/sparq-figma-mcp](https://www.npmjs.com/package/sparq-figma-mcp)
- **🐦 Twitter**: [@LouminAI_Labs](https://twitter.com/LouminAI_Labs)

---

*Made with ❤️ by the LouminAI Labs team*
