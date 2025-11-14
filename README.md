# 🏛️ CivicIssue Admin Panel

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Version](https://img.shields.io/badge/version-1.0.0-green.svg)
![Build Status](https://img.shields.io/badge/build-passing-brightgreen.svg)
![Node](https://img.shields.io/badge/node-%3E%3D%2018.0.0-brightgreen.svg)

## 🚀 AI-Powered Municipal Issue Management Dashboard

A modern, real-time administrative dashboard for managing civic issues with integrated AI capabilities, built with Next.js, TypeScript, and Claude AI integration.

![CivicIssue Admin Panel Screenshot](https://via.placeholder.com/1200x600/667eea/ffffff?text=CivicIssue+Admin+Panel)

## ✨ Features

### Core Functionality
- 📊 **Real-time Dashboard** - Live statistics and metrics
- 🗺️ **Interactive Issue Map** - Visualize civic issues geographically
- 🤖 **AI Assistant** - Claude AI-powered chat for intelligent insights
- 📈 **Analytics & Reporting** - Comprehensive data visualization
- 🔔 **Smart Notifications** - Real-time alerts for critical issues
- 👥 **Department Management** - Efficient task routing and assignment

### AI-Powered Features
- 🧠 Automatic issue classification and severity scoring
- 📊 Predictive analytics for resource allocation
- 💬 Natural language query processing
- 🎯 Smart routing recommendations
- ⚠️ Escalation prediction
- 📝 Automated report generation

## 🛠️ Tech Stack

### Frontend
- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript
- **UI Library:** Material-UI (MUI) v5
- **State Management:** Zustand
- **Data Fetching:** React Query + SWR
- **Maps:** Mapbox GL JS
- **Charts:** Recharts + D3.js
- **Real-time:** Socket.io Client
- **Styling:** Tailwind CSS + Emotion

### Backend Integration
- **API:** RESTful + GraphQL
- **WebSockets:** Real-time updates
- **AI Services:** Claude API, OpenAI
- **Authentication:** JWT + OAuth2

## 📋 Prerequisites

Before you begin, ensure you have the following installed:
- Node.js (v18.0.0 or higher)
- npm or yarn
- Git

## 🚀 Quick Start

### 1. Clone the Repository

```bash
git clone https://github.com/SadiqueCodes/CivicIssue_adminpanel.git
cd CivicIssue_adminpanel
```

### 2. Install Dependencies

```bash
npm install
# or
yarn install
```

### 3. Environment Setup

Create a `.env.local` file in the root directory:

```env
# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:3000/api/v1
NEXT_PUBLIC_WS_URL=ws://localhost:3000
NEXT_PUBLIC_GRAPHQL_URL=http://localhost:3000/graphql

# Map Configuration
NEXT_PUBLIC_MAPBOX_TOKEN=your_mapbox_token_here

# AI Services
ANTHROPIC_API_KEY=your_anthropic_api_key
OPENAI_API_KEY=your_openai_api_key

# Authentication
NEXTAUTH_URL=http://localhost:3001
NEXTAUTH_SECRET=your_secret_key_here
JWT_SECRET=your_jwt_secret

# Database (if connecting directly)
DATABASE_URL=postgresql://user:password@localhost:5432/civic_db

# Analytics
NEXT_PUBLIC_GA_ID=your_google_analytics_id
NEXT_PUBLIC_SENTRY_DSN=your_sentry_dsn
```

### 4. Run Development Server

```bash
npm run dev
# or
yarn dev
```

Open [http://localhost:3001](http://localhost:3001) to view the application.

## 📁 Project Structure

```
CivicIssue_adminpanel/
├── app/                      # Next.js 14 App Directory
│   ├── (auth)/              # Authentication routes
│   │   ├── login/           # Login page
│   │   └── register/        # Registration page
│   ├── dashboard/           # Main dashboard
│   │   ├── page.tsx         # Dashboard home
│   │   ├── issues/          # Issues management
│   │   ├── analytics/       # Analytics views
│   │   ├── departments/     # Department management
│   │   └── ai-insights/     # AI insights page
│   ├── api/                 # API routes
│   │   ├── auth/           # Authentication endpoints
│   │   ├── issues/         # Issue management
│   │   └── ai/             # AI service endpoints
│   └── layout.tsx          # Root layout
├── components/              # React components
│   ├── Dashboard/          # Dashboard components
│   ├── Map/               # Map components
│   ├── Charts/            # Data visualization
│   ├── AIChat/            # AI assistant chat
│   └── common/            # Shared components
├── lib/                    # Utility functions
│   ├── api/               # API client
│   ├── hooks/             # Custom React hooks
│   ├── utils/             # Helper functions
│   └── validators/        # Form validation
├── public/                # Static assets
├── styles/                # Global styles
├── types/                 # TypeScript definitions
└── config/                # Configuration files
```

## 🔧 Available Scripts

```bash
# Development
npm run dev               # Start development server
npm run build            # Build for production
npm run start            # Start production server
npm run lint             # Run ESLint
npm run type-check       # Run TypeScript compiler

# Testing
npm run test             # Run unit tests
npm run test:watch       # Run tests in watch mode
npm run test:coverage    # Generate coverage report
npm run e2e              # Run E2E tests

# Database
npm run db:migrate       # Run database migrations
npm run db:seed          # Seed database with sample data

# Code Quality
npm run format           # Format code with Prettier
npm run analyze          # Analyze bundle size
```

## 🎨 UI Components

### Dashboard Components
- **StatCard** - Display key metrics
- **IssueTable** - Manage issues with filtering
- **PriorityQueue** - View high-priority items
- **DepartmentGrid** - Department overview

### Map Features
- **HeatmapLayer** - Visualize issue density
- **ClusterMarkers** - Group nearby issues
- **RouteOptimization** - Optimal path planning
- **LiveTracking** - Real-time team locations

### AI Integration
- **ChatInterface** - Conversational AI assistant
- **InsightCards** - AI-generated insights
- **PredictionCharts** - Forecast visualizations
- **AutoSuggestions** - Smart recommendations

## 🔐 Authentication & Authorization

The admin panel supports multiple authentication methods:

- **Email/Password** - Traditional authentication
- **OAuth2** - Google, GitHub, Microsoft
- **SSO** - Single Sign-On for enterprises
- **Role-Based Access** - Admin, Manager, Operator roles

## 📊 API Integration

### REST Endpoints

```typescript
// Issues
GET    /api/v1/issues          // List all issues
POST   /api/v1/issues          // Create new issue
GET    /api/v1/issues/:id      // Get issue details
PUT    /api/v1/issues/:id      // Update issue
DELETE /api/v1/issues/:id      // Delete issue

// Analytics
GET    /api/v1/analytics/dashboard   // Dashboard metrics
GET    /api/v1/analytics/trends      // Trend analysis
GET    /api/v1/analytics/heatmap     // Heatmap data

// AI Services
POST   /api/v1/ai/classify          // Classify issue
POST   /api/v1/ai/chat             // AI chat
GET    /api/v1/ai/predictions      // Get predictions
```

### GraphQL Queries

```graphql
# Get issues with filters
query GetIssues($filter: IssueFilter) {
  issues(filter: $filter) {
    id
    title
    description
    status
    priority
    location {
      lat
      lng
    }
  }
}

# Real-time subscription
subscription IssueUpdates {
  issueUpdated {
    id
    status
    assignedTo
  }
}
```

## 🚢 Deployment

### Docker

```bash
# Build Docker image
docker build -t civic-admin-panel .

# Run container
docker run -p 3001:3000 \
  -e NEXT_PUBLIC_API_URL=http://api.example.com \
  civic-admin-panel
```

### Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

### AWS Deployment

```bash
# Build and deploy to AWS
npm run build
aws s3 sync .next/static s3://your-bucket/static
aws cloudfront create-invalidation --distribution-id YOUR_DIST_ID --paths "/*"
```

## 🧪 Testing

### Unit Tests
```bash
npm run test
```

### Integration Tests
```bash
npm run test:integration
```

### E2E Tests
```bash
npm run e2e
```

## 📈 Performance Optimization

- **Code Splitting** - Automatic route-based splitting
- **Image Optimization** - Next.js Image component
- **Lazy Loading** - Components loaded on demand
- **Caching Strategy** - SWR for data caching
- **Bundle Analysis** - Regular bundle size monitoring

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/) - React framework
- [Material-UI](https://mui.com/) - UI components
- [Mapbox](https://www.mapbox.com/) - Mapping platform
- [Claude AI](https://www.anthropic.com/) - AI assistant
- [Vercel](https://vercel.com/) - Deployment platform

## 📞 Support

- **Documentation:** [docs.civicissue.com](https://docs.civicissue.com)
- **Issues:** [GitHub Issues](https://github.com/SadiqueCodes/CivicIssue_adminpanel/issues)
- **Email:** support@civicissue.com
- **Discord:** [Join our community](https://discord.gg/civicissue)

## 🚀 Roadmap

- [ ] Mobile responsive improvements
- [ ] Offline mode support
- [ ] Advanced AI predictions
- [ ] Multi-language support
- [ ] Dark mode enhancement
- [ ] Export functionality
- [ ] Webhook integrations
- [ ] Performance monitoring dashboard

---

<p align="center">
  Built with ❤️ by <a href="https://github.com/SadiqueCodes">SadiqueCodes</a>
</p>

<p align="center">
  <a href="https://github.com/SadiqueCodes/CivicIssue_adminpanel">
    ⭐ Star us on GitHub
  </a>
</p>