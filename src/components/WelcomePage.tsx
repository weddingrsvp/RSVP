import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useEffect } from "react";

interface WelcomePageProps {
  familyCode: string;
  onNext: () => void;
}

export default function WelcomePage({ familyCode, onNext }: WelcomePageProps) {
  const weddingDetails = useQuery(api.wedding.getWeddingDetails);
  const familyData = useQuery(api.families.getFamilyByCode, { code: familyCode });
  const initializeData = useMutation(api.setup.initializeWeddingData);

  useEffect(() => {
    // Initialize sample data if needed
    initializeData();
  }, [initializeData]);

  if (!weddingDetails || familyData === undefined) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-rose-500 mx-auto mb-4"></div>
          <p className="text-rose-600">Loading wedding details...</p>
        </div>
      </div>
    );
  }

  if (familyData === null) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-xl p-6 sm:p-8 max-w-md w-full text-center">
          <div className="text-4xl sm:text-6xl mb-4">💔</div>
          <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-4">Invalid Invitation</h2>
          <p className="text-gray-600 text-sm sm:text-base">
            We couldn't find your invitation. Please check your QR code or contact the couple/family.
          </p>
        </div>
      </div>
    );
  }

  if (familyData.rsvpSubmitted) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-xl p-6 sm:p-8 max-w-md w-full text-center">
          <div className="text-4xl sm:text-6xl mb-4">✅</div>
          <h2 className="text-xl sm:text-2xl font-bold text-green-800 mb-4">RSVP Already Submitted</h2>
          <p className="text-gray-600 mb-4 text-sm sm:text-base">
             Your RSVP has already been submitted.
          </p>
          <p className="text-xs sm:text-sm text-gray-500">
            If you need to make changes, please contact the couple/family directly.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-warm-beige min-h-screen flex flex-col items-center justify-center p-4 sm:p-6">
      <div className="w-full max-w-2xl mx-auto bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-6 sm:p-8">
        <div className="text-center mb-6">
          <span className="text-4xl" role="img" aria-label="love letter">💌</span>
          <h2 className="text-2xl font-bold text-gray-800">You’re Invited: Waleema RSVP!</h2>
          <p>Kindly confirm your presence by the deadline. We look forward to hosting you at the Waleema, inshā’Allāh.</p>
        </div>

        <div className="space-y-4">
          <div className="p-4 bg-white/50 rounded-xl">
            <h3 className="font-bold text-rose-800 text-lg mb-2">Event Details</h3>
            <div className="border-t border-rose-100 pt-2">
              <div className="flex justify-between py-2">
                <span className="font-medium text-rose-700">Date</span>
                <span className="font-semibold text-rose-900">{weddingDetails.weddingDate}</span>
              </div>
              <div className="flex justify-between py-2 border-t border-rose-100">
                <span className="font-medium text-rose-700">Time</span>
                <span className="font-semibold text-rose-900">{weddingDetails.receptionTime}</span>
              </div>
              <div className="flex justify-between py-2 border-t border-rose-100">
                <span className="font-medium text-rose-700">Venue</span>
                <span className="font-semibold text-rose-900">{weddingDetails.venue}</span>
              </div>
              <div className="flex justify-between pt-2 border-t border-rose-100">
                <span className="font-medium text-rose-700">Address</span>
                <span className="font-semibold text-rose-900 text-right">{weddingDetails.venueAddress}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="text-center mt-8">
          <button
            onClick={onNext}
            className="w-full sm:w-auto bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white font-bold py-3 px-8 rounded-full shadow-lg transform hover:scale-105 transition-transform"
          >
            Continue to RSVP ✨
          </button>
        </div>
      </div>
    </div>
  );
}
