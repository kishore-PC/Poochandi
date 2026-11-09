'use client';

import React, { useState, useEffect } from 'react';
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

  // Articles CMS state
  const [articles, setArticles] = useState<any[]>([]);
  const [showNewArticleModal, setShowNewArticleModal] = useState(false);
  const [newTitleEn, setNewTitleEn] = useState('');
  const [newTitleTa, setNewTitleTa] = useState('');
  const [newCategory, setNewCategory] = useState('Positive Parenting');
  const [newExcerptEn, setNewExcerptEn] = useState('');
  const [newExcerptTa, setNewExcerptTa] = useState('');
  const [newContentEn, setNewContentEn] = useState('');
  const [newContentTa, setNewContentTa] = useState('');

  // Appearance & Media Management state
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [avatarPreview, setAvatarPreview] = useState<string>('');
  const [logoPreview, setLogoPreview] = useState<string>('');
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [savingSettings, setSavingSettings] = useState(false);
  const [settingsSaved, setSettingsSaved] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');

  useEffect(() => {
    fetchComplaintNames();
    fetchArticles();
    fetchSettings();
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
      }
      alert('Instagram Reel preview fetched successfully!');
    } catch (err) {
      console.error(err);
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
            Buzz Creations Admin
          </span>
        </div>
        <div className="flex items-center gap-4 text-xs">
          <Link
            href="/en"
            target="_blank"
            className="flex items-center gap-1 text-slate-300 hover:text-white"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>View Public Site</span>
          </Link>
          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-950/60 border border-red-800/50 text-red-300 hover:bg-red-900/60 transition-colors cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </header>

      {/* Main layout */}
      <div className="flex-1 flex flex-col md:flex-row">
        {/* Navigation Sidebar */}
        <aside className="w-full md:w-64 bg-[#0e0620] border-r border-purple-900/40 p-4 space-y-2">
          <button
            onClick={() => setActiveTab('complaint_names')}
            className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
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
            className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
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
            className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'articles'
                ? 'bg-purple-700/40 text-teal-300 border border-purple-500/50 shadow'
                : 'text-slate-400 hover:bg-purple-950/40 hover:text-white'
            }`}
          >
            <span className="flex items-center gap-2.5">
              <FileText className="w-4 h-4" />
              <span>Parenting Guides CMS</span>
            </span>
            <span className="px-2 py-0.5 rounded-full bg-[#180e38] text-[10px] text-teal-300">
              {articles.length}
            </span>
          </button>

          <div className="pt-8 px-2 text-[11px] text-slate-500 space-y-1">
            <p>🔒 Zero Public Database APIs</p>
            <p>🛡️ Private Admin Verification</p>
            <p>⚡ Official Instagram: @poochandi.in</p>
          </div>
        </aside>

        {/* Dynamic Content Pane */}
        <main className="flex-1 p-6 md:p-8 overflow-y-auto">
          
          {/* TAB 1: COMPLAINT NAME LIST MANAGEMENT */}
          {activeTab === 'complaint_names' && (
            <div className="space-y-6">
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
                      className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs shadow-md transition-all cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                      <span>Delete ({selectedIds.length})</span>
                    </button>
                  )}
                  <a
                    href="/api/admin/complaint-names?export=csv"
                    className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-teal-500 hover:bg-teal-600 text-slate-950 font-bold text-xs shadow-md transition-all"
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
                    className="w-full px-4 py-2.5 rounded-xl bg-[#140b2e] border border-purple-800/60 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-teal-400"
                  />
                  <button
                    onClick={fetchComplaintNames}
                    className="px-4 py-2 rounded-xl bg-purple-900/60 border border-purple-700/50 text-xs font-bold text-purple-200 cursor-pointer"
                  >
                    Filter
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-400">Sort:</span>
                  <select
                    value={sortOrder}
                    onChange={(e) => setSortOrder(e.target.value as any)}
                    className="px-3 py-2 rounded-xl bg-[#140b2e] border border-purple-800/60 text-xs text-white"
                  >
                    <option value="newest">Newest First</option>
                    <option value="oldest">Oldest First</option>
                  </select>
                </div>
              </div>

              {/* Table */}
              <div className="overflow-x-auto rounded-2xl border border-purple-800/40 bg-[#12082b]">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#180e38] text-slate-400 uppercase text-[10px] tracking-wider">
                    <tr>
                      <th className="px-4 py-3 w-8">
                        <input
                          type="checkbox"
                          checked={complaintNames.length > 0 && selectedIds.length === complaintNames.length}
                          onChange={toggleSelectAll}
                        />
                      </th>
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
                        <td colSpan={6} className="px-4 py-8 text-center text-slate-500">
                          {loadingNames ? 'Loading child names...' : 'No entries found in Complaint Name List.'}
                        </td>
                      </tr>
                    ) : (
                      complaintNames.map((n) => (
                        <tr key={n.id} className="hover:bg-purple-950/30 transition-colors">
                          <td className="px-4 py-3">
                            <input
                              type="checkbox"
                              checked={selectedIds.includes(n.id)}
                              onChange={() => toggleSelectOne(n.id)}
                            />
                          </td>
                          <td className="px-4 py-3 font-mono font-bold text-teal-400">{n.id}</td>
                          <td className="px-4 py-3 font-bold text-white">{n.child_name}</td>
                          <td className="px-4 py-3">{n.child_age} Years</td>
                          <td className="px-4 py-3 text-slate-400 whitespace-nowrap">
                            {new Date(n.created_at).toLocaleString()}
                          </td>
                          <td className="px-4 py-3 text-right">
                            <button
                              onClick={() => handleDeleteSingle(n.id)}
                              className="p-1.5 rounded-lg text-red-400 hover:bg-red-950/80 transition-colors cursor-pointer"
                              title="Delete entry"
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
                  <div className="w-32 h-32 rounded-2xl bg-[#0c051f] border border-purple-700/50 p-2 flex items-center justify-center overflow-hidden shrink-0">
                    {(settings.character_hero_url || avatarPreview) ? (
                      <img src={settings.character_hero_url || avatarPreview} alt="Hero Character Preview" className="w-full h-full object-contain" />
                    ) : (
                      <span className="text-xs text-slate-500">No Image</span>
                    )}
                  </div>
                  <div className="space-y-3 w-full">
                    <label className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-purple-900/60 hover:bg-purple-800/60 border border-purple-600/40 text-teal-300 text-xs font-bold cursor-pointer transition-all">
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
                  <div className="w-48 h-20 rounded-2xl bg-[#0c051f] border border-purple-700/50 p-2 flex items-center justify-center overflow-hidden shrink-0">
                    {(settings.logo_url || logoPreview) ? (
                      <img src={settings.logo_url || logoPreview} alt="Logo Preview" className="w-full h-full object-contain" />
                    ) : (
                      <span className="text-xs text-slate-500">No Logo</span>
                    )}
                  </div>
                  <div className="space-y-3 w-full">
                    <label className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-purple-900/60 hover:bg-purple-800/60 border border-purple-600/40 text-teal-300 text-xs font-bold cursor-pointer transition-all">
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
                            className="px-3 py-1 rounded-lg bg-purple-900/60 text-purple-200 hover:text-white text-[11px] font-bold flex items-center gap-1 cursor-pointer"
                          >
                            <Eye className="w-3 h-3" />
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
                              }));
                            }}
                            className="text-red-400 hover:text-red-300 text-[11px] cursor-pointer"
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
                            className="w-full px-3 py-2 rounded-xl bg-[#140b2e] border border-purple-800 text-white"
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
                            className="w-full px-3 py-2 rounded-xl bg-[#140b2e] border border-purple-800 text-white"
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
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-2xl font-black text-white">Parenting Guides CMS</h2>
                  <p className="text-xs text-slate-400">
                    Manage bilingual articles in English & Tamil with instantaneous publishing.
                  </p>
                </div>
                <button
                  onClick={() => setShowNewArticleModal(true)}
                  className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 text-slate-950 font-bold text-xs shadow-md transition-all cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Create New Guide</span>
                </button>
              </div>

              <div className="grid grid-cols-1 gap-4">
                {articles.map((art) => (
                  <div
                    key={art.id}
                    className="p-5 rounded-2xl bg-[#140b2e] border border-purple-800/40 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 hover:border-purple-600/50 transition-all"
                  >
                    <div className="space-y-1">
                      <span className="text-[10px] font-bold text-teal-400 uppercase tracking-widest">
                        {art.category}
                      </span>
                      <h3 className="text-base font-bold text-white">{art.title_en}</h3>
                      <p className="text-xs text-purple-300 font-semibold">{art.title_ta}</p>
                      <p className="text-[11px] text-slate-400">/{art.slug}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <Link
                        href={`/en/parenting-guides/${art.slug}`}
                        target="_blank"
                        className="text-xs font-bold text-teal-400 hover:underline flex items-center gap-1"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        Preview
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </main>
      </div>
    </div>
  );
}
