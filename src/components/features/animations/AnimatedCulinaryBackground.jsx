import { useEffect, useState } from 'react';

// The interface FloatingIcon is removed.

const iconPaths = {
  fruit: [
    // Apple
    'M12 2c-1.5 0-2.5 1-2.5 2.5 0 0.5 0.2 1 0.5 1.5 -2 0.5-3.5 2.5-3.5 5 0 3 2.5 5.5 5.5 5.5s5.5-2.5 5.5-5.5c0-2.5-1.5-4.5-3.5-5 0.3-0.5 0.5-1 0.5-1.5 0-1.5-1-2.5-2.5-2.5z',
    // Strawberry  
    'M12 3l-1.5 2h3l-1.5-2zm-3 3c-2 0-3.5 1.5-3.5 3.5s1.5 3.5 3.5 3.5 3.5-1.5 3.5-3.5-1.5-3.5-3.5-3.5zm6 0c-2 0-3.5 1.5-3.5 3.5s1.5 3.5 3.5 3.5 3.5-1.5 3.5-3.5-1.5-3.5-3.5-3.5z',
  ],
  dessert: [
    // Cake slice
    'M3 17l4-10 4 10h-8zm5-8l3 8h6l-3-8h-6z',
    // Ice cream
    'M12 2c-2 0-3.5 1.5-3.5 3.5 0 1 0.5 2 1.5 2.5v8c0 1.5 1 2 2 2s2-0.5 2-2v-8c1-0.5 1.5-1.5 1.5-2.5 0-2-1.5-3.5-3.5-3.5z',
  ],
  drink: [
    // Wine glass
    'M8 2v6c0 2 1.5 3.5 3.5 3.5v6.5h1v-6.5c2 0 3.5-1.5 3.5-3.5v-6h-8zm1 1h6v5c0 1.5-1 2.5-3 2.5s-3-1-3-2.5v-5z',
    // Coffee cup
    'M4 6v8c0 2 1.5 3.5 3.5 3.5h5c2 0 3.5-1.5 3.5-3.5v-1h1.5c1 0 1.5-0.5 1.5-1.5s-0.5-1.5-1.5-1.5h-1.5v-4h-12zm1 1h10v7c0 1.5-1 2.5-2.5 2.5h-5c-1.5 0-2.5-1-2.5-2.5v-7z',
  ],
  tool: [
    // Chef knife
    'M4 4l8 8-1.5 1.5-8-8 1.5-1.5zm9.5 7.5l6-6-1.5-1.5-6 6 1.5 1.5z',
    // Whisk
    'M12 2l-2 8h1l1-4 1 4h1l-2-8zm-4 10v8h1v-8h-1zm3 0v8h1v-8h-1zm3 0v8h1v-8h-1z',
    // Spatula
    'M8 2v4h2v-4h-2zm-1 5v2h4v-2h-4zm0 3v11h1v-11h-1zm3 0v11h1v-11h-1z',
  ],
};

export function AnimatedCulinaryBackground() {
  // Type annotations removed from useState calls
  const [icons, setIcons] = useState([]);
  const [nextId, setNextId] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      // Type annotation removed
      const types = ['fruit', 'dessert', 'drink', 'tool'];
      const randomType = types[Math.floor(Math.random() * types.length)];
      
      // Type annotation removed
      const newIcon = {
        id: nextId,
        type: randomType,
        x: Math.random() * 100,
        y: -10,
        delay: 0,
        duration: 15 + Math.random() * 10, // 15-25 seconds
      };

      setNextId(prev => prev + 1);
      setIcons(prev => [...prev.slice(-20), newIcon]); // Keep only last 20 icons

      // Remove icon after animation
      setTimeout(() => {
        setIcons(prev => prev.filter(icon => icon.id !== newIcon.id));
      }, newIcon.duration * 1000);
    }, 3000); // New icon every 3 seconds

    return () => clearInterval(interval);
  }, [nextId]);

  // Type annotation removed from getIconPath argument
  const getIconPath = (icon) => {
    const paths = iconPaths[icon.type];
    return paths[Math.floor(Math.random() * paths.length)];
  };

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-30">
      {icons.map((icon) => (
        <div
          key={icon.id}
          className="absolute"
          style={{
            left: `${icon.x}%`,
            top: `${icon.y}%`,
            animation: `floatDown ${icon.duration}s linear forwards`,
          }}
        >
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            className="stroke-black dark:stroke-white"
            style={{
              fill: 'none',
              strokeWidth: 1.5,
              strokeLinecap: 'round',
              strokeLinejoin: 'round',
              opacity: 0.6,
            }}
          >
            <path d={getIconPath(icon)} />
          </svg>
        </div>
      ))}
      
      <style jsx>{`
        @keyframes floatDown {
          0% {
            transform: translateY(0) rotate(0deg);
            opacity: 0;
          }
          10% {
            opacity: 0.6;
          }
          90% {
            opacity: 0.6;
          }
          100% {
            transform: translateY(100vh) rotate(360deg);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
}