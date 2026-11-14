'use client';

import React, { useCallback, useState } from 'react';
import { InstagramIcon } from '@/components/icons/SocialIcons';

const DM_MESSAGE = 'Hi Poochandi Varaan! I would like to get a special video for my child.';
const IG_DM_URL = `https://ig.me/m/poochandi.in?text=${encodeURIComponent(DM_MESSAGE)}`;

export default function InstagramDmButton() {
  const [copied, setCopied] = useState(false);

  const handleClick = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(DM_MESSAGE);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2500);
    } catch {
      // Fallback: user can still use the opened DM; message may not be pre-filled in all clients.
    }
  }, []);

  return (
    <div className="w-full space-y-2">
      <a
        href={IG_DM_URL}
        target="_blank"
        rel="noopener noreferrer"
        onClick={handleClick}
        className="w-full py-3.5 sm:py-4 px-6 rounded-xl bg-gradient-to-r from-[#f58529] via-[#dd2a7b] to-[#8134af] hover:brightness-110 text-white font-black text-sm sm:text-base flex items-center justify-center gap-2.5 shadow-lg shadow-pink-600/30 transition-all hover:scale-[1.01] active:scale-95 duration-150"
      >
        <InstagramIcon className="w-5 h-5" />
        <span>DM US ON INSTAGRAM</span>
      </a>
      <p className="text-[11px] text-slate-400 text-center">
        {copied
          ? 'Message copied. If it is not pre-filled in Instagram, paste and send it yourself.'
          : 'Tap to open Instagram DM. Message will be copied as a fallback if pre-fill is not supported.'}
      </p>
    </div>
  );
}
