# Identity Cultivator

Habit and finance dashboard, with Concord mounted as a subpage at `/concord`.

Concord is the unified register: Charge, Current, and Mind/Will, read across Daoist neidan, the Hermetic art, and the Qabalah. Correspondences name a shared office. They are not a claim that the traditions are one religion.

## Run locally

```bash
npm install
npm run dev -- --host 0.0.0.0 --port 4327
```

- Dashboard: `http://127.0.0.1:4327/`
- Concord: `http://127.0.0.1:4327/concord`

The dashboard header and the register card both open Concord. From Concord, Dashboard returns to the tracker.

Search the register with the search field, `Ctrl`/`Cmd`+`K`, or `/`. Searching Jing opens Charge, with Salt and Malkuth on the same entry.

```bash
npm test
npm run build
```

Copy `.env.example` to `.env` when you want Supabase sync. The dashboard and Concord both run without it.
