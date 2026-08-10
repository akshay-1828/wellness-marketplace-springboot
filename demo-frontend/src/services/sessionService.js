import axios from "axios";

const API_BASE_URL = "http://localhost:8080/api";

const api = axios.create({
    baseURL: API_BASE_URL,
});

api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem("accessToken");
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

export const getSessions = async () => {
    return api.get("/sessions/my");
};

export const getSessionById = async (id) => {
    return api.get(`/sessions/${id}`);
};

export const bookSession = async (slotId, notes) => {
    const params = new URLSearchParams();
    params.append('slotId', slotId);
    if (notes) params.append('notes', notes);
    return api.post(`/sessions/book?${params.toString()}`);
};

export const updateSessionStatus = async (id, status) => {
    return api.put(`/sessions/${id}/status?status=${status}`);
};

export const getPractitionerSlots = async (id, date) => {
    return api.get(`/practitioner/${id}/slots?date=${date}`);
};

export const getMySlots = async () => {
    return api.get("/practitioner/slots/my");
};

export const addSlot = async (slot) => {
    return api.post("/practitioner/slots", slot);
};

export const deleteSlot = async (id) => {
    return api.delete(`/practitioner/slots/${id}`);
};

export const getUpcomingSessions = async () => {
    return api.get("/sessions/upcoming");
};

// ── Google Calendar Integration ──────────────────────────────────────────────

/**
 * Fetch the Google OAuth2 authorization URL for a specific session.
 * The URL contains a `state` param set to the sessionId.
 */
export const getCalendarAuthUrl = async (sessionId) => {
    return api.get(`/calendar/auth?sessionId=${sessionId}`);
};

/**
 * Send the OAuth2 authorization code (received from Google callback) to the
 * backend so it can exchange it for tokens and create the calendar event.
 */
export const createCalendarEvent = async (code, sessionId) => {
    return api.post("/calendar/create-event", { code, sessionId });
};
