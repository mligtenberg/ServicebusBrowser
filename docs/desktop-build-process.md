# Desktop Build Process

This document describes the process for building and packaging the Servicebus Browser desktop application using Nx and `nx-electron`.

## Overview

The desktop application is an Electron-based app that uses Angular for its frontend. The build process involves building the Angular frontend and then packaging it into a platform-specific executable (macOS, Windows, or Linux) using `nx-electron`.

## Prerequisites

- **Node.js**: Version 22 or higher
- **pnpm**: Version 10 or higher
- **Nx**: Part of the monorepo tooling

## Build Targets

The build process is managed via Nx targets defined in `apps/servicebus-browser-app/project.json`.

### 1. Development Mode

To run the application in development mode (with hot reload), use the `serve` target:

```bash
pnpm exec nx run servicebus-browser-app:serve
```

This command builds the application and launches the Electron shell.

### 2. Production Build & Release

To create a production-ready release, you must follow these steps in order:

### 2. Production Build & Release

To create a production-ready release, you must follow these steps in order. This process is also automated by the GitHub Actions workflow (`.github/workflows/build-release.yml`).

#### Step A: Patching (Version Alignment)

Before building, ensure the application version is patched to match the target release tag. This step ensures internal version strings are consistent.

```bash
pnpm run patch-files
```

#### Step B: Build the Frontend

Build the Angular frontend project with production optimizations. This generates the web assets required by the Electron shell.

```bash
pnpm exec nx run servicebus-browser-frontend:build:production
```

#### Step C: Build the Electron App

Compile the Electron main process and prepare the application structure.

```bash
pnpm exec nx run servicebus-browser-app:build:production
```

#### Step D: Creating Executables (Release)

Finally, generate platform-specific installers (e.g., `.dmg` for macOS, `.nsis` for Windows, `AppImage` for Linux).

```bash
pnpm exec nx run servicebus-browser-app:make
```

For macOS, the pipeline uses the notarization configuration to ensure compatibility with Gatekeeper:

```bash
pnpm exec nx run servicebus-browser-app:make --configuration=macos-notarize
```

The final executables will be found in `dist/executables`.

## Platform Specifics

### macOS Notarization

When using the `macos-notarize` configuration, the build process includes a post-signing step defined in `apps/servicebus-browser-app/src/app/options/mac/notorize.js`. This ensures the application is properly notarized by Apple to avoid Gatekeeper warnings.

### Windows & Linux

The packaging configuration for Windows uses `nsis` as the installer type, and for Linux, it generates an `AppImage`.
