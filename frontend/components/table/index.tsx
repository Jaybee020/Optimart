"use client";

import React from "react";
import Link from "next/link";
import millify from "millify";
import Image from "next/image";
import { Icons } from "@components/common";
import { useRouter } from "next/navigation";
import { CollectionTableLabel } from "@typings";
import { constrictAddress } from "@helpers/wallet";
import { convertToIpfsLink } from "@helpers/links";
import { Tag, Sparkles, ShoppingCart, ArrowLeftRight } from "lucide-react";

interface Item {
  [key: string]: any;
}

interface AppTableProps {
  data: Item[];
  tableType?: string;
  showLabels?: boolean;
  rowClassName?: string;
  showWatchlistButton?: boolean;
  labels: CollectionTableLabel[];
}

const AppTable = ({
  data,
  labels,
  tableType,
  rowClassName,
  showLabels = true,
  showWatchlistButton = true,
}: AppTableProps) => {
  const linksCells = ["owner"];

  const router = useRouter();

  const openLink = (item: any) => {
    if (item?.issuer?.address)
      router.push(`/collections/${item?.issuer?.address}/${item?.taxon}`, {
        shallow: true,
      });
  };

  return (
    <div className="c-table">
      {showLabels && (
        <div className={`c-table__row labels ${rowClassName ?? ""}`}>
          {labels.map((label, index) => (
            <div
              key={index}
              className={`c-table__row-cell ${label?.type}-cell ${
                label?.headerClassname ?? ""
              }`}
            >
              <p>{label?.label}</p>
            </div>
          ))}
        </div>
      )}

      {data.map((item, index) => (
        <div key={index} className={`c-table__row ${rowClassName ?? ""}`}>
          {labels.map((label, labelIndex) => (
            <div
              key={labelIndex}
              onClick={() => openLink(item)}
              className={`c-table__row-cell ${label?.type}-cell ${
                label?.cellClassname ?? ""
              }`}
            >
              {label.key === "address" ? (
                <Link
                  href={`/${item?.issuer?.address || item?.owner?.address}`}
                  className="address-link"
                  target="_self"
                >
                  {constrictAddress(
                    item?.issuer?.address || item?.owner?.address
                  )}
                </Link>
              ) : label.key === "event" ? (
                <div className="details">
                  <div className="details__icon">
                    {item[label.key] === "transfer" ? (
                      <ArrowLeftRight size={14} strokeWidth={1.5} />
                    ) : item[label.key] === "mint" ? (
                      <Sparkles size={14} strokeWidth={1.7} />
                    ) : item[label.key] === "list" ? (
                      <Tag size={14} strokeWidth={1.7} />
                    ) : (
                      <ShoppingCart size={14} strokeWidth={1.7} />
                    )}
                  </div>
                  <div className="details__text">
                    <p>{item[label.key] ?? "Transfer"}</p>
                    <p className="label">05:18 pm</p>
                  </div>
                </div>
              ) : label?.key === "transfer" ? (
                <div className="txn-details">
                  <div className="txn-details__item">
                    <p className="label">From</p>
                    <Link
                      href={"/rESpzZBNNvkATcCmcxXfXZyyWDE1D3DuMJ"}
                      className="address-link"
                      target="_self"
                    >
                      rhAf...Gu6J
                    </Link>
                  </div>
                  <div className="txn-details__item">
                    <p className="label">To</p>
                    <Link
                      href={"/rESpzZBNNvkATcCmcxXfXZyyWDE1D3DuMJ"}
                      className="address-link"
                      target="_self"
                    >
                      rBc2...kI9E
                    </Link>
                  </div>
                </div>
              ) : (
                <>
                  {label.prefix && tableType !== "activity" && (
                    <p className={label.prefix.className}>
                      #{label?.prefix?.key && item[label?.prefix?.key] + 62}
                    </p>
                  )}
                  {label?.imgKey && (
                    <Image
                      width={30}
                      height={30}
                      src={
                        item[label?.imgKey] ??
                        convertToIpfsLink(item?.uri ?? "") ??
                        ""
                      }
                      alt={item?.collection + " logo"}
                    />
                  )}

                  {label?.format ? (
                    <p>
                      {!isNaN(item[label?.key])
                        ? millify(item[label?.key], { precision: 2 })
                        : item[label?.key]}
                    </p>
                  ) : (
                    <>
                      {linksCells.includes(label?.key) ? (
                        <Link
                          href={"/rESpzZBNNvkATcCmcxXfXZyyWDE1D3DuMJ"}
                          className="address-link"
                          target="_self"
                        >
                          {item[label?.key]}
                        </Link>
                      ) : (
                        <p>{item[label.key]}</p>
                      )}
                    </>
                  )}

                  {label?.icon ? (
                    label?.icon
                  ) : label?.showXrpIcon ? (
                    <Icons.XRP size={13} />
                  ) : null}
                </>
              )}
            </div>
          ))}

          {/* {showWatchlistButton && (
            <div className="c-table__row-cell actions-cell">
              <button className="btn-square">
                <Sparkles size={14} />
              </button>
            </div>
          )} */}
        </div>
      ))}
    </div>
  );
};

export default AppTable;
