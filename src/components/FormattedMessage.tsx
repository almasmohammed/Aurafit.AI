import React from 'react';

interface FormattedMessageProps {
  text: string;
}

export function FormattedMessage({ text }: FormattedMessageProps) {
  if (!text) return null;

  // Inline styling parser: handles bold (**text**) and italic (*text*)
  const parseInlineStyles = (lineText: string): React.ReactNode[] => {
    // 1. First parse bold segments split by **
    const boldParts = lineText.split(/(\*\*[^*]+\*\*)/g);
    
    return boldParts.flatMap((part, i) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        const content = part.slice(2, -2);
        // Process italics inside bold
        return (
          <strong key={`b-${i}`} className="font-semibold text-white tracking-wide">
            {parseItalicsOnly(content)}
          </strong>
        );
      }
      return parseItalicsOnly(part);
    });
  };

  const parseItalicsOnly = (segment: string): React.ReactNode[] => {
    const italicParts = segment.split(/(\*[^*]+\*)/g);
    return italicParts.map((part, j) => {
      if (part.startsWith('*') && part.endsWith('*')) {
        return (
          <em key={`i-${j}`} className="italic text-zinc-200">
            {part.slice(1, -1)}
          </em>
        );
      }
      return part;
    });
  };

  // Convert raw message string to structured blocks
  const lines = text.split('\n');
  const renderedElements: React.ReactNode[] = [];

  lines.forEach((line, index) => {
    const trimmed = line.trim();

    // 1. Empty lines - render spacing
    if (!trimmed) {
      renderedElements.push(
        <div key={`space-${index}`} className="h-2" />
      );
      return;
    }

    // 2. Blockquotes (e.g., lines starting with >)
    if (trimmed.startsWith('>')) {
      const quoteText = trimmed.replace(/^>\s*/, '');
      renderedElements.push(
        <blockquote 
          key={`quote-${index}`}
          className="border-l-2 border-[#8B5CF6]/50 pl-3.5 py-1 my-2 text-zinc-400 italic bg-zinc-950/20 rounded-r"
        >
          {parseInlineStyles(quoteText)}
        </blockquote>
      );
      return;
    }

    // 3. Headings: #, ##, ###
    if (trimmed.startsWith('#')) {
      const headingMatch = trimmed.match(/^(#{1,6})\s+(.*)$/);
      if (headingMatch) {
        const level = headingMatch[1].length;
        const headingText = headingMatch[2];
        const parsedNode = parseInlineStyles(headingText);

        if (level === 1) {
          renderedElements.push(
            <h1 key={`h-${index}`} className="text-base font-bold text-white tracking-tight mt-4 mb-2 pb-1 border-b border-zinc-800">
              {parsedNode}
            </h1>
          );
        } else if (level === 2) {
          renderedElements.push(
            <h2 key={`h-${index}`} className="text-sm font-semibold text-white tracking-tight mt-3 mb-1.5">
              {parsedNode}
            </h2>
          );
        } else {
          // Level 3+ or default headings
          renderedElements.push(
            <h3 key={`h-${index}`} className="text-xs font-semibold text-[#8B5CF6] uppercase tracking-wider mt-3.5 mb-1.5 flex items-center gap-1.5">
              <span className="w-1 h-3 bg-[#8B5CF6] rounded-full"></span>
              {parsedNode}
            </h3>
          );
        }
        return;
      }
    }

    // 4. Numbered Lists (e.g., 1. Item)
    const numberedMatch = trimmed.match(/^(\d+)\.\s+(.*)$/);
    if (numberedMatch) {
      const num = numberedMatch[1];
      const remaining = numberedMatch[2];
      renderedElements.push(
        <div key={`num-${index}`} className="flex items-start gap-3 my-2 pl-1">
          <span 
            className="flex items-center justify-center w-5 h-5 rounded-full bg-[#8B5CF6]/10 border border-[#8B5CF6]/30 text-[10px] font-mono text-[#00E5FF] shrink-0 font-bold mt-0.5"
            aria-hidden="true"
          >
            {num}
          </span>
          <div className="text-zinc-300 font-sans text-xs leading-relaxed flex-grow">
            {parseInlineStyles(remaining)}
          </div>
        </div>
      );
      return;
    }

    // 5. Unordered Lists (e.g., * Item, - Item, • Item)
    // Avoid picking up starting asterisks that are actually bold starts or italics (must be space after asterisk)
    const unorderedMatch = trimmed.match(/^([\*\-\•])\s+(.*)$/);
    if (unorderedMatch) {
      const remaining = unorderedMatch[2];
      renderedElements.push(
        <div key={`bull-${index}`} className="flex items-start gap-2.5 my-1.5 pl-2">
          <span className="w-1.5 h-1.5 rounded-full bg-[#00E5FF] shrink-0 mt-1.5 shadow-[0_0_6px_rgba(0,229,255,0.7)]" aria-hidden="true"></span>
          <div className="text-zinc-300 font-sans text-xs leading-relaxed flex-grow">
            {parseInlineStyles(remaining)}
          </div>
        </div>
      );
      return;
    }

    // 6. Normal text lines
    renderedElements.push(
      <p key={`p-${index}`} className="text-xs text-zinc-300 leading-relaxed font-sans mt-1">
        {parseInlineStyles(trimmed)}
      </p>
    );
  });

  return (
    <div className="space-y-1 text-xs select-text">
      {renderedElements}
    </div>
  );
}
