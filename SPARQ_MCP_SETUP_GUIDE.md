# 🚀 SPARQ Figma MCP - Portable Setup Guide

## **📦 Installation Methods**

### **Method 1: NPM Global Installation (Recommended)**
```bash
# Install globally for easy access
npm install -g sparq-figma-mcp

# Configure in Cursor MCP
{
  "mcpServers": {
    "sparq-figma-mcp": {
      "command": "sparq-figma-mcp-server",
      "env": {
        "NODE_ENV": "production"
      }
    }
  }
}
```

### **Method 2: Local Project Installation**
```bash
# Install in project directory
npm install sparq-figma-mcp

# Configure with npx
{
  "mcpServers": {
    "sparq-figma-mcp": {
      "command": "npx",
      "args": ["sparq-figma-mcp-server"],
      "env": {
        "NODE_ENV": "production"
      }
    }
  }
}
```

### **Method 3: Development Setup**
```bash
# Clone repository
git clone https://github.com/your-org/sparq-figma-mcp
cd sparq-figma-mcp
npm install
npm run build

# Configure with relative path
{
  "mcpServers": {
    "sparq-figma-mcp": {
      "command": "node",
      "args": ["./dist/server.js"],
      "cwd": "/path/to/sparq-figma-mcp",
      "env": {
        "NODE_ENV": "production"
      }
    }
  }
}
```

## **🔧 Universal Configuration Template**

The plugin will generate this portable configuration:

```json
{
  "mcpServers": {
    "sparq-figma-mcp": {
      "command": "node",
      "args": ["%SPARQ_MCP_PATH%/dist/server.js"],
      "env": {
        "NODE_ENV": "production",
        "SPARQ_MCP_HOME": "%SPARQ_MCP_PATH%"
      }
    }
  }
}
```

Where `%SPARQ_MCP_PATH%` is automatically detected or user-configured. 