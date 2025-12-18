import { useState, useEffect } from 'react';
import api from '../../api/api';
import { toast } from 'react-toastify';

const RestaurantDishManager = () => {
  const [activeTab, setActiveTab] = useState('restaurants'); // restaurants or dishes
  const [restaurants, setRestaurants] = useState([]);
  const [selectedRestaurant, setSelectedRestaurant] = useState(null);
  const [dishes, setDishes] = useState([]);
  const [loading, setLoading] = useState(false);

  // Form states
  const [restaurantForm, setRestaurantForm] = useState({
    name: '',
    description: '',
    city: '',
    address: '',
    cuisine: '',
    image: null,
  });

  const [dishForm, setDishForm] = useState({
    name: '',
    description: '',
    price: '',
    category: 'Veg',
    image: null,
  });

  // Fetch admin's restaurants
  useEffect(() => {
    fetchRestaurants();
  }, []);

  // Fetch dishes when restaurant is selected
  useEffect(() => {
    if (selectedRestaurant) {
      fetchDishes(selectedRestaurant._id);
    }
  }, [selectedRestaurant]);

  const fetchRestaurants = async () => {
    setLoading(true);
    try {
      const response = await api.get('/admin/restaurants');
      setRestaurants(response.data.restaurants || []);
    } catch (error) {
      console.error('Error fetching restaurants:', error);
      toast.error('Failed to fetch restaurants');
    } finally {
      setLoading(false);
    }
  };

  const fetchDishes = async (restaurantId) => {
    try {
      const response = await api.get(`/restaurants/${restaurantId}/dishes`);
      setDishes(response.data.dishes || []);
    } catch (error) {
      console.error('Error fetching dishes:', error);
      setDishes([]);
    }
  };

  const handleRestaurantSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('name', restaurantForm.name);
      formData.append('description', restaurantForm.description);
      formData.append('city', restaurantForm.city);
      formData.append('address', restaurantForm.address);
      formData.append('cuisine', restaurantForm.cuisine.split(',').map(c => c.trim()).filter(c => c));
      
      if (restaurantForm.image) {
        formData.append('image', restaurantForm.image);
      }

      const response = await api.post('/restaurants', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      setRestaurants([...restaurants, response.data]);
      setRestaurantForm({ name: '', description: '', city: '', address: '', cuisine: '', image: null });
      toast.success('Restaurant created successfully!');
    } catch (error) {
      console.error('Error creating restaurant:', error);
      toast.error(error.response?.data?.message || 'Failed to create restaurant');
    } finally {
      setLoading(false);
    }
  };

  const handleDishSubmit = async (e) => {
    e.preventDefault();
    if (!selectedRestaurant) {
      toast.error('Please select a restaurant first');
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('name', dishForm.name);
      formData.append('description', dishForm.description);
      formData.append('price', dishForm.price);
      formData.append('category', dishForm.category);
      
      if (dishForm.image) {
        formData.append('image', dishForm.image);
      }

      const response = await api.post(`/restaurants/${selectedRestaurant._id}/dishes`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      setDishes([...dishes, response.data]);
      setDishForm({ name: '', description: '', price: '', category: 'Veg', image: null });
      toast.success('Dish created successfully!');
    } catch (error) {
      console.error('Error creating dish:', error);
      toast.error(error.response?.data?.message || 'Failed to create dish');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteRestaurant = async (id) => {
    if (window.confirm('Are you sure you want to delete this restaurant?')) {
      try {
        await api.delete(`/restaurants/${id}`);
        setRestaurants(restaurants.filter(r => r._id !== id));
        if (selectedRestaurant?._id === id) {
          setSelectedRestaurant(null);
          setDishes([]);
        }
        toast.success('Restaurant deleted successfully!');
      } catch (error) {
        console.error('Error deleting restaurant:', error);
        toast.error('Failed to delete restaurant');
      }
    }
  };

  const handleDeleteDish = async (id) => {
    if (window.confirm('Are you sure you want to delete this dish?')) {
      try {
        await api.delete(`/dishes/${id}`);
        setDishes(dishes.filter(d => d._id !== id));
        toast.success('Dish deleted successfully!');
      } catch (error) {
        console.error('Error deleting dish:', error);
        toast.error('Failed to delete dish');
      }
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      {/* Tab Navigation */}
      <div className="flex gap-4 border-b mb-6">
        <button
          onClick={() => setActiveTab('restaurants')}
          className={`px-6 py-2 font-semibold border-b-2 transition-all ${
            activeTab === 'restaurants'
              ? 'border-orange-500 text-orange-600'
              : 'border-transparent text-gray-600 hover:text-gray-900'
          }`}
        >
          🏪 Manage Restaurants
        </button>
        <button
          onClick={() => setActiveTab('dishes')}
          className={`px-6 py-2 font-semibold border-b-2 transition-all ${
            activeTab === 'dishes'
              ? 'border-orange-500 text-orange-600'
              : 'border-transparent text-gray-600 hover:text-gray-900'
          }`}
        >
          🍽️ Manage Dishes
        </button>
      </div>

      {/* Restaurants Tab */}
      {activeTab === 'restaurants' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Create Restaurant Form */}
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-lg">
            <h3 className="text-xl font-bold text-gray-900 mb-4">➕ Create New Restaurant</h3>
            <form onSubmit={handleRestaurantSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Restaurant Name *
                </label>
                <input
                  type="text"
                  value={restaurantForm.name}
                  onChange={(e) => setRestaurantForm({ ...restaurantForm, name: e.target.value })}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none"
                  placeholder="e.g., Pizza Palace"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  value={restaurantForm.description}
                  onChange={(e) => setRestaurantForm({ ...restaurantForm, description: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none"
                  placeholder="Describe your restaurant..."
                  rows="3"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  City *
                </label>
                <input
                  type="text"
                  value={restaurantForm.city}
                  onChange={(e) => setRestaurantForm({ ...restaurantForm, city: e.target.value })}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none"
                  placeholder="e.g., New York"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Address *
                </label>
                <input
                  type="text"
                  value={restaurantForm.address}
                  onChange={(e) => setRestaurantForm({ ...restaurantForm, address: e.target.value })}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none"
                  placeholder="e.g., 123 Main Street"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Cuisines (comma-separated)
                </label>
                <input
                  type="text"
                  value={restaurantForm.cuisine}
                  onChange={(e) => setRestaurantForm({ ...restaurantForm, cuisine: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none"
                  placeholder="e.g., Italian, Pizza, Pasta"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Restaurant Image
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setRestaurantForm({ ...restaurantForm, image: e.target.files[0] })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full px-4 py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white font-bold rounded-lg hover:shadow-lg transition-all disabled:opacity-50"
              >
                {loading ? 'Creating...' : '✅ Create Restaurant'}
              </button>
            </form>
          </div>

          {/* Restaurants List */}
          <div className="bg-gray-50 p-6 rounded-lg">
            <h3 className="text-xl font-bold text-gray-900 mb-4">📋 Your Restaurants</h3>
            {restaurants.length > 0 ? (
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {restaurants.map(restaurant => (
                  <div
                    key={restaurant._id}
                    className="bg-white p-4 rounded-lg border border-gray-200 hover:border-orange-400 transition-all cursor-pointer"
                    onClick={() => setSelectedRestaurant(restaurant)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="font-bold text-gray-900">{restaurant.name}</h4>
                        <p className="text-sm text-gray-600">{restaurant.city} • {restaurant.address}</p>
                        {restaurant.cuisine?.length > 0 && (
                          <p className="text-xs text-orange-600 mt-1">{restaurant.cuisine.join(', ')}</p>
                        )}
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteRestaurant(restaurant._id);
                        }}
                        className="px-2 py-1 bg-red-500 hover:bg-red-600 text-white text-xs rounded"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-600 text-center py-8">No restaurants created yet</p>
            )}
          </div>
        </div>
      )}

      {/* Dishes Tab */}
      {activeTab === 'dishes' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Create Dish Form */}
          <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-lg">
            <h3 className="text-xl font-bold text-gray-900 mb-4">➕ Add New Dish</h3>
            
            {!selectedRestaurant ? (
              <div className="bg-yellow-50 border border-yellow-400 p-4 rounded-lg text-yellow-800">
                <p className="font-semibold">⚠️ Select a restaurant first</p>
                <p className="text-sm mt-2">Click on a restaurant in the list below to select it</p>
              </div>
            ) : (
              <form onSubmit={handleDishSubmit} className="space-y-4">
                <div className="bg-white p-3 rounded border-l-4 border-green-500">
                  <p className="text-sm font-semibold text-gray-900">Selected Restaurant:</p>
                  <p className="text-lg font-bold text-green-600">{selectedRestaurant.name}</p>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Dish Name *
                  </label>
                  <input
                    type="text"
                    value={dishForm.name}
                    onChange={(e) => setDishForm({ ...dishForm, name: e.target.value })}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
                    placeholder="e.g., Margherita Pizza"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    value={dishForm.description}
                    onChange={(e) => setDishForm({ ...dishForm, description: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
                    placeholder="Describe the dish..."
                    rows="3"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Category *
                  </label>
                  <select
                    value={dishForm.category}
                    onChange={(e) => setDishForm({ ...dishForm, category: e.target.value })}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none bg-white"
                  >
                    <option value="Veg">🥗 Veg</option>
                    <option value="Non Veg">🍗 Non Veg</option>
                    <option value="Chinese">🥡 Chinese</option>
                    <option value="Vada Pav">🍔 Vada Pav</option>
                    <option value="Thali">🍽️ Thali</option>
                    <option value="Biryani">🍚 Biryani</option>
                    <option value="Pizza">🍕 Pizza</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Price (₹) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={dishForm.price}
                    onChange={(e) => setDishForm({ ...dishForm, price: e.target.value })}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
                    placeholder="e.g., 299.99"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Dish Image
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setDishForm({ ...dishForm, image: e.target.files[0] })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full px-4 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold rounded-lg hover:shadow-lg transition-all disabled:opacity-50"
                >
                  {loading ? 'Creating...' : '✅ Add Dish'}
                </button>
              </form>
            )}
          </div>

          {/* Dishes List */}
          <div className="bg-gray-50 p-6 rounded-lg">
            <h3 className="text-xl font-bold text-gray-900 mb-4">📋 Dishes</h3>
            {selectedRestaurant ? (
              <>
                <div className="bg-white p-3 rounded border-l-4 border-green-500 mb-4">
                  <p className="text-sm font-semibold text-gray-900">From:</p>
                  <p className="text-lg font-bold text-green-600">{selectedRestaurant.name}</p>
                </div>

                {dishes.length > 0 ? (
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {dishes.map(dish => (
                      <div key={dish._id} className="bg-white p-4 rounded-lg border border-gray-200 hover:border-green-400 transition-all">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <h4 className="font-bold text-gray-900">{dish.name}</h4>
                              {dish.category && (
                                <span className="text-xs px-2 py-1 bg-orange-100 text-orange-600 rounded-full font-semibold">
                                  {dish.category}
                                </span>
                              )}
                            </div>
                            {dish.description && (
                              <p className="text-sm text-gray-600">{dish.description}</p>
                            )}
                            <p className="text-lg font-bold text-green-600 mt-2">₹{dish.price.toFixed(2)}</p>
                          </div>
                          <button
                            onClick={() => handleDeleteDish(dish._id)}
                            className="px-2 py-1 bg-red-500 hover:bg-red-600 text-white text-xs rounded"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-600 text-center py-8">No dishes added yet</p>
                )}
              </>
            ) : (
              <p className="text-gray-600 text-center py-8">Select a restaurant to view its dishes</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default RestaurantDishManager;
