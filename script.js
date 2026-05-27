// 流体粒子波浪背景
class FluidBackground {
    constructor() {
        this.canvas = document.getElementById('fluid-bg');
        this.ctx = this.canvas.getContext('2d');
        this.particles = [];
        this.waves = [];
        this.resize();
        this.init();
        this.animate();
        window.addEventListener('resize', () => this.resize());
    }

    getThemeColors() {
        const isLight = document.documentElement.getAttribute('data-theme') === 'light';
        return isLight ? {
            waveColor: 'hsla(215, 30%, 88%, ',
            waveHighlight: 'hsla(220, 40%, 98%, ',
            particleHue: [190, 250],
            particleOpacity: 0.32,
            lineOpacity: 0.05
        } : {
            waveColor: 'hsla(265, 45%, 60%, ',
            waveHighlight: 'hsla(270, 60%, 75%, ',
            particleHue: [240, 320],
            particleOpacity: 0.55,
            lineOpacity: 0.12
        };
    }

    updateThemeColors() {
        const colors = this.getThemeColors();
        this.waves.forEach(wave => {
            wave.color = colors.waveColor;
            wave.highlightColor = colors.waveHighlight;
        });
        this.particles.forEach(p => p.baseOpacity = colors.particleOpacity);
        this.lineOpacity = colors.lineOpacity;
    }

    resize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }

    init() {
        const colors = this.getThemeColors();
        this.lineOpacity = colors.lineOpacity;
        
        for (let i = 0; i < 80; i++) {
            const baseRadius = Math.random() * 2 + 0.5;
            this.particles.push({
                x: Math.random() * this.canvas.width,
                y: Math.random() * this.canvas.height,
                radius: baseRadius,
                baseRadius: baseRadius,
                vx: (Math.random() - 0.5) * 0.2,
                vy: (Math.random() - 0.5) * 0.2,
                opacity: Math.random() * 0.3 + colors.particleOpacity * 0.5,
                baseOpacity: colors.particleOpacity,
                hue: Math.random() * (colors.particleHue[1] - colors.particleHue[0]) + colors.particleHue[0],
                breathePhase: Math.random() * Math.PI * 2,
                breatheSpeed: 0.0015 + Math.random() * 0.001,
                pulsePhase: Math.random() * Math.PI * 2,
                pulseSpeed: 0.002 + Math.random() * 0.0015
            });
        }

        for (let i = 0; i < 2; i++) {
            this.waves.push({
                y: this.canvas.height * (0.25 + i * 0.4),
                amplitude: 35 + i * 10,
                frequency: 0.008 + i * 0.004,
                secondaryFreq: 0.02 + i * 0.006,
                secondaryAmp: 4 + i * 2,
                speed: (0.015 + i * 0.006) * 0.4,
                phase: Math.random() * Math.PI * 2,
                color: colors.waveColor,
                highlightColor: colors.waveHighlight,
                tidePhase: Math.random() * Math.PI * 2
            });
        }
    }

    animate() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.drawWaves();
        this.updateParticles();
        this.drawParticles();
        requestAnimationFrame(() => this.animate());
    }

    drawWaves() {
        const time = Date.now();
        this.waves.forEach(wave => {
            const gradient = this.ctx.createLinearGradient(0, wave.y - wave.amplitude - 50, 0, this.canvas.height);
            gradient.addColorStop(0, wave.color + '0.15)');
            gradient.addColorStop(0.5, wave.color + '0.08)');
            gradient.addColorStop(1, wave.color + '0)');
            
            this.ctx.beginPath();
            this.ctx.moveTo(0, this.canvas.height);
            
            const tideOffset = Math.sin(time * 0.0001 + wave.tidePhase) * 15;
            
            for (let x = 0; x <= this.canvas.width; x += 5) {
                const y = wave.y + tideOffset + 
                    Math.sin(x * wave.frequency + wave.phase) * wave.amplitude +
                    Math.sin(x * wave.secondaryFreq + wave.phase * 1.3) * wave.secondaryAmp;
                this.ctx.lineTo(x, y);
            }
            
            this.ctx.lineTo(this.canvas.width, this.canvas.height);
            this.ctx.closePath();
            this.ctx.fillStyle = gradient;
            this.ctx.fill();
            
            // 高光层
            const highlightGradient = this.ctx.createLinearGradient(0, 0, 0, 60);
            highlightGradient.addColorStop(0, wave.highlightColor + '0.08)');
            highlightGradient.addColorStop(1, 'transparent');
            
            this.ctx.fillStyle = highlightGradient;
            this.ctx.globalCompositeOperation = 'lighter';
            this.ctx.fill();
            this.ctx.globalCompositeOperation = 'source-over';
            
            wave.phase += wave.speed;
        });
    }

    updateParticles() {
        const time = Date.now();
        this.particles.forEach(p => {
            p.x += p.vx;
            p.y += p.vy;
            p.opacity = Math.max(0.1, Math.min(1, p.baseOpacity + Math.sin(time * p.breatheSpeed + p.breathePhase) * p.baseOpacity * 0.4));
            p.radius = Math.max(0.3, Math.min(3, p.baseRadius + Math.sin(time * p.pulseSpeed + p.pulsePhase) * p.baseRadius * 0.3));
            p.y += Math.sin(p.x * 0.008 + time * 0.0006) * 0.25;
            if (p.x < 0 || p.x > this.canvas.width) p.vx *= -1;
            if (p.y < 0 || p.y > this.canvas.height) p.vy *= -1;
        });
    }

    drawParticles() {
        this.particles.forEach(p => {
            const glowRadius = p.radius * 8;
            const gradient = this.ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, glowRadius);
            gradient.addColorStop(0, `hsla(${p.hue}, 70%, 75%, ${p.opacity * 0.8})`);
            gradient.addColorStop(0.1, `hsla(${p.hue}, 65%, 70%, ${p.opacity * 0.5})`);
            gradient.addColorStop(0.35, `hsla(${p.hue}, 60%, 65%, ${p.opacity * 0.15})`);
            gradient.addColorStop(0.4, 'transparent');
            
            this.ctx.beginPath();
            this.ctx.arc(p.x, p.y, glowRadius, 0, Math.PI * 2);
            this.ctx.fillStyle = gradient;
            this.ctx.globalCompositeOperation = 'lighter';
            this.ctx.fill();
            this.ctx.globalCompositeOperation = 'source-over';
        });
        
        // 粒子连线
        this.ctx.strokeStyle = `hsla(260, 70%, 60%, ${this.lineOpacity})`;
        this.ctx.lineWidth = 1;
        for (let i = 0; i < this.particles.length; i++) {
            for (let j = i + 1; j < this.particles.length; j++) {
                const dx = this.particles[i].x - this.particles[j].x;
                const dy = this.particles[i].y - this.particles[j].y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < 140) {
                    this.ctx.globalAlpha = (140 - dist) / 140 * this.lineOpacity * 2.5;
                    this.ctx.beginPath();
                    this.ctx.moveTo(this.particles[i].x, this.particles[i].y);
                    this.ctx.lineTo(this.particles[j].x, this.particles[j].y);
                    this.ctx.stroke();
                }
            }
        }
        this.ctx.globalAlpha = 1;
    }
}

// 配置
const CONFIG = {
    API_BASE_URL: localStorage.getItem('knowledge_quiz_api_url') || 'https://api.deepseek.com',
    API_KEY: localStorage.getItem('knowledge_quiz_api_key') || 'sk-c9285534bffa4aa08c666d797859971b',
    MODEL: localStorage.getItem('knowledge_quiz_model') || 'deepseek-chat',
    USE_MOCK_AS_FALLBACK: true
};

// 加载提示语
const loaderSubtitles = ["正在向AI导师请教…", "构建知识网络中…", "为您筛选高质量题目…", "几乎就要完成了…"];

// DOM 元素
const knowledgeInput = document.getElementById('knowledge-point');
const difficultySelect = document.getElementById('difficulty');
const generateBtn = document.getElementById('generate-btn');
const loading = document.getElementById('loading');
const questionsContainer = document.getElementById('questions-container');
const questionsList = document.getElementById('questions-list');
const questionCount = document.getElementById('count');
const emptyState = document.getElementById('empty-state');
const topicDisplay = document.getElementById('topic-display');
const regenerateBtn = document.getElementById('regenerate-btn');

let currentQuestions = [];
let isAllExpanded = false;
let loaderInterval = null;
let loaderSubtitleIndex = 0;

// 初始化
document.addEventListener('DOMContentLoaded', () => {
    new FluidBackground();
    
    // 主题
    const savedTheme = localStorage.getItem('knowledge_quiz_theme') || 'dark';
    document.documentElement.setAttribute('data-theme', savedTheme);
    
    document.getElementById('theme-toggle').addEventListener('click', () => {
        const theme = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('knowledge_quiz_theme', theme);
        document.querySelector('.container')._fluidBg?.updateThemeColors?.();
    });
    
    // API 下拉
    setupAPIDropdown();
    renderHistory();
    updateStepIndicator();
    
    // 事件绑定
    generateBtn.addEventListener('click', generateQuestions);
    regenerateBtn.addEventListener('click', generateQuestions);
    knowledgeInput.addEventListener('keydown', e => e.key === 'Enter' && generateQuestions());
    knowledgeInput.addEventListener('input', () => { removeError(); updateStepIndicator(); });
    difficultySelect.addEventListener('change', () => { removeError(); updateStepIndicator(); });
    
    // 侧边栏
    document.getElementById('sidebar-toggle').addEventListener('click', openSidebar);
    document.getElementById('sidebar-close').addEventListener('click', closeSidebar);
    document.getElementById('sidebar-backdrop').addEventListener('click', closeSidebar);
    document.getElementById('clear-history').addEventListener('click', () => {
        if (confirm('确定要清空所有历史记录吗？')) {
            localStorage.removeItem('knowledge_quiz_history');
            renderHistory();
        }
    });
});

// API 下拉配置
function setupAPIDropdown() {
    const dropdown = document.getElementById('api-status-dropdown');
    const btn = document.getElementById('api-status-btn');
    const panel = document.getElementById('api-dropdown-panel');
    
    loadDropdownConfig();
    updateAPIStatus();
    
    btn.addEventListener('click', e => {
        e.stopPropagation();
        dropdown.classList.toggle('open');
        panel.classList.toggle('hidden');
    });
    
    document.addEventListener('click', e => {
        if (!dropdown.contains(e.target)) {
            dropdown.classList.remove('open');
            panel.classList.add('hidden');
        }
    });
    
    document.getElementById('save-dropdown-config').addEventListener('click', () => {
        CONFIG.API_BASE_URL = document.getElementById('api-url-dropdown').value.trim() || 'https://api.deepseek.com';
        CONFIG.API_KEY = document.getElementById('api-key-dropdown').value.trim();
        CONFIG.MODEL = document.getElementById('model-dropdown').value;
        
        localStorage.setItem('knowledge_quiz_api_key', CONFIG.API_KEY);
        localStorage.setItem('knowledge_quiz_api_url', CONFIG.API_BASE_URL);
        localStorage.setItem('knowledge_quiz_model', CONFIG.MODEL);
        
        updateAPIStatus();
        dropdown.classList.remove('open');
        panel.classList.add('hidden');
        
        const btn = document.getElementById('save-dropdown-config');
        btn.textContent = '已保存 ✓';
        btn.style.background = 'linear-gradient(135deg, var(--success), #059669)';
        setTimeout(() => { btn.textContent = '保存配置'; btn.style.background = ''; }, 1500);
    });
}

function loadDropdownConfig() {
    document.getElementById('api-url-dropdown').value = localStorage.getItem('knowledge_quiz_api_url') || CONFIG.API_BASE_URL;
    document.getElementById('api-key-dropdown').value = localStorage.getItem('knowledge_quiz_api_key') || CONFIG.API_KEY;
    document.getElementById('model-dropdown').value = localStorage.getItem('knowledge_quiz_model') || CONFIG.MODEL;
}

function updateAPIStatus() {
    const dot = document.getElementById('api-status-dot');
    const model = document.getElementById('api-status-model');
    if (CONFIG.API_KEY && CONFIG.API_BASE_URL) {
        dot.classList.add('connected');
        model.textContent = CONFIG.MODEL;
    } else {
        dot.classList.remove('connected');
        model.textContent = '未配置';
    }
}

// 加载提示语循环
function startLoaderCycle() {
    const subtitleEl = document.querySelector('.loader-subtitle');
    if (!subtitleEl) return;
    loaderSubtitleIndex = 0;
    subtitleEl.textContent = loaderSubtitles[loaderSubtitleIndex];
    loaderInterval = setInterval(() => {
        loaderSubtitleIndex = (loaderSubtitleIndex + 1) % loaderSubtitles.length;
        subtitleEl.style.opacity = '0';
        setTimeout(() => { subtitleEl.textContent = loaderSubtitles[loaderSubtitleIndex]; subtitleEl.style.opacity = '1'; }, 400);
    }, 4000);
}

function stopLoaderCycle() {
    clearInterval(loaderInterval);
    loaderInterval = null;
}

// 生成题目
async function generateQuestions() {
    const knowledge = knowledgeInput.value.trim();
    const difficulty = difficultySelect.value;

    if (!knowledge) { showError('请输入要复习的知识点主题'); return; }

    generateBtn.disabled = true;
    loading.classList.remove('hidden');
    questionsContainer.classList.add('hidden');
    emptyState.classList.add('hidden');
    removeError();
    startLoaderCycle();

    try {
        if (CONFIG.API_BASE_URL && CONFIG.API_KEY) {
            const response = await fetch(`${CONFIG.API_BASE_URL}/chat/completions`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${CONFIG.API_KEY}` },
                body: JSON.stringify({
                    model: CONFIG.MODEL,
                    messages: [
                        { role: 'system', content: '你是一个专业的知识教育助手。请为用户生成高质量的练习题，并提供非常详细、全面的答案解析。答案解析应该包含：1) 核心概念解释 2) 解题思路分析 3) 详细步骤 4) 实际应用场景 5) 常见错误与注意事项。请严格按照指定的JSON格式返回内容。' },
                        { role: 'user', content: `请为知识点"${knowledge}"生成${Math.floor(Math.random() * 6) + 5}道${getDifficultyText(difficulty)}难度的练习题。答案部分要尽可能详细和全面，包含完整的解释、示例、原理说明等内容。返回格式：{"questions":[{"id":1,"question":"题目","answer":"答案","difficulty":"级别","type":"类型"}]}` }
                    ],
                    temperature: 0.7
                })
            });

            if (!response.ok) throw new Error(`API请求失败: ${response.status}`);
            
            const data = await response.json();
            const content = data.choices?.[0]?.message?.content;
            
            if (content) {
                const jsonMatch = content.match(/\{[\s\S]*\}/) || [content.substring(content.indexOf('{'), content.lastIndexOf('}') + 1)];
                if (jsonMatch) {
                    const parsed = JSON.parse(jsonMatch[0]);
                    currentQuestions = parsed.questions || [];
                    topicDisplay.textContent = knowledge;
                    renderQuestions(currentQuestions);
                    saveToHistory(knowledge, difficulty);
                    loading.classList.add('hidden');
                    questionsContainer.classList.remove('hidden');
                    updateStepIndicator(true);
                    return;
                }
            }
            throw new Error('API返回格式无效');
        } else {
            throw new Error('未配置API');
        }
    } catch (error) {
        if (CONFIG.USE_MOCK_AS_FALLBACK) {
            const mockData = generateMockQuestions(knowledge, difficulty);
            currentQuestions = mockData;
            topicDisplay.textContent = knowledge;
            renderQuestions(mockData);
            saveToHistory(knowledge, difficulty);
            showInfoTip(CONFIG.API_KEY ? 'API 调用失败，已自动使用模拟数据。' : '当前使用模拟数据。点击右上角配置真实 API。');
            loading.classList.add('hidden');
            questionsContainer.classList.remove('hidden');
            updateStepIndicator(true);
        } else {
            showError(`生成题目失败: ${error.message}`);
            emptyState.classList.remove('hidden');
            loading.classList.add('hidden');
        }
    } finally {
        generateBtn.disabled = false;
        stopLoaderCycle();
    }
}

// 模拟数据
function generateMockQuestions(knowledge, difficulty) {
    const difficultyLabel = getDifficultyText(difficulty);
    const types = ['选择题', '填空题', '简答题', '应用题'];
    const templates = [
        { 
            q: `请详细解释${knowledge}的核心概念，并提供实际应用场景。`, 
            a: `# ${knowledge}核心概念详解\n\n## 一、核心概念\n${knowledge}是一个重要的技术/概念，其核心原理建立在坚实的理论基础之上。这个概念的出现是为了解决特定领域中的关键问题，通过创新的方法提供了高效的解决方案。\n\n**基本定义**：${knowledge}指的是一种系统化的方法或工具，用于处理特定类型的任务。\n\n## 二、工作原理\n\n1. **输入处理**：首先接收用户输入或数据\n2. **核心处理**：应用特定算法或逻辑进行处理\n3. **结果输出**：生成有意义的输出或副作用\n\n## 三、应用场景\n\n**场景1：数据处理**\n在数据分析领域，${knowledge}被广泛用于处理大规模数据。通过高效的处理方式，可以在短时间内完成复杂的计算任务。\n\n**场景2：系统架构**\n在软件架构设计中，${knowledge}提供了模块化和可扩展的设计模式，使得系统更易维护。\n\n**场景3：自动化流程**\n在自动化领域，${knowledge}简化了复杂流程，提高了工作效率。\n\n## 四、代码示例\n\`\`\`javascript\n// ${knowledge}的基础实现示例\nfunction ${knowledge.toLowerCase().replace(/\\s+/g, '')}(input) {\n  // 1. 验证输入\n  if (!input) throw new Error('输入不能为空');\n  \n  // 2. 核心处理逻辑\n  const result = processInput(input);\n  \n  // 3. 返回结果\n  return result;\n}\n\`\`\`\n\n## 五、总结\n${knowledge}是一个强大而灵活的工具，掌握它需要理论学习和实践相结合。通过不断练习和探索，您会发现它的更多价值。` 
        },
        { 
            q: `使用${knowledge}时常见的错误或陷阱有哪些？请详细说明如何避免。`, 
            a: `# ${knowledge}常见错误与最佳实践\n\n## 一、常见错误分析\n\n**错误1：忽视边界情况**\n许多开发者在使用${knowledge}时，只考虑正常输入，而忽略了边界情况，导致程序在极端条件下崩溃。\n\n*错误示例*：\n\`\`\`javascript\n// ❌ 错误做法\nfunction process(data) {\n  return data.map(item => item.value); // 如果data为null会崩溃\n}\n\`\`\`\n\n*正确做法*：\n\`\`\`javascript\n// ✅ 正确做法\nfunction process(data) {\n  if (!data || !Array.isArray(data)) return [];\n  return data.map(item => item?.value ?? defaultValue);\n}\n\`\`\`\n\n**错误2：性能问题**\n不正确的使用方式可能导致性能问题。\n\n## 二、最佳实践\n\n### 1. 输入验证\n始终在处理前验证输入数据的有效性。\n\n### 2. 错误处理\n\n使用try-catch结构捕获可能的异常：\n\`\`\`javascript\ntry {\n  const result = ${knowledge.toLowerCase().replace(/\\s+/g, '')}(input);\n  console.log('处理成功:', result);\n} catch (error) {\n  console.error('处理失败:', error.message);\n}\n\`\`\`\n\n### 3. 性能优化\n\n- 使用适当的数据结构\n- 避免不必要的重复计算\n- 考虑使用缓存机制\n\n## 三、总结\n掌握${knowledge}的正确使用方法需要时间和经验，通过遵循最佳实践可以避免大多数常见问题。` 
        },
        { 
            q: `对比使用${knowledge}解决问题的不同方法，分析各自的优缺点。`, 
            a: `# ${knowledge}多种实现方案对比\n\n## 一、方案对比\n\n| 方案 | 优点 | 缺点 | 适用场景 |\n|------|------|------|----------|\n| 方案A | 简单直接、易理解、上手快 | 功能有限、扩展性差 | 小型项目、原型开发 |\n| 方案B | 功能强大、高度可扩展 | 学习曲线陡峭、复杂度高 | 大型企业应用 |\n| 方案C | 平衡性能与可维护性 | 需要更多配置 | 中等规模项目 |\n\n## 二、详细分析\n\n### 方案A：简单实现\n\n**实现思路**：采用最直接的方式解决问题。\n\n\`\`\`javascript\n// 简单但可能不够灵活的实现\nconst simpleApproach = (data) => data.filter(x => x.active);\n\`\`\`\n\n**优势**：\n- 代码简洁，易于理解\n- 性能良好，没有额外开销\n- 快速上手\n\n**局限性**：\n- 难以处理复杂业务逻辑\n- 扩展性差\n\n### 方案B：企业级实现\n\n\`\`\`javascript\n// 更健壮的实现\nclass AdvancedApproach {\n  constructor(config) {\n    this.config = config;\n  }\n  \n  process(data) {\n    return data.map(item => this.transform(item))\n               .filter(this.validate);\n  }\n}\n\`\`\`\n\n## 三、选择建议\n\n根据项目规模、团队能力、性能需求综合考虑，选择最适合的方案。` 
        },
        { 
            q: `请编写一个展示${knowledge}实际应用的完整代码示例，并逐行解释。`, 
            a: `# ${knowledge}实战代码详解\n\n## 完整实现示例\n\n下面是一个完整的${knowledge}应用示例，包含了从基础用法到高级功能的全面展示。\n\n\`\`\`javascript\n/**\n * ${knowledge}完整实现\n * 该模块展示了如何在实际项目中应用${knowledge}\n */\n\n// 1. 引入必要的依赖\nimport { validateConfig, createLogger } from './utils';\n\n// 2. 定义配置\nconst DEFAULT_CONFIG = {\n  debug: false,\n  maxRetries: 3,\n  timeout: 5000\n};\n\n/**\n * 核心类：${knowledge}处理器\n */\nexport class ${knowledge.replace(/\\s+/g, '')}Handler {\n  \n  /**\n   * 构造函数\n   * @param {Object} options - 配置选项\n   */\n  constructor(options = {}) {\n    // 合并配置\n    this.config = { ...DEFAULT_CONFIG, ...options };\n    \n    // 验证配置有效性\n    validateConfig(this.config);\n    \n    // 初始化日志\n    this.logger = createLogger(this.config.debug);\n    \n    this.logger.info('${knowledge}处理器初始化完成');\n  }\n  \n  /**\n   * 处理核心业务逻辑\n   * @param {*} input - 输入数据\n   * @returns {*} 处理结果\n   */\n  async process(input) {\n    this.logger.debug('开始处理:', input);\n    \n    try {\n      // 步骤1：验证输入\n      if (!this.isValidInput(input)) {\n        throw new Error('无效的输入数据');\n      }\n      \n      // 步骤2：数据预处理\n      const preprocessed = this.preprocess(input);\n      \n      // 步骤3：核心转换\n      const result = this.transform(preprocessed);\n      \n      // 步骤4：后处理\n      const final = this.postprocess(result);\n      \n      this.logger.info('处理完成');\n      return final;\n      \n    } catch (error) {\n      this.logger.error('处理失败:', error);\n      throw error;\n    }\n  }\n  \n  // 其他辅助方法...\n  isValidInput(input) { return !!input; }\n  preprocess(input) { return input; }\n  transform(data) { return data; }\n  postprocess(result) { return result; }\n}\n\n// 使用示例\nconst handler = new ${knowledge.replace(/\\s+/g, '')}Handler({ debug: true });\nhandler.process({ key: 'value' })\n  .then(result => console.log('结果:', result));\n\`\`\`\n\n## 代码说明\n\n### 1. 结构设计\n采用面向对象的方式，将核心逻辑封装在类中，便于扩展和维护。\n\n### 2. 错误处理\n通过try-catch捕获异常，配合日志系统，便于问题定位。\n\n### 3. 可扩展性\n通过配置系统，允许用户自定义行为。\n\n这个示例展示了${knowledge}在实际项目中的标准用法，您可以根据具体需求进行调整。` 
        },
        { 
            q: `如何在使用${knowledge}时进行性能优化？请提供具体策略和测试方法。`, 
            a: `# ${knowledge}性能优化指南\n\n## 一、性能优化策略\n\n### 策略1：算法优化\n\n**问题**：原算法复杂度高，导致处理慢。\n\n**优化示例**：\n\`\`\`javascript\n// ❌ 优化前：O(n²) 复杂度\nfunction slowAlgorithm(arr) {\n  const result = [];\n  for (let i = 0; i < arr.length; i++) {\n    for (let j = 0; j < arr.length; j++) {\n      if (arr[i] === arr[j] && i !== j) {\n        result.push(arr[i]);\n      }\n    }\n  }\n  return result;\n}\n\n// ✅ 优化后：O(n) 复杂度\nfunction fastAlgorithm(arr) {\n  const map = new Map();\n  arr.forEach(item => map.set(item, (map.get(item) || 0) + 1));\n  return Array.from(map.entries())\n              .filter(([key, count]) => count > 1)\n              .map(([key]) => key);\n}\n\`\`\`\n\n### 策略2：缓存策略\n\n\`\`\`javascript\nclass CacheManager {\n  constructor() {\n    this.cache = new Map();\n  }\n  \n  get(key) {\n    const item = this.cache.get(key);\n    if (item && Date.now() < item.expiry) {\n      return item.value;\n    }\n    return null;\n  }\n  \n  set(key, value, ttl = 3600000) {\n    this.cache.set(key, {\n      value,\n      expiry: Date.now() + ttl\n    });\n  }\n}\n\`\`\`\n\n### 策略3：懒加载\n\n只在需要时加载资源，减少初始加载时间。\n\n## 二、性能测试\n\n### 使用Performance API\n\n\`\`\`javascript\n// 性能测试工具\nfunction measurePerformance(fn, iterations = 1000) {\n  const start = performance.now();\n  \n  for (let i = 0; i < iterations; i++) {\n    fn();\n  }\n  \n  const end = performance.now();\n  const avgTime = (end - start) / iterations;\n  \n  console.log(\`平均执行时间: \${avgTime.toFixed(4)}ms\`);\n  return avgTime;\n}\n\`\`\`\n\n## 三、监控与调优\n\n1. **建立基准**：记录当前性能作为基准\n2. **A/B测试**：对比优化前后的性能\n3. **持续监控**：在生产环境持续监控性能指标\n\n## 四、总结\n\n性能优化是一个持续的过程，需要根据实际情况选择合适的策略。` 
        },
        { 
            q: `在生产环境中使用${knowledge}的最佳实践有哪些？请从代码质量、部署、监控等方面详细说明。`, 
            a: `# ${knowledge}生产环境最佳实践\n\n## 一、代码质量保证\n\n### 1. 代码规范\n\n\`\`\`javascript\n// ✅ 好的代码风格\nclass ${knowledge.replace(/\\s+/g, '')}Service {\n  /**\n   * 处理业务逻辑\n   * @param {InputType} input - 输入数据\n   * @returns {Promise<ResultType>} 处理结果\n   */\n  async process(input) {\n    this.validateInput(input);\n    const result = await this.executeCoreLogic(input);\n    return this.formatOutput(result);\n  }\n}\n\`\`\`\n\n### 2. 完善的测试\n\n\`\`\`javascript\ndescribe('${knowledge}测试', () => {\n  test('正常情况', () => {\n    // 测试代码\n  });\n  \n  test('边界情况', () => {\n    // 边界测试\n  });\n  \n  test('错误处理', () => {\n    // 错误处理测试\n  });\n});\n\`\`\`\n\n## 二、部署最佳实践\n\n### 1. 环境配置\n\n\`\`\`javascript\n// 环境配置加载\nconst CONFIG = {\n  development: { logLevel: 'debug' },\n  staging: { logLevel: 'info' },\n  production: { logLevel: 'warn' }\n}[process.env.NODE_ENV || 'development'];\n\`\`\`\n\n### 2. 灰度发布策略\n\n先部署到小部分用户，验证稳定后再全量发布。\n\n## 三、监控与告警\n\n### 日志记录\n\n\`\`\`javascript\nconst logger = {\n  info: (msg, meta) => {\n    console.log(JSON.stringify({ level: 'info', msg, meta, timestamp: new Date() }));\n  },\n  error: (msg, meta) => {\n    console.error(JSON.stringify({ level: 'error', msg, meta, timestamp: new Date() }));\n  }\n};\n\`\`\`\n\n## 四、安全考虑\n\n1. 输入验证：防止注入攻击\n2. 权限控制：最小权限原则\n3. 敏感数据：加密存储和传输\n\n## 五、总结\n\n在生产环境使用${knowledge}需要从多个维度综合考虑，确保系统稳定、安全、高效。` 
        }
    ];
    return templates.slice(0, Math.floor(Math.random() * 2) + 5).map((t, i) => ({
        id: i + 1, question: t.q, answer: t.a, difficulty: difficultyLabel, type: types[Math.floor(Math.random() * types.length)]
    }));
}

function getDifficultyText(difficulty) {
    return { easy: '初级', medium: '中级', hard: '高级' }[difficulty] || '中级';
}

// 渲染题目
function renderQuestions(questions) {
    questionsList.innerHTML = '';
    isAllExpanded = false;
    updateExpandButton();
    
    questions.forEach((q, i) => {
        const card = document.createElement('div');
        card.className = 'question-card';
        card.dataset.index = i;
        card.style.animationDelay = `${i * 0.1}s`;
        card.innerHTML = `
            <div class="question-header">
                <div class="question-number">${String(i + 1).padStart(2, '0')}</div>
                <div class="question-content">
                    <p class="question-text">${escapeHtml(q.question)}</p>
                    <div class="question-tags">
                        <span class="tag difficulty">${q.difficulty}</span>
                        <span class="tag type">${q.type}</span>
                    </div>
                </div>
                <div class="toggle-icon">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 12 15 18 9"></polyline></svg>
                </div>
            </div>
            <div class="answer-section">
                <div class="answer-content">
                    <div class="answer-header">
                        <div class="answer-label"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"></polyline></svg>答案解析</div>
                        <button class="copy-answer-btn" data-answer="${encodeURIComponent(q.answer)}">
                            <svg class="copy-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
                            <span class="copy-text">复制答案</span>
                        </button>
                    </div>
                    <div class="answer-text">${formatAnswer(q.answer)}</div>
                </div>
            </div>`;

        card.addEventListener('click', e => {
            if (e.target.closest('.copy-answer-btn')) {
                const btn = e.target.closest('.copy-answer-btn');
                navigator.clipboard.writeText(decodeURIComponent(btn.dataset.answer)).then(() => {
                    btn.classList.add('copied');
                    btn.querySelector('.copy-text').textContent = '已复制';
                    setTimeout(() => { btn.classList.remove('copied'); btn.querySelector('.copy-text').textContent = '复制答案'; }, 2000);
                });
                return;
            }
            const wasExpanded = card.classList.contains('expanded');
            card.classList.toggle('expanded');
            if (!wasExpanded) card.classList.add('viewed');
        });

        questionsList.appendChild(card);
    });

    document.getElementById('filter-select').addEventListener('change', handleFilterChange);
    document.getElementById('expand-all-btn').addEventListener('click', toggleExpandAll);

    questionCount.textContent = questions.length;
    questionsContainer.classList.remove('hidden');
    regenerateBtn.classList.remove('hidden');
}

function handleFilterChange() {
    const filter = document.getElementById('filter-select').value;
    document.querySelectorAll('.question-card').forEach(card => {
        const isViewed = card.classList.contains('viewed');
        card.style.display = (filter === 'seen' && !isViewed) || (filter === 'unseen' && isViewed) ? 'none' : '';
    });
}

function toggleExpandAll() {
    isAllExpanded = !isAllExpanded;
    document.querySelectorAll('.question-card').forEach(card => {
        card.classList[isAllExpanded ? 'add' : 'remove']('expanded', 'viewed');
    });
    updateExpandButton();
}

function updateExpandButton() {
    const btn = document.getElementById('expand-all-btn');
    const text = btn.querySelector('.expand-text');
    text.textContent = isAllExpanded ? '收起全部' : '展开全部';
    btn.classList.toggle('collapsed', isAllExpanded);
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function formatAnswer(answer) {
    let formatted = answer;
    
    // 处理代码块
    formatted = formatted.replace(/```([\s\S]*?)```/g, (match, code) => {
        return `<pre><code>${escapeHtml(code)}</code></pre>`;
    });
    
    // 处理内联代码
    formatted = formatted.replace(/`([^`]+)`/g, (match, code) => {
        return `<code>${escapeHtml(code)}</code>`;
    });
    
    // 先处理标题
    formatted = formatted.replace(/^#{1}\s+([^\n]+)/gm, '<h2 class="answer-h2">$1</h2>');
    formatted = formatted.replace(/^#{2}\s+([^\n]+)/gm, '<h3 class="answer-h3">$1</h3>');
    formatted = formatted.replace(/^#{3}\s+([^\n]+)/gm, '<h4 class="answer-h4">$1</h4>');
    
    // 处理粗体
    formatted = formatted.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
    
    // 处理有序列表
    let olStart = -1, olEnd = -1;
    let lines = formatted.split('\n');
    let inOl = false, inUl = false;
    let resultLines = [];
    
    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        
        if (/^\d+\.\s+/.test(line)) {
            if (!inOl) {
                resultLines.push('<ol>');
                inOl = true;
                inUl = false;
            }
            resultLines.push(`<li>${line.replace(/^\d+\.\s+/, '')}</li>`);
        } else if (/^-\s+/.test(line)) {
            if (!inUl) {
                resultLines.push('<ul>');
                inUl = true;
                inOl = false;
            }
            resultLines.push(`<li>${line.replace(/^-\s+/, '')}</li>`);
        } else {
            if (inOl) {
                resultLines.push('</ol>');
                inOl = false;
            }
            if (inUl) {
                resultLines.push('</ul>');
                inUl = false;
            }
            if (line.trim() !== '') {
                resultLines.push(line);
            }
        }
    }
    
    if (inOl) resultLines.push('</ol>');
    if (inUl) resultLines.push('</ul>');
    
    formatted = resultLines.join('\n');
    
    // 处理表格
    formatted = formatted.replace(/\|(.+)\|/g, (match, content) => {
        if (content.includes('---')) return '';
        const cells = content.split('|').map(cell => cell.trim());
        if (cells.every(c => !c)) return '';
        const isHeader = /^(方案|优点|缺点|适用场景|问题|优化示例|关键要点|性能提升|注意事项)$/.test(cells[0]);
        return `<tr>${cells.map(c => `<${isHeader ? 'th' : 'td'}>${c}</${isHeader ? 'th' : 'td'}>`).join('')}</tr>`;
    });
    formatted = formatted.replace(/(<tr>.*?<\/tr>)/gs, (match) => {
        return `<table>${match}</table>`;
    });
    
    // 处理段落和换行
    formatted = formatted.replace(/\n\n+/g, '</p><p>');
    if (formatted && !formatted.startsWith('<h') && !formatted.startsWith('<p') && !formatted.startsWith('<pre')) {
        formatted = '<p>' + formatted + '</p>';
    }
    
    return formatted;
}

// 历史记录
function saveToHistory(topic, difficulty) {
    let history = getHistory().filter(h => h.topic !== topic);
    history.unshift({ 
        topic, 
        difficulty, 
        timestamp: Date.now(), 
        questionCount: currentQuestions.length,
        questions: JSON.stringify(currentQuestions)
    });
    if (history.length > 20) history.pop();
    localStorage.setItem('knowledge_quiz_history', JSON.stringify(history));
    renderHistory();
}

function getHistory() {
    const stored = localStorage.getItem('knowledge_quiz_history');
    return stored ? JSON.parse(stored) : [];
}

function renderHistory() {
    const historyList = document.getElementById('history-list');
    const history = getHistory();
    
    if (history.length === 0) {
        historyList.innerHTML = `<div class="empty-history"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline></svg><p>暂无历史记录</p></div>`;
        return;
    }
    
    historyList.innerHTML = history.map(item => {
        const date = new Date(item.timestamp).toLocaleDateString('zh-CN', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
        return `<div class="history-item" data-topic="${encodeURIComponent(item.topic)}">
            <div class="history-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg></div>
            <div class="history-content"><div class="history-title">${escapeHtml(item.topic)}</div><div class="history-meta"><span>${getDifficultyText(item.difficulty)}</span><span>·</span><span>${item.questionCount}道题目</span><span>·</span><span>${date}</span></div></div>
        </div>`;
    }).join('');
    
    document.querySelectorAll('.history-item').forEach(item => {
        item.addEventListener('click', () => {
            const topic = decodeURIComponent(item.dataset.topic);
            const history = getHistory();
            const historyItem = history.find(h => h.topic === topic);
            
            if (historyItem && historyItem.questions) {
                currentQuestions = JSON.parse(historyItem.questions);
                topicDisplay.textContent = topic;
                renderQuestions(currentQuestions);
                questionsContainer.classList.remove('hidden');
                emptyState.classList.add('hidden');
                knowledgeInput.value = topic;
                difficultySelect.value = historyItem.difficulty;
                updateStepIndicator();
            } else {
                knowledgeInput.value = topic;
                updateStepIndicator();
            }
            
            closeSidebar();
        });
    });
}

function openSidebar() {
    document.getElementById('history-sidebar').classList.add('open');
    document.getElementById('sidebar-backdrop').classList.remove('hidden');
    document.body.style.overflow = 'hidden';
}

function closeSidebar() {
    document.getElementById('history-sidebar').classList.remove('open');
    document.getElementById('sidebar-backdrop').classList.add('hidden');
    document.body.style.overflow = '';
}

// 步骤指示器
function updateStepIndicator(isGenerated = false) {
    const steps = document.querySelectorAll('.step');
    const hasInput = knowledgeInput.value.trim() !== '';
    const hasDifficulty = difficultySelect.value !== '';
    
    steps.forEach(s => s.classList.remove('active', 'completed'));
    
    if (isGenerated && hasInput && hasDifficulty) {
        steps[0].classList.add('completed');
        steps[1].classList.add('completed');
        steps[2].classList.add('completed');
    } else {
        if (hasInput) {
            steps[0].classList.add('completed');
        } else {
            steps[0].classList.add('active');
        }
        
        if (hasDifficulty) {
            if (hasInput) {
                steps[1].classList.add('completed');
                steps[2].classList.add('active');
            } else {
                steps[1].classList.add('active');
            }
        } else if (hasInput) {
            steps[1].classList.add('active');
        }
    }
}

// 提示消息
function showError(message) {
    removeError();
    const div = document.createElement('div');
    div.className = 'error-message';
    div.innerHTML = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>${message}`;
    document.querySelector('.container').insertBefore(div, document.querySelector('.input-card').nextSibling);
}

function showInfoTip(message) {
    removeError();
    const div = document.createElement('div');
    div.className = 'info-tip';
    div.innerHTML = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>${message}`;
    document.querySelector('.container').insertBefore(div, document.querySelector('.input-card').nextSibling);
    
    if (!document.getElementById('info-tip-style')) {
        const style = document.createElement('style');
        style.id = 'info-tip-style';
        style.textContent = `.info-tip{background:rgba(99,102,241,.1);border:1px solid rgba(99,102,241,.25);border-radius:var(--radius-md);padding:16px 20px;margin-bottom:24px;display:flex;align-items:center;gap:12px;color:var(--primary-light);font-size:14px;animation:fadeInUp .4s ease}.info-tip svg{flex-shrink:0}`;
        document.head.appendChild(style);
    }
}

function removeError() {
    document.querySelector('.error-message')?.remove();
    document.querySelector('.info-tip')?.remove();
}
