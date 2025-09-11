// 地理位置语言检测和切换功能
(function() {
    'use strict';
    
    // 等待DOM加载完成
    document.addEventListener('DOMContentLoaded', function() {
        initGeoLanguage();
    });
    
    function initGeoLanguage() {
        // 检查是否已经设置过语言偏好
        const savedLang = localStorage.getItem('userLanguage');
        if (savedLang) {
            if (savedLang !== getCurrentLang()) {
                switchLanguage(savedLang);
            }
            return;
        }
        
        // 检测用户地理位置
        detectUserLocation();
    }
    
    function detectUserLocation() {
        // 使用ipapi.co API检测用户位置
        fetch('https://ipapi.co/json/')
            .then(response => response.json())
            .then(data => {
                const countryCode = data.country_code;
                const language = getLanguageByCountry(countryCode);
                
                if (language && language !== getCurrentLang()) {
                    showLanguagePrompt(language, data.country_name);
                }
            })
            .catch(error => {
                console.log('地理位置检测失败:', error);
                // 降级方案：使用浏览器语言
                const browserLang = navigator.language || navigator.userLanguage;
                if (browserLang.startsWith('en') && getCurrentLang() !== 'en') {
                    showLanguagePrompt('en', 'English');
                }
            });
    }
    
    function getLanguageByCountry(countryCode) {
        // 英语国家列表
        const englishCountries = ['US', 'GB', 'CA', 'AU', 'NZ', 'IE', 'ZA', 'IN', 'SG', 'HK', 'MY', 'PH'];
        
        if (englishCountries.includes(countryCode)) {
            return 'en';
        }
        
        // 中文地区
        if (['CN', 'TW', 'MO'].includes(countryCode)) {
            return 'zh-CN';
        }
        
        // 默认返回英语
        return 'en';
    }
    
    function getCurrentLang() {
        const path = window.location.pathname;
        if (path.startsWith('/en/')) {
            return 'en';
        }
        return 'zh-CN';
    }
    
    function switchLanguage(lang) {
        const currentPath = window.location.pathname;
        let newPath;
        
        if (lang === 'en') {
            // 切换到英文
            if (currentPath.startsWith('/en/')) {
                return; // 已经是英文
            }
            newPath = '/en' + currentPath;
        } else {
            // 切换到中文
            if (!currentPath.startsWith('/en/')) {
                return; // 已经是中文
            }
            newPath = currentPath.replace('/en', '');
        }
        
        // 保存语言偏好
        localStorage.setItem('userLanguage', lang);
        
        // 跳转到新语言版本
        window.location.href = newPath;
    }
    
    function showLanguagePrompt(lang, countryName) {
        const promptHtml = `
            <div id="language-prompt" style="
                position: fixed;
                top: 20px;
                right: 20px;
                background: rgba(0, 0, 0, 0.9);
                color: white;
                padding: 20px;
                border-radius: 10px;
                z-index: 10000;
                max-width: 300px;
                box-shadow: 0 4px 20px rgba(0,0,0,0.3);
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            ">
                <div style="margin-bottom: 10px; font-weight: bold;">
                    ${lang === 'en' ? '🌍' : '🇨🇳'} ${lang === 'en' ? 'Switch to English?' : '切换到中文？'}
                </div>
                <div style="margin-bottom: 15px; font-size: 14px; opacity: 0.8;">
                    ${lang === 'en' ? `We detected you're from ${countryName}. Would you like to view this site in English?` : `检测到您来自${countryName}。是否切换到中文版本？`}
                </div>
                <div style="display: flex; gap: 10px;">
                    <button onclick="switchToLanguage('${lang}')" style="
                        background: #007cba;
                        color: white;
                        border: none;
                        padding: 8px 16px;
                        border-radius: 5px;
                        cursor: pointer;
                        font-size: 14px;
                    ">
                        ${lang === 'en' ? 'Yes' : '是'}
                    </button>
                    <button onclick="dismissLanguagePrompt()" style="
                        background: #666;
                        color: white;
                        border: none;
                        padding: 8px 16px;
                        border-radius: 5px;
                        cursor: pointer;
                        font-size: 14px;
                    ">
                        ${lang === 'en' ? 'No' : '否'}
                    </button>
                </div>
            </div>
        `;
        
        document.body.insertAdjacentHTML('beforeend', promptHtml);
        
        // 5秒后自动隐藏
        setTimeout(() => {
            dismissLanguagePrompt();
        }, 5000);
    }
    
    // 全局函数
    window.switchToLanguage = function(lang) {
        dismissLanguagePrompt();
        switchLanguage(lang);
    };
    
    window.dismissLanguagePrompt = function() {
        const prompt = document.getElementById('language-prompt');
        if (prompt) {
            prompt.remove();
        }
        // 保存用户选择，避免重复提示
        localStorage.setItem('userLanguage', getCurrentLang());
    };
    
    // 手动语言切换函数
    window.toggleLanguage = function() {
        const currentLang = getCurrentLang();
        const newLang = currentLang === 'zh-CN' ? 'en' : 'zh-CN';
        switchLanguage(newLang);
    };
    
})();
