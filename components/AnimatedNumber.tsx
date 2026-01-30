
import React, { useEffect, useState, useRef } from 'react';

interface AnimatedNumberProps {
  value: number;
  duration?: number;
  className?: string;
}

const AnimatedNumber: React.FC<AnimatedNumberProps> = ({ value, duration = 500, className }) => {
  const [displayValue, setDisplayValue] = useState(value);
  const [isAnimating, setIsAnimating] = useState(false);
  const [direction, setDirection] = useState<'up' | 'down' | null>(null);
  
  const startTimeRef = useRef<number | null>(null);
  const startValueRef = useRef(value);
  const targetValueRef = useRef(value);
  const requestRef = useRef<number | null>(null);

  useEffect(() => {
    if (value !== targetValueRef.current) {
      setDirection(value > targetValueRef.current ? 'up' : 'down');
      setIsAnimating(true);
      
      startValueRef.current = displayValue;
      targetValueRef.current = value;
      startTimeRef.current = null;
      
      const animate = (timestamp: number) => {
        if (!startTimeRef.current) startTimeRef.current = timestamp;
        const elapsed = timestamp - startTimeRef.current;
        const progress = Math.min(elapsed / duration, 1);
        
        // Ease out quad function
        const easeOutQuad = (t: number) => t * (2 - t);
        const currentProgress = easeOutQuad(progress);
        
        const nextValue = Math.round(
          startValueRef.current + (targetValueRef.current - startValueRef.current) * currentProgress
        );
        
        setDisplayValue(nextValue);

        if (progress < 1) {
          requestRef.current = requestAnimationFrame(animate);
        } else {
          setDisplayValue(value);
          setIsAnimating(false);
          setDirection(null);
        }
      };

      requestRef.current = requestAnimationFrame(animate);
    }

    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [value, duration]);

  // Determine animation style
  const animationClass = isAnimating 
    ? direction === 'up' ? 'animate-slide-up' : 'animate-slide-down'
    : '';

  return (
    <div className="relative overflow-hidden inline-block align-bottom">
      <span className={`${className} inline-block transition-transform ${animationClass}`}>
        {displayValue.toLocaleString()}
      </span>
    </div>
  );
};

export default AnimatedNumber;
