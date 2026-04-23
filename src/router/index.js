import { createRouter, createWebHistory } from 'vue-router'
import MilestoneView from '@/views/MilestoneView.vue'
import TodoView from '@/views/TodoView.vue'
import OverviewView from '@/views/OverviewView.vue'
import ReportView from '@/views/ReportView.vue'
import ConfigView from '@/views/ConfigView.vue'
import DataManagementView from '@/views/DataManagementView.vue'

const routes = [
  {
    path: '/',
    redirect: '/milestone'
  },
  {
    path: '/milestone',
    name: 'Milestone',
    component: MilestoneView,
    meta: { title: '项目里程碑' }
  },
  {
    path: '/todo',
    name: 'Todo',
    component: TodoView,
    meta: { title: '待办事项' }
  },
  {
    path: '/overview',
    name: 'Overview',
    component: OverviewView,
    meta: { title: '项目总览' }
  },
  {
    path: '/report',
    name: 'Report',
    component: ReportView,
    meta: { title: '项目周报' }
  },
  {
    path: '/config',
    name: 'Config',
    component: ConfigView,
    meta: { title: '配置管理' }
  },
  {
    path: '/data',
    name: 'Data',
    component: DataManagementView,
    meta: { title: '数据管理' }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
