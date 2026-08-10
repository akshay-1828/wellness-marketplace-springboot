import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
    format, addMonths, subMonths, startOfMonth, endOfMonth,
    startOfWeek, endOfWeek, isSameMonth, isSameDay, addDays
} from "date-fns";
import { getMySlots, addSlot, deleteSlot } from "../services/sessionService";

const TIME_OPTIONS = [
    "08:00", "09:00", "10:00", "11:00",
    "12:00", "13:00", "14:00", "15:00",
    "16:00", "17:00", "18:00",
];

// Mini calendar that highlights dates which have slots
const SlotCalendar = ({ onDateSelect, selectedDate, highlightedDates }) => {
    const [currentMonth, setCurrentMonth] = useState(new Date());

    const renderHeader = () => (
        <div className="flex justify-between items-center mb-3 px-1">
            <button onClick={() => setCurrentMonth(subMonths(currentMonth, 1))} className="p-1.5 hover:bg-gray-100 rounded-lg">
                <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                </svg>
            </button>
            <h2 className="text-sm font-bold text-gray-800">{format(currentMonth, "MMMM yyyy")}</h2>
            <button onClick={() => setCurrentMonth(addMonths(currentMonth, 1))} className="p-1.5 hover:bg-gray-100 rounded-lg">
                <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                </svg>
            </button>
        </div>
    );

    const renderDays = () => {
        const days = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];
        return (
            <div className="grid grid-cols-7 mb-2">
                {days.map((d, i) => (
                    <div key={i} className="text-center text-xs font-medium text-gray-400">{d}</div>
                ))}
            </div>
        );
    };

    const renderCells = () => {
        const monthStart = startOfMonth(currentMonth);
        const monthEnd = endOfMonth(monthStart);
        const startDate = startOfWeek(monthStart);
        const endDate = endOfWeek(monthEnd);
        const rows = [];
        let days = [];
        let day = startDate;

        while (day <= endDate) {
            for (let i = 0; i < 7; i++) {
                const cloneDay = day;
                const dateStr = format(day, "yyyy-MM-dd");
                const hasSlot = highlightedDates?.has(dateStr);
                const isSelected = isSameDay(day, selectedDate);
                const isCurrentMonth = isSameMonth(day, monthStart);

                days.push(
                    <div
                        key={day.toString()}
                        onClick={() => isCurrentMonth && onDateSelect(cloneDay)}
                        className={[
                            "relative cursor-pointer p-1.5 text-center rounded-lg transition-all",
                            !isCurrentMonth ? "text-gray-200 cursor-default" : "",
                            isCurrentMonth && isSelected ? "bg-blue-600 text-white shadow-md" : "",
                            isCurrentMonth && !isSelected ? "text-gray-700 hover:bg-blue-50" : "",
                        ].join(" ")}
                    >
                        <span className="text-xs font-semibold leading-none">{format(day, "d")}</span>
                        {hasSlot && isCurrentMonth && (
                            <span className={`absolute bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full ${isSelected ? "bg-white" : "bg-blue-400"}`}></span>
                        )}
                    </div>
                );
                day = addDays(day, 1);
            }
            rows.push(<div className="grid grid-cols-7 gap-0.5" key={day.toString()}>{days}</div>);
            days = [];
        }
        return <div className="space-y-0.5">{rows}</div>;
    };

    return (
        <div>
            {renderHeader()}
            {renderDays()}
            {renderCells()}
        </div>
    );
};

const AvailabilityPage = () => {
    const navigate = useNavigate();
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [slots, setSlots] = useState([]);
    const [loading, setLoading] = useState(true);
    const [adding, setAdding] = useState(false);
    const [showForm, setShowForm] = useState(false);
    const [startTime, setStartTime] = useState("09:00");
    const [endTime, setEndTime] = useState("10:00");
    const [formError, setFormError] = useState("");

    useEffect(() => {
        fetchSlots();
    }, []);

    const fetchSlots = async () => {
        setLoading(true);
        try {
            const res = await getMySlots();
            setSlots(res.data);
        } catch (err) {
            console.error("Failed to fetch slots", err);
        } finally {
            setLoading(false);
        }
    };

    const handleAddSlot = async () => {
        setFormError("");
        if (startTime >= endTime) {
            setFormError("End time must be after start time.");
            return;
        }
        const dateStr = format(selectedDate, "yyyy-MM-dd");
        setAdding(true);
        try {
            await addSlot({
                availableDate: dateStr,
                startTime: `${startTime}:00`,
                endTime: `${endTime}:00`,
                status: "AVAILABLE",
            });
            setShowForm(false);
            await fetchSlots();
        } catch (err) {
            setFormError(err?.response?.data?.message || "Failed to add slot. It may already exist for that time.");
        } finally {
            setAdding(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Remove this availability slot?")) return;
        try {
            await deleteSlot(id);
            await fetchSlots();
        } catch (err) {
            alert(err?.response?.data?.message || "Could not delete slot.");
        }
    };

    const groupedSlots = slots.reduce((acc, slot) => {
        const key = slot.availableDate;
        if (!acc[key]) acc[key] = [];
        acc[key].push(slot);
        return acc;
    }, {});

    const slotDates = new Set(slots.map((s) => s.availableDate));
    const selectedDateStr = format(selectedDate, "yyyy-MM-dd");
    const slotsForSelectedDate = groupedSlots[selectedDateStr] || [];

    const getStatusBadge = (status) => {
        switch (status) {
            case "AVAILABLE": return "bg-green-100 text-green-700 border-green-200";
            case "BOOKED":    return "bg-indigo-100 text-indigo-700 border-indigo-200";
            case "CANCELLED": return "bg-red-100 text-red-700 border-red-200";
            default:          return "bg-gray-100 text-gray-700 border-gray-200";
        }
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Top Header Bar */}
            <div className="bg-blue-900 text-white px-6 py-4 flex items-center justify-between shadow-lg">
                <div className="flex items-center gap-4">
                    <button onClick={() => navigate("/practitioner-dashboard")} className="p-2 hover:bg-blue-800 rounded-xl transition">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                        </svg>
                    </button>
                    <div>
                        <h1 className="text-xl font-bold">Manage Availability</h1>
                        <p className="text-blue-200 text-xs mt-0.5">Set time slots for patient bookings</p>
                    </div>
                </div>
                <div className="bg-blue-800 px-4 py-2 rounded-xl text-center">
                    <p className="text-xs text-blue-200">Upcoming slots</p>
                    <p className="text-xl font-bold">{slots.length}</p>
                </div>
            </div>

            <div className="max-w-6xl mx-auto px-4 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">

                    {/* Left: Calendar + Add Form */}
                    <div className="lg:col-span-2 space-y-6">
                        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6">
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-sm font-bold text-gray-800">Select a Date</h2>
                                <div className="flex items-center gap-1.5 text-xs text-gray-500">
                                    <span className="w-2 h-2 bg-blue-400 rounded-full inline-block"></span>Has slots
                                </div>
                            </div>
                            <SlotCalendar onDateSelect={setSelectedDate} selectedDate={selectedDate} highlightedDates={slotDates} />
                        </div>

                        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6">
                            <div className="flex items-center justify-between mb-4">
                                <div>
                                    <h2 className="text-sm font-bold text-gray-800">Add Slot</h2>
                                    <p className="text-xs text-gray-500">{format(selectedDate, "EEE, MMM d, yyyy")}</p>
                                </div>
                                <button
                                    onClick={() => { setShowForm(!showForm); setFormError(""); }}
                                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${showForm ? "bg-gray-100 text-gray-600" : "bg-blue-600 text-white hover:bg-blue-700"}`}
                                >
                                    {showForm ? "Cancel" : "+ Add Slot"}
                                </button>
                            </div>
                            {showForm ? (
                                <div className="space-y-4">
                                    {formError && (
                                        <p className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-xl px-3 py-2">{formError}</p>
                                    )}
                                    <div className="grid grid-cols-2 gap-3">
                                        <div>
                                            <label className="block text-xs font-bold text-gray-600 mb-1.5">Start</label>
                                            <select value={startTime} onChange={(e) => setStartTime(e.target.value)}
                                                className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-100 focus:border-blue-400 outline-none">
                                                {TIME_OPTIONS.map((t) => <option key={t} value={t}>{t}</option>)}
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-gray-600 mb-1.5">End</label>
                                            <select value={endTime} onChange={(e) => setEndTime(e.target.value)}
                                                className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-100 focus:border-blue-400 outline-none">
                                                {TIME_OPTIONS.map((t) => <option key={t} value={t}>{t}</option>)}
                                            </select>
                                        </div>
                                    </div>
                                    <button onClick={handleAddSlot} disabled={adding}
                                        className="w-full py-2.5 bg-blue-600 text-white font-bold rounded-2xl hover:bg-blue-700 transition disabled:opacity-60 text-sm">
                                        {adding ? "Adding..." : "Confirm Slot"}
                                    </button>
                                </div>
                            ) : (
                                <p className="text-xs text-gray-400">Select a date above and click "+ Add Slot" to add availability.</p>
                            )}
                        </div>
                    </div>

                    {/* Right: Slot List */}
                    <div className="lg:col-span-3 space-y-6">
                        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                            <div className="px-7 py-5 border-b border-gray-50 flex items-center justify-between">
                                <div>
                                    <h2 className="text-base font-bold text-gray-800">{format(selectedDate, "EEEE, MMMM d, yyyy")}</h2>
                                    <p className="text-sm text-gray-500 mt-0.5">
                                        {slotsForSelectedDate.length} slot{slotsForSelectedDate.length !== 1 ? "s" : ""}
                                        {slotsForSelectedDate.filter(s => s.status === "AVAILABLE").length > 0
                                            ? ` · ${slotsForSelectedDate.filter(s => s.status === "AVAILABLE").length} available` : ""}
                                    </p>
                                </div>
                            </div>

                            {loading ? (
                                <div className="flex justify-center items-center py-14">
                                    <div className="animate-spin rounded-full h-7 w-7 border-b-2 border-blue-600"></div>
                                </div>
                            ) : slotsForSelectedDate.length > 0 ? (
                                <div className="divide-y divide-gray-50">
                                    {slotsForSelectedDate.map((slot) => (
                                        <div key={slot.id} className="px-7 py-4 flex items-center justify-between hover:bg-gray-50 transition">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center flex-shrink-0">
                                                    <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                    </svg>
                                                </div>
                                                <div>
                                                    <p className="font-bold text-gray-900">{slot.startTime?.substring(0, 5)} – {slot.endTime?.substring(0, 5)}</p>
                                                    <span className={`inline-flex mt-1 px-2 py-0.5 rounded-full text-xs font-semibold border ${getStatusBadge(slot.status)}`}>{slot.status}</span>
                                                </div>
                                            </div>
                                            {slot.status !== "BOOKED" ? (
                                                <button onClick={() => handleDelete(slot.id)} className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition" title="Delete slot">
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                    </svg>
                                                </button>
                                            ) : (
                                                <span className="text-xs text-indigo-600 font-semibold bg-indigo-50 px-3 py-1.5 rounded-xl border border-indigo-100">Patient booked</span>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="py-14 text-center">
                                    <div className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center mx-auto mb-3">
                                        <svg className="w-6 h-6 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                        </svg>
                                    </div>
                                    <p className="text-gray-500 text-sm font-medium">No slots for this date</p>
                                    <p className="text-gray-400 text-xs mt-1">Use "+ Add Slot" above to add availability</p>
                                </div>
                            )}
                        </div>

                        {/* Upcoming Dates Overview */}
                        {Object.keys(groupedSlots).filter(d => d > selectedDateStr).length > 0 && (
                            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                                <div className="px-7 py-5 border-b border-gray-50">
                                    <h2 className="text-sm font-bold text-gray-800">Other Upcoming Dates</h2>
                                    <p className="text-xs text-gray-500 mt-0.5">Click to jump to that date</p>
                                </div>
                                <div className="divide-y divide-gray-50">
                                    {Object.entries(groupedSlots)
                                        .filter(([date]) => date > selectedDateStr)
                                        .slice(0, 6)
                                        .map(([date, dateSlots]) => (
                                            <div key={date} className="px-7 py-4 flex items-center justify-between hover:bg-gray-50 cursor-pointer transition"
                                                onClick={() => setSelectedDate(new Date(date + "T12:00:00"))}>
                                                <div>
                                                    <p className="font-semibold text-gray-800 text-sm">{format(new Date(date + "T12:00:00"), "EEE, MMMM d")}</p>
                                                    <p className="text-xs text-gray-500 mt-0.5">{dateSlots.length} slot{dateSlots.length !== 1 ? "s" : ""}, {dateSlots.filter(s => s.status === "AVAILABLE").length} open</p>
                                                </div>
                                                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                                                </svg>
                                            </div>
                                        ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AvailabilityPage;
