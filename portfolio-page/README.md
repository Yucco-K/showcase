# App Showcase - Portfolio Page

This is a beautiful portfolio showcase page built with React, TypeScript, and Tailwind CSS. It features animated carousels, lightbox image viewing, and a modern gradient design.

**🌐 Live Demo**: [https://yucco-k.github.io/showcase/](https://yucco-k.github.io/showcase/)

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ installed
- npm or yarn

### Installation

```bash
# Install dependencies
npm install

# or
yarn install
```

### Development

```bash
# Start development server (localhost:3100)
npm run dev

# or
yarn dev
```

### Build

```bash
# Build for production
npm run build

# Preview production build
npm run preview
```

## 📸 Adding Screenshots

Place your screenshots in the `public/screenshots/` directory following this structure:

```
public/screenshots/
├── frontend/
│   ├── 01-top.png
│   ├── 02-portfolio.png
│   └── ...
├── mypage/
│   ├── 01-purchased.png
│   └── ...
├── admin/
│   ├── products/
│   │   ├── 01-login.png
│   │   └── ...
│   ├── blog/
│   ├── reviews/
│   ├── info/
│   ├── contact/
│   └── marketing/
└── chatbot/
    ├── 01-faq.png
    └── ...
```

### Image Specifications

- **Format**: PNG, JPG, or WebP
- **Resolution**: 1920x1080 or higher recommended
- **File Size**: Optimize images to < 500KB each

## 🎨 Customization

### Update Content

Edit `src/App.tsx` to modify:

- Project title and description
- GitHub repository URL
- Demo site URL
- Feature descriptions
- Tech stack badges

### Update Images

Modify the `imageGroups` object in `src/App.tsx`:

```typescript
const imageGroups = {
  frontend: [
    {
      src: '/screenshots/frontend/01-top.png',
      title: 'Your Title',
      description: 'Your Description'
    },
    // ...
  ],
  // ...
};
```

### Styling

- **Colors**: Edit Tailwind classes in `src/App.tsx`
- **Theme**: Modify `tailwind.config.js`
- **Global styles**: Edit `src/index.css`

## 🛠️ Tech Stack

**Full Stack Overview**
`Cursor × TaskMaster × Playwright × React × Vite × TypeScript × Stripe × Supabase × Vercel × GitHub Actions × Python × FastAPI × LangChain × OpenAI API × RAG × Gorse API × AWS（EC2, Lambda）`

- **React 18** - UI Framework
- **TypeScript** - Type Safety
- **Vite 6** - Build Tool
- **Tailwind CSS** - Styling
- **Framer Motion** - Animations
- **Radix UI** - Accessible Components
- **Lucide React** - Icons

## 📦 Deployment

### GitHub Pages (自動デプロイ)

このプロジェクトはGitHub Actionsで自動的にデプロイされます。

1. **GitHubリポジトリの設定**:
   - Settings → Pages → Source を "GitHub Actions" に設定

2. **自動デプロイ**:
   - `main` ブランチに `portfolio-page/` の変更をプッシュすると自動デプロイ

3. **手動デプロイ**:
   ```bash
   npm run deploy
   ```

### Vercel / Netlify

```bash
# Vercel
npm i -g vercel
vercel

# Netlify
npm run build
# Deploy dist/ folder to Netlify
```

## 📁 Project Structure

```
portfolio-page/
├── public/
│   └── screenshots/       # Your screenshots here
├── src/
│   ├── components/
│   │   ├── ui/           # shadcn/ui components
│   │   └── figma/        # Image components
│   ├── styles/
│   │   └── globals.css   # Global styles
│   ├── App.tsx           # Main application
│   ├── main.tsx          # Entry point
│   └── index.css         # Base styles
├── package.json
├── vite.config.ts
├── tailwind.config.js
└── tsconfig.json
```

## 🤝 Contributing

This is a portfolio project template. Feel free to fork and customize for your own use!

## 📄 License

MIT License - Feel free to use this template for your portfolio.

## 🔗 Links

- **This Portfolio Page**: [https://yucco-k.github.io/showcase/](https://yucco-k.github.io/showcase/)（このページ自体。GitHub Pagesでホスティング）
- **Live App (実際のアプリ本体)**: [https://showcase-topaz.vercel.app/](https://showcase-topaz.vercel.app/)（Vercelでホスティング）
- **Main Repository**: [https://github.com/Yucco-K/showcase](https://github.com/Yucco-K/showcase)
- **Original Design**: Figma App Introduction Layout

---

**Made with ❤️ using Cursor AI**
