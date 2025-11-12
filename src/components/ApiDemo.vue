<template>
  <section class="api-demo">
    <h2>📡 学生信息管理系统</h2>

    <!-- 🔎 Toolbar Filters -->
    <div class="toolbar">
      <button @click="loadData" :disabled="loading">
        {{ loading ? '加载中...' : '🔄 刷新数据' }}
      </button>

      <input v-model="filters.q" placeholder="🔍 搜索姓名或课程" @keyup.enter="loadData" />
      <select v-model="filters.status" @change="loadData">
        <option value="">全部状态</option>
        <option>Active</option>
        <option>Inactive</option>
      </select>

      <!-- 🧭 Semester filter (free text instead of select) -->
      <input
        v-model="filters.semester"
        placeholder="输入学期 (e.g. Spring 2025)"
        @keyup.enter="loadData"
      />
    </div>

    <p v-if="error" class="error">{{ error }}</p>

    <!-- 🧾 Student Table -->
    <table v-if="students.length" class="data-table">
      <thead>
        <tr>
          <th>ID</th>
          <th>姓名</th>
          <th>课程</th>
          <th>分数</th>
          <th>学期</th>
          <th>状态</th>
          <th>操作</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="s in students" :key="s.id">
          <td>{{ s.id }}</td>
          <td>{{ s.name }}</td>
          <td>{{ s.course }}</td>
          <td>{{ s.score }}</td>
          <td>{{ s.semester }}</td>
          <td>
            <span :class="['status', s.status === 'Active' ? 'active' : 'inactive']">
              {{ s.status }}
            </span>
          </td>
          <td class="ops">
            <button class="edit" @click="editStudent(s)">✏️</button>
            <button class="delete" @click="deleteStudent(s.id)">🗑️</button>
          </td>
        </tr>
      </tbody>
    </table>
    <div v-else class="empty">暂无数据，请添加学生信息。</div>

    <!-- ➕ Add Form -->
    <h3>➕ 新增学生信息</h3>
    <form @submit.prevent="addStudent" class="form">
      <input v-model="form.name" placeholder="姓名" required />
      <input v-model="form.course" placeholder="课程" required />
      <input v-model.number="form.score" type="number" min="0" max="100" placeholder="分数" required />

      <!-- 🧭 Free text semester input -->
      <input
        v-model="form.semester"
        placeholder="学期 (e.g. Spring 2025)"
        required
      />

      <select v-model="form.status">
        <option>Active</option>
        <option>Inactive</option>
      </select>

      <button type="submit" :disabled="loading">
        {{ loading ? '提交中...' : '添加' }}
      </button>
    </form>
  </section>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'

const students = ref([])
const filters = ref({ q: '', status: '', semester: '' })
const form = ref({
  name: '',
  course: '',
  score: '',
  semester: '',
  status: 'Active',
})
const loading = ref(false)
const error = ref('')

// Load students
async function loadData() {
  loading.value = true
  error.value = ''
  try {
    const res = await axios.get('/api/students')
    let data = res.data || []

    // Simple filters
    if (filters.value.q) {
      const q = filters.value.q.toLowerCase()
      data = data.filter(
        s =>
          s.name.toLowerCase().includes(q) ||
          s.course.toLowerCase().includes(q)
      )
    }
    if (filters.value.status) {
      data = data.filter(s => s.status === filters.value.status)
    }
    if (filters.value.semester) {
      data = data.filter(s =>
        s.semester.toLowerCase().includes(filters.value.semester.toLowerCase())
      )
    }

    students.value = data
  } catch (err) {
    error.value = '加载失败：' + err.message
  } finally {
    loading.value = false
  }
}

// Add student
async function addStudent() {
  loading.value = true
  try {
    await axios.post('/api/students', form.value)
    form.value = { name: '', course: '', score: '', semester: '', status: 'Active' }
    await loadData()
  } catch (err) {
    error.value = '添加失败：' + err.message
  } finally {
    loading.value = false
  }
}

// Delete student
async function deleteStudent(id) {
  if (!confirm('确定删除该学生吗？')) return
  try {
    await axios.delete(`/api/students/${id}`)
    await loadData()
  } catch (err) {
    error.value = '删除失败：' + err.message
  }
}

// Edit student placeholder (you can later expand)
function editStudent(student) {
  alert(`编辑功能暂未实现: ${student.name}`)
}

onMounted(loadData)
</script>

<style scoped>
.api-demo {
  background: var(--color-card, #fff);
  color: var(--color-text, #1f2937);
  padding: 1.25rem;
  border-radius: 16px;
  box-shadow: var(--shadow, 0 8px 24px rgba(0,0,0,.08));
}

.toolbar {
  display: flex;
  flex-wrap: wrap;
  gap: 0.6rem;
  margin-bottom: 1rem;
}
.toolbar input,
.toolbar select {
  padding: 0.4rem 0.6rem;
  border: 1px solid #d1d5db;
  border-radius: 6px;
}

.form {
  display: flex;
  flex-wrap: wrap;
  gap: 0.6rem;
  margin-top: 0.8rem;
}
.form input,
.form select {
  padding: 0.4rem 0.6rem;
  border: 1px solid #d1d5db;
  border-radius: 6px;
}
.form button {
  background: linear-gradient(90deg, #42b883, #2ecc71);
  color: #fff;
  border: 0;
  border-radius: 8px;
  padding: 0.45rem 1rem;
  font-weight: 600;
  cursor: pointer;
}
.form button:hover {
  opacity: 0.9;
}

.data-table {
  width: 100%;
  border-collapse: collapse;
  margin-bottom: 1rem;
}
.data-table th, .data-table td {
  border: 1px solid #e5e7eb;
  padding: 0.5rem;
  text-align: center;
}
.status.active { color: #22c55e; font-weight: bold; }
.status.inactive { color: #ef4444; font-weight: bold; }
.empty {
  color: #64748b;
  text-align: center;
  margin: 1rem 0;
}
.error {
  color: #ef4444;
  margin-bottom: 1rem;
  font-weight: 600;
}
</style>
