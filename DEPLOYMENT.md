# GitHub Pages 部署指南

## 🚀 自动部署设置

### 1. 启用 GitHub Pages

1. 进入你的 GitHub 仓库
2. 点击 `Settings` 标签
3. 在左侧菜单中找到 `Pages`
4. 在 `Source` 部分选择 `GitHub Actions`

### 2. 推送代码

```bash
# 添加所有文件
git add .

# 提交更改
git commit -m "Add GitHub Actions workflow for auto-deployment"

# 推送到 GitHub
git push origin main
```

### 3. 查看部署状态

1. 进入仓库的 `Actions` 标签
2. 查看 `Deploy to GitHub Pages` workflow 的运行状态
3. 等待部署完成（通常需要 2-5 分钟）

### 4. 访问网站

部署成功后，你的网站将在以下地址可访问：
- `https://lawliet-chan.github.io`

## 🔧 故障排除

### 常见问题

1. **部署失败**
   - 检查 GitHub Actions 日志
   - 确保所有文件路径正确
   - 验证 Markdown 文件格式

2. **网站无法访问**
   - 等待 5-10 分钟让 DNS 传播
   - 检查仓库是否为公开（Public）
   - 确认仓库名格式为 `用户名.github.io`

3. **图片不显示**
   - 检查图片文件路径
   - 确保图片文件已提交到仓库
   - 验证图片文件大小（建议小于 1MB）

### 手动部署（备用方案）

如果自动部署有问题，可以使用手动部署：

1. 在 `Settings` → `Pages` 中
2. 选择 `Deploy from a branch`
3. 选择 `main` 分支
4. 选择 `/ (root)` 文件夹

## 📝 更新内容

每次更新网站内容后：

1. 修改本地文件
2. 提交更改：
   ```bash
   git add .
   git commit -m "Update website content"
   git push origin main
   ```
3. GitHub Actions 会自动重新部署

## 🎯 最佳实践

1. **定期备份** - 定期备份你的网站文件
2. **测试本地** - 在推送前先在本地测试
3. **小步提交** - 频繁提交小的更改而不是大的批量更新
4. **监控部署** - 关注 GitHub Actions 的部署状态

---

**提示**: 首次部署可能需要 10-15 分钟，后续更新通常只需要 2-5 分钟。
