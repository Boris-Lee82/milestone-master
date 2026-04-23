import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import dayjs from 'dayjs'
import dbHelper from '@/utils/indexedDB'

// 默认数据
const defaultProjects = [
  { id: 1, name: '项目 A' },
  { id: 2, name: '项目 B' },
  { id: 3, name: '项目 C' }
]

const defaultOwners = [
  { id: 1, name: '张三' },
  { id: 2, name: '李四' },
  { id: 3, name: '王五' }
]

const defaultMilestones = [
  {
    id: 1,
    projectId: 1,
    projectName: '项目 A',
    cdc: '2026/01/15',
    pdc: '2026/03/20',
    adc: '2026/06/25',
    ldc: '2026/09/30',
    tr123: '2026/02/01',
    tr4: '2026/04/15',
    tr4a: '2026/05/01',
    tr5: '2026/06/15',
    tr6: '2026/08/01',
    versions: [
      {
        id: 1,
        version: 'SP001',
        releaseDate: '2026/03/10',
        tasks: [1, 2]
      },
      {
        id: 2,
        version: 'SP002',
        releaseDate: '2026/05/20',
        tasks: [3]
      }
    ]
  },
  {
    id: 2,
    projectId: 2,
    projectName: '项目 B',
    cdc: '2026/02/01',
    pdc: '2026/04/15',
    adc: '2026/07/20',
    ldc: '2026/10/30',
    tr123: '2026/02/20',
    tr4: '2026/05/10',
    tr4a: '2026/05/25',
    tr5: '2026/07/10',
    tr6: '2026/09/15',
    versions: [
      {
        id: 3,
        version: 'SP001',
        releaseDate: '2026/04/05',
        tasks: []
      }
    ]
  },
  {
    id: 3,
    projectId: 3,
    projectName: '项目 C',
    cdc: '2026/03/01',
    pdc: '2026/05/20',
    adc: '2026/08/25',
    ldc: '2026/11/30',
    tr123: '2026/03/15',
    tr4: '2026/06/20',
    tr4a: '2026/07/05',
    tr5: '2026/08/15',
    tr6: '2026/10/20',
    versions: [
      {
        id: 4,
        version: 'SP001',
        releaseDate: '2026/05/15',
        tasks: []
      },
      {
        id: 5,
        version: 'SP002',
        releaseDate: '2026/07/30',
        tasks: []
      }
    ]
  }
]

const defaultTasks = [
  {
    id: 1,
    name: '需求分析与设计',
    projectId: 1,
    projectName: '项目 A',
    category: '需求',
    priority: '高',
    status: '已完成',
    progress: 100,
    ownerId: 1,
    ownerName: '张三',
    planDate: '2026/02/28',
    actualDate: '2026/02/25',
    progressText: '已完成需求调研和架构设计',
    remark: '按时完成，质量良好'
  },
  {
    id: 2,
    name: '核心功能开发',
    projectId: 1,
    projectName: '项目 A',
    category: '事务',
    priority: '高',
    status: '进行中',
    progress: 65,
    ownerId: 2,
    ownerName: '李四',
    planDate: '2026/03/15',
    actualDate: '',
    progressText: '完成用户管理、订单模块，正在开发支付模块',
    remark: '进度正常，预计按时完成'
  },
  {
    id: 3,
    name: '性能优化问题修复',
    projectId: 1,
    projectName: '项目 A',
    category: '问题',
    priority: '中',
    status: '未开始',
    progress: 0,
    ownerId: 3,
    ownerName: '王五',
    planDate: '2026/05/30',
    actualDate: '',
    progressText: '',
    remark: '等待SP002发布后启动'
  }
]

export const useStore = defineStore('main', () => {
  // 配置数据
  const theme = ref('default')
  const visiblePages = ref(['milestone', 'todo', 'overview', 'report']) // 默认数据管理不显示
  const projects = ref([])
  const owners = ref([])

  // 业务数据
  const milestones = ref([])
  const tasks = ref([])

  // 辅助函数：创建可序列化的里程碑对象
  const createSerializableMilestone = (milestone) => {
    return JSON.parse(JSON.stringify(milestone))
  }

  // 初始化数据
  const initData = async () => {
    try {
      // 初始化数据库
      await dbHelper.init()

      // 从数据库加载数据
      const dbProjects = await dbHelper.getAll('projects')
      const dbOwners = await dbHelper.getAll('owners')
      const dbMilestones = await dbHelper.getAll('milestones')
      const dbTasks = await dbHelper.getAll('tasks')
      const dbTheme = await dbHelper.getSetting('theme')

      console.log('从IndexedDB加载的里程碑数据:', dbMilestones)

      // 如果数据库为空,使用默认数据
      if (dbProjects.length === 0) {
        await dbHelper.addBatch('projects', defaultProjects)
        projects.value = defaultProjects
      } else {
        projects.value = dbProjects
      }

      if (dbOwners.length === 0) {
        await dbHelper.addBatch('owners', defaultOwners)
        owners.value = defaultOwners
      } else {
        owners.value = dbOwners
      }

      if (dbMilestones.length === 0) {
        await dbHelper.addBatch('milestones', defaultMilestones)
        milestones.value = defaultMilestones
      } else {
        milestones.value = dbMilestones
      }

      if (dbTasks.length === 0) {
        await dbHelper.addBatch('tasks', defaultTasks)
        tasks.value = defaultTasks
      } else {
        tasks.value = dbTasks
      }

      theme.value = dbTheme || 'default'
      document.body.className = `theme-${theme.value}`

      // 数据迁移：将 tr1, tr2, tr3 合并为 tr123
      let needsMigration = false
      const milestonesToMigrate = []
      milestones.value.forEach(milestone => {
        // 只有当tr123不存在，且tr1/tr2/tr3存在时才迁移
        if (!milestone.tr123 && (milestone.tr1 || milestone.tr2 || milestone.tr3)) {
          const dates = [milestone.tr1, milestone.tr2, milestone.tr3].filter(d => d)
          if (dates.length > 0) {
            milestone.tr123 = dates[0]
            needsMigration = true
          }
        }

        // 删除旧的tr1, tr2, tr3字段（无论是否迁移）
        if (milestone.tr1 || milestone.tr2 || milestone.tr3) {
          delete milestone.tr1
          delete milestone.tr2
          delete milestone.tr3
          milestonesToMigrate.push(milestone)
        }
      })

      if (needsMigration || milestonesToMigrate.length > 0) {
        // 保存所有需要迁移或清理的里程碑
        for (const milestone of milestonesToMigrate) {
          await dbHelper.put('milestones', createSerializableMilestone(milestone))
        }
      }
    } catch (error) {
      console.error('初始化数据失败:', error)
      // 如果数据库初始化失败,使用内存数据
      projects.value = defaultProjects
      owners.value = defaultOwners
      milestones.value = defaultMilestones
      tasks.value = defaultTasks
    }
  }

  // 保存数据到数据库
  const saveData = async () => {
    try {
      // 数据已经在各个操作中直接保存到数据库了
      // 这个方法保留用于兼容性
    } catch (error) {
      console.error('保存数据失败:', error)
    }
  }

  // 主题相关
  const setTheme = async (newTheme) => {
    theme.value = newTheme
    document.body.className = `theme-${newTheme}`
    await dbHelper.saveSetting('theme', newTheme)
  }

  // 页面可见性相关
  const updatePageVisibility = (pages) => {
    visiblePages.value = pages
  }

  const isPageVisible = (pageName) => {
    return visiblePages.value.includes(pageName)
  }

  // 项目相关
  const addProject = async (name) => {
    // 检查项目名称是否已存在
    const exists = projects.value.some(p => p.name === name)
    if (exists) {
      return null
    }

    const newProject = {
      id: Date.now(),
      name
    }
    projects.value.push(newProject)
    await dbHelper.add('projects', newProject)
    return newProject
  }

  const deleteProject = async (id) => {
    projects.value = projects.value.filter(p => p.id !== id)
    await dbHelper.delete('projects', id)
  }

  const updateProject = async (id, name) => {
    const project = projects.value.find(p => p.id === id)
    if (project) {
      // 检查项目名称是否已存在(排除自己)
      const exists = projects.value.some(p => p.name === name && p.id !== id)
      if (exists) {
        return false
      }
      project.name = name
      await dbHelper.put('projects', project)
      return true
    }
    return false
  }

  // 责任人相关
  const addOwner = async (name) => {
    // 检查责任人姓名是否已存在
    const exists = owners.value.some(o => o.name === name)
    if (exists) {
      return null
    }

    const newOwner = {
      id: Date.now(),
      name
    }
    owners.value.push(newOwner)
    await dbHelper.add('owners', newOwner)
    return newOwner
  }

  const deleteOwner = async (id) => {
    owners.value = owners.value.filter(o => o.id !== id)
    await dbHelper.delete('owners', id)
  }

  const updateOwner = async (id, name) => {
    const owner = owners.value.find(o => o.id === id)
    if (owner) {
      // 检查责任人姓名是否已存在(排除自己)
      const exists = owners.value.some(o => o.name === name && o.id !== id)
      if (exists) {
        return false
      }
      owner.name = name
      await dbHelper.put('owners', owner)
      return true
    }
    return false
  }

  // 里程碑相关
  const addMilestone = async (milestone) => {
    // 验证必要字段
    if (!milestone.projectId) {
      console.error('添加里程碑失败: 缺少projectId', milestone)
      throw new Error('缺少必要字段: projectId')
    }

    const newMilestone = {
      id: Date.now(),
      projectId: Number(milestone.projectId),
      versions: milestone.versions || []
    }
    
    console.log('准备添加里程碑:', newMilestone)
    milestones.value.push(newMilestone)
    await dbHelper.add('milestones', newMilestone)
    return newMilestone
  }

  const updateMilestone = async (id, data) => {
    console.log('updateMilestone 被调用:', { id, data })
    const index = milestones.value.findIndex(m => m.id === id)
    if (index !== -1) {
      console.log('更新前的里程碑:', milestones.value[index])

      // 合并数据
      const updatedMilestone = { ...milestones.value[index], ...data }
      console.log('更新后的里程碑:', updatedMilestone)

      // 更新内存中的数据
      milestones.value[index] = updatedMilestone

      // 创建可序列化对象并保存到IndexedDB
      const milestoneToSave = createSerializableMilestone(updatedMilestone)
      console.log('准备保存到IndexedDB的里程碑:', milestoneToSave)
      await dbHelper.put('milestones', milestoneToSave)
      console.log('IndexedDB保存完成')
    } else {
      console.log('未找到里程碑:', id)
    }
  }

  const deleteMilestone = async (id) => {
    milestones.value = milestones.value.filter(m => m.id !== id)
    await dbHelper.delete('milestones', id)
  }

  // 版本相关
  const addVersion = async (milestoneId, versionData) => {
    // 验证必要字段
    if (!versionData.version || !versionData.releaseDate) {
      console.error('添加版本失败: 缺少必要字段', versionData)
      throw new Error('缺少必要字段: version, releaseDate')
    }

    const milestone = milestones.value.find(m => m.id === milestoneId)
    if (milestone) {
      const newVersion = {
        id: Date.now(),
        version: versionData.version,
        releaseDate: versionData.releaseDate,
        tasks: versionData.tasks || []
      }
      
      console.log('准备添加版本:', newVersion)
      milestone.versions.push(newVersion)
      await dbHelper.put('milestones', createSerializableMilestone(milestone))
      return newVersion
    }
  }

  const deleteVersion = async (milestoneId, versionId) => {
    console.log('deleteVersion 开始:', { milestoneId, versionId })
    console.log('删除前的milestones:', milestones.value)

    const milestone = milestones.value.find(m => m.id === milestoneId)
    if (milestone) {
      console.log('找到里程碑:', milestone)
      console.log('删除前的versions:', milestone.versions)

      // 过滤掉要删除的版本
      const newVersions = milestone.versions.filter(v => v.id !== versionId)
      console.log('删除后的versions:', newVersions)

      // 使用索引更新来触发响应式更新
      const index = milestones.value.findIndex(m => m.id === milestoneId)
      if (index !== -1) {
        // 创建一个新的里程碑对象来确保响应式更新
        const updatedMilestone = {
          ...milestones.value[index],
          versions: [...newVersions] // 创建新数组引用
        }
        milestones.value[index] = updatedMilestone
        await dbHelper.put('milestones', createSerializableMilestone(updatedMilestone))
        console.log('数据库更新完成')
      }
    } else {
      console.log('未找到里程碑:', milestoneId)
    }

    console.log('deleteVersion 结束，更新后的milestones:', milestones.value)
  }

  const updateVersion = async (milestoneId, versionId, data) => {
    const milestone = milestones.value.find(m => m.id === milestoneId)
    if (milestone) {
      const version = milestone.versions.find(v => v.id === versionId)
      if (version) {
        Object.assign(version, data)
        await dbHelper.put('milestones', createSerializableMilestone(milestone))
      }
    }
  }

  // 待办事项相关
  const addTask = async (taskData) => {
    // 验证必要字段
    if (!taskData.name || !taskData.projectId || !taskData.ownerId) {
      console.error('添加任务失败: 缺少必要字段', taskData)
      throw new Error('缺少必要字段: name, projectId, ownerId')
    }

    const newTask = {
      id: Date.now(),
      name: taskData.name,
      projectId: Number(taskData.projectId),
      projectName: taskData.projectName || '',
      category: taskData.category || '',
      priority: taskData.priority || '',
      status: taskData.status || '',
      progress: Number(taskData.progress) || 0,
      ownerId: Number(taskData.ownerId),
      ownerName: taskData.ownerName || '',
      planDate: taskData.planDate || '',
      actualDate: taskData.actualDate || '',
      progressText: taskData.progressText || '',
      remark: taskData.remark || ''
    }
    
    console.log('准备保存到IndexedDB的任务:', newTask)
    tasks.value.push(newTask)
    await dbHelper.add('tasks', newTask)
    return newTask
  }

  const updateTask = async (id, data) => {
    const index = tasks.value.findIndex(t => t.id === id)
    if (index !== -1) {
      const updatedTask = {
        id: id,
        name: data.name || tasks.value[index].name,
        projectId: Number(data.projectId) || tasks.value[index].projectId,
        projectName: data.projectName || tasks.value[index].projectName,
        category: data.category || tasks.value[index].category,
        priority: data.priority || tasks.value[index].priority,
        status: data.status || tasks.value[index].status,
        progress: Number(data.progress) || tasks.value[index].progress,
        ownerId: Number(data.ownerId) || tasks.value[index].ownerId,
        ownerName: data.ownerName || tasks.value[index].ownerName,
        planDate: data.planDate !== undefined ? data.planDate : tasks.value[index].planDate,
        actualDate: data.actualDate !== undefined ? data.actualDate : tasks.value[index].actualDate,
        progressText: data.progressText !== undefined ? data.progressText : tasks.value[index].progressText,
        remark: data.remark !== undefined ? data.remark : tasks.value[index].remark
      }
      
      console.log('更新任务:', updatedTask)
      tasks.value[index] = updatedTask
      await dbHelper.put('tasks', updatedTask)
    }
  }

  const deleteTask = async (id) => {
    // 从所有版本中移除该任务ID
    for (const milestone of milestones.value) {
      for (const version of milestone.versions) {
        version.tasks = version.tasks.filter(taskId => taskId !== id)
      }
      await dbHelper.put('milestones', createSerializableMilestone(milestone))
    }

    // 删除任务
    tasks.value = tasks.value.filter(t => t.id !== id)
    await dbHelper.delete('tasks', id)
  }

  const getTasksByVersion = (versionId) => {
    // 查找包含该版本ID的里程碑，然后返回该版本关联的任务
    for (const milestone of milestones.value) {
      const version = milestone.versions.find(v => v.id === versionId)
      if (version) {
        return tasks.value.filter(t => version.tasks.includes(t.id))
      }
    }
    return []
  }

  // 查找包含特定事项的所有版本
  const getVersionsByTaskId = (taskId) => {
    const result = []
    for (const milestone of milestones.value) {
      for (const version of milestone.versions) {
        if (version.tasks.includes(taskId)) {
          result.push({
            milestoneId: milestone.id,
            milestoneName: milestone.projectName,
            versionId: version.id,
            versionName: version.version
          })
        }
      }
    }
    return result
  }

  // 从版本中移除事项
  const removeTaskFromVersion = async (versionId, taskId) => {
    for (const milestone of milestones.value) {
      const version = milestone.versions.find(v => v.id === versionId)
      if (version) {
        version.tasks = version.tasks.filter(t => t !== taskId)
        await dbHelper.put('milestones', createSerializableMilestone(milestone))
        return true
      }
    }
    return false
  }

  // 检查事项是否已被版本关联(排除指定版本)
  const isTaskLinkedToOtherVersions = (taskId, excludeVersionId = null) => {
    for (const milestone of milestones.value) {
      for (const version of milestone.versions) {
        // 如果指定了要排除的版本ID,则跳过该版本
        if (excludeVersionId && version.id === excludeVersionId) {
          continue
        }
        if (version.tasks.includes(taskId)) {
          return {
            isLinked: true,
            versionInfo: {
              milestoneName: milestone.projectName,
              versionName: version.version
            }
          }
        }
      }
    }
    return { isLinked: false }
  }

  // 批量检查多个事项是否已被版本关联
  const checkTasksLinkedStatus = (taskIds, excludeVersionId = null) => {
    const results = []
    for (const taskId of taskIds) {
      const task = tasks.value.find(t => t.id === taskId)
      if (!task) continue

      const status = isTaskLinkedToOtherVersions(taskId, excludeVersionId)
      results.push({
        taskId,
        taskName: task.name,
        isLinked: status.isLinked,
        versionInfo: status.versionInfo
      })
    }
    return results
  }

  // 检查版本号是否已存在(同一项目内)
  const isVersionExists = (projectId, versionName, excludeVersionId = null) => {
    const milestone = milestones.value.find(m => m.projectId === projectId)
    if (!milestone) return false

    return milestone.versions.some(v =>
      v.version === versionName && v.id !== excludeVersionId
    )
  }

  // 从版本号中提取数字部分(如 SP001 提取 1)
  const extractVersionNumber = (versionName) => {
    if (!versionName || typeof versionName !== 'string') return 0
    const match = versionName.match(/(\d+)/)
    return match ? parseInt(match[1], 10) : 0
  }

  // 检查版本号数字是否递增
  const isVersionNumberIncrement = (projectId, newVersionName, excludeVersionId = null) => {
    const milestone = milestones.value.find(m => m.projectId === projectId)
    if (!milestone || milestone.versions.length === 0) return { isValid: true }

    const newVersionNumber = extractVersionNumber(newVersionName)

    // 检查是否比所有已存在的版本号都大(排除当前编辑的版本)
    for (const version of milestone.versions) {
      if (version.id === excludeVersionId) continue

      // 确保version对象存在且有version属性
      if (!version || !version.version) continue

      const existingVersionNumber = extractVersionNumber(version.version)
      if (newVersionNumber <= existingVersionNumber) {
        return {
          isValid: false,
          conflictingVersion: version.version
        }
      }
    }

    return { isValid: true }
  }

  // 计算属性
  const getProjectById = (id) => {
    return projects.value.find(p => p.id === id)
  }

  const getOwnerById = (id) => {
    return owners.value.find(o => o.id === id)
  }

  const getMilestoneByProjectId = (projectId) => {
    return milestones.value.find(m => m.projectId === projectId)
  }

  const getTasksByProjectId = (projectId) => {
    return tasks.value.filter(t => t.projectId === projectId)
  }

  // 项目健康度计算
  const calculateProjectHealth = (projectId) => {
    const projectTasks = getTasksByProjectId(projectId)
    if (projectTasks.length === 0) return { score: 100, status: '良好' }

    const completedTasks = projectTasks.filter(t => t.status === '已完成').length
    const overdueTasks = projectTasks.filter(t => {
      if (!t.planDate || t.status === '已完成') return false
      const planDate = dayjs(`2026/${t.planDate}`)
      return dayjs().isAfter(planDate)
    }).length

    const highPriorityIncomplete = projectTasks.filter(t =>
      t.priority === '高' && t.status !== '已完成'
    ).length

    let score = 100
    score -= overdueTasks * 10
    score -= highPriorityIncomplete * 5

    if (score >= 80) return { score, status: '良好' }
    if (score >= 60) return { score, status: '一般' }
    return { score, status: '风险' }
  }

  // 获取关键事务
  const getCriticalTasks = (projectId) => {
    return tasks.value.filter(t =>
      t.projectId === projectId &&
      t.priority === '高' &&
      t.status !== '已完成'
    ).slice(0, 5)
  }

  // 获取风险预警
  const getRiskWarnings = (projectId) => {
    const warnings = []
    const projectTasks = getTasksByProjectId(projectId)

    // 检查逾期任务
    projectTasks.forEach(task => {
      if (task.planDate && task.status !== '已完成') {
        const planDate = dayjs(`2026/${task.planDate}`)
        if (dayjs().isAfter(planDate)) {
          warnings.push({
            type: '逾期',
            task: task.name,
            owner: task.ownerName,
            planDate: task.planDate
          })
        }
      }
    })

    // 检查高优先级未开始
    const highPriorityNotStarted = projectTasks.filter(t =>
      t.priority === '高' && t.status === '未开始'
    )
    if (highPriorityNotStarted.length > 0) {
      warnings.push({
        type: '高优先级未开始',
        count: highPriorityNotStarted.length
      })
    }

    return warnings.slice(0, 5)
  }

  // 导出数据(用于备份)
  const exportData = async () => {
    return {
      theme: theme.value,
      projects: projects.value,
      owners: owners.value,
      milestones: milestones.value,
      tasks: tasks.value,
      exportTime: new Date().toISOString()
    }
  }

  // 导入数据(用于恢复)
  const importData = async (data) => {
    try {
      // 清空现有数据
      await dbHelper.clear('projects')
      await dbHelper.clear('owners')
      await dbHelper.clear('milestones')
      await dbHelper.clear('tasks')

      // 导入新数据
      if (data.projects && data.projects.length > 0) {
        await dbHelper.addBatch('projects', data.projects)
        projects.value = data.projects
      }

      if (data.owners && data.owners.length > 0) {
        await dbHelper.addBatch('owners', data.owners)
        owners.value = data.owners
      }

      if (data.milestones && data.milestones.length > 0) {
        await dbHelper.addBatch('milestones', data.milestones)
        milestones.value = data.milestones
      }

      if (data.tasks && data.tasks.length > 0) {
        await dbHelper.addBatch('tasks', data.tasks)
        tasks.value = data.tasks
      }

      if (data.theme) {
        theme.value = data.theme
        document.body.className = `theme-${theme.value}`
        await dbHelper.saveSetting('theme', data.theme)
      }

      return true
    } catch (error) {
      console.error('导入数据失败:', error)
      return false
    }
  }

  // 重置为默认数据
  const resetToDefault = async () => {
    try {
      // 清空所有数据
      await dbHelper.clear('projects')
      await dbHelper.clear('owners')
      await dbHelper.clear('milestones')
      await dbHelper.clear('tasks')

      // 恢复默认数据
      await dbHelper.addBatch('projects', defaultProjects)
      await dbHelper.addBatch('owners', defaultOwners)
      await dbHelper.addBatch('milestones', defaultMilestones)
      await dbHelper.addBatch('tasks', defaultTasks)

      projects.value = defaultProjects
      owners.value = defaultOwners
      milestones.value = defaultMilestones
      tasks.value = defaultTasks

      return true
    } catch (error) {
      console.error('重置数据失败:', error)
      return false
    }
  }

  return {
    // 状态
    theme,
    visiblePages,
    projects,
    owners,
    milestones,
    tasks,

    // 方法
    initData,
    saveData,
    setTheme,
    updatePageVisibility,
    isPageVisible,
    addProject,
    deleteProject,
    updateProject,
    addOwner,
    deleteOwner,
    updateOwner,
    addMilestone,
    updateMilestone,
    deleteMilestone,
    addVersion,
    deleteVersion,
    updateVersion,
    addTask,
    updateTask,
    deleteTask,
    getTasksByVersion,
    getVersionsByTaskId,
    removeTaskFromVersion,
    isTaskLinkedToOtherVersions,
    checkTasksLinkedStatus,
    isVersionExists,
    isVersionNumberIncrement,

    // 计算属性
    getProjectById,
    getOwnerById,
    getMilestoneByProjectId,
    getTasksByProjectId,
    calculateProjectHealth,
    getCriticalTasks,
    getRiskWarnings,

    // 数据管理
    exportData,
    importData,
    resetToDefault
  }
})
