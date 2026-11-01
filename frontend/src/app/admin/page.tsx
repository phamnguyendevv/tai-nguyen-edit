'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import {
  UploadCloud,
  Layers,
  ArrowLeft,
  Music,
  CheckCircle2,
  Trash2,
  Play,
  Pause,
  Loader2,
  Search,
  Download,
  Shield,
  Activity,
  FileAudio,
  Sparkles,
  ShieldAlert,
  Plus,
  Edit2,
  FolderTree,
  FolderPlus,
  Tag,
  Folder,
  X,
  AlertTriangle,
  Users,
} from 'lucide-react';
import { ApiClient } from '@/lib/api-client';
import { analyzeAudioFile } from '@/lib/audio/waveform-extractor';
import { WaveformScrubber } from '@/components/WaveformScrubber';
import { SoundEffect, Category, CategorySlug, SubCategory } from '@/types/sfx';
import { CATEGORIES_DATA } from '@/lib/data/categories';
import { useAuth } from '@/lib/auth/auth-context';
import { LoginModal } from '@/components/LoginModal';
import { AdminUserManagement } from '@/components/AdminUserManagement';

export default function AdminPage() {
  const { user, isAdmin, isAuthenticated, loginWithPreset } = useAuth();
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'upload' | 'catalog' | 'categories' | 'users'>('upload');
  const [categories, setCategories] = useState<Category[]>(CATEGORIES_DATA);
  const [soundEffects, setSoundEffects] = useState<SoundEffect[]>([]);
  const [isLoadingCatalog, setIsLoadingCatalog] = useState(false);
  const [catalogSearch, setCatalogSearch] = useState('');
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Category & Subcategory Management State
  const [categorySearch, setCategorySearch] = useState('');
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [catNameInput, setCatNameInput] = useState('');
  const [catSlugInput, setCatSlugInput] = useState('');
  const [isCatSlugManual, setIsCatSlugManual] = useState(false);

  const [isSubcategoryModalOpen, setIsSubcategoryModalOpen] = useState(false);
  const [targetCategoryForSub, setTargetCategoryForSub] = useState<Category | null>(null);
  const [editingSubcategory, setEditingSubcategory] = useState<SubCategory | null>(null);
  const [subNameInput, setSubNameInput] = useState('');
  const [subSlugInput, setSubSlugInput] = useState('');
  const [isSubSlugManual, setIsSubSlugManual] = useState(false);

  const [deleteConfirm, setDeleteConfirm] = useState<{
    type: 'category' | 'subcategory';
    id: string;
    categoryId?: string;
    name: string;
  } | null>(null);
  const [isSavingCategory, setIsSavingCategory] = useState(false);

  // Upload state
  const [file, setFile] = useState<File | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<CategorySlug>('realistic');
  const [subcategory, setSubcategory] = useState('wildlife');
  const [tags, setTags] = useState('');
  const [license, setLicense] = useState('Royalty-Free / CC0');

  // Analyzed audio properties
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [duration, setDuration] = useState<number>(0);
  const [waveform, setWaveform] = useState<number[]>([]);

  // Preview playback in admin
  const [isPlayingPreview, setIsPlayingPreview] = useState(false);
  const [previewProgress, setPreviewProgress] = useState(0);
  const previewAudioRef = useRef<HTMLAudioElement | null>(null);

  // Catalog inline play
  const [playingCatalogId, setPlayingCatalogId] = useState<string | null>(null);
  const catalogAudioRef = useRef<HTMLAudioElement | null>(null);

  const showToast = (type: 'success' | 'error', message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 4000);
  };

  // Fetch catalog
  const loadCatalog = async () => {
    setIsLoadingCatalog(true);
    try {
      const res = await ApiClient.getSoundEffects({ limit: 50, category: 'all' });
      setSoundEffects(res.items);
      const cats = await ApiClient.getCategories();
      if (cats && cats.length > 0) setCategories(cats);
    } catch (e) {
      console.warn('Failed to load catalog in admin:', e);
    } finally {
      setIsLoadingCatalog(false);
    }
  };

  useEffect(() => {
    loadCatalog();
  }, []);

  // Utility to generate clean URL slug
  const slugify = (text: string) => {
    return text
      .toString()
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[đĐ]/g, 'd')
      .replace(/[^a-z0-9 -]/g, '')
      .trim()
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-');
  };

  // Category Actions
  const openCreateCategory = () => {
    setEditingCategory(null);
    setCatNameInput('');
    setCatSlugInput('');
    setIsCatSlugManual(false);
    setIsCategoryModalOpen(true);
  };

  const openEditCategory = (cat: Category) => {
    setEditingCategory(cat);
    setCatNameInput(cat.name);
    setCatSlugInput(cat.slug);
    setIsCatSlugManual(true);
    setIsCategoryModalOpen(true);
  };

  const handleSaveCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanName = catNameInput.trim();
    const cleanSlug = catSlugInput.trim().toLowerCase();
    if (!cleanName || !cleanSlug) {
      showToast('error', 'Vui lòng nhập tên và slug của danh mục');
      return;
    }

    setIsSavingCategory(true);
    try {
      if (editingCategory) {
        await ApiClient.updateCategory(editingCategory.id, { name: cleanName, slug: cleanSlug });
        showToast('success', `Đã cập nhật danh mục "${cleanName}"`);
      } else {
        await ApiClient.createCategory({ name: cleanName, slug: cleanSlug });
        showToast('success', `Đã tạo danh mục mới "${cleanName}"`);
      }
      setIsCategoryModalOpen(false);
      const updated = await ApiClient.getCategories();
      if (updated && updated.length > 0) setCategories(updated);
    } catch (err: any) {
      showToast('error', err.message || 'Lỗi khi lưu danh mục');
    } finally {
      setIsSavingCategory(false);
    }
  };

  // Subcategory Actions
  const openCreateSubcategory = (parentCat: Category) => {
    setTargetCategoryForSub(parentCat);
    setEditingSubcategory(null);
    setSubNameInput('');
    setSubSlugInput('');
    setIsSubSlugManual(false);
    setIsSubcategoryModalOpen(true);
  };

  const openEditSubcategory = (parentCat: Category, sub: SubCategory) => {
    setTargetCategoryForSub(parentCat);
    setEditingSubcategory(sub);
    setSubNameInput(sub.name);
    setSubSlugInput(sub.slug);
    setIsSubSlugManual(true);
    setIsSubcategoryModalOpen(true);
  };

  const handleSaveSubcategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetCategoryForSub) return;
    const cleanName = subNameInput.trim();
    const cleanSlug = subSlugInput.trim().toLowerCase();
    if (!cleanName || !cleanSlug) {
      showToast('error', 'Vui lòng nhập tên và slug của subcategory');
      return;
    }

    setIsSavingCategory(true);
    try {
      if (editingSubcategory) {
        await ApiClient.updateSubcategory(targetCategoryForSub.id, editingSubcategory.id, {
          name: cleanName,
          slug: cleanSlug,
        });
        showToast('success', `Đã cập nhật subcategory "${cleanName}"`);
      } else {
        await ApiClient.createSubcategory(targetCategoryForSub.id, {
          name: cleanName,
          slug: cleanSlug,
        });
        showToast('success', `Đã thêm subcategory mới "${cleanName}"`);
      }
      setIsSubcategoryModalOpen(false);
      const updated = await ApiClient.getCategories();
      if (updated && updated.length > 0) setCategories(updated);
    } catch (err: any) {
      showToast('error', err.message || 'Lỗi khi lưu subcategory');
    } finally {
      setIsSavingCategory(false);
    }
  };

  // Delete Action
  const handleConfirmDelete = async () => {
    if (!deleteConfirm) return;
    setIsSavingCategory(true);
    try {
      if (deleteConfirm.type === 'category') {
        await ApiClient.deleteCategory(deleteConfirm.id);
        showToast('success', `Đã xóa danh mục "${deleteConfirm.name}"`);
      } else if (deleteConfirm.type === 'subcategory' && deleteConfirm.categoryId) {
        await ApiClient.deleteSubcategory(deleteConfirm.categoryId, deleteConfirm.id);
        showToast('success', `Đã xóa subcategory "${deleteConfirm.name}"`);
      }
      setDeleteConfirm(null);
      const updated = await ApiClient.getCategories();
      if (updated && updated.length > 0) setCategories(updated);
    } catch (err: any) {
      showToast('error', err.message || 'Lỗi khi xóa');
    } finally {
      setIsSavingCategory(false);
    }
  };

  // Handle file selection and Web Audio analysis
  const handleSelectFile = async (selectedFile: File) => {
    if (!selectedFile) return;
    setFile(selectedFile);
    setIsAnalyzing(true);

    const cleanTitle = selectedFile.name
      .replace(/\.[^/.]+$/, '')
      .replace(/[-_]/g, ' ');
    setTitle(cleanTitle.charAt(0).toUpperCase() + cleanTitle.slice(1));

    try {
      const result = await analyzeAudioFile(selectedFile);
      setAudioUrl(result.audioUrl);
      setDuration(result.duration);
      setWaveform(result.waveform);
      showToast('success', `Analyzed audio: ${result.waveform.length} waveform peaks extracted.`);
    } catch (err) {
      console.error('Audio decode error:', err);
      showToast('error', 'Could not decode audio. Please check file format.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const togglePreview = () => {
    if (!audioUrl) return;

    if (!previewAudioRef.current || previewAudioRef.current.src !== audioUrl) {
      const audio = new Audio(audioUrl);
      previewAudioRef.current = audio;
      audio.ontimeupdate = () => {
        if (audio.duration) {
          setPreviewProgress(audio.currentTime / audio.duration);
        }
      };
      audio.onended = () => {
        setIsPlayingPreview(false);
        setPreviewProgress(0);
      };
    }

    const audio = previewAudioRef.current;
    if (isPlayingPreview) {
      audio.pause();
      setIsPlayingPreview(false);
    } else {
      audio.play().then(() => setIsPlayingPreview(true)).catch(console.error);
    }
  };

  const handlePublish = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || waveform.length === 0) return;

    setIsPublishing(true);
    try {
      // Read base64
      const reader = new FileReader();
      const base64Promise = new Promise<string>((resolve) => {
        reader.onloadend = () => resolve(reader.result as string);
        reader.readAsDataURL(file);
      });
      const audioBase64 = await base64Promise;

      const payload = {
        title: title.trim(),
        category,
        subcategory,
        duration,
        waveform,
        tags: tags.split(',').map((t) => t.trim()).filter(Boolean),
        audioBase64,
        format: file.type || 'audio/wav',
        license,
      };

      const newSfx = await ApiClient.createSoundEffect(payload);
      showToast('success', `Published "${newSfx.title}" to library!`);

      // Reset form
      setFile(null);
      setWaveform([]);
      setAudioUrl(null);
      setTitle('');
      setTags('');

      // Reload catalog
      await loadCatalog();
      setActiveTab('catalog');
    } catch (err) {
      console.error('Publish error:', err);
      showToast('error', 'Failed to publish sound effect to backend.');
    } finally {
      setIsPublishing(false);
    }
  };

  // Delete sound effect
  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete "${name}"?`)) return;

    try {
      const success = await ApiClient.deleteSoundEffect(id);
      if (success) {
        showToast('success', `Deleted "${name}"`);
        setSoundEffects((prev) => prev.filter((item) => item.id !== id));
      } else {
        showToast('error', 'Failed to delete sound effect.');
      }
    } catch (err) {
      showToast('error', 'Error deleting sound effect.');
    }
  };

  // Inline catalog preview play
  const toggleCatalogPlay = (item: SoundEffect) => {
    if (playingCatalogId === item.id) {
      catalogAudioRef.current?.pause();
      setPlayingCatalogId(null);
      return;
    }

    if (catalogAudioRef.current) {
      catalogAudioRef.current.pause();
    }

    const audio = new Audio(item.audioUrl);
    catalogAudioRef.current = audio;
    audio.play().then(() => {
      setPlayingCatalogId(item.id);
    }).catch(console.error);

    audio.onended = () => {
      setPlayingCatalogId(null);
    };
  };

  const currentCatObj = categories.find((c) => c.slug === category);
  const availableSubs = currentCatObj?.subcategories || [];

  const filteredCatalog = soundEffects.filter((item) => {
    if (!catalogSearch) return true;
    const q = catalogSearch.toLowerCase();
    return (
      item.title.toLowerCase().includes(q) ||
      item.category.toLowerCase().includes(q) ||
      item.subcategory.toLowerCase().includes(q)
    );
  });

  // RBAC Access Control Guard
  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] text-white flex flex-col items-center justify-center p-6 text-center font-sans">
        <div className="max-w-md w-full bg-[#131313] border border-neutral-800 rounded-2xl p-8 shadow-2xl flex flex-col items-center">
          <div className="w-16 h-16 rounded-2xl bg-red-950/40 border border-red-800/60 flex items-center justify-center text-red-400 mb-4 shadow-inner">
            <ShieldAlert className="w-8 h-8" />
          </div>

          <h1 className="text-xl font-bold text-white tracking-tight">403 - Admin Access Required</h1>

          <div className="text-xs text-neutral-400 mt-2.5 leading-relaxed">
            {isAuthenticated ? (
              <div>
                You are currently signed in as <span className="text-white font-semibold">{user?.name}</span> (Role:{' '}
                <span className="px-1.5 py-0.2 rounded bg-neutral-800 text-neutral-300 font-mono font-bold text-[10px]">
                  {user?.role}
                </span>
                ).
                <p className="mt-2 text-neutral-400">
                  Your account is restricted from accessing the Sound Studio Admin Portal. Only users with the{' '}
                  <span className="text-white font-bold">ADMIN</span> role can upload, analyze waveforms, and manage sound effects.
                </p>
              </div>
            ) : (
              <p>
                You are not signed in. Please sign in with an Administrator account to access the sound upload station and library management tools.
              </p>
            )}
          </div>

          <div className="w-full flex flex-col gap-2.5 mt-6">
            <button
              type="button"
              onClick={() => loginWithPreset('ADMIN')}
              className="w-full py-2.5 bg-white text-black font-bold rounded-lg hover:bg-neutral-200 transition-all text-xs flex items-center justify-center gap-2 shadow-sm active:scale-95"
            >
              <Shield className="w-4 h-4" />
              <span>1-Click Sign In as Administrator</span>
            </button>

            <button
              type="button"
              onClick={() => setIsLoginOpen(true)}
              className="w-full py-2.5 bg-neutral-900 border border-neutral-700 hover:border-neutral-500 text-neutral-200 font-medium rounded-lg transition-all text-xs flex items-center justify-center gap-2"
            >
              <span>Switch or Login Other Account</span>
            </button>

            <Link
              href="/"
              className="w-full py-2 text-neutral-400 hover:text-white transition-colors text-xs text-center mt-1"
            >
              ← Return to Public Storefront
            </Link>
          </div>
        </div>

        <LoginModal isOpen={isLoginOpen} onClose={() => setIsLoginOpen(false)} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white flex flex-col font-sans">
      {/* Toast Notification */}
      {toast && (
        <div
          className={`fixed top-5 right-5 z-50 px-4 py-2.5 rounded-lg border shadow-2xl flex items-center gap-2 text-xs font-medium animate-in fade-in slide-in-from-top-3 duration-200 ${
            toast.type === 'success'
              ? 'bg-neutral-900 border-emerald-500/60 text-emerald-300'
              : 'bg-neutral-900 border-red-500/60 text-red-300'
          }`}
        >
          {toast.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          ) : (
            <Activity className="w-4 h-4 text-red-400" />
          )}
          <span>{toast.message}</span>
        </div>
      )}

      {/* Admin Navbar */}
      <header className="sticky top-0 z-40 bg-[#111111]/95 backdrop-blur border-b border-neutral-800 px-6 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-white text-black flex items-center justify-center font-black">
            <Shield className="w-4 h-4 text-black" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-sm tracking-tight text-white">
                Magnific Sound Admin Studio
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-neutral-800 border border-neutral-700 text-neutral-300">
                PORTAL
              </span>
            </div>
            <p className="text-[11px] text-neutral-400">Audio catalog management & automatic waveform synthesis</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 bg-emerald-950/40 border border-emerald-800/50 rounded-full text-[11px] text-emerald-400">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Backend API: Online (:5000)</span>
          </div>

          <Link
            href="/"
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-white text-black hover:bg-neutral-200 transition-all shadow-sm"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Public Store</span>
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-6xl w-full mx-auto px-4 py-8 flex-1 flex flex-col">
        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 border-b border-neutral-800 pb-3 mb-6 overflow-x-auto">
          <button
            type="button"
            onClick={() => setActiveTab('upload')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'upload'
                ? 'bg-neutral-800 text-white shadow-sm'
                : 'text-neutral-400 hover:text-white hover:bg-neutral-900'
            }`}
          >
            <UploadCloud className="w-4 h-4" />
            <span>Upload New Sound Effect</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('catalog')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'catalog'
                ? 'bg-neutral-800 text-white shadow-sm'
                : 'text-neutral-400 hover:text-white hover:bg-neutral-900'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>Sound Effects Catalog ({soundEffects.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('categories')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'categories'
                ? 'bg-neutral-800 text-white shadow-sm'
                : 'text-neutral-400 hover:text-white hover:bg-neutral-900'
            }`}
          >
            <FolderTree className="w-4 h-4" />
            <span>Quản Lý Danh Mục & Subcategory ({categories.filter((c) => c.slug !== 'all').length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('users')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'users'
                ? 'bg-neutral-800 text-white shadow-sm'
                : 'text-neutral-400 hover:text-white hover:bg-neutral-900'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Quản Lý Tài Khoản</span>
          </button>
        </div>

        {/* Tab 1: Upload Studio */}
        {activeTab === 'upload' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Left 7 cols: Drag & Drop + Waveform Inspection */}
            <div className="lg:col-span-7 flex flex-col gap-5">
              <div className="bg-[#141414] border border-neutral-800 rounded-xl p-6 shadow-xl">
                <h3 className="text-sm font-bold text-white mb-1 flex items-center gap-2">
                  <FileAudio className="w-4 h-4 text-neutral-400" />
                  <span>1. Audio Asset Ingestion</span>
                </h3>
                <p className="text-xs text-neutral-400 mb-4">
                  Select or drag an audio file. Web Audio API decodes PCM buffers and generates 48 amplitude peaks instantly.
                </p>

                {/* Dropzone */}
                {!file ? (
                  <div
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={(e) => {
                      e.preventDefault();
                      if (e.dataTransfer.files?.[0]) handleSelectFile(e.dataTransfer.files[0]);
                    }}
                    onClick={() => document.getElementById('admin-file-picker')?.click()}
                    className="border-2 border-dashed border-neutral-700 hover:border-neutral-400 rounded-xl p-10 flex flex-col items-center justify-center gap-3 cursor-pointer bg-neutral-950/40 hover:bg-neutral-900/40 transition-all text-center"
                  >
                    <div className="w-12 h-12 rounded-full bg-neutral-800 flex items-center justify-center text-neutral-300">
                      <Music className="w-6 h-6 stroke-[1.5]" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-white">
                        Click to browse or drag & drop audio file
                      </p>
                      <p className="text-xs text-neutral-500 mt-1">
                        Supports WAV, MP3, OGG, FLAC, M4A, AAC
                      </p>
                    </div>
                    <input
                      id="admin-file-picker"
                      type="file"
                      accept="audio/*"
                      className="hidden"
                      onChange={(e) => e.target.files?.[0] && handleSelectFile(e.target.files[0])}
                    />
                  </div>
                ) : (
                  <div className="flex flex-col gap-4">
                    <div className="flex items-center justify-between p-3.5 bg-neutral-900/90 rounded-lg border border-neutral-800">
                      <div className="flex items-center gap-2.5 truncate">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                        <span className="text-xs font-semibold text-white truncate max-w-sm">
                          {file.name}
                        </span>
                        <span className="text-[10px] text-neutral-400 font-mono">
                          ({(file.size / 1024).toFixed(1)} KB)
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setFile(null);
                          setWaveform([]);
                          setAudioUrl(null);
                        }}
                        className="text-xs text-neutral-400 hover:text-red-400 transition-colors"
                      >
                        Replace
                      </button>
                    </div>

                    {/* Analysis Status */}
                    {isAnalyzing ? (
                      <div className="py-12 flex flex-col items-center justify-center gap-3 text-neutral-400">
                        <Loader2 className="w-7 h-7 animate-spin text-white" />
                        <span className="text-xs">Analyzing raw PCM waveform peaks...</span>
                      </div>
                    ) : waveform.length > 0 ? (
                      <div className="bg-[#0e0e0e] border border-neutral-800 rounded-lg p-4 flex flex-col gap-3">
                        <div className="flex items-center justify-between text-[11px] font-mono text-neutral-400 border-b border-neutral-800/80 pb-2">
                          <span className="text-emerald-400 font-semibold flex items-center gap-1.5">
                            <Sparkles className="w-3.5 h-3.5" />
                            Real Peak Waveform Extracted (48 bars)
                          </span>
                          <span>Duration: {duration}s</span>
                        </div>

                        {/* Interactive Playable Waveform */}
                        <div className="flex items-center gap-3 pt-1">
                          <button
                            type="button"
                            onClick={togglePreview}
                            className="w-8 h-8 rounded-full bg-white text-black flex items-center justify-center hover:scale-105 active:scale-95 transition-all flex-shrink-0 shadow-[0_0_10px_rgba(255,255,255,0.3)]"
                          >
                            {isPlayingPreview ? (
                              <Pause className="w-4 h-4 fill-black stroke-black" />
                            ) : (
                              <Play className="w-4 h-4 fill-black ml-0.5" />
                            )}
                          </button>

                          <div className="flex-1">
                            <WaveformScrubber
                              waveform={waveform}
                              progress={previewProgress}
                              isPlaying={isPlayingPreview}
                              onSeek={(pct) => {
                                if (previewAudioRef.current && duration > 0) {
                                  previewAudioRef.current.currentTime = pct * duration;
                                  setPreviewProgress(pct);
                                }
                              }}
                            />
                          </div>
                        </div>
                      </div>
                    ) : null}
                  </div>
                )}
              </div>
            </div>

            {/* Right 5 cols: Metadata Form */}
            <div className="lg:col-span-5">
              <form
                onSubmit={handlePublish}
                className="bg-[#141414] border border-neutral-800 rounded-xl p-6 shadow-xl flex flex-col gap-4 text-xs"
              >
                <h3 className="text-sm font-bold text-white mb-1 flex items-center gap-2">
                  <Layers className="w-4 h-4 text-neutral-400" />
                  <span>2. Sound Effect Metadata</span>
                </h3>

                <div>
                  <label className="block text-neutral-400 mb-1 font-medium">Sound Title *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Birds in the Valley"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full bg-[#1c1c1c] border border-neutral-700 rounded-lg px-3 py-2 text-white placeholder-neutral-500 focus:outline-none focus:border-white"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-neutral-400 mb-1 font-medium">Category</label>
                    <select
                      value={category}
                      onChange={(e) => {
                        const newCat = e.target.value as CategorySlug;
                        setCategory(newCat);
                        const sub = categories.find((c) => c.slug === newCat)?.subcategories?.[0]?.slug || '';
                        setSubcategory(sub);
                      }}
                      className="w-full bg-[#1c1c1c] border border-neutral-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-white"
                    >
                      {categories
                        .filter((c) => c.slug !== 'all')
                        .map((c) => (
                          <option key={c.id} value={c.slug}>
                            {c.name}
                          </option>
                        ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-neutral-400 mb-1 font-medium">Subcategory</label>
                    <select
                      value={subcategory}
                      onChange={(e) => setSubcategory(e.target.value)}
                      className="w-full bg-[#1c1c1c] border border-neutral-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-white"
                    >
                      {availableSubs.map((sub) => (
                        <option key={sub.id} value={sub.slug}>
                          {sub.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-neutral-400 mb-1 font-medium">Tags (comma separated)</label>
                  <input
                    type="text"
                    placeholder="e.g. birds, morning, nature, dawn"
                    value={tags}
                    onChange={(e) => setTags(e.target.value)}
                    className="w-full bg-[#1c1c1c] border border-neutral-700 rounded-lg px-3 py-2 text-white placeholder-neutral-500 focus:outline-none focus:border-white"
                  />
                </div>

                <div>
                  <label className="block text-neutral-400 mb-1 font-medium">License</label>
                  <select
                    value={license}
                    onChange={(e) => setLicense(e.target.value)}
                    className="w-full bg-[#1c1c1c] border border-neutral-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-white"
                  >
                    <option value="Royalty-Free / CC0">Royalty-Free / CC0 (Public Domain)</option>
                    <option value="Standard Studio License">Standard Studio License</option>
                    <option value="Exclusive Studio Sound">Exclusive Studio Sound</option>
                  </select>
                </div>

                <button
                  type="submit"
                  disabled={!file || waveform.length === 0 || isPublishing}
                  className="w-full mt-3 py-2.5 bg-white text-black font-bold rounded-lg hover:bg-neutral-200 transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-white/5 active:scale-95"
                >
                  {isPublishing ? <Loader2 className="w-4 h-4 animate-spin text-black" /> : <UploadCloud className="w-4 h-4" />}
                  <span>Publish Sound to Platform</span>
                </button>
              </form>
            </div>
          </div>
        )}

        {/* Tab 2: Catalog Management */}
        {activeTab === 'catalog' && (
          <div className="flex flex-col gap-5">
            {/* Search and filters */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-[#141414] border border-neutral-800 p-4 rounded-xl">
              <div className="relative flex-1 w-full max-w-md">
                <Search className="w-4 h-4 text-neutral-500 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Search catalog by title, category, subcategory..."
                  value={catalogSearch}
                  onChange={(e) => setCatalogSearch(e.target.value)}
                  className="w-full bg-[#1c1c1c] border border-neutral-700 rounded-lg pl-9 pr-3 py-1.5 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-white"
                />
              </div>

              <div className="text-xs text-neutral-400 font-medium">
                Showing <span className="text-white font-bold">{filteredCatalog.length}</span> of{' '}
                <span className="text-white font-bold">{soundEffects.length}</span> tracks
              </div>
            </div>

            {/* Catalog Table */}
            <div className="bg-[#141414] border border-neutral-800 rounded-xl overflow-hidden shadow-xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#1a1a1a] text-neutral-400 border-b border-neutral-800 text-[11px] uppercase tracking-wider">
                    <tr>
                      <th className="py-3 px-4 w-12 text-center">Play</th>
                      <th className="py-3 px-4">Title & Tags</th>
                      <th className="py-3 px-4">Category</th>
                      <th className="py-3 px-4">Duration</th>
                      <th className="py-3 px-4">Downloads</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-800">
                    {filteredCatalog.map((item) => {
                      const isPlaying = playingCatalogId === item.id;

                      return (
                        <tr key={item.id} className="hover:bg-neutral-900/60 transition-colors">
                          <td className="py-3 px-4 text-center">
                            <button
                              type="button"
                              onClick={() => toggleCatalogPlay(item)}
                              className={`w-7 h-7 rounded-full flex items-center justify-center transition-transform hover:scale-110 ${
                                isPlaying ? 'bg-white text-black' : 'bg-neutral-800 text-white'
                              }`}
                            >
                              {isPlaying ? (
                                <Pause className="w-3.5 h-3.5 fill-black stroke-black" />
                              ) : (
                                <Play className="w-3.5 h-3.5 fill-white ml-0.5" />
                              )}
                            </button>
                          </td>
                          <td className="py-3 px-4">
                            <div className="font-semibold text-white">{item.title}</div>
                            <div className="text-[11px] text-neutral-500 flex items-center gap-1 mt-0.5 truncate max-w-xs">
                              {item.tags.slice(0, 4).join(', ')}
                            </div>
                          </td>
                          <td className="py-3 px-4 capitalize">
                            <span className="px-2 py-0.5 rounded bg-neutral-800 text-[11px] text-neutral-300 font-medium">
                              {item.category} / {item.subcategory}
                            </span>
                          </td>
                          <td className="py-3 px-4 font-mono text-neutral-300">
                            {item.duration}s
                          </td>
                          <td className="py-3 px-4 font-mono text-neutral-400">
                            {item.downloadsCount}
                          </td>
                          <td className="py-3 px-4 text-right">
                            <button
                              type="button"
                              onClick={() => handleDelete(item.id, item.title)}
                              className="p-1.5 rounded text-neutral-500 hover:text-red-400 hover:bg-red-950/30 transition-colors"
                              title="Delete sound effect"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Categories & Subcategories Management */}
        {activeTab === 'categories' && (
          <div className="flex flex-col gap-6">
            {/* Header row with stats & action */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#141414] border border-neutral-800 rounded-xl p-5 shadow-xl">
              <div>
                <h2 className="text-base font-bold text-white flex items-center gap-2">
                  <FolderTree className="w-5 h-5 text-neutral-400" />
                  <span>Quản Lý Danh Mục & Nhóm Phân Loại</span>
                </h2>
                <p className="text-xs text-neutral-400 mt-1">
                  Thêm mới, đổi tên, cập nhật slug và phân bổ subcategory cho kho hiệu ứng âm thanh.
                </p>
              </div>

              <button
                type="button"
                onClick={openCreateCategory}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white text-black hover:bg-neutral-200 text-xs font-bold transition-all shadow-md active:scale-95 cursor-pointer flex-shrink-0"
              >
                <Plus className="w-4 h-4 stroke-[3]" />
                <span>Thêm Danh Mục Mới</span>
              </button>
            </div>

            {/* Quick Metrics Bar */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-[#141414] border border-neutral-800 rounded-xl p-4 flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-neutral-900 border border-neutral-700 flex items-center justify-center text-white">
                  <Folder className="w-5 h-5 text-white" />
                </div>
                <div>
                  <div className="text-xl font-bold text-white">
                    {categories.filter((c) => c.slug !== 'all').length}
                  </div>
                  <div className="text-xs text-neutral-400">Danh Mục Chính (Categories)</div>
                </div>
              </div>

              <div className="bg-[#141414] border border-neutral-800 rounded-xl p-4 flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-neutral-900 border border-neutral-700 flex items-center justify-center text-white">
                  <Tag className="w-5 h-5 text-white" />
                </div>
                <div>
                  <div className="text-xl font-bold text-white">
                    {categories.reduce((acc, c) => acc + (c.subcategories?.length || 0), 0)}
                  </div>
                  <div className="text-xs text-neutral-400">Nhóm Phụ (Subcategories)</div>
                </div>
              </div>

              <div className="bg-[#141414] border border-neutral-800 rounded-xl p-4 flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-neutral-900 border border-neutral-700 flex items-center justify-center text-white">
                  <FileAudio className="w-5 h-5 text-white" />
                </div>
                <div>
                  <div className="text-xl font-bold text-white">{soundEffects.length}</div>
                  <div className="text-xs text-neutral-400">Tổng Hiệu Ứng Âm Thanh</div>
                </div>
              </div>
            </div>

            {/* Search filter for Categories */}
            <div className="relative">
              <Search className="w-4 h-4 text-neutral-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                placeholder="Tìm kiếm danh mục hoặc nhóm phụ..."
                value={categorySearch}
                onChange={(e) => setCategorySearch(e.target.value)}
                className="w-full bg-[#141414] border border-neutral-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-neutral-600 transition-colors"
              />
            </div>

            {/* Category Cards List */}
            <div className="space-y-4">
              {categories
                .filter((cat) => {
                  if (cat.slug === 'all') return false; // Skip the meta "all" container in admin edit
                  if (!categorySearch.trim()) return true;
                  const q = categorySearch.toLowerCase();
                  const catMatch =
                    cat.name.toLowerCase().includes(q) || cat.slug.toLowerCase().includes(q);
                  const subMatch = (cat.subcategories || []).some(
                    (s) => s.name.toLowerCase().includes(q) || s.slug.toLowerCase().includes(q)
                  );
                  return catMatch || subMatch;
                })
                .map((cat) => {
                  const subList = cat.subcategories || [];

                  return (
                    <div
                      key={cat.id}
                      className="bg-[#141414] border border-neutral-800 hover:border-neutral-700 rounded-2xl p-5 shadow-lg transition-all"
                    >
                      {/* Category Header */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-neutral-800/80">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-neutral-900 border border-neutral-700 flex items-center justify-center text-white">
                            <Folder className="w-4 h-4 text-white" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h3 className="font-bold text-white text-sm sm:text-base">
                                {cat.name}
                              </h3>
                              <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-neutral-800 border border-neutral-700 text-neutral-300">
                                /{cat.slug}
                              </span>
                            </div>
                            <div className="text-[11px] text-neutral-400 mt-0.5">
                              {subList.length} subcategor{subList.length === 1 ? 'y' : 'ies'} •{' '}
                              {cat.count} sound effect{cat.count === 1 ? '' : 's'}
                            </div>
                          </div>
                        </div>

                        {/* Category Actions */}
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => openCreateSubcategory(cat)}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-neutral-800 hover:bg-neutral-700 text-neutral-200 hover:text-white border border-neutral-700 transition-colors cursor-pointer"
                          >
                            <Plus className="w-3.5 h-3.5" />
                            <span>Thêm Subcategory</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => openEditCategory(cat)}
                            className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors cursor-pointer"
                            title="Sửa danh mục"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>

                          <button
                            type="button"
                            onClick={() =>
                              setDeleteConfirm({
                                type: 'category',
                                id: cat.id,
                                name: cat.name,
                              })
                            }
                            className="p-1.5 rounded-lg text-neutral-500 hover:text-red-400 hover:bg-red-950/30 transition-colors cursor-pointer"
                            title="Xóa danh mục"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      {/* Subcategories Container */}
                      <div className="pt-4">
                        <div className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wider mb-2.5 flex items-center justify-between">
                          <span>Các nhóm phụ (Subcategories):</span>
                          <span className="text-neutral-500 font-normal">
                            {subList.length} nhóm
                          </span>
                        </div>

                        {subList.length === 0 ? (
                          <div className="py-4 text-center rounded-xl bg-neutral-900/40 border border-dashed border-neutral-800 text-xs text-neutral-500">
                            Chưa có subcategory nào. Bấm &quot;Thêm Subcategory&quot; để tạo nhóm phụ cho {cat.name}.
                          </div>
                        ) : (
                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                            {subList.map((sub) => (
                              <div
                                key={sub.id}
                                className="flex items-center justify-between px-3.5 py-2.5 rounded-xl bg-neutral-900/80 border border-neutral-800 hover:border-neutral-700 transition-colors"
                              >
                                <div className="min-w-0 pr-2">
                                  <div className="text-xs font-semibold text-neutral-200 truncate" title={sub.name}>
                                    {sub.name}
                                  </div>
                                  <div className="text-[10px] text-neutral-500 font-mono truncate">
                                    /{sub.slug} • {sub.count} SFX
                                  </div>
                                </div>

                                <div className="flex items-center gap-1 flex-shrink-0">
                                  <button
                                    type="button"
                                    onClick={() => openEditSubcategory(cat, sub)}
                                    className="p-1 rounded text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors cursor-pointer"
                                    title="Sửa subcategory"
                                  >
                                    <Edit2 className="w-3 h-3" />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() =>
                                      setDeleteConfirm({
                                        type: 'subcategory',
                                        id: sub.id,
                                        categoryId: cat.id,
                                        name: sub.name,
                                      })
                                    }
                                    className="p-1 rounded text-neutral-500 hover:text-red-400 hover:bg-red-950/30 transition-colors cursor-pointer"
                                    title="Xóa subcategory"
                                  >
                                    <Trash2 className="w-3 h-3" />
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        )}

        {/* Tab 4: Account / User Management */}
        {activeTab === 'users' && (
          <AdminUserManagement currentUser={user} showToast={showToast} />
        )}
      </div>

      {/* ================= MODAL: CREATE / EDIT CATEGORY ================= */}
      {isCategoryModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-black/80 backdrop-blur-sm"
            onClick={() => !isSavingCategory && setIsCategoryModalOpen(false)}
          />
          <div className="relative w-full max-w-md bg-[#161616] border border-neutral-800 rounded-2xl shadow-2xl p-6 z-10 text-white animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-800 mb-4">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Folder className="w-4 h-4 text-white" />
                <span>{editingCategory ? 'Chỉnh Sửa Danh Mục' : 'Thêm Danh Mục Mới'}</span>
              </h3>
              <button
                type="button"
                onClick={() => setIsCategoryModalOpen(false)}
                className="p-1 rounded-lg text-neutral-400 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveCategory} className="space-y-4 text-xs">
              <div>
                <label className="block text-neutral-400 font-medium mb-1">
                  Tên danh mục (Category Name) <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g., Sci-Fi & Space, Vũ Khí, Vehicles..."
                  value={catNameInput}
                  onChange={(e) => {
                    const val = e.target.value;
                    setCatNameInput(val);
                    if (!isCatSlugManual) {
                      setCatSlugInput(slugify(val));
                    }
                  }}
                  autoFocus
                  required
                  className="w-full bg-[#1f1f1f] border border-[#333333] rounded-lg px-3.5 py-2 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-neutral-400 transition-colors"
                />
              </div>

              <div>
                <label className="block text-neutral-400 font-medium mb-1">
                  Mã định danh URL (Slug) <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g., sci-fi-space, weapons, vehicles..."
                  value={catSlugInput}
                  onChange={(e) => {
                    setCatSlugInput(e.target.value);
                    setIsCatSlugManual(true);
                  }}
                  required
                  className="w-full bg-[#1f1f1f] border border-[#333333] rounded-lg px-3.5 py-2 text-xs text-white font-mono placeholder-neutral-500 focus:outline-none focus:border-neutral-400 transition-colors"
                />
                <p className="text-[11px] text-neutral-500 mt-1">
                  Slug được dùng làm tham số URL lọc danh mục (chỉ gồm chữ thường, số và dấu gạch nối).
                </p>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-neutral-800">
                <button
                  type="button"
                  onClick={() => setIsCategoryModalOpen(false)}
                  disabled={isSavingCategory}
                  className="px-4 py-2 rounded-lg text-xs font-semibold text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={isSavingCategory || !catNameInput.trim() || !catSlugInput.trim()}
                  className="px-5 py-2 rounded-lg text-xs font-bold text-black bg-white hover:bg-neutral-200 disabled:opacity-50 transition-all cursor-pointer shadow-md"
                >
                  {isSavingCategory ? (
                    <span className="flex items-center gap-1.5">
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Đang lưu...</span>
                    </span>
                  ) : (
                    <span>{editingCategory ? 'Lưu Thay Đổi' : 'Tạo Danh Mục'}</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL: CREATE / EDIT SUBCATEGORY ================= */}
      {isSubcategoryModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-black/80 backdrop-blur-sm"
            onClick={() => !isSavingCategory && setIsSubcategoryModalOpen(false)}
          />
          <div className="relative w-full max-w-md bg-[#161616] border border-neutral-800 rounded-2xl shadow-2xl p-6 z-10 text-white animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-800 mb-4">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Tag className="w-4 h-4 text-white" />
                <span>{editingSubcategory ? 'Chỉnh Sửa Subcategory' : 'Thêm Subcategory Mới'}</span>
              </h3>
              <button
                type="button"
                onClick={() => setIsSubcategoryModalOpen(false)}
                className="p-1 rounded-lg text-neutral-400 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveSubcategory} className="space-y-4 text-xs">
              <div>
                <label className="block text-neutral-400 font-medium mb-1">
                  Danh mục trực thuộc (Parent Category)
                </label>
                <div className="px-3.5 py-2 rounded-lg bg-neutral-900 border border-neutral-800 text-neutral-300 font-semibold flex items-center gap-2">
                  <Folder className="w-3.5 h-3.5 text-neutral-400" />
                  <span>{targetCategoryForSub?.name}</span>
                  <span className="text-[10px] font-mono text-neutral-500">
                    (/{targetCategoryForSub?.slug})
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-neutral-400 font-medium mb-1">
                  Tên Subcategory <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g., Lasers & Blasters, Tiếng Bước Chân, Explosions..."
                  value={subNameInput}
                  onChange={(e) => {
                    const val = e.target.value;
                    setSubNameInput(val);
                    if (!isSubSlugManual) {
                      setSubSlugInput(slugify(val));
                    }
                  }}
                  autoFocus
                  required
                  className="w-full bg-[#1f1f1f] border border-[#333333] rounded-lg px-3.5 py-2 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-neutral-400 transition-colors"
                />
              </div>

              <div>
                <label className="block text-neutral-400 font-medium mb-1">
                  Mã định danh URL Subcategory (Slug) <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g., lasers-blasters, footsteps, explosions..."
                  value={subSlugInput}
                  onChange={(e) => {
                    setSubSlugInput(e.target.value);
                    setIsSubSlugManual(true);
                  }}
                  required
                  className="w-full bg-[#1f1f1f] border border-[#333333] rounded-lg px-3.5 py-2 text-xs text-white font-mono placeholder-neutral-500 focus:outline-none focus:border-neutral-400 transition-colors"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-neutral-800">
                <button
                  type="button"
                  onClick={() => setIsSubcategoryModalOpen(false)}
                  disabled={isSavingCategory}
                  className="px-4 py-2 rounded-lg text-xs font-semibold text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={isSavingCategory || !subNameInput.trim() || !subSlugInput.trim()}
                  className="px-5 py-2 rounded-lg text-xs font-bold text-black bg-white hover:bg-neutral-200 disabled:opacity-50 transition-all cursor-pointer shadow-md"
                >
                  {isSavingCategory ? (
                    <span className="flex items-center gap-1.5">
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Đang lưu...</span>
                    </span>
                  ) : (
                    <span>{editingSubcategory ? 'Lưu Thay Đổi' : 'Thêm Subcategory'}</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL: DELETE CONFIRMATION ================= */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-black/80 backdrop-blur-sm"
            onClick={() => !isSavingCategory && setDeleteConfirm(null)}
          />
          <div className="relative w-full max-w-sm bg-[#161616] border border-neutral-800 rounded-2xl shadow-2xl p-6 z-10 text-center animate-in fade-in zoom-in-95 duration-150">
            <div className="w-12 h-12 rounded-full bg-red-950/50 border border-red-800/60 flex items-center justify-center text-red-400 mx-auto mb-3">
              <AlertTriangle className="w-6 h-6 stroke-[2]" />
            </div>

            <h3 className="text-base font-bold text-white mb-1">
              Xác Nhận Xóa {deleteConfirm.type === 'category' ? 'Danh Mục' : 'Subcategory'}?
            </h3>
            <p className="text-xs text-neutral-400 mb-5 leading-relaxed">
              Bạn có chắc chắn muốn xóa {deleteConfirm.type === 'category' ? 'danh mục' : 'subcategory'}{' '}
              <strong className="text-white">&quot;{deleteConfirm.name}&quot;</strong>? Thao tác này không thể hoàn tác.
            </p>

            <div className="flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => setDeleteConfirm(null)}
                disabled={isSavingCategory}
                className="px-4 py-2 rounded-lg text-xs font-semibold text-neutral-400 hover:text-white bg-neutral-800 transition-colors cursor-pointer"
              >
                Hủy Bỏ
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                disabled={isSavingCategory}
                className="px-5 py-2 rounded-lg text-xs font-bold text-white bg-red-600 hover:bg-red-500 transition-all cursor-pointer shadow-md disabled:opacity-50"
              >
                {isSavingCategory ? 'Đang xóa...' : 'Xác Nhận Xóa'}
              </button>
            </div>
          </div>
        </div>
      )}

      <LoginModal isOpen={isLoginOpen} onClose={() => setIsLoginOpen(false)} />
    </div>
  );
}
