# Quick Start Guide

Get the Smart Coaching Center frontend up and running in minutes!

## 1️⃣ Prerequisites

Make sure you have these installed:
- Node.js v14+ ([Download](https://nodejs.org/))
- npm (comes with Node.js)
- Backend running on `http://localhost:8000`

## 2️⃣ Setup (5 minutes)

```bash
# 1. Go to frontend directory
cd Frontend

# 2. Install dependencies
npm install

# 3. Create environment file
cp .env.example .env.local

# 4. Update backend URL in .env.local if needed
# (Default: http://localhost:8000/api/v1)

# 5. Start development server
npm start
```

✅ App will open at http://localhost:3000

## 3️⃣ Test the App

### Create Test Account
1. Go to http://localhost:3000
2. Click "Register" 
3. Fill form with:
   - Name: Test Student
   - Email: student@test.com
   - Password: TestPass123!
   - Phone: +1234567890
   - Role: Student

4. Click "Register"

### Login
1. Go to Login page
2. Use credentials:
   - Email: student@test.com
   - Password: TestPass123!

3. You'll see the Student Dashboard

## 4️⃣ Available Test Roles

| Role | Use Case |
|------|----------|
| **Student** | View courses, exams, results |
| **Teacher** | Manage classes, grades, materials |
| **Staff** | Access admin features |

## 5️⃣ Key Features to Try

### 📚 Academics
- Navigate to "Academics" 
- Create/edit/delete classes
- Assign subjects

### 📝 Exams
- Schedule exams
- Set marks and duration
- View exam list

### 📊 Results
- View student results
- Filter by status
- Check percentages

### 📚 Teaching Materials
- Upload study materials
- Organize by class/subject
- Share with students

### 🏫 Centers
- Add coaching centers
- Manage location details
- Edit information

### 🔔 Notifications
- View system notifications
- Mark as read
- Delete old notifications

## 6️⃣ Useful Commands

```bash
# Start dev server
npm start

# Build for production
npm run build

# Run tests
npm test

# Clear node modules and reinstall
npm install

# Update dependencies
npm update
```

## 7️⃣ Troubleshooting

### ❌ Port 3000 already in use
```bash
# Use different port
PORT=3001 npm start
```

### ❌ Backend not connecting
1. Check backend is running: `python manage.py runserver`
2. Check `.env.local` has correct API URL
3. Check CORS settings in Django settings.py

### ❌ Styling not working
```bash
npm cache clean --force
npm install
npm start
```

### ❌ Module not found error
```bash
rm -rf node_modules package-lock.json
npm install
```

## 8️⃣ File Structure Overview

```
Frontend/
├── src/
│   ├── pages/           ← Add new pages here
│   ├── components/      ← Reusable UI components
│   ├── services/        ← API calls
│   ├── stores/          ← Global state
│   ├── utils/           ← Helper functions
│   └── App.js           ← Main app
├── public/              ← Static files
├── package.json         ← Dependencies
└── README.md            ← Full documentation
```

## 9️⃣ Next Steps

### Development
1. Read [SETUP.md](./SETUP.md) for detailed guide
2. Read [README.md](./README.md) for features
3. Check [src/constants/config.js](./src/constants/config.js) for constants

### Customization
- Change colors in `tailwind.config.js`
- Add features in `src/pages/`
- Extend API in `src/services/api.js`

### Deployment
```bash
npm run build
# Deploy 'build' folder to hosting service
```

## 🔟 Getting Help

### Documentation
- React: https://react.dev
- Tailwind: https://tailwindcss.com
- Zustand: https://github.com/pmndrs/zustand

### Common Issues
- Check browser console for errors (F12)
- Check Network tab for API issues
- Review backend logs

## 📞 Support

For issues:
1. Check error messages in console
2. Verify backend is running
3. Check .env.local configuration
4. Review backend error logs

---

**Happy Coding! 🚀**
