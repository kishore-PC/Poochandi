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
  ShieldCheck,
  Plus,
  Save,
  CheckCircle2,
} from 'lucide-react';

export default function AdminDashboardPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'requests' | 'articles' | 'settings'>('requests');

  // Requests state
  const [requests, setRequests] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [loadingRequests, setLoadingRequests] = useState(true);

  // Articles state
  const [articles, setArticles] = useState<any[]>([]);
  const [showNewArticleModal, setShowNewArticleModal] = useState(false);
  const [newTitleEn, setNewTitleEn] = useState('');
  const [newTitleTa, setNewTitleTa] = useState('');
  const [newCategory, setNewCategory] = useState('Positive Parenting');
  const [newExcerptEn, setNewExcerptEn] = useState('');
  const [newExcerptTa, setNewExcerptTa] = useState('');
  const [newContentEn, setNewContentEn] = useState('');
  const [newContentTa, setNewContentTa] = useState('');

  // Settings state
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [savingSettings, setSavingSettings] = useState(false);
  const [settingsSaved, setSettingsSaved] = useState(false);

  useEffect(() => {
    fetchRequests();
    fetchArticles();
    fetchSettings();
  }, []);

  const fetchRequests = async () => {
    setLoadingRequests(true);
    try {
      const res = await fetch(`/api/admin/requests${search ? `?search=${encodeURIComponent(search)}` : ''}`);
      if (res.status === 401) {
        router.push('/admin/login');
        return;
      }
      const data = await res.json();
      setRequests(data.requests || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingRequests(false);
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
      setSettings(data.settings || {});
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeleteRequest = async (id: string) => {
    if (!confirm(`Are you sure you want to permanently delete submission ${id}?`)) return;
    try {
      await fetch('/api/admin/requests', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: [id] }),
      });
      fetchRequests();
    } catch (e) {
      console.error(e);
    }
  };

  const handleCreateArticle = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await fetch('/api/admin/articles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title_en: newTitleEn,
          title_ta: newTitleTa,
          category: newCategory,
          excerpt_en: newExcerptEn,
          excerpt_ta: newExcerptTa,
          content_en: newContentEn,
          content_ta: newContentTa,
        }),
      });
      setShowNewArticleModal(false);
      setNewTitleEn('');
      setNewTitleTa('');
      setNewExcerptEn('');
      setNewExcerptTa('');
      setNewContentEn('');
      setNewContentTa('');
      fetchArticles();
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeleteArticle = async (id: string) => {
    if (!confirm('Permanently delete this article?')) return;
    await fetch(`/api/admin/articles?id=${id}`, { method: 'DELETE' });
    fetchArticles();
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingSettings(true);
    try {
      await fetch('/api/admin/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      });
      setSettingsSaved(true);
      setTimeout(() => setSettingsSaved(false), 3000);
    } catch (e) {
      console.error(e);
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
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-950/60 border border-red-800/50 text-red-300 hover:bg-red-900/60 transition-colors"
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
            onClick={() => setActiveTab('requests')}
            className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'requests'
                ? 'bg-purple-700/40 text-teal-300 border border-purple-500/50 shadow'
                : 'text-slate-400 hover:bg-purple-950/40 hover:text-white'
            }`}
          >
            <span className="flex items-center gap-2.5">
              <Users className="w-4 h-4" />
              <span>Child Requests</span>
            </span>
            <span className="px-2 py-0.5 rounded-full bg-[#180e38] text-[10px] text-teal-300">
              {requests.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('articles')}
            className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-xs font-bold transition-all ${
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

          <button
            onClick={() => setActiveTab('settings')}
            className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'settings'
                ? 'bg-purple-700/40 text-teal-300 border border-purple-500/50 shadow'
                : 'text-slate-400 hover:bg-purple-950/40 hover:text-white'
            }`}
          >
            <span className="flex items-center gap-2.5">
              <Settings className="w-4 h-4" />
              <span>Media & Settings</span>
            </span>
          </button>

          <div className="pt-8 px-2 text-[11px] text-slate-500 space-y-1">
            <p>🔒 Zero Public APIs</p>
            <p>🛡️ Private DB Protection</p>
            <p>⚡ SQLite WAL Mode Active</p>
          </div>
        </aside>

        {/* Dynamic Content Pane */}
        <main className="flex-1 p-6 md:p-8 overflow-y-auto">
          
          {/* TAB 1: CHILD REQUESTS */}
          {activeTab === 'requests' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <h2 className="text-2xl font-black text-white">Child Name Requests</h2>
                  <p className="text-xs text-slate-400">
                    Parent submissions for video shoutouts and character mentions.
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <a
                    href="/api/admin/requests?export=csv"
                    className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-teal-500 hover:bg-teal-600 text-slate-950 font-bold text-xs shadow-md transition-all"
                  >
                    <Download className="w-4 h-4" />
                    <span>Export to CSV</span>
                  </a>
                </div>
              </div>

              {/* Search bar */}
              <div className="flex gap-2 max-w-md">
                <input
                  type="text"
                  placeholder="Search by child, parent name, or Request ID..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-[#140b2e] border border-purple-800/60 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-teal-400"
                />
                <button
                  onClick={fetchRequests}
                  className="px-4 py-2 rounded-xl bg-purple-900/60 border border-purple-700/50 text-xs font-bold text-purple-200"
                >
                  Filter
                </button>
              </div>

              {/* Table */}
              <div className="overflow-x-auto rounded-2xl border border-purple-800/40 bg-[#12082b]">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#180e38] text-slate-400 uppercase text-[10px] tracking-wider">
                    <tr>
                      <th className="px-4 py-3">ID</th>
                      <th className="px-4 py-3">Child Name</th>
                      <th className="px-4 py-3">Age / Grade</th>
                      <th className="px-4 py-3">Behavior</th>
                      <th className="px-4 py-3">Parent Name</th>
                      <th className="px-4 py-3">City</th>
                      <th className="px-4 py-3">Submitted</th>
                      <th className="px-4 py-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-purple-900/40 text-slate-300">
                    {requests.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="px-4 py-8 text-center text-slate-500">
                          {loadingRequests ? 'Loading submissions...' : 'No child requests found.'}
                        </td>
                      </tr>
                    ) : (
                      requests.map((r) => (
                        <tr key={r.id} className="hover:bg-purple-950/30 transition-colors">
                          <td className="px-4 py-3 font-mono font-bold text-teal-400">{r.id}</td>
                          <td className="px-4 py-3 font-bold text-white">
                            {r.child_name} {r.nickname && <span className="text-purple-300 font-normal">({r.nickname})</span>}
                          </td>
                          <td className="px-4 py-3">{r.age_grade}</td>
                          <td className="px-4 py-3">
                            <span className="px-2 py-0.5 rounded bg-purple-950 text-purple-300 border border-purple-800/50 font-medium text-[11px]">
                              {r.behavior}
                            </span>
                          </td>
                          <td className="px-4 py-3">{r.parent_name}</td>
                          <td className="px-4 py-3 text-slate-400">{r.city || '—'}</td>
                          <td className="px-4 py-3 text-slate-400 whitespace-nowrap">
                            {new Date(r.created_at).toLocaleDateString()}
                          </td>
                          <td className="px-4 py-3 text-right">
                            <button
                              onClick={() => handleDeleteRequest(r.id)}
                              className="p-1.5 rounded-lg text-red-400 hover:bg-red-950/80 transition-colors"
                              title="Delete record"
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

          {/* TAB 2: ARTICLES CMS */}
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
                  className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 text-slate-950 font-bold text-xs shadow-md transition-all"
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
                      <button
                        onClick={() => handleDeleteArticle(art.id)}
                        className="p-2 rounded-lg text-red-400 hover:bg-red-950/60 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Modal for adding article */}
              {showNewArticleModal && (
                <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
                  <div className="max-w-2xl w-full bg-[#13082b] border border-purple-800 rounded-3xl p-6 sm:p-8 space-y-4 max-h-[90vh] overflow-y-auto">
                    <h3 className="text-lg font-bold text-white">Create New Bilingual Guide</h3>
                    <form onSubmit={handleCreateArticle} className="space-y-4 text-xs">
                      <div>
                        <label className="block text-slate-300 font-bold mb-1">Title (English)</label>
                        <input
                          type="text"
                          required
                          value={newTitleEn}
                          onChange={(e) => setNewTitleEn(e.target.value)}
                          className="w-full px-3 py-2 rounded-lg bg-[#0c051f] border border-purple-800 text-white"
                        />
                      </div>
                      <div>
                        <label className="block text-slate-300 font-bold mb-1">Title (தமிழ்)</label>
                        <input
                          type="text"
                          required
                          value={newTitleTa}
                          onChange={(e) => setNewTitleTa(e.target.value)}
                          className="w-full px-3 py-2 rounded-lg bg-[#0c051f] border border-purple-800 text-white"
                        />
                      </div>
                      <div>
                        <label className="block text-slate-300 font-bold mb-1">Category</label>
                        <input
                          type="text"
                          value={newCategory}
                          onChange={(e) => setNewCategory(e.target.value)}
                          className="w-full px-3 py-2 rounded-lg bg-[#0c051f] border border-purple-800 text-white"
                        />
                      </div>
                      <div>
                        <label className="block text-slate-300 font-bold mb-1">Excerpt (English)</label>
                        <textarea
                          rows={2}
                          value={newExcerptEn}
                          onChange={(e) => setNewExcerptEn(e.target.value)}
                          className="w-full px-3 py-2 rounded-lg bg-[#0c051f] border border-purple-800 text-white"
                        />
                      </div>
                      <div>
                        <label className="block text-slate-300 font-bold mb-1">Excerpt (தமிழ்)</label>
                        <textarea
                          rows={2}
                          value={newExcerptTa}
                          onChange={(e) => setNewExcerptTa(e.target.value)}
                          className="w-full px-3 py-2 rounded-lg bg-[#0c051f] border border-purple-800 text-white"
                        />
                      </div>
                      <div>
                        <label className="block text-slate-300 font-bold mb-1">Content (English)</label>
                        <textarea
                          rows={4}
                          value={newContentEn}
                          onChange={(e) => setNewContentEn(e.target.value)}
                          className="w-full px-3 py-2 rounded-lg bg-[#0c051f] border border-purple-800 text-white"
                        />
                      </div>
                      <div>
                        <label className="block text-slate-300 font-bold mb-1">Content (தமிழ்)</label>
                        <textarea
                          rows={4}
                          value={newContentTa}
                          onChange={(e) => setNewContentTa(e.target.value)}
                          className="w-full px-3 py-2 rounded-lg bg-[#0c051f] border border-purple-800 text-white"
                        />
                      </div>
                      <div className="flex justify-end gap-3 pt-2">
                        <button
                          type="button"
                          onClick={() => setShowNewArticleModal(false)}
                          className="px-4 py-2 rounded-lg bg-purple-950 text-slate-300"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          className="px-4 py-2 rounded-lg bg-teal-500 text-slate-950 font-bold"
                        >
                          Save & Publish
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: MEDIA & SETTINGS */}
          {activeTab === 'settings' && (
            <div className="space-y-6 max-w-3xl">
              <div>
                <h2 className="text-2xl font-black text-white">Media & Website Settings</h2>
                <p className="text-xs text-slate-400">
                  Update the 4 featured Instagram videos, thumbnails, logo paths, WhatsApp number, and AdSense codes.
                </p>
              </div>

              {settingsSaved && (
                <div className="p-4 rounded-xl bg-emerald-950/70 border border-emerald-500/50 text-emerald-300 text-xs flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Settings updated successfully! Changes are live immediately.</span>
                </div>
              )}

              <form onSubmit={handleSaveSettings} className="space-y-6 text-xs">
                
                {/* 4 Instagram Featured Reels Settings */}
                <div className="p-5 rounded-2xl bg-[#140b2e] border border-purple-800/40 space-y-4">
                  <h3 className="text-sm font-bold text-teal-300 uppercase tracking-wider">
                    4 Featured Instagram Reels
                  </h3>
                  
                  {/* Reel 1 */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-purple-900/40">
                    <div>
                      <label className="block text-slate-300 font-semibold mb-1">Reel 1 Title</label>
                      <input
                        type="text"
                        value={settings.reel1_title || ''}
                        onChange={(e) => setSettings({ ...settings, reel1_title: e.target.value })}
                        className="w-full px-3 py-2 rounded-lg bg-[#0c051f] border border-purple-800 text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-300 font-semibold mb-1">Reel 1 Instagram URL</label>
                      <input
                        type="text"
                        value={settings.reel1_url || ''}
                        onChange={(e) => setSettings({ ...settings, reel1_url: e.target.value })}
                        className="w-full px-3 py-2 rounded-lg bg-[#0c051f] border border-purple-800 text-white"
                      />
                    </div>
                  </div>

                  {/* Reel 2 */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-purple-900/40">
                    <div>
                      <label className="block text-slate-300 font-semibold mb-1">Reel 2 Title</label>
                      <input
                        type="text"
                        value={settings.reel2_title || ''}
                        onChange={(e) => setSettings({ ...settings, reel2_title: e.target.value })}
                        className="w-full px-3 py-2 rounded-lg bg-[#0c051f] border border-purple-800 text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-300 font-semibold mb-1">Reel 2 Instagram URL</label>
                      <input
                        type="text"
                        value={settings.reel2_url || ''}
                        onChange={(e) => setSettings({ ...settings, reel2_url: e.target.value })}
                        className="w-full px-3 py-2 rounded-lg bg-[#0c051f] border border-purple-800 text-white"
                      />
                    </div>
                  </div>

                  {/* Reel 3 */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-purple-900/40">
                    <div>
                      <label className="block text-slate-300 font-semibold mb-1">Reel 3 Title</label>
                      <input
                        type="text"
                        value={settings.reel3_title || ''}
                        onChange={(e) => setSettings({ ...settings, reel3_title: e.target.value })}
                        className="w-full px-3 py-2 rounded-lg bg-[#0c051f] border border-purple-800 text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-300 font-semibold mb-1">Reel 3 Instagram URL</label>
                      <input
                        type="text"
                        value={settings.reel3_url || ''}
                        onChange={(e) => setSettings({ ...settings, reel3_url: e.target.value })}
                        className="w-full px-3 py-2 rounded-lg bg-[#0c051f] border border-purple-800 text-white"
                      />
                    </div>
                  </div>

                  {/* Reel 4 */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-purple-900/40">
                    <div>
                      <label className="block text-slate-300 font-semibold mb-1">Reel 4 Title</label>
                      <input
                        type="text"
                        value={settings.reel4_title || ''}
                        onChange={(e) => setSettings({ ...settings, reel4_title: e.target.value })}
                        className="w-full px-3 py-2 rounded-lg bg-[#0c051f] border border-purple-800 text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-300 font-semibold mb-1">Reel 4 Instagram URL</label>
                      <input
                        type="text"
                        value={settings.reel4_url || ''}
                        onChange={(e) => setSettings({ ...settings, reel4_url: e.target.value })}
                        className="w-full px-3 py-2 rounded-lg bg-[#0c051f] border border-purple-800 text-white"
                      />
                    </div>
                  </div>
                </div>

                {/* Social & Contact Settings */}
                <div className="p-5 rounded-2xl bg-[#140b2e] border border-purple-800/40 space-y-4">
                  <h3 className="text-sm font-bold text-teal-300 uppercase tracking-wider">
                    Contact & Social Handles
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-slate-300 font-semibold mb-1">Instagram URL</label>
                      <input
                        type="text"
                        value={settings.instagram_url || ''}
                        onChange={(e) => setSettings({ ...settings, instagram_url: e.target.value })}
                        className="w-full px-3 py-2 rounded-lg bg-[#0c051f] border border-purple-800 text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-300 font-semibold mb-1">YouTube URL</label>
                      <input
                        type="text"
                        value={settings.youtube_url || ''}
                        onChange={(e) => setSettings({ ...settings, youtube_url: e.target.value })}
                        className="w-full px-3 py-2 rounded-lg bg-[#0c051f] border border-purple-800 text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-300 font-semibold mb-1">WhatsApp Number (with country code)</label>
                      <input
                        type="text"
                        value={settings.whatsapp_number || ''}
                        onChange={(e) => setSettings({ ...settings, whatsapp_number: e.target.value })}
                        className="w-full px-3 py-2 rounded-lg bg-[#0c051f] border border-purple-800 text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-300 font-semibold mb-1">Official Contact Email</label>
                      <input
                        type="text"
                        value={settings.contact_email || ''}
                        onChange={(e) => setSettings({ ...settings, contact_email: e.target.value })}
                        className="w-full px-3 py-2 rounded-lg bg-[#0c051f] border border-purple-800 text-white"
                      />
                    </div>
                  </div>
                </div>

                {/* Monetization & Analytics */}
                <div className="p-5 rounded-2xl bg-[#140b2e] border border-purple-800/40 space-y-4">
                  <h3 className="text-sm font-bold text-teal-300 uppercase tracking-wider">
                    Google AdSense & Analytics
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-slate-300 font-semibold mb-1">AdSense Publisher ID</label>
                      <input
                        type="text"
                        value={settings.adsense_publisher_id || ''}
                        onChange={(e) => setSettings({ ...settings, adsense_publisher_id: e.target.value })}
                        className="w-full px-3 py-2 rounded-lg bg-[#0c051f] border border-purple-800 text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-300 font-semibold mb-1">Google Analytics ID</label>
                      <input
                        type="text"
                        value={settings.google_analytics_id || ''}
                        onChange={(e) => setSettings({ ...settings, google_analytics_id: e.target.value })}
                        className="w-full px-3 py-2 rounded-lg bg-[#0c051f] border border-purple-800 text-white"
                      />
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={savingSettings}
                  className="px-6 py-3 rounded-xl bg-teal-500 hover:bg-teal-600 text-slate-950 font-black text-xs flex items-center gap-2 cursor-pointer transition-all shadow-md"
                >
                  <Save className="w-4 h-4" />
                  <span>{savingSettings ? 'Saving...' : 'Save Configuration'}</span>
                </button>
              </form>
            </div>
          )}

        </main>
      </div>
    </div>
  );
}
