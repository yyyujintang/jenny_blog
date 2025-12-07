# jenny_blog

Jenny's blog.

一个使用 Next.js 14 构建的现代化个人博客。

## 特性

- ✨ 基于 Next.js 14 App Router
- 📝 支持 Markdown/MDX 写文章
- 🎨 使用 Tailwind CSS 样式
- 🌙 自动深色模式支持
- 📱 完全响应式设计
- 🚀 可轻松部署到 Vercel

## 快速开始

### 安装依赖

```bash
npm install
```

### 开发模式

```bash
npm run dev
```

打开 [http://localhost:3000](http://localhost:3000) 查看效果。

### 构建生产版本

```bash
npm run build
npm start
```

## 写文章

在 `content/posts/` 目录下创建 `.mdx` 文件。每篇文章需要包含 frontmatter：

```yaml
---
title: 文章标题
date: 2024-01-15
excerpt: 文章摘要
tags:
  - 标签1
  - 标签2
---
```

然后就可以开始写你的文章内容了！

## 部署到 Vercel

### 方法一：通过 GitHub（推荐）

1. 将代码推送到 GitHub 仓库
2. 访问 [Vercel](https://vercel.com)
3. 点击 "Import Project"
4. 选择你的 GitHub 仓库
5. Vercel 会自动检测 Next.js 项目并完成部署

### 方法二：通过 Vercel CLI

```bash
npm i -g vercel
vercel
```

部署后，每次推送到 GitHub 主分支，Vercel 会自动重新部署。

## 项目结构

```
blog/
├── app/              # Next.js App Router 页面
│   ├── posts/       # 文章详情页
│   ├── layout.tsx   # 根布局
│   ├── page.tsx     # 首页
│   └── globals.css  # 全局样式
├── content/         # 博客文章
│   └── posts/      # 文章 MDX 文件
├── lib/            # 工具函数
│   └── posts.ts    # 文章读取逻辑
└── public/         # 静态资源
```

## 自定义

- 修改 `app/layout.tsx` 中的 metadata 来更改网站标题和描述
- 修改 `app/page.tsx` 来自定义首页布局
- 修改 `tailwind.config.ts` 来自定义主题颜色
- 在 `content/posts/` 中添加你的文章

## 技术栈

- [Next.js 14](https://nextjs.org/) - React 框架
- [TypeScript](https://www.typescriptlang.org/) - 类型安全
- [Tailwind CSS](https://tailwindcss.com/) - 样式框架
- [gray-matter](https://github.com/jonschlinkert/gray-matter) - 解析 frontmatter
- [react-markdown](https://github.com/remarkjs/react-markdown) - Markdown 渲染
- [date-fns](https://date-fns.org/) - 日期格式化

## 许可证

MIT
