import React, { useEffect, useRef } from 'react';

const DataGridBackground = () => {
    const canvasRef = useRef(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        let animationFrameId;

        let width = canvas.width = window.innerWidth;
        let height = canvas.height = window.innerHeight;

        let mouse = { x: -1000, y: -1000 };

        // Grid nodes
        const spacing = 50;
        const cols = Math.floor(width / spacing) + 1;
        const rows = Math.floor(height / spacing) + 1;

        const nodes = [];
        for (let i = 0; i < cols; i++) {
            for (let j = 0; j < rows; j++) {
                nodes.push({
                    x: i * spacing,
                    y: j * spacing,
                    baseX: i * spacing,
                    baseY: j * spacing,
                    vx: 0,
                    vy: 0
                });
            }
        }

        const draw = () => {
            ctx.fillStyle = '#050505'; // forensic-black
            ctx.fillRect(0, 0, width, height);

            ctx.lineWidth = 1;

            nodes.forEach(node => {
                // Return to base position
                node.vx += (node.baseX - node.x) * 0.05;
                node.vy += (node.baseY - node.y) * 0.05;

                // Mouse interaction - repel slightly
                const dx = mouse.x - node.x;
                const dy = mouse.y - node.y;
                const dist = Math.sqrt(dx * dx + dy * dy);

                if (dist < 150) {
                    const force = (150 - dist) / 150;
                    node.vx -= (dx / dist) * force * 2;
                    node.vy -= (dy / dist) * force * 2;
                }

                node.vx *= 0.8;
                node.vy *= 0.8;
                node.x += node.vx;
                node.y += node.vy;
            });

            // Draw connecting lines
            ctx.strokeStyle = 'rgba(16, 185, 129, 0.1)'; // faint emerald

            for (let i = 0; i < nodes.length; i++) {
                const n1 = nodes[i];

                // Draw node point
                ctx.fillStyle = 'rgba(16, 185, 129, 0.3)';
                ctx.fillRect(n1.x - 1, n1.y - 1, 2, 2);

                // Connect to neighbors
                for (let j = i + 1; j < nodes.length; j++) {
                    const n2 = nodes[j];
                    const dx = n1.x - n2.x;
                    const dy = n1.y - n2.y;
                    const dist = Math.sqrt(dx * dx + dy * dy);

                    if (dist < spacing * 1.5) {
                        ctx.beginPath();
                        ctx.moveTo(n1.x, n1.y);
                        ctx.lineTo(n2.x, n2.y);

                        // Highlight lines near the mouse
                        const mx = (n1.x + n2.x) / 2 - mouse.x;
                        const my = (n1.y + n2.y) / 2 - mouse.y;
                        const mDist = Math.sqrt(mx * mx + my * my);

                        if (mDist < 200) {
                            ctx.strokeStyle = `rgba(16, 185, 129, ${0.8 * (200 - mDist) / 200})`; // brighter emerald
                        } else {
                            ctx.strokeStyle = 'rgba(16, 185, 129, 0.05)';
                        }

                        ctx.stroke();
                    }
                }
            }

            // Draw a mouse cursor reticle
            if (mouse.x > 0 && mouse.y > 0) {
                ctx.strokeStyle = 'rgba(139, 92, 246, 0.5)'; // violet
                ctx.beginPath();
                ctx.arc(mouse.x, mouse.y, 10, 0, Math.PI * 2);
                ctx.stroke();
                ctx.beginPath();
                ctx.moveTo(mouse.x - 15, mouse.y);
                ctx.lineTo(mouse.x + 15, mouse.y);
                ctx.moveTo(mouse.x, mouse.y - 15);
                ctx.lineTo(mouse.x, mouse.y + 15);
                ctx.stroke();
            }

            animationFrameId = requestAnimationFrame(draw);
        };

        draw();

        const handleMouseMove = (e) => {
            mouse.x = e.clientX;
            mouse.y = e.clientY;
        };

        const handleMouseLeave = () => {
            mouse.x = -1000;
            mouse.y = -1000;
        }

        const handleResize = () => {
            width = canvas.width = window.innerWidth;
            height = canvas.height = window.innerHeight;
        };

        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('mouseout', handleMouseLeave);
        window.addEventListener('resize', handleResize);

        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseout', handleMouseLeave);
            window.removeEventListener('resize', handleResize);
            cancelAnimationFrame(animationFrameId);
        };
    }, []);

    return (
        <div className="fixed inset-0 m-0 w-full h-full touch-none overflow-hidden bg-forensic-black -z-10" style={{ fontFamily: 'Fira Code, monospace' }}>
            <canvas ref={canvasRef} id="data-grid-canvas" className="fixed inset-0 w-full h-full block" />
            <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_center,_transparent_0%,_#050505_100%)]"></div>
        </div>
    );
};

export default DataGridBackground;
