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

export function playHitSound() {
    try {
        const ctx = getAudioContext();
        resumeContext(ctx);
        const t = ctx.currentTime;

        // Initial impact punch - low frequency hit
        const osc1 = ctx.createOscillator();
        const gain1 = ctx.createGain();
        osc1.connect(gain1);
        gain1.connect(ctx.destination);

        osc1.type = 'sine';
        osc1.frequency.setValueAtTime(150, t);
        osc1.frequency.exponentialRampToValueAtTime(35, t + 0.18);

        gain1.gain.setValueAtTime(0.25, t);
        gain1.gain.linearRampToValueAtTime(0.15, t + 0.1);
        gain1.gain.exponentialRampToValueAtTime(0.001, t + 0.28);

        osc1.start(t);
        osc1.stop(t + 0.28);

        // Distorted crunch layer - the "explosion" character
        const osc2 = ctx.createOscillator();
        const gain2 = ctx.createGain();
        osc2.connect(gain2);
        gain2.connect(ctx.destination);

        osc2.type = 'sawtooth';
        osc2.frequency.setValueAtTime(300, t);
        osc2.frequency.exponentialRampToValueAtTime(60, t + 0.25);

        gain2.gain.setValueAtTime(0.12, t);
        gain2.gain.linearRampToValueAtTime(0.08, t + 0.08);
        gain2.gain.exponentialRampToValueAtTime(0.001, t + 0.32);

        osc2.start(t);
        osc2.stop(t + 0.32);

        // High transient click - digital sharpness
        const osc3 = ctx.createOscillator();
        const gain3 = ctx.createGain();
        osc3.connect(gain3);
        gain3.connect(ctx.destination);

        osc3.type = 'square';
        osc3.frequency.setValueAtTime(2200, t);
        osc3.frequency.exponentialRampToValueAtTime(600, t + 0.06);

        gain3.gain.setValueAtTime(0.08, t);
        gain3.gain.exponentialRampToValueAtTime(0.001, t + 0.08);

        osc3.start(t);
        osc3.stop(t + 0.08);

        // Success confirmation tone - rising pitch for satisfaction
        const osc4 = ctx.createOscillator();
        const gain4 = ctx.createGain();
        osc4.connect(gain4);
        gain4.connect(ctx.destination);

        osc4.type = 'square';
        osc4.frequency.setValueAtTime(400, t + 0.08);
        osc4.frequency.exponentialRampToValueAtTime(800, t + 0.22);
        osc4.frequency.setValueAtTime(600, t + 0.24);
        osc4.frequency.exponentialRampToValueAtTime(700, t + 0.38);

        gain4.gain.setValueAtTime(0, t);
        gain4.gain.linearRampToValueAtTime(0.07, t + 0.08);
        gain4.gain.linearRampToValueAtTime(0.05, t + 0.22);
        gain4.gain.linearRampToValueAtTime(0.04, t + 0.32);
        gain4.gain.exponentialRampToValueAtTime(0.001, t + 0.42);

        osc4.start(t + 0.08);
        osc4.stop(t + 0.42);

        // Secondary rumble - explosion tail
        const osc5 = ctx.createOscillator();
        const gain5 = ctx.createGain();
        osc5.connect(gain5);
        gain5.connect(ctx.destination);

        osc5.type = 'sawtooth';
        osc5.frequency.setValueAtTime(100, t + 0.05);
        osc5.frequency.exponentialRampToValueAtTime(25, t + 0.45);

        gain5.gain.setValueAtTime(0, t);
        gain5.gain.linearRampToValueAtTime(0.1, t + 0.05);
        gain5.gain.linearRampToValueAtTime(0.06, t + 0.25);
        gain5.gain.exponentialRampToValueAtTime(0.001, t + 0.5);

        osc5.start(t + 0.05);
        osc5.stop(t + 0.5);
    } catch (e) {
    }
}

export function playSinkSound() {
    try {
        const ctx = getAudioContext();
        resumeContext(ctx);
        const t = ctx.currentTime;

        // Impact hit - ship taking the final blow
        const osc1 = ctx.createOscillator();
        const gain1 = ctx.createGain();
        osc1.connect(gain1);
        gain1.connect(ctx.destination);

        osc1.type = 'sine';
        osc1.frequency.setValueAtTime(120, t);
        osc1.frequency.exponentialRampToValueAtTime(35, t + 0.15);

        gain1.gain.setValueAtTime(0.22, t);
        gain1.gain.exponentialRampToValueAtTime(0.001, t + 0.2);

        osc1.start(t);
        osc1.stop(t + 0.2);

        // Crunch layer
        const osc2 = ctx.createOscillator();
        const gain2 = ctx.createGain();
        osc2.connect(gain2);
        gain2.connect(ctx.destination);

        osc2.type = 'sawtooth';
        osc2.frequency.setValueAtTime(250, t);
        osc2.frequency.exponentialRampToValueAtTime(50, t + 0.18);

        gain2.gain.setValueAtTime(0.1, t);
        gain2.gain.exponentialRampToValueAtTime(0.001, t + 0.22);

        osc2.start(t);
        osc2.stop(t + 0.22);

        // Descending "sinking" tone - ship going down
        const osc3 = ctx.createOscillator();
        const gain3 = ctx.createGain();
        osc3.connect(gain3);
        gain3.connect(ctx.destination);

        osc3.type = 'triangle';
        osc3.frequency.setValueAtTime(600, t + 0.08);
        osc3.frequency.exponentialRampToValueAtTime(150, t + 0.4);
        osc3.frequency.exponentialRampToValueAtTime(80, t + 0.55);

        gain3.gain.setValueAtTime(0, t);
        gain3.gain.linearRampToValueAtTime(0.1, t + 0.08);
        gain3.gain.linearRampToValueAtTime(0.07, t + 0.3);
        gain3.gain.exponentialRampToValueAtTime(0.001, t + 0.6);

        osc3.start(t + 0.08);
        osc3.stop(t + 0.6);

        // Mini victory arpeggio - quick triumphant notes
        const osc4 = ctx.createOscillator();
        const gain4 = ctx.createGain();
        osc4.connect(gain4);
        gain4.connect(ctx.destination);

        osc4.type = 'square';
        osc4.frequency.setValueAtTime(440, t + 0.1);  // A4
        osc4.frequency.setValueAtTime(554, t + 0.18); // C#5
        osc4.frequency.setValueAtTime(659, t + 0.26); // E5

        gain4.gain.setValueAtTime(0, t);
        gain4.gain.linearRampToValueAtTime(0.07, t + 0.1);
        gain4.gain.setValueAtTime(0.06, t + 0.18);
        gain4.gain.setValueAtTime(0.07, t + 0.26);
        gain4.gain.linearRampToValueAtTime(0.05, t + 0.38);
        gain4.gain.exponentialRampToValueAtTime(0.001, t + 0.5);

        osc4.start(t + 0.1);
        osc4.stop(t + 0.5);

        // Harmony layer - thirds
        const osc5 = ctx.createOscillator();
        const gain5 = ctx.createGain();
        osc5.connect(gain5);
        gain5.connect(ctx.destination);

        osc5.type = 'square';
        osc5.frequency.setValueAtTime(554, t + 0.1);  // C#5
        osc5.frequency.setValueAtTime(659, t + 0.18); // E5
        osc5.frequency.setValueAtTime(880, t + 0.26); // A5

        gain5.gain.setValueAtTime(0, t);
        gain5.gain.linearRampToValueAtTime(0.04, t + 0.1);
        gain5.gain.setValueAtTime(0.035, t + 0.18);
        gain5.gain.setValueAtTime(0.045, t + 0.26);
        gain5.gain.linearRampToValueAtTime(0.03, t + 0.38);
        gain5.gain.exponentialRampToValueAtTime(0.001, t + 0.5);

        osc5.start(t + 0.1);
        osc5.stop(t + 0.5);

        // Bubbles/debris effect - detuned high warble
        const osc6 = ctx.createOscillator();
        const osc6b = ctx.createOscillator();
        const gain6 = ctx.createGain();
        osc6.connect(gain6);
        osc6b.connect(gain6);
        gain6.connect(ctx.destination);

        osc6.type = 'sine';
        osc6b.type = 'sine';
        osc6.frequency.setValueAtTime(1800, t + 0.15);
        osc6b.frequency.setValueAtTime(1812, t + 0.15);
        osc6.frequency.exponentialRampToValueAtTime(800, t + 0.5);
        osc6b.frequency.exponentialRampToValueAtTime(808, t + 0.5);

        gain6.gain.setValueAtTime(0, t);
        gain6.gain.linearRampToValueAtTime(0.025, t + 0.15);
        gain6.gain.exponentialRampToValueAtTime(0.001, t + 0.55);

        osc6.start(t + 0.15);
        osc6b.start(t + 0.15);
        osc6.stop(t + 0.55);
        osc6b.stop(t + 0.55);
    } catch (e) {
    }
}

export function playWinningHitSound() {
    try {
        const ctx = getAudioContext();
        resumeContext(ctx);
        const t = ctx.currentTime;

        // Massive initial impact - deep boom
        const osc1 = ctx.createOscillator();
        const gain1 = ctx.createGain();
        osc1.connect(gain1);
        gain1.connect(ctx.destination);

        osc1.type = 'sine';
        osc1.frequency.setValueAtTime(80, t);
        osc1.frequency.exponentialRampToValueAtTime(25, t + 0.4);

        gain1.gain.setValueAtTime(0.3, t);
        gain1.gain.linearRampToValueAtTime(0.2, t + 0.15);
        gain1.gain.exponentialRampToValueAtTime(0.001, t + 0.5);

        osc1.start(t);
        osc1.stop(t + 0.5);

        // Explosion crunch - heavy distortion layer
        const osc2 = ctx.createOscillator();
        const gain2 = ctx.createGain();
        osc2.connect(gain2);
        gain2.connect(ctx.destination);

        osc2.type = 'sawtooth';
        osc2.frequency.setValueAtTime(200, t);
        osc2.frequency.exponentialRampToValueAtTime(40, t + 0.35);

        gain2.gain.setValueAtTime(0.15, t);
        gain2.gain.linearRampToValueAtTime(0.1, t + 0.12);
        gain2.gain.exponentialRampToValueAtTime(0.001, t + 0.4);

        osc2.start(t);
        osc2.stop(t + 0.4);

        // Sharp attack transient
        const osc3 = ctx.createOscillator();
        const gain3 = ctx.createGain();
        osc3.connect(gain3);
        gain3.connect(ctx.destination);

        osc3.type = 'square';
        osc3.frequency.setValueAtTime(3000, t);
        osc3.frequency.exponentialRampToValueAtTime(400, t + 0.08);

        gain3.gain.setValueAtTime(0.1, t);
        gain3.gain.exponentialRampToValueAtTime(0.001, t + 0.1);

        osc3.start(t);
        osc3.stop(t + 0.1);

        // Victory fanfare - first rising tone
        const osc4 = ctx.createOscillator();
        const gain4 = ctx.createGain();
        osc4.connect(gain4);
        gain4.connect(ctx.destination);

        osc4.type = 'square';
        osc4.frequency.setValueAtTime(330, t + 0.12); // E4
        osc4.frequency.setValueAtTime(440, t + 0.25); // A4
        osc4.frequency.setValueAtTime(550, t + 0.38); // C#5
        osc4.frequency.setValueAtTime(660, t + 0.5);  // E5

        gain4.gain.setValueAtTime(0, t);
        gain4.gain.linearRampToValueAtTime(0.08, t + 0.12);
        gain4.gain.linearRampToValueAtTime(0.07, t + 0.35);
        gain4.gain.linearRampToValueAtTime(0.09, t + 0.5);
        gain4.gain.linearRampToValueAtTime(0.06, t + 0.7);
        gain4.gain.exponentialRampToValueAtTime(0.001, t + 0.9);

        osc4.start(t + 0.12);
        osc4.stop(t + 0.9);

        // Victory fanfare - harmony layer (fifth above)
        const osc5 = ctx.createOscillator();
        const gain5 = ctx.createGain();
        osc5.connect(gain5);
        gain5.connect(ctx.destination);

        osc5.type = 'square';
        osc5.frequency.setValueAtTime(495, t + 0.12); // B4
        osc5.frequency.setValueAtTime(660, t + 0.25); // E5
        osc5.frequency.setValueAtTime(825, t + 0.38); // G#5
        osc5.frequency.setValueAtTime(990, t + 0.5);  // B5

        gain5.gain.setValueAtTime(0, t);
        gain5.gain.linearRampToValueAtTime(0.05, t + 0.12);
        gain5.gain.linearRampToValueAtTime(0.045, t + 0.35);
        gain5.gain.linearRampToValueAtTime(0.06, t + 0.5);
        gain5.gain.linearRampToValueAtTime(0.04, t + 0.7);
        gain5.gain.exponentialRampToValueAtTime(0.001, t + 0.9);

        osc5.start(t + 0.12);
        osc5.stop(t + 0.9);

        // Shimmer/sparkle effect - high frequency warble
        const osc6 = ctx.createOscillator();
        const osc6b = ctx.createOscillator();
        const gain6 = ctx.createGain();
        osc6.connect(gain6);
        osc6b.connect(gain6);
        gain6.connect(ctx.destination);

        osc6.type = 'sine';
        osc6b.type = 'sine';
        osc6.frequency.setValueAtTime(2400, t + 0.15);
        osc6b.frequency.setValueAtTime(2407, t + 0.15);
        osc6.frequency.exponentialRampToValueAtTime(3200, t + 0.5);
        osc6b.frequency.exponentialRampToValueAtTime(3210, t + 0.5);
        osc6.frequency.exponentialRampToValueAtTime(2000, t + 0.85);
        osc6b.frequency.exponentialRampToValueAtTime(2008, t + 0.85);

        gain6.gain.setValueAtTime(0, t);
        gain6.gain.linearRampToValueAtTime(0.025, t + 0.15);
        gain6.gain.linearRampToValueAtTime(0.035, t + 0.5);
        gain6.gain.exponentialRampToValueAtTime(0.001, t + 0.95);

        osc6.start(t + 0.15);
        osc6b.start(t + 0.15);
        osc6.stop(t + 0.95);
        osc6b.stop(t + 0.95);

        // Bass rumble sustain - gives weight to the whole thing
        const osc7 = ctx.createOscillator();
        const gain7 = ctx.createGain();
        osc7.connect(gain7);
        gain7.connect(ctx.destination);

        osc7.type = 'sawtooth';
        osc7.frequency.setValueAtTime(55, t + 0.1);
        osc7.frequency.exponentialRampToValueAtTime(40, t + 0.8);

        gain7.gain.setValueAtTime(0, t);
        gain7.gain.linearRampToValueAtTime(0.12, t + 0.1);
        gain7.gain.linearRampToValueAtTime(0.08, t + 0.4);
        gain7.gain.exponentialRampToValueAtTime(0.001, t + 0.95);

        osc7.start(t + 0.1);
        osc7.stop(t + 0.95);

        // Final triumphant stab
        const osc8 = ctx.createOscillator();
        const gain8 = ctx.createGain();
        osc8.connect(gain8);
        gain8.connect(ctx.destination);

        osc8.type = 'square';
        osc8.frequency.setValueAtTime(880, t + 0.55); // A5
        osc8.frequency.setValueAtTime(880, t + 0.7);

        gain8.gain.setValueAtTime(0, t);
        gain8.gain.linearRampToValueAtTime(0.1, t + 0.55);
        gain8.gain.linearRampToValueAtTime(0.08, t + 0.65);
        gain8.gain.exponentialRampToValueAtTime(0.001, t + 1.0);

        osc8.start(t + 0.55);
        osc8.stop(t + 1.0);
    } catch (e) {
    }
}

export function playMissSound() {
    try {
        const ctx = getAudioContext();
        resumeContext(ctx);
        const t = ctx.currentTime;

        // Main swoosh - descending sweep like something passing by
        const osc1 = ctx.createOscillator();
        const gain1 = ctx.createGain();
        osc1.connect(gain1);
        gain1.connect(ctx.destination);

        osc1.type = 'sawtooth';
        osc1.frequency.setValueAtTime(800, t);
        osc1.frequency.exponentialRampToValueAtTime(120, t + 0.12);
        osc1.frequency.exponentialRampToValueAtTime(60, t + 0.18);

        gain1.gain.setValueAtTime(0.08, t);
        gain1.gain.linearRampToValueAtTime(0.05, t + 0.08);
        gain1.gain.exponentialRampToValueAtTime(0.001, t + 0.2);

        osc1.start(t);
        osc1.stop(t + 0.2);

        // High digital blip at start
        const osc2 = ctx.createOscillator();
        const gain2 = ctx.createGain();
        osc2.connect(gain2);
        gain2.connect(ctx.destination);

        osc2.type = 'square';
        osc2.frequency.setValueAtTime(1800, t);
        osc2.frequency.exponentialRampToValueAtTime(400, t + 0.04);

        gain2.gain.setValueAtTime(0.06, t);
        gain2.gain.exponentialRampToValueAtTime(0.001, t + 0.05);

        osc2.start(t);
        osc2.stop(t + 0.05);

        // Low "splash" thud - water miss effect
        const osc3 = ctx.createOscillator();
        const gain3 = ctx.createGain();
        osc3.connect(gain3);
        gain3.connect(ctx.destination);

        osc3.type = 'sine';
        osc3.frequency.setValueAtTime(90, t + 0.06);
        osc3.frequency.exponentialRampToValueAtTime(35, t + 0.16);

        gain3.gain.setValueAtTime(0, t);
        gain3.gain.linearRampToValueAtTime(0.12, t + 0.06);
        gain3.gain.exponentialRampToValueAtTime(0.001, t + 0.18);

        osc3.start(t + 0.06);
        osc3.stop(t + 0.18);

        // Subtle noise burst for texture (white noise via detuned oscillators)
        const osc4 = ctx.createOscillator();
        const osc5 = ctx.createOscillator();
        const gain4 = ctx.createGain();
        osc4.connect(gain4);
        osc5.connect(gain4);
        gain4.connect(ctx.destination);

        osc4.type = 'sawtooth';
        osc5.type = 'sawtooth';
        osc4.frequency.setValueAtTime(2400, t + 0.05);
        osc5.frequency.setValueAtTime(2407, t + 0.05);
        osc4.frequency.exponentialRampToValueAtTime(600, t + 0.1);
        osc5.frequency.exponentialRampToValueAtTime(603, t + 0.1);

        gain4.gain.setValueAtTime(0, t);
        gain4.gain.linearRampToValueAtTime(0.03, t + 0.05);
        gain4.gain.exponentialRampToValueAtTime(0.001, t + 0.12);

        osc4.start(t + 0.05);
        osc5.start(t + 0.05);
        osc4.stop(t + 0.12);
        osc5.stop(t + 0.12);
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

