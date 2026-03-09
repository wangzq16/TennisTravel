# TennisTravel Planner 🎾

A premium, AI-powered travel planning application designed specifically for tennis enthusiasts. Plan your pilgrimage to the world's most iconic tournaments with ease.

## Features

- **AI Scouting**: Automatically identifies official dates, ticket and hotel information using Gemini 3.1 Flash.
- **Smart Date Discovery**: Leave the dates blank, and the AI will find the official schedule for the tournament of this calender year.
- **Direct Booking**: One-click access to book your flights, trains and hotels.
- **Dynamic Immersive UI**: The interface color shifts based on the tournament's surface, featuring tennis court on the background.
- **Comprehensive Reports**: Get median costs for travel and accommodation (2-5 stars), weather forecasts, and local sightseeing guides.

## Tech Stack

- **Frontend**: React 18, TypeScript, Tailwind CSS.
- **AI**: Google Gemini API (@google/genai).
- **Animations**: Framer Motion.
- **Icons**: Lucide React.

## Getting Started

1. Enter a tournament name (e.g., "Wimbledon", "Roland Garros").
2. Enter your departure city.
3. Click **Plan Trip**. If you don't enter dates, the AI will suggest the official ones for you.
4. Review your custom travel report and use the booking links to secure your trip.

## Environment Variables

The following environment variables are required:

- `GEMINI_API_KEY`: Your Google Gemini API key.

---
*Crafted for the love of the game.*
