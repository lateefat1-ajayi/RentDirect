import clsx from "clsx";
import { useState } from "react";

export default function PasswordInput({
  label,
  name,
  placeholder,
  value,
  onChange,
  error,
  disabled = false,
}) {
  const [show, setShow] = useState(false);

  return (
    <div className="w-full relative">
      {label && (
        <label htmlFor={name} className="block mb-1 font-medium text-sm">
          {label}
        </label>
      )}
      <input
        name={name}
        id={name}
        type={show ? "text" : "password"}
        className={clsx(
          "w-full border text-sm px-3 py-2 rounded-lg outline-none transition",
          disabled ? "bg-muted cursor-not-allowed" : "bg-white dark:bg-gray-900",
          error
            ? "border-red-500"
            : "border-border focus:ring-1 focus:ring-primary"
        )}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        disabled={disabled}
      />
      <button
        type="button"
        onClick={() => setShow((prev) => !prev)}
        className="absolute right-3 top-8 text-sm cursor-pointer text-gray-600 dark:text-gray-300 hover:text-primary"
      >
        {show ? "Hide" : "Show"}
      </button>
      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
    </div>
  );
}
