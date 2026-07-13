# AgriConnect AI - Admin Dashboard

This is the internal Admin Panel for marketplace operators. It is built using Python and Streamlit to easily manage the core database rules and pricing.

## Key Features
- **Price Seeding:** Manually set the official daily base prices for vegetables across different pincode regions.
- **Strict Adherence:** The backend AI Negotiation Engine strictly relies on these prices. If a crop is not priced here, the AI will refuse to negotiate.

## Getting Started
1. Ensure the PostgreSQL database is running via Docker.
2. Install dependencies via uv:
   \\ash
   uv sync
   \3. Run the dashboard:
   \\ash
   uv run streamlit run app.py
   \