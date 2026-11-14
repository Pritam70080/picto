# Picto frontend

Responsive photo-library UI built with Next.js, shadcn/ui components, Motion, TanStack Query, and Zod.

## Run locally

```bash
npm install
npm run dev
```

## Configuration

Copy `.env.example` to `.env.local` and set the values for your environment:

```env
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your-google-oauth-web-client-id
```

`NEXT_PUBLIC_API_URL` is the base URL of the backend API. For a deployed frontend, set it to the public backend URL.

Google sign-in requires a Google OAuth client ID of type **Web application**:

1. Add the frontend origin (for local development, `http://localhost:3000`) to the OAuth client’s **Authorized JavaScript origins**.
2. Set `NEXT_PUBLIC_GOOGLE_CLIENT_ID` in the frontend environment.
3. Set `GOOGLE_CLIENT_ID` to the same client ID in the backend environment.

The Google sign-in button is shown when `NEXT_PUBLIC_GOOGLE_CLIENT_ID` is set. Because it uses the `NEXT_PUBLIC_` prefix, the client ID is included in the frontend bundle; do not put secrets in `NEXT_PUBLIC_` variables. Set public frontend variables in the environment used to build/deploy the frontend.

For backend Docker build, Docker Hub publishing, and container runtime configuration, see [Docker deployment in the root README](../README.md#docker-deployment-and-docker-hub). The Dockerfile currently packages the backend only; deploy the frontend separately and point `NEXT_PUBLIC_API_URL` at that backend.

## Features

- Sign up, sign in, current-user session, token refresh, and sign out.
- Upload and import photos; browse, search, archive, restore, trash, and permanently delete photos.
- Create and manage albums, including adding/removing photos and choosing an album cover.
- Preview and apply the backend's AI photo transformations.
- View library storage usage and importable ImageKit assets.

Authenticated API calls use the access token from the persisted session; expired sessions are refreshed automatically. Request payloads for photo, album, import, and AI operations are checked with Zod before being sent.

The application shell and dialogs are constrained to the viewport height. Photo and album grids scroll within their content area on mobile and desktop.
