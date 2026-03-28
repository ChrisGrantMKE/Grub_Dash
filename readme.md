# GrubDash Backend API

- What this project is:
  This is a beginner-friendly Express API that powers GrubDash dishes and orders.
  It supports create/read/update flows for dishes, full order management (including delete rules), request validation, and Morgan request logging.
  Data is loaded from seed files into memory, so updates work while the server is running but reset when the server restarts.

- How to run it locally:
  Install dependencies with `npm install`, then start the API with `npm start` (default: port 5000).
  Run tests with `npm test -- --runInBand`.
  If you use the companion front-end, run it on port 2000 and point it at `http://localhost:5000` using `REACT_APP_API_BASE_URL`.

- What was included for testing:
  Automated coverage includes both dishes and orders router tests, with 68 passing tests in total.
  Manual end-to-end smoke testing also covered: create dish, update dish, create order, change order status, confirm delete is blocked for non-pending orders, then set pending and delete successfully.
  With Morgan enabled (`dev` format), request logs show method, route, status code, response time, and response size during live testing.
