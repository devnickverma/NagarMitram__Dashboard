# CivicIssue Backend API

Express.js backend server for the CivicIssue platform, providing API endpoints for both the admin panel and user mobile app.

## Features

🔐 **Authentication & Authorization**: JWT-based auth with role-based access control
📊 **Issue Management**: Complete CRUD operations for civic issues
👥 **User Management**: User profiles, registration, and admin controls
📁 **File Upload**: Image upload for issue documentation
🗃️ **Database**: SQLite with Sequelize ORM for easy development
🔍 **Search & Filtering**: Advanced search capabilities
📍 **Location Services**: GPS-based issue reporting and nearby search
🛡️ **Security**: Helmet, CORS, rate limiting, input validation

## API Endpoints

### Authentication
```
POST /api/auth/register    - Register new user
POST /api/auth/login       - Login user
GET  /api/auth/verify      - Verify JWT token
```

### Issues
```
GET    /api/issues              - Get all issues (with filters)
GET    /api/issues/nearby       - Get nearby issues by location
GET    /api/issues/my-issues    - Get user's issues (authenticated)
GET    /api/issues/:id          - Get single issue
POST   /api/issues              - Create new issue (authenticated)
PUT    /api/issues/:id          - Update issue
DELETE /api/issues/:id          - Delete issue (admin only)
GET    /api/issues/stats/overview - Get system statistics
```

### Users
```
GET /api/users          - Get all users (admin/staff only)
GET /api/users/profile  - Get current user profile (authenticated)
PUT /api/users/profile  - Update user profile (authenticated)
PUT /api/users/:id      - Update any user (admin only)
```

### File Upload
```
POST /api/upload/image   - Upload single image
POST /api/upload/images  - Upload multiple images
GET  /api/upload/:filename - Serve uploaded file
```

### System
```
GET /api/health - Health check endpoint
```

## Installation

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Create environment file:**
   ```bash
   cp .env.example .env
   ```

3. **Update environment variables in `.env`:**
   ```env
   PORT=3001
   JWT_SECRET=your-secret-key
   NODE_ENV=development
   ```

4. **Start development server:**
   ```bash
   npm run dev
   ```

5. **Build for production:**
   ```bash
   npm run build
   npm start
   ```

## Database

- **SQLite** for development (easy setup, no external dependencies)
- **Sequelize ORM** for database operations
- **Auto-sync** database schema on startup
- **Demo data** automatically seeded on first run

### Demo Users
- **Admin**: admin@city.gov / password123
- **Staff**: sarah.j@city.gov / password123  
- **Citizens**: john.smith@email.com / password123

## Security Features

- **JWT Authentication** with 30-day expiration
- **Password hashing** with bcrypt
- **Rate limiting** (100 requests per 15 minutes)
- **Input validation** with express-validator
- **CORS** configured for frontend origins
- **Helmet** for security headers
- **File upload** validation and size limits

## Project Structure

```
src/
├── models/           # Database models (Sequelize)
├── routes/           # API route handlers
├── middleware/       # Custom middleware (auth, etc.)
├── seeders/         # Database seeders
└── app.ts           # Main application setup
```

## Usage with Frontend Apps

### Admin Panel (Next.js)
- Base URL: `http://localhost:3001/api`
- Update admin panel API calls to use this backend
- Supports all admin functionality (user management, issue assignment, etc.)

### User App (React Native)
- Base URL: `http://localhost:3001/api`
- Update mobile app API service to connect
- Supports issue reporting, authentication, profile management

## API Response Format

### Success Response
```json
{
  "data": {...},
  "message": "Success"
}
```

### Error Response
```json
{
  "error": "Error message",
  "details": [...]
}
```

### Pagination Response
```json
{
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 100,
    "pages": 10
  }
}
```

## Development

The server includes:
- **Auto-restart** with nodemon
- **TypeScript** compilation
- **Error logging** with morgan
- **Demo data** for testing
- **CORS** enabled for local development

Start all three components:
1. Backend: `npm run dev` (port 3001)
2. Admin Panel: `npm run dev` (port 3000)
3. User App: `npm start` (port 19006)

## Production Deployment

1. Build the TypeScript code:
   ```bash
   npm run build
   ```

2. Start production server:
   ```bash
   npm start
   ```

3. Consider using PostgreSQL for production instead of SQLite
4. Set proper environment variables
5. Configure proper CORS origins
6. Set up file storage (AWS S3, etc.)

## License

MIT License