import { format } from "date-fns";

export const generateGoogleCalendarUrl = (session) => {
    const startTime = new Date(session.date);
    const endTime = new Date(startTime.getTime() + 60 * 60 * 1000); // Default 1 hour duration

    const fmt = (date) => format(date, "yyyyMMdd'T'HHmmss'Z'");

    const title = `Therapy Session with ${session.practitioner.name}`;
    const details = `Notes: ${session.notes || "No notes provided"}`;
    const location = "Online / WellnessHub";

    const url = new URL("https://www.google.com/calendar/render");
    url.searchParams.append("action", "TEMPLATE");
    url.searchParams.append("text", title);
    url.searchParams.append("dates", `${fmt(startTime)}/${fmt(endTime)}`);
    url.searchParams.append("details", details);
    url.searchParams.append("location", location);

    return url.toString();
};
