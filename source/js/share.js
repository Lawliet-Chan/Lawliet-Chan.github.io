// 分享功能JavaScript
(function() {
    'use strict';
    
    // 等待DOM加载完成
    document.addEventListener('DOMContentLoaded', function() {
        initShareButtons();
    });
    
    function initShareButtons() {
        // 检查是否在文章页面
        if (document.querySelector('.post-content') || document.querySelector('.article-content')) {
            addShareButtons();
        }
    }
    
    function addShareButtons() {
        // 获取文章标题和URL
        const title = document.title || 'Lawliet Chan 的文章';
        const url = window.location.href;
        const description = getArticleDescription();
        
        // 创建分享按钮容器
        const shareContainer = document.createElement('div');
        shareContainer.className = 'share-buttons';
        shareContainer.innerHTML = `
            <h4>📤 分享这篇文章</h4>
            <button class="wechat-share-btn" onclick="shareToWechat()">
                <i class="fab fa-weixin"></i> 微信朋友圈
            </button>
            <button class="qq-share-btn" onclick="shareToQQ()">
                <i class="fab fa-qq"></i> QQ空间
            </button>
            <button class="weibo-share-btn" onclick="shareToWeibo()">
                <i class="fab fa-weibo"></i> 微博
            </button>
            <button class="qzone-share-btn" onclick="shareToQzone()">
                <i class="fas fa-share-alt"></i> QQ空间
            </button>
            <button class="twitter-share-btn" onclick="shareToTwitter()">
                <i class="fab fa-twitter"></i> Twitter
            </button>
        `;
        
        // 将分享按钮添加到文章内容后面
        const postContent = document.querySelector('.post-content') || 
                           document.querySelector('.article-content') || 
                           document.querySelector('.entry-content');
        
        if (postContent) {
            postContent.appendChild(shareContainer);
        } else {
            // 如果找不到文章内容，添加到页面底部
            document.body.appendChild(shareContainer);
        }
    }
    
    function getArticleDescription() {
        // 尝试获取文章描述
        const metaDescription = document.querySelector('meta[name="description"]');
        if (metaDescription) {
            return metaDescription.getAttribute('content');
        }
        
        // 尝试从文章内容中提取前100个字符作为描述
        const content = document.querySelector('.post-content') || 
                       document.querySelector('.article-content') || 
                       document.querySelector('.entry-content');
        
        if (content) {
            const text = content.textContent || content.innerText || '';
            return text.replace(/\s+/g, ' ').trim().substring(0, 100) + '...';
        }
        
        return '来自 Lawliet Chan 的精彩文章';
    }
    
    function getArticleImage() {
        // 尝试获取文章封面图
        const ogImage = document.querySelector('meta[property="og:image"]');
        if (ogImage) {
            return ogImage.getAttribute('content');
        }
        
        // 尝试获取文章中的第一张图片
        const articleImg = document.querySelector('.post-content img, .article-content img, .entry-content img');
        if (articleImg) {
            return articleImg.src;
        }
        
        // 默认头像
        return window.location.origin + '/images/lawliet.jpeg';
    }
    
    // 分享到微信朋友圈
    window.shareToWechat = function() {
        const url = window.location.href;
        const title = document.title || 'Lawliet Chan 的文章';
        const image = getArticleImage();
        
        // 创建分享链接
        const shareUrl = `https://www.addtoany.com/add_to/wechat?linkurl=${encodeURIComponent(url)}&linkname=${encodeURIComponent(title)}&linkimage=${encodeURIComponent(image)}`;
        
        // 打开分享窗口
        openShareWindow(shareUrl, '微信分享');
        
        // 显示提示
        showShareTip('请复制链接到微信中分享');
    };
    
    // 分享到QQ
    window.shareToQQ = function() {
        const url = window.location.href;
        const title = document.title || 'Lawliet Chan 的文章';
        const description = getArticleDescription();
        const image = getArticleImage();
        
        const shareUrl = `https://connect.qq.com/widget/shareqq/index.html?url=${encodeURIComponent(url)}&title=${encodeURIComponent(title)}&summary=${encodeURIComponent(description)}&pics=${encodeURIComponent(image)}`;
        
        openShareWindow(shareUrl, 'QQ分享');
    };
    
    // 分享到微博
    window.shareToWeibo = function() {
        const url = window.location.href;
        const title = document.title || 'Lawliet Chan 的文章';
        const image = getArticleImage();
        
        const shareUrl = `https://service.weibo.com/share/share.php?url=${encodeURIComponent(url)}&title=${encodeURIComponent(title)}&pic=${encodeURIComponent(image)}`;
        
        openShareWindow(shareUrl, '微博分享');
    };
    
    // 分享到QQ空间
    window.shareToQzone = function() {
        const url = window.location.href;
        const title = document.title || 'Lawliet Chan 的文章';
        const description = getArticleDescription();
        const image = getArticleImage();
        
        const shareUrl = `https://sns.qzone.qq.com/cgi-bin/qzshare/cgi_qzshare_onekey?url=${encodeURIComponent(url)}&title=${encodeURIComponent(title)}&summary=${encodeURIComponent(description)}&pics=${encodeURIComponent(image)}`;
        
        openShareWindow(shareUrl, 'QQ空间分享');
    };
    
    // 分享到Twitter
    window.shareToTwitter = function() {
        const url = window.location.href;
        const title = document.title || 'Lawliet Chan 的文章';
        
        const shareUrl = `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`;
        
        openShareWindow(shareUrl, 'Twitter分享');
    };
    
    // 打开分享窗口
    function openShareWindow(url, title) {
        const width = 600;
        const height = 400;
        const left = (screen.width - width) / 2;
        const top = (screen.height - height) / 2;
        
        const features = `width=${width},height=${height},left=${left},top=${top},scrollbars=yes,resizable=yes`;
        
        window.open(url, title, features);
    }
    
    // 显示分享提示
    function showShareTip(message) {
        // 创建提示元素
        const tip = document.createElement('div');
        tip.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: rgba(0, 0, 0, 0.8);
            color: white;
            padding: 15px 25px;
            border-radius: 8px;
            z-index: 10000;
            font-size: 14px;
            max-width: 300px;
            text-align: center;
        `;
        tip.textContent = message;
        
        document.body.appendChild(tip);
        
        // 3秒后自动移除
        setTimeout(() => {
            if (tip.parentNode) {
                tip.parentNode.removeChild(tip);
            }
        }, 3000);
    }
    
    // 复制链接到剪贴板
    function copyToClipboard(text) {
        if (navigator.clipboard) {
            navigator.clipboard.writeText(text).then(() => {
                showShareTip('链接已复制到剪贴板');
            });
        } else {
            // 降级方案
            const textArea = document.createElement('textarea');
            textArea.value = text;
            document.body.appendChild(textArea);
            textArea.select();
            try {
                document.execCommand('copy');
                showShareTip('链接已复制到剪贴板');
            } catch (err) {
                showShareTip('复制失败，请手动复制');
            }
            document.body.removeChild(textArea);
        }
    }
    
})();
