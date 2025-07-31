# Dockerfile for CosmicLounge Lambda API
FROM --platform=linux/amd64 public.ecr.aws/lambda/nodejs:22

# Install dependencies
COPY package.json package-lock.json* ./
COPY prisma ./prisma
RUN npm ci --omit=dev
RUN npx prisma generate

# Copy source code
COPY dist/ ./



# Set the Lambda handler
CMD ["index.handler"]
