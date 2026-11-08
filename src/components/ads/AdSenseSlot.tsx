import React from 'react';

interface AdSenseSlotProps {
  slotId?: string;
  className?: string;
  format?: 'auto' | 'horizontal' | 'rectangle';
}

export default function AdSenseSlot({
  slotId = '0000000000',
  className = '',
  format = 'auto'
}: AdSenseSlotProps) {
  // In production, when adsense is configured, this serves Google Ads
  const publisherId = process.env.NEXT_PUBLIC_ADSENSE_PUB_ID || 'ca-pub-0000000000000000';
  const isEnabled = process.env.NODE_ENV === 'production' && publisherId !== 'ca-pub-0000000000000000';

  return (
    <div className={`my-8 w-full flex flex-col items-center justify-center ${className}`}>
      <span className="text-[10px] uppercase tracking-widest text-slate-500 mb-1">
        ADVERTISEMENT
      </span>
      <div className="w-full min-h-[100px] max-w-4xl rounded-2xl border border-purple-900/30 bg-[#0d0722]/50 p-4 flex flex-col items-center justify-center text-center overflow-hidden">
        {isEnabled ? (
          <ins
            className="adsbygoogle"
            style={{ display: 'block', width: '100%' }}
            data-ad-client={publisherId}
            data-ad-slot={slotId}
            data-ad-format={format}
            data-full-width-responsive="true"
          />
        ) : (
          <div className="py-6 px-4 text-xs text-purple-300/70 flex flex-col items-center gap-1">
            <span className="font-semibold text-purple-200">Google AdSense Placement Area</span>
            <span>Slot ID: {slotId} • Responsive Unit (Policy compliant spacing)</span>
          </div>
        )}
      </div>
    </div>
  );
}
