# JXT Frontend - Dual-Runtime Architecture

The frontend project for JXT Digital Evidence Management System, adopting a **dual-runtime architecture** that supports both platform control station and business management station modes.

## Architecture

### Dual-Runtime Architecture

This project uses a single codebase with two builds, distinguishing between two runtime modes via the build-time environment variable `VUE_APP_MODE`:

| Runtime Mode | Domain | Purpose | Backend Service |
|--------------|--------|---------|-----------------|
| **Platform** | `platform.jxt.com` | Platform Control Station | platform-control-service:8010 |
| **Business** | `app.jxt.com` | Business Management Station | security-management:8000 + microservices |

### Build-Time Differences

Differences between the two modes are determined at build time:

```javascript
// Configuration key mapping
Platform: console_app_name, console_app_logo
Business:  sys_app_name, sys_app_logo

// API endpoint mapping
Platform: /api/v1/configs/frontend
Business: /api/v1/app-config
```

## Directory Structure

```
jxt-frontend/
├── deploy/                    # Deployment configuration
│   └── dual-runtime/         # Dual-runtime deployment
│       ├── Dockerfile.dual-runtime
│       ├── docker-compose.prod.yml
│       └── nginx/            # Nginx configuration
│           ├── nginx.conf    # Main config (DNS resolver + backend maps)
│           └── conf.d/
│               └── dual-runtime.conf  # Routing configuration
├── public/                   # Static assets
├── src/                      # Source code
│   ├── api/                 # API definitions
│   ├── assets/              # Asset files
│   ├── components/          # Components
│   ├── layout/              # Layout components
│   ├── router/              # Router configuration
│   ├── store/               # Vuex state management
│   ├── utils/               # Utility functions
│   └── views/               # Page views
├── package.json
└── README.md
```

## Local Development

### Prerequisites

- Node.js: v14.16.0+
- npm: 6.14.11+

### Install Dependencies

```bash
npm install
```

### Development Server

```bash
# Start development server (default: business mode)
npm run dev

# To test platform mode, set environment variable
VUE_APP_MODE=platform npm run dev
```

Access: http://localhost:8080

## Docker Deployment

### Build Image

The project uses `Dockerfile.dual-runtime` for multi-stage builds, generating static assets for both platform and business stations:

```bash
cd deploy/dual-runtime
docker-compose -f docker-compose.prod.yml build
```

### Start Services

```bash
# Start frontend services
docker-compose -f docker-compose.prod.yml up -d

# View logs
docker-compose -f docker-compose.prod.yml logs -f
```

### Environment Variables

Configure the following environment variables in `docker-compose.prod.yml`:

| Variable | Description | Default Value |
|----------|-------------|---------------|
| `PLATFORM_SERVER_NAME` | Platform station domain | `platform.jxt.com` |
| `BUSINESS_SERVER_NAME` | Business station domain | `app.jxt.com` |
| `PLATFORM_UPSTREAM` | Platform backend address | `http://platform-control-service:8010` |
| `SECURITY_MANAGEMENT_UPSTREAM` | Security management backend | `http://security-management:8000` |
| `EVIDENCE_QUERY_UPSTREAM` | Evidence query service | `http://evidence-query:8002` |
| `EVIDENCE_COMMAND_UPSTREAM` | Evidence command service | `http://evidence-command:8001` |
| `PROCESS_MANAGEMENT_UPSTREAM` | Process management service | `http://process-management-api:8003` |
| `FILE_STORAGE_UPSTREAM` | File storage service | `http://file-storage-service:8004` |

## Nginx Routing Configuration

### CQRS Read-Write Separation

Business station evidence management APIs use CQRS pattern, routing to different services based on HTTP request method:

```nginx
# GET requests -> Query service (read-only)
# POST/PUT/DELETE -> Command service (write)

map $request_method $media_backend {
    GET     http://evidence-query:8002;
    default http://evidence-command:8001;
}
```

### API Routing Table

| API Path | GET Route | Other Methods Route |
|----------|-----------|---------------------|
| `/api/v1/media` | evidence-query:8002 | evidence-command:8001 |
| `/api/v1/archives` | evidence-query:8002 | evidence-command:8001 |
| `/api/v1/cases` | evidence-query:8002 | evidence-command:8001 |
| `/api/v1/writs` | evidence-query:8002 | evidence-command:8001 |
| `/api/workflows` | process-management-api:8003 | process-management-api:8003 |
| `/api/v1/documents` | file-storage-service:8004 | file-storage-service:8004 |
| `/api/*` (others) | security-management:8000 | security-management:8000 |

## Configuration Key Adaptation

### Platform Mode

```javascript
// Frontend code selects config keys based on VUE_APP_MODE
computed: {
  appName() {
    return this.sysInfo.console_app_name || 'Platform Control'
  },
  logoUrl() {
    return this.sysInfo.console_app_logo || ''
  }
}
```

### Business Mode

```javascript
computed: {
  appName() {
    return this.sysInfo.sys_app_name || 'Business Management'
  },
  logoUrl() {
    return this.sysInfo.sys_app_logo || ''
  }
}
```

## Access URLs

After deployment, access via:

- **Platform Control Station**: http://platform.jxt.com:8080
- **Business Management Station**: http://app.jxt.com:8080

## Troubleshooting

### 1. Logo Image Not Displaying

Ensure the backend-configured logo path is `/static/uploadfile/logo.png` and Nginx has the `/static/uploadfile` proxy rule configured.

### 2. API Requests Return 404

Check:
- Nginx configuration includes the corresponding `location` rule
- Backend services are running normally
- DNS resolution is working (`resolver 127.0.0.11`)

### 3. Configuration Key Name Mismatch

Confirm the API endpoint in `src/api/login.js` matches the actual backend route:
- Platform: `/api/v1/configs/frontend`
- Business: `/api/v1/app-config`

## Related Projects

- [platform-control-service](../platform-control-service) - Platform control backend service
- [security-management](../security-management) - Security management backend service
- [evidence-management](../evidence-management) - Evidence management microservices
- [file-storage-service](../file-storage-service) - File storage service
- [infrastructure](../infrastructure) - Shared infrastructure (etcd, RedPanda)

## License

Copyright (c) 2020-2025 JXT Team
