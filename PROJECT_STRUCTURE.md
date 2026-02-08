# ELOCAB - Project Structure

## 📁 Complete File Structure

```
new elocab/
├── README.md                          # Complete setup guide
├── QUICKSTART.md                      # Quick start instructions
│
├── server/                            # Backend (Node.js + Express)
│   ├── .env                          # Environment variables (configured)
│   ├── .env.example                  # Environment template
│   ├── .gitignore                    # Git ignore file
│   ├── package.json                  # Backend dependencies
│   ├── server.js                     # Main server file with Socket.io
│   │
│   ├── models/                       # Database schemas
│   │   ├── User.js                   # User model (authentication)
│   │   ├── Driver.js                 # Driver profile model
│   │   ├── Customer.js               # Customer profile model
│   │   └── Booking.js                # Booking model
│   │
│   ├── controllers/                  # Business logic
│   │   ├── authController.js         # Login, register, admin login
│   │   ├── driverController.js       # Driver operations
│   │   ├── customerController.js     # Customer operations
│   │   ├── bookingController.js      # Booking operations
│   │   └── adminController.js        # Admin operations
│   │
│   ├── routes/                       # API endpoints
│   │   ├── authRoutes.js            # /api/auth/*
│   │   ├── driverRoutes.js          # /api/drivers/*
│   │   ├── customerRoutes.js        # /api/customers/*
│   │   ├── bookingRoutes.js         # /api/bookings/*
│   │   └── adminRoutes.js           # /api/admin/*
│   │
│   ├── middleware/                   # Custom middleware
│   │   └── auth.js                  # JWT authentication & role checks
│   │
│   └── utils/                        # Helper functions
│       └── generateToken.js         # JWT token generator
│
└── client/                           # Frontend (React + Vite)
    ├── .gitignore                   # Git ignore file
    ├── package.json                 # Frontend dependencies
    ├── vite.config.js              # Vite configuration
    ├── tailwind.config.js          # Tailwind CSS config
    ├── postcss.config.js           # PostCSS config
    ├── index.html                  # HTML entry point
    │
    ├── public/                      # Static assets
    │   └── images/                 # 📸 ADD YOUR IMAGES HERE
    │       ├── logo.png            # Company logo
    │       └── cars/               # Car photos folder
    │           ├── nissan-caravan.jpg
    │           ├── toyota-hiace.jpg
    │           ├── toyota-voxy.jpg
    │           └── toyota-vitz.jpg
    │
    └── src/                         # React source code
        ├── main.jsx                 # React entry point
        ├── App.jsx                  # Main app component with routing
        ├── index.css                # Global styles (Tailwind)
        │
        ├── context/                 # React Context providers
        │   ├── AuthContext.jsx      # Authentication state
        │   └── SocketContext.jsx    # Real-time notifications
        │
        ├── components/              # Reusable components
        │   ├── Navbar.jsx           # Navigation bar
        │   ├── Footer.jsx           # Footer component
        │   └── ProtectedRoute.jsx   # Route protection wrapper
        │
        └── pages/                   # Page components
            ├── LandingPage.jsx      # Homepage with car carousel
            ├── LoginPage.jsx        # User login
            ├── RegisterPage.jsx     # User registration
            ├── AdminLoginPage.jsx   # Admin login
            │
            └── dashboards/          # Dashboard pages
                ├── CustomerDashboard.jsx  # Customer features
                ├── DriverDashboard.jsx    # Driver features
                └── AdminDashboard.jsx     # Admin features
```

## 🎯 What's Built

### Backend Features

✅ RESTful API with Express.js
✅ MongoDB database with Mongoose
✅ JWT authentication system
✅ Socket.io real-time communication
✅ Role-based access control (Customer, Driver, Admin)
✅ Password hashing with bcrypt
✅ Input validation
✅ Security with Helmet & CORS
✅ Environment variable configuration

### Frontend Features

✅ Modern React 18 application
✅ Vite for fast development
✅ Tailwind CSS styling (Navy Blue #000080 & Orange #ff6600)
✅ Responsive design (mobile-friendly)
✅ Real-time notifications with Socket.io
✅ Toast notifications for user feedback
✅ Protected routes by user role
✅ Car carousel on landing page (Swiper.js)

### User Roles & Capabilities

**Customer:**

- Register with personal details
- Login with email/password
- Book rides (Dropping or Hiring)
- View booking history
- See real-time booking status updates
- Edit profile
- See assigned driver details

**Driver:**

- Register with car and license details
- Login with email/password
- Toggle availability (Online/Offline)
- View assigned rides
- Accept rides
- Update ride status (On The Way → Picked Up → Completed)
- View ride history
- Edit profile
- Receive real-time notifications for new assignments

**Admin:**

- Special admin login portal
- Dashboard with statistics
- View all users (Drivers & Customers)
- View all bookings (Pending, Active, Completed)
- Assign drivers to bookings
- Manage drivers (activate/deactivate, delete)
- Manage customers (delete)
- Real-time notifications for new bookings

### Real-Time Features (Socket.io)

✅ New booking notifications (Admin)
✅ Driver assignment notifications (Driver & Customer)
✅ Booking status update notifications (All parties)
✅ Driver availability change notifications (Admin)
✅ Sound notifications
✅ Toast popup notifications

## 🎨 Design Colors

- **Primary:** #000080 (Navy Blue) - Trust & Professionalism
- **Secondary:** #ff6600 (Orange) - Energy & Action
- **Neutral:** White
- **Gradients:** Used throughout for modern look

## 🔑 Default Admin Credentials

- **Email:** admin@elocab.com
- **Password:** Admin@2026

(Change these in production!)

## 📊 Database Models

### User

- email, password (hashed), role (customer/driver/admin)

### Driver

- name, baseLocation, carType, carNumber, licenseNumber
- seats, contactNumber, isAvailable (online/offline)
- userId (reference to User)

### Customer

- name, phoneNumber, digitalAddress, city
- userId (reference to User)

### Booking

- customerId, driverId (optional until assigned)
- serviceType, dateTime, pickupPoint, destination
- numberOfPeople, notes, status

## 🚦 Booking Status Flow

1. **pending** → Customer submitted, waiting for admin
2. **assigned** → Admin assigned a driver
3. **accepted** → Driver accepted the ride
4. **on-the-way** → Driver en route to pickup
5. **picked-up** → Passengers in vehicle
6. **completed** → Ride finished

## 🔌 API Endpoints Reference

### Auth Routes

- POST /api/auth/register - Register customer or driver
- POST /api/auth/login - User login
- POST /api/auth/admin/login - Admin login
- GET /api/auth/me - Get current user profile

### Customer Routes (Protected)

- GET /api/customers/profile - Get customer profile
- PUT /api/customers/profile - Update customer profile
- POST /api/customers/bookings - Create new booking
- GET /api/customers/bookings - Get customer bookings
- GET /api/customers/bookings/:id - Get booking by ID
- PUT /api/customers/bookings/:id/cancel - Cancel booking

### Driver Routes (Protected)

- GET /api/drivers/profile - Get driver profile
- PUT /api/drivers/profile - Update driver profile
- POST /api/drivers/toggle-availability - Toggle online/offline
- GET /api/drivers/bookings - Get assigned bookings
- POST /api/drivers/bookings/:id/accept - Accept booking
- PUT /api/drivers/bookings/:id/status - Update booking status

### Admin Routes (Protected)

- GET /api/admin/stats - Get dashboard statistics
- GET /api/admin/drivers - Get all drivers
- GET /api/admin/customers - Get all customers
- GET /api/admin/bookings - Get all bookings
- POST /api/admin/bookings/assign - Assign driver to booking
- PUT /api/admin/bookings/:id/status - Update booking status
- DELETE /api/admin/drivers/:id - Delete driver
- DELETE /api/admin/customers/:id - Delete customer
- PUT /api/admin/drivers/:id/toggle-status - Activate/deactivate driver

## 📦 Dependencies

### Backend (server/package.json)

- express - Web framework
- mongoose - MongoDB ODM
- bcryptjs - Password hashing
- jsonwebtoken - JWT authentication
- socket.io - Real-time communication
- cors - Cross-origin resource sharing
- dotenv - Environment variables
- express-validator - Input validation
- helmet - Security headers
- express-rate-limit - Rate limiting
- nodemon - Development auto-restart

### Frontend (client/package.json)

- react - UI library
- react-dom - React DOM renderer
- react-router-dom - Routing
- axios - HTTP client
- socket.io-client - Real-time client
- react-hot-toast - Notifications
- swiper - Carousel component
- vite - Build tool
- tailwindcss - CSS framework
- @vitejs/plugin-react - React plugin for Vite

## 🎉 Ready to Use!

Everything is built and configured. Just:

1. Install MongoDB
2. Run `npm install` in both server and client
3. Copy .env.example to .env in server (already done!)
4. Start both servers
5. Add your logo and car images
6. Start using ELOCAB!

**Built with ❤️ for ELOCAB**
