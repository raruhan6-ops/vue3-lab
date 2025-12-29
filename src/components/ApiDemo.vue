<template>
  <section class="api-demo">
    <header class="section-header">
      <div class="header-text">
        <h2>📡 学生信息管理系统</h2>
        <p class="description">管理学生数据，支持搜索、筛选和实时操作</p>
      </div>
      <button class="btn" @click="loadData" :disabled="loading">
        <span v-if="loading" class="spinner"></span>
        <span v-else>🔄</span>
        {{ loading ? '加载中...' : '刷新数据' }}
      </button>
    </header>

    <!-- 🔎 Filters -->
    <div class="filters-card">
      <div class="filter-group">
        <label>搜索</label>
        <div class="input-with-icon">
          <span class="input-icon">🔍</span>
          <input 
            v-model="filters.q" 
            placeholder="搜索姓名或课程..." 
            @keyup.enter="loadData" 
          />
        </div>
      </div>
      
      <div class="filter-group">
        <label>状态筛选</label>
        <select v-model="filters.status" @change="loadData">
          <option value="">全部状态</option>
          <option value="Active">Active</option>
          <option value="Inactive">Inactive</option>
        </select>
      </div>
      
      <div class="filter-group">
        <label>学期筛选</label>
        <input
          v-model="filters.semester"
          placeholder="e.g. Spring 2025"
          @keyup.enter="loadData"
        />
      </div>
    </div>

    <!-- Error Alert -->
    <div v-if="error" class="alert error">
      <span class="alert-icon">⚠️</span>
      {{ error }}
    </div>

    <!-- 🧾 Student Table -->
    <div class="table-container" v-if="students.length || loading">
      <table class="data-table">
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
          <!-- Skeleton Loading State -->
          <tr v-if="loading" v-for="i in 5" :key="i" class="table-row">
            <td v-for="j in 7" :key="j">
              <SkeletonLoader height="24px" />
            </td>
          </tr>
          
          <!-- Student Data -->
          <tr v-else v-for="s in students" :key="s.id" class="table-row">
            <td class="cell-id">
              <span class="id-badge">#{{ s.id }}</span>
            </td>
            <td class="cell-name">
              <div class="avatar">{{ s.name.charAt(0) }}</div>
              <span>{{ s.name }}</span>
            </td>
            <td>{{ s.course }}</td>
            <td>
              <span class="score-badge" :class="getScoreClass(s.score)">
                {{ s.score }}
              </span>
            </td>
            <td>{{ s.semester }}</td>
            <td>
              <span class="badge" :class="s.status === 'Active' ? 'success' : 'danger'">
                {{ s.status }}
              </span>
            </td>
            <td class="cell-actions">
              <button class="action-btn edit" @click="editStudent(s)" title="编辑">
                ✏️
              </button>
              <button class="action-btn delete" @click="deleteStudent(s.id)" title="删除">
                🗑️
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    
    <div v-else-if="!loading" class="empty-state">
      <div class="empty-icon">📭</div>
      <h3>暂无数据</h3>
      <p>请添加学生信息或调整筛选条件</p>
    </div>

    <!-- ➕ Add Form -->
    <div class="form-card">
      <h3>➕ 新增学生信息</h3>
      <form @submit.prevent="addStudent" class="add-form">
        <div class="form-row">
          <div class="form-group">
            <label>姓名</label>
            <input v-model="form.name" placeholder="输入学生姓名" required />
          </div>
          <div class="form-group">
            <label>课程</label>
            <input v-model="form.course" placeholder="输入课程名称" required />
          </div>
          <div class="form-group">
            <label>分数</label>
            <input 
              v-model.number="form.score" 
              type="number" 
              min="0" 
              max="100" 
              placeholder="0-100" 
              required 
            />
          </div>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label>学期</label>
            <input v-model="form.semester" placeholder="e.g. Spring 2025" required />
          </div>
          <div class="form-group">
            <label>状态</label>
            <select v-model="form.status">
              <option>Active</option>
              <option>Inactive</option>
            </select>
          </div>
          <div class="form-group form-submit">
            <button type="submit" class="btn" :disabled="loading">
              <span v-if="loading" class="spinner"></span>
              {{ loading ? '提交中...' : '添加学生' }}
            </button>
          </div>
        </div>
      </form>
    </div>
  </section>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import http from '../utils/http'
import SkeletonLoader from './ui/SkeletonLoader.vue'

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

function getScoreClass(score) {
  if (score >= 90) return 'excellent'
  if (score >= 80) return 'good'
  if (score >= 60) return 'pass'
  return 'fail'
}

async function loadData() {
  loading.value = true
  error.value = ''
  try {
    const res = await http.get('/students')
    let data = res.data || []

    if (filters.value.q) {
      const q = filters.value.q.toLowerCase()
      data = data.filter(
        s => s.name.toLowerCase().includes(q) || s.course.toLowerCase().includes(q)
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

async function addStudent() {
  loading.value = true
  try {
    await http.post('/students', form.value)
    form.value = { name: '', course: '', score: '', semester: '', status: 'Active' }
    await loadData()
  } catch (err) {
    error.value = '添加失败：' + err.message
  } finally {
    loading.value = false
  }
}

async function deleteStudent(id) {
  if (!confirm('确定删除该学生吗？')) return
  try {
    await http.delete(`/students/${id}`)
    await loadData()
  } catch (err) {
    error.value = '删除失败：' + err.message
  }
}

function editStudent(student) {
  alert(`编辑功能暂未实现: ${student.name}`)
}

onMounted(loadData)
</script>

<style scoped>
.api-demo {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

/* Header */
.section-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
  flex-wrap: wrap;
}

.header-text h2 {
  margin: 0 0 0.25rem 0;
  font-size: 1.5rem;
}

.description {
  margin: 0;
  color: var(--muted);
  font-size: 0.9rem;
}

/* Filters */
.filters-card {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  padding: 1.25rem;
  background: var(--bg-subtle);
  border-radius: var(--radius-lg);
  border: 1px solid var(--border);
}

.filter-group {
  display: flex;
  flex-direction: column;
  gap: 0.375rem;
}

.filter-group label {
  font-size: 0.8rem;
  font-weight: 600;
  color: var(--text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.input-with-icon {
  position: relative;
}

.input-icon {
  position: absolute;
  left: 0.75rem;
  top: 50%;
  transform: translateY(-50%);
  font-size: 0.9rem;
  pointer-events: none;
}

.input-with-icon input {
  padding-left: 2.25rem;
}

/* Alert */
.alert {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.875rem 1rem;
  border-radius: var(--radius);
  font-size: 0.9rem;
  font-weight: 500;
}

.alert.error {
  background: rgba(239, 68, 68, 0.1);
  color: var(--danger);
  border: 1px solid rgba(239, 68, 68, 0.2);
}

.alert-icon {
  font-size: 1.1rem;
}

/* Table */
.table-container {
  overflow-x: auto;
  border-radius: var(--radius-lg);
  border: 1px solid var(--border);
  background: var(--panel);
}

.data-table {
  margin: 0;
}

.data-table th {
  font-size: 0.75rem;
  padding: 1rem;
  border-bottom: 2px solid var(--border);
}

.data-table td {
  padding: 0.875rem 1rem;
  vertical-align: middle;
}

.table-row {
  transition: background-color var(--transition-fast);
}

.cell-id {
  width: 60px;
}

.id-badge {
  display: inline-block;
  font-size: 0.8rem;
  font-weight: 600;
  color: var(--muted);
  font-family: var(--font-mono);
}

.cell-name {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.avatar {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, var(--primary) 0%, var(--primary-600) 100%);
  color: white;
  font-weight: 700;
  font-size: 0.875rem;
  border-radius: var(--radius-full);
}

.score-badge {
  display: inline-block;
  padding: 0.25rem 0.625rem;
  border-radius: var(--radius-full);
  font-size: 0.8rem;
  font-weight: 600;
}

.score-badge.excellent {
  background: var(--primary-100);
  color: var(--primary-700);
}

.score-badge.good {
  background: var(--secondary-50);
  color: var(--secondary-600);
}

.score-badge.pass {
  background: rgba(245, 158, 11, 0.15);
  color: #b45309;
}

.score-badge.fail {
  background: rgba(239, 68, 68, 0.15);
  color: #b91c1c;
}

.cell-actions {
  display: flex;
  gap: 0.5rem;
}

.action-btn {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--bg-subtle);
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  cursor: pointer;
  font-size: 0.9rem;
  transition: all var(--transition-fast);
}

.action-btn:hover {
  transform: scale(1.1);
}

.action-btn.edit:hover {
  background: var(--secondary-50);
  border-color: var(--secondary);
}

.action-btn.delete:hover {
  background: rgba(239, 68, 68, 0.1);
  border-color: var(--danger);
}

/* Empty State */
.empty-state {
  text-align: center;
  padding: 3rem 1.5rem;
  background: var(--bg-subtle);
  border-radius: var(--radius-lg);
  border: 2px dashed var(--border);
}

.empty-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.empty-state h3 {
  margin: 0 0 0.5rem 0;
  color: var(--text);
}

.empty-state p {
  margin: 0;
  color: var(--muted);
}

/* Form */
.form-card {
  padding: 1.5rem;
  background: var(--bg-subtle);
  border-radius: var(--radius-lg);
  border: 1px solid var(--border);
}

.form-card h3 {
  margin: 0 0 1.25rem 0;
  font-size: 1.125rem;
}

.add-form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.form-row {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 1rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.375rem;
}

.form-group label {
  font-size: 0.8rem;
  font-weight: 600;
  color: var(--text-secondary);
}

.form-submit {
  justify-content: flex-end;
  align-self: flex-end;
}

.form-submit .btn {
  margin-top: 1.375rem;
}

/* Spinner */
.spinner {
  width: 1rem;
  height: 1rem;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top-color: white;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* Badge (reuse global) */
.badge {
  display: inline-flex;
  align-items: center;
  font-size: 0.75rem;
  font-weight: 600;
  padding: 0.25rem 0.625rem;
  border-radius: var(--radius-full);
  text-transform: uppercase;
  letter-spacing: 0.025em;
}

.badge.success {
  background: var(--primary-100);
  color: var(--primary-700);
}

.badge.danger {
  background: rgba(239, 68, 68, 0.15);
  color: #b91c1c;
}

.dark .badge.success {
  color: var(--primary-500);
}

.dark .badge.danger {
  color: var(--danger);
}

.dark .score-badge.excellent {
  color: var(--primary-500);
}

.dark .score-badge.good {
  color: var(--secondary-500);
}

.dark .score-badge.pass {
  color: var(--warning);
}

.dark .score-badge.fail {
  color: var(--danger);
}
</style>
