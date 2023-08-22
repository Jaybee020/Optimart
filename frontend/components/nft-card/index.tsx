"use client";

import Image from "next/image";
import Link from "next/link";
import millify from "millify";
import { Icons } from "@components/common";
import { ShoppingCartTwo } from "@icon-park/react";
import { convertToIpfsLink } from "@helpers/links";

interface NFTCardProps {
  item: any;
  taxon: string;
  issuer: string;
}

const NFTCard = ({ item, taxon, issuer }: NFTCardProps) => {
  return (
    <Link
      href={`/collections/${issuer}/${taxon}/${item?.token_identifier ?? ""}`}
      className="nft-card"
    >
      <div className="nft-card__media">
        <div className="rank">
          <p>{item?.sequence}</p>
        </div>
        <Image
          alt="image"
          src={item?.image_url ?? convertToIpfsLink(item?.uri ?? "") ?? ""}
          width={400}
          height={400}
        />
      </div>

      <div className="nft-card__content">
        <p className="nft-card__content--title">{item?.name}</p>

        <div className="collection-header__content--details">
          <div className="nft-card__content--price">
            <Icons.XRP2 size={18} />
            <p>
              {millify(item?.price, {
                precision: 2,
              })}
            </p>
          </div>

          {/* <button className="buy-now-button">
            <p>Buy Now</p>
            <ShoppingCartTwo size={15} />
          </button> */}
        </div>
      </div>
    </Link>
  );
};

export default NFTCard;
