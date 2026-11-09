import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { Language } from '@/lib/i18n';
import { Mail, Send, ArrowRight } from 'lucide-react';

interface ContactPageProps { params: Promise<{ lang: string }> }

export async function generateMetadata({ params }: ContactPageProps): Promise<Metadata> {
  const { lang: rawLang } = await params;
  const lang: Language = rawLang === 'ta' ? 'ta' : 'en';
  const title = 'Contact Us | எங்களை தொடர்பு கொள்ள';
  return {
    title,
    description: 'Contact Poochandi Varaan (Buzz Creations) for questions, suggestions, or grievance requests. Email: tamilbuzz80@gmail.com',
    alternates: { canonical: `https://poochandi.in/${lang}/contact`, languages: { en: 'https://poochandi.in/en/contact', ta: 'https://poochandi.in/ta/contact' } },
    openGraph: { title, description: 'Reach out to the Poochandi Varaan team.', url: `https://poochandi.in/${lang}/contact`, type: 'website' },
  };
}

export default async function ContactPage({ params }: ContactPageProps) {
  const { lang: rawLang } = await params;
  const lang: Language = rawLang === 'ta' ? 'ta' : 'en';
  const email = 'tamilbuzz80@gmail.com';

  return (
    <div className="py-14 md:py-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 space-y-8">
        <header className="text-center space-y-3">
          <h1 className="text-3xl sm:text-5xl font-black text-white">Contact Us | எங்களை தொடர்பு கொள்ள</h1>
          <p className="text-base sm:text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed">
            Have questions, suggestions, or grievance requests? Reach out to the Poochandi Varaan team (Buzz Creations).
          </p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-6 sm:p-8 rounded-3xl bg-[#13092d] border border-purple-800/50 shadow-xl space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-teal-500/15 border border-teal-500/30 text-teal-300 flex items-center justify-center">
              <Mail className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Official Email</h2>
              <p className="text-sm text-slate-400 mt-1">{lang === 'ta' ? 'அதிகாரப்பூர்வ மின்னஞ்சல்' : 'Contact us by email'}</p>
            </div>
            <a href={`mailto:${email}`} className="inline-flex items-center gap-2 text-base sm:text-lg font-bold text-teal-300 hover:text-teal-200 underline underline-offset-4 break-all">
              {email}
            </a>
          </div>

          <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-purple-950/70 to-[#13092d] border border-teal-500/30 shadow-xl space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-orange-500/15 border border-orange-500/30 text-orange-300 flex items-center justify-center">
              <Send className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">{lang === 'ta' ? 'குழந்தையின் பெயர் பட்டியல்' : 'Child Behavior Name Request'}</h2>
              <p className="text-sm text-slate-300 mt-1 leading-relaxed">
                {lang === 'ta'
                  ? 'குழந்தையின் பெயரை பூச்சாண்டி பெயர் பட்டியலில் சேர்க்க விரும்பும் பெற்றோர் இங்கே சமர்ப்பிக்கலாம்.'
                  : 'Parents who want to submit a child name/behavior request to the Poochandi name list can use the form here.'}
              </p>
            </div>
            <Link href={`/${lang}/complaint-name-list`} className="inline-flex items-center justify-center gap-2 w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-slate-950 font-black text-sm active:scale-95 transition-transform duration-150">
              <span>{lang === 'ta' ? 'பெயர் பட்டியல் பக்கத்திற்குச் செல்ல' : 'Go to Complaint Name List'}</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
