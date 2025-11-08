import { InputHTMLAttributes, forwardRef } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  hint?: string;
  error?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, hint, error, className = '', id, ...props }, ref) => {
    const inputId = id || props.name;
    return (
      <div className="w-full">
        {label ? (
          <label htmlFor={inputId} className="label">
            {label}
          </label>
        ) : null}
        <input
          id={inputId}
          ref={ref}
          className={[
            'input',
            error ? 'border-red-400 focus:ring-red-500' : '',
            className,
          ].join(' ')}
          {...props}
        />
        {hint && !error ? (
          <p className="mt-1 text-xs text-neutral-500">{hint}</p>
        ) : null}
        {error ? <p className="mt-1 text-xs text-red-500">{error}</p> : null}
      </div>
    );
  }
);

export default Input;


