FROM node:20-alpine

WORKDIR /app

# Install dependencies first for better caching
COPY package*.json ./
RUN npm ci

# Copy the rest of the application
COPY . .

# Expose port (default 5001)
EXPOSE 5001

CMD ["npm", "start"]
