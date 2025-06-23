-- Add firstName and lastName columns to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS first_name VARCHAR(255);
ALTER TABLE users ADD COLUMN IF NOT EXISTS last_name VARCHAR(255);

-- Update existing users to have default names based on their username
UPDATE users 
SET first_name = COALESCE(first_name, SPLIT_PART(username, '.', 1)),
    last_name = COALESCE(last_name, SPLIT_PART(username, '.', 2))
WHERE first_name IS NULL OR last_name IS NULL;

-- For users with single word usernames, set first_name to username and last_name to empty
UPDATE users 
SET first_name = username,
    last_name = ''
WHERE last_name IS NULL OR last_name = ''; 