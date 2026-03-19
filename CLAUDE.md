# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

JXT Frontend is a dual-runtime Vue 2 application for digital evidence management. The same codebase serves two distinct modes:
- **Platform Mode** (`platform.jxt.com`): Tenant Management Station - connects to tenant-service:8010
- **Business Mode** (`app.jxt.com`): Business Management Station - connects to security-management:8000 + microservices

Runtime mode is determined at build time via `VUE_APP_MODE` environment variable.

## Common Development Commands

```bash
# Install dependencies (Node.js v14.16.0+, npm 6.14.11+)
npm install

# Development server (business mode, default)
npm run dev

# Development server (platform mode)
VUE_APP_MODE=platform npm run dev

# Production build
npm run build:prod

# Staging build
npm run build:stage

# Lint code
npm run lint

# Run unit tests
npm run test:unit

# Generate new component/view (plop generator)
npm run new
```

## Architecture

### Dual-Runtime Pattern

The codebase differentiates between platform and business modes through:
1. **Configuration keys**: Platform uses `console_app_name`, `console_app_logo`; Business uses `sys_app_name`, `sys_app_logo`
2. **API endpoints**: Platform uses `/api/v1/configs/frontend`; Business uses `/api/v1/app-config`
3. **Environment variable**: `process.env.VUE_APP_MODE === "platform"` in code

### CQRS Implementation

Evidence management APIs implement Command Query Responsibility Segregation:
- **Read operations** (GET requests) → `evidence-query:8002`
- **Write operations** (POST/PUT/DELETE) → `evidence-command:8001`

API files are split accordingly:
- `src/api/evidence/evidence_manage_query_api.js` - Read operations
- `src/api/evidence/evidence_manage_command_api.js` - Write operations

### Key Directories

```
src/
├── api/                    # API definitions organized by domain
│   ├── admin/             # Admin system APIs
│   ├── evidence/          # Evidence management (split query/command)
│   ├── platform/          # Platform-specific APIs
│   └── process/           # Workflow APIs
├── components/            # Reusable components
│   ├── MediaDetailDialog/ # Media viewer with built-in dictionary management
│   └── TaskProcessDialog  # Workflow approval interface
├── layout/                # Layout components
├── mixins/                # Vue mixins (workflowMixin for workflow logic)
├── router/                # Vue Router config with dynamic route loading
├── store/                 # Vuex modules (user, permission, app, etc.)
├── utils/                 # Utilities (request.js for axios configuration)
└── views/                 # Page components
```

## Authentication & Authorization

1. JWT token stored in cookies (via `js-cookie`)
2. Token attached to requests via `Authorization: Bearer {token}` header in `src/utils/request.js`
3. 401 responses trigger re-login prompt
4. Dynamic route loading based on user roles via `src/store/modules/permission.js`

## Component Patterns

### Dictionary Management
Components like `MediaDetailDialog` manage their own dictionary data using `getDicts()` API. Look for patterns like:
```javascript
async loadDictionaryOptions() {
  const [mediaCateRes, videoClarityRes] = await Promise.all([
    this.getDicts("evidence_media_type"),
    this.getDicts("video_clarity"),
  ]);
  this.mediaCateOptions = mediaCateRes.data || [];
}
```

### Workflow Integration
Use `workflowMixin` for workflow-related functionality:
- `startWorkflowInstance(workflowName, inputData, onSuccess, onError)`
- `loadTaskForProcessing(taskId, onReady)`
- `submitTaskApproval(formRef, onSuccess)`
- `submitTaskRejection(formRef, onSuccess)`

The mixin provides intelligent field type detection (date, boolean, number, textarea, email, tel, url, approver) and Chinese label generation from English field names.

### Media Name Click-to-View
In workflow history, media names are clickable links that open `MediaDetailDialog`. Pattern:
```javascript
async handleMediaNameClick(mediaName) {
  const response = await GetMediaByName(mediaName);
  if (response.code === 200 && response.data) {
    this.currentMediaData = response.data;
    this.mediaDetailDialogVisible = true;
  }
}
```

## Request/Response Handling

- Base API URL from `process.env.VUE_APP_BASE_API` (configured in `.env` files)
- Request interceptor adds JWT token and `Content-Type: application/json`
- Response interceptor handles 401, token refresh, and blob responses (file downloads)
- Standard response format: `{ code: number, msg: string, data: any }`

## Build Configuration

- **Webpack**: Via `@vue/cli-service` with custom config in `vue.config.js`
- **Code splitting**: Separate chunks for elementUI, libs, and commons
- **Gzip compression**: Enabled for files >10KB
- **SVG icons**: Using `svg-sprite-loader` (icons in `src/icons/svg/`)
- **Images**: url-loader for files <4KB, file-loader for larger

## Deployment

Docker deployment uses multi-stage builds in `deploy/dual-runtime/`:
- Nginx reverse proxy routes based on domain and HTTP method
- CQRS routing implemented at Nginx level
- Environment variables configure upstream service addresses

## State Management (Vuex)

Key modules:
- `user`: Authentication state and user profile
- `permission`: Dynamic route generation based on roles
- `app`: UI settings (sidebar, device detection)
- `tagsView`: Navigation history for tabs
- `settings`: System configuration

## Conventions

- **File naming**: PascalCase for components, camelCase for utilities
- **API organization**: Split by domain and CQRS pattern for evidence APIs
- **Error handling**: Global interceptor in `request.js`, user-friendly messages
- **Pre-commit hooks**: Husky + lint-staged runs ESLint with auto-fix
- **Lazy loading**: Routes use dynamic imports via `loadView()` helper

## Testing

- Unit tests with Jest (`npm run test:unit`)
- Test files co-located with components or in `tests/unit/`
- Vue Test Utils for component testing
