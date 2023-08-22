"use client";

import { useState } from "react";
import { Menu, MenuItem } from "@szhsin/react-menu";

interface AppMenuProps {
  full?: boolean;
  children: React.ReactNode;
  position?: "initial" | "auto" | "anchor";
  viewScroll?: "initial" | "auto" | "close";
  direction?: "top" | "bottom" | "left" | "right";
}

const useAppMenu = (defaultOption: any, items: any, setDefault = true) => {
  const [activeOption, setActiveOption] = useState(
    setDefault ? defaultOption || items[0] : ""
  );

  const AppMenu = ({
    children,
    full = true,
    direction = "bottom",
    position = "anchor",
    viewScroll = "auto",
  }: AppMenuProps) => {
    return (
      <div className="app-menu">
        <Menu
          gap={10}
          transition
          align="end"
          key={direction}
          data-full={full}
          position={position}
          direction={direction}
          viewScroll={viewScroll}
          menuClassName="app-menu__items"
          menuButton={children as any}
          className="app-menu__container"
          onItemClick={e => setActiveOption(e.value)}
        >
          {items?.map((slug: any, index: number) => (
            <MenuItem
              data-active={slug === activeOption}
              value={slug}
              key={index}
              className="menu-item"
            >
              <p>{slug}</p>
            </MenuItem>
          ))}
        </Menu>
      </div>
    );
  };

  return [AppMenu, activeOption];
};

export default useAppMenu;
