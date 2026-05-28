// Re-export the shared feedback types already defined in src/types/interview.ts
// so callers can import everything from src/models/.
export type {
  FeedbackRecord,
  FeedbackScores,
  FeedbackData,
  DetailedFeedback,
  Annotation,
  AnnotationCategory,
  FeedbackComponentProps,
} from '@/types/interview';

export interface ScoringResult {
  scores: Record<string, number>;
  total: number;
  band: string;
}
