-- Add session_id column to chat_history table
-- Run this in Supabase SQL Editor

-- Add the column (allow NULL initially for existing rows)
ALTER TABLE chat_history ADD COLUMN IF NOT EXISTS session_id text;

-- For existing rows without session_id, set it to their own id (each old message becomes its own session)
UPDATE chat_history SET session_id = id WHERE session_id IS NULL;

-- Now make it NOT NULL
ALTER TABLE chat_history ALTER COLUMN session_id SET NOT NULL;

-- Add index for better query performance
CREATE INDEX IF NOT EXISTS idx_chat_session ON chat_history(session_id);
CREATE INDEX IF NOT EXISTS idx_chat_teacher_session ON chat_history(teacher_id, session_id);

-- Verify the changes
SELECT * FROM chat_history LIMIT 5;
