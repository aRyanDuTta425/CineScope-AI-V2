#!/bin/bash

# Local Docker Testing Script for CineScope AI
# This script helps you test your Docker container locally before deploying to Cloud Run

set -e

# Configuration
IMAGE_NAME="cinescope-ai"
CONTAINER_NAME="cinescope-ai-local"
PORT="8080"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🐳 CineScope AI - Local Docker Testing${NC}"
echo "======================================"

# Function to clean up existing container
cleanup() {
    echo -e "${YELLOW}🧹 Cleaning up existing container...${NC}"
    docker stop $CONTAINER_NAME 2>/dev/null || true
    docker rm $CONTAINER_NAME 2>/dev/null || true
}

# Function to build the image
build_image() {
    echo -e "${YELLOW}🔨 Building Docker image...${NC}"
    docker build -t $IMAGE_NAME .
    echo -e "${GREEN}✅ Image built successfully!${NC}"
}

# Function to run the container
run_container() {
    echo -e "${YELLOW}🚀 Starting container...${NC}"
    
    # Check if .env.local exists for local testing
    if [ -f ".env.local" ]; then
        echo -e "${BLUE}📋 Using .env.local for environment variables${NC}"
        docker run -d \
            --name $CONTAINER_NAME \
            -p $PORT:8080 \
            --env-file .env.local \
            $IMAGE_NAME
    else
        echo -e "${YELLOW}⚠️  No .env.local found. Running without environment variables.${NC}"
        echo -e "${YELLOW}   Create .env.local with your MongoDB URI and Gemini API key for full testing.${NC}"
        docker run -d \
            --name $CONTAINER_NAME \
            -p $PORT:8080 \
            -e NODE_ENV=production \
            -e PORT=8080 \
            $IMAGE_NAME
    fi
    
    echo -e "${GREEN}✅ Container started successfully!${NC}"
}

# Function to show container logs
show_logs() {
    echo -e "${BLUE}📋 Container logs:${NC}"
    docker logs $CONTAINER_NAME
}

# Function to test the application
test_app() {
    echo -e "${YELLOW}🧪 Testing application...${NC}"
    
    # Wait a moment for the container to start
    sleep 3
    
    # Test health endpoint
    echo -e "${BLUE}Testing health endpoint...${NC}"
    if curl -f http://localhost:$PORT/health >/dev/null 2>&1; then
        echo -e "${GREEN}✅ Health endpoint is working!${NC}"
    else
        echo -e "${RED}❌ Health endpoint failed${NC}"
        return 1
    fi
    
    # Test API health endpoint
    echo -e "${BLUE}Testing API health endpoint...${NC}"
    if curl -f http://localhost:$PORT/api/health >/dev/null 2>&1; then
        echo -e "${GREEN}✅ API health endpoint is working!${NC}"
    else
        echo -e "${RED}❌ API health endpoint failed${NC}"
        return 1
    fi
    
    # Test frontend
    echo -e "${BLUE}Testing frontend...${NC}"
    if curl -f http://localhost:$PORT/ >/dev/null 2>&1; then
        echo -e "${GREEN}✅ Frontend is accessible!${NC}"
    else
        echo -e "${RED}❌ Frontend failed${NC}"
        return 1
    fi
    
    echo -e "${GREEN}🎉 All tests passed!${NC}"
}

# Function to show usage info
show_info() {
    echo -e "${GREEN}🌐 Application URLs:${NC}"
    echo -e "   Frontend: ${BLUE}http://localhost:$PORT${NC}"
    echo -e "   Health Check: ${BLUE}http://localhost:$PORT/health${NC}"
    echo -e "   API Health: ${BLUE}http://localhost:$PORT/api/health${NC}"
    echo -e "   API Docs: ${BLUE}http://localhost:$PORT/api${NC}"
    echo ""
    echo -e "${YELLOW}📝 Useful commands:${NC}"
    echo -e "   View logs: ${BLUE}docker logs $CONTAINER_NAME${NC}"
    echo -e "   Stop container: ${BLUE}docker stop $CONTAINER_NAME${NC}"
    echo -e "   Shell into container: ${BLUE}docker exec -it $CONTAINER_NAME sh${NC}"
    echo -e "   Remove container: ${BLUE}docker rm $CONTAINER_NAME${NC}"
}

# Main execution
case "${1:-run}" in
    "build")
        cleanup
        build_image
        ;;
    "run")
        cleanup
        build_image
        run_container
        test_app
        show_info
        ;;
    "test")
        test_app
        ;;
    "logs")
        show_logs
        ;;
    "stop")
        cleanup
        echo -e "${GREEN}✅ Container stopped and removed${NC}"
        ;;
    "info")
        show_info
        ;;
    *)
        echo -e "${BLUE}Usage: $0 [command]${NC}"
        echo ""
        echo -e "${YELLOW}Commands:${NC}"
        echo -e "  ${BLUE}run${NC}    - Build and run the container (default)"
        echo -e "  ${BLUE}build${NC}  - Only build the Docker image"
        echo -e "  ${BLUE}test${NC}   - Test the running container"
        echo -e "  ${BLUE}logs${NC}   - Show container logs"
        echo -e "  ${BLUE}stop${NC}   - Stop and remove the container"
        echo -e "  ${BLUE}info${NC}   - Show application URLs and commands"
        echo ""
        echo -e "${YELLOW}Example .env.local file:${NC}"
        echo -e "MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/cinescope"
        echo -e "GEMINI_API_KEY=your_gemini_api_key_here"
        echo -e "NODE_ENV=production"
        ;;
esac
