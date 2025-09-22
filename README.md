# AI-Powered Educational Assessment Platform

A comprehensive web application that uses artificial intelligence to assess educational content including flowcharts, algorithms, and pseudocode across multiple file formats.

## Features

### 🤖 AI-Powered Assessment
- Advanced AI analysis of flowcharts, algorithms, and pseudocode
- Support for PDF, DOCX, PPTX, PNG, and JPG file formats
- Intelligent content extraction with OCR capabilities
- Confidence scoring and detailed feedback

### 👥 Role-Based Access Control
- **Students**: Submit assignments, view grades, track progress
- **Teachers**: Create assignments, grade submissions, manage classes
- **Administrators**: System management, user administration, analytics

### 📊 Comprehensive Analytics
- Real-time progress tracking
- Performance insights and trends
- Class and individual student analytics
- AI accuracy metrics and reporting

### 🎯 Rubric-Based Grading
- Customizable rubric creation
- Consistent assessment standards
- Detailed criterion-based scoring
- Teacher override capabilities

## Tech Stack

### Frontend
- **React 18** with TypeScript
- **Tailwind CSS** for styling
- **Zustand** for state management
- **React Router v6** for routing
- **React Hook Form** for form handling
- **React Query** for server state management

### Backend
- **Node.js** with Express.js
- **TypeScript** for type safety
- **Prisma ORM** with PostgreSQL
- **JWT** authentication
- **Multer** for file uploads

### AI Integration
- **OpenAI GPT-4** for semantic analysis
- **Tesseract.js** for OCR processing
- **Sharp** for image manipulation

## Getting Started

### Prerequisites
- Node.js 18 or higher
- PostgreSQL database
- OpenAI API key (for production)

### Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd ai-assessment-platform
```

2. **Install dependencies**
```bash
npm install
npm run backend:install
```

3. **Environment Setup**
```bash
cp .env.example .env
```

Edit `.env` with your configuration:
```env
DATABASE_URL="postgresql://username:password@localhost:5432/eduassess"
JWT_SECRET="your-super-secret-jwt-key"
JWT_REFRESH_SECRET="your-super-secret-refresh-key"
OPENAI_API_KEY="your-openai-api-key"
```

4. **Database Setup**
```bash
npm run db:push
npm run db:generate
```

5. **Start Development Server**
```bash
npm run dev
```

The application will be available at:
- Frontend: http://localhost:5173
- Backend: http://localhost:3001

## Demo Accounts

For testing purposes, use these demo accounts:

- **Student**: `student@demo.com` / `password123`
- **Teacher**: `teacher@demo.com` / `password123`
- **Admin**: `admin@demo.com` / `password123`

## Project Structure

```
├── src/                    # Frontend source code
│   ├── components/         # Reusable UI components
│   ├── pages/             # Page components
│   ├── store/             # Zustand stores
│   ├── types/             # TypeScript type definitions
│   └── utils/             # Utility functions
├── backend/               # Backend source code
│   ├── routes/            # API routes
│   ├── services/          # Business logic services
│   ├── middleware/        # Express middleware
│   └── server.ts          # Main server file
├── prisma/               # Database schema and migrations
└── uploads/              # File upload directory
```

## API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `POST /api/auth/refresh` - Token refresh

### Assignments
- `GET /api/assignments` - List assignments
- `POST /api/assignments` - Create assignment
- `GET /api/assignments/:id` - Get assignment details

### Submissions
- `GET /api/submissions` - List submissions
- `POST /api/submissions` - Submit assignment
- `PUT /api/submissions/:id/grade` - Grade submission

### AI Processing
- `POST /api/ai/assess` - Process submission with AI
- `GET /api/ai/status/:id` - Check processing status

## Features in Detail

### File Processing Pipeline
1. **Upload Validation**: File type and size validation
2. **Content Extraction**: OCR for images, text extraction for documents
3. **AI Analysis**: Semantic analysis with GPT-4
4. **Scoring**: Rubric-based assessment with confidence metrics
5. **Feedback Generation**: Detailed improvement suggestions

### Security Features
- JWT-based authentication with refresh tokens
- Role-based access control
- File upload security with virus scanning
- Input validation and sanitization
- SQL injection prevention

### Performance Optimizations
- Code splitting for faster loading
- Image optimization and lazy loading
- Database query optimization
- Caching strategies
- WebSocket for real-time updates

## Deployment

### Production Build
```bash
npm run build
```

### Environment Variables for Production
```env
NODE_ENV=production
DATABASE_URL="your-production-database-url"
JWT_SECRET="your-production-jwt-secret"
OPENAI_API_KEY="your-openai-api-key"
```

### Docker Deployment
```bash
docker-compose up -d
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Submit a pull request

## Testing

Run the test suite:
```bash
npm test
```

Run specific test categories:
```bash
npm run test:unit
npm run test:integration
npm run test:e2e
```

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

For support and questions:
- Email: support@eduassess.ai
- Documentation: https://docs.eduassess.ai
- Issues: GitHub Issues page

---

Built with ❤️ for modern education