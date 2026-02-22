import React, { useEffect, useState } from 'react';
import { Star, User } from 'lucide-react';
import { addReview, getProductReviews } from '../services/productService';
import { Review } from '../types';

interface ReviewSectionProps {
  productId: string;
}

export const ReviewSection: React.FC<ReviewSectionProps> = ({ productId }) => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [userName, setUserName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchReviews = async () => {
    const data = await getProductReviews(productId);
    setReviews(data);
  };

  useEffect(() => {
    fetchReviews();
  }, [productId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userName.trim() || !comment.trim()) return;
    
    setIsSubmitting(true);
    try {
      await addReview(productId, userName, rating, comment);
      setComment('');
      setUserName('');
      setRating(5);
      await fetchReviews();
    } catch (error) {
      console.error("Failed to submit review", error);
      alert("Failed to submit review. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const avgRating = reviews.length 
    ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1)
    : 'New';

  return (
    <div className="mt-16 border-t border-gray-100 pt-10">
      <h3 className="text-2xl font-serif font-bold text-dark-900 mb-6">Customer Reviews</h3>
      
      <div className="flex items-center gap-4 mb-8 bg-gray-50 p-6 rounded-lg">
        <div className="text-4xl font-bold text-dark-900">{avgRating}</div>
        <div>
          <div className="flex text-gold-500">
             {[1,2,3,4,5].map(star => (
               <Star key={star} size={20} fill={Number(avgRating) >= star ? "currentColor" : "none"} strokeWidth={1} />
             ))}
          </div>
          <p className="text-sm text-gray-500 mt-1">Based on {reviews.length} reviews</p>
        </div>
      </div>

      <div className="space-y-8 mb-12">
        {reviews.length === 0 && <p className="text-gray-500 italic">No reviews yet. Be the first to review!</p>}
        {reviews.map(review => (
          <div key={review.id} className="border-b border-gray-100 pb-6">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-500">
                  <User size={16} />
                </div>
                <span className="font-bold text-sm text-dark-900">{review.user_name}</span>
              </div>
              <span className="text-xs text-gray-400">{new Date(review.created_at).toLocaleDateString()}</span>
            </div>
            <div className="flex text-gold-500 mb-2">
              {[...Array(5)].map((_, i) => (
                <Star key={i} size={14} fill={i < review.rating ? "currentColor" : "none"} />
              ))}
            </div>
            <p className="text-gray-700 text-sm leading-relaxed">{review.comment}</p>
          </div>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="bg-gray-50 p-6 rounded-lg">
        <h4 className="font-serif font-bold text-lg mb-4">Write a Review</h4>
        
        <div className="mb-4">
          <label className="block text-xs font-bold uppercase tracking-wider mb-2">Rating</label>
          <div className="flex gap-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setRating(star)}
                className={`focus:outline-none transition-transform hover:scale-110 ${rating >= star ? 'text-gold-500' : 'text-gray-300'}`}
              >
                <Star size={24} fill={rating >= star ? "currentColor" : "none"} />
              </button>
            ))}
          </div>
        </div>

        <div className="mb-4">
          <label className="block text-xs font-bold uppercase tracking-wider mb-2">Your Name</label>
          <input
            type="text"
            required
            className="w-full border border-gray-300 p-3 rounded-sm focus:border-gold-500 outline-none"
            value={userName}
            onChange={(e) => setUserName(e.target.value)}
            placeholder="John Doe"
          />
        </div>

        <div className="mb-4">
          <label className="block text-xs font-bold uppercase tracking-wider mb-2">Review</label>
          <textarea
            required
            rows={4}
            className="w-full border border-gray-300 p-3 rounded-sm focus:border-gold-500 outline-none"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Share your thoughts about this scent..."
          ></textarea>
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="bg-dark-900 text-white px-8 py-3 uppercase text-xs font-bold tracking-widest hover:bg-gold-600 transition-colors disabled:opacity-50"
        >
          {isSubmitting ? 'Submitting...' : 'Submit Review'}
        </button>
      </form>
    </div>
  );
};