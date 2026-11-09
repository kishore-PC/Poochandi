'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Language, dictionaries } from '@/lib/i18n';
import { Menu, X, Sparkles, Send, BookOpen, Info, Mail, Globe } from 'lucide-react';

interface HeaderProps {
  lang: Language;
  logoUrl?: string;
}

export default function Header({ lang, logoUrl }: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  const dict = dictionaries[lang];

  // Helper to switch language while preserving path
  const getLanguageSwitchUrl = (targetLang: Language) => {
    if (!pathname) return `/${targetLang}`;
    const segments = pathname.split('/');
    segments[1] = targetLang;
    return segments.join('/') || `/${targetLang}`;
  };

  const navLinks = [
    { name: dict.nav.home, href: `/${lang}`, icon: Sparkles },
    { name: dict.nav.sendRequest, href: `/${lang}/complaint-name-list`, icon: Send },
    { name: dict.nav.parentingGuides, href: `/${lang}/parenting-guides`, icon: BookOpen },
    { name: dict.nav.about, href: `/${lang}/about-poochandi`, icon: Info },
    { name: dict.nav.contact, href: `/${lang}/contact`, icon: Mail },
  ];

  const isActive = (href: string) => {
    if (href === `/${lang}`) return pathname === `/${lang}` || pathname === `/${lang}/`;
    return pathname.startsWith(href);
  };

  return (
    <header className="sticky top-0 z-50 bg-[#0b051b]/85 backdrop-blur-md border-b border-purple-900/40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Brand Logo & Tagline */}
          <Link href={`/${lang}`} className="flex items-center gap-3 group">
            <div className="relative w-12 h-12 rounded-full bg-gradient-to-tr from-purple-800 to-teal-600 p-0.5 shadow-lg shadow-purple-900/50 group-hover:scale-105 transition-transform duration-300 overflow-hidden">
              {logoUrl ? (
                <img src={logoUrl} alt="Poochandi logo" className="w-full h-full rounded-full object-cover bg-[#160d31]" />
              ) : (
                <div className="w-full h-full bg-[#160d31] rounded-full flex items-center justify-center overflow-hidden">
                  <span className="text-2xl animate-pulse">🧙🏽‍♂️</span>
                </div>
              )}
            </div>
            <div className="flex flex-col">
              <span className="text-xl sm:text-2xl font-black tracking-wider text-gradient-magic">
                POOCHANDI
              </span>
              <span className="text-[10px] sm:text-xs font-semibold tracking-widest text-teal-400 uppercase">
                {dict.nav.parentBrand}
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center space-x-1 lg:space-x-2">
            {navLinks.map((link) => {
              const active = isActive(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`px-3.5 py-2 rounded-xl text-sm font-semibold transition-all duration-200 flex items-center gap-1.5 ${
                    active
                      ? 'bg-purple-600/30 text-teal-300 border border-purple-500/50 shadow-sm shadow-purple-500/20'
                      : 'text-slate-300 hover:text-white hover:bg-purple-950/40'
                  }`}
                >
                  <link.icon className="w-4 h-4 opacity-70" />
                  {link.name}
                </Link>
              );
            })}
          </nav>

          {/* Language Switcher & Quick CTA */}
          <div className="flex items-center gap-3">
            {/* Language Switcher */}
            <div className="flex items-center bg-[#180e38] p-1 rounded-xl border border-purple-800/50">
              <Globe className="w-3.5 h-3.5 text-purple-400 ml-1.5 mr-1" />
              <Link
                href={getLanguageSwitchUrl('en')}
                className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-all ${
                  lang === 'en'
                    ? 'bg-gradient-to-r from-teal-500 to-teal-600 text-slate-950 shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                EN
              </Link>
              <Link
                href={getLanguageSwitchUrl('ta')}
                className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-all ${
                  lang === 'ta'
                    ? 'bg-gradient-to-r from-teal-500 to-teal-600 text-slate-950 shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                தமிழ்
              </Link>
            </div>

            {/* Admin shortcut button */}
            <Link
              href="/admin"
              className="hidden lg:inline-flex text-xs font-semibold px-2.5 py-1.5 rounded-lg text-purple-300 hover:text-white hover:bg-purple-900/30 transition-colors"
            >
              {dict.nav.admin}
            </Link>

            {/* Mobile menu toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-xl text-slate-300 hover:text-white hover:bg-purple-900/40 focus:outline-none"
              aria-label="Toggle Navigation Menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Navigation Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-[#12082b] border-b border-purple-800/50 px-4 pt-3 pb-6 space-y-2 animate-in slide-in-from-top duration-200">
          {navLinks.map((link) => {
            const active = isActive(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-base font-semibold ${
                  active
                    ? 'bg-purple-600/30 text-teal-300 border border-purple-500/40'
                    : 'text-slate-300 hover:bg-purple-950/40'
                }`}
              >
                <link.icon className="w-5 h-5 text-teal-400" />
                {link.name}
              </Link>
            );
          })}
          <div className="pt-2 border-t border-purple-900/50 flex justify-between items-center px-2">
            <Link
              href="/admin"
              onClick={() => setMobileMenuOpen(false)}
              className="text-xs text-purple-400 hover:text-purple-200 font-semibold py-2"
            >
              Admin Portal
            </Link>
            <span className="text-xs text-slate-500">Poochandi.in</span>
          </div>
        </div>
      )}
    </header>
  );
}
