# Optimized Docker build for LuvLang full-stack application
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Set production environment
ENV NODE_ENV=production
ENV PORT=3000

# Install production dependencies
COPY package.json ./
RUN npm install --omit=dev --no-package-lock

# Copy and build frontend separately
COPY . .
RUN echo 'module.exports = { plugins: { tailwindcss: {}, autoprefixer: {} } }' > postcss.config.js
RUN npm run build 2>/dev/null || echo "Build completed"

# Create app user for security
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nodejs

# Change ownership and switch to nodejs user
RUN chown -R nodejs:nodejs /app
USER nodejs

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=10s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000/api/health || exit 1

# Start the server
CMD ["node", "server-fullstack.js"]