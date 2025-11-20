export default function HeroBanner() {
  return (
    <div className="relative h-96 bg-gradient-to-r from-ak-primary to-ak-secondary text-white">
      <div className="container mx-auto px-4 h-full flex items-center">
        <div className="max-w-2xl">
          <h1 className="text-5xl font-bold mb-4">Fashion for Everyone</h1>
          <p className="text-xl mb-8">
            Discover the latest trends and styles at AkTrendFlare
          </p>
          <a href="/search" className="btn-accent inline-block">
            Shop Now
          </a>
        </div>
      </div>
    </div>
  );
}

