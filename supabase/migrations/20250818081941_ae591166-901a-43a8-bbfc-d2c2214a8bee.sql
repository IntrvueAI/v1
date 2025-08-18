-- Create interview_sessions table for comprehensive logging
CREATE TABLE public.interview_sessions (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    session_reference VARCHAR(10) NOT NULL UNIQUE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    interview_type VARCHAR(50) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'active',
    started_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    ended_at TIMESTAMP WITH TIME ZONE,
    last_activity_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    anam_session_token_hash VARCHAR(64),
    session_metadata JSONB DEFAULT '{}',
    error_logs JSONB DEFAULT '[]',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.interview_sessions ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own interview sessions" 
ON public.interview_sessions 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own interview sessions" 
ON public.interview_sessions 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own interview sessions" 
ON public.interview_sessions 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Create interview_logs table for detailed event logging
CREATE TABLE public.interview_logs (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    session_id UUID REFERENCES public.interview_sessions(id) ON DELETE CASCADE,
    log_type VARCHAR(50) NOT NULL,
    log_level VARCHAR(20) NOT NULL DEFAULT 'info',
    message TEXT NOT NULL,
    metadata JSONB DEFAULT '{}',
    timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.interview_logs ENABLE ROW LEVEL SECURITY;

-- Create policies for logs
CREATE POLICY "Users can view logs for their own sessions" 
ON public.interview_logs 
FOR SELECT 
USING (EXISTS (
    SELECT 1 FROM public.interview_sessions 
    WHERE interview_sessions.id = interview_logs.session_id 
    AND interview_sessions.user_id = auth.uid()
));

CREATE POLICY "System can insert logs" 
ON public.interview_logs 
FOR INSERT 
WITH CHECK (true);

-- Create indexes for performance
CREATE INDEX idx_interview_sessions_user_id ON public.interview_sessions(user_id);
CREATE INDEX idx_interview_sessions_reference ON public.interview_sessions(session_reference);
CREATE INDEX idx_interview_sessions_status ON public.interview_sessions(status);
CREATE INDEX idx_interview_logs_session_id ON public.interview_logs(session_id);
CREATE INDEX idx_interview_logs_timestamp ON public.interview_logs(timestamp);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_interview_sessions_updated_at
BEFORE UPDATE ON public.interview_sessions
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Function to generate unique session reference
CREATE OR REPLACE FUNCTION public.generate_session_reference()
RETURNS VARCHAR(10) AS $$
DECLARE
    chars TEXT := 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    result VARCHAR(10) := '';
    i INTEGER;
BEGIN
    FOR i IN 1..10 LOOP
        result := result || substr(chars, floor(random() * length(chars))::int + 1, 1);
    END LOOP;
    
    -- Check if it already exists (extremely unlikely but better safe)
    WHILE EXISTS(SELECT 1 FROM public.interview_sessions WHERE session_reference = result) LOOP
        result := '';
        FOR i IN 1..10 LOOP
            result := result || substr(chars, floor(random() * length(chars))::int + 1, 1);
        END LOOP;
    END LOOP;
    
    RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;