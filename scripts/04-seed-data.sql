-- This script adds sample data for testing (optional)
-- You can run this after setting up the tables to have some initial data

-- Note: Replace the user_id values with actual user IDs from your auth.users table
-- You can get your user ID by running: SELECT id FROM auth.users WHERE email = 'your-email@example.com';

-- Sample clients (uncomment and update user_id after getting your actual user ID)
/*
INSERT INTO public.clients (user_id, name, email, company, phone) VALUES
  ('your-user-id-here', 'John Smith', 'john@techcorp.com', 'TechCorp Inc.', '+1-555-0123'),
  ('your-user-id-here', 'Sarah Johnson', 'sarah@designstudio.com', 'Design Studio', '+1-555-0456'),
  ('your-user-id-here', 'Mike Wilson', 'mike@startup.io', 'Startup.io', '+1-555-0789');
*/

-- Sample tasks (uncomment and update user_id and client_id after setting up clients)
/*
INSERT INTO public.tasks (user_id, client_id, title, description, status, priority, hourly_rate, estimated_hours) VALUES
  ('your-user-id-here', 'client-id-here', 'Website Redesign', 'Complete redesign of company website', 'in-progress', 'high', 75.00, 40),
  ('your-user-id-here', 'client-id-here', 'Mobile App Development', 'Develop iOS and Android app', 'pending', 'medium', 85.00, 80);
*/
