import type { Metadata } from "next";
import { DigitalAgencyRuntime } from "../components/site/DigitalAgencyRuntime";
import { applyHomeCms } from "../components/site/homeRenderer";
import { TEMPLATE_ASSET_BASE as A, templateCssFiles } from "../components/site/templateAssets";
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
import { absoluteUrl, siteUrl } from "../lib/seo";

export const revalidate = 300;

export async function generateMetadata(): Promise<Metadata> {
  const page = await fetchApi<Page | null>("/public/pages/home", null);
  return pageMetadata(page, "Web Development Agency for Websites, SaaS, Apps & Dashboards", "/");
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
              <img class="show-dark" src="${A}/imgs/logo/opplexify-logo-light.svg" alt="Opplexify logo">
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
              <span class="text">Remote web development team</span>
            </div>
            <div class="contact-item">
              <span class="icon"><i class="fa-solid fa-envelope"></i></span>
              <span class="text"><a href="mailto:admin@opplexify.com">admin@opplexify.com</a></span>
            </div>
            <div class="contact-item">
              <span class="icon"><i class="fa-solid fa-phone"></i></span>
              <span class="text"><a href="tel:(505)555-0125">(505) 555-0125</a></span>
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
                  <img src="${A}/imgs/logo/opplexify-logo-light.svg" class="normal-logo" alt="Opplexify logo">
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
            <video class="hero-video" loop muted autoplay playsinline>
              <source src="${A}/video/wavy-layer.mp4" type="video/mp4">
            </video>
          </div>
          <div class="container rr-container-1650">
            <div class="hero-area-inner">
              <div class="section-content">
                <div class="section-title-wrapper">
                  <div class="title-wrapper">
                    <h1 class="section-title rr_title_anim">Websites,
                      SaaS apps and
                      dashboards</h1>
                  </div>
                  <div class="text-wrapper">
                    <p class="text">Opplexify is a full-stack web development agency building SEO-friendly websites,
                      Next.js web apps, SaaS platforms, mobile apps, admin dashboards, and backend systems.</p>
                  </div>
                </div>
                <div class="meta-list">
                  <ul>
                    <li>Conversion-focused <br>
                      website and app development <br>
                      since 2017</li>
                    <li>Opplexify <br>
                      Remote full-stack team for <br>
                      startups and businesses</li>
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
                      high-converting digital
                      products for businesses
                      ready to grow. </h2>
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
                    <p class="text">Opplexify plans, designs, and develops business websites, full-stack web
                      applications, SaaS products, mobile apps, and admin dashboards with clean architecture,
                      fast performance, and practical search engine optimization.</p>
                    <p class="text">Our work connects strategy, UI/UX design, Next.js frontend development,
                      NestJS backend APIs, database structure, and launch support into one maintainable system.</p>
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
                    <div class="content"><h3 class="title"><a href="/portfolio">Website UI Portfolio Video</a></h3><div class="meta"><span class="tag">Website Design, Motion</span><span class="date">(2026)</span></div></div>
                  </div>
                  <div class="work-box fade-anim">
                    <div class="thumb"><div class="image scale" data-cursor-text="View Details" data-cursor-class="-big"><a href="/portfolio"><video class="home-work-video" autoplay muted loop playsinline preload="metadata"><source src="/portfolio/videos/portfolio-video-2.mp4" type="video/mp4"></video></a></div></div>
                    <div class="content"><h3 class="title"><a href="/portfolio">SaaS Product Showcase</a></h3><div class="meta"><span class="tag">SaaS, Product UI</span><span class="date">(2026)</span></div></div>
                  </div>
                  <div class="work-box fade-anim">
                    <div class="thumb"><div class="image scale" data-cursor-text="View Details" data-cursor-class="-big"><a href="/portfolio"><video class="home-work-video" autoplay muted loop playsinline preload="metadata"><source src="/portfolio/videos/portfolio-video-3.mp4" type="video/mp4"></video></a></div></div>
                    <div class="content"><h3 class="title"><a href="/portfolio">Admin Dashboard Interface</a></h3><div class="meta"><span class="tag">Dashboard, UI/UX</span><span class="date">(2026)</span></div></div>
                  </div>
                  <div class="work-box fade-anim">
                    <div class="thumb"><div class="image scale" data-cursor-text="View Details" data-cursor-class="-big"><a href="/portfolio"><video class="home-work-video" autoplay muted loop playsinline preload="metadata"><source src="/portfolio/videos/portfolio-video-4.mp4" type="video/mp4"></video></a></div></div>
                    <div class="content"><h3 class="title"><a href="/portfolio">Mobile App and Web App Demo</a></h3><div class="meta"><span class="tag">Mobile App, Web App</span><span class="date">(2026)</span></div></div>
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
                  <p>Transparent starting packages for SEO-friendly websites, full-stack web applications, SaaS platforms, admin dashboards, and complete product builds.</p>
                </div>
              </div>
              <div class="pricing-grid fade-anim">
                <div class="pricing-card">
                  <span class="pricing-label">5 Page Presence</span>
                  <h3>Simple Website</h3>
                  <p class="pricing-copy">A concise, responsive, SEO-friendly business website designed for credibility, lead capture, and clear service presentation.</p>
                  <div class="pricing-price"><strong>$149</strong><span>starting</span></div>
                  <span class="pricing-time">4-7 days</span>
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
                  <div class="pricing-price"><strong>$499</strong><span>starting</span></div>
                  <span class="pricing-time">2-3 weeks</span>
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
                  <div class="pricing-price"><strong>$999</strong><span>starting</span></div>
                  <span class="pricing-time">3-5 weeks</span>
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
                  <div class="pricing-price"><strong>$1200</strong><span>starting</span></div>
                  <span class="pricing-time">4-6 weeks</span>
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
                  <div class="pricing-price"><strong>$1699</strong><span>starting</span></div>
                  <span class="pricing-time">6-8 weeks</span>
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
                      services built for
                      measurable growth</h2>
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
                  <a href="/services/web-design" class="service-box-1 item-1"><div class="thumb"><img class="show-light" src="${A}/imgs/icon/icon-s-1.webp" alt="SEO-friendly website development icon"><img class="show-dark" src="${A}/imgs/icon/icon-s-1-dark.webp" alt="SEO-friendly website development icon"></div><div class="content"><h3 class="title">Website <br> Development</h3></div></a>
                  <a href="/services/web-application-development" class="service-box-1 item-2"><div class="thumb"><img class="show-light" src="${A}/imgs/icon/icon-s-2.webp" alt="Full-stack web application development icon"><img class="show-dark" src="${A}/imgs/icon/icon-s-2-dark.webp" alt="Full-stack web application development icon"></div><div class="content"><h3 class="title">Web App <br> Development</h3></div></a>
                  <a href="/services/product-design" class="service-box-1 item-3"><div class="thumb"><img class="show-light" src="${A}/imgs/icon/icon-s-3.webp" alt="SaaS platform development icon"><img class="show-dark" src="${A}/imgs/icon/icon-s-3-dark.webp" alt="SaaS platform development icon"></div><div class="content"><h3 class="title">SaaS Platform <br> Development</h3></div></a>
                  <a href="/services/motion-content" class="service-box-1 item-4"><div class="thumb"><img class="show-light" src="${A}/imgs/icon/icon-s-4.webp" alt="Mobile app development icon"><img class="show-dark" src="${A}/imgs/icon/icon-s-4-dark.webp" alt="Mobile app development icon"></div><div class="content"><h3 class="title">Mobile App <br> Development</h3></div></a>
                  <a href="/services/brand-strategy" class="service-box-1 item-5"><div class="thumb"><img class="show-light" src="${A}/imgs/icon/icon-s-5.webp" alt="Admin dashboard development icon"><img class="show-dark" src="${A}/imgs/icon/icon-s-5-dark.webp" alt="Admin dashboard development icon"></div><div class="content"><h3 class="title">Admin <br> Dashboards</h3></div></a>
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
                    <h2 class="section-title font-bdogrotesk-regular rr_title_anim">A focused team for
                      design, frontend,
                      backend and launch</h2>
                  </div>
                </div>
              </div>
              <div class="team-wrapper-box">
                <div class="team-wrapper fade-anim">
                  <div class="team-box-1 fade-anim"><div class="thumb"><a href="/team/ameeq-khan"><img src="/team/ameeq-khan.png" alt="Ameeq Khan Opplexify full-stack product lead"></a></div><div class="content"><h3 class="name"><a href="/team/ameeq-khan">Ameeq Khan</a></h3><span class="post">Full-Stack Product Lead</span></div></div>
                  <div class="team-box-1 fade-anim"><div class="thumb"><a href="/team/atiq-khan"><img src="/team/atiq-khan.png" alt="Atiq Khan Opplexify SEO planning and launch support"></a></div><div class="content"><h3 class="name"><a href="/team/atiq-khan">Atiq Khan</a></h3><span class="post">SEO Planning and Launch Support</span></div></div>
                  <div class="team-box-1 fade-anim"><div class="thumb"><a href="/team/emmad-khan"><img src="/team/emmad-khan.png" alt="Emmad Khan Opplexify UI UX and frontend design"></a></div><div class="content"><h3 class="name"><a href="/team/emmad-khan">Emmad Khan</a></h3><span class="post">UI/UX and Frontend Design</span></div></div>
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
                    <h2 class="section-title rr_title_anim">SEO-friendly digital products built to convert visitors
                      into leads, users and paying customers</h2>
                  </div>
                </div>
              </div>
              <div class="clients-wrapper-box fade-anim">
                <div class="clients-wrapper">
                  <div class="swiper client-slider-active">
                    <div class="swiper-wrapper">
                      <div class="swiper-slide"><img class="show-light" src="${A}/imgs/brand/brand-1-light.webp" alt="image"><img class="show-dark" src="${A}/imgs/brand/brand-1.webp" alt="image"></div>
                      <div class="swiper-slide"><img class="show-light" src="${A}/imgs/brand/brand-2-light.webp" alt="image"><img class="show-dark" src="${A}/imgs/brand/brand-2.webp" alt="image"></div>
                      <div class="swiper-slide"><img class="show-light" src="${A}/imgs/brand/brand-3-light.webp" alt="image"><img class="show-dark" src="${A}/imgs/brand/brand-3.webp" alt="image"></div>
                      <div class="swiper-slide"><img class="show-light" src="${A}/imgs/brand/brand-4-light.webp" alt="image"><img class="show-dark" src="${A}/imgs/brand/brand-4.webp" alt="image"></div>
                      <div class="swiper-slide"><img class="show-light" src="${A}/imgs/brand/brand-5-light.webp" alt="image"><img class="show-dark" src="${A}/imgs/brand/brand-5.webp" alt="image"></div>
                      <div class="swiper-slide"><img class="show-light" src="${A}/imgs/brand/brand-6-light.webp" alt="image"><img class="show-dark" src="${A}/imgs/brand/brand-6.webp" alt="image"></div>
                      <div class="swiper-slide"><img class="show-light" src="${A}/imgs/brand/brand-7-light.webp" alt="image"><img class="show-dark" src="${A}/imgs/brand/brand-7.webp" alt="image"></div>
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
                <div class="title-wrapper">
                  <h2 class="title rr_title_anim">Build a website, <br> app or SaaS product
                    that <br> converts
                  </h2>
                </div>
                <a href="/contact" class="rr-btn-underline">Get a development quote</a>
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
                <h2 class="title">Social</h2>
                <ul class="footer-nav-list">
                  <li><a href="https://www.instagram.com/">Instagram</a></li>
                  <li><a href="https://www.facebook.com/">Facebook</a></li>
                  <li><a href="https://x.com/">Twitter</a></li>
                  <li><a href="https://www.linkedin.com/">LinkedIn</a></li>
                </ul>
              </div>
              <div class="footer-widget-box">
                <h2 class="title">Services</h2>
                <ul class="footer-nav-list">
                  <li><a href="/services">Website Development</a></li>
                  <li><a href="/services">SaaS Development</a></li>
                  <li><a href="/services">Mobile Apps</a></li>
                  <li><a href="/services">Admin Dashboards</a></li>
                </ul>
              </div>
            </div>
          </div>
        </div>
        <div class="copyright-area">
          <div class="copyright-area-inner">
            <div class="copyright-text">
              <p class="text">© 2026 <a href="/">Opplexify.</a> All right
                reserved</p>
            </div>
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
    "@type": "ProfessionalService",
    name: site.settings.site?.title ?? "Opplexify",
    url: siteUrl(),
    image: absoluteUrl(page?.ogImage ?? site.settings.seo?.ogImage ?? "/portfolio/images/ChatGPT%20Image%20May%208%2C%202026%2C%2006_53_16%20PM.png"),
    description:
      page?.seoDescription ??
      page?.summary ??
      "Opplexify provides SEO-friendly website development, Next.js web app development, SaaS platform development, mobile app development, admin dashboard development, and NestJS backend development.",
    areaServed: "Worldwide",
    serviceType: [
      "Website development services",
      "Full-stack web application development",
      "SaaS platform development",
      "Mobile app development",
      "Admin dashboard development",
      "Backend API development"
    ]
  };
  const renderedHtml = applyHomeCms(homeHtml, page, site, portfolioItems, services, team);

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(homeJsonLd) }} />
      {templateCssFiles.map((file) => (
        <link key={file} rel="stylesheet" href={`${A}/css/${file}`} />
      ))}
      <div
        className="digital-agency-template dark body-wrapper body-digital-agency"
        dangerouslySetInnerHTML={{ __html: renderedHtml }}
      />
      <DigitalAgencyRuntime />
    </>
  );
}
