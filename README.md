# FirstMove - Couples Communication App

A React-based progressive web app designed to enhance intimate communication between partners through intelligent mood matching and real-time notifications.

## Features

- **Mood Matching**: Set your mood and get notified when your partner matches
- **Real-time Notifications**: Push notifications for matches and connections
- **Private & Secure**: End-to-end encrypted communication
- **Cross-platform**: Web app with Android APK support
- **Progressive Web App**: Install directly from browser

## Tech Stack

- React + TypeScript
- Tailwind CSS + shadcn/ui
- PostgreSQL + Drizzle ORM
- WebSocket real-time communication
- Capacitor for mobile deployment
- Push notifications (web + mobile)

## Quick Start

1. Install dependencies: `npm install`
2. Set up database: `npm run db:push`
3. Start development: `npm run dev`
4. Build for production: `npm run build`

## Android Deployment

The app is configured for Google Play Store deployment:

1. GitHub Actions automatically builds APK and AAB files
2. Download AAB from workflow artifacts
3. Upload to Google Play Console
4. See `PLAY_STORE_GUIDE.md` for complete instructions

## Progressive Web App

Install directly from browser:
- Visit the deployed URL
- Click "Add to Home Screen" on mobile
- Works offline with push notifications

## Environment Variables

Required for production:
- `DATABASE_URL` - PostgreSQL connection string
- Push notification keys (optional, for enhanced notifications)

## License

MIT License - See LICENSE file for details