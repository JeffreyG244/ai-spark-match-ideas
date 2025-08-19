-- Add deleted_at column to conversation_messages table for soft deletion
-- This allows messages to be marked as deleted without losing them from the database

-- Add deleted_at column (nullable timestamp)
ALTER TABLE conversation_messages 
ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ DEFAULT NULL;

-- Create index for performance when filtering out deleted messages
CREATE INDEX IF NOT EXISTS idx_conversation_messages_deleted_at 
ON conversation_messages(conversation_id, deleted_at);

-- Create index for performance when querying non-deleted messages
CREATE INDEX IF NOT EXISTS idx_conversation_messages_active 
ON conversation_messages(conversation_id, created_at) 
WHERE deleted_at IS NULL;

-- Update RLS policies to handle message deletion
-- Allow users to update (soft delete) their own messages
DROP POLICY IF EXISTS "Users can update their own messages" ON conversation_messages;
CREATE POLICY "Users can update their own messages" ON conversation_messages
    FOR UPDATE USING (auth.uid() = sender_id);

-- Allow users to delete their own messages (for hard deletion if needed)
DROP POLICY IF EXISTS "Users can delete their own messages" ON conversation_messages;
CREATE POLICY "Users can delete their own messages" ON conversation_messages
    FOR DELETE USING (auth.uid() = sender_id);

-- Comment explaining the soft deletion approach
COMMENT ON COLUMN conversation_messages.deleted_at IS 
'Timestamp when message was soft deleted by user. NULL means message is active.';

-- Verify the changes
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'conversation_messages' 
AND column_name = 'deleted_at';