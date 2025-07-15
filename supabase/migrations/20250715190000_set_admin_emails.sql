-- migration: set admin emails for RLS policies

-- Set the admin emails configuration for RLS policies
ALTER DATABASE postgres SET "app.admin_emails" TO 'yuki2082710@gmail.com'; 