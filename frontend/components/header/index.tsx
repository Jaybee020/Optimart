"use client";

import Link from "next/link";
import { BlockNine } from "@icon-park/react";
import { useApp } from "@contexts/AppContext";
import { Icons, NavSearchbar } from "@components/common";
import { ChevronDown, LogOut, WalletCards } from "lucide-react";
import { DotsThreeVertical, MagnifyingGlass } from "@phosphor-icons/react";
import Image from "next/image";
import { useAccount } from "@contexts/AccountContext";
import { constrictAddress } from "@helpers/wallet";
import useAppMenu from "@hooks/useAppMenu";
import { useEffect } from "react";
import { Menu, MenuItem } from "@szhsin/react-menu";

interface HeaderProps {
  showSearchbar?: boolean;
}
const Header = ({ showSearchbar = true }: HeaderProps) => {
  const { isTablet } = useApp();
  const { account, connectAccount, disconnectAccount } = useAccount();

  return (
    <header>
      <div className="header-content">
        <Link href="/" className="app-logo">
          <Icons.AppLogo size={23} />
        </Link>

        <>
          {showSearchbar && <>{!isTablet && <NavSearchbar />}</>}

          <div className="header-configs">
            {isTablet && (
              <button className="menu-button">
                <MagnifyingGlass size={16} weight="bold" />
              </button>
            )}

            {!account ? (
              <>
                {isTablet ? (
                  <button onClick={connectAccount} className="menu-button">
                    <WalletCards size={18} />
                  </button>
                ) : (
                  <button
                    onClick={connectAccount}
                    className="wallet-connect-btn"
                  >
                    <p>Connect Wallet</p>
                  </button>
                )}
              </>
            ) : (
              <div className="dropdowns">
                <div className="app-menu">
                  <Menu
                    gap={6}
                    data-full
                    transition
                    align="end"
                    direction="bottom"
                    menuClassName="app-menu__items sm"
                    menuButton={
                      <button className="dropdown account">
                        <div className="avatar">
                          <Image
                            alt="image"
                            src="https://i.seadn.io/gcs/files/b8750898e2dbb946dec0786412ae2c28.png?auto=format&dpr=1&w=3840"
                            width={100}
                            height={100}
                          />
                        </div>
                        {!isTablet && (
                          <>
                            <p>{account && constrictAddress(account, 4, 4)}</p>
                            <ChevronDown size={12} strokeWidth={3} />
                          </>
                        )}
                      </button>
                    }
                    className="app-menu__container"
                  >
                    <MenuItem
                      value={"disconnect"}
                      className="menu-item sm"
                      onClick={e => disconnectAccount()}
                    >
                      <LogOut size={14} />
                      <p>Disconnect</p>
                    </MenuItem>
                  </Menu>
                </div>
              </div>
            )}

            <button className="menu-button">
              <DotsThreeVertical size={19} weight="bold" />
            </button>
          </div>
        </>
      </div>
    </header>
  );
};

export default Header;
