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
| Method | Endpoint   | Description                           | Auth Required |
| ------ | ---------- | ------------------------------------- | ------------- |
| POST   | `/signup`  | Register a new user                   | ❌             |
| POST   | `/login`   | Login with email + password           | ❌             |
| POST   | `/refresh` | Get a new access token (refresh flow) | ❌             |
| POST   | `/logout`  | Invalidate refresh token / logout     | ✅             |
| GET    | `/me`      | Get current user profile              | ✅             |

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