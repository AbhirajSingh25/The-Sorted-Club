# The Sorted Club — Production Deployment Runbook

This runbook provides the complete, vendor-neutral deployment procedure for hosting **The Sorted Club** on a standard single Linux VPS using **Docker**, **FastAPI**, **PostgreSQL 16**, **React SPA**, **Nginx Reverse Proxy**, and **Let's Encrypt SSL**.

---

## 1. Production Architecture Overview

The production deployment consists of an isolated, containerized multi-service stack running on a single Linux VPS:

```
                          Internet (HTTPS :443 / HTTP :80)
                                         ↓
                                 thesortedclub.com
                                         ↓
                    ┌────────────────────────────────────────┐
                    │      Nginx Reverse Proxy Container     │
                    │   - Port 80: ACME challenge & HTTPS 301│
                    │   - Port 443: TLS 1.2/1.3 + Gzip       │
                    │   - Production Security Headers        │
                    └───────┬────────────────────────┬───────┘
                            │                        │
               / (SPA & deep routes)        /api/ & /health & /ready
                            │                        │
                            ↓                        ↓
              ┌───────────────────────────┐ ┌───────────────────────────┐
              │    Frontend Container     │ │     Backend Container     │
              │  (Vite React SPA Bundle)  │ │  (FastAPI / Uvicorn 8000) │
              └───────────────────────────┘ └─────────────┬─────────────┘
                                                          │
                                                Internal Docker Network
                                                          │
                                                          ↓
                                            ┌───────────────────────────┐
                                            │   PostgreSQL 16 Engine    │
                                            │ (postgres_data persistent)│
                                            └───────────────────────────┘
```

### Core Architecture Highlights
- **Single VPS + Single Domain**: Cost-effective, simple, and self-contained for founder operations.
- **Zero Cloud Vendor Lock-In**: Deployable to any standard Linux VPS (Hetzner, DigitalOcean, Linode, Vultr, Contabo, AWS EC2, GCP Compute Engine, OVH, etc.).
- **Data Persistence**: PostgreSQL data is persisted on host Docker volume `postgres_data`.
- **Network Isolation**: Backend and PostgreSQL communicate over internal Docker bridge network (`sorted_club_net`); PostgreSQL port 5432 is not exposed to the public internet.
- **Automated SSL Management**: Let's Encrypt Certbot companion container for automated 12-hour certificate renewals.

---

## 2. Server Prerequisites & Sizing

### Minimum Recommended Specs
- **OS**: Ubuntu 22.04 LTS or Ubuntu 24.04 LTS (x86_64)
- **RAM**: 2 GB (4 GB recommended)
- **CPU**: 1–2 vCPUs
- **Storage**: 25 GB NVMe / SSD
- **Network**: 1 Static Public IPv4 Address
- **DNS**: `A` records pointing `thesortedclub.com` and `www.thesortedclub.com` to VPS IP.

---

## 3. Initial Server Hardening & Package Installation

Connect to the VPS as root or sudo user:

```bash
# 1. Update OS packages
sudo apt update && sudo apt upgrade -y

# 2. Install essential utilities
sudo apt install -y curl wget git ufw certbot

# 3. Configure UFW Firewall
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow ssh
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable
```

### Install Docker Engine & Docker Compose Plugin

```bash
# Set up Docker official repository
sudo install -m 0755 -d /etc/apt/keyrings
sudo curl -fsSL https://download.docker.com/linux/ubuntu/gpg -o /etc/apt/keyrings/docker.asc
sudo chmod a+r /etc/apt/keyrings/docker.asc

echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.asc] https://download.docker.com/linux/ubuntu \
  $(. /etc/os-release && echo "$VERSION_CODENAME") stable" | \
  sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

sudo apt update
sudo apt install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
sudo systemctl enable --now docker
```

---

## 4. Repository Setup & Production Environment Configuration

### Step 4.1: Clone Application

```bash
sudo mkdir -p /var/www/thesortedclub
sudo chown -R $USER:$USER /var/www/thesortedclub
cd /var/www/thesortedclub

git clone <YOUR_GIT_REPOSITORY_URL> .
```

### Step 4.2: Configure Production `.env`

Copy the environment template:
```bash
cp .env.example .env
chmod 600 .env
nano .env
```

Generate secure production values:
```bash
# Generate PostgreSQL password:
openssl rand -base64 24

# Generate Admin JWT Secret Key (64 hex characters):
openssl rand -hex 32

# Generate Admin Password:
openssl rand -base64 18
```

Ensure `.env` contains:
```ini
APP_ENV=production

# PostgreSQL Database Configuration
POSTGRES_DB=sorted_club
POSTGRES_USER=sorted_user
POSTGRES_PASSWORD=<YOUR_GENERATED_POSTGRES_PASSWORD>
DATABASE_URL=postgresql+psycopg://sorted_user:<YOUR_GENERATED_POSTGRES_PASSWORD>@postgres:5432/sorted_club

# Admin Authentication
ADMIN_USERNAME=admin
ADMIN_PASSWORD=<YOUR_GENERATED_ADMIN_PASSWORD>
ADMIN_SECRET_KEY=<YOUR_GENERATED_64_CHAR_HEX_KEY>

# URLs & CORS
FRONTEND_URL=https://thesortedclub.com
CORS_ORIGINS=https://thesortedclub.com,https://www.thesortedclub.com

# Gmail SMTP Business Notifications
EMAIL_NOTIFICATIONS_ENABLED=true
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USE_SSL=false
SMTP_USERNAME=thesortedclub@gmail.com
SMTP_PASSWORD=<YOUR_16_CHAR_GMAIL_APP_PASSWORD>
SMTP_FROM_EMAIL=thesortedclub@gmail.com
BUSINESS_NOTIFICATION_EMAIL=thesortedclub@gmail.com

# Official Banking & UPI Payment Instructions
PAYMENT_UPI_ID=thesortedclub@upi
PAYMENT_BANK_ACCOUNT_NAME=The Sorted Club Private Limited
PAYMENT_BANK_NAME=HDFC Bank
PAYMENT_BANK_ACCOUNT_NUMBER=50200012345678
PAYMENT_BANK_IFSC=HDFC0001234
PAYMENT_BANK_BRANCH=Indiranagar, Bangalore
```

---

## 5. Initial SSL Acquisition (Certbot Bootstrap)

To obtain the initial Let's Encrypt certificate before starting the full HTTPS reverse proxy:

```bash
cd /var/www/thesortedclub

# 1. Create docker volumes if not existing
docker volume create letsencrypt_certs
docker volume create certbot_webroot

# 2. Temporarily switch Nginx to HTTP bootstrap mode
cp nginx/thesortedclub.initial.conf nginx/thesortedclub.conf

# 3. Start Nginx container
docker compose up -d nginx

# 4. Request initial certificates via Certbot
docker compose run --rm --entrypoint "\
  certbot certonly --webroot -w /var/www/certbot \
  -d thesortedclub.com -d www.thesortedclub.com \
  --email thesortedclub@gmail.com --agree-tos --no-eff-email" certbot

# 5. Restore production SSL Nginx configuration
git checkout nginx/thesortedclub.conf

# 6. Reload Nginx
docker compose restart nginx
```

---

## 6. Build and Launch Production Stack

### Step 6.1: Start All Services
```bash
cd /var/www/thesortedclub
docker compose up -d --build
```

### Step 6.2: Verify Container Health
```bash
docker compose ps
```
Expected output:
```text
NAME                   IMAGE                    COMMAND                  SERVICE    CREATED          STATUS                    PORTS
sorted_club_backend    the-sorted-club-backend   "uvicorn main:app --…"   backend    10 seconds ago   Up (healthy) 8000/tcp
sorted_club_certbot    certbot/certbot:latest   "/bin/sh -c 'trap ex…"   certbot    10 seconds ago   Up
sorted_club_frontend   the-sorted-club-frontend  "nginx -g 'daemon of…"   frontend   10 seconds ago   Up (healthy) 80/tcp
sorted_club_nginx      the-sorted-club-nginx     "nginx -g 'daemon of…"   nginx      10 seconds ago   Up (healthy) 0.0.0.0:80->80/tcp, 0.0.0.0:443->443/tcp
sorted_club_postgres   postgres:16-alpine       "docker-entrypoint.s…"   postgres   10 seconds ago   Up (healthy) 5432/tcp
```

### Step 6.3: Apply Database Migrations
```bash
docker compose exec backend alembic upgrade head
```

---

## 7. Health & Production Probes Verification

Run the automated verification diagnostic script:

```bash
chmod +x scripts/verify_vps.sh
./scripts/verify_vps.sh thesortedclub.com
```

Or test the deployed stack directly via public curl endpoints:

```bash
# 1. Check Liveness probe
curl -I https://thesortedclub.com/health
# Response: HTTP/2 200 {"status": "healthy"}

# 2. Check Readiness probe (App + PostgreSQL connection)
curl -I https://thesortedclub.com/ready
# Response: HTTP/2 200 {"status": "ready", "database": "connected"}

# 3. Check Homepage
curl -I https://thesortedclub.com/
# Response: HTTP/2 200

# 4. Check SPA Client-Side Routing Fallback
curl -I https://thesortedclub.com/admin
curl -I https://thesortedclub.com/services/build
# Response: HTTP/2 200 (Serves index.html)
```

---

## 8. Automated Database Backup & Disaster Recovery

### Step 8.1: Executable Backup Script
The repository includes `./scripts/backup_db.sh`:
```bash
chmod +x scripts/backup_db.sh
./scripts/backup_db.sh /var/backups/sorted_club
```

### Step 8.2: Schedule Daily 2:00 AM Cron
```bash
sudo crontab -e
```
Add:
```cron
0 2 * * * /var/www/thesortedclub/scripts/backup_db.sh /var/backups/sorted_club >> /var/log/sorted_club_backup.log 2>&1
```

### Step 8.3: Safe Database Restore
To restore from an archive:
```bash
chmod +x scripts/restore_db.sh
./scripts/restore_db.sh /var/backups/sorted_club/sorted_club_YYYYMMDD_HHMMSS.sql.gz
```

---

## 9. Application Update & Rollback Procedures

### Standard Zero-Downtime Update Workflow
```bash
cd /var/www/thesortedclub

# 1. Pull latest code
git pull origin main

# 2. Rebuild and restart services
docker compose up -d --build

# 3. Apply database migrations
docker compose exec backend alembic upgrade head

# 4. Verify system readiness
curl -f https://thesortedclub.com/ready
```

### Rollback Workflow
If an issue occurs:
```bash
cd /var/www/thesortedclub

# 1. Revert to previous Git commit
git checkout <PREVIOUS_STABLE_COMMIT_HASH>

# 2. Roll back database migration if needed
docker compose exec backend alembic downgrade -1

# 3. Rebuild and restart services
docker compose up -d --build

# 4. Verify readiness
curl -f https://thesortedclub.com/ready
```

---

## 10. Production Security Checklist

- [x] **No Default Secrets**: `ADMIN_PASSWORD`, `ADMIN_SECRET_KEY`, and `POSTGRES_PASSWORD` generated with cryptographic randomness.
- [x] **PostgreSQL Isolated**: PostgreSQL port 5432 accessible only within internal Docker bridge network.
- [x] **CORS Origins Enforced**: Explicitly locked to `https://thesortedclub.com` and `https://www.thesortedclub.com`. Wildcards rejected.
- [x] **Strict Security Headers**: HSTS, CSP, X-Content-Type-Options, X-Frame-Options, Referrer-Policy, Permissions-Policy.
- [x] **Payload Size Protection**: 5 MB body size limit enforced at Nginx and FastAPI middleware levels.
- [x] **Rate Limiting**: Active on `/login`, `/leads`, `/confirm-payment`, and diagnostic endpoints.
- [x] **SSL Modern Cipher Suite**: TLS 1.2 and TLS 1.3 enforced with automated Certbot renewal.
- [x] **Non-Root Containers**: FastAPI backend runs as dedicated non-root user `sortedclub`.
- [x] **Daily Automated Backups**: 14-day retention with scheduled cron.
