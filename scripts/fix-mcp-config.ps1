# Fix Corrupted MCP Configuration and Add TalkToFigma
# PowerShell script to restore proper MCP configuration

$mcpConfigPath = "~\.cursor\mcp.json"

$mcpConfig = @{
    mcpServers = @{
        "brave-search" = @{
            command = "npx"
            args = @("-y", "@modelcontextprotocol/server-brave-search")
            env = @{
                BRAVE_API_KEY = "BSAMv5dBDuN1zMviJJP3mgh-2h68yec"
            }
        }
        "tavily" = @{
            command = "bunx"
            args = @("-y", "tavily-mcp")
            env = @{
                TAVILY_API_KEY = "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"
            }
        }
        "taskmaster-ai" = @{
            command = "npx"
            args = @("-y", "task-master-mcp")
            env = @{
                ANTHROPIC_API_KEY = "sk-ant-api03-dQNOxw16RgV9f1MN58SMd8rln4QkgwjZKowIsl-0wRj9Rg2FAKFl_3md_qaNRXJhfaosc9l4ni-zEpRxXTZ7uNg--ERjvAAA"
                PERPLEXITY_API_KEY = "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"
                MODEL = "claude-3-7-sonnet-20250219"
                PERPLEXITY_MODEL = "sonar-pro"
                MAX_TOKENS = "64000"
                TEMPERATURE = "0.2"
                DEFAULT_SUBTASKS = "5"
                DEFAULT_PRIORITY = "medium"
            }
        }
        "context7" = @{
            command = "cmd"
            args = @("/c", "bunx -y @upstash/context7-mcp")
        }
        "TalkToFigma" = @{
            command = "bunx"
            args = @("sparq-figma-mcp-dev")
        }
    }
    autoStart = $true
    maxInstances = 6
    windowArrangement = "grid"
    logging = @{
        level = "info"
        file = "cursor-mcp.log"
    }
}

# Convert to JSON and save
$mcpConfig | ConvertTo-Json -Depth 10 | Set-Content $mcpConfigPath

Write-Host "✅ MCP configuration restored and TalkToFigma added" -ForegroundColor Green
Write-Host "📍 Location: $mcpConfigPath" -ForegroundColor Cyan
Write-Host "🔧 Entry: TalkToFigma -> sparq-figma-mcp-dev" -ForegroundColor Yellow 