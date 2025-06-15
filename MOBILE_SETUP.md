
# 移动端开发指南

## iOS 和 Android 应用（使用 Capacitor）

### 1. 导出项目到 GitHub
1. 点击 "Export to Github" 按钮
2. 从 GitHub 克隆项目到本地

### 2. 安装依赖
```bash
npm install
```

### 3. 添加移动平台
```bash
# 添加 iOS 平台（需要 macOS 和 Xcode）
npx cap add ios

# 添加 Android 平台（需要 Android Studio）
npx cap add android
```

### 4. 构建和同步
```bash
# 构建项目
npm run build

# 同步到原生平台
npx cap sync
```

### 5. 运行应用
```bash
# 在 iOS 模拟器/设备上运行
npx cap run ios

# 在 Android 模拟器/设备上运行
npx cap run android
```

## 微信小程序

### 1. 准备工作
1. 下载并安装微信开发者工具
2. 注册微信小程序账号，获取 AppID

### 2. 导入项目
1. 打开微信开发者工具
2. 选择 "导入项目"
3. 选择 `miniprogram` 文件夹作为项目目录
4. 输入您的 AppID
5. 点击 "导入"

### 3. 配置项目
1. 修改 `miniprogram/project.config.json` 中的 `appid` 字段
2. 根据需要调整 `miniprogram/app.json` 中的配置

### 4. 开发和调试
1. 在微信开发者工具中进行开发
2. 使用模拟器测试功能
3. 真机预览和调试

### 注意事项
- 小程序有特殊的 API 限制，需要根据微信小程序规范进行适配
- 网络请求需要在小程序后台配置服务器域名
- 某些 Web API 在小程序中不可用，需要使用对应的小程序 API

## 推荐阅读
建议阅读我们的移动开发博客文章了解更多详情：
https://lovable.dev/blogs/TODO
