import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

import { organizationApi, getLogoUrl } from "../api/Organizationapi";

const OrganizationContext = createContext(null);

// Shown until a company name / logo is saved in Settings > Organization
const FALLBACK_NAME = import.meta.env.VITE_APP_NAME || "CRM";
const FALLBACK_LOGO = "/logo.svg";

export function OrganizationProvider({ children }) {
  const [data, setData] = useState({
    companyName: "",
    hasLogo: false,
    logoVersion: null,
  });
  const [loaded, setLoaded] = useState(false);

  const apply = useCallback((result) => {
    setData({
      companyName: result.companyName || "",
      hasLogo: Boolean(result.hasLogo),
      logoVersion: result.logoVersion ?? null,
    });
  }, []);

  const refresh = useCallback(
    () =>
      organizationApi
        .get()
        .then(apply)
        .catch((err) => {
          // Branding is cosmetic - keep the fallbacks if the API is unreachable
          console.error("Failed to load organization details:", err);
        })
        .finally(() => setLoaded(true)),
    [apply]
  );

  useEffect(() => {
    let cancelled = false;

    organizationApi
      .get()
      .then((result) => {
        if (!cancelled) apply(result);
      })
      .catch((err) => {
        console.error("Failed to load organization details:", err);
      })
      .finally(() => {
        if (!cancelled) setLoaded(true);
      });

    return () => {
      cancelled = true;
    };
  }, [apply]);

  const value = useMemo(() => {
    const customLogoUrl = data.hasLogo ? getLogoUrl(data.logoVersion) : null;

    return {
      loaded,
      savedCompanyName: data.companyName, // may be "" (what the settings form edits)
      companyName: data.companyName || FALLBACK_NAME, // what the UI displays
      hasCustomLogo: Boolean(customLogoUrl),
      customLogoUrl,
      logoUrl: customLogoUrl || FALLBACK_LOGO,
      refresh,
      apply,
    };
  }, [data, loaded, refresh, apply]);

  return (
    <OrganizationContext.Provider value={value}>
      {children}
    </OrganizationContext.Provider>
  );
}

export function useOrganization() {
  const context = useContext(OrganizationContext);

  if (!context) {
    throw new Error("useOrganization must be used inside an <OrganizationProvider>");
  }

  return context;
}
