# 📸 ELOCAB Image Placement Guide

## Where to Add Your Images

All images go in the `client/public/images/` folder. Here's the exact structure:

```
client/
└── public/
    └── images/
        ├── logo.png          ← Your ELOCAB logo (with text and design)
        └── cars/             ← Car images folder
            ├── nissan-caravan.jpg
            ├── toyota-hiace.jpg
            ├── toyota-voxy.jpg
            └── toyota-vitz.jpg
```

---

## 🎯 Step-by-Step Instructions

### 1. Add Your Logo

**File:** `logo.png`  
**Location:** `c:\Users\Samuel\OneDrive\Desktop\new elocab\client\public\images\logo.png`

**Recommended Specifications:**

- Format: PNG (with transparent background) or JPG
- Size: 400px wide × 120px tall (approximate)
- Contains: Your ELOCAB logo design + text
- Background: Transparent or white

**Where It Appears:**

- ✅ Navbar (top-left corner)
- ✅ Login page (left side branding section)
- ✅ Register page (left side branding section)

---

### 2. Add Car Images

**Location:** `c:\Users\Samuel\OneDrive\Desktop\new elocab\client\public\images\cars\`

You need **4 car images** with these exact names:

#### a) `nissan-caravan.jpg`

- Description: Nissan Caravan (14-16 seats)
- For: Large groups and events

#### b) `toyota-hiace.jpg`

- Description: Toyota Hiace (14-16 seats)
- For: Comfortable and spacious journeys

#### c) `toyota-voxy.jpg`

- Description: Toyota Voxy (7-8 seats)
- For: Family trips and small groups

#### d) `toyota-vitz.jpg`

- Description: Toyota Vitz (4-5 seats)
- For: Quick and efficient short trips

**Recommended Specifications:**

- Format: JPG or PNG
- Size: 1920px × 1080px (Full HD) or similar landscape ratio
- Quality: High resolution, clear images
- Style: Professional photos of the cars

**Where They Appear:**

- ✅ Homepage hero carousel (full-screen background with transparent overlay)

---

## 📁 How to Add the Images

### Using File Explorer:

1. **Navigate to the folder:**

   ```
   c:\Users\Samuel\OneDrive\Desktop\new elocab\client\public\images\
   ```

2. **Add your logo:**
   - Copy your logo file
   - Paste it in the `images` folder
   - Rename it to exactly: `logo.png`

3. **Add car images:**
   - Open the `cars` subfolder
   - Copy your 4 car images (or download from internet)
   - Paste them in the `cars` folder
   - Rename them to match the exact names listed above

### Using Command Prompt (Optional):

```powershell
# Navigate to images folder
cd "c:\Users\Samuel\OneDrive\Desktop\new elocab\client\public\images"

# Check if logo exists
dir logo.png

# Navigate to cars folder
cd cars

# Check if car images exist
dir
```

---

## 🔍 What Happens Without Images?

Don't worry! Your app is smart:

### Logo (Navbar, Login, Register):

- **If image loads:** Shows your beautiful logo
- **If image doesn't load:** Automatically shows "ELOCAB" text instead
- **Fallback is automatic** - no blank spaces!

### Car Images (Hero Carousel):

- **If images load:** Shows car photos with transparent navy/orange overlay
- **If images don't load:** Shows beautiful gradient background
- **Your content is always visible!**

---

## ✅ Image Checklist

Before launching, make sure you have:

- [ ] Logo file named `logo.png` in `client/public/images/`
- [ ] `nissan-caravan.jpg` in `client/public/images/cars/`
- [ ] `toyota-hiace.jpg` in `client/public/images/cars/`
- [ ] `toyota-voxy.jpg` in `client/public/images/cars/`
- [ ] `toyota-vitz.jpg` in `client/public/images/cars/`

---

## 🎨 Design Tips

### For Logo:

- Make sure text is readable at small sizes
- Use high contrast colors
- Transparent background works best
- Test it on both white and colored backgrounds

### For Car Images:

- Use professional, well-lit photos
- Avoid images with busy backgrounds
- Make sure the car is the focal point
- Landscape orientation works best

---

## 🌐 Finding Car Images

If you need to download placeholder car images, you can use:

1. **Unsplash.com** - Free high-quality photos
2. **Pexels.com** - Free stock photos
3. **Your own photos** - Best option if you have them!

**Search terms to use:**

- "Nissan Caravan"
- "Toyota Hiace van"
- "Toyota Voxy minivan"
- "Toyota Vitz compact car"

---

## 🚀 After Adding Images

Once you've added your images:

1. **Refresh your browser** - Press `Ctrl + F5` to hard refresh
2. **Check the navbar** - Logo should appear at top-left
3. **Visit homepage** - See car carousel with your images
4. **Check login page** - Logo on left side
5. **Check register page** - Logo on left side

---

## 📞 Image Specifications Summary

| Image Type         | File Name            | Location        | Size        | Format  |
| ------------------ | -------------------- | --------------- | ----------- | ------- |
| **Logo**           | `logo.png`           | `/images/`      | 400×120px   | PNG/JPG |
| **Nissan Caravan** | `nissan-caravan.jpg` | `/images/cars/` | 1920×1080px | JPG     |
| **Toyota Hiace**   | `toyota-hiace.jpg`   | `/images/cars/` | 1920×1080px | JPG     |
| **Toyota Voxy**    | `toyota-voxy.jpg`    | `/images/cars/` | 1920×1080px | JPG     |
| **Toyota Vitz**    | `toyota-vitz.jpg`    | `/images/cars/` | 1920×1080px | JPG     |

---

## ✨ What You'll See

### Navbar:

```
┌────────────────────────────────────────┐
│ [LOGO]              Login | Get Started│
└────────────────────────────────────────┘
```

### Homepage Hero:

```
┌────────────────────────────────────────┐
│   [Car Image with Navy/Orange Overlay] │
│                                        │
│         Go anywhere with ELOCAB        │
│            Toyota Hiace                │
│      14-16 seats • Comfortable         │
│                                        │
│          [Get started button]          │
└────────────────────────────────────────┘
```

### Login/Register Page:

```
┌──────────────────┬──────────────────┐
│                  │                  │
│      [LOGO]      │  Sign in form    │
│                  │                  │
│  Reliable rides  │  Email: ____     │
│    anytime       │  Password: ____  │
│                  │  [Continue]      │
└──────────────────┴──────────────────┘
```

---

**Your images will make ELOCAB look professional and polished! 🚗✨**
