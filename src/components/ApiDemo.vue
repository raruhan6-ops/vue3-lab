<template>
  <section class="api-demo">
    <h2>📡 学生信息管理系统</h2>

    <div class="toolbar">
      <button @click="loadData" :disabled="loading">{{ loading ? '加载中...' : '🔄 刷新数据' }}</button>
      <input v-model="filters.q" placeholder="🔍 搜索姓名或课程" @keyup.enter="loadData" />
      <select v-model="filters.status" @change="loadData">
        <option value="">全部状态</option>
        <option>Active</option>
        <option>Inactive</option>
      </select>
      <select v-model="filters.semester" @change="loadData">
        <option value="">全部学期</option>
        <option>Spring 2025</option>
        <option>Summer 2025</option>
        <option>Fall 2024</option>
      </select>
    </div>

    <p v-if="error" class="error">{{ error }}</p>

    <table v-if="students.length" class="data-table">
      <thead>
        <tr>
          <th>ID</th><th>姓名</th><th>课程</th><th>分数</th><th>学期</th><th>状态</th><th>操作</th>
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
            <span :class="['status', s.status === 'Active' ? 'active' : 'inactive']">{{ s.status }}</span>
          </td>
          <td class="ops">
            <button class="edit" @click="editStudent(s)">✏️</button>
            <button class="delete" @click="deleteStudent(s.id)">🗑️</button>
          </td>
        </tr>
      </tbody>
    </table>
    <div v-else class="empty">暂无数据，请添加学生信息。</div>

    <h3>➕ 新增学生信息</h3>
    <form @submit.prevent="addStudent" class="form">
      <input v-model="form.name" placeholder="姓名" required />
      <input v-model="form.course" placeholder="课程" required />
      <input v-model.number="form.score" type="number" min="0" max="100" placeholder="分数" required />
      <select v-model="form.semester" required>
        <option disabled value="">选择学期</option>
        <option>Spring 2025</option>
        <option>Summer 2025</option>
        <option>Fall 2024</option>
      </select>
      <select v-model="form.status" required>
        <option>Active</option>
        <option>Inactive</option>
      </select>
      <button :disabled="submitting">{{ submitting ? '提交中...' : '提交' }}</button>
    </form>

    <div v-if="editing" class="modal" @click.self="editing = false">
      <div class="modal-content">
        <h3>✏️ 编辑学生信息</h3>
        <form @submit.prevent="updateStudent">
          <input v-model="editForm.name" placeholder="姓名" required />
          <input v-model="editForm.course" placeholder="课程" required />
          <input v-model.number="editForm.score" type="number" min="0" max="100" required />
          <select v-model="editForm.semester" required>
            <option>Spring 2025</option><option>Summer 2025</option><option>Fall 2024</option>
          </select>
          <select v-model="editForm.status" required>
            <option>Active</option><option>Inactive</option>
          </select>
          <div class="modal-actions">
            <button type="submit">保存</button>
            <button type="button" class="cancel" @click="editing = false">取消</button>
          </div>
        </form>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'

const API = '/api/students'
const students = ref([])
const loading = ref(false)
const submitting = ref(false)
const error = ref('')
const editing = ref(false)
const filters = ref({ q: '', status: '', semester: '' })
const form = ref({ name: '', course: '', score: 0, semester: '', status: 'Active' })
const editForm = ref({})

async function loadData() {
  loading.value = true
  try {
    const res = await axios.get(API, { params: filters.value })
    students.value = res.data
  } catch (err) {
    error.value = err.message
  } finally {
    loading.value = false
  }
}

async function addStudent() {
  submitting.value = true
  try {
    const res = await axios.post(API, form.value)
    students.value.push(res.data)
    form.value = { name: '', course: '', score: 0, semester: '', status: 'Active' }
  } catch (err) {
    error.value = err.message
  } finally {
    submitting.value = false
  }
}

function editStudent(s) {
  editForm.value = { ...s }
  editing.value = true
}

async function updateStudent() {
  try {
    const res = await axios.put(`${API}/${editForm.value.id}`, editForm.value)
    const idx = students.value.findIndex(st => st.id === editForm.value.id)
    if (idx !== -1) students.value[idx] = res.data
    editing.value = false
  } catch (err) {
    error.value = err.message
  }
}

async function deleteStudent(id) {
  if (!confirm('确定要删除该学生吗？')) return
  await axios.delete(`${API}/${id}`)
  students.value = students.value.filter(s => s.id !== id)
}

onMounted(loadData)
</script>

<style scoped>
.api-demo {
  background: linear-gradient(180deg, #f9fdfb, #f2f8f7);
  border-radius: 16px;
  padding: 2rem;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
}

.toolbar {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

button {
  background: linear-gradient(90deg, #42b883, #2ecc71);
  color: white;
  border: none;
  padding: 0.4rem 0.8rem;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s ease;
}
button:hover { transform: scale(1.05); }
.error { color: #e74c3c; }

.data-table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 1rem;
  background: #fff;
  border-radius: 12px;
  overflow: hidden;
}
th {
  background: #42b883;
  color: white;
  padding: 0.6rem;
}
td {
  padding: 0.5rem;
  border-bottom: 1px solid #eee;
}
.status.active { color: #27ae60; font-weight: 600; }
.status.inactive { color: #c0392b; font-weight: 600; }
.empty { padding: 1rem; text-align: center; color: #777; }

.modal {
  position: fixed; inset: 0; background: rgba(0, 0, 0, 0.4);
  display: flex; align-items: center; justify-content: center;
}
.modal-content {
  background: white; padding: 1rem; border-radius: 12px; width: 400px;
}
.modal-actions { display: flex; justify-content: flex-end; gap: 0.5rem; margin-top: 1rem; }
.cancel { background: #aaa; }
</style>
