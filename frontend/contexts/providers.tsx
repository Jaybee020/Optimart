"use client";

import { useState } from "react";
import AppProvider from "./AppContext";
import AccountProvider from "./AccountContext";
import { QueryClientProvider, QueryClient } from "@tanstack/react-query";
import { ReactQueryStreamedHydration } from "@tanstack/react-query-next-experimental";

interface ProvidersProps {
  children: React.ReactElement | React.ReactElement[];
}

export function Providers({ children }: ProvidersProps) {
  const [client] = useState(new QueryClient());

  return (
    <QueryClientProvider client={client}>
      <ReactQueryStreamedHydration>
        <AccountProvider>
          <AppProvider>{children}</AppProvider>
        </AccountProvider>
      </ReactQueryStreamedHydration>
    </QueryClientProvider>
  );
}
