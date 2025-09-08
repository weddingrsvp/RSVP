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
            We couldn't find your invitation. Please check your QR code or contact the couple.
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
            Thank you! Your RSVP has already been submitted.
          </p>
          <p className="text-xs sm:text-sm text-gray-500">
            If you need to make changes, please contact the couple/family directly.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl p-4 sm:p-6 lg:p-8 max-w-2xl w-full">
        {/* Header with couple names */}
        <div className="text-center mb-6 sm:mb-8">
          <div className="text-3xl sm:text-4xl mb-3 sm:mb-4">💕</div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-rose-800 mb-2 leading-tight">
            {weddingDetails.brideName} & {weddingDetails.groomName}
          </h1>
          <p className="text-lg sm:text-xl text-rose-600 font-medium">are getting married!</p>
        </div>

        {/* Family greeting */}
        <div className="text-center mb-6 sm:mb-8 p-3 sm:p-4 bg-rose-50 rounded-lg">
          <h2 className="text-lg sm:text-xl lg:text-2xl font-semibold text-rose-800 mb-2">
            Dear {familyData.familyName}
          </h2>
          <p className="text-rose-700 text-sm sm:text-base">
            We're so excited to celebrate with you!
          </p>
        </div>

        {/* Wedding details */}
        <div className="space-y-4 sm:space-y-6 mb-6 sm:mb-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
            <div className="bg-gradient-to-r from-rose-100 to-pink-100 p-3 sm:p-4 rounded-lg">
              <h3 className="font-semibold text-rose-800 mb-2 flex items-center text-sm sm:text-base">
                📅 Date & Time
              </h3>
              <p className="text-rose-700 text-sm sm:text-base font-medium">{weddingDetails.weddingDate}</p>
              <p className="text-xs sm:text-sm text-rose-600">Ceremony: {weddingDetails.ceremonyTime}</p>
              <p className="text-xs sm:text-sm text-rose-600">Reception: {weddingDetails.receptionTime}</p>
            </div>

            <div className="bg-gradient-to-r from-pink-100 to-orange-100 p-3 sm:p-4 rounded-lg">
              <h3 className="font-semibold text-rose-800 mb-2 flex items-center text-sm sm:text-base">
                📍 Venue
              </h3>
              <p className="text-rose-700 font-medium text-sm sm:text-base">{weddingDetails.venue}</p>
              <p className="text-xs sm:text-sm text-rose-600 leading-relaxed">{weddingDetails.venueAddress}</p>
            </div>
          </div>

          {weddingDetails.dressCode && (
            <div className="bg-gradient-to-r from-orange-100 to-yellow-100 p-3 sm:p-4 rounded-lg">
              <h3 className="font-semibold text-rose-800 mb-2 flex items-center text-sm sm:text-base">
                👗 Dress Code
              </h3>
              <p className="text-rose-700 text-sm sm:text-base">{weddingDetails.dressCode}</p>
            </div>
          )}

          {weddingDetails.additionalInfo && (
            <div className="bg-gradient-to-r from-yellow-100 to-rose-100 p-3 sm:p-4 rounded-lg">
              <h3 className="font-semibold text-rose-800 mb-2 flex items-center text-sm sm:text-base">
                💌 Special Note
              </h3>
              <p className="text-rose-700 text-sm sm:text-base leading-relaxed">{weddingDetails.additionalInfo}</p>
            </div>
          )}
        </div>

        {/* Guest list preview */}
        <div className="mb-6 sm:mb-8 p-3 sm:p-4 bg-gray-50 rounded-lg">
          <h3 className="font-semibold text-gray-800 mb-3 text-sm sm:text-base">Invited Guests:</h3>
          <div className="grid grid-cols-1 gap-2">
            {familyData.guests.map((guest) => (
              <div key={guest._id} className="flex items-center space-x-2 py-1">
                <span className="text-lg sm:text-xl">{guest.isChild ? '👶' : '👤'}</span>
                <span className="text-gray-700 text-sm sm:text-base">
                  {guest.firstName} {guest.lastName}
                </span>
                {guest.isChild && (
                  <span className="text-xs text-gray-500 bg-gray-200 px-2 py-1 rounded-full">Child</span>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Continue button */}
        <div className="text-center">
          <button
            onClick={onNext}
            className="w-full sm:w-auto bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white font-semibold py-3 sm:py-4 px-6 sm:px-8 rounded-lg shadow-lg transform transition hover:scale-105 text-sm sm:text-base"
          >
            Continue to RSVP ✨
          </button>
        </div>
      </div>
    </div>
  );
}
