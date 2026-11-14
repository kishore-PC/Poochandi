'use client';

import React, { useMemo, useRef, useState } from 'react';
import { Noto_Sans_Tamil } from 'next/font/google';
import { Award, Download, RefreshCw, ShieldCheck, Sparkles, Star, Trophy } from 'lucide-react';
import AdSenseSlot from '@/components/ads/AdSenseSlot';

const notoTamil = Noto_Sans_Tamil({
  subsets: ['tamil'],
  weight: ['400', '600', '700'],
  display: 'swap',
});

type Props = { lang: 'en' | 'ta' };

type CertificateData = {
  childName: string;
  age: string;
  achievement: string;
  dateText: string;
  certId: string;
};

function formatIndianDate() {
  try {
    return new Intl.DateTimeFormat('en-IN', {
      timeZone: 'Asia/Kolkata',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }).format(new Date());
  } catch {
    return new Date().toLocaleDateString('en-IN');
  }
}

function makeCertId() {
  const rand = Math.random().toString(36).slice(2, 8).toUpperCase();
  const time = Date.now().toString(36).slice(-4).toUpperCase();
  return `PCH-CERT-${time}${rand}`;
}

function sanitizeText(v: string, max = 60) {
  return String(v || '')
    .replace(/[<>"'`]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, max);
}

function isValidName(v: string) {
  // Allow Unicode letters, spaces, dot and hyphen for names; keep it child-safe and simple
  return /^[\p{L} .'-]+$/u.test(v);
}

export default function GoodChildCertificate({ lang }: Props) {
  const isTa = lang === 'ta';
  const certRef = useRef<HTMLDivElement | null>(null);

  const [childName, setChildName] = useState('');
  const [age, setAge] = useState('');
  const [achievement, setAchievement] = useState('');
  const [autoDate] = useState(() => formatIndianDate());
  const [error, setError] = useState('');
  const [cert, setCert] = useState<CertificateData | null>(null);
  const [downloading, setDownloading] = useState(false);

  const t = useMemo(() => {
    return isTa
      ? {
          title: 'நல்ல குழந்தை சான்றிதழ்',
          subtitle: 'உங்கள் குழந்தையின் நல்ல பழக்கத்தை கொண்டாட ஒரு அழகான சான்றிதழை உருவாக்குங்கள்.',
          ctaHint: 'விவரங்களை உள்ளிட்டு சான்றிதழை உருவாக்கவும்',
          childName: 'குழந்தையின் பெயர்',
          age: 'வயது (விருப்பம்)',
          achievement: 'நல்ல பழக்கம் / சாதனை',
          achievementPh: 'எ.கா: தினமும் பாத்திரம் கழுவாமல் வைத்தல், பெரியவர்களுக்கு மரியாதை',
          generate: 'சான்றிதழை உருவாக்கு',
          preview: 'சான்றிதழ் முன்னோட்டம்',
          download: 'PDF பதிவிறக்கு',
          another: 'மற்றொரு சான்றிதழ் உருவாக்கு',
          privacyTitle: 'பெற்றோர் தனியுரிமை தகவல்',
          privacy:
            'இந்த சான்றிதழ் உங்கள் சாதனத்திலேயே (client-side) உருவாக்கப்படுகிறது. குழந்தையின் தனிப்பட்ட தகவல்கள் எங்கள் தரவுத்தளத்தில் சேமிக்கப்படாது மற்றும் பொது URLகளில் பகிரப்படாது.',
          required: 'தேவையான விவரங்களை சரியாக உள்ளிடவும்.',
          certTitle: 'GOOD CHILD CERTIFICATE',
          certSub: 'நல்ல குழந்தை சான்றிதழ்',
          presentedTo: 'இந்த சான்றிதழ் வழங்கப்படுவது',
          forText: 'இந்த நல்ல பழக்கத்திற்காக',
          onDate: 'தேதி',
          certId: 'சான்றிதழ் எண்',
          by: 'வழங்குபவர்',
          congrats: 'வாழ்த்துகள்! தொடர்ந்து இப்படியே இரு!',
        }
      : {
          title: 'Good Child Certificate',
          subtitle: 'Create a beautiful certificate to celebrate your child’s good habits and achievements.',
          ctaHint: 'Enter details to generate your certificate',
          childName: "Child's Name",
          age: 'Age (optional)',
          achievement: 'Good Habit / Achievement',
          achievementPh: 'e.g. Eating veggies happily, Respecting elders, Finishing homework on time',
          generate: 'Generate Certificate',
          preview: 'Certificate Preview',
          download: 'Download PDF',
          another: 'Generate Another Certificate',
          privacyTitle: 'Privacy note for parents',
          privacy:
            "This certificate is generated on your device (client-side). We do not store your child's personal information in our database or expose it through public URLs.",
          required: 'Please fill the required fields correctly.',
          certTitle: 'GOOD CHILD CERTIFICATE',
          certSub: 'A Proud Moment from Poochandi Varaan',
          presentedTo: 'Proudly Presented To',
          forText: 'For this wonderful habit / achievement',
          onDate: 'Date',
          certId: 'Certificate ID',
          by: 'Presented by',
          congrats: 'Keep shining, little star!',
        };
  }, [isTa]);

  const onGenerate = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const name = sanitizeText(childName, 40);
    const ageVal = sanitizeText(age, 20);
    const ach = sanitizeText(achievement, 120);

    if (!name || !ach) {
      setError(t.required);
      return;
    }
    if (!isValidName(name)) {
      setError(isTa ? 'பெயரில் எழுத்துக்கள் மட்டும் பயன்படுத்தவும்.' : 'Please use letters/spaces only for the child name.');
      return;
    }

    setCert({
      childName: name,
      age: ageVal,
      achievement: ach,
      dateText: autoDate,
      certId: makeCertId(),
    });

    // smooth scroll to preview
    setTimeout(() => {
      document.getElementById('certificate-preview')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 50);
  };

  const onDownload = async () => {
    if (!cert || !certRef.current) return;
    setDownloading(true);
    try {
      const [{ default: html2canvas }, { jsPDF }] = await Promise.all([import('html2canvas'), import('jspdf')]);
      // wait for fonts/images
      // @ts-ignore
      if (document.fonts?.ready) await document.fonts.ready;
      const canvas = await html2canvas(certRef.current, {
        scale: 2,
        backgroundColor: '#ffffff',
        useCORS: true,
        logging: false,
      });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
      const pageW = pdf.internal.pageSize.getWidth();
      const pageH = pdf.internal.pageSize.getHeight();
      pdf.addImage(imgData, 'PNG', 0, 0, pageW, pageH, undefined, 'FAST');
      pdf.save(`${cert.childName.replace(/\s+/g, '_')}_Good_Child_Certificate.pdf`);
    } catch (err) {
      console.error(err);
      alert(isTa ? 'PDF உருவாக்க முடியவில்லை. மீண்டும் முயற்சிக்கவும்.' : 'Could not generate PDF. Please try again.');
    } finally {
      setDownloading(false);
    }
  };

  const reset = () => {
    setCert(null);
    setError('');
    setChildName('');
    setAge('');
    setAchievement('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className={`space-y-8 ${notoTamil.className}`}>
      <header className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-purple-950/80 border border-purple-700/50 text-teal-300 text-xs sm:text-sm font-semibold shadow-inner">
          <Award className="w-4 h-4 text-teal-400" />
          <span>{t.ctaHint}</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-black text-white">{t.title}</h1>
        <p className="text-slate-300 max-w-2xl mx-auto">{t.subtitle}</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Form */}
        <section className="lg:col-span-5 bg-[#12082b] border border-purple-800/50 rounded-3xl p-6 sm:p-8 shadow-2xl">
          <form onSubmit={onGenerate} className="space-y-5">
            {error && <div className="p-3 rounded-xl bg-red-950/70 border border-red-700/50 text-red-200 text-sm">{error}</div>}

            <div>
              <label className="block text-xs font-bold text-slate-200 uppercase tracking-wider mb-2">{t.childName} <span className="text-orange-400">*</span></label>
              <input
                value={childName}
                onChange={(e) => setChildName(e.target.value)}
                maxLength={40}
                className="w-full min-h-[44px] px-4 py-3 rounded-xl bg-[#140b2e] border border-purple-800/60 text-white placeholder-slate-500 focus:outline-none focus:border-teal-400"
                placeholder={isTa ? 'எ.கா: கிஷோர்' : 'e.g. Kishore'}
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-200 uppercase tracking-wider mb-2">{t.age}</label>
              <input
                value={age}
                onChange={(e) => setAge(e.target.value.replace(/[^\dA-Za-z\s-]/g, '').slice(0, 20))}
                maxLength={20}
                className="w-full min-h-[44px] px-4 py-3 rounded-xl bg-[#140b2e] border border-purple-800/60 text-white placeholder-slate-500 focus:outline-none focus:border-teal-400"
                placeholder={isTa ? 'எ.கா: 6 வயது' : 'e.g. 6 years'}
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-200 uppercase tracking-wider mb-2">{t.achievement} <span className="text-orange-400">*</span></label>
              <input
                value={achievement}
                onChange={(e) => setAchievement(e.target.value.slice(0, 120))}
                maxLength={120}
                className="w-full min-h-[44px] px-4 py-3 rounded-xl bg-[#140b2e] border border-purple-800/60 text-white placeholder-slate-500 focus:outline-none focus:border-teal-400"
                placeholder={t.achievementPh}
                required
              />
            </div>

            <div className="rounded-xl bg-[#0d0522] border border-purple-900/40 px-4 py-3 text-sm text-slate-300 flex items-center justify-between gap-3">
              <span className="text-slate-400">{isTa ? 'இந்திய தேதி (Asia/Kolkata)' : 'Indian Date (Asia/Kolkata)'}</span>
              <span className="font-bold text-teal-200">{autoDate}</span>
            </div>

            <button
              type="submit"
              className="w-full min-h-[48px] py-3.5 px-6 rounded-2xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-slate-950 font-black text-base shadow-xl shadow-orange-500/25 transition-all hover:scale-[1.01] active:scale-95 flex items-center justify-center gap-2"
            >
              <Sparkles className="w-5 h-5" />
              <span>{t.generate}</span>
            </button>

            <div className="p-4 rounded-xl bg-teal-500/10 border border-teal-500/30 text-xs text-teal-100 leading-relaxed">
              <p className="font-bold flex items-center gap-2 mb-1"><ShieldCheck className="w-4 h-4" />{t.privacyTitle}</p>
              <p>{t.privacy}</p>
            </div>
          </form>
        </section>

        {/* Preview + actions */}
        <section className="lg:col-span-7 space-y-5" id="certificate-preview">
          {!cert ? (
            <div className="h-full min-h-[320px] rounded-3xl border border-dashed border-purple-700/50 bg-[#12082b]/50 flex flex-col items-center justify-center text-center p-8 text-slate-400">
              <Trophy className="w-12 h-12 text-amber-400 mb-3" />
              <p className="font-semibold">{t.preview}</p>
              <p className="text-sm mt-1">{isTa ? 'படிவத்தை நிரப்பி “சான்றிதழை உருவாக்கு” என்பதை அழுத்தவும்.' : 'Fill the form and click “Generate Certificate” to see the preview.'}</p>
            </div>
          ) : (
            <div className="space-y-5 animate-in fade-in slide-in-from-bottom-2 duration-300">
              <div className="overflow-x-auto pb-2">
                <div
                  ref={certRef}
                  className="relative mx-auto bg-white text-slate-900 overflow-hidden shadow-2xl"
                  style={{ width: 1123, height: 794, aspectRatio: '297 / 210' }}
                >
                  {/* Decorative background */}
                  <div className="absolute inset-0" style={{ background: 'linear-gradient(135deg,#fff7ed 0%,#ffffff 35%,#f5f3ff 70%,#ecfeff 100%)' }} />
                  <div className="absolute inset-3 rounded-[28px] border-[6px]" style={{ borderColor: '#f59e0b' }} />
                  <div className="absolute inset-6 rounded-[22px] border-2 border-dashed" style={{ borderColor: '#a855f7' }} />

                  {/* Stars / trophies */}
                  <Star className="absolute top-10 left-10 w-8 h-8 text-amber-400 fill-amber-300" />
                  <Star className="absolute top-16 right-16 w-7 h-7 text-pink-400 fill-pink-300" />
                  <Star className="absolute bottom-14 left-16 w-7 h-7 text-teal-400 fill-teal-300" />
                  <Star className="absolute bottom-10 right-12 w-8 h-8 text-amber-400 fill-amber-300" />
                  <Trophy className="absolute top-10 left-1/2 -translate-x-1/2 w-10 h-10 text-amber-500" />

                  <div className="relative h-full flex flex-col items-center justify-between px-16 py-14 text-center">
                    <div className="space-y-2">
                      <div className="flex items-center justify-center gap-3">
                        <img src="/images/poochandi-logo.svg" alt="Poochandi logo" width={54} height={54} className="w-[54px] h-[54px] object-contain" crossOrigin="anonymous" />
                        <div className="text-left leading-tight">
                          <p className="text-sm font-extrabold tracking-[0.2em] text-purple-700">POOCHANDI.IN</p>
                          <p className="text-[11px] font-bold tracking-widest text-teal-700">POOCHANDI VARAAN</p>
                        </div>
                      </div>
                      <h2 className="text-[46px] font-black tracking-wide" style={{ color: '#7c3aed' }}>{t.certTitle}</h2>
                      <p className="text-lg font-semibold text-teal-700">{t.certSub}</p>
                    </div>

                    <div className="flex-1 flex flex-col items-center justify-center gap-4 -mt-2">
                      <p className="text-base font-semibold text-slate-600 uppercase tracking-[0.2em]">{t.presentedTo}</p>
                      <p className="text-[52px] font-black leading-none" style={{ color: '#ea580c', textShadow: '0 2px 0 rgba(0,0,0,0.05)' }}>{cert.childName}</p>
                      {cert.age && <p className="text-lg font-semibold text-slate-600">({cert.age})</p>}
                      <div className="max-w-3xl px-6">
                        <p className="text-base font-semibold text-slate-600 mb-1">{t.forText}</p>
                        <p className="text-2xl font-bold text-slate-800 leading-snug">{cert.achievement}</p>
                      </div>
                      <p className="text-xl font-extrabold text-purple-700 mt-1">{t.congrats}</p>
                    </div>

                    <div className="w-full flex items-end justify-between gap-6">
                      <div className="text-left">
                        <p className="text-xs uppercase tracking-widest text-slate-500">{t.onDate}</p>
                        <p className="text-lg font-bold text-slate-800">{cert.dateText}</p>
                        <p className="text-[11px] text-slate-500 mt-1">{t.certId}: <span className="font-mono font-semibold text-slate-700">{cert.certId}</span></p>
                      </div>
                      <div className="flex flex-col items-center">
                        <img src="/images/poochandi-hero.svg" alt="Poochandi mascot" width={140} height={140} className="w-[140px] h-[140px] object-contain drop-shadow-md" crossOrigin="anonymous" />
                        <div className="mt-1 h-[2px] w-44 bg-slate-400" />
                        <p className="text-sm font-bold text-slate-700 mt-1">{t.by}</p>
                        <p className="text-sm font-extrabold text-purple-700">Poochandi Varaan</p>
                      </div>
                      <div className="text-right">
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full" style={{ background: '#fef3c7', border: '2px solid #f59e0b' }}>
                          <Award className="w-5 h-5 text-amber-600" />
                          <span className="text-sm font-extrabold text-amber-700">POOCHANDI STAR</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <p className="text-xs text-slate-500 text-center">{isTa ? 'முன்னோட்டம் சரியாக இருந்தால் PDF பதிவிறக்கவும். (கிடைமட்ட A4)' : 'If the preview looks good, download the PDF (A4 landscape).'}</p>

              {/* C. One advertisement below the certificate preview and above the download buttons */}
              <div id="ad-certificate-below-preview" data-ad-placement="below-preview-above-download" data-page="good-child-certificate">
                <AdSenseSlot slotId="certificate-below-preview" format="auto" className="my-4" />
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  type="button"
                  onClick={onDownload}
                  disabled={downloading}
                  className="flex-1 inline-flex items-center justify-center gap-2 min-h-[48px] px-6 py-3.5 rounded-2xl bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-600 hover:to-emerald-600 text-slate-950 font-black shadow-lg disabled:opacity-60"
                >
                  <Download className="w-5 h-5" />
                  <span>{downloading ? (isTa ? 'PDF உருவாக்குகிறது...' : 'Generating PDF...') : t.download}</span>
                </button>
                <button
                  type="button"
                  onClick={reset}
                  className="inline-flex items-center justify-center gap-2 min-h-[48px] px-6 py-3.5 rounded-2xl bg-[#1d103f] hover:bg-[#271654] border border-purple-700/50 text-purple-100 font-bold"
                >
                  <RefreshCw className="w-5 h-5" />
                  <span>{t.another}</span>
                </button>
              </div>

              <p className="text-xs text-slate-400 text-center">
                {isTa ? 'விளம்பரங்கள் ஏற்றப்படாவிட்டாலும் சான்றிதழை உருவாக்கி பதிவிறக்கலாம்.' : 'Certificate generation and download remain available even if advertisements fail to load.'}
              </p>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
