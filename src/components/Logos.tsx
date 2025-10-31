const Logos = () => {
  const topRowCompanies = [
    {
      name: "Google Maps",
      logo: "https://deifkwefumgah.cloudfront.net/shadcnblocks/block/mainline/logos/mercury.svg",
      width: 143,
      height: 26,
      href: "https://maps.google.com",
    },
    {
      name: "GetAmbee",
      logo: "https://deifkwefumgah.cloudfront.net/shadcnblocks/block/mainline/logos/watershed.svg",
      width: 154,
      height: 31,
      href: "https://getambee.com",
    },
    {
      name: "Firebase",
      logo: "https://deifkwefumgah.cloudfront.net/shadcnblocks/block/mainline/logos/retool.svg",
      width: 113,
      height: 22,
      href: "https://firebase.google.com",
    },
    {
      name: "Flask API",
      logo: "https://deifkwefumgah.cloudfront.net/shadcnblocks/block/mainline/logos/descript.svg",
      width: 112,
      height: 27,
      href: "https://flask.palletsprojects.com",
    },
  ];

  const bottomRowCompanies = [
    {
      name: "React",
      logo: "https://deifkwefumgah.cloudfront.net/shadcnblocks/block/mainline/logos/perplexity.svg",
      width: 141,
      height: 32,
      href: "https://react.dev",
    },
    {
      name: "Tailwind",
      logo: "https://deifkwefumgah.cloudfront.net/shadcnblocks/block/mainline/logos/monzo.svg",
      width: 104,
      height: 18,
      href: "https://tailwindcss.com",
    },
    {
      name: "Framer",
      logo: "https://deifkwefumgah.cloudfront.net/shadcnblocks/block/mainline/logos/ramp.svg",
      width: 105,
      height: 28,
      href: "https://framer.com/motion",
    },
    {
      name: "Netlify",
      logo: "https://deifkwefumgah.cloudfront.net/shadcnblocks/block/mainline/logos/raycast.svg",
      width: 128,
      height: 33,
      href: "https://netlify.com",
    },
    {
      name: "Render",
      logo: "https://deifkwefumgah.cloudfront.net/shadcnblocks/block/mainline/logos/arc.svg",
      width: 90,
      height: 28,
      href: "https://render.com",
    },
  ];

  return (
    <section className="py-32 mx-auto pt-0">
      <div className="container mx-auto space-y-10 lg:space-y-16">
        <div className="text-center">
          <h2 className="mb-4 text-xl  text-balance md:text-2xl lg:text-4xl">
            Powered by industry-leading technology
            <br className="max-md:hidden" />
            <span className="text-muted-foreground">
              Built with real-time APIs and modern web infrastructure.
            </span>
          </h2>
        </div>

        <div className="flex w-full flex-col items-center gap-8">
          {/* Top row - 4 logos */}
          <div className="grid grid-cols-2 items-center justify-items-center gap-x-12 gap-y-8 max-md:w-full sm:grid-cols-4 md:gap-x-20 lg:gap-x-28">
            {topRowCompanies.map((company, index) => (
              <a href={company.href} target="_blank" key={index}>
                <img
                  src={company.logo}
                  alt={`${company.name} logo`}
                  width={company.width}
                  height={company.height}
                  className="object-contain transition-opacity hover:opacity-70"
                />
              </a>
            ))}
          </div>

          {/* Bottom row - 5 logos */}
          <div className="grid grid-cols-2 items-center justify-items-center gap-x-12 gap-y-8 max-md:w-full sm:grid-cols-5 md:gap-x-20 lg:gap-x-28">
            {bottomRowCompanies.map((company, index) => (
              <a href={company.href} target="_blank" key={index}>
                <img
                  src={company.logo}
                  alt={`${company.name} logo`}
                  width={company.width}
                  height={company.height}
                  className="object-contain transition-opacity hover:opacity-70"
                />
              </a>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export { Logos };