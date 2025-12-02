import mysql from 'mysql2/promise'
import dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'
import fs from 'fs'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Manually load .env to avoid dotenv v17 auto-loading issues
const envPath = path.resolve(__dirname, '.env')
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8')
  for (const line of envContent.split('\n')) {
    const trimmed = line.trim()
    if (trimmed && !trimmed.startsWith('#')) {
      const [key, ...valueParts] = trimmed.split('=')
      const value = valueParts.join('=').trim()
      if (key && !process.env[key]) {
        process.env[key.trim()] = value
      }
    }
  }
}

const DB_HOST = process.env.DB_HOST || 'localhost'
const DB_PORT = parseInt(process.env.DB_PORT, 10) || 3306
const DB_USER = process.env.DB_USER || 'root'
const DB_PASSWORD = process.env.DB_PASSWORD || ''
const DB_NAME = process.env.DB_NAME || 'vue3_lab'

async function setupDatabase() {
  let connection

  try {
    // Debug: show connection params (hide password)
    console.log('🔧 Connection config:')
    console.log(`   Host: ${DB_HOST}`)
    console.log(`   Port: ${DB_PORT}`)
    console.log(`   User: ${DB_USER}`)
    console.log(`   Password: ${'*'.repeat(DB_PASSWORD.length)} (${DB_PASSWORD.length} chars)`)
    console.log(`   Database: ${DB_NAME}`)
    
    // 1. Connect without database (to create it if needed)
    console.log('\n🔌 Connecting to MySQL...')
    connection = await mysql.createConnection({
      host: DB_HOST,
      port: DB_PORT,
      user: DB_USER,
      password: DB_PASSWORD,
      // MySQL 8 uses caching_sha2_password by default
      authPlugins: {
        mysql_native_password: () => () => Buffer.from(DB_PASSWORD + '\0')
      }
    })
    console.log('✅ Connected to MySQL server')

    // 2. Create database
    console.log(`📦 Creating database "${DB_NAME}"...`)
    await connection.query(`CREATE DATABASE IF NOT EXISTS \`${DB_NAME}\``)
    console.log(`✅ Database "${DB_NAME}" ready`)

    // 3. Use the database
    await connection.query(`USE \`${DB_NAME}\``)

    // 4. Drop existing table (fresh start)
    console.log('🗑️  Dropping existing students table (if any)...')
    await connection.query('DROP TABLE IF EXISTS students')

    // 5. Create students table
    console.log('📋 Creating students table...')
    await connection.query(`
      CREATE TABLE students (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        course VARCHAR(100) NOT NULL,
        score INT DEFAULT 0,
        semester VARCHAR(50) NOT NULL,
        status ENUM('Active', 'Inactive') DEFAULT 'Active',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `)
    console.log('✅ Students table created')

    // 6. Insert initial data
    console.log('📝 Inserting initial student data...')
    const students = [
      ['Ruhan', 'Vue 3 Lab', 95, 'Spring 2025', 'Active'],
      ['Rejuan', 'Frontend Interaction', 90, 'Fall 2024', 'Active'],
      ['Ahmed', 'Backend Basics', 85, 'Spring 2025', 'Inactive'],
      ['Alice Chen', 'Vue 3 Lab', 88, 'Spring 2025', 'Active'],
      ['Bob Li', 'Frontend Interaction', 76, 'Spring 2025', 'Active'],
      ['Carlos Wang', 'Backend Basics', 82, 'Fall 2024', 'Inactive'],
      ['Diana Zhang', 'Data Visualization', 91, 'Spring 2024', 'Active'],
      ['Eric Wu', 'Data Visualization', 73, 'Fall 2024', 'Active'],
      ['Fatima Noor', 'Algorithms', 89, 'Spring 2024', 'Active'],
      ['George Sun', 'Algorithms', 67, 'Fall 2024', 'Inactive'],
      ['Hannah Park', 'Database Systems', 92, 'Spring 2025', 'Active'],
      ['Ivan Lee', 'Database Systems', 78, 'Fall 2024', 'Active'],
      ['Jenny Kim', 'UI Design', 94, 'Spring 2024', 'Active'],
      ['Kevin Gu', 'UI Design', 81, 'Fall 2025', 'Inactive'],
      ['Lily Zhao', 'Networks', 87, 'Spring 2025', 'Active'],
      ['Mario Rossi', 'Networks', 72, 'Fall 2024', 'Active'],
      ['Nadia Ali', 'Cloud Computing', 90, 'Spring 2025', 'Active'],
      ['Oscar Liu', 'Cloud Computing', 84, 'Fall 2025', 'Active'],
      ['Priya Singh', 'Vue 3 Lab', 79, 'Fall 2024', 'Inactive'],
      ['Qi Zhang', 'Frontend Interaction', 93, 'Spring 2024', 'Active'],
      ['Raj Patel', 'Backend Basics', 88, 'Fall 2025', 'Active'],
      ['Sara Müller', 'Data Visualization', 82, 'Spring 2025', 'Inactive'],
      ['Tom Brown', 'Algorithms', 75, 'Spring 2024', 'Active'],
      ['Uma Devi', 'Database Systems', 97, 'Fall 2024', 'Active'],
      ['Victor Chan', 'UI Design', 69, 'Spring 2025', 'Inactive'],
      ['Wang Wei', 'Networks', 83, 'Fall 2024', 'Active'],
      ['Xiao Ming', 'Vue 3 Lab', 91, 'Spring 2024', 'Active'],
      ['Yuki Tanaka', 'Frontend Interaction', 88, 'Fall 2025', 'Inactive'],
      ['Zara Khan', 'Backend Basics', 80, 'Spring 2024', 'Active'],
      ['Ben Davis', 'Cloud Computing', 71, 'Fall 2024', 'Active'],
      ['Chen Hao', 'Data Visualization', 86, 'Spring 2025', 'Active'],
      ['David Lee', 'Algorithms', 92, 'Fall 2025', 'Active'],
      ['Elena Petro', 'Database Systems', 77, 'Spring 2024', 'Inactive'],
      ['Feng Yu', 'UI Design', 90, 'Fall 2024', 'Active'],
      ['Grace Liu', 'Networks', 85, 'Spring 2025', 'Active'],
      ['Henry Zhao', 'Vue 3 Lab', 68, 'Fall 2025', 'Inactive'],
      ['Isabella Wu', 'Frontend Interaction', 96, 'Spring 2025', 'Active'],
      ['Jack Ma', 'Backend Basics', 74, 'Fall 2024', 'Active'],
      ['Katrin Koch', 'Cloud Computing', 88, 'Spring 2024', 'Inactive'],
      ['Leo Martin', 'Data Visualization', 81, 'Fall 2025', 'Active']
    ]

    for (const student of students) {
      await connection.query(
        'INSERT INTO students (name, course, score, semester, status) VALUES (?, ?, ?, ?, ?)',
        student
      )
    }
    console.log(`✅ Inserted ${students.length} students`)

    // 7. Verify data
    const [rows] = await connection.query('SELECT COUNT(*) as count FROM students')
    console.log(`\n🎉 Setup complete! Total students in database: ${rows[0].count}`)

    // 8. Show sample data
    const [sample] = await connection.query('SELECT * FROM students LIMIT 5')
    console.log('\n📊 Sample data:')
    console.table(sample)

  } catch (err) {
    console.error('❌ Setup failed:', err.message)
    console.error('\n🔧 Troubleshooting:')
    console.error('   1. Make sure MySQL is running')
    console.error('   2. Check your credentials in server/.env')
    console.error('   3. Verify DB_USER has permission to create databases')
    process.exit(1)
  } finally {
    if (connection) {
      await connection.end()
      console.log('\n🔌 Connection closed')
    }
  }
}

setupDatabase()