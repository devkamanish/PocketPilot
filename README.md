# PocketPilot 💰

Cross-platform personal finance mobile app built with React Native and Supabase.

PocketPilot helps users track expenses, manage budgets, monitor subscriptions, and receive smart spending insights through a clean mobile-first experience.

## Features

### Expense Tracking
- Create, edit, delete expenses
- Categorize spending
- Transaction history
- Search and filtering

### Budget Management
- Monthly budget planning
- Category spending limits
- Burn-rate monitoring
- Overspending alerts

### Subscription Manager
- Track recurring subscriptions
- Renewal reminders
- Subscription cost monitoring

### Smart Insights
- Rule-based spending analysis
- Financial health indicators
- Spending trend detection

### Offline Support
- Offline expense entry
- Sync queue when connection returns
- Local persistence with AsyncStorage

### Security
- User authentication
- Secure session storage
- Row Level Security (RLS)
- User data isolation

---

## Tech Stack

Frontend
- React Native
- Expo
- TypeScript

State Management
- Zustand

Backend
- Supabase
- PostgreSQL
- Supabase Auth

Mobile Features
- Expo Notifications
- SecureStore
- AsyncStorage

Visualization
- Victory Native Charts

Testing
- Jest
- React Native Testing Library

---

## Architecture

```text
React Native App
   ↓

State Layer (Zustand)

   ↓

Service Layer

   ↓

Supabase Backend

├── Auth
├── Database
├── Security (RLS)
└── Realtime
```

---

## Demo

### Web Preview
Live Demo:[https://pocket-pilot-two.vercel.app/
](https://pocket-pilot-two.vercel.app/)
### Mobile Download
Latest APK:
[https://github.com/devkamanish/PocketPilot/releases/tag/v1.1.0
](https://github.com/devkamanish/PocketPilot/releases/tag/v1.1.0)---

## Screenshots
<img width="358" height="715" alt="image" src="https://github.com/user-attachments/assets/5391b645-8a02-46d8-9f58-212cb4b4b16a" />

<img width="365" height="647" alt="image" src="https://github.com/user-attachments/assets/cea674e9-9152-4860-9d8c-5dfa29893d15" />

<img width="354" height="610" alt="image" src="https://github.com/user-attachments/assets/29a9ec82-92a8-41a5-9599-992ac02769c8" />

<img width="366" height="549" alt="image" src="https://github.com/user-attachments/assets/9b4e9624-b681-4c49-a323-18bf9667752b" />

<img width="331" height="532" alt="image" src="https://github.com/user-attachments/assets/dd26461c-3f97-4d87-a6c8-1cddeb69deeb" />

- Dashboard
- Expense Tracking
- Budget Analytics
- Subscription Reminders

---

## Installation
Clone repository
```bash
git clone https://github.com/devkamanish/pocketpilot.git
cd pocketpilot
```

Install dependencies
```bash
npm install
```
Configure environment
Create `.env`
```env
EXPO_PUBLIC_SUPABASE_URL=your_url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_key
```

Run app
```bash
npm run start
```
---
## Supabase Setup
Create a free Supabase project.
Run:
```sql
supabase/schema.sql
```

Enable:
- Email/password authentication
- Row Level Security on:
- expenses
- budgets
- subscriptions
- profiles

---

## Testing
```bash
npm test
```

---
## Roadmap

Planned improvements
- AI-powered spending insights
- Bank transaction import
- Shared family budgets
- Savings goal tracking
- Advanced analytics

---

## Production Features

- Offline-first architecture
- Push notifications
- Secure storage
- Data sync queue
- Error handling
- Unit testing
- CI/CD ready

---

## Release Notes
See all releases:
(https://github.com/devkamanish/PocketPilot/releases)
---

## Contributing

Pull requests welcome.

For major changes, open an issue first.
---

