# Quick Setup Guide

## What's Been Created

A complete landing page for Adkar Champ with:

### Pages
1. **Home** (`/`) - Landing page with hero section, features, and CTAs
2. **Privacy Policy** (`/privacy`) - Your existing privacy policy content
3. **Delete Account** (`/delete-account`) - Self-service account deletion with Supabase integration

### Features
- ✅ Modern, minimal UI with responsive design
- ✅ React + Vite for fast development
- ✅ TypeScript for type safety
- ✅ React Router for navigation
- ✅ Supabase integration for account deletion
- ✅ Mobile-first responsive design

## Getting Started

### 1. Install Dependencies

```bash
cd web
npm install
```

### 2. Configure Environment Variables

Create a `.env` file:

```bash
cp .env.example .env
```

Edit `.env` and add your Supabase credentials:

```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key_here
```

### 3. Update Database (If Needed)

If you haven't already applied the RLS policies, run the SQL in `/supabase/schema.sql` in your Supabase SQL editor. I've added DELETE policies to enable the account deletion feature.

### 4. Run Development Server

```bash
npm run dev
```

Visit `http://localhost:3000`

### 5. Build for Production

```bash
npm run build
```

The production files will be in the `dist` folder.

## Deployment Options

### Vercel (Recommended)
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
cd web
vercel
```

Set environment variables in Vercel dashboard.

### Netlify
```bash
# Install Netlify CLI
npm i -g netlify-cli

# Deploy
cd web
netlify deploy --prod
```

Set environment variables in Netlify dashboard.

### Other Platforms
The `dist` folder can be deployed to:
- GitHub Pages
- Firebase Hosting
- Cloudflare Pages
- AWS S3 + CloudFront
- Any static hosting service

## Project Structure

```
web/
├── public/
│   └── favicon.png          # App icon
├── src/
│   ├── components/
│   │   ├── Layout.tsx       # Navigation & footer
│   │   └── Layout.css
│   ├── pages/
│   │   ├── Home.tsx         # Landing page
│   │   ├── PrivacyPolicy.tsx
│   │   └── DeleteAccount.tsx
│   ├── lib/
│   │   └── supabase.ts      # Supabase client
│   ├── App.tsx              # Router setup
│   ├── main.tsx             # Entry point
│   └── index.css            # Global styles
├── .env                     # Environment variables (git-ignored)
├── .env.example             # Template for .env
├── package.json
├── vite.config.ts
└── tsconfig.json
```

## Security

✅ **The Supabase anon key is safe to use in client-side code!**

See [SECURITY.md](./SECURITY.md) for detailed information about:
- Why it's safe to expose the anon key
- Row Level Security (RLS) policies
- Best practices

## Customization

### Colors
Edit CSS variables in `src/index.css`:
```css
:root {
  --primary: #10b981;        /* Green theme color */
  --primary-dark: #059669;
  --text: #1f2937;
  --text-light: #6b7280;
  /* ... */
}
```

### Content
- Update text in `src/pages/Home.tsx`
- Modify privacy policy in `src/pages/PrivacyPolicy.tsx`
- Change links in `src/components/Layout.tsx`

### Logo
Replace the 🤲 emoji in `Layout.tsx` with an image:
```tsx
<img src="/logo.png" alt="Adkar Champ" />
```

## Need Help?

- Check [README.md](./README.md) for more details
- Review [SECURITY.md](./SECURITY.md) for security info
- Open an issue on GitHub

---

Built with ❤️ for the Ummah

