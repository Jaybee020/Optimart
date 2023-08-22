import { Icons, Searchbar } from "@components/common";
import Category from "./category";

import { useApp } from "@contexts/AppContext";
import Image from "next/image";

const Filters = () => {
  const { isLaptop, profileTab, filterState } = useApp();

  return (
    <>
      <div
        className="filters user-profile-filters"
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
          {profileTab !== "activity" && (
            <Category
              title="Status"
              collapsible={false}
              defaultState={false}
              options={["Minted", "Listed"]}
            />
          )}

          {profileTab === "collected" ? (
            <div className="category">
              <div
                className="category__title"
                style={{
                  marginBottom: "8px",
                  borderBottomWidth: "1px",
                }}
              >
                <div className="text">
                  <p className="value">Collections</p>
                </div>
              </div>

              <div className="profile-filters">
                <Searchbar
                  gap={8}
                  height={34}
                  iconSize={14}
                  borderWeight={0}
                  placeholder="Search"
                  backgroundColor="var(--neutral-100)"
                />

                <div className="labels">
                  <p>Collection</p>
                  <p>Value</p>
                </div>

                <div className="user-collections">
                  {[1, 2, 3, 4].map((item, index) => {
                    return (
                      <div
                        key={index}
                        data-active={index === 0}
                        className="collection-block"
                      >
                        <div className="collection-block__image">
                          <Image
                            src="https://i.seadn.io/gae/BdxvLseXcfl57BiuQcQYdJ64v-aI8din7WPk0Pgo3qQFhAUH-B6i-dCqqc_mCkRIzULmwzwecnohLhrcH8A9mpWIZqA7ygc52Sr81hE?auto=format&dpr=1&w=136&h=136&fr=1"
                            width={100}
                            height={100}
                            alt="collection"
                          />
                        </div>

                        <div className="collection-block__details">
                          <div className="collection-block__details-block">
                            <p>CryptoPunks</p>
                            <p className="sub">4 NFTs</p>
                          </div>

                          <div className="collection-block__details-block">
                            <div className="value">
                              <p>0.0045</p>
                              <Icons.XRP size={9} />
                            </div>
                            <div className="value">
                              <p className="sub">Floor 0.002</p>
                              <Icons.XRP size={7} />
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          ) : profileTab === "created" ? (
            <Category
              title="Type"
              collapsible={false}
              defaultState={false}
              options={["NFT", "Collection"]}
            />
          ) : (
            <Category
              title="Events"
              collapsible={false}
              defaultState={false}
              options={["Transfer", "Collection", "List", "Sale"]}
            />
          )}
        </div>
      </div>
    </>
  );
};

export default Filters;
