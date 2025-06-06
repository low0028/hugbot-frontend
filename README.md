## 项目简介
这是虚拟陪伴智能体系统的前端模块，旨在提供与用户的交互界面，包括情感对话、情绪检测触发的星空疗愈空间以及安慰语展示等功能。本模块基于原生HTML/CSS/JavaScript开发，集成了MediaPipe用于手部追踪，支持多模态交互体验。

## 主要功能
- **对话界面**：用户可以在对话框中输入情感文本，系统通过后端API获取情绪检测和AI回复。
- **情绪检测触发**：当检测到显著负面情绪时，自动推荐用户进入星空疗愈空间。
- **星空疗愈空间**：用户可通过手势捕捉星星，系统随机显示安慰语。
- **数据导出**：支持导出用户交互数据（CSV格式）。
- **本地交互日志**：通过localStorage保存用户的操作历史。

## 文件结构
frontend/
- index.html # 主界面
- style.css # 样式文件
- app.js # 前端交互逻辑（核心代码）
- assets/ # 图片、星空背景等资源
- README.md # 项目说明文件（本文件）

系统界面入口网址：https://low0028.github.io/hugbot-frontend/
