import React, { useEffect, useRef } from 'react';

const LiquidEffectBackground = () => {
    const canvasRef = useRef(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        let animationFrameId;

        let width = canvas.width = window.innerWidth;
        let height = canvas.height = window.innerHeight;

        let mouse = { x: width / 2, y: height / 2, vx: 0, vy: 0 };
        let lastMouse = { x: width / 2, y: height / 2 };

        const particles = Array.from({ length: 150 }, () => ({
            x: Math.random() * width,
            y: Math.random() * height,
            size: Math.random() * 2 + 0.5,
            speedY: Math.random() * 1 + 0.2,
            speedX: (Math.random() - 0.5) * 0.5,
            opacity: Math.random() * 0.5 + 0.1
        }));

        let time = 0;

        // Wave points for interactivity
        const wavePoints = Array.from({ length: Math.floor(width / 20) + 1 }, (_, i) => ({
            x: i * 20,
            y: 0,
            vy: 0,
            targetY: 0
        }));

        const draw = () => {
            ctx.fillStyle = 'rgba(11, 17, 32, 1)';
            ctx.fillRect(0, 0, width, height);

            // Mouse velocity dampening
            mouse.vx *= 0.95;
            mouse.vy *= 0.95;

            // Draw waves
            const waveCount = 3;
            for (let i = 0; i < waveCount; i++) {
                ctx.beginPath();
                ctx.moveTo(0, height);

                for (let x = 0; x <= width; x += 20) {
                    // Find closest wave point
                    const pIndex = Math.min(Math.floor(x / 20), wavePoints.length - 1);
                    const wp = wavePoints[pIndex];

                    // Mouse interaction with wave
                    const dx = x - mouse.x;
                    const dy = (height - 150) - mouse.y;
                    const dist = Math.sqrt(dx * dx + dy * dy);

                    if (dist < 250) {
                        const force = (250 - dist) / 250;
                        // Push the wave strongly based on mouse movement
                        wp.vy += force * mouse.vy * 0.08 * (i === 0 ? 1 : 0.6);
                        wp.vy += force * Math.abs(mouse.vx) * 0.02; // side-to-side movement also agitates water
                    }

                    // Spring physics for wave points
                    wp.vy += (wp.targetY - wp.y) * 0.03; // stiffness
                    wp.vy *= 0.92; // dampening
                    wp.y += wp.vy;

                    const springY = wp.y;

                    const y = height - 150 + springY -
                        Math.sin(x * 0.003 + time + i) * 60 -
                        Math.sin(x * 0.001 - time * 0.5) * 40;

                    if (x === 0) {
                        ctx.lineTo(x, y);
                    } else {
                        // Smooth curves between points
                        ctx.lineTo(x, y);
                    }
                }

                ctx.lineTo(width, height);
                ctx.lineTo(0, height);
                ctx.closePath();

                const gradient = ctx.createLinearGradient(0, height - 300, 0, height);
                if (i === 0) {
                    gradient.addColorStop(0, 'rgba(59, 130, 246, 0.25)'); // Blue
                    gradient.addColorStop(1, 'rgba(11, 17, 32, 0.9)');
                } else if (i === 1) {
                    gradient.addColorStop(0, 'rgba(20, 184, 166, 0.15)'); // Teal
                    gradient.addColorStop(1, 'rgba(11, 17, 32, 0.95)');
                } else {
                    gradient.addColorStop(0, 'rgba(96, 165, 250, 0.08)'); // Light blue
                    gradient.addColorStop(1, 'rgba(11, 17, 32, 1)');
                }

                ctx.fillStyle = gradient;
                ctx.fill();
            }

            // Draw interactive particles
            particles.forEach(p => {
                const dx = p.x - mouse.x;
                const dy = p.y - mouse.y;
                const dist = Math.sqrt(dx * dx + dy * dy);

                // Mouse repels particles to create "flow"
                if (dist < 200) {
                    const force = (200 - dist) / 200;
                    p.x += (dx / dist) * force * 5 + (mouse.vx * 0.05);
                    p.y += (dy / dist) * force * 5 + (mouse.vy * 0.05);
                }

                p.y -= p.speedY;
                p.x += p.speedX;

                if (p.y < 0) {
                    p.y = height;
                    p.x = Math.random() * width;
                }
                if (p.x < 0) p.x = width;
                if (p.x > width) p.x = 0;

                ctx.beginPath();
                ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(96, 165, 250, ${p.opacity})`;
                ctx.shadowBlur = 10;
                ctx.shadowColor = 'rgba(96, 165, 250, 0.5)';
                ctx.fill();
                ctx.shadowBlur = 0;
            });

            time += 0.02;
            animationFrameId = requestAnimationFrame(draw);
        };

        draw();

        const handleMouseMove = (e) => {
            mouse.vx = e.clientX - lastMouse.x;
            mouse.vy = e.clientY - lastMouse.y;
            mouse.x = e.clientX;
            mouse.y = e.clientY;
            lastMouse.x = e.clientX;
            lastMouse.y = e.clientY;
        };

        const handleResize = () => {
            width = canvas.width = window.innerWidth;
            height = canvas.height = window.innerHeight;
        };

        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('resize', handleResize);

        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('resize', handleResize);
            cancelAnimationFrame(animationFrameId);
        };
    }, []);

    return (
        <div className="fixed inset-0 m-0 w-full h-full touch-none overflow-hidden bg-gradient-to-b from-truth-navy-dark to-truth-navy -z-10" style={{ fontFamily: 'Montserrat, sans-serif' }}>
            <canvas ref={canvasRef} id="liquid-canvas" className="fixed inset-0 w-full h-full block" />
        </div>
    );
};

export default LiquidEffectBackground;
