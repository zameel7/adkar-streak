# Adkar Champ - Landing Page

A minimal and modern landing page for the Adkar Champ mobile application, built with React + Vite.

## Features

- 🏠 **Landing Page** - Beautiful hero section showcasing the app's features
- 🔒 **Privacy Policy** - Detailed privacy policy for users
- 🗑️ **Account Deletion** - Self-service account deletion with Supabase integration
- ⚡ **Fast** - Built with Vite for lightning-fast development and production builds
- 📱 **Responsive** - Mobile-first design that works on all devices
- 🎨 **Minimal UI** - Clean and modern interface

## Getting Started

### Prerequisites

- Node.js 18+ installed
- npm or yarn package manager

### Installation

1. Navigate to the web directory:
   ```bash
   cd web
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file based on `.env.example`:
   ```bash
   cp .env.example .env
   ```

4. Add your Supabase credentials to `.env`:
   ```
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

### Development

Start the development server:
```bash
npm run dev
```

The site will be available at `http://localhost:3000`

### Building for Production

Build the site for production:
```bash
npm run build
```

Preview the production build:
```bash
npm run preview
```

## Project Structure

```
web/
├── src/
│   ├── components/
│   │   ├── Layout.tsx       # Main layout with navigation
│   │   └── Layout.css
│   ├── pages/
│   │   ├── Home.tsx         # Landing page
│   │   ├── Home.css
│   │   ├── PrivacyPolicy.tsx
│   │   ├── PrivacyPolicy.css
│   │   ├── DeleteAccount.tsx
│   │   └── DeleteAccount.css
│   ├── lib/
│   │   └── supabase.ts      # Supabase client
│   ├── App.tsx              # Main app component with routing
│   ├── main.tsx             # Entry point
│   └── index.css            # Global styles
├── index.html
├── package.json
├── tsconfig.json
└── vite.config.ts
```

## Routes

- `/` - Landing page
- `/privacy` - Privacy policy
- `/delete-account` - Account deletion page

## Technologies Used

- **React 18** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **React Router** - Client-side routing
- **Supabase** - Backend and authentication

## Deployment

This site can be deployed to any static hosting service:

- **Vercel**: `vercel deploy`
- **Netlify**: `netlify deploy`
- **GitHub Pages**: Build and deploy the `dist` folder
- **Firebase Hosting**: `firebase deploy`

Make sure to set the environment variables in your hosting platform's settings.

## License

MIT License - see the main project LICENSE file for details.

## Support

If you like this project, please consider:
- ⭐ Starring the repository
- ☕ [Buying me a coffee](https://www.buymeacoffee.com/zameel7)

Jazakallah Khair!

