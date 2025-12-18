import { useState, useEffect } from 'react';
import api from '../api/api';
import StarRating from './StarRating';

const ReviewList = ({ targetType, targetId }) => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchReviews();
  }, [targetType, targetId]);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/reviews/${targetType}/${targetId}`);
      setReviews(response.data);
    } catch (error) {
      setError('Failed to load reviews');
      console.error('Error fetching reviews:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  if (loading) {
    return <div className="text-center py-4">Loading reviews...</div>;
  }

  if (error) {
    return <div className="text-center py-4 text-red-500">{error}</div>;
  }

  if (reviews.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <p>No reviews yet. Be the first to review!</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold mb-4">
        Reviews ({reviews.length})
      </h3>

      {reviews.map((review) => (
        <div key={review._id} className="border rounded-lg p-4 bg-white">
          <div className="flex items-start justify-between mb-2">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-semibold">
                {review.user?.name?.charAt(0)?.toUpperCase() || 'U'}
              </div>
              <div>
                <p className="font-medium">{review.user?.name || 'Anonymous'}</p>
                <p className="text-sm text-gray-500">{formatDate(review.createdAt)}</p>
              </div>
            </div>
            <StarRating rating={review.rating} size="sm" showValue={false} />
          </div>

          {review.comment && (
            <p className="text-gray-700 mb-3">{review.comment}</p>
          )}

          {review.images && review.images.length > 0 && (
            <div className="flex gap-2 mt-3">
              {review.images.map((image, index) => (
                <img
                  key={index}
                  src={image}
                  alt={`Review image ${index + 1}`}
                  className="w-16 h-16 object-cover rounded"
                />
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default ReviewList;
