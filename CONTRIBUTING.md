# Local Development

To test this project locally, you need to run a local HTTP server. This is because the application loads `questions.json` using `fetch()`, which is blocked by browser security policies (CORS) when opening `index.html` directly from the file system.

## Prerequisites

- [Python](https://www.python.org/) (recommended) OR [Node.js](https://nodejs.org/)

## Running the Server

### Option 1: Using Python (Recommended)

Run the following command in the project root:

```bash
python -m http.server
```

Then open your browser and navigate to: [http://localhost:8000](http://localhost:8000)

### Option 2: Using Node.js

If you have Node.js installed, you can use `npx`:

```bash
npx serve
```

Then follow the URL provided in the terminal (usually [http://localhost:3000](http://localhost:3000)).
