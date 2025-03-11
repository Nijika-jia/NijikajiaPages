document.addEventListener('DOMContentLoaded', function () {
    function ClickFrontShow() {
        // 动态文字和对应音频文件的映射
        this.items = [
            { text: "Ciallo～(∠・ω< )⌒★", audio: './ciallo.aac' },
            { text: "Ciallo～(∠・ω< )⌒★", audio: './caillo_mgl.wav' },
            { text: "啵央央~", audio: './星号.wav' },
        ];
        this.colo = ['#FF69B4', '#ff6651', 'orange', '#FF00FF', '#00FF7F', '#00BFFF', '#BA55D3'];
        this.elBody = document.body;
        this.cls = 0; // 用于动态类名
    }

    // 预加载音频
    ClickFrontShow.prototype.preloadAudio = function () {
        this.items.forEach(item => {
            const audio = new Audio(item.audio);
            audio.load(); // 预加载音频
        });
    };

    ClickFrontShow.prototype.init = function (items, colorArray) {
        this.items = items || this.items;
        this.colo = colorArray || this.colo;
        this.listenMouse();
    };

    ClickFrontShow.prototype.createFront = function (classname, text, color) {
        let ospan = document.createElement('span');
        let cssText = "position:absolute; height: 1px; cursor: default; transform: translate(-50%,-50%); font-weight: bold; opacity: 1; z-index: 1000; transition: 1s; font-size: 20px;";
        this.elBody.appendChild(ospan);
        ospan.className = String(classname);
        ospan.style.cssText = cssText + "-moz-user-select: none;-webkit-user-select: none;-ms-user-select: none;user-select: none;";
        ospan.style.color = color;
        ospan.innerHTML = text;
    };

    ClickFrontShow.prototype.listenMouse = function () {
        const self = this;
        document.onclick = async function (e) {
            // 随机选择一个文字和对应的音频
            const randomIndex = Math.floor(Math.random() * self.items.length);
            const randomItem = self.items[randomIndex];
            const randomColor = self.colo[Math.floor(Math.random() * self.colo.length)];

            // 更新动态类名
            if (self.cls === 20) {
                self.cls = 0;
            } else {
                self.cls += 1;
            }

            // 创建动态文字
            self.createFront(self.cls, randomItem.text, randomColor);
            let el = document.getElementsByClassName(self.cls)[0];
            el.style.left = e.clientX + 'px';
            el.style.top = e.clientY + 'px';

            // 添加动画效果
            setTimeout(function () {
                el.style.opacity = 0;
                el.style.top = el.offsetTop - 100 + 'px';
            }, 100);
            setTimeout(function () {
                self.elBody.removeChild(el);
            }, 2000);

            // 异步播放音频
            try {
                const audio = new Audio(randomItem.audio);
                await audio.play();
            } catch (err) {
                console.error("音频播放失败:", err);
            }
        };
    };

    const frontShow = new ClickFrontShow();
    frontShow.preloadAudio(); // 预加载音频
    frontShow.init();
});
