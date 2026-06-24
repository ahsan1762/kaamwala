# KaamWala.pk Backend

## Setup & installation

1.  **Install Dependencies**
    ```bash
    cd backend
    npm install
    ```

2.  **Environment Variables**
    *   Create a `.env` file in the `backend` directory.
    *   Copy the contents from `.env.example` or use the following:
        ```
        NODE_ENV=development
        PORT=5000
        MONGO_URI=mongodb://localhost:27017/kaamwala
        JWT_SECRET=your_jwt_secret_key
        AI_API_KEY=
        ```
    *   Make sure MongoDB is running locally.

3.  **Run Server**
    *   Development mode (restarts on changes):
        ```bash
        npm run dev
        ```
    *   Production mode:
        ```bash
        npm start
        ```
    *   Server will run on `http://localhost:5000`

## API Documentation

*   **Auth**: `/api/auth/register`, `/api/auth/login`
*   **Worker**: `/api/worker/profile`, `/api/worker/bookings`, `/api/workers/search`
*   **Customer**: `/api/bookings` (create), `/api/bookings/my` (list)
*   **Admin**: `/api/admin/pending-workers`, `/api/admin/verify-worker/:workerId`
*   **Chat**: `/api/chat/send`, `/api/chat/:bookingId`
*   **Reviews**: `/api/reviews`
*   **AI**: `/api/ai/recommend`
