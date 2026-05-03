# VoteBuddy - Comprehensive India Election Platform

VoteBuddy is a production-grade, non-partisan civic-tech platform designed to empower the Indian electorate with verified electoral information, AI-powered assistance, and intuitive data visualizations. Built using modern web technologies, the platform provides a centralized hub for voter services, state-wise election data, and real-time news updates.

## Project Vision

The primary mission of VoteBuddy is to bridge the information gap in the Indian democratic process. By aggregating data from the Election Commission of India (ECI) and other verified sources, the platform offers a transparent, accessible, and user-centric interface for citizens, candidates, and election administrators alike.

## Key Modules and Features

### 1. Bilingual UI and Localization
- Full support for English and Hindi.
- Context-aware translation system for complex electoral terminology.
- Dynamic layout adjustments to ensure readability across languages.

### 2. Interactive Election Hub
- Real-time and historical data for Lok Sabha and State Vidhan Sabha elections.
- Phase-wise breakdown of election schedules and constituency distributions.
- Status tracking for ongoing and upcoming electoral cycles.

### 3. State and Booth Explorer
- Detailed statistical profiles for all 28 States and 8 Union Territories.
- Constituency mapping with deep-dive analytics for sensitive divisions.
- Integrated Booth Finder utilizing Google Maps API for precise location services.
- Elector-to-Population ratio visualizations and voter demographic insights.

### 4. Advanced Results Dashboard
- Data-driven visualizations using Recharts.
- Seat tallies, vote share percentages, and swing analysis.
- Geographical winner maps and party-wise performance metrics.

### 5. Voter Services Suite
- Eligibility Checker: Dynamic logic to verify age requirements against ECI qualifying dates.
- Form Assistant: Detailed procedural guides for Form 6, 7, and 8.
- Digital Identity: Direct integration with e-EPIC and Voter Helpline services.
- Helpline Integration: One-click access to the 1950 national voter helpline.

### 6. ECI Guidelines and Rules Library
- Simplified interpretations of the Model Code of Conduct (MCC).
- Detailed breakdown of campaign restrictions, expenditure limits, and EVM/VVPAT protocols.
- "Plain English" explanations for complex legal notifications.

### 7. Fact-Check and News Hub
- Verified news feed with source citations.
- Dedicated fact-checking module to combat election misinformation.
- Official ECI announcement ticker for urgent alerts.

### 8. AI-Powered Election Assistant
- Natural language Q&A powered by Google Gemini 2.5 Flash.
- Non-partisan responses grounded in ECI guidelines.
- Streamed responses with markdown formatting support.
- Rate limiting and input sanitization for security.

## Technical Architecture

VoteBuddy is built with a focus on performance, scalability, and security.

- **Frontend**: Next.js 14 (App Router) for optimized server-side rendering and routing.
- **Language**: TypeScript for robust type-safety and developer productivity.
- **Styling**: A hybrid design system using Vanilla CSS for core design tokens and Tailwind CSS for utility-first layouts.
- **Design Philosophy**: A "Dark-First" aesthetic with premium glassmorphism effects and India tricolor (Saffron, White, Green) motifs.
- **Visualization**: Recharts (SVG) for high-performance, responsive charts.
- **Deployment**: Optimized for Vercel, featuring Progressive Web App (PWA) capabilities.

## Google Cloud Services Integration

VoteBuddy leverages multiple Google Cloud and Firebase services:

| Service | Purpose |
|---------|---------|
| **Firebase Authentication** | Google OAuth sign-in with Firestore profile sync |
| **Cloud Firestore** | User profiles, bookmarks, and saved constituencies |
| **Firebase Analytics** | Page view tracking, custom event logging, user engagement |
| **Firebase Performance** | Real-time performance monitoring and trace collection |
| **Firebase Cloud Storage** | User-uploaded assets and profile images |
| **Google Maps API** | Booth finder with geocoding and marker rendering |
| **Google Gemini AI** | AI-powered election assistant (Gemini 2.5 Flash) |
| **Core Web Vitals** | LCP, FID, CLS, FCP monitoring reported to Analytics |

## Security

VoteBuddy implements defense-in-depth security measures:

- **HTTP Security Headers**: HSTS, CSP, X-Frame-Options, X-Content-Type-Options
- **Input Sanitization**: XSS prevention via server and client-side sanitization
- **Rate Limiting**: Per-IP rate limiting on API endpoints (10 req/min)
- **Authentication**: Firebase Auth with Google OAuth provider
- **Environment Variables**: Sensitive keys isolated to server-side env vars
- **Permissions Policy**: Restricted device APIs (camera, microphone)

## Testing

- **Unit Tests**: Jest + React Testing Library for component and utility testing
- **E2E Tests**: Playwright for cross-browser integration testing
- **CI/CD**: GitHub Actions pipeline with lint, type-check, test, and build steps
- **Coverage**: 80%+ branch, function, line, and statement coverage thresholds

## Accessibility (a11y)

- WCAG 2.1 AA compliance
- Skip-to-content link for keyboard navigation
- ARIA landmarks (banner, navigation, main, contentinfo)
- `aria-current="page"` on active navigation links
- `aria-expanded` and `aria-controls` on expandable menus
- Focus-visible ring styles for keyboard users
- `aria-label` on all interactive elements
- `aria-hidden` on decorative elements

## Environment Configuration

To run VoteBuddy locally or in production, the following environment variables are required:

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_FIREBASE_API_KEY` | Firebase project API key |
| `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` | Firebase Auth domain |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID` | Firebase project ID |
| `NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID` | Firebase Analytics measurement ID |
| `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` | API key for Google Maps integration |
| `GEMINI_API_KEY` | API key for the Gemini-powered AI Assistant |
| `ADMIN_EMAILS` | Comma-separated list of authorized administrator emails |

## Development Workflow

1. **Install Dependencies**:
   ```bash
   npm install
   ```

2. **Run Development Server**:
   ```bash
   npm run dev
   ```

3. **Run Tests**:
   ```bash
   npm test
   npm run test:coverage
   ```

4. **Lint & Type Check**:
   ```bash
   npm run lint
   npx tsc --noEmit
   ```

5. **Build for Production**:
   ```bash
   npm run build
   ```

## Commitment to Neutrality

VoteBuddy is strictly non-partisan and independent. The platform does not host political advertisements, endorse candidates, or collect sensitive personal data beyond what is required for local browser-side features. All information is sourced directly from official government publications and reputable news organizations.

## License

This project is licensed under the MIT License - see the LICENSE file for details.
