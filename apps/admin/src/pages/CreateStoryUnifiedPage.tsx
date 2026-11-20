import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link, useParams } from 'react-router-dom';
import {
  BookOpen,
  Headphones,
  FileAudio,
  UploadCloud,
  Image as ImageIcon,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Play,
  Pause,
  Trash2,
  Edit3,
  Plus,
  RefreshCw,
  X,
  Save,
  Link as LinkIcon,
  ArrowRight,
  ArrowLeft,
  Volume2,
  Check,
  Clock,
} from 'lucide-react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useAdminAuth } from '../context/AdminAuthContext';
import {
  uploadBookCoverImage,
  uploadChapterAudioMp3,
  formatFileSize,
  detectAudioDuration,
} from '../services/firebaseAdminStorage';
import { formatDuration } from '@kathaisolli/shared-utils';

export interface StagedChapter {
  id: string; // client id (e.g. temp-1) or backend chapter id
  episodeNumber: number;
  title: string;
  tamilTitle?: string;
  description: string;
  audioFile?: File | null;
  audioUrl?: string;
  durationSec: number;
  fileSizeBytes: number;
  fileName: string;
  status: 'ready' | 'uploading' | 'completed' | 'error';
  progress: number;
  error?: string;
  createdChapterId?: string;
}

export const CreateStoryUnifiedPage: React.FC = () => {
  const navigate = useNavigate();
  const { bookId } = useParams<{ bookId: string }>();
  const { api, permissions } = useAdminAuth();
  const queryClient = useQueryClient();

  const isEditingExistingStory = Boolean(bookId && bookId !== 'new');

  // ---------------------------------------------------------
  // SECTION 1: STORY DETAILS STATE
  // ---------------------------------------------------------
  const [tamilTitle, setTamilTitle] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [authorName, setAuthorName] = useState('குகநாதன்');
  const [narratorName, setNarratorName] = useState('By Anzles Studio');
  const [categoryId, setCategoryId] = useState('');
  const [languageId, setLanguageId] = useState('ta');
  const [storyStatus, setStoryStatus] = useState<'DRAFT' | 'PUBLISHED'>('DRAFT');

  // Cover Image
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string>('');
  const [coverUrlInput, setCoverUrlInput] = useState<string>('');
  const [coverUploadProgress, setCoverUploadProgress] = useState<number>(0);

  // Created Story ID tracking (to prevent duplicate creation on chapter upload retries)
  const [persistedStoryId, setPersistedStoryId] = useState<string | null>(
    isEditingExistingStory ? bookId! : null
  );

  // ---------------------------------------------------------
  // SECTION 2: CHAPTER UPLOAD & STAGING STATE
  // ---------------------------------------------------------
  // Story selection: "__NEW__" means create/use new story, or existing story ID
  const [selectedStoryOption, setSelectedStoryOption] = useState<string>('__NEW__');

  // Input fields for adding / editing a single chapter
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [chapterNumber, setChapterNumber] = useState<number>(1);
  const [chapterTitle, setChapterTitle] = useState('அத்தியாயம் 1 – ஆரம்பம்');
  const [chapterDescription, setChapterDescription] = useState('');
  const [chapterFile, setChapterFile] = useState<File | null>(null);
  const [chapterDuration, setChapterDuration] = useState<number>(0);
  const [chapterPreviewUrl, setChapterPreviewUrl] = useState<string>('');

  // Staged chapters list
  const [stagedChapters, setStagedChapters] = useState<StagedChapter[]>([]);

  // Mini audio player state for active preview
  const [playingAudioSrc, setPlayingAudioSrc] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [audioCurrentTime, setAudioCurrentTime] = useState<number>(0);
  const [audioTotalDuration, setAudioTotalDuration] = useState<number>(0);
  const activeAudioRef = useRef<HTMLAudioElement | null>(null);

  // ---------------------------------------------------------
  // SUBMISSION & STATUS STATE
  // ---------------------------------------------------------
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [overallProgress, setOverallProgress] = useState<number>(0);
  const [globalError, setGlobalError] = useState<string | null>(null);
  const [globalSuccess, setGlobalSuccess] = useState<string | null>(null);
  const [isComplete, setIsComplete] = useState<boolean>(false);

  // ---------------------------------------------------------
  // DATA FETCHING: CATEGORIES & STORIES
  // ---------------------------------------------------------
  const { data: categories = [] } = useQuery({
    queryKey: ['admin', 'categories'],
    queryFn: () => api.admin.listCategories(),
  });

  const { data: storiesData } = useQuery({
    queryKey: ['admin', 'stories', 'list-for-selector'],
    queryFn: () => api.admin.listStories({ pageSize: 50 }),
  });
  const existingStories = storiesData?.items || [];

  // Default category
  useEffect(() => {
    if (categories.length > 0 && !categoryId) {
      setCategoryId(categories[0].id || categories[0].slug);
    }
  }, [categories, categoryId]);

  // Load existing story data if editing
  const { data: existingStory, isLoading: isStoryLoading } = useQuery({
    queryKey: ['admin', 'story', bookId],
    queryFn: () => api.admin.getStory(bookId!),
    enabled: isEditingExistingStory,
  });

  useEffect(() => {
    if (existingStory) {
      setTitle(existingStory.title || '');
      setTamilTitle(existingStory.tamilTitle || '');
      setDescription(existingStory.fullDescription || existingStory.shortDescription || '');
      setAuthorName(existingStory.authorName || 'குகநாதன்');
      setNarratorName(existingStory.narratorName || 'By Anzles Studio');
      setCategoryId(existingStory.categoryId || '');
      setLanguageId(existingStory.languageId || 'ta');
      setStoryStatus(existingStory.status || 'DRAFT');

      const cover = existingStory.coverImage || existingStory.coverImageUrl || '';
      if (cover) {
        setCoverPreview(cover);
        setCoverUrlInput(cover);
      }

      setPersistedStoryId(existingStory.id);
      setSelectedStoryOption(existingStory.id);

      // Pre-fill existing chapters
      if (Array.isArray(existingStory.chapters) && existingStory.chapters.length > 0) {
        const loaded: StagedChapter[] = existingStory.chapters.map((ch: any) => ({
          id: ch.id,
          episodeNumber: ch.number || ch.episodeNumber || 1,
          title: ch.tamilTitle || ch.title || `அத்தியாயம் ${ch.number || 1}`,
          tamilTitle: ch.tamilTitle,
          description: ch.description || '',
          audioUrl: ch.audioUrl,
          durationSec: ch.durationSec || 0,
          fileSizeBytes: ch.fileSizeBytes || 0,
          fileName: ch.fileName || `${ch.title}.mp3`,
          status: 'completed',
          progress: 100,
          createdChapterId: ch.id,
        }));
        setStagedChapters(loaded);
        const nextNum = loaded.length + 1;
        setChapterNumber(nextNum);
        setChapterTitle(`அத்தியாயம் ${nextNum}`);
      }
    }
  }, [existingStory]);

  // ---------------------------------------------------------
  // COVER IMAGE HANDLERS
  // ---------------------------------------------------------
  const handleCoverFileSelect = (file: File) => {
    if (!file.type.match(/^image\/(jpeg|png|webp|jpg)$/i)) {
      setGlobalError('படங்கள் JPG, PNG அல்லது WebP வடிவத்தில் மட்டுமே இருக்க வேண்டும்.');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setGlobalError('படத்தின் அளவு 5MB-க்கு மிகாமல் இருக்க வேண்டும்.');
      return;
    }

    setCoverFile(file);
    const localUrl = URL.createObjectURL(file);
    setCoverPreview(localUrl);
    setCoverUrlInput('');
    setGlobalError(null);
  };

  const handleCoverUrlChange = (url: string) => {
    setCoverUrlInput(url);
    if (url.trim()) {
      setCoverPreview(url.trim());
      setCoverFile(null);
    } else {
      setCoverPreview('');
    }
  };

  const clearCoverImage = () => {
    setCoverFile(null);
    setCoverPreview('');
    setCoverUrlInput('');
  };

  // ---------------------------------------------------------
  // CHAPTER AUDIO SELECTION & METADATA DETECTION
  // ---------------------------------------------------------
  const handleAudioFileSelect = async (file: File) => {
    const isAudio =
      file.type === 'audio/mpeg' ||
      file.type === 'audio/mp3' ||
      file.type === 'audio/x-m4a' ||
      file.type === 'audio/m4a' ||
      file.name.toLowerCase().endsWith('.mp3') ||
      file.name.toLowerCase().endsWith('.m4a');

    if (!isAudio) {
      setGlobalError(
        'தயவுசெய்து MP3 அல்லது M4A ஆடியோ கோப்பை மட்டும் தேர்ந்தெடுக்கவும் (Only MP3/M4A allowed).'
      );
      return;
    }

    if (file.size > 500 * 1024 * 1024) {
      setGlobalError('ஆடியோ கோப்பின் அளவு 500MB-க்கு மிகாமல் இருக்க வேண்டும்.');
      return;
    }

    setGlobalError(null);
    setChapterFile(file);

    const objectUrl = URL.createObjectURL(file);
    setChapterPreviewUrl(objectUrl);

    try {
      const dur = await detectAudioDuration(file);
      setChapterDuration(dur);
    } catch {
      setChapterDuration(180);
    }
  };

  const clearCurrentChapterAudio = () => {
    setChapterFile(null);
    setChapterPreviewUrl('');
    setChapterDuration(0);
    if (playingAudioSrc === chapterPreviewUrl) {
      stopAudioPlayback();
    }
  };

  // ---------------------------------------------------------
  // STAGING CHAPTERS
  // ---------------------------------------------------------
  const handleAddOrUpdateChapter = () => {
    if (!chapterTitle.trim()) {
      setGlobalError('அத்தியாயத்தின் தலைப்பை உள்ளிடவும் (Chapter title is required).');
      return;
    }

    if (!chapterFile && !chapterPreviewUrl) {
      setGlobalError('தயவுசெய்து அத்தியாயத்திற்கான ஆடியோ கோப்பைத் தேர்ந்தெடுக்கவும்.');
      return;
    }

    if (editingIndex !== null) {
      // Updating an existing staged chapter
      setStagedChapters((prev) => {
        const updated = [...prev];
        const existing = updated[editingIndex];
        updated[editingIndex] = {
          ...existing,
          episodeNumber: chapterNumber,
          title: chapterTitle.trim(),
          description: chapterDescription.trim(),
          audioFile: chapterFile || existing.audioFile,
          audioUrl: chapterPreviewUrl || existing.audioUrl,
          durationSec: chapterDuration || existing.durationSec,
          fileSizeBytes: chapterFile ? chapterFile.size : existing.fileSizeBytes,
          fileName: chapterFile ? chapterFile.name : existing.fileName,
          status: 'ready',
          error: undefined,
        };
        return updated;
      });
      setEditingIndex(null);
    } else {
      // Check for duplicate chapter number
      const numExists = stagedChapters.some((ch) => ch.episodeNumber === chapterNumber);
      const assignedNumber = numExists ? stagedChapters.length + 1 : chapterNumber;

      const newChapter: StagedChapter = {
        id: `temp-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        episodeNumber: assignedNumber,
        title: chapterTitle.trim(),
        description: chapterDescription.trim(),
        audioFile: chapterFile,
        audioUrl: chapterPreviewUrl,
        durationSec: chapterDuration,
        fileSizeBytes: chapterFile?.size || 0,
        fileName: chapterFile?.name || `Chapter_${assignedNumber}.mp3`,
        status: 'ready',
        progress: 0,
      };

      setStagedChapters((prev) => [...prev, newChapter]);
    }

    // Reset chapter inputs ready for next
    const nextNum = stagedChapters.length + 2;
    setChapterNumber(nextNum);
    setChapterTitle(`அத்தியாயம் ${nextNum}`);
    setChapterDescription('');
    setChapterFile(null);
    setChapterPreviewUrl('');
    setChapterDuration(0);
    setGlobalError(null);
  };

  const handleEditStagedChapter = (index: number) => {
    const item = stagedChapters[index];
    setEditingIndex(index);
    setChapterNumber(item.episodeNumber);
    setChapterTitle(item.title);
    setChapterDescription(item.description);
    setChapterFile(item.audioFile || null);
    setChapterPreviewUrl(item.audioUrl || '');
    setChapterDuration(item.durationSec);
  };

  const handleDeleteStagedChapter = (index: number) => {
    setStagedChapters((prev) => prev.filter((_, i) => i !== index));
    if (editingIndex === index) {
      setEditingIndex(null);
    }
  };

  // ---------------------------------------------------------
  // INLINE AUDIO PLAYBACK HELPER
  // ---------------------------------------------------------
  const playAudio = (url: string) => {
    if (!url) return;
    if (playingAudioSrc === url && isPlaying) {
      stopAudioPlayback();
      return;
    }

    if (activeAudioRef.current) {
      activeAudioRef.current.pause();
    }

    const audio = new Audio(url);
    activeAudioRef.current = audio;
    setPlayingAudioSrc(url);
    setIsPlaying(true);

    audio.ontimeupdate = () => {
      setAudioCurrentTime(audio.currentTime);
      setAudioTotalDuration(audio.duration || 0);
    };

    audio.onended = () => {
      setIsPlaying(false);
      setAudioCurrentTime(0);
    };

    audio.onerror = () => {
      setIsPlaying(false);
      setGlobalError('ஆடியோவை இயக்க முடியவில்லை.');
    };

    audio.play().catch(() => {
      setIsPlaying(false);
    });
  };

  const stopAudioPlayback = () => {
    if (activeAudioRef.current) {
      activeAudioRef.current.pause();
    }
    setIsPlaying(false);
  };

  const handleSeek = (seconds: number) => {
    if (activeAudioRef.current) {
      activeAudioRef.current.currentTime = seconds;
      setAudioCurrentTime(seconds);
    }
  };

  // ---------------------------------------------------------
  // FINAL SUBMISSION WORKFLOW:
  // 1. Create or update Story in DB
  // 2. Upload cover if local
  // 3. For each staged chapter: create in DB, upload MP3 to Firebase, save metadata
  // ---------------------------------------------------------
  const executeSubmission = async (targetStatus: 'DRAFT' | 'PUBLISHED') => {
    // 1. Validation
    if (!tamilTitle.trim() && !title.trim()) {
      setGlobalError('தயவுசெய்து கதை அல்லது புத்தகத்தின் தலைப்பை உள்ளிடவும்.');
      return;
    }

    // Auto-include current chapter if user entered title & file but forgot to click "Add Another Chapter"
    let chaptersToProcess = [...stagedChapters];
    if (chapterFile && chapterTitle.trim()) {
      const autoNum = chaptersToProcess.length + 1;
      chaptersToProcess.push({
        id: `auto-${Date.now()}`,
        episodeNumber: chapterNumber || autoNum,
        title: chapterTitle.trim(),
        description: chapterDescription.trim(),
        audioFile: chapterFile,
        audioUrl: chapterPreviewUrl,
        durationSec: chapterDuration,
        fileSizeBytes: chapterFile.size,
        fileName: chapterFile.name,
        status: 'ready',
        progress: 0,
      });
      setStagedChapters(chaptersToProcess);
      setChapterFile(null);
      setChapterPreviewUrl('');
    }

    setIsSubmitting(true);
    setGlobalError(null);
    setGlobalSuccess(null);
    setOverallProgress(5);

    try {
      let storyId = persistedStoryId;

      // STEP 1: CREATE OR UPDATE STORY
      if (!storyId || storyOptionIsNew()) {
        let finalCoverUrl = coverUrlInput.trim() || coverPreview;

        // Upload local cover file to Firebase Storage if provided
        if (coverFile) {
          const coverUploadRes = await uploadBookCoverImage(
            `story-${Date.now()}`,
            coverFile,
            (pct) => setCoverUploadProgress(pct)
          );
          finalCoverUrl = coverUploadRes.url;
        }

        const displayTitle =
          tamilTitle.trim() && title.trim()
            ? `${tamilTitle.trim()} (${title.trim()})`
            : tamilTitle.trim() || title.trim();

        const storyPayload = {
          title: displayTitle,
          tamilTitle: tamilTitle.trim() || undefined,
          shortDescription: description.trim().slice(0, 480) || displayTitle,
          fullDescription: description.trim() || undefined,
          coverImage: finalCoverUrl || undefined,
          authorName: authorName.trim() || 'குகநாதன்',
          narratorName: narratorName.trim() || 'By Anzles Studio',
          categoryId: categoryId || (categories[0]?.id || 'general'),
          languageId: languageId || 'ta',
          status: targetStatus,
          tags: [languageId === 'ta' ? 'தமிழ்' : 'English'],
        };

        const created = await api.admin.createStory(storyPayload);
        storyId = created?.id;
        if (!storyId) {
          throw new Error('கதை உருவாக்குவதில் பிழை ஏற்பட்டது (Failed to obtain created story ID).');
        }

        setPersistedStoryId(storyId);
        setSelectedStoryOption(storyId);
      } else {
        // Story already exists: update details
        let finalCoverUrl = coverUrlInput.trim() || coverPreview;
        if (coverFile) {
          const coverUploadRes = await uploadBookCoverImage(storyId, coverFile);
          finalCoverUrl = coverUploadRes.url;
        }

        const displayTitle =
          tamilTitle.trim() && title.trim()
            ? `${tamilTitle.trim()} (${title.trim()})`
            : tamilTitle.trim() || title.trim();

        await api.admin.updateStory(storyId, {
          title: displayTitle,
          tamilTitle: tamilTitle.trim() || undefined,
          shortDescription: description.trim().slice(0, 480) || displayTitle,
          fullDescription: description.trim() || undefined,
          coverImage: finalCoverUrl || undefined,
          authorName: authorName.trim() || 'குகநாதன்',
          narratorName: narratorName.trim() || 'By Anzles Studio',
          categoryId: categoryId || undefined,
          languageId: languageId || undefined,
          status: targetStatus,
        });
      }

      setOverallProgress(30);

      // STEP 2: UPLOAD CHAPTERS
      const totalChapters = chaptersToProcess.length;
      let completedCount = 0;

      for (let i = 0; i < totalChapters; i++) {
        const chapter = chaptersToProcess[i];

        // Skip chapters that have already been uploaded successfully
        if (chapter.status === 'completed' && chapter.createdChapterId) {
          completedCount++;
          continue;
        }

        // Set status to uploading
        updateChapterStatus(i, { status: 'uploading', progress: 10, error: undefined });

        try {
          // 2a. Create Chapter in DB (or reuse existing)
          let chapterId = chapter.createdChapterId;
          if (!chapterId) {
            const createdCh = await api.admin.createChapter(storyId, {
              title: chapter.title,
              episodeNumber: chapter.episodeNumber,
              description: chapter.description || undefined,
              durationSec: chapter.durationSec || 0,
              status: targetStatus,
            });
            chapterId = createdCh?.id;
          }

          if (!chapterId) {
            throw new Error(`அத்தியாயம் ${chapter.episodeNumber} உருவாக்க முடியவில்லை.`);
          }

          // 2b. Upload Audio File to Firebase Storage
          let audioUrl = chapter.audioUrl || '';
          let storagePath = '';
          let durationSec = chapter.durationSec || 0;
          let fileSizeBytes = chapter.fileSizeBytes || 0;
          let fileName = chapter.fileName;

          if (chapter.audioFile) {
            const uploadRes = await uploadChapterAudioMp3(
              storyId,
              chapterId,
              chapter.audioFile,
              (pct) => {
                const chapterOverallProgress = 10 + Math.round(pct * 0.8);
                updateChapterStatus(i, { progress: chapterOverallProgress });
              }
            );

            audioUrl = uploadRes.url;
            storagePath = uploadRes.storagePath;
            durationSec = uploadRes.durationSec || durationSec;
            fileSizeBytes = uploadRes.fileSizeBytes || fileSizeBytes;
            fileName = uploadRes.fileName || fileName;
          }

          // 2c. Save Chapter Audio Metadata in DB
          if (audioUrl) {
            await api.admin.saveChapterAudio(storyId, chapterId, {
              audioUrl,
              storagePath: storagePath || undefined,
              durationSec,
              fileSizeBytes,
              fileName,
            });
          }

          // Mark chapter completed
          updateChapterStatus(i, {
            status: 'completed',
            progress: 100,
            createdChapterId: chapterId,
            audioUrl,
          });

          completedCount++;
          const calcOverall = 30 + Math.round((completedCount / totalChapters) * 65);
          setOverallProgress(calcOverall);
        } catch (chapterErr: any) {
          console.error(`Error uploading chapter ${chapter.episodeNumber}:`, chapterErr);
          const errMsg =
            chapterErr?.response?.data?.message ||
            chapterErr?.message ||
            'அத்தியாய ஆடியோ பதிவேற்றத்தில் பிழை ஏற்பட்டது.';
          updateChapterStatus(i, { status: 'error', error: errMsg });
        }
      }

      // Check if all finished
      queryClient.invalidateQueries({ queryKey: ['admin', 'stories'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'story', storyId] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'dashboard'] });

      const anyFailed = chaptersToProcess.some((ch) => ch.status === 'error');
      if (anyFailed) {
        setGlobalError(
          'சில அத்தியாயங்களை பதிவேற்றுவதில் பிழை ஏற்பட்டது. தயவுசெய்து கீழே உள்ள "மீண்டும் முயற்சிக்க" (Retry) பொத்தானைப் பயன்படுத்தவும்.'
        );
      } else {
        setOverallProgress(100);
        setIsComplete(true);
        setGlobalSuccess(
          'கதை விவரங்களும் அத்தியாயங்களும் வெற்றிகரமாக உருவாக்கப்பட்டு பதிவேற்றப்பட்டன! (Story & chapters uploaded successfully)'
        );
      }
    } catch (err: any) {
      console.error('Fatal submission error:', err);
      setGlobalError(
        err?.response?.data?.message ||
          err?.message ||
          'கதை அல்லது ஆடியோ சேமிப்பதில் பிழை ஏற்பட்டது. தயவுசெய்து மீண்டும் முயற்சிக்கவும்.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const updateChapterStatus = (
    index: number,
    patch: Partial<StagedChapter>
  ) => {
    setStagedChapters((prev) => {
      const copy = [...prev];
      if (copy[index]) {
        copy[index] = { ...copy[index], ...patch };
      }
      return copy;
    });
  };

  const storyOptionIsNew = () => selectedStoryOption === '__NEW__';

  // ---------------------------------------------------------
  // RETRY A SINGLE CHAPTER
  // ---------------------------------------------------------
  const handleRetrySingleChapter = async (index: number) => {
    const storyId = persistedStoryId;
    if (!storyId) {
      setGlobalError('கதையை முதலில் உருவாக்க வேண்டும்.');
      return;
    }

    const chapter = stagedChapters[index];
    if (!chapter) return;

    updateChapterStatus(index, { status: 'uploading', progress: 10, error: undefined });

    try {
      let chapterId = chapter.createdChapterId;
      if (!chapterId) {
        const createdCh = await api.admin.createChapter(storyId, {
          title: chapter.title,
          episodeNumber: chapter.episodeNumber,
          description: chapter.description || undefined,
          durationSec: chapter.durationSec || 0,
          status: storyStatus,
        });
        chapterId = createdCh?.id;
      }

      if (!chapterId) {
        throw new Error('அத்தியாயம் ஐடி பெற முடியவில்லை.');
      }

      let audioUrl = chapter.audioUrl || '';
      let storagePath = '';
      let durationSec = chapter.durationSec || 0;
      let fileSizeBytes = chapter.fileSizeBytes || 0;
      let fileName = chapter.fileName;

      if (chapter.audioFile) {
        const uploadRes = await uploadChapterAudioMp3(
          storyId,
          chapterId,
          chapter.audioFile,
          (pct) => {
            updateChapterStatus(index, { progress: 10 + Math.round(pct * 0.8) });
          }
        );
        audioUrl = uploadRes.url;
        storagePath = uploadRes.storagePath;
        durationSec = uploadRes.durationSec || durationSec;
        fileSizeBytes = uploadRes.fileSizeBytes || fileSizeBytes;
        fileName = uploadRes.fileName || fileName;
      }

      if (audioUrl) {
        await api.admin.saveChapterAudio(storyId, chapterId, {
          audioUrl,
          storagePath: storagePath || undefined,
          durationSec,
          fileSizeBytes,
          fileName,
        });
      }

      updateChapterStatus(index, {
        status: 'completed',
        progress: 100,
        createdChapterId: chapterId,
        audioUrl,
        error: undefined,
      });

      queryClient.invalidateQueries({ queryKey: ['admin', 'story', storyId] });
    } catch (err: any) {
      const errMsg =
        err?.response?.data?.message || err?.message || 'மீண்டும் பதிவேற்றுவதில் தோல்வி ஏற்பட்டது.';
      updateChapterStatus(index, { status: 'error', error: errMsg });
    }
  };

  // Stepper calculations
  const isStep1Complete = Boolean(tamilTitle.trim() || title.trim());
  const isStep2Complete = stagedChapters.length > 0;
  const isStep3Complete = isComplete;

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6 pb-28">
      {/* ------------------------------------------------------------- */}
      {/* TOP BREADCRUMB                                                */}
      {/* ------------------------------------------------------------- */}
      <div className="flex items-center justify-between text-xs text-gray-500">
        <div className="flex items-center gap-2">
          <Link to="/admin" className="text-gray-500 hover:text-emerald-800 font-tamil">
            கதைசொல்லி
          </Link>
          <span>&gt;</span>
          <Link to="/admin/dashboard" className="text-gray-500 hover:text-emerald-800 font-tamil">
            டாஷ்போர்டு (Dashboard)
          </Link>
          <span>&gt;</span>
          <span className="font-bold text-emerald-900 font-tamil">
            புதிய கதை உருவாக்கம் & ஆடியோ பதிவேற்றம்
          </span>
        </div>

        <Link
          to="/"
          target="_blank"
          className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 font-semibold border border-emerald-200 hover:bg-emerald-100 transition-colors"
        >
          <span className="font-tamil">நேரடி தளம் (Live Website)</span>
          <span className="text-xs">↗</span>
        </Link>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* 1. HERO HEADER WITH 3-STEP INDICATOR                          */}
      {/* ------------------------------------------------------------- */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-200/90 shadow-sm flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="flex items-start sm:items-center gap-4">
          <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-br from-emerald-800 to-[#064E3B] flex items-center justify-center shrink-0 shadow-md">
            <div className="relative">
              <BookOpen className="w-7 h-7 text-emerald-100" />
              <Headphones className="w-5 h-5 text-amber-300 absolute -top-2 -right-2" />
            </div>
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-gray-900 font-tamil tracking-tight">
              புதிய கதை உருவாக்கம் & ஆடியோ பதிவேற்றம்
            </h1>
            <h2 className="text-sm sm:text-base font-bold text-gray-700">
              Create Story & Upload Audio
            </h2>
            <p className="text-xs sm:text-sm text-gray-500 mt-1 font-tamil">
              ஒரே பக்கத்தில் கதை விவரங்களை உருவாக்கி, அதற்கான அத்தியாய MP3 ஆடியோக்களை பதிவேற்றுங்கள்.
            </p>
          </div>
        </div>

        {/* 3-Step Indicator matching mockup */}
        <div className="flex items-center justify-center gap-3 sm:gap-6 bg-[#FAF7EE] px-5 py-3 rounded-2xl border border-amber-200/60 shrink-0">
          {/* Step 1 */}
          <div className="flex flex-col items-center text-center">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                isStep1Complete
                  ? 'bg-emerald-700 text-white shadow-sm'
                  : 'bg-emerald-700 text-white ring-4 ring-emerald-100'
              }`}
            >
              1
            </div>
            <span className="text-[11px] font-bold text-gray-800 mt-1 font-tamil">கதை விவரம்</span>
            <span className="text-[10px] text-gray-500 font-sans">Story Details</span>
          </div>

          <div className="w-8 sm:w-10 h-0.5 bg-gray-300" />

          {/* Step 2 */}
          <div className="flex flex-col items-center text-center">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                isStep2Complete
                  ? 'bg-emerald-700 text-white shadow-sm'
                  : 'bg-gray-200 text-gray-600'
              }`}
            >
              2
            </div>
            <span className="text-[11px] font-bold text-gray-800 mt-1 font-tamil">அத்தியாயங்கள்</span>
            <span className="text-[10px] text-gray-500 font-sans">Chapters</span>
          </div>

          <div className="w-8 sm:w-10 h-0.5 bg-gray-300" />

          {/* Step 3 */}
          <div className="flex flex-col items-center text-center">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                isStep3Complete
                  ? 'bg-emerald-700 text-white shadow-sm'
                  : 'bg-gray-200 text-gray-600'
              }`}
            >
              3
            </div>
            <span className="text-[11px] font-bold text-gray-800 mt-1 font-tamil">முடிவு</span>
            <span className="text-[10px] text-gray-500 font-sans">Complete</span>
          </div>
        </div>
      </div>

      {/* Global Alerts */}
      {globalError && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs sm:text-sm flex items-start sm:items-center gap-3">
          <AlertCircle className="w-5 h-5 shrink-0 text-rose-600 mt-0.5 sm:mt-0" />
          <div className="flex-1 font-tamil">{globalError}</div>
          <button
            onClick={() => setGlobalError(null)}
            className="text-rose-500 hover:text-rose-700 p-1"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {globalSuccess && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs sm:text-sm flex items-start sm:items-center gap-3">
          <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-600 mt-0.5 sm:mt-0" />
          <div className="flex-1 font-tamil">{globalSuccess}</div>
          {persistedStoryId && (
            <div className="flex items-center gap-2">
              <Link
                to={`/admin/stories/${persistedStoryId}/chapters`}
                className="px-3 py-1.5 rounded-xl bg-emerald-700 text-white font-bold text-xs hover:bg-emerald-800"
              >
                அத்தியாயங்கள் மேலாண்மை
              </Link>
            </div>
          )}
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* 2. TOP CARDS GRID: STORY DETAILS (LEFT) & COVER ART (RIGHT)    */}
      {/* ------------------------------------------------------------- */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* STORY DETAILS CARD */}
        <div className="lg:col-span-7 xl:col-span-8 bg-white rounded-3xl p-6 sm:p-7 border border-gray-200/90 shadow-sm space-y-5">
          <div className="flex items-center gap-2 border-b border-gray-100 pb-3">
            <BookOpen className="w-5 h-5 text-emerald-800" />
            <h3 className="text-base sm:text-lg font-bold text-gray-900 font-tamil">
              1. கதை விவரங்கள் (Story Details)
            </h3>
          </div>

          {/* Row 1: Titles */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-gray-700 font-tamil">
                கதை தலைப்பு (Tamil Title) <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="எ.கா: பொன்னியின் செல்வன்"
                value={tamilTitle}
                onChange={(e) => setTamilTitle(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-700 font-tamil"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-gray-700 font-tamil">
                ஆங்கில தலைப்பு (English / Phonetic Title)
              </label>
              <input
                type="text"
                placeholder="e.g. Ponniyin Selvan"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-700"
              />
            </div>
          </div>

          {/* Row 2: Description */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-gray-700 font-tamil">
              கதை விளக்கம் (Description) <span className="text-rose-500">*</span>
            </label>
            <textarea
              rows={3}
              placeholder="கதையின் சுருக்கமான அறிமுகம்..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-700 font-tamil"
            />
          </div>

          {/* Row 3: Author & Narrator */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-gray-700 font-tamil">
                எழுத்தாளர் பெயர் (Author Name) <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                placeholder="குகநாதன்"
                value={authorName}
                onChange={(e) => setAuthorName(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-700 font-tamil"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-gray-700 font-tamil">
                குரல் / ஸ்டுடியோ (Narrator / Studio)
              </label>
              <input
                type="text"
                placeholder="By Anzles Studio"
                value={narratorName}
                onChange={(e) => setNarratorName(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-700"
              />
            </div>
          </div>

          {/* Row 4: Category, Language, Status */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-gray-700 font-tamil">
                வகைப்பாடு (Category) <span className="text-rose-500">*</span>
              </label>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-xs sm:text-sm bg-white focus:outline-none focus:ring-2 focus:ring-emerald-700 font-tamil"
              >
                {categories.length > 0 ? (
                  categories.map((c: any) => (
                    <option key={c.id || c.slug} value={c.id || c.slug}>
                      {c.name || c.title || c.slug}
                    </option>
                  ))
                ) : (
                  <>
                    <option value="history">வரலாறு (History)</option>
                    <option value="spiritual">ஆன்மீகம் (Spiritual)</option>
                    <option value="novel">நாவல் (Novel)</option>
                    <option value="motivation">தன்னம்பிக்கை (Motivation)</option>
                  </>
                )}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-gray-700 font-tamil">
                மொழி (Language) <span className="text-rose-500">*</span>
              </label>
              <select
                value={languageId}
                onChange={(e) => setLanguageId(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-xs sm:text-sm bg-white focus:outline-none focus:ring-2 focus:ring-emerald-700 font-tamil"
              >
                <option value="ta">தமிழ் (Tamil)</option>
                <option value="en">English (ஆங்கிலம்)</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-gray-700 font-tamil">
                வெளியீடு நிலை (Status) <span className="text-rose-500">*</span>
              </label>
              <select
                value={storyStatus}
                onChange={(e) => setStoryStatus(e.target.value as 'DRAFT' | 'PUBLISHED')}
                className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-xs sm:text-sm bg-white focus:outline-none focus:ring-2 focus:ring-emerald-700 font-tamil"
              >
                <option value="DRAFT">வரைவு (Save as Draft)</option>
                <option value="PUBLISHED">வெளியிடப்பட்டது (Published)</option>
              </select>
            </div>
          </div>
        </div>

        {/* STORY COVER ART CARD */}
        <div className="lg:col-span-5 xl:col-span-4 bg-white rounded-3xl p-6 sm:p-7 border border-gray-200/90 shadow-sm space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 border-b border-gray-100 pb-3 mb-4">
              <ImageIcon className="w-5 h-5 text-emerald-800" />
              <h3 className="text-base sm:text-lg font-bold text-gray-900 font-tamil">
                கதை அட்டைப்படம் (Story Cover Art)
              </h3>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 items-center">
              {/* Drag & Drop Upload Area */}
              <div
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  e.preventDefault();
                  const file = e.dataTransfer.files?.[0];
                  if (file) handleCoverFileSelect(file);
                }}
                className="w-full flex-1 border-2 border-dashed border-emerald-300 bg-emerald-50/40 rounded-2xl p-5 text-center hover:bg-emerald-50/70 transition-colors"
              >
                <ImageIcon className="w-8 h-8 text-emerald-700 mx-auto mb-2 opacity-80" />
                <p className="text-xs font-bold text-gray-800 font-tamil">
                  படத்தை இங்கே இழுத்து விடுங்கள்
                </p>
                <p className="text-[11px] text-gray-500 font-tamil mb-3">
                  அல்லது கிளிக் செய்து தேர்வுசெய்க
                </p>

                <label className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs cursor-pointer shadow-sm transition-all hover:scale-105">
                  <UploadCloud className="w-4 h-4" />
                  <span className="font-tamil">படம் தேர்வு (Choose Image)</span>
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleCoverFileSelect(file);
                    }}
                  />
                </label>

                <p className="text-[10px] text-gray-400 mt-2 font-tamil">
                  ஆதரவு: JPG, PNG, WebP | அதிகபட்ச அளவு: 5 MB
                </p>
              </div>

              {/* Cover Preview Thumbnail */}
              {coverPreview && (
                <div className="relative group shrink-0">
                  <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-2xl overflow-hidden border-2 border-emerald-300 shadow-md bg-gray-100 flex items-center justify-center">
                    <img
                      src={coverPreview}
                      alt="Story Cover"
                      className="w-full h-full object-cover"
                      onError={() => setCoverPreview('')}
                    />
                  </div>
                  <button
                    type="button"
                    onClick={clearCoverImage}
                    title="Remove Cover Image"
                    className="absolute -top-2 -right-2 p-1.5 rounded-full bg-rose-500 hover:bg-rose-600 text-white shadow-md transition-all hover:scale-110"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>

            {/* Divider */}
            <div className="relative flex py-3 items-center">
              <div className="flex-grow border-t border-gray-200" />
              <span className="flex-shrink mx-3 text-xs font-semibold text-gray-400 font-tamil">
                அல்லது
              </span>
              <div className="flex-grow border-t border-gray-200" />
            </div>

            {/* Direct Image URL input */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-gray-700 font-tamil">
                நேரடி பட URL (Direct Image URL)
              </label>
              <div className="relative">
                <LinkIcon className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                <input
                  type="url"
                  placeholder="https://example.com/cover.jpg"
                  value={coverUrlInput}
                  onChange={(e) => handleCoverUrlChange(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 rounded-xl border border-gray-200 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-700"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* 3. AUDIO / CHAPTER UPLOAD SECTION                             */}
      {/* ------------------------------------------------------------- */}
      <div className="bg-white rounded-3xl p-6 sm:p-7 border border-gray-200/90 shadow-sm space-y-6">
        <div className="flex items-center justify-between border-b border-gray-100 pb-3">
          <div className="flex items-center gap-2">
            <Headphones className="w-5 h-5 text-emerald-800" />
            <h3 className="text-base sm:text-lg font-bold text-gray-900 font-tamil">
              2. அத்தியாய ஆடியோ பதிவேற்றம் (Chapter Audio Upload)
            </h3>
          </div>
        </div>

        {/* Story Selection, Chapter No, Chapter Title */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
          <div className="md:col-span-5 space-y-1.5">
            <label className="block text-xs font-bold text-gray-700 font-tamil">
              கதை தேர்வு (Story Selection) <span className="text-rose-500">*</span>
            </label>
            <select
              value={selectedStoryOption}
              onChange={(e) => {
                const val = e.target.value;
                setSelectedStoryOption(val);
                if (val !== '__NEW__') {
                  setPersistedStoryId(val);
                } else {
                  setPersistedStoryId(null);
                }
              }}
              className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-xs sm:text-sm bg-white focus:outline-none focus:ring-2 focus:ring-emerald-700 font-tamil"
            >
              <option value="__NEW__">
                ✨ {tamilTitle || title ? `${tamilTitle || title} (புதிய கதை)` : 'புதிய கதை (தற்போது உருவாக்கப்படுவது)'}
              </option>
              {existingStories.map((st: any) => (
                <option key={st.id} value={st.id}>
                  📚 {st.tamilTitle || st.title}
                </option>
              ))}
            </select>
          </div>

          <div className="md:col-span-3 space-y-1.5">
            <label className="block text-xs font-bold text-gray-700 font-tamil">
              அத்தியாய எண் (Chapter No.) <span className="text-rose-500">*</span>
            </label>
            <input
              type="number"
              min={1}
              value={chapterNumber}
              onChange={(e) => setChapterNumber(parseInt(e.target.value, 10) || 1)}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-700"
            />
          </div>

          <div className="md:col-span-4 space-y-1.5">
            <label className="block text-xs font-bold text-gray-700 font-tamil">
              அத்தியாய தலைப்பு (Chapter Title) <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="அத்தியாயம் 1 – ஆரம்பம்"
              value={chapterTitle}
              onChange={(e) => setChapterTitle(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-700 font-tamil"
            />
          </div>
        </div>

        {/* Chapter Description */}
        <div className="space-y-1.5">
          <label className="block text-xs font-bold text-gray-700 font-tamil">
            அத்தியாய விளக்கம் (Chapter Description)
          </label>
          <textarea
            rows={2}
            placeholder="இந்த அத்தியாயம் கதையின் தொடக்கத்தை அறிமுகப்படுத்துகிறது..."
            value={chapterDescription}
            onChange={(e) => setChapterDescription(e.target.value)}
            className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-700 font-tamil"
          />
        </div>

        {/* Audio Drag & Drop + Preview Player + Add Chapter Button */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-center">
          {/* Audio Dropzone */}
          <div
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              const file = e.dataTransfer.files?.[0];
              if (file) handleAudioFileSelect(file);
            }}
            className="lg:col-span-5 border-2 border-dashed border-emerald-300 bg-emerald-50/40 rounded-2xl p-5 text-center hover:bg-emerald-50/70 transition-colors"
          >
            <FileAudio className="w-8 h-8 text-emerald-700 mx-auto mb-2 opacity-80" />
            <p className="text-xs font-bold text-gray-800 font-tamil">
              MP3 ஆடியோ கோப்பை இங்கே இழுத்து விடுங்கள்
            </p>
            <p className="text-[11px] text-gray-500 font-tamil mb-3">அல்லது தேர்வு செய்யவும்</p>

            <label className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs cursor-pointer shadow-sm transition-all hover:scale-105">
              <Headphones className="w-4 h-4" />
              <span className="font-tamil">MP3 தேர்வு (Choose MP3)</span>
              <input
                type="file"
                accept="audio/mp3,audio/mpeg,audio/x-m4a,audio/m4a"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleAudioFileSelect(file);
                }}
              />
            </label>

            <p className="text-[10px] text-gray-400 mt-2 font-tamil">
              ஆதரவு: MP3, M4A | அதிகபட்ச அளவு: 500 MB
            </p>
          </div>

          {/* Audio File Preview Player */}
          <div className="lg:col-span-4">
            {chapterFile || chapterPreviewUrl ? (
              <div className="bg-[#FAF7EE] border border-amber-200/80 rounded-2xl p-4 space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="p-2 bg-emerald-100 rounded-xl text-emerald-800 shrink-0">
                      <FileAudio className="w-5 h-5" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-gray-900 truncate">
                        {chapterFile?.name || 'Audio Preview'}
                      </p>
                      <p className="text-[11px] text-gray-500">
                        {chapterFile ? formatFileSize(chapterFile.size) : ''}
                        {chapterDuration > 0 && ` | நேரம்: ${formatDuration(chapterDuration)}`}
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={clearCurrentChapterAudio}
                    className="p-1.5 text-gray-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors"
                    title="Remove audio"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                {/* Inline playback controls */}
                <div className="flex items-center gap-3 pt-1">
                  <button
                    type="button"
                    onClick={() => playAudio(chapterPreviewUrl)}
                    className="p-2.5 rounded-full bg-emerald-700 hover:bg-emerald-800 text-white shadow-sm transition-transform hover:scale-105 shrink-0"
                  >
                    {isPlaying && playingAudioSrc === chapterPreviewUrl ? (
                      <Pause className="w-4 h-4" />
                    ) : (
                      <Play className="w-4 h-4 translate-x-0.5" />
                    )}
                  </button>

                  <div className="flex-1 space-y-1">
                    <input
                      type="range"
                      min={0}
                      max={
                        playingAudioSrc === chapterPreviewUrl && audioTotalDuration > 0
                          ? audioTotalDuration
                          : chapterDuration || 100
                      }
                      value={playingAudioSrc === chapterPreviewUrl ? audioCurrentTime : 0}
                      onChange={(e) => handleSeek(parseFloat(e.target.value))}
                      className="w-full accent-emerald-700 h-1.5 bg-gray-200 rounded-lg cursor-pointer"
                    />
                    <div className="flex justify-between text-[10px] text-gray-500 font-mono">
                      <span>
                        {playingAudioSrc === chapterPreviewUrl
                          ? formatDuration(Math.round(audioCurrentTime))
                          : '00:00'}
                      </span>
                      <span>{formatDuration(chapterDuration)}</span>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="h-full min-h-[110px] border border-gray-200 rounded-2xl bg-gray-50/60 p-4 flex flex-col items-center justify-center text-center text-gray-400">
                <FileAudio className="w-6 h-6 mb-1 opacity-40" />
                <span className="text-xs font-tamil">ஆடியோ கோப்பு தேர்ந்தெடுக்கப்படவில்லை</span>
                <span className="text-[10px]">No audio file chosen yet</span>
              </div>
            )}
          </div>

          {/* Add / Update Chapter Button */}
          <div className="lg:col-span-3 flex justify-center lg:justify-end">
            <button
              type="button"
              onClick={handleAddOrUpdateChapter}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl border-2 border-emerald-700 bg-emerald-50/50 hover:bg-emerald-100/70 text-emerald-800 font-bold text-xs sm:text-sm shadow-sm transition-all hover:scale-105"
            >
              {editingIndex !== null ? (
                <>
                  <Check className="w-4 h-4" />
                  <span className="font-tamil">அத்தியாயத்தைப் புதுப்பி (Update Chapter)</span>
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4" />
                  <span className="font-tamil">அத்தியாயத்தை சேர்க்க (Add Another Chapter)</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* ----------------------------------------------------------- */}
        {/* 4. ADDED CHAPTERS TABLE                                      */}
        {/* ----------------------------------------------------------- */}
        <div className="pt-4 border-t border-gray-100 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-emerald-700" />
              <h4 className="text-sm font-bold text-gray-900 font-tamil">
                சேர்க்கப்பட்ட அத்தியாயங்கள் (Added Chapters)
              </h4>
              <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold">
                {stagedChapters.length}
              </span>
            </div>
          </div>

          {stagedChapters.length === 0 ? (
            <div className="p-8 rounded-2xl bg-[#FAF7EE] border border-dashed border-amber-300 text-center space-y-2">
              <Headphones className="w-8 h-8 text-amber-700/60 mx-auto" />
              <p className="text-xs font-bold text-gray-700 font-tamil">
                இன்னும் அத்தியாயங்கள் எதுவும் சேர்க்கப்படவில்லை
              </p>
              <p className="text-[11px] text-gray-500 font-tamil">
                மேலே உள்ள படிவத்தில் ஆடியோ கோப்பைத் தேர்ந்தெடுத்து &apos;அத்தியாயத்தை சேர்க்க&apos; பொத்தானை அழுத்தவும்.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto rounded-2xl border border-gray-200">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-[#FAF7EE] text-gray-700 font-bold border-b border-gray-200">
                  <tr>
                    <th className="py-3 px-3.5 w-12 text-center">#</th>
                    <th className="py-3 px-4 font-tamil">அத்தியாய தலைப்பு (Chapter Title)</th>
                    <th className="py-3 px-4 font-tamil">கோப்பு (Audio File)</th>
                    <th className="py-3 px-4 font-tamil">நேரம் (Duration)</th>
                    <th className="py-3 px-4 font-tamil">அளவு (Size)</th>
                    <th className="py-3 px-4 font-tamil">நிலை (Status)</th>
                    <th className="py-3 px-4 text-center font-tamil">செயல்கள் (Actions)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 bg-white">
                  {stagedChapters.map((ch, idx) => (
                    <tr key={ch.id} className="hover:bg-emerald-50/30 transition-colors">
                      <td className="py-3 px-3.5 text-center font-bold text-gray-500">
                        {ch.episodeNumber}
                      </td>
                      <td className="py-3 px-4 font-medium text-gray-900 font-tamil">
                        {ch.title}
                        {ch.description && (
                          <span className="block text-[11px] text-gray-400 truncate max-w-xs">
                            {ch.description}
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-gray-600 truncate max-w-[160px]">
                        <span className="inline-flex items-center gap-1.5 font-mono text-[11px]">
                          <FileAudio className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                          <span className="truncate">{ch.fileName}</span>
                        </span>
                      </td>
                      <td className="py-3 px-4 font-mono text-gray-600">
                        {ch.durationSec > 0 ? formatDuration(ch.durationSec) : '–'}
                      </td>
                      <td className="py-3 px-4 font-mono text-gray-600">
                        {ch.fileSizeBytes > 0 ? formatFileSize(ch.fileSizeBytes) : '–'}
                      </td>
                      <td className="py-3 px-4">
                        {ch.status === 'completed' && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-bold font-tamil">
                            <CheckCircle2 className="w-3 h-3 text-emerald-700" />
                            <span>பதிவேற்றம் முடிந்தது</span>
                          </span>
                        )}
                        {ch.status === 'ready' && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-100 text-amber-800 text-[11px] font-bold font-tamil">
                            <Clock className="w-3 h-3 text-amber-700" />
                            <span>பதிவேற்றத்திற்கு தயார்</span>
                          </span>
                        )}
                        {ch.status === 'uploading' && (
                          <div className="space-y-1 min-w-[110px]">
                            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-700 font-tamil">
                              <RefreshCw className="w-3 h-3 animate-spin text-blue-700" />
                              <span>பதிவேற்றப்படுகிறது {ch.progress}%</span>
                            </span>
                            <div className="w-full bg-blue-100 h-1.5 rounded-full overflow-hidden">
                              <div
                                className="bg-blue-600 h-1.5 rounded-full transition-all duration-300"
                                style={{ width: `${ch.progress}%` }}
                              />
                            </div>
                          </div>
                        )}
                        {ch.status === 'error' && (
                          <div className="space-y-1">
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 text-[10px] font-bold font-tamil">
                              <AlertCircle className="w-3 h-3 text-rose-600 shrink-0" />
                              <span className="truncate max-w-[120px]" title={ch.error}>
                                {ch.error || 'பிழை'}
                              </span>
                            </span>
                            <button
                              type="button"
                              onClick={() => handleRetrySingleChapter(idx)}
                              className="text-[11px] font-bold text-emerald-800 hover:underline block font-tamil"
                            >
                              மீண்டும் பதிவேற்று (Retry)
                            </button>
                          </div>
                        )}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <div className="inline-flex items-center gap-1.5">
                          {ch.audioUrl && (
                            <button
                              type="button"
                              onClick={() => playAudio(ch.audioUrl!)}
                              title="Play preview"
                              className="p-1.5 rounded-lg hover:bg-emerald-50 text-emerald-800 transition-colors"
                            >
                              {isPlaying && playingAudioSrc === ch.audioUrl ? (
                                <Pause className="w-3.5 h-3.5" />
                              ) : (
                                <Play className="w-3.5 h-3.5" />
                              )}
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => handleEditStagedChapter(idx)}
                            title="Edit Chapter"
                            className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-600 transition-colors"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteStagedChapter(idx)}
                            title="Delete Chapter"
                            className="p-1.5 rounded-lg hover:bg-rose-50 text-rose-600 transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* 5. STICKY ACTION BAR AT BOTTOM                                */}
      {/* ------------------------------------------------------------- */}
      <div className="fixed bottom-0 left-0 right-0 lg:left-64 bg-white/95 backdrop-blur-md border-t border-gray-200 py-4 px-6 sm:px-8 shadow-2xl z-30 flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Left Side: Save as Draft */}
        <button
          type="button"
          disabled={isSubmitting}
          onClick={() => executeSubmission('DRAFT')}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-2xl border-2 border-gray-300 hover:border-gray-400 bg-white hover:bg-gray-50 text-gray-800 font-bold text-xs sm:text-sm shadow-sm transition-all disabled:opacity-50"
        >
          <Save className="w-4 h-4 text-gray-600" />
          <span className="font-tamil">வரைவு ஆக சேமிக்க (Save as Draft)</span>
        </button>

        {/* Right Side: Create Story & Upload Chapters */}
        <div className="flex items-center gap-4 w-full sm:w-auto">
          {isSubmitting && (
            <div className="hidden sm:flex items-center gap-2 text-xs font-bold text-emerald-800">
              <RefreshCw className="w-4 h-4 animate-spin" />
              <span className="font-tamil">பதிவேற்றப்படுகிறது... {overallProgress}%</span>
            </div>
          )}

          <button
            type="button"
            disabled={isSubmitting}
            onClick={() => executeSubmission(storyStatus)}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-8 py-3.5 rounded-2xl bg-gradient-to-r from-emerald-800 to-[#064E3B] hover:from-emerald-700 hover:to-emerald-800 text-white font-bold text-xs sm:text-sm shadow-lg transition-all hover:scale-105 disabled:opacity-60 disabled:hover:scale-100"
          >
            {isSubmitting ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span className="font-tamil">பதிவேற்றப்படுகிறது ({overallProgress}%)...</span>
              </>
            ) : (
              <>
                <UploadCloud className="w-4 h-4 text-emerald-200" />
                <span className="font-tamil">
                  கதை உருவாக்கி அத்தியாயங்களை பதிவேற்றவும் (Create Story & Upload Chapters)
                </span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
export default CreateStoryUnifiedPage;
