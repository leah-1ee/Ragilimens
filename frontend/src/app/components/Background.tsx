export function Background() {
  return (
    <div className="fixed inset-0 -z-10">
      {/* Harry Potter dark navy gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#0a0e27] via-[#1a1d3a] to-[#0a0e27]" />

      {/* Optional: Add Hogwarts castle or magical background image here */}
      {/* <div className="absolute inset-0 opacity-20">
        <img
          src="/src/imports/hogwarts-background.jpg"
          alt="Hogwarts Background"
          className="w-full h-full object-cover"
        />
      </div> */}

      {/* Magical stars/sparkles effect */}
      <div className="absolute inset-0 opacity-10">
        <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="stars" width="80" height="80" patternUnits="userSpaceOnUse">
              <circle cx="10" cy="10" r="1" fill="#d4af37" opacity="0.5"/>
              <circle cx="50" cy="30" r="0.5" fill="#f4c430" opacity="0.7"/>
              <circle cx="70" cy="60" r="1.5" fill="#d4af37" opacity="0.4"/>
              <circle cx="30" cy="70" r="0.8" fill="#f4c430" opacity="0.6"/>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#stars)" />
        </svg>
      </div>

      {/* Golden border overlay for edges */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#d4af37] to-transparent opacity-30" />
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#d4af37] to-transparent opacity-30" />
      </div>
    </div>
  );
}
