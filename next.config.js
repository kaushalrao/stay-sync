const nextConfig = {
  output: process.env.IS_MOBILE_BUILD ? 'export' : undefined,
  // Optional: Needed if you use <Image /> component in static export
  images: {
    unoptimized: true,
  }
};

export default nextConfig;