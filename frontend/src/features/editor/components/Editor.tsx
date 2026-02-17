import { LexicalComposer } from '@lexical/react/LexicalComposer';
import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin';
import { ContentEditable } from '@lexical/react/LexicalContentEditable';
import { HistoryPlugin } from '@lexical/react/LexicalHistoryPlugin';
import { OnChangePlugin } from '@lexical/react/LexicalOnChangePlugin';
import { LexicalErrorBoundary } from '@lexical/react/LexicalErrorBoundary';
import { HeadingNode, QuoteNode } from "@lexical/rich-text";
import { TableCellNode, TableNode, TableRowNode } from "@lexical/table";
import { ListItemNode, ListNode } from "@lexical/list";
import { CodeHighlightNode, CodeNode } from "@lexical/code";
import { AutoLinkNode, LinkNode } from "@lexical/link";
import { TRANSFORMERS } from "@lexical/markdown";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { $getRoot } from "lexical";
import { useState, useEffect, useRef } from "react";

// Official & Custom Plugins
import { TabIndentationPlugin } from '@lexical/react/LexicalTabIndentationPlugin';
import { MarkdownShortcutPlugin } from '@lexical/react/LexicalMarkdownShortcutPlugin';
import { ListPlugin } from "@lexical/react/LexicalListPlugin";
import { TablePlugin } from '@lexical/react/LexicalTablePlugin';
import { useEditorStore } from '@stores/useEditorStore';
import { editorTheme } from '@theme/theme';

// Feature Components
import { FloatingToolbar } from './FloatingToolbar';
import { Toolbar } from './Toolbar'; 
import { DocumentTitle } from './DocumentTitle';
import { HoverBlockMenuPlugin } from '@/plugins/HoverBlockMenuPlugin';
import { AutoLinkPlugin } from '@/plugins/AutoLinkPlugin';
import { CodeHighlightPlugin } from '@/plugins/CodeHighlightPlugin';
import { EquationsPlugin } from '@/plugins/EquationsPlugin';

// Nodes
import { GhostTextNode } from '@nodes/GhostTextNode';
import { EquationNode } from '@nodes/EquationNode';
import { SlashMenuPlugin } from '@/plugins/SlashMenuPlugin';
import { AIGenerateTools } from './AIGenerateTools';
import { MagicWandButton } from './MagicWandButton';
import { SyncStatusIndicator } from './SyncStatusIndicator';

function onError(error: Error) {
  console.error('Lexical Error:', error);
}

/**
 * MAANG UI/UX Tip: Floating Word Count
 * Positioned as a subtle HUD element that disappears when not typing.
 */
export function WordCountPlugin() {
  const [editor] = useLexicalComposerContext();
  const [count, setCount] = useState(0);

  useEffect(() => {
    return editor.registerUpdateListener(({ editorState }) => {
      editorState.read(() => {
        const text = $getRoot().getTextContent();
        const words = text.split(/\s+/).filter(Boolean).length;
        setCount(words);
      });
    });
  }, [editor]);

  return (
    <div className="fixed bottom-8 right-8 px-3 py-1.5 bg-panel/50 backdrop-blur-md border border-line rounded-full text-[10px] font-bold tracking-widest text-muted transition-all hover:opacity-100 opacity-40 select-none">
      {count} WORDS
    </div>
  );
}

export function Editor({ documentId }: { documentId: string }) {
  const setLocalState = useEditorStore((state) => state.setLocalState);
  const localState = useEditorStore((state) => state.localState);
  const editorContainerRef = useRef<HTMLDivElement>(null!) as React.RefObject<HTMLDivElement>;

  const initialConfig = {
    namespace: 'SmartEditor',
    theme: editorTheme,
    onError,
    editorState: localState && localState !== "{}" ? localState : undefined,
    nodes: [
      HeadingNode, ListNode, ListItemNode, QuoteNode,
      CodeNode, CodeHighlightNode, TableNode, TableCellNode,
      GhostTextNode, TableRowNode, AutoLinkNode, LinkNode, EquationNode,
    ],
  };

  return (
    // 1. Outer Container: Flex center with vertical padding
    <div className="flex flex-col items-center w-full min-h-full bg-canvas py-12 transition-colors duration-500">
      
      <LexicalComposer initialConfig={initialConfig}>
           {/* 1. TOP HEADER: Status & AI Tools */}
<div className="w-full max-w-[900px] px-6 py-3 flex justify-between items-center transition-colors duration-300">
  
  {/* Left Side: Document Identity */}
  <div className="flex items-center gap-4">
    <div className="flex flex-col">
      <div className="flex items-center gap-2">
        <span className="text-[15px] font-bold font-serif text-ink tracking-tight">
          <DocumentTitle />
        </span>
        <SyncStatusIndicator />
      </div>
      <span className="text-[10px] font-bold text-muted uppercase tracking-widest mt-0.5">
        Personal Draft
      </span>
    </div>
  </div>

  {/* Right Side: Action Cluster */}
  <div className="flex items-center gap-1 bg-panel/50 backdrop-blur-md p-1 rounded-xl border border-line/50 shadow-sm">
    <MagicWandButton />
    <AIGenerateTools />
  </div>
</div>
        {/* 2. Floating Toolbar: Still pill-shaped, sits above the frame */}
        <div className="sticky top-6 z-30 mb-10">
           <Toolbar />
        </div>

        {/* 3. THE FRAMED CANVAS: Added Border, Rounded Corners, and Shadow */}
        <div className="w-full max-w-[900px] bg-panel/30 border border-line rounded-[32px] shadow-float overflow-hidden backdrop-blur-sm">
          
          {/* Internal Gutter Layout */}
          <div 
            className="relative px-16 py-20 min-h-[80vh]" 
            ref={editorContainerRef}
          >
            {/* The + and drag handle now float inside this elegant frame */}
            <HoverBlockMenuPlugin containerRef={editorContainerRef} />

            <RichTextPlugin
              contentEditable={
                <ContentEditable 
                  className="outline-none font-serif text-[19px] leading-[1.8] text-ink transition-colors duration-300" 
                />
              }
              placeholder={
                <div className="absolute top-20 left-16 text-muted/30 font-serif italic text-[19px] pointer-events-none select-none">
                  Write something extraordinary...
                </div>
              }
              ErrorBoundary={LexicalErrorBoundary}
            />

            {/* Core Extensions */}
            <TablePlugin />
            <AutoLinkPlugin />
            <CodeHighlightPlugin />
            <EquationsPlugin />
            <SlashMenuPlugin />
            
            {/* Logic & Meta Plugins */}
            <HistoryPlugin />
            <ListPlugin /> 
            <TabIndentationPlugin />
            <MarkdownShortcutPlugin transformers={TRANSFORMERS} />
            <WordCountPlugin />

            <OnChangePlugin onChange={(editorState) => {
              editorState.read(() => {
                const json = editorState.toJSON();
                setLocalState(JSON.stringify(json));
              });
            }} />
          </div>
        </div>
      </LexicalComposer>
    </div>
  );
}