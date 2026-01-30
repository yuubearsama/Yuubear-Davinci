
import React from 'react';

interface BouncingTextProps {
  text: string;
  active: boolean;
}

const BouncingText: React.FC<BouncingTextProps> = ({ text, active }) => {
  if (!active) return <span className="text-3xl font-bold transition-all duration-300">{text}</span>;

  return (
    <div className="text-4xl font-bold">
      {text.split('').map((char, i) => (
        <span
          key={i}
          className="bouncing-char"
          style={{ animationDelay: `${i * 0.1}s` }}
        >
          {char === ' ' ? '\u00A0' : char}
        </span>
      ))}
    </div>
  );
};

export default BouncingText;
