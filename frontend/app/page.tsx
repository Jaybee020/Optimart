"use client";

import Link from "next/link";
import Image from "next/image";
import Footer from "@components/footer";
import AppTable from "@components/table";
import { useApp } from "@contexts/AppContext";
import Tabswitch from "@components/common/tabswitch";
import { homeTableConfig, homeTableMobileConfig } from "@helpers/table";

import { useMemo, useState } from "react";
import { Timeframes } from "@typings";
import { timeframeMapping } from "@helpers/constants";
import getCollections from "@app/libs/getCollections";
import { useInfiniteQuery } from "@tanstack/react-query";
import millify from "millify";

export default function Home() {
  const { isMobile, isTablet, isLaptop, initializing } = useApp();

  const [timeframe, setTimeframe] = useState<Timeframes>("All");

  const handleTimeframe = (timeframe: Timeframes) => {
    setTimeframe(timeframe);
  };

  const { data } = useInfiniteQuery(
    ["collections", timeframe],
    async () => await getCollections(0, timeframeMapping[timeframe], 10)
  );

  const featuredNft = useMemo(() => {
    return data?.pages?.flatMap(p => p)?.[5] ?? null;
  }, [data]);

  return (
    <>
      <div className="home-page">
        {!false && (
          <>
            <>
              <div className="block">
                <div className="heading text-center">
                  <h3 className="heading-1">Digital collectibles</h3>
                  <div className="heading__bottom">
                    <p className="heading-desc">
                      Explore the most popular digital collectibles on XRP
                    </p>
                  </div>
                </div>
              </div>

              <div className="large-cards">
                {(data?.pages?.flatMap(p => p) ?? [])
                  .slice(0, isMobile ? 1 : isLaptop ? 2 : 3)
                  .map((item, index) => {
                    return (
                      <Link
                        key={index}
                        className="card"
                        href={`/collections/${item?.issuer?.address}/${item?.taxon}`}
                      >
                        <Image
                          alt="image"
                          width={500}
                          height={500}
                          src={item?.image_url}
                          className="background-image"
                          onError={e => {}}
                        />

                        <div className="card__content">
                          <p>{item?.name}</p>
                          <p>
                            <span>Floor Price </span>
                            {millify(item?.floor_price, {
                              precision: 2,
                            })}{" "}
                            XRP
                          </p>
                        </div>
                      </Link>
                    );
                  })}
              </div>
            </>

            <div className="c-table-header">
              <div className="inner">
                <Tabswitch
                  tabs={
                    initializing ? [] : [isTablet ? "Top" : "Top Collections"]
                  }
                />

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
            </div>

            <AppTable
              showWatchlistButton={false}
              data={data?.pages?.flatMap(p => p) ?? []}
              rowClassName={isTablet ? "mobile-table" : ""}
              labels={isTablet ? homeTableMobileConfig : homeTableConfig}
            />

            <div className="c-table-bottom">
              <Link href={"/collections"} className="btn btn-primary">
                View all collections
              </Link>
            </div>
          </>
        )}

        <div className="biggest-movers">
          <div className="block">
            <div className="heading text-center">
              <h3 className="heading-1">Biggest movers</h3>
              <div className="heading__bottom">
                <p className="heading-desc">
                  Collections with the biggest change in volume in the last 24
                  hours
                </p>
              </div>
            </div>
          </div>

          <div className="large-cards movers-cards">
            {[1, 2, 3].map((item, index) => {
              return (
                <div key={index} className="card movers">
                  <div className="card-header">
                    <div className="card-header__image">
                      <Image
                        alt="image"
                        src="https://i.seadn.io/s/production/a0f15ad0-7b2a-483c-83da-41eda01ae33f.png"
                        width={136}
                        height={136}
                      />
                    </div>

                    <div className="card-header__content">
                      <h4 className="heading-4">Bored Ape Yacht Club</h4>
                      <p className="heading-desc">
                        Floor Volume <span>+4.56%</span>
                      </p>
                    </div>
                  </div>

                  <div className="card-body">
                    {[1, 2, 3].map((item, index) => {
                      return (
                        <div key={index} className="recent-item">
                          <div className="recent-item__image">
                            <Image
                              alt="image"
                              src="https://i.seadn.io/s/production/a0f15ad0-7b2a-483c-83da-41eda01ae33f.png"
                              width={136}
                              height={136}
                            />

                            {/* <div className="price">
                              <p>$276.87</p>
                            </div> */}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <div className="card-body">
                    {[1, 2, 3].map((item, index) => {
                      return (
                        <div key={index} className="recent-item">
                          <div className="recent-item__image">
                            <Image
                              alt="image"
                              src="https://i.seadn.io/s/production/a0f15ad0-7b2a-483c-83da-41eda01ae33f.png"
                              width={136}
                              height={136}
                            />

                            {/* <div className="price">
                              <p>$276.87</p>
                            </div> */}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="featured-collections">
          <div className="featured-card">
            <Image
              alt="image"
              src={featuredNft?.banner_url}
              width={3000}
              height={600}
              className="background-image"
            />

            <div className="featured-card__content">
              <div className="featured-card__content--details">
                <p>{featuredNft?.name}</p>
                <p>
                  <span>Floor Price </span>
                  {millify(featuredNft?.floor_price, {
                    precision: 2,
                  })}{" "}
                  XRP
                </p>
              </div>

              <Link
                href={"/featured"}
                className="featured-card__content--btn btn-primary"
              >
                View all featured drops
              </Link>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </>
  );
}
