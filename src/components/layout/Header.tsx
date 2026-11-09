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
      <div className="w-full px-4 sm:px-6 lg:px-8" style={{ paddingTop: 10, paddingBottom: 10, paddingLeft: 16, paddingRight: 16 }}>
        <div className="flex items-center justify-between w-full gap-2" style={{ flexWrap: 'nowrap' }}>
          
          {/* Left Block: Logo + Text (exact content) */}
          <Link href={`/${lang}`} className="group flex items-center shrink-0 min-w-0" style={{ gap: 10, whiteSpace: 'nowrap' }}>
            <div className="relative shrink-0 overflow-hidden rounded-full flex items-center justify-center" style={{ width: 38, height: 38, flexShrink: 0 }}>
              {logoUrl ? (
                <Image src={logoUrl} alt="Poochandi logo" width={38} height={38} sizes="38px" priority className="object-cover rounded-full" style={{ width: 38, height: 38 }} />
              ) : (
                <span className="text-lg">🧙🏽‍♂️</span>
              )}
            </div>
            <div className="flex flex-col justify-center" style={{ whiteSpace: 'nowrap' }}>
              <span className="text-gradient-magic" style={{ fontSize: 15, fontWeight: 800, lineHeight: 1.1, letterSpacing: '0.5px' }}>
                POOCHANDI.IN
              </span>
              <span className="text-teal-400 uppercase" style={{ fontSize: 9, fontWeight: 600, lineHeight: 1.1, opacity: 0.8, marginTop: 2, letterSpacing: '0.02em' }}>
                POOCHANDI VARAAN
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center space-x-1 lg:space-x-2 flex-1 justify-center min-w-0">
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

          {/* Right Block: Language Pill + (Admin) + Hamburger */}
          <div className="flex items-center shrink-0" style={{ gap: 8, flexShrink: 0, whiteSpace: 'nowrap' }}>
            {/* Language Pill (compact) */}
            <div className="flex items-center bg-[#180e38] rounded-xl border border-purple-800/50" style={{ padding: 2 }}>
              <Globe className="w-3 h-3 text-purple-400 ml-1 mr-0.5 shrink-0 hidden sm:block" aria-hidden="true" />
              <Link
                href={getLanguageSwitchUrl('en')}
                className={`rounded-lg transition-all ${
                  lang === 'en'
                    ? 'bg-gradient-to-r from-teal-500 to-teal-600 text-slate-950 shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
                style={{ fontSize: 12, fontWeight: 700, padding: '4px 10px', lineHeight: 1.2 }}
              >
                EN
              </Link>
              <Link
                href={getLanguageSwitchUrl('ta')}
                className={`rounded-lg transition-all ${
                  lang === 'ta'
                    ? 'bg-gradient-to-r from-teal-500 to-teal-600 text-slate-950 shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
                style={{ fontSize: 12, fontWeight: 700, padding: '4px 10px', lineHeight: 1.2 }}
              >
                தமிழ்
              </Link>
            </div>

            {/* Admin shortcut - desktop */}
            <Link
              href="/admin"
              className="hidden lg:inline-flex items-center justify-center text-xs font-semibold rounded-lg text-purple-300 hover:text-white hover:bg-purple-900/30 transition-colors"
              style={{ height: 36, paddingLeft: 10, paddingRight: 10 }}
              aria-label={lang === 'ta' ? 'நிர்வாகம்' : 'Admin'}
            >
              {dict.nav.admin}
            </Link>

            {/* Admin icon - mobile header (authenticated sessions) */}
            {isAdmin && (
              <Link
                href="/admin"
                className="md:hidden inline-flex items-center justify-center rounded-xl text-teal-300 bg-purple-900/30 border border-purple-700/40 hover:bg-purple-800/40"
                style={{ height: 36, width: 36 }}
                aria-label={lang === 'ta' ? 'நிர்வாகம்' : 'Admin Panel'}
                title={lang === 'ta' ? 'நிர்வாகம்' : 'Admin'}
              >
                <Shield className="w-4 h-4" />
              </Link>
            )}

            {/* Hamburger Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden inline-flex items-center justify-center rounded-xl text-slate-300 hover:text-white hover:bg-purple-900/40 focus:outline-none"
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 36, width: 36 }}
              aria-label="Toggle Navigation Menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
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
