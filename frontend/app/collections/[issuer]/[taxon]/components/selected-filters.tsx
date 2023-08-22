import _ from "lodash";
import { Fragment } from "react";
import { X } from "lucide-react";
import { useApp } from "@contexts/AppContext";
import { capitalizeFirst } from "@helpers/text";

const SelectedFilters = () => {
  const {
    filters,
    minPrice,
    maxPrice,
    setMinPrice,
    setMaxPrice,
    handleFilter,
    clearFilters,
    handlePriceFilter,
  } = useApp();

  return (
    <>
      {Object.keys(filters).length > 0 && (
        <div className="selected-filters">
          <button
            onClick={clearFilters}
            className="selected-filters__item clear"
          >
            <p>Clear All</p>
          </button>

          {Object.keys(filters).map((category, ind) => {
            return category === "price" ? (
              <Fragment key={category}>
                {Object.keys(filters?.price).map((bound: string) => {
                  return (
                    <button
                      key={bound}
                      onClick={() => {
                        if (bound === "minPrice") {
                          setMinPrice("");
                          handlePriceFilter(parseInt(""), parseInt(maxPrice));
                        } else {
                          setMaxPrice("");
                          handlePriceFilter(parseInt(minPrice), parseInt(""));
                        }
                      }}
                      className="selected-filters__item"
                    >
                      <p>{`${bound === "minPrice" ? ">" : "<"} ${
                        filters?.price?.[bound]
                      } XRP`}</p>
                      <X size={13} strokeWidth={2.4} />
                    </button>
                  );
                })}
              </Fragment>
            ) : category === "attributes" ? (
              <Fragment key={category}>
                {Object.keys(filters?.attributes).map((trait: string) => {
                  return (
                    <Fragment key={trait}>
                      {filters?.attributes?.[trait].map((item: string) => {
                        return (
                          <button
                            key={item}
                            onClick={() =>
                              handleFilter(trait.toLowerCase(), item, true)
                            }
                            className="selected-filters__item"
                          >
                            <p>{`${capitalizeFirst(trait)}: ${item}`}</p>
                            <X size={13} strokeWidth={2.4} />
                          </button>
                        );
                      })}
                    </Fragment>
                  );
                })}
              </Fragment>
            ) : (
              <Fragment key={category}>
                {filters[category].map((item: string) => {
                  return (
                    <button
                      key={item}
                      onClick={() => handleFilter(category.toLowerCase(), item)}
                      className="selected-filters__item"
                    >
                      <p>{item}</p>
                      <X size={13} strokeWidth={2.4} />
                    </button>
                  );
                })}
              </Fragment>
            );
          })}
        </div>
      )}
    </>
  );
};

export default SelectedFilters;
