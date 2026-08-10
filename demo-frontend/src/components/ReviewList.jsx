import React from "react";
import { getReviewMediaUrl } from "../services/productReviewService";

const ReviewList = ({ reviews, loading, formatDate, currentUserId, onDeleteReview }) => {
  if (loading) {
    return <p className="text-sm text-gray-600">Loading reviews...</p>;
  }
  if (!reviews || reviews.length === 0) {
    return <p className="text-sm text-gray-400">No reviews yet.</p>;
  }

  return (
    <div className="space-y-4">
      {reviews.map((r) => {
        const mediaSrc = getReviewMediaUrl(r.mediaUrl);
        return (
          <div key={r.id} className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {/* Rating Display */}
                <div className="flex text-amber-400">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <svg key={i} className={`w-4 h-4 ${i < r.rating ? "fill-current" : "text-gray-200"}`} viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                {r.createdAt && (
                  <span className="text-xs text-gray-400">{formatDate(r.createdAt)}</span>
                )}
              </div>
            </div>

            {r.comment && <p className="mt-2 text-sm text-gray-700">{r.comment}</p>}

            {r.mediaUrl && mediaSrc && (
              <div className="mt-3">
                {r.mediaType === "VIDEO" ? (
                  <video src={mediaSrc} controls className="max-h-64 rounded-lg shadow-sm" />
                ) : (
                  <img src={mediaSrc} alt="Review attachment" className="max-h-64 rounded-lg shadow-sm" />
                )}
              </div>
            )}

            {currentUserId && Number(r.userId) === Number(currentUserId) && (
              <div className="mt-3 flex justify-end">
                <button
                  type="button"
                  onClick={() => onDeleteReview?.(r.id)}
                  className="flex items-center gap-1 rounded-lg bg-red-50 px-3 py-1.5 text-xs font-bold text-red-600 transition-all hover:bg-red-100"
                >
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-16v12M4 7h16M10 4h4" />
                  </svg>
                  Delete
                </button>
              </div>
            )}

            <p className="mt-2 text-xs text-gray-400">User #{r.userId}</p>
          </div>
        );
      })}
    </div>
  );
};

export default ReviewList;
