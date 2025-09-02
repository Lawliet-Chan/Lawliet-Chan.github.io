// Markdown加载器
class MarkdownLoader {
    constructor() {
        this.articles = {
            stories: [],
            tech: [],
            philosophy: []
        };
        this.init();
    }

    async init() {
        await this.loadAllArticles();
        this.renderArticles();
    }

    async loadAllArticles() {
        try {
            await this.loadArticlesFromFolder('stories');
            await this.loadArticlesFromFolder('tech');
            await this.loadArticlesFromFolder('philosophy');
        } catch (error) {
            console.error('加载文章时出错:', error);
        }
    }

    async loadArticlesFromFolder(category) {
        try {
            const fileList = this.getFileList(category);
            
            for (const fileName of fileList) {
                if (fileName.endsWith('.md')) {
                    const article = await this.loadArticle(category, fileName);
                    if (article) {
                        this.articles[category].push(article);
                    }
                }
            }

            this.articles[category].sort((a, b) => new Date(b.date) - new Date(a.date));
        } catch (error) {
            console.error(`加载 ${category} 文章时出错:`, error);
        }
    }

    getFileList(category) {
        const fileLists = {
            stories: ['山中的小屋.md', '城市的夜晚.md'],
            tech: ['人工智能的未来.md'],
            philosophy: ['正义的边界.md']
        };
        return fileLists[category] || [];
    }

    async loadArticle(category, fileName) {
        try {
            const response = await fetch(`articles/${category}/${fileName}`);
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
                category: metadata.category || this.getCategoryFromFileName(fileName),
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
            category: this.getCategoryFromFileName(fileName),
            summary: this.extractSummary(markdown),
            content: this.markdownToHtml(markdown),
            rawContent: markdown,
            tags: [],
            date: new Date().toISOString(),
            fileName: fileName
        };
    }

    getTitleFromFileName(fileName) {
        return fileName.replace('.md', '');
    }

    getCategoryFromFileName(fileName) {
        return 'stories';
    }

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

    extractTitleFromContent(content) {
        const lines = content.split('\n');
        for (const line of lines) {
            if (line.startsWith('# ')) {
                return line.substring(2).trim();
            }
        }
        return '无标题';
    }

    generateId(fileName) {
        return fileName.replace(/[^a-zA-Z0-9]/g, '_') + '_' + Date.now();
    }

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

    renderArticles() {
        this.renderCategory('stories');
        this.renderCategory('tech');
        this.renderCategory('philosophy');
        this.updateArticleCounts();
    }

    renderCategory(category) {
        const container = document.getElementById(`${category}-list`);
        if (!container) return;

        const articles = this.articles[category];
        
        if (articles.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-${this.getCategoryIcon(category)}"></i>
                    <h3>还没有${this.getCategoryName(category)}</h3>
                    <p>点击上方按钮开始创作吧！</p>
                </div>
            `;
            return;
        }

        container.innerHTML = articles.map(article => this.renderArticleCard(article)).join('');
    }

    renderArticleCard(article) {
        const tags = article.tags.map(tag => `<span class="article-tag">${tag}</span>`).join('');
        
        return `
            <div class="article-card" data-id="${article.id}" onclick="markdownLoader.viewArticle('${article.id}')">
                <h3>${article.title}</h3>
                <div class="article-excerpt">${article.summary}</div>
                <div class="article-meta">
                    <div class="article-tags">${tags}</div>
                    <div>${this.formatDate(article.date)}</div>
                </div>
            </div>
        `;
    }

    viewArticle(articleId) {
        const article = this.getArticle(articleId);
        if (!article) return;

        this.showArticleModal(article);
    }

    getArticle(articleId) {
        for (const category in this.articles) {
            const article = this.articles[category].find(article => article.id === articleId);
            if (article) return article;
        }
        return null;
    }

    showArticleModal(article) {
        const modal = document.getElementById('article-modal');
        const modalTitle = document.getElementById('modal-title');
        const modalMeta = document.getElementById('modal-meta');
        const modalContent = document.getElementById('modal-content');

        modalTitle.textContent = article.title;
        
        modalMeta.innerHTML = `
            <div class="meta-item">
                <i class="fas fa-folder"></i>
                <span>分类：${this.getCategoryName(article.category)}</span>
            </div>
            <div class="meta-item">
                <i class="fas fa-calendar"></i>
                <span>发布时间：${this.formatDate(article.date)}</span>
            </div>
            ${article.tags.length > 0 ? `
                <div class="meta-item">
                    <i class="fas fa-tags"></i>
                    <span>标签：${article.tags.join(', ')}</span>
                </div>
            ` : ''}
        `;

        modalContent.innerHTML = article.content;
        modal.style.display = 'block';
    }

    closeArticleModal() {
        document.getElementById('article-modal').style.display = 'none';
    }

    updateArticleCounts() {
        const storiesCount = document.getElementById('stories-count');
        const techCount = document.getElementById('tech-count');
        const philosophyCount = document.getElementById('philosophy-count');

        if (storiesCount) storiesCount.textContent = this.articles.stories.length;
        if (techCount) techCount.textContent = this.articles.tech.length;
        if (philosophyCount) philosophyCount.textContent = this.articles.philosophy.length;
    }

    getCategoryIcon(category) {
        const icons = {
            stories: 'book-open',
            tech: 'code',
            philosophy: 'brain'
        };
        return icons[category] || 'file-alt';
    }

    getCategoryName(category) {
        const names = {
            stories: '故事',
            tech: '技术文章',
            philosophy: '哲学文章'
        };
        return names[category] || '文章';
    }

    formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('zh-CN', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    }

    async reload() {
        this.articles = { stories: [], tech: [], philosophy: [] };
        await this.loadAllArticles();
        this.renderArticles();
    }
}

// 全局变量
let markdownLoader;

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', function() {
    markdownLoader = new MarkdownLoader();
});

// 全局函数
function closeArticleModal() {
    if (markdownLoader) {
        markdownLoader.closeArticleModal();
    }
}
