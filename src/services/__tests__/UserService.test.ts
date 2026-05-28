import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock the Supabase client
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: vi.fn(),
    rpc: vi.fn(),
  },
}));

import { supabase } from '@/integrations/supabase/client';
import { UserService } from '../UserService';

const mockChain = (result: unknown) => {
  const chain: any = {
    select: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    update: vi.fn().mockReturnThis(),
    single: vi.fn().mockResolvedValue(result),
    maybeSingle: vi.fn().mockResolvedValue(result),
  };
  return chain;
};

beforeEach(() => {
  vi.clearAllMocks();
});

describe('UserService.getCredits', () => {
  it('returns credits from the database', async () => {
    const chain = mockChain({ data: { user_id: 'u1', credits: 5, updated_at: '2026-01-01' }, error: null });
    vi.mocked(supabase.from).mockReturnValue(chain);

    const balance = await UserService.getCredits('u1');
    expect(balance.credits).toBe(5);
    expect(supabase.from).toHaveBeenCalledWith('credits_balance');
  });

  it('returns zero credits when no row exists', async () => {
    const chain = mockChain({ data: null, error: null });
    vi.mocked(supabase.from).mockReturnValue(chain);

    const balance = await UserService.getCredits('u1');
    expect(balance.credits).toBe(0);
    expect(balance.user_id).toBe('u1');
  });

  it('throws when the database returns an error', async () => {
    const chain = mockChain({ data: null, error: new Error('DB error') });
    vi.mocked(supabase.from).mockReturnValue(chain);

    await expect(UserService.getCredits('u1')).rejects.toThrow('DB error');
  });
});

describe('UserService.getProfile', () => {
  it('returns a user profile', async () => {
    const profile = { id: 'u1', email: 'a@b.com', full_name: 'Test', created_at: '', updated_at: '' };
    const chain = mockChain({ data: profile, error: null });
    vi.mocked(supabase.from).mockReturnValue(chain);

    const result = await UserService.getProfile('u1');
    expect(result.email).toBe('a@b.com');
  });

  it('throws when profile not found', async () => {
    const chain = mockChain({ data: null, error: new Error('Not found') });
    vi.mocked(supabase.from).mockReturnValue(chain);

    await expect(UserService.getProfile('u1')).rejects.toThrow('Not found');
  });
});

describe('UserService.updateProfile', () => {
  it('updates and returns the profile', async () => {
    const updated = { id: 'u1', email: 'a@b.com', full_name: 'New Name', created_at: '', updated_at: '' };
    const chain = mockChain({ data: updated, error: null });
    vi.mocked(supabase.from).mockReturnValue(chain);

    const result = await UserService.updateProfile('u1', { full_name: 'New Name' });
    expect(result.full_name).toBe('New Name');
  });
});
