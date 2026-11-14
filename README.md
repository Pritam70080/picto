# Picto

Picto is a personal photo library for keeping images organized and easy to revisit. Upload or import photos, group them into albums, and manage your collection from a responsive web app. The API handles accounts, photo and album operations, storage usage, and AI-powered image transformations.

## Features

- Register, sign in, refresh sessions, and securely access your personal library.
- Upload photos or import existing ImageKit assets.
- Browse and search photos; archive, restore, move to trash, or permanently delete them.
- Create albums, add or remove photos, and choose album cover images.
- Preview and apply AI photo transformations.
- View the ImageKit storage pool shared by all Picto users.
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
| `IMAGEKIT_STORAGE_QUOTA_BYTES` | No | Shared ImageKit storage cap in bytes; defaults to `3221225472` (3 GiB) for all Picto users together |
| `GOOGLE_CLIENT_ID` | Required for Google sign-in | Google OAuth web client ID used to verify Google ID tokens |
| `IMAGEKIT_URL_ENDPOINT` | No | ImageKit URL endpoint; defaults to the placeholder in the backend configuration |
| `CORS_ALLOWED_ORIGINS` | No | Allowed frontend origin; defaults to `http://localhost:3000` |
| `ACCESS_TOKEN_EXPIRY` | No | Access-token lifetime in milliseconds; defaults to `900000` |
| `REFRESH_TOKEN_EXPIRY` | No | Refresh-token lifetime in milliseconds; defaults to `604800000` |

The frontend uses `NEXT_PUBLIC_API_URL` to select the API base URL. It defaults to `http://localhost:8000`. Set `NEXT_PUBLIC_GOOGLE_CLIENT_ID` to the Google OAuth web client ID to show the Google sign-in button, and set `GOOGLE_CLIENT_ID` on the backend to the same value. Configure the web client’s authorized JavaScript origin for the frontend URL. Since `NEXT_PUBLIC_` values are included in the frontend bundle, set them in the frontend's build/deployment environment and do not use that prefix for secrets.

Google sign-in links to an existing account when the verified Google email matches. New Google accounts are created without a password credential, so they cannot sign in using email and password unless a password is set through a future account-management flow.

## Docker deployment and Docker Hub

The backend Dockerfile uses a Maven build stage and a Java 21 JRE Alpine runtime stage. From the repository root, build the image:

```bash
docker build -t picto-backend:latest ./backend
```

To publish it, create a `picto-backend` repository on Docker Hub, then log in, tag, and push the image. Replace `your-dockerhub-username` with your Docker Hub username:

```bash
docker login --username your-dockerhub-username
docker tag picto-backend:latest your-dockerhub-username/picto-backend:latest
docker push your-dockerhub-username/picto-backend:latest
```

Run the published image with the backend configuration supplied at container startup:

```bash
docker run --detach --name picto-backend --restart unless-stopped \
  --publish 8000:8000 \
  --env DATABASE_URL="jdbc:postgresql://db.example.com:5432/picto" \
  --env DATABASE_USERNAME="your-database-user" \
  --env DATABASE_PASSWORD="your-database-password" \
  --env JWT_SECRET="replace-with-a-strong-secret" \
  --env IMAGEKIT_PUBLIC_KEY="your-imagekit-public-key" \
  --env IMAGEKIT_PRIVATE_KEY="your-imagekit-private-key" \
  --env GOOGLE_CLIENT_ID="your-google-oauth-web-client-id" \
  --env IMAGEKIT_URL_ENDPOINT="https://ik.imagekit.io/your-imagekit-id" \
  --env CORS_ALLOWED_ORIGINS="https://your-frontend.example" \
  --env ACCESS_TOKEN_EXPIRY="900000" \
  --env REFRESH_TOKEN_EXPIRY="604800000" \
  your-dockerhub-username/picto-backend:latest
```

`DATABASE_URL` must be reachable from inside the container. Use the database host/service name on the Docker network or your managed database's reachable URL; `localhost` inside the container refers to the container itself. Keep credentials and signing secrets out of the image and Docker Hub. The same variables can be supplied from a protected environment file with Docker's `--env-file` option.

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

The frontend is available at [http://localhost:3000](http://localhost:3000), and the backend API is available at [http://localhost:8000](http://localhost:8000).

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