export default function CommunityIllustration() {
  return <svg viewBox="0 0 360 230" fill="none" aria-hidden="true" className="community-illustration">
    <defs>
      <pattern id="community-grid" width="36" height="36" patternUnits="userSpaceOnUse"><path d="m18 2 5 11 11 5-11 5-5 11-5-11L2 18l11-5Z" stroke="currentColor" strokeWidth=".65" /></pattern>
      <clipPath id="community-arch"><path d="M68 230V128C68 72 111 35 180 10c69 25 112 62 112 118v102Z" /></clipPath>
    </defs>
    <path d="M36 230V123C36 59 91 14 180-15c89 29 144 74 144 138v107" stroke="#87a994" strokeOpacity=".24" />
    <path d="M68 230V128C68 72 111 35 180 10c69 25 112 62 112 118v102Z" fill="#28634e" />
    <g clipPath="url(#community-arch)" color="#90b69b"><rect x="68" width="224" height="230" fill="url(#community-grid)" opacity=".26" /></g>
    <path d="M100 230v-93c0-42 31-71 80-95 49 24 80 53 80 95v93Z" fill="#123f30" stroke="#a1b49b" strokeOpacity=".4" />
    <path d="M126 230v-86c0-29 20-52 54-72 34 20 54 43 54 72v86Z" fill="#1c5140" stroke="#dfc595" strokeWidth="1.2" />
    <path d="M149 230v-81c0-18 11-34 31-49 20 15 31 31 31 49v81Z" fill="#dfc595" fillOpacity=".12" />
    <path d="M180 116v114M149 170h62M149 196h62" stroke="#dfc595" strokeOpacity=".3" strokeWidth=".8" />
    <path d="m41 85 2.5 6.5L50 94l-6.5 2.5L41 103l-2.5-6.5L32 94l6.5-2.5ZM309 48l2.5 6.5L318 57l-6.5 2.5L309 66l-2.5-6.5L300 57l6.5-2.5Z" fill="#dfc595" />
    <circle cx="303" cy="154" r="2" fill="#dfc595" /><circle cx="57" cy="180" r="2" fill="#dfc595" />
    <path d="M18 229h324" stroke="#b0c2ad" strokeOpacity=".4" />
  </svg>;
}
