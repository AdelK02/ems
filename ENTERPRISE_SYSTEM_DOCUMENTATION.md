# Enterprise Employee Management System (EMS)
## Architecture, Database, Security, Performance & DevOps Technical Documentation

---

## Executive Summary

This document presents the architectural design, security mechanisms, database schemas, performance strategies, and DevOps deployment specifications for the **Enterprise Employee Management System (EMS)**. Built to support **10,000+ concurrent active users** and over **50,000 employee records**, EMS is structured around **Clean Architecture** principles, strict separation of concerns, and enterprise-grade resilience.

---

## 1. High-Level Architecture & Technical Justification

### 1.1 Architecture Diagram

```
                                      +------------------------+
                                      |     Client / Browser   |
                                      |  (Next.js 16 Web App)  |
                                      +-----------+------------+
                                                  | HTTPS (TLS 1.3)
                                                  v
                                      +------------------------+
                                      |  Nginx Reverse Proxy   |
                                      | (SSL/TLS, Rate Limit,  |
                                      |  Gzip, Security Headers)|
                                      +-----------+------------+
                                                  |
                                                  v
                                      +------------------------+
                                      | Node.js / Express API  |
                                      | (Clean Architecture:   |
                                      | Routes->Controllers->  |
                                      | Services->Repositories)|
                                      +----+--------------+----+
                                           |              |
                         +-----------------+              +-----------------+
                         v                                                  v
            +------------------------+                         +------------------------+
            |  MongoDB Atlas Cluster |                         |      Redis Cluster     |
            |  (Primary / Replicas)  |                         | (Session, Rate Limit,  |
            |  Sharded Collections   |                         |  Query Cache Layer)    |
            +------------------------+                         +------------------------+
```

### 1.2 Frontend & Backend Technology Stack Justification

| Technology | Role | Justification for Enterprise Scale |
| :--- | :--- | :--- |
| **Next.js 16 (App Router)** | Frontend Framework | Selected over plain React SPA because it provides automatic code splitting, Server Components for reduced JavaScript client footprint, native SSR for initial load performance, built-in layout management, and optimal bundle size optimization essential for rendering enterprise dashboards. |
| **Express.js (Node.js)** | Backend REST API | Decoupled completely from Next.js to isolate serverless rendering concerns from stateless REST API microservices. Express provides lightweight, high-throughput asynchronous non-blocking I/O handling thousands of concurrent HTTP requests efficiently. |
| **MongoDB Atlas** | Database | Flexible document model accommodating complex employee profiles, hierarchical department structures, and dynamic audit logs without rigid migrations. Atlas horizontal sharding and replica sets guarantee 99.99% availability under 10k+ concurrent connections. |
| **Redis** | In-Memory Cache | Acts as a high-speed store for rate-limiting bucket counters, blacklisted JWT tokens, active session caches, and frequently accessed role-permission trees to prevent database query bottlenecks. |

### 1.3 Scalability, Security & Monitoring Overview

- **Horizontal Scalability**: Stateless API nodes deployed behind Nginx or AWS ALB. API servers scale horizontally based on CPU/RAM thresholds without session affinity issues.
- **Security-In-Depth**: Defense-in-depth model utilizing HTTPS TLS 1.3, HttpOnly/SameSite cookies for JWT refresh tokens, strict Role-Based Access Control (RBAC), Helmet security headers, express-rate-limit, and Mongo query sanitization.
- **Observability & Monitoring**: Prometheus scrapes metrics from `/health` and API performance counters; Grafana dashboards display latency (p95, p99), throughput, and error rates; Winston/Morgan routes structured JSON logs to ELK Stack / CloudWatch; Sentry handles uncaught application exceptions.

---

## 2. Database Design & Optimization

### 2.1 Collection Schemas

#### 1. `Users` Collection
```json
{
  "_id": "ObjectId",
  "email": "string (unique, lowercase, indexed)",
  "passwordHash": "string (bcrypt cost factor 12)",
  "employeeId": "ObjectId (ref: Employees, unique, indexed)",
  "roles": ["ObjectId (ref: Roles)"],
  "isActive": "boolean (default: true)",
  "lastLogin": "ISODate",
  "failedLoginAttempts": "number (default: 0)",
  "lockUntil": "ISODate",
  "createdAt": "ISODate",
  "updatedAt": "ISODate"
}
```

#### 2. `Roles` Collection
```json
{
  "_id": "ObjectId",
  "name": "string (unique, e.g., 'ADMIN', 'HR_MANAGER', 'EMPLOYEE')",
  "description": "string",
  "permissions": ["string (e.g., 'employees:create', 'employees:read', 'leaves:approve')"],
  "isSystemRole": "boolean (default: false)"
}
```

#### 3. `Employees` Collection
```json
{
  "_id": "ObjectId",
  "employeeCode": "string (unique, indexed, e.g., 'EMP-10045')",
  "firstName": "string (indexed)",
  "lastName": "string (indexed)",
  "email": "string (unique, indexed)",
  "phone": "string",
  "department": "string (indexed)",
  "designation": "string",
  "joiningDate": "ISODate",
  "salary": "number",
  "status": "string (enum: ['ACTIVE', 'ON_LEAVE', 'TERMINATED'], default: 'ACTIVE', indexed)",
  "avatarUrl": "string",
  "managerId": "ObjectId (ref: Employees, indexed)",
  "address": {
    "street": "string",
    "city": "string",
    "state": "string",
    "country": "string",
    "zipCode": "string"
  },
  "createdAt": "ISODate",
  "updatedAt": "ISODate"
}
```

#### 4. `Attendance` Collection
```json
{
  "_id": "ObjectId",
  "employeeId": "ObjectId (ref: Employees, required, indexed)",
  "date": "ISODate (normalized to YYYY-MM-DD 00:00:00, indexed)",
  "checkIn": "ISODate",
  "checkOut": "ISODate",
  "status": "string (enum: ['PRESENT', 'ABSENT', 'LATE', 'HALF_DAY'], default: 'PRESENT', indexed)",
  "workDurationMinutes": "number",
  "remarks": "string",
  "createdAt": "ISODate"
}
```

#### 5. `Leaves` Collection
```json
{
  "_id": "ObjectId",
  "employeeId": "ObjectId (ref: Employees, required, indexed)",
  "leaveType": "string (enum: ['SICK', 'CASUAL', 'ANNUAL', 'MATERNITY'], indexed)",
  "startDate": "ISODate (indexed)",
  "endDate": "ISODate (indexed)",
  "totalDays": "number",
  "reason": "string",
  "status": "string (enum: ['PENDING', 'APPROVED', 'REJECTED'], default: 'PENDING', indexed)",
  "approvedBy": "ObjectId (ref: Users)",
  "appliedOn": "ISODate",
  "updatedAt": "ISODate"
}
```

#### 6. `AuditLogs` Collection
```json
{
  "_id": "ObjectId",
  "userId": "ObjectId (ref: Users, indexed)",
  "action": "string (enum: ['CREATE', 'UPDATE', 'DELETE', 'LOGIN', 'LOGOUT', 'EXPORT_CSV'], indexed)",
  "resource": "string (e.g., 'EMPLOYEES', 'ROLES')",
  "resourceId": "string",
  "ipAddress": "string",
  "userAgent": "string",
  "changes": {
    "before": "Object",
    "after": "Object"
  },
  "timestamp": "ISODate (indexed, TTL)"
}
```

### 2.2 Database Indexes & Query Optimization Strategy

1. **Compound Indexes for Filtering & Sorting**:
   - `Employees`: `{ department: 1, status: 1, lastName: 1 }` – Supports fast filtering by department and employee status while ordering alphabetically.
   - `Attendance`: `{ employeeId: 1, date: -1 }` (Unique) – Prevents duplicate daily records per employee while enabling fast historical retrieval.
   - `Leaves`: `{ employeeId: 1, status: 1, startDate: -1 }` – Optimizes employee dashboard leave query lookups.

2. **Text Indexes for Search**:
   - `Employees`: `{ firstName: "text", lastName: "text", email: "text", employeeCode: "text" }` – Enables high-performance full-text search across 50,000+ employees.

3. **Time-To-Live (TTL) Indexes**:
   - `AuditLogs`: `{ timestamp: 1 }` with `expireAfterSeconds: 31536000` (1 Year) – Automatically purges aged logs without requiring background cleanup crons.

---

## 3. Security Architecture & Vulnerability Review

### 3.1 Authentication & JWT Refresh Token Rotation Flow

```
Client App                   Express Auth API                     Database / Redis
   |                                |                                   |
   |-- 1. POST /api/v1/auth/login ->|                                   |
   |   (email, password)            |-- 2. Verify Bcrypt Password ----->|
   |                                |-- 3. Generate Access JWT (15m)   |
   |                                |   & Refresh Token (7d)            |
   |                                |-- 4. Store Refresh Hash in DB --->|
   |<-- 5. Return Access Token & ---|
   |    Set HttpOnly Cookie (Refresh)
   |                                |
   |-- 6. GET /api/v1/employees ----> (Bearer Access Token in Header)
   |   (Access token expired: 401)  |
   |                                |
   |-- 7. POST /api/v1/auth/refresh >|
   |   (Sends HttpOnly Cookie)      |-- 8. Verify & Rotate Refresh Token |
   |<-- 9. Return New Access Token -|
```

### 3.2 Vulnerability Audit of Insecure Login Code

#### Insecure Code Provided for Audit:
```javascript
// INSECURE LOGIN ROUTE EXPOSED IN REVIEW
app.post('/api/login', async (req, res) => {
  const { username, password } = req.body;
  const user = await db.collection('users').findOne({ username: username, password: password });
  if (user) {
    const token = jwt.sign({ id: user._id, role: user.role }, "secret123");
    res.json({ success: true, token, user });
  } else {
    res.json({ success: false, message: "Invalid credentials" });
  }
});
```

#### Detailed Vulnerability Breakdown:

1. **NoSQL Injection Vulnerability**:
   - *Issue*: `req.body.username` and `req.body.password` are directly passed to MongoDB `findOne()` without sanitization or type validation.
   - *Exploit*: Attacker sends `{"username": {"$gt": ""}, "password": {"$gt": ""}}`. MongoDB evaluates this query to true for the first record in the collection, logging the attacker in as Admin without knowing credentials!
2. **Plaintext Password Matching**:
   - *Issue*: Compares plain strings in database query (`password: password`). Passwords are not hashed with `bcrypt` or `argon2`.
3. **Hardcoded Weak JWT Secret**:
   - *Issue*: Secret is hardcoded as `"secret123"`. Anyone can forge tokens locally and gain superuser access.
4. **Lack of Token Expiration & Refresh Mechanism**:
   - *Issue*: `jwt.sign()` specifies no `expiresIn`. Stolen tokens remain valid indefinitely.
5. **Missing Rate Limiting**:
   - *Issue*: No rate limiter middleware applied, allowing automated brute-force attacks at thousands of requests per second.
6. **Information Disclosure in Response**:
   - *Issue*: Complete `user` document (including sensitive metadata) is returned directly in JSON response.

#### Secure Remediated Implementation:
```javascript
// SECURE ENTERPRISE LOGIN ROUTE
const rateLimit = require('express-rate-limit');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // limit each IP to 5 requests per window
  message: { status: 429, message: "Too many login attempts. Please try again after 15 minutes." }
});

router.post('/login', loginLimiter, async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (typeof email !== 'string' || typeof password !== 'string') {
      return res.status(400).json({ success: false, message: "Invalid input format" });
    }

    // Call Repository Layer (Parameterized Query)
    const user = await userRepository.findByEmail(email.toLowerCase().trim());
    if (!user || !user.isActive) {
      return res.status(401).json({ success: false, message: "Invalid email or password" });
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      await userRepository.incrementFailedLogin(user._id);
      return res.status(401).json({ success: false, message: "Invalid email or password" });
    }

    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    await userRepository.saveRefreshToken(user._id, refreshToken);

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000
    });

    return res.status(200).json({
      success: true,
      accessToken,
      user: { id: user._id, email: user.email, roles: user.roles }
    });
  } catch (error) {
    next(error);
  }
});
```

### 3.3 Protection Against Attacks

- **XSS (Cross-Site Scripting)**: Access tokens stored in-memory (React state); Refresh tokens stored in `HttpOnly` cookies inaccessible to JavaScript; React auto-escapes rendered text.
- **CSRF (Cross-Site Request Forgery)**: `SameSite=Strict` cookie attribute enforced; custom request header `X-Requested-With` validated.
- **NoSQL Injection**: Express inputs sanitized using Mongoose schema casting and input type checking.
- **Brute Force**: `express-rate-limit` enforces 5 failed login attempts per 15 minutes per IP address with exponential lockouts.

---

## 4. Performance & Scalability for 50,000+ Employees

1. **Database Cursor Pagination**:
   - Replaces `skip(page * limit).limit(limit)` (O(N) performance degradation) with cursor-based pagination using MongoDB `_id` or indexed timestamp ranges `_id: { $gt: lastId }`, keeping query response times below 15ms regardless of dataset size.
2. **Lean Queries & Field Projections**:
   - Mongoose `.lean()` bypasses heavy Mongoose document hydration. Queries specify exact field projections `.select("firstName lastName email department designation status avatarUrl")`.
3. **Table Virtualization**:
   - The frontend implements `@tanstack/react-virtual`, rendering only visible DOM rows (~20 elements) rather than rendering 50,000 DOM nodes, preserving 60 FPS scrolling performance.
4. **Caching Strategy**:
   - Redis caches static metadata (Department lists, Roles, Permissions) with 1-hour TTL and invalidation triggers on mutation events.

---

## 5. DevOps & Deployment Architecture

### 5.1 Docker Multi-Stage Builds

#### Backend `Dockerfile`
```dockerfile
# Multi-stage Backend Dockerfile
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .

FROM node:20-alpine AS runner
WORKDIR /app
NODE_ENV=production
COPY package*.json ./
RUN npm ci --only=production
COPY --from=builder /app/src ./src
EXPOSE 5000
USER node
CMD ["node", "src/index.js"]
```

### 5.2 Nginx Reverse Proxy & HTTPS Configuration (`nginx.conf`)
```nginx
events { worker_connections 1024; }

http {
  upstream express_backend {
    server backend:5000;
  }
  upstream next_frontend {
    server frontend:3000;
  }

  server {
    listen 80;
    server_name ems.enterprise.com;
    return 301 https://$host$request_uri;
  }

  server {
    listen 443 ssl http2;
    server_name ems.enterprise.com;

    ssl_certificate /etc/letsencrypt/live/ems.enterprise.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/ems.enterprise.com/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;

    # Security Headers
    add_header X-Frame-Options "DENY";
    add_header X-Content-Type-Options "nosniff";
    add_header Content-Security-Policy "default-src 'self' https:";

    location /api/ {
      proxy_pass http://express_backend;
      proxy_set_header Host $host;
      proxy_set_header X-Real-IP $remote_addr;
      proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
      proxy_set_header X-Forwarded-Proto $scheme;
    }

    location / {
      proxy_pass http://next_frontend;
      proxy_set_header Host $host;
      proxy_set_header X-Real-IP $remote_addr;
    }
  }
}
```

### 5.3 Automated Backup & Disaster Recovery Strategy

1. **Daily Automated Snapshots**: MongoDB Atlas continuous cloud backups with point-in-time recovery (PITR) to 1-minute granular intervals.
2. **Offsite Cron Backups**: Nightly `mongodump` script compressed with Gzip and securely transferred to AWS S3 Glacier with object lock retention policies:
   ```bash
   0 2 * * * mongodump --uri="$MONGO_URI" --gzip --archive=/backups/ems_$(date +\%F).gz && aws s3 cp /backups/ems_$(date +\%F).gz s3://enterprise-ems-backups/
   ```
3. **RTO / RPO Targets**: Recovery Time Objective (RTO) < 15 minutes; Recovery Point Objective (RPO) < 1 minute.
