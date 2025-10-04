# Security Guide

## Supabase Anon Key - Is it Safe?

**Yes!** The Supabase anon key is designed to be public and can safely be included in your client-side code.

### Why It's Safe

1. **Public by Design**: The anon key is meant to be exposed in browsers and mobile apps
2. **Limited Permissions**: The anon key can only perform actions allowed by your Row Level Security (RLS) policies
3. **RLS Protection**: Your database tables are protected by RLS policies that ensure users can only access their own data

### What Keys to Protect

- ✅ **Anon Key**: Safe to expose in client-side code
- ❌ **Service Role Key**: NEVER expose this! It bypasses all RLS policies and should only be used on the server

## Row Level Security (RLS)

Your database is protected with the following RLS policies:

### Adkar Streaks Table
- Users can only **view** their own streaks
- Users can only **insert** streaks for themselves
- Users can only **update** their own streaks
- Users can only **delete** their own streaks

### User Preferences Table
- Users can only **view** their own preferences
- Users can only **insert** preferences for themselves
- Users can only **update** their own preferences
- Users can only **delete** their own preferences

## Best Practices

1. **Always Enable RLS**: Never create a table without enabling RLS
2. **Test Your Policies**: Verify that users cannot access other users' data
3. **Use Environment Variables**: Store your Supabase credentials in `.env` files (not committed to git)
4. **Service Role Key**: Keep this secret and only use it in server-side code or admin functions

## Account Deletion

The account deletion feature on the landing page:
1. Authenticates the user with email/password
2. Deletes their data (protected by RLS - only their own data)
3. Signs them out

RLS ensures that users can only delete their own data, even if they somehow obtained another user's ID.

## Environment Variables

Create a `.env` file in the `web` directory:

```bash
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

These can be safely committed to your repository or deployed to hosting platforms like Vercel, Netlify, etc.

## Additional Resources

- [Supabase Row Level Security Guide](https://supabase.com/docs/guides/auth/row-level-security)
- [When to use the service_role key](https://supabase.com/docs/guides/api/api-keys)

