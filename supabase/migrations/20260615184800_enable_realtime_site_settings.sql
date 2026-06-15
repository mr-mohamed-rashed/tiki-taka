begin;
  -- Add the site_settings table to the supabase_realtime publication
  -- This allows clients to subscribe to changes on this table
  
  -- Check if publication exists, if not create it
  -- (supabase_realtime usually exists by default in Supabase)
  create publication supabase_realtime if not exists;
  
  -- Add the table to the publication
  alter publication supabase_realtime add table public.site_settings;
commit;
