drop trigger if exists on_auth_user_created on auth.users;

notify pgrst, 'reload schema';
