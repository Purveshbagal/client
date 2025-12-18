import { Link } from 'react-router-dom';

export default function ProfileSupport() {
  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-800">🛟 Support</h2>
      </div>
      <div className="space-y-4">
        <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
          <p className="text-gray-700">For quick support call:</p>
          <p className="text-2xl font-bold text-gray-900">7058409290</p>
        </div>
        <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
          <p className="text-gray-700">Email:</p>
          <p className="text-lg font-semibold text-gray-900">support@swadhan-eats.com</p>
        </div>
        <div className="flex gap-2">
          <Link to="/contact" className="flex-1 text-center bg-gradient-to-r from-orange-500 to-pink-500 text-white px-4 py-3 rounded-lg font-semibold hover:from-orange-600 hover:to-pink-600 transition-all duration-300 shadow-md">
            📬 Open Contact Form
          </Link>
          <a href="tel:7058409290" className="flex-1 text-center bg-green-500 hover:bg-green-600 text-white px-4 py-3 rounded-lg font-semibold transition-all duration-300 shadow-md">
            📞 Call Now
          </a>
        </div>
      </div>
    </div>
  );
}
