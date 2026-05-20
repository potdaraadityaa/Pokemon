# 🔴 Pokemon Pokedex API

A **production-grade** REST API backend for searching and exploring Pokemon data, built with **Node.js**, **Express.js**, and **TypeScript**. Powered by [PokeAPI](https://pokeapi.co/docs/v2) with intelligent Redis/LRU caching.

---

## 🚀 Features

- **Full Pokemon search** — search by partial name with pagination
- **Detailed Pokemon data** — types, stats, abilities, sprites, species info, moves
- **Smart caching** — Redis when available, in-memory LRU fallback (auto-detected)
- **Cache TTL & eviction** — configurable TTL and max-entry limits
- **Random Pokemon** — get a surprise Pokemon
- **Pokemon comparison** — compare 2–6 Pokemon stat-by-stat
- **Swagger/OpenAPI docs** — interactive API documentation
- **Health check** — deep service health with latency metrics
- **Rate limiting** — configurable per-window request caps
- **Security** — Helmet, CORS, compression
- **Structured logging** — Winston with Morgan HTTP logging
- **Docker ready** — multi-stage Dockerfile + Docker Compose with Redis

---

## 📁 Project Structure

```
backend/
├── src/
│   ├── cache/
│   │   └── cacheManager.ts       # Redis + LRU cache abstraction
│   ├── config/
│   │   ├── index.ts              # Typed config from env vars
│   │   └── swagger.ts            # OpenAPI spec definition
│   ├── controllers/
│   │   ├── pokemon.controller.ts # Request handling for Pokemon routes
│   │   └── health.controller.ts  # Health check logic
│   ├── middleware/
│   │   ├── errorHandler.ts       # Centralised error handler
│   │   ├── notFoundHandler.ts    # 404 catch-all
│   │   ├── rateLimiter.ts        # express-rate-limit
│   │   └── requestLogger.ts      # Morgan → Winston
│   ├── routes/
│   │   ├── pokemon.routes.ts     # /api/pokemon routes
│   │   └── health.routes.ts      # /api/health route
│   ├── services/
│   │   └── pokemon.service.ts    # Business logic + PokeAPI calls
│   ├── types/
│   │   ├── api.types.ts          # Response envelope, AppError
│   │   └── pokemon.types.ts      # Pokemon domain models + PokeAPI types
│   ├── utils/
│   │   ├── helpers.ts            # Utility functions
│   │   ├── logger.ts             # Winston logger
│   │   └── pokeApiClient.ts      # Axios client for PokeAPI
│   ├── validators/
│   │   └── pokemon.validator.ts  # express-validator rules
│   ├── app.ts                    # Express app factory
│   └── server.ts                 # Entry point + graceful shutdown
├── .env                          # Local env (git-ignored)
├── .env.example                  # Env variable template
├── .gitignore
├── docker-compose.yml
├── Dockerfile
├── package.json
├── tsconfig.json
└── README.md
```

---

## ⚡ Quick Start

### Prerequisites

- Node.js >= 18
- npm >= 9
- (Optional) Redis for production-grade caching

### 1. Install dependencies

```bash
cd backend
npm install
```

### 2. Set up environment

```bash
cp .env.example .env
# Edit .env as needed — defaults work out of the box
```

### 3. Run in development mode

```bash
npm run dev
```

The server starts at **http://localhost:3000**

---

## 📡 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/health` | Service health check |
| `GET` | `/api/pokemon/:name` | Get Pokemon by name or ID |
| `GET` | `/api/pokemon/search?q=` | Search Pokemon by partial name |
| `GET` | `/api/pokemon/random` | Get a random Pokemon |
| `GET` | `/api/pokemon/compare?names=a,b` | Compare 2–6 Pokemon |
| `GET` | `/api-docs` | Swagger UI documentation |
| `GET` | `/api-docs.json` | Raw OpenAPI JSON spec |

### Query Parameters

**Search** (`GET /api/pokemon/search`)
| Param | Type | Default | Description |
|-------|------|---------|-------------|
| `q` | string | required | Partial Pokemon name |
| `page` | integer | 1 | Page number |
| `limit` | integer | 20 | Results per page (max 100) |

**Compare** (`GET /api/pokemon/compare`)
| Param | Type | Description |
|-------|------|-------------|
| `names` | string | Comma-separated Pokemon names/IDs (2–6) |

### Example Requests

```bash
# Get Pikachu
curl http://localhost:3000/api/pokemon/pikachu

# Get by ID
curl http://localhost:3000/api/pokemon/25

# Search
curl "http://localhost:3000/api/pokemon/search?q=char&page=1&limit=10"

# Random Pokemon
curl http://localhost:3000/api/pokemon/random

# Compare
curl "http://localhost:3000/api/pokemon/compare?names=pikachu,bulbasaur,charmander"

# Health check
curl http://localhost:3000/api/health
```

---

## 🧠 Caching Architecture

The service uses a **two-tier caching strategy**:

| Scenario | Cache Used |
|----------|-----------|
| `REDIS_URL` is set and Redis is reachable | **Redis** |
| Redis unavailable or not configured | **LRU in-memory** |

Cache configuration (via `.env`):

```env
CACHE_MAX_ENTRIES=500     # Max entries in LRU cache
CACHE_TTL_SECONDS=3600    # Default TTL (1 hour)
```

**Cache keys:**
- Pokemon detail: `pokemon:detail:<name>`
- Species data: `pokemon:species:<name>`
- Search results: `pokemon:search:<q>:<page>:<limit>` (5-min TTL)
- Pokemon pool: `pokemon:random:pool` (24-hour TTL)

---

## 🐳 Docker

### Run with Docker Compose (includes Redis)

```bash
docker-compose up --build
```

### Run without Redis (LRU fallback)

```bash
docker build -t pokemon-api .
docker run -p 3000:3000 --env-file .env pokemon-api
```

---

## 🔧 NPM Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start in development mode with hot reload |
| `npm run build` | Compile TypeScript to `dist/` |
| `npm start` | Run compiled production build |
| `npm run typecheck` | TypeScript type check without emitting |
| `npm run clean` | Delete `dist/` directory |

---

## 🛡️ Security

- **Helmet** — sets security-related HTTP headers
- **CORS** — configurable origin whitelist
- **Rate limiting** — prevents abuse (100 req/min by default, configurable)
- **Input validation** — express-validator on all routes
- **No secrets in code** — all config via environment variables

---

## 📊 Response Format

All responses follow a consistent envelope:

```json
{
  "success": true,
  "data": { ... },
  "meta": {
    "requestId": "uuid",
    "timestamp": "2024-01-01T00:00:00.000Z",
    "duration": 42
  }
}
```

Error responses:

```json
{
  "success": false,
  "error": {
    "code": "NOT_FOUND",
    "message": "Pokemon \"missingno\" not found"
  },
  "meta": {
    "requestId": "uuid",
    "timestamp": "2024-01-01T00:00:00.000Z"
  }
}
```

**Error codes:** `NOT_FOUND`, `BAD_REQUEST`, `VALIDATION_ERROR`, `UPSTREAM_ERROR`, `TIMEOUT`, `RATE_LIMITED`, `INTERNAL_ERROR`

---

## 🌐 Swagger Documentation

Once running, visit: **http://localhost:3000/api-docs**

---

## 📝 Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `NODE_ENV` | `development` | Runtime environment |
| `PORT` | `3000` | HTTP port |
| `CORS_ORIGIN` | `http://localhost:5173` | Allowed CORS origins (comma-separated) |
| `POKEAPI_BASE_URL` | `https://pokeapi.co/api/v2` | PokeAPI base URL |
| `POKEAPI_TIMEOUT` | `10000` | Request timeout in ms |
| `CACHE_MAX_ENTRIES` | `500` | LRU max entries |
| `CACHE_TTL_SECONDS` | `3600` | Cache TTL in seconds |
| `REDIS_URL` | _(empty)_ | Redis connection URL |
| `RATE_LIMIT_WINDOW_MS` | `60000` | Rate limit window in ms |
| `RATE_LIMIT_MAX` | `100` | Max requests per window |
| `LOG_LEVEL` | `debug` | Winston log level |

---

## 📄 License

MIT
