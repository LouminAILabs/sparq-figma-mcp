# Quick Deployment Reference - SPARQ Figma MCP

## 🚀 **RAPID DEPLOYMENT CHECKLIST**

### **⚡ 1-MINUTE DEPLOYMENT**
```powershell
# 1. Build & Test
cd "L:\_DEV_C3P03_PG_MAIN\_DEV.PROJ_Figma-MCPs_ALL_MAIN"
bun install && bun test && bun run build

# 2. Configure Cursor MCP
# Add to %APPDATA%\Cursor\User\settings.json:
```

```json
{
  "mcp": {
    "mcpServers": {
      "sparq-figma-mcp": {
        "command": "node",
        "args": ["L:\\_DEV_C3P03_PG_MAIN\\_DEV.PROJ_Figma-MCPs_ALL_MAIN\\dist\\mcp-server.js"],
        "env": {"NODE_ENV": "production", "MCP_SECURE_BRIDGE": "true"}
      }
    }
  }
}
```

```powershell
# 3. Restart Cursor
Get-Process "Cursor" | Stop-Process -Force; Start-Sleep 3; Start-Process "cursor"

# 4. Install Figma Plugin
# Figma Desktop > Plugins > Development > Import plugin from manifest
# Select: dist\figma-plugin\manifest.json
```

---

## **🔍 INSTANT VERIFICATION**

### **Security Check (30 seconds)**
```powershell
# ✅ Zero network exposure
netstat -an | Select-String "3055" | Measure-Object | ForEach-Object {Write-Host "Port 3055 References: $($_.Count)" -ForegroundColor $(if($_.Count -eq 0){"Green"}else{"Red"})}

# ✅ Tests passing
bun test | Select-String "passing|failing"

# ✅ Bridge active
cd dist; node -e "require('./embedded-communication.js').initializeSecureBridge().then(()=>console.log('✅ Bridge OK')).catch(console.error)"
```

### **Functional Test (60 seconds)**
```powershell
# In Cursor Command Palette (Ctrl+Shift+P):
# 1. @sparq-figma-mcp list_tools
# 2. @sparq-figma-mcp health_check
# 3. @sparq-figma-mcp get_figma_status
```

---

## **⚠️ CRITICAL SUCCESS INDICATORS**

| Component | Expected Status | Failure Action |
|-----------|----------------|----------------|
| Tests | `81/81 passing` | Run `bun install` |
| Network | `0 ports exposed` | Check for WebSocket refs |
| Bridge | `SecureEmbeddedBridge OK` | Rebuild embedded-communication |
| MCP | `42+ tools available` | Restart Cursor IDE |
| Plugin | `Loads in Figma Desktop` | Re-import manifest |

---

## **🔧 EMERGENCY TROUBLESHOOTING**

### **MCP Not Responding**
```powershell
# Reset Cursor MCP configuration
$settings = "$env:APPDATA\Cursor\User\settings.json"
$backup = $settings + ".emergency.backup"
Copy-Item $settings $backup
# Manually edit settings.json to fix MCP config
```

### **Bridge Connection Failed**
```powershell
# Rebuild embedded bridge
cd src && node -c embedded-communication.ts
bun run build
```

### **Figma Plugin Issues**
```powershell
# Verify plugin files
ls dist\figma-plugin\*.* | Format-Table Name, Length
# Re-import in Figma Desktop if files exist
```

---

## **📊 SUCCESS METRICS**

**✅ DEPLOYMENT SUCCESSFUL IF:**
- All 81 tests pass
- Zero port 3055 references
- MCP server responds in Cursor
- Figma plugin loads without errors
- End-to-end workflow completes

**🎉 PRODUCTION READY STATUS ACHIEVED**

---

*Use this reference for rapid deployment and immediate verification of the SPARQ Figma MCP plugin secure architecture.* 