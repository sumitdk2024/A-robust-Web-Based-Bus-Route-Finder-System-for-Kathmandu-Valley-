export default function Header() {
  const about = window.location.pathname.replace(/\/$/, '') === '/about';
  return <header className="topbar">
    <a className="brand" href="/" aria-label="Kathmandu Bus Route Finder home">
      <span className="brand-icon" aria-hidden="true"><svg viewBox="0 0 56 56" fill="none"><path d="m5 30 14-18 9 11 9-15 14 22" stroke="currentColor" strokeWidth="2.5" strokeLinejoin="round"/><path d="m15 17 4 3 4-3m10-3 4 4 4-3" stroke="currentColor" strokeWidth="2"/><rect x="16" y="27" width="25" height="19" rx="4" fill="currentColor"/><path d="M20 31h17v7H20z" fill="#FAF8F4"/><path d="M21 46v3m15-3v3" stroke="currentColor" strokeWidth="3"/><circle cx="22" cy="42" r="1.4" fill="#FAF8F4"/><circle cx="35" cy="42" r="1.4" fill="#FAF8F4"/></svg></span>
      <span>Kathmandu<span className="brand-subtitle">Bus Route Finder</span></span>
    </a>
    <nav aria-label="Main navigation"><a href="/#journey" aria-current={!about ? 'page' : undefined}>Journey Planner</a><a href="/about" aria-current={about ? 'page' : undefined}>About the project</a></nav>
  </header>;
}
