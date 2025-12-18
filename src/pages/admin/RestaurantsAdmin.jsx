import { useState, useEffect, useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { AuthContext } from '../../contexts/AuthContext';
import api from '../../api/api';
import resolveImage from '../../utils/resolveImage';
import { toast } from 'react-toastify';
import Map from '../../components/Map';

const RestaurantsAdmin = () => {
  const { user } = useContext(AuthContext);
  const [restaurants, setRestaurants] = useState([]);
  const [editing, setEditing] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const { register, handleSubmit, reset, formState: { errors } } = useForm();
  const [position, setPosition] = useState(null);

  useEffect(() => {
    fetchRestaurants();
  }, []);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file size (5MB max)
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
      const response = await api.get('/admin/restaurants');
      setRestaurants(response.data.restaurants || []);
    } catch (error) {
      toast.error('Failed to fetch restaurants');
    }
  };

  const onSubmit = async (data) => {
    try {
      const formData = new FormData();
      formData.append('name', data.name);
      formData.append('city', data.city);
      formData.append('address', data.address);
      formData.append('description', data.description || '');
      if (data.cuisine) {
        // Convert comma-separated string to array and append each item so multer/express receives an array
        const cuisines = String(data.cuisine).split(',').map(s => s.trim()).filter(Boolean);
        cuisines.forEach(c => formData.append('cuisine', c));
      }
      if (imageFile) {
        formData.append('image', imageFile);
      }

      // Include location (either from inputs or map picker)
      const loc = position || (data.lat || data.lng ? { lat: data.lat ? Number(data.lat) : undefined, lng: data.lng ? Number(data.lng) : undefined } : null);
      if (loc) {
        formData.append('location', JSON.stringify(loc));
      }

      if (editing) {
        await api.put(`/restaurants/${editing._id}`, formData);
        toast.success('Restaurant updated');
      } else {
        await api.post('/admin/restaurants', formData);
        toast.success('Restaurant created');
      }
      fetchRestaurants();
      reset();
      setEditing(null);
      setImageFile(null);
      setImagePreview(null);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save restaurant');
    }
  };

  const handleEdit = (restaurant) => {
    setEditing(restaurant);
    const lat = restaurant.location?.lat;
    const lng = restaurant.location?.lng;
    reset({ ...restaurant, lat, lng });
    setPosition(lat && lng ? { lat, lng } : null);
    setImagePreview(resolveImage(restaurant.imageUrl));
    setImageFile(null);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this restaurant?')) {
      try {
        await api.delete(`/restaurants/${id}`);
        toast.success('Restaurant deleted');
        fetchRestaurants();
      } catch (error) {
        toast.error('Failed to delete restaurant');
      }
    }
  };

  if (!user || user.role !== 'admin') {
    return <Navigate to="/login" />;
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">Manage Restaurants</h1>
      <form onSubmit={handleSubmit(onSubmit)} className="mb-8 bg-gray-100 p-4 rounded">
        <h2 className="text-xl font-semibold mb-4">{editing ? 'Edit Restaurant' : 'Add New Restaurant'}</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block font-semibold mb-1">Name *</label>
            <input {...register('name', { required: 'Name is required' })} className="border p-2 w-full rounded" />
            {errors.name && <p className="text-red-500 text-sm">{errors.name.message}</p>}
          </div>
          <div>
            <label className="block font-semibold mb-1">City *</label>
            <input {...register('city', { required: 'City is required' })} className="border p-2 w-full rounded" />
            {errors.city && <p className="text-red-500 text-sm">{errors.city.message}</p>}
          </div>
          <div>
            <label className="block font-semibold mb-1">Cuisine</label>
            <input {...register('cuisine')} placeholder="e.g., Italian, Chinese" className="border p-2 w-full rounded" />
          </div>
          <div>
            <label className="block font-semibold mb-1">Image Upload</label>
            <input 
              type="file" 
              accept="image/*" 
              onChange={handleImageChange}
              className="border p-2 w-full rounded" 
            />
            <p className="text-xs text-gray-500 mt-1">Max 5MB</p>
          </div>
          <div className="md:col-span-2">
            <label className="block font-semibold mb-1">Address *</label>
            <textarea {...register('address', { required: 'Address is required' })} className="border p-2 w-full rounded" rows="2" />
            {errors.address && <p className="text-red-500 text-sm">{errors.address.message}</p>}
          </div>
          <div className="md:col-span-2">
            <label className="block font-semibold mb-1">Description</label>
            <textarea {...register('description')} className="border p-2 w-full rounded" rows="2" />
          </div>

          <div>
            <label className="block font-semibold mb-1">Latitude (optional)</label>
            <input type="number" step="any" {...register('lat')} className="border p-2 w-full rounded" />
          </div>
          <div>
            <label className="block font-semibold mb-1">Longitude (optional)</label>
            <input type="number" step="any" {...register('lng')} className="border p-2 w-full rounded" />
          </div>

          <div className="md:col-span-2">
            <label className="block font-semibold mb-1">Pick on Map (click map to set location)</label>
            <Map center={position ? position : undefined} position={position} setPosition={(p) => { setPosition(p); reset({ ...editing, lat: p.lat, lng: p.lng }); }} height={250} />
          </div>

          {imagePreview && (
            <div className="md:col-span-2">
              <label className="block font-semibold mb-1">Image Preview</label>
              <img src={imagePreview} alt="preview" className="max-w-xs h-40 object-cover rounded" />
            </div>
          )}
        </div>
        <button type="submit" className="mt-4 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
          {editing ? 'Update' : 'Create'} Restaurant
        </button>
        {editing && (
          <button type="button" onClick={() => { setEditing(null); reset(); setImageFile(null); setImagePreview(null); }} className="mt-4 ml-4 bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600">
            Cancel
          </button>
        )}
      </form>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {restaurants.map((restaurant) => (
          <div key={restaurant._id} className="border p-4 rounded shadow hover:shadow-lg">
            {restaurant.imageUrl && (
              <img src={resolveImage(restaurant.imageUrl)} alt={restaurant.name} className="w-full h-40 object-cover rounded mb-2" />
            )}
            <h3 className="text-lg font-semibold">{restaurant.name}</h3>
            <p className="text-gray-600">{restaurant.city}</p>
            {restaurant.cuisine && <p className="text-sm text-gray-500">{Array.isArray(restaurant.cuisine) ? restaurant.cuisine.join(', ') : restaurant.cuisine}</p>}
            <p className="text-sm text-gray-500 mt-1">{restaurant.address}</p>
            <div className="mt-3 flex space-x-2">
              <button onClick={() => handleEdit(restaurant)} className="bg-yellow-500 text-white px-3 py-1 rounded text-sm hover:bg-yellow-600">Edit</button>
              <button onClick={() => handleDelete(restaurant._id)} className="bg-red-500 text-white px-3 py-1 rounded text-sm hover:bg-red-600">Delete</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RestaurantsAdmin;
