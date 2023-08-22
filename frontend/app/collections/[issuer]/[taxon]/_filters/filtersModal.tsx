import Traits from "./traits";
import { X } from "lucide-react";
import Category from "./category";
import PriceRange from "./pricerange";
import { useApp } from "@contexts/AppContext";

interface FiltersModalProps {
  taxon: string;
  issuer: string;
}

const FiltersModal = ({ issuer, taxon }: FiltersModalProps) => {
  const {
    isLaptop,
    filterState,
    clearFilters,
    mobileFilterState,
    toggleMobileFilter,
  } = useApp();

  return mobileFilterState === "open" ? (
    <>
      <div className="app-modal-overlay" onClick={toggleMobileFilter}></div>
      <div className="app-modal filters-modal">
        <div className="app-modal__header">
          <h2>Filters</h2>
          <button className="" onClick={toggleMobileFilter}>
            <X size={20} strokeWidth={2.4} />
          </button>
        </div>

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

        <div className="action-btns">
          <button className="flex-button" onClick={clearFilters}>
            <span>Clear All</span>
          </button>
        </div>
      </div>
    </>
  ) : (
    <></>
  );
};

export default FiltersModal;
