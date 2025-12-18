import React from 'react'

export default function CategoryCard({ name, image, active, onClick }) {
  return (
    <button onClick={onClick} className={`flex flex-col items-center p-3 rounded-lg transition-transform transform ${active ? 'scale-105 bg-blue-50' : 'bg-white'} shadow` }>
      <div className="w-20 h-20 rounded-full bg-gray-100 overflow-hidden flex items-center justify-center mb-2">
        {image ? <img src={image} alt={name} className="w-full h-full object-cover" /> : <span className="text-xl">🍽️</span>}
      </div>
      <div className="text-sm font-medium">{name}</div>
    </button>
  )
}
