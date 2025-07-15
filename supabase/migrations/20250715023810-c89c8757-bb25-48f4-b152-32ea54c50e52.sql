-- Remove old N8N webhook function and trigger
DROP FUNCTION IF EXISTS trigger_n8n_webhook() CASCADE;

-- Remove old webhook test related tables if they exist
DROP TABLE IF EXISTS n8n_webhook_logs CASCADE;

-- Clean up any remaining webhook-related data from admin_actions
DELETE FROM admin_actions WHERE action_type = 'n8n_webhook_test';

-- Clean up any old security logs related to webhook testing
DELETE FROM security_logs WHERE event_type = 'n8n_webhook_test';