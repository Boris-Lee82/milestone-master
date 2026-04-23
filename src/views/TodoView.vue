<template>
  <div class="todo-container">
    <el-card class="todo-card">
      <template #header>
        <div class="card-header">
          <span>待办事项</span>
          <div class="header-actions">
            <el-button type="primary" @click="showAddDialog">
              <el-icon><Plus /></el-icon>
              添加事项
            </el-button>
            <el-button @click="exportData">
              <el-icon><Download /></el-icon>
              导出
            </el-button>
            <el-button @click="triggerImport">
              <el-icon><Upload /></el-icon>
              导入
            </el-button>
            <input
              ref="fileInput"
              type="file"
              accept=".csv"
              style="display: none"
              @change="handleFileImport"
            />
          </div>
        </div>
      </template>

      <!-- 筛选条件 -->
      <div class="filter-section">
        <el-row :gutter="20">
          <el-col :span="4">
            <el-select v-model="filters.projectId" placeholder="所属项目" clearable @change="applyFilters">
              <el-option
                v-for="project in projects"
                :key="project.id"
                :label="project.name"
                :value="project.id"
              />
            </el-select>
          </el-col>
          <el-col :span="4">
            <el-select v-model="filters.category" placeholder="分类" clearable @change="applyFilters">
              <el-option label="版本" value="版本" />
              <el-option label="需求" value="需求" />
              <el-option label="事务" value="事务" />
              <el-option label="问题" value="问题" />
            </el-select>
          </el-col>
          <el-col :span="4">
            <el-select v-model="filters.priority" placeholder="优先级" clearable @change="applyFilters">
              <el-option label="高" value="高" />
              <el-option label="中" value="中" />
              <el-option label="低" value="低" />
            </el-select>
          </el-col>
          <el-col :span="4">
            <el-select v-model="filters.status" placeholder="状态" clearable @change="applyFilters">
              <el-option label="未开始" value="未开始" />
              <el-option label="进行中" value="进行中" />
              <el-option label="已完成" value="已完成" />
              <el-option label="已关闭" value="已关闭" />
            </el-select>
          </el-col>
          <el-col :span="4">
            <el-select v-model="filters.ownerId" placeholder="责任人" clearable @change="applyFilters">
              <el-option
                v-for="owner in owners"
                :key="owner.id"
                :label="owner.name"
                :value="owner.id"
              />
            </el-select>
          </el-col>
          <el-col :span="4">
            <el-button @click="resetFilters">重置筛选</el-button>
          </el-col>
        </el-row>
      </div>

      <!-- 待办事项表格 -->
      <el-table
        :data="filteredTasks"
        stripe
        style="width: 100%"
        @row-click="handleRowClick"
        class="todo-table"
      >
        <el-table-column type="index" label="编号" width="80" />
        <el-table-column prop="name" label="事务名称" min-width="200" show-overflow-tooltip />
        <el-table-column prop="projectName" label="所属项目" width="120" />
        <el-table-column prop="category" label="分类" width="100">
          <template #default="{ row }">
            <el-tag :type="getCategoryType(row.category)">{{ row.category }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="priority" label="优先级" width="100">
          <template #default="{ row }">
            <el-tag :type="getPriorityType(row.priority)">{{ row.priority }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)">{{ row.status }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="progress" label="完成度" width="120">
          <template #default="{ row }">
            <div class="progress-wrapper">
              <el-progress :percentage="row.progress" :stroke-width="8" />
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="ownerName" label="责任人" width="100" />
        <el-table-column prop="planDate" label="计划完成" width="100" />
        <el-table-column prop="actualDate" label="实际完成" width="100" />
        <el-table-column label="操作" width="180" fixed="right">
          <template #default="{ row }">
            <el-button size="small" @click.stop="editTask(row)">编辑</el-button>
            <el-button size="small" type="danger" @click.stop="deleteTask(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 添加/编辑事项对话框 -->
    <el-dialog v-model="dialogVisible" :title="dialogTitle" width="700px">
      <el-form :model="taskForm" :rules="rules" ref="taskFormRef" label-width="120px">
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="事务名称" prop="name">
              <el-input v-model="taskForm.name" placeholder="请输入事务名称" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="所属项目" prop="projectId">
              <el-select v-model="taskForm.projectId" placeholder="选择项目" style="width: 100%">
                <el-option
                  v-for="project in projects"
                  :key="project.id"
                  :label="project.name"
                  :value="project.id"
                />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="分类" prop="category">
              <el-select v-model="taskForm.category" placeholder="选择分类" style="width: 100%">
                <el-option label="版本" value="版本" />
                <el-option label="需求" value="需求" />
                <el-option label="事务" value="事务" />
                <el-option label="问题" value="问题" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="优先级" prop="priority">
              <el-select v-model="taskForm.priority" placeholder="选择优先级" style="width: 100%">
                <el-option label="高" value="高" />
                <el-option label="中" value="中" />
                <el-option label="低" value="低" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="状态" prop="status">
              <el-select v-model="taskForm.status" placeholder="选择状态" style="width: 100%">
                <el-option label="未开始" value="未开始" />
                <el-option label="进行中" value="进行中" />
                <el-option label="已完成" value="已完成" />
                <el-option label="已关闭" value="已关闭" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="完成度" prop="progress">
              <el-slider v-model="taskForm.progress" :marks="{ 0: '0%', 50: '50%', 100: '100%' }" />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="责任人" prop="ownerId">
              <el-select v-model="taskForm.ownerId" placeholder="选择责任人" style="width: 100%">
                <el-option
                  v-for="owner in owners"
                  :key="owner.id"
                  :label="owner.name"
                  :value="owner.id"
                />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="计划完成" prop="planDate">
              <el-date-picker
                v-model="taskForm.planDate"
                type="date"
                placeholder="选择日期"
                format="YYYY/MM/DD"
                value-format="YYYY/MM/DD"
                style="width: 100%"
              />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="实际完成" prop="actualDate">
              <el-date-picker
                v-model="taskForm.actualDate"
                type="date"
                placeholder="选择日期"
                format="YYYY/MM/DD"
                value-format="YYYY/MM/DD"
                style="width: 100%"
              />
            </el-form-item>
          </el-col>
        </el-row>

        <el-form-item label="当前进展" prop="progressText">
          <el-input
            v-model="taskForm.progressText"
            type="textarea"
            :rows="3"
            placeholder="请输入当前进展"
          />
        </el-form-item>

        <el-form-item label="备注" prop="remark">
          <el-input
            v-model="taskForm.remark"
            type="textarea"
            :rows="2"
            placeholder="请输入备注"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="saveTask">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useStore } from '@/stores'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, Download, Upload } from '@element-plus/icons-vue'
import dbHelper from '@/utils/indexedDB'

const route = useRoute()
const store = useStore()

const projects = computed(() => store.projects)
const owners = computed(() => store.owners)
const tasks = computed(() => store.tasks)

// 筛选条件
const filters = ref({
  projectId: null,
  category: null,
  priority: null,
  status: null,
  ownerId: null
})

// 筛选后的任务
const filteredTasks = ref([])

// 应用筛选
const applyFilters = () => {
  filteredTasks.value = tasks.value.filter(task => {
    if (filters.value.projectId && task.projectId !== filters.value.projectId) return false
    if (filters.value.category && task.category !== filters.value.category) return false
    if (filters.value.priority && task.priority !== filters.value.priority) return false
    if (filters.value.status && task.status !== filters.value.status) return false
    if (filters.value.ownerId && task.ownerId !== filters.value.ownerId) return false
    return true
  })
}

// 初始化时检查URL参数
onMounted(() => {
  // 如果URL中有project参数，自动设置项目筛选
  if (route.query.project) {
    const projectId = parseInt(route.query.project, 10)
    if (!isNaN(projectId)) {
      filters.value.projectId = projectId
    }
  }
  // 如果URL中有status参数，自动设置状态筛选
  if (route.query.status) {
    filters.value.status = route.query.status
  }
  // 如果URL中有priority参数，自动设置优先级筛选
  if (route.query.priority) {
    filters.value.priority = route.query.priority
  }
  // 如果URL中有category参数，自动设置分类筛选
  if (route.query.category) {
    filters.value.category = route.query.category
  }
  // 应用筛选
  applyFilters()
})

// 对话框相关
const dialogVisible = ref(false)
const dialogTitle = ref('添加事项')
const taskFormRef = ref(null)
const taskForm = ref({
  id: null,
  name: '',
  projectId: null,
  projectName: '',
  category: '',
  priority: '',
  status: '',
  progress: 0,
  ownerId: null,
  ownerName: '',
  planDate: '',
  actualDate: '',
  progressText: '',
  remark: ''
})

const rules = {
  name: [{ required: true, message: '请输入事务名称', trigger: 'blur' }],
  projectId: [{ required: true, message: '请选择所属项目', trigger: 'change' }],
  category: [{ required: true, message: '请选择分类', trigger: 'change' }],
  priority: [{ required: true, message: '请选择优先级', trigger: 'change' }],
  status: [{ required: true, message: '请选择状态', trigger: 'change' }],
  ownerId: [{ required: true, message: '请选择责任人', trigger: 'change' }]
}

// 重置筛选
const resetFilters = () => {
  filters.value = {
    projectId: null,
    category: null,
    priority: null,
    status: null,
    ownerId: null
  }
  applyFilters()
}

// 显示添加对话框
const showAddDialog = () => {
  dialogTitle.value = '添加事项'
  taskForm.value = {
    id: null,
    name: '',
    projectId: null,
    projectName: '',
    category: '',
    priority: '',
    status: '',
    progress: 0,
    ownerId: null,
    ownerName: '',
    planDate: '',
    actualDate: '',
    progressText: '',
    remark: ''
  }
  dialogVisible.value = true
}

// 编辑任务
const editTask = (row) => {
  dialogTitle.value = '编辑事项'
  taskForm.value = { ...row }
  dialogVisible.value = true
}

// 保存任务
const saveTask = async () => {
  try {
    const valid = await taskFormRef.value.validate()
    if (!valid) {
      return
    }
    
    // 设置项目名称和责任人名称
    const project = store.getProjectById(taskForm.value.projectId)
    const owner = store.getOwnerById(taskForm.value.ownerId)

    if (taskForm.value.id) {
      // 更新 - 检查项目是否变更
      const originalTask = tasks.value.find(t => t.id === taskForm.value.id)
      const isProjectChanged = originalTask && originalTask.projectId !== taskForm.value.projectId

      if (isProjectChanged) {
        // 查找该事项关联的版本
        const relatedVersions = store.getVersionsByTaskId(taskForm.value.id)

        if (relatedVersions.length > 0) {
          // 有版本关联,需要确认
          const versionList = relatedVersions.map(v =>
            `${v.milestoneName} - ${v.versionName}`
          ).join('\n')

          ElMessageBox.confirm(
            `该事项已关联到以下软件版本:\n${versionList}\n\n变更项目后是否从这些版本中移除此事项?`,
            '确认操作',
            {
              confirmButtonText: '是,移除关联',
              cancelButtonText: '否,保留关联',
              type: 'warning',
              distinguishCancelAndClose: true
            }
          ).then(async () => {
            // 移除关联
            for (const v of relatedVersions) {
              await store.removeTaskFromVersion(v.versionId, taskForm.value.id)
            }

            // 更新事项
            await store.updateTask(taskForm.value.id, {
              name: taskForm.value.name,
              projectId: Number(taskForm.value.projectId),
              projectName: project?.name || '',
              category: taskForm.value.category,
              priority: taskForm.value.priority,
              status: taskForm.value.status,
              progress: taskForm.value.progress || 0,
              ownerId: Number(taskForm.value.ownerId),
              ownerName: owner?.name || '',
              planDate: taskForm.value.planDate || '',
              actualDate: taskForm.value.actualDate || '',
              progressText: taskForm.value.progressText || '',
              remark: taskForm.value.remark || ''
            })
            ElMessage.success('更新成功,已从版本中移除关联')
            dialogVisible.value = false
            applyFilters()
          }).catch((action) => {
            if (action === 'cancel') {
              // 保留关联,取消更新
              ElMessage.info('已取消更新')
            }
          })
          return
        }
      }

      // 没有关联版本或项目未变更,直接更新
      await store.updateTask(taskForm.value.id, {
        name: taskForm.value.name,
        projectId: Number(taskForm.value.projectId),
        projectName: project?.name || '',
        category: taskForm.value.category,
        priority: taskForm.value.priority,
        status: taskForm.value.status,
        progress: taskForm.value.progress || 0,
        ownerId: Number(taskForm.value.ownerId),
        ownerName: owner?.name || '',
        planDate: taskForm.value.planDate || '',
        actualDate: taskForm.value.actualDate || '',
        progressText: taskForm.value.progressText || '',
        remark: taskForm.value.remark || ''
      })
      ElMessage.success('更新成功')
      dialogVisible.value = false
      applyFilters()
    } else {
      // 添加
      const taskData = {
        name: taskForm.value.name,
        projectId: Number(taskForm.value.projectId),
        projectName: project?.name || '',
        category: taskForm.value.category,
        priority: taskForm.value.priority,
        status: taskForm.value.status,
        progress: taskForm.value.progress || 0,
        ownerId: Number(taskForm.value.ownerId),
        ownerName: owner?.name || '',
        planDate: taskForm.value.planDate || '',
        actualDate: taskForm.value.actualDate || '',
        progressText: taskForm.value.progressText || '',
        remark: taskForm.value.remark || ''
      }
      
      console.log('准备添加任务数据:', taskData)
      console.log('projectId类型:', typeof taskData.projectId, '值:', taskData.projectId)
      console.log('ownerId类型:', typeof taskData.ownerId, '值:', taskData.ownerId)
      
      await store.addTask(taskData)
      ElMessage.success('添加成功')
      dialogVisible.value = false
      applyFilters()
    }
  } catch (error) {
    console.error('保存任务时出错:', error)
    ElMessage.error('保存失败: ' + error.message)
  }
}

// 删除任务
const deleteTask = (row) => {
  ElMessageBox.confirm(`确定要删除事项"${row.name}"吗？`, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    await store.deleteTask(row.id)
    ElMessage.success('删除成功')
    applyFilters()
  }).catch(() => {})
}

// 行点击显示 Toast
const handleRowClick = (row) => {
  let message = `进展：${row.progressText || '暂无'}`
  if (row.remark) {
    message += `\n备注：${row.remark}`
  }

  ElMessage({
    message,
    type: 'info',
    duration: 3000,
    customClass: 'custom-toast'
  })
}

// 导出数据
const exportData = () => {
  const headers = [
    '编号', '事务名称', '所属项目', '分类', '优先级', '状态',
    '完成度', '责任人', '计划完成', '实际完成', '当前进展', '备注'
  ]

  const data = filteredTasks.value.map(task => [
    task.id,
    task.name,
    task.projectName,
    task.category,
    task.priority,
    task.status,
    task.progress + '%',
    task.ownerName,
    task.planDate,
    task.actualDate,
    task.progressText,
    task.remark
  ])

  let csvContent = headers.join(',') + '\n'
  data.forEach(row => {
    csvContent += row.map(cell => `"${cell || ''}"`).join(',') + '\n'
  })

  const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  const url = URL.createObjectURL(blob)
  link.setAttribute('href', url)
  link.setAttribute('download', `待办事项_${new Date().toLocaleDateString()}.csv`)
  link.style.visibility = 'hidden'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)

  ElMessage.success('导出成功')
}

// 文件输入引用
const fileInput = ref(null)

// 触发文件选择
const triggerImport = () => {
  fileInput.value.click()
}

// 处理文件导入
const handleFileImport = async (event) => {
  const file = event.target.files[0]
  if (!file) return

  try {
    const text = await file.text()
    const lines = text.split('\n').filter(line => line.trim())

    if (lines.length < 2) {
      ElMessage.warning('文件为空或格式不正确')
      return
    }

    // 解析CSV头部
    const headers = lines[0].split(',').map(h => h.replace(/"/g, '').trim())
    const expectedHeaders = ['编号', '事务名称', '所属项目', '分类', '优先级', '状态', '完成度', '责任人', '计划完成', '实际完成', '当前进展', '备注']

    // 验证头部是否匹配
    if (headers.length !== expectedHeaders.length) {
      ElMessage.error('文件格式不正确，请使用导出的CSV文件格式')
      return
    }

    // 解析数据行
    const importTasks = []
    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map(v => v.replace(/"/g, '').trim())
      if (values.length >= 6) {
        const task = {
          name: values[1],
          projectName: values[2],
          category: values[3],
          priority: values[4],
          status: values[5],
          progress: parseInt(values[6]) || 0,
          ownerName: values[7],
          planDate: values[8],
          actualDate: values[9],
          progressText: values[10],
          remark: values[11]
        }
        importTasks.push(task)
      }
    }

    if (importTasks.length === 0) {
      ElMessage.warning('没有有效的数据可导入')
      return
    }

    // 确认导入
    await ElMessageBox.confirm(
      `确定要导入 ${importTasks.length} 条待办事项吗？导入的数据将添加到现有数据中，不会覆盖已有数据。`,
      '确认导入',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )

    // 导入数据
    let successCount = 0
    let failCount = 0

    // 获取当前最大ID
    const maxId = tasks.value.length > 0 ? Math.max(...tasks.value.map(t => t.id)) : 0
    let newId = maxId + 1

    for (const task of importTasks) {
      try {
        // 查找项目ID
        const project = projects.value.find(p => p.name === task.projectName)
        if (!project) {
          failCount++
          continue
        }

        // 查找责任人ID
        const owner = owners.value.find(o => o.name === task.ownerName)
        if (!owner) {
          failCount++
          continue
        }

        // 创建新任务，使用新的唯一ID
        const newTask = {
          id: newId++,
          name: task.name,
          projectId: project.id,
          projectName: task.projectName,
          category: task.category,
          priority: task.priority,
          status: task.status,
          progress: task.progress,
          ownerId: owner.id,
          ownerName: task.ownerName,
          planDate: task.planDate,
          actualDate: task.actualDate,
          progressText: task.progressText,
          remark: task.remark
        }

        // 直接添加到store，不使用addTask方法（因为我们已经设置了ID）
        tasks.value.push(newTask)
        await dbHelper.add('tasks', newTask)
        successCount++
      } catch (error) {
        failCount++
      }
    }

    // 重新应用筛选
    applyFilters()

    if (failCount > 0) {
      ElMessage.warning(`导入完成：成功 ${successCount} 条，失败 ${failCount} 条`)
    } else {
      ElMessage.success(`导入成功：共导入 ${successCount} 条待办事项`)
    }
  } catch (error) {
    console.error('导入失败:', error)
    ElMessage.error('导入失败：' + error.message)
  } finally {
    // 清空文件输入
    event.target.value = ''
  }
}

// 辅助函数
const getCategoryType = (category) => {
  const map = { '版本': 'primary', '需求': 'success', '事务': 'warning', '问题': 'danger' }
  return map[category] || ''
}

const getPriorityType = (priority) => {
  const map = { '高': 'danger', '中': 'warning', '低': 'info' }
  return map[priority] || ''
}

const getStatusType = (status) => {
  const map = {
    '未开始': 'info',
    '进行中': 'warning',
    '已完成': 'success',
    '已关闭': ''
  }
  return map[status] || ''
}

// 初始化逻辑已移到 onMounted 中

</script>

<style scoped>
.todo-container {
  padding: 20px;
}

.todo-card {
  max-width: 1600px;
  margin: 0 auto;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 18px;
  font-weight: bold;
}

.header-actions {
  display: flex;
  gap: 10px;
}

.filter-section {
  margin-bottom: 20px;
}

.todo-table {
  cursor: pointer;
}

.todo-table :deep(.el-table__row) {
  transition: background-color 0.3s;
}

.todo-table :deep(.el-table__row:hover) {
  background-color: rgba(64, 158, 255, 0.1);
}

.progress-wrapper {
  width: 100%;
}
</style>
