# syntax = docker/dockerfile:1

### ---- BASE STAGE ----
    ARG NODE_VERSION=23.11.0
    FROM node:${NODE_VERSION}-slim AS base
    LABEL fly_launch_runtime="Node.js/Prisma"
    
    WORKDIR /app
    ENV NODE_ENV=production
    
    ### ---- BUILD STAGE ----
    FROM base AS build
    
    # Install system dependencies
    RUN apt-get update -qq && \
        apt-get install --no-install-recommends -y \
            build-essential \
            node-gyp \
            openssl \
            pkg-config \
            python-is-python3 && \
        rm -rf /var/lib/apt/lists/*
    
    # Copy only what's needed to install dependencies
    COPY package*.json ./
    
    # Install dev dependencies
    RUN npm ci --include=dev
    
    # Copy prisma and generate client
    COPY prisma ./prisma/
    RUN npx prisma generate
    
    # Copy rest of app source
    COPY . .
    
    # Build source code (transpile TS -> JS into /lib)
    RUN npm run build
    
    # Sanity check: confirm output exists
    RUN echo "📁 lib contents after build:" && ls -l lib && cat lib/src/index.js
    
    # Prune dev dependencies for production
    RUN npm prune --omit=dev
    
    ### ---- FINAL STAGE ----
    FROM base
    
    # Minimal system packages for Prisma (e.g., OpenSSL)
    RUN apt-get update -qq && \
        apt-get install --no-install-recommends -y openssl && \
        rm -rf /var/lib/apt/lists/*
    
    # Copy built app and production node_modules
    COPY --from=build /app /app
    
    # Set default port
    EXPOSE 8080
    
    # Run the compiled app
    COPY docker-entrypoint.sh /docker-entrypoint.sh
    RUN chmod +x /docker-entrypoint.sh
    
    ENTRYPOINT ["/docker-entrypoint.sh"]
    CMD ["node", "lib/src/index.js"]
    