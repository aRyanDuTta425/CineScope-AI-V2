#!/bin/bash

# Google Cloud Run Deployment Script for CineScope AI MERN App
# Make sure you have gcloud CLI installed and authenticated

set -e

# Configuration variables
PROJECT_ID="gen-lang-client-0740288381"  # Using your Gemini API project
SERVICE_NAME="cinescope-ai"
REGION="us-central1"  # Change to your preferred region
IMAGE_NAME="gcr.io/${PROJECT_ID}/${SERVICE_NAME}"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}🚀 Starting deployment of CineScope AI to Google Cloud Run${NC}"

# Step 1: Set the active project
echo -e "${YELLOW}📋 Setting up GCP project...${NC}"
gcloud config set project $PROJECT_ID

# Step 2: Enable required APIs
echo -e "${YELLOW}🔧 Enabling required Google Cloud APIs...${NC}"
gcloud services enable cloudbuild.googleapis.com
gcloud services enable run.googleapis.com
gcloud services enable containerregistry.googleapis.com

# Step 3: Build and push the Docker image
echo -e "${YELLOW}🐳 Building Docker image...${NC}"
gcloud builds submit --tag $IMAGE_NAME .

# Step 4: Deploy to Cloud Run
echo -e "${YELLOW}🚀 Deploying to Cloud Run...${NC}"
gcloud run deploy $SERVICE_NAME \
  --image $IMAGE_NAME \
  --platform managed \
  --region $REGION \
  --allow-unauthenticated \
  --port 8080 \
  --memory 1Gi \
  --cpu 1 \
  --min-instances 0 \
  --max-instances 10 \
  --timeout 300 \
  --concurrency 80 \
  --set-env-vars "NODE_ENV=production"

# Step 5: Get the service URL
echo -e "${YELLOW}🔗 Getting service URL...${NC}"
SERVICE_URL=$(gcloud run services describe $SERVICE_NAME --platform managed --region $REGION --format 'value(status.url)')

echo -e "${GREEN}✅ Deployment completed successfully!${NC}"
echo -e "${GREEN}🌐 Your app is available at: ${SERVICE_URL}${NC}"
echo -e "${YELLOW}📝 Next steps:${NC}"
echo -e "   1. Set up your environment variables using: gcloud run services update ${SERVICE_NAME} --set-env-vars KEY=VALUE"
echo -e "   2. Configure custom domain if needed"
echo -e "   3. Set up CI/CD pipeline for automatic deployments"
