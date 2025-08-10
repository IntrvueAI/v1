import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { ScrollText, User, Plus, Minus } from 'lucide-react';

interface AuditLogEntry {
  id: string;
  admin_email: string;
  action: string;
  target_user_email: string | null;
  details: any;
  created_at: string;
}

export const AdminAuditLog = () => {
  const { data: auditLog, isLoading } = useQuery({
    queryKey: ['admin-audit-log'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('admin_audit_log')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;

      return data as AuditLogEntry[];
    },
    refetchInterval: 30000,
  });

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'add_credits':
        return <Plus className="h-4 w-4 text-green-600" />;
      case 'remove_credits':
        return <Minus className="h-4 w-4 text-red-600" />;
      default:
        return <User className="h-4 w-4 text-blue-600" />;
    }
  };

  const getActionBadge = (action: string) => {
    switch (action) {
      case 'add_credits':
        return <Badge variant="outline" className="text-green-600 border-green-200 bg-green-50">Add Credits</Badge>;
      case 'remove_credits':
        return <Badge variant="outline" className="text-red-600 border-red-200 bg-red-50">Remove Credits</Badge>;
      default:
        return <Badge variant="secondary">{action}</Badge>;
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Audit Log</CardTitle>
          <CardDescription>Loading audit entries...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-16 bg-muted animate-pulse rounded" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ScrollText className="h-5 w-5" />
            Audit Log
          </CardTitle>
          <CardDescription>
            Track all administrative actions and changes (last 50 entries)
          </CardDescription>
        </CardHeader>
        <CardContent>
          {auditLog && auditLog.length > 0 ? (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Action</TableHead>
                    <TableHead>Admin</TableHead>
                    <TableHead>Target User</TableHead>
                    <TableHead>Details</TableHead>
                    <TableHead>Timestamp</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {auditLog.map((entry) => (
                    <TableRow key={entry.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getActionIcon(entry.action)}
                          {getActionBadge(entry.action)}
                        </div>
                      </TableCell>
                      <TableCell className="font-medium">
                        {entry.admin_email}
                      </TableCell>
                      <TableCell>
                        {entry.target_user_email || 'N/A'}
                      </TableCell>
                      <TableCell>
                        {entry.details && (
                          <div className="text-sm text-muted-foreground">
                            {entry.action === 'add_credits' && `+${entry.details.amount} credits`}
                            {entry.action === 'remove_credits' && `-${entry.details.amount} credits`}
                            {entry.details.reason && (
                              <div className="mt-1">
                                Reason: {entry.details.reason}
                              </div>
                            )}
                          </div>
                        )}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {new Date(entry.created_at).toLocaleString()}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              No audit log entries found.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};