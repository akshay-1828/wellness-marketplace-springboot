import React, { useEffect, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { format } from "date-fns";
import { getSessionById, updateSessionStatus } from "../services/sessionService";
import CalendarButton from "../components/CalendarButton";

const SessionDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const calendarStatus = searchParams.get("calendar"); // "success" | "error" | null

  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    const fetchSession = async () => {
      setLoading(true);
      setError("");
      try {
        const res = await getSessionById(id);
        setSession(res.data);
      } catch (err) {
        console.error("Failed to fetch session", err);
        setError(err?.response?.data?.message || "Failed to load session");
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchSession();
  }, [id]);

  const handleCancel = async () => {
    if (!session) return;
    if (!window.confirm("Are you sure you want to cancel this session?")) return;

    setUpdating(true);
    try {
      await updateSessionStatus(session.id, "cancelled");
      const res = await getSessionById(session.id);
      setSession(res.data);
    } catch (err) {
      console.error("Cancel failed", err);
      alert(err?.response?.data?.message || "Failed to cancel session");
    } finally {
      setUpdating(false);
    }
  };

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

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-12">
        <div className="bg-white rounded-2xl border border-gray-100 p-8">
          <h1 className="text-2xl font-bold text-gray-900">Session Detail</h1>
          <p className="mt-3 text-red-600">{error}</p>
          <button
            onClick={() => navigate(-1)}
            className="mt-6 px-6 py-3 bg-gray-100 text-gray-800 rounded-xl font-bold hover:bg-gray-200"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  if (!session) return null;

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      {/* Google Calendar success / error banner */}
      {calendarStatus === "success" && (
        <div className="mb-6 flex items-center gap-3 px-5 py-4 bg-green-50 border border-green-200 rounded-2xl">
          <svg className="w-5 h-5 text-green-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
          </svg>
          <p className="text-green-700 font-semibold text-sm">Session successfully added to your Google Calendar!</p>
        </div>
      )}
      {calendarStatus === "error" && (
        <div className="mb-6 flex items-center gap-3 px-5 py-4 bg-red-50 border border-red-200 rounded-2xl">
          <svg className="w-5 h-5 text-red-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
          </svg>
          <p className="text-red-700 font-semibold text-sm">Could not add to Google Calendar. Please try again.</p>
        </div>
      )}
      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-8 py-8 bg-indigo-600 text-white">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-extrabold">Session Detail</h1>
              <p className="mt-2 text-indigo-100">
                {session.practitioner?.name
                  ? `Therapy Session with ${session.practitioner.name}`
                  : "Therapy Session"}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <span
                className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border ${getStatusColor(
                  session.status
                )}`}
              >
                {session.status}
              </span>
              {session.calendarAdded && (
                <span className="flex items-center gap-1.5 px-3 py-1 bg-green-100 text-green-700 border border-green-200 rounded-full text-xs font-bold">
                  {/* Google "G" icon */}
                  <svg className="w-3.5 h-3.5" viewBox="0 0 24 24">
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  Added to Calendar
                </span>
              )}
              <span className="text-sm font-bold opacity-90">ID: #{session.id}</span>
            </div>
          </div>
        </div>

        <div className="p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <div className="p-5 bg-gray-50 rounded-2xl border border-gray-100">
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Date</p>
                <p className="mt-2 text-lg font-bold text-gray-900">
                  {format(new Date(session.date), "MMMM dd, yyyy")}
                </p>
                <p className="mt-1 text-gray-600 font-semibold">
                  {format(new Date(session.date), "hh:mm a")}
                </p>
              </div>

              <div className="p-5 bg-gray-50 rounded-2xl border border-gray-100">
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Participants</p>
                <p className="mt-2 text-gray-900 font-bold">
                  Practitioner: {session.practitioner?.name || "—"}
                </p>
                <p className="mt-1 text-gray-900 font-bold">Patient: {session.client?.name || "—"}</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="p-5 bg-gray-50 rounded-2xl border border-gray-100">
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Notes</p>
                <p className="mt-2 text-gray-700">
                  {session.notes ? `“${session.notes}”` : "No notes provided."}
                </p>
              </div>

              <div className="flex flex-col gap-3">
                {session.status === "booked" && (
                  session.calendarAdded ? (
                    <div className="flex items-center gap-3 px-5 py-3.5 bg-green-50 border-2 border-green-200 rounded-2xl">
                      <svg className="w-5 h-5 text-green-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                      </svg>
                      <p className="text-green-700 font-bold text-sm">Session synced to Google Calendar</p>
                    </div>
                  ) : (
                    <CalendarButton sessionId={session.id} />
                  )
                )}

                <button
                  onClick={() => navigate(-1)}
                  className="px-8 py-3 bg-white text-gray-700 border-2 border-gray-200 font-bold rounded-2xl hover:bg-gray-50 transition-all"
                >
                  Back to List
                </button>

                {session.status === "booked" && (
                  <button
                    onClick={handleCancel}
                    disabled={updating}
                    className={`px-8 py-3 bg-white text-red-600 border-2 border-red-100 font-bold rounded-2xl hover:bg-red-50 hover:border-red-200 transition-all ${
                      updating ? "opacity-60 cursor-not-allowed" : ""
                    }`}
                  >
                    {updating ? "Cancelling..." : "Cancel Session"}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SessionDetail;
