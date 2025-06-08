# 🚀 SPARQ Figma MCP Plugin

[![npm version](https://badge.fury.io/js/sparq-figma-mcp.svg)](https://badge.fury.io/js/sparq-figma-mcp)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

**Secure embedded bridge for Cursor IDE to Figma integration with zero network exposure and encrypted IPC communication.**

## 🌟 Features

- **🔒 Zero Network Exposure**: No ports, no WebSockets, no attack surfaces
- **🔐 Encrypted IPC Communication**: SecureEmbeddedBridge with session-based security
- **⚡ Lightning Fast**: Direct embedded bridge communication
- **🎨 Full Figma API Access**: 42+ MCP tools for complete design automation
- **🧪 Production Ready**: 81/81 tests passing, comprehensive error handling
- **📱 Cursor IDE Integration**: Seamless MCP (Model Context Protocol) integration

## 🚀 Quick Installation

```bash
# Install via npm
npm install -g sparq-figma-mcp

# Or install locally
npm install sparq-figma-mcp
```

## ⚡ Quick Start

### 1. Configure Cursor IDE

Add to your Cursor `settings.json`:

```json
{
  "mcp": {
    "mcpServers": {
      "sparq-figma-mcp": {
        "command": "node",
        "args": ["path/to/node_modules/sparq-figma-mcp/dist/server.js"],
        "env": {
          "NODE_ENV": "production",
          "MCP_SECURE_BRIDGE": "true"
        }
      }
    }
  }
}
```

### 2. Install Figma Plugin

```bash
# Package the Figma plugin
npx sparq-figma-mcp package:plugin

# Import dist/figma-plugin/manifest.json into Figma Desktop
```

### 3. Start Using

In Cursor IDE:
```
@sparq-figma-mcp get_figma_status
@sparq-figma-mcp create_rectangle --width 100 --height 100
@sparq-figma-mcp get_current_page
```

## 🛠 Available MCP Tools

### Design Operations
- `create_rectangle`, `create_frame`, `create_text`
- `set_fill_color`, `set_stroke_color`, `set_corner_radius`
- `move_node`, `resize_node`, `clone_node`
- `delete_node`, `delete_multiple_nodes`

### Information Retrieval
- `get_document_info`, `get_current_page`
- `get_selection`, `get_node_info`, `get_nodes_info`
- `scan_text_nodes`, `scan_nodes_by_types`

### Component Management
- `get_local_components`, `create_component_instance`
- `get_instance_overrides`, `set_instance_overrides`

### Advanced Features
- `export_node_as_image`, `get_reactions`
- `set_annotations`, `get_annotations`
- `create_connections`, `join_channel`

## 🏗 Architecture

```
Cursor IDE ↔ MCP Server ↔ SecureEmbeddedBridge ↔ Figma Plugin ↔ Figma API
```

- **No Network Traffic**: All communication via encrypted IPC
- **Session Security**: Unique session identifiers and encrypted channels
- **Graceful Error Handling**: Comprehensive error recovery and reporting

## 📋 Requirements

- **Node.js**: 18.0.0 or higher
- **Cursor IDE**: Latest version with MCP support
- **Figma Desktop**: Required (browser version not supported)

## 🧪 Development & Testing

```bash
# Clone repository
git clone https://github.com/LouminAILabs/sparq-figma-mcp.git
cd sparq-figma-mcp

# Install dependencies
npm install

# Run tests
npm test

# Build production artifacts
npm run build

# Package Figma plugin
npm run package:plugin
```

## 📖 Documentation

- **[Quick Deployment Reference](./QUICK_DEPLOYMENT_REFERENCE.md)** - 1-minute setup guide
- **[UAT Deployment Guide](./UAT_DEPLOYMENT_GUIDE.md)** - Comprehensive testing procedures
- **[API Documentation](./docs/)** - Detailed MCP tool documentation

## 🔐 Security

### Zero Attack Surface
- ❌ No WebSocket servers
- ❌ No hardcoded ports (3055 eliminated)
- ❌ No external network dependencies
- ✅ Encrypted IPC-only communication
- ✅ Session-based security protocols

### Security Validation
```bash
# Confirm zero network exposure
netstat -an | grep "3055"
# Should return: NO results
```

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Run tests (`npm test`)
4. Commit changes (`git commit -m 'Add amazing feature'`)
5. Push to branch (`git push origin feature/amazing-feature`)
6. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built on [Model Context Protocol (MCP)](https://modelcontextprotocol.io/)
- Integrates with [Cursor IDE](https://cursor.sh/)
- Powers [Figma](https://figma.com/) design automation

## 🚀 What's Next

- [ ] VS Code extension support
- [ ] Advanced component library management
- [ ] Design system automation
- [ ] Team collaboration features

---

**Made with ❤️ by [LouminAI Labs](https://github.com/LouminAILabs)**
