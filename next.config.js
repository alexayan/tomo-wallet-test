/** @type {import('next').NextConfig} */
const path = require('path')

module.exports = {
  pageExtensions: ['tsx', 'api.ts'],
  experimental: {
    forceSwcTransforms: true,
  },
  images: {
    // dangerouslyAllowSVG: true,
    // contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    // domains: ['cdn.martianwallet.xyz'],
    unoptimized: true,
  },

  bleClientWebpackPlugin: true,
  webpack(config, {isServer}) {
    config.resolve.alias['@'] = path.resolve(`${__dirname}/src/`)

    config.module.rules.push({
      test: /\.svg$/i,
      issuer: /\.[jt]sx?$/,
      use: [
        {
          loader: '@svgr/webpack',
          options: {
            svgoConfig: {
              plugins: [
                {
                  name: 'prefixIds',
                  active: false,
                },
              ],
            },
          },
        },
        { loader: 'url-loader' },
      ],
    })

    return config
  },
}
