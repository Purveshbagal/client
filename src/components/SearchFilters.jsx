import React, { useState, useEffect } from 'react';

export default function SearchFilters({ filters: initialFilters = {}, onFiltersChange = () => {} }) {
  const [filters, setFilters] = useState({
    q: '',
    cuisine: [],
    priceRange: '',
    rating: '',
    deliveryTime: '',
    dietary: [],
    sortBy: 'createdAt',
    sortOrder: 'desc',
    ...initialFilters,
  });

  useEffect(() => {
    setFilters(prev => ({ ...prev, ...initialFilters }));
  }, [initialFilters]);

  const update = (patch) => {
    const next = { ...filters, ...patch };
    setFilters(next);
    onFiltersChange(next);
  };

  const toggleArray = (key, value) => {
    const arr = new Set(filters[key] || []);
    if (arr.has(value)) arr.delete(value); else arr.add(value);
    update({ [key]: Array.from(arr) });
  };

  const reset = () => {
    const base = { q: '', cuisine: [], priceRange: '', rating: '', deliveryTime: '', dietary: [], sortBy: 'createdAt', sortOrder: 'desc' };
    setFilters(base);
    onFiltersChange(base);
  };

  return (
    <div className="bg-white p-4 rounded shadow mb-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium">Search</label>
          <input
            value={filters.q}
            onChange={e => update({ q: e.target.value })}
            placeholder="Search restaurants, cuisine or city"
            className="mt-1 p-2 w-full border rounded"
          />
        </div>

        <div>
          <label className="block text-sm font-medium">Cuisine</label>
          <div className="flex gap-2 mt-1 flex-wrap">
            {['Chinese','Vegetarian','Non-Veg','Indian','Italian'].map(c => (
              <button
                key={c}
                type="button"
                onClick={() => toggleArray('cuisine', c)}
                className={`px-2 py-1 rounded border ${filters.cuisine.includes(c) ? 'bg-indigo-600 text-white' : 'bg-white'}`}
              >{c}</button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium">Sort</label>
          <div className="flex gap-2 mt-1">
            <select value={filters.sortBy} onChange={e => update({ sortBy: e.target.value })} className="p-2 border rounded">
              <option value="createdAt">Newest</option>
              <option value="name">Name</option>
              <option value="averageRating">Rating</option>
              <option value="deliveryTime">Delivery time</option>
            </select>
            <select value={filters.sortOrder} onChange={e => update({ sortOrder: e.target.value })} className="p-2 border rounded">
              <option value="desc">Desc</option>
              <option value="asc">Asc</option>
            </select>
          </div>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-1 md:grid-cols-4 gap-4">
        <div>
          <label className="block text-sm font-medium">Min Rating</label>
          <select value={filters.rating} onChange={e => update({ rating: e.target.value })} className="mt-1 p-2 border rounded w-full">
            <option value="">Any</option>
            <option value="4">4+</option>
            <option value="4.5">4.5+</option>
            <option value="3">3+</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium">Max Delivery Time (mins)</label>
          <input value={filters.deliveryTime} onChange={e => update({ deliveryTime: e.target.value })} className="mt-1 p-2 border rounded w-full" placeholder="e.g. 30" />
        </div>

        <div>
          <label className="block text-sm font-medium">Dietary</label>
          <div className="flex gap-2 mt-1">
            {['Vegan','Vegetarian','Gluten-Free'].map(d => (
              <button key={d} type="button" onClick={() => toggleArray('dietary', d)} className={`px-2 py-1 rounded border ${filters.dietary.includes(d) ? 'bg-indigo-600 text-white' : 'bg-white'}`}>{d}</button>
            ))}
          </div>
        </div>

        <div className="flex items-end">
          <div className="w-full flex gap-2">
            <button type="button" onClick={() => onFiltersChange(filters)} className="px-3 py-2 bg-indigo-600 text-white rounded">Apply</button>
            <button type="button" onClick={reset} className="px-3 py-2 bg-gray-200 rounded">Reset</button>
          </div>
        </div>
      </div>
    </div>
  );
}
