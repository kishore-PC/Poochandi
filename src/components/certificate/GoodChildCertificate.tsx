'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Noto_Sans_Tamil } from 'next/font/google';
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

const W = 1536;
const H = 1024;
const PREVIEW_BASE_W = 1100; // used for responsive scaling container

function getKolkataDateInfo() {
  const now = new Date();
  const monthYear = new Intl.DateTimeFormat('en-US', {
    timeZone: 'Asia/Kolkata',
    month: 'long',
    year: 'numeric',
  }).format(now); // e.g. November 2026
  const parts = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Asia/Kolkata',
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  }).formatToParts(now);
  const get = (t: string) => parts.find((p) => p.type === t)?.value || '';
  const day = String(parseInt(get('day') || '0', 10) || get('day'));
  const issueDate = `${day} ${get('month')} ${get('year')}`; // 14 November 2026
  const year = get('year') || String(now.getFullYear());
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

async function readFileAsDataUrl(file: File): Promise<string> {
  return await new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ''));
    reader.onerror = () => reject(new Error('Failed to read image file'));
    reader.readAsDataURL(file);
  });
}

async function downscaleImageToDataUrl(file: File, maxDim = 1600, quality = 0.92): Promise<string> {
  // Process locally; strip EXIF by re-encoding via canvas
  const dataUrl = await readFileAsDataUrl(file);
  const img = await new Promise<HTMLImageElement>((resolve, reject) => {
    const i = new Image();
    i.onload = () => resolve(i);
    i.onerror = () => reject(new Error('Invalid image file'));
    i.src = dataUrl;
  });
  let { width, height } = img;
  if (width > maxDim || height > maxDim) {
    const ratio = Math.min(maxDim / width, maxDim / height);
    width = Math.max(1, Math.round(width * ratio));
    height = Math.max(1, Math.round(height * ratio));
  }
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) return dataUrl;
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, width, height);
  ctx.drawImage(img, 0, 0, width, height);
  return canvas.toDataURL('image/jpeg', quality);
}

function fitFontSize(text: string, base: number, min: number, maxChars: number) {
  const len = (text || '').length;
  if (len <= maxChars) return base;
  const ratio = maxChars / len;
  return Math.max(min, Math.round(base * ratio));
}

export default function GoodChildCertificate({ lang }: Props) {
  const isTa = lang === 'ta';
  const certRef = useRef<HTMLDivElement | null>(null);
  const previewWrapRef = useRef<HTMLDivElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [previewScale, setPreviewScale] = useState(1);

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
  const [downloadingPng, setDownloadingPng] = useState(false);
  const [downloadingPdf, setDownloadingPdf] = useState(false);
  const [sharing, setSharing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [actionMsg, setActionMsg] = useState('');
  const [actionError, setActionError] = useState('');

  const kolkata = useMemo(() => getKolkataDateInfo(), []);

  useEffect(() => {
    const update = () => {
      const el = previewWrapRef.current;
      if (!el) return;
      const w = el.clientWidth || W;
      setPreviewScale(Math.min(1, w / W));
    };
    update();
    window.addEventListener('resize', update);
    const ro = typeof ResizeObserver !== 'undefined' && previewWrapRef.current ? new ResizeObserver(update) : null;
    if (ro && previewWrapRef.current) ro.observe(previewWrapRef.current);
    return () => {
      window.removeEventListener('resize', update);
      ro?.disconnect();
    };
  }, [cert]);

  const t = isTa
    ? {
        title: 'நல்ல குழந்தை சான்றிதழ்',
        subtitle: 'உங்கள் குழந்தைக்கான அழகான தனிப்பயன் சான்றிதழை உருவாக்குங்கள்.',
        name: 'குழந்தையின் பெயர்',
        age: 'வயது',
        father: 'தந்தை பெயர் (விருப்பம்)',
        mother: 'தாய் பெயர் (விருப்பம்)',
        city: 'நகரம் / ஊர் (விருப்பம்)',
        photo: 'குழந்தையின் புகைப்படம் (விருப்பம்)',
        uploadPhoto: 'புகைப்படம் பதிவேற்று',
        changePhoto: 'புகைப்படம் மாற்று',
        removePhoto: 'நீக்கு',
        generate: 'சான்றிதழை உருவாக்கு',
        downloadPng: 'சான்றிதழ் பதிவிறக்கு (PNG)',
        share: 'சான்றிதழ் பகிர்',
        save: 'சாதனத்தில் சேமி',
        downloadPdf: 'PDF பதிவிறக்கு (விருப்பம்)',
        again: 'மற்றொரு சான்றிதழ் உருவாக்கு',
        privacyTitle: 'பெற்றோர் தனியுரிமை & பாதுகாப்பு',
        privacy:
          'குழந்தை விவரங்கள் மற்றும் புகைப்படம் முடிந்தவரை உங்கள் சாதனத்திலேயே செயலாக்கப்படுகின்றன. தேவையில்லாமல் சேமிக்கப்படுவதில்லை அல்லது பொது URL-களில் பகிரப்படுவதில்லை. நீங்கள் அனுமதி பெற்ற புகைப்படங்களை மட்டும் பதிவேற்றவும். இது மகிழ்ச்சிக்கான பாராட்டு சான்றிதழே; அதிகாரப்பூர்வ பள்ளி/அரசு சான்றிதழ் அல்ல.',
        req: 'குழந்தையின் பெயர் மற்றும் வயது அவசியம்.',
        photoReq: 'JPG, JPEG அல்லது PNG (அதிகபட்சம் 5MB).',
      }
    : {
        title: 'Good Child Certificate',
        subtitle: 'Create a beautiful, personalised appreciation certificate for your child.',
        name: "Child's Name",
        age: 'Age',
        father: "Father's Name (optional)",
        mother: "Mother's Name (optional)",
        city: 'City / Town (optional)',
        photo: "Upload Your Child's Photo (optional)",
        uploadPhoto: 'Upload Photo',
        changePhoto: 'Change Photo',
        removePhoto: 'Remove',
        generate: 'Generate Certificate',
        downloadPng: 'Download Certificate (PNG)',
        share: 'Share Certificate',
        save: 'Save to Device',
        downloadPdf: 'Download PDF (optional)',
        again: 'Generate Another Certificate',
        privacyTitle: 'Privacy & Safety for Parents',
        privacy:
          "Child details and photos are processed locally on your device wherever practical. We do not unnecessarily store them or expose them through public URLs. Please upload photographs you have permission to use. This is a fun appreciation certificate, not an official school or government certificate.",
        req: "Child's Name and Age are required.",
        photoReq: 'JPG, JPEG or PNG (max 5 MB).',
      };

  const onPhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    setPhotoError('');
    const okTypes = ['image/jpeg', 'image/png', 'image/jpg'];
    if (!okTypes.includes(file.type) && !/\.(jpe?g|png)$/i.test(file.name)) {
      setPhotoError(isTa ? 'JPG, JPEG அல்லது PNG கோப்பை மட்டும் பதிவேற்றவும்.' : 'Please upload a JPG, JPEG, or PNG image.');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setPhotoError(isTa ? 'புகைப்படம் 5MB-க்கு குறைவாக இருக்க வேண்டும்.' : 'Photo must be 5 MB or smaller.');
      return;
    }
    try {
      const processed = await downscaleImageToDataUrl(file);
      setPhotoDataUrl(processed);
      setPhotoName(file.name);
    } catch (err) {
      console.error('[Certificate photo]', err);
      setPhotoError(isTa ? 'புகைப்படத்தை படிக்க முடியவில்லை.' : 'Could not read that photo. Please try another image.');
    }
  };

  const removePhoto = () => {
    setPhotoDataUrl(null);
    setPhotoName('');
    setPhotoError('');
  };

  const onGenerate = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setActionError('');
    setActionMsg('');
    const cName = clean(childName, 50);
    const cAge = clean(age, 12);
    const fName = clean(fatherName, 50);
    const mName = clean(motherName, 50);
    const cCity = clean(city, 50);

    if (!cName || !cAge) {
      setError(t.req);
      return;
    }

    const k = getKolkataDateInfo();
    setCert({
      childName: cName,
      age: cAge,
      fatherName: fName,
      motherName: mName,
      city: cCity,
      monthYear: k.monthYear,
      issueDate: k.issueDate,
      certId: makeCertId(k.year),
      photoDataUrl,
    });
    setTimeout(() => document.getElementById('certificate-preview')?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 60);
  };

  const waitForCertReady = async () => {
    if (!certRef.current) throw new Error('Certificate preview not ready');
    // @ts-ignore
    if (document.fonts?.ready) await document.fonts.ready;
    const imgs = Array.from(certRef.current.querySelectorAll('img')) as HTMLImageElement[];
    await Promise.all(
      imgs.map(async (img) => {
        try {
          if (img.decode) await img.decode();
        } catch {}
        if (!img.complete) {
          await new Promise<void>((resolve) => {
            img.onload = () => resolve();
            img.onerror = () => resolve();
          });
        }
      })
    );
    await new Promise((r) => setTimeout(r, 120));
  };

  const renderPngBlob = async (): Promise<{ blob: Blob; fileName: string }> => {
    if (!cert || !certRef.current) throw new Error('Certificate not ready');
    await waitForCertReady();
    const { default: html2canvas } = await import('html2canvas');

    const targetW = 3000;
    const scale = targetW / W; // ~1.953 for 3000x2000
    const canvas = await html2canvas(certRef.current, {
      scale,
      useCORS: true,
      allowTaint: false,
      backgroundColor: '#ffffff',
      logging: false,
      width: W,
      height: H,
      windowWidth: W,
      windowHeight: H,
      scrollX: 0,
      scrollY: -window.scrollY,
      onclone: (doc) => {
        const el = doc.getElementById('certificate-capture');
        if (el) {
          const h = el as HTMLElement;
          h.style.transform = 'none';
          h.style.margin = '0';
        }
      },
    });
    if (!canvas || !canvas.width || !canvas.height) throw new Error('Failed to render certificate image');

    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob((b) => resolve(b), 'image/png'));
    if (!blob || blob.size === 0) {
      // fallback via dataURL
      const dataUrl = canvas.toDataURL('image/png');
      const res = await fetch(dataUrl);
      const b = await res.blob();
      if (!b || b.size === 0) throw new Error('Failed to create PNG image');
      return { blob: b, fileName: pngFileName(cert.childName) };
    }
    return { blob, fileName: pngFileName(cert.childName) };
  };

  const pngFileName = (name: string) => {
    const safe = (name || 'Certificate').replace(/[^\p{L}\p{N}_ -]/gu, '').trim().replace(/\s+/g, '_') || 'Certificate';
    return `Good_Child_Certificate_${safe}.png`;
  };

  const triggerBlobDownload = async (blob: Blob, fileName: string) => {
    const url = URL.createObjectURL(blob);
    try {
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      a.rel = 'noopener';
      a.style.display = 'none';
      document.body.appendChild(a);
      a.click();
      a.remove();
      // iOS/Safari fallback: open in new tab if download attribute ignored
      setTimeout(() => {
        try {
          // keep as fallback hint; can't reliably detect success
        } catch {}
      }, 500);
      return url;
    } catch (e) {
      URL.revokeObjectURL(url);
      throw e;
    }
  };

  const busy = downloadingPng || downloadingPdf || sharing || saving;

  const handleDownloadPng = async () => {
    if (!cert || busy) return;
    setActionError(''); setActionMsg('');
    setDownloadingPng(true);
    let step = 'init';
    try {
      step = 'render-png';
      const { blob, fileName } = await renderPngBlob();
      step = 'download-png';
      const url = await triggerBlobDownload(blob, fileName);
      setTimeout(() => URL.revokeObjectURL(url), 60000);
      setActionMsg(isTa ? 'PNG பதிவிறக்கம் தொடங்கியது.' : 'PNG download started.');
    } catch (err) {
      console.error('[Certificate PNG] failed at step:', step, err);
      setActionError((isTa ? 'PNG உருவாக்க முடியவில்லை. மீண்டும் முயற்சிக்கவும். (பிழை: ' : 'Could not generate PNG. Please try again. (Error: ') + step + ')');
    } finally {
      setDownloadingPng(false);
    }
  };

  const handleSave = async () => {
    // Separate Save to Device action (PNG)
    if (!cert || busy) return;
    setActionError(''); setActionMsg('');
    setSaving(true);
    let step = 'init';
    try {
      step = 'render-png';
      const { blob, fileName } = await renderPngBlob();
      step = 'save';
      const url = URL.createObjectURL(blob);
      try {
        const a = document.createElement('a');
        a.href = url;
        a.download = fileName;
        a.rel = 'noopener';
        a.style.display = 'none';
        document.body.appendChild(a);
        a.click();
        a.remove();
        // Fallback for browsers that ignore download: open image
        setTimeout(() => {
          try { window.open(url, '_blank', 'noopener,noreferrer'); } catch {}
        }, 1200);
      } finally {
        setTimeout(() => URL.revokeObjectURL(url), 60000);
      }
      setActionMsg(isTa ? 'சாதனத்தில் சேமிக்க முயற்சிக்கிறது.' : 'Saving to your device...');
    } catch (err) {
      console.error('[Certificate Save] failed at step:', step, err);
      setActionError((isTa ? 'சேமிக்க முடியவில்லை. மீண்டும் முயற்சிக்கவும். (பிழை: ' : 'Could not save to device. Please try again. (Error: ') + step + ')');
    } finally {
      setSaving(false);
    }
  };

  const handleShare = async () => {
    if (!cert || busy) return;
    setActionError(''); setActionMsg('');
    setSharing(true);
    let step = 'init';
    try {
      step = 'render-png';
      const { blob, fileName } = await renderPngBlob();
      step = 'share';
      const file = new File([blob], fileName, { type: 'image/png' });
      const nav: any = navigator;
      if (nav.canShare && nav.canShare({ files: [file] }) && nav.share) {
        try {
          await nav.share({ files: [file], title: 'Good Child Certificate', text: `Good Child Certificate - ${cert.childName}` });
          setActionMsg(isTa ? 'பகிர்வு சாளரம் திறக்கப்பட்டது.' : 'Share sheet opened.');
        } catch (shareErr: any) {
          if (shareErr && shareErr.name === 'AbortError') {
            setActionMsg(isTa ? 'பகிர்வு ரத்து செய்யப்பட்டது.' : 'Sharing cancelled.');
          } else {
            throw shareErr;
          }
        }
      } else {
        // Fallback: download
        const url = await triggerBlobDownload(blob, fileName);
        setTimeout(() => URL.revokeObjectURL(url), 60000);
        setActionMsg(isTa ? 'இந்த சாதனத்தில் நேரடி பட பகிர்வு ஆதரிக்கப்படவில்லை. PNG பதிவிறக்கம் செய்யப்பட்டது.' : 'Native image sharing is not supported on this device. PNG downloaded instead.');
      }
    } catch (err) {
      console.error('[Certificate Share] failed at step:', step, err);
      setActionError((isTa ? 'பகிர முடியவில்லை. PNG பதிவிறக்க முயற்சிக்கவும். (பிழை: ' : 'Could not share. Please try downloading the PNG instead. (Error: ') + step + ')');
    } finally {
      setSharing(false);
    }
  };

  const handleDownloadPdf = async () => {
    if (!cert || busy) return;
    setActionError(''); setActionMsg('');
    setDownloadingPdf(true);
    let step = 'init';
    try {
      // Generate from same high-res PNG/canvas image
      step = 'render-png';
      await waitForCertReady();
      const { default: html2canvas } = await import('html2canvas');
      const targetW = 3000;
      const canvas = await html2canvas(certRef.current!, {
        scale: targetW / W,
        useCORS: true,
        allowTaint: false,
        backgroundColor: '#ffffff',
        logging: false,
        width: W,
        height: H,
        windowWidth: W,
        windowHeight: H,
        scrollX: 0,
        scrollY: -window.scrollY,
        onclone: (doc) => {
          const el = doc.getElementById('certificate-capture');
          if (el) (el as HTMLElement).style.transform = 'none';
        },
      });
      if (!canvas) throw new Error('Failed to render certificate');
      let imgData = '';
      try { imgData = canvas.toDataURL('image/jpeg', 0.95); } catch { imgData = canvas.toDataURL('image/png'); }
      if (!imgData || imgData === 'data:,') throw new Error('Failed to encode image');

      step = 'create-pdf';
      const { jsPDF } = await import('jspdf');
      const pdf = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4', compress: true });
      const pw = pdf.internal.pageSize.getWidth();
      const ph = pdf.internal.pageSize.getHeight();
      const fmt = imgData.startsWith('data:image/jpeg') ? 'JPEG' : 'PNG';
      pdf.addImage(imgData, fmt, 0, 0, pw, ph, undefined, 'FAST');

      step = 'download-pdf';
      const blob = pdf.output('blob');
      if (!blob || blob.size === 0) throw new Error('Failed to create PDF');
      const safe = (cert.childName || 'Certificate').replace(/[^\p{L}\p{N}_ -]/gu, '').trim().replace(/\s+/g, '_') || 'Certificate';
      const fileName = `Good_Child_Certificate_${safe}.pdf`;
      const url = URL.createObjectURL(blob);
      try {
        const file = new File([blob], fileName, { type: 'application/pdf' });
        const nav: any = navigator;
        if (nav.canShare && nav.canShare({ files: [file] }) && nav.share) {
          try { await nav.share({ files: [file], title: 'Good Child Certificate', text: fileName }); setActionMsg(isTa ? 'PDF பகிர்வு/பதிவிறக்கம் தயாராக உள்ளது.' : 'PDF share/download ready.'); return; } catch (e: any) { if (e?.name === 'AbortError') return; }
        }
        const a = document.createElement('a');
        a.href = url; a.download = fileName; a.rel = 'noopener'; a.style.display = 'none';
        document.body.appendChild(a); a.click(); a.remove();
        setTimeout(() => { try { window.open(url, '_blank', 'noopener,noreferrer'); } catch {} }, 1200);
        setActionMsg(isTa ? 'PDF பதிவிறக்கம் தொடங்கியது.' : 'PDF download started.');
      } finally {
        setTimeout(() => URL.revokeObjectURL(url), 60000);
      }
    } catch (err) {
      console.error('[Certificate PDF] failed at step:', step, err);
      setActionError((isTa ? 'PDF உருவாக்க முடியவில்லை. PNG பதிவிறக்கத்தை முயற்சிக்கவும். (பிழை: ' : 'Could not generate PDF. Please try PNG download/share instead. (Error: ') + step + ')');
    } finally {
      setDownloadingPdf(false);
    }
  };

  const reset = () => {
    setCert(null);
    setError('');
    setActionError('');
    setActionMsg('');
    setChildName('');
    setAge('');
    setFatherName('');
    setMotherName('');
    setCity('');
    removePhoto();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Dynamic styles for certificate fields (1536x1024 logical canvas)
  const nameFont = cert ? fitFontSize(cert.childName, 76, 34, 18) : 76;
  const monthFont = 34;
  const infoLabel = { fontSize: 22, color: '#5b2b10', fontWeight: 700 as const };
  const infoValue = { fontSize: 26, color: '#1f2937', fontWeight: 700 as const };

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
              <input value={childName} onChange={(e) => setChildName(e.target.value)} required maxLength={50} className="w-full min-h-[44px] px-4 py-3 rounded-xl bg-[#140b2e] border border-purple-800/60 text-white focus:outline-none focus:border-teal-400" placeholder={isTa ? 'குழந்தையின் பெயர்' : "Child's name"} />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-200 uppercase tracking-wider mb-1.5">{t.age} <span className="text-orange-400">*</span></label>
              <input value={age} onChange={(e) => setAge(e.target.value)} required maxLength={12} className="w-full min-h-[44px] px-4 py-3 rounded-xl bg-[#140b2e] border border-purple-800/60 text-white focus:outline-none focus:border-teal-400" placeholder={isTa ? 'வயது' : 'Age'} />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-200 uppercase tracking-wider mb-1.5">{t.father}</label>
                <input value={fatherName} onChange={(e) => setFatherName(e.target.value)} maxLength={50} className="w-full min-h-[44px] px-4 py-3 rounded-xl bg-[#140b2e] border border-purple-800/60 text-white focus:outline-none focus:border-teal-400" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-200 uppercase tracking-wider mb-1.5">{t.mother}</label>
                <input value={motherName} onChange={(e) => setMotherName(e.target.value)} maxLength={50} className="w-full min-h-[44px] px-4 py-3 rounded-xl bg-[#140b2e] border border-purple-800/60 text-white focus:outline-none focus:border-teal-400" />
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-200 uppercase tracking-wider mb-1.5">{t.city}</label>
              <input value={city} onChange={(e) => setCity(e.target.value)} maxLength={50} className="w-full min-h-[44px] px-4 py-3 rounded-xl bg-[#140b2e] border border-purple-800/60 text-white focus:outline-none focus:border-teal-400" />
            </div>

            {/* Child Photo Upload */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-200 uppercase tracking-wider mb-1.5">{t.photo}</label>
              <input ref={fileInputRef} type="file" accept="image/png,image/jpeg" className="hidden" onChange={onPhotoChange} />
              {!photoDataUrl ? (
                <button type="button" onClick={() => fileInputRef.current?.click()} className="w-full min-h-[48px] px-4 py-3 rounded-xl border border-dashed border-teal-500/50 bg-teal-500/10 hover:bg-teal-500/15 text-teal-100 font-semibold flex items-center justify-center gap-2 transition-colors">
                  <Camera className="w-5 h-5" />
                  <span>{t.uploadPhoto}</span>
                </button>
              ) : (
                <div className="flex items-center gap-3 p-3 rounded-xl bg-[#0d0522] border border-purple-900/40">
                  <img src={photoDataUrl} alt="Child preview" className="w-16 h-16 rounded-full object-cover border-2 border-amber-400/70 bg-white" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-slate-200 font-semibold truncate">{photoName || 'Photo selected'}</p>
                    <p className="text-xs text-slate-400">{t.photoReq}</p>
                  </div>
                  <div className="flex gap-2">
                    <button type="button" onClick={() => fileInputRef.current?.click()} className="min-h-[40px] px-3 py-2 rounded-lg bg-[#1d103f] border border-purple-700/50 text-purple-100 text-xs font-bold inline-flex items-center gap-1"><Upload className="w-4 h-4" />{t.changePhoto}</button>
                    <button type="button" onClick={removePhoto} className="min-h-[40px] px-3 py-2 rounded-lg bg-red-950/60 border border-red-700/50 text-red-200 text-xs font-bold inline-flex items-center gap-1"><Trash2 className="w-4 h-4" />{t.removePhoto}</button>
                  </div>
                </div>
              )}
              {photoError && <p className="text-xs text-red-300">{photoError}</p>}
              <p className="text-xs text-slate-400">{t.photoReq} {isTa ? 'புகைப்படம் உங்கள் சாதனத்திலேயே பயன்படுத்தப்படுகிறது.' : 'Photo is processed on your device.'}</p>
            </div>

            <div className="rounded-xl bg-[#0d0522] border border-purple-900/40 px-4 py-3 text-sm text-slate-300 flex items-center justify-between gap-3">
              <span className="text-slate-400">{isTa ? 'மாதம், தேதி & ID (Asia/Kolkata)' : 'Month, Date & ID (Asia/Kolkata)'}</span>
              <span className="font-bold text-teal-200 text-right">{kolkata.monthYear}<br />{kolkata.issueDate}</span>
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
              <p className="font-semibold">{isTa ? 'விவரங்களை நிரப்பி சான்றிதழை உருவாக்கவும்.' : 'Fill the form and generate to see the certificate preview.'}</p>
            </div>
          ) : (
            <div className="space-y-5 animate-in fade-in slide-in-from-bottom-2 duration-300">
              {/* Responsive preview: full certificate visible, no crop, no horizontal scroll */}
              <div ref={previewWrapRef} className="w-full overflow-hidden rounded-2xl bg-[#0d0522]/40 border border-purple-900/30 p-2 sm:p-3">
                <div style={{ width: W * previewScale, height: H * previewScale, margin: '0 auto', position: 'relative' }}>
                  <div
                    id="certificate-capture"
                    ref={certRef}
                    className="absolute top-0 left-0 overflow-hidden bg-white"
                    style={{ width: W, height: H, transform: `scale(${previewScale})`, transformOrigin: 'top left' }}
                  >
                    {/* Background artwork (template as visual base) */}
                    <img src="/images/poochandi-certificate-template.png" alt="Good Child Certificate background" width={W} height={H} className="absolute inset-0 w-full h-full" style={{ objectFit: 'fill' }} crossOrigin="anonymous" draggable={false} />

                    {/* Masks/patches to hide baked placeholder text/labels where dynamic content replaces them (keeps artwork) */}
                    {/* Name placeholder area */}
                    <div style={{ position: 'absolute', left: 260, top: 355, width: 1016, height: 120, background: 'linear-gradient(180deg, rgba(255,248,242,0.98), rgba(255,246,238,0.98))', borderRadius: 14 }} />
                    {/* Month/year ribbon text area */}
                    <div style={{ position: 'absolute', left: 520, top: 468, width: 496, height: 52, background: 'rgba(255,250,246,0.97)', borderRadius: 10 }} />
                    {/* Left info labels/values placeholders */}
                    <div style={{ position: 'absolute', left: 170, top: 585, width: 520, height: 170, background: 'linear-gradient(180deg, rgba(248,235,215,0.98), rgba(245,228,205,0.98))', borderRadius: 12 }} />
                    {/* Right info placeholders */}
                    <div style={{ position: 'absolute', left: 860, top: 585, width: 500, height: 170, background: 'linear-gradient(180deg, rgba(248,235,215,0.98), rgba(245,228,205,0.98))', borderRadius: 12 }} />
                    {/* Bottom left/right branding/date/id placeholders (keeps badges/art, hides baked placeholder/AI tag text) */}
                    <div style={{ position: 'absolute', left: 40, top: 900, width: 430, height: 95, background: 'linear-gradient(90deg, rgba(80,45,18,0.96), rgba(95,55,22,0.92))', borderRadius: 14 }} />
                    <div style={{ position: 'absolute', left: 1065, top: 900, width: 430, height: 95, background: 'linear-gradient(270deg, rgba(45,60,18,0.96), rgba(60,70,22,0.92))', borderRadius: 14 }} />
                    <div style={{ position: 'absolute', left: 640, top: 905, width: 256, height: 70, background: 'rgba(255,248,235,0.0)' }} />

                    {/* C. Upper-right child photo frame (dynamic) */}
                    <div style={{ position: 'absolute', left: 1135, top: 78, width: 250, height: 250, borderRadius: '50%', overflow: 'hidden', border: '6px solid rgba(212,175,55,0.95)', boxShadow: '0 6px 18px rgba(0,0,0,0.18)', background: 'linear-gradient(180deg,#fff8e8,#ffe9c9)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      {cert.photoDataUrl ? (
                        <img src={cert.photoDataUrl} alt={cert.childName} style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center' }} />
                      ) : (
                        <div style={{ textAlign: 'center', color: '#a16207' }}>
                          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 6 }}><Camera size={44} color="#b45309" /></div>
                          <div style={{ fontSize: 18, fontWeight: 700, lineHeight: 1.2 }}>Child Photo</div>
                        </div>
                      )}
                    </div>

                    {/* A. Centre name frame */}
                    <div style={{ position: 'absolute', left: 260, top: 350, width: 1016, height: 130, display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '0 24px' }}>
                      <div style={{ color: '#7c2d12', fontWeight: 800, fontSize: nameFont, lineHeight: 1.05, textShadow: '0 1px 0 rgba(255,255,255,0.35)', wordBreak: 'break-word' }}>
                        {cert.childName}
                      </div>
                    </div>

                    {/* B. Pink month ribbon */}
                    <div style={{ position: 'absolute', left: 500, top: 462, width: 536, height: 64, display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
                      <div style={{ color: '#9d174d', fontWeight: 800, fontSize: monthFont, letterSpacing: 0.3 }}>{cert.monthYear}</div>
                    </div>

                    {/* D. Bottom-left info panel: Age, Father's Name, Mother's Name */}
                    <div style={{ position: 'absolute', left: 190, top: 592, width: 480, height: 156, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 10 }}>
                      <div style={{ display: 'flex', gap: 8, alignItems: 'baseline' }}>
                        <span style={infoLabel}>{isTa ? 'வயது:' : 'Age:'}</span>
                        <span style={{ ...infoValue, fontSize: 28 }}>{cert.age}</span>
                      </div>
                      {cert.fatherName && (
                        <div style={{ display: 'flex', gap: 8, alignItems: 'baseline', minWidth: 0 }}>
                          <span style={{ ...infoLabel, whiteSpace: 'nowrap' }}>{isTa ? 'தந்தை:' : "Father's Name:"}</span>
                          <span style={{ ...infoValue, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{cert.fatherName}</span>
                        </div>
                      )}
                      {cert.motherName && (
                        <div style={{ display: 'flex', gap: 8, alignItems: 'baseline', minWidth: 0 }}>
                          <span style={{ ...infoLabel, whiteSpace: 'nowrap' }}>{isTa ? 'தாய்:' : "Mother's Name:"}</span>
                          <span style={{ ...infoValue, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{cert.motherName}</span>
                        </div>
                      )}
                    </div>

                    {/* E. Bottom-right info panel: City/Town, Issued On, Certificate ID */}
                    <div style={{ position: 'absolute', left: 880, top: 592, width: 460, height: 156, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 10 }}>
                      {cert.city && (
                        <div style={{ display: 'flex', gap: 8, alignItems: 'baseline', minWidth: 0 }}>
                          <span style={{ ...infoLabel, whiteSpace: 'nowrap' }}>{isTa ? 'நகரம்:' : 'City / Town:'}</span>
                          <span style={{ ...infoValue, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{cert.city}</span>
                        </div>
                      )}
                      <div style={{ display: 'flex', gap: 8, alignItems: 'baseline' }}>
                        <span style={infoLabel}>{isTa ? 'வழங்கிய தேதி:' : 'Issued On:'}</span>
                        <span style={infoValue}>{cert.issueDate}</span>
                      </div>
                      <div style={{ display: 'flex', gap: 8, alignItems: 'baseline' }}>
                        <span style={infoLabel}>{isTa ? 'சான்றிதழ் எண்:' : 'Certificate ID:'}</span>
                        <span style={{ ...infoValue, fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace', fontSize: 24 }}>{cert.certId}</span>
                      </div>
                    </div>

                    {/* F. Bottom branding */}
                    {/* Bottom-left: Instagram icon + @poochandi.in */}
                    <div style={{ position: 'absolute', left: 60, top: 918, width: 390, height: 64, display: 'flex', alignItems: 'center', gap: 10, color: '#fff7ed' }}>
                      <div style={{ width: 34, height: 34, borderRadius: 9, background: 'linear-gradient(135deg,#f58529,#dd2a7b,#8134af,#515bd4)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <Camera size={18} color="#fff" />
                      </div>
                      <div style={{ fontWeight: 700, fontSize: 24 }}>@poochandi.in</div>
                    </div>
                    {/* Bottom-center: keep Poochandi Certified badge area visible (template art) - ensure no "Generated by AI" shown */}
                    {/* Bottom-right: Poochandi Varran */}
                    <div style={{ position: 'absolute', left: 1085, top: 918, width: 390, height: 64, display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 10, color: '#ecfccb', textAlign: 'right' }}>
                      <div style={{ fontWeight: 800, fontSize: 28, textShadow: '0 1px 2px rgba(0,0,0,0.25)' }}>Poochandi Varran</div>
                    </div>

                    {/* Hide any baked-in "Generated by AI" text region explicitly (bottom-right/lower area) */}
                    <div style={{ position: 'absolute', left: 1180, top: 975, width: 320, height: 40, background: 'rgba(45,60,18,0.98)' }} />
                  </div>
                </div>
              </div>

              <p className="text-xs text-slate-400 text-center">{isTa ? 'முழு சான்றிதழும் முன்னோட்டத்தில் தெரிகிறது. PNG பதிவிறக்கம்/பகிர்வு பரிந்துரைக்கப்படுகிறது (உயர் தரம்).' : 'Full certificate is visible in preview. PNG download/share is recommended for best quality.'}</p>

              {/* Advertisement below certificate preview and above actions (outside certificate) */}
              <div id="ad-certificate-below-preview" data-ad-placement="below-preview-above-download" data-page="good-child-certificate">
                <AdSenseSlot slotId="certificate-below-preview" format="auto" className="my-4" />
              </div>

              {(actionError || actionMsg) && (
                <div className={`p-3 rounded-xl text-sm ${actionError ? 'bg-red-950/70 border border-red-700/50 text-red-200' : 'bg-teal-500/10 border border-teal-500/30 text-teal-100'}`}>
                  {actionError || actionMsg}
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button type="button" onClick={handleDownloadPng} disabled={busy} className="inline-flex items-center justify-center gap-2 min-h-[48px] px-5 py-3.5 rounded-2xl bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-600 hover:to-emerald-600 text-slate-950 font-black shadow-lg disabled:opacity-60 disabled:cursor-not-allowed">
                  <ImagePlus className="w-5 h-5" />
                  <span>{downloadingPng ? (isTa ? 'PNG உருவாக்குகிறது...' : 'Generating PNG...') : t.downloadPng}</span>
                </button>
                <button type="button" onClick={handleShare} disabled={busy} className="inline-flex items-center justify-center gap-2 min-h-[48px] px-5 py-3.5 rounded-2xl bg-gradient-to-r from-indigo-500 to-violet-500 hover:from-indigo-600 hover:to-violet-600 text-white font-black shadow-lg disabled:opacity-60 disabled:cursor-not-allowed">
                  <Share2 className="w-5 h-5" />
                  <span>{sharing ? (isTa ? 'தயாராகிறது...' : 'Preparing...') : t.share}</span>
                </button>
                <button type="button" onClick={handleSave} disabled={busy} className="inline-flex items-center justify-center gap-2 min-h-[48px] px-5 py-3.5 rounded-2xl bg-[#1d103f] hover:bg-[#271654] border border-purple-700/50 text-purple-100 font-bold disabled:opacity-60 disabled:cursor-not-allowed">
                  <Save className="w-5 h-5" />
                  <span>{saving ? (isTa ? 'சேமிக்கிறது...' : 'Saving...') : t.save}</span>
                </button>
                <button type="button" onClick={handleDownloadPdf} disabled={busy} className="inline-flex items-center justify-center gap-2 min-h-[48px] px-5 py-3.5 rounded-2xl bg-[#1d103f] hover:bg-[#271654] border border-purple-700/50 text-purple-100 font-bold disabled:opacity-60 disabled:cursor-not-allowed">
                  <Download className="w-5 h-5" />
                  <span>{downloadingPdf ? (isTa ? 'PDF உருவாக்குகிறது...' : 'Generating PDF...') : t.downloadPdf}</span>
                </button>
              </div>

              <div className="flex justify-center">
                <button type="button" onClick={reset} disabled={busy} className="inline-flex items-center justify-center gap-2 min-h-[44px] px-6 py-3 rounded-2xl bg-transparent hover:bg-white/5 border border-slate-700/60 text-slate-200 font-bold disabled:opacity-60">
                  <RefreshCw className="w-5 h-5" />
                  <span>{t.again}</span>
                </button>
              </div>

              <p className="text-xs text-slate-400 text-center">{isTa ? 'PDF தோல்வியடைந்தாலும் PNG உருவாக்கம்/பகிர்வு/சேமிப்பு செயல்படும். விளம்பரங்கள் தோல்வியடைந்தாலும் சான்றிதழ் செயல்படும்.' : 'PNG generation, sharing and saving work even if PDF fails. Certificate remains accessible even if advertisements fail to load.'}</p>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
