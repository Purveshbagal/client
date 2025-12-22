import { useState, useEffect, useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { AuthContext } from '../../contexts/AuthContext';
import api from '../../api/api';
import resolveImage from '../../utils/resolveImage';
import formatPrice from '../../utils/currency';
import { toast } from 'react-toastify';

const DishesAdmin = () => {
  const { user } = useContext(AuthContext);
  const [restaurants, setRestaurants] = useState([]);
  const [selectedRestaurant, setSelectedRestaurant] = useState('');
  const [dishes, setDishes] = useState([]);
  const [editing, setEditing] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const { register, handleSubmit, reset, formState: { errors } } = useForm();

  useEffect(() => {
    fetchRestaurants();
  }, []);

  useEffect(() => {
    if (selectedRestaurant) {
      fetchDishes();
    }
  }, [selectedRestaurant]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image size must be less than 5MB');
        return;
      }
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const fetchRestaurants = async () => {
    try {
      // Use admin endpoint so admin sees only their own restaurants
      const response = await api.get('/admin/restaurants');
      setRestaurants(response.data.restaurants || []);
    } catch (error) {
      toast.error('Failed to fetch restaurants');
    }
  };

  const fetchDishes = async () => {
    try {
      const response = await api.get(`/restaurants/${selectedRestaurant}/dishes`);
      setDishes(Array.isArray(response.data) ? response.data : (response.data.dishes || []));
    } catch (error) {
      toast.error('Failed to fetch dishes');
    }
  };

  const onSubmit = async (data) => {
    try {
      const formData = new FormData();
      formData.append('name', data.name);
      formData.append('price', data.price);
      formData.append('description', data.description || '');
      formData.append('available', data.available !== undefined ? data.available : true);
      if (imageFile) {
        formData.append('image', imageFile);
      }

      if (editing) {
        await api.put(`/dishes/${editing._id}`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        toast.success('Dish updated');
      } else {
        await api.post(`/admin/restaurants/${selectedRestaurant}/dishes`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        toast.success('Dish created');
      }
      fetchDishes();
      reset();
      setEditing(null);
      setImageFile(null);
      setImagePreview(null);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save dish');
    }
  };

  const handleEdit = (dish) => {
    setEditing(dish);
    reset(dish);
    setImagePreview(resolveImage(dish.imageUrl));
    setImageFile(null);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this dish?')) {
      try {
        await api.delete(`/dishes/${id}`);
        toast.success('Dish deleted');
        fetchDishes();
      } catch (error) {
        toast.error('Failed to delete dish');
      }
    }
  };

  if (!user || user.role !== 'admin') {
    return <Navigate to="/login" />;
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">Manage Dishes</h1>
      <div className="mb-6">
        <label className="block mb-2">Select Restaurant</label>
        <select
          value={selectedRestaurant}
          onChange={(e) => setSelectedRestaurant(e.target.value)}
          className="border p-2 w-full"
        >
          <option value="">Choose a restaurant</option>
          {restaurants.map((restaurant) => (
            <option key={restaurant._id} value={restaurant._id}>
              {restaurant.name}
            </option>
          ))}
        </select>
      </div>
      {selectedRestaurant && (
        <>
          <form onSubmit={handleSubmit(onSubmit)} className="mb-8 bg-gray-100 p-4 rounded">
            <h2 className="text-xl font-semibold mb-4">{editing ? 'Edit Dish' : 'Add New Dish'}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold mb-1">Name *</label>
                <input {...register('name', { required: 'Name is required' })} className="border p-2 w-full rounded" />
                {errors.name && <p className="text-red-500 text-sm">{errors.name.message}</p>}
              </div>
              <div>
                <label className="block font-semibold mb-1">Price *</label>
                <input type="number" step="0.01" {...register('price', { required: 'Price is required', min: 0 })} className="border p-2 w-full rounded" />
                {errors.price && <p className="text-red-500 text-sm">{errors.price.message}</p>}
              </div>
              <div className="md:col-span-2">
                <label className="block font-semibold mb-1">Description</label>
                <textarea {...register('description')} className="border p-2 w-full rounded" rows="2" />
              </div>
              <div className="md:col-span-2">
                <label className="block font-semibold mb-1">Image Upload</label>
                <input 
                  type="file" 
                  accept="image/*" 
                  onChange={handleImageChange}
                  className="border p-2 w-full rounded" 
                />
                <p className="text-xs text-gray-500 mt-1">Max 5MB</p>
              </div>
              {imagePreview && (
                <div className="md:col-span-2">
                  <label className="block font-semibold mb-1">Image Preview</label>
                  <img src={imagePreview} alt="preview" className="max-w-xs h-40 object-cover rounded" />
                </div>
              )}
            </div>
            <button type="submit" className="mt-4 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
              {editing ? 'Update' : 'Create'} Dish
            </button>
            {editing && (
              <button type="button" onClick={() => { setEditing(null); reset(); setImageFile(null); setImagePreview(null); }} className="mt-4 ml-4 bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600">
                Cancel
              </button>
            )}
          </form>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {dishes.map((dish) => (
              <div key={dish._id} className="border p-2 rounded shadow hover:shadow-md">
                {dish.imageUrl && (
                  <img src={resolveImage(dish.imageUrl)} alt={dish.name} className="w-full h-24 object-cover rounded mb-1" />
                )}
                <h3 className="text-sm font-semibold line-clamp-1">{dish.name}</h3>
                {dish.description && <p className="text-xs text-gray-600 line-clamp-1">{dish.description}</p>}
                <p className="text-sm font-bold text-green-600 mt-1">{formatPrice(dish.price)}</p>
                <div className="mt-2 flex gap-1">
                  <button onClick={() => handleEdit(dish)} className="bg-yellow-500 text-white px-2 py-1 rounded text-xs hover:bg-yellow-600 flex-1">Edit</button>
                  <button onClick={() => handleDelete(dish._id)} className="bg-red-500 text-white px-2 py-1 rounded text-xs hover:bg-red-600 flex-1">Delete</button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default DishesAdmin;
