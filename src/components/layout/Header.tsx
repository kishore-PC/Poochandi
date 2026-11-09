'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Language, dictionaries } from '@/lib/i18n';
import { Menu, X, Sparkles, Send, BookOpen, Info, Globe, Shield } from 'lucide-react';

interface HeaderProps {
  lang: Language;
  logoUrl?: string;
}

export default function Header({ lang, logoUrl }: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const pathname = usePathname();
  const dict = dictionaries[lang];

  React.useEffect(() => {
    try {
      setIsAdmin(typeof document !== 'undefined' && document.cookie.includes('admin-token='));
    } catch {}
  }, [pathname]);

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
            <div className="w-12 h-12 shrink-0 group-hover:scale-105 transition-transform duration-300 flex items-center justify-center">
              {logoUrl ? (
                <Image src={logoUrl} alt="Poochandi logo" width={48} height={48} sizes="48px" priority className="w-full h-full object-contain" />
              ) : (
                <span className="text-2xl animate-pulse">🧙🏽‍♂️</span>
              )}
            </div>
            <div className="flex flex-col">
              <span className="text-xl sm:text-2xl font-black tracking-wider text-gradient-magic">
                POOCHANDI.IN
              </span>
              <span className="text-[10px] sm:text-xs font-semibold tracking-widest text-teal-400 uppercase">
                Poochandi Varaan
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

            {/* Admin shortcut - desktop */}
            <Link
              href="/admin"
              className="hidden lg:inline-flex min-h-[44px] items-center text-xs font-semibold px-3 py-2 rounded-lg text-purple-300 hover:text-white hover:bg-purple-900/30 transition-colors"
              aria-label={lang === 'ta' ? 'நிர்வாகம்' : 'Admin'}
            >
              {dict.nav.admin}
            </Link>

            {/* Admin icon - mobile header (visible on small screens) */}
            {isAdmin && (
              <Link
                href="/admin"
                className="md:hidden inline-flex items-center justify-center min-h-[44px] min-w-[44px] rounded-xl text-teal-300 bg-purple-900/30 border border-purple-700/40 hover:bg-purple-800/40"
                aria-label={lang === 'ta' ? 'நிர்வாகம்' : 'Admin Panel'}
                title={lang === 'ta' ? 'நிர்வாகம்' : 'Admin'}
              >
                <Shield className="w-5 h-5" />
              </Link>
            )}

            {/* Mobile menu toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden inline-flex items-center justify-center min-h-[44px] min-w-[44px] rounded-xl text-slate-300 hover:text-white hover:bg-purple-900/40 focus:outline-none"
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
          <div className="pt-2 border-t border-purple-900/50">
            <Link
              href="/admin"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-3 min-h-[44px] px-4 py-3 rounded-xl text-base font-semibold text-purple-200 bg-purple-950/40 border border-purple-700/40 hover:bg-purple-900/40"
              aria-label={lang === 'ta' ? 'நிர்வாகம்' : 'Admin Panel'}
            >
              <Shield className="w-5 h-5 text-teal-400" />
              <span>{lang === 'ta' ? 'நிர்வாகம்' : 'Admin'}</span>
            </Link>
            <p className="text-xs text-slate-500 px-2 pt-2">Poochandi.in</p>
          </div>
        </div>
      )}
    </header>
  );
}
