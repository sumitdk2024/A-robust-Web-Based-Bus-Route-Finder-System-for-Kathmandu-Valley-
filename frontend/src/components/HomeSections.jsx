import Icon from './Icon.jsx';

function MountainIllustration() {
  return <svg className="mountain-art" viewBox="0 0 540 255" fill="none" aria-hidden="true" focusable="false">
    <defs><linearGradient id="mountain-sky" x1="270" y1="0" x2="270" y2="255" gradientUnits="userSpaceOnUse"><stop stopColor="#E8F1F5"/><stop offset="1" stopColor="#FAF8F4"/></linearGradient></defs>
    <path d="M35 238V97C35 42 106 8 246 8c143 0 255 57 255 136v94Z" fill="url(#mountain-sky)"/>
    <circle cx="408" cy="58" r="23" fill="#B9233D" opacity=".85"/>
    <path d="M49 180 147 65l51 55L278 21l109 123 51-59 80 117Z" fill="#C7DBE4"/>
    <path d="m147 65-27 32 27-8 15 12 13-5Zm131-44-39 49 30-13 17 17 17-7Z" fill="#FAF8F4"/>
    <path d="m8 226 115-99 71 58L306 80l121 128 60-35 52 66Z" fill="#8CB8BD"/>
    <path d="m306 80-34 32 23-4 16 16 14-7Z" fill="#E8F1F5"/>
    <path d="M0 239c78-73 121-34 174-35 77-2 98-57 172-37 68 18 88 64 194 28v60H0Z" fill="#347D80"/>
    <path d="M0 250c125-55 155-9 245-22 69-10 111-21 173-9 50 10 80 10 122 5v31H0Z" fill="#17324D" opacity=".85"/>
    <path d="M100 251c47-25 101-24 159-28 67-4 117-38 187-19" stroke="#FAF8F4" strokeWidth="3" strokeDasharray="5 8" opacity=".75"/>
    <g transform="translate(400 178) rotate(6)"><rect width="43" height="24" rx="5" fill="#FAF8F4"/><path d="M5 5h33v9H5Z" fill="#17324D"/><path d="M16 5v9m12-9v9" stroke="#FAF8F4" strokeWidth="2"/><circle cx="10" cy="24" r="4" fill="#17324D"/><circle cx="33" cy="24" r="4" fill="#17324D"/><path d="M5 18h5m23 0h5" stroke="#B9233D" strokeWidth="2"/></g>
    <path d="M47 166v38m-9-18 9-21 9 21Zm440-30v32m-8-15 8-20 8 20Z" stroke="#347D80" strokeWidth="3" strokeLinejoin="round"/>
    <path d="M78 60h37m-25-8h34M345 35h19" stroke="#FAF8F4" strokeWidth="3" strokeLinecap="round"/>
  </svg>;
}
export function HeroSection() {
  return <section className="hero" aria-labelledby="hero-title"><div className="hero-copy"><p className="eyebrow">Across the valley. One journey at a time.</p><h1 id="hero-title">Where do you want to go?</h1><p className="hero-subtitle">Choose bus stops or a saved place for your next journey.</p><p className="hero-nepali" lang="ne">तपाईं कहाँ जान चाहनुहुन्छ?</p></div><MountainIllustration /></section>;
}
export function AboutProject() {
  return <section className="about" id="about" aria-labelledby="about-title"><p className="eyebrow">Made for journeys across the valley</p><h1 id="about-title">About the project</h1><p className="about-intro">A Robust Web-Based Bus Route Finder System for Kathmandu Valley</p><p>A final-year Computer Science project helping locals and visitors navigate public transport across Kathmandu Valley.</p><div className="about-section"><Icon name="route"/><div><h2>Plan with local knowledge</h2><p>Search bus connections, find transfer points and nearby stops, or describe a trip to the Route Assistant.</p></div></div><div className="about-section"><Icon name="bus"/><div><h2>Project data</h2><p>Journeys use the project's main bus-route dataset. The assistant matches supported bus stops and passes them to the journey planner.</p></div></div><div className="about-section"><Icon name="pin"/><div><h2>Travel with context</h2><p>This academic prototype does not offer live bus tracking or guaranteed schedules. Bus route lines and travel times are estimates. Walking directions use pedestrian routes when available, with a clearly labelled approximate fallback. Check local services before travelling.</p></div></div><a className="about-link" href="/">Open journey planner <Icon name="arrow"/></a></section>;
}
export function Footer() {
  return <footer><div className="footer-project"><strong>Kathmandu Bus Route Finder</strong><p>A Robust Web-Based Bus Route Finder System for Kathmandu Valley</p><p>Based on the project dataset. Services and journey times may vary.</p></div><div className="footer-meta"><span>Final Year Project &middot; {new Date().getFullYear()}</span><a href="https://www.openstreetmap.org/copyright">&copy; OpenStreetMap contributors</a></div></footer>;
}
