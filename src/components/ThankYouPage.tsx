import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";

export default function ThankYouPage() {
  const weddingDetails = useQuery(api.wedding.getWeddingDetails);

  if (!weddingDetails) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-rose-500"></div>
      </div>
    );
  }

  return (
    <div className="bg-warm-beige min-h-screen flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl p-6 sm:p-8 max-w-2xl w-full text-center">
        {/* Success animation */}
        <div className="mb-6 sm:mb-8">
          <div className="text-4xl sm:text-6xl mb-3 sm:mb-4 animate-bounce">🎉</div>
        </div>

        {/* Thank you message */}
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-rose-800 mb-4">
          Jazakallah Khair!
        </h1>
        <p className="text-lg sm:text-xl text-rose-600 mb-6">
          Your RSVP has been successfully submitted
        </p>

        {/* Confirmation details */}
        <div className="bg-gradient-to-r from-rose-50 to-pink-50 p-4 sm:p-6 rounded-lg mb-6 sm:mb-8">
          <h2 className="text-lg sm:text-xl lg:text-2xl font-semibold text-rose-800 mb-4">
            Thank you for letting us know. May this gathering be a source of barakah, inshā’Allāh.
          </h2>
          <div className="space-y-2 text-rose-700 text-sm sm:text-base">
            <p><strong>{weddingDetails.groomName} & {weddingDetails.brideName}</strong></p>
            <p>{weddingDetails.weddingDate}</p>
            <p className="leading-relaxed">{weddingDetails.venue}</p>
          </div>
        </div>

        {/* Additional information */}
        <div className="space-y-3 sm:space-y-4 text-gray-600 text-sm sm:text-base mb-6 sm:mb-8">
          {/* <p className="leading-relaxed">
            You should receive a confirmation email shortly with all the wedding details.
          </p> */}
          <p className="leading-relaxed">
            If you need to make any changes to your RSVP, please contact the couple/family directly.
          </p>
        </div>

        {/* Decorative elements */}
        <div className="mb-6 sm:mb-8 flex justify-center space-x-3 sm:space-x-4 text-xl sm:text-2xl">
          <span>🌹</span>
          <span>💒</span>
          <span>🥂</span>
          <span>💐</span>
          <span>🎊</span>
        </div>

        {/* Contact info
        <div className="p-3 sm:p-4 bg-gray-50 rounded-lg">
          <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
            Questions? Contact the happy couple at{' '}
            <a href="mailto:wedding@example.com" className="text-rose-600 hover:underline break-all">
              wedding@example.com
            </a>
          </p>
        </div> */}
      </div>
    </div>
  );
}
