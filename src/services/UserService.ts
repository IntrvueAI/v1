import { supabase } from '@/integrations/supabase/client';
import { UserProfile, CreditBalance } from '@/models/User';

export const UserService = {
  async getProfile(userId: string): Promise<UserProfile> {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
    if (error) throw error;
    return data as unknown as UserProfile;
  },

  async updateProfile(userId: string, patch: Partial<UserProfile>): Promise<UserProfile> {
    const { data, error } = await supabase
      .from('profiles')
      .update(patch as any)
      .eq('id', userId)
      .select()
      .single();
    if (error) throw error;
    return data as unknown as UserProfile;
  },

  async getCredits(userId: string): Promise<CreditBalance> {
    const { data, error } = await supabase
      .from('credits_balance')
      .select('user_id, credits, updated_at')
      .eq('user_id', userId)
      .maybeSingle();
    if (error) throw error;
    return (data ?? { user_id: userId, credits: 0, updated_at: new Date().toISOString() }) as CreditBalance;
  },

  async deleteAccount(): Promise<void> {
    const { error } = await supabase.rpc('delete_user');
    if (error) throw error;
  },
};
