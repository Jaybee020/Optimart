"use client";

import { useEffect, useRef, useState } from "react";
import { MagnifyingGlass } from "@phosphor-icons/react";

interface SearchbarProps {
  height?: number;
  maxWidth?: number;
  placeholder?: string;
}

const Searchbar = ({
  height = 40,
  maxWidth = 480,
  placeholder,
}: SearchbarProps) => {
  const [focused, setFocused] = useState(false);

  const ref = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      const activeElement = document?.activeElement?.tagName.toLowerCase();

      if (event.key === "/" && activeElement !== "input") {
        event.preventDefault();
        ref?.current?.focus();
      } else if (event.key === "Escape" && focused) {
        event.preventDefault();
        ref?.current?.blur();
      }
    };
    window.addEventListener("keydown", handleKeyPress);
    return () => {
      window.removeEventListener("keydown", handleKeyPress);
    };
  }, [focused]);

  return (
    <div
      className="search-bar"
      style={{
        marginRight: "30px",
        height: `${height}px`,
        maxWidth: `${maxWidth}px`,
      }}
    >
      <div className="search-bar__icon">
        <MagnifyingGlass size={16} weight="bold" />
      </div>
      <input
        ref={ref}
        type="text"
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        placeholder={placeholder || "Search for collections, items and more"}
      />

      <div className="search-bar__shortcut">
        {!focused ? <span>/</span> : <span>ESC</span>}
      </div>
    </div>
  );
};

export default Searchbar;
