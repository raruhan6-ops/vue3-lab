# Vue 3 Lab Platform

A comprehensive Vue 3 educational platform designed to demonstrate modern web development concepts, data visualization, and full-stack integration. This project serves as a hands-on laboratory for learning Vue 3, RESTful APIs, and advanced graphing libraries.

![Vue.js](https://img.shields.io/badge/Vue.js-3.5-4FC08D?style=for-the-badge&logo=vue.js&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-4.0-646CFF?style=for-the-badge&logo=vite&logoColor=white)
![Express.js](https://img.shields.io/badge/Express.js-4.18-000000?style=for-the-badge&logo=express&logoColor=white)
![MySQL](https://img.shields.io/badge/MySQL-8.0-4479A1?style=for-the-badge&logo=mysql&logoColor=white)
![AntV](https://img.shields.io/badge/AntV-G2%20%2F%20G6-blueviolet?style=for-the-badge)

## 🚀 Features

### 📚 Interactive Labs

The platform consists of 7 progressive labs, each focusing on specific technical domains:
  
- **Lab 07: GeoJSON & Gaode Map Visualization**
  - Overlay and visualize multiple GeoJSON files on a blank or Gaode (Amap) map using **AntV L7**.
  - Multi-select UI for overlays, smooth rendering for large files, and performance optimizations.
  - Consistent header and dark mode support, matching all other labs.
  - Modern UI with CSS variables for light/dark themes.

- **Lab 01: Basic Components**
  - Introduction to Vue 3 Composition API.
  - State management, event handling, and component communication.
  - Examples: `HelloVue`, `ClickCounter`, `TodoApp`.

- **Lab 02: API Interaction**
  - Full CRUD operations using **Axios**.
  - Real-time data synchronization with the backend.
  - Student management interface.

- **Lab 03: ECharts Visualization**
  - Interactive data visualization using **Apache ECharts**.
  - Dynamic charts reflecting student performance and statistics.

- **Lab 04: Advanced G2 Charts**
  - Professional-grade statistical charts using **AntV G2**.
  - Custom themes and complex data mapping.

- **Lab 05: Student Network Graph**
  - Network visualization using **AntV G6**.
  - Visualizes relationships between students (same course, same semester).
  - Features: Circular layout, filtering, and export to image.

- **Lab 06: Interactive Graph Analytics**
  - Advanced graph interactions with **AntV G6**.
  - Multiple layouts: Force-directed, Grid, and Radial.
  - Features: Node highlighting, zoom controls, and detailed inspection panels.

### 🤖 AI Assistant
- Integrated **AI Chatbot** powered by **Groq API** (using `qwen/qwen3-32b` model).
- **Context-Aware**: The bot has access to the live database state (student counts, averages, etc.).
- **RAG-Lite**: Retrieves relevant system information to answer user queries accurately.
- **Conversation Memory**: Remembers context for natural follow-up questions.

### 🎨 UI/UX

- **Responsive Design**: Fully responsive layout for all devices.
- **Dark/Light Mode**: System-aware theme toggling with persistent preference. All labs, including Lab7, use CSS variables for seamless dark mode.
- **Modern Styling**: Built with CSS variables and scoped styles for modularity. Lab7 now uses the same header and style conventions as other labs.

## 🛠️ Tech Stack

### Frontend
- **Framework**: Vue 3 (Composition API)
- **Build Tool**: Vite
- **Routing**: Vue Router 4
- **State Management**: Pinia
- **HTTP Client**: Axios
- **Visualization**: Apache ECharts, AntV G2, AntV G6
- **UI Libraries**: Heroicons, AOS (Animate On Scroll), NProgress

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MySQL (via `mysql2`)
- **AI Integration**: Groq API (OpenAI-compatible SDK)

## ⚙️ Installation & Setup

### Prerequisites
- Node.js (v16+)
- MySQL Server (v8.0+)

### 1. Clone the Repository
```bash
git clone https://github.com/raruhan6-ops/vue3-lab.git
cd vue3-lab
```

### 2. Database Setup
Ensure your MySQL server is running. Create a database and configure the connection.

1. Create a `.env` file in the `server/` directory:
   ```env
   DB_HOST=localhost
   DB_USER=root
   DB_PASSWORD=your_password
   DB_NAME=vue3_lab
   PORT=3000
   GROQ_API_KEY=your_groq_api_key
   ```

2. Run the setup script to initialize the database schema and seed data:
   ```bash
   cd server
   npm install
   npm run setup-db
   ```

### Optional: Map dependencies for Lab 7
If you plan to run Lab 7 (GeoJSON overlays with AntV L7 + Gaode/Amap), install the L7 packages in the frontend:
```bash
npm install @antv/l7 @antv/l7-maps
```
You may also need an AMap (Gaode) key depending on your environment — follow the LAB7 instructions in `LAB7_steps_outline.txt`.

### 3. Backend Setup
Start the Express server:
```bash
# In the server/ directory
npm run dev
```
The server will start at `http://localhost:3000`.

### 4. Frontend Setup
Install dependencies and start the Vite development server:
```bash
# In the root directory (open a new terminal)
npm install
npm run dev
```
The application will be available at `http://localhost:5173`.

#### Lab 7 Notes
- Lab7 features multi-GeoJSON overlay, Gaode map, and performance optimizations for large files.
- UI and header are consistent with other labs, and dark mode is fully supported.

## 📂 Project Structure

```
vue3-lab/
├── public/              # Static assets
├── server/              # Backend Express application
│   ├── db.js            # Database connection pool
│   ├── server.js        # Main server entry point & API routes
│   ├── setup-db.js      # Database initialization script
│   └── setup.sql        # SQL schema
├── src/                 # Frontend Vue application
│   ├── assets/          # Images and static resources
│   ├── components/      # Reusable Vue components
│   │   ├── charts/      # Chart wrapper components
│   │   ├── ui/          # UI components (Header, Cards)
│   │   └── Chatbot.vue  # AI Chatbot component
│   ├── composables/     # Shared logic (Vue Composables)
│   ├── router/          # Vue Router configuration
│   ├── styles/          # Global CSS and themes
│   ├── views/           # Page views (Home, Labs 1-7)
│   ├── App.vue          # Root component
│   └── main.js          # Application entry point
├── package.json         # Frontend dependencies
└── vite.config.js       # Vite configuration
```

## 🔌 API Endpoints

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/students` | Retrieve all students |
| `GET` | `/api/students/:id` | Retrieve a specific student |
| `POST` | `/api/students` | Create a new student |
| `PUT` | `/api/students/:id` | Update an existing student |
| `DELETE` | `/api/students/:id` | Delete a student |
| `GET` | `/api/stats` | Get aggregated statistics for charts |
| `POST` | `/api/chatbot` | Send message to AI assistant |

## 📄 License

This project is open-source and available under the [MIT License](LICENSE).

---

Developed by **Ruhan** as part of the Vue 3 Laboratory Project.