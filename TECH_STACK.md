# ELOCAB Tech Stack 🚀

## Frontend

- **Framework**: React 18.2.0
- **Build Tool**: Vite 5.0.11
- **Routing**: React Router DOM 6.21.1
- **Styling**: Tailwind CSS 3.4.1
- **State Management**: React Context API
- **HTTP Client**: Axios 1.6.5
- **Real-time Communication**: Socket.io Client 4.6.0
- **Notifications**: React Hot Toast 2.4.1
- **Carousel/Slider**: Swiper 11.0.5
- **Hosting**: Vercel

## Backend

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JSON Web Tokens (JWT)
- **Password Hashing**: bcrypt.js
- **Real-time Communication**: Socket.io
- **Security**: Helmet.js, CORS
- **Environment Variables**: dotenv
- **Scheduled Tasks**: node-cron (for monthly archiving)
- **Hosting**: Vercel Serverless Functions

## Database

- **Primary Database**: MongoDB Atlas (Cloud)
- **Schema Design**: Mongoose ODM
- **Models**:
  - User (auth & roles)
  - Customer
  - Driver
  - Booking
  - Archive (monthly data archiving)
  - Statistics (persistent metrics)

## Architecture

- **Pattern**: MERN Stack (MongoDB, Express, React, Node.js)
- **Deployment**: Serverless (Vercel)
- **API Style**: RESTful API
- **Real-time**: WebSocket (Socket.io)
- **Authentication**: JWT with Bearer tokens
- **Authorization**: Role-based (Admin, Driver, Customer)

## Key Features

- **Responsive Design**: Mobile-first with Tailwind CSS
- **Real-time Updates**: Socket.io for live booking notifications
- **Persistent Analytics**: Statistics survive data cleanup
- **Automatic Archiving**: Monthly data archiving to prevent database bloat
- **Role-based Dashboards**: Separate UI for Admin, Driver, Customer
- **Progressive Web App**: Service worker for offline support

## Development Tools

- **Version Control**: Git & GitHub
- **Package Manager**: npm
- **Development Server**: Vite (Frontend), Nodemon (Backend)
- **Code Quality**: Environment-based configuration

## Environment Configuration

- **Development**: localhost:5173 (frontend), localhost:5000 (backend)
- **Production**: Vercel deployment with environment variables
- **Database**: MongoDB Atlas (512MB free tier)

## Security Features

- Password hashing with bcrypt
- JWT-based authentication
- CORS protection
- Helmet.js security headers
- Environment variable protection
- MongoDB IP whitelisting

---

Built for ELOCAB - A modern ride-booking platform 🚗
