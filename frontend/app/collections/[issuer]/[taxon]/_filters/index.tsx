"use client";

import _ from "lodash";
import Traits from "./traits";
import Category from "./category";
import PriceRange from "./pricerange";
import { useApp } from "@contexts/AppContext";

interface FiltersProps {
  taxon: string;
  issuer: string;
}

const Filters = ({ issuer, taxon }: FiltersProps) => {
  const { isLaptop, filterState } = useApp();

  return (
    <>
      <div
        className="filters"
        style={{
          paddingTop: isLaptop ? "0px" : "10px",
          marginRight: filterState === "open" && !isLaptop ? "20px" : "0px",
          width: isLaptop ? "100%" : filterState === "open" ? "284px" : "0px",
        }}
      >
        <div
          className="filters-inner"
          style={{
            paddingRight: isLaptop ? "0px" : "16px",
            paddingBottom: isLaptop ? "0px" : "40px",
          }}
        >
          <Category
            title="Status"
            defaultState={false}
            options={["Listed", "Unlisted"]}
          />

          <PriceRange />
          <Traits taxon={taxon} issuer={issuer} />
        </div>
      </div>
    </>
  );
};

export default Filters;
