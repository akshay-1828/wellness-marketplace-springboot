import React, { useMemo, useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { getVerifiedPractitioners } from "../services/practitionerService";
import { getReviewsByPractitionerId } from "../services/reviewService";

const PractitionerListing = () => {
    const role = localStorage.getItem("role");
    const canBook = role !== "PRACTITIONER";
    const [practitioners, setPractitioners] = useState([]);
    const [loading, setLoading] = useState(true);
    const [expandedReviewsFor, setExpandedReviewsFor] = useState(null);
    const [reviewsByPractitionerId, setReviewsByPractitionerId] = useState({});
    const [loadingReviews, setLoadingReviews] = useState({});

    useEffect(() => {
        const fetchPractitioners = async () => {
            try {
                const res = await getVerifiedPractitioners();
                setPractitioners(res.data);
            } catch (err) {
                console.error("Failed to fetch practitioners", err);
            } finally {
                setLoading(false);
            }
        };
        fetchPractitioners();
    }, []);

    const formatDate = (isoOrNull) => {
        if (!isoOrNull) return null;
        const d = new Date(isoOrNull);
        if (Number.isNaN(d.getTime())) return null;
        return d.toLocaleDateString();
    };

    const loadReviews = async (practitionerId) => {
        if (!practitionerId) return;

        setLoadingReviews((prev) => ({ ...prev, [practitionerId]: true }));
        try {
            const data = await getReviewsByPractitionerId(practitionerId);
            setReviewsByPractitionerId((prev) => ({
                ...prev,
                [practitionerId]: Array.isArray(data) ? data : [],
            }));
        } catch (err) {
            console.error("Failed to load reviews", err);
            setReviewsByPractitionerId((prev) => ({ ...prev, [practitionerId]: [] }));
        } finally {
            setLoadingReviews((prev) => ({ ...prev, [practitionerId]: false }));
        }
    };

    const toggleReviews = async (practitionerId) => {
        if (expandedReviewsFor === practitionerId) {
            setExpandedReviewsFor(null);
            return;
        }

        setExpandedReviewsFor(practitionerId);

        // Fetch once on first open
        if (!Object.prototype.hasOwnProperty.call(reviewsByPractitionerId, practitionerId)) {
            await loadReviews(practitionerId);
        }
    };

    const reviewCountById = useMemo(() => {
        const map = {};
        for (const [k, v] of Object.entries(reviewsByPractitionerId)) {
            map[k] = Array.isArray(v) ? v.length : 0;
        }
        return map;
    }, [reviewsByPractitionerId]);

    const formatRating = (rating) => {
        const num = Number(rating);
        if (!Number.isFinite(num) || num <= 0) return "N/A";
        return num.toFixed(1);
    };

    if (loading) return <div className="flex justify-center items-center h-64"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div></div>;

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="mb-10">
                <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">Browse Practitioners</h1>
                <p className="mt-3 text-xl text-gray-500">Connect with verified experts for your alternative therapy journey.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {practitioners.map((p) => (
                    <div key={p.id} className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                        <div className="h-3 bg-gradient-to-r from-indigo-500 to-purple-600"></div>
                        <div className="p-8">
                            <div className="flex items-center mb-6">
                                <div className="w-16 h-16 bg-indigo-100 rounded-2xl flex items-center justify-center text-indigo-600 text-2xl font-bold">
                                    {p.name.charAt(0)}
                                </div>
                                <div className="ml-4">
                                    <h2 className="text-xl font-bold text-gray-900">{p.name}</h2>
                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                        Verified
                                    </span>
                                </div>
                            </div>

                            <div className="space-y-3 mb-8">
                                <div className="flex items-center text-gray-600">
                                    <svg className="w-5 h-5 mr-2 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                                    <span className="text-sm font-medium">{p.specialization}</span>
                                </div>
                                <div className="flex items-center text-gray-600">
                                    <svg className="w-5 h-5 mr-2 text-yellow-500" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                                    <span className="text-sm font-medium">{formatRating(p.rating)} Rating</span>
                                </div>
                                <div className="flex items-center text-gray-600">
                                    <svg className="w-5 h-5 mr-2 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v1m0 8v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                    <span className="text-sm font-bold text-green-600">₹500 / Session</span>
                                </div>
                            </div>

                            {canBook ? (
                                <Link
                                    to={`/book/${p.userId}?name=${p.name}`}
                                    className="block w-full text-center bg-indigo-600 text-white font-bold py-4 rounded-2xl hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200"
                                >
                                    Book Session
                                </Link>
                            ) : (
                                <div className="block w-full text-center bg-gray-100 text-gray-500 font-bold py-4 rounded-2xl border border-gray-200">
                                    Practitioners cannot book sessions
                                </div>
                            )}

                            <Link
                                to={`/reviews/practitioner/${p.userId}/new`}
                                className="mt-3 block w-full text-center border border-indigo-200 text-indigo-700 font-bold py-3.5 rounded-2xl hover:bg-indigo-50 transition-colors"
                            >
                                Leave a Review
                            </Link>

                            <button
                                type="button"
                                onClick={() => toggleReviews(p.userId)}
                                className="mt-3 w-full text-center border border-gray-200 text-gray-700 font-bold py-3.5 rounded-2xl hover:bg-gray-50 transition-colors"
                            >
                                {expandedReviewsFor === p.userId ? "Hide Reviews" : "View Reviews"}
                                {reviewCountById[String(p.userId)] ? ` (${reviewCountById[String(p.userId)]})` : ""}
                            </button>

                            {expandedReviewsFor === p.userId && (
                                <div className="mt-4 rounded-2xl border border-gray-100 bg-gray-50 p-4">
                                    <div className="flex items-center justify-between">
                                        <p className="text-sm font-bold text-gray-800">Reviews</p>
                                        <button
                                            type="button"
                                            onClick={() => loadReviews(p.userId)}
                                            disabled={Boolean(loadingReviews[p.userId])}
                                            className="text-xs font-bold text-indigo-600 hover:underline disabled:opacity-60"
                                        >
                                            {loadingReviews[p.userId] ? "Loading…" : "Refresh"}
                                        </button>
                                    </div>

                                    {Boolean(loadingReviews[p.userId]) && (
                                        <p className="mt-3 text-sm text-gray-600">Loading reviews…</p>
                                    )}

                                    {!loadingReviews[p.userId] && Array.isArray(reviewsByPractitionerId[p.userId]) && reviewsByPractitionerId[p.userId].length === 0 && (
                                        <p className="mt-3 text-sm text-gray-600">No reviews yet.</p>
                                    )}

                                    {!loadingReviews[p.userId] && Array.isArray(reviewsByPractitionerId[p.userId]) && reviewsByPractitionerId[p.userId].length > 0 && (
                                        <div className="mt-3 space-y-3">
                                            {reviewsByPractitionerId[p.userId].map((r) => (
                                                <div key={r.id} className="rounded-2xl bg-white border border-gray-100 p-4">
                                                    <div className="flex items-center justify-between gap-3">
                                                        <p className="text-sm font-bold text-gray-900">Rating: {r.rating}/5</p>
                                                        <p className="text-xs text-gray-500">{formatDate(r.createdAt) || ""}</p>
                                                    </div>
                                                    {r.comment ? (
                                                        <p className="mt-2 text-sm text-gray-700">{r.comment}</p>
                                                    ) : (
                                                        <p className="mt-2 text-sm text-gray-500 italic">No comment provided.</p>
                                                    )}
                                                    <p className="mt-2 text-xs text-gray-400">User #{r.userId}</p>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default PractitionerListing;
