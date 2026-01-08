let audioContext: AudioContext | null = null;

function getAudioContext(): AudioContext {
    if (!audioContext) {
        audioContext = new AudioContext();
    }
    return audioContext;
}

function resumeContext(ctx: AudioContext) {
    if (ctx.state === 'suspended') {
        ctx.resume();
    }
}

export function playTickSound() {
    try {
        const ctx = getAudioContext();
        resumeContext(ctx);

        const oscillator = ctx.createOscillator();
        const gainNode = ctx.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(ctx.destination);

        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(400, ctx.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(150, ctx.currentTime + 0.015);

        gainNode.gain.setValueAtTime(0.08, ctx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.02);

        oscillator.start(ctx.currentTime);
        oscillator.stop(ctx.currentTime + 0.02);
    } catch (e) {
    }
}

export function playSelectSound() {
    try {
        const ctx = getAudioContext();
        resumeContext(ctx);
        const t = ctx.currentTime;

        const osc1 = ctx.createOscillator();
        const gain1 = ctx.createGain();
        osc1.connect(gain1);
        gain1.connect(ctx.destination);

        osc1.type = 'square';
        osc1.frequency.setValueAtTime(2400, t);
        osc1.frequency.exponentialRampToValueAtTime(300, t + 0.06);
        osc1.frequency.setValueAtTime(1200, t + 0.065);
        osc1.frequency.exponentialRampToValueAtTime(150, t + 0.1);

        gain1.gain.setValueAtTime(0.1, t);
        gain1.gain.exponentialRampToValueAtTime(0.05, t + 0.03);
        gain1.gain.setValueAtTime(0.08, t + 0.065);
        gain1.gain.exponentialRampToValueAtTime(0.001, t + 0.12);

        osc1.start(t);
        osc1.stop(t + 0.12);

        const osc2 = ctx.createOscillator();
        const gain2 = ctx.createGain();
        osc2.connect(gain2);
        gain2.connect(ctx.destination);

        osc2.type = 'sawtooth';
        osc2.frequency.setValueAtTime(4800, t);
        osc2.frequency.exponentialRampToValueAtTime(800, t + 0.025);

        gain2.gain.setValueAtTime(0.04, t);
        gain2.gain.exponentialRampToValueAtTime(0.001, t + 0.03);

        osc2.start(t);
        osc2.stop(t + 0.03);

        const osc3 = ctx.createOscillator();
        const gain3 = ctx.createGain();
        osc3.connect(gain3);
        gain3.connect(ctx.destination);

        osc3.type = 'sine';
        osc3.frequency.setValueAtTime(120, t);
        osc3.frequency.exponentialRampToValueAtTime(40, t + 0.08);

        gain3.gain.setValueAtTime(0.15, t);
        gain3.gain.exponentialRampToValueAtTime(0.001, t + 0.1);

        osc3.start(t);
        osc3.stop(t + 0.1);

        const osc4 = ctx.createOscillator();
        const gain4 = ctx.createGain();
        osc4.connect(gain4);
        gain4.connect(ctx.destination);

        osc4.type = 'square';
        osc4.frequency.setValueAtTime(600, t + 0.05);
        osc4.frequency.exponentialRampToValueAtTime(2000, t + 0.09);
        osc4.frequency.exponentialRampToValueAtTime(400, t + 0.14);

        gain4.gain.setValueAtTime(0, t);
        gain4.gain.linearRampToValueAtTime(0.06, t + 0.05);
        gain4.gain.exponentialRampToValueAtTime(0.001, t + 0.15);

        osc4.start(t + 0.05);
        osc4.stop(t + 0.15);
    } catch (e) {
    }
}

export function playDeniedSound() {
    try {
        const ctx = getAudioContext();
        resumeContext(ctx);
        const t = ctx.currentTime;

        const osc1 = ctx.createOscillator();
        const gain1 = ctx.createGain();
        osc1.connect(gain1);
        gain1.connect(ctx.destination);

        osc1.type = 'triangle';
        osc1.frequency.setValueAtTime(220, t);
        osc1.frequency.exponentialRampToValueAtTime(150, t + 0.1);

        gain1.gain.setValueAtTime(0.12, t);
        gain1.gain.exponentialRampToValueAtTime(0.001, t + 0.12);

        osc1.start(t);
        osc1.stop(t + 0.12);

        const osc2 = ctx.createOscillator();
        const gain2 = ctx.createGain();
        osc2.connect(gain2);
        gain2.connect(ctx.destination);

        osc2.type = 'triangle';
        osc2.frequency.setValueAtTime(165, t + 0.1);
        osc2.frequency.exponentialRampToValueAtTime(110, t + 0.22);

        gain2.gain.setValueAtTime(0, t);
        gain2.gain.linearRampToValueAtTime(0.1, t + 0.1);
        gain2.gain.exponentialRampToValueAtTime(0.001, t + 0.25);

        osc2.start(t + 0.1);
        osc2.stop(t + 0.25);
    } catch (e) {
    }
}

export function playErrorSound() {
    try {
        const ctx = getAudioContext();
        resumeContext(ctx);
        const t = ctx.currentTime;

        const osc1 = ctx.createOscillator();
        const gain1 = ctx.createGain();
        osc1.connect(gain1);
        gain1.connect(ctx.destination);

        osc1.type = 'sawtooth';
        osc1.frequency.setValueAtTime(150, t);
        osc1.frequency.linearRampToValueAtTime(80, t + 0.15);

        gain1.gain.setValueAtTime(0.12, t);
        gain1.gain.linearRampToValueAtTime(0.08, t + 0.1);
        gain1.gain.exponentialRampToValueAtTime(0.001, t + 0.2);

        osc1.start(t);
        osc1.stop(t + 0.2);

        const osc2 = ctx.createOscillator();
        const gain2 = ctx.createGain();
        osc2.connect(gain2);
        gain2.connect(ctx.destination);

        osc2.type = 'square';
        osc2.frequency.setValueAtTime(380, t);
        osc2.frequency.linearRampToValueAtTime(200, t + 0.12);

        gain2.gain.setValueAtTime(0.08, t);
        gain2.gain.exponentialRampToValueAtTime(0.001, t + 0.15);

        osc2.start(t);
        osc2.stop(t + 0.15);

        const osc3 = ctx.createOscillator();
        const gain3 = ctx.createGain();
        osc3.connect(gain3);
        gain3.connect(ctx.destination);

        osc3.type = 'sawtooth';
        osc3.frequency.setValueAtTime(2000, t);
        osc3.frequency.exponentialRampToValueAtTime(100, t + 0.05);
        osc3.frequency.setValueAtTime(1500, t + 0.06);
        osc3.frequency.exponentialRampToValueAtTime(80, t + 0.1);

        gain3.gain.setValueAtTime(0.06, t);
        gain3.gain.exponentialRampToValueAtTime(0.02, t + 0.05);
        gain3.gain.setValueAtTime(0.05, t + 0.06);
        gain3.gain.exponentialRampToValueAtTime(0.001, t + 0.12);

        osc3.start(t);
        osc3.stop(t + 0.12);

        const osc4 = ctx.createOscillator();
        const gain4 = ctx.createGain();
        osc4.connect(gain4);
        gain4.connect(ctx.destination);

        osc4.type = 'sawtooth';
        osc4.frequency.setValueAtTime(140, t + 0.12);
        osc4.frequency.linearRampToValueAtTime(70, t + 0.25);

        gain4.gain.setValueAtTime(0, t);
        gain4.gain.linearRampToValueAtTime(0.1, t + 0.12);
        gain4.gain.linearRampToValueAtTime(0.06, t + 0.2);
        gain4.gain.exponentialRampToValueAtTime(0.001, t + 0.28);

        osc4.start(t + 0.12);
        osc4.stop(t + 0.28);
    } catch (e) {
    }
}

