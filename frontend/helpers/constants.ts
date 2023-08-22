const breakpoints = {
  mobile: 480,
  tablet: 768,
  laptop: 960,
  xLaptop: 1186,
  desktop: 1440,
};

const timeframeMapping = {
  "24h": "daily_volume",
  "7d": "weekly_volume",
  "30d": "monthly_volume",
  All: "total_volume",
};

export { breakpoints, timeframeMapping };
