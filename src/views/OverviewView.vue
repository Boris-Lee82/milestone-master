<template>
  <div class="overview-container">
    <el-card class="overview-card">
      <template #header>
        <div class="card-header">
          <span>项目总览表</span>
          <el-button @click="exportOverview">
            <el-icon><Download /></el-icon>
            导出总览
          </el-button>
        </div>
      </template>

      <!-- 统计卡片 -->
      <el-row :gutter="20" class="stats-row">
        <el-col :span="6">
          <el-card class="stat-card">
            <div class="stat-content">
              <div class="stat-icon" style="background: #409EFF">
                <el-icon><Folder /></el-icon>
              </div>
              <div class="stat-info">
                <div class="stat-value">{{ projects.length }}</div>
                <div class="stat-label">项目总数</div>
              </div>
            </div>
          </el-card>
        </el-col>
        <el-col :span="6">
          <el-card class="stat-card clickable-stat" @click="tasks.length > 0 && goToTodoAll()">
            <div class="stat-content">
              <div class="stat-icon" style="background: #67C23A">
                <el-icon><List /></el-icon>
              </div>
              <div class="stat-info">
                <div class="stat-value" :class="{ 'disabled-stat': tasks.length === 0 }">{{ tasks.length }}</div>
                <div class="stat-label">待办事项总数</div>
              </div>
            </div>
          </el-card>
        </el-col>
        <el-col :span="6">
          <el-card class="stat-card clickable-stat" @click="inProgressTasks > 0 && goToTodoAll('status', '进行中')">
            <div class="stat-content">
              <div class="stat-icon" style="background: #E6A23C">
                <el-icon><Clock /></el-icon>
              </div>
              <div class="stat-info">
                <div class="stat-value" :class="{ 'disabled-stat': inProgressTasks === 0 }">{{ inProgressTasks }}</div>
                <div class="stat-label">进行中事项</div>
              </div>
            </div>
          </el-card>
        </el-col>
        <el-col :span="6">
          <el-card class="stat-card clickable-stat" @click="highPriorityTasks > 0 && goToTodoAll('priority', '高')">
            <div class="stat-content">
              <div class="stat-icon" style="background: #F56C6C">
                <el-icon><Warning /></el-icon>
              </div>
              <div class="stat-info">
                <div class="stat-value" :class="{ 'disabled-stat': highPriorityTasks === 0 }">{{ highPriorityTasks }}</div>
                <div class="stat-label">高优先级事项</div>
              </div>
            </div>
          </el-card>
        </el-col>
      </el-row>

      <!-- 项目总览表格 -->
      <div class="overview-table-section">
        <h3>项目详情总览</h3>
        <el-table :data="projectOverviewData" stripe border style="width: 100%">
          <el-table-column prop="projectName" label="项目名称" width="180" fixed />
          <el-table-column label="待办事项统计" align="center">
            <el-table-column prop="totalTasks" label="总数" width="100">
              <template #default="{ row }">
                <span
                  class="clickable-number"
                  :class="{ 'disabled': row.totalTasks === 0 }"
                  @click="row.totalTasks > 0 && goToTodo(row.projectId)"
                >{{ row.totalTasks }}</span>
              </template>
            </el-table-column>
            <el-table-column prop="completedTasks" label="已完成" width="100">
              <template #default="{ row }">
                <span
                  class="clickable-number"
                  :class="{ 'disabled': row.completedTasks === 0 }"
                  @click="row.completedTasks > 0 && goToTodo(row.projectId, 'status', '已完成')"
                >{{ row.completedTasks }}</span>
              </template>
            </el-table-column>
            <el-table-column prop="inProgressTasks" label="进行中" width="100">
              <template #default="{ row }">
                <span
                  class="clickable-number"
                  :class="{ 'disabled': row.inProgressTasks === 0 }"
                  @click="row.inProgressTasks > 0 && goToTodo(row.projectId, 'status', '进行中')"
                >{{ row.inProgressTasks }}</span>
              </template>
            </el-table-column>
            <el-table-column prop="notStartedTasks" label="未开始" width="100">
              <template #default="{ row }">
                <span
                  class="clickable-number"
                  :class="{ 'disabled': row.notStartedTasks === 0 }"
                  @click="row.notStartedTasks > 0 && goToTodo(row.projectId, 'status', '未开始')"
                >{{ row.notStartedTasks }}</span>
              </template>
            </el-table-column>
          </el-table-column>
          <el-table-column label="优先级分布" align="center">
            <el-table-column prop="highPriority" label="高" width="80">
              <template #default="{ row }">
                <el-tag
                  type="danger"
                  class="clickable-tag"
                  :class="{ 'disabled': row.highPriority === 0 }"
                  @click="row.highPriority > 0 && goToTodo(row.projectId, 'priority', '高')"
                >{{ row.highPriority }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="mediumPriority" label="中" width="80">
              <template #default="{ row }">
                <el-tag
                  type="warning"
                  class="clickable-tag"
                  :class="{ 'disabled': row.mediumPriority === 0 }"
                  @click="row.mediumPriority > 0 && goToTodo(row.projectId, 'priority', '中')"
                >{{ row.mediumPriority }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="lowPriority" label="低" width="80">
              <template #default="{ row }">
                <el-tag
                  type="info"
                  class="clickable-tag"
                  :class="{ 'disabled': row.lowPriority === 0 }"
                  @click="row.lowPriority > 0 && goToTodo(row.projectId, 'priority', '低')"
                >{{ row.lowPriority }}</el-tag>
              </template>
            </el-table-column>
          </el-table-column>
          <el-table-column label="分类分布" align="center">
            <el-table-column prop="categoryVersion" label="版本" width="80">
              <template #default="{ row }">
                <span
                  class="clickable-number"
                  :class="{ 'disabled': row.categoryVersion === 0 }"
                  @click="row.categoryVersion > 0 && goToTodo(row.projectId, 'category', '版本')"
                >{{ row.categoryVersion }}</span>
              </template>
            </el-table-column>
            <el-table-column prop="categoryRequirement" label="需求" width="80">
              <template #default="{ row }">
                <span
                  class="clickable-number"
                  :class="{ 'disabled': row.categoryRequirement === 0 }"
                  @click="row.categoryRequirement > 0 && goToTodo(row.projectId, 'category', '需求')"
                >{{ row.categoryRequirement }}</span>
              </template>
            </el-table-column>
            <el-table-column prop="categoryTask" label="事务" width="80">
              <template #default="{ row }">
                <span
                  class="clickable-number"
                  :class="{ 'disabled': row.categoryTask === 0 }"
                  @click="row.categoryTask > 0 && goToTodo(row.projectId, 'category', '事务')"
                >{{ row.categoryTask }}</span>
              </template>
            </el-table-column>
            <el-table-column prop="categoryIssue" label="问题" width="80">
              <template #default="{ row }">
                <span
                  class="clickable-number"
                  :class="{ 'disabled': row.categoryIssue === 0 }"
                  @click="row.categoryIssue > 0 && goToTodo(row.projectId, 'category', '问题')"
                >{{ row.categoryIssue }}</span>
              </template>
            </el-table-column>
          </el-table-column>
          <el-table-column prop="healthScore" label="健康度" width="100" align="center">
            <template #default="{ row }">
              <el-tag :type="getHealthType(row.healthStatus)">
                {{ row.healthScore }}分 - {{ row.healthStatus }}
              </el-tag>
            </template>
          </el-table-column>
        </el-table>
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useStore } from '@/stores'
import { ElMessage } from 'element-plus'

const router = useRouter()
const store = useStore()

// 跳转到待办事项页面
const goToTodo = (projectId, filterType = null, filterValue = null) => {
  // 跳转到待办事项页面，并传递项目ID和筛选参数
  const query = { project: projectId }
  if (filterType && filterValue) {
    query[filterType] = filterValue
  }
  router.push({
    path: '/todo',
    query
  })
}

// 跳转到待办事项页面（所有项目）
const goToTodoAll = (filterType = null, filterValue = null) => {
  // 跳转到待办事项页面，不传递项目ID，只传递筛选参数
  const query = {}
  if (filterType && filterValue) {
    query[filterType] = filterValue
  }
  router.push({
    path: '/todo',
    query
  })
}

const projects = computed(() => store.projects)
const tasks = computed(() => store.tasks)
const milestones = computed(() => store.milestones)

// 统计数据
const inProgressTasks = computed(() => {
  return tasks.value.filter(t => t.status === '进行中').length
})

const highPriorityTasks = computed(() => {
  return tasks.value.filter(t => t.priority === '高' && t.status !== '已完成').length
})

// 项目总览数据
const projectOverviewData = computed(() => {
  return projects.value.map(project => {
    const projectTasks = store.getTasksByProjectId(project.id)
    const milestone = store.getMilestoneByProjectId(project.id)
    const health = store.calculateProjectHealth(project.id)

    return {
      projectName: project.name,
      // 商业决策点
      cdc: milestone?.cdc || '-',
      pdc: milestone?.pdc || '-',
      adc: milestone?.adc || '-',
      ldc: milestone?.ldc || '-',
      // 技术决策点
      tr123: milestone?.tr123 || '-',
      tr4: milestone?.tr4 || '-',
      tr4a: milestone?.tr4a || '-',
      tr5: milestone?.tr5 || '-',
      tr6: milestone?.tr6 || '-',
      // 版本信息
      versionCount: milestone?.versions?.length || 0,
      versions: milestone?.versions || [],
      // 待办事项统计
      totalTasks: projectTasks.length,
      completedTasks: projectTasks.filter(t => t.status === '已完成').length,
      inProgressTasks: projectTasks.filter(t => t.status === '进行中').length,
      notStartedTasks: projectTasks.filter(t => t.status === '未开始').length,
      // 优先级分布
      highPriority: projectTasks.filter(t => t.priority === '高').length,
      mediumPriority: projectTasks.filter(t => t.priority === '中').length,
      lowPriority: projectTasks.filter(t => t.priority === '低').length,
      // 分类分布
      categoryVersion: projectTasks.filter(t => t.category === '版本').length,
      categoryRequirement: projectTasks.filter(t => t.category === '需求').length,
      categoryTask: projectTasks.filter(t => t.category === '事务').length,
      categoryIssue: projectTasks.filter(t => t.category === '问题').length,
      // 健康度
      healthScore: health.score,
      healthStatus: health.status
    }
  })
})

// 导出总览
const exportOverview = () => {
  const headers = [
    '项目名称',
    '待办总数', '已完成', '进行中', '未开始',
    '高优先级', '中优先级', '低优先级',
    '版本', '需求', '事务', '问题',
    '健康度分数', '健康状态'
  ]

  const data = projectOverviewData.value.map(row => [
    row.projectName,
    row.totalTasks, row.completedTasks, row.inProgressTasks, row.notStartedTasks,
    row.highPriority, row.mediumPriority, row.lowPriority,
    row.categoryVersion, row.categoryRequirement, row.categoryTask, row.categoryIssue,
    row.healthScore, row.healthStatus
  ])

  let csvContent = headers.join(',') + '\n'
  data.forEach(row => {
    csvContent += row.map(cell => `"${cell || ''}"`).join(',') + '\n'
  })

  const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  const url = URL.createObjectURL(blob)
  link.setAttribute('href', url)
  link.setAttribute('download', `项目总览_${new Date().toLocaleDateString()}.csv`)
  link.style.visibility = 'hidden'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)

  ElMessage.success('导出成功')
}

const getHealthType = (status) => {
  const map = { '良好': 'success', '一般': 'warning', '风险': 'danger' }
  return map[status] || ''
}
</script>

<style scoped>
.overview-container {
  padding: 20px;
}

.overview-card {
  max-width: 1800px;
  margin: 0 auto;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 18px;
  font-weight: bold;
}

.stats-row {
  margin-bottom: 30px;
}

.stat-card {
  cursor: default;
}

.stat-card.clickable-stat {
  cursor: pointer;
  transition: all 0.3s;
}

.stat-card.clickable-stat:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.stat-content {
  display: flex;
  align-items: center;
  gap: 15px;
}

.stat-icon {
  width: 60px;
  height: 60px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 28px;
}

.stat-info {
  flex: 1;

/* 可点击的数字样式 */
.clickable-number {
  cursor: pointer;
  color: var(--primary-color, #409EFF);
  transition: all 0.3s;
}

.clickable-number:hover {
  color: var(--primary-color, #66b1ff);
  text-decoration: underline;
}

.clickable-number.disabled {
  cursor: default;
  color: inherit;
  pointer-events: none;
}

/* 可点击的标签样式 */
.clickable-tag {
  cursor: pointer;
  transition: all 0.3s;
}

.clickable-tag:hover {
  opacity: 0.8;
  transform: scale(1.1);
}

.clickable-tag.disabled {
  cursor: default;
  pointer-events: none;
  opacity: 0.5;
}
}

.stat-value {
  font-size: 28px;
  font-weight: bold;
  color: var(--text-color);
}

.stat-value.disabled-stat {
  opacity: 0.5;
}

.stat-label {
  font-size: 14px;
  color: var(--text-color);
  opacity: 0.7;
  margin-top: 5px;
}

.overview-table-section {
  margin-top: 30px;
}

.overview-table-section h3 {
  margin-bottom: 20px;
  color: var(--text-color);
}
</style>
