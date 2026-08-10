import React, { useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import Button from "../components/Button";
import { submitReview } from "../services/reviewService";
import { getCurrentUserId } from "../services/userService";

const ReviewFormPage = () => {
  const navigate = useNavigate();
  const { practitionerId } = useParams();

  const parsedPractitionerId = useMemo(() => Number(practitionerId), [practitionerId]);

  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const canSubmit =
    Number.isFinite(parsedPractitionerId) &&
    parsedPractitionerId > 0 &&
    Number.isFinite(Number(rating)) &&
    Number(rating) >= 1 &&
    Number(rating) <= 5 &&
    !isSubmitting;

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!canSubmit) return;

    setIsSubmitting(true);
    try {
      const userId = await getCurrentUserId();
      await submitReview({
        userId,
        practitionerId: parsedPractitionerId,
        rating: Number(rating),
        comment: comment.trim() || null,
      });

      navigate("/practitioners");
    } catch (err) {
      console.error("Submit review error:", err);
      const msg = err?.response?.data?.message || err?.response?.data || err?.message;
      setError(msg || "Unable to submit review.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-xl px-4 py-10">
        <div className="mb-6">
          <Link to="/practitioners" className="text-sm text-emerald-700 hover:underline">
            ← Back to practitioners
          </Link>
        </div>

        <div className="rounded-3xl border border-gray-200 bg-white p-7 shadow-sm">
          <h1 className="text-2xl font-bold text-gray-900">Leave a review</h1>
          <p className="mt-1 text-sm text-gray-600">
            Practitioner ID: {Number.isFinite(parsedPractitionerId) ? parsedPractitionerId : "—"}
          </p>

          {error && (
            <div className="mt-4 rounded-2xl border border-red-200 bg-red-50 p-4">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          <form onSubmit={onSubmit} className="mt-6 space-y-5">
            <div>
              <label className="block text-sm font-semibold text-gray-800">Rating</label>
              <div className="mt-2 flex items-center gap-2">
                {[1, 2, 3, 4, 5].map((n) => (
                  <button
                    key={n}
                    type="button"
                    onClick={() => setRating(n)}
                    className={
                      "h-10 w-10 rounded-xl border text-sm font-bold transition " +
                      (n <= rating
                        ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                        : "border-gray-200 bg-white text-gray-700 hover:bg-gray-50")
                    }
                    aria-label={`Set rating to ${n}`}
                  >
                    {n}
                  </button>
                ))}
              </div>
              <p className="mt-2 text-xs text-gray-500">Select 1 (low) to 5 (high).</p>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-800">Comment (optional)</label>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                rows={4}
                className="mt-2 w-full rounded-2xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-emerald-300"
                placeholder="Share your experience…"
              />
            </div>

            <div className="flex justify-end">
              <Button
                type="submit"
                variant="primary"
                className="w-auto px-6 py-2.5 rounded-xl"
                disabled={!canSubmit}
                loading={isSubmitting}
              >
                Submit review
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ReviewFormPage;
