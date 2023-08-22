"use client";

import React, { useEffect, useRef, useState } from "react";

interface TabswitchProps {
  responsive?: boolean;
  buttonHeight?: number;
  tabs: React.ReactNode[];
}

const Tabswitch = ({
  tabs,
  buttonHeight = 40,
  responsive = false,
}: TabswitchProps) => {
  const tabswitchRef = useRef<HTMLDivElement>(null);
  const [activeTab, setActiveTab] = useState(tabs[0]);

  useEffect(() => {
    setActiveTab(tabs[0]);
  }, [tabs]);

  // const [activeTabLeft, setActiveTabLeft] = useState(0);
  // const [activeTabWidth, setActiveTabWidth] = useState(0);

  // useEffect(() => {
  //   const activeTabElement = tabswitchRef.current?.querySelector(".active");
  //   const activeTabWidth = activeTabElement?.getBoundingClientRect().width;

  //   const tabswitchLeft =
  //     tabswitchRef.current?.getBoundingClientRect().left ?? 0;
  //   const activeTabLeft = activeTabElement?.getBoundingClientRect().left ?? 0;
  //   const relativeLeft = activeTabLeft - tabswitchLeft;

  //   setActiveTabLeft(relativeLeft);
  //   setActiveTabWidth(activeTabWidth ?? 0);
  // }, [activeTab]);

  return (
    <div className="tabswitch sticky" ref={tabswitchRef}>
      {tabs.map((tab, index) => {
        return (
          <button
            key={index}
            onClick={() => setActiveTab(tab)}
            className={`tab ${activeTab === tab ? "active" : ""} ${
              responsive ? "responsive" : ""
            }`}
            style={{ height: buttonHeight + "px" }}
          >
            {tab}
          </button>
        );
      })}

      {/* <div
        className={`active-tab ${responsive ? "responsive" : ""}`}
        style={{
          width: activeTabWidth,
          left: activeTabLeft,
          height: buttonHeight + "px",
        }}
      /> */}
    </div>
  );
};

export default Tabswitch;
