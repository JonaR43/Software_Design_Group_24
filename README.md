# JACS ShiftPilot

<div align="center">

**A Comprehensive Full-Stack Volunteer Management System**

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![React](https://img.shields.io/badge/React-18.3.1-blue.svg)](https://reactjs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-Latest-green.svg)](https://nodejs.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Latest-blue.svg)](https://www.postgresql.org/)

[Features](#features) • [Tech Stack](#tech-stack) • [Getting Started](#getting-started) • [Documentation](#documentation) • [Contributors](#contributors)

</div>

---

## Overview

JACS ShiftPilot is an enterprise-grade volunteer management platform that connects volunteers with community service opportunities through intelligent matching algorithms. The application streamlines the entire volunteer lifecycle from registration and onboarding, through event matching and assignment, to attendance tracking and performance analytics.

### Key Highlights

- 🤖 **AI-Powered Matching** - Intelligent volunteer-to-event matching with weighted scoring algorithm
- 🔐 **Enterprise Security** - JWT authentication, OAuth integration, and comprehensive security measures
- 📊 **Advanced Analytics** - Real-time dashboards and reporting for administrators
- 📧 **Automated Notifications** - Email notifications for key events and reminders
- ☁️ **Cloud Infrastructure** - Image management with Cloudinary CDN
- 🌐 **RESTful API** - 100+ well-documented API endpoints
- 🎨 **Modern UI/UX** - Responsive design with intuitive user interface

---

## Features

### For Volunteers
- **Profile Management** - Complete volunteer profiles with skills, interests, and availability
- **Event Discovery** - Browse and search events with intelligent filtering
- **Smart Matching** - Get matched to events based on skills, interests, and location
- **Attendance Tracking** - Check-in/check-out system with QR code support
- **Notifications** - Real-time updates on event assignments and changes
- **History & Achievements** - Track volunteer hours and view participation history

### For Administrators
- **Event Management** - Create, edit, and manage volunteer events
- **Volunteer Oversight** - View and manage volunteer profiles and assignments
- **Attendance Reports** - Comprehensive attendance tracking and reporting
- **Analytics Dashboard** - Insights into volunteer engagement and event performance
- **Bulk Operations** - Mass assignment and notification capabilities
- **User Management** - Role-based access control for admins and volunteers

### Technical Features
- **OAuth Integration** - Sign in with Google and other providers
- **Image Uploads** - Cloudinary-powered image hosting and optimization
- **Geolocation** - Google Maps integration for event locations
- **Email Service** - Automated email notifications with Nodemailer
- **Security** - Rate limiting, helmet security headers, and CORS protection
- **Testing** - Comprehensive test suite with Jest

---

## Tech Stack

### Frontend
- **React 18.3.1** - Modern UI framework
- **TypeScript 5.7.2** - Type-safe JavaScript
- **React Router 7.2.1** - Advanced routing and navigation
- **TailwindCSS 3.4.17** - Utility-first CSS framework
- **Vite 6.0.11** - Lightning-fast build tool
- **Recharts 2.15.0** - Data visualization library

### Backend
- **Node.js** - JavaScript runtime
- **Express.js 5.1.0** - Web application framework
- **Prisma 6.17.1** - Modern ORM and database toolkit
- **PostgreSQL** - Robust relational database
- **JWT 9.0.2** - Secure authentication
- **Passport.js 0.7.0** - OAuth authentication middleware
- **Cloudinary 2.5.1** - Cloud image management
- **Nodemailer 7.0.7** - Email delivery service

### DevOps & Tools
- **Docker** - Containerization
- **Jest 30.1.3** - Testing framework
- **Helmet 8.0.0** - Security middleware
- **Render** - Cloud deployment platform

---

## Getting Started

### Prerequisites

- **Node.js** (Latest LTS version)
- **PostgreSQL** (Latest version)
- **npm** or **yarn** package manager
- **Docker** (optional, for containerized deployment)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/JonaR43/Software_Design_Group_24.git
   cd Software_Design_Group_24
   ```

2. **Install dependencies**
   ```bash
   cd admin
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. **Set up the database**
   ```bash
   # Run database migrations
   cd backend
   npx prisma migrate deploy

   # Seed the database (optional)
   psql -U your_username -d your_database < ../database_mock_data_new_fixed.sql
   ```

5. **Start the development server**
   ```bash
   # Using Make
   make dev

   # Or manually
   cd admin/backend && npm run dev &
   cd admin/frontend && npm run dev
   ```

6. **Access the application**
   - Frontend: `http://localhost:5173`
   - Backend API: `http://localhost:5000`

### Docker Deployment

```bash
# Development environment
docker-compose -f docker-compose.dev.yml up

# Production environment
docker-compose up
```

### Quick Start with Make

The project includes a Makefile for common operations:

```bash
make dev          # Start development servers
make build        # Build for production
make test         # Run test suite
make db-setup     # Initialize database
make clean        # Clean build artifacts
```

---

## Project Structure

```
Software_Design_Group_24/
├── admin/
│   ├── backend/           # Express.js API server
│   │   ├── controllers/   # Route controllers
│   │   ├── middleware/    # Custom middleware
│   │   ├── routes/        # API routes
│   │   ├── services/      # Business logic
│   │   ├── prisma/        # Database schema & migrations
│   │   └── tests/         # Backend tests
│   └── frontend/          # React application
│       ├── src/
│       │   ├── components/  # Reusable components
│       │   ├── pages/       # Route pages
│       │   ├── contexts/    # React contexts
│       │   └── services/    # API services
│       └── public/          # Static assets
├── database_schema.sql          # PostgreSQL schema
├── database_mock_data_new_fixed.sql  # Sample data
├── docker-compose.yml           # Docker configuration
├── Makefile                     # Build automation
└── PROJECT_DOCUMENTATION.md     # Detailed documentation
```

---

## Documentation

Comprehensive documentation is available in the following files:

- **[PROJECT_DOCUMENTATION.md](PROJECT_DOCUMENTATION.md)** - Complete technical documentation
- **[DEMO_GUIDE.md](DEMO_GUIDE.md)** - Demo walkthrough and feature showcase
- **[AUTHENTICATION_GUIDE.md](AUTHENTICATION_GUIDE.md)** - Authentication implementation details
- **[SECURITY_IMPROVEMENTS.md](SECURITY_IMPROVEMENTS.md)** - Security enhancements and best practices
- **[DEV_COMMANDS.md](DEV_COMMANDS.md)** - Development commands and utilities
- **[JONATHAN_REYES_CONTRIBUTIONS.md](JONATHAN_REYES_CONTRIBUTIONS.md)** - Detailed contribution history

---

## API Documentation

The application provides a RESTful API with 100+ endpoints organized into the following categories:

- **Authentication** - `/api/auth/*` - Login, register, OAuth, password reset
- **Volunteers** - `/api/volunteers/*` - Profile management, matching, history
- **Events** - `/api/events/*` - Event CRUD operations, assignments
- **Attendance** - `/api/attendance/*` - Check-in/check-out, reporting
- **Notifications** - `/api/notifications/*` - Real-time notifications
- **Admin** - `/api/admin/*` - Administrative operations

For detailed API documentation, see [PROJECT_DOCUMENTATION.md](PROJECT_DOCUMENTATION.md#api-endpoints).

---

## Testing

```bash
# Run all tests
npm test

# Run backend tests
cd admin/backend && npm test

# Run frontend tests
cd admin/frontend && npm test

# Run tests with coverage
npm test -- --coverage
```

---

## Deployment

The application is configured for deployment on Render with Docker:

1. **Database** - PostgreSQL instance
2. **Backend** - Node.js web service
3. **Frontend** - Static site or SPA

See `render.yaml` for deployment configuration.

---

## Contributors

This project was developed by:

- **[Jonathan Reyes](https://github.com/JonaR43)** (JonaR43) - Lead Developer
- **[Ashmal Macknojia](https://github.com/akmackn2)** (akmackn2) - Core Contributor
- **[Santiago](https://github.com/codigotiago)** (codigotiago) - Core Contributor
- **Santi** - Contributor

### Contributing

We welcome contributions! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## Acknowledgments

- **COSC 4353** - Software Design Course
- **University of Houston** - Computer Science Department
- All open-source libraries and frameworks used in this project

---

## Contact & Support

For questions, issues, or feature requests:

- **GitHub Issues**: [Create an issue](https://github.com/JonaR43/Software_Design_Group_24/issues)
- **Email**: jonathanreyes6@hotmail.com

---

<div align="center">

**Built with ❤️ by Team JACS**

[⬆ Back to Top](#jacs-shiftpilot)

</div>
