'use client';

interface MockMarketingProps {
  onEvent: (name: string, data?: Record<string, unknown>) => void;
}

const channels = [
  { id: 'paid', name: 'Paid Search Ad', event: 'paid_search_click', channel: 'paid_search', color: 'bg-green-500', icon: '🔍' },
  { id: 'social', name: 'Social Media Ad', event: 'social_click', channel: 'social', color: 'bg-blue-500', icon: '📱' },
  { id: 'email', name: 'Email Newsletter Link', event: 'email_click', channel: 'email', color: 'bg-purple-500', icon: '📧' },
];

export function MockMarketing({ onEvent }: MockMarketingProps) {
  const simulateClick = (channel: typeof channels[0]) => {
    onEvent(channel.event, { channel: channel.channel, timestamp: Date.now() });
  };

  const simulatePurchase = () => {
    onEvent('purchase', { channel: 'email', transactionRevenue: 89.99 });
  };

  return (
    <div className="min-h-full bg-gray-50">
      <header className="bg-white border-b px-4 py-3">
        <div className="font-bold text-gray-800">MarketingCo</div>
        <p className="text-xs text-gray-500">Multi-channel campaign landing page</p>
      </header>

      <div className="px-4 py-6 space-y-4">
        <div className="bg-white rounded-lg border p-4">
          <h2 className="text-sm font-semibold text-gray-800 mb-3">Simulate Channel Interactions</h2>
          <p className="text-xs text-gray-500 mb-4">
            Click each button to simulate a user arriving from different marketing channels.
            Each fires a different custom event to the data layer.
          </p>
          <div className="space-y-2">
            {channels.map((ch) => (
              <button
                key={ch.id}
                onClick={() => simulateClick(ch)}
                className={`w-full ${ch.color} text-white text-sm px-4 py-2.5 rounded-lg flex items-center gap-3 hover:opacity-90 transition-opacity text-left`}
              >
                <span className="text-base">{ch.icon}</span>
                <div>
                  <div className="font-medium text-xs">{ch.name}</div>
                  <div className="text-xs opacity-80">
                    fires: dataLayer.push(&#123; event: &quot;{ch.event}&quot;, channel: &quot;{ch.channel}&quot; &#125;)
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-lg border p-4">
          <h2 className="text-sm font-semibold text-gray-800 mb-2">Simulate Conversion</h2>
          <p className="text-xs text-gray-500 mb-3">
            After interacting via a channel, simulate a purchase conversion.
          </p>
          <button
            onClick={simulatePurchase}
            className="w-full bg-orange-500 hover:bg-orange-600 text-white text-sm px-4 py-2.5 rounded-lg transition-colors"
          >
            💳 Complete Purchase ($89.99)
          </button>
          <p className="text-xs text-gray-400 mt-1 text-center">
            fires: dataLayer.push(&#123; event: &quot;purchase&quot;, channel: &quot;email&quot; &#125;)
          </p>
        </div>
      </div>
    </div>
  );
}
