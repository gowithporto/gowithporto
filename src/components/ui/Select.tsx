import { cn } from "@/utils/cn";

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  options?: string[];
  placeholder?: string;
}

export default function Select({
  className,
  label,
  options,
  placeholder,
  children,
  ...props
}: SelectProps) {
  return (
    <div className="space-y-1">
      {label && (
        <label className="block text-sm font-medium text-black/60">
          {label}
        </label>
      )}
      <select
        className={cn(
          "w-full rounded-xl border border-black/10 bg-white px-4 py-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20",
          className
        )}
        {...props}
      >
        {placeholder && (
          <option value="" disabled>
            {placeholder}
          </option>
        )}
        {options?.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
        {children}
      </select>
    </div>
  );
}
