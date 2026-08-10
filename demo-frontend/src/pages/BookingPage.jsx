import React, { useState, useEffect } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import { format } from "date-fns";
import CalendarWidget from "../components/CalendarWidget";
import TimeSlotSelector from "../components/TimeSlotSelector";
import { getPractitionerSlots, bookSession } from "../services/sessionService";

const BookingPage = () => {
    const { id } = useParams();
    const location = useLocation();
    const navigate = useNavigate();
    const query = new URLSearchParams(location.search);
    const practitionerName = query.get('name') || "Practitioner";

    const [selectedDate, setSelectedDate] = useState(new Date());
    const [slots, setSlots] = useState([]);
    const [selectedSlot, setSelectedSlot] = useState(null);
    const [notes, setNotes] = useState("");
    const [loading, setLoading] = useState(false);
    const [booking, setBooking] = useState(false);

    useEffect(() => {
        const fetchSlots = async () => {
            setLoading(true);
            try {
                const res = await getPractitionerSlots(id, format(selectedDate, "yyyy-MM-dd"));
                setSlots(res.data);
                setSelectedSlot(null);
            } catch (err) {
                console.error("Failed to fetch slots", err);
            } finally {
                setLoading(false);
            }
        };
        fetchSlots();
    }, [id, selectedDate]);

    const handleBooking = async () => {
        if (!selectedSlot) return;
        setBooking(true);
        try {
            await bookSession(selectedSlot.id, notes);
            alert("Session booked successfully!");
            navigate("/my-sessions");
        } catch (err) {
            console.error("Booking failed", err);
            alert("Failed to book session. Please try again.");
        } finally {
            setBooking(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto px-4 py-12">
            <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden">
                <div className="bg-indigo-600 px-8 py-10 text-white">
                    <h1 className="text-3xl font-bold">Book a Session</h1>
                    <p className="mt-2 text-indigo-100 opacity-90">Scheduling with <span className="font-semibold">{practitionerName}</span></p>
                </div>

                <div className="p-8 lg:p-12">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                        {/* Left Column: Calendar */}
                        <div>
                            <h2 className="text-lg font-bold text-gray-800 mb-6 flex items-center">
                                <svg className="w-5 h-5 mr-2 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                                Select Date
                            </h2>
                            <CalendarWidget onDateSelect={setSelectedDate} selectedDate={selectedDate} />
                        </div>

                        {/* Right Column: Slots & Notes */}
                        <div className="flex flex-col h-full">
                            <h2 className="text-lg font-bold text-gray-800 mb-6 flex items-center">
                                <svg className="w-5 h-5 mr-2 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                Choose Time & Details
                            </h2>

                            {loading ? (
                                <div className="flex-1 flex justify-center items-center py-12">
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                                </div>
                            ) : (
                                <div className="space-y-8 flex-1">
                                    <TimeSlotSelector
                                        slots={slots}
                                        onSlotSelect={setSelectedSlot}
                                        selectedSlotId={selectedSlot?.id}
                                    />

                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-3">Add private notes (Optional)</label>
                                        <textarea
                                            value={notes}
                                            onChange={(e) => setNotes(e.target.value)}
                                            className="w-full px-5 py-4 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 transition-all outline-none resize-none h-32"
                                            placeholder="Tell the practitioner about your health goals..."
                                        />
                                    </div>
                                </div>
                            )}

                            {selectedSlot && (
                                <div className="mt-6 p-4 bg-green-50 rounded-xl border border-green-100 flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v1m0 8v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                        <span className="text-sm font-semibold text-green-800">Consultation Fee</span>
                                    </div>
                                    <span className="text-lg font-black text-green-600">₹500</span>
                                </div>
                            )}

                            <button
                                onClick={handleBooking}
                                disabled={!selectedSlot || booking}
                                className={`mt-6 w-full py-5 rounded-2xl text-lg font-bold transition-all duration-300 shadow-xl
                                    ${!selectedSlot || booking
                                        ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                                        : "bg-indigo-600 text-white hover:bg-indigo-700 shadow-indigo-200"}`}
                            >
                                {booking ? "Confirming..." : "Confirm & Book (₹500)"}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BookingPage;
