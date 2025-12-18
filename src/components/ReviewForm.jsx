import React, { useState } from 'react';
import api from '../api/api';
import StarRating from './StarRating';

export default function ReviewForm({ targetType, targetId, onReviewSubmitted = () => {} }) {
	const [rating, setRating] = useState(5);
	const [comment, setComment] = useState('');
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState(null);

	const handleSubmit = async (e) => {
		e.preventDefault();
		setLoading(true);
		setError(null);
		try {
			const payload = { targetType, targetId, rating, comment };
			await api.post('/reviews', payload);
			setComment('');
			setRating(5);
			onReviewSubmitted();
		} catch (err) {
			console.error('Failed to submit review', err);
			setError(err.response?.data?.message || 'Failed to submit review');
		} finally {
			setLoading(false);
		}
	};

	return (
		<form onSubmit={handleSubmit} className="bg-white p-4 rounded mb-6">
			<h3 className="font-semibold mb-2">Write a review</h3>
			<div className="flex items-center gap-3 mb-3">
				<StarRating rating={rating} onChange={setRating} />
				<span className="text-sm text-gray-600">{rating} / 5</span>
			</div>
			<textarea
				value={comment}
				onChange={(e) => setComment(e.target.value)}
				rows={4}
				placeholder="Share your experience..."
				className="w-full border p-2 rounded mb-3"
			/>

			{error && <div className="text-red-500 mb-2">{error}</div>}

			<div className="flex items-center gap-2">
				<button type="submit" disabled={loading} className="px-3 py-2 bg-indigo-600 text-white rounded">
					{loading ? 'Submitting...' : 'Submit Review'}
				</button>
			</div>
		</form>
	);
}
