# Architecture Decision Record

## Title: Tech Stack Choice for URL Shortening Service

### Status

Accepted

### Context

We are building a RESTful API for a URL shortening service. The service must support creating, retrieving, updating, and deleting short URLs, as well as tracking access statistics. The project is a small-to-medium sized API with no authentication or authorization requirements.

The following criteria were considered for technology selection:

- **Simplicity** — minimal boilerplate, easy to set up and run
- **Performance** — must handle redirects and CRUD operations efficiently
- **Portability** — zero external infrastructure dependencies (no separate database server)
- **Type safety** — reduce runtime errors through compile-time checks
- **Testability** — easy to write and run automated tests
- **Maintainability** — clean separation of concerns and well-defined layers

### Decision

We chose the following stack:

| Component       | Choice                    | Rationale                                                                 |
|-----------------|---------------------------|---------------------------------------------------------------------------|
| Runtime         | **Node.js 22**            | Widespread, fast I/O, excellent HTTP support, large ecosystem             |
| Framework       | **Express 5**             | Minimal, unopinionated, battle-tested, huge community                     |
| Language        | **TypeScript**            | Static typing catches bugs early, improves DX, compiles to standard JS    |
| Database        | **SQLite**                | Embedded, zero-config, no separate server process, ACID-compliant         |
| Database Driver | **better-sqlite3**        | Synchronous API (simpler code), 5–10× faster than async SQLite wrappers   |
| Short Codes     | **nanoid**                | URL-safe, unpredictable, collision-resistant, no sequential IDs exposed   |
| Validation      | **Custom middleware**      | Keeps dependencies minimal; URL pattern validation is straightforward     |
| Security        | **helmet**                | Sets secure HTTP headers (X-Content-Type-Options, CSP, etc.)             |
| CORS            | **cors**                  | Required for frontend-backend communication during development            |
| Testing         | **Vitest + Supertest**    | Fast, TypeScript-native test runner; Supertest provides ergonomic HTTP assertions |

### Alternatives Considered

#### Python (Flask / Django)
- **Pros**: Familiar to many, Django ORM is powerful.
- **Cons**: Heavier runtime, GIL limits concurrent request handling, more boilerplate for a simple API.

#### Java (Spring Boot)
- **Pros**: Strong typing, mature ecosystem.
- **Cons**: Heavy startup time, verbose configuration, overkill for this scope.

#### Ruby on Rails
- **Pros**: Rapid prototyping, convention over configuration.
- **Cons**: Performance overhead, fewer developers use Ruby today, heavier dependency footprint.

#### PostgreSQL / MySQL
- **Pros**: Battle-tested RDBMS, excellent for large-scale applications.
- **Cons**: Requires a separate server process, adds operational complexity unnecessary for this project.

#### MongoDB
- **Pros**: Schema-less, scales horizontally.
- **Cons**: No joins or transactions (for atomic stats updates), heavier than needed.

### Consequences

**Positive:**
- Zero infrastructure dependencies — SQLite is a single file, no need for Docker or a database server.
- Very fast cold start — the server is ready in under 500ms.
- Simple deployment — copy the files, run `npm start`.
- Tests are fast and self-contained with an in-memory SQLite database.

**Negative:**
- SQLite is not suitable for high-write-volume scenarios (it uses file-level locking).
- The synchronous `better-sqlite3` API blocks the event loop — acceptable for this use case since database operations are sub-millisecond, but would not scale to thousands of concurrent writes.
- No built-in connection pooling (not needed for a single-process app).

### Decision Date

2026-07-07
