# MonkeyDo

A full-stack to-do list React application with profile management and social activity tracking.

## Table of Contents
- [Frontend Setup](#frontend-setup)
- [Backend Setup](#backend-setup)
- [Database Setup](#database-setup)
- [Running the Application](#running-the-application)

## Frontend Setup


### 1. Install Dependencies

Clone the repository:
```bash
git clone https://github.com/lenny015/todo-tracker-app.git
cd todo-tracker-app/frontend
```

Install required dependencies:
```bash
npm install
```

### 2. Environment Variables

Rename `.env.template` to `.env` and enter the information
```
DATABASE_URL=postgresql://<username>:<password>@<host>:<port>/<database_name>
JWT_KEY=<key> // Enter a secure, random string
ALGORITHM=<algorithm> // Hashing algorithm for JWT token generation
```


### 3. Running the Client

Start the development server:
```bash
npm start
```
This will run the app at http://localhost:3000.

## Backend Setup

### 1. Install Dependencies

Clone the repository if you haven't already:
```bash
git clone https://github.com/lenny015/todo-tracker-app.git
```

Create a virtual environment (Optional):
```bash
python -m venv venv
```

Activate the virtual environment:
- On Windows:
  ```bash
  venv\Scripts\activate
  ```
- On macOS/Linux:
  ```bash
  source venv/bin/activate
  ```

Install the required dependencies:
```bash
pip install -r requirements.txt
```

### 2. Running the Backend

Run the FastAPI application with:
```bash
cd todo-tracker-app/backend
uvicorn app.main:app --reload
```
The backend API will be available at http://localhost:8000.

## Database Setup

This section explains how to set up and configure the database for both development and production.

### 1. Install PostgreSQL

Make sure you have [PostgreSQL](https://www.postgresql.org/download/) and [pgAdmin](https://www.pgadmin.org/download) installed on your machine.


### 2. Database Configuration

1. Open pgAdmin and connect to your PostgreSQL server.

2. Right-click on "Databases" in the sidebar and select "Create > Database".

3. Enter the database name and click "Save"


Set the database connection string in the `.env` file:
```
DATABASE_URL=postgresql://<username>:<password>@<host>:<port>/<database_name>
```

The backend application will run the schema to create the necessary tables for your database.

## Running the Application

To run the complete application:

1. Start the backend first:
```bash
cd todo-tracker-app/backend
uvicorn app.main:app --reload
```

2. Then, start the frontend:
```bash
todo-tracker-app/frontend
npm start
```

Now, navigate to http://localhost:3000 to view the frontend and interact with the app.