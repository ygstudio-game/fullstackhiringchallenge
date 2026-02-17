import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { $getSelection, $isRangeSelection, FORMAT_TEXT_COMMAND } from 'lexical';
import { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

export function FloatingToolbar() {
  const [editor] = useLexicalComposerContext();
  const toolbarRef = useRef<HTMLDivElement>(null);
  const [coords, setCoords] = useState<{ top: number; left: number } | null>(null);

  const updateToolbar = useCallback(() => {
    const selection = $getSelection();
    const nativeSelection = window.getSelection();

    // Only show if there is a range selection (highlighted text)
    if ($isRangeSelection(selection) && nativeSelection && !nativeSelection.isCollapsed) {
      const domRange = nativeSelection.getRangeAt(0);
      const rect = domRange.getBoundingClientRect();

      // Position the toolbar above the center of the selection
      setCoords({
        top: rect.top + window.scrollY - 45,
        left: rect.left + window.scrollX + rect.width / 2,
      });
    } else {
      setCoords(null);
    }
  }, []);

  useEffect(() => {
    return editor.registerUpdateListener(({ editorState }) => {
      editorState.read(() => updateToolbar());
    });
  }, [editor, updateToolbar]);

  if (!coords) return null;

  return createPortal(
    <div
      ref={toolbarRef}
      className="absolute z-50 flex gap-1 p-1 bg-gray-900 border border-gray-700 rounded-sm shadow-xl -translate-x-1/2 transition-opacity"
      style={{ top: coords.top, left: coords.left }}
    >
      <button
        onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'bold')}
        className="px-2 py-1 text-white hover:bg-gray-700 rounded text-sm font-bold"
      >
        B
      </button>
      <button
        onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'italic')}
        className="px-2 py-1 text-white hover:bg-gray-700 rounded text-sm italic"
      >
        I
      </button>
      <div className="w-[1px] bg-gray-700 mx-1" />
      <button
        className="px-2 py-1 text-white hover:bg-gray-700 rounded text-sm"
        onClick={() => {/* Implement Link or Heading logic here */}}
      >
        H1
      </button>
    </div>,
    document.body
  );
}