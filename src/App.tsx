import { Authenticated, Unauthenticated, useQuery } from "convex/react";
import { api } from "../convex/_generated/api";
import { SignInForm } from "./SignInForm";
import { SignOutButton } from "./SignOutButton";
import { Toaster } from "sonner";
import { useState, useEffect } from "react";
import WelcomePage from "./components/WelcomePage";
import SelectionPage from "./components/SelectionPage";
import ThankYouPage from "./components/ThankYouPage";
import AdminPanel from "./components/AdminPanel";

export default function App() {
  const [currentStep, setCurrentStep] = useState<'welcome' | 'selection' | 'thankyou' | 'admin'>('welcome');
  const [familyCode, setFamilyCode] = useState<string>('');
  const [isAdmin, setIsAdmin] = useState(false);

  // Check URL for family code or admin access
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('family');
    const admin = urlParams.get('admin');
    
    if (admin === 'true') {
      setIsAdmin(true);
      setCurrentStep('admin');
    } else if (code) {
      setFamilyCode(code);
      setCurrentStep('welcome');
    }
  }, []);

  const loggedInUser = useQuery(api.auth.loggedInUser);

  if (isAdmin) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-rose-50 to-pink-50">
        <header className="bg-white/80 backdrop-blur-sm border-b border-rose-200 px-4 sm:px-6 py-4">
          <div className="flex justify-between items-center max-w-6xl mx-auto">
            <h1 className="text-lg sm:text-2xl font-bold text-rose-800">Wedding RSVP Admin</h1>
            <SignOutButton />
          </div>
        </header>
        <main className="p-4 sm:p-6">
          <div className="max-w-6xl mx-auto">
            <Authenticated>
              <AdminPanel />
            </Authenticated>
            <Unauthenticated>
              <div className="max-w-md mx-auto mt-20">
                <div className="bg-white rounded-lg shadow-lg p-6 sm:p-8">
                  <h2 className="text-xl sm:text-2xl font-bold text-center text-rose-800 mb-6">Admin Access Required</h2>
                  <SignInForm />
                </div>
              </div>
            </Unauthenticated>
          </div>
        </main>
        <Toaster />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-pink-50 to-orange-50">
      <div className="min-h-screen flex flex-col">
        {currentStep === 'welcome' && (
          <WelcomePage 
            familyCode={familyCode}
            onNext={() => setCurrentStep('selection')}
          />
        )}
        {currentStep === 'selection' && (
          <SelectionPage 
            familyCode={familyCode}
            onNext={() => setCurrentStep('thankyou')}
            onBack={() => setCurrentStep('welcome')}
          />
        )}
        {currentStep === 'thankyou' && (
          <ThankYouPage />
        )}
      </div>
      <Toaster />
    </div>
  );
}
