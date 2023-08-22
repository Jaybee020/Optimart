"use client";

import { useState } from "react";
import useMeasure from "react-use-measure";
import { Icons } from "@components/common";
import { useApp } from "@contexts/AppContext";
import { ChevronDown, ChevronUp } from "lucide-react";

interface CategoryProps {
  title: string;
  isTrait?: boolean;
  options?: string[];
  defaultState?: boolean;
}

const Category = ({
  title,
  isTrait,
  options,
  defaultState = true,
}: CategoryProps) => {
  const [ref, bounds] = useMeasure();
  const [open, setOpen] = useState(defaultState);
  const { isMobile, filters, handleFilter } = useApp();

  return (
    <div className="category">
      <button
        className="category__title"
        onClick={() => setOpen(!open)}
        style={{
          marginBottom: isTrait ? "2px" : "8px",
          borderBottomWidth: isTrait ? "0px" : "1px",
        }}
      >
        <div className="text">
          <p className="value">{title}</p>

          {isTrait && <p className="count">{options?.length}</p>}
        </div>
        {open ? (
          <ChevronUp size={isMobile ? 22 : 16} />
        ) : (
          <ChevronDown size={isMobile ? 22 : 16} />
        )}
      </button>

      <div
        className="category__options--container"
        style={{
          height: open ? bounds.height + "px" : "0px",
        }}
      >
        <ul
          ref={ref}
          className="category__options"
          style={{
            marginBottom: isTrait ? "8px" : "4px",
          }}
        >
          {options?.map((option, index) => {
            return (
              <li
                key={index}
                onClick={() =>
                  handleFilter(title.toLowerCase(), option, isTrait)
                }
                className="category__options--item"
              >
                <div className="section">
                  <Icons.checkBox
                    size={18}
                    checked={
                      (filters && isTrait
                        ? filters?.attributes?.[title.toLowerCase()]?.includes(
                            option
                          )
                        : filters[title.toLowerCase()]?.includes(option)) ??
                      false
                    }
                  />
                  {option}
                </div>

                {/* {isTrait && <p>4</p>} */}
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
};

export default Category;
