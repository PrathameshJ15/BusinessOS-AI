'use client';

import React, { useMemo } from 'react';

interface ChatMessageContentProps {
  content: string;
  role: 'user' | 'assistant';
  className?: string;
}

interface MessageBlock {
  type: 'h2' | 'h3' | 'ol-item' | 'ul-item' | 'p';
  num?: string;
  isSub?: boolean;
  text: string;
}

/**
 * Checks whether the text contains Devanagari characters (Hindi, Marathi, etc.)
 */
export function containsDevanagari(text: string): boolean {
  if (!text) return false;
  return /[\u0900-\u097F]/.test(text);
}

/**
 * Parses inline formatting (**bold**, *italic*, `code`) safely without crashing on streaming fragments
 */
function renderFormattedInline(text: string, isUser: boolean = false): React.ReactNode[] {
  if (!text) return [];
  const tokens: React.ReactNode[] = [];
  const regex = /(\*\*[^*]+\*\*|\*[^*]+\*|`[^`]+`)/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      tokens.push(text.substring(lastIndex, match.index));
    }
    const token = match[0];
    const key = `inline-${match.index}`;

    if (token.startsWith('**') && token.endsWith('**')) {
      tokens.push(
        <strong key={key} className={isUser ? 'font-bold' : 'font-bold text-zinc-900 dark:text-white'}>
          {token.slice(2, -2)}
        </strong>
      );
    } else if (token.startsWith('*') && token.endsWith('*')) {
      tokens.push(
        <em key={key} className="italic">
          {token.slice(1, -1)}
        </em>
      );
    } else if (token.startsWith('`') && token.endsWith('`')) {
      tokens.push(
        <code
          key={key}
          className={`font-mono text-[11px] px-1 py-0.5 rounded ${
            isUser
              ? 'bg-emerald-700/70 text-white'
              : 'bg-zinc-100 dark:bg-zinc-800 text-emerald-600 dark:text-emerald-400 border border-zinc-200/50 dark:border-zinc-700/50'
          }`}
        >
          {token.slice(1, -1)}
        </code>
      );
    }
    lastIndex = regex.lastIndex;
  }

  if (lastIndex < text.length) {
    tokens.push(text.substring(lastIndex));
  }

  return tokens.length > 0 ? tokens : [text];
}

/**
 * Parses multiline assistant responses into structured blocks (paragraphs, headings, lists)
 */
function parseMessageBlocks(content: string): MessageBlock[] {
  if (!content) return [];
  const lines = content.split('\n');
  const blocks: MessageBlock[] = [];
  let currentParagraph: string[] = [];

  for (let i = 0; i < lines.length; i++) {
    const rawLine = lines[i];
    const trimmed = rawLine.trim();

    if (!trimmed) {
      if (currentParagraph.length > 0) {
        blocks.push({ type: 'p', text: currentParagraph.join('\n') });
        currentParagraph = [];
      }
      continue;
    }

    if (trimmed.startsWith('### ')) {
      if (currentParagraph.length > 0) {
        blocks.push({ type: 'p', text: currentParagraph.join('\n') });
        currentParagraph = [];
      }
      blocks.push({ type: 'h3', text: trimmed.slice(4) });
    } else if (trimmed.startsWith('## ')) {
      if (currentParagraph.length > 0) {
        blocks.push({ type: 'p', text: currentParagraph.join('\n') });
        currentParagraph = [];
      }
      blocks.push({ type: 'h2', text: trimmed.slice(3) });
    } else if (/^\d+\.\s+/.test(trimmed)) {
      if (currentParagraph.length > 0) {
        blocks.push({ type: 'p', text: currentParagraph.join('\n') });
        currentParagraph = [];
      }
      const match = trimmed.match(/^(\d+\.)\s+(.*)$/);
      if (match) {
        blocks.push({ type: 'ol-item', num: match[1], text: match[2] });
      } else {
        blocks.push({ type: 'ol-item', num: '1.', text: trimmed });
      }
    } else if (/^[-*]\s+/.test(trimmed) || /^\s+[-*]\s+/.test(rawLine)) {
      if (currentParagraph.length > 0) {
        blocks.push({ type: 'p', text: currentParagraph.join('\n') });
        currentParagraph = [];
      }
      const isSub = /^\s+/.test(rawLine);
      const match = trimmed.match(/^[-*]\s+(.*)$/);
      blocks.push({ type: 'ul-item', isSub, text: match ? match[1] : trimmed });
    } else {
      currentParagraph.push(rawLine);
    }
  }

  if (currentParagraph.length > 0) {
    blocks.push({ type: 'p', text: currentParagraph.join('\n') });
  }

  return blocks;
}

export const ChatMessageContent: React.FC<ChatMessageContentProps> = ({
  content,
  role,
  className = '',
}) => {
  const hasDevanagari = useMemo(() => containsDevanagari(content), [content]);

  // Typography styles:
  // - font-multilingual applies Plus Jakarta Sans for Latin characters and Noto Sans Devanagari for Devanagari
  // - Line height 1.7 ensures Devanagari matras (e.g. े, ै, ो, ौ, ं, ु, ू, ृ) have adequate vertical clearance
  // - letter-spacing is kept normal to preserve Devanagari shirorekha and ligatures
  const typographyClass = `font-multilingual ${
    hasDevanagari ? 'leading-[1.7]' : 'leading-relaxed'
  } tracking-normal break-words ${className}`;

  if (role === 'user') {
    return (
      <div className={`whitespace-pre-wrap ${typographyClass}`}>
        {renderFormattedInline(content, true)}
      </div>
    );
  }

  const blocks = useMemo(() => parseMessageBlocks(content), [content]);

  // If there are no structural markdown blocks, render with whitespace-pre-wrap
  if (blocks.length === 1 && blocks[0].type === 'p') {
    return (
      <div className={`whitespace-pre-wrap ${typographyClass}`}>
        {renderFormattedInline(content, false)}
      </div>
    );
  }

  return (
    <div className={`space-y-2 ${typographyClass}`}>
      {blocks.map((block, idx) => {
        if (block.type === 'h2') {
          return (
            <h4
              key={idx}
              className="font-bold text-[13px] text-zinc-900 dark:text-white pt-1.5 pb-0.5 leading-snug"
            >
              {renderFormattedInline(block.text, false)}
            </h4>
          );
        }

        if (block.type === 'h3') {
          return (
            <h5
              key={idx}
              className="font-bold text-xs text-zinc-900 dark:text-white pt-1 pb-0.5 leading-snug"
            >
              {renderFormattedInline(block.text, false)}
            </h5>
          );
        }

        if (block.type === 'ol-item') {
          return (
            <div key={idx} className="flex items-start gap-2 my-0.5 leading-relaxed">
              <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400 shrink-0 select-none text-[11px] mt-0.5">
                {block.num}
              </span>
              <div className="flex-1 min-w-0">
                {renderFormattedInline(block.text, false)}
              </div>
            </div>
          );
        }

        if (block.type === 'ul-item') {
          return (
            <div
              key={idx}
              className={`flex items-start gap-2 my-0.5 leading-relaxed ${
                block.isSub ? 'ml-4' : 'ml-1'
              }`}
            >
              <span className="text-emerald-500 shrink-0 select-none text-[10px] mt-1">
                •
              </span>
              <div className="flex-1 min-w-0">
                {renderFormattedInline(block.text, false)}
              </div>
            </div>
          );
        }

        return (
          <p key={idx} className="whitespace-pre-wrap leading-relaxed my-1">
            {renderFormattedInline(block.text, false)}
          </p>
        );
      })}
    </div>
  );
};
