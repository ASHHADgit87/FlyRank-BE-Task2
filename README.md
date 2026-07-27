# FlyRank BE Task 2
**FlyRank BE Task 2** is a production-styled Express.js REST API built for the FlyRank Backend AI Engineering internship (BE-02). It continues directly from BE-01/Task 1's in-memory CRUD by replacing the storage layer with a persistent SQLite-compatible database, while keeping the API contract identical — proving persistence is an implementation detail behind the API, not a change to the API itself.

---

# Architecture
FlyRank BE Task 2 follows a **Layered MVC-style Architecture**, separating routing, business logic, middleware, and data access for clarity and maintainability.

| Layer | Responsibility |
|---|---|
| Routes | Defines and maps API endpoints to controllers |
| Controllers | Handles request logic, validation, and shapes responses |
| Middleware | Logging, rate limiting, error handling, security |
| Data | Persistent SQLite-compatible database (Turso / libSQL) |
| Utils | Response formatting |

---

# API Design
The API follows REST conventions with consistent JSON envelopes for every response and standard HTTP status codes for success and failure states. Data is persisted in a real database instead of memory, so it survives restarts and redeploys.

---

# Features

## Core Endpoints
| Method | Endpoint | Description |
|---|---|---|
| GET | `/tasks` | List tasks — filterable by `search`, `done`, sortable by `title` |
| GET | `/tasks/:id` | Fetch a single task by id |
| POST | `/tasks` | Create a new task |
| PUT | `/tasks/:id` | Update a task's title and/or completion status |
| DELETE | `/tasks/:id` | Delete a task |
| GET | `/stats` | Total, completed, and pending task counts |

## Engineering & Reliability
| Capability | Description |
|---|---|
| Persistent Storage | SQLite-compatible database (Turso/libSQL) — data survives restarts and redeploys |
| Search & Filter | `?search=` (title match) and `?done=true/false` |
| Sorting | `?sort=title` for alphabetical ordering |
| Stats Endpoint | Aggregate counts computed via SQL `COUNT()` |
| Timestamps | `created_at` and `updated_at` tracked per row |
| Auto-Seed | Example tasks inserted only on first run |
| Security Headers | Helmet-based HTTP header hardening |
| CORS Control | Cross-origin requests enabled |
| Rate Limiting | IP-based request throttling with custom JSON error responses |
| Centralized Error Handling | Single source of truth for error formatting and logging |
| Structured Logging | Per-request method, path, status, and latency logging |
| Graceful Shutdown | Clean process termination on SIGINT/SIGTERM with forced timeout |
| Automated Testing | Jest + Supertest coverage for all endpoints and edge cases (13 passing tests) |
| Containerized | Dockerfile included for portable deployment |
| Live Demo UI | Click-to-run endpoint cards rendering real JSON |

---

# Workflow
```text
Client Request
      ↓
Security & CORS Middleware
      ↓
Request Logger
      ↓
Rate Limiter
      ↓
Route → Controller
      ↓
Database Query (Turso / libSQL)
      ↓
Structured JSON Response
      ↓
Centralized Error Handler (on failure)
```

---

# Tech Stack
| Layer | Technology |
|---|---|
| Runtime | Node.js |
| Framework | Express.js 5 |
| Database | SQLite-compatible, hosted via Turso (libSQL) |
| Security | Helmet, CORS |
| Performance | Compression |
| Reliability | express-rate-limit |
| Testing | Jest, Supertest |
| Containerization | Docker |

---

# Testing
```bash
npm test
```
All 13 tests run against an in-memory database and pass independently of the hosted Turso instance.

---

# A Note on Persistence
Data is stored in a hosted, SQLite-compatible database (Turso/libSQL) rather than a local `.db` file. This choice was made specifically to support deployment on serverless platforms (like Vercel), whose functions run on a read-only, ephemeral filesystem and cannot persist a local SQLite file across invocations. The schema, SQL, and API contract remain fully SQLite-compatible.

---

# Live Demo
https://fly-rank-be-task2.vercel.app/

---

# Creator & Developer

**Muhammad Ashhadullah Zaheer**

LinkedIn: https://www.linkedin.com/in/muhammad-ashhadullah-zaheer-41194a340/
