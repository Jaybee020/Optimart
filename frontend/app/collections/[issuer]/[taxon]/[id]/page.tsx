"use client";

import {
  Tag,
  Sparkles,
  ListTree,
  Activity,
  BadgeInfo,
  ScrollText,
  ChevronDown,
  ShoppingCart,
  ArrowLeftRight,
} from "lucide-react";

import {
  Dna,
  Export,
  SealCheck,
  TwitterLogo,
  DiscordLogo,
  InstagramLogo,
} from "@phosphor-icons/react";
import Link from "next/link";
import millify from "millify";
import Image from "next/image";
import Footer from "@components/footer";
import NFTCard from "@components/nft-card";
import { Icons } from "@components/common";
import { useApp } from "@contexts/AppContext";
import { Accordion, AccordionItem } from "@szhsin/react-accordion";
import { useQuery } from "@tanstack/react-query";
import getNFT from "@app/libs/getNFT";
import { constrictAddress } from "@helpers/wallet";
import { convertToIpfsLink } from "@helpers/links";
import getNFTs from "@app/libs/getNFTs";
import useAppModal from "@hooks/useAppModal";
import OfferModal from "./components/OfferModal";
import { useAccount } from "@contexts/AccountContext";

interface NFTDetailsProps {
  params: {
    id: string;
    taxon: string;
    issuer: string;
  };
}

const NFTDetails = ({ params }: NFTDetailsProps) => {
  const { id, issuer, taxon } = params;

  const { isLaptop } = useApp();
  const { account, connectAccount } = useAccount();

  const { data } = useQuery(["nft-details"], () => getNFT(id));
  const { data: nfts } = useQuery(["nft-collection"], () =>
    getNFTs(issuer, taxon, 0, "", 6)
  );

  const [OfferModalContainer, closeModal, openModal] = useAppModal();

  return (
    <>
      <OfferModalContainer modalClassname="sm">
        <OfferModal nftData={data} closeModal={closeModal} />
      </OfferModalContainer>

      <div className="nft-details">
        <div className="nft-details__content">
          <div className="nft-details__content__block">
            {isLaptop && (
              <div className="nft-details__info">
                <div className="collection-owner">
                  <div className="collection-name">
                    <p>{data?.collection?.name}</p>
                    <SealCheck size={14} weight="fill" color="#4588FF" />
                  </div>

                  <div className="owner">
                    <div className="owner-details">
                      <div className="owner-details__avatar">
                        <Image
                          alt="image"
                          src={
                            data?.image_url ??
                            convertToIpfsLink(data?.uri) ??
                            ""
                          }
                          width={30}
                          height={30}
                        />
                      </div>

                      <div className="owner-details__name">
                        <p className="label">Owned by</p>

                        <Link
                          href={`/${data?.owner?.address}`}
                          className="address-link"
                          target="_self"
                        >
                          {constrictAddress(data?.owner?.address)}
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="name">
                  <p>{data?.name}</p>
                </div>
              </div>
            )}

            <div className="nft-details__image">
              <Image
                alt="image"
                src={data?.image_url ?? convertToIpfsLink(data?.uri) ?? ""}
                width={400}
                height={400}
              />
            </div>

            {isLaptop && (
              <div className="make-offer">
                {data?.status === "listed" ? (
                  <>
                    <div className="price-info">
                      <p>Current price</p>
                      <p className="price">
                        {millify(data?.price, {
                          precision: 2,
                        })}
                      </p>
                    </div>

                    <button className="offer-button">Buy now</button>
                  </>
                ) : (
                  <button
                    className="offer-button large"
                    onClick={account ? openModal : connectAccount}
                  >
                    Make Offer
                  </button>
                )}
              </div>
            )}

            <Accordion className="accordion" allowMultiple>
              <AccordionItem
                header={
                  <>
                    <div className="accordion-item-header">
                      <Dna size={17} />
                      <p>Attributes</p>
                    </div>
                    <ChevronDown size={20} className="chevron" />
                  </>
                }
                className="accordion-item"
                panelProps={{ className: "accordion-panel" }}
                buttonProps={{
                  className: ({ isEnter }) =>
                    `accordion-button ${
                      isEnter ? "accordion-button-expanded" : ""
                    }`,
                }}
                contentProps={{ className: "accordion-content" }}
              >
                <div className="accordion-table">
                  <div className="accordion-table__row header">
                    <div className="accordion-table__row-cell">
                      <p>Traits</p>
                    </div>
                    <div className="accordion-table__row-cell">
                      <p>Attributes</p>
                    </div>
                  </div>

                  {data?.attributes?.map((item: any, index: number) => {
                    return (
                      <div
                        key={item?.key + index}
                        className="accordion-table__row"
                      >
                        <div className="accordion-table__row-cell">
                          <p className="label">{item?.key}</p>
                        </div>
                        <div className="accordion-table__row-cell">
                          <p>{item?.value}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </AccordionItem>

              <AccordionItem
                header={
                  <>
                    <div className="accordion-item-header">
                      <BadgeInfo size={16} strokeWidth={1.7} />
                      <p>Collection Details</p>
                    </div>
                    <ChevronDown size={20} className="chevron" />
                  </>
                }
                className="accordion-item"
                panelProps={{ className: "accordion-panel" }}
                buttonProps={{
                  className: ({ isEnter }) =>
                    `accordion-button ${
                      isEnter ? "accordion-button-expanded" : ""
                    }`,
                }}
                contentProps={{ className: "accordion-content" }}
              >
                <div className="accordion-body">
                  <div className="collection-header__content--details accordion-view">
                    <div className="collection-header__content--description">
                      <p>{data?.collection?.description}</p>
                    </div>

                    <div
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        justifyContent: "space-between",
                      }}
                    >
                      <div className="collection-stats">
                        <div className="stat">
                          <div className="value">
                            <p>
                              {millify(data?.collection?.floor_price, {
                                precision: 2,
                              })}
                            </p>
                            <Icons.XRP size={18} />
                          </div>
                          <div className="label">Floor Price</div>
                        </div>

                        <div className="stat">
                          <div className="value">
                            <Link
                              href={`/${data?.collection?.issuer?.address}`}
                              className="address-link"
                              target="_self"
                            >
                              {constrictAddress(
                                data?.collection?.issuer?.address
                              )}
                            </Link>
                          </div>
                          <div className="label">Created By</div>
                        </div>
                      </div>

                      <div className="collection-info">
                        <div className="media">
                          <div className="social-links">
                            {data?.collection?.instagram_link && (
                              <a
                                href={data?.collection?.instagram_link}
                                target="_blank"
                              >
                                <InstagramLogo size={18} weight="fill" />
                              </a>
                            )}
                            {data?.collection?.twitter_link && (
                              <a
                                href={data?.collection?.twitter_link}
                                target="_blank"
                              >
                                <TwitterLogo size={18} weight="fill" />
                              </a>
                            )}
                            {data?.collection?.discord_link && (
                              <a
                                href={data?.collection?.discord_link}
                                target="_blank"
                              >
                                <DiscordLogo size={18} weight="fill" />
                              </a>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </AccordionItem>

              <AccordionItem
                header={
                  <>
                    <div className="accordion-item-header">
                      <ScrollText size={16} strokeWidth={1.6} />
                      <p>Token Details</p>
                    </div>
                    <ChevronDown size={20} className="chevron" />
                  </>
                }
                className="accordion-item"
                panelProps={{ className: "accordion-panel" }}
                buttonProps={{
                  className: ({ isEnter }) =>
                    `accordion-button ${
                      isEnter ? "accordion-button-expanded" : ""
                    }`,
                }}
                contentProps={{ className: "accordion-content" }}
              >
                <div className="accordion-body">
                  {["token_identifier", "status"].map((item: string, index) => {
                    return (
                      <div key={index} className="accordion-body__list-item">
                        <p className="label">{item.split("_").join(" ")}</p>
                        <p>{data?.[item]}</p>
                      </div>
                    );
                  })}
                </div>
              </AccordionItem>
            </Accordion>
          </div>

          <div className="nft-details__content__block">
            {!isLaptop && (
              <div className="nft-details__info">
                <div className="collection-owner">
                  <div className="collection-name">
                    <p>{data?.collection?.name}</p>
                    <SealCheck size={14} weight="fill" color="#4588FF" />
                  </div>

                  <div className="owner">
                    <div className="owner-details">
                      <div className="owner-details__avatar">
                        <Image
                          alt="image"
                          src={
                            data?.image_url ??
                            convertToIpfsLink(data?.uri) ??
                            ""
                          }
                          width={30}
                          height={30}
                        />
                      </div>

                      <div className="owner-details__name">
                        <p className="label">Owned by</p>
                        <Link
                          href={`/${data?.owner?.address}`}
                          className="address-link"
                          target="_self"
                        >
                          {constrictAddress(data?.owner?.address)}
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="name">
                  <p>{data?.name}</p>
                </div>

                <div className="make-offer">
                  {data?.status === "listed" ? (
                    <>
                      <div className="price-info">
                        <p>Current price</p>
                        <p className="price">
                          {millify(data?.price, {
                            precision: 2,
                          })}
                        </p>
                      </div>

                      <button className="offer-button">Buy now</button>
                    </>
                  ) : (
                    <button
                      className="offer-button large"
                      onClick={account ? openModal : connectAccount}
                    >
                      Make Offer
                    </button>
                  )}
                </div>
              </div>
            )}

            <Accordion className="accordion" allowMultiple>
              <AccordionItem
                header={
                  <>
                    <div className="accordion-item-header">
                      <ListTree size={16} strokeWidth={1.8} />
                      <p>Offers</p>
                    </div>
                    <ChevronDown size={20} className="chevron" />
                  </>
                }
                className="accordion-item"
                panelProps={{ className: "accordion-panel" }}
                buttonProps={{
                  className: ({ isEnter }) =>
                    `accordion-button ${
                      isEnter ? "accordion-button-expanded" : ""
                    }`,
                }}
                contentProps={{ className: "accordion-content" }}
              >
                <div className="accordion-table">
                  <div className="accordion-table__row header offers">
                    <div className="accordion-table__row-cell">
                      <p>Price</p>
                    </div>
                    <div className="accordion-table__row-cell">
                      <p>Quantity</p>
                    </div>
                    <div className="accordion-table__row-cell">
                      <p>Time Left</p>
                    </div>
                    <div className="accordion-table__row-cell">
                      <p>From</p>
                    </div>
                  </div>

                  {data?.nft_offers?.map((item: any, index: number) => {
                    return (
                      <div key={index} className="accordion-table__row offers">
                        <div className="accordion-table__row-cell">
                          <p>0.0045XRP</p>
                          <p className="label">$40.25</p>
                        </div>
                        <div className="accordion-table__row-cell">
                          <p>1</p>
                        </div>
                        <div className="accordion-table__row-cell">
                          <p>30m:46s</p>
                        </div>
                        <div className="accordion-table__row-cell">
                          <Link
                            href={"/rESpzZBNNvkATcCmcxXfXZyyWDE1D3DuMJ"}
                            className="address-link"
                            target="_self"
                          >
                            rhAf...Gu6J
                          </Link>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </AccordionItem>

              <AccordionItem
                header={
                  <>
                    <div className="accordion-item-header">
                      <Activity size={16} strokeWidth={1.8} />
                      <p>Activity</p>
                    </div>
                    <ChevronDown size={20} className="chevron" />
                  </>
                }
                className="accordion-item"
                panelProps={{ className: "accordion-panel" }}
                buttonProps={{
                  className: ({ isEnter }) =>
                    `accordion-button ${
                      isEnter ? "accordion-button-expanded" : ""
                    }`,
                }}
                contentProps={{ className: "accordion-content" }}
              >
                <div className="nft-activity">
                  {["August 8, 2023", "August 1, 2023"].map((date, index) => {
                    return (
                      <div key={index} className="nft-activity__day">
                        <div className="nft-activity__day-date">{date}</div>

                        <div className="nft-activity__day-items">
                          {["transfer", "mint", "list", "sale"].map(
                            (item, index) => {
                              return (
                                <div
                                  key={index}
                                  className="nft-activity__day-item"
                                >
                                  <div className="details">
                                    <div className="details__icon">
                                      {item === "transfer" ? (
                                        <ArrowLeftRight
                                          size={14}
                                          strokeWidth={1.5}
                                        />
                                      ) : item === "mint" ? (
                                        <Sparkles size={14} strokeWidth={1.7} />
                                      ) : item === "list" ? (
                                        <Tag size={14} strokeWidth={1.7} />
                                      ) : (
                                        <ShoppingCart
                                          size={14}
                                          strokeWidth={1.7}
                                        />
                                      )}
                                    </div>
                                    <div className="details__text">
                                      <p>{item}</p>
                                      <p className="label">05:18 pm</p>
                                    </div>
                                  </div>

                                  <div className="txn-price">
                                    <p>4.5 XRP</p>
                                  </div>

                                  <div className="txn-details">
                                    <div className="txn-details__item">
                                      <p className="label">From</p>
                                      <Link
                                        href={
                                          "/rESpzZBNNvkATcCmcxXfXZyyWDE1D3DuMJ"
                                        }
                                        className="address-link"
                                        target="_self"
                                      >
                                        rhAf...Gu6J
                                      </Link>
                                    </div>
                                    <div className="txn-details__item">
                                      <p className="label">To</p>
                                      <Link
                                        href={
                                          "/rESpzZBNNvkATcCmcxXfXZyyWDE1D3DuMJ"
                                        }
                                        className="address-link"
                                        target="_self"
                                      >
                                        rBc2...kI9E
                                      </Link>
                                    </div>
                                  </div>
                                </div>
                              );
                            }
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </AccordionItem>
            </Accordion>
          </div>
        </div>
      </div>

      <>
        <div className="nft-details__other-items">
          <div className="nft-details__other-items__header">
            <p>More from this collection 🔥</p>
          </div>

          <div className="nft-grid">
            {nfts?.map((item: any, index: number) => (
              <NFTCard key={index} item={item} taxon={taxon} issuer={issuer} />
            ))}
          </div>
        </div>

        <Footer />
      </>
    </>
  );
};

export default NFTDetails;
