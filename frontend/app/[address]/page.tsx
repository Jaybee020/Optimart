"use client";

import { Copy, SealCheck, FunnelSimple } from "@phosphor-icons/react";

import Image from "next/image";
import AppTable from "@components/table";
import useAppMenu from "@hooks/useAppMenu";
import { Searchbar } from "@components/common";
import {
  mockdata,
  profileTableActivity,
  profileTableCollected,
} from "@helpers/table";
import { List, ChevronDown, LayoutDashboard, X } from "lucide-react";

import { Fragment } from "react";
import NFTCard from "@components/nft-card";
import { capitalizeFirst } from "@helpers/text";
import { Layout, ProfileTab, useApp } from "@contexts/AppContext";

import FiltersModal from "./_filters/filtersModal";
import Filters from "./_filters";

interface CollectionProps {
  params: {
    address: string;
  };
}

const Profile = ({ params }: CollectionProps) => {
  const { address } = params;

  const {
    isLaptop,

    layout,
    filters,
    setLayout,
    profileTab,
    filterState,
    handleFilter,
    initializing,
    clearFilters,
    toggleFilter,
    searchProfile,
    setProfileTab,
    setSearchProfile,
    toggleMobileFilter,
  } = useApp();

  const [AppMenu, activeOption] = useAppMenu("Price low to high", [
    "Price low to high",
    "Price high to low",
    "Newest",
    "Oldest",
  ]);

  return (
    <div className="profile">
      <div className="profile-header">
        <div className="profile-header__banner">
          {/* <Image
            alt="image"
            src="https://i.seadn.io/gcs/files/b8750898e2dbb946dec0786412ae2c28.png?auto=format&dpr=1&w=3840"
            width={3840}
            height={300}
          /> */}

          <div className="profile-header__banner--dp">
            <Image
              alt="image"
              src="https://i.seadn.io/gcs/files/929601545052b74cfa6779dd016ad527.png?auto=format&dpr=1&w=384"
              width={400}
              height={400}
            />
          </div>
        </div>

        <div className="profile-header__content">
          <div className="profile-header__content--details">
            <div className="profile-info">
              <div className="name">
                <p>Alphaknight</p>
                {false && <SealCheck size={20} weight="fill" color="#4588FF" />}
              </div>

              <div className="media">
                <div className="user-address">
                  <p>rhNf...So6J</p>
                  <button>
                    <Copy size={17} strokeWidth={2.4} />
                  </button>
                </div>
                <div className="media-block">
                  <p>
                    Joined <span>&nbsp;•&nbsp; March, 2023</span>
                  </p>
                </div>

                <div className="media-block">
                  <p>
                    NFTs <span>&nbsp;•&nbsp; 4267</span>
                  </p>
                </div>
              </div>
            </div>

            <div className="profile-header__content--description">
              <p>
                Azuki starts with a collection of 10,000 avatars that give you a
                unique identity on the web and on the blockchain.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="profile-body">
        <div className="profile-tabs">
          <div className="profile-tabs__container">
            {["collected", "created", "activity"].map((item, index) => {
              return (
                <button
                  key={index}
                  className="profile-tabs--tab"
                  data-active={profileTab === item}
                  onClick={() => setProfileTab(item as ProfileTab)}
                >
                  <p>{item}</p>
                </button>
              );
            })}
          </div>
        </div>

        <div className="profile-body__header">
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
            value={searchProfile}
            onChange={setSearchProfile}
            placeholder="Name, Token, ID..."
          />

          {profileTab === "collected" && (
            <>
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
            </>
          )}
        </div>

        {!initializing && (
          <div className="profile-body__content">
            {isLaptop ? <FiltersModal /> : <Filters />}

            <div className="profile-body__content--items__container">
              {Object.keys(filters).length > 0 && (
                <div className="selected-filters">
                  <button
                    onClick={clearFilters}
                    className="selected-filters__item clear"
                  >
                    <p>Clear All</p>
                  </button>

                  {Object.keys(filters).map((category, ind) => {
                    return category === "attributes" ? (
                      <Fragment key={category}>
                        {Object.keys(filters?.attributes).map(
                          (trait: string) => {
                            return (
                              <Fragment key={trait}>
                                {filters?.attributes?.[trait].map(
                                  (item: string) => {
                                    return (
                                      <button
                                        key={item}
                                        onClick={() =>
                                          handleFilter(
                                            trait.toLowerCase(),
                                            item,
                                            true
                                          )
                                        }
                                        className="selected-filters__item"
                                      >
                                        <p>{`${capitalizeFirst(
                                          trait
                                        )}: ${item}`}</p>
                                        <X size={13} strokeWidth={2.4} />
                                      </button>
                                    );
                                  }
                                )}
                              </Fragment>
                            );
                          }
                        )}
                      </Fragment>
                    ) : (
                      <Fragment key={category}>
                        {filters[category].map((item: string) => {
                          return (
                            <button
                              key={item}
                              onClick={() =>
                                handleFilter(category.toLowerCase(), item)
                              }
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

              <div className="profile-body__content--items">
                {(layout === "list" &&
                  !isLaptop &&
                  profileTab === "collected") ||
                profileTab === "activity" ? (
                  <AppTable
                    tableType="activity"
                    labels={
                      profileTab === "activity"
                        ? profileTableActivity
                        : profileTableCollected
                    }
                    showWatchlistButton={false}
                    data={[...mockdata, ...mockdata]}
                    rowClassName={
                      profileTab === "activity"
                        ? "profile-activity-tab"
                        : "profile-list-items"
                    }
                  />
                ) : (
                  <div className="nft-grid">
                    {[...mockdata, ...mockdata, ...mockdata, ...mockdata].map(
                      (item, index) => (
                        <NFTCard
                          issuer="issuer"
                          taxon="taxon"
                          key={index}
                          item={item}
                        />
                      )
                    )}
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

export default Profile;
