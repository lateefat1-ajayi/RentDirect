import clsx from "clsx";

export default function Button({
  children,
  variant = "primary",
  size = "sm",
  className = "",
  isLoading = false,
  disabled = false,
  ...props
}) {
  const base =
    "inline-flex items-center justify-center gap-2 rounded-md font-medium transition duration-200";

  const sizes = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-4 py-2 text-sm",
    lg: "px-5 py-2.5 text-base",
  };

  const variants = {
  primary:
    "bg-primary text-white hover:bg-primary/90 dark:bg-primary dark:hover:bg-primary/80",
  outline:
    "border border-primary text-primary hover:bg-primary/10 dark:text-primary dark:border-primary",
  secondary:
    "bg-gray-200 text-black hover:bg-gray-300 dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600",
  white:
    "bg-white text-primary hover:bg-gray-100 dark:bg-white dark:text-primary",
  danger:
    "bg-red-500 text-white hover:bg-red-600 dark:bg-red-600 dark:hover:bg-red-700",
};


  const isDisabled = isLoading || disabled;

  // console.log("Button loading state:", isLoading);

  return (
    <button
      disabled={isDisabled}
      className={clsx(
        base,
        sizes[size],
        variants[variant],
        isDisabled && "opacity-50 cursor-not-allowed",
        className
      )}
      {...props}
    >
      {isLoading ? <span className="animate-pulse">Loading...</span> : children}
    </button>
  );
}
