<template>
  <div class="data-management-container">
    <el-card class="data-management-card">
      <template #header>
        <div class="card-header">
          <span>数据管理</span>
        </div>
      </template>

      <el-alert
        title="数据存储说明"
        type="info"
        :closable="false"
        style="margin-bottom: 20px"
      >
        <p>本系统使用 IndexedDB 浏览器数据库存储数据,数据存储在本地浏览器中。</p>
        <p>建议定期备份数据,以防数据丢失。</p>
      </el-alert>

      <el-row :gutter="20">
        <el-col :span="12">
          <el-card class="action-card">
            <template #header>
              <div class="action-header">
                <el-icon><Download /></el-icon>
                <span>备份数据</span>
              </div>
            </template>
            <p class="action-description">导出所有数据为 JSON 文件,可用于数据备份或迁移。</p>
            <el-button type="primary" @click="exportData" :loading="exporting">
              <el-icon><Download /></el-icon>
              导出数据
            </el-button>
          </el-card>
        </el-col>

        <el-col :span="12">
          <el-card class="action-card">
            <template #header>
              <div class="action-header">
                <el-icon><Upload /></el-icon>
                <span>恢复数据</span>
              </div>
            </template>
            <p class="action-description">从 JSON 文件导入数据,将覆盖当前所有数据。</p>
            <el-upload
              ref="uploadRef"
              :auto-upload="false"
              :show-file-list="false"
              accept=".json"
              :on-change="handleFileChange"
            >
              <el-button type="success">
                <el-icon><Upload /></el-icon>
                导入数据
              </el-button>
            </el-upload>
          </el-card>
        </el-col>
      </el-row>

      <el-divider />

      <el-card class="action-card" style="margin-top: 20px">
        <template #header>
          <div class="action-header danger">
            <el-icon><Warning /></el-icon>
            <span>危险操作</span>
          </div>
        </template>
        <p class="action-description">重置为默认数据,将清除所有自定义数据并恢复到初始状态。</p>
        <el-button type="danger" @click="resetData" :loading="resetting">
          <el-icon><RefreshLeft /></el-icon>
          重置为默认数据
        </el-button>
      </el-card>

      <el-divider />

      <el-card class="info-card">
        <template #header>
          <div class="action-header">
            <el-icon><InfoFilled /></el-icon>
            <span>数据统计</span>
          </div>
        </template>
        <el-row :gutter="20">
          <el-col :span="6">
            <div class="stat-item">
              <div class="stat-value">{{ store.projects.length }}</div>
              <div class="stat-label">项目数量</div>
            </div>
          </el-col>
          <el-col :span="6">
            <div class="stat-item">
              <div class="stat-value">{{ store.owners.length }}</div>
              <div class="stat-label">责任人数量</div>
            </div>
          </el-col>
          <el-col :span="6">
            <div class="stat-item">
              <div class="stat-value">{{ store.milestones.length }}</div>
              <div class="stat-label">里程碑数量</div>
            </div>
          </el-col>
          <el-col :span="6">
            <div class="stat-item">
              <div class="stat-value">{{ store.tasks.length }}</div>
              <div class="stat-label">待办事项数量</div>
            </div>
          </el-col>
        </el-row>
      </el-card>
    </el-card>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useStore } from '@/stores'
import { ElMessage, ElMessageBox } from 'element-plus'

const store = useStore()

const exporting = ref(false)
const resetting = ref(false)
const uploadRef = ref(null)

// 导出数据
const exportData = async () => {
  try {
    exporting.value = true
    const data = await store.exportData()

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute(
      'download',
      `milestone_backup_${new Date().toISOString().slice(0, 10)}.json`
    )
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

    ElMessage.success('数据导出成功')
  } catch (error) {
    console.error('导出数据失败:', error)
    ElMessage.error('导出数据失败')
  } finally {
    exporting.value = false
  }
}

// 处理文件选择
const handleFileChange = async (file) => {
  try {
    const reader = new FileReader()
    reader.onload = async (e) => {
      try {
        const data = JSON.parse(e.target.result)

        // 验证数据格式
        if (!data.projects || !data.owners || !data.milestones || !data.tasks) {
          ElMessage.error('数据格式不正确')
          return
        }

        ElMessageBox.confirm(
          '导入数据将覆盖当前所有数据,确定要继续吗?',
          '确认导入',
          {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning'
          }
        ).then(async () => {
          const success = await store.importData(data)
          if (success) {
            ElMessage.success('数据导入成功')
            setTimeout(() => {
              location.reload()
            }, 1000)
          } else {
            ElMessage.error('数据导入失败')
          }
        }).catch(() => {})
      } catch (error) {
        console.error('解析数据失败:', error)
        ElMessage.error('数据格式不正确')
      }
    }
    reader.readAsText(file.raw)
  } catch (error) {
    console.error('导入数据失败:', error)
    ElMessage.error('导入数据失败')
  }
}

// 重置数据
const resetData = () => {
  ElMessageBox.confirm(
    '重置将清除所有自定义数据并恢复到初始状态,此操作不可撤销,确定要继续吗?',
    '确认重置',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(async () => {
    try {
      resetting.value = true
      const success = await store.resetToDefault()
      if (success) {
        ElMessage.success('重置成功')
        setTimeout(() => {
          location.reload()
        }, 1000)
      } else {
        ElMessage.error('重置失败')
      }
    } catch (error) {
      console.error('重置数据失败:', error)
      ElMessage.error('重置失败')
    } finally {
      resetting.value = false
    }
  }).catch(() => {})
}
</script>

<style scoped>
.data-management-container {
  padding: 20px;
}

.data-management-card {
  max-width: 1200px;
  margin: 0 auto;
}

.card-header {
  font-size: 18px;
  font-weight: bold;
}

.action-card {
  height: 100%;
}

.action-header {
  display: flex;
  align-items: center;
  gap: 10px;
  font-weight: bold;
}

.action-header.danger {
  color: #f56c6c;
}

.action-description {
  color: var(--text-color-regular, #606266);
  margin: 10px 0 20px 0;
  line-height: 1.6;
}

.info-card {
  margin-top: 20px;
}

.stat-item {
  text-align: center;
  padding: 20px 0;
}

.stat-value {
  font-size: 32px;
  font-weight: bold;
  color: var(--primary-color);
  margin-bottom: 10px;
}

.stat-label {
  font-size: 14px;
  color: var(--text-color-secondary, #909399);
}
</style>
