"use client";

import { useEffect, useRef, useState } from "react";
import { MagnifyingGlass } from "@phosphor-icons/react";

interface SearchbarProps {
  gap?: number;
  value?: string;
  height?: number;
  maxWidth?: number;
  iconSize?: number;
  placeholder?: string;
  borderWeight?: number;
  backgroundColor?: string;
  onChange?: (value: string) => void;
}

const Searchbar = ({
  value,
  gap = 10,
  onChange,
  height = 40,
  placeholder,
  iconSize = 16,
  maxWidth = 480,
  borderWeight = 1,
  backgroundColor = "transparent",
}: SearchbarProps) => {
  return (
    <div
      className="search-bar"
      style={{
        gap: `${gap}px`,
        backgroundColor,
        height: `${height}px`,
        maxWidth: `${maxWidth}px`,
        borderWidth: `${borderWeight}px`,
      }}
    >
      <div className="search-bar__icon">
        <MagnifyingGlass size={iconSize} weight="bold" />
      </div>
      <input
        type="text"
        value={value}
        onChange={onChange && (e => onChange(e.target.value))}
        placeholder={placeholder || "Search for collections, items and more"}
      />
    </div>
  );
};

export default Searchbar;
