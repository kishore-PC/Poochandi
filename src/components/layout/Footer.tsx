import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Language, dictionaries } from '@/lib/i18n';
import { ShieldCheck } from 'lucide-react';
import { InstagramIcon, YoutubeIcon } from '@/components/icons/SocialIcons';

interface FooterProps {
  lang: Language;
  logoUrl?: string;
}

export default function Footer({ lang, logoUrl }: FooterProps) {
  const dict = dictionaries[lang];
  const complianceLinks = [
    { href: `/${lang}/about-poochandi`, label: lang === 'ta' ? 'எங்களை பற்றி' : 'About Us' },
    { href: `/${lang}/contact`, label: lang === 'ta' ? 'தொடர்பு கொள்ள' : 'Contact Us' },
    { href: `/${lang}/privacy-policy`, label: dict.legal.privacyTitle },
    { href: `/${lang}/terms-of-service`, label: dict.legal.termsTitle },
    { href: `/${lang}/disclaimer`, label: dict.legal.disclaimerTitle },
  ];

  return (
    <footer className="relative bg-[#070314] text-slate-400 border-t border-purple-900/40 pt-16 pb-12 overflow-hidden">
      {/* Subtle background glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-24 bg-purple-900/20 blur-3xl rounded-full pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">
          {/* Brand Info */}
          <div className="md:col-span-2 space-y-4">
            <Link href={`/${lang}`} className="inline-flex items-center gap-3">
              {logoUrl ? <Image src={logoUrl} alt="Poochandi logo" width={40} height={40} sizes="40px" className="h-10 w-10 object-contain" loading="lazy" /> : null}
              <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                <span className="text-2xl font-black tracking-wider text-gradient-magic">POOCHANDI.IN</span>
                <span className="text-xs sm:text-sm font-bold tracking-wide text-teal-300">POOCHANDI VARRAAN</span>
              </div>
            </Link>
            <p className="text-sm leading-relaxed text-slate-400 max-w-md">{dict.footer.aboutText}</p>
            <div className="pt-2 flex items-center gap-4">
              <a href="https://www.instagram.com/poochandi.in/" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-xl bg-purple-950/80 border border-purple-700/40 flex items-center justify-center text-pink-400 hover:text-white hover:bg-pink-600/30 transition-all" aria-label="Instagram">
                <InstagramIcon className="w-5 h-5" />
              </a>
              <a href="https://youtube.com/@poochandivaraan" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-xl bg-purple-950/80 border border-purple-700/40 flex items-center justify-center text-red-400 hover:text-white hover:bg-red-600/30 transition-all" aria-label="YouTube">
                <YoutubeIcon className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold text-white uppercase tracking-wider">{dict.footer.quickLinks}</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href={`/${lang}`} className="hover:text-teal-300 transition-colors">{dict.nav.home}</Link></li>
              <li><Link href={`/${lang}/complaint-name-list`} className="hover:text-teal-300 transition-colors">{dict.nav.sendRequest}</Link></li>
              <li><Link href={`/${lang}/parenting-guides`} className="hover:text-teal-300 transition-colors">{dict.nav.parentingGuides}</Link></li>
            </ul>
          </div>

          {/* Compliance Pages */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold text-white uppercase tracking-wider">{lang === 'ta' ? 'தகவல் & கொள்கைகள்' : 'Information & Compliance'}</h4>
            <ul className="space-y-2 text-sm">
              {complianceLinks.map((l) => (
                <li key={l.href}><Link href={l.href} className="hover:text-teal-300 transition-colors">{l.label}</Link></li>
              ))}
              <li className="pt-2">
                <span className="inline-flex items-center gap-1.5 text-xs text-emerald-400 bg-emerald-950/50 border border-emerald-800/40 px-2.5 py-1 rounded-md">
                  <ShieldCheck className="w-3.5 h-3.5" />Child Privacy Protected
                </span>
              </li>
            </ul>
          </div>
        </div>

        {/* Disclaimer & Copyright strip */}
        <div className="pt-8 border-t border-purple-950/80 text-xs text-slate-500 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="max-w-2xl text-center md:text-left">{dict.footer.disclaimerShort}</p>
          <p className="flex items-center gap-1">© {new Date().getFullYear()} Poochandi.in. {dict.footer.rights}</p>
        </div>
      </div>
    </footer>
  );
}
