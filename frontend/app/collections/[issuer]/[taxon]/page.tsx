"use client";

import AppTable from "@components/table";
import useAppMenu from "@hooks/useAppMenu";
import { Searchbar } from "@components/common";
import { nftTableConfig } from "@helpers/table";
import { FunnelSimple } from "@phosphor-icons/react";
import { List, RotateCcw, ChevronDown, LayoutDashboard } from "lucide-react";

import _ from "lodash";
import Filters from "./_filters";
import { useEffect } from "react";
import NFTCard from "@components/nft-card";
import { useQuery } from "@tanstack/react-query";
import CollectionHeader from "./components/header";
import FiltersModal from "./_filters/filtersModal";
import getCollection from "@app/libs/getCollection";
import { Layout, useApp } from "@contexts/AppContext";
import SelectedFilters from "./components/selected-filters";

interface CollectionProps {
  params: {
    taxon: string;
    issuer: string;
  };
}

const Collection = ({ params }: CollectionProps) => {
  const { issuer, taxon } = params;

  const { data } = useQuery(["collections", issuer, taxon], () =>
    getCollection(issuer, taxon)
  );

  const {
    nfts,
    setCollectionData,

    isLaptop,
    isDesktop,

    layout,
    setLayout,
    filterState,
    initializing,
    toggleFilter,
    searchCollection,
    toggleMobileFilter,
    setSearchCollection,
  } = useApp();

  useEffect(() => {
    setCollectionData({
      taxon: taxon ?? "",
      issuer: issuer ?? "",
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const [AppMenu, activeOption] = useAppMenu("Price low to high", [
    "Price low to high",
    "Price high to low",
    "Newest",
    "Oldest",
  ]);

  return (
    <div className="collection">
      <CollectionHeader collection={data} />

      <div className="collection-body">
        <div className="collection-body__header">
          <button
            className="sq-button"
            data-active={filterState === "open" || isLaptop}
            onClick={isLaptop ? toggleMobileFilter : toggleFilter}
          >
            <FunnelSimple size={19} weight="bold" />
          </button>

          <Searchbar
            height={44}
            maxWidth={540}
            value={searchCollection}
            onChange={setSearchCollection}
            placeholder="Name, Token, ID..."
          />

          {isLaptop ? (
            <AppMenu>
              <button className={`option-button${isLaptop ? " sm" : ""}`}>
                {isLaptop ? (
                  <>
                    <p>Sort</p>
                  </>
                ) : (
                  <>
                    <p>{activeOption}</p>
                    <ChevronDown key="grid" size={16} />
                  </>
                )}
              </button>
            </AppMenu>
          ) : (
            <div className="section">
              {/* {!isDesktop && (
                <div className="refresh-status">
                  <RotateCcw size={13} />
                  <p>
                    Refreshed <span>5s ago</span>
                  </p>
                </div>
              )} */}

              <AppMenu>
                <button className={`option-button${isLaptop ? " sm" : ""}`}>
                  {isLaptop ? (
                    <>
                      <p>Sort</p>
                    </>
                  ) : (
                    <>
                      <p>{activeOption}</p>
                      <ChevronDown key="grid" size={16} />
                    </>
                  )}
                </button>
              </AppMenu>

              <div className="layouts">
                {[
                  {
                    label: "grid",
                    icon: <LayoutDashboard key="grid" size={18} />,
                  },
                  {
                    label: "list",
                    icon: <List key="list" size={18} />,
                  },
                ].map((item, index) => {
                  return (
                    <button
                      key={index}
                      className="sq-button"
                      data-active={!initializing && layout === item.label}
                      onClick={() => setLayout(item.label as Layout)}
                    >
                      {item.icon}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {!initializing && (
          <div className="collection-body__content">
            {isLaptop ? (
              <FiltersModal issuer={issuer} taxon={taxon} />
            ) : (
              <Filters issuer={issuer} taxon={taxon} />
            )}

            <div className="collection-body__content--items__container">
              <SelectedFilters />

              <div className="collection-body__content--items">
                {layout === "list" && !isLaptop ? (
                  <AppTable
                    data={nfts ?? []}
                    labels={nftTableConfig}
                    showWatchlistButton={false}
                    rowClassName="collection-list-items"
                  />
                ) : (
                  <div className="nft-grid">
                    {nfts?.map((item, index) => (
                      <NFTCard
                        key={index}
                        item={item}
                        taxon={taxon}
                        issuer={issuer}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Collection;
