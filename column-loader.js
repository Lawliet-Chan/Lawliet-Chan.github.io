// 专栏专用加载器
class ColumnLoader {
    constructor(category) {
        this.category = category;
        this.articles = [];
        this.currentFilter = 'all';
        this.init();
    }

    async init() {
        try {
            // 显示加载状态
            this.showLoadingState();
            
            // 加载文章
            await this.loadArticles();
            
            // 渲染文章
            this.renderArticles();
            
            // 绑定事件
            this.bindEvents();
            
            // 更新统计
            this.updateStats();
            
            // 隐藏加载状态
            this.hideLoadingState();
        } catch (error) {
            console.error('初始化专栏加载器时出错:', error);
            this.showErrorState();
        }
    }

    // 加载文章
    async loadArticles() {
        try {
            const fileList = this.getFileList();
            
            for (const fileName of fileList) {
                if (fileName.endsWith('.md')) {
                    const article = await this.loadArticle(fileName);
                    if (article) {
                        this.articles.push(article);
                    }
                }
            }

            // 按日期排序
            this.articles.sort((a, b) => new Date(b.date) - new Date(a.date));
        } catch (error) {
            console.error(`加载 ${this.category} 文章时出错:`, error);
        }
    }

    // 获取文件列表
    getFileList() {
        const fileLists = {
            stories: ['火星司法档案.md'],
            tech: [],
            philosophy: []
        };
        return fileLists[this.category] || [];
    }

    // 加载单个文章
    async loadArticle(fileName) {
        try {
            const response = await fetch(`articles/${this.category}/${fileName}`);
            if (!response.ok) {
                throw new Error(`无法加载文章: ${fileName}`);
            }

            const markdown = await response.text();
            return this.parseMarkdown(markdown, fileName);
        } catch (error) {
            console.error(`加载文章 ${fileName} 时出错:`, error);
            return null;
        }
    }

    // 解析Markdown
    parseMarkdown(markdown, fileName) {
        try {
            const parts = markdown.split('---');
            if (parts.length < 3) {
                return this.parseSimpleMarkdown(markdown, fileName);
            }

            const frontmatter = parts[1];
            const content = parts.slice(2).join('---').trim();

            const metadata = this.parseFrontmatter(frontmatter);
            const htmlContent = this.markdownToHtml(content);

            return {
                id: this.generateId(fileName),
                title: metadata.title || this.extractTitleFromContent(content),
                category: metadata.category || this.category,
                summary: metadata.summary || this.extractSummary(content),
                content: htmlContent,
                rawContent: content,
                tags: metadata.tags || [],
                date: metadata.date || new Date().toISOString(),
                fileName: fileName
            };
        } catch (error) {
            console.error(`解析Markdown时出错:`, error);
            return this.parseSimpleMarkdown(markdown, fileName);
        }
    }

    // 解析frontmatter
    parseFrontmatter(frontmatter) {
        const metadata = {};
        const lines = frontmatter.trim().split('\n');
        
        for (const line of lines) {
            const colonIndex = line.indexOf(':');
            if (colonIndex > 0) {
                const key = line.substring(0, colonIndex).trim();
                let value = line.substring(colonIndex + 1).trim();
                
                if (value.startsWith('"') && value.endsWith('"')) {
                    value = value.slice(1, -1);
                }
                
                if (value.startsWith('[') && value.endsWith(']')) {
                    value = value.slice(1, -1).split(',').map(item => item.trim().replace(/"/g, ''));
                }
                
                metadata[key] = value;
            }
        }
        
        return metadata;
    }

    // 简单Markdown解析
    parseSimpleMarkdown(markdown, fileName) {
        const lines = markdown.split('\n');
        let title = '';
        
        for (const line of lines) {
            if (line.startsWith('# ')) {
                title = line.substring(2).trim();
                break;
            }
        }
        
        return {
            id: this.generateId(fileName),
            title: title || this.getTitleFromFileName(fileName),
            category: this.category,
            summary: this.extractSummary(markdown),
            content: this.markdownToHtml(markdown),
            rawContent: markdown,
            tags: [],
            date: new Date().toISOString(),
            fileName: fileName
        };
    }

    // 从文件名获取标题
    getTitleFromFileName(fileName) {
        return fileName.replace('.md', '');
    }

    // 提取摘要
    extractSummary(content) {
        const lines = content.split('\n');
        for (const line of lines) {
            const trimmed = line.trim();
            if (trimmed && !trimmed.startsWith('#') && !trimmed.startsWith('---')) {
                return trimmed.length > 100 ? trimmed.substring(0, 100) + '...' : trimmed;
            }
        }
        return '暂无摘要';
    }

    // 从内容提取标题
    extractTitleFromContent(content) {
        const lines = content.split('\n');
        for (const line of lines) {
            if (line.startsWith('# ')) {
                return line.substring(2).trim();
            }
        }
        return '无标题';
    }

    // 生成ID
    generateId(fileName) {
        return fileName.replace(/[^a-zA-Z0-9]/g, '_') + '_' + Date.now();
    }

    // Markdown转HTML
    markdownToHtml(markdown) {
        let html = markdown;
        
        html = html.replace(/^### (.*$)/gim, '<h3>$1</h3>');
        html = html.replace(/^## (.*$)/gim, '<h2>$1</h2>');
        html = html.replace(/^# (.*$)/gim, '<h1>$1</h1>');
        
        html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
        html = html.replace(/\*(.*?)\*/g, '<em>$1</em>');
        
        html = html.replace(/^\d+\. (.*$)/gim, '<li>$1</li>');
        html = html.replace(/^- (.*$)/gim, '<li>$1</li>');
        
        html = html.replace(/\n\n/g, '</p><p>');
        html = '<p>' + html + '</p>';
        
        html = html.replace(/<p><\/p>/g, '');
        
        return html;
    }

    // 渲染文章
    renderArticles() {
        const container = document.getElementById(`${this.category}-list`);
        if (!container) return;

        const filteredArticles = this.getFilteredArticles();
        
        if (filteredArticles.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-${this.getCategoryIcon()}"></i>
                    <h3>没有找到符合条件的文章</h3>
                    <p>请尝试其他筛选条件</p>
                </div>
            `;
            return;
        }

        container.innerHTML = filteredArticles.map(article => this.renderArticleCard(article)).join('');
    }

    // 获取筛选后的文章
    getFilteredArticles() {
        return this.articles;
    }

    // 渲染文章卡片
    renderArticleCard(article) {
        return `
            <div class="article-card" data-id="${article.id}" onclick="columnLoader.viewArticle('${article.id}')">
                <div class="article-header">
                    <h3>${article.title}</h3>
                    <div class="article-date">${this.formatDate(article.date)}</div>
                </div>
                <div class="article-excerpt">${article.summary}</div>
                <div class="article-footer">
                    <button class="btn btn-outline btn-sm">阅读全文</button>
                </div>
            </div>
        `;
    }

    // 查看文章
    viewArticle(articleId) {
        const article = this.getArticle(articleId);
        if (!article) return;

        this.showArticleModal(article);
    }

    // 获取文章
    getArticle(articleId) {
        return this.articles.find(article => article.id === articleId);
    }

    // 显示文章模态框
    showArticleModal(article) {
        const modal = document.getElementById('article-modal');
        const modalTitle = document.getElementById('modal-title');
        const modalMeta = document.getElementById('modal-meta');
        const modalContent = document.getElementById('modal-content');

        modalTitle.textContent = article.title;
        
        modalMeta.innerHTML = `
            <div class="meta-item">
                <i class="fas fa-folder"></i>
                <span>分类：${this.getCategoryName()}</span>
            </div>
            <div class="meta-item">
                <i class="fas fa-calendar"></i>
                <span>发布时间：${this.formatDate(article.date)}</span>
            </div>
        `;

        modalContent.innerHTML = article.content;
        modal.style.display = 'block';
    }

    // 关闭文章模态框
    closeArticleModal() {
        document.getElementById('article-modal').style.display = 'none';
    }

    // 更新统计信息
    updateStats() {
        const countElement = document.getElementById(`${this.category}-count`);
        
        if (countElement) {
            // 隐藏文章数量显示
            countElement.style.display = 'none';
        }
    }

    // 绑定事件
    bindEvents() {
        // 筛选按钮事件
        const filterButtons = document.querySelectorAll('.filter-btn');
        filterButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                // 移除所有active类
                filterButtons.forEach(btn => btn.classList.remove('active'));
                // 添加active类到当前按钮
                e.target.classList.add('active');
            });
        });
    }

    // 获取分类图标
    getCategoryIcon() {
        const icons = {
            stories: 'book-open',
            tech: 'code',
            philosophy: 'brain'
        };
        return icons[this.category] || 'file-alt';
    }

    // 获取分类名称
    getCategoryName() {
        const names = {
            stories: '小说故事',
            tech: '技术思考',
            philosophy: '政史哲思'
        };
        return names[this.category] || '文章';
    }

    // 格式化日期
    formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('zh-CN', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    }

    // 显示加载状态
    showLoadingState() {
        const container = document.getElementById(`${this.category}-list`);
        if (container) {
            container.innerHTML = `
                <div class="loading-state">
                    <i class="fas fa-spinner fa-spin"></i>
                    <h3>加载中...</h3>
                    <p>正在从文件夹加载文章...</p>
                </div>
            `;
        }
    }

    // 隐藏加载状态
    hideLoadingState() {
        // 加载状态会在renderArticles中被替换
    }

    // 显示错误状态
    showErrorState() {
        const container = document.getElementById(`${this.category}-list`);
        if (container) {
            container.innerHTML = `
                <div class="error-state">
                    <i class="fas fa-exclamation-triangle"></i>
                    <h3>加载失败</h3>
                    <p>无法加载文章，请刷新页面重试</p>
                    <button class="btn btn-primary" onclick="columnLoader.reload()">
                        <i class="fas fa-redo"></i>
                        重新加载
                    </button>
                </div>
            `;
        }
    }

    // 重新加载
    async reload() {
        try {
            this.articles = [];
            this.showLoadingState();
            await this.loadArticles();
            this.renderArticles();
            this.updateStats();
        } catch (error) {
            console.error('重新加载文章时出错:', error);
            this.showErrorState();
        }
    }
}

// 全局变量
let columnLoader;

// 页面加载完成后初始化对应的加载器
document.addEventListener('DOMContentLoaded', function() {
    // 延迟一点时间确保DOM完全准备好
    setTimeout(() => {
        // 根据当前页面确定专栏类型
        const path = window.location.pathname;
        let category = 'stories'; // 默认
        
        if (path.includes('tech.html')) {
            category = 'tech';
        } else if (path.includes('philosophy.html')) {
            category = 'philosophy';
        }
        
        // 创建对应的加载器
        columnLoader = new ColumnLoader(category);
    }, 100);
});

// 全局函数
function closeArticleModal() {
    if (columnLoader) {
        columnLoader.closeArticleModal();
    }
}
