import { useOutletContext } from 'react-router-dom';

export default function ProfileSettings() {
  const { handleSubmit, onSubmit, register, errors, setPreferencesOpen } = useOutletContext();

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-800">⚙️ Settings</h2>
      </div>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Name</label>
          <input 
            {...register('name', { required: true })} 
            className="w-full border-2 border-gray-200 rounded-lg p-3 focus:border-orange-500 focus:ring focus:ring-orange-200 transition-all"
            placeholder="Your name"
          />
          {errors?.name && <p className="text-red-500 text-sm mt-1">Name is required</p>}
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Email</label>
          <input 
            type="email" 
            {...register('email', { required: true })} 
            className="w-full border-2 border-gray-200 rounded-lg p-3 focus:border-orange-500 focus:ring focus:ring-orange-200 transition-all"
            placeholder="your@email.com"
          />
          {errors?.email && <p className="text-red-500 text-sm mt-1">Email is required</p>}
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Address</label>
          <textarea 
            {...register('address')} 
            className="w-full border-2 border-gray-200 rounded-lg p-3 focus:border-orange-500 focus:ring focus:ring-orange-200 transition-all"
            rows="3"
            placeholder="Your delivery address"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Phone (Optional)</label>
          <input 
            {...register('phone')} 
            className="w-full border-2 border-gray-200 rounded-lg p-3 focus:border-orange-500 focus:ring focus:ring-orange-200 transition-all"
            placeholder="Your phone number"
          />
        </div>

        <div className="flex gap-2">
          <button 
            type="submit" 
            className="flex-1 bg-gradient-to-r from-green-500 to-emerald-500 text-white px-4 py-3 rounded-lg font-semibold hover:from-green-600 hover:to-emerald-600 transition-all duration-300 shadow-md"
          >
            💾 Save Changes
          </button>
          <button 
            type="button" 
            onClick={() => setPreferencesOpen(true)} 
            className="flex-1 bg-blue-50 text-blue-700 px-4 py-3 rounded-lg font-semibold hover:bg-blue-100 transition-all duration-300 border border-blue-200"
          >
            🧰 Edit Preferences
          </button>
        </div>
      </form>
    </div>
  );
}
