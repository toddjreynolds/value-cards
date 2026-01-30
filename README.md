# Core Values Discovery App

An interactive card sorting app to help users discover and prioritize their core values.

## Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

## Embedding in Framer

1. Build the project: `npm run build`
2. Deploy the `dist` folder to a static hosting service (Vercel, Netlify, etc.)
3. In Framer, add an HTML Embed component or use an iframe:

```html
<iframe 
  src="https://your-deployed-url.com" 
  width="100%" 
  height="100%" 
  frameborder="0"
  style="border: none;"
></iframe>
```

## Features

- **Phase 1: Swipe Sort** - Tinder-style card swiping to keep or discard values
- **Phase 2: Narrow Down** - Grid view to reduce to exactly 10 values (if needed)
- **Phase 3: Pyramid Ranking** - Drag and drop to arrange values in priority pyramid
- **Results** - Shareable image of your core values pyramid

## Tech Stack

- React 18 + TypeScript
- Vite
- Tailwind CSS
- Framer Motion
- Zustand (state management with localStorage persistence)
- html-to-image (for sharing)
