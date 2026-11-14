'use client';

import React, { useMemo, useRef, useState } from 'react';
import { Noto_Sans_Tamil } from 'next/font/google';
import { Download, RefreshCw, ShieldCheck, Sparkles } from 'lucide-react';
import AdSenseSlot from '@/components/ads/AdSenseSlot';

const notoTamil = Noto_Sans_Tamil({
  subsets: ['tamil'],
  weight: ['400', '600', '700'],
  display: 'swap',
});

type Props = { lang: 'en' | 'ta' };

type CertData = {
  childName: string;
  age: string;
  fatherName: string;
  motherName: string;
  city: string;
  monthYear: string;
  dateText: string;
  certId: string;
};

function getKolkataParts() {
  const now = new Date();
  const parts = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Asia/Kolkata',
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).formatToParts(now);
  const get = (t: string) => parts.find((p) => p.type === t)?.value || '';
  const day = get('day');
  const monShort = get('month'); // e.g. Nov
  const year = get('year');
  const monthLong = new Intl.DateTimeFormat('en-US', { timeZone: 'Asia/Kolkata', month: 'long', year: 'numeric' }).format(now);
  return {
    dateText: `${day} ${monShort} ${year}`.replace(/^0/, ''), // DD MMM YYYY (e.g. 14 Nov 2026)
    monthYear: monthLong, // Month Year (e.g. November 2026)
  };
}

function makeCertId() {
  const rand = Math.random().toString(36).slice(2, 7).toUpperCase();
  const t = Date.now().toString(36).slice(-5).toUpperCase();
  return `PCH-${t}${rand}`;
}

function clean(v: string, max = 50) {
  return String(v || '').replace(/[<>]/g, '').replace(/\s+/g, ' ').trim().slice(0, max);
}

const TEMPLATE_W = 1536;
const TEMPLATE_H = 1024;

export default function GoodChildCertificate({ lang }: Props) {
  const isTa = lang === 'ta';
  const certRef = useRef<HTMLDivElement | null>(null);
  const kolkata = useMemo(() => getKolkataParts(), []);

  const [childName, setChildName] = useState('');
  const [age, setAge] = useState('');
  const [fatherName, setFatherName] = useState('');
  const [motherName, setMotherName] = useState('');
  const [city, setCity] = useState('');
  const [error, setError] = useState('');
  const [cert, setCert] = useState<CertData | null>(null);
  const [downloading, setDownloading] = useState(false);

  const t = isTa
    ? {
        title: 'நல்ல குழந்தை சான்றிதழ்',
        subtitle: 'விவரங்களை உள்ளிட்டு உங்கள் குழந்தைக்கான தனிப்பயன் சான்றிதழை உருவாக்குங்கள்.',
        name: 'குழந்தையின் பெயர்',
        age: 'வயது',
        father: 'தந்தை பெயர் (விருப்பம்)',
        mother: 'தாய் பெயர் (விருப்பம்)',
        city: 'நகரம் / ஊர் (விருப்பம்)',
        generate: 'சான்றிதழை உருவாக்கு',
        download: 'PDF பதிவிறக்கு',
        again: 'மற்றொரு சான்றிதழ் உருவாக்கு',
        privacyTitle: 'பெற்றோர் தனியுரிமை தகவல்',
        privacy: 'இந்த சான்றிதழ் உங்கள் சாதனத்திலேயே உருவாக்கப்படுகிறது. குழந்தையின் தனிப்பட்ட தகவல்கள் சேமிக்கப்படுவதில்லை அல்லது பொது URL-களில் வெளிப்படுத்தப்படுவதில்லை.',
        req: 'குழந்தையின் பெயர் மற்றும் வயது அவசியம்.',
        previewHint: 'முன்னோட்டம்',
      }
    : {
        title: 'Good Child Certificate',
        subtitle: 'Enter details to generate a personalised certificate for your child.',
        name: "Child's Name",
        age: 'Age',
        father: "Father's Name (optional)",
        mother: "Mother's Name (optional)",
        city: 'City / Town (optional)',
        generate: 'Generate Certificate',
        download: 'Download PDF',
        again: 'Generate Another Certificate',
        privacyTitle: 'Privacy note for parents',
        privacy: "This certificate is generated on your device. We do not store your child's personal information in our database or expose it through public URLs.",
        req: "Child's Name and Age are required.",
        previewHint: 'Preview',
      };

  const onGenerate = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const cName = clean(childName, 40);
    const cAge = clean(age, 10);
    const fName = clean(fatherName, 40);
    const mName = clean(motherName, 40);
    const cCity = clean(city, 40);

    if (!cName || !cAge) {
      setError(t.req);
      return;
    }

    // regenerate time/id at generation moment (Asia/Kolkata)
    const k = getKolkataParts();
    setCert({
      childName: cName,
      age: cAge,
      fatherName: fName,
      motherName: mName,
      city: cCity,
      monthYear: k.monthYear,
      dateText: k.dateText,
      certId: makeCertId(),
    });
    setTimeout(() => document.getElementById('certificate-preview')?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 50);
  };

  const onDownload = async () => {
    if (!cert || !certRef.current) return;
    setDownloading(true);
    try {
      const [{ default: html2canvas }, { jsPDF }] = await Promise.all([import('html2canvas'), import('jspdf')]);
      // @ts-ignore
      if (document.fonts?.ready) await document.fonts.ready;
      await new Promise((r) => setTimeout(r, 150));
      const canvas = await html2canvas(certRef.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: null,
        logging: false,
        width: TEMPLATE_W,
        height: TEMPLATE_H,
        windowWidth: TEMPLATE_W,
        windowHeight: TEMPLATE_H,
      });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
      const pw = pdf.internal.pageSize.getWidth();
      const ph = pdf.internal.pageSize.getHeight();
      pdf.addImage(imgData, 'PNG', 0, 0, pw, ph, undefined, 'FAST');
      pdf.save(`${cert.childName.replace(/\s+/g, '_')}_Poochandi_Certificate.pdf`);
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
    setFatherName('');
    setMotherName('');
    setCity('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Overlay styles: positioned to replace placeholders on the provided template (1536x1024). 
  // Background patches help hide embedded placeholder labels while preserving the template design.
  const ov = (style: React.CSSProperties): React.CSSProperties => ({ position: 'absolute', display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center', ...style });

  return (
    <div className={`space-y-8 ${notoTamil.className}`}>
      <header className="text-center space-y-3">
        <h1 className="text-3xl sm:text-5xl font-black text-white">{t.title}</h1>
        <p className="text-slate-300 max-w-2xl mx-auto">{t.subtitle}</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        <section className="lg:col-span-5 bg-[#12082b] border border-purple-800/50 rounded-3xl p-6 sm:p-8 shadow-2xl">
          <form onSubmit={onGenerate} className="space-y-4">
            {error && <div className="p-3 rounded-xl bg-red-950/70 border border-red-700/50 text-red-200 text-sm">{error}</div>}
            <div>
              <label className="block text-xs font-bold text-slate-200 uppercase tracking-wider mb-1.5">{t.name} <span className="text-orange-400">*</span></label>
              <input value={childName} onChange={(e) => setChildName(e.target.value)} required maxLength={40} className="w-full min-h-[44px] px-4 py-3 rounded-xl bg-[#140b2e] border border-purple-800/60 text-white focus:outline-none focus:border-teal-400" placeholder={isTa ? 'குழந்தையின் பெயர்' : "Child's name"} />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-200 uppercase tracking-wider mb-1.5">{t.age} <span className="text-orange-400">*</span></label>
              <input value={age} onChange={(e) => setAge(e.target.value)} required maxLength={10} className="w-full min-h-[44px] px-4 py-3 rounded-xl bg-[#140b2e] border border-purple-800/60 text-white focus:outline-none focus:border-teal-400" placeholder={isTa ? 'வயது' : 'Age'} />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-200 uppercase tracking-wider mb-1.5">{t.father}</label>
                <input value={fatherName} onChange={(e) => setFatherName(e.target.value)} maxLength={40} className="w-full min-h-[44px] px-4 py-3 rounded-xl bg-[#140b2e] border border-purple-800/60 text-white focus:outline-none focus:border-teal-400" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-200 uppercase tracking-wider mb-1.5">{t.mother}</label>
                <input value={motherName} onChange={(e) => setMotherName(e.target.value)} maxLength={40} className="w-full min-h-[44px] px-4 py-3 rounded-xl bg-[#140b2e] border border-purple-800/60 text-white focus:outline-none focus:border-teal-400" />
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-200 uppercase tracking-wider mb-1.5">{t.city}</label>
              <input value={city} onChange={(e) => setCity(e.target.value)} maxLength={40} className="w-full min-h-[44px] px-4 py-3 rounded-xl bg-[#140b2e] border border-purple-800/60 text-white focus:outline-none focus:border-teal-400" />
            </div>
            <div className="rounded-xl bg-[#0d0522] border border-purple-900/40 px-4 py-3 text-sm text-slate-300 flex items-center justify-between gap-3">
              <span className="text-slate-400">{isTa ? 'தேதி & மாதம் (Asia/Kolkata)' : 'Date & Month (Asia/Kolkata)'}</span>
              <span className="font-bold text-teal-200 text-right">{kolkata.monthYear} · {kolkata.dateText}</span>
            </div>
            <button type="submit" className="w-full min-h-[48px] py-3.5 px-6 rounded-2xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-slate-950 font-black text-base shadow-xl transition-all flex items-center justify-center gap-2">
              <Sparkles className="w-5 h-5" /><span>{t.generate}</span>
            </button>
            <div className="p-4 rounded-xl bg-teal-500/10 border border-teal-500/30 text-xs text-teal-100 leading-relaxed">
              <p className="font-bold flex items-center gap-2 mb-1"><ShieldCheck className="w-4 h-4" />{t.privacyTitle}</p>
              <p>{t.privacy}</p>
            </div>
          </form>
        </section>

        <section className="lg:col-span-7 space-y-5" id="certificate-preview">
          {!cert ? (
            <div className="min-h-[360px] rounded-3xl border border-dashed border-purple-700/50 bg-[#12082b]/50 flex items-center justify-center text-center p-8 text-slate-400">
              <p className="font-semibold">{isTa ? 'விவரங்களை நிரப்பி சான்றிதழை உருவாக்கவும்.' : 'Fill the form and generate to see the preview.'}</p>
            </div>
          ) : (
            <div className="space-y-5 animate-in fade-in slide-in-from-bottom-2 duration-300">
              <div className="w-full overflow-x-auto pb-2">
                <div
                  ref={certRef}
                  className="relative mx-auto overflow-hidden bg-white"
                  style={{ width: TEMPLATE_W, height: TEMPLATE_H }}
                >
                  {/* Exact template image as base */}
                  <img src="/images/poochandi-certificate-template.png" alt="Poochandi Good Child Certificate Template" width={TEMPLATE_W} height={TEMPLATE_H} className="absolute inset-0 w-full h-full object-fill" crossOrigin="anonymous" />

                  {/* Dynamic overlays (replace placeholder labels; positions tuned for template) */}
                  {/* 1. Child's Name */}
                  <div style={ov({ left: '20%', top: '34%', width: '60%', height: '10%', background: 'rgba(255,250,245,0.96)', borderRadius: 12, color: '#7c2d12', fontWeight: 800, fontSize: 54, lineHeight: 1.1, padding: '0 16px' })}>
                    <span>{cert.childName}</span>
                  </div>
                  {/* 2. Month Year */}
                  <div style={ov({ left: '34%', top: '44.5%', width: '32%', height: '5.5%', background: 'rgba(255,253,250,0.97)', borderRadius: 8, color: '#334155', fontWeight: 700, fontSize: 28 })}>
                    <span>{cert.monthYear}</span>
                  </div>
                  {/* 3. Age */}
                  <div style={ov({ left: '23%', top: '56%', width: '18%', height: '5%', background: 'rgba(255,252,248,0.97)', borderRadius: 8, color: '#1f2937', fontWeight: 700, fontSize: 26, justifyContent: 'flex-start', paddingLeft: 12, textAlign: 'left' })}>
                    <span>{cert.age}</span>
                  </div>
                  {/* 4. Father's Name (optional) */}
                  {cert.fatherName && (
                    <div style={ov({ left: '23%', top: '61.5%', width: '22%', height: '5%', background: 'rgba(255,252,248,0.97)', borderRadius: 8, color: '#1f2937', fontWeight: 700, fontSize: 24, justifyContent: 'flex-start', paddingLeft: 12, textAlign: 'left' })}>
                      <span>{cert.fatherName}</span>
                    </div>
                  )}
                  {/* 5. Mother's Name (optional) */}
                  {cert.motherName && (
                    <div style={ov({ left: '61%', top: '61.5%', width: '22%', height: '5%', background: 'rgba(255,252,248,0.97)', borderRadius: 8, color: '#1f2937', fontWeight: 700, fontSize: 24, justifyContent: 'flex-start', paddingLeft: 12, textAlign: 'left' })}>
                      <span>{cert.motherName}</span>
                    </div>
                  )}
                  {/* 6. City / Town (optional) */}
                  {cert.city && (
                    <div style={ov({ left: '23%', top: '67.5%', width: '24%', height: '5%', background: 'rgba(255,252,248,0.97)', borderRadius: 8, color: '#1f2937', fontWeight: 700, fontSize: 24, justifyContent: 'flex-start', paddingLeft: 12, textAlign: 'left' })}>
                      <span>{cert.city}</span>
                    </div>
                  )}
                  {/* 7. Date DD MMM YYYY */}
                  <div style={ov({ left: '8%', top: '85%', width: '22%', height: '5%', background: 'rgba(60,30,10,0.92)', borderRadius: 8, color: '#fff7ed', fontWeight: 700, fontSize: 22 })}>
                    <span>{cert.dateText}</span>
                  </div>
                  {/* 8. Certificate ID */}
                  <div style={ov({ left: '70%', top: '85%', width: '22%', height: '5%', background: 'rgba(40,50,20,0.92)', borderRadius: 8, color: '#ecfccb', fontWeight: 700, fontSize: 20 })}>
                    <span>{cert.certId}</span>
                  </div>
                </div>
              </div>
              <p className="text-xs text-slate-500 text-center">{isTa ? 'முன்னோட்டம் சரி என்றால் PDF பதிவிறக்கவும் (A4 landscape).' : 'Download as high-quality A4 landscape PDF when the preview looks correct.'}</p>

              {/* C. Advertisement below certificate preview and above download buttons */}
              <div id="ad-certificate-below-preview" data-ad-placement="below-preview-above-download" data-page="good-child-certificate">
                <AdSenseSlot slotId="certificate-below-preview" format="auto" className="my-4" />
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <button type="button" onClick={onDownload} disabled={downloading} className="flex-1 inline-flex items-center justify-center gap-2 min-h-[48px] px-6 py-3.5 rounded-2xl bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-600 hover:to-emerald-600 text-slate-950 font-black shadow-lg disabled:opacity-60">
                  <Download className="w-5 h-5" />
                  <span>{downloading ? (isTa ? 'PDF உருவாக்குகிறது...' : 'Generating PDF...') : t.download}</span>
                </button>
                <button type="button" onClick={reset} className="inline-flex items-center justify-center gap-2 min-h-[48px] px-6 py-3.5 rounded-2xl bg-[#1d103f] hover:bg-[#271654] border border-purple-700/50 text-purple-100 font-bold">
                  <RefreshCw className="w-5 h-5" />
                  <span>{t.again}</span>
                </button>
              </div>
              <p className="text-xs text-slate-400 text-center">{isTa ? 'விளம்பரங்கள் தோல்வியடைந்தாலும் சான்றிதழ் உருவாக்கம்/பதிவிறக்கம் செயல்படும்.' : 'Certificate generation and download remain accessible even if advertisements fail to load.'}</p>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
