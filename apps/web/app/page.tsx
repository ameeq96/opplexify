import type { Metadata } from "next";
import { DigitalAgencyRuntime } from "../components/site/DigitalAgencyRuntime";
import { applyHomeCms } from "../components/site/homeRenderer";
import { TEMPLATE_ASSET_BASE as A } from "../components/site/templateAssets";
import { TemplateAssetLinks } from "../components/site/TemplateAssetLinks";
import {
  emptySite,
  fetchApi,
  pageMetadata,
  type Page,
  type PortfolioItem,
  type Service,
  type SitePayload,
  type TeamMember
} from "../lib/api";
import {
  BUSINESS_EMAIL,
  BUSINESS_MAILING_ADDRESS,
  BUSINESS_PHONE,
  COMPANY_DESCRIPTION,
  DEFAULT_OG_IMAGE,
  LEGAL_NAME,
  LINKEDIN_URL,
  absoluteUrl,
  siteUrl
} from "../lib/seo";

export const revalidate = 300;

export async function generateMetadata(): Promise<Metadata> {
  const page = await fetchApi<Page | null>("/public/pages/home", null);
  return pageMetadata(page, "Custom Websites, SaaS Platforms & Business Software Development", "/");
}

const homeHtml = String.raw`
  <div class="custom-cursor">
    <img src="${A}/imgs/cursor/cursor-2-xs.svg" alt="cursor" id="cursorImg">
  </div>

  <div class="loader-wrap">
    <svg viewBox="0 0 1000 1000" preserveAspectRatio="none">
      <path id="svg" d="M0,1005S175,995,500,995s500,5,500,5V0H0Z"></path>
    </svg>

    <div class="loader-wrap-heading">
      <div class="load-text">
        <span>O</span>
        <span>p</span>
        <span>p</span>
        <span>l</span>
        <span>e</span>
        <span>x</span>
        <span>i</span>
        <span>f</span>
        <span>y</span>
      </div>
    </div>
  </div>

  <div class="progress-wrap">
    <svg class="progress-circle svg-content" width="100%" height="100%" viewBox="-1 -1 102 102">
      <path d="M50,1 a49,49 0 0,1 0,98 a49,49 0 0,1 0,-98"></path>
    </svg>
  </div>

  <aside class="fix">
    <div class="side-info">
      <div class="side-info-content">
        <div class="offset-widget offset-header">
          <div class="offset-logo">
            <a href="/">
              <img class="show-light" src="${A}/imgs/logo/opplexify-logo-dark.svg" alt="Opplexify logo">
              <img class="show-dark" src="${A}/imgs/logo/opplexify-logo-full.png" alt="Opplexify logo">
            </a>
          </div>
          <button id="side-info-close" class="side-info-close">
            <i class="fas fa-times"></i>
          </button>
        </div>
        <div class="mobile-menu d-xl-none fix"></div>
        <div class="offset-button">
          <a href="/contact" class="rr-btn">
            <span class="btn-wrap">
              <span class="text-one">Let's Talk</span>
              <span class="text-two">Let's Talk</span>
            </span>
          </a>
        </div>
        <div class="offset-widget-box">
          <h2 class="title">Project Contact</h2>
          <div class="contact-meta">
            <div class="contact-item">
              <span class="icon"><i class="fa-solid fa-location-dot"></i></span>
              <span class="text">Business mailing address: 525 Randall Ave Ste 100 PMB 1203, Cheyenne, WY 82001, United States</span>
            </div>
            <div class="contact-item">
              <span class="icon"><i class="fa-solid fa-envelope"></i></span>
              <span class="text"><a href="mailto:admin@opplexify.com">admin@opplexify.com</a></span>
            </div>
            <div class="contact-item">
              <span class="icon"><i class="fa-solid fa-phone"></i></span>
              <span class="text"><a href="tel:+13074435144">+1 (307) 443-5144</a></span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </aside>
  <div class="offcanvas-overlay"></div>

  <div class="has-smooth" id="has_smooth"></div>
  <div id="smooth-wrapper">
    <div id="smooth-content">
      <header class="header-area">
        <div class="header-main">
          <div class="container rr-container-1650">
            <div class="header-area__inner">
              <div class="header__logo">
                <a href="/">
                  <img src="${A}/imgs/logo/opplexify-logo-full.png" class="normal-logo" alt="Opplexify logo">
                </a>
              </div>
              <div class="header__shape">
                <svg width="13" height="40" viewBox="0 0 13 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <rect x="6" width="1" height="40" fill="white" fill-opacity="0.1" />
                  <rect y="10" width="1" height="20" fill="white" fill-opacity="0.1" />
                  <rect x="12" y="10" width="1" height="20" fill="white" fill-opacity="0.1" />
                </svg>
              </div>
              <div class="header__nav">
                <nav class="main-menu">
                  <ul>
                    <li><a href="/">Home</a></li>
                    <li><a href="/about">About</a></li>
                    <li><a href="/portfolio">Portfolio</a></li>
                    <li><a href="/services">Services</a></li>
                    <li><a href="/contact">Contact Us</a></li>
                  </ul>
                </nav>
              </div>
              <div class="header__navicon d-xl-none">
                <button class="side-toggle"><i class="fa-solid fa-bars"></i></button>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main>
        <section class="hero-area">
          <div class="area-bg">
            <video class="hero-video" loop muted autoplay playsinline preload="auto">
              <source src="${A}/video/wavy-layer.mp4" type="video/mp4">
            </video>
          </div>
          <div class="container rr-container-1650">
            <div class="hero-area-inner">
              <div class="section-content">
                <div class="section-title-wrapper">
                  <div class="title-wrapper">
                    <h1 class="section-title rr_title_anim">Custom Websites,
                      SaaS Platforms &
                      Business Software Development</h1>
                  </div>
                  <div class="text-wrapper">
                    <p class="text">Opplexify LLC helps businesses plan, design, and build websites, SaaS platforms,
                      dashboards, backend systems, APIs, mobile apps, and workflow automations.</p>
                  </div>
                </div>
                <div class="meta-list">
                  <ul>
                    <li>Founded 2026 <br>
                      Wyoming limited liability company <br>
                      remote software development</li>
                    <li>Business verification <br>
                      contact <br>
                      admin@opplexify.com</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section class="about-area-2">
          <div class="container rr-container-1650">
            <div class="about-area-2-inner section-spacing-top">
              <div class="section-header">
                <div class="section-title-wrapper">
                  <div class="title-wrapper rr_title_anim">
                    <h2 class="section-title font-bdogrotesk-regular">We build
                      practical software
                      for businesses
                      with clear requirements. </h2>
                  </div>
                </div>
              </div>
              <div class="section-content-wrapper">
                <div class="area-shape-1">
                  <img class="fade-anim show-light" data-fade-from="bottom" src="${A}/imgs/shape/shape-s-1.webp" alt="image" data-speed="0.8">
                  <img class="fade-anim show-dark" data-fade-from="bottom" src="${A}/imgs/shape/shape-s-1-light.webp" alt="image" data-speed="0.8">
                </div>
                <div class="section-subtitle-wrapper fade-anim">
                  <div class="subtitle-wrapper">
                    <span class="section-subtitle-3">(Who we are)</span>
                  </div>
                  <div class="thumb" data-speed="1.2">
                    <img src="${A}/imgs/gallery/gallery-s-1.webp" alt="image">
                  </div>
                </div>
                <div class="section-content fade-anim">
                  <div class="text-wrapper">
                    <p class="text">Opplexify LLC is a Wyoming-formed software development company providing remote
                      development services for websites, SaaS platforms, dashboards, mobile apps, APIs, and automations.</p>
                    <p class="text">Projects start with a written scope, proposal, and invoice. Delivery is planned
                      around agreed milestones, direct communication, and client requirements.</p>
                  </div>
                  <div class="btn-wrapper">
                    <a href="/about" class="rr-btn-underline">Learn more about Opplexify</a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section class="work-area">
          <div class="container rr-container-1650">
            <div class="work-area-inner section-spacing-top">
              <div class="work-header-meta fade-anim">
                <span>(Portfolio videos)</span>
                <span>(All - 4)</span>
                <span><a class="rr-btn-underline" href="/portfolio">Browse all work</a></span>
              </div>
              <div class="section-header">
                <div class="section-title-wrapper">
                  <div class="title-wrapper">
                    <h2 class="section-title work-title"><span class="first">recent</span> <span class="last">work</span></h2>
                  </div>
                </div>
              </div>
              <div class="works-wrapper-box section-spacing-top">
                <div class="works-wrapper">
                  <div class="work-box fade-anim">
                    <div class="thumb"><div class="image scale" data-cursor-text="View Details" data-cursor-class="-big"><a href="/portfolio"><video class="home-work-video" autoplay muted loop playsinline preload="metadata"><source src="/portfolio/videos/portfolio-video-1.mp4" type="video/mp4"></video></a></div></div>
                    <div class="content"><h3 class="title"><a href="/portfolio">Private Website UI Sample</a></h3><div class="meta"><span class="tag">Website Design, Motion</span><span class="date">(2026)</span></div></div>
                  </div>
                  <div class="work-box fade-anim">
                    <div class="thumb"><div class="image scale" data-cursor-text="View Details" data-cursor-class="-big"><a href="/portfolio"><video class="home-work-video" autoplay muted loop playsinline preload="metadata"><source src="/portfolio/videos/portfolio-video-2.mp4" type="video/mp4"></video></a></div></div>
                    <div class="content"><h3 class="title"><a href="/portfolio">Private SaaS UI Sample</a></h3><div class="meta"><span class="tag">SaaS, Product UI</span><span class="date">(2026)</span></div></div>
                  </div>
                  <div class="work-box fade-anim">
                    <div class="thumb"><div class="image scale" data-cursor-text="View Details" data-cursor-class="-big"><a href="/portfolio"><video class="home-work-video" autoplay muted loop playsinline preload="metadata"><source src="/portfolio/videos/portfolio-video-3.mp4" type="video/mp4"></video></a></div></div>
                    <div class="content"><h3 class="title"><a href="/portfolio">Private Dashboard Sample</a></h3><div class="meta"><span class="tag">Dashboard, UI/UX</span><span class="date">(2026)</span></div></div>
                  </div>
                  <div class="work-box fade-anim">
                    <div class="thumb"><div class="image scale" data-cursor-text="View Details" data-cursor-class="-big"><a href="/portfolio"><video class="home-work-video" autoplay muted loop playsinline preload="metadata"><source src="/portfolio/videos/portfolio-video-4.mp4" type="video/mp4"></video></a></div></div>
                    <div class="content"><h3 class="title"><a href="/portfolio">Private App Interface Sample</a></h3><div class="meta"><span class="tag">Mobile App, Web App</span><span class="date">(2026)</span></div></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section class="pricing-area rr-bg-primary">
          <div class="container rr-container-1650">
            <div class="pricing-area-inner section-spacing-top">
              <div class="pricing-header fade-anim">
                <span class="section-subtitle">Pricing</span>
                <div class="pricing-title-wrap">
                  <h2 class="pricing-title rr_title_anim">Website, web app, SaaS and mobile app development pricing.</h2>
                  <p>Starting ranges for custom software projects. Final pricing depends on scope, integrations, content, revisions, and delivery requirements.</p>
                </div>
              </div>
              <div class="pricing-grid fade-anim">
                <div class="pricing-card">
                  <span class="pricing-label">5 Page Presence</span>
                  <h3>Simple Website</h3>
                  <p class="pricing-copy">A concise, responsive, SEO-friendly business website designed for credibility, lead capture, and clear service presentation.</p>
                  <div class="pricing-price"><strong>$750+</strong><span>starting</span></div>
                  <span class="pricing-time">1-3 weeks</span>
                  <ul class="pricing-features">
                    <li>5 responsive pages</li>
                    <li>Contact form</li>
                    <li>Foundational SEO</li>
                    <li>Performance-focused structure</li>
                  </ul>
                  <a href="/contact" class="pricing-btn">Request Package</a>
                </div>

                <div class="pricing-card">
                  <span class="pricing-label">Full-Stack App</span>
                  <h3>Complete Web Application</h3>
                  <p class="pricing-copy">A full-stack web application with authentication, dashboards, APIs, database integration, and structured workflows.</p>
                  <div class="pricing-price"><strong>$3,500+</strong><span>starting</span></div>
                  <span class="pricing-time">3-8 weeks</span>
                  <ul class="pricing-features">
                    <li>Authentication</li>
                    <li>User dashboard</li>
                    <li>Backend API</li>
                    <li>Database integration</li>
                  </ul>
                  <a href="/contact" class="pricing-btn">Request Package</a>
                </div>

                <div class="pricing-card featured">
                  <span class="pricing-label">Subscription-Ready</span>
                  <h3>Complete SaaS Solution</h3>
                  <p class="pricing-copy">A scalable SaaS development foundation with product workflows, admin controls, database models, and subscription-ready architecture.</p>
                  <div class="pricing-price"><strong>$6,500+</strong><span>starting</span></div>
                  <span class="pricing-time">6-12 weeks</span>
                  <ul class="pricing-features">
                    <li>SaaS platform</li>
                    <li>Admin dashboard</li>
                    <li>Subscription-ready structure</li>
                    <li>Database and API</li>
                  </ul>
                  <a href="/contact" class="pricing-btn">Request Package</a>
                </div>

                <div class="pricing-card">
                  <span class="pricing-label">App Plus Control Room</span>
                  <h3>Mobile App with Admin Dashboard</h3>
                  <p class="pricing-copy">A mobile application connected to a secure backend API and an operational admin dashboard for real business workflows.</p>
                  <div class="pricing-price"><strong>$4,500+</strong><span>starting</span></div>
                  <span class="pricing-time">5-10 weeks</span>
                  <ul class="pricing-features">
                    <li>Mobile app</li>
                    <li>Admin dashboard</li>
                    <li>Backend API</li>
                    <li>Push notification-ready</li>
                  </ul>
                  <a href="/contact" class="pricing-btn">Request Package</a>
                </div>

                <div class="pricing-card">
                  <span class="pricing-label">Complete Product Suite</span>
                  <h3>Complete Mobile App + Web App</h3>
                  <p class="pricing-copy">A coordinated mobile app, web app, API, database, and admin dashboard system for a complete digital product launch.</p>
                  <div class="pricing-price"><strong>$9,500+</strong><span>starting</span></div>
                  <span class="pricing-time">8-16 weeks</span>
                  <ul class="pricing-features">
                    <li>Mobile app</li>
                    <li>Web app</li>
                    <li>Admin dashboard</li>
                    <li>Complete full-stack solution</li>
                  </ul>
                  <a href="/contact" class="pricing-btn">Request Package</a>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section class="service-area rr-ov-hidden">
          <div class="container rr-container-1650">
            <div class="service-area-inner section-spacing-top">
              <div class="section-header">
                <div class="section-title-wrapper">
                  <div class="title-wrapper">
                    <h2 class="section-title font-bdogrotesk-regular rr_title_anim">Full-stack development
                      services for defined
                      business requirements</h2>
                  </div>
                </div>
              </div>
              <div class="services-wrapper-box section-spacing-top">
                <div class="phone-mockup">
                  <div class="mockup-header">
                    <div class="mockup-logo">
                      <img class="show-light" src="${A}/imgs/logo/opplexify-logo-dark.svg" alt="Opplexify logo">
                      <img class="show-dark" src="${A}/imgs/logo/opplexify-logo-light.svg" alt="Opplexify logo">
                    </div>
                    <div class="mockup-offcanvas">
                      <svg width="30" height="13" viewBox="0 0 30 13" xmlns="http://www.w3.org/2000/svg">
                        <path d="M30 6L30 7L-4.37114e-08 7L0 6L30 6Z" />
                        <path d="M30 1.31134e-07L30 1L13 0.999999L13 -7.43094e-07L30 1.31134e-07Z" />
                        <path d="M30 12L30 13L13 13L13 12L30 12Z" />
                      </svg>
                    </div>
                  </div>
                  <ul class="mockup-text">
                    <li>Development</li>
                    <li><a href="/services"><span class="underline">Explore</span></a></li>
                  </ul>
                </div>
                <div class="services-wrapper-1 services-box-anim">
                  <a href="/services/custom-website-development" class="service-box-1 item-1"><div class="thumb"><img class="show-light" src="${A}/imgs/icon/icon-s-1.webp" alt="Custom website development icon"><img class="show-dark" src="${A}/imgs/icon/icon-s-1-dark.webp" alt="Custom website development icon"></div><div class="content"><h3 class="title">Custom Website <br> Development</h3></div></a>
                  <a href="/services/saas-platform-development" class="service-box-1 item-2"><div class="thumb"><img class="show-light" src="${A}/imgs/icon/icon-s-2.webp" alt="SaaS platform development icon"><img class="show-dark" src="${A}/imgs/icon/icon-s-2-dark.webp" alt="SaaS platform development icon"></div><div class="content"><h3 class="title">SaaS Platform <br> Development</h3></div></a>
                  <a href="/services/dashboard-admin-panel-development" class="service-box-1 item-3"><div class="thumb"><img class="show-light" src="${A}/imgs/icon/icon-s-3.webp" alt="Dashboard and admin panel development icon"><img class="show-dark" src="${A}/imgs/icon/icon-s-3-dark.webp" alt="Dashboard and admin panel development icon"></div><div class="content"><h3 class="title">Dashboard & Admin <br> Panels</h3></div></a>
                  <a href="/services/mobile-app-development" class="service-box-1 item-4"><div class="thumb"><img class="show-light" src="${A}/imgs/icon/icon-s-4.webp" alt="Mobile app development icon"><img class="show-dark" src="${A}/imgs/icon/icon-s-4-dark.webp" alt="Mobile app development icon"></div><div class="content"><h3 class="title">Mobile App <br> Development</h3></div></a>
                  <a href="/services/backend-api-development" class="service-box-1 item-5"><div class="thumb"><img class="show-light" src="${A}/imgs/icon/icon-s-5.webp" alt="Backend and API development icon"><img class="show-dark" src="${A}/imgs/icon/icon-s-5-dark.webp" alt="Backend and API development icon"></div><div class="content"><h3 class="title">Backend & API <br> Development</h3></div></a>
                </div>
                <div class="add">
                  <div class="add-shape-wrapper">
                    <svg class="add-shape" width="50" height="50" viewBox="0 0 50 50" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <circle cx="25" cy="25" r="25" />
                      <path fill-rule="evenodd" clip-rule="evenodd" d="M26.5 16.5H23.5V23.5L16.5 23.5V26.5H23.5V33.5H26.5V26.5H33.5V23.5H26.5V16.5ZM26.5 23.5V26.5H23.5V23.5H26.5Z" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section class="team-area-1 rr-bg-primary opplexify-home-team">
          <div class="container rr-container-1650">
            <div class="team-area-1-inner section-spacing-top">
              <div class="section-header">
                <div class="section-title-wrapper">
                  <div class="title-wrapper">
                    <h2 class="section-title font-bdogrotesk-regular rr_title_anim">Founder-led software
                      development for
                      scoped client projects</h2>
                  </div>
                </div>
              </div>
              <div class="team-wrapper-box">
                <div class="team-wrapper fade-anim">
                  <div class="team-box-1 fade-anim"><div class="thumb"><a href="/team/muhammad-emmad-khan"><img src="/team/emmad-khan.webp" alt="Muhammad Emmad Khan, founder and owner of Opplexify LLC"></a></div><div class="content"><h3 class="name"><a href="/team/muhammad-emmad-khan">Muhammad Emmad Khan</a></h3><span class="post">Founder and Owner</span></div></div>
                  <div class="team-box-1 fade-anim"><div class="thumb"><a href="/team/ameeq-khan"><img src="/team/ameeq-khan.webp" alt="Ameeq Khan, full-stack developer at Opplexify"></a></div><div class="content"><h3 class="name"><a href="/team/ameeq-khan">Ameeq Khan</a></h3><span class="post">Full-Stack Developer</span></div></div>
                  <div class="team-box-1 fade-anim"><div class="thumb"><a href="/team/atiq-khan"><img src="/team/atiq-khan.webp" alt="Atiq Khan, project coordinator at Opplexify"></a></div><div class="content"><h3 class="name"><a href="/team/atiq-khan">Atiq Khan</a></h3><span class="post">Project Coordinator</span></div></div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section class="marquee-text-area rr-bg-primary marquee-text-area--padding section-spacing-bottom">
          <div class="moving-text section">
            <div class="wrapper-text">
              <h2 class="section-title">Next.js websites, SaaS platforms, mobile apps and admin dashboards</h2>
            </div>
          </div>
        </section>

        <div class="client-area rr-bg-primary">
          <div class="container rr-container-1650">
            <div class="client-area-inner">
              <div class="section-header">
                <div class="section-title-wrapper">
                  <div class="title-wrapper">
                    <h2 class="section-title rr_title_anim">Selected private client work is available upon request.</h2>
                  </div>
                </div>
              </div>
              <div class="clients-wrapper-box fade-anim">
                <div class="clients-wrapper">
                  <div class="swiper client-slider-active">
                    <div class="swiper-wrapper">
                      <div class="swiper-slide"><img class="show-light" src="${A}/imgs/brand/brand-1-light.webp" alt="Private software project category"><img class="show-dark" src="${A}/imgs/brand/brand-1.webp" alt="Private software project category"></div>
                      <div class="swiper-slide"><img class="show-light" src="${A}/imgs/brand/brand-2-light.webp" alt="Private website project category"><img class="show-dark" src="${A}/imgs/brand/brand-2.webp" alt="Private website project category"></div>
                      <div class="swiper-slide"><img class="show-light" src="${A}/imgs/brand/brand-3-light.webp" alt="Private dashboard project category"><img class="show-dark" src="${A}/imgs/brand/brand-3.webp" alt="Private dashboard project category"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <section class="award-area rr-bg-primary">
          <div class="container rr-container-1650">
            <div class="award-area-inner section-spacing">
              <div class="section-header">
                <div class="section-title-wrapper">
                  <div class="title-wrapper fade-anim" data-direction="left">
                    <h2 class="section-title font-bdogrotesk-regular rr_title_anim">Clean code, fast pages <br>
                      and maintainable systems
                      are the foundation of
                      every launch</h2>
                  </div>
                </div>
              </div>
              <div class="award-wrapper-box">
                <div class="award-wrapper fade-anim" data-direction="right">
                  <div class="award-box"><span class="category">Frontend</span><p class="award">Next.js interfaces built for speed</p><span class="year">01</span></div>
                  <div class="award-box"><span class="category">Backend</span><p class="award">NestJS APIs with database structure</p><span class="year">02</span></div>
                  <div class="award-box"><span class="category">SEO</span><p class="award">Clean metadata, headings and internal links</p><span class="year">03</span></div>
                  <div class="award-box"><span class="category">Product</span><p class="award">SaaS, mobile and admin workflows</p><span class="year">04</span></div>
                  <div class="award-box"><span class="category">Launch</span><p class="award">Responsive, tested and production-ready builds</p><span class="year">05</span></div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer class="footer-area">
        <div class="container rr-container-1650">
          <div class="footer-widget-wrapper-box">
            <div class="footer-widget-wrapper">
              <div class="footer-widget-box content">
                <a href="/" class="footer-logo">
                  <img src="${A}/imgs/logo/opplexify-logo-full.png" alt="Opplexify logo" decoding="async">
                </a>
                <div class="title-wrapper">
                  <h2 class="title rr_title_anim">Custom software, <br> websites and SaaS
                    built <br> clearly
                  </h2>
                </div>
                <a href="/contact" class="rr-btn-underline">Request a Quote</a>
              </div>
              <div class="footer-widget-box">
                <h2 class="title">Company</h2>
                <ul class="footer-nav-list">
                  <li><a href="/">Home</a></li>
                  <li><a href="/about">About</a></li>
                  <li><a href="/portfolio">Portfolio</a></li>
                  <li><a href="/services">Services</a></li>
                  <li><a href="/contact">Contact Us</a></li>
                </ul>
              </div>
              <div class="footer-widget-box">
                <h2 class="title">Services</h2>
                <ul class="footer-nav-list">
                  <li><a href="/services">Custom Websites</a></li>
                  <li><a href="/services">SaaS Platforms</a></li>
                  <li><a href="/services">Mobile Apps</a></li>
                  <li><a href="/services">Backend/API Development</a></li>
                </ul>
              </div>
              <div class="footer-widget-box">
                <h2 class="title">Legal</h2>
                <ul class="footer-nav-list">
                  <li><a href="/pricing">Pricing</a></li>
                  <li><a href="/terms">Terms of Service</a></li>
                  <li><a href="/privacy">Privacy Policy</a></li>
                  <li><a href="/refund-policy">Refund Policy</a></li>
                </ul>
              </div>
              <div class="footer-widget-box">
                <h2 class="title">Contact</h2>
                <ul class="footer-nav-list footer-contact-list">
                  <li><a href="mailto:${BUSINESS_EMAIL}">${BUSINESS_EMAIL}</a></li>
                  <li><a href="tel:+13074435144">${BUSINESS_PHONE}</a></li>
                  <li><span>525 Randall Ave Ste 100 PMB 1203, Cheyenne, WY 82001, United States</span></li>
                </ul>
              </div>
            </div>
          </div>
        </div>
        <div class="copyright-area">
          <div class="copyright-area-inner">
            <div class="copyright-text">
              <p class="text">Copyright 2026 Opplexify LLC.</p>
            </div>
            <a class="copyright-social" href="${LINKEDIN_URL}" aria-label="Opplexify on LinkedIn">
              <i class="fa-brands fa-linkedin-in"></i>
            </a>
          </div>
        </div>
      </footer>
    </div>
  </div>
`;

export default async function HomePage() {
  const [page, site, portfolioItems, services, team] = await Promise.all([
    fetchApi<Page | null>("/public/pages/home", null),
    fetchApi<SitePayload>("/public/site", emptySite),
    fetchApi<PortfolioItem[]>("/public/portfolio-items?featured=true", []),
    fetchApi<Service[]>("/public/services?featured=true", []),
    fetchApi<TeamMember[]>("/public/team", [])
  ]);
  const homeJsonLd = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: "Custom Websites, SaaS Platforms & Business Software Development",
    url: siteUrl(),
    image: absoluteUrl(page?.ogImage ?? site.settings.seo?.ogImage ?? DEFAULT_OG_IMAGE),
    description:
      page?.seoDescription ??
      page?.summary ??
      COMPANY_DESCRIPTION,
    about: {
      "@type": "Organization",
      name: "Opplexify",
      legalName: LEGAL_NAME,
      url: siteUrl(),
      email: BUSINESS_EMAIL,
      telephone: BUSINESS_PHONE,
      sameAs: [LINKEDIN_URL],
      address: BUSINESS_MAILING_ADDRESS
    }
  };
  const renderedHtml = applyHomeCms(homeHtml, page, site, portfolioItems, services, team);

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(homeJsonLd) }} />
      <TemplateAssetLinks />
      <div
        className="digital-agency-template dark body-wrapper body-digital-agency"
        dangerouslySetInnerHTML={{ __html: renderedHtml }}
      />
      <DigitalAgencyRuntime />
    </>
  );
}
