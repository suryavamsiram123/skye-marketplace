# Milo - Campus Gig Marketplace

**Milo** is an AI-powered campus gig marketplace that connects students who need help with tasks to those looking to earn money. Built with React, TypeScript, and Supabase.

---

## Features

### Core Functionality
- **Conversational AI Interface**: Chat with Milo to post gigs or find work using natural language
- **Intelligent Matching**: AI-powered matching system connects the right people
- **Real-time Notifications**: Stay updated with instant push notifications for new gigs and matches
- **Secure Escrow Payments**: Built-in escrow system for safe transactions
- **Digital Wallet**: Simulated wallet with add-money functionality for testing

### User Experience
- **Dark/Light Theme Toggle**: Choose your preferred visual mode
- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile
- **Browse Gigs**: Dedicated page for users with "both" role to discover nearby opportunities
- **Profile Customization**: Set your skills, location, availability, and pay preferences

### Onboarding
- Quick 60-second onboarding wizard
- Choose your role: Post gigs, Find gigs, or Both
- Set proximity preferences, pay ranges, and skills

---

## Tech Stack

- **Frontend**: React 18 + TypeScript + Vite
- **Styling**: Tailwind CSS
- **Database**: Supabase (PostgreSQL)
- **Icons**: Lucide React
- **Real-time**: Supabase Realtime subscriptions
- **AI Integration**: Customizable webhook backend

---

## Getting Started

### Prerequisites
- Node.js 18+
- Supabase account (free tier works)
- Webhook backend (optional - mock mode available)

### Installation

1. Clone the repository:
```bash
git clone <your-repo-url>
cd milo-marketplace
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
Create a `.env` file in the project root:
```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

4. Run the development server:
```bash
npm run dev
```

5. Open `http://localhost:5173` in your browser

---

## Database Setup

The application automatically creates the required tables when you deploy the migrations. Tables include:

- `user_profiles` - User onboarding and preferences
- `wallets` - Digital wallet balances
- `wallet_transactions` - Transaction history
- `gigs` - Posted gigs and search requests
- `gig_matches` - Matched users and decisions
- `notifications` - Real-time notifications
- `sample_gigs` - Pre-populated demo data
- `chat_messages` - Conversation history

---

## AI Webhook Configuration

Milo supports an external AI backend for intelligent gig matching. 

### Quick Setup
1. Open `src/lib/webhook.ts`
2. Update the `BACKEND_WEBHOOK_URL` constant with your webhook URL
3. Your webhook will receive gig requests and should return matched candidates

### Mock Mode
If no webhook URL is configured, Milo automatically uses mock mode with simulated matches - perfect for development and demos.

### Full Documentation
See [WEBHOOK_DOCS.md](./WEBHOOK_DOCS.md) for complete integration details including:
- Request/response schemas
- Field descriptions
- Match scoring recommendations
- Sample n8n workflow
- Security best practices

---

## Project Structure

```
src/
├── components/
│   ├── App.tsx                 # Main app with routing and theme
│   ├── ChatPage.tsx           # Milo chatbot interface
│   ├── OnboardingWizard.tsx   # New user onboarding
│   ├── SettingsPage.tsx      # Profile and preferences
│   ├── WalletPage.tsx         # Digital wallet with add money
│   ├── BrowseGigsPage.tsx    # Gig browsing interface
│   ├── MatchCard.tsx         # Match decision cards
│   ├── TelemetryCard.tsx     # AI processing visualization
│   └── NotificationBell.tsx   # Real-time notifications
├── hooks/
│   ├── useAppState.ts         # Global state management
│   ├── useMiloChat.ts         # Chat logic and state machine
│   └── useNotifications.ts   # Real-time notification handling
└── lib/
    ├── supabase.ts            # Database client and types
    ├── webhook.ts             # AI webhook integration
    └── miloAgent.ts           # NLP parsing and conversation flow
```

---

## Sample Data

The application comes pre-loaded with 16 sample gigs across various categories:

- Furniture Assembly & Moving
- Tutoring & Academic Help
- Tech Support & Repairs
- Pet Care
- Photography & Videography
- Graphic Design & Creative Work
- Food & Grocery Runs
- Cleaning & Organization
- Event Help & Setup
- Garage & Vehicle Maintenance
- Laundry & Errands

---

## Features in Detail

### Digital Wallet
- Simulated payment system for testing
- Add money via simulated card payments
- Track transaction history
- Escrow balance tracking
- No real money involved - perfect for demos

### Browse Gigs Page
- Available to users with "both" role
- Filter by category, distance, and pay
- Grid and list view options
- Sort by distance, pay, or recency
- Apply directly from the interface

### Real-time Notifications
- Browser push notifications (with permission)
- In-app notification center
- Notification types: new gigs, matches, payments, messages
- Mark as read functionality

### Theme Support
- Dark mode (default) - sleek, modern aesthetic
- Light mode - clean, professional look
- Automatically saved preference
- No purple/indigo tones (by design)

---

## API Reference

### Webhook Payload (Outgoing)

```json
{
  "event_type": "CLIENT_REQUEST_DELEGATION",
  "timestamp": "ISO-8601 timestamp",
  "user_profile": {
    "user_id": "UUID",
    "role": "poster | finder | both",
    "location": "Campus location string",
    "max_walk_time_mins": 10 | 20 | 40,
    "payment_range": { "min": number, "max": number },
    "skills_interests": ["string", "array"]
  },
  "request_details": {
    "raw_message": "User's original message",
    "extracted_topic": "AI-detected topic",
    "gig_type": "post | search",
    "category": "Normalized category",
    "title": "Gig title",
    "content": "Full description",
    "pay_min": number,
    "pay_max": number,
    "campus_location": "Where it happens",
    "is_remote": boolean,
    "gig_id": "UUID"
  }
}
```

### Webhook Response (Expected)

```json
{
  "success": boolean,
  "matches": [
    {
      "id": "UUID",
      "matched_user_name": "Full name",
      "matched_user_id": "UUID",
      "match_score": 0-100,
      "title": "Match title",
      "category": "Category name",
      "pay_min": number,
      "pay_max": number,
      "campus_location": "Location",
      "walk_time_mins": number,
      "description": "Brief description"
    }
  ],
  "message": "Optional status message"
}
```

---

## Contributing

Contributions are welcome! Please follow these guidelines:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## License

MIT License - feel free to use this for your own projects!

---

## Support

For questions or issues:
1. Check the [WEBHOOK_DOCS.md](./WEBHOOK_DOCS.md) for AI integration help
2. Open an issue in the repository
3. Check the Supabase documentation for database questions

---

## Roadmap

Future enhancements:
- [ ] Real payment integration (Stripe)
- [ ] Chat messaging between matched users
- [ ] Calendar integration for scheduling
- [ ] Rating and review system
- [ ] Location-based proximity using device GPS
- [ ] Push notifications via PWA
- [ ] Admin dashboard for campus administrators
