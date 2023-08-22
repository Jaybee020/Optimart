import {
  useState,
  useEffect,
  ReactNode,
  useContext,
  useCallback,
  ReactElement,
  createContext,
  useMemo,
} from "react";
import { useAccount } from "./AccountContext";
import { breakpoints } from "@helpers/constants";
import { useSearchParams } from "next/navigation";
import { useWindowWidth } from "@react-hook/window-size/throttled";
import { useInfiniteQuery } from "@tanstack/react-query";
import getNFTs from "@app/libs/getNFTs";

interface AppProviderProps {
  children: ReactElement | ReactElement[] | ReactNode;
}

export type Layout = "grid" | "list";
export type ProfileTab = "collected" | "created" | "activity" | "offers";

interface AppContextProps {
  nfts: any[] | null;
  setCollectionData: (data: any) => void;

  isMobile: boolean;
  isTablet: boolean;
  isLaptop: boolean;
  isDesktop: boolean;

  profileTab: ProfileTab;
  setProfileTab: (tab: ProfileTab) => void;

  minPrice: string;
  maxPrice: string;
  setMinPrice: (min: string) => void;
  setMaxPrice: (max: string) => void;

  filters: any;
  layout: Layout;
  filterState: string;
  initializing: boolean;
  searchProfile: string;
  searchCollection: string;
  toggleFilter: () => void;
  clearFilters: () => void;
  mobileFilterState: string;
  toggleMobileFilter: () => void;
  setLayout: (layout: Layout) => void;
  setSearchProfile: (search: string) => void;
  setSearchCollection: (search: string) => void;
  handlePriceFilter: (min: number, max: number) => void;
  handleFilter: (category: string, option: string, trait?: boolean) => void;
}

const AppContext = createContext<AppContextProps>({} as AppContextProps);

export const useApp = (): AppContextProps => useContext(AppContext);

const AppProvider = ({ children }: AppProviderProps) => {
  const {
    layout,
    setLayout,
    filterState,
    initializing,
    setFilterState,
    mobileFilterState,
    setMobileFilterState,
  } = useAccount();

  useEffect(() => {
    if (initializing) return;
    localStorage.setItem("layout", layout);
    localStorage.setItem("filterState", filterState);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [layout, filterState]);

  const toggleFilter = () =>
    setFilterState(filterState === "open" ? "closed" : "open");
  const toggleMobileFilter = () =>
    setMobileFilterState(mobileFilterState === "open" ? "closed" : "open");

  /**
   * BREAKPOINTS
   */
  const screenWidth = useWindowWidth();
  const [isMobile, setIsMobile] = useState(true);
  const [isTablet, setIsTablet] = useState(true);
  const [isLaptop, setIsLaptop] = useState(true);
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    setIsMobile(screenWidth <= breakpoints.mobile);
    setIsTablet(screenWidth <= breakpoints.tablet);
    setIsLaptop(screenWidth <= breakpoints.laptop);
    setIsDesktop(screenWidth <= breakpoints.xLaptop);
  }, [screenWidth]);

  const [searchProfile, setSearchProfile] = useState("");
  const [searchCollection, setSearchCollection] = useState("");
  const [profileTab, setProfileTab] = useState<ProfileTab>("collected");

  // Collections Page
  const [collectionData, setCollectionData] = useState<any>({
    issuer: "",
    taxon: "",
  });

  const [queryFilters, setQueryFilters] = useState("");

  const { data } = useInfiniteQuery(
    ["collections", collectionData?.issuer ?? "", queryFilters],
    async ({ pageParam }) => {
      const results = await getNFTs(
        collectionData?.issuer,
        collectionData?.taxon,
        pageParam,
        queryFilters ? "&" + queryFilters : ""
      );
      return results;
    },
    {
      getNextPageParam: lastPage => {
        const nextOffset = lastPage?.next
          ? new URL(lastPage.next).searchParams.get("offset")
          : 0;
        return (isNaN(Number(nextOffset)) ? 0 : Number(nextOffset)) + 50;
      },
      enabled: !!collectionData?.issuer && !!collectionData?.taxon,
    }
  );

  const nfts = useMemo(() => {
    return data?.pages?.flatMap(p => p) ?? null;
  }, [data]);

  /**
   * FILTERS LOGIC
   */
  const searchParams = useSearchParams();
  const [filters, setFilters] = useState<any>({});

  const clearFilters = () => setFilters({});

  const handleFilter = (category: string, option: string, trait = false) => {
    setFilters((p: any) => {
      const categoryArr =
        (!trait ? p[category] : p?.attributes?.[category]) ?? [];

      const update = trait
        ? {
            ...p,
            attributes: {
              ...(p?.attributes ?? {}),

              [category]: categoryArr.includes(option)
                ? categoryArr?.filter((o: string) => o !== option)
                : [...categoryArr, option],
            },
          }
        : {
            ...p,
            [category]: categoryArr.includes(option)
              ? categoryArr?.filter((o: string) => o !== option)
              : [...categoryArr, option],
          };

      if (trait) {
        if (update.attributes[category].length === 0) {
          delete update.attributes[category];
        }

        if (Object.keys(update.attributes).length === 0) {
          delete update.attributes;
        }
      } else if (update[category].length === 0) {
        delete update[category];
      }

      return update;
    });
  };

  useEffect(() => {
    const validQueries = ["filters", "order", "price"];
    const queries = {} as any;

    for (const [key, value] of searchParams.entries()) {
      if (validQueries.includes(key)) {
        try {
          queries[key] = decodeURIComponent(value);
        } catch (e) {
          // remove invalid query
          updateURL(deleteQueryString(key));
        }
      }
    }

    let filtersQuery = null as any;

    try {
      if (queries.filters) filtersQuery = JSON.parse(queries.filters);
    } catch (e) {}

    try {
      if (filtersQuery?.price) {
        const { minPrice, maxPrice } = filtersQuery.price;
        if (!isNaN(minPrice)) setMinPrice(minPrice);
        if (!isNaN(maxPrice)) setMaxPrice(maxPrice);
      }
    } catch (e) {}

    if (filtersQuery) setFilters(filtersQuery);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const createQueryString = useCallback(
    (name: string, value: string) => {
      //@ts-ignore
      const params = new URLSearchParams(searchParams);
      params.set(name, value);

      return params.toString();
    },
    [searchParams]
  );

  const deleteQueryString = useCallback(
    (name: string) => {
      //@ts-ignore
      const params = new URLSearchParams(searchParams);
      params.delete(name);

      return params.toString();
    },
    [searchParams]
  );

  const updateURL = (params: string) => {
    var currentURL = window.location.href;
    var newURL = currentURL.split("?")[0] + (params ? "?" + params : "");
    history.pushState({}, "", newURL);
  };

  useEffect(() => {
    // console.log(filters);

    if (initializing) return;
    if (Object.keys(filters).length === 0) {
      updateURL(deleteQueryString("filters"));

      setQueryFilters("");
      return;
    }

    const newQuery = new URLSearchParams("");

    if (filters?.price) {
      const { minPrice, maxPrice } = filters.price;
      if (!isNaN(minPrice)) newQuery.set("min_price", minPrice);
      if (!isNaN(maxPrice)) newQuery.set("max_price", maxPrice);
    }

    if (filters?.status) {
      const status = filters?.status?.map((s: string) => s.toLowerCase());

      if (!(status?.includes("listed") && status?.includes("unlisted"))) {
        if (status?.includes("listed")) newQuery.set("status", "listed");
        else if (status?.includes("unlisted"))
          newQuery.set("status", "unlisted");
      }
    }

    if (filters?.attributes) {
      for (const [key, value] of Object.entries(filters.attributes)) {
        console.log(key, value);

        // newQuery.set(`attributes.${key}`, value.join(","));
      }
    }

    setQueryFilters(newQuery.toString());

    updateURL(
      createQueryString("filters", encodeURIComponent(JSON.stringify(filters)))
    );

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters]);

  /**
   * PRICE FILTER LOGIC
   */
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const handlePriceFilter = (min: number, max: number) => {
    setFilters((p: any) => {
      const update = {
        ...p,
        price: {
          ...(isNaN(min) ? {} : { minPrice: min }),
          ...(isNaN(max) ? {} : { maxPrice: max }),
        },
      };

      if (Object.keys(update.price).length === 0) {
        delete update.price;
      }

      return update;
    });
  };

  return (
    <AppContext.Provider
      value={{
        nfts,
        setCollectionData,

        isMobile,
        isTablet,
        isLaptop,
        isDesktop,

        layout,
        filters,
        setLayout,
        filterState,
        toggleFilter,
        handleFilter,
        clearFilters,
        initializing,
        handlePriceFilter,
        mobileFilterState,
        toggleMobileFilter,

        minPrice,
        maxPrice,
        setMinPrice,
        setMaxPrice,

        profileTab,
        setProfileTab,

        searchProfile,
        searchCollection,
        setSearchProfile,
        setSearchCollection,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export default AppProvider;
