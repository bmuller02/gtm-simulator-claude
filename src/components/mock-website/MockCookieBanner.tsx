'use client';

import { useState } from 'react';

interface MockCookieBannerProps {
  onEvent: (name: string, data?: Record<string, unknown>) => void;
}

export function MockCookieBanner({ onEvent }: MockCookieBannerProps) {
  const [consentState, setConsentState] = useState<{
    analytics: 'pending' | 'granted' | 'denied';
    ads: 'pending' | 'granted' | 'denied';
  }>({ analytics: 'pending', ads: 'pending' });
  const [bannerVisible, setBannerVisible] = useState(true);

  const grantAll = () => {
    setConsentState({ analytics: 'granted', ads: 'granted' });
    setBannerVisible(false);
    onEvent('page_view', { analytics_consent: 'granted', ads_consent: 'granted' });
  };

  const denyAll = () => {
    setConsentState({ analytics: 'denied', ads: 'denied' });
    setBannerVisible(false);
    onEvent('page_view', { analytics_consent: 'denied', ads_consent: 'denied' });
  };

  const customSave = () => {
    setBannerVisible(false);
    onEvent('page_view', {
      analytics_consent: consentState.analytics,
      ads_consent: consentState.ads,
    });
  };

  return (
    <div className="min-h-full bg-gray-50 relative">
      <header className="bg-white border-b px-4 py-3">
        <div className="font-bold text-gray-800">EuroShop GmbH</div>
        <p className="text-xs text-gray-500">🇪🇺 GDPR Compliant Store</p>
      </header>

      <div className="px-4 py-6">
        <h2 className="font-medium text-gray-800 mb-3">Featured Products</h2>
        <div className="grid grid-cols-2 gap-3">
          {['Nordic Chair', 'Oak Desk', 'Wool Rug', 'Ceramic Lamp'].map((item) => (
            <div key={item} className="bg-white rounded border p-3">
              <div className="h-16 bg-gray-100 rounded mb-2" />
              <p className="text-xs font-medium text-gray-700">{item}</p>
            </div>
          ))}
        </div>

        {/* Consent status display */}
        <div className="mt-4 bg-white rounded-lg border p-3">
          <p className="text-xs font-medium text-gray-700 mb-2">Current Consent State (data layer):</p>
          <div className="flex gap-3">
            <div className={`text-xs px-2 py-1 rounded-full ${
              consentState.analytics === 'granted' ? 'bg-green-100 text-green-700' :
              consentState.analytics === 'denied' ? 'bg-red-100 text-red-700' :
              'bg-gray-100 text-gray-500'
            }`}>
              analytics_consent: {consentState.analytics}
            </div>
            <div className={`text-xs px-2 py-1 rounded-full ${
              consentState.ads === 'granted' ? 'bg-green-100 text-green-700' :
              consentState.ads === 'denied' ? 'bg-red-100 text-red-700' :
              'bg-gray-100 text-gray-500'
            }`}>
              ads_consent: {consentState.ads}
            </div>
          </div>
        </div>
      </div>

      {/* Cookie Banner */}
      {bannerVisible && (
        <div className="absolute bottom-0 left-0 right-0 bg-white border-t shadow-lg p-4">
          <p className="text-xs font-medium text-gray-800 mb-1">🍪 We use cookies</p>
          <p className="text-xs text-gray-500 mb-3">
            We use analytics and advertising cookies to improve your experience.
          </p>
          <div className="space-y-2 mb-3">
            <label className="flex items-center gap-2 text-xs text-gray-700">
              <input type="checkbox" className="h-3 w-3" checked disabled /> Strictly Necessary
            </label>
            <label className="flex items-center gap-2 text-xs text-gray-700">
              <input
                type="checkbox"
                className="h-3 w-3"
                checked={consentState.analytics === 'granted'}
                onChange={(e) =>
                  setConsentState((s) => ({
                    ...s,
                    analytics: e.target.checked ? 'granted' : 'denied',
                  }))
                }
              />
              Analytics Cookies
            </label>
            <label className="flex items-center gap-2 text-xs text-gray-700">
              <input
                type="checkbox"
                className="h-3 w-3"
                checked={consentState.ads === 'granted'}
                onChange={(e) =>
                  setConsentState((s) => ({
                    ...s,
                    ads: e.target.checked ? 'granted' : 'denied',
                  }))
                }
              />
              Advertising Cookies
            </label>
          </div>
          <div className="flex gap-2">
            <button
              onClick={grantAll}
              className="flex-1 bg-blue-600 text-white text-xs py-1.5 rounded transition-colors hover:bg-blue-700"
            >
              Accept All
            </button>
            <button
              onClick={customSave}
              className="flex-1 bg-gray-100 text-gray-700 text-xs py-1.5 rounded transition-colors hover:bg-gray-200"
            >
              Save Preferences
            </button>
            <button
              onClick={denyAll}
              className="flex-1 bg-gray-100 text-gray-700 text-xs py-1.5 rounded transition-colors hover:bg-gray-200"
            >
              Deny All
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
