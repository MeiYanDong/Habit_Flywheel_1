# 习惯飞轮 - Habit Flywheel

> 基于能量系统的习惯管理应用，通过完成习惯获得能量，用能量兑换奖励，形成正向反馈循环

[![React](https://img.shields.io/badge/React-18.3.1-blue.svg)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-blue.svg)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-3.0+-38B2AC.svg)](https://tailwindcss.com/)
[![Vite](https://img.shields.io/badge/Vite-5.0+-646CFF.svg)](https://vitejs.dev/)

## 🌟 项目概述

习惯飞轮是一个现代化的习惯管理应用，采用独特的能量系统设计理念：
- 🎯 **完成习惯获得能量** - 每个习惯都有对应的能量值奖励
- 🎁 **消耗能量兑换奖励** - 用积累的能量兑换心仪的奖励
- 🔄 **形成正向循环** - 奖励激励持续完成习惯，形成飞轮效应
- 📊 **数据可视化** - 清晰展示习惯完成情况和能量变化

## ✨ 功能特色

### 🎨 设计系统
- **紫金黑主题配色** - 现代简约的视觉风格
- **Apple风格设计** - 圆角卡片、优雅动画、精致阴影
- **深色模式支持** - 完整的亮/暗主题切换
- **响应式布局** - 完美适配桌面端、平板和手机
- **PWA支持** - 可安装到主屏幕，支持离线使用

### ⚙️ 核心功能

#### 已实现功能 ✅
- **设置中心** - 完整的用户偏好设置
  - 通知开关控制
  - 深色模式切换
  - 界面显示选项
  - 数据导入/导出
  - 应用信息展示

#### 规划中功能 🚧
- **今日习惯管理** - 快速打卡和进度跟踪
- **习惯管理系统** - 创建、编辑、分类管理习惯
- **奖励管理系统** - 设置奖励项和兑换机制
- **绑定管理系统** - 习惯与奖励的智能绑定
- **历史记录系统** - 完整的数据统计和可视化

#### PWA 功能 📱
- **应用安装** - 可以安装到手机和电脑主屏幕
- **离线使用** - 支持离线访问和数据缓存
- **自动更新** - 应用版本自动更新提示
- **跨平台** - Android、iOS、Windows、macOS 全平台支持

## 🛠️ 技术栈

### 前端框架
- **React 18.3.1** - 现代化的用户界面库
- **TypeScript** - 类型安全的开发体验
- **Vite** - 快速的构建工具和开发服务器

### UI 组件库
- **shadcn/ui** - 高质量的 React 组件库
- **Radix UI** - 无障碍的原始组件
- **Tailwind CSS** - 原子化 CSS 框架
- **Lucide React** - 美观的图标库

### 状态管理
- **React Context** - 全局状态管理
- **TanStack Query** - 服务器状态管理
- **localStorage** - 本地数据持久化

### 路由和工具
- **React Router DOM** - 单页应用路由
- **date-fns** - 日期处理工具
- **clsx** - 条件类名工具
- **zod** - 运行时类型验证

## 🚀 快速开始

### 环境要求
- Node.js 18.0 或更高版本
- npm、yarn 或 pnpm 包管理器

### 安装步骤

1. **克隆项目**
```bash
git clone <YOUR_GIT_URL>
cd <YOUR_PROJECT_NAME>
```

2. **安装依赖**
```bash
npm install
# 或
yarn install
# 或
pnpm install
```

3. **启动开发服务器**
```bash
npm run dev
# 或
yarn dev
# 或
pnpm dev
```

4. **打开浏览器**
访问 `http://localhost:5173` 查看应用

### 构建部署

```bash
# 构建生产版本
npm run build

# 预览构建结果
npm run preview
```

## 📁 项目结构

```
src/
├── components/           # 可复用组件
│   ├── ui/              # shadcn/ui 基础组件
│   ├── SettingsCenter.tsx  # 设置中心
│   ├── HabitForm.tsx       # 习惯表单
│   ├── RewardForm.tsx      # 奖励表单
│   ├── BindingManager.tsx  # 绑定管理
│   └── HistoryView.tsx     # 历史记录
├── contexts/            # React Context
│   └── SettingsContext.tsx # 设置状态管理
├── hooks/              # 自定义 Hooks
│   └── use-toast.ts    # Toast 通知
├── lib/                # 工具函数
│   └── utils.ts        # 通用工具
├── pages/              # 页面组件
│   ├── Index.tsx       # 主页面
│   └── NotFound.tsx    # 404 页面
├── App.tsx             # 应用根组件
├── main.tsx            # 应用入口
└── index.css           # 全局样式
```

## 🎨 设计规范

### 颜色系统
```css
/* 主题色 */
--primary: 124 58 237      /* 紫色 #7C3AED */
--secondary: 245 158 11    /* 金色 #F59E0B */
--accent: 31 41 55         /* 深色 #1F2937 */

/* 功能色 */
--success: 16 185 129      /* 绿色 #10B981 */
--warning: 245 158 11      /* 琥珀色 #F59E0B */
--destructive: 239 68 68   /* 红色 #EF4444 */
```

### 布局规范
- **侧边栏宽度**: 264px (w-64)
- **内容边距**: 24px (p-6)
- **卡片圆角**: 12px (rounded-xl)
- **响应式断点**: sm(640px) / md(768px) / lg(1024px) / xl(1280px)

### 组件规范
- **按钮高度**: 40px (h-10)
- **输入框高度**: 40px (h-10)
- **卡片间距**: 16px (gap-4)
- **文字大小**: 标题(text-2xl) / 正文(text-base) / 说明(text-sm)

## 🔧 开发指南

### 添加新功能
1. 在 `src/components/` 创建新组件
2. 在 `src/pages/Index.tsx` 中添加路由
3. 更新侧边栏导航菜单
4. 添加相应的状态管理逻辑

### 自定义主题
修改 `src/index.css` 中的 CSS 变量：
```css
:root {
  --primary: your-color-values;
  --secondary: your-color-values;
}
```

### 添加新页面
1. 在 `src/pages/` 创建页面组件
2. 在 `src/App.tsx` 添加路由配置
3. 更新导航菜单链接

## 📊 数据模型

### 习惯数据结构
```typescript
interface Habit {
  id: string;
  name: string;
  description?: string;
  energyValue: number;
  frequency: 'daily' | 'weekly' | 'monthly';
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}
```

### 奖励数据结构
```typescript
interface Reward {
  id: string;
  name: string;
  description?: string;
  requiredEnergy: number;
  isRedeemed: boolean;
  redeemedAt?: Date;
  createdAt: Date;
}
```

### 完成记录结构
```typescript
interface HabitCompletion {
  id: string;
  habitId: string;
  completedAt: Date;
  energyEarned: number;
}
```

## 🚀 部署指南

### Vercel 部署
1. 连接 GitHub 仓库到 Vercel
2. 选择 React 项目模板
3. 自动部署完成

### Netlify 部署
1. 上传构建文件到 Netlify
2. 配置构建命令: `npm run build`
3. 发布目录: `dist`

### 使用 Lovable 部署
1. 在 Lovable 编辑器中点击 "Publish" 按钮
2. 选择部署选项
3. 获得在线访问链接

## 🤝 贡献指南

欢迎提交 Issue 和 Pull Request！

### 开发流程
1. Fork 项目仓库
2. 创建功能分支: `git checkout -b feature/amazing-feature`
3. 提交更改: `git commit -m 'Add amazing feature'`
4. 推送分支: `git push origin feature/amazing-feature`
5. 提交 Pull Request

### 代码规范
- 使用 TypeScript 严格模式
- 遵循 ESLint 配置规则
- 组件使用 PascalCase 命名
- 文件使用 camelCase 命名
- 提交信息使用英文

## 📝 更新日志

### v2.0.0 (当前版本)
- ✅ 完整的设置中心功能
- ✅ 深色模式支持
- ✅ 响应式布局设计
- ✅ 数据导入/导出功能
- 🚧 习惯管理功能开发中
- 🚧 奖励系统开发中

## 📞 联系方式

- **项目地址**: [Lovable Project](https://lovable.dev/projects/7647561c-2325-46c5-b13f-87cd5b478872)
- **在线预览**: 点击 Lovable 项目链接查看
- **技术支持**: 通过 Lovable 平台联系

## 📄 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情

---

⭐ 如果这个项目对你有帮助，请给它一个 Star！

💡 有任何建议或问题，欢迎提交 Issue 讨论

🚀 让我们一起构建更好的习惯管理体验！

## 🔧 最近更新

### v2.7.1 - 修复多习惯绑定奖励的并发问题

**问题描述：**
当多个习惯绑定到同一个奖励时，如果这些习惯几乎同时完成打卡，第二个（或后续）习惯获得的奖励能量可能无法正确添加到奖励上。

**根本原因：**
并发竞态条件（Race Condition）- 多个打卡操作同时读取和更新同一个奖励的能量值，导致后面的更新覆盖前面的更新。

**修复方案：**

1. **后端逻辑优化（`useHabits.tsx`）：**
   - 实现乐观锁机制，使用当前能量值作为更新条件
   - 添加重试机制（最多3次，间隔100ms）处理并发冲突
   - 分离用户总能量和奖励能量的更新逻辑

2. **前端状态同步（`Index.tsx`）：**
   - 打卡成功后同时刷新习惯完成记录和奖励数据
   - 完善乐观更新和错误回滚机制
   - 确保UI状态与后端数据的一致性

**技术特点：**
- ✅ 原子性更新操作
- ✅ 并发安全保障
- ✅ 自动重试机制
- ✅ 完整错误处理
- ✅ 乐观UI更新
