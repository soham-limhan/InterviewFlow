# InterviewFlow AI

An AI-powered recruitment SaaS platform enabling recruiters to post jobs, manage candidates, schedule & conduct live video interviews, and receive AI-generated evaluations.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 15 (App Router), TypeScript, Tailwind CSS, shadcn/ui |
| Backend | NestJS, TypeScript |
| Database | Firebase Firestore |
| Auth | Firebase Authentication |
| Storage | Firebase Storage |
| AI | Groq API (Llama 3.3 70B) |
| Video | LiveKit |
| Deploy | Vercel (Frontend) + Railway (Backend) |

## Getting Started

### Prerequisites

- Node.js 18+
- npm
- Firebase project with Firestore, Auth, and Storage enabled
- Groq API key
- LiveKit Cloud account

### Frontend

```bash
cd frontend
cp .env.local.example .env.local
# Fill in your environment variables
npm install
npm run dev
```

### Backend

```bash
cd backend
cp .env.example .env
# Fill in your environment variables
npm install
npm run start:dev
```

### Environment Variables

See `.env.local.example` (frontend) and `.env.example` (backend) for required variables.

## Project Structure

```
InterviewFlow/
├── frontend/          # Next.js 15 App
│   ├── src/
│   │   ├── app/       # App Router pages
│   │   ├── components/# React components
│   │   ├── lib/       # Utilities
│   │   ├── hooks/     # Custom hooks
│   │   ├── contexts/  # React contexts
│   │   └── types/     # TypeScript types
│   └── public/        # Static assets
├── backend/           # NestJS API
│   └── src/
│       ├── common/    # Guards, decorators, filters
│       ├── core/      # Firebase, config
│       └── modules/   # Feature modules
└── README.md
```

## License

Private - All rights reserved.
