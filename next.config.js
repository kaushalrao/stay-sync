/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  // Optional: Needed if you use <Image /> component in static export
  images: {
    unoptimized: true,
  },
};

export default nextConfig;