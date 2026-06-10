import { DigitalAgencyRuntime } from "./DigitalAgencyRuntime";
import { assetUrl, emptySite, fetchApi, getMenu, type MenuItem, type SitePayload } from "../../lib/api";
import { BUSINESS_EMAIL, BUSINESS_MAILING_ADDRESS, BUSINESS_PHONE, BUSINESS_PHONE_TEL, LINKEDIN_URL } from "../../lib/seo";
import { TEMPLATE_ASSET_BASE as A, templateCssFiles } from "./templateAssets";
import { footerContactInfo, footerCopyright, footerServiceLinks } from "./templateRenderers";

function renderLoaderLetters(text = "Opplexify") {
  return text.split("").map((letter, index) => <span key={`${letter}-${index}`}>{letter}</span>);
}

function CursorAndLoader({ site, showLoader }: { site: SitePayload; showLoader: boolean }) {
  const loaderText = site.settings.theme?.loaderText ?? site.settings.site?.title ?? "Opplexify";

  return (
    <>
      <div className="custom-cursor">
        <img src={`${A}/imgs/cursor/cursor-2-xs.svg`} alt="cursor" id="cursorImg" decoding="async" />
      </div>

      {showLoader ? (
        <div className="loader-wrap">
          <svg viewBox="0 0 1000 1000" preserveAspectRatio="none">
            <path id="svg" d="M0,1005S175,995,500,995s500,5,500,5V0H0Z" />
          </svg>

          <div className="loader-wrap-heading">
            <div className="load-text">
              {renderLoaderLetters(loaderText)}
            </div>
          </div>
        </div>
      ) : null}

      <div className="progress-wrap">
        <svg className="progress-circle svg-content" width="100%" height="100%" viewBox="-1 -1 102 102">
          <path d="M50,1 a49,49 0 0,1 0,98 a49,49 0 0,1 0,-98" />
        </svg>
      </div>
    </>
  );
}

function SideInfo({ site }: { site: SitePayload }) {
  const settings = site.settings.site ?? {};
  const logoDark = assetUrl(settings.logoDark ?? `${A}/imgs/logo/opplexify-logo-dark.svg`);
  const logoLight = assetUrl(settings.logoLight ?? `${A}/imgs/logo/opplexify-logo-light.svg`);
  const email = settings.email ?? BUSINESS_EMAIL;
  const phone = settings.phone ?? BUSINESS_PHONE;
  const address = settings.address ?? BUSINESS_MAILING_ADDRESS;

  return (
    <>
      <aside className="fix">
        <div className="side-info">
          <div className="side-info-content">
            <div className="offset-widget offset-header">
              <div className="offset-logo">
                <a href="/">
                  <img className="show-light" src={logoDark} alt="Opplexify logo" decoding="async" />
                  <img className="show-dark" src={logoLight} alt="Opplexify logo" decoding="async" />
                </a>
              </div>
              <button id="side-info-close" className="side-info-close">
                <i className="fas fa-times" />
              </button>
            </div>
            <div className="mobile-menu d-xl-none fix" />
            <div className="offset-button">
              <a href="/contact" className="rr-btn">
                <span className="btn-wrap">
                  <span className="text-one">Let's Talk</span>
                  <span className="text-two">Let's Talk</span>
                </span>
              </a>
            </div>
            <div className="offset-widget-box">
              <h2 className="title">Project Contact</h2>
              <div className="contact-meta">
                <div className="contact-item">
                  <span className="icon">
                    <i className="fa-solid fa-location-dot" />
                  </span>
                  <span className="text">{address}</span>
                </div>
                <div className="contact-item">
                  <span className="icon">
                    <i className="fa-solid fa-envelope" />
                  </span>
                  <span className="text">
                    <a href={`mailto:${email}`}>{email}</a>
                  </span>
                </div>
                <div className="contact-item">
                  <span className="icon">
                    <i className="fa-solid fa-phone" />
                  </span>
                  <span className="text">
                    <a href={`tel:${phone.replace(/[^\d+]/g, "") || BUSINESS_PHONE_TEL}`}>{phone}</a>
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </aside>
      <div className="offcanvas-overlay" />
    </>
  );
}

function MainMenu({ items }: { items: MenuItem[] }) {
  const links = items.length ? items : emptySite.menus[0].items;

  return (
    <nav className="main-menu">
      <ul>
        {links.map((item) => (
          <li key={item.id}>
            <a href={item.url} target={item.target ?? undefined}>
              {item.label}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}

function HomepageHeader({ site }: { site: SitePayload }) {
  const logoLight = assetUrl(site.settings.site?.logoLight ?? `${A}/imgs/logo/opplexify-logo-light.svg`);
  const headerItems = getMenu(site, "header");

  return (
    <header className="header-area">
      <div className="header-main">
        <div className="container rr-container-1650">
          <div className="header-area__inner">
            <div className="header__logo">
              <a href="/">
                <img src={logoLight} className="normal-logo" alt="Opplexify logo" decoding="async" />
              </a>
            </div>
            <div className="header__shape">
              <svg width="13" height="40" viewBox="0 0 13 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect x="6" width="1" height="40" fill="white" fillOpacity="0.1" />
                <rect y="10" width="1" height="20" fill="white" fillOpacity="0.1" />
                <rect x="12" y="10" width="1" height="20" fill="white" fillOpacity="0.1" />
              </svg>
            </div>
            <div className="header__nav">
              <MainMenu items={headerItems} />
            </div>
            <div className="header__navicon d-xl-none">
              <button className="side-toggle">
                <i className="fa-solid fa-bars" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

function HomepageFooter({ site }: { site: SitePayload }) {
  const companyItems = getMenu(site, "footer").length ? getMenu(site, "footer") : getMenu(site, "header");
  const footer = site.settings.footer ?? {};
  const serviceLinks = footerServiceLinks(footer);
  const contact = footerContactInfo(site);

  return (
    <footer className="footer-area">
      <div className="container rr-container-1650">
        <div className="footer-widget-wrapper-box">
          <div className="footer-widget-wrapper">
            <div className="footer-widget-box content">
              <div className="title-wrapper">
                <h2 className="title rr_title_anim">
                  {footer.headline ?? "Custom software,"} <br /> {footer.headlineLine2 ?? "websites and SaaS"} <br /> {footer.headlineLine3 ?? "built clearly"}
                </h2>
              </div>
              <a href="/contact" className="rr-btn-underline">
                {footer.ctaLabel ?? "Get a development quote"}
              </a>
            </div>
            <div className="footer-widget-box">
              <h2 className="title">Company</h2>
              <ul className="footer-nav-list">
                {companyItems.map((item) => (
                  <li key={item.id}>
                    <a href={item.url} target={item.target ?? undefined}>
                      {item.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
            <div className="footer-widget-box">
              <h2 className="title">Services</h2>
              <ul className="footer-nav-list">
                {serviceLinks.map((item) => (
                  <li key={`${item.href}-${item.label}`}>
                    <a href={item.href}>{item.label}</a>
                  </li>
                ))}
              </ul>
            </div>
            <div className="footer-widget-box">
              <h2 className="title">Legal</h2>
              <ul className="footer-nav-list">
                <li>
                  <a href="/pricing">Pricing</a>
                </li>
                <li>
                  <a href="/terms">Terms of Service</a>
                </li>
                <li>
                  <a href="/privacy">Privacy Policy</a>
                </li>
                <li>
                  <a href="/refund-policy">Refund Policy</a>
                </li>
              </ul>
            </div>
            <div className="footer-widget-box">
              <h2 className="title">Contact</h2>
              <ul className="footer-nav-list footer-contact-list">
                <li>
                  <a href={`mailto:${contact.email}`}>{contact.email}</a>
                </li>
                <li>
                  <a href={`tel:${contact.tel}`}>{contact.phone}</a>
                </li>
                <li>
                  <span>{contact.address}</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
      <div className="copyright-area">
        <div className="copyright-area-inner">
          <div className="copyright-text">
            <p className="text">
              {footerCopyright(footer)}
            </p>
          </div>
          <a className="copyright-social" href={LINKEDIN_URL} aria-label="Opplexify on LinkedIn">
            <i className="fa-brands fa-linkedin-in" />
          </a>
        </div>
      </div>
    </footer>
  );
}

export async function PublicShell({
  children,
  smooth = true,
  showLoader = true
}: {
  children: React.ReactNode;
  smooth?: boolean;
  showLoader?: boolean;
}) {
  const site = await fetchApi<SitePayload>("/public/site", emptySite);

  return (
    <>
      {templateCssFiles.map((file) => (
        <link key={file} rel="stylesheet" href={`${A}/css/${file}`} />
      ))}
      <div className="opplexify-template-page body-wrapper dark">
        <CursorAndLoader site={site} showLoader={showLoader} />
        <SideInfo site={site} />
        <div className={smooth ? "has-smooth" : undefined} id="has_smooth" />
        <div id="smooth-wrapper">
          <div id="smooth-content">
            <HomepageHeader site={site} />
            {children}
            <HomepageFooter site={site} />
          </div>
        </div>
      </div>
      <DigitalAgencyRuntime smooth={smooth} />
    </>
  );
}
