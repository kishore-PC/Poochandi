'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Noto_Sans_Tamil } from 'next/font/google';
import { toBlob, toPng } from 'html-to-image';
import { Camera, Download, ImagePlus, RefreshCw, Save, Share2, ShieldCheck, Sparkles, Trash2, Upload } from 'lucide-react';
import AdSenseSlot from '@/components/ads/AdSenseSlot';

const notoTamil = Noto_Sans_Tamil({
  subsets: ['tamil'],
  weight: ['400', '500', '600', '700', '800'],
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
  issueDate: string;
  certId: string;
  photoDataUrl: string | null;
};

const W = 1920;
const H = 1280;
const AR = `${W} / ${H}`;

function getKolkataDateInfo() {
  const now = new Date();
  const monthYear = new Intl.DateTimeFormat('en-US', { timeZone: 'Asia/Kolkata', month: 'long', year: 'numeric' }).format(now);
  const parts = new Intl.DateTimeFormat('en-GB', { timeZone: 'Asia/Kolkata', day: '2-digit', month: 'short', year: 'numeric' }).formatToParts(now);
  const get = (t: string) => parts.find((p) => p.type === t)?.value || '';
  const dayRaw = get('day');
  const day = dayRaw ? String(parseInt(dayRaw, 10)).padStart(2, '0') : get('day');
  const mon = get('month');
  const year = get('year') || String(now.getFullYear());
  const issueDate = `${day} ${mon} ${year}`.trim(); // DD MMM YYYY
  return { monthYear, issueDate, year };
}

function makeCertId(year: string) {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let rand = '';
  for (let i = 0; i < 5; i++) rand += chars[Math.floor(Math.random() * chars.length)];
  return `GC-${year}-${rand}`;
}

function clean(v: string, max = 60) {
  return String(v || '').replace(/[<>]/g, '').replace(/\s+/g, ' ').trim().slice(0, max);
}

function sanitizeFilename(name: string) {
  const safe = (name || 'Certificate').replace(/[^\p{L}\p{N}_ -]/gu, '').trim().replace(/\s+/g, '_');
  return safe || 'Certificate';
}

async function readFileAsDataUrl(file: File): Promise<string> {
  return await new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ''));
    reader.onerror = () => reject(new Error('Failed to read image file'));
    reader.readAsDataURL(file);
  });
}

async function processPhoto(file: File): Promise<string> {
  const dataUrl = await readFileAsDataUrl(file);
  const img = await new Promise<HTMLImageElement>((resolve, reject) => {
    const i = new Image();
    i.onload = () => resolve(i);
    i.onerror = () => reject(new Error('Invalid image'));
    i.src = dataUrl;
  });
  let { width, height } = img;
  const maxDim = 1600;
  if (width > maxDim || height > maxDim) {
    const ratio = Math.min(maxDim / width, maxDim / height);
    width = Math.max(1, Math.round(width * ratio));
    height = Math.max(1, Math.round(height * ratio));
  }
  const c = document.createElement('canvas');
  c.width = width; c.height = height;
  const ctx = c.getContext('2d');
  if (!ctx) return dataUrl;
  ctx.fillStyle = '#fff';
  ctx.fillRect(0, 0, width, height);
  ctx.drawImage(img, 0, 0, width, height);
  return c.toDataURL('image/jpeg', 0.92);
}

export default function GoodChildCertificate({ lang }: Props) {
  const isTa = lang === 'ta';
  const exportRef = useRef<HTMLDivElement | null>(null);
  const fileRef = useRef<HTMLInputElement | null>(null);

  const [childName, setChildName] = useState('');
  const [age, setAge] = useState('');
  const [fatherName, setFatherName] = useState('');
  const [motherName, setMotherName] = useState('');
  const [city, setCity] = useState('');
  const [photoDataUrl, setPhotoDataUrl] = useState<string | null>(null);
  const [photoName, setPhotoName] = useState('');
  const [photoError, setPhotoError] = useState('');
  const [error, setError] = useState('');
  const [cert, setCert] = useState<CertData | null>(null);

  const [busy, setBusy] = useState<'' | 'png' | 'share' | 'save' | 'pdf'>('');
  const [statusMsg, setStatusMsg] = useState('');
  const [statusErr, setStatusErr] = useState('');

  const kolkata = useMemo(() => getKolkataDateInfo(), []);

  const t = isTa ? {
    title: 'நல்ல குழந்தை சான்றிதழ்', subtitle: 'உங்கள் குழந்தைக்கான தனிப்பயன் சான்றிதழை உருவாக்குங்கள்.',
    name: 'குழந்தையின் பெயர்', age: 'வயது', father: 'தந்தை பெயர் (விருப்பம்)', mother: 'தாய் பெயர் (விருப்பம்)', city: 'நகரம் / ஊர் (விருப்பம்)',
    photo: 'குழந்தையின் புகைப்படம் (விருப்பம்)', upload: 'புகைப்படம் பதிவேற்று', change: 'மாற்று', remove: 'நீக்கு',
    generate: 'சான்றிதழை உருவாக்கு', dlPng: 'சான்றிதழ் பதிவிறக்கு (PNG)', share: 'சான்றிதழ் பகிர்', save: 'சாதனத்தில் சேமி', dlPdf: 'PDF பதிவிறக்கு (விருப்பம்)', again: 'மற்றொரு சான்றிதழ் உருவாக்கு',
    req: 'குழந்தையின் பெயர் மற்றும் வயது அவசியம்.', photoHint: 'JPG, JPEG அல்லது PNG (அதிகபட்சம் 5MB).',
    privacyTitle: 'பெற்றோர் தனியுரிமை & பாதுகாப்பு', privacy: 'விவரங்களும் புகைப்படமும் முடிந்தவரை உங்கள் சாதனத்திலேயே செயலாக்கப்படுகின்றன; தேவையில்லாமல் சேமிக்கப்படுவதில்லை அல்லது பொது URL-களில் பகிரப்படுவதில்லை. அனுமதி பெற்ற புகைப்படங்களை மட்டும் பயன்படுத்தவும். இது மகிழ்ச்சிக்கான பாராட்டு சான்றிதழே, அதிகாரப்பூர்வ சான்றிதழ் அல்ல.',
    preparing: 'சான்றிதழ் தயாராகிறது...', genPng: 'PNG உருவாக்குகிறது...', sharePrep: 'பகிர தயாராகிறது...', genPdf: 'PDF உருவாக்குகிறது...',
  } : {
    title: 'Good Child Certificate', subtitle: 'Create a personalised appreciation certificate for your child.',
    name: "Child's Name", age: 'Age', father: "Father's Name (optional)", mother: "Mother's Name (optional)", city: 'City / Town (optional)',
    photo: "Upload Your Child's Photo (optional)", upload: 'Upload Photo', change: 'Change Photo', remove: 'Remove',
    generate: 'Generate Certificate', dlPng: 'Download Certificate (PNG)', share: 'Share Certificate', save: 'Save to Device', dlPdf: 'Download PDF (optional)', again: 'Generate Another Certificate',
    req: "Child's Name and Age are required.", photoHint: 'JPG, JPEG or PNG (max 5 MB).',
    privacyTitle: 'Privacy & Safety for Parents', privacy: "Child details and photos are processed locally on your device wherever practical. We do not unnecessarily store them or expose them through public URLs. Please upload only photographs you have permission to use. This is a fun appreciation certificate, not an official school or government certificate.",
    preparing: 'Preparing certificate...', genPng: 'Generating PNG...', sharePrep: 'Preparing file for sharing...', genPdf: 'Generating PDF...',
  };

  const onPhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    setPhotoError('');
    const ok = ['image/jpeg', 'image/png', 'image/jpg'].includes(file.type) || /\.(jpe?g|png)$/i.test(file.name);
    if (!ok) { setPhotoError(isTa ? 'JPG, JPEG அல்லது PNG மட்டும் அனுமதி.' : 'Please upload a JPG, JPEG, or PNG image.'); return; }
    if (file.size > 5 * 1024 * 1024) { setPhotoError(isTa ? 'புகைப்படம் 5MB-க்குள் இருக்க வேண்டும்.' : 'Photo must be 5 MB or smaller.'); return; }
    try { const d = await processPhoto(file); setPhotoDataUrl(d); setPhotoName(file.name); }
    catch (err) { console.error('[Photo]', err); setPhotoError(isTa ? 'புகைப்படத்தை படிக்க முடியவில்லை.' : 'Could not process this photo. Please try another image.'); }
  };

  const removePhoto = () => { setPhotoDataUrl(null); setPhotoName(''); setPhotoError(''); };

  const onGenerate = (e: React.FormEvent) => {
    e.preventDefault();
    setError(''); setStatusErr(''); setStatusMsg('');
    const cName = clean(childName, 60);
    const cAge = clean(age, 20);
    if (!cName || !cAge) { setError(t.req); return; }
    const k = getKolkataDateInfo();
    setCert({ childName: cName, age: cAge, fatherName: clean(fatherName, 60), motherName: clean(motherName, 60), city: clean(city, 60), monthYear: k.monthYear, issueDate: k.issueDate, certId: makeCertId(k.year), photoDataUrl });
    setTimeout(() => document.getElementById('certificate-preview')?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 80);
  };

  const waitImagesLoaded = async (el: HTMLElement) => {
    const imgs = Array.from(el.querySelectorAll('img')) as HTMLImageElement[];
    const failed: string[] = [];
    await Promise.all(imgs.map(async (img) => {
      const src = img.currentSrc || img.src || '(image)';
      try { if (img.decode) await img.decode(); } catch {}
      if (!img.complete) {
        await new Promise<void>((res) => { img.onload = () => res(); img.onerror = () => { failed.push(src); res(); }; });
      }
      if (img.naturalWidth === 0) failed.push(src);
    }));
    if (failed.length) throw new Error('Image failed to load: ' + failed.join(', '));
  };

  const renderCertificatePng = async (): Promise<{ dataUrl: string; blob: Blob }> => {
    const node = exportRef.current;
    if (!cert) throw new Error('No certificate data');
    if (!node) throw new Error('Certificate element not found');

    await document.fonts.ready;
    await waitImagesLoaded(node);
    await new Promise((r) => setTimeout(r, 120));

    const pixelRatio = 2;
    const dataUrl = await toPng(node, { cacheBust: true, pixelRatio, width: W, height: H, backgroundColor: '#ffffff', style: { transform: 'none', margin: '0' } });
    if (!dataUrl || dataUrl === 'data:,') throw new Error('PNG generation returned empty data');

    const blob = await toBlob(node, { cacheBust: true, pixelRatio, width: W, height: H, backgroundColor: '#ffffff', style: { transform: 'none', margin: '0' } });
    if (!blob || blob.size === 0) {
      const b = await (await fetch(dataUrl)).blob();
      if (!b || b.size === 0) throw new Error('Failed to create PNG blob');
      return { dataUrl, blob: b };
    }
    return { dataUrl, blob };
  };

  const downloadBlob = async (blob: Blob, fileName: string) => {
    const url = URL.createObjectURL(blob);
    try {
      const a = document.createElement('a');
      a.href = url; a.download = fileName; a.rel = 'noopener'; a.style.display = 'none';
      document.body.appendChild(a); a.click(); a.remove();
    } finally {
      setTimeout(() => URL.revokeObjectURL(url), 120000);
    }
  };

  const fileBase = () => `Poochandi_Good_Child_Certificate_${sanitizeFilename(cert?.childName || 'Child')}`;

  const runAction = async (kind: 'png' | 'share' | 'save' | 'pdf', fn: () => Promise<void>) => {
    if (!cert || busy) return;
    setBusy(kind); setStatusErr(''); setStatusMsg(kind === 'share' ? t.sharePrep : kind === 'pdf' ? t.genPdf : t.genPng);
    try { await fn(); }
    catch (err: any) {
      const detail = err?.message || String(err);
      console.error(`[Certificate ${kind}]`, detail, err);
      setStatusErr((isTa ? 'செயல் தோல்வி: ' : 'Action failed: ') + detail);
      setStatusMsg('');
      return;
    } finally { setBusy(''); }
  };

  const onDownloadPng = () => runAction('png', async () => {
    const certNode = exportRef.current;
    if (!certNode) throw new Error('Certificate element not found');
    await document.fonts.ready;
    await waitImagesLoaded(certNode);
    await new Promise((r) => setTimeout(r, 120));
    const dataUrl = await toPng(certNode, { cacheBust: true, pixelRatio: 2, width: W, height: H, backgroundColor: '#ffffff', style: { transform: 'none', margin: '0' } });
    if (!dataUrl || dataUrl === 'data:,') throw new Error('PNG generation returned empty data');
    const link = document.createElement('a');
    link.download = `Poochandi_Good_Child_Certificate_${Date.now()}.png`;
    link.href = dataUrl;
    link.click();
    setStatusMsg(isTa ? 'PNG பதிவிறக்கம் தயாராக உள்ளது.' : 'PNG download ready.');
  });

  const onSave = () => runAction('save', async () => {
    const { blob } = await renderCertificatePng();
    await downloadBlob(blob, `${fileBase()}_${Date.now()}.png`);
    try { const url = URL.createObjectURL(blob); setTimeout(() => { try { window.open(url, '_blank', 'noopener,noreferrer'); } catch {} setTimeout(() => URL.revokeObjectURL(url), 60000); }, 1500); } catch {}
    setStatusMsg(isTa ? 'சாதனத்தில் சேமிக்க முயற்சிக்கிறது.' : 'Save to device initiated.');
  });

  const onShare = () => runAction('share', async () => {
    const { blob } = await renderCertificatePng();
    const file = new File([blob], `${fileBase()}.png`, { type: 'image/png' });
    const nav: any = navigator;
    if (nav?.canShare && nav.canShare({ files: [file] }) && nav.share) {
      setStatusMsg(t.sharePrep);
      try {
        await nav.share({ files: [file], title: 'Good Child Certificate', text: `Good Child Certificate - ${cert?.childName || ''}` });
        setStatusMsg(isTa ? 'பகிர்வு முடிந்தது.' : 'Share completed.');
      } catch (e: any) {
        if (e?.name === 'AbortError') { setStatusMsg(isTa ? 'பகிர்வு ரத்து செய்யப்பட்டது.' : 'Sharing cancelled.'); return; }
        throw e;
      }
    } else {
      await downloadBlob(blob, `${fileBase()}.png`);
      setStatusMsg(isTa ? 'கோப்பு பகிர்வு ஆதரவு இல்லை. PNG பதிவிறக்கம் செய்யப்பட்டது.' : 'File sharing not supported. PNG downloaded instead.');
    }
  });

  const onPdf = () => runAction('pdf', async () => {
    const { dataUrl } = await renderCertificatePng();
    if (!dataUrl) throw new Error('PNG render failed, cannot create PDF');
    const { jsPDF } = await import('jspdf');
    const pdf = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4', compress: true });
    const pw = pdf.internal.pageSize.getWidth();
    const ph = pdf.internal.pageSize.getHeight();
    pdf.addImage(dataUrl, 'PNG', 0, 0, pw, ph, undefined, 'FAST');
    const pblob = pdf.output('blob');
    if (!pblob || pblob.size === 0) throw new Error('PDF creation failed (empty file)');
    await downloadBlob(pblob, `${fileBase()}.pdf`);
    setStatusMsg(isTa ? 'PDF பதிவிறக்கம் தயாராக உள்ளது.' : 'PDF download ready.');
  });

  const reset = () => { setCert(null); setError(''); setStatusErr(''); setStatusMsg(''); setChildName(''); setAge(''); setFatherName(''); setMotherName(''); setCity(''); removePhoto(); window.scrollTo({ top: 0, behavior: 'smooth' }); };

  const baseText: React.CSSProperties = { background: 'transparent', border: 'none', boxShadow: 'none', position: 'absolute', pointerEvents: 'none' };
  const detailValue: React.CSSProperties = { ...baseText, fontWeight: 700, color: '#2C3E50', fontSize: '16px', lineHeight: 1.1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' };

  const CertificateVisual = ({ id, nodeRef }: { id: string; nodeRef?: React.Ref<HTMLDivElement> }) => (
    <div
      id={id}
      ref={nodeRef}
      className={notoTamil.className}
      style={{ position: 'relative', width: W, height: H, aspectRatio: AR, overflow: 'hidden', background: '#fff' }}
    >
      <img
        src="/1000255472.png"
        alt="Certificate template"
        crossOrigin="anonymous"
        draggable={false}
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'fill', zIndex: 0 }}
      />

      {/* Dynamic transparent overlays */}
      <div style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 1, background: 'transparent' }}>
        {/* Child Photo (blank circular golden frame area) */}
        {cert?.photoDataUrl ? (
          <img
            src={cert.photoDataUrl}
            alt={cert.childName || 'Child photo'}
            style={{
              ...baseText,
              top: '26.5%',
              left: '67.5%',
              width: '12.5%',
              height: '18.75%', /* 12.5% of 1920 = 240px; 240/1280 = 18.75% to keep circle */
              borderRadius: '50%',
              objectFit: 'cover',
              objectPosition: 'center',
              border: '3px solid #F1C40F',
              boxShadow: '0 4px 8px rgba(0,0,0,0.2)',
              background: 'transparent',
              pointerEvents: 'none',
            }}
          />
        ) : null}

        {/* Child Name */}
        <div
          style={{
            ...baseText,
            color: '#8B0000',
            fontWeight: 800,
            fontSize: '36px',
            textAlign: 'center',
            width: '38%',
            left: '31%',
            top: '34.5%',
            transform: 'translateY(-50%)',
            fontFamily: "'Fredoka', 'Poppins', 'Noto Sans Tamil', sans-serif",
            lineHeight: 1.1,
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}
        >
          {cert?.childName || ''}
        </div>

        {/* Month & Year Ribbon */}
        <div
          style={{
            ...baseText,
            color: '#FFD700',
            fontWeight: 700,
            fontSize: '20px',
            textAlign: 'center',
            width: '36%',
            left: '32%',
            top: '53.5%',
            transform: 'translateY(-50%)',
            textShadow: '1px 1px 2px rgba(0,0,0,0.5)',
            lineHeight: 1.1,
          }}
        >
          {cert?.monthYear || ''}
        </div>

        {/* Left Details Column (values after colons) */}
        <div style={{ ...detailValue, top: '61.2%', left: '36.5%' }}>
          {cert?.age ? `${cert.age} Years` : ''}
        </div>
        <div style={{ ...detailValue, top: '65.5%', left: '36.5%', width: '14%' }}>
          {cert?.fatherName || ''}
        </div>
        <div style={{ ...detailValue, top: '69.8%', left: '36.5%', width: '14%' }}>
          {cert?.motherName || ''}
        </div>

        {/* Right Details Column (values after colons) */}
        <div style={{ ...detailValue, top: '61.2%', left: '65.5%', width: '13%' }}>
          {cert?.city || ''}
        </div>
        <div style={{ ...detailValue, top: '65.5%', left: '65.5%' }}>
          {cert?.issueDate || ''}
        </div>
        <div style={{ ...detailValue, top: '69.8%', left: '65.5%', fontSize: '15px' }}>
          {cert?.certId || ''}
        </div>
      </div>
    </div>
  );

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
            <div><label className="block text-xs font-bold text-slate-200 uppercase tracking-wider mb-1.5">{t.name} <span className="text-orange-400">*</span></label><input value={childName} onChange={(e)=>setChildName(e.target.value)} required maxLength={60} className="w-full min-h-[44px] px-4 py-3 rounded-xl bg-[#140b2e] border border-purple-800/60 text-white focus:outline-none focus:border-teal-400" /></div>
            <div><label className="block text-xs font-bold text-slate-200 uppercase tracking-wider mb-1.5">{t.age} <span className="text-orange-400">*</span></label><input value={age} onChange={(e)=>setAge(e.target.value)} required maxLength={20} className="w-full min-h-[44px] px-4 py-3 rounded-xl bg-[#140b2e] border border-purple-800/60 text-white focus:outline-none focus:border-teal-400" /></div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div><label className="block text-xs font-bold text-slate-200 uppercase tracking-wider mb-1.5">{t.father}</label><input value={fatherName} onChange={(e)=>setFatherName(e.target.value)} maxLength={60} className="w-full min-h-[44px] px-4 py-3 rounded-xl bg-[#140b2e] border border-purple-800/60 text-white focus:outline-none focus:border-teal-400" /></div>
              <div><label className="block text-xs font-bold text-slate-200 uppercase tracking-wider mb-1.5">{t.mother}</label><input value={motherName} onChange={(e)=>setMotherName(e.target.value)} maxLength={60} className="w-full min-h-[44px] px-4 py-3 rounded-xl bg-[#140b2e] border border-purple-800/60 text-white focus:outline-none focus:border-teal-400" /></div>
            </div>
            <div><label className="block text-xs font-bold text-slate-200 uppercase tracking-wider mb-1.5">{t.city}</label><input value={city} onChange={(e)=>setCity(e.target.value)} maxLength={60} className="w-full min-h-[44px] px-4 py-3 rounded-xl bg-[#140b2e] border border-purple-800/60 text-white focus:outline-none focus:border-teal-400" /></div>

            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-200 uppercase tracking-wider mb-1.5">{t.photo}</label>
              <input ref={fileRef} type="file" accept="image/png,image/jpeg" className="hidden" onChange={onPhotoChange} />
              {!photoDataUrl ? (
                <button type="button" onClick={() => fileRef.current?.click()} className="w-full min-h-[48px] px-4 py-3 rounded-xl border border-dashed border-teal-500/50 bg-teal-500/10 hover:bg-teal-500/15 text-teal-100 font-semibold flex items-center justify-center gap-2"><Camera className="w-5 h-5" /><span>{t.upload}</span></button>
              ) : (
                <div className="flex items-center gap-3 p-3 rounded-xl bg-[#0d0522] border border-purple-900/40">
                  <img src={photoDataUrl} alt="Child" className="w-16 h-16 rounded-full object-cover border-2 border-amber-400/70 bg-white" />
                  <div className="flex-1 min-w-0"><p className="text-sm text-slate-200 font-semibold truncate">{photoName || 'Photo'}</p><p className="text-xs text-slate-400">{t.photoHint}</p></div>
                  <div className="flex gap-2"><button type="button" onClick={()=>fileRef.current?.click()} className="min-h-[40px] px-3 py-2 rounded-lg bg-[#1d103f] border border-purple-700/50 text-purple-100 text-xs font-bold inline-flex items-center gap-1"><Upload className="w-4 h-4" />{t.change}</button><button type="button" onClick={removePhoto} className="min-h-[40px] px-3 py-2 rounded-lg bg-red-950/60 border border-red-700/50 text-red-200 text-xs font-bold inline-flex items-center gap-1"><Trash2 className="w-4 h-4" />{t.remove}</button></div>
                </div>
              )}
              {photoError && <p className="text-xs text-red-300">{photoError}</p>}
              <p className="text-xs text-slate-400">{t.photoHint}</p>
            </div>

            <div className="rounded-xl bg-[#0d0522] border border-purple-900/40 px-4 py-3 text-sm text-slate-300 flex items-center justify-between gap-3"><span className="text-slate-400">{isTa ? 'மாதம் & தேதி (Asia/Kolkata)' : 'Month & Date (Asia/Kolkata)'}</span><span className="font-bold text-teal-200 text-right">{kolkata.monthYear}<br />{kolkata.issueDate}</span></div>
            <button type="submit" className="w-full min-h-[48px] py-3.5 px-6 rounded-2xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-slate-950 font-black text-base shadow-xl transition-all flex items-center justify-center gap-2"><Sparkles className="w-5 h-5" /><span>{t.generate}</span></button>
            <div className="p-4 rounded-xl bg-teal-500/10 border border-teal-500/30 text-xs text-teal-100 leading-relaxed"><p className="font-bold flex items-center gap-2 mb-1"><ShieldCheck className="w-4 h-4" />{t.privacyTitle}</p><p>{t.privacy}</p></div>
          </form>
        </section>

        <section className="lg:col-span-7 space-y-5" id="certificate-preview">
          {!cert ? (
            <div className="min-h-[360px] rounded-3xl border border-dashed border-purple-700/50 bg-[#12082b]/50 flex items-center justify-center text-center p-8 text-slate-400"><p className="font-semibold">{isTa ? 'விவரங்களை நிரப்பி சான்றிதழை உருவாக்கவும்.' : 'Fill the form and generate to see the certificate preview.'}</p></div>
          ) : (
            <div className="space-y-5">
              <div className="w-full rounded-2xl bg-[#0d0522]/40 border border-purple-900/30 p-2 sm:p-3 overflow-hidden">
                <div className="w-full mx-auto" style={{ aspectRatio: AR, maxWidth: '100%', position: 'relative' }}>
                  <div style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}>
                    <div style={{ width: W, height: H, transformOrigin: 'top left', position: 'absolute', top: 0, left: 0 }}>
                      <CertificateVisual id="certificate-preview-visual" />
                    </div>
                    <PreviewScaler targetW={W} targetH={H} />
                  </div>
                </div>
              </div>

              {/* Offscreen export renderer (fixed 1920x1280) */}
              <div aria-hidden="true" style={{ position: 'fixed', left: -10000, top: 0, width: W, height: H, opacity: 1, pointerEvents: 'none', zIndex: -1 }}>
                <CertificateVisual id="certificate-node" nodeRef={exportRef} />
              </div>

              <p className="text-xs text-slate-400 text-center">{isTa ? 'முழு சான்றிதழும் முன்னோட்டத்தில் தெரிகிறது. பதிவிறக்கம்/பகிர்வு அதே வடிவமைப்பைப் பயன்படுத்தும்.' : 'Full certificate is visible above. Download/share/save use the same completed design.'}</p>

              <div id="ad-certificate-below-preview" data-ad-placement="below-preview-above-download" data-page="good-child-certificate"><AdSenseSlot slotId="certificate-below-preview" format="auto" className="my-4" /></div>

              {(statusErr || statusMsg) && <div className={`p-3 rounded-xl text-sm ${statusErr ? 'bg-red-950/70 border border-red-700/50 text-red-200' : 'bg-teal-500/10 border border-teal-500/30 text-teal-100'}`}>{statusErr || statusMsg}</div>}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button type="button" onClick={onDownloadPng} disabled={!!busy} className="inline-flex items-center justify-center gap-2 min-h-[48px] px-5 py-3.5 rounded-2xl bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-600 hover:to-emerald-600 text-slate-950 font-black shadow-lg disabled:opacity-60 disabled:cursor-not-allowed"><ImagePlus className="w-5 h-5" /><span>{busy==='png'?t.genPng:t.dlPng}</span></button>
                <button type="button" onClick={onShare} disabled={!!busy} className="inline-flex items-center justify-center gap-2 min-h-[48px] px-5 py-3.5 rounded-2xl bg-gradient-to-r from-indigo-500 to-violet-500 hover:from-indigo-600 hover:to-violet-600 text-white font-black shadow-lg disabled:opacity-60 disabled:cursor-not-allowed"><Share2 className="w-5 h-5" /><span>{busy==='share'?t.sharePrep:t.share}</span></button>
                <button type="button" onClick={onSave} disabled={!!busy} className="inline-flex items-center justify-center gap-2 min-h-[48px] px-5 py-3.5 rounded-2xl bg-[#1d103f] hover:bg-[#271654] border border-purple-700/50 text-purple-100 font-bold disabled:opacity-60 disabled:cursor-not-allowed"><Save className="w-5 h-5" /><span>{busy==='save'?t.genPng:t.save}</span></button>
                <button type="button" onClick={onPdf} disabled={!!busy} className="inline-flex items-center justify-center gap-2 min-h-[48px] px-5 py-3.5 rounded-2xl bg-[#1d103f] hover:bg-[#271654] border border-purple-700/50 text-purple-100 font-bold disabled:opacity-60 disabled:cursor-not-allowed"><Download className="w-5 h-5" /><span>{busy==='pdf'?t.genPdf:t.dlPdf}</span></button>
              </div>
              <div className="flex justify-center"><button type="button" onClick={reset} disabled={!!busy} className="inline-flex items-center justify-center gap-2 min-h-[44px] px-6 py-3 rounded-2xl bg-transparent hover:bg-white/5 border border-slate-700/60 text-slate-200 font-bold disabled:opacity-60"><RefreshCw className="w-5 h-5" /><span>{t.again}</span></button></div>
              <p className="text-xs text-slate-400 text-center">{isTa ? 'PNG உருவாக்கம், பகிர்வு, சேமிப்பு செயல்படும்; PDF தோல்வியடைந்தாலும் இவை பாதிக்கப்படாது. விளம்பரங்கள் தோல்வியடைந்தாலும் சான்றிதழ் கிடைக்கும்.' : 'PNG generation, sharing and saving are independent; PDF failure does not block them. Certificate works even if ads fail to load.'}</p>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

function PreviewScaler({ targetW, targetH }: { targetW: number; targetH: number }) {
  const ref = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    const parent = ref.current?.parentElement as HTMLElement | null;
    if (!parent) return;
    const inner = parent.querySelector('div[style*="transform-origin"]') as HTMLElement | null;
    const apply = () => {
      const rect = parent.getBoundingClientRect();
      const s = Math.min(rect.width / targetW, rect.height / targetH) || 1;
      if (inner) inner.style.transform = `scale(${s})`;
    };
    apply();
    const ro = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(apply) : null;
    ro?.observe(parent);
    window.addEventListener('resize', apply);
    return () => { ro?.disconnect(); window.removeEventListener('resize', apply); };
  }, [targetW, targetH]);
  return <div ref={ref} style={{ display: 'none' }} />;
}
