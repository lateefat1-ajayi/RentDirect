import clsx from "clsx";

export default function Input({
  label,
  type = "text",
  name,
  placeholder = "",
  value,
  onChange,
  error,
  disabled = false,
  className,
  ...props
}) {
  return (
    <div className="flex flex-col gap-1 w-full">
      {label && (
        <label
          htmlFor={name}
          className="text-sm font-medium text-gray-700 dark:text-gray-300"
        >
          {label}
        </label>
      )}
      <input
        id={name}
        name={name}
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        disabled={disabled}
        className={clsx(
          "px-3 py-2 rounded-md border border-input bg-white dark:bg-gray-700 text-sm text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-primary disabled:bg-gray-100 dark:disabled:bg-gray-600 disabled:cursor-not-allowed",
          error && "border-danger focus:ring-danger",
          className
        )}
        {...props}
      />
      {error && <p className="text-xs text-danger mt-0.5">{error}</p>}
    </div>
  );
}
