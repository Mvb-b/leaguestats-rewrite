FROM node:20-slim

WORKDIR /app

# Install dependencies
RUN apt-get update && apt-get install -y openssl libssl-dev && rm -rf /var/lib/apt/lists/*

# Copy package files
COPY package.json package-lock.json ./
RUN npm ci --omit=dev

# Copy prisma schema
COPY prisma ./prisma/
COPY .env.example ./.env.local

# Generate Prisma client
RUN npx prisma generate

# Copy application code
COPY . .

# Build the application
RUN npm run build

# Expose port
EXPOSE 3000

# Start the application
CMD ["npm", "start"]
