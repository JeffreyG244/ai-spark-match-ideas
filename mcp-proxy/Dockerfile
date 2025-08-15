FROM node:20-alpine
WORKDIR /app
COPY package.json .
RUN npm install
COPY . .
EXPOSE 5679
HEALTHCHECK --interval=30s --timeout=3s \
  CMD curl -f http://localhost:5679/health || exit 1
CMD ["node", "server.js"]
