# Meeting Bot

Meeting Bot is an automated assistant that sits in on your Google Meet calls for you. It joins a meeting like a regular attendee, quietly listens to everything that's said, writes it all down (keeping track of who said what), and remembers it. Afterwards, instead of scrubbing through a recording or re-reading a wall of raw text, you can just ask it a plain-English question — "what did we decide about the launch date?" — and it will answer using only what was actually said in that meeting.

The project is split into two independent services that work together: one that physically joins the call, and one that does the listening, remembering, and answering.

## How it works

Everything starts with a meeting link and an identity to join with. A one-time login step opens a real Chrome window, lets a person sign into a Google account by hand, and saves that logged-in session to a file so the bot can reuse it on every future run without logging in again.

When it's time to join a meeting, the "attendee" service launches a real, automated Chrome browser using that saved session, navigates to the meeting URL, and clicks through whichever join flow Google presents — either joining directly or asking to be let in. Once inside, it doesn't touch the microphone or camera; instead it captures the audio the meeting itself is playing out of the browser tab, using a virtual audio device and a small audio-processing tool running in the background. As that audio comes in, it's split into small chunks and streamed out over a live connection to the second service, tagged with which meeting it belongs to and the order the chunks were captured in.

The second service, the "backend," never joins a meeting itself — it just listens for these incoming audio streams. For each meeting it opens a dedicated real-time connection to a speech-to-text provider, forwards the audio into it as it arrives, and gets back recognized speech almost instantly, including a label for which speaker said each individual word. Every time a phrase is fully recognized, the backend saves it — the text, when it happened in the meeting, and who said which word — into a database.

Separately, a background job can take everything that's been saved for a meeting, group it into small batches, and turn each batch into a form that can be searched by *meaning* rather than exact wording, storing those in a vector search index alongside the same speaker information. When someone later asks a question about the meeting, the backend searches that index for the most relevant moments, assembles them (including who said what) into a block of context, and hands that context and the question to a language model with strict instructions to answer only from what's actually in the transcript — and to say so plainly if the answer simply isn't there.

The attendee service keeps watching the meeting for signs that it has ended — either being told directly, or noticing on its own that everyone left or that it was removed — at which point it stops recording, tells the backend the meeting is over, and closes itself down.

## Running everything with Docker Compose

`docker-compose.yml` at the repo root brings up the whole stack for testing:

```
cp .env.example .env   # fill in DEEPGRAM_KEY, PINECONE_KEY, PINECONE_INDEX, GROQ_KEY
docker compose up
```

This starts Postgres, Redis, the `gmeet-bot` backend (`:3000`), and the dashboard
frontend (`:5173`). It also builds the `joinee` image and tags it `meet-joiner:latest`
so `gmeet-bot` can spin up a joinee container per meeting via the Docker socket — but
`joinee` itself isn't kept running by Compose, since it's meant to be launched on
demand, not as a standing service.

Building `joinee` requires `joinee/google_session.json` to already exist — run
`cd joinee && npm ci && npm run login` once, locally (outside Docker, interactively),
to create it before running `docker compose up`.

## Project layout

The repository is a small monorepo with two top-level services, each documented in its own README:

- **`joinee/`** — the browser-automation bot that joins the meeting, captures its audio, and streams that audio to the backend. See `joinee/README.md`.
- **`gmeet-bot/`** — the backend service: speech-to-text, transcript storage, semantic search indexing, and the question-answering API. See `gmeet-bot/README.md`.

Everything else at the root is repository-level plumbing:

- **`README.md`** — this file.
- **`docker-compose.yml`** / **`.env.example`** — brings up the whole stack for testing; see "Running everything with Docker Compose" above.
- **`.gitignore`** — excludes dependencies (`node_modules`), build output (`dist`, `*.tsbuildinfo`), and sensitive local files (`.env`, `google_session.json`) from both services.
- **`.claude/`** — local configuration for the Claude Code assistant used to develop this repository; not part of the running application.
