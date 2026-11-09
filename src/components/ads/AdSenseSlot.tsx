import React from 'react';

interface AdSenseSlotProps {
  slotId?: string;
  className?: string;
  format?: 'auto' | 'horizontal' | 'rectangle';
}

export default function AdSenseSlot({
  slotId = '0000000000',
  className = '',
  format = 'auto',
}: AdSenseSlotProps) {
  // In production, when adsense is configured, this serves Google Ads
  const publisherId = process.env.NEXT_PUBLIC_ADSENSE_PUB_ID || 'ca-pub-0000000000000000';
  const isEnabled = process.env.NODE_ENV === 'production' && publisherId !== 'ca-pub-0000000000000000';

  return (
    <div className={`my-6 sm:my-8 w-full flex flex-col items-center ${className}`} aria-label="Advertisement area">
      <span className="text-[10px] uppercase tracking-widest text-slate-500 mb-1.5">ADVERTISEMENT</span>
      <div className="w-full max-w-4xl min-h-[90px] rounded-2xl border border-purple-900/30 bg-[#0d0722]/40 px-4 py-3 flex items-center justify-center overflow-hidden">
        {isEnabled ? (
          <ins
            className="adsbygoogle"
            style={{ display: 'block', width: '100%', minHeight: 90 }}
            data-ad-client={publisherId}
            data-ad-slot={slotId}
            data-ad-format={format}
            data-full-width-responsive="true"
          />
        ) : (
          <div className="w-full text-[11px] text-purple-300/60 text-center leading-snug">
            Ad space (Slot: {slotId}). Spaced to prevent accidental clicks.
          </div>
        )}
      </div>
    </div>
  );
}
