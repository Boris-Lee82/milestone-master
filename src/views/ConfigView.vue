<template>
  <div class="config-container">
    <el-card class="config-card">
      <template #header>
        <div class="card-header">
          <span>配置管理</span>
        </div>
      </template>

      <el-tabs v-model="activeTab">
        <!-- 项目配置 -->
        <el-tab-pane label="项目配置" name="projects">
          <div class="config-section">
            <div class="section-header">
              <h3>项目列表</h3>
              <div class="header-buttons">
                <el-button @click="exportProjects">
                  <el-icon><Download /></el-icon>
                  导出
                </el-button>
                <el-button @click="showImportProjectsDialog">
                  <el-icon><Upload /></el-icon>
                  批量导入
                </el-button>
                <el-button type="primary" @click="showProjectDialog">
                  <el-icon><Plus /></el-icon>
                  添加项目
                </el-button>
              </div>
            </div>
            <el-table :data="projects" stripe style="width: 100%">
              <el-table-column type="index" label="编号" width="80" />
              <el-table-column prop="name" label="项目名称" />
              <el-table-column label="操作" width="200">
                <template #default="{ row }">
                  <el-button size="small" @click="editProject(row)">编辑</el-button>
                  <el-button size="small" type="danger" @click="deleteProject(row)">删除</el-button>
                </template>
              </el-table-column>
            </el-table>
          </div>
        </el-tab-pane>

        <!-- 责任人配置 -->
        <el-tab-pane label="责任人配置" name="owners">
          <div class="config-section">
            <div class="section-header">
              <h3>责任人列表</h3>
              <div class="header-buttons">
                <el-button @click="exportOwners">
                  <el-icon><Download /></el-icon>
                  导出
                </el-button>
                <el-button @click="showImportOwnersDialog">
                  <el-icon><Upload /></el-icon>
                  批量导入
                </el-button>
                <el-button type="primary" @click="showOwnerDialog">
                  <el-icon><Plus /></el-icon>
                  添加责任人
                </el-button>
              </div>
            </div>
            <el-table :data="owners" stripe style="width: 100%">
              <el-table-column type="index" label="编号" width="80" />
              <el-table-column prop="name" label="姓名" />
              <el-table-column label="操作" width="200">
                <template #default="{ row }">
                  <el-button size="small" @click="editOwner(row)">编辑</el-button>
                  <el-button size="small" type="danger" @click="deleteOwner(row)">删除</el-button>
                </template>
              </el-table-column>
            </el-table>
          </div>
        </el-tab-pane>

        <!-- 页面配置 -->
        <el-tab-pane label="页面配置" name="pages">
          <div class="config-section">
            <h3>页面显示配置</h3>
            <p class="config-tip">勾选要显示的页面，未勾选的页面将在导航栏中隐藏</p>
            <el-checkbox-group v-model="visiblePages" @change="handlePageVisibilityChange">
              <div class="page-checkbox-list">
                <el-checkbox label="milestone">
                  <div class="page-item">
                    <el-icon><Location /></el-icon>
                    <span>项目里程碑</span>
                  </div>
                </el-checkbox>
                <el-checkbox label="todo">
                  <div class="page-item">
                    <el-icon><List /></el-icon>
                    <span>待办事项</span>
                  </div>
                </el-checkbox>
                <el-checkbox label="overview">
                  <div class="page-item">
                    <el-icon><Grid /></el-icon>
                    <span>项目总览</span>
                  </div>
                </el-checkbox>
                <el-checkbox label="report">
                  <div class="page-item">
                    <el-icon><Document /></el-icon>
                    <span>项目周报</span>
                  </div>
                </el-checkbox>
                <el-checkbox label="data">
                  <div class="page-item">
                    <el-icon><FolderOpened /></el-icon>
                    <span>数据管理</span>
                  </div>
                </el-checkbox>
              </div>
            </el-checkbox-group>
          </div>
        </el-tab-pane>

        <!-- 主题配置 -->
        <el-tab-pane label="主题配置" name="themes">
          <div class="config-section">
            <h3>选择主题</h3>
            <el-radio-group v-model="currentTheme" @change="handleThemeChange">
              <el-radio label="default">默认主题（浅色）</el-radio>
              <el-radio label="dark">暗色主题</el-radio>
              <el-radio label="blue">蓝色主题</el-radio>
            </el-radio-group>
            <div class="theme-preview">
              <div class="preview-default" :class="{ active: currentTheme === 'default' }">
                <span>默认主题预览</span>
              </div>
              <div class="preview-dark" :class="{ active: currentTheme === 'dark' }">
                <span>暗色主题预览</span>
              </div>
              <div class="preview-blue" :class="{ active: currentTheme === 'blue' }">
                <span>蓝色主题预览</span>
              </div>
            </div>
          </div>
        </el-tab-pane>

        <!-- 关于 -->
        <el-tab-pane label="关于" name="about">
          <div class="config-section about-section">
            <div class="about-content">
              <div class="about-item">
                <span class="about-label">版本：</span>
                <span class="about-value">V1.0.008</span>
              </div>
              <div class="about-item">
                <span class="about-label">发布时间：</span>
                <span class="about-value">2026/04/23</span>
              </div>
              <div class="about-item">
                <span class="about-label">作者：</span>
                <span class="about-value">敬天爱人AI工作室</span>
              </div>
              <div class="about-item">
                <span class="about-label">联系邮箱：</span>
                <a href="mailto:boris_lee82@126.com" class="about-link">boris_lee82@126.com</a>
              </div>
            </div>
          </div>
        </el-tab-pane>
      </el-tabs>
    </el-card>

    <!-- 项目对话框 -->
    <el-dialog v-model="projectDialogVisible" :title="projectDialogTitle" width="400px">
      <el-form :model="projectForm" label-width="80px">
        <el-form-item label="项目名称">
          <el-input v-model="projectForm.name" placeholder="请输入项目名称" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="projectDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="saveProject">确定</el-button>
      </template>
    </el-dialog>

    <!-- 责任人对话框 -->
    <el-dialog v-model="ownerDialogVisible" :title="ownerDialogTitle" width="400px">
      <el-form :model="ownerForm" label-width="80px">
        <el-form-item label="姓名">
          <el-input v-model="ownerForm.name" placeholder="请输入姓名" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="ownerDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="saveOwner">确定</el-button>
      </template>
    </el-dialog>

    <!-- 批量导入项目对话框 -->
    <el-dialog v-model="importProjectsDialogVisible" title="批量导入项目" width="600px">
      <div class="import-tips">
        <el-alert
          title="导入说明"
          type="info"
          :closable="false"
          style="margin-bottom: 20px"
        >
          <p>每行一个项目名称</p>
          <p>示例：</p>
          <pre>项目 A
项目 B
项目 C</pre>
        </el-alert>
      </div>
      <el-input
        v-model="importProjectsText"
        type="textarea"
        :rows="10"
        placeholder="请输入项目名称，每行一个"
      />
      <template #footer>
        <el-button @click="importProjectsDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="importProjects">导入</el-button>
      </template>
    </el-dialog>

    <!-- 批量导入责任人对话框 -->
    <el-dialog v-model="importOwnersDialogVisible" title="批量导入责任人" width="600px">
      <div class="import-tips">
        <el-alert
          title="导入说明"
          type="info"
          :closable="false"
          style="margin-bottom: 20px"
        >
          <p>每行一个责任人姓名</p>
          <p>示例：</p>
          <pre>张三
李四
王五</pre>
        </el-alert>
      </div>
      <el-input
        v-model="importOwnersText"
        type="textarea"
        :rows="10"
        placeholder="请输入责任人姓名，每行一个"
      />
      <template #footer>
        <el-button @click="importOwnersDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="importOwners">导入</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useStore } from '@/stores'
import { ElMessage, ElMessageBox } from 'element-plus'

const store = useStore()
const activeTab = ref('projects')

const projects = computed(() => store.projects)
const owners = computed(() => store.owners)
const currentTheme = computed({
  get: () => store.theme,
  set: (value) => store.setTheme(value)
})

// 页面显示配置
const visiblePages = ref(['milestone', 'todo', 'overview', 'report']) // 默认数据管理不显示

// 加载页面配置
const loadPageConfig = () => {
  const saved = localStorage.getItem('pageVisibilityConfig')
  if (saved) {
    visiblePages.value = JSON.parse(saved)
  }
}

// 保存页面配置
const savePageConfig = () => {
  localStorage.setItem('pageVisibilityConfig', JSON.stringify(visiblePages.value))
}

// 处理页面显示变化
const handlePageVisibilityChange = () => {
  savePageConfig()
  // 通知store更新页面可见性
  store.updatePageVisibility(visiblePages.value)
  ElMessage.success('页面显示配置已更新')
}

// 初始化
onMounted(() => {
  loadPageConfig()
  // 确保store有页面可见性配置
  store.updatePageVisibility(visiblePages.value)
})

// 项目相关
const projectDialogVisible = ref(false)
const projectDialogTitle = ref('添加项目')
const projectForm = ref({ id: null, name: '' })
const editingProjectId = ref(null)

const showProjectDialog = () => {
  projectDialogTitle.value = '添加项目'
  projectForm.value = { id: null, name: '' }
  editingProjectId.value = null
  projectDialogVisible.value = true
}

const editProject = (row) => {
  projectDialogTitle.value = '编辑项目'
  projectForm.value = { id: row.id, name: row.name }
  editingProjectId.value = row.id
  projectDialogVisible.value = true
}

const saveProject = () => {
  if (!projectForm.value.name.trim()) {
    ElMessage.warning('请输入项目名称')
    return
  }

  if (editingProjectId.value) {
    const success = store.updateProject(editingProjectId.value, projectForm.value.name)
    if (success) {
      ElMessage.success('项目更新成功')
    } else {
      ElMessage.warning('项目名称已存在')
      return
    }
  } else {
    const result = store.addProject(projectForm.value.name)
    if (result) {
      ElMessage.success('项目添加成功')
    } else {
      ElMessage.warning('项目名称已存在')
      return
    }
  }

  projectDialogVisible.value = false
}

const deleteProject = (row) => {
  ElMessageBox.confirm(`确定要删除项目"${row.name}"吗？`, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    store.deleteProject(row.id)
    ElMessage.success('删除成功')
  }).catch(() => {})
}

// 责任人相关
const ownerDialogVisible = ref(false)
const ownerDialogTitle = ref('添加责任人')
const ownerForm = ref({ id: null, name: '' })
const editingOwnerId = ref(null)

const showOwnerDialog = () => {
  ownerDialogTitle.value = '添加责任人'
  ownerForm.value = { id: null, name: '' }
  editingOwnerId.value = null
  ownerDialogVisible.value = true
}

const editOwner = (row) => {
  ownerDialogTitle.value = '编辑责任人'
  ownerForm.value = { id: row.id, name: row.name }
  editingOwnerId.value = row.id
  ownerDialogVisible.value = true
}

const saveOwner = () => {
  if (!ownerForm.value.name.trim()) {
    ElMessage.warning('请输入姓名')
    return
  }

  if (editingOwnerId.value) {
    const success = store.updateOwner(editingOwnerId.value, ownerForm.value.name)
    if (success) {
      ElMessage.success('责任人更新成功')
    } else {
      ElMessage.warning('责任人姓名已存在')
      return
    }
  } else {
    const result = store.addOwner(ownerForm.value.name)
    if (result) {
      ElMessage.success('责任人添加成功')
    } else {
      ElMessage.warning('责任人姓名已存在')
      return
    }
  }

  ownerDialogVisible.value = false
}

const deleteOwner = (row) => {
  ElMessageBox.confirm(`确定要删除责任人"${row.name}"吗？`, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    store.deleteOwner(row.id)
    ElMessage.success('删除成功')
  }).catch(() => {})
}

// 主题相关
const handleThemeChange = (value) => {
  store.setTheme(value)
  ElMessage.success(`已切换到${value === 'default' ? '默认' : value === 'dark' ? '暗色' : '蓝色'}主题`)
}

// 批量导入项目
const importProjectsDialogVisible = ref(false)
const importProjectsText = ref('')

const showImportProjectsDialog = () => {
  importProjectsText.value = ''
  importProjectsDialogVisible.value = true
}

const importProjects = () => {
  const lines = importProjectsText.value.split('\n').filter(line => line.trim())
  if (lines.length === 0) {
    ElMessage.warning('请输入项目名称')
    return
  }

  let successCount = 0
  let duplicateCount = 0
  lines.forEach(name => {
    if (name.trim()) {
      const result = store.addProject(name.trim())
      if (result) {
        successCount++
      } else {
        duplicateCount++
      }
    }
  })

  if (duplicateCount > 0) {
    ElMessage.warning(`成功导入 ${successCount} 个项目，${duplicateCount} 个项目名称已存在`)
  } else {
    ElMessage.success(`成功导入 ${successCount} 个项目`)
  }
  importProjectsDialogVisible.value = false
}

const exportProjects = () => {
  const data = projects.value.map(p => p.name).join('\n')
  const blob = new Blob(['\ufeff' + data], { type: 'text/plain;charset=utf-8;' })
  const link = document.createElement('a')
  const url = URL.createObjectURL(blob)
  link.setAttribute('href', url)
  link.setAttribute('download', '项目列表.txt')
  link.style.visibility = 'hidden'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  ElMessage.success('导出成功')
}

// 批量导入责任人
const importOwnersDialogVisible = ref(false)
const importOwnersText = ref('')

const showImportOwnersDialog = () => {
  importOwnersText.value = ''
  importOwnersDialogVisible.value = true
}

const importOwners = () => {
  const lines = importOwnersText.value.split('\n').filter(line => line.trim())
  if (lines.length === 0) {
    ElMessage.warning('请输入责任人姓名')
    return
  }

  let successCount = 0
  let duplicateCount = 0
  lines.forEach(name => {
    if (name.trim()) {
      const result = store.addOwner(name.trim())
      if (result) {
        successCount++
      } else {
        duplicateCount++
      }
    }
  })

  if (duplicateCount > 0) {
    ElMessage.warning(`成功导入 ${successCount} 个责任人，${duplicateCount} 个责任人姓名已存在`)
  } else {
    ElMessage.success(`成功导入 ${successCount} 个责任人`)
  }
  importOwnersDialogVisible.value = false
}

const exportOwners = () => {
  const data = owners.value.map(o => o.name).join('\n')
  const blob = new Blob(['\ufeff' + data], { type: 'text/plain;charset=utf-8;' })
  const link = document.createElement('a')
  const url = URL.createObjectURL(blob)
  link.setAttribute('href', url)
  link.setAttribute('download', '责任人列表.txt')
  link.style.visibility = 'hidden'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  ElMessage.success('导出成功')
}
</script>

<style scoped>
.config-container {
  padding: 20px;
}

.config-card {
  max-width: 1200px;
  margin: 0 auto;
}

.card-header {
  font-size: 18px;
  font-weight: bold;
}

.config-section {
  padding: 20px 0;
}

.config-section h3 {
  margin: 0 0 10px 0;
}

.config-tip {
  color: var(--text-color-secondary, #909399);
  margin: 0 0 20px 0;
  font-size: 14px;
}

.page-checkbox-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 15px;
}

.page-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 15px;
  background: var(--card-bg);
  border: 1px solid var(--border-color);
  border-radius: 6px;
  transition: all 0.3s;
}

.page-item:hover {
  border-color: var(--primary-color);
  background: var(--hover-bg);
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.section-header h3 {
  margin: 0;
}

.header-buttons {
  display: flex;
  gap: 10px;
}

.import-tips pre {
  background: var(--hover-bg, #f5f7fa);
  padding: 10px;
  border-radius: 4px;
  margin: 10px 0 0 0;
  white-space: pre-wrap;
  font-family: monospace;
}

.theme-preview {
  margin-top: 30px;
  display: flex;
  gap: 20px;
}

.preview-default,
.preview-dark,
.preview-blue {
  width: 200px;
  height: 120px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  border: 3px solid transparent;
  transition: all 0.3s;
}

.preview-default {
  background: var(--bg-color, #f5f7fa);
  border-color: var(--border-color, #dcdfe6);
}

.preview-dark {
  background: #1a1a1a;
  color: #e0e0e0;
}

.preview-blue {
  background: #f0f5ff;
  border-color: #b3d4ff;
}

.preview-default.active,
.preview-dark.active,
.preview-blue.active {
  border-color: var(--primary-color);
  box-shadow: 0 0 10px rgba(64, 158, 255, 0.5);
}

.about-section {
  max-width: 600px;
}

.about-content {
  background: var(--card-bg, #ffffff);
  border: 1px solid var(--border-color, #dcdfe6);
  border-radius: 8px;
  padding: 30px;
}

.about-item {
  display: flex;
  align-items: center;
  margin-bottom: 20px;
  font-size: 15px;
}

.about-item:last-child {
  margin-bottom: 0;
}

.about-label {
  font-weight: 600;
  color: var(--text-color, #303133);
  min-width: 100px;
}

.about-value {
  color: var(--text-color-regular, #606266);
}

.about-link {
  color: var(--primary-color, #409EFF);
  text-decoration: none;
  transition: color 0.3s;
}

.about-link:hover {
  color: var(--primary-color, #66b1ff);
  text-decoration: underline;
}
</style>
