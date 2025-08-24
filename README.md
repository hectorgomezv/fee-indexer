# Fee Indexer

A lightweight Node.js/Express service for indexing and exposing LiFi’s FeesCollected events via a REST API.

## Getting Started

### Prerequisites

- Node.js (v18+ recommended)
- npm
- Docker

## Run tests

```bash
npm install && npm run build && npm run test
```

## Configuration

Copy `.env.sample` and `.env.docker.sample` to `.env` and `.env.docker`, and optionally set the variables in the file.

```bash
cp .env.sample .env && cp .env.docker.sample .env.docker
```

## Run on localhost

```bash
docker compose up -d mongo && npm install && npm run build && npm run dev
```

## Run with in a container with Docker Compose

```bash
docker compose up --build
```

## API

#### Get fees collected for an integrator

```http
GET /api/:chainId/fees-collected/:integrator
{
  "count": 22,
  "data": [
    {
      "token": "0x123...",
      "integrator": "0x123...",
      "integratorFee": "123",
      "lifiFee": "456",
    }
    ...
  ]
}
```

## Project Structure (DDD-inspired)

```
src/
  domain/         # Core entities and interfaces
  application/    # Service layer and application logic
  infrastructure/ # External providers, HTTP, persistence implementation
  http-server.ts  # Express app setup
  server.ts       # Entry point
  container.ts    # DI instances bootstrap
```

## License

MIT
