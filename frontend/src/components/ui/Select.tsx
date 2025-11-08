import { SelectHTMLAttributes, forwardRef } from 'react';

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  hint?: string;
  error?: string;
}

const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, hint, error, className = '', id, children, ...props }, ref) => {
    const inputId = id || props.name;
    return (
      <div className="w-full">
        {label ? (
          <label htmlFor={inputId} className="label">
            {label}
          </label>
        ) : null}
        <select
          id={inputId}
          ref={ref}
          className={[
            'input',
            'appearance-none',
            error ? 'border-red-400 focus:ring-red-500' : '',
            className,
          ].join(' ')}
          {...props}
        >
          {children}
        </select>
        {hint && !error ? (
          <p className="mt-1 text-xs text-neutral-500">{hint}</p>
        ) : null}
        {error ? <p className="mt-1 text-xs text-red-500">{error}</p> : null}
      </div>
    );
  }
);

export default Select;


