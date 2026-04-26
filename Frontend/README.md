# Smart Coaching Center — React + Vite

## Setup

```bash
# Install dependencies
npm install

# Copy env file and configure
cp .env.example .env
# Edit .env and set your backend URL

# Start development server
npm run dev

# Build for production
npm run build
```

## Changes from CRA → Vite

| Before (CRA)                          | After (Vite)                          |
|---------------------------------------|---------------------------------------|
| `process.env.REACT_APP_*`             | `import.meta.env.VITE_*`              |
| `src/index.js`                        | `src/main.jsx`                        |
| `react-scripts start`                 | `vite`                                |
| `react-scripts build`                 | `vite build`                          |
| `public/index.html` (injected)        | `index.html` at root (explicit)       |

## Environment Variables

All env vars use `VITE_` prefix (see `.env.example`):

```
VITE_API_BASE_URL=http://localhost:8000/api/v1
VITE_API_TIMEOUT=10000
VITE_APP_NAME=Smart Coaching Center
VITE_ENABLE_AI_ENGINE=true
VITE_ENABLE_NOTIFICATIONS=true
VITE_ENABLE_ANALYTICS=false
```

## Project Structure

```
src/
├── main.jsx              # Entry point
├── App.jsx               # Root component & routing
├── index.css             # Global styles + Tailwind
├── components/           # Shared UI components
├── constants/            # Config & constants
├── hooks/                # Custom React hooks
├── layouts/              # Page layouts
├── pages/                # Route pages
│   └── dashboards/       # Role-specific dashboards
├── services/             # API client (axios)
├── stores/               # Zustand state stores
└── utils/                # Helper utilities
```
