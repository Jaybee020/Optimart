import dayjs from "dayjs";
import "@styles/index.scss";
import { Metadata } from "next";
import { neue } from "@styles/font";

import "@utils/axios";
import duration from "dayjs/plugin/duration";
import isBetween from "dayjs/plugin/isBetween";
import isSameOrBefore from "dayjs/plugin/isSameOrBefore";

import { Providers } from "@contexts/providers";
import Header from "@components/header";

dayjs.extend(duration);
dayjs.extend(isBetween);
dayjs.extend(isSameOrBefore);

export const metadata: Metadata = {
  title: "Optimart",
  description:
    "Optimart - NFT Marketplace built on XRP Ledger. Buy, sell, and discover exclusive digital assets.",
  themeColor: "#111",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={neue.className}>
      <body>
        <Providers>
          <>
            <Header />
            <main className="app-container">{children}</main>
          </>
        </Providers>
      </body>
    </html>
  );
}
