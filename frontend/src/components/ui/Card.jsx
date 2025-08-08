import clsx from "clsx";

export default function Card({ children, className }) {
  return (
    <div
      className={clsx(
        "bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-5 transition-colors duration-300",
        className
      )}
    >
      {children}
    </div>
  );
}
