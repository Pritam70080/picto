# Picto

Picto is a personal photo library for keeping images organized and easy to revisit. Upload or import photos, group them into albums, and manage your collection from a responsive web app. The API handles accounts, photo and album operations, storage usage, and AI-powered image transformations.

## Features

- Register, sign in, refresh sessions, and securely access your personal library.
- Upload photos or import existing ImageKit assets.
- Browse and search photos; archive, restore, move to trash, or permanently delete them.
- Create albums, add or remove photos, and choose album cover images.
- Preview and apply AI photo transformations.
- View library photo counts and storage usage.
- Use a responsive interface designed for mobile and desktop.

## Technology

### Frontend

- Next.js 16 (App Router), React 19, and TypeScript
- Tailwind CSS 4 and shadcn/ui
- Zustand for shared client state
- TanStack Query for server state and API caching
- Zod for request and form validation
- Motion for interface animations

### Backend

- Java 21 and Spring Boot 4
- Spring Web MVC, Spring Security, and Spring Data JPA
- PostgreSQL
- JSON Web Tokens (JWT) for authentication
- ImageKit for image storage and image transformations
- Maven for dependency management and builds

## Prerequisites

- Node.js and npm
- Java 21
- PostgreSQL
- An ImageKit account and API credentials

## Configuration

Configure these environment variables for the backend before starting it:

| Variable | Required | Description |
| --- | --- | --- |
| `DATABASE_URL` | Yes | JDBC connection URL, for example `jdbc:postgresql://localhost:5432/picto` |
| `DATABASE_USERNAME` | Yes | PostgreSQL username |
| `DATABASE_PASSWORD` | Yes | PostgreSQL password |
| `JWT_SECRET` | Yes | Secret used to sign tokens; use a strong, unique secret outside local development |
| `IMAGEKIT_PUBLIC_KEY` | Yes | ImageKit public API key |
| `IMAGEKIT_PRIVATE_KEY` | Yes | ImageKit private API key |
| `IMAGEKIT_URL_ENDPOINT` | No | ImageKit URL endpoint; defaults to the placeholder in the backend configuration |
| `CORS_ALLOWED_ORIGINS` | No | Allowed frontend origin; defaults to `http://localhost:3000` |
| `ACCESS_TOKEN_EXPIRY` | No | Access-token lifetime in milliseconds; defaults to `900000` |
| `REFRESH_TOKEN_EXPIRY` | No | Refresh-token lifetime in milliseconds; defaults to `604800000` |

The frontend uses `NEXT_PUBLIC_API_URL` to select the API base URL. It defaults to `http://localhost:8000/api`.

## Run locally

Start the backend from the `backend` directory:

```powershell
.\mvnw.cmd spring-boot:run
```

Start the frontend from the `frontend` directory:

```powershell
npm install
npm run dev
```

The frontend is available at [http://localhost:3000](http://localhost:3000), and the backend API is available at [http://localhost:8000/api](http://localhost:8000/api).

## Useful commands

Run these from the `frontend` directory:

```bash
npm run lint
npm run build
```

Run backend tests from the `backend` directory:

```powershell
.\mvnw.cmd test
```