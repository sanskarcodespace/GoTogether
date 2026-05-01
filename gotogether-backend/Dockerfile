FROM node:20-alpine

# Set working directory
WORKDIR /app

# Install dependencies first for Docker caching
COPY package*.json ./
RUN npm ci --only=production

# Copy built code
# Note: Ensure `npm run build` is run before docker build, or handle build inside docker
COPY dist ./dist

# Expose API port
EXPOSE 5000

# Start server
CMD ["node", "dist/server.js"]
