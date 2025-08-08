import React from "react";
import clsx from "clsx";

export default function Select({
  label,
  name,
  options = [],
  value,
  onChange,
  error,
  disabled = false,
  required = false,
  className = "",
}) {
  return (
    <div className={clsx("w-full", className)}>
      {label && (
        <label htmlFor={name} className="block mb-1 text-sm font-medium text-gray-700">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <select
        id={name}
        name={name}
        value={value}
        onChange={onChange}
        disabled={disabled}
        className={clsx(
          "w-full px-3 py-2 text-sm border rounded-lg outline-none transition",
          disabled ? "bg-gray-100 cursor-not-allowed text-gray-500" : "bg-white",
          error ? "border-red-500" : "border-gray-300 focus:ring-1 focus:ring-primary focus:border-primary"
        )}
      >
        <option value="" disabled>
          -- Select an option --
        </option>
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  );
}
