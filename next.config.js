/** @type {import('next').NextConfig} */
const nextConfig = {
    output: "standalone",
    reactStrictMode: false, /* @note: To prevent duplicated call of useEffect */
    swcMinify: true,

    async rewrites() {
        return [{
            source: "/api/:path*",
            // Change to your backend URL in production
            // change 
            destination: "https://backend-dev-Capybara.app.secoder.net/:path*",
            // destination: "http://localhost:9099/:path*",
        }];
    }
};

// eslint-disable-next-line no-undef
module.exports = nextConfig;
