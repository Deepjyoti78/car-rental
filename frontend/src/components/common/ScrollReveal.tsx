import React from 'react';

export interface ScrollRevealProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  animation?: 'up' | 'scale' | 'left' | 'right' | 'fade';
  delay?: number;
  className?: string;
  as?: React.ElementType;
}

export const ScrollReveal: React.FC<ScrollRevealProps> = ({
  children,
  animation = 'up',
  delay = 0,
  className = '',
  as: Component = 'div',
  style,
  ...props
}) => {
  const getAnimationClass = () => {
    switch (animation) {
      case 'scale':
        return 'reveal-scale';
      case 'left':
        return 'reveal-from-left';
      case 'right':
        return 'reveal-from-right';
      case 'fade':
        return 'reveal-fade';
      case 'up':
      default:
        return 'reveal-on-scroll';
    }
  };

  const combinedStyle = {
    ...style,
    ...(delay > 0 ? ({ '--reveal-delay': `${delay}ms` } as React.CSSProperties) : {}),
  };

  return (
    <Component
      className={`${getAnimationClass()} ${className}`}
      data-reveal
      data-reveal-delay={delay > 0 ? delay : undefined}
      style={combinedStyle}
      {...props}
    >
      {children}
    </Component>
  );
};
