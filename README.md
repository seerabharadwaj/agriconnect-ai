# AgriConnect AI

AgriConnect AI is a two-sided agricultural marketplace connecting farmers and customers via an AI negotiation engine.

## How to Start the Project

1. Ensure Docker, Python 3.11, Node.js, and `uv` are installed on your machine.
2. Copy `.env.example` to `.env` in the root directory and add your real Grok API key and secrets.
3. Start the core infrastructure by running `docker compose up -d` in the root folder.
4. To start the backend: navigate to `backend/`, run `uv sync`, apply migrations with `alembic upgrade head`, and start the server using `uvicorn app.main:app --reload --port 8000`.
5. To start the frontends: navigate to `frontend-farmer` and `frontend-customer`, run `npm install`, and start them with `npm run dev`.
