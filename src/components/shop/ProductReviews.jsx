import React, { useState, useEffect } from 'react';
import { collection, query, where, orderBy, onSnapshot, deleteDoc, doc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
// FIX: Import from hooks/useAuth instead of context/AuthContext
import { useAuth } from '@/hooks/useAuth'; 
import { ReviewForm } from '@/components/reviews/ReviewForm';
import { ReviewCard } from '@/components/reviews/ReviewCard';
import { Star, MessageSquare } from 'lucide-react';

export const ProductReviews = ({ productId }) => {
  const { user } = useAuth();
  const [reviews, setReviews] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(
      collection(db, 'reviews'),
      where('spotId', '==', productId),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const docs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setReviews(docs);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [productId]);

  const handleDelete = async (reviewId) => {
    try {
      await deleteDoc(doc(db, 'reviews', reviewId));
    } catch (err) {
      console.error("Error deleting review:", err);
    }
  };

  return (
    <div className="bg-white border-t border-gray-100 py-16" id="reviews">
      <div className="max-w-4xl mx-auto px-4 md:px-8">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-end mb-10 gap-6">
          <div>
            <h3 className="font-heading text-3xl text-black font-bold mb-2">Customer Reviews</h3>
            <div className="flex items-center gap-2 text-sm text-gray-500 font-bold">
              <div className="flex text-[var(--color-primary)]">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} size={16} className={i < 4 ? "fill-current" : "text-gray-200"} strokeWidth={0} />
                ))}
              </div>
              <span>Based on {reviews.length} reviews</span>
            </div>
          </div>
          
          <button 
            onClick={() => setShowForm(!showForm)}
            className="bg-black text-white px-6 py-3 text-xs font-bold uppercase tracking-widest hover:bg-[var(--color-primary)] transition-colors rounded flex items-center gap-2"
          >
            <MessageSquare size={16} /> {showForm ? 'Cancel Review' : 'Write a Review'}
          </button>
        </div>

        {/* Review Form */}
        {showForm && (
          <div className="mb-12 animate-fade-in">
            {user ? (
              <ReviewForm 
                spotId={productId} 
                user={user} 
                onPostSuccess={() => setShowForm(false)}
                isPosting={false}
                setIsPosting={() => {}}
              />
            ) : (
              <div className="bg-gray-50 p-6 text-center border border-gray-200 rounded">
                <p className="text-gray-500 mb-4 font-medium">Please sign in to share your experience.</p>
                <a href="/login" className="text-[var(--color-primary)] font-bold uppercase text-xs border-b border-[var(--color-primary)] pb-0.5 hover:text-black hover:border-black transition-all">Login Now</a>
              </div>
            )}
          </div>
        )}

        {/* Reviews List */}
        <div className="space-y-6">
          {loading ? (
            <div className="text-center py-10 text-gray-400">Loading reviews...</div>
          ) : reviews.length === 0 ? (
            <div className="text-center py-16 bg-gray-50 rounded border border-dashed border-gray-200">
              <p className="text-gray-400 mb-2">No reviews yet.</p>
              <p className="text-xs font-bold uppercase tracking-widest text-gray-300">Be the first to review this masterpiece</p>
            </div>
          ) : (
            reviews.map(review => (
              <ReviewCard 
                key={review.id} 
                review={review} 
                user={user} 
                onDeleteReview={handleDelete}
              />
            ))
          )}
        </div>

      </div>
    </div>
  );
};