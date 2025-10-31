# JACS ShiftPilot - Volunteer Management System

## 📋 Project Summary

JACS ShiftPilot is a comprehensive volunteer management platform designed to streamline the process of matching volunteers with community events. The system enables administrators to create and manage events, while volunteers can register, complete their profiles, and get matched with opportunities that align with their skills, availability, and preferences.

### Key Features

- **User Authentication**: Secure login/registration with JWT tokens and OAuth support (Google, GitHub, Microsoft)
- **Profile Management**: Comprehensive volunteer profiles with skills, availability, and preferences
- **Event Management**: Create, update, and manage volunteer events with location-based mapping
- **Smart Matching**: Intelligent algorithm to match volunteers with events based on skills, availability, and proximity
- **Notifications System**: Real-time notifications for assignments, reminders, and updates
- **Reporting & Analytics**: Generate participation reports and track volunteer history
- **Admin Dashboard**: Comprehensive admin interface for managing users, events, and assignments
- **Volunteer Dashboard**: Personalized dashboard showing matched events, assignments, and history

---

## 🛠️ Technology Stack

### Backend
- **Runtime**: Node.js (Express.js v5.1.0)
- **Database**: PostgreSQL with Prisma ORM (v6.17.1)
- **Authentication**:
  - JWT (jsonwebtoken v9.0.2)
  - Passport.js with OAuth 2.0 (Google, GitHub, Microsoft)
  - bcryptjs for password hashing
- **Validation**: Joi v18.0.1
- **Email**: Nodemailer v7.0.7
- **PDF Generation**: PDFKit v0.17.2
- **Testing**: Jest v30.1.3 with Supertest v7.1.4
- **Security**: Helmet v8.1.0, CORS
- **Monitoring**: Morgan (HTTP request logger)

### Frontend
- **Framework**: React 18.3.1 with React Router v7.7.1
- **Styling**: Tailwind CSS v4.1.4
- **Build Tool**: Vite v6.3.3
- **Maps**: @vis.gl/react-google-maps v1.5.5
- **Charts**: Recharts v3.2.1
- **Language**: TypeScript v5.8.3

### Database Schema (Prisma)
- **Users**: Authentication and role management
- **Profiles**: Volunteer information and preferences
- **Events**: Event details, location, and requirements
- **Skills**: Skill taxonomy and proficiency levels
- **Assignments**: Event-volunteer assignments
- **Notifications**: Real-time notification system
- **History**: Participation tracking and feedback

---

## 🏗️ System Architecture

### Architecture Pattern
The application follows a **3-tier architecture**:

```
┌─────────────────────────────────────┐
│         Frontend (React)            │
│    - React Router for navigation    │
│    - Tailwind for styling           │
│    - API service layer               │
└──────────────┬──────────────────────┘
               │ HTTP/REST API
┌──────────────┴──────────────────────┐
│       Backend (Express.js)          │
│  ┌──────────────────────────────┐   │
│  │   Routes (API Endpoints)     │   │
│  └────────────┬─────────────────┘   │
│  ┌────────────┴─────────────────┐   │
│  │  Middleware (Auth, Validation)│  │
│  └────────────┬─────────────────┘   │
│  ┌────────────┴─────────────────┐   │
│  │  Controllers (Business Logic)│   │
│  └────────────┬─────────────────┘   │
│  ┌────────────┴─────────────────┐   │
│  │   Services (Core Logic)      │   │
│  └────────────┬─────────────────┘   │
│  ┌────────────┴─────────────────┐   │
│  │  Repositories (Data Access)  │   │
│  └────────────┬─────────────────┘   │
└───────────────┼──────────────────────┘
                │ Prisma ORM
┌───────────────┴──────────────────────┐
│      Database (PostgreSQL)           │
│  - Users & Profiles                  │
│  - Events & Assignments              │
│  - Skills & Availability             │
│  - Notifications & History           │
└──────────────────────────────────────┘
```

### Design Patterns
- **Repository Pattern**: Data access abstraction through repositories
- **Service Layer Pattern**: Business logic separation
- **MVC Pattern**: Model-View-Controller structure
- **Middleware Pattern**: Request processing pipeline
- **Factory Pattern**: Object creation (validation schemas, services)

---

## 🔌 API Endpoints

### Authentication (`/api/auth`)
- `POST /register` - Register new user
- `POST /login` - Login user
- `POST /logout` - Logout user
- `GET /oauth/google` - Google OAuth login
- `GET /oauth/google/callback` - Google OAuth callback
- `GET /oauth/github` - GitHub OAuth login
- `GET /oauth/github/callback` - GitHub OAuth callback
- `GET /oauth/microsoft` - Microsoft OAuth login
- `GET /oauth/microsoft/callback` - Microsoft OAuth callback

### Profile Management (`/api/profile`)
- `GET /` - Get user profile
- `PUT /` - Update user profile
- `POST /avatar` - Upload profile avatar

### Events (`/api/events`)
- `GET /` - Get all events (with filters)
- `GET /:id` - Get event by ID
- `POST /` - Create new event (admin only)
- `PUT /:id` - Update event (admin only)
- `DELETE /:id` - Delete event (admin only)
- `GET /:id/volunteers` - Get volunteers for event

### Matching (`/api/matching`)
- `GET /recommendations` - Get recommended events for volunteer
- `POST /assign` - Assign volunteer to event (admin)
- `POST /register/:eventId` - Self-register for event (volunteer)
- `GET /assignments` - Get user's assignments
- `PUT /assignments/:id` - Update assignment status

### Notifications (`/api/notifications`)
- `GET /` - Get user notifications
- `PUT /:id/read` - Mark notification as read
- `PUT /read-all` - Mark all notifications as read
- `DELETE /:id` - Delete notification

### History (`/api/history`)
- `GET /` - Get volunteer history
- `POST /` - Record participation
- `PUT /:id` - Update history record

### Admin (`/api/admin`)
- `GET /users` - Get all users
- `GET /statistics` - Get system statistics
- `POST /bulk-notifications` - Send bulk notifications

### Reporting (`/api/reporting`)
- `GET /volunteer/:id` - Get volunteer report
- `GET /event/:id` - Get event report
- `POST /generate-pdf` - Generate PDF report

---

## 🚀 Getting Started

### Prerequisites

Before running the application, ensure you have the following installed:

- **Node.js** (v18 or higher)
- **npm** or **yarn**
- **PostgreSQL** (v14 or higher)
- **Git**

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd Software_Design_Group_24
   ```

2. **Backend Setup**

   ```bash
   # Navigate to backend directory
   cd admin/backend

   # Install dependencies
   npm install

   # Copy environment file
   cp .env.example .env

   # Edit .env file with your configuration
   # Required variables:
   # - DATABASE_URL (PostgreSQL connection string)
   # - JWT_SECRET (random secure string)
   # - PORT (default: 3001)
   # - FRONTEND_URL (default: http://localhost:5173)
   ```

3. **Database Setup**

   ```bash
   # Generate Prisma client
   npx prisma generate

   # Run database migrations
   npx prisma migrate deploy

   # Seed the database with initial data
   npm run seed
   ```

4. **Frontend Setup**

   ```bash
   # Open new terminal and navigate to frontend directory
   cd admin/frontend

   # Install dependencies
   npm install
   ```

### Running the Application

1. **Start Backend Server**
   ```bash
   # From admin/backend directory
   npm run dev
   # Or for production:
   npm start
   ```
   Backend will run on: `http://localhost:3001`

2. **Start Frontend Development Server**
   ```bash
   # From admin/frontend directory
   npm run dev
   ```
   Frontend will run on: `http://localhost:5173`

3. **Access the Application**
   - Open your browser and navigate to `http://localhost:5173`
   - Default admin credentials (if seeded):
     - Email: `admin@example.com`
     - Password: `Admin@123`
   - Default volunteer credentials:
     - Email: `volunteer@example.com`
     - Password: `Volunteer@123`

### Running Tests

```bash
# Backend tests
cd admin/backend
npm test

# Run tests with coverage
npm run test:coverage

# Watch mode
npm run test:watch
```

### Building for Production

```bash
# Build frontend
cd admin/frontend
npm run build

# Build output will be in ./build directory
# Serve with:
npm start
```

---

## 📁 Project Structure

```
Software_Design_Group_24/
├── admin/
│   ├── backend/
│   │   ├── prisma/
│   │   │   ├── schema.prisma          # Database schema
│   │   │   ├── seed.js                # Database seeding
│   │   │   └── migrations/            # Database migrations
│   │   ├── src/
│   │   │   ├── config/                # Configuration files
│   │   │   ├── controllers/           # Request handlers
│   │   │   ├── database/
│   │   │   │   └── repositories/      # Data access layer
│   │   │   ├── middleware/            # Express middleware
│   │   │   ├── routes/                # API routes
│   │   │   ├── services/              # Business logic
│   │   │   └── utils/                 # Utility functions
│   │   ├── tests/                     # Jest tests
│   │   ├── .env                       # Environment variables
│   │   ├── server.js                  # Application entry point
│   │   └── package.json
│   └── frontend/
│       ├── app/
│       │   ├── routes/                # React Router routes
│       │   │   ├── admin/             # Admin pages
│       │   │   └── client/            # Volunteer pages
│       │   ├── services/              # API service layer
│       │   ├── components/            # Reusable components
│       │   └── styles/                # CSS/Tailwind styles
│       ├── public/                    # Static assets
│       └── package.json
└── README.md                          # This file
```

---

## 🔧 Configuration

### Environment Variables

Create a `.env` file in `admin/backend/` with the following variables:

```env
# Server
PORT=3001
NODE_ENV=development
FRONTEND_URL=http://localhost:5173

# Database
DATABASE_URL="postgresql://user:password@localhost:5432/shiftpilot?schema=public"
SHADOW_DATABASE_URL="postgresql://user:password@localhost:5432/shiftpilot?schema=shadow"

# Authentication
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=24h

# OAuth (Optional)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GITHUB_CLIENT_ID=your-github-client-id
GITHUB_CLIENT_SECRET=your-github-client-secret

# Email (Optional)
EMAIL_PROVIDER=ethereal
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
```

---

## 🧪 Testing

The backend includes comprehensive unit and integration tests using Jest:

- **Coverage Goal**:
  - Branches: 79%
  - Functions: 91%
  - Lines: 90%
  - Statements: 89%

```bash
# Run all tests
npm test

# Run with coverage report
npm run test:coverage

# Watch mode (runs tests on file changes)
npm run test:watch
```

---

## 🔒 Security Features

- **Password Hashing**: bcryptjs with salt rounds
- **JWT Authentication**: Secure token-based auth
- **OAuth 2.0**: Third-party authentication
- **Helmet.js**: Security headers
- **CORS**: Configured for frontend origin
- **Input Validation**: Joi schema validation
- **SQL Injection Prevention**: Prisma ORM parameterized queries
- **XSS Protection**: Input sanitization

---

## 🐛 Troubleshooting

### Database Issues

If you need to reset the database:

```bash
cd admin/backend
node prisma/reset-minimal.js
```

### Port Already in Use

If ports 3001 or 5173 are already in use:

1. Change `PORT` in backend `.env` file
2. Update `FRONTEND_URL` in backend `.env`
3. Update API endpoint in frontend `app/services/api.ts`

### Prisma Issues

```bash
# Regenerate Prisma client
npx prisma generate

# Reset database and apply migrations
npx prisma migrate reset

# View database in browser
npx prisma studio
```

---

## 👥 Team

Group 24 - Software Design Project

---

## 📄 License

ISC License - See LICENSE file for details

---

## 🤝 Contributing

This is an academic project. For issues or suggestions, please contact the development team.

---

## 📚 Additional Resources

- [Express.js Documentation](https://expressjs.com/)
- [React Documentation](https://react.dev/)
- [Prisma Documentation](https://www.prisma.io/docs)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [JWT Best Practices](https://tools.ietf.org/html/rfc8725)
