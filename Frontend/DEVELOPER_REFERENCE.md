# Developer Quick Reference

## Installation & Running

```bash
cd Frontend
npm install
npm start
```

## Environment Setup

```bash
cp .env.example .env.local
# Update REACT_APP_API_BASE_URL if backend is not on localhost:8000
```

## Common Tasks

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

## File Locations

| What | Where |
|------|-------|
| Pages | `src/pages/` |
| Components | `src/components/` |
| API calls | `src/services/api.js` |
| State | `src/stores/authStore.js` |
| Styles | `src/index.css` + Tailwind classes |
| Constants | `src/constants/config.js` |
| Utilities | `src/utils/` |

## Styling

### Use Tailwind Classes
```jsx
<div className="bg-blue-600 text-white p-4 rounded-lg hover:bg-blue-700">
  Button
</div>
```

### Custom Classes
```css
.btn-primary { }    /* Blue button */
.btn-secondary { }  /* Gray button */
.btn-danger { }     /* Red button */
.card { }           /* Card component */
.input-field { }    /* Input styling */
```

## API Calls

### Using the API Service
```javascript
import api from '../services/api.js';

// GET
const response = await api.get('/centers/');

// POST
await api.post('/centers/', data);

// PUT
await api.put(`/centers/${id}/`, data);

// DELETE
await api.delete(`/centers/${id}/`);
```

### Handling Errors
```javascript
import { formatErrorMessage } from '../utils/errorHandler.js';

try {
  const response = await api.get('/data/');
} catch (error) {
  const message = formatErrorMessage(error);
  toast.error(message);
}
```

## State Management

### Using Auth Store
```javascript
import { useAuthStore } from '../stores/authStore.js';

const { user, isAuthenticated, login, logout, updateProfile } = useAuthStore();
```

### Store Methods
```javascript
// Register
await register({ email, name, password, phone, role });

// Login
await login(email, password);

// Update profile
await updateProfile({ name, bio, ... });

// Logout
logout();
```

## Custom Hooks

### useForm
```javascript
import { useForm } from '../hooks/useCustomHooks.js';

const { values, errors, handleChange, handleSubmit, reset } = useForm(
  { name: '', email: '' },
  async (values) => {
    // Handle submission
  }
);
```

### useFetch
```javascript
const { data, loading, error } = useFetch(
  () => api.get('/data/'),
  [dependency]
);
```

### useDebounce
```javascript
const debouncedValue = useDebounce(searchTerm, 500);
```

## Routing

### Add New Route
```javascript
// In App.js
<Route path="/dashboard/new-page" element={<NewPage />} />

// Then add to Sidebar.jsx menu
```

### Protected Routes
All dashboard routes automatically protected by `<PrivateRoute />`

### Navigate Programmatically
```javascript
import { useNavigate } from 'react-router-dom';

const navigate = useNavigate();
navigate('/dashboard');
```

## Notifications

### Toast Messages
```javascript
import toast from 'react-hot-toast';

toast.success('Success message');
toast.error('Error message');
toast.loading('Loading...');
```

## Components

### Header Component
- Shows app title
- Displays user info
- Logout button
- Mobile menu toggle

### Sidebar Component
- Navigation menu
- Role-based menu items
- Mobile toggle
- Active route highlighting

### Loading Component
- Spinner animation
- Full screen or inline
- Use: `<Loading />`

### Private Route
- Wraps protected routes
- Redirects to login if not authenticated
- Used in layout structure

## Constants & Config

### Import Constants
```javascript
import { 
  ROLE_NAMES, 
  ROUTES, 
  API_CONFIG,
  FEATURES 
} from '../constants/config.js';

// Usage
if (user.role_name === ROLE_NAMES.STUDENT) { }
navigate(ROUTES.DASHBOARD);
```

## Forms

### Form Pattern
```jsx
const [formData, setFormData] = useState({
  name: '',
  email: '',
});

const handleChange = (e) => {
  const { name, value } = e.target;
  setFormData(prev => ({ ...prev, [name]: value }));
};

const handleSubmit = async (e) => {
  e.preventDefault();
  try {
    await api.post('/endpoint/', formData);
    toast.success('Success!');
  } catch (error) {
    toast.error('Error');
  }
};
```

## Modal Pattern
```jsx
{showModal && (
  <div className="fixed inset-0 bg-black bg-opacity-50 z-50">
    <div className="bg-white rounded-lg p-8 max-w-md">
      {/* Modal content */}
    </div>
  </div>
)}
```

## Table Pattern
```jsx
<table className="w-full">
  <thead className="bg-gray-50">
    <tr>
      <th className="px-6 py-3">Column 1</th>
    </tr>
  </thead>
  <tbody>
    {items.map(item => (
      <tr key={item.id} className="border-b">
        <td className="px-6 py-4">{item.name}</td>
      </tr>
    ))}
  </tbody>
</table>
```

## Debugging

### Browser DevTools
- Press F12 to open
- Console tab for errors
- Network tab for API calls
- Application tab for localStorage

### Check Authentication
```javascript
// In console
localStorage.getItem('access_token')
localStorage.getItem('refresh_token')
```

### Check API Response
```javascript
// Network tab > Click request > Response tab
```

## Common Issues & Solutions

### Issue: "Cannot find module"
```bash
npm install  # Reinstall dependencies
```

### Issue: Styling not working
```bash
npm cache clean --force
npm start
```

### Issue: API 401 error
- Check token in localStorage
- Check backend CORS settings
- Verify backend is running

### Issue: Form not submitting
- Check network tab for errors
- Verify API endpoint
- Check form validation

## Useful Plugins & Tools

### VS Code Extensions
- ES7+ React/Redux/React-Native snippets
- Tailwind CSS IntelliSense
- Thunder Client (API testing)
- ES Lint

### Browser Extensions
- React Developer Tools
- Redux DevTools
- JSON Formatter

## Performance Tips

1. **Use Debounce for Search**
   ```javascript
   const debouncedSearch = useDebounce(searchTerm, 500);
   ```

2. **Lazy Load Lists**
   - Use pagination or infinite scroll
   - Load only visible items

3. **Avoid Re-renders**
   - Use React.memo for components
   - Memoize callbacks with useCallback

4. **Optimize Images**
   - Use proper size images
   - Use lazy loading

5. **Bundle Size**
   - Check: `npm run build` output
   - Remove unused packages

## Security Tips

1. **Never store sensitive data in localStorage**
2. **Always validate form inputs**
3. **Use HTTPS in production**
4. **Keep dependencies updated**
5. **Handle errors properly**
6. **Don't log sensitive info**

## Deployment

### Build
```bash
npm run build
```

### Deploy to Vercel
```bash
npm i -g vercel
vercel
```

### Deploy to Netlify
- Connect GitHub repo to Netlify
- Build: `npm run build`
- Publish: `build/`

## Git Workflow

```bash
# Create feature branch
git checkout -b feature/my-feature

# Make changes and commit
git add .
git commit -m "Add new feature"

# Push and create PR
git push origin feature/my-feature
```

## Testing

### Create Test File
```bash
src/pages/__tests__/LoginPage.test.js
```

### Basic Test
```javascript
import { render, screen } from '@testing-library/react';
import LoginPage from '../LoginPage';

test('renders login form', () => {
  render(<LoginPage />);
  expect(screen.getByText(/login/i)).toBeInTheDocument();
});
```

## Quick Links

- React: https://react.dev
- Tailwind: https://tailwindcss.com
- React Router: https://reactrouter.com
- Zustand: https://github.com/pmndrs/zustand
- Axios: https://axios-http.com

## Help & Support

1. Check [README.md](./README.md) for features
2. Check [SETUP.md](./SETUP.md) for configuration
3. Check [QUICKSTART.md](./QUICKSTART.md) to get started
4. Check console for error messages
5. Check network tab for API issues

---

**Last Updated:** April 2026
**Status:** Ready for Development
