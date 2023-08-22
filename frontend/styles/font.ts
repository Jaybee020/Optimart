import localFont from "next/font/local";

export const neue = localFont({
  src: [
    {
      path: "./fonts/NeueMontreal-Medium.otf",
      weight: "500",
      style: "normal",
    },
    {
      path: "./fonts/NeueMontreal-Regular.otf",
      weight: "400",
      style: "normal",
    },
  ],
});

export const uncut = localFont({
  src: [
    {
      path: "./fonts/Uncut-Sans-Variable.ttf",
      weight: "100 900",
      style: "normal",
    },
  ],
});
