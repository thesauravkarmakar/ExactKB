# ExactKB

**Set the size you want. We handle the rest automatically.**

ExactKB is a free, privacy-first image compression tool that lets you compress images to an **exact target file size** — no guesswork, no sign-up, no data leaving your device.

<img width="965" height="876" alt="image" src="https://github.com/user-attachments/assets/cf0a8b70-a30f-4a5f-9128-3272c38e7851" />


---

## ✨ Features

- **Exact Size Targeting:** Set your desired output size in KB and ExactKB hits it precisely using binary search compression.
- **Batch Processing:** Upload multiple images and compress them all to your target size in one go.
- **Local Processing:** All compression happens in your browser. Your photos never leave your computer. Ever.
- **No Tracking:** Zero cookies, zero analytics scripts, zero telemetry.
- **Zero Sign-up:** No accounts, no emails, no friction. Just compress.
- **Format Support:** JPEG, PNG, and WebP output formats.

---

## 🚀 Getting Started

### Prerequisites

- Node.js (v18+)
- npm or pnpm

### Installation

```bash
git clone https://github.com/your-username/exactkb.git
cd exactkb
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

### Build for Production

```bash
npm run build
npm run preview
```

---

## 🛠 Tech Stack

| Layer | Technology |
|---|---|
| Framework | React + TypeScript |
| Build Tool | Vite |
| Styling | Tailwind CSS |
| Compression | Browser Canvas API (client-side only) |
| Deployment | Vercel / Netlify / Static hosting |

---

## 🔒 Privacy

ExactKB is built with privacy as a core constraint, not an afterthought.

- **No server uploads** — compression runs entirely via the Canvas API in your browser.
- **No analytics** — we don't load Google Analytics, Mixpanel, or any tracking scripts.
- **No cookies** — nothing is stored or tracked between sessions.

---

## 📁 Project Structure

```
exactkb/
├── src/
│   ├── components/       # UI components (Dropzone, ProgressCard, FormatSelector)
│   ├── lib/              # Core compression logic (binary search, canvas utils)
│   ├── hooks/            # Custom React hooks
│   └── types/            # TypeScript interfaces
├── public/
└── README.md
```

---

## 🤝 Contributing

Contributions are welcome! To get started:

1. Fork the repo
2. Create a feature branch: `git checkout -b feat/your-feature`
3. Commit your changes: `git commit -m 'Add your feature'`
4. Push and open a PR

---

## 📄 License

MIT License. Free to use, modify, and distribute.
