import React from 'react';

import style from './Button.module.css';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  className?: string;
  children?: React.ReactNode;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, children, disabled, ...props }, ref) => {
    return (
      <button ref={ref} className={`${style.button} ${className}`} disabled={disabled} {...props}>
        {children}
      </button>
    );
  }
);

export default Button;
