import { cn } from "@/utils/cn";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}

export default function Input({ className, label, ...props }: InputProps) {
  return (
    <div className="space-y-1">
      {label && (
        <label className="block text-sm font-medium text-black/60">
          {label}
        </label>
      )}
      <input
        className={cn(
          "w-full rounded-xl border border-black/10 bg-white px-4 py-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20",
          className
        )}
        {...props}
      />
    </div>
  );
}
