<template>
  <el-container class="app-container" v-if="isLoaded">
    <el-aside width="200px" class="sidebar">
      <div class="logo">
        <svg class="logo-icon" viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="lg" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" style="stop-color:#409EFF"/>
              <stop offset="100%" style="stop-color:#1890ff"/>
            </linearGradient>
          </defs>
          <rect width="64" height="64" rx="14" fill="url(#lg)"/>
          <path d="M16 44 L32 20 L48 44" stroke="white" stroke-width="4" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
          <line x1="24" y1="36" x2="40" y2="36" stroke="white" stroke-width="3" stroke-linecap="round"/>
          <circle cx="32" cy="18" r="3" fill="white"/>
        </svg>
        <span>里程碑管理</span>
      </div>
      <el-menu
        :default-active="currentRoute"
        router
        class="sidebar-menu"
        background-color="transparent"
        :text-color="textColor"
      >
        <el-menu-item v-if="store.isPageVisible('milestone')" index="/milestone">
          <el-icon><Location /></el-icon>
          <span>项目里程碑</span>
        </el-menu-item>
        <el-menu-item v-if="store.isPageVisible('todo')" index="/todo">
          <el-icon><List /></el-icon>
          <span>待办事项</span>
        </el-menu-item>
        <el-menu-item v-if="store.isPageVisible('overview')" index="/overview">
          <el-icon><Grid /></el-icon>
          <span>项目总览</span>
        </el-menu-item>
        <el-menu-item v-if="store.isPageVisible('report')" index="/report">
          <el-icon><Document /></el-icon>
          <span>项目周报</span>
        </el-menu-item>
        <el-menu-item index="/config">
          <el-icon><Setting /></el-icon>
          <span>配置管理</span>
        </el-menu-item>
        <el-menu-item v-if="store.isPageVisible('data')" index="/data">
          <el-icon><FolderOpened /></el-icon>
          <span>数据管理</span>
        </el-menu-item>
      </el-menu>
    </el-aside>

    <el-container>
      <el-header class="header">
        <h2>{{ pageTitle }}</h2>
        <div class="header-right">
          <el-select v-model="theme" @change="handleThemeChange" style="width: 120px">
            <el-option label="默认主题" value="default" />
            <el-option label="暗色主题" value="dark" />
            <el-option label="蓝色主题" value="blue" />
          </el-select>
        </div>
      </el-header>

      <el-main>
        <router-view />
      </el-main>
    </el-container>
  </el-container>

  <div v-else class="loading-container">
    <el-icon class="loading-icon"><Loading /></el-icon>
    <p>正在加载系统...</p>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useStore } from '@/stores'

const route = useRoute()
const store = useStore()
const isLoaded = ref(false)

const currentRoute = computed(() => route.path)
const theme = computed({
  get: () => store.theme,
  set: (value) => store.setTheme(value)
})

const pageTitle = computed(() => {
  return route.meta.title || '里程碑管理系统'
})

const textColor = computed(() => {
  if (theme.value === 'dark') return '#e0e0e0'
  return '#303133'
})

const handleThemeChange = (value) => {
  store.setTheme(value)
}

onMounted(async () => {
  try {
    await store.initData()
    store.setTheme(store.theme)

    // 加载页面可见性配置
    const pageConfig = localStorage.getItem('pageVisibilityConfig')
    if (pageConfig) {
      store.updatePageVisibility(JSON.parse(pageConfig))
    } else {
      // 使用默认配置
      store.updatePageVisibility(['milestone', 'todo', 'overview', 'report'])
    }

    isLoaded.value = true
  } catch (error) {
    console.error('初始化数据失败:', error)
    // 即使初始化失败,也设置默认主题并显示页面
    store.setTheme('default')
    // 使用默认页面配置
    store.updatePageVisibility(['milestone', 'todo', 'overview', 'report'])
    isLoaded.value = true
  }
})
</script>

<style scoped>
.app-container {
  height: 100vh;
}

.sidebar {
  background-color: var(--card-bg);
  border-right: 1px solid var(--border-color);
  display: flex;
  flex-direction: column;
}

.logo {
  padding: 20px;
  font-size: 18px;
  font-weight: bold;
  display: flex;
  align-items: center;
  gap: 10px;
  border-bottom: 1px solid var(--border-color);
  color: var(--primary-color);
}

.logo-icon {
  width: 32px;
  height: 32px;
  flex-shrink: 0;
}

.sidebar-menu {
  border: none;
  flex: 1;
}

.sidebar-menu .el-icon {
  color: var(--primary-color);
}

.header {
  background-color: var(--card-bg);
  border-bottom: 1px solid var(--border-color);
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 20px;
}

.header h2 {
  margin: 0;
  color: var(--text-color);
}

.header-right {
  display: flex;
  align-items: center;
  gap: 20px;
}

.loading-container {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background-color: var(--bg-color);
}

.loading-icon {
  font-size: 48px;
  color: var(--primary-color);
  animation: rotate 2s linear infinite;
}

@keyframes rotate {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.loading-container p {
  margin-top: 20px;
  color: var(--text-color);
  font-size: 16px;
}
</style>
