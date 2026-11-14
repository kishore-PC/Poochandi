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

function getKolkataDateInfo() {
  const now = new Date();
  const monthYear = new Intl.DateTimeFormat('en-US', { timeZone: 'Asia/Kolkata', month: 'long', year: 'numeric' }).format(now);
  const parts = new Intl.DateTimeFormat('en-GB', { timeZone: 'Asia/Kolkata', day: '2-digit', month: 'long', year: 'numeric' }).formatToParts(now);
  const get = (t: string) => parts.find((p) => p.type === t)?.value || '';
  const dayRaw = get('day');
  const day = dayRaw ? String(parseInt(dayRaw, 10)) : '';
  const issueDate = `${day} ${get('month')} ${get('year')}`.trim();
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
  return c.toDataURL('image/jpeg', 0.92); // strips EXIF
}

function fitFont(text: string, base: number, min: number, charsAtBase: number) {
  const n = (text || '').length;
  if (n <= charsAtBase) return base;
  return Math.max(min, Math.floor(base * (charsAtBase / n)));
}

type RenderResult = { blob: Blob; canvas: HTMLCanvasElement };

export default function GoodChildCertificate({ lang }: Props) {
  const isTa = lang === 'ta';
  const exportRef = useRef<HTMLDivElement | null>(null);
  const previewWrapRef = useRef<HTMLDivElement | null>(null);
  const fileRef = useRef<HTMLInputElement | null>(null);
  const [scale, setScale] = useState(1);

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

  useEffect(() => {
    const upd = () => {
      const el = previewWrapRef.current;
      if (!el) return;
      const w = el.clientWidth || W;
      setScale(Math.min(1, Math.max(0.2, w / W)));
    };
    upd();
    window.addEventListener('resize', upd);
    const ro = typeof ResizeObserver !== 'undefined' && previewWrapRef.current ? new ResizeObserver(upd) : null;
    if (ro && previewWrapRef.current) ro.observe(previewWrapRef.current);
    return () => { window.removeEventListener('resize', upd); ro?.disconnect(); };
  }, [cert]);

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

  const waitReady = async (el: HTMLElement) => {
    // fonts
    try { // @ts-ignore
      if (document.fonts?.ready) await document.fonts.ready; } catch {}
    const imgs = Array.from(el.querySelectorAll('img')) as HTMLImageElement[];
    const failed: string[] = [];
    await Promise.all(imgs.map(async (img) => {
      const src = img.currentSrc || img.src || '(unknown)';
      try { if (img.decode) await img.decode(); } catch {}
      if (!img.complete) {
        await new Promise<void>((res) => { img.onload = () => res(); img.onerror = () => { failed.push(src); res(); }; });
      }
      if (img.naturalWidth === 0) failed.push(src);
    }));
    if (failed.length) throw new Error('Image failed to load: ' + failed.join(', '));
    await new Promise((r) => setTimeout(r, 150));
  };

  const renderCertificate = async (): Promise<RenderResult> => {
    const el = exportRef.current;
    if (!cert) throw new Error('No certificate data');
    if (!el) throw new Error('Certificate element not found');
    const rect = el.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) console.warn('[Certificate] export element size zero in layout, continuing with fixed size');

    await waitReady(el);
    const { default: html2canvas } = await import('html2canvas');
    // Fixed export dimensions independent of viewport; scale for high-res PNG
    const exportScale = 2; // 3072x2048
    const canvas = await html2canvas(el, {
      scale: exportScale,
      useCORS: true,
      allowTaint: false,
      backgroundColor: '#ffffff',
      logging: false,
      width: W,
      height: H,
      windowWidth: W,
      windowHeight: H,
      x: 0,
      y: 0,
      scrollX: 0,
      scrollY: 0,
      imageTimeout: 15000,
      onclone: (doc) => {
        const node = doc.getElementById('certificate-export') as HTMLElement | null;
        if (node) { node.style.transform = 'none'; node.style.position = 'relative'; node.style.left = '0'; node.style.top = '0'; node.style.margin = '0'; }
      },
    });
    if (!canvas || canvas.width === 0 || canvas.height === 0) throw new Error('Canvas creation failed (empty canvas)');

    const blob: Blob | null = await new Promise((resolve) => {
      try { canvas.toBlob((b) => resolve(b), 'image/png'); }
      catch { resolve(null); }
    });
    if (!blob || blob.size === 0) {
      // fallback
      const dataUrl = canvas.toDataURL('image/png');
      const b = await (await fetch(dataUrl)).blob();
      if (!b || b.size === 0) throw new Error('Blob creation failed (empty PNG)');
      if (b.type && b.type !== 'image/png') console.warn('[Certificate] blob type', b.type);
      return { blob: b, canvas };
    }
    return { blob, canvas };
  };

  const downloadBlob = async (blob: Blob, fileName: string, mime: string) => {
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
      // fallback open (esp. iOS Safari cases)
      setTimeout(() => { try { /* keep url valid */ } catch {} }, 0);
    } finally {
      setTimeout(() => URL.revokeObjectURL(url), 120000);
    }
  };

  const fileBase = () => `Good_Child_Certificate_${sanitizeFilename(cert?.childName || 'Child')}`;

  const runAction = async (kind: 'png' | 'share' | 'save' | 'pdf', fn: () => Promise<void>) => {
    if (!cert || busy) return;
    setBusy(kind); setStatusErr(''); setStatusMsg(kind === 'share' ? t.sharePrep : kind === 'pdf' ? t.genPdf : kind === 'png' ? t.genPng : t.preparing);
    try { await fn(); }
    catch (err: any) {
      const detail = err?.message || String(err);
      console.error(`[Certificate ${kind}]`, detail, err);
      setStatusErr((isTa ? 'செயல் தோல்வி: ' : 'Action failed: ') + detail);
      setStatusMsg('');
      return;
    }
    finally { setBusy(''); }
  };

  const onDownloadPng = () => runAction('png', async () => {
    setStatusMsg(t.genPng);
    const { blob } = await renderCertificate();
    if (!blob || blob.type.indexOf('png') === -1 && blob.size === 0) throw new Error('Generated file is not a valid PNG');
    await downloadBlob(blob, `${fileBase()}.png`, 'image/png');
    setStatusMsg(isTa ? 'PNG பதிவிறக்கம் தயாராக உள்ளது.' : 'PNG download ready.');
  });

  const onSave = () => runAction('save', async () => {
    setStatusMsg(t.genPng);
    const { blob } = await renderCertificate();
    if (!blob || blob.size === 0) throw new Error('Generated file is not a valid PNG');
    await downloadBlob(blob, `${fileBase()}.png`, 'image/png');
    // extra fallback for browsers ignoring download attribute
    try {
      const url = URL.createObjectURL(blob);
      setTimeout(() => { try { window.open(url, '_blank', 'noopener,noreferrer'); } catch {} setTimeout(() => URL.revokeObjectURL(url), 60000); }, 1500);
    } catch {}
    setStatusMsg(isTa ? 'சாதனத்தில் சேமிக்க முயற்சிக்கிறது.' : 'Save to device initiated.');
  });

  const onShare = () => runAction('share', async () => {
    setStatusMsg(t.genPng);
    const { blob } = await renderCertificate();
    if (!blob || blob.size === 0) throw new Error('Generated file is not a valid PNG');
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
      await downloadBlob(blob, `${fileBase()}.png`, 'image/png');
      setStatusMsg(isTa ? 'இந்த சாதனத்தில் கோப்பு பகிர்வு ஆதரவு இல்லை. PNG பதிவிறக்கம் செய்யப்பட்டது.' : 'File sharing not supported on this device. PNG downloaded instead.');
    }
  });

  const onPdf = () => runAction('pdf', async () => {
    setStatusMsg(t.genPdf);
    const { blob, canvas } = await renderCertificate();
    if (!blob || blob.size === 0) throw new Error('PNG render failed, cannot create PDF');
    let imgData = '';
    try { imgData = canvas.toDataURL('image/jpeg', 0.95); } catch { imgData = canvas.toDataURL('image/png'); }
    if (!imgData || imgData === 'data:,') throw new Error('Failed to encode certificate image for PDF');
    const { jsPDF } = await import('jspdf');
    const pdf = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4', compress: true });
    const pw = pdf.internal.pageSize.getWidth();
    const ph = pdf.internal.pageSize.getHeight();
    const fmt = imgData.startsWith('data:image/jpeg') ? 'JPEG' : 'PNG';
    pdf.addImage(imgData, fmt, 0, 0, pw, ph, undefined, 'FAST');
    const pblob = pdf.output('blob');
    if (!pblob || pblob.size === 0) throw new Error('PDF creation failed (empty file)');
    await downloadBlob(pblob, `${fileBase()}.pdf`, 'application/pdf');
    setStatusMsg(isTa ? 'PDF பதிவிறக்கம் தயாராக உள்ளது.' : 'PDF download ready.');
  });

  const reset = () => { setCert(null); setError(''); setStatusErr(''); setStatusMsg(''); setChildName(''); setAge(''); setFatherName(''); setMotherName(''); setCity(''); removePhoto(); window.scrollTo({ top: 0, behavior: 'smooth' }); };

  const nameFs = cert ? fitFont(cert.childName, 78, 34, 16) : 78;

  // Shared certificate visual (used for preview + export). Fixed 1536x1024.
  const CertificateVisual = ({ id }: { id: string }) => (
    <div id={id} ref={id === 'certificate-export' ? exportRef : undefined} className={notoTamil.className} style={{ position: 'relative', width: W, height: H, overflow: 'hidden', background: '#fff', fontFamily: 'var(--font-noto-sans-tamil), "Noto Sans Tamil", Arial, sans-serif' }}>
      <img src="/images/poochandi-certificate-template.png" alt="Certificate background" crossOrigin="anonymous" draggable={false} width={W} height={H} style={{ position: 'absolute', inset: 0, width: W, height: H, objectFit: 'fill' }} />

      {/* Cover baked dynamic-placeholder tokens/areas in template (keeps artwork). Positioned to sit over typical placeholder zones. */}
      {/* Name area cover */}
      <div style={{ position: 'absolute', left: 300, top: 360, width: 936, height: 110, background: 'linear-gradient(180deg, rgba(255,247,240,0.985), rgba(255,244,236,0.985))', borderRadius: 16 }} />
      {/* Month ribbon cover */}
      <div style={{ position: 'absolute', left: 560, top: 470, width: 416, height: 48, background: 'rgba(255,250,247,0.985)', borderRadius: 12 }} />
      {/* Info panels cover */}
      <div style={{ position: 'absolute', left: 150, top: 575, width: 560, height: 185, background: 'linear-gradient(180deg, rgba(250,238,220,0.985), rgba(246,232,210,0.985))', borderRadius: 14 }} />
      <div style={{ position: 'absolute', left: 835, top: 575, width: 545, height: 185, background: 'linear-gradient(180deg, rgba(250,238,220,0.985), rgba(246,232,210,0.985))', borderRadius: 14 }} />
      {/* Bottom strips to hide any baked {{}}/Generated by AI/placeholder date-id text while keeping art feel */}
      <div style={{ position: 'absolute', left: 30, top: 892, width: 460, height: 110, background: 'linear-gradient(90deg, rgba(78,44,16,0.97), rgba(92,54,20,0.94))', borderRadius: 16 }} />
      <div style={{ position: 'absolute', left: 1045, top: 892, width: 460, height: 110, background: 'linear-gradient(270deg, rgba(44,58,16,0.97), rgba(58,70,20,0.94))', borderRadius: 16 }} />
      {/* extra guard over common "Generated by AI" location */}
      <div style={{ position: 'absolute', left: 1185, top: 965, width: 320, height: 45, background: 'rgba(44,58,16,0.98)', borderRadius: 8 }} />

      {/* Photo frame (upper-right) */}
      <div style={{ position: 'absolute', left: 1142, top: 86, width: 240, height: 240, borderRadius: '50%', overflow: 'hidden', border: '6px solid rgba(214,178,70,0.98)', boxShadow: '0 6px 16px rgba(0,0,0,0.18)', background: 'linear-gradient(180deg,#fff7e6,#ffe8bf)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {cert?.photoDataUrl ? (
          <img src={cert.photoDataUrl} alt={cert.childName || 'Child photo'} crossOrigin="anonymous" style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center' }} />
        ) : (
          <div style={{ textAlign: 'center', color: '#92400e' }}>
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 6 }}><Camera size={42} color="#b45309" /></div>
            <div style={{ fontSize: 18, fontWeight: 700 }}>Child Photo</div>
          </div>
        )}
      </div>

      {/* Child name (center) */}
      <div style={{ position: 'absolute', left: 300, top: 350, width: 936, height: 130, display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '0 18px' }}>
        <div style={{ width: '100%', color: '#7c2d12', fontWeight: 800, fontSize: nameFs, lineHeight: 1.08, wordBreak: 'break-word', overflowWrap: 'anywhere' }}>{cert?.childName || ''}</div>
      </div>

      {/* Month Year ribbon */}
      <div style={{ position: 'absolute', left: 540, top: 465, width: 456, height: 58, display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
        <div style={{ color: '#9d174d', fontWeight: 800, fontSize: 34 }}>{cert?.monthYear || ''}</div>
      </div>

      {/* Left info: Age, Father, Mother */}
      <div style={{ position: 'absolute', left: 175, top: 585, width: 515, height: 165, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 12, color: '#3f2a14' }}>
        <div style={{ display: 'flex', gap: 10, alignItems: 'baseline', minWidth: 0 }}>
          <span style={{ fontSize: 24, fontWeight: 700, color: '#7c2d12', whiteSpace: 'nowrap' }}>{isTa ? 'வயது:' : 'Age:'}</span>
          <span style={{ fontSize: 28, fontWeight: 700, color: '#111827', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{cert?.age || ''}</span>
        </div>
        {cert?.fatherName ? (
          <div style={{ display: 'flex', gap: 10, alignItems: 'baseline', minWidth: 0 }}>
            <span style={{ fontSize: 24, fontWeight: 700, color: '#7c2d12', whiteSpace: 'nowrap' }}>{isTa ? 'தந்தை:' : "Father's Name:"}</span>
            <span style={{ fontSize: 26, fontWeight: 700, color: '#111827', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{cert.fatherName}</span>
          </div>
        ) : null}
        {cert?.motherName ? (
          <div style={{ display: 'flex', gap: 10, alignItems: 'baseline', minWidth: 0 }}>
            <span style={{ fontSize: 24, fontWeight: 700, color: '#7c2d12', whiteSpace: 'nowrap' }}>{isTa ? 'தாய்:' : "Mother's Name:"}</span>
            <span style={{ fontSize: 26, fontWeight: 700, color: '#111827', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{cert.motherName}</span>
          </div>
        ) : null}
      </div>

      {/* Right info: City, Issued On, Certificate ID */}
      <div style={{ position: 'absolute', left: 860, top: 585, width: 500, height: 165, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 12 }}>
        {cert?.city ? (
          <div style={{ display: 'flex', gap: 10, alignItems: 'baseline', minWidth: 0 }}>
            <span style={{ fontSize: 24, fontWeight: 700, color: '#7c2d12', whiteSpace: 'nowrap' }}>{isTa ? 'நகரம்:' : 'City / Town:'}</span>
            <span style={{ fontSize: 26, fontWeight: 700, color: '#111827', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{cert.city}</span>
          </div>
        ) : null}
        <div style={{ display: 'flex', gap: 10, alignItems: 'baseline', minWidth: 0 }}>
          <span style={{ fontSize: 24, fontWeight: 700, color: '#7c2d12', whiteSpace: 'nowrap' }}>{isTa ? 'வழங்கிய தேதி:' : 'Issued On:'}</span>
          <span style={{ fontSize: 26, fontWeight: 700, color: '#111827', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{cert?.issueDate || ''}</span>
        </div>
        <div style={{ display: 'flex', gap: 10, alignItems: 'baseline', minWidth: 0 }}>
          <span style={{ fontSize: 24, fontWeight: 700, color: '#7c2d12', whiteSpace: 'nowrap' }}>{isTa ? 'சான்றிதழ் எண்:' : 'Certificate ID:'}</span>
          <span style={{ fontSize: 24, fontWeight: 700, color: '#111827', fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Consolas, monospace', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{cert?.certId || ''}</span>
        </div>
      </div>

      {/* Branding: bottom-left IG, bottom-right name. (No Generated by AI) */}
      <div style={{ position: 'absolute', left: 60, top: 915, width: 410, height: 70, display: 'flex', alignItems: 'center', gap: 12, color: '#fff7ed' }}>
        <div style={{ width: 36, height: 36, borderRadius: 10, background: 'linear-gradient(135deg,#f58529,#dd2a7b,#8134af,#515bd4)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <Camera size={18} color="#fff" />
        </div>
        <span style={{ fontSize: 26, fontWeight: 700, letterSpacing: 0.2 }}>@poochandi.in</span>
      </div>
      <div style={{ position: 'absolute', left: 1065, top: 915, width: 410, height: 70, display: 'flex', alignItems: 'center', justifyContent: 'flex-end', color: '#ecfccb' }}>
        <span style={{ fontSize: 30, fontWeight: 800, textShadow: '0 1px 2px rgba(0,0,0,0.25)' }}>Poochandi Varran</span>
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
              {/* Preview: scaled view of the fixed certificate; full cert visible, no crop */}
              <div ref={previewWrapRef} className="w-full overflow-hidden rounded-2xl bg-[#0d0522]/40 border border-purple-900/30 p-2 sm:p-3">
                <div style={{ width: W * scale, height: H * scale, margin: '0 auto', position: 'relative' }}>
                  <div style={{ position: 'absolute', top: 0, left: 0, width: W, height: H, transform: `scale(${scale})`, transformOrigin: 'top left' }}>
                    <CertificateVisual id="certificate-preview-visual" />
                  </div>
                </div>
              </div>

              {/* Hidden/offscreen export renderer: same content, fixed size, no transform (used by html2canvas) */}
              <div aria-hidden="true" style={{ position: 'fixed', left: -10000, top: 0, width: W, height: H, opacity: 1, pointerEvents: 'none', zIndex: -1 }}>
                <CertificateVisual id="certificate-export" />
              </div>

              <p className="text-xs text-slate-400 text-center">{isTa ? 'முழு சான்றிதழும் முன்னோட்டத்தில் தெரிகிறது. பதிவிறக்கம்/பகிர்வு அதே வடிவமைப்பைப் பயன்படுத்தும்.' : 'Full certificate is visible above. Download/share/save/export use the same completed certificate design.'}</p>

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
