'use client';

import { signIn, signOut, useSession } from 'next-auth/react';
import { useState } from 'react';

interface CalendarButtonProps {
  onCreateEvent?: () => void;
  showCreateButton?: boolean;
}

export function GoogleCalendarButton({ onCreateEvent, showCreateButton = false }: CalendarButtonProps) {
  const { data: session } = useSession();
  const [isLoading, setIsLoading] = useState(false);

  const handleSignIn = async (provider: 'google' | 'azure-ad') => {
    setIsLoading(true);
    await signIn(provider, { redirect: false });
    setIsLoading(false);
  };

  const handleSignOut = async () => {
    setIsLoading(true);
    await signOut({ redirect: false });
    setIsLoading(false);
  };

  const getProviderInfo = () => {
    if (session?.provider === 'azure-ad') {
      return { name: 'Outlook Calendar', icon: '📧', color: 'bg-blue-50 border-blue-200' };
    }
    return { name: 'Google Calendar', icon: '📅', color: 'bg-green-50 border-green-200' };
  };

  const providerInfo = getProviderInfo();

  if (session) {
    return (
      <div className="flex flex-col gap-3">
        <div className={`flex items-center gap-3 ${providerInfo.color} border px-4 py-3 rounded-lg`}>
          <div className="text-sm">
            <p className="font-semibold">✓ Connecté à {providerInfo.name}</p>
            <p className="text-xs opacity-75">{session.user?.email}</p>
          </div>
          <button
            onClick={handleSignOut}
            disabled={isLoading}
            className="ml-auto px-3 py-1 text-sm bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50"
          >
            Déconnecter
          </button>
        </div>
        {showCreateButton && onCreateEvent && (
          <button
            onClick={onCreateEvent}
            className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Planifier un rendez-vous
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <button
        onClick={() => handleSignIn('google')}
        disabled={isLoading}
        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 font-medium"
      >
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z" />
        </svg>
        {isLoading ? 'Connexion...' : 'Connecter Google Calendar'}
      </button>
      <button
        onClick={() => handleSignIn('azure-ad')}
        disabled={isLoading}
        className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 font-medium"
      >
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
          <path d="M11.4 24H0V12.6h11.4V24zM24 24H12.6V12.6H24V24zM11.4 11.4H0V0h11.4v11.4zm12.6 0H12.6V0H24v11.4z" />
        </svg>
        {isLoading ? 'Connexion...' : 'Connecter Outlook Calendar'}
      </button>
    </div>
  );
}
