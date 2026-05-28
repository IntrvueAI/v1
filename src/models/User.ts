export interface UserProfile {
  id: string;
  email: string;
  full_name?: string;
  schools?: string[];
  interview_date?: string;
  preferred_interview_type?: string;
  created_at: string;
  updated_at: string;
}

export interface CreditBalance {
  user_id: string;
  credits: number;
  updated_at: string;
}
