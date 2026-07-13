# AgriConnect AI - Farmer App

This is the mobile-first React frontend designed specifically for farmers to interact with the AgriConnect AI negotiation engine.

## Tech Stack
- **Framework:** React + Vite
- **Styling:** Tailwind CSS (v4)
- **State Management:** Zustand
- **Icons:** Lucide-React

## Key Features
- **Voice-to-Text Listings:** Farmers can tap the microphone to list crops speaking in natural language (Telugu or English).
- **Live AI Negotiation:** Uses WebSockets to receive and display real-time counter-offers from the backend math engine.
- **Photo Grading UI:** Upload photos of crops which are assessed by the Vision API for quality grading (A/B/C).
- **Dashboard:** Tracks "History" of all negotiated deals and clearly displays "Accepted Deals".

## Getting Started
1. Install dependencies:
   ```bash
   npm install
   ```
2. Start the development server:
   ```bash
   npm run dev
   ```
