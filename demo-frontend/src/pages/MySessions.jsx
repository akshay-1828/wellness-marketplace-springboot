import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getSessions, updateSessionStatus } from "../services/sessionService";
import { format } from "date-fns";
import { generateGoogleCalendarUrl } from "../utils/calendarUtils";

const FILTERS = ["All", "Upcoming", "Past", "Cancelled"];

const MySessions = () => {
    const navigate = useNavigate();
    const role = localStorage.getItem("role");
    const isPractitioner = role === "PRACTITIONER";

    const [sessions, setSessions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeFilter, setActiveFilter] = useState("All");

    useEffect(() => {
        fetchSessions();
    }, []);

    const fetchSessions = async () => {
        try {
            const res = await getSessions();
            setSessions(res.data);
        } catch (err) {
            console.error("Failed to fetch sessions", err);
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = async (id) => {
        if (window.confirm("Are you sure you want to cancel this session?")) {
            try {
                await updateSessionStatus(id, "cancelled");
                fetchSessions();
            } catch (err) {
                console.error("Cancel failed", err);
            }
        }
    };

    const now = new Date();

    const filteredSessions = sessions.filter((s) => {
        if (activeFilter === "All") return true;

        if (activeFilter === "Upcoming") {
            return s.status === "booked" && new Date(s.date) >= now;
        }

        if (activeFilter === "Past") {
            return (
                s.status === "completed" ||
                (s.status === "booked" && new Date(s.date) < now)
            );
        }

        if (activeFilter === "Cancelled") {
            return s.status === "cancelled";
        }

        return true;
    });

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            </div>
        );
    }

    const getStatusColor = (status) => {
        switch (status) {
            case "booked":
                return "bg-indigo-100 text-indigo-700 border-indigo-200";

            case "completed":
                return "bg-green-100 text-green-700 border-green-200";

            case "cancelled":
                return "bg-red-100 text-red-700 border-red-200";

            default:
                return "bg-gray-100 text-gray-700 border-gray-200";
        }
    };

    return (
        <div className="w-full px-9 py-8">

            {/* ================= HEADER ================= */}
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">

                <div>
                    <h1 className="text-3xl font-bold text-gray-900">
                        My Sessions
                    </h1>

                    <p className="mt-2 text-gray-600">
                        {isPractitioner
                            ? "Review your upcoming and past sessions with patients."
                            : "Manage your upcoming and past therapy appointments."}
                    </p>
                </div>

                {/* ================= FILTERS ================= */}
                <div className="flex items-center gap-2 flex-wrap">
                    {FILTERS.map((filter) => (
                        <button
                            key={filter}
                            onClick={() => setActiveFilter(filter)}
                            className={`px-4 py-2 rounded-xl text-sm font-semibold border transition ${
                                activeFilter === filter
                                    ? "bg-indigo-600 text-white border-indigo-600"
                                    : "bg-white text-gray-600 border-gray-200 hover:border-indigo-300 hover:text-indigo-600"
                            }`}
                        >
                            {filter}
                        </button>
                    ))}
                </div>
            </div>

            {/* ================= SESSIONS ================= */}

            {filteredSessions.length > 0 ? (
                <div className="space-y-6">

                    {filteredSessions.map((session) => (

                        <div
                            key={session.id}
                            className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-md transition-shadow"
                        >

                            <div className="p-7 flex flex-col md:flex-row md:items-center">

                                {/* ================= SESSION DETAILS ================= */}

                                <div className="flex-1">

                                    {/* STATUS + ID */}

                                    <div className="flex items-center flex-wrap gap-2 mb-4">

                                        <span
                                            className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border ${getStatusColor(
                                                session.status
                                            )}`}
                                        >
                                            {session.status}
                                        </span>

                                        {session.calendarAdded && (
                                            <span className="flex items-center gap-1.5 px-3 py-1 bg-green-100 text-green-700 border border-green-200 rounded-full text-xs font-bold">

                                                <svg
                                                    className="w-3.5 h-3.5"
                                                    viewBox="0 0 24 24"
                                                >
                                                    <path
                                                        fill="#34A853"
                                                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                                                    />

                                                    <path
                                                        fill="#4285F4"
                                                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                                                    />

                                                    <path
                                                        fill="#FBBC05"
                                                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
                                                    />

                                                    <path
                                                        fill="#EA4335"
                                                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                                                    />
                                                </svg>

                                                Added to Calendar

                                            </span>
                                        )}

                                        <span className="mx-1 text-gray-300">
                                            |
                                        </span>

                                        <span className="text-sm font-bold text-gray-500">
                                            ID: #{session.id}
                                        </span>

                                    </div>

                                    {/* SESSION TITLE */}

                                    <h3 className="text-2xl font-bold text-gray-900 mb-2">
                                        {isPractitioner
                                            ? `Session with ${
                                                  session.client?.name ||
                                                  "Patient"
                                              }`
                                            : `Session with ${
                                                  session.practitioner?.name ||
                                                  "Practitioner"
                                              }`}
                                    </h3>

                                    {/* DATE + TIME */}

                                    <div className="flex flex-wrap gap-6 mt-4">

                                        <div className="flex items-center text-gray-600">

                                            <svg
                                                className="w-5 h-5 mr-2 text-indigo-400"
                                                fill="none"
                                                stroke="currentColor"
                                                viewBox="0 0 24 24"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth="2"
                                                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                                                />
                                            </svg>

                                            <span className="font-semibold">
                                                {format(
                                                    new Date(session.date),
                                                    "MMMM dd, yyyy"
                                                )}
                                            </span>

                                        </div>

                                        <div className="flex items-center text-gray-600">

                                            <svg
                                                className="w-5 h-5 mr-2 text-indigo-400"
                                                fill="none"
                                                stroke="currentColor"
                                                viewBox="0 0 24 24"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth="2"
                                                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                                                />
                                            </svg>

                                            <span className="font-semibold">
                                                {format(
                                                    new Date(session.date),
                                                    "hh:mm a"
                                                )}
                                            </span>

                                        </div>

                                    </div>

                                    {/* NOTES */}

                                    {session.notes && (
                                        <div className="mt-6 p-4 bg-gray-50 rounded-xl border border-gray-100 italic text-gray-600 text-sm">
                                            "{session.notes}"
                                        </div>
                                    )}

                                </div>

                                {/* ================= ACTION BUTTONS ================= */}

                                <div className="mt-8 md:mt-0 md:ml-8 flex flex-col gap-3">

                                    <button
                                        onClick={() =>
                                            navigate(
                                                `/sessions/${session.id}`
                                            )
                                        }
                                        className="px-8 py-3 bg-white text-gray-800 border border-gray-200 font-bold rounded-xl hover:bg-gray-50 transition-all text-center"
                                    >
                                        View Details
                                    </button>

                                    {session.status === "booked" && (
                                        <>
                                            <a
                                                href={generateGoogleCalendarUrl(
                                                    session
                                                )}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="px-8 py-3 bg-indigo-50 text-indigo-700 border border-indigo-100 font-bold rounded-xl hover:bg-indigo-100 transition-all text-center"
                                            >
                                                Add to Calendar
                                            </a>

                                            <button
                                                onClick={() =>
                                                    handleCancel(session.id)
                                                }
                                                className="px-8 py-3 bg-white text-red-600 border border-red-100 font-bold rounded-xl hover:bg-red-50 hover:border-red-200 transition-all"
                                            >
                                                Cancel Session
                                            </button>
                                        </>
                                    )}

                                </div>

                            </div>

                        </div>
                    ))}

                </div>

            ) : (

                /* ================= EMPTY STATE ================= */

                <div className="bg-white rounded-2xl p-16 text-center border border-gray-100 shadow-sm">

                    <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6 text-gray-400">

                        <svg
                            className="w-10 h-10"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                        </svg>

                    </div>

                    <h2 className="text-2xl font-bold text-gray-800">
                        {activeFilter === "All"
                            ? "No sessions yet"
                            : `No ${activeFilter.toLowerCase()} sessions`}
                    </h2>

                    <p className="mt-2 text-gray-500 mb-10">
                        {activeFilter === "All"
                            ? isPractitioner
                                ? "Sessions booked by patients will appear here."
                                : "Your journey to wellness starts with your first session."
                            : `No sessions match the "${activeFilter}" filter.`}
                    </p>

                    {isPractitioner ? (
                        <button
                            onClick={() => navigate("/availability")}
                            className="inline-block bg-indigo-600 text-white font-bold px-10 py-4 rounded-xl hover:bg-indigo-700 shadow-sm"
                        >
                            Manage Availability
                        </button>
                    ) : (
                        <a
                            href="/practitioners"
                            className="inline-block bg-indigo-600 text-white font-bold px-10 py-4 rounded-xl hover:bg-indigo-700 shadow-sm"
                        >
                            Find a Practitioner
                        </a>
                    )}

                </div>
            )}

        </div>
    );
};

export default MySessions;