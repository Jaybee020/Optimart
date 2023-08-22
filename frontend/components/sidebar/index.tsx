"use client";

import {
  Info,
  House,
  Moon,
  GearFine,
  Activity,
  DotsThree,
  Cardholder,
  GooglePlayLogo,
} from "@phosphor-icons/react";
import Link from "next/link";
import { ActiveLink, Icons } from "../common";
import {
  Apple,
  BlockNine,
  BlockOne,
  BlockThree,
  Transfer,
} from "@icon-park/react";

const navlinks = {
  overview: [
    {
      name: "Home",
      link: "/",
      icon: <House size={20} className="sidebar__menu-item-icon" />,
    },
    {
      name: "Accounts",
      link: "/accounts",
      icon: <Cardholder size={20} className="sidebar__menu-item-icon" />,
    },
    {
      name: "Transfer",
      link: "/transfer",
      icon: <Transfer strokeWidth={3.4} theme="outline" size="18" />,
    },
    {
      name: "Activity",
      link: "/activity",
      icon: <Activity size={20} className="sidebar__menu-item-icon" />,
    },
  ],
  system: [
    {
      name: "Settings",
      link: "/settings",
      icon: <GearFine size={20} className="sidebar__menu-item-icon" />,
    },
    {
      name: "Support",
      link: "/support",
      icon: <Info size={19} className="sidebar__menu-item-icon" />,
    },
  ],
};

const Sidebar = () => {
  return (
    <div className="sidebar">
      <Link href="/" className="sidebar__logo">
        <div className="logo-icon">
          {/* <BlockThree size={15} theme="filled" strokeWidth={0.1} /> */}
          <BlockNine size={15} theme="filled" strokeWidth={0.1} />
        </div>

        <h1>
          blockthrift <span>.</span>
        </h1>
      </Link>

      <div className="sidebar__menu">
        <p className="sidebar__menu-header">Overview</p>
        <ul>
          {navlinks.overview.map((item, index) => {
            return (
              <li key={index}>
                <ActiveLink
                  href={item?.link + ""}
                  className="sidebar__menu-item"
                  activeClassName="sidebar__menu-item--active"
                >
                  {item?.icon}
                  <p>{item?.name}</p>
                </ActiveLink>
              </li>
            );
          })}
        </ul>

        <p className="sidebar__menu-header">System</p>
        <ul>
          {navlinks.system.map((item, index) => {
            return (
              <li key={index}>
                <ActiveLink
                  href={item?.link + ""}
                  className="sidebar__menu-item"
                  activeClassName="sidebar__menu-item--active"
                >
                  {item?.icon}
                  <p>{item?.name}</p>
                </ActiveLink>
              </li>
            );
          })}
        </ul>
        <div className="theme-switch">
          <div className="label">
            <Moon size={19} className="sidebar__menu-item-icon" />
            <p>Dark Mode</p>
          </div>

          <button>
            <DotsThree
              weight="bold"
              size={19}
              className="sidebar__menu-item-icon"
            />
          </button>
        </div>
      </div>

      <div className="sidebar__footer">
        <ul>
          <li>
            <Link href="https://github.com/codergon" target="_blank">
              <p>Privacy Policy</p>
            </Link>
          </li>
          <li>
            <Link href="https://github.com/codergon" target="_blank">
              <p>Terms of Service</p>
            </Link>
          </li>
        </ul>

        <button className="c-button">
          <p>Download App</p>
          <Apple theme="filled" size="16" />
          <GooglePlayLogo size={15} weight="fill" />
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
