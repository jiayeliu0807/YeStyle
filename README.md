# YeStyle

一个高保真的时尚穿搭 PWA App 原型，用于根据用户已有衣服，结合特定博主风格，自动匹配生成穿搭建议。

当前版本已经清空所有示例数据，页面会以“等待导入真实数据”的空状态展示。

## 运行方式

在当前文件夹执行：

```bash
python3 -m http.server 8000
```

然后打开：

```text
http://localhost:8000
```

## PWA 安装

部署到 HTTPS 环境后，例如 GitHub Pages，手机用户可以把 YeStyle 添加到主屏幕：

- iPhone：用 Safari 打开链接，点击分享按钮，选择“添加到主屏幕”。
- Android：用 Chrome 打开链接，点击菜单，选择“安装应用”或“添加到主屏幕”。

## 部署到 GitHub Pages

1. 创建一个 GitHub 仓库，例如 `yestyle`。
2. 上传当前文件夹内的全部文件。
3. 进入仓库 `Settings`。
4. 打开 `Pages`。
5. Source 选择 `Deploy from a branch`。
6. Branch 选择 `main`，Folder 选择 `/root`。
7. 保存后等待几分钟，GitHub 会生成访问链接。

## 已包含体验

- 首页：今日推荐、衣橱使用率、AI 穿搭洞察的空状态。
- 博主工坊：博主风格库空状态，预留真实博主资料入口。
- 我的衣橱：分类筛选、顶部和悬浮添加按钮，预留真实单品上传入口。
- 穿搭详情：搭配参考图、单品拆解、AI 风格逻辑的空状态。
- iOS 拟真操作菜单：相机拍照、相册选择、文件选择。
- PWA 支持：`manifest.webmanifest`、`service-worker.js`、App 图标。
