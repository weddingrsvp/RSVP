# GEMINI.md

## Project Overview

This is a wedding RSVP system built with [Chef](https://chef.convex.dev), a tool that uses AI to help build full-stack applications. The frontend is a [React](https://react.dev/) application built with [Vite](https://vitejs.dev/), and the backend is powered by [Convex](https://convex.dev/).

The application allows guests to RSVP to a wedding by entering a unique family code. It also includes an admin panel for managing families and guests.

### Key Technologies

*   **Frontend:** React, Vite, Tailwind CSS
*   **Backend:** Convex
*   **Authentication:** Convex Auth
*   **Deployment:** GitHub Pages

## Building and Running

### Prerequisites

*   Node.js and npm

### Installation

1.  Install dependencies:
    ```bash
    npm install
    ```

### Running in Development

To run the application in development mode, which includes hot-reloading for both the frontend and backend, run the following command:

```bash
npm run dev
```

This will start the Vite development server for the frontend and the Convex development server for the backend.

### Building for Production

To build the application for production, run the following command:

```bash
npm run build
```

This will create a `dist` directory with the optimized production build of the frontend.

### Linting

To check the code for errors and style issues, run the following command:

```bash
npm run lint
```

## Development Conventions

*   The frontend code is located in the `src` directory.
*   The backend code is located in the `convex` directory.
*   The data model is defined in `convex/schema.ts`.
*   Backend functions are defined in files within the `convex` directory (e.g., `convex/families.ts`).
*   The main React component is `src/App.tsx`.
*   The application uses a component-based architecture, with components located in `src/components`.
