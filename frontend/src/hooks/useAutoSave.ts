import { useEffect, useRef } from 'react';
// 1. Use clean Aliases
import { useEditorStore } from '@stores';
import { postService } from '@api/services/postService';

export function useAutoSave(lexicalStateJSON: string, documentId: string, delay = 2000) {
  // 2. Destructure everything we need from the store, including the isOwner flag
  const { setSyncStatus, isOwner, syncDraftInList } = useEditorStore();
  
  // We use a ref to hold the timer ID so it persists across renders
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  
  // Prevent triggering a save on the very first component mount
  const isInitialMount = useRef(true);

  useEffect(() => {
    // 1. Guard clauses
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }
    
    // CRITICAL SECURITY FIX: We added `!isOwner` here. 
    // If a guest opens a shared link, Lexical initializes, but this stops the save!
    if (!documentId || !lexicalStateJSON || lexicalStateJSON === '{}' || !isOwner) return;

    // 2. User typed something -> Update UI immediately to "Unsaved"
    setSyncStatus('UNSAVED');

    // 3. THE DEBOUNCE LOGIC: 
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // 4. Start a fresh timer.
    timeoutRef.current = setTimeout(async () => {
      setSyncStatus('SAVING');

      try {
        // 5. MAANG-style API Call: One clean line. 
        // Interceptors handle the Base URL and the Bearer Token automatically.
        await postService.update(documentId, { 
          lexical_state: JSON.parse(lexicalStateJSON) 
        });

        // 6. Success! Update UI to "Saved"
        setSyncStatus('SAVED');
        
        // Update the sidebar list with the new content/timestamp
        syncDraftInList(documentId, { 
          content: JSON.parse(lexicalStateJSON),
          updated_at: new Date().toISOString() 
        });

      } catch (error) {
        console.error('Failed to auto-save:', error);
        setSyncStatus('ERROR');
      }
    }, delay);

    // 7. CLEANUP PHASE: 
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [lexicalStateJSON, documentId, delay, setSyncStatus, isOwner, syncDraftInList]);
}