"use client";

import { useState } from "react";
import { Timeframes } from "@typings";
import AppTable from "@components/table";
import { useApp } from "@contexts/AppContext";
import Tabswitch from "@components/common/tabswitch";
import { timeframeMapping } from "@helpers/constants";
import getCollections from "@app/libs/getCollections";
import { useInfiniteQuery } from "@tanstack/react-query";
import { homeTableConfig, homeTableMobileConfig } from "@helpers/table";

const Collections = () => {
  const { isTablet } = useApp();
  const [timeframe, setTimeframe] = useState<Timeframes>("All");

  const handleTimeframe = (timeframe: Timeframes) => {
    setTimeframe(timeframe);
  };

  const queryKey = ["collections", timeframe];
  const fetchCollections = async (key: string, offset = 0) => {
    const timeframeValue = timeframeMapping[timeframe];
    const newCollections = await getCollections(offset, timeframeValue);
    return newCollections;
  };

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useInfiniteQuery(
      queryKey,
      ({ pageParam }) => fetchCollections(queryKey.join("/"), pageParam),
      {
        getNextPageParam: lastPage => {
          const nextOffset = lastPage?.next
            ? new URL(lastPage.next).searchParams.get("offset")
            : 0;
          return (isNaN(Number(nextOffset)) ? 0 : Number(nextOffset)) + 20;
        },
      }
    );

  return (
    <>
      <div className="block sm">
        <div className="inner">
          <h3 className="heading-text">Collections stats</h3>
        </div>
      </div>

      <div className="collections">
        <div className="c-table-header full-page">
          <div className="inner">
            <Tabswitch tabs={["Top Collections"]} />

            <div className="timeframes">
              {["24hr", "7d", "30d", "All"].map((item, index) => {
                return (
                  <button
                    key={index}
                    className={`timeframe ${
                      timeframe === item ? "active" : ""
                    }`}
                    onClick={() => handleTimeframe(item as Timeframes)}
                  >
                    {item}
                  </button>
                );
              })}
            </div>
          </div>

          <div
            className={`c-table__row labels full-page ${
              isTablet ? "mobile-table" : ""
            }`}
          >
            <div className="c-table__row-cell collection-cell">
              <p>Collection</p>
            </div>
            <div className="c-table__row-cell floor-cell">
              <p>Floor</p>
            </div>
            <div className="c-table__row-cell volume-cell">
              <p>Total Vol</p>
            </div>
            {!isTablet && (
              <>
                <div className="c-table__row-cell owners-cell">
                  <p>Monthly Vol</p>
                </div>
                <div className="c-table__row-cell items-cell">
                  <p>Created By</p>
                </div>
              </>
            )}
          </div>
        </div>

        <AppTable
          showLabels={false}
          data={data?.pages?.flatMap(p => p) ?? []}
          rowClassName={isTablet ? "mobile-table" : ""}
          labels={isTablet ? homeTableMobileConfig : homeTableConfig}
        />

        <div className="c-table-bottom">
          {hasNextPage && (
            <button
              className="btn btn-primary"
              onClick={() => fetchNextPage()}
              disabled={isFetchingNextPage}
            >
              {isFetchingNextPage ? "Loading..." : "Load More"}
            </button>
          )}
        </div>
      </div>
    </>
  );
};

export default Collections;
