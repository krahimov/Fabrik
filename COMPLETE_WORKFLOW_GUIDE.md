# Complete RAG + API Configuration Workflow

This enhanced MCP server now provides both **RAG chunk processing** with a combined input/output format and **API configuration fetching** to get agent settings and requirements.

## 🚀 New Features

### 1. **Combined Input/Output Format**
The `process_rag_chunks` tool now returns both input and output in a single JSON structure for better tracking and analysis.

### 2. **API Configuration Fetching** 
New `get_agent_config` tool fetches agent configuration from external APIs, including:
- Agent name and description
- Workflow steps and description
- Natural language output format
- RAG chunks
- Expected format of synthetic data
- Number of synthetic records to generate

## 📊 New JSON Format Structure

### RAG Chunk Processing Response
```json
{
  "input": {
    "chunks": [...],
    "context": "mortgage lending requirements",
    "metadata": {
      "chunksProcessed": 3,
      "timestamp": "2025-08-16T19:14:17.434Z"
    }
  },
  "output": {
    "analysis": {
      "topicsIdentified": ["down payment", "credit score", "debt-to-income"],
      "averageScore": 0.873,
      "sources": {
        "uniqueFiles": ["mortgage-guidelines-2024.pdf"],
        "pageRange": { "min": 156, "max": 158 },
        "averageTextLength": 2083
      }
    },
    "syntheticQueries": {
      "broad": [...],
      "specific": [...],
      "questionBased": [...]
    }
  }
}
```

### API Configuration Response
```json
{
  "timestamp": "2025-08-16T19:14:58.285Z",
  "apiUrl": "http://localhost:3002/?agentId=mortgage-agent",
  "agentId": "mortgage-agent",
  "agent": {
    "name": "Mortgage Lending Assistant",
    "description": "AI agent specialized in mortgage lending guidelines..."
  },
  "workflow": {
    "steps": [
      "Analyze input RAG chunks for mortgage-related content",
      "Extract key topics and regulatory requirements",
      "Generate synthetic queries covering different aspects",
      "Format output according to specified requirements"
    ],
    "description": "Multi-step workflow for processing mortgage lending documentation..."
  },
  "output": {
    "naturalLanguageFormat": "Generate natural language questions that a mortgage professional would ask...",
    "expectedFormat": "json",
    "syntheticRecordsCount": 25
  },
  "ragChunks": [...]
}
```

## 🔧 Available Tools

### 1. `process_rag_chunks`
**Description**: Process RAG chunks and generate synthetic queries (enhanced with combined input/output)

**Input**:
```json
{
  "chunks": [
    {
      "score": 0.91,
      "textLength": 2200,
      "fileName": "document.pdf",
      "pageLabel": 156,
      "textPreview": "Content preview..."
    }
  ],
  "context": "optional context string"
}
```

**Output**: Combined input/output JSON structure with metadata, analysis, and synthetic queries.

### 2. `get_agent_config`
**Description**: Fetch agent configuration from external API

**Input**:
```json
{
  "apiUrl": "https://api.example.com/agent-config",
  "agentId": "mortgage-agent",
  "headers": {
    "Authorization": "Bearer token",
    "X-Custom-Header": "value"
  }
}
```

**Output**: Structured configuration with agent info, workflow, output requirements, and RAG chunks.

## 🧪 Testing

### Test New Format
```bash
node test_new_format.js
```

### Test API Configuration 
```bash
node test_api_config.js
```

### Test Complete Workflow
```bash
# Start the mock API server first (in separate terminal)
node mock_api_server.js

# Then run the complete test
node test_complete_workflow.js
```

## 💡 Integration Examples

### 1. Fetch Config and Process Chunks
```javascript
// 1. Get agent configuration
const configRequest = {
  name: 'get_agent_config',
  arguments: {
    apiUrl: 'https://your-api.com/config',
    agentId: 'mortgage-agent'
  }
};

const config = await mcpServer.call(configRequest);

// 2. Process chunks using config data
const processRequest = {
  name: 'process_rag_chunks',
  arguments: {
    chunks: config.ragChunks,
    context: config.agent.description
  }
};

const result = await mcpServer.call(processRequest);

// 3. Use both config and results
const syntheticData = {
  agentInfo: config.agent,
  requirements: {
    format: config.output.expectedFormat,
    recordCount: config.output.syntheticRecordsCount,
    naturalLanguageFormat: config.output.naturalLanguageFormat
  },
  generatedQueries: result.output.syntheticQueries,
  metadata: result.input.metadata
};
```

### 2. Workflow Automation
```javascript
async function generateSyntheticDataset(apiUrl, agentId, customChunks) {
  // Fetch configuration
  const config = await fetchConfig(apiUrl, agentId);
  
  // Use provided chunks or config chunks
  const chunks = customChunks || config.ragChunks;
  
  // Process chunks
  const processed = await processChunks(chunks, config.agent.description);
  
  // Generate final dataset according to requirements
  const dataset = generateDataset(
    processed.output.syntheticQueries,
    config.output.syntheticRecordsCount,
    config.output.expectedFormat
  );
  
  return {
    config: config,
    processing: processed,
    dataset: dataset
  };
}
```

## 🎯 Use Cases

### 1. **Dynamic Agent Configuration**
- Fetch agent-specific settings from centralized API
- Configure processing parameters based on agent type
- Adapt output format to agent requirements

### 2. **Audit Trail & Logging**
- Complete input/output tracking with timestamps
- Full context preservation for debugging
- Metadata for analysis and optimization

### 3. **Scalable Synthetic Data Generation**
- Configure number of records via API
- Standardize output formats across agents
- Centralize workflow definitions

### 4. **Multi-Agent Workflows**
- Different agents with different configurations
- Standardized API interface for all agents
- Consistent data processing pipeline

## 📁 File Structure

```
mcp_boilerplate/
├── src/index.ts                    # Enhanced MCP server
├── build/index.js                  # Compiled server
├── mock_api_server.js              # Test API server
├── test_new_format.js              # Test new JSON format
├── test_api_config.js              # Test API configuration
├── test_complete_workflow.js       # Complete integration test
├── COMPLETE_WORKFLOW_GUIDE.md      # This documentation
└── RAG_CHUNK_PROCESSOR.md          # Original RAG processor docs
```

## 🚀 Next Steps

1. **Deploy API Configuration Service**: Set up your own API that returns agent configurations
2. **Customize Output Formats**: Modify the server to support your specific data formats
3. **Add Authentication**: Implement proper auth headers for production APIs
4. **Scale Processing**: Add batch processing for large datasets
5. **Monitor Performance**: Add logging and metrics for production use

The MCP server is now ready for production use with both local chunk processing and external configuration management! 🎉