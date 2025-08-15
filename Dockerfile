FROM node:20-alpine
WORKDIR /app
COPY mcp-proxy-fixed.mjs .
RUN npm install express
CMD ["node", "mcp-proxy-fixed.mjs"]
