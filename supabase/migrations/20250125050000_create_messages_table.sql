-- Create messages table for chatbot functionality
CREATE TABLE IF NOT EXISTS public.messages (
    id BIGSERIAL PRIMARY KEY,
    role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    session_id UUID DEFAULT gen_random_uuid(),

    -- Add constraints
    CONSTRAINT messages_content_length CHECK (char_length(content) <= 10000)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS messages_created_at_idx ON public.messages(created_at DESC);
CREATE INDEX IF NOT EXISTS messages_user_id_idx ON public.messages(user_id);
CREATE INDEX IF NOT EXISTS messages_session_id_idx ON public.messages(session_id);
CREATE INDEX IF NOT EXISTS messages_role_idx ON public.messages(role);

-- Enable RLS
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
-- Users can view their own messages or public messages (no user_id)
CREATE POLICY "Users can view their own messages" ON public.messages
    FOR SELECT USING (
        user_id = auth.uid() OR
        user_id IS NULL OR
        auth.role() = 'service_role'
    );

-- Users can insert their own messages or anonymous messages
CREATE POLICY "Users can insert messages" ON public.messages
    FOR INSERT WITH CHECK (
        user_id = auth.uid() OR
        user_id IS NULL OR
        auth.role() = 'service_role'
    );

-- Only authenticated users can delete their own messages
CREATE POLICY "Users can delete their own messages" ON public.messages
    FOR DELETE USING (
        user_id = auth.uid() OR
        auth.role() = 'service_role'
    );

-- Grant permissions
GRANT ALL ON public.messages TO authenticated;
GRANT ALL ON public.messages TO anon;
GRANT USAGE, SELECT ON SEQUENCE public.messages_id_seq TO authenticated;
GRANT USAGE, SELECT ON SEQUENCE public.messages_id_seq TO anon;
