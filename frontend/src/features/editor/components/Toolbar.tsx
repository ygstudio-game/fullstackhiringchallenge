import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { 
  FORMAT_TEXT_COMMAND, 
  FORMAT_ELEMENT_COMMAND,
  UNDO_COMMAND,
  REDO_COMMAND,
  $getSelection, 
  $isRangeSelection, 
} from "lexical";
import { $setBlocksType, $patchStyleText } from "@lexical/selection";
import { INSERT_ORDERED_LIST_COMMAND, INSERT_UNORDERED_LIST_COMMAND } from "@lexical/list";
import { $createHeadingNode, type HeadingTagType } from "@lexical/rich-text";

export function Toolbar() {
  const [editor] = useLexicalComposerContext();

  const formatHeading = (tag: HeadingTagType) => {
    editor.update(() => {
      const selection = $getSelection();
      if ($isRangeSelection(selection)) {
        $setBlocksType(selection, () => $createHeadingNode(tag));
      }
    });
  };

  const applyStyleText = (styles: Record<string, string>) => {
    editor.update(() => {
      const selection = $getSelection();
      if ($isRangeSelection(selection)) {
        $patchStyleText(selection, styles);
      }
    });
  };

  const FONT_SIZES = ['12px', '14px', '16px', '18px', '20px', '24px', '30px'];

  return (
    <div className="flex items-center gap-1.5 p-1.5 bg-panel/80 backdrop-blur-xl border border-line rounded-sm shadow-pill overflow-x-auto transition-all duration-300">
      
      {/* 1. History (Undo/Redo) */}
      <div className="flex items-center border-r border-line/50 pr-1.5 mr-1 shrink-0">
        <ToolbarButton 
          onClick={() => editor.dispatchCommand(UNDO_COMMAND, undefined)} 
          title="Undo"
          icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 7v6h6"></path><path d="M21 17a9 9 0 00-9-9 9 9 0 00-6 2.3L3 13"></path></svg>}
        />
        <ToolbarButton 
          onClick={() => editor.dispatchCommand(REDO_COMMAND, undefined)} 
          title="Redo"
          icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 7v6h-6"></path><path d="M3 17a9 9 0 019-9 9 9 0 016 2.3l3 2.7"></path></svg>}
        />
      </div>

      {/* 2. Text Formatting */}
      <div className="flex items-center border-r border-line/50 pr-1.5 mr-1 shrink-0">
        <ToolbarButton 
          onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'bold')} 
          label="B" 
          className="font-bold"
        />
        <ToolbarButton 
          onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'italic')} 
          label="I" 
          className="italic"
        />
        <ToolbarButton 
          onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'underline')} 
          label="U" 
          className="underline underline-offset-4"
        />
      </div>

      {/* 3. Text Styling */}
      <div className="flex items-center gap-2 border-r border-line/50 pr-2 mr-1 shrink-0 px-1">
        <select 
          onChange={(e) => applyStyleText({ 'font-size': e.target.value })}
          className="text-[11px] font-bold uppercase tracking-wider bg-transparent hover:bg-canvas rounded-sm px-2 py-1 cursor-pointer outline-none text-muted hover:text-ink transition-colors"
          title="Font Size"
        >
          <option value="" disabled selected>Size</option>
          {FONT_SIZES.map(size => <option key={size} value={size}>{size}</option>)}
        </select>

        <div className="flex items-center gap-1.5 hover:bg-canvas px-2 py-1 rounded-sm cursor-pointer transition-colors relative group" title="Text Color">
          <span className="text-[13px] font-bold text-ink">A</span>
          <input 
            type="color" 
            onChange={(e) => applyStyleText({ 'color': e.target.value })}
            className="w-4 h-4 p-0 border-0 rounded-full cursor-pointer bg-transparent overflow-hidden"
          />
        </div>
      </div>

      {/* 4. Alignment */}
      <div className="flex items-center border-r border-line/50 pr-1.5 mr-1 shrink-0">
        <ToolbarButton 
          onClick={() => editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, 'left')} 
          title="Align Left"
          icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="17" y1="10" x2="3" y2="10"></line><line x1="21" y1="6" x2="3" y2="6"></line><line x1="21" y1="14" x2="3" y2="14"></line><line x1="17" y1="18" x2="3" y2="18"></line></svg>}
        />
        <ToolbarButton 
          onClick={() => editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, 'center')} 
          title="Align Center"
          icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="10" x2="6" y2="10"></line><line x1="21" y1="6" x2="3" y2="6"></line><line x1="21" y1="14" x2="3" y2="14"></line><line x1="18" y1="18" x2="6" y2="18"></line></svg>}
        />
      </div>

      {/* 5. Blocks */}
      <div className="flex gap-1 shrink-0 px-1">
        <button onClick={() => formatHeading('h1')} className="px-2.5 py-1 text-[11px] font-bold text-muted hover:text-ink hover:bg-canvas rounded-sm transition-all">H1</button>
        <button onClick={() => formatHeading('h2')} className="px-2.5 py-1 text-[11px] font-bold text-muted hover:text-ink hover:bg-canvas rounded-sm transition-all">H2</button>
        <ToolbarButton onClick={() => editor.dispatchCommand(INSERT_UNORDERED_LIST_COMMAND, undefined)} label="•" />
        <ToolbarButton onClick={() => editor.dispatchCommand(INSERT_ORDERED_LIST_COMMAND, undefined)} label="1." />
      </div>
    </div>
  );
}

/**
 * Reusable Mini-component for Toolbar Buttons
 * Maintains the consistent luxury feel
 */
function ToolbarButton({ onClick, icon, label, title, className = "" }: any) {
  return (
    <button
      onClick={onClick}
      title={title}
      className={`w-8 h-8 flex items-center justify-center rounded-sm text-muted hover:text-ink hover:bg-canvas transition-all duration-200 active:scale-90 ${className}`}
    >
      {icon || <span className="text-[13px] font-medium">{label}</span>}
    </button>
  );
}