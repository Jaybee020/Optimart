/** @type {import('next').NextConfig} */
const nextConfig = {
  modularizeImports: {
    lodash: {
      transform: "lodash/{{member}}",
    },
  },

  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
        port: "",
        pathname: "**",
      },
      {
        port: "",
        protocol: "https",
        hostname: "i.seadn.io",
      },
      {
        port: "",
        protocol: "https",
        hostname: "marketplace-image.onxrp.com",
      },
    ],
  },

  env: {
    XUMM_API_KEY: process.env.XUMM_API_KEY,
  },

  webpack(config, { isServer }) {
    // shader support
    config.module.rules.push({
      test: /\.(glsl|vs|fs|vert|frag)$/,
      exclude: /node_modules/,
      use: ["raw-loader", "glslify-loader"],
    });

    config.module.rules.push({
      test: /\.fnt$/,
      use: ["file-loader"],
    });

    return config;
  },
};

module.exports = nextConfig;
