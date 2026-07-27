import { useEffect, useRef } from "react";

export default function GenesisBackground() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    let particles = [];
    let animation;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;

      particles = Array.from({ length: 160 }, () => ({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size: Math.random() * 2,
        speed: Math.random() * 0.35 + 0.1,
        drift: Math.random() * 0.5
      }));
    };

    resize();

    window.addEventListener("resize", resize);

    const render = () => {
      ctx.clearRect(0,0,canvas.width,canvas.height);

      const gradient = ctx.createRadialGradient(
        canvas.width/2,
        canvas.height/2,
        0,
        canvas.width/2,
        canvas.height/2,
        canvas.width
      );

      gradient.addColorStop(0,"rgba(80,120,255,.18)");
      gradient.addColorStop(1,"rgba(0,0,0,1)");

      ctx.fillStyle = gradient;
      ctx.fillRect(0,0,canvas.width,canvas.height);


      particles.forEach(p=>{

        p.y -= p.speed;
        p.x += Math.sin(Date.now()*0.0005)*p.drift;

        if(p.y < 0){
          p.y = canvas.height;
        }


        ctx.beginPath();
        ctx.arc(
          p.x,
          p.y,
          p.size,
          0,
          Math.PI*2
        );

        ctx.fillStyle="rgba(255,255,255,.7)";
        ctx.fill();

      });


      animation=requestAnimationFrame(render);
    };

    render();

    return ()=>{
      cancelAnimationFrame(animation);
      window.removeEventListener("resize",resize);
    };

  },[]);


  return (
    <canvas
      ref={canvasRef}
      className="genesis-background"
    />
  );
}