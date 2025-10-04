# Supabase Database Setup

This folder contains all the SQL scripts needed to set up your Adkar Champ database with proper Row Level Security (RLS).

## Files

- `schema.sql` - Complete database schema with tables, policies, triggers, and functions
- `apply-rls-policies.sql` - Script to add missing DELETE policies (safe to run multiple times)

## How to Apply

### Method 1: Supabase Dashboard (Recommended)

1. **Go to Supabase Dashboard**
   - Visit https://supabase.com/dashboard
   - Select your Adkar Champ project

2. **Open SQL Editor**
   - Click **SQL Editor** in the left sidebar
   - Click **New Query**

3. **Run the Schema**
   
   **If setting up for the first time:**
   ```sql
   -- Copy and paste the entire contents of schema.sql
   -- Click Run (or Ctrl/Cmd + Enter)
   ```

   **If you already have tables and just need DELETE policies:**
   ```sql
   -- Copy and paste the contents of apply-rls-policies.sql
   -- Click Run (or Ctrl/Cmd + Enter)
   ```

4. **Verify**
   - Check the output messages
   - You should see confirmation that policies were created

### Method 2: Supabase CLI

If you have Supabase CLI installed:

```bash
# Initialize Supabase in your project (first time only)
supabase init

# Link to your remote project
supabase link --project-ref your-project-ref

# Apply migrations
supabase db push
```

### Method 3: Using psql (Advanced)

If you have direct database access:

```bash
psql "your-database-connection-string" < supabase/schema.sql
```

## What's Included

### Tables

1. **adkar_streaks** - Stores user's daily adkar completion status
   - Tracks morning and evening adkar for each date
   - One record per user per date

2. **user_preferences** - Stores user settings and preferences
   - Name, notification times, theme preferences
   - One record per user

### Row Level Security Policies

All tables have RLS enabled with policies for:
- ✅ **SELECT** - Users can view their own data
- ✅ **INSERT** - Users can create their own records
- ✅ **UPDATE** - Users can update their own records
- ✅ **DELETE** - Users can delete their own records

### Functions & Triggers

- `handle_new_user()` - Automatically creates user preferences on signup
- `update_updated_at_column()` - Automatically updates timestamps
- Triggers for both functions on appropriate tables

### Indexes

Performance indexes on:
- `user_id` columns
- `(user_id, date)` combinations

## Testing RLS Policies

After applying, you can test the policies:

```sql
-- Test as authenticated user (replace 'user-uuid' with actual user ID)
SET request.jwt.claims = '{"sub": "user-uuid"}';

-- These should work
SELECT * FROM adkar_streaks WHERE user_id = 'user-uuid';
INSERT INTO adkar_streaks (user_id, date) VALUES ('user-uuid', CURRENT_DATE);
UPDATE adkar_streaks SET morning = true WHERE user_id = 'user-uuid';
DELETE FROM adkar_streaks WHERE user_id = 'user-uuid';

-- This should return no results (can't see other users' data)
SELECT * FROM adkar_streaks WHERE user_id != 'user-uuid';
```

## Troubleshooting

### Tables Already Exist?

If you get errors about tables already existing:

1. Use `apply-rls-policies.sql` instead of `schema.sql`
2. Or manually add only the missing policies from the error messages

### RLS Not Working?

Check if RLS is enabled:

```sql
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('adkar_streaks', 'user_preferences');
```

If `rowsecurity` is `false`, enable it:

```sql
ALTER TABLE adkar_streaks ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;
```

### Verify All Policies

List all policies:

```sql
SELECT tablename, policyname, cmd 
FROM pg_policies 
WHERE schemaname = 'public';
```

You should see 4 policies per table (SELECT, INSERT, UPDATE, DELETE).

## Security Notes

- 🔒 All tables must have RLS enabled
- ✅ Policies use `auth.uid()` to ensure users only access their own data
- 🔑 The anon key is safe for client-side use
- ❌ Never expose the service_role key

## Need Help?

- [Supabase RLS Documentation](https://supabase.com/docs/guides/auth/row-level-security)
- [Supabase Policies Guide](https://supabase.com/docs/guides/database/postgres/row-level-security)
- Open an issue on GitHub

