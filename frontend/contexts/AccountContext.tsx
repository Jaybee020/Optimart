import {
  useState,
  useEffect,
  ReactNode,
  useContext,
  ReactElement,
  createContext,
} from "react";
import { useNetworkState } from "react-use";

import { Xumm } from "xumm";

const xumm = new Xumm(
  process.env.XUMM_API_KEY || "",
  process.env.XUMM_API_SECRET || ""
);

interface AccountProviderProps {
  children: ReactElement | ReactElement[] | ReactNode;
}
export type Layout = "grid" | "list";

export interface AccountContextProps {
  account: string;
  appLoading: boolean;
  connectAccount: () => Promise<void>;
  disconnectAccount: () => Promise<void>;

  makeOffer: (data: any) => Promise<string>;

  layout: Layout;
  filterState: string;
  initializing: boolean;
  mobileFilterState: string;
  setLayout: (layout: Layout) => void;
  setFilterState: (state: string) => void;
  setMobileFilterState: (state: string) => void;
}

const AccountContext = createContext<AccountContextProps>(
  {} as AccountContextProps
);

export const useAccount = (): AccountContextProps => useContext(AccountContext);

const AccountProvider = ({ children }: AccountProviderProps) => {
  const onlineState = useNetworkState();
  const [initializing, setInitializing] = useState(true);
  const [layout, setLayout] = useState<Layout>("grid");
  const [filterState, setFilterState] = useState("open");
  const [mobileFilterState, setMobileFilterState] = useState("closed");

  const [account, setAccount] = useState("");
  const [appName, setAppName] = useState("");
  const [appLoading, setAppLoading] = useState(true);

  const connectAccount = async () => {
    await xumm.authorize();
    if (xumm?.payload) {
      await xumm.payload
        .create({
          TransactionType: "SignIn",
        })
        .then(payload => {
          console.log(payload);
        });
    }
  };
  const disconnectAccount = async () => {
    await xumm.logout();
    setAccount("");
    localStorage.removeItem("account");
  };

  /**
   * STATE PERSIST LOGIC
   */
  useEffect(() => {
    const account = localStorage.getItem("account");
    if (account) setAccount(account);

    const layout = localStorage.getItem("layout");
    const filterState = localStorage.getItem("filterState");
    if (layout) setLayout(layout as Layout);
    if (filterState) setFilterState(filterState);

    setAppLoading(false);
    setInitializing(false);

    xumm.user.account.then(a => {
      if (a) {
        setAccount(a);
        localStorage.setItem("account", a);
      }
    });

    xumm.environment.jwt?.then(async j => {
      setAppName(j?.app_name ?? "");
      const payloadResult = await xumm.payload?.get(j?.payload_uuidv4 || "");
    });
  }, []);

  const makeOffer = async (data: any) => {
    const { nftId, price, sellerAddr, expirationTime } = data;

    // console.log(expirationTime);

    const res = await xumm.payload?.create({
      txjson: {
        // Expiration: expirationTime,

        Flags: 0,
        NFTokenID: nftId,
        Account: account,
        Owner: sellerAddr,
        Amount: String(price),
        TransactionType: "NFTokenCreateOffer",
        Destination: "raBGyPBR8uEW6ZFCFBfesViwzzEme4y2TD",
      },
    });

    return res?.refs?.qr_png ?? "";
  };

  return (
    <AccountContext.Provider
      value={{
        account,
        appLoading,
        connectAccount,
        disconnectAccount,

        makeOffer,

        layout,
        setLayout,
        filterState,
        initializing,
        setFilterState,
        mobileFilterState,
        setMobileFilterState,
      }}
    >
      {children}
    </AccountContext.Provider>
  );
};

export default AccountProvider;
