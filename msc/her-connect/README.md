# Her Connect — UI Prototype

Single-page React + Tailwind UI prototype for "Her Connect".

This scaffold implements the UI only (client-side demo) for the requested single-page app. Backend (Firebase) and full Web3 persistence will be added in the next steps.

What is included:
- Vite + React app
- Tailwind CSS configuration
- Framer Motion for small transitions
- Local sample providers and ability to add a provider (UI-only)
- Chat modal (localStorage-backed for demo)
- Payment modal using MetaMask (UI + demo send via window.ethereum / web3; Tx info saved to localStorage for UI demo)

How to run (Windows cmd.exe):

1) Install dependencies

```
cd c:\Users\GUNA\Videos\msc\her-connect
npm install
```

2) Run dev server

```
npm run dev
```

Open the URL printed by Vite (usually http://localhost:5173).

Next steps (I will implement after you confirm UI is good):
- Integrate Firebase (Firestore + Storage + Realtime DB) for providers, chats, and transactions
- Persist provider uploads to Firebase Storage
- Replace localStorage chat with Firebase Realtime Database for real-time 1:1 chat
- Save blockchain transactions to Firestore
- Deploy to Netlify or Vercel and show a demo

If you want any visual adjustments (colors, spacing), or want me to proceed to Firebase + chat + blockchain persistence next, tell me and I'll continue.
