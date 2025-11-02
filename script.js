
        // ============================================
        // NEUROGRID: PATTERN FUSION - ULTRA HD COLORFUL
        // Maximum Visual Quality for Y8.com
        // ============================================

        const canvas = document.getElementById('gameCanvas');
        const ctx = canvas.getContext('2d', { alpha: false, willReadFrequently: false });

        // Ultra HD Resolution
        const GAME_WIDTH = 960;
        const GAME_HEIGHT = 640;
        const DPR = Math.min(window.devicePixelRatio || 1, 2);

        canvas.width = GAME_WIDTH * DPR;
        canvas.height = GAME_HEIGHT * DPR;
        canvas.style.width = GAME_WIDTH + 'px';
        canvas.style.height = GAME_HEIGHT + 'px';
        ctx.scale(DPR, DPR);

        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';

        // ============================================
        // GAME STATE
        // ============================================
        const game = {
            state: 'menu',
            score: 0,
            level: 1,
            timeLeft: 60,
            maxTime: 60,
            targetPattern: null,
            targetValue: 0,
            numbers: [],
            particles: [],
            stars: [],
            nebula: [],
            lightningBolts: [],
            glowOrbs: [],
            highScore: parseInt(localStorage.getItem('neuroGridUltraHD_HighScore')) || 0,
            combo: 0,
            maxCombo: 0,
            totalCorrect: 0,
            totalWrong: 0,
            gridPulse: 0,
            rainbowHue: 0,
            lastFrameTime: 0,
            animations: [],
            buttons: {},
            hoverButton: null,
            energyPulse: 0,
            colorCycle: 0
        };

        const PATTERNS = {
            SUM: 'sum',
            PRODUCT: 'product',
            EVEN: 'even',
            ODD: 'odd',
            GREATER: 'greater',
            SEQUENCE: 'sequence'
        };

        // ============================================
        // COLORFUL PALETTE
        // ============================================
        const COLORS = {
            neonCyan: '#00FFFF',
            neonPink: '#FF00FF',
            neonGreen: '#00FF00',
            neonYellow: '#FFFF00',
            neonOrange: '#FF6600',
            neonPurple: '#9933FF',
            neonBlue: '#0099FF',
            electricBlue: '#00E5FF',
            hotPink: '#FF1493',
            lime: '#00FF88',
            gold: '#FFD700',
            violet: '#EE82EE'
        };

        // ============================================
        // UTILITY FUNCTIONS
        // ============================================
        function randomInt(min, max) {
            return Math.floor(Math.random() * (max - min + 1)) + min;
        }

        function randomColor() {
            const colors = Object.values(COLORS);
            return colors[randomInt(0, colors.length - 1)];
        }

        function hslToRgb(h, s, l) {
            s /= 100;
            l /= 100;
            const k = n => (n + h / 30) % 12;
            const a = s * Math.min(l, 1 - l);
            const f = n => l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
            return `rgb(${Math.round(255 * f(0))}, ${Math.round(255 * f(8))}, ${Math.round(255 * f(4))})`;
        }

        function getRainbowColor(offset = 0) {
            return hslToRgb((game.rainbowHue + offset) % 360, 100, 50);
        }

        function lerp(start, end, t) {
            return start + (end - start) * t;
        }

        function easeOutElastic(t) {
            const c4 = (2 * Math.PI) / 3;
            return t === 0 ? 0 : t === 1 ? 1 : Math.pow(2, -10 * t) * Math.sin((t * 10 - 0.75) * c4) + 1;
        }

        function easeOutBounce(t) {
            const n1 = 7.5625;
            const d1 = 2.75;
            if (t < 1 / d1) {
                return n1 * t * t;
            } else if (t < 2 / d1) {
                return n1 * (t -= 1.5 / d1) * t + 0.75;
            } else if (t < 2.5 / d1) {
                return n1 * (t -= 2.25 / d1) * t + 0.9375;
            } else {
                return n1 * (t -= 2.625 / d1) * t + 0.984375;
            }
        }

        // ============================================
        // INITIALIZE BACKGROUND
        // ============================================
        function initBackground() {
            // Colorful stars
            for (let i = 0; i < 300; i++) {
                game.stars.push({
                    x: Math.random() * GAME_WIDTH,
                    y: Math.random() * GAME_HEIGHT,
                    size: Math.random() * 3,
                    speed: Math.random() * 0.5 + 0.2,
                    opacity: Math.random() * 0.8 + 0.2,
                    twinkle: Math.random() * Math.PI * 2,
                    color: randomColor(),
                    colorShift: Math.random() * 360
                });
            }

            // Rainbow nebula
            for (let i = 0; i < 80; i++) {
                game.nebula.push({
                    x: Math.random() * GAME_WIDTH,
                    y: Math.random() * GAME_HEIGHT,
                    size: randomInt(100, 250),
                    opacity: Math.random() * 0.08 + 0.03,
                    speed: Math.random() * 0.08 + 0.03,
                    hue: randomInt(0, 360),
                    pulsePhase: Math.random() * Math.PI * 2
                });
            }

            // Glowing orbs
            for (let i = 0; i < 20; i++) {
                game.glowOrbs.push({
                    x: Math.random() * GAME_WIDTH,
                    y: Math.random() * GAME_HEIGHT,
                    radius: randomInt(15, 40),
                    vx: (Math.random() - 0.5) * 0.5,
                    vy: (Math.random() - 0.5) * 0.5,
                    hue: randomInt(0, 360),
                    pulseSpeed: Math.random() * 0.05 + 0.02
                });
            }
        }

        // ============================================
        // ANIMATION SYSTEM
        // ============================================
        function addAnimation(type, data) {
            game.animations.push({
                type: type,
                startTime: performance.now(),
                duration: data.duration || 500,
                data: data
            });
        }

        function updateAnimations(currentTime) {
            game.animations = game.animations.filter(anim => {
                const elapsed = currentTime - anim.startTime;
                const progress = Math.min(elapsed / anim.duration, 1);
                
                if (anim.type === 'scorePopup') {
                    const eased = easeOutBounce(progress);
                    anim.data.y -= 2;
                    anim.data.opacity = 1 - progress;
                    anim.data.scale = 1 + eased * 0.8;
                    anim.data.rotation = Math.sin(progress * Math.PI * 4) * 0.1;
                    return progress < 1;
                }
                
                if (anim.type === 'comboFlash') {
                    anim.data.scale = 1 + Math.sin(progress * Math.PI * 2) * 0.6;
                    anim.data.opacity = 1 - progress;
                    anim.data.rotation = progress * Math.PI * 2;
                    return progress < 1;
                }
                
                if (anim.type === 'numberPop') {
                    const t = easeOutElastic(progress);
                    anim.data.number.scale = lerp(0, 1, t);
                    anim.data.number.rotation = (1 - t) * Math.PI * 2;
                    return progress < 1;
                }
                
                if (anim.type === 'shockwave') {
                    anim.data.radius += 18;
                    anim.data.opacity = 1 - progress;
                    anim.data.rotation += 0.1;
                    return progress < 1;
                }
                
                if (anim.type === 'confetti') {
                    anim.data.y += anim.data.vy;
                    anim.data.x += anim.data.vx;
                    anim.data.vy += 0.5;
                    anim.data.rotation += anim.data.rotSpeed;
                    anim.data.opacity = 1 - progress;
                    return progress < 1;
                }
                
                if (anim.type === 'lightning') {
                    anim.data.opacity = 1 - progress;
                    return progress < 1;
                }
                
                return progress < 1;
            });
        }

        // ============================================
        // GAME LOGIC
        // ============================================
        function generatePuzzle() {
            game.numbers = [];
            
            const difficulty = Math.min(game.level, 15);
            const patterns = [PATTERNS.SUM, PATTERNS.EVEN, PATTERNS.ODD, PATTERNS.GREATER];
            
            if (difficulty > 2) patterns.push(PATTERNS.PRODUCT);
            if (difficulty > 5) patterns.push(PATTERNS.SEQUENCE);
            
            game.targetPattern = patterns[randomInt(0, patterns.length - 1)];

            const gridCols = 4;
            const gridRows = 3;
            const startX = 220;
            const startY = 220;
            const spacingX = 175;
            const spacingY = 135;

            const maxNum = Math.min(12 + difficulty * 2, 35);

            for (let row = 0; row < gridRows; row++) {
                for (let col = 0; col < gridCols; col++) {
                    let value;
                    
                    switch(game.targetPattern) {
                        case PATTERNS.SUM:
                            game.targetValue = randomInt(20 + difficulty * 2, 40 + difficulty * 3);
                            value = randomInt(2, maxNum);
                            break;
                        case PATTERNS.PRODUCT:
                            const products = [12, 18, 20, 24, 30, 36, 40, 48, 60, 72];
                            game.targetValue = products[randomInt(0, Math.min(difficulty - 1, products.length - 1))];
                            value = randomInt(2, 10);
                            break;
                        case PATTERNS.EVEN:
                            game.targetValue = 3 + Math.floor(difficulty / 4);
                            value = randomInt(1, maxNum);
                            break;
                        case PATTERNS.ODD:
                            game.targetValue = 3 + Math.floor(difficulty / 4);
                            value = randomInt(1, maxNum);
                            break;
                        case PATTERNS.GREATER:
                            game.targetValue = 12 + difficulty * 2;
                            value = randomInt(1, maxNum + 8);
                            break;
                        case PATTERNS.SEQUENCE:
                            game.targetValue = 4;
                            value = randomInt(1, 20);
                            break;
                    }
                    
                    const num = {
                        value: value,
                        x: startX + col * spacingX,
                        y: startY + row * spacingY,
                        selected: false,
                        scale: 0,
                        rotation: 0,
                        pulsePhase: Math.random() * Math.PI * 2,
                        glowIntensity: 0,
                        colorOffset: (row * gridCols + col) * 30
                    };
                    
                    game.numbers.push(num);
                    addAnimation('numberPop', { 
                        number: num, 
                        duration: 500 + (row * gridCols + col) * 50 
                    });
                }
            }
        }

        function checkSolution() {
            const selected = game.numbers.filter(n => n.selected);
            if (selected.length === 0) return false;

            let correct = false;

            switch(game.targetPattern) {
                case PATTERNS.SUM:
                    const sum = selected.reduce((acc, n) => acc + n.value, 0);
                    correct = sum === game.targetValue;
                    break;
                case PATTERNS.PRODUCT:
                    const product = selected.reduce((acc, n) => acc * n.value, 1);
                    correct = product === game.targetValue;
                    break;
                case PATTERNS.EVEN:
                    correct = selected.length === game.targetValue && 
                              selected.every(n => n.value % 2 === 0);
                    break;
                case PATTERNS.ODD:
                    correct = selected.length === game.targetValue && 
                              selected.every(n => n.value % 2 !== 0);
                    break;
                case PATTERNS.GREATER:
                    correct = selected.length >= 3 && 
                              selected.every(n => n.value > game.targetValue);
                    break;
                case PATTERNS.SEQUENCE:
                    if (selected.length === game.targetValue) {
                        const values = selected.map(n => n.value).sort((a, b) => a - b);
                        correct = values.every((v, i, arr) => i === 0 || v === arr[i - 1] + 1);
                    }
                    break;
            }

            return correct;
        }

        function submitAnswer() {
            const selected = game.numbers.filter(n => n.selected);
            if (selected.length === 0) return;

            if (checkSolution()) {
                // CORRECT!
                const basePoints = 150;
                const comboBonus = game.combo * 50;
                const speedBonus = Math.floor((game.timeLeft / game.maxTime) * 100);
                const levelBonus = game.level * 15;
                const totalPoints = basePoints + comboBonus + speedBonus + levelBonus;
                
                game.score += totalPoints;
                game.combo++;
                game.totalCorrect++;
                game.maxCombo = Math.max(game.maxCombo, game.combo);
                game.timeLeft = Math.min(game.timeLeft + 6, game.maxTime);
                
                // MASSIVE visual feedback
                selected.forEach(n => {
                    // Rainbow particle explosion
                    for (let i = 0; i < 40; i++) {
                        const angle = (Math.PI * 2 * i) / 40;
                        const speed = randomInt(5, 12);
                        game.particles.push({
                            x: n.x,
                            y: n.y,
                            vx: Math.cos(angle) * speed,
                            vy: Math.sin(angle) * speed,
                            life: 1,
                            color: hslToRgb((i * 9) % 360, 100, 50),
                            size: randomInt(5, 12),
                            rotation: 0,
                            rotationSpeed: (Math.random() - 0.5) * 0.4,
                            gravity: 0.3,
                            trail: true
                        });
                    }
                    
                    // Confetti
                    for (let i = 0; i < 15; i++) {
                        addAnimation('confetti', {
                            x: n.x,
                            y: n.y,
                            vx: (Math.random() - 0.5) * 8,
                            vy: -randomInt(5, 12),
                            rotation: Math.random() * Math.PI * 2,
                            rotSpeed: (Math.random() - 0.5) * 0.3,
                            color: randomColor(),
                            size: randomInt(8, 16),
                            opacity: 1,
                            duration: 2000
                        });
                    }
                    
                    // Multi-layered shockwaves
                    for (let i = 0; i < 3; i++) {
                        setTimeout(() => {
                            addAnimation('shockwave', { 
                                x: n.x, 
                                y: n.y, 
                                radius: 0, 
                                opacity: 1, 
                                rotation: 0,
                                color: getRainbowColor(i * 60),
                                duration: 800 
                            });
                        }, i * 100);
                    }
                    
                    // Lightning effect
                    createLightning(n.x, n.y);
                });
                
                // Score popup with rainbow effect
                addAnimation('scorePopup', {
                    x: GAME_WIDTH / 2,
                    y: 160,
                    text: `+${totalPoints}`,
                    opacity: 1,
                    scale: 1,
                    rotation: 0,
                    duration: 1500
                });
                
                if (game.combo > 1) {
                    addAnimation('comboFlash', {
                        x: 150,
                        y: 110,
                        scale: 1,
                        opacity: 1,
                        rotation: 0,
                        duration: 800
                    });
                }
                
                playSound('success', Math.min(game.combo, 5));
                
                // Level progression
                const newLevel = Math.floor(game.score / 800) + 1;
                if (newLevel > game.level) {
                    game.level = newLevel;
                    game.maxTime = Math.max(45, 65 - game.level * 2);
                    createLevelUpEffect();
                }
                
                setTimeout(() => generatePuzzle(), 300);
            } else {
                // WRONG!
                game.combo = 0;
                game.totalWrong++;
                game.timeLeft = Math.max(game.timeLeft - 5, 0);
                
                selected.forEach(n => {
                    // Red explosion
                    for (let i = 0; i < 25; i++) {
                        const angle = (Math.PI * 2 * i) / 25;
                        const speed = randomInt(4, 9);
                        game.particles.push({
                            x: n.x,
                            y: n.y,
                            vx: Math.cos(angle) * speed,
                            vy: Math.sin(angle) * speed,
                            life: 1,
                            color: `hsl(${randomInt(0, 30)}, 100%, 50%)`,
                            size: randomInt(4, 10),
                            rotation: 0,
                            rotationSpeed: (Math.random() - 0.5) * 0.3,
                            gravity: 0.25
                        });
                    }
                    n.selected = false;
                    n.scale = 0.7;
                });
                
                playSound('error');
                game.numbers.forEach(n => n.selected = false);
            }
        }

        function createLightning(startX, startY) {
            const endX = startX + randomInt(-100, 100);
            const endY = startY + randomInt(-100, 100);
            
            const segments = 20;
            const points = [{x: startX, y: startY}];
            
            for (let i = 1; i < segments; i++) {
                const t = i / segments;
                const x = lerp(startX, endX, t) + (Math.random() - 0.5) * 40;
                const y = lerp(startY, endY, t) + (Math.random() - 0.5) * 40;
                points.push({x, y});
            }
            points.push({x: endX, y: endY});
            
            addAnimation('lightning', {
                points: points,
                opacity: 1,
                color: randomColor(),
                duration: 300
            });
        }

        function startGame() {
            game.state = 'playing';
            game.score = 0;
            game.level = 1;
            game.timeLeft = 60;
            game.maxTime = 60;
            game.combo = 0;
            game.maxCombo = 0;
            game.totalCorrect = 0;
            game.totalWrong = 0;
            game.lastFrameTime = performance.now();
            generatePuzzle();
        }

        function createLevelUpEffect() {
            // Massive celebration
            for (let i = 0; i < 150; i++) {
                setTimeout(() => {
                    const x = Math.random() * GAME_WIDTH;
                    const y = Math.random() * GAME_HEIGHT;
                    
                    for (let j = 0; j < 8; j++) {
                        const angle = (Math.PI * 2 * j) / 8;
                        game.particles.push({
                            x: x,
                            y: y,
                            vx: Math.cos(angle) * 5,
                            vy: Math.sin(angle) * 5,
                            life: 1,
                            color: hslToRgb((i * 2.4 + j * 45) % 360, 100, 50),
                            size: randomInt(6, 14),
                            rotation: 0,
                            rotationSpeed: 0.2,
                            gravity: 0.2
                        });
                    }
                }, i * 10);
            }
            playSound('levelup');
        }

        // ============================================
        // PARTICLE SYSTEM
        // ============================================
        function updateParticles(dt) {
            game.particles.forEach(p => {
                p.x += p.vx * dt * 60;
                p.y += p.vy * dt * 60;
                p.vy += p.gravity;
                p.rotation += p.rotationSpeed;
                p.life -= dt * 1.2;
                p.vx *= 0.98;
                p.vy *= 0.98;
            });
            game.particles = game.particles.filter(p => p.life > 0);
        }

        function updateGlowOrbs(dt) {
            game.glowOrbs.forEach(orb => {
                orb.x += orb.vx;
                orb.y += orb.vy;
                
                if (orb.x < 0 || orb.x > GAME_WIDTH) orb.vx *= -1;
                if (orb.y < 0 || orb.y > GAME_HEIGHT) orb.vy *= -1;
                
                orb.hue = (orb.hue + orb.pulseSpeed) % 360;
            });
        }

        // ============================================
        // AUDIO SYSTEM
        // ============================================
        let audioContext = null;

        function initAudio() {
            if (!audioContext) {
                try {
                    audioContext = new (window.AudioContext || window.webkitAudioContext)();
                } catch(e) {}
            }
        }

        function playSound(type, intensity = 1) {
            try {
                initAudio();
                if (!audioContext) return;
                
                const oscillator = audioContext.createOscillator();
                const gainNode = audioContext.createGain();
                const now = audioContext.currentTime;
                
                oscillator.connect(gainNode);
                gainNode.connect(audioContext.destination);
                
                if (type === 'success') {
                    oscillator.type = 'sine';
                    const baseFreq = 440 + (intensity * 50);
                    oscillator.frequency.setValueAtTime(baseFreq, now);
                    oscillator.frequency.setValueAtTime(baseFreq * 1.25, now + 0.06);
                    oscillator.frequency.setValueAtTime(baseFreq * 1.5, now + 0.12);
                    oscillator.frequency.setValueAtTime(baseFreq * 2, now + 0.18);
                    gainNode.gain.setValueAtTime(0.15, now);
                    gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.4);
                    oscillator.start(now);
                    oscillator.stop(now + 0.4);
                } else if (type === 'error') {
                    oscillator.type = 'sawtooth';
                    oscillator.frequency.setValueAtTime(200, now);
                    oscillator.frequency.setValueAtTime(100, now + 0.15);
                    gainNode.gain.setValueAtTime(0.2, now);
                    gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
                    oscillator.start(now);
                    oscillator.stop(now + 0.3);
                } else if (type === 'click') {
                    oscillator.type = 'sine';
                    oscillator.frequency.setValueAtTime(600, now);
                    gainNode.gain.setValueAtTime(0.1, now);
                    gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.08);
                    oscillator.start(now);
                    oscillator.stop(now + 0.08);
                } else if (type === 'levelup') {
                    oscillator.type = 'square';
                    oscillator.frequency.setValueAtTime(300, now);
                    oscillator.frequency.setValueAtTime(450, now + 0.1);
                    oscillator.frequency.setValueAtTime(600, now + 0.2);
                    oscillator.frequency.setValueAtTime(800, now + 0.3);
                    oscillator.frequency.setValueAtTime(1000, now + 0.4);
                    gainNode.gain.setValueAtTime(0.18, now);
                    gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.6);
                    oscillator.start(now);
                    oscillator.stop(now + 0.6);
                }
            } catch (e) {}
        }

        // ============================================
        // DRAWING FUNCTIONS
        // ============================================
        function drawBackground() {
            // Animated rainbow gradient
            const gradient = ctx.createRadialGradient(
                GAME_WIDTH / 2, GAME_HEIGHT / 2, 0,
                GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH
            );
            gradient.addColorStop(0, `hsl(${game.rainbowHue}, 30%, 10%)`);
            gradient.addColorStop(0.5, `hsl(${(game.rainbowHue + 60) % 360}, 25%, 8%)`);
            gradient.addColorStop(1, '#000000');
            ctx.fillStyle = gradient;
            ctx.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

            // Glowing orbs
            game.glowOrbs.forEach(orb => {
                const orbGradient = ctx.createRadialGradient(
                    orb.x, orb.y, 0,
                    orb.x, orb.y, orb.radius
                );
                orbGradient.addColorStop(0, `hsla(${orb.hue}, 100%, 70%, 0.4)`);
                orbGradient.addColorStop(0.5, `hsla(${orb.hue}, 100%, 50%, 0.2)`);
                orbGradient.addColorStop(1, 'transparent');
                ctx.fillStyle = orbGradient;
                ctx.beginPath();
                ctx.arc(orb.x, orb.y, orb.radius, 0, Math.PI * 2);
                ctx.fill();
            });

            // Rainbow nebula clouds
            game.nebula.forEach(cloud => {
                cloud.y += cloud.speed;
                cloud.x += Math.sin(game.gridPulse + cloud.y * 0.01) * 0.4;
                cloud.pulsePhase += 0.02;
                
                if (cloud.y > GAME_HEIGHT + cloud.size) {
                    cloud.y = -cloud.size;
                    cloud.x = Math.random() * GAME_WIDTH;
                }
                
                const pulsedOpacity = cloud.opacity * (1 + Math.sin(cloud.pulsePhase) * 0.3);
                const nebulaGradient = ctx.createRadialGradient(
                    cloud.x, cloud.y, 0,
                    cloud.x, cloud.y, cloud.size
                );
                nebulaGradient.addColorStop(0, `hsla(${(cloud.hue + game.colorCycle) % 360}, 100%, 60%, ${pulsedOpacity})`);
                nebulaGradient.addColorStop(0.5, `hsla(${(cloud.hue + game.colorCycle + 60) % 360}, 100%, 50%, ${pulsedOpacity * 0.5})`);
                nebulaGradient.addColorStop(1, 'transparent');
                ctx.fillStyle = nebulaGradient;
                ctx.fillRect(cloud.x - cloud.size, cloud.y - cloud.size, cloud.size * 2, cloud.size * 2);
            });

            // Colorful twinkling stars
            game.stars.forEach(star => {
                star.y += star.speed;
                if (star.y > GAME_HEIGHT) {
                    star.y = 0;
                    star.x = Math.random() * GAME_WIDTH;
                }
                
                star.twinkle += 0.08;
                star.colorShift = (star.colorShift + 0.5) % 360;
                const twinkleOpacity = star.opacity * (0.6 + Math.sin(star.twinkle) * 0.4);
                
                const starColor = hslToRgb(star.colorShift, 100, 70);
                ctx.fillStyle = starColor;
                ctx.shadowBlur = star.size * 4;
                ctx.shadowColor = starColor;
                ctx.beginPath();
                ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
                ctx.fill();
                
                // Star sparkle
                if (Math.random() > 0.98) {
                    ctx.shadowBlur = star.size * 8;
                    ctx.fill();
                }
            });
            
            ctx.shadowBlur = 0;

            // Animated rainbow grid
            ctx.strokeStyle = `hsla(${game.rainbowHue}, 100%, 50%, 0.15)`;
            ctx.lineWidth = 2;
            const gridSize = 60;
            
            for (let i = 0; i < GAME_WIDTH; i += gridSize) {
                const offset = Math.sin(game.gridPulse + i * 0.01) * 5;
                ctx.beginPath();
                ctx.moveTo(i, 0);
                ctx.lineTo(i + offset, GAME_HEIGHT);
                ctx.stroke();
            }
            
            for (let i = 0; i < GAME_HEIGHT; i += gridSize) {
                const offset = Math.cos(game.gridPulse + i * 0.01) * 5;
                ctx.beginPath();
                ctx.moveTo(0, i);
                ctx.lineTo(GAME_WIDTH, i + offset);
                ctx.stroke();
            }

            game.gridPulse += 0.03;
            game.rainbowHue = (game.rainbowHue + 0.5) % 360;
            game.colorCycle = (game.colorCycle + 0.3) % 360;
            game.energyPulse += 0.05;
        }

        function drawRainbowText(text, x, y, size, weight = 'bold') {
            ctx.save();
            ctx.font = `${weight} ${size}px Orbitron, Arial`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            
            // Rainbow gradient text
            const gradient = ctx.createLinearGradient(x - 200, y, x + 200, y);
            for (let i = 0; i <= 5; i++) {
                gradient.addColorStop(i / 5, hslToRgb((game.rainbowHue + i * 60) % 360, 100, 60));
            }
            
            // Outer glow layers
            for (let i = 0; i < 3; i++) {
                ctx.shadowBlur = 40 - i * 10;
                ctx.shadowColor = getRainbowColor(i * 30);
                ctx.fillStyle = gradient;
                ctx.fillText(text, x, y);
            }
            
            ctx.shadowBlur = 0;
            ctx.restore();
        }

        function drawGlowText(text, x, y, size, color, glowColor, align = 'center', weight = 'bold') {
            ctx.save();
            ctx.font = `${weight} ${size}px Orbitron, Arial`;
            ctx.textAlign = align;
            ctx.textBaseline = 'middle';
            
            // Triple glow
            ctx.shadowBlur = 35;
            ctx.shadowColor = glowColor;
            ctx.fillStyle = glowColor;
            ctx.fillText(text, x, y);
            
            ctx.shadowBlur = 20;
            ctx.fillStyle = color;
            ctx.fillText(text, x, y);
            
            ctx.shadowBlur = 0;
            ctx.restore();
        }

        function drawPanel(x, y, w, h, alpha = 0.9) {
            ctx.save();
            
            // Panel shadow
            ctx.shadowBlur = 40;
            ctx.shadowColor = 'rgba(0, 0, 0, 0.6)';
            
            // Panel background with rainbow border
            const gradient = ctx.createLinearGradient(x, y, x, y + h);
            gradient.addColorStop(0, `rgba(20, 25, 50, ${alpha})`);
            gradient.addColorStop(1, `rgba(10, 15, 30, ${alpha})`);
            ctx.fillStyle = gradient;
            
            roundRect(ctx, x, y, w, h, 18);
            ctx.fill();
            
            // Animated rainbow border
            const borderGradient = ctx.createLinearGradient(x, y, x + w, y + h);
            borderGradient.addColorStop(0, getRainbowColor(0));
            borderGradient.addColorStop(0.5, getRainbowColor(120));
            borderGradient.addColorStop(1, getRainbowColor(240));
            ctx.strokeStyle = borderGradient;
            ctx.lineWidth = 3;
            ctx.stroke();
            
            // Inner shine
            ctx.strokeStyle = `hsla(${game.rainbowHue}, 100%, 70%, 0.3)`;
            ctx.lineWidth = 1;
            roundRect(ctx, x + 3, y + 3, w - 6, h - 6, 15);
            ctx.stroke();
            
            ctx.shadowBlur = 0;
            ctx.restore();
        }

        function drawButton(id, x, y, w, h, text, baseColor, icon = '') {
            game.buttons[id] = { x, y, w, h };
            
            const isHover = game.hoverButton === id;
            const scale = isHover ? 1.1 : 1;
            const actualW = w * scale;
            const actualH = h * scale;
            const actualX = x - (actualW - w) / 2;
            const actualY = y - (actualH - h) / 2;
            
            ctx.save();
            
            // Button mega glow
            ctx.shadowBlur = isHover ? 60 : 35;
            ctx.shadowColor = baseColor;
            
            // Animated rainbow gradient button
            const gradient = ctx.createLinearGradient(actualX, actualY, actualX + actualW, actualY + actualH);
            gradient.addColorStop(0, baseColor);
            gradient.addColorStop(0.5, getRainbowColor(60));
            gradient.addColorStop(1, getRainbowColor(120));
            ctx.fillStyle = gradient;
            
            roundRect(ctx, actualX, actualY, actualW, actualH, 18);
            ctx.fill();
            
            // Glossy overlay
            const glossGradient = ctx.createLinearGradient(actualX, actualY, actualX, actualY + actualH / 1.5);
            glossGradient.addColorStop(0, 'rgba(255, 255, 255, 0.4)');
            glossGradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
            ctx.fillStyle = glossGradient;
            roundRect(ctx, actualX, actualY, actualW, actualH / 1.5, 18);
            ctx.fill();
            
            // Rainbow border
            const borderGradient = ctx.createLinearGradient(actualX, actualY, actualX + actualW, actualY);
            for (let i = 0; i <= 3; i++) {
                borderGradient.addColorStop(i / 3, getRainbowColor(i * 120));
            }
            ctx.strokeStyle = isHover ? 'rgba(255, 255, 255, 1)' : borderGradient;
            ctx.lineWidth = 4;
            roundRect(ctx, actualX, actualY, actualW, actualH, 18);
            ctx.stroke();
            
            ctx.shadowBlur = 0;
            
            // Button text with glow
            ctx.shadowBlur = 15;
            ctx.shadowColor = 'rgba(0, 0, 0, 0.8)';
            ctx.fillStyle = '#FFFFFF';
            ctx.font = 'bold 30px Orbitron, Arial';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(icon + text, actualX + actualW / 2, actualY + actualH / 2);
            
            ctx.shadowBlur = 0;
            ctx.restore();
        }

        function roundRect(ctx, x, y, w, h, r) {
            ctx.beginPath();
            ctx.moveTo(x + r, y);
            ctx.lineTo(x + w - r, y);
            ctx.quadraticCurveTo(x + w, y, x + w, y + r);
            ctx.lineTo(x + w, y + h - r);
            ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
            ctx.lineTo(x + r, y + h);
            ctx.quadraticCurveTo(x, y + h, x, y + h - r);
            ctx.lineTo(x, y + r);
            ctx.quadraticCurveTo(x, y, x + r, y);
            ctx.closePath();
        }

        function drawMenu() {
            drawBackground();

            // Floating animated title
            const titleY = 110 + Math.sin(game.gridPulse * 1.2) * 10;
            
            // Main title with mega rainbow effect
            ctx.save();
            ctx.translate(GAME_WIDTH / 2, titleY);
            ctx.rotate(Math.sin(game.gridPulse * 0.5) * 0.05);
            drawRainbowText('NEUROGRID', 0, 0, 82);
            ctx.restore();
            
            // Animated subtitle
            const subtitleY = titleY + 75;
            ctx.save();
            ctx.translate(GAME_WIDTH / 2, subtitleY);
            drawRainbowText('PATTERN FUSION', 0, 0, 38);
            ctx.restore();

            // High score panel with rainbow
            drawPanel(GAME_WIDTH / 2 - 220, 230, 440, 85);
            drawGlowText('HIGH SCORE', GAME_WIDTH / 2, 252, 22, COLORS.neonCyan, COLORS.neonCyan);
            drawRainbowText(game.highScore.toString(), GAME_WIDTH / 2, 290, 40);

            // Pulsing start button
            const buttonPulse = Math.sin(game.energyPulse * 2) * 10;
            drawButton('start', GAME_WIDTH / 2 - 160, 350 + buttonPulse, 320, 90, 'START GAME', COLORS.neonGreen, '▶ ');

            // Features panel
            drawPanel(GAME_WIDTH / 2 - 320, 480, 640, 130, 0.7);
            
            ctx.font = 'bold 22px Orbitron, Arial';
            
            const features = [
                { icon: '🎯', text: 'Solve colorful pattern puzzles', x: GAME_WIDTH / 2 - 280, y: 510 },
                { icon: '⚡', text: 'Chain combos for MEGA scores', x: GAME_WIDTH / 2 - 280, y: 550 },
                { icon: '🏆', text: 'Beat the high score challenge!', x: GAME_WIDTH / 2 - 280, y: 590 }
            ];
            
            features.forEach((f, i) => {
                const color = getRainbowColor(i * 120);
                ctx.fillStyle = color;
                ctx.shadowBlur = 20;
                ctx.shadowColor = color;
                ctx.fillText(f.icon, f.x, f.y);
                
                ctx.shadowBlur = 5;
                ctx.fillStyle = '#FFFFFF';
                ctx.fillText(f.text, f.x + 45, f.y);
                ctx.shadowBlur = 0;
            });
        }

        function drawGame() {
            drawBackground();

            // === ANIMATED HUD ===
            // Score panel
            drawPanel(20, 20, 270, 105);
            drawGlowText('SCORE', 40, 44, 20, COLORS.neonCyan, COLORS.neonCyan, 'left');
            drawRainbowText(game.score.toString(), 145, 78, 42);
            
            if (game.combo > 0) {
                const comboColor = getRainbowColor(game.combo * 30);
                ctx.save();
                ctx.translate(250, 70);
                ctx.rotate(Math.sin(game.energyPulse * 5) * 0.1);
                ctx.shadowBlur = 30;
                ctx.shadowColor = comboColor;
                ctx.fillStyle = comboColor;
                ctx.font = 'bold 28px Orbitron, Arial';
                ctx.textAlign = 'right';
                ctx.fillText(`x${game.combo}`, 0, 0);
                ctx.shadowBlur = 0;
                ctx.restore();
            }
            
            // Level panel
            drawPanel(GAME_WIDTH - 290, 20, 270, 105);
            drawGlowText('LEVEL', GAME_WIDTH - 40, 44, 20, COLORS.neonGreen, COLORS.neonGreen, 'right');
            drawRainbowText(game.level.toString(), GAME_WIDTH - 145, 78, 42);
            
            // Rainbow timer bar
            const timerBarW = 240;
            const timerBarX = GAME_WIDTH - 280;
            const timerBarY = 100;
            const timerPercent = game.timeLeft / game.maxTime;
            
            ctx.fillStyle = 'rgba(5, 10, 20, 0.95)';
            roundRect(ctx, timerBarX, timerBarY, timerBarW, 32, 16);
            ctx.fill();
            
            // Rainbow timer fill
            const timerGradient = ctx.createLinearGradient(timerBarX, timerBarY, timerBarX + timerBarW, timerBarY);
            if (timerPercent < 0.25) {
                timerGradient.addColorStop(0, COLORS.neonPink);
                timerGradient.addColorStop(1, '#FF0000');
            } else if (timerPercent < 0.5) {
                timerGradient.addColorStop(0, COLORS.neonOrange);
                timerGradient.addColorStop(1, COLORS.neonYellow);
            } else {
                timerGradient.addColorStop(0, COLORS.neonGreen);
                timerGradient.addColorStop(1, COLORS.neonCyan);
            }
            
            ctx.fillStyle = timerGradient;
            ctx.shadowBlur = 25;
            ctx.shadowColor = timerPercent < 0.25 ? COLORS.neonPink : COLORS.neonCyan;
            roundRect(ctx, timerBarX + 4, timerBarY + 4, (timerBarW - 8) * timerPercent, 24, 12);
            ctx.fill();
            ctx.shadowBlur = 0;
            
            ctx.fillStyle = '#FFFFFF';
            ctx.font = 'bold 22px Orbitron, Arial';
            ctx.textAlign = 'center';
            ctx.shadowBlur = 8;
            ctx.shadowColor = 'rgba(0, 0, 0, 0.9)';
            ctx.fillText(`${Math.ceil(game.timeLeft)}s`, timerBarX + timerBarW / 2, timerBarY + 16);
            ctx.shadowBlur = 0;

            // === PATTERN INSTRUCTION ===
            const instructionY = 160;
            drawPanel(GAME_WIDTH / 2 - 370, instructionY - 28, 740, 66);
            
            let instruction = '';
            let color = COLORS.neonCyan;
            
            switch(game.targetPattern) {
                case PATTERNS.SUM:
                    instruction = `SUM TO ${game.targetValue}`;
                    color = COLORS.neonCyan;
                    break;
                case PATTERNS.PRODUCT:
                    instruction = `MULTIPLY TO ${game.targetValue}`;
                    color = COLORS.neonOrange;
                    break;
                case PATTERNS.EVEN:
                    instruction = `SELECT ${game.targetValue} EVEN NUMBERS`;
                    color = COLORS.neonGreen;
                    break;
                case PATTERNS.ODD:
                    instruction = `SELECT ${game.targetValue} ODD NUMBERS`;
                    color = COLORS.neonPink;
                    break;
                case PATTERNS.GREATER:
                    instruction = `SELECT 3+ NUMBERS > ${game.targetValue}`;
                    color = COLORS.neonYellow;
                    break;
                case PATTERNS.SEQUENCE:
                    instruction = `SELECT ${game.targetValue} CONSECUTIVE NUMBERS`;
                    color = COLORS.neonPurple;
                    break;
            }
            
            drawGlowText(instruction, GAME_WIDTH / 2, instructionY + 5, 30, color, color);

            // === ULTRA HD NUMBERS ===
            game.numbers.forEach(num => {
                ctx.save();
                
                const scale = num.scale || 1;
                const pulseScale = num.selected ? (1 + Math.sin(game.energyPulse * 6) * 0.08) : (1 + Math.sin(game.energyPulse * 2 + num.pulsePhase) * 0.02);
                const finalScale = scale * pulseScale;
                
                ctx.translate(num.x, num.y);
                ctx.scale(finalScale, finalScale);
                ctx.rotate(num.rotation || 0);
                
                const radius = 52;
                
                if (num.selected) {
                    // SELECTED - Rainbow explosion effect
                    for (let i = 0; i < 4; i++) {
                        const ringRadius = radius + 12 + i * 8;
                        const ringColor = getRainbowColor(num.colorOffset + i * 90);
                        ctx.strokeStyle = ringColor;
                        ctx.lineWidth = 4;
                        ctx.shadowBlur = 50;
                        ctx.shadowColor = ringColor;
                        ctx.beginPath();
                        ctx.arc(0, 0, ringRadius, 0, Math.PI * 2);
                        ctx.stroke();
                    }
                    
                    // Main circle - rainbow gradient
                    const selectedGradient = ctx.createRadialGradient(0, 0, 0, 0, 0, radius);
                    selectedGradient.addColorStop(0, getRainbowColor(num.colorOffset));
                    selectedGradient.addColorStop(0.5, getRainbowColor(num.colorOffset + 60));
                    selectedGradient.addColorStop(1, getRainbowColor(num.colorOffset + 120));
                    ctx.fillStyle = selectedGradient;
                    ctx.shadowBlur = 40;
                    ctx.shadowColor = getRainbowColor(num.colorOffset);
                } else {
                    // UNSELECTED - sleek dark with subtle glow
                    ctx.shadowBlur = 20;
                    ctx.shadowColor = `hsla(${200 + num.colorOffset}, 70%, 50%, 0.6)`;
                    
                    const unselectedGradient = ctx.createRadialGradient(-15, -15, 0, 0, 0, radius);
                    unselectedGradient.addColorStop(0, '#2A4A7A');
                    unselectedGradient.addColorStop(0.6, '#1A3A6A');
                    unselectedGradient.addColorStop(1, '#0A2A5A');
                    ctx.fillStyle = unselectedGradient;
                }

                ctx.beginPath();
                ctx.arc(0, 0, radius, 0, Math.PI * 2);
                ctx.fill();
                
                // Rainbow border
                if (num.selected) {
                    const borderGradient = ctx.createLinearGradient(-radius, -radius, radius, radius);
                    for (let i = 0; i <= 4; i++) {
                        borderGradient.addColorStop(i / 4, getRainbowColor(num.colorOffset + i * 90));
                    }
                    ctx.strokeStyle = borderGradient;
                    ctx.lineWidth = 5;
                } else {
                    ctx.strokeStyle = `hsla(${200 + num.colorOffset}, 80%, 60%, 0.9)`;
                    ctx.lineWidth = 3;
                }
                ctx.stroke();
                
                // Glossy highlight
                ctx.shadowBlur = 0;
                const highlightGradient = ctx.createRadialGradient(-18, -18, 0, 0, 0, radius);
                highlightGradient.addColorStop(0, 'rgba(255, 255, 255, 0.5)');
                highlightGradient.addColorStop(0.4, 'rgba(255, 255, 255, 0.15)');
                highlightGradient.addColorStop(1, 'transparent');
                ctx.fillStyle = highlightGradient;
                ctx.fill();

                // Number text
                ctx.fillStyle = num.selected ? '#000000' : '#FFFFFF';
                ctx.font = 'bold 44px Orbitron, Arial';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.shadowBlur = num.selected ? 0 : 10;
                ctx.shadowColor = 'rgba(0, 0, 0, 0.9)';
                ctx.fillText(num.value, 0, 2);
                ctx.shadowBlur = 0;
                
                ctx.restore();
            });

            // === SUBMIT BUTTON ===
            const selectedCount = game.numbers.filter(n => n.selected).length;
            const buttonColor = selectedCount > 0 ? COLORS.neonGreen : '#334455';
            const buttonY = 565 + Math.sin(game.energyPulse * 3) * (selectedCount > 0 ? 5 : 0);
            drawButton('submit', GAME_WIDTH / 2 - 130, buttonY, 260, 70, 'SUBMIT', buttonColor, '✓ ');

            // === PARTICLES ===
            game.particles.forEach(p => {
                ctx.save();
                ctx.globalAlpha = p.life;
                ctx.translate(p.x, p.y);
                ctx.rotate(p.rotation);
                
                ctx.fillStyle = p.color;
                ctx.shadowBlur = 20;
                ctx.shadowColor = p.color;
                
                const half = p.size / 2;
                ctx.fillRect(-half, -half, p.size, p.size);
                
                // Particle trail
                if (p.trail) {
                    ctx.globalAlpha = p.life * 0.3;
                    ctx.fillRect(-half * 1.5, -half * 1.5, p.size * 1.5, p.size * 1.5);
                }
                
                ctx.restore();
            });

            // === ANIMATIONS ===
            game.animations.forEach(anim => {
                if (anim.type === 'scorePopup') {
                    ctx.save();
                    ctx.globalAlpha = anim.data.opacity;
                    ctx.translate(anim.data.x, anim.data.y);
                    ctx.scale(anim.data.scale, anim.data.scale);
                    ctx.rotate(anim.data.rotation);
                    drawRainbowText(anim.data.text, 0, 0, 48);
                    ctx.restore();
                }
                
                if (anim.type === 'comboFlash') {
                    ctx.save();
                    ctx.globalAlpha = anim.data.opacity;
                    ctx.translate(anim.data.x, anim.data.y);
                    ctx.scale(anim.data.scale, anim.data.scale);
                    ctx.rotate(anim.data.rotation);
                    drawRainbowText(`COMBO x${game.combo}!`, 0, 0, 32);
                    ctx.restore();
                }
                
                if (anim.type === 'shockwave') {
                    ctx.save();
                    ctx.globalAlpha = anim.data.opacity * 0.7;
                    ctx.strokeStyle = anim.data.color;
                    ctx.lineWidth = 5;
                    ctx.shadowBlur = 30;
                    ctx.shadowColor = anim.data.color;
                    ctx.beginPath();
                    ctx.arc(anim.data.x, anim.data.y, anim.data.radius, 0, Math.PI * 2);
                    ctx.stroke();
                    ctx.restore();
                }
                
                if (anim.type === 'confetti') {
                    ctx.save();
                    ctx.globalAlpha = anim.data.opacity;
                    ctx.translate(anim.data.x, anim.data.y);
                    ctx.rotate(anim.data.rotation);
                    ctx.fillStyle = anim.data.color;
                    ctx.shadowBlur = 15;
                    ctx.shadowColor = anim.data.color;
                    const half = anim.data.size / 2;
                    ctx.fillRect(-half, -half, anim.data.size, anim.data.size);
                    ctx.restore();
                }
                
                if (anim.type === 'lightning') {
                    ctx.save();
                    ctx.globalAlpha = anim.data.opacity;
                    ctx.strokeStyle = anim.data.color;
                    ctx.lineWidth = 4;
                    ctx.shadowBlur = 25;
                    ctx.shadowColor = anim.data.color;
                    ctx.beginPath();
                    ctx.moveTo(anim.data.points[0].x, anim.data.points[0].y);
                    for (let i = 1; i < anim.data.points.length; i++) {
                        ctx.lineTo(anim.data.points[i].x, anim.data.points[i].y);
                    }
                    ctx.stroke();
                    ctx.restore();
                }
            });

            ctx.shadowBlur = 0;
        }

        function drawGameOver() {
            drawBackground();

            // Result mega panel
            drawPanel(GAME_WIDTH / 2 - 320, 70, 640, 500);
            
            // Animated title
            ctx.save();
            ctx.translate(GAME_WIDTH / 2, 140);
            ctx.rotate(Math.sin(game.energyPulse * 2) * 0.05);
            drawRainbowText('GAME OVER', 0, 0, 62);
            ctx.restore();
            
            // Stats panel
            drawPanel(GAME_WIDTH / 2 - 280, 210, 560, 260, 0.6);
            
            // Final score
            drawGlowText('FINAL SCORE', GAME_WIDTH / 2, 242, 24, COLORS.neonCyan, COLORS.neonCyan);
            drawRainbowText(game.score.toString(), GAME_WIDTH / 2, 292, 56);
            
            // Stats with rainbow colors
            ctx.font = '28px Orbitron, Arial';
            ctx.textAlign = 'center';
            
            const statColor1 = getRainbowColor(0);
            ctx.fillStyle = statColor1;
            ctx.shadowBlur = 20;
            ctx.shadowColor = statColor1;
            ctx.fillText(`High Score: ${game.highScore}`, GAME_WIDTH / 2, 355);
            
            const statColor2 = getRainbowColor(120);
            ctx.fillStyle = statColor2;
            ctx.shadowColor = statColor2;
            ctx.fillText(`Max Combo: x${game.maxCombo}`, GAME_WIDTH / 2, 395);
            
            const statColor3 = getRainbowColor(240);
            ctx.fillStyle = statColor3;
            ctx.shadowColor = statColor3;
            ctx.font = '24px Orbitron, Arial';
            ctx.fillText(`Correct: ${game.totalCorrect} | Wrong: ${game.totalWrong}`, GAME_WIDTH / 2, 433);
            
            ctx.shadowBlur = 0;

            // Mega play again button
            const buttonPulse = Math.sin(game.energyPulse * 3) * 8;
            drawButton('playagain', GAME_WIDTH / 2 - 160, 495 + buttonPulse, 320, 85, 'PLAY AGAIN', COLORS.neonGreen, '↻ ');
        }

        // ============================================
        // INPUT HANDLING
        // ============================================
        function getMousePos(e) {
            const rect = canvas.getBoundingClientRect();
            const scaleX = GAME_WIDTH / rect.width;
            const scaleY = GAME_HEIGHT / rect.height;
            
            let clientX, clientY;
            if (e.touches && e.touches.length > 0) {
                clientX = e.touches[0].clientX;
                clientY = e.touches[0].clientY;
            } else {
                clientX = e.clientX;
                clientY = e.clientY;
            }
            
            return {
                x: (clientX - rect.left) * scaleX,
                y: (clientY - rect.top) * scaleY
            };
        }

        function isInsideButton(pos, buttonId) {
            const btn = game.buttons[buttonId];
            if (!btn) return false;
            return pos.x >= btn.x && pos.x <= btn.x + btn.w &&
                   pos.y >= btn.y && pos.y <= btn.y + btn.h;
        }

        function handleClick(e) {
            e.preventDefault();
            const pos = getMousePos(e);

            if (game.state === 'menu') {
                if (isInsideButton(pos, 'start')) {
                    playSound('click');
                    startGame();
                }
            } else if (game.state === 'playing') {
                let clickedNumber = false;
                
                game.numbers.forEach(num => {
                    const dist = Math.sqrt((pos.x - num.x) ** 2 + (pos.y - num.y) ** 2);
                    if (dist < 52 && num.scale >= 0.9) {
                        num.selected = !num.selected;
                        playSound('click');
                        clickedNumber = true;
                        
                        // Bounce animation
                        num.scale = 1.2;
                        setTimeout(() => { if (num.scale > 1) num.scale = 1; }, 180);
                        
                        // Click particle burst
                        for (let i = 0; i < 12; i++) {
                            const angle = (Math.PI * 2 * i) / 12;
                            game.particles.push({
                                x: num.x,
                                y: num.y,
                                vx: Math.cos(angle) * 4,
                                vy: Math.sin(angle) * 4,
                                life: 0.6,
                                color: num.selected ? getRainbowColor(i * 30) : COLORS.neonCyan,
                                size: randomInt(3, 7),
                                rotation: 0,
                                rotationSpeed: 0.2,
                                gravity: 0.2
                            });
                        }
                    }
                });

                if (!clickedNumber && isInsideButton(pos, 'submit')) {
                    submitAnswer();
                }
            } else if (game.state === 'gameover') {
                if (isInsideButton(pos, 'playagain')) {
                    playSound('click');
                    game.state = 'menu';
                }
            }
        }

        function handleMouseMove(e) {
            const pos = getMousePos(e);
            let foundHover = false;
            
            Object.keys(game.buttons).forEach(btnId => {
                if (isInsideButton(pos, btnId)) {
                    if (game.hoverButton !== btnId) {
                        playSound('click');
                    }
                    game.hoverButton = btnId;
                    foundHover = true;
                }
            });
            
            if (!foundHover) {
                game.hoverButton = null;
            }
            
            canvas.style.cursor = foundHover ? 'pointer' : 'default';
        }

        canvas.addEventListener('click', handleClick);
        canvas.addEventListener('touchstart', handleClick);
        canvas.addEventListener('mousemove', handleMouseMove);
        canvas.addEventListener('contextmenu', e => e.preventDefault());

        // ============================================
        // GAME LOOP
        // ============================================
        function update(currentTime) {
            const dt = Math.min((currentTime - game.lastFrameTime) / 1000, 0.1);
            game.lastFrameTime = currentTime;

            if (game.state === 'playing') {
                game.timeLeft -= dt;
                
                if (game.timeLeft <= 0) {
                    game.timeLeft = 0;
                    game.state = 'gameover';
                    
                    if (game.score > game.highScore) {
                        game.highScore = game.score;
                        localStorage.setItem('neuroGridUltraHD_HighScore', game.highScore);
                        
                        // NEW HIGH SCORE CELEBRATION!
                        for (let i = 0; i < 200; i++) {
                            setTimeout(() => {
                                const x = Math.random() * GAME_WIDTH;
                                const y = Math.random() * GAME_HEIGHT;
                                
                                for (let j = 0; j < 10; j++) {
                                    const angle = (Math.PI * 2 * j) / 10;
                                    game.particles.push({
                                        x: x,
                                        y: y,
                                        vx: Math.cos(angle) * 6,
                                        vy: Math.sin(angle) * 6,
                                        life: 1,
                                        color: hslToRgb((i * 1.8 + j * 36) % 360, 100, 50),
                                        size: randomInt(6, 15),
                                        rotation: 0,
                                        rotationSpeed: 0.3,
                                        gravity: 0.2,
                                        trail: true
                                    });
                                }
                            }, i * 15);
                        }
                    }
                }

                updateParticles(dt);
                updateGlowOrbs(dt);
                
                // Smooth number scale animations
                game.numbers.forEach(num => {
                    if (num.scale > 1) {
                        num.scale = Math.max(1, num.scale - dt * 4);
                    } else if (num.scale < 1 && num.scale > 0) {
                        num.scale = Math.min(1, num.scale + dt * 3);
                    }
                    
                    // Smooth rotation reset
                    if (num.rotation !== 0) {
                        num.rotation *= 0.9;
                        if (Math.abs(num.rotation) < 0.01) num.rotation = 0;
                    }
                });
            }

            updateAnimations(currentTime);
        }

        function render() {
            if (game.state === 'menu') {
                drawMenu();
            } else if (game.state === 'playing') {
                drawGame();
            } else if (game.state === 'gameover') {
                drawGameOver();
            }
        }

        function gameLoop(currentTime) {
            update(currentTime);
            render();
            requestAnimationFrame(gameLoop);
        }

        // ============================================
        // INITIALIZE AND START
        // ============================================
        initBackground();
        game.lastFrameTime = performance.now();
        gameLoop(game.lastFrameTime);

        // Responsive scaling
        function handleResize() {
            const container = document.getElementById('gameContainer');
            const scaleX = window.innerWidth / GAME_WIDTH;
            const scaleY = window.innerHeight / GAME_HEIGHT;
            const scale = Math.min(scaleX, scaleY, 1) * 0.95;
            
            canvas.style.transform = `scale(${scale})`;
            canvas.style.transformOrigin = 'center center';
        }

        window.addEventListener('resize', handleResize);
        window.addEventListener('orientationchange', handleResize);
        handleResize();

        // Prevent pinch zoom on mobile
        document.addEventListener('touchmove', function(e) {
            if (e.scale !== 1) {
                e.preventDefault();
            }
        }, { passive: false });

        // Wake lock for mobile (keep screen on during gameplay)
        let wakeLock = null;
        async function requestWakeLock() {
            try {
                if ('wakeLock' in navigator) {
                    wakeLock = await navigator.wakeLock.request('screen');
                }
            } catch (err) {}
        }

        document.addEventListener('visibilitychange', async () => {
            if (document.visibilityState === 'visible' && game.state === 'playing') {
                await requestWakeLock();
            }
        });

        // Start wake lock when game starts
        const originalStartGame = startGame;
        startGame = function() {
            originalStartGame();
            requestWakeLock();
        };
