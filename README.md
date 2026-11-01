# Student Collaboration Hub

A React/Vite frontend and FastAPI backend for authenticated student posts and comments.

## Project Structure

- `client/`: React/Vite frontend using Axios, React Router, Bootstrap, and React Bootstrap.
- `server/`: FastAPI backend using PyMongo with MongoDB Atlas, JWT/bcrypt authentication, and optional Cloudinary image uploads.

## Local Development

### Backend

```bash
cd server
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

Required backend environment variables are documented by the source configuration:

```text
MONGO_URI
CLOUD_ENV
CLOUD_API_KEY
CLOUD_API_SECRET
```

### Frontend

```bash
cd client
npm install
npm run dev
```

Set `VITE_SH_BE_URI` in the local client environment to the FastAPI base URL, including its trailing slash.

## Implemented API Scope

- User registration and login
- JWT-protected requests
- User list and profile update API
- Post creation and feed retrieval
- Current-user post retrieval
- Comment creation and retrieval
- Optional Cloudinary upload path for post images

User search, post update/delete, comment update/delete, and a frontend profile page are not implemented in the current source.

## Deployment Shape

The frontend and backend can remain in this repository while deploying separately:

- Frontend: Netlify or Vercel, rooted at `client`
- Backend: Render, rooted at `server`
- Database: MongoDB Atlas
- Media: Cloudinary when its deployment environment variables are configured

Never commit `.env` files or secret values.
