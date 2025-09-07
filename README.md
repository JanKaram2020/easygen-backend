# Easygen task Nestjs Authentication Module

## Getting Started
### 1. Environment Variables

Create a `.env` file in the project root and configure the following variables:

```env
DB_CONNECTION=your-mongo-db-connection-string
PORT=3002

JWT_SECRET=your_access_token_secret
JWT_EXPIRES_IN=1d

JWT_REFRESH_SECRET=your_refresh_token_secret
JWT_REFRESH_EXPIRES_IN=7d

FRONTEND_URL=http://localhost:3000
```
joi validates that env variables are set correctly at startup

### 2. Start the development server:
```bash
$ yarn install
```

### 3. Run the project
```bash
$ yarn start
```
## Endpoints
Swagger [http://localhost:3002/api/](http://localhost:3002/api/)

## Auth Routes
| Method | Endpoint                                              | Description                           | Auth Required |
| ------ |-------------------------------------------------------| ------------------------------------- | ------------- |
| POST   | [`/auth/signup`](http://localhost:3002/auth/signup)   | Register a new user                   | ❌             |
| POST   | [`/auth/login`](http://localhost:3002/auth/login)     | Login with email + password           | ❌             |
| POST   | [`/auth/refresh`](http://localhost:3002/auth/refresh) | Get a new access token (refresh flow) | ❌             |
| POST   | [`/auth/logout`](http://localhost:3002/auth/logout)   | Invalidate refresh token / logout     | ✅             |
| GET    | [`/auth/me`](http://localhost:3002/auth/me)           | Get current user profile              | ✅             |

## Tech Stack
1. `NestJS`
2. `TypeScript`
3. `MongoDB`
4. `Mongoose`
5. `@nestjs/jwt`
6. `passport / passport-jwt`
7. `bcrypt`
8. `cookie-parser`
9. `class-validator / class-transformer`
10. `@nestjs/config`
11. `joi`
12. `@nestjs/swagger`
13. `ESLint + Prettier`

## Authentication Flow

This project uses **JWT (JSON Web Tokens)** for authentication with **access tokens** and **refresh tokens**.

### Access Token
- Short-lived (e.g. maximum 1 day)
- Stored in `localStorage` or in `memory`
- Returned to the frontend after login/signup.
- Expected in the Authorization: Bearer <token> header for every authenticated API request.

### Refresh Token
- Long-lived (e.g., 7 days).
- Sent from the backend as a Secure `cookie`
- Used only to request a new access token when the old one expires.

### Flow

1. **Login / Signup**
    - User submits credentials to `/auth/login` or `/auth/signup`.
    - Backend responds with:
        - `accessToken` → to be stored by the frontend (e.g., localStorage or memory).
        - `refreshToken` → sent as a secure cookie.

2. **Authenticated Requests**
    - For protected routes, the frontend must send:
      ```
      Authorization: Bearer <accessToken>
      ``` 
      Backend verifies the token before granting access.

3. **Token Expiration**
    - When the access token expires, the backend responds with `401 Unauthorized`.

4. **Token Refresh**
    - The frontend calls `/auth/refresh`:
    - The frontend sends the refresh token cookie automatically.
    - Backend validates the refresh token, issues a new access token, and sets a new refresh token cookie.
    - The old refresh token is invalidated.

5. **Logout**
    - Client requests `auth/logout`
    - Backend clears the refresh token from `cookies`. 
    - Frontend should clear the access token from storage.