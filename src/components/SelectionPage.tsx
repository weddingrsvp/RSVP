import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useState } from "react";
import { toast } from "sonner";

interface SelectionPageProps {
  familyCode: string;
  onNext: () => void;
  onBack: () => void;
}

interface GuestResponse {
  guestId: string;
  willAttend: boolean;
  dietaryRestrictions?: string;
}

export default function SelectionPage({ familyCode, onNext, onBack }: SelectionPageProps) {
  const familyData = useQuery(api.families.getFamilyByCode, { code: familyCode });
  const submitRSVP = useMutation(api.families.submitRSVP);
  
  const [guestResponses, setGuestResponses] = useState<Record<string, GuestResponse>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!familyData) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-rose-500"></div>
      </div>
    );
  }

  const updateGuestResponse = (guestId: string, field: keyof GuestResponse, value: any) => {
    setGuestResponses(prev => ({
      ...prev,
      [guestId]: {
        ...prev[guestId],
        guestId,
        [field]: value,
      }
    }));
  };

  const handleSubmit = async () => {
    // Validate that all guests have responses
    const allResponses = familyData.guests.map(guest => {
      const response = guestResponses[guest._id];
      if (!response || response.willAttend === undefined) {
        return null;
      }
      return {
        guestId: guest._id,
        willAttend: response.willAttend,
        dietaryRestrictions: response.dietaryRestrictions || undefined,
      };
    });

    if (allResponses.some(r => r === null)) {
      toast.error("Please respond for all guests");
      return;
    }

    setIsSubmitting(true);
    try {
      await submitRSVP({
        familyId: familyData._id,
        guestResponses: allResponses.filter(r => r !== null),
      });
      toast.success("RSVP submitted successfully!");
      onNext();
    } catch (error) {
      toast.error("Failed to submit RSVP. Please try again.");
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const attendingCount = Object.values(guestResponses).filter(r => r.willAttend === true).length;
  const notAttendingCount = Object.values(guestResponses).filter(r => r.willAttend === false).length;

  return (
    <div className="bg-warm-beige min-h-screen flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl p-4 sm:p-6 lg:p-8 max-w-3xl w-full">
        {/* Header */}
        <div className="text-center mb-6 sm:mb-8">
          <div className="text-3xl sm:text-4xl mb-3 sm:mb-4">📝</div>
          <h1 className="text-2xl sm:text-3xl font-bold text-rose-800 mb-2">RSVP Selection</h1>
          <p className="text-rose-600 text-sm sm:text-base">Please let us know who will be attending</p>
        </div>

        {/* Family name
        <div className="text-center mb-4 sm:mb-6 p-3 bg-rose-50 rounded-lg">
          <h2 className="text-lg sm:text-xl font-semibold text-rose-800">{familyData.familyName}</h2>
        </div> */}

        {/* Guest selection */}
        <div className="space-y-4 mb-6 sm:mb-8">
          {familyData.guests.map((guest) => {
            const response = guestResponses[guest._id];
            return (
              <div key={guest._id} className="border border-gray-200 rounded-lg p-3 sm:p-4">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <span className="text-xl sm:text-2xl">{guest.isChild ? '👶' : '👤'}</span>
                    <div>
                      <h3 className="font-semibold text-gray-800 text-sm sm:text-base">
                        {guest.firstName} {guest.lastName}
                      </h3>
                      {guest.isChild && (
                        <span className="text-xs text-gray-500 bg-gray-200 px-2 py-1 rounded-full">Child</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Attendance selection */}
                <div className="mb-4">
                  <p className="text-sm font-medium text-gray-700 mb-3">Will attend?</p>
                  <div className="space-y-2 sm:space-y-0 sm:flex sm:space-x-4">
                    <label className="flex items-center space-x-2 cursor-pointer p-2 rounded-lg hover:bg-green-50 transition-colors">
                      <input
                        type="radio"
                        name={`attend-${guest._id}`}
                        checked={response?.willAttend === true}
                        onChange={() => updateGuestResponse(guest._id, 'willAttend', true)}
                        className="text-green-500 focus:ring-green-500 w-4 h-4"
                      />
                      <span className="text-green-700 font-medium text-sm sm:text-base">✅ Yes, I'll be there!</span>
                    </label>
                    <label className="flex items-center space-x-2 cursor-pointer p-2 rounded-lg hover:bg-red-50 transition-colors">
                      <input
                        type="radio"
                        name={`attend-${guest._id}`}
                        checked={response?.willAttend === false}
                        onChange={() => updateGuestResponse(guest._id, 'willAttend', false)}
                        className="text-red-500 focus:ring-red-500 w-4 h-4"
                      />
                      <span className="text-red-700 font-medium text-sm sm:text-base">❌ Sorry, can't make it</span>
                    </label>
                  </div>
                </div>

                {/* Dietary restrictions (only if attending)
                {response?.willAttend === true && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Dietary restrictions or allergies (optional)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g., Vegetarian, Gluten-free, Nut allergy..."
                      value={response.dietaryRestrictions || ''}
                      onChange={(e) => updateGuestResponse(guest._id, 'dietaryRestrictions', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-rose-500 text-sm sm:text-base"
                    />
                  </div>
                )} */}
              </div>
            );
          })}
        </div>

        {/* Summary */}
        {Object.keys(guestResponses).length > 0 && (
          <div className="mb-6 p-3 sm:p-4 bg-gray-50 rounded-lg">
            <h3 className="font-semibold text-gray-800 mb-2 text-sm sm:text-base">Summary:</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-sm">
              <span className="text-green-700 flex items-center">
                <span className="mr-1">✅</span> Attending: {attendingCount}
              </span>
              <span className="text-red-700 flex items-center">
                <span className="mr-1">❌</span> Not attending: {notAttendingCount}
              </span>
              {/* <span className="text-gray-600 flex items-center">
                <span className="mr-1">⏳</span> Pending: {familyData.guests.length - attendingCount - notAttendingCount}
              </span> */}
            </div>
          </div>
        )}

        {/* Action buttons */}
        <div className="flex flex-col sm:flex-row justify-between gap-3 sm:gap-0">
          <button
            onClick={onBack}
            className="order-2 sm:order-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm sm:text-base"
          >
            ← Back
          </button>
          <button
            onClick={handleSubmit}
            disabled={isSubmitting || Object.keys(guestResponses).length !== familyData.guests.length}
            className="order-1 sm:order-2 bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 disabled:from-gray-400 disabled:to-gray-400 text-white font-semibold py-3 px-6 sm:px-8 rounded-lg shadow-lg transform transition hover:scale-105 disabled:hover:scale-100 disabled:cursor-not-allowed text-sm sm:text-base"
          >
            {isSubmitting ? (
              <span className="flex items-center justify-center space-x-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span>Submitting...</span>
              </span>
            ) : (
              'Submit RSVP ✨'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
