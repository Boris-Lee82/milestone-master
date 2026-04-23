<template>
  <div class="report-container">
    <!-- 筛选控制区 -->
    <el-card class="filter-card">
      <template #header>
        <div class="card-header">
          <span>项目筛选</span>
          <div class="filter-controls">
            <el-select
              v-model="selectedProjectIds"
              multiple
              collapse-tags
              collapse-tags-tooltip
              placeholder="选择要显示的项目"
              style="width: 400px"
              @change="handleProjectFilter"
            >
              <el-option
                v-for="project in projects"
                :key="project.id"
                :label="project.name"
                :value="project.id"
              />
            </el-select>
            <el-button @click="showAllProjects">显示全部</el-button>
          </div>
        </div>
      </template>
    </el-card>

    <!-- 项目报告列表 -->
    <div v-if="filteredProjects.length > 0" class="projects-reports">
      <el-card
        v-for="project in filteredProjects"
        :key="project.id"
        class="project-report-card"
        style="margin-top: 20px"
      >
        <template #header>
          <div class="card-header">
            <span>{{ project.name }}</span>
            <el-button @click="refreshWeeklyReport(project.id)" size="small">
              <el-icon><Refresh /></el-icon>
              刷新
            </el-button>
          </div>
        </template>

        <!-- 项目周报 -->
        <div class="weekly-report-content">
          <div class="report-section">
            <h3>本周一句话进展</h3>
            <el-input
              v-model="getWeeklyReportData(project.id).progress"
              type="textarea"
              :rows="8"
              placeholder="自动生成本周进展"
              @input="saveWeeklyReport(project.id)"
            />
            <div class="progress-tip">
              <el-icon><InfoFilled /></el-icon>
              <span>基于待办事项自动生成，可手动编辑</span>
            </div>
          </div>

          <div class="report-section">
            <h3>里程碑节点</h3>
            <div v-if="getFilteredMilestones(project.id).length > 0" class="milestone-list">
              <div
                v-for="item in getFilteredMilestones(project.id)"
                :key="item.id"
                class="milestone-item"
              >
                <div class="milestone-header">
                  <el-tag :type="getMilestoneTagType(item.type)" size="small">
                    {{ item.title }}
                  </el-tag>
                  <span class="milestone-date">{{ item.date }}</span>
                </div>
                <div class="milestone-description">{{ item.description }}</div>
              </div>
            </div>
            <el-empty v-else description="暂无相关里程碑节点" :image-size="80" />
          </div>

          <div class="report-section">
            <h3>关键风险与问题</h3>
            <el-table :data="getWeeklyReportData(project.id).risks" stripe>
              <el-table-column prop="type" label="类型" width="100" />
              <el-table-column prop="description" label="描述" />
              <el-table-column prop="severity" label="严重程度" width="100">
                <template #default="{ row }">
                  <el-tag :type="row.severity === '高' ? 'danger' : row.severity === '中' ? 'warning' : 'info'">
                    {{ row.severity }}
                  </el-tag>
                </template>
              </el-table-column>
              <el-table-column prop="owner" label="负责人" width="100" />
              <el-table-column label="操作" width="100">
                <template #default="{ $index }">
                  <el-button size="small" type="danger" @click="removeRisk(project.id, $index)">删除</el-button>
                </template>
              </el-table-column>
            </el-table>
            <div v-if="getWeeklyReportData(project.id).risks.length === 0" class="no-risks-tip">
              <el-icon><CircleCheck /></el-icon>
              <span>暂无风险与问题</span>
            </div>
          </div>
        </div>
      </el-card>
    </div>

    <el-empty v-else description="请选择项目查看报告" />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useStore } from '@/stores'
import dayjs from 'dayjs'

const store = useStore()

const projects = computed(() => store.projects)
const selectedProjectIds = ref([])

// 筛选后的项目
const filteredProjects = computed(() => {
  if (selectedProjectIds.value.length === 0) {
    return projects.value
  }
  return projects.value.filter(project => selectedProjectIds.value.includes(project.id))
})

// 周报数据存储
const weeklyReports = ref(new Map())

// 获取周报数据
const getWeeklyReportData = (projectId) => {
  if (!weeklyReports.value.has(projectId)) {
    weeklyReports.value.set(projectId, {
      progress: '',
      risks: []
    })
  }
  return weeklyReports.value.get(projectId)
}

// 获取过滤后的里程碑节点
const getFilteredMilestones = (projectId) => {
  const milestone = store.getMilestoneByProjectId(projectId)
  if (!milestone) return []

  const items = []
  const now = dayjs()
  const thisWeekStart = now.startOf('week')
  const thisWeekEnd = now.endOf('week')
  const nextWeekStart = now.add(1, 'week').startOf('week')
  const nextWeekEnd = now.add(1, 'week').endOf('week')

  // 收集所有关键节点（技术决策点 + 商业决策点）
  const keyPoints = [
    { name: 'CDC', date: milestone.cdc, type: 'business' },
    { name: 'PDC', date: milestone.pdc, type: 'business' },
    { name: 'ADC', date: milestone.adc, type: 'business' },
    { name: 'LDC', date: milestone.ldc, type: 'business' },
    { name: 'TR123', date: milestone.tr123, type: 'review' },
    { name: 'TR4', date: milestone.tr4, type: 'review' },
    { name: 'TR4A', date: milestone.tr4a, type: 'review' },
    { name: 'TR5', date: milestone.tr5, type: 'review' },
    { name: 'TR6', date: milestone.tr6, type: 'review' }
  ]

  // 收集版本
  const versions = milestone.versions.map(v => ({
    name: `版本 ${v.version}`,
    date: v.releaseDate,
    type: 'version'
  }))

  // 过滤本周和下周的关键节点
  const thisAndNextWeekKeyPoints = keyPoints
    .filter(p => p.date && (
      (dayjs(p.date).isSameOrAfter(thisWeekStart) && dayjs(p.date).isSameOrBefore(thisWeekEnd)) ||
      (dayjs(p.date).isSameOrAfter(nextWeekStart) && dayjs(p.date).isSameOrBefore(nextWeekEnd))
    ))
    .sort((a, b) => dayjs(a.date).valueOf() - dayjs(b.date).valueOf())

  // 过滤本周和下周的版本发布
  const thisAndNextWeekVersions = versions
    .filter(v => v.date && (
      (dayjs(v.date).isSameOrAfter(thisWeekStart) && dayjs(v.date).isSameOrBefore(thisWeekEnd)) ||
      (dayjs(v.date).isSameOrAfter(nextWeekStart) && dayjs(v.date).isSameOrBefore(nextWeekEnd))
    ))
    .sort((a, b) => dayjs(a.date).valueOf() - dayjs(b.date).valueOf())

  // 如果本周和下周有关键节点或版本发布，显示它们
  if (thisAndNextWeekKeyPoints.length > 0 || thisAndNextWeekVersions.length > 0) {
    // 添加关键节点
    thisAndNextWeekKeyPoints.forEach(p => {
      items.push({
        id: p.name,
        title: p.name,
        date: p.date,
        description: dayjs(p.date).isBefore(now) ? '已完成' : '计划中',
        type: p.type === 'business' ? 'success' : 'primary' // 商业决策点用success,技术评审点用primary
      })
    })

    // 添加版本发布
    thisAndNextWeekVersions.forEach(v => {
      items.push({
        id: v.name,
        title: v.name,
        date: v.date,
        description: '计划发布',
        type: 'warning' // 版本用warning
      })
    })

    // 按日期排序
    return items.sort((a, b) => dayjs(a.date).valueOf() - dayjs(b.date).valueOf())
  }

  // 如果本周和下周没有关键节点和版本发布，显示下一个最近的关键节点
  const futureKeyPoints = keyPoints
    .filter(p => p.date && dayjs(p.date).isAfter(now))
    .sort((a, b) => dayjs(a.date).valueOf() - dayjs(b.date).valueOf())

  if (futureKeyPoints.length > 0) {
    const nextKeyPoint = futureKeyPoints[0]
    items.push({
      id: nextKeyPoint.name,
      title: nextKeyPoint.name,
      date: nextKeyPoint.date,
      description: '下一个关键节点',
      type: nextKeyPoint.type === 'business' ? 'success' : 'primary'
    })
  }

  return items
}

// 自动生成本周进展(基于待办事项更新)
const generateWeeklyProgress = (projectId) => {
  const project = store.getProjectById(projectId)
  const projectTasks = store.getTasksByProjectId(projectId)

  if (!projectTasks || projectTasks.length === 0) {
    return `${project.name}本周暂无待办事项更新。`
  }

  // 查找有进展且优先级为高或中的任务
  const updatedTasks = projectTasks.filter(task => {
    // 只关注高或中优先级的任务
    if (task.priority !== '高' && task.priority !== '中') return false

    // 只关注有进展的任务(进行中或已完成)
    if (task.status === '未开始') return false

    return true
  })

  if (updatedTasks.length === 0) {
    return `${project.name}本周暂无高优先级或中优先级待办事项进展。`
  }

  // 生成每个事项的详细信息,每项占一行
  const taskDetails = updatedTasks.map(task => {
    const progressText = task.progress > 0 ? `(${task.progress}%)` : ''
    const planTime = task.planDate ? ` 计划完成时间:${task.planDate}` : ''
    const owner = task.ownerName ? ` 责任人:${task.ownerName}` : ''
    return `${task.name}${progressText}${planTime}${owner}`
  }).join('\n')

  return `${project.name}本周进展：\n${taskDetails}`
}

// 自动生成风险列表(高优先级、超期或即将超期)
const generateRiskList = (projectId) => {
  const project = store.getProjectById(projectId)
  const projectTasks = store.getTasksByProjectId(projectId)
  const risks = []
  const now = dayjs()
  const thisWeekEnd = now.endOf('week')

  // 查找超期任务
  const overdueTasks = projectTasks.filter(t => {
    if (!t.planDate || t.status === '已完成') return false
    const planDate = dayjs(`2026/${t.planDate}`)
    return now.isAfter(planDate)
  })

  overdueTasks.forEach(task => {
    risks.push({
      type: '进度风险',
      description: `任务"${task.name}"已逾期，计划完成时间：${task.planDate}，当前状态：${task.status}`,
      severity: '高',
      owner: task.ownerName
    })
  })

  // 查找即将超期的任务(本周内)
  const nearOverdueTasks = projectTasks.filter(t => {
    if (!t.planDate || t.status === '已完成' || t.status === '未开始') return false
    const planDate = dayjs(`2026/${t.planDate}`)
    return planDate.isAfter(now) && planDate.isSameOrBefore(thisWeekEnd)
  })

  nearOverdueTasks.forEach(task => {
    risks.push({
      type: '进度风险',
      description: `任务"${task.name}"即将到期，计划完成时间：${task.planDate}，当前状态：${task.status}`,
      severity: '中',
      owner: task.ownerName
    })
  })

  // 查找高优先级未开始的任务
  const highPriorityNotStarted = projectTasks.filter(t =>
    t.priority === '高' && t.status === '未开始'
  )

  highPriorityNotStarted.forEach(task => {
    risks.push({
      type: '资源风险',
      description: `高优先级任务"${task.name}"尚未开始，需尽快安排资源`,
      severity: '高',
      owner: task.ownerName
    })
  })

  // 查找进行中但进度滞后的高优先级任务
  const laggingHighPriorityTasks = projectTasks.filter(t =>
    t.priority === '高' && t.status === '进行中' && t.progress < 30
  )

  laggingHighPriorityTasks.forEach(task => {
    risks.push({
      type: '进度风险',
      description: `高优先级任务"${task.name}"进度滞后（低于30%），需要关注`,
      severity: '高',
      owner: task.ownerName
    })
  })

  return risks
}

// 周报存储键
const getWeeklyReportKey = (projectId) => `weeklyReport_${projectId}`

// 加载周报
const loadWeeklyReport = (projectId) => {
  const key = getWeeklyReportKey(projectId)
  const saved = localStorage.getItem(key)

  // 自动生成内容
  const autoProgress = generateWeeklyProgress(projectId)
  const autoRisks = generateRiskList(projectId)

  if (saved) {
    const savedData = JSON.parse(saved)
    weeklyReports.value.set(projectId, {
      progress: savedData.progress || autoProgress, // 优先使用保存的进展,如果没有则使用自动生成的
      risks: savedData.risks.length > 0 ? savedData.risks : autoRisks // 如果没有保存的风险,使用自动生成的
    })
  } else {
    weeklyReports.value.set(projectId, {
      progress: autoProgress,
      risks: autoRisks
    })
  }
}

// 保存周报
const saveWeeklyReport = (projectId) => {
  const key = getWeeklyReportKey(projectId)
  const reportData = weeklyReports.value.get(projectId)
  
  // 保存时确保数据完整性
  const dataToSave = {
    progress: reportData.progress,
    risks: reportData.risks || []
  }
  
  localStorage.setItem(key, JSON.stringify(dataToSave))
}

// 刷新周报(重新生成自动内容)
const refreshWeeklyReport = (projectId) => {
  // 重新生成进展
  const autoProgress = generateWeeklyProgress(projectId)
  const report = getWeeklyReportData(projectId)
  
  // 只更新进展,保留手动添加的风险
  report.progress = autoProgress
  saveWeeklyReport(projectId)
}

// 项目筛选
const handleProjectFilter = () => {
  // 筛选逻辑已在computed中处理
}

// 显示全部项目
const showAllProjects = () => {
  selectedProjectIds.value = []
}

// 删除风险
const removeRisk = (projectId, index) => {
  const report = getWeeklyReportData(projectId)
  report.risks.splice(index, 1)
  
  // 如果删除后没有风险了,重新生成风险列表
  if (report.risks.length === 0) {
    report.risks = generateRiskList(projectId)
  }
  
  saveWeeklyReport(projectId)
}

// 获取里程碑标签类型
const getMilestoneTagType = (type) => {
  const typeMap = {
    'success': 'success',  // 商业决策点 - 绿色
    'primary': 'primary',  // 技术评审点 - 蓝色
    'warning': 'warning'   // 软件版本 - 橙色
  }
  return typeMap[type] || 'info'
}

// 初始化
onMounted(() => {
  // 加载所有项目的周报数据
  projects.value.forEach(project => {
    loadWeeklyReport(project.id)
  })
})
</script>

<style scoped>
.report-container {
  padding: 20px;
}

.filter-card {
  margin-bottom: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 16px;
  font-weight: bold;
}

.filter-controls {
  display: flex;
  gap: 10px;
  align-items: center;
}

.project-report-card {
  margin-bottom: 20px;
}

.weekly-report-content {
  padding: 10px 0;
}

.report-section {
  margin-bottom: 30px;
}

.report-section h3 {
  margin-bottom: 15px;
  color: var(--text-color);
}

.progress-tip {
  margin-top: 10px;
  padding: 10px;
  background: var(--hover-bg);
  border-radius: 4px;
  display: flex;
  align-items: center;
  gap: 8px;
  color: var(--text-color);
  font-size: 14px;
}

.progress-tip .el-icon {
  color: var(--primary-color);
}

.no-risks-tip {
  margin-top: 20px;
  padding: 20px;
  text-align: center;
  color: #67C23A;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
}

.no-risks-tip .el-icon {
  font-size: 32px;
}

.milestone-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.milestone-item {
  padding: 12px 16px;
  background: var(--hover-bg, #f5f7fa);
  border-radius: 6px;
  border-left: 3px solid var(--primary-color, #409EFF);
  transition: all 0.3s;
}

.milestone-item:hover {
  background: var(--border-color, #e4e7ed);
  transform: translateX(4px);
}

.milestone-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 6px;
}

.milestone-date {
  font-size: 13px;
  color: var(--text-color-secondary, #909399);
  font-weight: 500;
}

.milestone-description {
  font-size: 13px;
  color: var(--text-color-regular, #606266);
  line-height: 1.5;
}
</style>
