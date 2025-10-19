import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { authRateLimiter } from '@/utils/secureErrorHandler';

interface BugReportData {
  subject: string;
  category: string;
  description: string;
  stepsToReproduce?: string;
  currentUrl: string;
}

export const useBugReport = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const submitBugReport = async (data: BugReportData): Promise<boolean> => {
    setIsLoading(true);
    
    try {
      console.log('🐛 [BugReport] Starting bug report submission...');
      
      // Get session first to verify it exists
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      console.log('🐛 [BugReport] Session check:', {
        hasSession: !!session,
        hasAccessToken: !!session?.access_token,
        tokenPreview: session?.access_token?.substring(0, 20) + '...',
        expiresAt: session?.expires_at ? new Date(session.expires_at * 1000).toISOString() : 'N/A',
        sessionError: sessionError?.message
      });

      if (!session || !session.access_token) {
        throw new Error('No valid session found. Please log in again.');
      }

      // Get user details
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      console.log('🐛 [BugReport] User check:', {
        hasUser: !!user,
        userId: user?.id,
        userEmail: user?.email,
        userError: userError?.message
      });

      if (!user) {
        throw new Error('You must be logged in to report a bug');
      }

      // Rate limiting check
      const rateLimitKey = `bug-report-${user.id}`;
      if (authRateLimiter.isRateLimited(rateLimitKey)) {
        toast({
          title: "Too many bug reports",
          description: "Please wait before submitting another bug report. You can submit up to 5 reports per hour.",
          variant: "destructive",
        });
        return false;
      }

      console.log('🐛 [BugReport] Invoking edge function with data:', {
        subject: data.subject,
        category: data.category,
        descriptionLength: data.description.length,
        currentUrl: data.currentUrl
      });

      // Call the edge function with retry logic for expired sessions
      let retryCount = 0;
      const maxRetries = 1;

      while (retryCount <= maxRetries) {
        const { data: result, error } = await supabase.functions.invoke('send-bug-report', {
          body: data,
        });

        console.log('🐛 [BugReport] Edge function response:', {
          hasResult: !!result,
          hasError: !!error,
          errorMessage: error?.message,
          errorDetails: error,
          retryCount
        });

        if (error && (error.message === 'Unauthorized' || error.message?.includes('Unauthorized')) && retryCount < maxRetries) {
          console.log('🐛 [BugReport] Unauthorized error, attempting to refresh session...');
          
          // Refresh the session
          const { data: { session: refreshedSession }, error: refreshError } = 
            await supabase.auth.refreshSession();
          
          console.log('🐛 [BugReport] Session refresh result:', {
            hasSession: !!refreshedSession,
            refreshError: refreshError?.message
          });
          
          if (refreshError || !refreshedSession) {
            throw new Error('Session expired. Please log in again.');
          }
          
          retryCount++;
          continue; // Retry the function call
        }

        if (error) {
          throw error;
        }

        // Success!
        // Record attempt for rate limiting
        authRateLimiter.recordAttempt(rateLimitKey);

        toast({
          title: "Bug report submitted",
          description: "Thank you for helping us improve! We'll investigate this issue.",
        });

        return true;
      }

      return false;
    } catch (error: any) {
      console.error('🐛 [BugReport] Submission failed:', {
        message: error.message,
        stack: error.stack,
        fullError: error
      });
      
      toast({
        title: "Failed to submit bug report",
        description: error.message || "An error occurred while submitting your bug report. Please try again.",
        variant: "destructive",
      });

      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    submitBugReport,
    isLoading,
  };
};
