import React, { useContext, useEffect, useState } from 'react'
import { Link, Navigate } from 'react-router-dom'
import { AuthContext } from '../../contexts/AuthContext'
import api from '../../api/api'

export default function Dashboard() {
  const { user } = useContext(AuthContext)
  const [restaurantCount, setRestaurantCount] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchRestaurantCount()
  }, [])

  const fetchRestaurantCount = async () => {
    try {
      const response = await api.get('/admin/restaurants')
      setRestaurantCount(response.data.restaurants?.length || 0)
    } catch (error) {
      console.error('Error fetching restaurants:', error)
    } finally {
      setLoading(false)
    }
  }

  if (!user || user.role !== 'admin') {
    return <Navigate to="/login" />
  }

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-4xl font-bold mb-8">Admin Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-blue-100 border border-blue-300 rounded p-6">
          <h2 className="text-2xl font-semibold text-blue-800 mb-2">Restaurants</h2>
          {loading ? <p>Loading...</p> : <p className="text-3xl font-bold text-blue-600">{restaurantCount}</p>}
          <p className="text-gray-600 text-sm mt-2">Total restaurants you've added</p>
        </div>

        <div className="bg-green-100 border border-green-300 rounded p-6">
          <h2 className="text-2xl font-semibold text-green-800 mb-2">Actions</h2>
          <p className="text-gray-600 text-sm mt-2">Manage your restaurants and dishes</p>
        </div>
      </div>

      <div className="space-y-4">
        <Link 
          to="/admin/restaurants" 
          className="block bg-blue-500 text-white px-6 py-3 rounded hover:bg-blue-600 font-semibold text-center"
        >
          📊 Manage Restaurants
        </Link>
        <Link 
          to="/admin/dishes" 
          className="block bg-green-500 text-white px-6 py-3 rounded hover:bg-green-600 font-semibold text-center"
        >
          🍽️ Manage Dishes
        </Link>
        <Link 
          to="/" 
          className="block bg-gray-500 text-white px-6 py-3 rounded hover:bg-gray-600 font-semibold text-center"
        >
          👁️ View Public Dashboard
        </Link>
      </div>
    </div>
  )
}
