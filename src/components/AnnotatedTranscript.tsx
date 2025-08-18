import React from 'react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

export type AnnotationCategory = 'strength' | 'grammar' | 'fluency' | 'lexical';

export interface Annotation {
  quote: string;
  category: AnnotationCategory;
  explanation: string;
  suggestion?: string;
  start?: number;
  end?: number;
}

interface AnnotatedTranscriptProps {
  transcript: string;
  annotations: Annotation[];
}

const categoryStyles: Record<AnnotationCategory, string> = {
  strength: 'text-success underline underline-offset-2 decoration-2',
  grammar: 'text-destructive underline underline-offset-2 decoration-2',
  fluency: 'text-warning underline underline-offset-2 decoration-2',
  lexical: 'text-primary underline underline-offset-2 decoration-2',
};

const escapeRegExp = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

// Build a regex that matches the quote allowing arbitrary punctuation/whitespace between words
const buildFlexiblePattern = (quote: string) => {
  const words = quote.trim().split(/\s+/).filter(Boolean).map(escapeRegExp);
  if (words.length === 0) return null;
  // \W+ matches any non-word (punctuation/space). Use global and case-insensitive flags.
  return new RegExp(words.join('\\W+'), 'gi');
};

export const AnnotatedTranscript: React.FC<AnnotatedTranscriptProps> = ({ transcript, annotations }) => {
  const sorted = [...(annotations || [])]
    .filter(a => a && a.quote && a.quote.trim().length > 2)
    .sort((a, b) => b.quote.length - a.quote.length);

  const formatTranscriptWithSpeakers = (text: string): React.ReactNode[] => {
    // Split by lines first, then handle each line
    const lines = text.split('\n');
    const result: React.ReactNode[] = [];
    
    lines.forEach((line, lineIndex) => {
      if (lineIndex > 0) result.push('\n');
      
      const studentMatch = line.match(/^(Student:\s*)(.*)/i);
      const interviewerMatch = line.match(/^(Interviewer:\s*)(.*)/i);
      
      if (studentMatch) {
        result.push(
          <div key={`student-${lineIndex}`} className="flex gap-2 my-1">
            <span className="inline-flex items-center px-2 py-1 rounded-md bg-blue-50 text-blue-700 text-xs font-medium min-w-fit">
              Student
            </span>
            <span className="flex-1">{studentMatch[2]}</span>
          </div>
        );
      } else if (interviewerMatch) {
        result.push(
          <div key={`interviewer-${lineIndex}`} className="flex gap-2 my-1">
            <span className="inline-flex items-center px-2 py-1 rounded-md bg-slate-100 text-slate-700 text-xs font-medium min-w-fit">
              Interviewer
            </span>
            <span className="flex-1">{interviewerMatch[2]}</span>
          </div>
        );
      } else if (line.trim()) {
        result.push(line);
      }
    });
    
    return result;
  };

  const renderWithHighlights = () => {
    // Prefer precise index-based annotations when available
    const ranged = (annotations || []).filter((a) => (
      typeof a.start === 'number' && typeof a.end === 'number' &&
      a.start! >= 0 && a.end! > a.start! && a.end! <= transcript.length
    )).sort((a, b) => (a.start! - b.start!));

    if (ranged.length > 0) {
      const nodes: React.ReactNode[] = [];
      let cursor = 0;
      ranged.forEach((ann, idx) => {
        const s = ann.start!;
        const e = ann.end!;
        if (s < cursor) return; // skip overlaps
        if (s > cursor) nodes.push(transcript.slice(cursor, s));
        const matched = transcript.slice(s, e);
        nodes.push(
          <TooltipProvider key={`ann-${idx}-${s}`}>
            <Tooltip>
              <TooltipTrigger asChild>
                <span className={categoryStyles[ann.category]}>{matched}</span>
              </TooltipTrigger>
              <TooltipContent className="max-w-xs">
                <div className="text-sm font-medium capitalize mb-1">{ann.category}</div>
                <p className="text-sm mb-1">{ann.explanation}</p>
                {ann.suggestion && (
                  <p className="text-sm text-muted-foreground">Suggestion: {ann.suggestion}</p>
                )}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        );
        cursor = e;
      });
      if (cursor < transcript.length) nodes.push(transcript.slice(cursor));
      return nodes;
    }

    // Fallback: flexible regex matching when indices are not provided
    let nodes: React.ReactNode[] = [transcript];
    const sorted = [...(annotations || [])]
      .filter(a => a && a.quote && a.quote.trim().length > 2)
      .sort((a, b) => b.quote.length - a.quote.length);

    sorted.forEach((ann, idx) => {
      const regex = buildFlexiblePattern(ann.quote);
      if (!regex) return;

      const next: React.ReactNode[] = [];
      nodes.forEach((node) => {
        if (typeof node !== 'string') { next.push(node); return; }
        const text = node as string;
        let lastIndex = 0;
        let m: RegExpExecArray | null;
        while ((m = regex.exec(text)) !== null) {
          const start = m.index;
          const end = start + m[0].length;
          if (start > lastIndex) next.push(text.slice(lastIndex, start));
          const matched = text.slice(start, end);
          next.push(
            <TooltipProvider key={`ann-${idx}-${start}`}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <span className={categoryStyles[ann.category]}>{matched}</span>
                </TooltipTrigger>
                <TooltipContent className="max-w-xs">
                  <div className="text-sm font-medium capitalize mb-1">{ann.category}</div>
                  <p className="text-sm mb-1">{ann.explanation}</p>
                  {ann.suggestion && (
                    <p className="text-sm text-muted-foreground">Suggestion: {ann.suggestion}</p>
                  )}
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          );
          lastIndex = end;
          if (regex.lastIndex === start) regex.lastIndex++;
        }
        if (lastIndex < text.length) next.push(text.slice(lastIndex));
      });
      nodes = next;
    });

    return nodes;
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-3 text-sm">
        <span className="inline-flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-success"></span>
          Strength
        </span>
        <span className="inline-flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-destructive"></span>
          Grammar
        </span>
        <span className="inline-flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-warning"></span>
          Fluency
        </span>
        <span className="inline-flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-primary"></span>
          Lexical Resource
        </span>
      </div>

      <div className="leading-relaxed text-sm text-foreground/90">
        {(() => {
          const highlighted = renderWithHighlights();
          // Apply speaker tag formatting to the final result
          return highlighted.map((node, index) => {
            if (typeof node === 'string') {
              return <span key={index}>{formatTranscriptWithSpeakers(node)}</span>;
            }
            return node;
          });
        })()}
      </div>
    </div>
  );
};

export default AnnotatedTranscript;
