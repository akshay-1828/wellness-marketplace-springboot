import React from "react";

const TimeSlotSelector = ({ slots, onSlotSelect, selectedSlotId }) => {
    return (
        <div className="mt-6">
            <h3 className="text-md font-semibold text-gray-800 mb-4 flex items-center">
                <svg className="w-5 h-5 mr-2 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                Available Slots
            </h3>
            {slots.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {slots.map((slot) => (
                        <button
                            key={slot.id}
                            disabled={slot.status !== "AVAILABLE"}
                            onClick={() => onSlotSelect(slot)}
                            className={`py-2.5 px-4 rounded-xl text-sm font-medium transition-all duration-200 border
                ${slot.status !== "AVAILABLE"
                                    ? "bg-gray-50 text-gray-400 border-gray-100 cursor-not-allowed"
                                    : selectedSlotId === slot.id
                                        ? "bg-indigo-600 text-white border-indigo-600 shadow-lg transform -translate-y-0.5"
                                        : "bg-white text-gray-700 border-gray-200 hover:border-indigo-400 hover:bg-indigo-50 hover:text-indigo-600"}`}
                        >
                            {slot.startTime.substring(0, 5)}
                        </button>
                    ))}
                </div>
            ) : (
                <div className="bg-orange-50 border border-orange-100 text-orange-600 p-4 rounded-xl text-sm text-center">
                    No slots available for this date.
                </div>
            )}
        </div>
    );
};

export default TimeSlotSelector;
