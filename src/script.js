class Game {
    constructor() {
        this.merit = 0;
        this.attack = 5;
        this.enemyHealth = 0;
        this.maxEnemyHealth = 0;
        this.meditationTime = 0;
        this.maxMeditationTime = 160;
        this.killCount = 0;
        this.maxKillCount = 2;
        this.logs = []; // 日志数组，用于持久化存储
        this.lastOnlineTime = new Date().getTime(); // 初始化当前时间
        
        // 木鱼图片数组
        this.woodenFishImages = [
            'R-C.png'
        ];
        
        // 怪物图片数组
        this.enemyImages = [
            '1726.png_860.png'
        ];
        
        this.enemyNames = [
            // 传统魅魔色魔
            "魅魔", "色魔", "妖狐", "艳鬼", "魔女", "花妖", "蛇精", "狐狸精",
            "蜘蛛精", "白骨精", "琵琶精", "蝎子精", "玉兔精", "老鼠精", "黑熊精",
            "红孩儿", "铁扇公主", "玉面狐狸", "万圣公主", "蝎子精", "蜈蚣精",
            "黄风怪", "犀牛精", "狮驼岭三怪", "金角大王", "银角大王", "白骨夫人",
            // 日常生活坏习惯鬼
            "拖延鬼", "懒惰鬼", "贪吃鬼", "熬夜鬼", "烟瘾鬼", "酒瘾鬼", "赌瘾鬼", "手机鬼",
            "游戏鬼", "追剧鬼", "贪吃鬼", "偷懒鬼", "易怒鬼", "嫉妒鬼", "贪婪鬼", "傲慢鬼",
            "暴食鬼", "色欲鬼", "暴怒鬼", "怠惰鬼", "贪婪鬼", "嫉妒鬼", "傲慢鬼",
            // 黑社会主义恶霸
            "黑帮老大", "恶霸", "地头蛇", "痞子", "混混", "打手", "黑社会老大", "黑恶势力",
            "村霸", "市霸", "路霸", "肉霸", "菜霸", "鱼霸", "水霸", "电霸",
            "恶霸地主", "恶势力头目", "黑社会成员", "黑社会组织", "流氓恶霸"
        ];
        
        // 初始化任务系统
        this.tasks = [
            { id: 'meditate', name: '静坐160秒', merit: 20, completed: false },
            { id: 'write', name: '认真写一行字', merit: 10, completed: false },
            { id: 'read', name: '放下手机看一页书', merit: 25, completed: false }
        ];
        
        this.initElements();
        this.loadGameData();
        this.checkDateReset();
        this.updateDisplay(); // 加载数据后更新UI显示
        this.updateTaskButtons(); // 加载数据后更新任务按钮
        this.updateKillCount(); // 加载数据后更新秒杀次数显示
        this.restoreLogs(); // 恢复日志显示
        this.initEventListeners();
        this.startGame();
        this.loadImages();
    }
    
    initElements() {
        this.meritElement = document.getElementById('merit');
        this.attackElement = document.getElementById('attack');
        this.enemyImage = document.getElementById('enemy-image');
        this.enemyNameElement = document.getElementById('enemy-name');
        this.healthBar = document.getElementById('health-bar');
        this.healthText = document.getElementById('health-text');
        this.meditationProgress = document.getElementById('meditation-progress');
        this.meditationTimeElement = document.getElementById('meditation-time');
        this.upgradeBtn = document.getElementById('upgrade-attack');
        this.instantKillBtn = document.getElementById('instant-kill');
        this.killCountElement = document.getElementById('kill-count');
        this.gameLog = document.getElementById('game-log');
        this.woodenFish = document.getElementById('wooden-fish');
        this.addMeritBtn = document.getElementById('add-merit-btn');
    }
    
    initEventListeners() {
        this.upgradeBtn.addEventListener('click', () => this.upgradeAttack());
        this.instantKillBtn.addEventListener('click', () => this.instantKill());
        this.addMeritBtn.addEventListener('click', () => this.addMeritDirectly());
        
        document.querySelectorAll('.task-btn').forEach((btn, index) => {
            btn.addEventListener('click', (e) => {
                this.completeTask(index);
            });
        });
        
        // 添加页面关闭前保存日志的事件监听器
        window.addEventListener('beforeunload', () => {
            this.saveGameData();
        });
    }
    
    addMeritDirectly() {
        // 直接增加250功德的功能
        this.addMerit(250);
        this.log('使用特殊功能，获得250功德！');
    }
    
    completeTask(index) {
        if (!this.tasks[index].completed) {
            this.tasks[index].completed = true;
            // 随机获得666-3666功德
            const randomMerit = Math.floor(Math.random() * (3666 - 666 + 1)) + 666;
            this.addMerit(randomMerit);
            this.log(`完成任务【${this.tasks[index].name}】，获得 ${randomMerit} 功德！`);
            this.updateTaskButtons();
            this.saveGameData();
        }
    }
    
    updateTaskButtons() {
        const taskButtons = document.querySelectorAll('.task-btn');
        taskButtons.forEach((btn, index) => {
            if (this.tasks[index].completed) {
                btn.textContent = '已完成';
                btn.disabled = true;
                btn.classList.add('task-completed');
            } else {
                btn.textContent = '完成';
                btn.disabled = false;
                btn.classList.remove('task-completed');
            }
        });
    }
    
    checkDateReset() {
        const today = new Date().toDateString();
        if (this.lastPlayDate !== today) {
            // 重置每日任务
            this.tasks.forEach(task => {
                task.completed = false;
            });
            // 重置秒杀次数
            this.killCount = 0;
            this.updateKillCount();
            // 更新最后游戏日期
            this.lastPlayDate = today;
            this.log('新的一天开始了，每日任务已重置！');
            this.saveGameData(); // 保存重置后的数据
        }
    }
    
    saveGameData() {
        const gameData = {
            merit: this.merit,
            attack: this.attack,
            tasks: this.tasks,
            lastPlayDate: this.lastPlayDate,
            killCount: this.killCount,
            logs: this.logs,
            lastOnlineTime: new Date().getTime() // 记录当前时间
        };
        localStorage.setItem('gameData', JSON.stringify(gameData));
    }
    
    loadGameData() {
        const savedData = localStorage.getItem('gameData');
        if (savedData) {
            const gameData = JSON.parse(savedData);
            this.merit = gameData.merit || 0;
            this.attack = gameData.attack || 5;
            this.tasks = gameData.tasks || [
                { id: 'meditate', name: '静坐160秒', merit: 20, completed: false },
                { id: 'write', name: '认真写一行字', merit: 10, completed: false },
                { id: 'read', name: '放下手机看一页书', merit: 25, completed: false }
            ];
            this.lastPlayDate = gameData.lastPlayDate || new Date().toDateString();
            this.killCount = gameData.killCount || 0;
            this.logs = gameData.logs || [];
            
            // 计算离线时间和离线功德
            const lastOnlineTime = gameData.lastOnlineTime || new Date().getTime();
            const currentTime = new Date().getTime();
            const offlineSeconds = Math.floor((currentTime - lastOnlineTime) / 1000);
            
            // 离线时间上限3小时（10800秒）
            const maxOfflineSeconds = 3 * 60 * 60;
            const actualOfflineSeconds = Math.min(offlineSeconds, maxOfflineSeconds);
            
            // 每分钟700±50功德，即每秒(700±50)/60功德
            const baseMeritPerMinute = 700;
            const variation = Math.floor(Math.random() * 101) - 50; // -50到+50的随机值
            const meritPerMinute = baseMeritPerMinute + variation;
            const meritPerSecond = meritPerMinute / 60;
            
            const offlineMerit = Math.floor(actualOfflineSeconds * meritPerSecond);
            
            if (offlineMerit > 0) {
                this.merit += offlineMerit;
                this.log(`离线挂机获得 ${offlineMerit} 功德！`);
            }
            // 更新lastOnlineTime为当前时间，避免多次刷新重复获得离线功德
            this.lastOnlineTime = currentTime;
        } else {
            this.lastPlayDate = new Date().toDateString();
            this.logs = [];
        }
    }
    
    loadImages() {
        // 从数组中随机选择木鱼图片
        const randomWoodenFish = this.woodenFishImages[Math.floor(Math.random() * this.woodenFishImages.length)];
        this.woodenFish.src = randomWoodenFish;
        this.woodenFish.alt = '木鱼';
        
        // 从数组中随机选择怪物图片
        this.loadRandomEnemyImage();
        
        // 加载木鱼声音
        const audio = document.getElementById('wooden-fish-sound');
        audio.src = 'muyumusic.mp3';
        audio.volume = 0.3;
        audio.loop = true;
    }
    
    loadRandomEnemyImage() {
        const randomEnemyImage = this.enemyImages[Math.floor(Math.random() * this.enemyImages.length)];
        this.enemyImage.src = randomEnemyImage;
        this.enemyImage.alt = '怪物';
    }
    
    startGame() {
        // 立即播放木鱼声（循环）
        this.playWoodenFishSound();
        
        // 生成怪物
        this.spawnEnemy();
        
        // 每分钟自动获得功德
        setInterval(() => {
            this.addMerit(1);
            this.playWoodenFishSound();
        }, 60000);
        
        // 每秒自动攻击
        setInterval(() => {
            this.attackEnemy();
        }, 1000);
        
        // 每秒更新静坐时间
        setInterval(() => {
            this.updateMeditation();
        }, 1000);
    }
    
    spawnEnemy() {
        // 怪物血量 = 攻击力 × (80 ± 10)
        const baseMultiplier = 80 + (Math.floor(Math.random() * 21) - 10); // 70 到 90 之间的随机值
        this.maxEnemyHealth = Math.max(1, this.attack * baseMultiplier); // 确保血量至少为1
        this.enemyHealth = this.maxEnemyHealth;
        this.enemyNameElement.textContent = this.enemyNames[Math.floor(Math.random() * this.enemyNames.length)];
        // 随机更换怪物图片
        this.loadRandomEnemyImage();
        this.updateEnemyDisplay();
        this.log(`遇到了 ${this.enemyNameElement.textContent}！`);
        // 在怪物出现时播放木鱼声
        this.playWoodenFishSound();
    }
    
    attackEnemy() {
        if (this.enemyHealth > 0) {
            const previousHealth = this.enemyHealth;
            this.enemyHealth = Math.max(0, this.enemyHealth - this.attack);
            this.updateEnemyDisplay();
            
            // 怪物受击动画
            this.enemyImage.classList.add('enemy-shake');
            setTimeout(() => {
                this.enemyImage.classList.remove('enemy-shake');
            }, 500);
            
            // 只有当怪物从活着变为死亡时才调用killEnemy，避免重复调用
            if (previousHealth > 0 && this.enemyHealth === 0) {
                this.killEnemy();
            }
        }
    }
    
    killEnemy() {
        this.addMerit(100);
        this.log(`击败了 ${this.enemyNameElement.textContent}，获得 100 功德！`);
        this.saveGameData();
        this.spawnEnemy();
    }
    
    upgradeAttack() {
        if (this.merit >= 200) {
            this.merit -= 200;
            this.attack += 1;
            this.updateDisplay();
            this.log(`升级攻击力！当前攻击力: ${this.attack}`);
            this.saveGameData();
            
            // 升级动画
            this.attackElement.parentElement.classList.add('level-up');
            setTimeout(() => {
                this.attackElement.parentElement.classList.remove('level-up');
            }, 1000);
        }
    }
    
    instantKill() {
        if (this.killCount < this.maxKillCount && this.enemyHealth > 0) {
            this.enemyHealth = 0;
            this.killCount += 1;
            this.updateKillCount();
            this.updateEnemyDisplay();
            this.log(`使用秒杀技能！剩余次数: ${this.maxKillCount - this.killCount}`);
            this.saveGameData();
            
            this.killEnemy();
        }
    }
    
    updateMeditation() {
        this.meditationTime = (this.meditationTime + 1) % (this.maxMeditationTime + 1);
        const progress = (this.meditationTime / this.maxMeditationTime) * 100;
        this.meditationProgress.style.width = `${progress}%`;
        this.meditationTimeElement.textContent = `${this.meditationTime}/${this.maxMeditationTime}`;
        
        if (this.meditationTime === this.maxMeditationTime) {
            this.addMerit(2000);
            this.log(`静坐160秒，获得 2000 功德！`);
        }
    }
    
    addMerit(amount) {
        this.merit += amount;
        this.updateDisplay();
        this.saveGameData();
    }
    
    updateDisplay() {
        this.meritElement.textContent = this.merit;
        this.attackElement.textContent = this.attack;
        this.upgradeBtn.disabled = this.merit < 200;
    }
    
    updateEnemyDisplay() {
        const healthPercent = (this.enemyHealth / this.maxEnemyHealth) * 100;
        this.healthBar.style.width = `${healthPercent}%`;
        this.healthText.textContent = `${this.enemyHealth}/${this.maxEnemyHealth}`;
    }
    
    updateKillCount() {
        this.killCountElement.textContent = `${this.killCount}/${this.maxKillCount}`;
        this.instantKillBtn.disabled = this.killCount >= this.maxKillCount;
    }
    
    log(message) {
        // 增加年月日的日志格式
        const now = new Date();
        const dateTimeString = now.toLocaleString('zh-CN', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        });
        const logText = `[${dateTimeString}] ${message}`;
        
        // 添加到日志数组，限制日志数量，最多保存50条
        this.logs.push(logText);
        if (this.logs.length > 50) {
            this.logs.shift(); // 移除最旧的日志
        }
        
        // 显示日志
        const logEntry = document.createElement('div');
        logEntry.textContent = logText;
        this.gameLog.appendChild(logEntry);
        this.gameLog.scrollTop = this.gameLog.scrollHeight;
        
        // 保存日志
        this.saveGameData();
    }
    
    restoreLogs() {
        // 清空当前日志显示
        this.gameLog.innerHTML = '';
        
        // 恢复保存的日志
        this.logs.forEach(logText => {
            const logEntry = document.createElement('div');
            logEntry.textContent = logText;
            this.gameLog.appendChild(logEntry);
        });
        
        // 滚动到底部
        this.gameLog.scrollTop = this.gameLog.scrollHeight;
    }
    
    playWoodenFishSound() {
        const audio = document.getElementById('wooden-fish-sound');
        // 立即播放声音，不检查是否已在播放
        audio.currentTime = 0;
        audio.play().catch(error => {
            console.log('无法播放声音:', error);
            // 尝试在用户交互后播放
            document.body.addEventListener('click', () => {
                audio.play().catch(err => {
                    console.log('仍无法播放声音:', err);
                });
            }, { once: true });
        });
    }
}

// 页面加载完成后初始化游戏
document.addEventListener('DOMContentLoaded', () => {
    new Game();
});