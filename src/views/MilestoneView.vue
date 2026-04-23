<template>
  <div class="milestone-container">
    <el-card class="milestone-card">
      <template #header>
        <div class="card-header">
          <span>项目里程碑</span>
          <div class="filter-controls">
            <el-select
              v-model="selectedProjectIds"
              multiple
              collapse-tags
              collapse-tags-tooltip
              placeholder="筛选项目"
              style="width: 300px"
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
            <el-button type="warning" @click="handleResetData">重置数据</el-button>
          </div>
        </div>
      </template>

      <!-- 全部项目视图 -->
      <div class="all-projects-view">
        <div v-if="filteredProjects.length === 0" class="empty-projects">
          <el-empty description="没有选择项目,请选择要显示的项目" />
        </div>
        <div v-else class="projects-grid">
          <el-card
            v-for="project in filteredProjects"
            :key="project.id"
            class="project-milestone-card"
            shadow="hover"
          >
            <template #header>
              <div class="project-card-header">
                <h3>{{ project.name }}</h3>
                <div class="header-buttons">
                  <el-button type="info" size="small" @click="showEditMilestoneDialog(project.id)">
                    <el-icon><Edit /></el-icon>
                    编辑关键节点
                  </el-button>
                  <el-button type="primary" size="small" @click="showAddVersionDialog(project.id)">
                    <el-icon><Plus /></el-icon>
                    添加版本
                  </el-button>
                </div>
              </div>
            </template>

            <div class="project-milestone-content">
              <!-- 横向时间轴展示 -->
              <div class="project-timeline">
                <HorizontalTimeline
                  :key="`${project.id}-${timelineUpdateKey}`"
                  :items="allProjectTimelineItems[project.id] || []"
                  :project-id="project.id"
                  @edit-item="handleEditItem"
                  @delete-item="handleDeleteItem"
                />
              </div>
            </div>
          </el-card>
        </div>
      </div>
    </el-card>

    <!-- 添加/编辑版本对话框 -->
    <el-dialog v-model="versionDialogVisible" :title="versionDialogTitle" width="800px">
      <el-form :model="versionForm" label-width="100px">
        <el-form-item label="版本号">
          <el-input v-model="versionForm.version" placeholder="如：SP001" />
        </el-form-item>
        <el-form-item label="发布时间">
          <el-date-picker
            v-model="versionForm.releaseDate"
            type="date"
            placeholder="选择日期"
            format="YYYY/MM/DD"
            value-format="YYYY/MM/DD"
          />
        </el-form-item>
        <el-form-item label="关联事项">
          <div v-if="unclosedTasks.length === 0" class="empty-tasks">
            <el-empty description="暂无未完成的事项" :image-size="80" />
          </div>
          <div v-else class="tasks-list">
            <el-table
              ref="taskTableRef"
              :key="`task-table-${currentProjectId}-${unclosedTasks.length}-${versionDialogOpenCount}`"
              :data="unclosedTasks"
              style="width: 100%"
              max-height="400"
              @selection-change="handleTaskSelectionChange"
            >
              <el-table-column type="selection" width="55" />
              <el-table-column prop="name" label="事项名称" min-width="150" />
              <el-table-column prop="category" label="分类" width="80">
                <template #default="{ row }">
                  <el-tag size="small">{{ row.category }}</el-tag>
                </template>
              </el-table-column>
              <el-table-column prop="priority" label="优先级" width="80">
                <template #default="{ row }">
                  <el-tag
                    size="small"
                    :type="row.priority === '高' ? 'danger' : row.priority === '中' ? 'warning' : 'info'"
                  >
                    {{ row.priority }}
                  </el-tag>
                </template>
              </el-table-column>
              <el-table-column prop="progress" label="完成度" width="120">
                <template #default="{ row }">
                  <el-progress :percentage="row.progress" :stroke-width="15" />
                </template>
              </el-table-column>
              <el-table-column prop="ownerName" label="责任人" width="100" />
              <el-table-column prop="planDate" label="计划完成时间" width="120">
                <template #default="{ row }">
                  {{ row.planDate || '未设置' }}
                </template>
              </el-table-column>
            </el-table>
          </div>
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button v-if="editingVersionId" type="danger" @click="handleDeleteVersion">删除版本</el-button>
          <div>
            <el-button @click="versionDialogVisible = false">取消</el-button>
            <el-button type="primary" @click="saveVersion">确定</el-button>
          </div>
        </div>
      </template>
    </el-dialog>

    <!-- 编辑关键节点对话框 -->
    <el-dialog v-model="milestoneDialogVisible" :title="milestoneDialogTitle" width="650px">
      <el-form :model="milestoneForm" label-width="80px">
        <!-- 商业决策点部分 -->
        <el-divider content-position="left">
          <el-tag type="success" size="large">商业决策点</el-tag>
        </el-divider>
        <el-form-item label="CDCP">
          <el-tooltip content="概念决策" placement="top">
            <el-date-picker
              v-model="milestoneForm.cdc"
              type="date"
              placeholder="选择日期"
              format="YYYY/MM/DD"
              value-format="YYYY/MM/DD"
              style="width: 100%"
            />
          </el-tooltip>
        </el-form-item>
        <el-form-item label="PDCP">
          <el-tooltip content="计划决策" placement="top">
            <el-date-picker
              v-model="milestoneForm.pdc"
              type="date"
              placeholder="选择日期"
              format="YYYY/MM/DD"
              value-format="YYYY/MM/DD"
              style="width: 100%"
            />
          </el-tooltip>
        </el-form-item>
        <el-form-item label="ADCP">
          <el-tooltip content="可获得性决策" placement="top">
            <el-date-picker
              v-model="milestoneForm.adc"
              type="date"
              placeholder="选择日期"
              format="YYYY/MM/DD"
              value-format="YYYY/MM/DD"
              style="width: 100%"
            />
          </el-tooltip>
        </el-form-item>
        <el-form-item label="LDCP">
          <el-tooltip content="生命周期决策" placement="top">
            <el-date-picker
              v-model="milestoneForm.ldc"
              type="date"
              placeholder="选择日期"
              format="YYYY/MM/DD"
              value-format="YYYY/MM/DD"
              style="width: 100%"
            />
          </el-tooltip>
        </el-form-item>

        <!-- 技术评审点部分 -->
        <el-divider content-position="left">
          <el-tag type="primary" size="large">技术评审点</el-tag>
        </el-divider>
        <el-form-item label="TR123">
          <el-tooltip content="技术评审123" placement="top">
            <el-date-picker
              v-model="milestoneForm.tr123"
              type="date"
              placeholder="选择日期"
              format="YYYY/MM/DD"
              value-format="YYYY/MM/DD"
              style="width: 100%"
            />
          </el-tooltip>
        </el-form-item>
        <el-form-item label="TR4">
          <el-tooltip content="技术评审4" placement="top">
            <el-date-picker
              v-model="milestoneForm.tr4"
              type="date"
              placeholder="选择日期"
              format="YYYY/MM/DD"
              value-format="YYYY/MM/DD"
              style="width: 100%"
            />
          </el-tooltip>
        </el-form-item>
        <el-form-item label="TR4A">
          <el-tooltip content="技术评审4A" placement="top">
            <el-date-picker
              v-model="milestoneForm.tr4a"
              type="date"
              placeholder="选择日期"
              format="YYYY/MM/DD"
              value-format="YYYY/MM/DD"
              style="width: 100%"
            />
          </el-tooltip>
        </el-form-item>
        <el-form-item label="TR5">
          <el-tooltip content="技术评审5" placement="top">
            <el-date-picker
              v-model="milestoneForm.tr5"
              type="date"
              placeholder="选择日期"
              format="YYYY/MM/DD"
              value-format="YYYY/MM/DD"
              style="width: 100%"
            />
          </el-tooltip>
        </el-form-item>
        <el-form-item label="TR6">
          <el-tooltip content="技术评审6" placement="top">
            <el-date-picker
              v-model="milestoneForm.tr6"
              type="date"
              placeholder="选择日期"
              format="YYYY/MM/DD"
              value-format="YYYY/MM/DD"
              style="width: 100%"
            />
          </el-tooltip>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="milestoneDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="saveMilestone">确定</el-button>
      </template>
    </el-dialog>

    <!-- 编辑时间节点对话框 -->
    <el-dialog v-model="editDialogVisible" :title="editDialogTitle" width="400px">
      <el-form :model="editForm" label-width="80px">
        <el-form-item label="选择日期">
          <el-date-picker
            v-model="editForm.value"
            type="date"
            placeholder="选择日期"
            format="YYYY/MM/DD"
            value-format="YYYY/MM/DD"
            style="width: 100%"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="editDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="saveEditItem">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { useStore } from '@/stores'
import dayjs from 'dayjs'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, Edit } from '@element-plus/icons-vue'
import HorizontalTimeline from '@/components/HorizontalTimeline.vue'

const router = useRouter()
const store = useStore()

const projects = computed(() => store.projects)
const currentProjectId = ref(null)
const selectedProjectIds = ref([])

// 初始化数据
onMounted(async () => {
  await store.initData()
})

// 筛选后的项目
const filteredProjects = computed(() => {
  if (selectedProjectIds.value.length === 0) {
    return projects.value
  }
  return projects.value.filter(project => selectedProjectIds.value.includes(project.id))
})

// 版本相关
const versionDialogVisible = ref(false)
const versionDialogTitle = ref('添加版本')
const versionForm = ref({ id: null, version: '', releaseDate: '', tasks: [] })
const editingVersionId = ref(null)
const timelineUpdateKey = ref(0) // 用于强制更新时间轴
const taskTableRef = ref(null) // 表格引用，用于设置选中状态
const versionDialogOpenCount = ref(0) // 对话框打开次数计数器

// 监听版本对话框的打开，设置已选择的事项
watch(versionDialogVisible, (newVal, oldVal) => {
  console.log('versionDialogVisible watch 触发:', { newVal, oldVal, tasks: versionForm.value.tasks })

  if (newVal) {
    // 增加对话框打开次数
    versionDialogOpenCount.value++
    console.log('对话框打开次数:', versionDialogOpenCount.value)

    // 对话框打开时，延迟设置选中状态
    setTimeout(() => {
      console.log('setTimeout 执行, taskTableRef:', taskTableRef.value)
      console.log('versionForm.value.tasks:', versionForm.value.tasks)
      console.log('unclosedTasks.value:', unclosedTasks.value)

      if (taskTableRef.value) {
        // 先清空所有选择
        taskTableRef.value.clearSelection()
        console.log('已清空所有选择')

        // 如果有已选择的事项，设置选中状态
        if (versionForm.value.tasks && versionForm.value.tasks.length > 0) {
          console.log('准备设置选中状态, tasks数量:', versionForm.value.tasks.length)
          versionForm.value.tasks.forEach(taskId => {
            const task = unclosedTasks.value.find(t => t.id === taskId)
            console.log('查找任务:', { taskId, found: !!task, task })
            if (task) {
              taskTableRef.value.toggleRowSelection(task, true)
              console.log('设置选中:', task.name)
            } else {
              console.log('未找到任务，可能已被过滤或状态已改变')
            }
          })
        } else {
          console.log('没有已选择的事项')
        }
      } else {
        console.log('taskTableRef 不存在')
      }
    }, 100)
  }
})

// 创建一个computed来存储所有项目的时间轴数据，确保响应式更新
const allProjectTimelineItems = computed(() => {
  const itemsMap = {}
  // 确保projects.value存在且是数组
  if (projects.value && Array.isArray(projects.value)) {
    // 添加对milestones的依赖，确保当milestones变化时重新计算
    const milestonesData = store.milestones
    console.log('allProjectTimelineItems 重新计算, milestones:', milestonesData)

    projects.value.forEach(project => {
      itemsMap[project.id] = getProjectTimelineItems(project.id)
    })
  }
  return itemsMap
})

// 获取当前项目的任务列表
const projectTasks = computed(() => {
  if (!currentProjectId.value) return []
  return store.getTasksByProjectId(currentProjectId.value)
})

// 获取当前项目未关闭的事项列表（排除已被其他版本绑定的事项）
const unclosedTasks = computed(() => {
  if (!currentProjectId.value) return []
  const allTasks = store.getTasksByProjectId(currentProjectId.value)
  // 过滤出未关闭的事项（排除"已关闭"和"已完成"状态）
  const uncompletedTasks = allTasks.filter(task => task.status !== '已关闭' && task.status !== '已完成')

  // 如果是编辑版本，排除已被其他版本绑定的事项
  if (editingVersionId.value) {
    return uncompletedTasks.filter(task => {
      // 检查该事项是否被其他版本绑定（排除当前编辑的版本）
      const linkedStatus = store.isTaskLinkedToOtherVersions(task.id, editingVersionId.value)
      return !linkedStatus.isLinked
    })
  }

  // 如果是添加版本，排除已被任何版本绑定的事项
  return uncompletedTasks.filter(task => {
    const linkedStatus = store.isTaskLinkedToOtherVersions(task.id, null)
    return !linkedStatus.isLinked
  })
})

// 里程碑相关
const milestoneDialogVisible = ref(false)
const milestoneDialogTitle = ref('编辑关键节点')
const milestoneForm = ref({
  cdc: '',
  pdc: '',
  adc: '',
  ldc: '',
  tr123: '',
  tr4: '',
  tr4a: '',
  tr5: '',
  tr6: ''
})

// 显示添加版本对话框
const showAddVersionDialog = (projectId) => {
  currentProjectId.value = projectId
  versionDialogTitle.value = '添加版本'
  versionForm.value = { id: null, version: '', releaseDate: '', tasks: [] }
  editingVersionId.value = null
  versionDialogVisible.value = true
}

// 处理表格选择变化
const handleTaskSelectionChange = (selectedRows) => {
  versionForm.value.tasks = selectedRows.map(row => row.id)
}

// 显示编辑关键节点对话框
const showEditMilestoneDialog = (projectId) => {
  currentProjectId.value = projectId
  const project = store.getProjectById(projectId)
  const milestone = store.getMilestoneByProjectId(projectId)

  if (milestone) {
    milestoneForm.value = {
      cdc: milestone.cdc || '',
      pdc: milestone.pdc || '',
      adc: milestone.adc || '',
      ldc: milestone.ldc || '',
      tr123: milestone.tr123 || '',
      tr4: milestone.tr4 || '',
      tr4a: milestone.tr4a || '',
      tr5: milestone.tr5 || '',
      tr6: milestone.tr6 || ''
    }
  } else {
    milestoneForm.value = {
      cdc: '',
      pdc: '',
      adc: '',
      ldc: '',
      tr123: '',
      tr4: '',
      tr4a: '',
      tr5: '',
      tr6: ''
    }
  }

  // 设置对话框标题为项目名称
  milestoneDialogTitle.value = project ? `编辑关键节点 - ${project.name}` : '编辑关键节点'
  milestoneDialogVisible.value = true
}

// 保存关键节点
const saveMilestone = async () => {
  if (!currentProjectId.value) {
    ElMessage.warning('请先选择项目')
    return
  }

  const milestone = store.getMilestoneByProjectId(currentProjectId.value)
  if (!milestone) {
    // 如果不存在里程碑，创建一个新的
    const project = store.getProjectById(currentProjectId.value)
    await store.addMilestone({
      projectId: currentProjectId.value,
      projectName: project.name
    })
  }

  // 更新里程碑数据
  const currentMilestone = store.getMilestoneByProjectId(currentProjectId.value)
  if (currentMilestone) {
    // 检查是否有实际更新
    const fields = ['cdc', 'pdc', 'adc', 'ldc', 'tr123', 'tr4', 'tr4a', 'tr5', 'tr6']
    let hasChanges = false

    for (const field of fields) {
      const oldValue = currentMilestone[field] || ''
      const newValue = milestoneForm.value[field] || ''
      if (oldValue !== newValue) {
        hasChanges = true
        break
      }
    }

    if (hasChanges) {
      // 有更新，保存数据
      await store.updateMilestone(currentMilestone.id, milestoneForm.value)
      ElMessage.success('关键节点更新成功')
      milestoneDialogVisible.value = false
    } else {
      // 无更新，提示用户
      ElMessage.info('关键节点无时间更新')
    }
  }
}

// 处理项目筛选
const handleProjectFilter = () => {
  // 筛选逻辑已在computed中处理
}

// 显示全部项目
const showAllProjects = () => {
  selectedProjectIds.value = []
}

// 重置数据
const handleResetData = async () => {
  try {
    await ElMessageBox.confirm(
      '确定要重置所有数据吗？这将清除所有自定义数据并恢复为默认数据。',
      '重置数据',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )

    await store.resetToDefault()
    ElMessage.success('数据重置成功')
    // 重新加载页面以获取新数据
    setTimeout(() => {
      window.location.reload()
    }, 1000)
  } catch (error) {
    // 用户取消操作
  }
}

// 时间节点编辑相关
const editDialogVisible = ref(false)
const editDialogTitle = ref('')
const editForm = ref({ projectId: null, field: '', value: '' })
const editingItemProjectId = ref(null)

// 处理编辑时间节点
const handleEditItem = ({ projectId, field, value, type }) => {
  console.log('handleEditItem 被调用:', { projectId, field, value, type })
  editingItemProjectId.value = projectId
  currentProjectId.value = projectId

  // 判断是否是版本（通过field是否为数字ID来判断）
  const isVersion = typeof field === 'number' || !isNaN(parseInt(field, 10))
  console.log('是否是版本:', isVersion, 'field:', field)

  if (isVersion && type === 'warning') {
    // 编辑版本
    const milestone = store.getMilestoneByProjectId(projectId)
    const versionId = typeof field === 'string' ? parseInt(field, 10) : field
    const version = milestone.versions.find(v => v.id === versionId)
    if (version) {
      versionDialogTitle.value = '编辑版本'
      versionForm.value = {
        id: version.id,
        version: version.version,
        releaseDate: version.releaseDate,
        tasks: [...version.tasks]
      }
      editingVersionId.value = version.id
      versionDialogVisible.value = true
    }
  } else {
    // 编辑决策点
    editDialogTitle.value = `编辑${type === 'success' ? '商业' : '技术'}决策点`
    editForm.value = {
      projectId,
      field,
      value
    }
    editDialogVisible.value = true
  }
}

  // 保存编辑的时间节点
const saveEditItem = async () => {
  try {
    console.log('saveEditItem 被调用, editForm:', editForm.value)

    if (!editForm.value.value) {
      ElMessage.warning('请选择日期')
      return
    }

    const milestone = store.getMilestoneByProjectId(editForm.value.projectId)
    console.log('找到的里程碑:', milestone)

    if (!milestone) {
      ElMessage.error('里程碑不存在')
      return
    }

    // 更新决策点日期
    // 只传递需要更新的字段，避免重复合并整个对象
    const updateData = {
      [editForm.value.field]: editForm.value.value
    }
    console.log('准备更新里程碑:', { id: milestone.id, updateData })

    await store.updateMilestone(milestone.id, updateData)

    ElMessage.success('更新成功')
    editDialogVisible.value = false
  } catch (error) {
    console.error('saveEditItem 执行出错:', error)
    ElMessage.error('更新失败: ' + error.message)
  }
}

// 处理删除时间节点
const handleDeleteItem = ({ projectId, field, type }) => {
  console.log('handleDeleteItem 被调用:', { projectId, field, type })
  
  ElMessageBox.confirm('确定要删除这个时间节点吗?', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    console.log('用户确认删除')
    const milestone = store.getMilestoneByProjectId(projectId)
    if (!milestone) {
      console.log('里程碑不存在')
      ElMessage.error('里程碑不存在')
      return
    }

    console.log('找到里程碑:', milestone)

    // 判断是否是版本（通过field是否为数字ID来判断）
    const isVersion = typeof field === 'number' || !isNaN(parseInt(field, 10))
    console.log('是否是版本:', isVersion, 'field:', field, 'type:', type)

    if (isVersion && type === 'warning') {
      // 删除版本
      // field 可能是字符串，需要转换为数字
      const versionId = typeof field === 'string' ? parseInt(field, 10) : field
      console.log('准备删除版本:', { milestoneId: milestone.id, versionId, field })
      await store.deleteVersion(milestone.id, versionId)
      console.log('删除版本成功，当前里程碑:', milestone)
      ElMessage.success('版本删除成功')
      // 强制更新时间轴
      timelineUpdateKey.value++
      console.log('更新key:', timelineUpdateKey.value)
    } else {
      // 删除决策点
      // 只传递需要更新的字段
      await store.updateMilestone(milestone.id, {
        [field]: ''
      })
      ElMessage.success('删除成功')
    }
  }).catch(() => {
    // 用户取消删除
  })
}

const saveVersion = async () => {
  // 检查是否选择了项目
  if (!currentProjectId.value) {
    ElMessage.warning('请先选择项目')
    return
  }

  // 获取或创建里程碑
  let milestone = store.getMilestoneByProjectId(currentProjectId.value)
  if (!milestone) {
    const project = store.getProjectById(currentProjectId.value)
    milestone = await store.addMilestone({
      projectId: currentProjectId.value,
      projectName: project.name
    })
  }

  if (!versionForm.value.version.trim()) {
    ElMessage.warning('请输入版本号')
    return
  }

  if (!versionForm.value.releaseDate) {
    ElMessage.warning('请选择发布时间')
    return
  }

  // 检查版本号是否已存在(同一项目内)
  if (store.isVersionExists(currentProjectId.value, versionForm.value.version, editingVersionId.value)) {
    ElMessage.warning('版本号已存在,请使用其他版本号')
    return
  }

  // 编辑版本时，只检查版本号是否重复，不检查递增
  // 添加版本时，检查版本号数字是否递增
  if (!editingVersionId.value) {
    const versionCheck = store.isVersionNumberIncrement(
      currentProjectId.value,
      versionForm.value.version,
      editingVersionId.value
    )

    if (!versionCheck.isValid) {
      const conflictingVersion = versionCheck.conflictingVersion || '已存在的版本'
      ElMessage.warning(`版本号数字必须大于已存在的版本 ${conflictingVersion}`)
      return
    }
  }

  // 检查发布时间是否比之前版本晚
  if (!editingVersionId.value && milestone.versions.length > 0) {
    // 添加新版本时检查
    const latestVersion = [...milestone.versions].sort((a, b) =>
      dayjs(b.releaseDate).valueOf() - dayjs(a.releaseDate).valueOf()
    )[0]

    if (dayjs(versionForm.value.releaseDate).isBefore(dayjs(latestVersion.releaseDate))) {
      ElMessage.warning(`发布时间必须晚于之前版本 ${latestVersion.version} (${latestVersion.releaseDate})`)
      return
    }
  } else if (editingVersionId.value) {
    // 编辑版本时检查
    const originalVersion = milestone.versions.find(v => v.id === editingVersionId.value)

    // 检查时间顺序是否合理（给出警告但不阻止修改）
    const otherVersions = milestone.versions.filter(v => v.id !== editingVersionId.value)
    if (otherVersions.length > 0) {
      // 找出时间早于当前版本的其他版本
      const earlierVersions = otherVersions.filter(v =>
        dayjs(v.releaseDate).isAfter(dayjs(versionForm.value.releaseDate))
      )

      if (earlierVersions.length > 0) {
        // 有其他版本的时间晚于当前编辑的版本，给出提示但不阻止
        const versionList = earlierVersions.map(v => `${v.version} (${v.releaseDate})`).join(', ')
        console.log(`提示: 发布时间早于其他版本: ${versionList}`)
      }
    }
  }

  // 检查选择的事项是否已被其他版本关联
  const linkedTasks = store.checkTasksLinkedStatus(
    versionForm.value.tasks,
    editingVersionId.value // 编辑时排除当前版本
  )

  // 过滤出已被关联的事项
  const alreadyLinkedTasks = linkedTasks.filter(t => t.isLinked)

  if (alreadyLinkedTasks.length > 0) {
    // 有事项已被其他版本关联,显示警告
    const taskList = alreadyLinkedTasks.map(t =>
      `- ${t.taskName} (已关联到: ${t.versionInfo.milestoneName} - ${t.versionInfo.versionName})`
    ).join('\n')

    ElMessageBox.alert(
      `以下事项已被其他版本关联:\n${taskList}\n\n请先从原版本中移除这些事项,或取消关联。`,
      '无法关联',
      {
        confirmButtonText: '确定',
        type: 'warning'
      }
    )
    return
  }

  // 没有重复关联,可以保存
  if (editingVersionId.value) {
    await store.updateVersion(milestone.id, editingVersionId.value, {
      version: versionForm.value.version,
      releaseDate: versionForm.value.releaseDate,
      tasks: versionForm.value.tasks
    })
    ElMessage.success('版本更新成功')
  } else {
    await store.addVersion(milestone.id, {
      version: versionForm.value.version,
      releaseDate: versionForm.value.releaseDate,
      tasks: versionForm.value.tasks
    })
    ElMessage.success('版本添加成功')
  }

  versionDialogVisible.value = false
}

// 删除版本
const handleDeleteVersion = () => {
  ElMessageBox.confirm('确定要删除这个版本吗？删除后将无法恢复。', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    const milestone = store.getMilestoneByProjectId(currentProjectId.value)
    if (milestone) {
      await store.deleteVersion(milestone.id, editingVersionId.value)
      ElMessage.success('版本删除成功')
      versionDialogVisible.value = false
      // 强制更新时间轴
      timelineUpdateKey.value++
    }
  }).catch(() => {
    // 用户取消删除
  })
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

// 生成默认时间
const getDefaultDate = (monthsFromNow = 0) => {
  const date = dayjs().add(monthsFromNow, 'month')
  return date.format('YYYY/MM/DD')
}

// 获取项目的时间轴数据
const getProjectTimelineItems = (projectId) => {
  let milestone = store.getMilestoneByProjectId(projectId)

  // 如果没有里程碑数据,创建一个临时的空里程碑对象
  if (!milestone) {
    milestone = {
      id: null,
      projectId,
      cdc: null,
      pdc: null,
      adc: null,
      ldc: null,
      tr123: null,
      tr4: null,
      tr4a: null,
      tr5: null,
      tr6: null,
      versions: []
    }
  }

  const items = []

  // 商业决策点 - 放在时间轴上面，只有设置了日期才显示
  if (milestone.cdc) {
    items.push({
      id: `${projectId}-cdc`,
      title: 'CDCP',
      date: milestone.cdc,
      type: 'success',
      description: '概念决策检查点'
    })
  }

  if (milestone.pdc) {
    items.push({
      id: `${projectId}-pdc`,
      title: 'PDCP',
      date: milestone.pdc,
      type: 'success',
      description: '计划决策检查点'
    })
  }

  if (milestone.adc) {
    items.push({
      id: `${projectId}-adc`,
      title: 'ADCP',
      date: milestone.adc,
      type: 'success',
      description: '可获得性决策检查点'
    })
  }

  if (milestone.ldc) {
    items.push({
      id: `${projectId}-ldc`,
      title: 'LDCP',
      date: milestone.ldc,
      type: 'success',
      description: '生命周期决策检查点'
    })
  }

  // 软件版本 - 放在商业决策点和技术评审点之间
  if (milestone.versions && milestone.versions.length > 0) {
    milestone.versions.forEach(version => {
      items.push({
        id: `${projectId}-version-${version.id}`,
        title: `版本 ${version.version}`,
        date: version.releaseDate || '未设置',
        type: 'warning',
        description: `关联 ${version.tasks.length} 个事项`
      })
    })
  }

  // 技术评审点 - 放在时间轴下面，只有设置了日期才显示
  if (milestone.tr123) {
    items.push({
      id: `${projectId}-tr123`,
      title: 'TR123',
      date: milestone.tr123,
      type: 'primary',
      description: '技术评审123'
    })
  }

  if (milestone.tr4) {
    items.push({
      id: `${projectId}-tr4`,
      title: 'TR4',
      date: milestone.tr4,
      type: 'primary',
      description: '技术评审4'
    })
  }

  if (milestone.tr4a) {
    items.push({
      id: `${projectId}-tr4a`,
      title: 'TR4A',
      date: milestone.tr4a,
      type: 'primary',
      description: '技术评审4A'
    })
  }

  if (milestone.tr5) {
    items.push({
      id: `${projectId}-tr5`,
      title: 'TR5',
      date: milestone.tr5,
      type: 'primary',
      description: '技术评审5'
    })
  }

  if (milestone.tr6) {
    items.push({
      id: `${projectId}-tr6`,
      title: 'TR6',
      date: milestone.tr6,
      type: 'primary',
      description: '技术评审6'
    })
  }

  return items
}

</script>

<style scoped>
.milestone-container {
  padding: 20px;
}

.milestone-card {
  max-width: 1400px;
  margin: 0 auto;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 18px;
  font-weight: bold;
}

.project-card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
}

.header-buttons {
  display: flex;
  gap: 10px;
}

.filter-controls {
  display: flex;
  align-items: center;
  gap: 10px;
}

.empty-projects {
  padding: 40px 0;
  text-align: center;
}

.header-controls {
  display: flex;
  align-items: center;
  gap: 10px;
}

/* 全部项目视图样式 */
.all-projects-view {
  padding: 20px 0;
}

.projects-grid {
  display: flex;
  flex-direction: column;
  gap: 25px;
}

.project-milestone-card {
  transition: all 0.3s;
  width: 100%;
}

.project-milestone-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.15);
}

.project-card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.project-card-header h3 {
  margin: 0;
  font-size: 20px;
  font-weight: bold;
  color: var(--text-color);
}

.project-milestone-content {
  padding: 20px 0;
}

/* 时间轴样式 */
.project-timeline {
  padding: 0;
  min-height: 250px; /* 增加最小高度，确保有足够空间显示时间轴 */
}

/* 事项列表样式 */
.tasks-list {
  width: 100%;
}

.empty-tasks {
  padding: 20px 0;
  text-align: center;
}

/* 对话框footer样式 */
.dialog-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
}

/* 项目进度部分 */
.project-progress-section {
  margin-top: 30px;
  padding-top: 25px;
  border-top: 2px solid #e4e7ed;
}

.section-title {
  margin: 0 0 15px 0;
  font-size: 16px;
  font-weight: bold;
  color: var(--text-color);
  opacity: 0.9;
}

.progress-info {
  display: flex;
  justify-content: space-between;
  margin-top: 12px;
  font-size: 14px;
  color: var(--text-color);
  opacity: 0.8;
  padding: 0 10px;
}

.decision-points {
  margin-bottom: 30px;
}

.decision-points :deep(.el-form-item) {
  margin-bottom: 0;
}

.decision-points :deep(.el-form-item__label) {
  width: 70px;
  text-align: right;
  padding-right: 8px;
}

.decision-points :deep(.el-date-picker) {
  width: 100%;
}

.decision-points :deep(.el-row) {
  margin-bottom: 10px;
}

.version-management {
  margin-bottom: 30px;
}

.version-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
  margin-top: 20px;
}

.version-card {
  border: 2px solid transparent;
  transition: all 0.3s;
}

.version-card:hover {
  border-color: var(--primary-color);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.version-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.version-name {
  font-weight: bold;
  font-size: 16px;
}

.version-info p {
  margin: 5px 0;
  color: var(--text-color);
}

.timeline-section {
  margin-top: 30px;
}

.milestone-timeline {
  padding: 20px 0;
}

.timeline-card {
  min-width: 250px;
}

.timeline-card h4 {
  margin: 0 0 8px 0;
  color: var(--text-color);
}

.timeline-card p {
  margin: 5px 0;
  color: var(--text-color);
  opacity: 0.8;
}
</style>
