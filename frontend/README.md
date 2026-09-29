# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some Oxlint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the Oxlint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and Oxlint's TypeScript related rules in your project.
## Deploy to Vercel

1. Import this repository into Vercel and set the project **Root Directory** to `frontend`.
2. Use the Vite defaults: build command `npm run build` and output directory `dist`.
3. Add `VITE_API_URL` in the Vercel project environment variables. Set it to the public origin of the deployed backend, such as `https://your-backend.example.com`, without a trailing `/api`.
4. Deploy. The Vercel rewrite in `vercel.json` keeps client-side routes such as `/songs` working on refresh.

For local development, the frontend expects the backend at `http://localhost:5000`. Set `VITE_API_URL` in a local `.env` file when using a different backend origin.

Set `YOUTUBE_API_KEY` on the backend host. Set `MONGODB_URI` there if MongoDB is enabled. Do not use `VITE_` variables for backend secrets because Vite includes them in the browser bundle.
