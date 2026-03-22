# GameStats Dashboard

A modern League of Legends statistics dashboard built with Next.js 14, TypeScript, Tailwind CSS, and shadcn/ui.

## Features

- **Summoner Search**: Search for any summoner by name and tag with region selector
- **Profile Overview**: View summoner level, rank, LP, and winrate with tier badges
- **Match History**: Detailed match list with KDA, CS/min, champion info and victory/defeat indicators
- **Champion Stats**: Analyze performance by champion with winrate bars and KDA
- **Personal Records**: Track your best performances across different metrics
- **Dark Theme**: Gamer aesthetic with League of Legends-inspired blue/cyan gradients

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Components**: shadcn/ui (Button, Card, Input, Tabs, Avatar, Badge)
- **Icons**: Lucide React

## Getting Started

### Prerequisites

- Node.js 18+
- npm

### Installation

1. Navigate to the project directory:
```bash
cd /data/workspace/projects/gamestats-rewrite
```

2. Install dependencies (already done):
```bash
npm install
```

3. Run the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
app/
├── components/
│   ├── SearchForm.tsx       # Search input with region selector
│   ├── SummonerHeader.tsx   # Summoner profile header with avatar
│   ├── StatsGrid.tsx        # Quick stats cards (Win rate, KDA, CS/min)
│   ├── MatchList.tsx        # Match history list
│   ├── ChampionStats.tsx    # Champion statistics
│   └── RecordView.tsx       # Personal records display
├── summoner/
│   └── [region]/
│       └── [gameName]/
│           └── [tagLine]/
│               └── page.tsx # Summoner profile page
├── page.tsx                 # Home/Search page
├── layout.tsx               # Root layout with dark theme
└── globals.css              # Global styles

components/ui/               # shadcn/ui components
lib/
├── data.ts                  # Mock data, types, and utility functions
└── utils.ts                 # Helper utilities
```

## Routes

| Route | Description |
|-------|-------------|
| `/` | Home page with summoners search |
| `/summoner/[region]/[gameName]/[tagLine]` | Summoner profile with tabs |

## Example Usage

1. Go to the home page
2. Select a region (e.g., EUW, NA, KR)
3. Enter a summoner name with tag (e.g., `Faker#KR1`)
4. Click Search to view the profile

## Mock Data

The app currently uses mock data for demonstration. The mock data includes:
- Sample summoner profile (Faker#KR1)
- 6 ranked matches with various champions
- Calculated champion statistics
- Sample personal records

## Customization

### Adding Real API Integration

To connect to the Riot Games API:

1. Get an API key from [Riot Developer Portal](https://developer.riotgames.com/)
2. Create a `.env.local` file:
```
RIOT_API_KEY=your_api_key_here
```
3. Replace mock data imports with actual API calls in the page components

### Styling

The dark theme uses:
- Background: `slate-950` to `slate-900` gradients
- Accent colors: Blue (`blue-400`), Cyan (`cyan-400`), Emerald (`emerald-400`)
- Cards: `slate-900/50` with `slate-700/50` borders

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## Screenshots

The dashboard features:
- Responsive design (mobile-first)
- Animated gradients and hover effects
- Clean typography with Inter font
- Color-coded win/loss indicators
- Progress bars for winrates

## Notes

- Built for demonstration purposes with mock data
- Responsive design works on mobile, tablet, and desktop
- Not affiliated with Riot Games
- Champion icons loaded from Data Dragon CDN
