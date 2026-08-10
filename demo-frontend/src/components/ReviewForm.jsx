import React, { useState } from "react";
import Button from "./Button";
import { submitProductReviewWithMedia } from "../services/productReviewService";
import { getCurrentUserId } from "../services/userService";

const ReviewForm = ({ productId, canSubmit, disabledReason, onSubmitted }) => {
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [comment, setComment] = useState("");
  const [media, setMedia] = useState(null);
  const [preview, setPreview] = useState(null);
  const [previewType, setPreviewType] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleMediaChange = (e) => {
    const file = e.target.files?.[0] || null;
    setMedia(file);
    setError("");

    if (!file) {
      setPreview(null);
      setPreviewType(null);
      return;
    }

    const isImage = file.type?.startsWith("image/");
    const isVideo = file.type?.startsWith("video/");
    if (!isImage && !isVideo) {
      setError("Please upload an image or video file.");
      setMedia(null);
      setPreview(null);
      setPreviewType(null);
      return;
    }

    const objectUrl = URL.createObjectURL(file);
    setPreview(objectUrl);
    setPreviewType(isVideo ? "VIDEO" : "IMAGE");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!canSubmit) {
      setError(disabledReason || "You are not allowed to submit a review.");
      return;
    }

    if (rating < 1 || rating > 5) {
      setError("Please select a rating between 1 and 5.");
      return;
    }

    setSubmitting(true);
    try {
      const userId = await getCurrentUserId();
      await submitProductReviewWithMedia({
        userId,
        productId,
        rating,
        comment: comment.trim() || "",
        media,
      });

      setRating(0);
      setHover(0);
      setComment("");
      setMedia(null);
      setPreview(null);
      setPreviewType(null);

      if (onSubmitted) {
        await onSubmitted();
      }
    } catch (err) {
      const msg = err?.response?.data?.message || err?.response?.data || err?.message;
      setError(msg || "Error submitting review.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mt-6 rounded-2xl border border-gray-100 bg-gray-50 p-4">
      <h4 className="text-sm font-bold text-gray-900">Give your review</h4>

      {disabledReason && (
        <p className="mt-2 text-sm text-gray-600">{disabledReason}</p>
      )}

      {error && (
        <p className="mt-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>
      )}

      <form onSubmit={handleSubmit} className="mt-3 space-y-4">
        <div>
          <label className="block text-sm font-semibold text-gray-800">Rating</label>
          <div className="mt-2 text-2xl">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setRating(star)}
                onMouseEnter={() => setHover(star)}
                onMouseLeave={() => setHover(0)}
                className={
                  "mr-1 cursor-pointer bg-transparent " +
                  (star <= (hover || rating) ? "text-yellow-500" : "text-gray-300")
                }
                disabled={!canSubmit || submitting}
                aria-label={`Set rating ${star}`}
              >
                ★
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-800">Comment</label>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            rows={3}
            className="mt-2 w-full rounded-2xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-emerald-300"
            placeholder="Write your review..."
            disabled={!canSubmit || submitting}
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-800">Upload image or video (optional)</label>
          <input
            type="file"
            accept="image/*,video/*"
            onChange={handleMediaChange}
            className="mt-2 block w-full text-sm text-gray-700"
            disabled={!canSubmit || submitting}
          />
        </div>

        {preview && previewType === "IMAGE" && (
          <div className="mt-2 overflow-hidden rounded-xl border border-gray-200 bg-white p-2">
            <img src={preview} alt="Review upload preview" className="max-h-48 w-auto rounded-lg object-contain" />
          </div>
        )}

        {preview && previewType === "VIDEO" && (
          <div className="mt-2 overflow-hidden rounded-xl border border-gray-200 bg-white p-2">
            <video src={preview} controls className="max-h-56 w-full rounded-lg" />
          </div>
        )}

        <div className="flex justify-end">
          <Button
            type="submit"
            variant="primary"
            className="w-auto rounded-xl px-6 py-2.5"
            disabled={!canSubmit || submitting}
            loading={submitting}
          >
            Submit review
          </Button>
        </div>
      </form>
    </div>
  );
};

export default ReviewForm;
