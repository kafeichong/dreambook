# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

DreamBook (梦境解析) - An AI-powered dream interpretation touch-screen application built with Electron, React, and Node.js. Uses DeepSeek API for dream analysis. Designed for public kiosks and touch-screen displays.

## Commands

```bash
# Development
yarn dev                    # Start Vite dev server (localhost:5173)
yarn dev:backend           # Start backend server (localhost:3000)
yarn electron:dev          # Start Electron app in dev mode

# Building
yarn build                 # Full build (TypeScript check + Vite + backend + electron)
yarn build:skip-check      # Build without TypeScript checks

# Linting
yarn lint                  # Run ESLint

# Electron Packaging
yarn electron:build:mac    # Package for macOS
yarn electron:build:win    # Package for Windows
yarn electron:dmg          # Create macOS DMG (universal)
```

## Architecture

### Frontend (React + Vite)
- **Entry:** `src/main.tsx` → `src/App.tsx`
- **Routing:** HashRouter (for Electron file:// compatibility)
  - `/` → HomePage (intro)
  - `/navigation` → NavigationPage
  - `/dream/:id` → DetailPage
  - `/ai-chat` → AIChat (main dream interpretation interface)
- **Visual Effects:** Multiple animated backgrounds using Three.js, Pixi.js, and GSAP in `src/components/`

### Backend (Express.js)
- **Entry:** `backend/src/index.ts`
- **API:** POST `/api/dream-chat` - accepts `{ question: string }`, returns `{ answer: string }`
- **DeepSeek Integration:** `backend/src/services/deepseek.ts`
- **System Prompt:** `backend/src/prompts/system.ts`
- **Config:** API key and settings in `backend/.env`

### Electron
- **Main Process:** `electron/main.ts` - window management, backend process control, virtual keyboard (Windows), global shortcuts
- **Preload:** `electron/preload.ts` - IPC for keyboard control
- **Logs:** Written to `~/dreambook-logs/`

## Key Configuration

- **TypeScript:** Strict mode enabled in `tsconfig.app.json`
- **Path Aliases:** `@/` maps to `src/`, also `@components`, `@pages`, etc.
- **Package Manager:** Yarn 4 with PnP
- **Workspaces:** Main app + `backend/`

## Touch-Screen Features

- Frameless fullscreen windows in production
- Windows virtual keyboard integration via TabTip.exe
- GPU acceleration enabled
- Touch-optimized UI components
