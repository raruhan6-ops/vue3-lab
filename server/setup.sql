-- Create database
CREATE DATABASE IF NOT EXISTS vue3_lab;
USE vue3_lab;

-- Create students table
CREATE TABLE IF NOT EXISTS students (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  course VARCHAR(100) NOT NULL,
  score INT DEFAULT 0,
  semester VARCHAR(50) NOT NULL,
  status ENUM('Active', 'Inactive') DEFAULT 'Active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Insert initial data
INSERT INTO students (name, course, score, semester, status) VALUES
('Ruhan', 'Vue 3 Lab', 95, 'Spring 2025', 'Active'),
('Rejuan', 'Frontend Interaction', 90, 'Fall 2024', 'Active'),
('Ahmed', 'Backend Basics', 85, 'Spring 2025', 'Inactive'),
('Alice Chen', 'Vue 3 Lab', 88, 'Spring 2025', 'Active'),
('Bob Li', 'Frontend Interaction', 76, 'Spring 2025', 'Active'),
('Carlos Wang', 'Backend Basics', 82, 'Fall 2024', 'Inactive'),
('Diana Zhang', 'Data Visualization', 91, 'Spring 2024', 'Active'),
('Eric Wu', 'Data Visualization', 73, 'Fall 2024', 'Active'),
('Fatima Noor', 'Algorithms', 89, 'Spring 2024', 'Active'),
('George Sun', 'Algorithms', 67, 'Fall 2024', 'Inactive'),
('Hannah Park', 'Database Systems', 92, 'Spring 2025', 'Active'),
('Ivan Lee', 'Database Systems', 78, 'Fall 2024', 'Active'),
('Jenny Kim', 'UI Design', 94, 'Spring 2024', 'Active'),
('Kevin Gu', 'UI Design', 81, 'Fall 2025', 'Inactive'),
('Lily Zhao', 'Networks', 87, 'Spring 2025', 'Active'),
('Mario Rossi', 'Networks', 72, 'Fall 2024', 'Active'),
('Nadia Ali', 'Cloud Computing', 90, 'Spring 2025', 'Active'),
('Oscar Liu', 'Cloud Computing', 84, 'Fall 2025', 'Active'),
('Priya Singh', 'Vue 3 Lab', 79, 'Fall 2024', 'Inactive'),
('Qi Zhang', 'Frontend Interaction', 93, 'Spring 2024', 'Active'),
('Raj Patel', 'Backend Basics', 88, 'Fall 2025', 'Active'),
('Sara Müller', 'Data Visualization', 82, 'Spring 2025', 'Inactive'),
('Tom Brown', 'Algorithms', 75, 'Spring 2024', 'Active'),
('Uma Devi', 'Database Systems', 97, 'Fall 2024', 'Active'),
('Victor Chan', 'UI Design', 69, 'Spring 2025', 'Inactive'),
('Wang Wei', 'Networks', 83, 'Fall 2024', 'Active'),
('Xiao Ming', 'Vue 3 Lab', 91, 'Spring 2024', 'Active'),
('Yuki Tanaka', 'Frontend Interaction', 88, 'Fall 2025', 'Inactive'),
('Zara Khan', 'Backend Basics', 80, 'Spring 2024', 'Active'),
('Ben Davis', 'Cloud Computing', 71, 'Fall 2024', 'Active'),
('Chen Hao', 'Data Visualization', 86, 'Spring 2025', 'Active'),
('David Lee', 'Algorithms', 92, 'Fall 2025', 'Active'),
('Elena Petro', 'Database Systems', 77, 'Spring 2024', 'Inactive'),
('Feng Yu', 'UI Design', 90, 'Fall 2024', 'Active'),
('Grace Liu', 'Networks', 85, 'Spring 2025', 'Active'),
('Henry Zhao', 'Vue 3 Lab', 68, 'Fall 2025', 'Inactive'),
('Isabella Wu', 'Frontend Interaction', 96, 'Spring 2025', 'Active'),
('Jack Ma', 'Backend Basics', 74, 'Fall 2024', 'Active'),
('Katrin Koch', 'Cloud Computing', 88, 'Spring 2024', 'Inactive'),
('Leo Martin', 'Data Visualization', 81, 'Fall 2025', 'Active');