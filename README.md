# MCP Server Boilerplate

A minimal TypeScript boilerplate for creating Model Context Protocol (MCP) servers.

## Features

- TypeScript implementation using the official MCP SDK
- Two example tools: `echo` and `add`
- Proper error handling and validation with Zod
- Ready-to-use build configuration
- Comprehensive TypeScript configuration

## Prerequisites

- Node.js 18+ 
- npm or yarn

## Installation

1. Install dependencies:
   ```bash
   npm install
   ```

2. Build the project:
   ```bash
   npm run build
   ```

## Usage

### Running the Server

Start the MCP server:
```bash
npm start
```

The server runs on stdio transport and communicates via JSON-RPC.

### Development

For development with auto-rebuild:
```bash
npm run dev
```

### Testing the Server

You can test the server using the MCP Inspector or by integrating it with an MCP client.

## Available Tools

### `echo`
Echoes back the provided text.

**Parameters:**
- `text` (string): Text to echo back

**Example:**
```json
{
  "text": "Hello, MCP!"
}
```

### `add`
Adds two numbers together.

**Parameters:**
- `a` (number): First number
- `b` (number): Second number

**Example:**
```json
{
  "a": 5,
  "b": 3
}
```

## Project Structure

```
mcp_boilerplate/
├── src/
│   └── index.ts          # Main server implementation
├── build/                # Compiled JavaScript output
├── package.json          # Project configuration
├── tsconfig.json         # TypeScript configuration
├── .gitignore           # Git ignore rules
└── README.md            # This file
```

## Extending the Server

To add new tools:

1. Add the tool definition in the `ListToolsRequestSchema` handler
2. Add the tool implementation in the `CallToolRequestSchema` handler
3. Include proper input validation using Zod schemas

## License

MIT# Fabrik
