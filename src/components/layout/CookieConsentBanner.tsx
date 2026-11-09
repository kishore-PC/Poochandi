'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';

export default function CookieConsentBanner({ lang }: { lang: 'en' | 'ta' }) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    try {
      if (!localStorage.getItem('poochandi_cookie_consent')) setShow(true);
    } catch {}
  }, []);

  const accept = () => {
    try { localStorage.setItem('poochandi_cookie_consent', 'accepted'); } catch {}
    setShow(false);
  };

  if (!show) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-[60] p-3 sm:p-4">
      <div className="max-w-4xl mx-auto rounded-2xl border border-slate-700 bg-[#181A20]/95 backdrop-blur-md shadow-2xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
        <p className="text-xs sm:text-sm text-slate-300 leading-relaxed flex-1">
          {lang === 'ta'
            ? 'இந்த தளம் அனுபவத்தை மேம்படுத்த குக்கீகள் மற்றும் விளம்பர தொழில்நுட்பங்களைப் பயன்படுத்தலாம். தொடர்வதன் மூலம், எங்கள் '
            : 'We use cookies and similar technologies (including ads) to improve your experience. By continuing, you agree to our '}
          <Link href={`/${lang}/privacy-policy`} className="text-[#FACC15] font-semibold hover:underline">
            {lang === 'ta' ? 'தனியுரிமைக் கொள்கையை' : 'Privacy Policy'}
          </Link>
          {lang === 'ta' ? ' ஏற்கிறீர்கள்.' : '.'}
        </p>
        <button
          type="button"
          onClick={accept}
          className="shrink-0 px-5 py-2.5 rounded-xl bg-[#FACC15] text-black font-black text-sm active:scale-95 transition-transform duration-150 cursor-pointer"
        >
          {lang === 'ta' ? 'ஏற்கிறேன்' : 'Accept'}
        </button>
      </div>
    </div>
  );
}
