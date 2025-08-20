# Fee Indexer

A simple Node.js/Express service for indexing and exposing fee-related data for the LiFi protocol.

## Features

- REST API built with Express
- Docker support
- TypeScript for type safety
- Easily extensible

## Getting Started

### Prerequisites

- Node.js (v18+ recommended)
- npm
- Docker (optional)

### Installation

```bash
npm install
```

### Build

```bash
npm run build
```

### Development

```bash
npm run dev
```

### Run with Docker

```bash
docker build -t fee-indexer .
docker run fee-indexer
```

### Project Structure (DDD-inspired)

```
src/
  domain/         # Core business logic, entities, value objects
  application/    # Service layer, use cases, application logic
  repositories/   # Data access, persistence interfaces/implementations
  infrastructure/ # External integrations, frameworks, technical details
  app.ts          # Express app setup
  server.ts       # Server entry point
```

## License

MIT
