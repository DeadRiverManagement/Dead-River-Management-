// Thin React wrapper so the marquee items are plain same-tab links to each
// case study. LogoLoop's own link rendering opens a new tab, and an Astro
// template cannot pass a React render function directly.
import LogoLoop from './LogoLoop.jsx';

export default function ClientLogoLoop({ logos, ...props }) {
  return (
    <LogoLoop
      {...props}
      logos={logos}
      renderItem={(item) => (
        <a
          className="logoloop__link"
          href={item.href}
          aria-label={item.alt}
          title={item.alt}
        >
          <img
            className={item.className}
            src={item.src}
            alt={item.alt}
            width={item.width}
            height={item.height}
            loading="lazy"
            decoding="async"
            draggable={false}
          />
        </a>
      )}
    />
  );
}
