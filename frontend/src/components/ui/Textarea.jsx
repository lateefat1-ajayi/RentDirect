import React from "react";
import clsx from "clsx";

export default function Textarea({
  label,
  name,
  placeholder,
  value,
  onChange,
  error,
  rows = 4,
  disabled = false,
}) {
  return (
    <div className="w-full">
      {label && (
        <label htmlFor={name} className="block mb-1 font-medium text-sm">
          {label}
        </label>
      )}
      <textarea
        name={name}
        id={name}
        rows={rows}
        className={clsx(
          "w-full border text-sm px-3 py-2 rounded-lg outline-none transition",
          disabled ? "bg-muted cursor-not-allowed" : "bg-white",
          error ? "border-red-500" : "border-border focus:ring-1 focus:ring-primary"
        )}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        disabled={disabled}
      />
      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
    </div>
  );
}
