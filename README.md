# URL Shortening Service

A RESTful API that shortens long URLs, built with **Node.js**, **Express**, **TypeScript**, and **SQLite**. This is a project-based implementation of the [URL Shortening Service](https://roadmap.sh/projects/url-shortening-service) from [roadmap.sh](https://roadmap.sh).

## Features

- **Create** a short URL from a long URL
- **Retrieve** the original URL via its short code
- **Update** an existing short URL's destination
- **Delete** a short URL
- **Stats** — track how many times a short URL has been accessed
- Minimal **frontend** UI for interacting with the API
- Input validation and proper HTTP status codes
- Security headers via Helmet
- CORS enabled

## Tech Stack

| Technology  | Purpose                     |
|-------------|-----------------------------|
| Node.js     | JavaScript runtime          |
| Express     | HTTP framework              |
| TypeScript  | Type safety                 |
| SQLite      | Embedded database           |
| better-sqlite3 | Synchronous SQLite driver |
| nanoid      | Short code generation       |
| Vitest      | Testing framework           |

See [ADR.md](./ADR.md) for the detailed architecture decision record.

## Getting Started

### Prerequisites

- Node.js 18+
- npm

### Installation

```bash
git clone https://github.com/tetri/roadmap_url-shortening-service.git
cd roadmap_url-shortening-service
npm install
```

### Configuration

Copy the environment file and adjust if needed:

```bash
cp .env.example .env
```

Default values:

| Variable       | Default                       | Description              |
|----------------|-------------------------------|--------------------------|
| `PORT`         | `3000`                        | Server port              |
| `DATABASE_PATH` | `./data/url-shortener.db`    | SQLite database file     |
| `BASE_URL`     | `http://localhost:3000`       | Base URL for short links |

### Running

```bash
# Development (with hot-reload)
npm run dev

# Build
npm run build

# Production
npm start
```

The server starts at `http://localhost:3000`. Open this URL in your browser to access the frontend UI.

### Testing

```bash
npm test
```

## API Documentation

### Create Short URL

```http
POST /shorten
Content-Type: application/json

{
  "url": "https://www.example.com/some/long/url"
}
```

**Success (201):**

```json
{
  "id": "1",
  "url": "https://www.example.com/some/long/url",
  "shortCode": "abc123",
  "createdAt": "2021-09-01T12:00:00Z",
  "updatedAt": "2021-09-01T12:00:00Z"
}
```

**Validation Error (400):**

```json
{
  "errors": ["url is required and must be a string"]
}
```

### Retrieve Original URL

```http
GET /shorten/abc123
```

**Success (200):**
Response body is the same as the creation response.

**Not Found (404):**

```json
{
  "error": "Short URL not found"
}
```

### Update Short URL

```http
PUT /shorten/abc123
Content-Type: application/json

{
  "url": "https://www.example.com/some/updated/url"
}
```

**Success (200):** Returns the updated record.

**Not Found (404):** If the short code does not exist.

### Delete Short URL

```http
DELETE /shorten/abc123
```

**Success (204):** No content.

**Not Found (404):** If the short code does not exist.

### Get URL Statistics

```http
GET /shorten/abc123/stats
```

**Success (200):**

```json
{
  "id": "1",
  "url": "https://www.example.com/some/long/url",
  "shortCode": "abc123",
  "createdAt": "2021-09-01T12:00:00Z",
  "updatedAt": "2021-09-01T12:00:00Z",
  "accessCount": 10
}
```

## Project Structure

```
src/
├── index.ts            # Entry point — loads env, starts server
├── app.ts              # Express application setup
├── database.ts         # SQLite connection + migrations
├── models/url.ts       # TypeScript interfaces & serializers
├── services/url.ts     # Business logic layer
├── controllers/url.ts  # Request handlers
├── routes/url.ts       # Route definitions
├── middlewares/
│   ├── validation.ts   # Request validation
│   └── error-handler.ts# Global error handler
└── utils/
    ├── errors.ts       # Custom error classes
    └── short-code.ts   # Short code generator (nanoid)
public/
└── index.html          # Minimal frontend UI
tests/
└── url.test.ts         # API integration tests
```

## License

ISC
