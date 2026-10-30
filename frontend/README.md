# Picto frontend

Responsive photo-library UI built with Next.js, shadcn/ui components, Motion, TanStack Query, and Zod.

## Run locally

```bash
npm install
npm run dev
```

By default, the frontend calls the Spring Boot API at `http://localhost:8000/api`. Set `NEXT_PUBLIC_API_URL` to override the API base URL.

## Features

- Sign up, sign in, current-user session, token refresh, and sign out.
- Upload and import photos; browse, search, archive, restore, trash, and permanently delete photos.
- Create and manage albums, including adding/removing photos and choosing an album cover.
- Preview and apply the backend's AI photo transformations.
- View library storage usage and importable ImageKit assets.

Authenticated API calls use the access token from the persisted session; expired sessions are refreshed automatically. Request payloads for photo, album, import, and AI operations are checked with Zod before being sent.

The application shell and dialogs are constrained to the viewport height. Photo and album grids scroll within their content area on mobile and desktop.
