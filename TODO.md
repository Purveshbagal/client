# TODO: Add Admin Portal for Restaurants and Dishes

## Backend Changes
- [ ] Update User model: add role field ('admin' | 'user'), default 'user', remove isAdmin
- [ ] Update auth middleware: include role in req.user
- [ ] Update admin middleware: check req.user.role === 'admin'
- [ ] Update auth controller: return role in user object
- [ ] Update Restaurant model: change image to imageUrl
- [ ] Update Dish model: change image to imageUrl
- [ ] Update restaurants controller: use imageUrl, modify getRestaurants to filter by createdBy role 'admin'
- [ ] Update dishes controller: use imageUrl
- [ ] Create admin routes: routes/admin.routes.js with POST /restaurants, POST /restaurants/:id/dishes, GET /restaurants (admin's own), GET /restaurants/:id/dishes
- [ ] Update app.js: mount admin routes at /api/admin, serve /uploads static
- [ ] Update upload middleware: validate size <=5MB, sanitize filename
- [ ] Update public routes: ensure GET /restaurants filters admin-created
- [ ] Add promote endpoint: POST /api/admin/promote (for creating admin user)
- [ ] Update seed.js: create admin user

## Frontend Changes
- [ ] Update AuthContext: change isAdmin to role
- [ ] Update Login.jsx: update to use role
- [ ] Create AdminDashboard.jsx: list admin's restaurants, buttons to add restaurant/dish
- [ ] Create RestaurantForm.jsx: form with file upload for restaurant
- [ ] Create DishForm.jsx: form with file upload for dish, restaurant selector
- [ ] Rename Home.jsx to PublicDashboard.jsx, update route to /
- [ ] Rename Restaurant.jsx to RestaurantPage.jsx, update route to /restaurant/:id
- [ ] Update App.jsx: add routes for /admin (protected), /restaurant/:id, / to PublicDashboard
- [ ] Update api.js: ensure attaches JWT for protected calls
- [ ] Update existing admin pages: use file upload, check role, call admin endpoints
- [ ] Update Header.jsx: add admin link if role admin

## Testing and Docs
- [ ] Update README: add commands to start backend/frontend, create admin user, sample cURLs
- [ ] Test endpoints with Postman or cURL
- [ ] Ensure images upload correctly, public data updates immediately
