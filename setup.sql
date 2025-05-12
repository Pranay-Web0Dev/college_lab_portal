-- College Lab Portal Database Setup Script for PostgreSQL

-- Drop tables if exist to avoid conflicts
DROP TABLE IF EXISTS attendance;
DROP TABLE IF EXISTS lab_sessions;
DROP TABLE IF EXISTS labs;
DROP TABLE IF EXISTS users;

-- Create enum for roles
DROP TYPE IF EXISTS user_role;
CREATE TYPE user_role AS ENUM ('student', 'teacher');

-- Create enum for days of week
DROP TYPE IF EXISTS day_of_week;
CREATE TYPE day_of_week AS ENUM ('Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday');

-- Users table
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role user_role NOT NULL,
    student_id VARCHAR(50) NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Labs table
CREATE TABLE labs (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    location VARCHAR(100) NOT NULL,
    capacity INT NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Lab sessions table
CREATE TABLE lab_sessions (
    id SERIAL PRIMARY KEY,
    lab_id INT NOT NULL,
    name VARCHAR(100) NOT NULL,
    day_of_week day_of_week NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    max_students INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (lab_id) REFERENCES labs(id),
    CONSTRAINT unique_lab_session_time UNIQUE (lab_id, day_of_week, start_time)
);

-- Attendance table
CREATE TABLE attendance (
    id SERIAL PRIMARY KEY,
    user_id INT NOT NULL,
    lab_id INT NOT NULL,
    lab_session_id INT NOT NULL,
    date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (lab_id) REFERENCES labs(id),
    FOREIGN KEY (lab_session_id) REFERENCES lab_sessions(id),
    CONSTRAINT unique_user_session_date UNIQUE (user_id, lab_session_id, date::date)
);

-- Create sample teacher account
INSERT INTO users (name, email, password, role) 
VALUES (
    'John Doe', 
    'teacher@example.com', 
    '$2a$10$kqDm.zlNI9JmzFQmDfHSzuP96Z5vIEI1JijlZrGW3PBv8U72S.Wiq', -- password: password123
    'teacher'
);

-- Create sample student account
INSERT INTO users (name, email, password, role, student_id) 
VALUES (
    'Jane Smith', 
    'student@example.com', 
    '$2a$10$kqDm.zlNI9JmzFQmDfHSzuP96Z5vIEI1JijlZrGW3PBv8U72S.Wiq', -- password: password123
    'student',
    'STU001'
);

-- Create sample labs
INSERT INTO labs (name, location, capacity, description) 
VALUES 
    ('Computer Lab 101', 'Building A, Room 101', 30, 'General purpose computer lab with 30 workstations'),
    ('Physics Lab', 'Building B, Room 205', 25, 'Lab equipped for physics experiments'),
    ('Chemistry Lab', 'Building B, Room 210', 20, 'Lab with chemical equipment and safety facilities');

-- Create sample lab sessions
INSERT INTO lab_sessions (lab_id, name, day_of_week, start_time, end_time, max_students) 
VALUES 
    (1, 'Morning Session', 'Monday', '09:00', '11:00', 30),
    (1, 'Afternoon Session', 'Monday', '14:00', '16:00', 30),
    (1, 'Morning Session', 'Wednesday', '09:00', '11:00', 30),
    (2, 'Physics 101', 'Tuesday', '10:00', '12:00', 25),
    (3, 'Chemistry 101', 'Friday', '13:00', '15:00', 20);

-- Create sample attendance records
INSERT INTO attendance (user_id, lab_id, lab_session_id, date)
VALUES
    (2, 1, 1, CURRENT_DATE - INTERVAL '7 days'),
    (2, 1, 2, CURRENT_DATE - INTERVAL '5 days'),
    (2, 1, 3, CURRENT_DATE - INTERVAL '2 days');

-- Create indexes for better performance
CREATE INDEX idx_user_role ON users(role);
CREATE INDEX idx_attendance_user ON attendance(user_id);
CREATE INDEX idx_attendance_lab_session ON attendance(lab_session_id);
CREATE INDEX idx_lab_sessions_lab ON lab_sessions(lab_id);
