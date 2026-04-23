# Milestone Master 项目 SKILL 文件

## 项目概述

**项目名称**: Milestone Master (里程碑管理系统)

**项目描述**: 一个专为项目经理设计的单机里程碑管理系统，帮助管理多个项目的里程碑、待办事项、项目总览和周报。基于 Vue 3 + Element Plus 构建，使用 IndexedDB 进行数据存储。

**版本**: V1.0.008

**发布时间**: 2026/04/23

**作者**: 敬天爱人AI工作室

**联系邮箱**: boris_lee82@126.com

**技术栈**:
- 前端框架: Vue 3 (Composition API)
- UI 组件库: Element Plus
- 状态管理: Pinia
- 路由: Vue Router
- 构建工具: Vite
- 数据存储: IndexedDB + LocalStorage
- 日期处理: Day.js

## 项目结构

```
milestone-master/
├── src/
│   ├── components/
│   │   └── HorizontalTimeline.vue      # 横向时间轴组件
│   ├── router/
│   │   └── index.js                    # 路由配置
│   ├── stores/
│   │   └── index.js                    # Pinia 状态管理（核心业务逻辑）
│   ├── styles/
│   │   └── global.css                  # 全局样式和主题配置
│   ├── utils/
│   │   └── indexedDB.js                # IndexedDB 数据库操作工具
│   ├── views/
│   │   ├── ConfigView.vue              # 配置管理页面
│   │   ├── MilestoneView.vue           # 项目里程碑页面
│   │   ├── TodoView.vue                # 待办事项页面
│   │   ├── OverviewView.vue            # 项目总览页面
│   │   ├── ReportView.vue              # 预测与周报页面
│   │   └── DataManagementView.vue      # 数据管理页面
│   ├── App.vue                         # 根组件
│   └── main.js                         # 入口文件
├── index.html                          # HTML 模板
├── package.json                        # 项目配置
└── vite.config.js                      # Vite 配置
```

## 核心功能模块

### 1. 项目里程碑管理 (`MilestoneView.vue`)

**功能描述**: 管理项目的商业决策点和技术决策点，支持版本管理。

**主要功能**:
- 商业决策点管理（CDCP、PDCP、ADCP、LDCP）
- 技术决策点管理（TR1-TR6、TR4A）
  - 注意：TR1、TR2、TR3 已合并为 TR123 统一管理
- 软件版本管理（添加、编辑、删除版本）
- 版本与待办事项关联
- 横向时间轴可视化展示（使用 `HorizontalTimeline.vue` 组件）
- 当前时间节点标记和动画效果

**关键操作**:
- 添加/编辑/删除里程碑
- 添加/编辑/删除版本
- 版本号必须递增（如 SP001, SP002, SP003）
- 可以将待办事项关联到版本
- 点击版本查看关联的任务列表

### 2. 待办事项管理 (`TodoView.vue`)

**功能描述**: 完整的任务管理系统，支持多维度筛选和数据导出。

**主要功能**:
- 完整的 CRUD 操作（增删改查）
- 多维度筛选：项目、分类、优先级、状态、责任人
- 进度跟踪（完成度百分比 0-100%）
- 鼠标悬停显示进展和备注
- 数据导出功能（CSV 格式）

**任务属性**:
- 名称、项目、责任人
- 分类：版本、需求、事务、问题
- 优先级：高、中、低
- 状态：未开始、进行中、已完成、已关闭
- 计划日期、实际日期
- 进度文本、备注

### 3. 项目总览 (`OverviewView.vue`)

**功能描述**: 提供项目的整体统计概览和健康度评估。

**主要功能**:
- 项目统计概览
- 决策点总览
- 版本信息汇总
- 待办事项统计
- 优先级和分类分布
- 项目健康度评估

**健康度评分算法**:
- 基础分：100 分
- 逾期任务：每个扣 10 分
- 高优先级未完成任务：每个扣 5 分
- 评分等级：
  - 80-100 分：良好
  - 60-79 分：一般
  - 0-59 分：风险

### 4. 预测与周报 (`ReportView.vue`)

**功能描述**: 生成项目周报和风险预警。

**主要功能**:
- 项目筛选和多项目周报展示
- 自动生成本周进展（基于待办事项状态）
- 里程碑节点跟踪（本周和下周的关键节点）
- 风险识别和预警：
  - 逾期任务检测
  - 即将到期任务提醒
  - 高优先级未开始任务
  - 进度滞后任务识别
- 周报数据持久化存储

### 5. 配置管理 (`ConfigView.vue`)

**功能描述**: 管理系统配置和基础数据。

**主要功能**:
- 项目配置管理（添加、编辑、删除项目）
- 责任人配置管理（添加、编辑、删除责任人）
- 页面可见性配置（控制哪些菜单项显示）
- 三种主题切换（默认、暗色、蓝色）
- 关于信息展示（版本、发布时间、作者、联系方式）

### 6. 数据管理 (`DataManagementView.vue`)

**功能描述**: 数据的备份、恢复和重置。

**主要功能**:
- 导出数据（JSON 格式，包含所有业务数据）
- 导入数据（从 JSON 文件恢复）
- 重置为默认数据（清除所有数据并恢复示例数据）

## 核心数据结构

### 项目 (Project)
```javascript
{
  id: Number,           // 项目 ID
  name: String          // 项目名称
}
```

### 责任人 (Owner)
```javascript
{
  id: Number,           // 责任人 ID
  name: String          // 责任人姓名
}
```

### 里程碑 (Milestone)
```javascript
{
  id: Number,                      // 里程碑 ID
  projectId: Number,               // 关联的项目 ID
  projectName: String,             // 项目名称
  cdc: String,                     // 商业决策点 CDCP (格式: 2026/01/15)
  pdc: String,                     // 商业决策点 PDCP
  adc: String,                     // 商业决策点 ADCP
  ldc: String,                     // 商业决策点 LDCP
  tr123: String,                   // 技术决策点 TR123 (合并了 TR1/2/3)
  tr4: String,                     // 技术决策点 TR4
  tr4a: String,                    // 技术决策点 TR4A
  tr5: String,                     // 技术决策点 TR5
  tr6: String,                     // 技术决策点 TR6
  versions: Array<Version>         // 版本列表
}
```

### 版本 (Version)
```javascript
{
  id: Number,           // 版本 ID
  version: String,      // 版本号 (如 SP001, SP002)
  releaseDate: String,  // 发布日期 (格式: 2026/03/10)
  tasks: Array<Number>  // 关联的任务 ID 列表
}
```

### 待办事项 (Task)
```javascript
{
  id: Number,           // 任务 ID
  name: String,         // 任务名称
  projectId: Number,    // 项目 ID
  projectName: String,  // 项目名称
  category: String,     // 分类：版本/需求/事务/问题
  priority: String,     // 优先级：高/中/低
  status: String,       // 状态：未开始/进行中/已完成/已关闭
  progress: Number,     // 进度 (0-100)
  ownerId: Number,      // 责任人 ID
  ownerName: String,    // 责任人姓名
  planDate: String,     // 计划日期 (格式: 02/28)
  actualDate: String,   // 实际日期 (格式: 02/25)
  progressText: String, // 进度文本
  remark: String        // 备注
}
```

## 核心业务逻辑 (Pinia Store)

### 数据管理
- `initData()`: 初始化数据，从 IndexedDB 加载或使用默认数据
- `exportData()`: 导出所有数据为 JSON
- `importData(data)`: 从 JSON 导入数据
- `resetToDefault()`: 重置为默认数据

### 项目管理
- `addProject(name)`: 添加项目（检查重复）
- `deleteProject(id)`: 删除项目
- `updateProject(id, name)`: 更新项目名称（检查重复）

### 责任人管理
- `addOwner(name)`: 添加责任人（检查重复）
- `deleteOwner(id)`: 删除责任人
- `updateOwner(id, name)`: 更新责任人姓名（检查重复）

### 里程碑管理
- `addMilestone(milestone)`: 添加里程碑
- `updateMilestone(id, data)`: 更新里程碑
- `deleteMilestone(id)`: 删除里程碑

### 版本管理
- `addVersion(milestoneId, versionData)`: 添加版本
- `deleteVersion(milestoneId, versionId)`: 删除版本
- `updateVersion(milestoneId, versionId, data)`: 更新版本
- `isVersionExists(projectId, versionName, excludeVersionId)`: 检查版本号是否已存在
- `isVersionNumberIncrement(projectId, newVersionName, excludeVersionId)`: 检查版本号是否递增

### 待办事项管理
- `addTask(taskData)`: 添加任务
- `updateTask(id, data)`: 更新任务
- `deleteTask(id)`: 删除任务（会从所有版本中移除关联）
- `getTasksByVersion(versionId)`: 获取版本关联的任务
- `getVersionsByTaskId(taskId)`: 获取任务关联的所有版本
- `removeTaskFromVersion(versionId, taskId)`: 从版本中移除任务
- `isTaskLinkedToOtherVersions(taskId, excludeVersionId)`: 检查任务是否被其他版本关联
- `checkTasksLinkedStatus(taskIds, excludeVersionId)`: 批量检查任务关联状态

### 项目健康度
- `calculateProjectHealth(projectId)`: 计算项目健康度
- `getCriticalTasks(projectId)`: 获取关键事务（高优先级未完成）
- `getRiskWarnings(projectId)`: 获取风险预警

### 辅助方法
- `getProjectById(id)`: 根据 ID 获取项目
- `getOwnerById(id)`: 根据 ID 获取责任人
- `getMilestoneByProjectId(projectId)`: 根据项目 ID 获取里程碑
- `getTasksByProjectId(projectId)`: 根据项目 ID 获取任务

## 数据存储

**存储方式**: IndexedDB + LocalStorage

**数据库名**: `MilestoneMasterDB`

**对象存储**:
- `projects`: 项目数据
- `owners`: 责任人数据
- `milestones`: 里程碑数据
- `tasks`: 待办事项数据
- `settings`: 系统设置（如主题）

**LocalStorage 存储**:
- `pageVisibilityConfig`: 页面可见性配置
- `weeklyReport_${projectId}`: 周报数据

**特点**:
- 数据持久化存储在浏览器中
- 单机系统，无需服务器
- 清除浏览器数据会丢失所有数据
- 建议定期导出数据作为备份

## 主题系统

支持三种主题：
1. **默认主题** (default): 浅色主题
2. **暗色主题** (dark): 深色主题，所有组件完美适配
3. **蓝色主题** (blue): 蓝色主题

**主题实现**:
- 使用 CSS 变量定义颜色
- 通过 body 类名切换主题
- 所有组件使用 CSS 变量，确保主题一致性
- Element Plus 组件通过全局样式覆盖适配暗色主题

**CSS 变量**:
- `--primary-color`: 主色调
- `--bg-color`: 背景色
- `--card-bg`: 卡片背景色
- `--text-color`: 主文字颜色
- `--text-color-secondary`: 次要文字颜色
- `--text-color-regular`: 常规文字颜色
- `--border-color`: 边框颜色
- `--hover-bg`: 悬停背景色

## 开发命令

```bash
npm install           # 安装依赖
npm run dev           # 启动开发服务器 (http://localhost:3000)
npm run build         # 构建生产版本
npm run preview       # 预览生产构建
```

## 重要注意事项

1. **版本号规则**: 版本号必须递增，如 SP001, SP002, SP003。系统会自动验证。
2. **数据迁移**: 系统支持从旧版本数据迁移（将 tr1, tr2, tr3 合并为 tr123）。
3. **任务关联**: 一个任务可以关联到多个版本，删除任务时会自动从所有版本中移除关联。
4. **数据备份**: 由于是单机系统，建议定期使用数据管理功能导出备份。
5. **日期格式**:
   - 里程碑决策点: `2026/01/15`
   - 待办事项日期: `02/28` (省略年份，默认为 2026 年)
6. **健康度计算**: 逾期任务和高优先级未完成任务会影响健康度评分。
7. **主题适配**: 所有页面和组件都已完美适配三种主题，特别是暗色主题。

## 常见问题

**Q: 如何添加新的项目？**
A: 在"配置管理"页面，点击"添加项目"按钮。

**Q: 如何将任务关联到版本？**
A: 在"项目里程碑"页面，点击版本后的"关联任务"按钮，选择要关联的任务。

**Q: 版本号有什么限制？**
A: 版本号必须递增，不能重复。例如已有的版本是 SP001 和 SP002，新版本必须是 SP003 或更大。

**Q: 数据存储在哪里？**
A: 所有数据存储在浏览器的 IndexedDB 中，数据库名为 `MilestoneMasterDB`。

**Q: 如何备份数据？**
A: 在"数据管理"页面，点击"导出数据"按钮，将生成的 JSON 文件保存即可。

**Q: 如何恢复数据？**
A: 在"数据管理"页面，点击"导入数据"按钮，选择之前导出的 JSON 文件。

**Q: 如果数据损坏了怎么办？**
A: 可以在"数据管理"页面点击"重置为默认数据"，这将清除所有数据并恢复示例数据。

**Q: 暗色主题下有些文字看不清怎么办？**
A: V1.0.008 版本已修复所有暗色主题显示问题，所有文字和背景都已完美适配。

## 开发指南

### 添加新功能

1. 在 `stores/index.js` 中添加状态和方法
2. 在对应的 `views/` 文件中实现 UI
3. 如需全局配置，在 `ConfigView.vue` 中添加配置项
4. 如需新页面，在 `router/index.js` 中添加路由

### 修改数据结构

1. 更新 `stores/index.js` 中的默认数据
2. 如需数据迁移，在 `initData()` 方法中添加迁移逻辑
3. 更新相关视图组件

### 添加新主题

1. 在 `App.vue` 中添加主题选项
2. 在 `src/styles/global.css` 中定义主题 CSS 变量
3. 为 Element Plus 组件添加主题样式覆盖
4. 确保所有组件使用 CSS 变量而非硬编码颜色

## 许可证

MIT License
