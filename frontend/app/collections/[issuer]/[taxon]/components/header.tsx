"use client";

import {
  Export,
  SealCheck,
  TwitterLogo,
  DiscordLogo,
  InstagramLogo,
} from "@phosphor-icons/react";
import millify from "millify";
import Image from "next/image";
import { Icons } from "@components/common";
import { useApp } from "@contexts/AppContext";
import Link from "next/link";
import { constrictAddress } from "@helpers/wallet";

interface CollectionHeaderProps {
  collection: any;
}

const CollectionHeader = ({ collection }: CollectionHeaderProps) => {
  const { isMobile } = useApp();

  return (
    <div className="collection-header">
      <div className="collection-header__banner">
        {collection?.banner_url && (
          <Image
            alt="image"
            width={2000}
            height={400}
            src={collection?.banner_url}
          />
        )}

        <div className="collection-header__banner--dp">
          {collection?.image_url && (
            <Image
              alt="image"
              width={400}
              height={400}
              src={collection?.image_url}
            />
          )}
        </div>
      </div>

      <div className="collection-header__content">
        <div className="collection-header__content--details">
          <div className="collection-info">
            <div className="name">
              <p>{collection?.name}</p>
              <SealCheck size={20} weight="fill" color="#4588FF" />
            </div>

            <div className="media">
              <div className="social-links">
                {collection?.instagram_link && (
                  <a href={collection?.instagram_link} target="_blank">
                    <InstagramLogo size={18} weight="fill" />
                  </a>
                )}
                {collection?.twitter_link && (
                  <a href={collection?.twitter_link} target="_blank">
                    <TwitterLogo size={18} weight="fill" />
                  </a>
                )}
                {collection?.discord_link && (
                  <a href={collection?.discord_link} target="_blank">
                    <DiscordLogo size={18} weight="fill" />
                  </a>
                )}

                <a href="#" target="_blank">
                  <Export size={18} weight="bold" />
                </a>
              </div>

              <div className="media-block">
                <p>
                  Items <span>&nbsp;•&nbsp; 10k</span>
                </p>

                {/* <div>
                  Created by <span>&nbsp;&nbsp;•&nbsp;&nbsp;</span>
                  <Link
                    href={`/${collection?.issuer?.address}`}
                    className="address-link"
                    target="_self"
                  >
                    {constrictAddress(collection?.issuer?.address)}
                  </Link>
                </div> */}
              </div>
            </div>
          </div>

          {isMobile ? (
            <>
              <div className="collection-header__content--description">
                <p>{collection?.description}</p>
              </div>
            </>
          ) : null}

          <div className="collection-stats">
            <div className="stat">
              <div className="value">
                <p>
                  {millify(collection?.total_volume, {
                    precision: 1,
                  })}
                </p>
                <Icons.XRP size={18} />
              </div>
              <div className="label">Total Volume</div>
            </div>

            <div className="stat">
              <div className="value">
                <p>
                  {millify(collection?.floor_price, {
                    precision: 1,
                  })}
                </p>
                <Icons.XRP size={18} />
              </div>
              <div className="label">Floor Price</div>
            </div>

            <div
              className="stat"
              style={{
                alignItems: "center",
              }}
            >
              <div className="value">
                <Link
                  href={`/${collection?.issuer?.address}`}
                  className="address-link"
                  target="_self"
                >
                  {constrictAddress(collection?.issuer?.address)}
                </Link>
              </div>
              <div className="label">Created By</div>
            </div>
          </div>
        </div>

        {!isMobile ? (
          <>
            <div className="collection-header__content--description">
              <p>{collection?.description}</p>
            </div>
          </>
        ) : null}
      </div>
    </div>
  );
};

export default CollectionHeader;
