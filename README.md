# 🧪 College Laboratory Portal

A comprehensive web portal designed for college laboratory management. This platform allows students, teachers, and admins to interact seamlessly — with features like attendance management, session scheduling, user management, and approval workflows.

---

## 📚 Features

- Student login & attendance tracking
- Teacher login & session approval system
- Admin dashboard for user and lab management
- PostgreSQL-backed database
- Role-based access control
- Clean and modular backend using Node.js

---

## ⚙️ Technologies Used

- **Backend**: Node.js, Express.js
- **Database**: PostgreSQL
- **ORM**: pg (raw SQL)
- **Authentication**: express-session, bcrypt
- **Environment Configuration**: dotenv
- **Logging**: morgan
- **Session Management**: express-session
- **Validation**: express-validator

---

## 📦 Dependencies

Install these using `npm install`:

```bash
express
pg
express-session
bcrypt
dotenv
connect-pg-simple
morgan
express-validator

🛠️ Setup Instructions
✅ 1. Download or Clone the Repository
Option A: ZIP File
Click on Code > Download ZIP

Extract it to your desired folder

Option B: Git Clone
git clone https://github.com/Pranay-Web0Dev/college_lab_portal.git
cd college_lab_portal


✅ 2. Install Dependencies
Make sure you have Node.js and PostgreSQL installed.
Then install all Node dependencies:
npm install

✅ 3. Configure .env File
Create a .env file in the root directory with the following:
# Database Configuration
DB_HOST=localhost
DB_USER=postgres
DB_PASSWORD=your_password
DB_NAME=college_lab_portal
DATABASE_URL=postgres://postgres:your_password@localhost:5432/college_lab_portal

# Server Configuration
PORT=5000
SESSION_SECRET=your_session_secret_key

# Environment
NODE_ENV=development

✅ 4. Set Up the PostgreSQL Database
Create a database manually:
CREATE DATABASE college_lab_portal;

Import the schema and tables:

If a .sql file is provided (like schema.sql), run it in pgAdmin or psql.

✅ 5. Run the Server
nodemon index.js


If configured correctly, you should see:
Server started on port 5000
Connected to PostgreSQL successfully


