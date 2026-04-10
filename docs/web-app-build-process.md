# Web Application Build Process

This document describes the build and containerization process for the Servicebus Browser web application.

## Overview

The build process involves compiling the Angular frontend and the Node.js backend, then packaging them into a single Docker image served by Nginx. The CI/CD pipeline automates this via GitHub Actions.

## Prerequisites

- `pnpm`
- `docker`
- Nx CLI (optional, for running specific targets)

## Local Build Process

To build the applications locally, follow these steps:

### 1. Install Dependencies

Ensure all workspace dependencies are installed:

```bash
pnpm install
```

### 2. Build Applications

Use Nx to build the frontend and backend in production mode. This will generate the necessary artifacts in the `dist/` directory.

```bash
# Build the web frontend
pnpm exec nx run servicebus-browser-web-frontend:build:production

# Build the backend
pnpm exec nx run servicebus-browser-web-backend:build:production
```

## Containerization (Docker)

The application is packaged into a Docker image that includes:

- A Node.js runtime for the backend.
- Nginx to serve the Angular frontend and proxy API requests.

### Build Docker Image

The `Dockerfile` at the root of the repository expects the compiled artifacts to be present in the `dist/` directory.

```bash
docker build -t servicebus-browser-web .
```

**Note:** The Dockerfile copies:

- Backend artifacts from `dist/apps/servicebus-browser-web-backend` to `/app/backend/`.
- Frontend artifacts from `dist/apps/servicebus-browser-web-frontend/browser` to `/usr/share/nginx/html`.
- Nginx configuration from `dockercontainer/nginx.conf` to `/etc/nginx/nginx.conf`.

### Running the Container

Run the container and map port 80:

```bash
docker run -p 80:80 servicebus-browser-web
```

The backend runs on port 3000 within the container, and Nginx proxies requests from `/api/` to `http://localhost:3333/api/`.

## CI/CD Pipeline

The build and release process is automated using GitHub Actions.

### Workflow: `build-release-container.yml`

This workflow is triggered manually via `workflow_dispatch`. It performs the following steps:

1. **Checkout code**: Retrieves the repository content.
2. **Setup Node & pnpm**: Configures the environment with Node 22 and `pnpm`.
3. **Install dependencies**: Runs `pnpm install --frozen-lockfile`.
4. **Build Applications**: Executes production builds for both frontend and backend using Nx.
5. **Docker Login**: Authenticates with GitHub Container Registry (`ghcr.io`).
6. **Metadata Extraction**: Generates tags (e.g., version number, `main`) for the image.
7. **Build and Push**: Builds the Docker image using the root `Dockerfile` and pushes it to `ghcr.io`.
8. **Artifact Attestation**: Generates build provenance.
9. **Upload Artifacts**: Uploads the `dist` directory as a workflow artifact.

## Nginx Configuration

Nginx is configured to:

- Serve the Angular SPA from `/usr/share/nginx/html`.
- Handle client-side routing by redirecting all non-file requests to `index.html`.
- Proxy all requests starting with `/api/` to the Node.js backend running on port 3333.
- Implement security headers like `Cross-Origin-Opener-Policy` and `Cross-Origin-Embedder-Policy`.
