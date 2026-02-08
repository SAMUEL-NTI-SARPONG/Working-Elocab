# ELOCAB - Ride Sharing Platform

**Reliable rides anytime, Your Journey our priority**

A modern, full-stack ride-sharing and car hiring platform built for Kumasi, Ghana. ELOCAB connects customers who need transportation services with drivers who offer dropping and hiring services.

---

## 🚀 Features

### For Customers

- ✅ Quick and easy booking system
- ✅ Real-time booking status updates
- ✅ Booking history tracking
- ✅ Profile management
- ✅ Push notifications for booking updates

### For Drivers

- ✅ Driver registration with car details
- ✅ Online/Offline availability toggle
- ✅ View assigned rides
- ✅ Update ride status (On the way → Picked up → Completed)
- ✅ Ride history
- ✅ Real-time notifications for new assignments
- ✅ Profile editing

### For Admins

- ✅ Comprehensive dashboard with statistics
- ✅ User management (Drivers & Customers)
- ✅ Booking management
- ✅ Driver assignment to bookings
- ✅ Real-time notifications for new bookings
- ✅ View all pending, active, and completed rides

---

## 🛠️ Tech Stack

### Backend

- **Node.js** + **Express.js** - Server framework
- **MongoDB** + **Mongoose** - Database
- **Socket.io** - Real-time communication
- **JWT** - Authentication
- **bcrypt** - Password hashing

### Frontend

- **React 18** - UI library
- **Vite** - Build tool
- **Tailwind CSS** - Styling
- **React Router** - Navigation
- **Axios** - HTTP client
- **Socket.io-client** - Real-time updates
- **React Hot Toast** - Notifications
- **Swiper.js** - Car carousel

---

## 📦 Installation & Setup

### Prerequisites

- **Node.js** (v18 or higher) - [Download here](https://nodejs.org/)
- **MongoDB** - [Download Community Edition](https://www.mongodb.com/try/download/community) OR use [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) (free cloud database)
- **Git** (optional) - For version control

---

### Step 1: Install MongoDB

#### Option A: Local Installation (Recommended for development)

1. Download MongoDB Community Edition from the link above
2. Install MongoDB following the installer instructions
3. MongoDB will run on `mongodb://localhost:27017` by default

#### Option B: MongoDB Atlas (Cloud - Free Tier)

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a free account
3. Create a new cluster (free tier)
4. Get your connection string (looks like: `mongodb+srv://<username>:<password>@cluster.mongodb.net/elocab`)

---

### Step 2: Setup Backend

1. **Open PowerShell** and navigate to the project folder:

   ```powershell
   cd "c:\Users\Samuel\OneDrive\Desktop\new elocab"
   ```

2. **Navigate to server folder:**

   ```powershell
   cd server
   ```

3. **Install dependencies:**

   ```powershell
   npm install
   ```

4. **Create environment file:**

   ```powershell
   Copy-Item .env.example .env
   ```

5. **Edit the .env file:**
   - Open `server\.env` in Notepad or any text editor
   - Update the values:

     ```env
     PORT=5000
     MONGODB_URI=mongodb://localhost:27017/elocab
     # OR if using MongoDB Atlas:
     # MONGODB_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/elocab

     JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
     NODE_ENV=development

     # Admin credentials for first-time login
     ADMIN_EMAIL=admin@elocab.com
     ADMIN_PASSWORD=Admin@2026
     ```

6. **Start the backend server:**

   ```powershell
   npm run dev
   ```

   You should see:

   ```
   ✅ MongoDB Connected Successfully
   Server running on port 5000
   ```

---

### Step 3: Setup Frontend

1. **Open a NEW PowerShell window** (keep the backend running)

2. **Navigate to client folder:**

   ```powershell
   cd "c:\Users\Samuel\OneDrive\Desktop\new elocab\client"
   ```

3. **Install dependencies:**

   ```powershell
   npm install
   ```

4. **Start the frontend:**

   ```powershell
   npm run dev
   ```

   You should see:

   ```
   VITE v5.x.x  ready in xxx ms

   ➜  Local:   http://localhost:5173/
   ```

---

### Step 4: Access the Application

1. **Open your browser** and go to: `http://localhost:5173`

2. **Test the system:**

   **Admin Access:**
   - Go to: `http://localhost:5173/admin/login`
   - Email: `admin@elocab.com`
   - Password: `Admin@2026`

   **Register as Customer:**
   - Click "Get Started" or "Register"
   - Select "Book Rides"
   - Fill in your details

   **Register as Driver:**
   - Click "Register"
   - Select "Offer Rides"
   - Fill in your car and driver details

---

## 🖼️ Adding Images (Logo & Car Photos)

### Step 1: Create Images Folder

```powershell
cd "c:\Users\Samuel\OneDrive\Desktop\new elocab\client\public"
New-Item -ItemType Directory -Path "images"
New-Item -ItemType Directory -Path "images\cars"
```

### Step 2: Add Logo

- Place your ELOCAB logo in: `client\public\images\logo.png`
- Recommended size: 200x200 pixels or larger (square format)

### Step 3: Add Car Images

Place these images in `client\public\images\cars\`:

- `nissan-caravan.jpg`
- `toyota-hiace.jpg`
- `toyota-voxy.jpg`
- `toyota-vitz.jpg`

**Recommended image specifications:**

- Format: JPG or PNG
- Size: 1920x1080 pixels (landscape)
- File size: Under 500KB each

**Where to get car images:**

- Google Images (search for "Nissan Caravan Ghana" etc.)
- Free stock photo sites: [Unsplash](https://unsplash.com), [Pexels](https://pexels.com)
- Take photos of actual vehicles

---

## 🎯 Usage Guide

### For Customers

1. **Register:**
   - Visit the homepage
   - Click "Get Started" → Select "Book Rides"
   - Fill in: Name, Phone, Email, Password, Digital Address, City

2. **Book a Ride:**
   - Login to your account
   - Click "Book a Ride" tab
   - Select service type (Dropping or Hiring)
   - Fill in pickup point, destination, date/time, number of people
   - Click "Book Now"

3. **Track Booking:**
   - Go to "My Bookings" tab
   - See real-time status updates
   - View assigned driver details when available

### For Drivers

1. **Register:**
   - Click "Register" → Select "Offer Rides"
   - Fill in: Name, Contact, Car Type, Car Number, License, Base Location

2. **Go Online:**
   - Login to your dashboard
   - Click the status toggle to go "🟢 Online"

3. **Manage Rides:**
   - View assigned rides in "My Rides" tab
   - Update status: Accept → On The Way → Picked Up → Completed
   - View ride history

### For Admin

1. **Login:**
   - Go to: `/admin/login`
   - Use admin credentials from `.env` file

2. **Manage Bookings:**
   - View all pending bookings
   - Assign drivers to bookings
   - Monitor active rides
   - View completed rides

3. **Manage Users:**
   - View all drivers and customers
   - Activate/deactivate drivers
   - Remove users if needed

---

## 🔒 Security Features

- ✅ Password hashing with bcrypt
- ✅ JWT token authentication
- ✅ Protected routes (role-based access)
- ✅ Input validation
- ✅ CORS configuration
- ✅ Helmet.js security headers
- ✅ Environment variables for secrets

---

## 📱 Key Functionalities

### Real-Time Notifications

- Customers get notified when drivers are assigned
- Drivers get notified of new ride assignments
- Admin gets notified of new bookings
- All parties see status updates in real-time

### Driver Availability System

- Drivers can toggle between Online/Offline
- Only available drivers can be assigned bookings
- Admin sees driver availability status

### Booking Status Flow

1. **Pending** - Customer submitted, waiting for admin
2. **Assigned** - Admin assigned a driver
3. **Accepted** - Driver accepted the ride
4. **On The Way** - Driver is en route to pickup
5. **Picked Up** - Passengers are in the vehicle
6. **Completed** - Ride finished successfully

---

## 🛠️ Troubleshooting

### Backend won't start

- **Check MongoDB:** Make sure MongoDB is running
- **Check port 5000:** Make sure nothing else is using port 5000
- **Check .env file:** Ensure all values are correct

### Frontend won't start

- **Check port 5173:** Make sure nothing else is using this port
- **Run:** `npm install` in the client folder again

### Can't connect to MongoDB

- **Local:** Ensure MongoDB service is running
- **Atlas:** Check your connection string and whitelist your IP

### Images not showing

- Check that images are in correct folders: `client\public\images\`
- Check file names match exactly (case-sensitive)
- Refresh browser with Ctrl+F5

---

## 📞 Contact Information

**ELOCAB**

- WhatsApp: 0240786555
- Call: 0257160074
- Email: obedelobed@gmail.com
- Location: Kumasi, Ghana

---

## 🚀 Deployment (Production)

### Backend Deployment (Render/Railway)

1. Create account on [Render](https://render.com) or [Railway](https://railway.app)
2. Connect your GitHub repository
3. Set environment variables in dashboard
4. Deploy

### Frontend Deployment (Vercel/Netlify)

1. Create account on [Vercel](https://vercel.com) or [Netlify](https://netlify.com)
2. Connect GitHub repository
3. Build command: `npm run build`
4. Deploy

### Database (MongoDB Atlas)

- Already runs in the cloud
- Free tier: Up to 512MB
- Upgrade as needed

---

## 📄 License

© 2026 ELOCAB. All rights reserved.

---

## 🎉 You're All Set!

Your ELOCAB application is now ready to use. If you encounter any issues, check the troubleshooting section or reach out to the contact details above.

**Happy riding! 🚗**
