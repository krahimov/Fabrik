# RAG Chunk Processor - MCP Server

This MCP server processes RAG (Retrieval-Augmented Generation) chunks and generates synthetic queries that could have retrieved those chunks. This is useful for:

- **Query expansion**: Generate related queries for better search coverage
- **Training data generation**: Create query-document pairs for fine-tuning
- **Testing retrieval quality**: Validate if your RAG system would retrieve relevant content
- **User suggestion prompts**: Suggest related questions to users

## 🚀 Features

### Input
- **RAG Chunks**: Array of retrieved document chunks with scores, metadata, and content
- **Context**: Optional domain context to improve query generation

### Output
- **Analysis**: Topics identified, average scores, source analysis
- **Synthetic Queries**: Three types of generated queries:
  - **Broad queries**: General questions about the topic domain
  - **Specific queries**: Targeted questions based on chunk content
  - **Question-based queries**: Question-formatted queries for various aspects

## 📋 Example Usage

### 1. Basic Test
```bash
npm run build
node test_rag_chunks.js
```

### 2. Advanced Usage
```bash
node example_usage.js
```

### 3. Integration with Your RAG System

```javascript
import { spawn } from 'child_process';

class RagChunkProcessor {
  // ... (see example_usage.js for full implementation)
  
  async processSources(sources, context = '') {
    const chunks = sources.map(source => ({
      score: source.score,
      textLength: source.textLength,
      fileName: source.fileName,
      pageLabel: source.pageLabel,
      textPreview: source.textPreview
    }));

    const request = {
      jsonrpc: '2.0',
      id: this.requestId++,
      method: 'tools/call',
      params: {
        name: 'process_rag_chunks',
        arguments: { chunks, context }
      }
    };
    
    // ... send request to MCP server
  }
}
```

## 📊 Sample Input/Output

### Input Chunk
```javascript
{
  score: 0.586926,
  textLength: 2161,
  fileName: 'Selling-Guide_02-05-25_highlighted.pdf',
  pageLabel: 338,
  textPreview: '# Calculating Monthly Qualifying Rental Income (or Loss)\\n\\n# Lease Agreements, Form 1007, or Form 1025\\n\\n# Treatment of the Income (or Loss)\\n\\n# Offsetti...'
}
```

### Generated Output
```json
{
  "input": {
    "chunksProcessed": 6,
    "context": "mortgage lending guidelines"
  },
  "analysis": {
    "topicsIdentified": ["calculating monthly qualifying rental income", "lease agreements", "borrower eligibility"],
    "averageScore": 0.561,
    "sources": {
      "uniqueFiles": ["Selling-Guide_02-05-25_highlighted.pdf"],
      "pageRange": { "min": 191, "max": 795 },
      "averageTextLength": 2166
    }
  },
  "syntheticQueries": {
    "broad": [
      "What are the requirements for calculating monthly qualifying rental income and lease agreements?",
      "Guidelines for calculating monthly qualifying rental income in mortgage lending"
    ],
    "specific": [
      "How to calculate monthly qualifying rental income?",
      "What are the general borrower eligibility requirements?",
      "Credit report requirements for loan applications"
    ],
    "questionBased": [
      "What information is needed for calculating monthly qualifying rental income?",
      "When do rental income calculation requirements apply?"
    ]
  }
}
```

## 🛠 Available Tools

### `process_rag_chunks`
**Description**: Process RAG chunks and generate synthetic queries

**Input Schema**:
```typescript
{
  chunks: Array<{
    score: number;           // Relevance score (0-1)
    textLength: number;      // Length of content
    fileName: string;        // Source file name
    pageLabel: number;       // Page number
    textPreview: string;     // Preview of chunk content
    fullText?: string;       // Optional full text content
  }>;
  context?: string;          // Optional domain context
}
```

## 🔧 Technical Details

### Algorithm
1. **Topic Extraction**: Identifies key topics from chunk content using:
   - Markdown headings (# patterns)
   - Domain-specific keywords (mortgage, loan, etc.)
   - Content analysis patterns

2. **Query Generation**: Creates three types of queries:
   - **Broad**: Domain-level questions combining multiple topics
   - **Specific**: Content-specific questions based on actual chunk text
   - **Question-based**: Formatted as natural questions (What, How, When, Who)

3. **Analysis**: Provides metadata about:
   - Source distribution
   - Score statistics
   - Content characteristics

### Use Cases

1. **RAG System Testing**
   ```javascript
   // Test if your RAG would retrieve relevant docs for generated queries
   const syntheticQueries = await processor.processSources(retrievedChunks);
   for (const query of syntheticQueries.broad) {
     const testResults = await ragEngine.query(query);
     // Compare with original chunks to validate retrieval quality
   }
   ```

2. **Training Data Generation**
   ```javascript
   // Generate query-document pairs for fine-tuning
   const pairs = chunks.map(async chunk => {
     const queries = await processor.processSources([chunk]);
     return queries.syntheticQueries.specific.map(q => ({
       query: q,
       document: chunk.textPreview,
       score: chunk.score
     }));
   });
   ```

3. **User Experience Enhancement**
   ```javascript
   // Suggest related questions to users
   const userAnswer = await ragEngine.query(userQuery);
   const suggestions = await processor.processSources(userAnswer.sources);
   
   return {
     answer: userAnswer.response,
     relatedQuestions: suggestions.syntheticQueries.questionBased
   };
   ```

## 🚀 Getting Started

1. **Build the MCP server**:
   ```bash
   npm install
   npm run build
   ```

2. **Test with sample data**:
   ```bash
   node test_rag_chunks.js
   ```

3. **Integrate with your system**:
   ```bash
   node example_usage.js
   ```

## 📄 Files Structure

- `src/index.ts` - Main MCP server implementation
- `test_rag_chunks.js` - Basic functionality test
- `example_usage.js` - Comprehensive usage examples
- `build/` - Compiled TypeScript output

## 🎯 Next Steps

The MCP server is ready to process your RAG chunks! You can:

1. **Integrate with your existing RAG system** using the `RagChunkProcessor` class
2. **Customize query generation** by modifying the topic extraction and query generation logic
3. **Extend functionality** by adding more sophisticated NLP analysis
4. **Scale for production** by adding caching, batching, and error handling

Perfect for generating synthetic training data, testing retrieval systems, and enhancing user experiences in RAG applications!