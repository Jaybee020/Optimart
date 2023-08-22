"use client";

import { useState } from "react";
import useMeasure from "react-use-measure";
import { useApp } from "@contexts/AppContext";
import { ChevronDown, ChevronUp } from "lucide-react";

interface PriceRangeProps {
  isTrait?: boolean;
}

const PriceRange = ({ isTrait }: PriceRangeProps) => {
  const [ref, bounds] = useMeasure();
  const [open, setOpen] = useState(true);
  const {
    isMobile,
    minPrice,
    maxPrice,
    setMinPrice,
    setMaxPrice,
    handlePriceFilter,
  } = useApp();

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
          <p className="value">Price</p>
        </div>
        {open ? (
          <ChevronUp size={isMobile ? 22 : 16} />
        ) : (
          <ChevronDown size={isMobile ? 22 : 16} />
        )}
      </button>

      <div
        className="category__range--container"
        style={{
          height: open ? bounds.height + "px" : "0px",
        }}
      >
        <div className="category__range" ref={ref}>
          <div className="sect">
            <div className="category__range--item">
              <p className="label">Minimum price</p>

              <div className="input-container">
                <div className="input-symbol">XRP</div>

                <input
                  value={minPrice}
                  onKeyDown={e => {
                    if (e.key === "Enter") {
                      handlePriceFilter(parseInt(minPrice), parseInt(maxPrice));
                    }
                  }}
                  onChange={e => {
                    const value = parseInt(e.target.value);
                    if (isNaN(value) && e.target.value) return;
                    setMinPrice((e.target.value ? value : "") + "");
                  }}
                  type="text"
                  placeholder="0"
                />
              </div>
            </div>

            <div className="category__range--item">
              <p className="label">Maximum price</p>

              <div className="input-container">
                <div className="input-symbol">XRP</div>

                <input
                  type="text"
                  value={maxPrice}
                  onKeyDown={e => {
                    if (e.key === "Enter") {
                      handlePriceFilter(parseInt(minPrice), parseInt(maxPrice));
                    }
                  }}
                  onChange={e => {
                    const value = parseInt(e.target.value);
                    if (isNaN(value) && e.target.value) return;
                    setMaxPrice((e.target.value ? value : "") + "");
                  }}
                  placeholder="0"
                />
              </div>
            </div>
          </div>

          {/* <button>Apply</button> */}
        </div>
      </div>
    </div>
  );
};

export default PriceRange;
