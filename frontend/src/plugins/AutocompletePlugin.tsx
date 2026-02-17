import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { $getSelection, $isRangeSelection, $createTextNode, COMMAND_PRIORITY_LOW, KEY_TAB_COMMAND } from 'lexical';
import { useEffect, useState } from 'react';
import { $convertToMarkdownString, TRANSFORMERS } from '@lexical/markdown';

export function AutocompletePlugin() {
  const [editor] = useLexicalComposerContext();
  const [ghostText, setGhostText] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      // TRIGGER: Tab + Space
      if (event.key === ' ' && event.shiftKey === false && (event.target as HTMLElement).closest('.editor-input')) {
        // We check if Tab was recently pressed or held? 
        // Simpler: Just check if user is holding Tab while pressing Space
      }
    };

    // Registering a keyboard listener for the specific combo
    const unregister = editor.registerCommand(
      KEY_TAB_COMMAND,
      (event: KeyboardEvent) => {
        // If user presses Space while Tab is down (or just after)
        // Note: For simplicity, we'll use a custom sequence or a long-press logic
        return false; 
      },
      COMMAND_PRIORITY_LOW
    );

    // Let's use a standard keydown for the specific Tab + Space combo
    const handleKeyDown = async (e: KeyboardEvent) => {
      if (e.key === 'Tab') {
        // We prevent default Tab behavior to check for the next key
        e.preventDefault();
        
        const spaceListener = async (se: KeyboardEvent) => {
          if (se.key === ' ') {
            se.preventDefault();
            triggerAutocomplete();
          }
          window.removeEventListener('keydown', spaceListener);
        };
        
        window.addEventListener('keydown', spaceListener, { once: true });
      }

      // If ghost text exists and user presses TAB again, commit it
      if (e.key === 'Tab' && ghostText) {
        e.preventDefault();
        commitGhost();
      }
    };

    const triggerAutocomplete = async () => {
      setLoading(true);
      let context = '';
      editor.getEditorState().read(() => {
        context = $convertToMarkdownString(TRANSFORMERS).slice(-500);
      });

      try {
        const response = await fetch('http://localhost:8000/api/ai/generate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text: context, action: 'continue' }),
        });
        const data = await response.json();
        setGhostText(data.generated_text.split(' ').slice(0, 6).join(' '));
      } finally {
        setLoading(false);
      }
    };

    const commitGhost = () => {
      editor.update(() => {
        const selection = $getSelection();
        if ($isRangeSelection(selection)) {
          selection.insertNodes([$createTextNode(ghostText)]);
        }
      });
      setGhostText('');
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      unregister();
    };
  }, [editor, ghostText]);

  if (!ghostText && !loading) return null;

  return (
    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-gray-900 text-white px-4 py-2 rounded-full shadow-2xl flex items-center gap-3 border border-gray-700 animate-bounce-subtle">
      {loading ? (
        <span className="text-xs animate-pulse">Gemini is thinking...</span>
      ) : (
        <>
          <span className="text-xs text-gray-400 italic">Suggestion:</span>
          <span className="text-sm font-medium">{ghostText}</span>
          <span className="text-[10px] bg-gray-700 px-1.5 py-0.5 rounded text-gray-300">Press Tab to Accept</span>
        </>
      )}
    </div>
  );
}