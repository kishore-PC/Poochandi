'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Users,
  FileText,
  Settings,
  Download,
  Trash2,
  Search,
  LogOut,
  ExternalLink,
  Plus,
  Save,
  CheckCircle2,
  Upload,
  Image as ImageIcon,
  Video,
  Play,
  Eye,
  Copy,
  RefreshCw,
  X,
  Pencil,
} from 'lucide-react';
import { InstagramIcon } from '@/components/icons/SocialIcons';

export default function AdminDashboardPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'complaint_names' | 'articles' | 'appearance'>('complaint_names');

  // Complaint Names state
  const [complaintNames, setComplaintNames] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [sortOrder, setSortOrder] = useState<'newest' | 'oldest'>('newest');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [loadingNames, setLoadingNames] = useState(true);
  // To Copy / Random Select state
  const [showToCopyModal, setShowToCopyModal] = useState(false);
  const [toCopyLoading, setToCopyLoading] = useState(false);
  const [toCopyEntries, setToCopyEntries] = useState<any[]>([]);
  const [randomCountInput, setRandomCountInput] = useState('');
  const [selectedRandomNames, setSelectedRandomNames] = useState<string[]>([]);
  const [copyStatus, setCopyStatus] = useState('');
  const [copyError, setCopyError] = useState('');
  const [isEditingNames, setIsEditingNames] = useState(false);
  const [editNamesText, setEditNamesText] = useState('');

  // Name entry control (global stop/resume)
  const [nameEntryStatus, setNameEntryStatus] = useState<'active' | 'stopped'>('active');
  const [nameEntryStatusLoading, setNameEntryStatusLoading] = useState(true);
  const [nameEntryStatusSaving, setNameEntryStatusSaving] = useState(false);

  // Articles CMS state
  const [articles, setArticles] = useState<any[]>([]);
  const [showArticleModal, setShowArticleModal] = useState(false);
  const [editingArticle, setEditingArticle] = useState<any | null>(null);
  const [articleSaving, setArticleSaving] = useState(false);
  const [articleForm, setArticleForm] = useState({
    title_en: '', title_ta: '', slug: '', category: 'Positive Parenting',
    excerpt_en: '', excerpt_ta: '', content_en: '', content_ta: '', seo_keywords: '', read_time: '5 min read', published: 1,
  });

  // Appearance & Media Management state
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [avatarPreview, setAvatarPreview] = useState<string>('');
  const [logoPreview, setLogoPreview] = useState<string>('');
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [uploadingThumb, setUploadingThumb] = useState<number | null>(null);
  const [savingSettings, setSavingSettings] = useState(false);
  const [settingsSaved, setSettingsSaved] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');

  useEffect(() => {
    fetchComplaintNames();
    fetchArticles();
    fetchSettings();
    fetchNameEntryStatus();
  }, [sortOrder]);

  const fetchComplaintNames = async () => {
    setLoadingNames(true);
    try {
      const url = `/api/admin/complaint-names?sort=${sortOrder}${search ? `&search=${encodeURIComponent(search)}` : ''}`;
      const res = await fetch(url);
      if (res.status === 401) {
        router.push('/admin/login');
        return;
      }
      const data = await res.json();
      setComplaintNames(data.names || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingNames(false);
    }
  };

  const fetchArticles = async () => {
    try {
      const res = await fetch('/api/admin/articles');
      const data = await res.json();
      setArticles(data.articles || []);
    } catch (e) {
      console.error(e);
    }
  };

  const fetchSettings = async () => {
    try {
      const res = await fetch('/api/admin/settings');
      const data = await res.json();
      const s = data.settings || {};
      setSettings(s);
      if (s.character_hero_url) setAvatarPreview(s.character_hero_url);
      if (s.logo_url) setLogoPreview(s.logo_url);
    } catch (e) {
      console.error(e);
    }
  };

  const fetchNameEntryStatus = async () => {
    try {
      setNameEntryStatusLoading(true);
      const res = await fetch('/api/admin/name-entry-status');
      if (res.status === 401) {
        router.push('/admin/login');
        return;
      }
      const data = await res.json();
      setNameEntryStatus(data.status === 'stopped' ? 'stopped' : 'active');
    } catch (e) {
      console.error(e);
    } finally {
      setNameEntryStatusLoading(false);
    }
  };

  const handleSetNameEntryStatus = async (nextStatus: 'active' | 'stopped') => {
    if (nextStatus === nameEntryStatus) return;
    const message = nextStatus === 'stopped'
      ? 'Stop new name entries globally? Parents will not be able to submit names until you resume.'
      : 'Resume name entries globally? Parents will be able to submit names again.';
    if (!confirm(message)) return;
    try {
      setNameEntryStatusSaving(true);
      const res = await fetch('/api/admin/name-entry-status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: nextStatus }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || 'Failed to update status');
      setNameEntryStatus(data.status === 'stopped' ? 'stopped' : 'active');
      setStatusMessage(nextStatus === 'stopped' ? 'Name entry has been stopped globally.' : 'Name entry has been resumed globally.');
      setTimeout(() => setStatusMessage(''), 3500);
    } catch (e: any) {
      console.error(e);
      alert(e.message || 'Failed to update name entry status');
    } finally {
      setNameEntryStatusSaving(false);
    }
  };

  // Complaint name delete handlers
  const handleDeleteSingle = async (id: string) => {
    if (!confirm(`Are you sure you want to delete entry ${id}?`)) return;
    await fetch('/api/admin/complaint-names', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ids: [id] }),
    });
    fetchComplaintNames();
  };

  const handleDeleteMultiple = async () => {
    if (selectedIds.length === 0) return;
    if (!confirm(`Delete ${selectedIds.length} selected entries?`)) return;
    await fetch('/api/admin/complaint-names', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ids: selectedIds }),
    });
    setSelectedIds([]);
    fetchComplaintNames();
  };

  const toggleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedIds(complaintNames.map((n) => n.id));
    } else {
      setSelectedIds([]);
    }
  };

  const toggleSelectOne = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  // Complaint Names: To Copy / Random Select
  const openToCopyModal = async () => {
    setShowToCopyModal(true);
    setSelectedRandomNames([]);
    setIsEditingNames(false);
    setEditNamesText('');
    setCopyStatus('');
    setCopyError('');
    setRandomCountInput('');
    setToCopyLoading(true);
    try {
      const res = await fetch('/api/admin/complaint-names?sort=newest');
      if (res.status === 401) {
        router.push('/admin/login');
        return;
      }
      const data = await res.json();
      setToCopyEntries(Array.isArray(data.names) ? data.names : []);
    } catch (e) {
      console.error(e);
      setCopyError('Failed to load entries from the database.');
      setToCopyEntries([]);
    } finally {
      setToCopyLoading(false);
    }
  };

  const getValidCopyNames = () => toCopyEntries.map((n) => String(n.child_name ?? '').trim()).filter(Boolean);

  const pickRandomNames = (count: number) => {
    const pool = getValidCopyNames();
    for (let i = pool.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [pool[i], pool[j]] = [pool[j], pool[i]];
    }
    return pool.slice(0, count);
  };

  const handleCopyRandomly = () => {
    setCopyError('');
    setCopyStatus('');
    const total = getValidCopyNames().length;
    if (total === 0) {
      setCopyError('No entries available.');
      return;
    }
    const raw = randomCountInput.trim();
    if (!raw) {
      setCopyError('Please enter how many names to select.');
      return;
    }
    if (!/^\d+$/.test(raw)) {
      setCopyError('Requested count must be a positive whole number.');
      return;
    }
    const count = Number(raw);
    if (count < 1) {
      setCopyError('Requested count must be a positive whole number.');
      return;
    }
    if (count > total) {
      setCopyError(`Requested count cannot exceed available entries (${total}).`);
      return;
    }
    const picked = pickRandomNames(count);
    setSelectedRandomNames(picked);
    setIsEditingNames(false);
    setEditNamesText(formatNamesForCopy(picked));
  };

  const sanitizeCopyName = (name: string) => String(name ?? '').replace(/[^\p{L} ]/gu, '').slice(0, 13).trim();
  const formatNamesForCopy = (names: string[]) => names.map((n) => sanitizeCopyName(n)).filter(Boolean).join('\n');
  const parseEditedNames = (text: string) => text.split('\n').map((line) => sanitizeCopyName(line)).filter(Boolean);

  const handleCopyAllNames = async () => {
    const text = formatNamesForCopy(selectedRandomNames);
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
      const count = text.split('\n').filter(Boolean).length;
      setCopyStatus(`Successfully copied ${count} names!`);
      setCopyError('');
    } catch (e) {
      console.error(e);
      setCopyError('Could not copy to clipboard. Please select the text and copy manually.');
    }
  };

  const handleSelectAgain = () => {
    const total = getValidCopyNames().length;
    const raw = randomCountInput.trim();
    const count = /^\d+$/.test(raw) ? Number(raw) : 0;
    if (count >= 1 && count <= total && total > 0) {
      const picked = pickRandomNames(count);
      setSelectedRandomNames(picked);
      setIsEditingNames(false);
      setEditNamesText(formatNamesForCopy(picked));
      setCopyStatus('');
      setCopyError('');
    } else {
      setSelectedRandomNames([]);
      setIsEditingNames(false);
      setEditNamesText('');
      setCopyError('Enter a valid count, then click COPY RANDOMLY or Select Again.');
    }
  };

  const handleToggleEditNames = () => {
    if (selectedRandomNames.length === 0) return;
    setIsEditingNames((v) => {
      const next = !v;
      if (next) setEditNamesText(formatNamesForCopy(selectedRandomNames));
      return next;
    });
    setCopyStatus('');
    setCopyError('');
  };

  const handleEditNamesChange = (value: string) => {
    // Preserve line breaks while sanitizing each name (max 13 chars, letters/spaces only)
    const sanitized = value
      .split('\n')
      .map((line) => String(line).replace(/[^\p{L} ]/gu, '').replace(/^\s+/, '').slice(0, 13))
      .join('\n');
    setEditNamesText(sanitized);
    setSelectedRandomNames(parseEditedNames(sanitized));
  };

  const handleClearCopiedNames = () => {
    if (!confirm('Clear all selected names from this copy session? This will not delete any database entries.')) return;
    setSelectedRandomNames([]);
    setIsEditingNames(false);
    setEditNamesText('');
    setCopyStatus('');
    setCopyError('');
  };

  // File Upload Handlers (Avatar & Logo)
  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingAvatar(true);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', 'avatar');

    try {
      const res = await fetch('/api/admin/upload', { method: 'POST', body: formData });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Upload failed');
      if (data.url) {
        setAvatarPreview(data.url);
        setSettings((prev) => ({ ...prev, character_hero_url: data.url }));
        setStatusMessage('Avatar updated successfully!');
        setTimeout(() => setStatusMessage(''), 3500);
      }
    } catch (err: any) {
      console.error(err);
      alert(err.message || 'Avatar upload failed. You can paste an image URL below and click "Save All Video & Media Settings".');
    } finally {
      setUploadingAvatar(false);
      e.target.value = '';
    }
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingLogo(true);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', 'logo');

    try {
      const res = await fetch('/api/admin/upload', { method: 'POST', body: formData });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Upload failed');
      if (data.url) {
        setLogoPreview(data.url);
        setSettings((prev) => ({ ...prev, logo_url: data.url }));
        setStatusMessage('Website logo updated successfully!');
        setTimeout(() => setStatusMessage(''), 3500);
      }
    } catch (err: any) {
      console.error(err);
      alert(err.message || 'Logo upload failed. You can paste an image URL below and click "Save All Video & Media Settings".');
    } finally {
      setUploadingLogo(false);
      e.target.value = '';
    }
  };

  // Instagram oEmbed Preview Fetcher
  const handleFetchPreview = async (index: 1 | 2 | 3 | 4) => {
    const url = settings[`reel${index}_url`];
    if (!url) return;

    try {
      const res = await fetch(`/api/admin/instagram-preview?url=${encodeURIComponent(url)}`);
      const data = await res.json();
      if (data.title) {
        setSettings((prev) => ({ ...prev, [`reel${index}_title`]: data.title }));
      }
      if (data.thumbnail_url) {
        setSettings((prev) => ({ ...prev, [`reel${index}_thumbnail`]: data.thumbnail_url }));
        setStatusMessage(`Reel #${index} preview/thumbnail fetched!`);
        setTimeout(() => setStatusMessage(''), 3000);
      } else {
        alert('Could not auto-fetch thumbnail from Instagram. You can upload a thumbnail image or paste a thumbnail URL below, then save settings.');
      }
    } catch (err) {
      console.error(err);
      alert('Preview fetch failed. Upload/paste a thumbnail URL and save settings.');
    }
  };

  const handleThumbnailUpload = async (index: 1 | 2 | 3 | 4, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingThumb(index);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', `thumbnail${index}`);
    try {
      const res = await fetch('/api/admin/upload', { method: 'POST', body: formData });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Upload failed');
      if (data.url) {
        setSettings((prev) => ({ ...prev, [`reel${index}_thumbnail`]: data.url }));
        setStatusMessage(`Reel #${index} thumbnail uploaded! Click "Save All Video & Media Settings" to show it on the home page.`);
        setTimeout(() => setStatusMessage(''), 4000);
      }
    } catch (err: any) {
      console.error(err);
      alert(err.message || 'Thumbnail upload failed. Paste a public thumbnail URL instead and save settings.');
    } finally {
      setUploadingThumb(null);
      e.target.value = '';
    }
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingSettings(true);
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      });
      if (!res.ok) throw new Error('Failed to save settings');
      setSettingsSaved(true);
      setStatusMessage('Settings saved successfully! Your changes will reflect on the website.');
      setTimeout(() => { setSettingsSaved(false); setStatusMessage(''); }, 3500);
    } catch (e: any) {
      console.error(e);
      alert(e?.message || 'Failed to save settings');
    } finally {
      setSavingSettings(false);
    }
  };

  const resetArticleForm = () => {
    setEditingArticle(null);
    setArticleForm({ title_en: '', title_ta: '', slug: '', category: 'Positive Parenting', excerpt_en: '', excerpt_ta: '', content_en: '', content_ta: '', seo_keywords: '', read_time: '5 min read', published: 1 });
  };
  const openCreateArticle = () => { resetArticleForm(); setShowArticleModal(true); };
  const openEditArticle = (art: any) => {
    setEditingArticle(art);
    setArticleForm({
      title_en: art.title_en || '', title_ta: art.title_ta || '', slug: art.slug || '', category: art.category || 'Positive Parenting',
      excerpt_en: art.excerpt_en || '', excerpt_ta: art.excerpt_ta || '', content_en: art.content_en || '', content_ta: art.content_ta || '',
      seo_keywords: art.seo_keywords || '', read_time: art.read_time || '5 min read', published: art.published ?? 1,
    });
    setShowArticleModal(true);
  };
  const handleSaveArticle = async (e: React.FormEvent) => {
    e.preventDefault();
    setArticleSaving(true);
    try {
      const isEdit = !!editingArticle?.id;
      const res = await fetch('/api/admin/articles', {
        method: isEdit ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(isEdit ? { id: editingArticle.id, ...articleForm } : articleForm),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to save article');
      setShowArticleModal(false);
      resetArticleForm();
      await fetchArticles();
      setStatusMessage(isEdit ? 'Article updated successfully!' : 'Article created and published successfully!');
      setTimeout(() => setStatusMessage(''), 3500);
    } catch (err: any) {
      alert(err.message || 'Failed to save article');
    } finally {
      setArticleSaving(false);
    }
  };
  const handleDeleteArticle = async (art: any) => {
    if (!confirm('Are you sure you want to delete this article?')) return;
    try {
      const res = await fetch(`/api/admin/articles?id=${encodeURIComponent(art.id)}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete article');
      await fetchArticles();
      setStatusMessage('Article deleted successfully.');
      setTimeout(() => setStatusMessage(''), 3000);
    } catch (err: any) {
      alert(err.message || 'Failed to delete article');
    }
  };

  const handleLogout = async () => {
    await fetch('/api/admin/logout', { method: 'POST' });
    router.push('/admin/login');
  };

  return (
    <div className="min-h-screen bg-[#0a0418] text-slate-100 flex flex-col">
      {/* Top Admin Bar */}
      <header className="h-16 bg-[#13082b] border-b border-purple-800/50 px-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-xl font-black text-gradient-magic">POOCHANDI VAULT</span>
          <span className="text-[10px] bg-purple-900/60 border border-purple-600/40 text-teal-300 px-2 py-0.5 rounded font-bold">
            POOCHANDI.IN Admin
          </span>
        </div>
        <div className="flex items-center gap-4 text-xs">
          <Link
            href="/en"
            target="_blank"
            className="inline-flex items-center justify-center gap-1.5 min-h-[44px] px-3 text-slate-300 hover:text-white"
          >
            <ExternalLink className="w-4 h-4" />
            <span>View Public Site</span>
          </Link>
          <button
            onClick={handleLogout}
            className="inline-flex items-center justify-center gap-1.5 min-h-[44px] px-4 py-2 rounded-lg bg-red-950/60 border border-red-800/50 text-xs font-bold text-red-300 hover:bg-red-900/60 transition-colors cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </header>

      {/* Main layout */}
      <div className="flex-1 flex flex-col md:flex-row">
        {/* Navigation Sidebar / Mobile Tabs */}
        <aside className="w-full md:w-64 bg-[#0e0620] border-b md:border-b-0 md:border-r border-purple-900/40 p-3 md:p-4">
          <div className="flex md:flex-col gap-2 overflow-x-auto md:overflow-visible pb-1 md:pb-0 -mx-1 px-1 md:mx-0 md:px-0 snap-x">
          <button
            onClick={() => setActiveTab('complaint_names')}
            className={`shrink-0 md:w-full min-h-[44px] flex items-center justify-between gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer snap-start ${
              activeTab === 'complaint_names'
                ? 'bg-purple-700/40 text-teal-300 border border-purple-500/50 shadow'
                : 'text-slate-400 hover:bg-purple-950/40 hover:text-white'
            }`}
          >
            <span className="flex items-center gap-2.5">
              <Users className="w-4 h-4" />
              <span>Complaint Name List</span>
            </span>
            <span className="px-2 py-0.5 rounded-full bg-[#180e38] text-[10px] text-teal-300">
              {complaintNames.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('appearance')}
            className={`shrink-0 md:w-full min-h-[44px] flex items-center justify-between gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer snap-start ${
              activeTab === 'appearance'
                ? 'bg-purple-700/40 text-teal-300 border border-purple-500/50 shadow'
                : 'text-slate-400 hover:bg-purple-950/40 hover:text-white'
            }`}
          >
            <span className="flex items-center gap-2.5">
              <ImageIcon className="w-4 h-4" />
              <span>Appearance & Media</span>
            </span>
          </button>

          <button
            onClick={() => setActiveTab('articles')}
            className={`shrink-0 md:w-full min-h-[44px] flex items-center justify-between gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer snap-start ${
              activeTab === 'articles'
                ? 'bg-purple-700/40 text-teal-300 border border-purple-500/50 shadow'
                : 'text-slate-400 hover:bg-purple-950/40 hover:text-white'
            }`}
          >
            <span className="flex items-center gap-2.5">
              <FileText className="w-4 h-4" />
              <span>Manage Parenting Articles / கட்டுரைகள் மேலாண்மை</span>
            </span>
            <span className="px-2 py-0.5 rounded-full bg-[#180e38] text-[10px] text-teal-300">
              {articles.length}
            </span>
          </button>

          </div>
          <div className="hidden md:block pt-8 px-2 text-[11px] text-slate-500 space-y-1">
            <p>Zero Public Database APIs</p>
            <p>Private Admin Verification</p>
            <p>Official Instagram: @poochandi.in</p>
          </div>
        </aside>

        {/* Dynamic Content Pane */}
        <main className="flex-1 p-6 md:p-8 overflow-y-auto">
          
          {/* TAB 1: COMPLAINT NAME LIST MANAGEMENT */}
          {activeTab === 'complaint_names' && (
            <div className="space-y-6">
              {/* NAME ENTRY CONTROL */}
              <div className="p-5 sm:p-6 rounded-3xl bg-[#140b2e] border border-purple-800/40 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                  <div>
                    <h3 className="text-base sm:text-lg font-black text-white">NAME ENTRY CONTROL</h3>
                    <p className="text-xs text-slate-400 mt-1">Globally stop or resume new Complaint Name List submissions from the Admin Panel.</p>
                  </div>
                  <div className={`inline-flex items-center gap-2 px-3 py-2 rounded-xl border text-xs font-black ${nameEntryStatus === 'stopped' ? 'bg-red-950/50 border-red-700/50 text-red-300' : 'bg-emerald-950/50 border-emerald-700/50 text-emerald-300'}`}>
                    <span className={`w-2.5 h-2.5 rounded-full ${nameEntryStatus === 'stopped' ? 'bg-red-400' : 'bg-emerald-400'}`} />
                    <span>Name Entry: {nameEntryStatusLoading ? '...' : (nameEntryStatus === 'stopped' ? 'STOPPED' : 'ACTIVE')}</span>
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row gap-3">
                  <button
                    type="button"
                    onClick={() => handleSetNameEntryStatus('stopped')}
                    disabled={nameEntryStatusLoading || nameEntryStatusSaving || nameEntryStatus === 'stopped'}
                    className="inline-flex items-center justify-center min-h-[44px] px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs shadow-md transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    STOP NAME ENTRY
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSetNameEntryStatus('active')}
                    disabled={nameEntryStatusLoading || nameEntryStatusSaving || nameEntryStatus === 'active'}
                    className="inline-flex items-center justify-center min-h-[44px] px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    RESUME NAME ENTRY
                  </button>
                </div>
                <p className="text-[11px] text-slate-500">When stopped, the entry form is hidden globally (including direct URLs/old tabs) and backend submissions are rejected. Existing database entries remain unchanged.</p>
              </div>

              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <h2 className="text-2xl font-black text-white">Complaint Name List Management</h2>
                  <p className="text-xs text-slate-400">
                    Live database records of child names and ages submitted by parents.
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  {selectedIds.length > 0 && (
                    <button
                      onClick={handleDeleteMultiple}
                      className="inline-flex items-center justify-center gap-1.5 min-h-[44px] px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs shadow-md transition-all cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                      <span>Delete ({selectedIds.length})</span>
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={openToCopyModal}
                    className="inline-flex items-center justify-center gap-1.5 min-h-[44px] px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs shadow-md transition-all cursor-pointer"
                  >
                    <Copy className="w-4 h-4" />
                    <span>TO COPY</span>
                  </button>
                  <a
                    href="/api/admin/complaint-names?export=csv"
                    className="inline-flex items-center justify-center gap-1.5 min-h-[44px] px-4 py-2.5 rounded-xl bg-teal-500 hover:bg-teal-600 text-slate-950 font-bold text-xs shadow-md transition-all"
                  >
                    <Download className="w-4 h-4" />
                    <span>Export to CSV</span>
                  </a>
                </div>
              </div>

              {/* Search and Sort Filter Bar */}
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="flex gap-2 flex-1 max-w-md">
                  <input
                    type="text"
                    placeholder="Search by child name or ID..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full min-h-[44px] px-4 py-2.5 rounded-xl bg-[#140b2e] border border-purple-800/60 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-teal-400"
                  />
                  <button
                    onClick={fetchComplaintNames}
                    className="min-h-[44px] px-4 py-2.5 rounded-xl bg-purple-900/60 border border-purple-700/50 text-xs font-bold text-purple-200 cursor-pointer"
                  >
                    Filter
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-400">Sort:</span>
                  <select
                    value={sortOrder}
                    onChange={(e) => setSortOrder(e.target.value as any)}
                    className="min-h-[44px] px-3 py-2 rounded-xl bg-[#140b2e] border border-purple-800/60 text-xs text-white"
                  >
                    <option value="newest">Newest First</option>
                    <option value="oldest">Oldest First</option>
                  </select>
                </div>
              </div>

              {/* Submissions: stackable cards on mobile, table on md+ */}
              <div className="md:hidden space-y-3">
                {complaintNames.length > 0 && (
                  <label className="flex items-center gap-3 min-h-[44px] px-4 rounded-2xl border border-purple-800/40 bg-[#12082b] text-xs text-slate-300">
                    <input
                      type="checkbox"
                      checked={selectedIds.length === complaintNames.length}
                      onChange={toggleSelectAll}
                      className="h-5 w-5"
                    />
                    <span className="font-semibold">Select all ({complaintNames.length})</span>
                  </label>
                )}
                {complaintNames.length === 0 ? (
                  <div className="rounded-2xl border border-purple-800/40 bg-[#12082b] px-4 py-8 text-center text-sm text-slate-500">
                    {loadingNames ? 'Loading child names...' : 'No entries found in Complaint Name List.'}
                  </div>
                ) : (
                  complaintNames.map((n, index) => (
                    <div key={n.id} className="rounded-2xl border border-purple-800/40 bg-[#12082b] p-4 space-y-3">
                      <div className="flex items-start justify-between gap-3">
                        <label className="flex items-start gap-3 min-h-[44px] flex-1 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={selectedIds.includes(n.id)}
                            onChange={() => toggleSelectOne(n.id)}
                            className="mt-1 h-5 w-5 shrink-0"
                          />
                          <div className="min-w-0">
                            <p className="text-[11px] text-slate-500 font-semibold">#{index + 1} · <span className="font-mono text-teal-400">{n.id}</span></p>
                            <p className="font-bold text-white text-base break-words">{n.child_name}</p>
                          </div>
                        </label>
                        <button
                          onClick={() => handleDeleteSingle(n.id)}
                          className="inline-flex items-center justify-center min-h-[44px] min-w-[44px] rounded-xl text-red-300 bg-red-950/50 border border-red-800/40 hover:bg-red-950/80 transition-colors cursor-pointer shrink-0"
                          title="Delete entry"
                          aria-label={`Delete ${n.child_name}`}
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div className="rounded-xl bg-[#0d0522] border border-purple-900/40 px-3 py-2"><span className="text-slate-500 block">Age</span><span className="text-white font-semibold">{n.child_age} Years</span></div>
                        <div className="rounded-xl bg-[#0d0522] border border-purple-900/40 px-3 py-2 col-span-2 sm:col-span-1"><span className="text-slate-500 block">Submitted</span><span className="text-slate-300">{new Date(n.created_at).toLocaleString()}</span></div>
                      </div>
                    </div>
                  ))
                )}
              </div>

              <div className="hidden md:block overflow-x-auto rounded-2xl border border-purple-800/40 bg-[#12082b]">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#180e38] text-slate-400 uppercase text-[10px] tracking-wider">
                    <tr>
                      <th className="px-4 py-3 w-8">
                        <input
                          type="checkbox"
                          checked={complaintNames.length > 0 && selectedIds.length === complaintNames.length}
                          onChange={toggleSelectAll}
                          className="h-4 w-4"
                        />
                      </th>
                      <th className="px-4 py-3 w-14">S.No</th>
                      <th className="px-4 py-3">Entry ID</th>
                      <th className="px-4 py-3">Child Name</th>
                      <th className="px-4 py-3">Child Age</th>
                      <th className="px-4 py-3">Submission Date & Time</th>
                      <th className="px-4 py-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-purple-900/40 text-slate-300">
                    {complaintNames.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="px-4 py-8 text-center text-slate-500">
                          {loadingNames ? 'Loading child names...' : 'No entries found in Complaint Name List.'}
                        </td>
                      </tr>
                    ) : (
                      complaintNames.map((n, index) => (
                        <tr key={n.id} className="hover:bg-purple-950/30 transition-colors">
                          <td className="px-4 py-3">
                            <input
                              type="checkbox"
                              checked={selectedIds.includes(n.id)}
                              onChange={() => toggleSelectOne(n.id)}
                              className="h-4 w-4"
                            />
                          </td>
                          <td className="px-4 py-3 text-slate-400 font-semibold">{index + 1}</td>
                          <td className="px-4 py-3 font-mono font-bold text-teal-400">{n.id}</td>
                          <td className="px-4 py-3 font-bold text-white">{n.child_name}</td>
                          <td className="px-4 py-3">{n.child_age} Years</td>
                          <td className="px-4 py-3 text-slate-400 whitespace-nowrap">
                            {new Date(n.created_at).toLocaleString()}
                          </td>
                          <td className="px-4 py-3 text-right">
                            <button
                              onClick={() => handleDeleteSingle(n.id)}
                              className="inline-flex items-center justify-center min-h-[44px] min-w-[44px] rounded-lg text-red-400 hover:bg-red-950/80 transition-colors cursor-pointer"
                              title="Delete entry"
                              aria-label={`Delete ${n.child_name}`}
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 2: WEBSITE APPEARANCE & MEDIA MANAGEMENT */}
          {activeTab === 'appearance' && (
            <div className="space-y-8 max-w-4xl">
              <div>
                <h2 className="text-2xl font-black text-white">Website Appearance & Media Management</h2>
                <p className="text-xs text-slate-400">
                  Dynamically upload character artwork, logo, and manage your 4 featured Instagram Reels with previews.
                </p>
              </div>

              {(settingsSaved || statusMessage) && (
                <div className="p-4 rounded-xl bg-emerald-950/70 border border-emerald-500/50 text-emerald-300 text-xs flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{statusMessage || 'Media & settings successfully saved and updated across the live website!'}</span>
                </div>
              )}

              {/* A. OFFICIAL POOCHANDI CHARACTER AVATAR */}
              <div className="p-6 rounded-3xl bg-[#140b2e] border border-purple-800/40 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-base font-bold text-white flex items-center gap-2">
                      <ImageIcon className="w-4 h-4 text-teal-400" />
                      <span>Official Poochandi Character (Hero Section)</span>
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Upload your PNG, JPG, or WebP character illustration. Updates the homepage hero instantly.
                    </p>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-6 pt-2">
                  <div className="relative w-32 h-32 rounded-2xl bg-[#0c051f] border border-purple-700/50 p-2 flex items-center justify-center overflow-hidden shrink-0">
                    {(settings.character_hero_url || avatarPreview) ? (
                      <Image src={settings.character_hero_url || avatarPreview} alt="Hero Character Preview" fill sizes="128px" className="object-contain p-2" />
                    ) : (
                      <span className="text-xs text-slate-500">No Image</span>
                    )}
                  </div>
                  <div className="space-y-3 w-full">
                    <label className="inline-flex items-center justify-center gap-2 min-h-[44px] px-4 py-2.5 rounded-xl bg-purple-900/60 hover:bg-purple-800/60 border border-purple-600/40 text-teal-300 text-xs font-bold cursor-pointer transition-all">
                      <Upload className="w-4 h-4" />
                      <span>{uploadingAvatar ? 'Uploading...' : 'Upload Official Poochandi Character'}</span>
                      <input type="file" accept="image/png, image/jpeg, image/webp" className="hidden" onChange={handleAvatarUpload} />
                    </label>
                    <div>
                      <label className="block text-[11px] text-slate-400 mb-1">Or paste image URL (works on Vercel), then save settings below</label>
                      <input
                        type="text"
                        value={settings.character_hero_url || ''}
                        onChange={(e) => { const v = e.target.value; setSettings((p) => ({ ...p, character_hero_url: v })); setAvatarPreview(v); }}
                        placeholder="https://.../poochandi-character.png"
                        className="w-full px-3 py-2 rounded-xl bg-[#140b2e] border border-purple-800 text-white text-xs"
                      />
                    </div>
                    <p className="text-[11px] text-slate-500">Supports PNG/WebP/JPG. On Vercel, file upload needs Blob storage; URL always works.</p>
                  </div>
                </div>
              </div>

              {/* B. WEBSITE LOGO */}
              <div className="p-6 rounded-3xl bg-[#140b2e] border border-purple-800/40 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-base font-bold text-white flex items-center gap-2">
                      <ImageIcon className="w-4 h-4 text-teal-400" />
                      <span>Upload Website Logo</span>
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Upload PNG or SVG logo. Automatically reflects across header and footer.
                    </p>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-6 pt-2">
                  <div className="relative w-48 h-20 rounded-2xl bg-[#0c051f] border border-purple-700/50 p-2 flex items-center justify-center overflow-hidden shrink-0">
                    {(settings.logo_url || logoPreview) ? (
                      <Image src={settings.logo_url || logoPreview} alt="Logo Preview" fill sizes="192px" className="object-contain p-2" />
                    ) : (
                      <span className="text-xs text-slate-500">No Logo</span>
                    )}
                  </div>
                  <div className="space-y-3 w-full">
                    <label className="inline-flex items-center justify-center gap-2 min-h-[44px] px-4 py-2.5 rounded-xl bg-purple-900/60 hover:bg-purple-800/60 border border-purple-600/40 text-teal-300 text-xs font-bold cursor-pointer transition-all">
                      <Upload className="w-4 h-4" />
                      <span>{uploadingLogo ? 'Uploading...' : 'Upload Website Logo'}</span>
                      <input type="file" accept="image/png, image/svg+xml" className="hidden" onChange={handleLogoUpload} />
                    </label>
                    <div>
                      <label className="block text-[11px] text-slate-400 mb-1">Or paste logo URL, then save settings below</label>
                      <input type="text" value={settings.logo_url || ''} onChange={(e) => { const v = e.target.value; setSettings((p) => ({ ...p, logo_url: v })); setLogoPreview(v); }} placeholder="https://.../logo.png" className="w-full px-3 py-2 rounded-xl bg-[#140b2e] border border-purple-800 text-white text-xs" />
                    </div>
                    <p className="text-[11px] text-slate-500">Recommended: transparent PNG or SVG.</p>
                  </div>
                </div>
              </div>

              {/* C. MANAGE FEATURED INSTAGRAM REELS (EXACTLY 4 REELS) */}
              <form onSubmit={handleSaveSettings} className="space-y-6">
                <div className="p-6 rounded-3xl bg-[#140b2e] border border-purple-800/40 space-y-6">
                  <div className="flex items-center justify-between border-b border-purple-900/50 pb-4">
                    <div>
                      <h3 className="text-base font-bold text-white flex items-center gap-2">
                        <Video className="w-4 h-4 text-orange-400" />
                        <span>Manage Featured Instagram Reels (4 Videos)</span>
                      </h3>
                      <p className="text-xs text-slate-400 mt-0.5">
                        Profile: <strong>@poochandi.in</strong>. Paste Reel URLs and click &apos;Preview&apos; to fetch metadata.
                      </p>
                    </div>
                  </div>

                  {([1, 2, 3, 4] as const).map((idx) => (
                    <div key={idx} className="p-5 rounded-2xl bg-[#0d0522] border border-purple-900/40 space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-black text-teal-300 uppercase tracking-wider">
                          Featured Reel #{idx}
                        </span>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => handleFetchPreview(idx)}
                            className="inline-flex items-center justify-center gap-1 min-h-[44px] px-3 py-2 rounded-lg bg-purple-900/60 text-purple-200 hover:text-white text-xs font-bold cursor-pointer"
                          >
                            <Eye className="w-4 h-4" />
                            <span>Preview</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setSettings((prev) => ({
                                ...prev,
                                [`reel${idx}_title`]: '',
                                [`reel${idx}_url`]: '',
                                [`reel${idx}_desc`]: '',
                                [`reel${idx}_thumbnail`]: '',
                              }));
                            }}
                            className="inline-flex items-center justify-center min-h-[44px] px-3 rounded-lg text-red-400 hover:text-red-300 hover:bg-red-950/30 text-xs font-semibold cursor-pointer"
                          >
                            Remove
                          </button>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                        <div>
                          <label className="block text-slate-300 font-semibold mb-1">Instagram Reel URL</label>
                          <input
                            type="text"
                            placeholder="https://www.instagram.com/reel/..."
                            value={settings[`reel${idx}_url`] || ''}
                            onChange={(e) =>
                              setSettings({ ...settings, [`reel${idx}_url`]: e.target.value })
                            }
                            className="w-full min-h-[44px] px-3 py-2 rounded-xl bg-[#140b2e] border border-purple-800 text-white"
                          />
                        </div>
                        <div>
                          <label className="block text-slate-300 font-semibold mb-1">Reel Title</label>
                          <input
                            type="text"
                            placeholder="e.g. When Kids Refuse to Eat Veggies!"
                            value={settings[`reel${idx}_title`] || ''}
                            onChange={(e) =>
                              setSettings({ ...settings, [`reel${idx}_title`]: e.target.value })
                            }
                            className="w-full min-h-[44px] px-3 py-2 rounded-xl bg-[#140b2e] border border-purple-800 text-white"
                          />
                        </div>
                      </div>

                      <div className="text-xs">
                        <label className="block text-slate-300 font-semibold mb-1">Short Description</label>
                        <input
                          type="text"
                          placeholder="Short description displayed on the card..."
                          value={settings[`reel${idx}_desc`] || ''}
                          onChange={(e) =>
                            setSettings({ ...settings, [`reel${idx}_desc`]: e.target.value })
                          }
                          className="w-full px-3 py-2 rounded-xl bg-[#140b2e] border border-purple-800 text-white"
                        />
                      </div>

                      <div className="text-xs border-t border-purple-900/30 pt-4">
                        <label className="block text-slate-300 font-semibold mb-2">Thumbnail / Video Preview Image (shown on home page)</label>
                        <div className="flex flex-col sm:flex-row gap-4 items-start">
                          <div className="relative w-28 h-20 rounded-xl bg-[#140b2e] border border-purple-800/60 overflow-hidden flex items-center justify-center shrink-0">
                            {settings[`reel${idx}_thumbnail`] ? (
                              <Image src={settings[`reel${idx}_thumbnail`]} alt={`Reel ${idx} thumbnail`} fill sizes="112px" className="object-cover" />
                            ) : (
                              <span className="text-[10px] text-slate-500 px-2 text-center">No preview</span>
                            )}
                          </div>
                          <div className="flex-1 space-y-2 w-full">
                            <label className="inline-flex items-center justify-center gap-2 min-h-[44px] px-4 py-2 rounded-lg bg-purple-900/50 hover:bg-purple-800/50 border border-purple-700/40 text-teal-300 font-bold cursor-pointer">
                              <Upload className="w-4 h-4" />
                              <span>{uploadingThumb === idx ? 'Uploading...' : 'Upload Thumbnail'}</span>
                              <input type="file" accept="image/*" className="hidden" onChange={(e) => handleThumbnailUpload(idx, e)} />
                            </label>
                            <input
                              type="text"
                              placeholder="Or paste thumbnail/video preview image URL (Cloudinary, Imgur, etc.)"
                              value={settings[`reel${idx}_thumbnail`] || ''}
                              onChange={(e) => setSettings({ ...settings, [`reel${idx}_thumbnail`]: e.target.value })}
                              className="w-full min-h-[44px] px-3 py-2 rounded-xl bg-[#140b2e] border border-purple-800 text-white"
                            />
                            <p className="text-[10px] text-slate-500">If Instagram preview doesnâ€™t fetch, upload the videoâ€™s cover image to cloud storage and paste its URL here. Keep Instagram link + title above. Then click <strong>Save All Video & Media Settings</strong>.</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}

                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={savingSettings}
                      className="px-8 py-3.5 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 text-slate-950 font-black text-xs flex items-center gap-2 cursor-pointer transition-all shadow-md"
                    >
                      <Save className="w-4 h-4" />
                      <span>{savingSettings ? 'Saving...' : 'Save All Video & Media Settings'}</span>
                    </button>
                  </div>
                </div>
              </form>
            </div>
          )}

          {/* TAB 3: ARTICLES CMS */}
          {activeTab === 'articles' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <h2 className="text-2xl font-black text-white">Manage Parenting Articles / கட்டுரைகள் மேலாண்மை</h2>
                  <p className="text-xs text-slate-400">Create, edit, and delete bilingual parenting guides. Changes publish to the live website.</p>
                </div>
                <button onClick={openCreateArticle} className="inline-flex items-center justify-center gap-1.5 min-h-[44px] px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#FACC15] to-amber-500 text-slate-950 font-bold text-xs shadow-md cursor-pointer">
                  <Plus className="w-4 h-4" /><span>+ Create New</span>
                </button>
              </div>
              {statusMessage && <div className="p-3 rounded-xl bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 text-xs font-semibold">{statusMessage}</div>}
              <div className="md:hidden space-y-3">
                {articles.length === 0 ? (
                  <div className="rounded-2xl border border-slate-800 bg-[#181A20] px-4 py-8 text-center text-sm text-slate-500">No articles found.</div>
                ) : articles.map((art) => (
                  <article key={art.id} className="rounded-2xl border border-slate-800 bg-[#181A20] p-4 space-y-3">
                    <div>
                      <div className="font-bold text-white break-words">{art.title_en}</div>
                      <div className="text-purple-300 mt-0.5 break-words">{art.title_ta}</div>
                    </div>
                    <div className="flex flex-wrap gap-2 text-xs">
                      <span className="px-2 py-1 rounded bg-[#0D0E12] border border-slate-700 text-[#FACC15] font-semibold">{art.category}</span>
                      <span className="font-mono text-[11px] text-slate-400 break-all">/{art.slug}</span>
                    </div>
                    <div className="grid grid-cols-3 gap-2 pt-1">
                      <Link href={`/en/parenting-guides/${art.slug}`} target="_blank" className="inline-flex items-center justify-center min-h-[44px] px-2 rounded-lg border border-slate-700 text-teal-300 hover:bg-slate-800 text-xs font-semibold">Preview</Link>
                      <button type="button" onClick={() => openEditArticle(art)} className="inline-flex items-center justify-center gap-1 min-h-[44px] px-2 rounded-lg bg-slate-700 hover:bg-slate-600 text-white cursor-pointer text-xs font-semibold"><Pencil className="w-4 h-4" />Edit</button>
                      <button type="button" onClick={() => handleDeleteArticle(art)} className="inline-flex items-center justify-center gap-1 min-h-[44px] px-2 rounded-lg bg-red-600 hover:bg-red-700 text-white cursor-pointer text-xs font-semibold"><Trash2 className="w-4 h-4" />Delete</button>
                    </div>
                  </article>
                ))}
              </div>
              <div className="hidden md:block overflow-x-auto rounded-2xl border border-slate-800 bg-[#181A20]">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#0D0E12] text-slate-400 uppercase text-[10px] tracking-wider">
                    <tr><th className="px-4 py-3">Title (EN / TA)</th><th className="px-4 py-3">Category</th><th className="px-4 py-3">Slug</th><th className="px-4 py-3 text-right">Actions</th></tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/80 text-slate-300">
                    {articles.length === 0 ? (
                      <tr><td colSpan={4} className="px-4 py-8 text-center text-slate-500">No articles found.</td></tr>
                    ) : articles.map((art) => (
                      <tr key={art.id} className="hover:bg-[#0D0E12]/60">
                        <td className="px-4 py-3"><div className="font-bold text-white">{art.title_en}</div><div className="text-purple-300 mt-0.5">{art.title_ta}</div></td>
                        <td className="px-4 py-3"><span className="px-2 py-0.5 rounded bg-[#0D0E12] border border-slate-700 text-[#FACC15] font-semibold">{art.category}</span></td>
                        <td className="px-4 py-3 font-mono text-[11px] text-slate-400">/{art.slug}</td>
                        <td className="px-4 py-3">
                          <div className="flex justify-end gap-2">
                            <Link href={`/en/parenting-guides/${art.slug}`} target="_blank" className="inline-flex items-center justify-center min-h-[44px] px-3 rounded-lg border border-slate-700 text-teal-300 hover:bg-slate-800">Preview</Link>
                            <button type="button" onClick={() => openEditArticle(art)} className="inline-flex items-center justify-center gap-1 min-h-[44px] px-3 rounded-lg bg-slate-700 hover:bg-slate-600 text-white cursor-pointer"><Pencil className="w-3.5 h-3.5" />Edit</button>
                            <button type="button" onClick={() => handleDeleteArticle(art)} className="inline-flex items-center justify-center gap-1 min-h-[44px] px-3 rounded-lg bg-red-600 hover:bg-red-700 text-white cursor-pointer"><Trash2 className="w-3.5 h-3.5" />Delete</button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Article Create/Edit Modal */}
          {showArticleModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm" onClick={() => setShowArticleModal(false)}>
              <div className="w-full max-w-4xl max-h-[92vh] overflow-y-auto rounded-3xl bg-[#181A20] border border-slate-700 shadow-2xl p-5 sm:p-6" onClick={(e) => e.stopPropagation()}>
                <div className="flex items-start justify-between gap-3 mb-5">
                  <div>
                    <h3 className="text-xl font-black text-white">{editingArticle ? 'Edit Article' : 'Add New Article'}</h3>
                    <p className="text-xs text-slate-400 mt-1">Bilingual parenting guide — English & Tamil</p>
                  </div>
                  <button type="button" onClick={() => setShowArticleModal(false)} className="inline-flex items-center justify-center min-h-[44px] min-w-[44px] rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer" aria-label="Close"><X className="w-5 h-5" /></button>
                </div>
                <form onSubmit={handleSaveArticle} className="space-y-4 text-sm">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div><label className="block text-slate-300 font-semibold mb-1">English Title</label><input required value={articleForm.title_en} onChange={(e)=>setArticleForm({...articleForm,title_en:e.target.value})} className="w-full min-h-[44px] px-3 py-2.5 rounded-xl bg-[#0D0E12] border border-slate-700 text-white" /></div>
                    <div><label className="block text-slate-300 font-semibold mb-1">Tamil Title</label><input required value={articleForm.title_ta} onChange={(e)=>setArticleForm({...articleForm,title_ta:e.target.value})} className="w-full min-h-[44px] px-3 py-2.5 rounded-xl bg-[#0D0E12] border border-slate-700 text-white" /></div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div><label className="block text-slate-300 font-semibold mb-1">Slug (optional)</label><input value={articleForm.slug} onChange={(e)=>setArticleForm({...articleForm,slug:e.target.value})} placeholder="auto-from English title" className="w-full min-h-[44px] px-3 py-2.5 rounded-xl bg-[#0D0E12] border border-slate-700 text-white" /></div>
                    <div><label className="block text-slate-300 font-semibold mb-1">Category</label><input value={articleForm.category} onChange={(e)=>setArticleForm({...articleForm,category:e.target.value})} className="w-full min-h-[44px] px-3 py-2.5 rounded-xl bg-[#0D0E12] border border-slate-700 text-white" /></div>
                    <div><label className="block text-slate-300 font-semibold mb-1">Read Time</label><input value={articleForm.read_time} onChange={(e)=>setArticleForm({...articleForm,read_time:e.target.value})} className="w-full min-h-[44px] px-3 py-2.5 rounded-xl bg-[#0D0E12] border border-slate-700 text-white" /></div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div><label className="block text-slate-300 font-semibold mb-1">English Overview (1–2 lines)</label><textarea required rows={2} value={articleForm.excerpt_en} onChange={(e)=>setArticleForm({...articleForm,excerpt_en:e.target.value})} className="w-full min-h-[44px] px-3 py-2.5 rounded-xl bg-[#0D0E12] border border-slate-700 text-white" /></div>
                    <div><label className="block text-slate-300 font-semibold mb-1">Tamil Overview (1–2 lines)</label><textarea required rows={2} value={articleForm.excerpt_ta} onChange={(e)=>setArticleForm({...articleForm,excerpt_ta:e.target.value})} className="w-full min-h-[44px] px-3 py-2.5 rounded-xl bg-[#0D0E12] border border-slate-700 text-white" /></div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div><label className="block text-slate-300 font-semibold mb-1">English Main Content (multi-line)</label><textarea required rows={10} value={articleForm.content_en} onChange={(e)=>setArticleForm({...articleForm,content_en:e.target.value})} className="w-full px-3 py-2.5 rounded-xl bg-[#0D0E12] border border-slate-700 text-white font-mono text-xs" /></div>
                    <div><label className="block text-slate-300 font-semibold mb-1">Tamil Main Content (multi-line)</label><textarea required rows={10} value={articleForm.content_ta} onChange={(e)=>setArticleForm({...articleForm,content_ta:e.target.value})} className="w-full px-3 py-2.5 rounded-xl bg-[#0D0E12] border border-slate-700 text-white font-mono text-xs" /></div>
                  </div>
                  <div><label className="block text-slate-300 font-semibold mb-1">SEO Target Keywords (comma separated)</label><input value={articleForm.seo_keywords} onChange={(e)=>setArticleForm({...articleForm,seo_keywords:e.target.value})} placeholder="keyword 1, keyword 2" className="w-full min-h-[44px] px-3 py-2.5 rounded-xl bg-[#0D0E12] border border-slate-700 text-white" /></div>
                  <div className="flex flex-col sm:flex-row gap-3 pt-2">
                    <button type="submit" disabled={articleSaving} className="flex-1 min-h-[44px] px-5 py-3 rounded-xl bg-gradient-to-r from-[#FACC15] to-amber-500 text-slate-950 font-black cursor-pointer disabled:opacity-60">{articleSaving ? 'Saving...' : (editingArticle ? 'Save Changes' : 'Publish / Save')}</button>
                    <button type="button" onClick={() => setShowArticleModal(false)} className="min-h-[44px] px-5 py-3 rounded-xl border border-slate-600 text-slate-200 font-bold cursor-pointer">Cancel</button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* TO COPY / Random Select Modal */}
          {showToCopyModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm" onClick={() => setShowToCopyModal(false)}>
              <div className="w-full max-w-xl max-h-[90vh] overflow-y-auto rounded-3xl bg-[#12082b] border border-purple-700/50 shadow-2xl p-5 sm:p-6" onClick={(e) => e.stopPropagation()}>
                <div className="flex items-start justify-between gap-3 mb-4">
                  <div>
                    <h3 className="text-xl font-black text-white">Randomly Select Names</h3>
                    <p className="text-xs text-slate-400 mt-1">Select random child names from the actual Complaint Name List database.</p>
                  </div>
                  <button type="button" onClick={() => setShowToCopyModal(false)} className="inline-flex items-center justify-center min-h-[44px] min-w-[44px] rounded-lg text-slate-400 hover:text-white hover:bg-purple-900/40 cursor-pointer" aria-label="Close">
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {toCopyLoading ? (
                  <p className="text-sm text-slate-400 py-6 text-center">Loading entries...</p>
                ) : (
                  <>
                    <div className="p-4 rounded-2xl bg-[#0d0522] border border-purple-900/40 space-y-3">
                      <div className="text-sm text-slate-200 flex flex-wrap items-center gap-2">
                        <span>Randomly Select</span>
                        <input
                          type="number"
                          min={1}
                          max={Math.max(1, toCopyEntries.length)}
                          value={randomCountInput}
                          onChange={(e) => setRandomCountInput(e.target.value)}
                          placeholder=""
                          className="w-24 min-h-[44px] px-2 py-2 rounded-lg bg-[#140b2e] border border-purple-700 text-white text-center font-bold"
                        />
                        <span>of <strong className="text-teal-300">{toCopyEntries.map((n) => String(n.child_name ?? '').trim()).filter(Boolean).length}</strong> Entries</span>
                      </div>
                      {toCopyEntries.map((n) => String(n.child_name ?? '').trim()).filter(Boolean).length === 0 && <p className="text-xs text-amber-300">No entries available.</p>}
                      {copyError && <p className="text-xs text-red-300">{copyError}</p>}
                      <button
                        type="button"
                        onClick={handleCopyRandomly}
                        disabled={toCopyEntries.length === 0}
                        className="w-full sm:w-auto min-h-[44px] px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 text-slate-950 font-black text-xs cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        COPY RANDOMLY
                      </button>
                    </div>

                    {selectedRandomNames.length > 0 && (
                      <div className="mt-5 p-4 rounded-2xl bg-[#0d0522] border border-teal-700/30 space-y-3">
                        <div className="flex items-center justify-between gap-2">
                          <h4 className="text-sm font-black text-teal-300">Your Selected Names — Ready to Copy</h4>
                          {isEditingNames && <span className="text-[10px] font-bold text-amber-300 bg-amber-500/10 border border-amber-500/30 px-2 py-0.5 rounded">Editing</span>}
                        </div>
                        <textarea
                          readOnly={!isEditingNames}
                          value={isEditingNames ? editNamesText : formatNamesForCopy(selectedRandomNames)}
                          onChange={(e) => handleEditNamesChange(e.target.value)}
                          className={`w-full min-h-[180px] px-3 py-3 rounded-xl border text-white text-sm leading-6 whitespace-pre-line resize-y ${isEditingNames ? 'bg-[#140b2e] border-amber-500/60 focus:outline-none focus:border-amber-400' : 'bg-[#140b2e] border-purple-800'}`}
                          aria-label="Selected names"
                        />
                        <p className="text-[11px] text-slate-500">
                          {isEditingNames
                            ? 'Edit names (one per line). Max 13 characters each; letters and spaces only. No serial numbers or ages. Edits apply only to this copy session.'
                            : 'Names only, one per line. No serial numbers, ages, dates, or IDs.'}
                        </p>
                        {copyStatus && (
                          <div className="p-3 rounded-xl bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 text-xs font-semibold">
                            {copyStatus}
                          </div>
                        )}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          <button
                            type="button"
                            onClick={handleToggleEditNames}
                            className={`inline-flex items-center justify-center gap-2 min-h-[44px] px-4 py-3 rounded-xl font-bold text-sm cursor-pointer border ${isEditingNames ? 'bg-amber-500 text-slate-950 border-amber-400' : 'bg-purple-900/60 hover:bg-purple-800/60 border-purple-700/50 text-purple-100'}`}
                          >
                            <Pencil className="w-4 h-4" />
                            {isEditingNames ? 'DONE EDITING' : 'EDIT NAMES'}
                          </button>
                          <button
                            type="button"
                            onClick={handleCopyAllNames}
                            className="inline-flex items-center justify-center gap-2 min-h-[44px] px-4 py-3 rounded-xl bg-teal-500 hover:bg-teal-600 text-slate-950 font-black text-sm cursor-pointer"
                          >
                            <Copy className="w-4 h-4" />
                            COPY ALL NAMES
                          </button>
                          <button
                            type="button"
                            onClick={handleClearCopiedNames}
                            className="inline-flex items-center justify-center gap-2 min-h-[44px] px-4 py-3 rounded-xl bg-red-950/60 hover:bg-red-900/60 border border-red-800/50 text-red-200 font-bold text-sm cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4" />
                            CLEAR COPIED NAMES
                          </button>
                          <button
                            type="button"
                            onClick={handleSelectAgain}
                            className="inline-flex items-center justify-center gap-2 min-h-[44px] px-4 py-3 rounded-xl bg-purple-900/60 hover:bg-purple-800/60 border border-purple-700/50 text-purple-100 font-bold text-sm cursor-pointer"
                          >
                            <RefreshCw className="w-4 h-4" />
                            Select Again
                          </button>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          )}

        </main>
      </div>
    </div>
  );
}

