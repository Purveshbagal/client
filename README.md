# Swadhan Eats Client

A modern React-based frontend for the Swadhan Eats food delivery platform.

## Features

- **User Authentication**: Login, register, and logout functionality with JWT tokens stored in localStorage.
- **Restaurant Browsing**: Search and filter restaurants by name, city, or cuisine with pagination.
- **Menu Viewing**: View detailed restaurant information and browse available dishes.
- **Cart Management**: Add items to cart, update quantities, and remove items. Cart persists in localStorage.
- **Order Placement**: Secure checkout process with address form and order summary.
- **Order History**: View past orders and order details in the user profile.
- **Admin Panel**: Manage restaurants and dishes (admin users only).
- **Responsive Design**: Mobile-first design using Tailwind CSS.

## Tech Stack

- **React 18** with functional components and hooks
- **Vite** for fast development and building
- **React Router** for client-side routing
- **Axios** for API calls with interceptors for authentication
- **Tailwind CSS** for styling
- **React Toastify** for notifications
- **React Hook Form** for form handling
- **Vitest** for testing

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn

### Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd swadhan-eats-client
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

4. Open [http://localhost:5173](http://localhost:5173) in your browser.

### Building for Production

```bash
npm run build
```

### Running Tests

```bash
npm run test
```

## Configuration

- **API Base URL**: Configured in `src/api/api.js` to point to `http://localhost:5000/api`.
- **Token Storage**: JWT access token stored in localStorage under key `swadhan_access`.
- **Refresh Logic**: Automatic token refresh on 401 responses.

## Security Notes

- JWT tokens are stored in localStorage for simplicity, but in production, consider using httpOnly cookies.
- For production deployment, ensure HTTPS is enabled and configure CORS properly on the backend.

## Project Structure

```
src/
├── api/
│   └── api.js              # Axios instance with interceptors
├── components/
│   ├── Header.jsx          # Navigation header
│   ├── Footer.jsx          # Footer component
│   ├── RestaurantCard.jsx  # Restaurant preview card
│   └── DishCard.jsx        # Dish display card
├── contexts/
│   └── AuthContext.jsx     # Authentication context
├── hooks/
│   └── useCart.js          # Cart management hook
├── pages/
│   ├── Home.jsx            # Restaurant listing
│   ├── Restaurant.jsx      # Restaurant details and menu
│   ├── Login.jsx           # User login
│   ├── Register.jsx        # User registration
│   ├── Cart.jsx            # Shopping cart
│   ├── Checkout.jsx        # Order checkout
│   ├── Profile.jsx         # User profile and orders
│   └── admin/
│       ├── Dashboard.jsx   # Admin dashboard
│       ├── RestaurantsAdmin.jsx  # Restaurant management
│       └── DishesAdmin.jsx       # Dish management
└── tests/
    └── Header.test.jsx     # Header component tests
```

## API Endpoints

The frontend expects the following backend API endpoints:

- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `POST /api/auth/refresh` - Token refresh
- `GET /api/auth/me` - Get current user info
- `GET /api/restaurants` - List restaurants (with pagination, search, filter)
- `GET /api/restaurants/:id` - Get restaurant details
- `GET /api/restaurants/:id/dishes` - Get restaurant dishes
- `POST /api/restaurants` - Create restaurant (admin)
- `PUT /api/restaurants/:id` - Update restaurant (admin)
- `DELETE /api/restaurants/:id` - Delete restaurant (admin)
- `POST /api/dishes` - Create dish (admin)
- `PUT /api/dishes/:id` - Update dish (admin)
- `DELETE /api/dishes/:id` - Delete dish (admin)
- `POST /api/orders` - Place order
- `GET /api/orders` - Get user orders
- `PUT /api/users/me` - Update user profile

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.
