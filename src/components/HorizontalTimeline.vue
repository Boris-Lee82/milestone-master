<template>
  <div class="horizontal-timeline-container">
    <div class="timeline-scroll-wrapper">
      <div class="timeline-track">
        <div
          v-for="(item, index) in sortedItems"
          :key="item.id"
          class="timeline-item"
          :class="[
            `timeline-item-${item.type}`,
            { 'is-current': item.isCurrent }
          ]"
        >
          <!-- 连接线 -->
          <div v-if="index < sortedItems.length - 1" class="timeline-connector" />

          <!-- 时间节点 -->
          <div class="timeline-point">
            <div class="point-inner" />
          </div>

          <!-- 内容卡片 -->
          <div class="timeline-content" :class="`timeline-content-${item.type}`">
            <div class="timeline-actions">
              <el-button
                type="primary"
                size="small"
                circle
                @click="handleEdit(item)"
              >
                <el-icon><Edit /></el-icon>
              </el-button>
              <el-button
                v-if="canDelete(item)"
                type="danger"
                size="small"
                circle
                @click="handleDelete(item)"
              >
                <el-icon><Delete /></el-icon>
              </el-button>
            </div>
            <div class="timeline-date">{{ item.date }}</div>
            <div class="timeline-title">{{ item.title }}</div>
            <div v-if="item.description" class="timeline-description">{{ item.description }}</div>
            <div class="timeline-status">
              <el-tag :type="getStatusType(item.status)" size="small">
                {{ getStatusText(item.status) }}
              </el-tag>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import dayjs from 'dayjs'
import { Edit, Delete } from '@element-plus/icons-vue'

const props = defineProps({
  items: {
    type: Array,
    default: () => []
  },
  projectId: {
    type: Number,
    default: null
  }
})

const emit = defineEmits(['edit-item', 'delete-item'])

// 判断是否可以删除
const canDelete = (item) => {
  const isVersion = item.id.includes('version-')
  console.log('canDelete 检查:', { itemId: item.id, isVersion })
  // 版本可以删除
  const result = isVersion
  console.log('canDelete 结果:', result)
  return result
}

// 按日期排序的项目
const sortedItems = computed(() => {
  if (!props.items || props.items.length === 0) return []

  const items = [...props.items].map(item => ({
    ...item,
    status: calculateStatus(item.date)
  }))

  console.log('sortedItems:', items)

  // 按日期排序
  items.sort((a, b) => dayjs(a.date).valueOf() - dayjs(b.date).valueOf())

  // 标记当前节点
  const now = dayjs()
  let foundCurrent = false
  for (let i = 0; i < items.length; i++) {
    if (dayjs(items[i].date).isAfter(now) && !foundCurrent) {
      items[i].isCurrent = true
      foundCurrent = true
    } else {
      items[i].isCurrent = false
    }
  }

  return items
})

// 计算状态
const calculateStatus = (date) => {
  if (!date) return 'none'
  const itemDate = dayjs(date)
  const now = dayjs()

  if (itemDate.isBefore(now)) {
    return 'completed'
  } else if (itemDate.isAfter(now)) {
    return 'upcoming'
  } else {
    return 'current'
  }
}

// 获取状态类型
const getStatusType = (status) => {
  const typeMap = {
    'completed': 'success',
    'current': 'warning',
    'upcoming': 'info',
    'none': 'info'
  }
  return typeMap[status] || 'info'
}

// 获取状态文本
const getStatusText = (status) => {
  const textMap = {
    'completed': '已完成',
    'current': '进行中',
    'upcoming': '未开始',
    'none': '未设置'
  }
  return textMap[status] || '未设置'
}

// 处理编辑
const handleEdit = (item) => {
  // 判断是否是版本节点
  const isVersion = item.id.includes('version-')
  const field = isVersion ? item.id.split('-version-')[1] : item.id.split('-')[1]

  emit('edit-item', {
    projectId: props.projectId,
    field,
    value: item.date,
    type: item.type
  })
}

// 处理删除
const handleDelete = (item) => {
  console.log('handleDelete 被调用:', item)
  // 关键节点不能删除，但版本可以删除
  const isVersion = item.id.includes('version-')
  const isMilestone = ['CDCP', 'PDCP', 'ADCP', 'LDCP', 'TR1', 'TR2', 'TR3', 'TR4', 'TR4A', 'TR5', 'TR6'].some(key =>
    item.id.includes(key)
  )

  console.log('节点类型检查:', { isVersion, isMilestone })

  // 只有里程碑不允许删除，版本可以删除
  if (isMilestone) {
    console.log('里程碑不允许删除，返回')
    // 里程碑不允许删除
    return
  }

  const field = isVersion ? item.id.split('-version-')[1] : item.id.split('-')[1]
  console.log('准备emit删除事件:', { projectId: props.projectId, field, type: item.type })

  emit('delete-item', {
    projectId: props.projectId,
    field,
    type: item.type
  })
}
</script>

<style scoped>
.horizontal-timeline-container {
  width: 100%;
  overflow: hidden;
  background: var(--card-bg, #fafafa);
  border-radius: 8px;
  padding: 10px;
}

.timeline-scroll-wrapper {
  overflow-x: auto;
  overflow-y: hidden;
  padding: 10px 0 30px 0; /* 减少底部padding */
  scrollbar-width: thin;
  scrollbar-color: var(--border-color, #dcdfe6) var(--bg-color, #f5f7fa);
}

.timeline-scroll-wrapper::-webkit-scrollbar {
  height: 6px; /* 减小高度 */
}

.timeline-scroll-wrapper::-webkit-scrollbar-track {
  background: var(--bg-color, #f5f7fa);
  border-radius: 3px;
}

.timeline-scroll-wrapper::-webkit-scrollbar-thumb {
  background: var(--border-color, #dcdfe6);
  border-radius: 3px;
  transition: background 0.3s;
}

.timeline-scroll-wrapper::-webkit-scrollbar-thumb:hover {
  background: var(--primary-color, #409EFF);
}

.timeline-track {
  display: flex;
  align-items: center; /* 改为垂直居中对齐，确保所有节点在同一水平线上 */
  gap: 0;
  min-width: max-content;
  padding: 0 20px;
  position: relative;
}

.timeline-item {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  width: 160px; /* 增加宽度，给节点更多空间 */
  padding: 0;
  height: 200px; /* 大幅增加高度，给商业决策点更多显示空间 */
}

.timeline-connector {
  position: absolute;
  top: 50%;
  left: 50%; /* 从当前节点的中心开始 */
  transform: translateY(-50%);
  width: 160px; /* 延伸到下一个节点的中心（160px宽度） */
  height: 3px; /* 增加连接线粗细，使其更明显 */
  background: var(--border-color, #e4e7ed); /* 使用统一的灰色，确保连续性 */
  z-index: 0;
  pointer-events: none;
}

.timeline-point {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: var(--card-bg, #ffffff);
  border: 2px solid var(--border-color, #dcdfe6);
  z-index: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.timeline-item.timeline-item-success .timeline-point {
  border-color: #67C23A;
  background: var(--card-bg, #f0f9ff);
}

.timeline-item.timeline-item-primary .timeline-point {
  border-color: #409EFF;
  background: var(--card-bg, #ecf5ff);
}

.timeline-item.timeline-item-warning .timeline-point {
  border-color: #E6A23C;
  background: var(--card-bg, #fdf6ec);
}

.timeline-item.is-current .timeline-point {
  transform: translate(-50%, -50%) scale(1.2);
  box-shadow: 0 0 0 3px rgba(64, 158, 255, 0.2);
}

.point-inner {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--border-color, #dcdfe6);
  transition: all 0.3s;
}

.timeline-item.timeline-item-success .point-inner {
  background: #67C23A;
}

.timeline-item.timeline-item-primary .point-inner {
  background: #409EFF;
}

.timeline-item.timeline-item-warning .point-inner {
  background: #E6A23C;
}

.timeline-item.is-current .point-inner {
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}

.timeline-content {
  text-align: center;
  transition: all 0.3s;
  width: 100%;
  position: absolute;
  padding: 8px 6px;
  border-radius: 6px;
  z-index: 2;
  max-width: 180px; /* 增加最大宽度，确保文字完整显示 */
  word-wrap: break-word; /* 允许文字换行 */
  overflow-wrap: break-word; /* 确保长文字能够换行 */
}

/* 商业决策点在时间轴上方 */
.timeline-content-success {
  bottom: 50%;
  margin-bottom: 15px; /* 减少间距，给内容卡片更多空间 */
}

/* 技术评审点在时间轴下方 */
.timeline-content-primary {
  top: 50%;
  margin-top: 20px; /* 增加间距，避免遮挡连接线 */
}

/* 版本在时间轴下方 */
.timeline-content-warning {
  top: 50%;
  margin-top: 20px; /* 增加间距，避免遮挡连接线 */
}

.timeline-actions {
  position: absolute;
  bottom: -6px;
  right: 0;
  display: flex;
  gap: 4px;
  opacity: 0;
  transition: opacity 0.3s;
  z-index: 3;
}

.timeline-content:hover .timeline-actions {
  opacity: 1;
}

.timeline-content:hover {
  background: var(--hover-bg, rgba(255, 255, 255, 0.8));
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.timeline-item.timeline-item-success .timeline-content:hover {
  background: rgba(103, 194, 58, 0.1);
}

.timeline-item.timeline-item-primary .timeline-content:hover {
  background: rgba(64, 158, 255, 0.1);
}

.timeline-item.timeline-item-warning .timeline-content:hover {
  background: rgba(230, 162, 60, 0.1);
}

.timeline-item.is-current .timeline-content {
  background: rgba(64, 158, 255, 0.05);
}

.timeline-date {
  font-size: 12px;
  font-weight: bold;
  color: var(--text-color-secondary, #909399);
  margin-bottom: 4px;
}

.timeline-title {
  font-size: 13px;
  font-weight: bold;
  color: var(--text-color, #303133);
  margin-bottom: 3px;
  line-height: 1.4;
  word-break: break-all; /* 确保长文字能够换行 */
  white-space: normal; /* 允许文字换行 */
}

.timeline-description {
  font-size: 11px;
  color: var(--text-color-regular, #606266);
  margin-bottom: 5px;
  line-height: 1.4;
  word-break: break-all; /* 确保长文字能够换行 */
  white-space: normal; /* 允许文字换行 */
}

.timeline-status {
  margin-top: 2px;
}
</style>