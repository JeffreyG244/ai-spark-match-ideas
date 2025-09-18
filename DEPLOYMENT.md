# LuvLang Deployment Guide

## Production Build Instructions

### Prerequisites
- Node.js 18+ installed
- npm or yarn package manager

### Building for Static Hosting

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Build the production version:**
   ```bash
   npm run build
   ```

3. **The build output will be in the `dist/` folder ready for deployment**

### Deployment Package Contents

The `dist/` folder contains:
- `index.html` - Main entry point
- `assets/` - All CSS, JS, images, and fonts
- `_redirects` - Routing configuration for static hosts

### Deployment to Static Hosting Providers

#### Namecheap Shared Hosting
1. Upload all files from `dist/` folder to your public_html directory
2. Ensure `.htaccess` file includes SPA routing rules (see below)

#### Netlify
1. Drag and drop the `dist/` folder to Netlify dashboard
2. The `_redirects` file will handle routing automatically

#### Vercel
1. Import from Git or upload `dist/` folder
2. Set build command: `npm run build`
3. Set output directory: `dist`

### Apache .htaccess for SPA Routing

If your hosting doesn't support `_redirects`, create a `.htaccess` file in your root:

```apache
RewriteEngine On
RewriteBase /

# Handle client-side routing
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule . /index.html [L]

# Security headers
Header always set X-Frame-Options DENY
Header always set X-Content-Type-Options nosniff
Header always set Referrer-Policy strict-origin-when-cross-origin

# Cache static assets
<FilesMatch "\.(css|js|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$">
    ExpiresActive On
    ExpiresDefault "access plus 1 year"
</FilesMatch>
```

### Environment Configuration

The app is configured to work with:
- **Supabase Backend**: https://tzskjzkolyiwhijslqmq.supabase.co
- **Authentication**: Supabase Auth with email/password
- **Storage**: Supabase Storage for photos and files
- **Database**: PostgreSQL with RLS policies

### Features Included

- ✅ User Authentication (Login/Signup)
- ✅ Profile Management
- ✅ Photo Upload to Supabase Storage
- ✅ Messaging System
- ✅ Matching Algorithm
- ✅ Security Dashboard
- ✅ Responsive Design
- ✅ Professional UI/UX

### Post-Deployment Configuration

1. **Supabase Settings:**
   - Add your deployed URL to allowed origins
   - Configure email templates
   - Set up storage bucket policies

2. **DNS Configuration:**
   - Point your domain to your hosting provider
   - Consider CDN setup for better performance

### Troubleshooting

- **Blank page**: Check browser console for errors
- **API errors**: Verify Supabase configuration
- **Routing issues**: Ensure `_redirects` or `.htaccess` is properly configured
- **Missing assets**: Check if all files were uploaded correctly

### Performance Optimization

The build includes:
- Code splitting for faster loading
- Asset optimization and compression
- Lazy loading for better UX
- CDN-ready asset hashing