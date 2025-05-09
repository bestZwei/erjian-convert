// DOM Elements
const text = document.getElementById('convert-text');
const title = document.getElementById('convert-title');
const themeToggleBtn = document.getElementById('theme-toggle-btn');
const aboutToggleBtn = document.getElementById('about-toggle-btn');
const aboutContent = document.getElementById('about-content');
const clearBtn = document.getElementById('clear-btn');
const copyBtn = document.getElementById('copy-btn');
const historyBtn = document.getElementById('history-btn');
const historyList = document.getElementById('history-list');
const loadingIndicator = document.getElementById('loading-indicator');
const toast = document.getElementById('toast');
const toastMessage = document.getElementById('toast-message');

// Constants
const MAX_HISTORY_ITEMS = 10;
const HISTORY_STORAGE_KEY = 'erjian-convert-history';
const THEME_STORAGE_KEY = 'erjian-theme';

// State variables
let conversionHistory = [];
let isLoading = false;

// Initialize the app
function initApp() {
    loadTheme();
    loadHistory();
    setupEventListeners();
}

// Theme management
function loadTheme() {
    const savedTheme = localStorage.getItem(THEME_STORAGE_KEY);
    if (savedTheme === 'dark') {
        document.body.classList.add('dark-theme');
    }
}

function toggleTheme() {
    const isDark = document.body.classList.toggle('dark-theme');
    localStorage.setItem(THEME_STORAGE_KEY, isDark ? 'dark' : 'light');
}

// History management
function loadHistory() {
    try {
        const savedHistory = localStorage.getItem(HISTORY_STORAGE_KEY);
        if (savedHistory) {
            conversionHistory = JSON.parse(savedHistory);
        }
    } catch (e) {
        console.error('Failed to load history:', e);
        conversionHistory = [];
    }
}

function saveHistory() {
    try {
        localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(conversionHistory));
    } catch (e) {
        console.error('Failed to save history:', e);
        showToast('无法保存历史记录');
    }
}

function addToHistory(inputText, outputText, conversionType) {
    // Don't add if it's the same as the most recent one
    if (conversionHistory.length > 0 && 
        conversionHistory[0].output === outputText) {
        return;
    }
    
    conversionHistory.unshift({
        input: inputText.substring(0, 50), // Store preview only
        output: outputText,
        type: conversionType,
        timestamp: new Date().toISOString()
    });
    
    // Limit history size
    if (conversionHistory.length > MAX_HISTORY_ITEMS) {
        conversionHistory.pop();
    }
    
    saveHistory();
    updateHistoryDisplay();
}

function updateHistoryDisplay() {
    historyList.innerHTML = '';
    
    if (conversionHistory.length === 0) {
        const emptyItem = document.createElement('div');
        emptyItem.className = 'history-item';
        emptyItem.textContent = '暂无历史记录';
        historyList.appendChild(emptyItem);
        return;
    }
    
    conversionHistory.forEach((item, index) => {
        const historyItem = document.createElement('div');
        historyItem.className = 'history-item';
        
        // Format timestamp
        const date = new Date(item.timestamp);
        const formattedDate = `${date.getMonth()+1}/${date.getDate()} ${date.getHours()}:${date.getMinutes().toString().padStart(2, '0')}`;
        
        historyItem.textContent = `${formattedDate} - ${item.type}: ${item.input}${item.input.length >= 50 ? '...' : ''}`;
        
        historyItem.addEventListener('click', () => {
            text.value = item.output;
            title.textContent = item.type;
            historyList.classList.add('hidden');
        });
        
        historyList.appendChild(historyItem);
    });
}

// Toast notifications
function showToast(message, duration = 3000) {
    toastMessage.textContent = message;
    toast.classList.remove('hidden');
    
    setTimeout(() => {
        toast.classList.add('hidden');
    }, duration);
}

// Loading state
function setLoading(loading) {
    isLoading = loading;
    if (loading) {
        loadingIndicator.classList.remove('hidden');
    } else {
        loadingIndicator.classList.add('hidden');
    }
}

// Mapping and conversion logic
async function loadMapping(name) {
    try {
        setLoading(true);
        const resp = await fetch(`mappings/${name}.json`);
        if (!resp.ok) throw new Error(`加载失败: ${name}.json`);
        return await resp.json();
    } catch (e) {
        showToast(`加载映射失败: ${e.message}`);
        return {};
    } finally {
        setLoading(false);
    }
}

// 正则转义
function escapeRegExp(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// Modified convertText: takes input string, returns converted string
function convertText(inputText, mapping) {
    let textVal = inputText;
    // 按 key 长度降序，避免短 key 影响长 key 替换
    const keys = Object.keys(mapping).sort((a, b) => b.length - a.length);
    for (const k of keys) {
        const v = mapping[k];
        // Ensure v is a string; handle potential non-string values if necessary
        const replacement = (typeof v === 'string') ? v : String(v);
        try {
            textVal = textVal.replace(new RegExp(escapeRegExp(k), 'g'), replacement);
        } catch (e) {
            console.error(`Error replacing key: ${k}`, e);
            // Optionally skip this key or handle the error differently
        }
    }
    return textVal; // Return the converted string
}

async function handleConvert(type, font, ...mappingNames) {
    try {
        setLoading(true);
        
        text.style.fontFamily = font;
        title.textContent = type;

        const currentText = text.value;
        let textToConvert = currentText;

        // If the target is an Erjian version (not 'yijian'),
        // first convert the current text back to Yijian.
        if (mappingNames.length > 0 && mappingNames[0] !== 'yijian') {
            try {
                const yijianMapping = await loadMapping('yijian');
                // Use the modified convertText, passing the current string
                textToConvert = convertText(currentText, yijianMapping);
                if (typeof textToConvert !== 'string') {
                    throw new Error("转换为规范汉字失败");
                }
            } catch (error) {
                showToast(`中间转换错误: ${error.message}`);
                return;
            }
        }

        // Now, load the target mapping(s) and convert the (potentially intermediate) text.
        const mappings = await Promise.all(mappingNames.map(loadMapping));
        const combinedMapping = mappings.reduce((acc, map) => ({ ...acc, ...map }), {});
        
        // Convert and set result
        const convertedText = convertText(textToConvert, combinedMapping);
        text.value = convertedText;
        
        // Add to history
        addToHistory(currentText, convertedText, type);
        
        showToast('转换成功！');
    } catch (error) {
        console.error("转换错误:", error);
        showToast(`转换错误: ${error.message}`);
    } finally {
        setLoading(false);
    }
}

// Event handlers
function setupEventListeners() {
    // Theme toggle
    themeToggleBtn.addEventListener('click', toggleTheme);
    
    // About toggle
    aboutToggleBtn.addEventListener('click', () => {
        aboutContent.classList.toggle('hidden');
        aboutToggleBtn.textContent = aboutContent.classList.contains('hidden') ? 
            '关于二简字 ▼' : '关于二简字 ▲';
    });
    
    // Clear button
    clearBtn.addEventListener('click', () => {
        text.value = '';
        showToast('已清空文本');
    });
    
    // Copy button
    copyBtn.addEventListener('click', () => {
        if (!text.value) {
            showToast('无内容可复制');
            return;
        }
        
        navigator.clipboard.writeText(text.value)
            .then(() => showToast('已复制到剪贴板'))
            .catch(err => {
                console.error('复制失败:', err);
                showToast('复制失败');
            });
    });
    
    // History button
    historyBtn.addEventListener('click', () => {
        updateHistoryDisplay();
        historyList.classList.toggle('hidden');
    });
    
    // Close history when clicking outside
    document.addEventListener('click', (e) => {
        if (!historyBtn.contains(e.target) && !historyList.contains(e.target)) {
            historyList.classList.add('hidden');
        }
    });
    
    // Conversion buttons
    document.getElementById('yijian').addEventListener('click', () => {
        handleConvert(
            '规范汉字',
            'Iosevka, Menlo, Monaco, Consolas, "Courier New", SimSun, serif',
            'yijian'
        );
    });

    document.getElementById('erjian-1').addEventListener('click', () => {
        handleConvert(
            '二简转换器 (草案第一表)',
            'Iosevka, Menlo, Monaco, Consolas, "Courier New", erjian1, SimSun, serif',
            'erjian1'
        );
    });

    document.getElementById('erjian-2').addEventListener('click', () => {
        handleConvert(
            '二𫈉转换𫩏 (草案两表)',
            'Iosevka, Menlo, Monaco, Consolas, "Courier New", erjian2, SimSun, serif',
            'erjian1', 'erjian2'
        );
    });

    document.getElementById('erjian-xiu').addEventListener('click', () => {
        handleConvert(
            '二𫈉转换器 (修订草案)',
            'Iosevka, Menlo, Monaco, Consolas, "Courier New", erjianx, SimSun, serif',
            'erjianXiu'
        );
    });
}

// Initialize the application
document.addEventListener('DOMContentLoaded', initApp);
