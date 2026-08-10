import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { createCalendarEvent } from "../services/sessionService";

/**
 * OAuth2CallbackPage
 *
 * Google redirects the user here after they approve calendar access:
 *   http://localhost:3000/oauth2callback?code=XXX&state=SESSION_ID
 *
 * This page:
 * 1. Reads `code` and `state` (sessionId) from the URL query params
 * 2. Sends them to the backend to exchange the code for tokens and create the event
 * 3. Redirects the user back to their session detail page with a success/error flag
 */
const OAuth2CallbackPage = () => {
  const navigate = useNavigate();
  const [status, setStatus] = useState("loading"); // "loading" | "success" | "error"
  const [message, setMessage] = useState("");

  useEffect(() => {
    const handleCallback = async () => {
      const params = new URLSearchParams(window.location.search);
      const code = params.get("code");
      const sessionId = params.get("state");

      if (!code || !sessionId) {
        setStatus("error");
        setMessage("Missing OAuth2 parameters. Please try again.");
        return;
      }

      try {
        await createCalendarEvent(code, sessionId);
        setStatus("success");
        setMessage("Your session has been added to Google Calendar!");
        // Redirect back to the session detail page after a brief moment
        setTimeout(() => {
          navigate(`/sessions/${sessionId}?calendar=success`);
        }, 2000);
      } catch (err) {
        console.error("Failed to create calendar event:", err);
        setStatus("error");
        setMessage(
          err?.response?.data?.error ||
            "Failed to add event to Google Calendar. Please try again."
        );
        setTimeout(() => {
          navigate(`/sessions/${sessionId}?calendar=error`);
        }, 3000);
      }
    };

    handleCallback();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-12 max-w-md w-full text-center">
        {status === "loading" && (
          <>
            <div className="flex justify-center mb-6">
              <div className="animate-spin rounded-full h-14 w-14 border-4 border-blue-100 border-t-blue-500"></div>
            </div>
            <h2 className="text-xl font-bold text-gray-800">Connecting to Google Calendar…</h2>
            <p className="text-gray-500 mt-2 text-sm">Adding your therapy session, please wait.</p>
          </>
        )}

        {status === "success" && (
          <>
            <div className="flex justify-center mb-6">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                </svg>
              </div>
            </div>
            <h2 className="text-xl font-bold text-gray-800">Added to Google Calendar!</h2>
            <p className="text-gray-500 mt-2 text-sm">{message}</p>
            <p className="text-gray-400 mt-4 text-xs">Redirecting you back…</p>
          </>
        )}

        {status === "error" && (
          <>
            <div className="flex justify-center mb-6">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
                <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
            </div>
            <h2 className="text-xl font-bold text-gray-800">Something went wrong</h2>
            <p className="text-gray-500 mt-2 text-sm">{message}</p>
            <p className="text-gray-400 mt-4 text-xs">Redirecting you back…</p>
          </>
        )}
      </div>
    </div>
  );
};

export default OAuth2CallbackPage;
