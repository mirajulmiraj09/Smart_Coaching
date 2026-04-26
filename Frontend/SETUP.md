# Frontend Setup & Installation Guide

## Prerequisites

- **Node.js** (v14 or higher) - [Download](https://nodejs.org/)
- **npm** or **yarn** - Comes with Node.js
- **Git** - For version control

## Quick Start

### 1. Navigate to Frontend Directory
```bash
cd Frontend
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Create Environment File
```bash
cp .env.example .env.local
```

### 4. Configure Backend URL (if needed)
Edit `.env.local` and update the backend API URL:
```
REACT_APP_API_BASE_URL=http://localhost:8000/api/v1
REACT_APP_API_TIMEOUT=10000
```

### 5. Start Development Server
```bash
npm start
```

The app will automatically open at `http://localhost:3000`

## Project Structure

```
Frontend/
├── public/
│   └── index.html                 # Main HTML file
├── src/
│   ├── components/                # Reusable components
│   │   ├── Header.jsx
│   │   ├── Sidebar.jsx
│   │   ├── PrivateRoute.jsx
│   │   └── Loading.jsx
│   ├── pages/                     # Page components
│   │   ├── LoginPage.jsx
│   │   ├── RegisterPage.jsx
│   │   ├── ProfilePage.jsx
│   │   ├── CentersPage.jsx
│   │   ├── AcademicsPage.jsx
│   │   ├── ExamsPage.jsx
│   │   ├── ResultsPage.jsx
│   │   ├── TeachingPage.jsx
│   │   ├── AIEnginePage.jsx
│   │   ├── NotificationsPage.jsx
│   │   ├── NotFoundPage.jsx
│   │   └── dashboards/            # Role-based dashboards
│   │       ├── StudentDashboard.jsx
│   │       ├── TeacherDashboard.jsx
│   │       └── AdminDashboard.jsx
│   ├── layouts/                   # Layout components
│   │   └── DashboardLayout.jsx
│   ├── services/                  # API service
│   │   └── api.js
│   ├── stores/                    # Zustand state management
│   │   └── authStore.js
│   ├── hooks/                     # Custom React hooks
│   │   └── useCustomHooks.js
│   ├── utils/                     # Utility functions
│   │   └── helpers.js
│   ├── App.js                     # Main app component
│   ├── index.js                   # Entry point
│   └── index.css                  # Global styles
├── package.json
├── tailwind.config.js
├── postcss.config.js
└── README.md
```

## Development Commands

### Start Development Server
```bash
npm start
```

### Build for Production
```bash
npm run build
```

### Run Tests
```bash
npm test
```

## Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| REACT_APP_API_BASE_URL | Backend API base URL | http://localhost:8000/api/v1 |
| REACT_APP_API_TIMEOUT | API request timeout in ms | 10000 |

### Tailwind CSS

The project uses Tailwind CSS for styling. Custom configuration is in `tailwind.config.js`.

#### Custom Classes
- `.btn-primary` - Blue primary button
- `.btn-secondary` - Gray secondary button
- `.btn-danger` - Red danger button
- `.card` - Card component with shadow and border
- `.input-field` - Styled input field

## Backend Integration

### API Endpoints Used

#### Authentication
- `POST /register/` - User registration
- `POST /login/` - User login
- `GET /me/` - Get current user
- `POST /change-password/` - Change password

#### Centers
- `GET /centers/` - List all centers
- `POST /centers/` - Create center
- `PUT /centers/{id}/` - Update center
- `DELETE /centers/{id}/` - Delete center

#### Academics
- `GET /academics/` - List academic classes
- `POST /academics/` - Create class
- `PUT /academics/{id}/` - Update class
- `DELETE /academics/{id}/` - Delete class

#### Exams
- `GET /exams/` - List exams
- `POST /exams/` - Create exam
- `PUT /exams/{id}/` - Update exam
- `DELETE /exams/{id}/` - Delete exam

#### Results
- `GET /results/` - List results
- `GET /results/?filter=passed` - Filter results

#### Teaching
- `GET /teaching/` - List teaching materials
- `POST /teaching/` - Create material
- `PUT /teaching/{id}/` - Update material
- `DELETE /teaching/{id}/` - Delete material

#### Notifications
- `GET /notifications/` - List notifications
- `PATCH /notifications/{id}/` - Update notification
- `DELETE /notifications/{id}/` - Delete notification
- `POST /notifications/mark-all-read/` - Mark all as read

## Features & Functionality

### Authentication
- ✅ Email/password registration
- ✅ Role-based registration (Student, Teacher, Staff)
- ✅ Email verification
- ✅ JWT token-based authentication
- ✅ Automatic token refresh
- ✅ Protected routes

### Dashboard
- ✅ Role-based dashboards (Student, Teacher, Admin)
- ✅ Quick stats and overview
- ✅ Navigation based on role

### Coaching Centers
- ✅ View all centers
- ✅ Create new center
- ✅ Edit center details
- ✅ Delete center
- ✅ Search centers

### Academics
- ✅ Manage classes
- ✅ Subject management
- ✅ Class-wise organization

### Exams
- ✅ Create exams
- ✅ Schedule exams
- ✅ Set exam duration and marks
- ✅ Edit/delete exams

### Results
- ✅ View student results
- ✅ Filter by status (passed/failed)
- ✅ View percentage and marks

### Teaching Materials
- ✅ Upload teaching materials
- ✅ Organize by subject and class
- ✅ File management

### Notifications
- ✅ View notifications
- ✅ Mark as read/unread
- ✅ Delete notifications
- ✅ Filter by status

### User Profile
- ✅ View profile information
- ✅ Edit profile
- ✅ Upload profile image

## Authentication Flow

1. **User Registration**
   - User fills registration form with email, name, password, phone, and role
   - Backend creates user account and sends verification email

2. **Email Verification**
   - User clicks verification link in email
   - Account becomes active

3. **Login**
   - User logs in with email and password
   - Backend returns JWT access and refresh tokens
   - Tokens stored in localStorage

4. **Protected Access**
   - All subsequent API requests include JWT token in Authorization header
   - Frontend checks for valid token before accessing protected routes

5. **Token Refresh**
   - When access token expires, automatic refresh token flow is triggered
   - New access token obtained and request retried

## Styling with Tailwind CSS

### Colors
- Primary: `bg-blue-600`, `text-blue-600`
- Success: `bg-green-600`, `text-green-600`
- Danger: `bg-red-600`, `text-red-600`
- Warning: `bg-orange-600`, `text-orange-600`

### Responsive Design
- Mobile-first approach
- Breakpoints: `sm`, `md`, `lg`, `xl`
- Example: `md:grid-cols-2` for 2 columns on medium+ screens

## State Management with Zustand

### useAuthStore
```javascript
import { useAuthStore } from './stores/authStore';

const { user, isAuthenticated, login, logout, updateProfile } = useAuthStore();
```

### Actions Available
- `initAuth()` - Initialize auth state
- `register(userData)` - Register new user
- `login(email, password)` - User login
- `logout()` - User logout
- `updateProfile(data)` - Update user profile
- `changePassword(old, new)` - Change password

## Custom Hooks

### useForm
Form state management hook:
```javascript
const { values, errors, handleChange, handleSubmit } = useForm(
  initialValues,
  onSubmit
);
```

### useFetch
Data fetching hook:
```javascript
const { data, loading, error } = useFetch(fetchFunction, dependencies);
```

### useDebounce
Debounce hook for optimized updates:
```javascript
const debouncedValue = useDebounce(value, 500);
```

## API Service

The `src/services/api.js` provides:
- Axios instance with base URL configuration
- Automatic JWT token injection
- Request/response interceptors
- Automatic token refresh on 401 errors

Usage:
```javascript
import api from './services/api';

// GET request
const response = await api.get('/centers/');

// POST request
await api.post('/exams/', examData);

// PUT request
await api.put(`/exams/${id}/`, updateData);

// DELETE request
await api.delete(`/exams/${id}/`);
```

## Deployment

### Build for Production
```bash
npm run build
```

This creates an optimized build in the `build/` directory.

### Deploy to Vercel
```bash
npm install -g vercel
vercel
```

### Deploy to Netlify
1. Connect GitHub repository to Netlify
2. Build command: `npm run build`
3. Publish directory: `build`

### Deploy to Traditional Server
1. Build the app: `npm run build`
2. Upload `build/` folder contents to web server
3. Configure server to serve `index.html` for all routes (for SPA routing)

## Troubleshooting

### Issue: "API_BASE_URL not found"
**Solution:** Ensure `.env.local` exists and has correct backend URL

### Issue: CORS errors
**Solution:** Update backend CORS settings to allow frontend URL:
```python
# In Django settings.py
CORS_ALLOWED_ORIGINS = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
]
```

### Issue: Token not persisting after refresh
**Solution:** Check localStorage in browser DevTools. Ensure API is returning tokens correctly.

### Issue: Styling not applying
**Solution:** Clear npm cache and reinstall:
```bash
npm cache clean --force
npm install
```

## Performance Optimization

1. **Code Splitting** - React Router automatically code-splits pages
2. **Lazy Loading** - Images are lazy-loaded when in viewport
3. **Debouncing** - Search inputs are debounced to reduce API calls
4. **Memoization** - Components using React.memo for optimization
5. **Tree Shaking** - Unused code is removed during build

## Best Practices

1. **API Calls** - Always use the `api` service from `src/services/api.js`
2. **Error Handling** - Use try-catch with meaningful error messages
3. **Loading States** - Show loading spinners during async operations
4. **Validation** - Validate form inputs before submission
5. **Security** - Never store sensitive data in localStorage
6. **Naming** - Use clear, descriptive names for components and variables

## Further Development

### Adding New Pages
1. Create component in `src/pages/`
2. Import in `App.js`
3. Add route in `<Routes>`

### Adding New Features
1. Create component in `src/components/`
2. Use existing API service
3. Manage state with Zustand

### Styling New Components
1. Use Tailwind CSS classes
2. Follow existing color scheme
3. Use custom classes from `index.css`

## Support & Documentation

- [React Documentation](https://react.dev)
- [Tailwind CSS](https://tailwindcss.com)
- [Zustand](https://github.com/pmndrs/zustand)
- [Axios](https://axios-http.com)
- [React Router](https://reactrouter.com)

## License

MIT
