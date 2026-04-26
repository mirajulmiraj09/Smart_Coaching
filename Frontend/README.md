# Smart Coaching Center - Frontend

A modern React + Tailwind CSS frontend for the Smart Coaching Center management system.

## Features

- 🔐 **Authentication** - JWT-based login and registration
- 👥 **Role-based Dashboard** - Different dashboards for Students, Teachers, and Admins
- 📚 **Academics Management** - Manage courses, classes, and academics
- 📊 **Exam & Results** - Track exams and student results
- 🏫 **Centers Management** - Manage coaching centers
- 👨‍🏫 **Teaching Materials** - Share and manage teaching resources
- 🤖 **AI Engine** - Integration with AI-powered features
- 🔔 **Notifications** - Real-time notifications system
- 📱 **Responsive Design** - Mobile-friendly UI with Tailwind CSS

## Tech Stack

- **React 18** - UI library
- **React Router v6** - Client-side routing
- **Zustand** - State management
- **Axios** - HTTP client
- **Tailwind CSS** - Styling
- **React Icons** - Icon library
- **React Hot Toast** - Toast notifications
- **Recharts** - Data visualization

## Installation

1. **Clone the repository**
```bash
cd Frontend
```

2. **Install dependencies**
```bash
npm install
```

3. **Create environment file**
```bash
cp .env.example .env.local
```

4. **Update `.env.local` with your backend URL**
```
REACT_APP_API_BASE_URL=http://localhost:8000/api/v1
REACT_APP_API_TIMEOUT=10000
```

## Running the Application

### Development Mode
```bash
npm start
```
The app will open at `http://localhost:3000`

### Build for Production
```bash
npm run build
```

## Project Structure

```
src/
├── components/         # Reusable components (Header, Sidebar, etc.)
├── pages/             # Page components
│   ├── dashboards/    # Role-based dashboards
│   ├── LoginPage.jsx
│   ├── RegisterPage.jsx
│   └── NotFoundPage.jsx
├── layouts/           # Layout components
├── services/          # API service configuration
├── stores/            # Zustand stores (auth, etc.)
├── hooks/             # Custom React hooks
├── utils/             # Utility functions
├── App.js             # Main app component
└── index.js           # Entry point
```

## Authentication Flow

1. **Registration**: User registers with email, name, password, and role
2. **Login**: User logs in with email and password
3. **JWT Token**: Backend returns access and refresh tokens
4. **Token Storage**: Tokens are stored in localStorage
5. **Protected Routes**: Access to dashboard requires valid token
6. **Auto Refresh**: Token automatically refreshes when expired

## API Integration

The frontend communicates with the Django REST API at `/api/v1/`. Key endpoints:

- `POST /register/` - User registration
- `POST /login/` - User login
- `GET /me/` - Get current user info
- `GET /centers/` - List coaching centers
- `GET /academics/` - Academic data
- `GET /exams/` - Exam information
- `GET /teaching/` - Teaching materials
- `GET /ai/` - AI engine features

## Role-based Access

- **Student Dashboard** - View courses, exams, results, attendance
- **Teacher Dashboard** - Manage classes, assignments, student grades
- **Admin Dashboard** - System overview, user management, analytics

## Development Tips

1. **State Management**: Use `useAuthStore` for authentication state
2. **API Calls**: Import `api` from `services/api` for all requests
3. **Toast Notifications**: Use `toast.success()`, `toast.error()` for user feedback
4. **Routing**: Use React Router components for navigation
5. **Styling**: Use Tailwind CSS classes for styling

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| REACT_APP_API_BASE_URL | Backend API URL | http://localhost:8000/api/v1 |
| REACT_APP_API_TIMEOUT | API request timeout (ms) | 10000 |

## Future Enhancements

- [ ] Video conferencing for classes
- [ ] Chat/messaging system
- [ ] File upload and management
- [ ] Advanced analytics and reporting
- [ ] Mobile app (React Native)
- [ ] Offline support (PWA)
- [ ] Dark mode
- [ ] Multi-language support

## Contributing

1. Create a new branch for features
2. Follow the existing code style
3. Test changes thoroughly
4. Submit pull requests for review

## License

MIT
