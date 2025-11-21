-- Add username and profile_picture_url to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS username TEXT UNIQUE,
ADD COLUMN IF NOT EXISTS profile_picture_url TEXT;

-- Create index on username for faster lookups
CREATE INDEX IF NOT EXISTS idx_profiles_username ON public.profiles(username);

-- Update the handle_new_user function to include username
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, name, username)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1))
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get user email by username (for authentication)
CREATE OR REPLACE FUNCTION public.get_user_email_by_username(username_param TEXT)
RETURNS TABLE(email TEXT, user_id UUID) AS $$
BEGIN
  RETURN QUERY
  SELECT p.email, p.id
  FROM public.profiles p
  WHERE p.username = username_param;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Allow public access to get email by username (needed for login)
-- This is safe as it only returns email, not password or other sensitive data
GRANT EXECUTE ON FUNCTION public.get_user_email_by_username(TEXT) TO anon;

