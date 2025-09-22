# 多语言支持 (Internationalization)

## 概述

此项目现在支持多语言切换，包括：
- 🇨🇳 简体中文 (默认)
- 🇺🇸 English
- 🇯🇵 日本語

## 功能特性

- 自动检测浏览器语言设置
- 语言偏好保存到本地存储
- 实时语言切换，无需刷新页面
- 完整的界面翻译（包括所有组件、表单验证和提示信息）

## 如何使用

### 切换语言
1. 进入设置中心
2. 在"语言设置"部分选择您喜欢的语言
3. 界面将立即切换到选择的语言

### 添加新语言

1. 在 `src/locales/` 目录下创建新的语言文件（如 `fr.json` 用于法语）
2. 复制现有语言文件的结构，翻译所有文本
3. 在 `src/i18n.ts` 中添加新的语言资源
4. 在 `src/contexts/LanguageContext.tsx` 中的 `availableLanguages` 数组中添加新语言

### 开发者使用

在组件中使用翻译：

```tsx
import { useTranslation } from 'react-i18next';

const MyComponent = () => {
  const { t } = useTranslation();
  
  return (
    <div>
      <h1>{t('app.title')}</h1>
      <p>{t('app.subtitle')}</p>
    </div>
  );
};
```

带参数的翻译：

```tsx
// 语言文件中
"welcome": "欢迎, {{name}}!"

// 组件中
<span>{t('welcome', { name: userName })}</span>
```

## 文件结构

```
src/
├── locales/          # 语言文件
│   ├── zh.json       # 中文
│   ├── en.json       # 英文
│   └── ja.json       # 日文
├── contexts/
│   └── LanguageContext.tsx  # 语言上下文
├── components/
│   └── LanguageSelector.tsx # 语言选择器
└── i18n.ts          # i18n 配置
```

## 语言文件结构

所有语言文件都遵循相同的JSON结构：

```json
{
  "app": {
    "title": "应用标题",
    "subtitle": "应用副标题"
  },
  "nav": {
    "today": "今日",
    "habits": "习惯",
    // ...
  },
  "auth": {
    "signIn": "登录",
    "signUp": "注册",
    // ...
  },
  // ...
}
```

## 技术实现

- **react-i18next**: 主要的国际化库
- **i18next-browser-languagedetector**: 自动检测浏览器语言
- **localStorage**: 保存用户语言偏好
- **React Context**: 管理全局语言状态

## 注意事项

- 语言偏好存储在 `localStorage` 中的 `habitFlywheel_language` 键
- 如果用户没有手动选择语言，系统会使用浏览器语言或默认为中文
- 所有表单验证错误消息也已国际化
- 确保新增的UI文本都要添加到所有语言文件中
