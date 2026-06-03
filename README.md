# University Maintenance System

A campus maintenance management application built with React, Vite, Node.js, Express, and PostgreSQL.

It lets students and staff file maintenance requests, attach optional images, view request history, and enables admin users to manage request status and assignments.

## Features

- User registration and login with JWT authentication
- Create, edit, and delete maintenance requests
- Upload optional request images
- Role-based access: standard users and admin users
- Admin endpoints for viewing all requests and updating request status
- PostgreSQL database storage
- Separate frontend and backend projects

## Tech Stack

- Frontend: React, Vite, Tailwind CSS, Axios, React Router, Recharts
- Backend: Node.js, Express, PostgreSQL, bcrypt, JSON Web Tokens, Multer
- Database: PostgreSQL

## Repository Structure

- `client/` - React frontend application
- `server/` - Express backend API
- `database/schema.sql` - PostgreSQL table definitions

## Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/Treashy127/university-maintenance-system.git
cd university-maintenance-system
```

### 2. Setup the backend

```bash
cd server
npm install
```

Create a `.env` file in the `server/` directory with the following values:

```env
DB_USER=your_db_user
DB_HOST=localhost
DB_NAME=your_db_name
DB_PASSWORD=your_db_password
DB_PORT=5432
JWT_SECRET=your_jwt_secret
```

### 3. Initialize the database

Use the SQL schema file to create the required tables in PostgreSQL:

```bash
psql -U your_db_user -d your_db_name -f ../database/schema.sql
```

### 4. Run the backend server

```bash
npm run dev
```

The backend server will run on `http://localhost:5000` by default.

### 5. Setup the frontend

In a separate terminal:

```bash
cd ../client
npm install
npm run dev
```

The frontend should start via Vite and will typically be available at `http://localhost:5173`.

## API Endpoints

### Authentication

- `POST /api/auth/register` - register a new user
- `POST /api/auth/login` - login and receive a JWT token

### Maintenance Requests

- `POST /api/requests` - create a new request (authenticated)
- `GET /api/requests` - fetch current user requests, or all requests for admin
- `PUT /api/requests/:id` - update a request (authenticated owner)
- `PUT /api/requests/:id/status` - update request status (admin only)
- `DELETE /api/requests/:id` - delete a request (authenticated owner or admin)

## Notes

- Requests can include an image uploaded via the `image` form field.
- Uploaded files are saved to `server/uploads/`.
- Admin users are identified by the `role` value stored in the `users` table.

## Changelog

- 2026-06-03: Updated repository and README. Modified files:
	- `client/src/components/RequestForm.jsx` (form/validation updates)
	- `README.md` (this changelog entry)
	- Removed sample images from `server/uploads/`.

## License

This project is provided as-is. Update as needed for your use case.
