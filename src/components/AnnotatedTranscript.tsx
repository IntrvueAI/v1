import React from 'react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

export type AnnotationCategory = 'strength' | 'grammar' | 'fluency' | 'lexical';

export interface Annotation {
  quote: string;
  category: AnnotationCategory;
  explanation: string;
  suggestion?: string;
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

// Safely escape regex special chars in a string
const escapeRegExp = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

export const AnnotatedTranscript: React.FC<AnnotatedTranscriptProps> = ({ transcript, annotations }) => {
  // Sort longer quotes first to reduce nested/overlap issues
  const sorted = [...(annotations || [])]
    .filter(a => a && a.quote && a.quote.length > 2)
    .sort((a, b) => b.quote.length - a.quote.length);

  // Build a progressively annotated set of React nodes
  const renderWithHighlights = () => {
    let nodes: React.ReactNode[] = [transcript];

    sorted.forEach((ann, idx) => {
      const nextNodes: React.ReactNode[] = [];
      nodes.forEach((node) => {
        if (typeof node !== 'string') {
          nextNodes.push(node); // already annotated segment
          return;
        }
        const text = node as string;
        const pattern = new RegExp(escapeRegExp(ann.quote), 'i');
        const match = text.match(pattern);
        if (!match || !match[0]) {
          nextNodes.push(text);
          return;
        }
        const start = match.index ?? -1;
        if (start < 0) {
          nextNodes.push(text);
          return;
        }
        const before = text.slice(0, start);
        const matched = text.slice(start, start + match[0].length);
        const after = text.slice(start + match[0].length);

        nextNodes.push(before);
        nextNodes.push(
          <TooltipProvider key={`ann-${idx}-${start}`}>
            <Tooltip>
              <TooltipTrigger asChild>
                <span className={categoryStyles[ann.category]}>
                  {matched}
                </span>
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
        nextNodes.push(after);
      });
      nodes = nextNodes;
    });

    return nodes;
  };

  return (
    <div className="space-y-4">
      {/* Legend */}
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

      {/* Transcript */}
      <div className="whitespace-pre-wrap leading-relaxed text-sm text-foreground/90">
        {renderWithHighlights()}
      </div>
    </div>
  );
};

export default AnnotatedTranscript;
