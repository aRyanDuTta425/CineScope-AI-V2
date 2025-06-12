# MERN Movie Dashboard

A full-stack MERN application that allows users to search for movies using natural language queries and visualize movie data through interactive dashboards. The application leverages MongoDB Atlas Vector Search and Google Gemini AI for intelligent movie discovery and insights.

## 🚀 Features

- **AI-Powered Search**: Use natural language queries like "movies like The Matrix" or "popular sci-fi films"
- **Vector Search**: MongoDB Atlas Vector Search for semantic movie discovery
- **Interactive Dashboard**: Visualize movie data with charts showing:
  - Movie count by genre
  - Average IMDB ratings by genre
  - Movie release distribution over years
- **AI Insights**: Gemini-generated recommendations and insights about search results
- **Responsive Design**: Modern, mobile-friendly interface

## 🛠 Tech Stack

### Frontend
- **React** - User interface
- **React Router** - Navigation
- **Chart.js** - Data visualizations
- **Axios** - HTTP client
- **CSS3** - Styling (no external frameworks)

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB Atlas** - Database with Vector Search
- **Mongoose** - MongoDB object modeling
- **Google Gemini AI** - Text generation and embeddings

### Database
- **MongoDB Atlas** - Cloud database
- **sample_mflix.embedded_movies** - Pre-loaded dataset with vector embeddings

## 📋 Prerequisites

Before running this application, make sure you have:

1. **Node.js** (v16 or higher)
2. **npm** or **yarn**
3. **MongoDB Atlas account** with access to sample_mflix dataset
4. **Google AI Studio account** for Gemini API key

## 🔧 Installation & Setup

### 1. Clone the Repository

\`\`\`bash
git clone <repository-url>
cd mern-movie-dashboard
\`\`\`

### 2. Install Dependencies

Install all dependencies for both frontend and backend:

\`\`\`bash
npm run install-all
\`\`\`

Or install manually:

\`\`\`bash
# Install root dependencies
npm install

# Install server dependencies
cd server
npm install

# Install client dependencies
cd ../client
npm install
\`\`\`

### 3. MongoDB Atlas Setup

1. **Create MongoDB Atlas Account**
   - Go to [MongoDB Atlas](https://www.mongodb.com/atlas)
   - Create a free account or sign in

2. **Load Sample Data**
   - In your Atlas dashboard, click "Browse Collections"
   - Click "Load Sample Dataset"
   - Wait for the sample data to load (includes sample_mflix database)

3. **Create Vector Search Index**
   - Navigate to your cluster in Atlas
   - Go to "Search" tab
   - Create a new search index on \`sample_mflix.embedded_movies\` collection
   - Use this configuration:

\`\`\`json
{
  "fields": [
    {
      "numDimensions": 1536,
      "path": "plot_embedding",
      "similarity": "cosine",
      "type": "vector"
    }
  ]
}
\`\`\`

4. **Get Connection String**
   - Click "Connect" → "Connect your application"
   - Copy the connection string
   - Replace \`<password>\` with your database user password

### 4. Google Gemini API Setup

1. **Get Gemini API Key**
   - Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
   - Create a new API key
   - Copy the API key

### 5. Environment Configuration

1. **Create Environment File**
   \`\`\`bash
   cp .env.example .env
   \`\`\`

2. **Configure Environment Variables**
   Edit the \`.env\` file:

   \`\`\`env
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/sample_mflix
   GEMINI_API_KEY=your_gemini_api_key_here
   PORT=5000
   NODE_ENV=development
   \`\`\`

### 6. Run the Application

**Development Mode (Recommended)**
\`\`\`bash
npm run dev
\`\`\`

This runs both frontend and backend concurrently.

**Manual Start**
\`\`\`bash
# Terminal 1 - Backend
cd server
npm run dev

# Terminal 2 - Frontend
cd client
npm start
\`\`\`

## 🌐 Access the Application

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000
- **API Health Check**: http://localhost:5000/api/health

## 📚 API Endpoints

### Movies API
- \`POST /api/movies/search\` - Search movies
- \`POST /api/movies/insights\` - Get AI insights for movies
- \`POST /api/movies/analyze\` - Analyze search query

### Dashboard API
- \`GET /api/dashboard/data\` - Get all dashboard data
- \`GET /api/dashboard/genres\` - Get genre statistics
- \`GET /api/dashboard/ratings\` - Get rating statistics
- \`GET /api/dashboard/years\` - Get year distribution

## 🔍 Usage Examples

### Search Queries
Try these natural language searches:
- "movies like The Matrix"
- "popular sci-fi films"
- "romantic comedies from the 90s"
- "action movies with high ratings"
- "thriller films from Christopher Nolan"

### API Usage
\`\`\`javascript
// Search for movies
const response = await fetch('/api/movies/search', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    query: "movies like The Matrix",
    useVector: true
  })
});

// Get dashboard data
const dashboardData = await fetch('/api/dashboard/data');
\`\`\`

## 🏗 Project Structure

\`\`\`
mern-movie-dashboard/
├── client/                 # React frontend
│   ├── public/
│   ├── src/
│   │   ├── components/     # Reusable components
│   │   │   ├── Charts/     # Chart components
│   │   │   ├── MovieCard.js
│   │   │   └── SearchBar.js
│   │   ├── pages/          # Page components
│   │   ├── services/       # API services
│   │   └── styles/         # CSS files
│   └── package.json
├── server/                 # Express backend
│   ├── controllers/        # Route controllers
│   ├── middleware/         # Custom middleware
│   ├── routes/            # API routes
│   ├── services/          # Business logic
│   ├── utils/             # Utilities
│   ├── app.js             # Express app setup
│   ├── server.js          # Server entry point
│   └── package.json
├── .env.example           # Environment template
├── package.json           # Root package.json
└── README.md
\`\`\`

## 🚨 Troubleshooting

### Common Issues

1. **Vector Search Not Working**
   - Ensure you've created the vector search index in MongoDB Atlas
   - Check that the index name matches "vector_index" in the code
   - Verify the \`plot_embedding\` field exists in your documents

2. **Gemini API Errors**
   - Verify your API key is correct
   - Check your Google Cloud billing settings
   - Ensure you're not exceeding rate limits

3. **MongoDB Connection Issues**
   - Check your connection string format
   - Verify network access in MongoDB Atlas
   - Ensure your IP is whitelisted

4. **CORS Errors**
   - Check that the frontend URL is allowed in CORS configuration
   - Verify proxy setting in client package.json

### Environment Issues

\`\`\`bash
# Clear node modules and reinstall
rm -rf node_modules client/node_modules server/node_modules
npm run install-all

# Check Node.js version
node --version  # Should be v16+
\`\`\`

## 🔐 Security Notes

- Never commit \`.env\` files to version control
- Use environment-specific API keys
- Implement rate limiting in production
- Set up proper CORS policies for production

## 🚀 Production Deployment

### Backend Deployment
1. Set \`NODE_ENV=production\`
2. Configure production MongoDB URI
3. Set up proper CORS origins
4. Use PM2 or similar process manager

### Frontend Deployment
1. Run \`npm run build\` in client folder
2. Serve static files with nginx or similar
3. Update API_URL environment variable

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🙏 Acknowledgments

- MongoDB Atlas for the sample movie dataset
- Google Gemini AI for natural language processing
- Chart.js for data visualization components
