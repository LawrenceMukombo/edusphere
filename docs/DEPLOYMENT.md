# EduSphere SMIS — Deployment & Infrastructure Guide
**Version:** 1.0.0 | **Target Platform:** Linux / Docker / Docker Compose / Windows Server

---

## 1. Hosting Topologies

EduSphere SMIS supports four flexible commercial deployment options:
1. **Shared Zambia-Hosted SaaS:** High-density, multi-tenant deployment hosted on Zambia-resident cloud infrastructure for small and growing schools (Community Starter / Growing School).
2. **Dedicated Private SaaS:** Dedicated container stack and dedicated PostgreSQL database instance for large combined or multi-campus institutions.
3. **School-Managed On-Premises:** Packaged Docker Compose installation running on an institution's private local server with local offline resilience.
4. **Perpetual Site Licence:** Standalone on-premises installation with annual maintenance and security update agreements.

---

## 2. Docker Compose Deployment

The repository provides a production-grade `docker-compose.yml`:

```yaml
version: '3.8'

services:
  app:
    build: .
    restart: always
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - DATABASE_URL=postgresql://postgres:${DB_PASSWORD}@db:5432/edusphere_db?schema=public
      - JWT_SECRET=${JWT_SECRET}
    depends_on:
      - db
      - redis

  db:
    image: postgres:16-alpine
    restart: always
    volumes:
      - edusphere_db_data:/var/lib/postgresql/data
    environment:
      - POSTGRES_DB=edusphere_db
      - POSTGRES_USER=postgres
      - POSTGRES_PASSWORD=${DB_PASSWORD}
    ports:
      - "5432:5432"

  redis:
    image: redis:7-alpine
    restart: always
    ports:
      - "6379:6379"

volumes:
  edusphere_db_data:
```

---

## 3. Production Build & Execution

### 3.1 Initial Setup
```bash
# 1. Install dependencies
npm install

# 2. Push Prisma database schema
npx prisma db push

# 3. Seed demonstration fixtures (Optional for staging)
npx tsx prisma/seed.ts

# 4. Compile optimized production bundle
npm run build

# 5. Start production server
npm run start
```

---

## 4. Database Backup & Disaster Recovery

### 4.1 Automated Daily Backup
A dedicated script executes automated compressed backups:
```bash
pg_dump -U postgres -h localhost -d edusphere_db -F c -b -v -f "/backups/edusphere_$(date +%Y%m%d_%H%M%S).dump"
```

### 4.2 Recovery Procedure (RTO < 1 Hour)
```bash
# Drop/recreate database and restore from backup file
dropdb -U postgres edusphere_db
createdb -U postgres edusphere_db
pg_restore -U postgres -d edusphere_db -v "/backups/edusphere_backup_file.dump"
```
