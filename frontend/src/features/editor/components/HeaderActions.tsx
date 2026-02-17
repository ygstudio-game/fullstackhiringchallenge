import { useState } from 'react';
import { useEditorStore, useAuthStore } from '@stores';
import { postService } from '@api/services/postService';
import { useNavigate } from 'react-router-dom'; // <-- Add this
import toast from 'react-hot-toast';
import { ThemeToggle } from '@/components/ui/ThemeToggle'; 

export function HeaderActions() {
  const { documentId, localState, setDocumentStatus, documentStatus, syncDraftInList } = useEditorStore();
  const { logout, email } = useAuthStore();
  const [shareText, setShareText] = useState('Share');
const navigate = useNavigate(); // <-- Add this
  const handlePublish = async () => {
    if (!documentId || !localState) return;
    
    try {
      // 1. Send the lexical state update to ensure the latest changes are saved
      await postService.update(documentId, {
        lexical_state: JSON.parse(localState),
        status: 'PUBLISHED'
      });
      
      // 2. Trigger the publish endpoint
      await postService.publish(documentId);
      
      // 3. Update Global State
      setDocumentStatus('PUBLISHED');
      syncDraftInList(documentId, { 
        status: 'PUBLISHED',
        content: JSON.parse(localState) 
      });
      
      toast.success('Document published successfully!'); // You can add success toasts manually
    } catch (error) {
      console.error("Publishing failed:", error);
      toast.error('Failed to publish document. Please try again.'); // You can add error toasts manually
    }
  };
  const handleLogout = () => {
    logout(); // 1. Purge the Auth Zustand Store & LocalStorage
    navigate(`/login`); // 2. Redirect to Login page
   };

  const handleShare = async () => {
    if (!documentId) return;
    
    const shareUrl = `${window.location.origin}/preview/${documentId}`;
    
    try {
      await navigator.clipboard.writeText(shareUrl);
      setShareText('Copied!');
      toast.success('Share link copied to clipboard!'); // You can add success toasts manually
      setTimeout(() => setShareText('Share'), 2000);
    } catch (err) {
      console.error('Failed to copy!', err);
      toast.error('Failed to copy share link. Please try again.'); // You can add error toasts manually
    }
  };

  return (
    <div className="flex items-center gap-3">
      {/* Share Button */}
      <button 
        onClick={handleShare}
        className="text-sm font-medium text-gray-500 hover:text-white transition-colors w-16 text-center"
      >
        {shareText}
      </button>

      {/* Publish Button */}
      <button 
        onClick={handlePublish}
        disabled={documentStatus === 'PUBLISHED'}
        className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${
          documentStatus === 'PUBLISHED' 
          ? 'bg-green-100 text-green-700 cursor-default' 
          : 'bg-black text-white hover:bg-gray-800'
        }`}
      >
        {documentStatus === 'PUBLISHED' ? '✓ Published' : 'Publish'}
      </button>

      {/* Vertical Divider - Uses our soft 'line' color */}
      <div className="w-px h-5 bg-line mx-1 hidden sm:block"></div>

      {/* 2. THE THEME TOGGLE */}
      <ThemeToggle />

      {/* Profile & Logout Section */}
      <div className="flex items-center gap-3 border-l border-gray-200 pl-4 ml-2">
        <div className="flex items-center justify-center w-8 h-8 bg-indigo-100 text-indigo-700 rounded-full font-bold text-sm uppercase">
          {email ? email.charAt(0) : 'U'}
        </div>
        <span className="text-xs text-gray-600 font-medium truncate max-w-[120px] hidden sm:block">
          {email || 'User'}
        </span>
        <button
          onClick={handleLogout} // <-- UPDATE: Point to the new handler
          className="text-xs font-semibold text-red-600 hover:text-red-800 transition-colors bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded-md"
        >
          Logout
        </button>
      </div>
    </div>
  );
}