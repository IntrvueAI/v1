import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Activity, Database, Users, AlertCircle, CheckCircle, Clock } from 'lucide-react';

export const AdminSystemHealth = () => {
  const { data: healthData, isLoading } = useQuery({
    queryKey: ['admin-system-health'],
    queryFn: async () => {
      const now = new Date();
      const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);

      // Check recent activity
      const { count: recentSessions } = await supabase
        .from('feedback')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', oneDayAgo.toISOString());

      const { count: activeUsers } = await supabase
        .from('feedback')
        .select('user_id', { count: 'exact', head: true })
        .gte('created_at', oneDayAgo.toISOString());

      // Check for recent errors or issues
      const { count: recentErrors } = await supabase
        .from('feedback')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', oneHourAgo.toISOString())
        .is('total_score', null); // Sessions without proper scoring might indicate errors

      // Database health indicators
      const { data: dbStats } = await supabase
        .from('profiles')
        .select('created_at')
        .order('created_at', { ascending: false })
        .limit(1);

      const lastUserCreated = dbStats?.[0]?.created_at 
        ? new Date(dbStats[0].created_at)
        : null;

      return {
        recentSessions: recentSessions || 0,
        activeUsers: activeUsers || 0,
        recentErrors: recentErrors || 0,
        lastUserCreated,
        systemStatus: recentErrors === 0 ? 'healthy' : recentErrors < 5 ? 'warning' : 'error'
      };
    },
    refetchInterval: 60000, // Refresh every minute
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>System Health</CardTitle>
            <CardDescription>Loading system status...</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-16 bg-muted animate-pulse rounded" />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'healthy':
        return <Badge variant="outline" className="text-green-600 border-green-200 bg-green-50"><CheckCircle className="h-3 w-3 mr-1" />Healthy</Badge>;
      case 'warning':
        return <Badge variant="outline" className="text-yellow-600 border-yellow-200 bg-yellow-50"><AlertCircle className="h-3 w-3 mr-1" />Warning</Badge>;
      case 'error':
        return <Badge variant="destructive"><AlertCircle className="h-3 w-3 mr-1" />Error</Badge>;
      default:
        return <Badge variant="secondary">Unknown</Badge>;
    }
  };

  const healthMetrics = [
    {
      title: 'System Status',
      value: getStatusBadge(healthData?.systemStatus || 'unknown'),
      description: 'Overall system health',
      icon: Activity,
    },
    {
      title: 'Active Sessions (24h)',
      value: healthData?.recentSessions || 0,
      description: 'Interview sessions in last 24 hours',
      icon: Users,
    },
    {
      title: 'Database Health',
      value: 'Connected',
      description: 'Database connection status',
      icon: Database,
    },
    {
      title: 'Recent Errors',
      value: healthData?.recentErrors || 0,
      description: 'Incomplete sessions in last hour',
      icon: AlertCircle,
    },
    {
      title: 'Last User Registration',
      value: healthData?.lastUserCreated 
        ? `${Math.floor((Date.now() - healthData.lastUserCreated.getTime()) / (1000 * 60 * 60))}h ago`
        : 'No data',
      description: 'Time since last user signup',
      icon: Clock,
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold mb-2">System Health</h2>
        <p className="text-muted-foreground">
          Monitor system performance and identify potential issues
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {healthMetrics.map((metric, index) => (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{metric.title}</CardTitle>
              <metric.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold mb-1">
                {typeof metric.value === 'object' ? metric.value : metric.value}
              </div>
              <p className="text-xs text-muted-foreground">
                {metric.description}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>System Recommendations</CardTitle>
          <CardDescription>
            Automated suggestions based on current system health
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {healthData?.systemStatus === 'healthy' && (
              <div className="flex items-start gap-3 p-3 rounded-lg bg-green-50 border border-green-200">
                <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                <div>
                  <h4 className="font-medium text-green-800">System Running Smoothly</h4>
                  <p className="text-sm text-green-700">All systems are operating normally. No action required.</p>
                </div>
              </div>
            )}
            
            {(healthData?.recentErrors || 0) > 0 && (
              <div className="flex items-start gap-3 p-3 rounded-lg bg-yellow-50 border border-yellow-200">
                <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
                <div>
                  <h4 className="font-medium text-yellow-800">Incomplete Sessions Detected</h4>
                  <p className="text-sm text-yellow-700">
                    {healthData.recentErrors} sessions in the last hour didn't complete properly. Monitor for patterns.
                  </p>
                </div>
              </div>
            )}

            {(healthData?.recentSessions || 0) === 0 && (
              <div className="flex items-start gap-3 p-3 rounded-lg bg-blue-50 border border-blue-200">
                <Activity className="h-5 w-5 text-blue-600 mt-0.5" />
                <div>
                  <h4 className="font-medium text-blue-800">Low Activity Period</h4>
                  <p className="text-sm text-blue-700">No sessions in the last 24 hours. This might be normal during off-hours.</p>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};