import type { NextConfig } from "next"

const nextConfig: NextConfig = {
    async rewrites() {
        return [
            {
                // Any request to /api/* is forwarded to the backend
                source: "/api/:path*",
                destination: `${process.env.API_BASE_URL}/:path*`,
            },
        ]
    },
}

export default nextConfig

