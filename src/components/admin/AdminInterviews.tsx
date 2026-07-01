import React, { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';

interface SessionRow {
  id: string;
  user_id: string;
  session_reference: string | null;
  interview_type: string | null;
  subject: string | null;
  mode: string | null;
  status: string | null;
  started_at: string;
}

const statusColor: Record<string, string> = {
  completed: 'bg-green-500',
  active: 'bg-blue-500',
  abandoned: 'bg-muted-foreground',
  error: 'bg-red-500',
  timed_out: 'bg-yellow-500',
};

/** Admin view of every interview taken (needs the admin-read RLS policy on interview_sessions). */
export const AdminInterviews: React.FC = () => {
  const [rows, setRows] = useState<SessionRow[]>([]);
  const [emails, setEmails] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const { data, error } = await (supabase as any)
        .from('interview_sessions')
        .select('id, user_id, session_reference, interview_type, subject, mode, status, started_at')
        .order('started_at', { ascending: false })
        .limit(200);
      if (error) {
        setError(error.message);
        setLoading(false);
        return;
      }
      const sessions = (data ?? []) as unknown as SessionRow[];
      setRows(sessions);
      const ids = [...new Set(sessions.map((s) => s.user_id).filter(Boolean))];
      if (ids.length) {
        const { data: profiles } = await supabase.from('profiles').select('id, email').in('id', ids);
        setEmails(Object.fromEntries((profiles ?? []).map((p: any) => [p.id, p.email])));
      }
      setLoading(false);
    })();
  }, []);

  if (loading) return <p className="text-muted-foreground">Loading interviews…</p>;
  if (error) return <p className="text-destructive">Failed to load interviews: {error}</p>;

  return (
    <Card>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b bg-muted/50">
              <tr className="text-left">
                <th className="p-3 font-medium">User</th>
                <th className="p-3 font-medium">Interview</th>
                <th className="p-3 font-medium">Mode</th>
                <th className="p-3 font-medium">Status</th>
                <th className="p-3 font-medium">Ref</th>
                <th className="p-3 font-medium">When</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((s) => (
                <tr key={s.id} className="border-b hover:bg-muted/30">
                  <td className="p-3">{emails[s.user_id] || <span className="text-muted-foreground font-mono text-xs">{s.user_id.slice(0, 8)}…</span>}</td>
                  <td className="p-3">{s.interview_type || s.subject || '—'}</td>
                  <td className="p-3 capitalize text-muted-foreground">{s.mode || '—'}</td>
                  <td className="p-3">
                    <Badge className={`${statusColor[s.status || ''] || 'bg-muted-foreground'} text-white text-xs`}>
                      {s.status || 'unknown'}
                    </Badge>
                  </td>
                  <td className="p-3 font-mono text-xs">{s.session_reference || '—'}</td>
                  <td className="p-3 text-muted-foreground">{new Date(s.started_at).toLocaleString('en-GB')}</td>
                </tr>
              ))}
              {rows.length === 0 && (
                <tr><td colSpan={6} className="p-8 text-center text-muted-foreground">No interviews yet.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
};
