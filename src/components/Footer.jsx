import { useState } from "react";
import { Link } from "react-router-dom";
import { FOOTER_NAV } from "../config/navigation";
import { useNavigation } from "../contexts/NavigationContext";
import logo from "../assets/logo.png";
import {
  IconWhatsApp,
  IconFacebook,
  IconLinkedIn,
  IconInstitution,
  IconGear,
  IconDoc,
  IconChevronRight,
  IconMail,
  IconPin,
} from "./Icons";

/*
 * SOSARI Footer
 * - Main footer social icons have been removed.
 * - A single Contact button is placed in the bottom bar.
 * - Clicking Contact opens a clean contact panel with:
 *   WhatsApp, Facebook, LinkedIn, Instagram and Email.
 *
 * IMPORTANT:
 * Replace INSTAGRAM_LINK with SOSARI's real Instagram URL when available.
 */

const WHATSAPP_LINK = "https://wa.me/252612880114";
const FACEBOOK_LINK = "https://www.facebook.com/share/1adtVKQ2KX/";
const LINKEDIN_LINK =
  "https://www.linkedin.com/company/somali-statistics-and-research-institute-sosari/";
const INSTAGRAM_LINK = "#";
const EMAIL_LINK = "mailto:info@sosari.so";

const COLUMN_ICON = {
  INSTITUTE: IconInstitution,
  WORK: IconGear,
  "KNOWLEDGE & ENGAGEMENT": IconDoc,
};

// A footer item marked isParent points at a whole category (e.g. "Research"),
// which by itself only lands on that category's overview/listing page.
// To take the person straight to real content instead of another list of
// links, we resolve it to that category's first actual sub-page.
function resolveFooterHref(nav, key) {
  if (!key.includes("/")) {
    const group = nav.find((g) => g.key === key);
    if (group) {
      const firstChild = group.items
        ? group.items[0]
        : group.groups?.[0]?.items?.[0];
      if (firstChild) return `/section/${firstChild.key}`;
    }
  }
  return `/section/${key}`;
}

export default function Footer() {
  const { nav: NAV } = useNavigation();
  const [contactOpen, setContactOpen] = useState(false);

  const closeContact = () => setContactOpen(false);

  return (
    <>
      <footer className="sosariFooter">
        <div className="sosariFooterGlow" aria-hidden="true" />
        <div className="sosariFooterDots" aria-hidden="true" />
        <div className="sosariFooterWave sosariFooterWaveOne" aria-hidden="true" />
        <div className="sosariFooterWave sosariFooterWaveTwo" aria-hidden="true" />

        <div className="sosariFooterInner">
          {/* BRAND */}
          <section className="sosariBrand">
            <div className="sosariLogoBox">
              <img
                src={logo}
                className="sosariLogo"
                alt="SOSARI — Somali Statistics and Research Institute"
              />
            </div>

            <h3>Somali Statistics and Research Institute (SOSARI)</h3>

            <p className="sosariTagline">
              Evidence. Data. Policy. <span>Impact.</span>
            </p>

            <div className="sosariBrandLine" />

            <p className="sosariDescription">
              Advancing evidence-based solutions for a brighter, more
              prosperous Somalia.
            </p>

            {/* Contact is intentionally kept as one button here.
                Social media icons appear only after clicking it. */}
            <button
              type="button"
              className="sosariContactButton"
              onClick={() => setContactOpen(true)}
              aria-haspopup="dialog"
              aria-expanded={contactOpen}
            >
              <span className="sosariContactButtonIcon">
                <IconMail />
              </span>
              <span>Contact Us</span>
              <span className="sosariContactArrow">→</span>
            </button>

            <div className="sosariSignature">A Brighter Somalia</div>
          </section>

          {/* NAVIGATION */}
          {FOOTER_NAV.map((col) => {
            const ColIcon = COLUMN_ICON[col.title] || IconDoc;

            return (
              <section className="sosariColumn" key={col.title}>
                <div className="sosariColumnTitle">
                  <span className="sosariColumnIcon">
                    <ColIcon />
                  </span>

                  <div>
                    <h4>{col.title}</h4>
                    <span className="sosariTitleLine" />
                  </div>
                </div>

                <nav className="sosariLinks" aria-label={col.title}>
                  {col.items.map((it) =>
                    it.key === "__partner__" ? (
                      <Link key={it.label} to="/partner">
                        <IconChevronRight />
                        <span>{it.label}</span>
                      </Link>
                    ) : (
                      <Link key={it.label} to={resolveFooterHref(NAV, it.key)}>
                        <IconChevronRight />
                        <span>{it.label}</span>
                      </Link>
                    )
                  )}
                </nav>
              </section>
            );
          })}

          {/* CONTACT / LOCATION */}
          <section className="sosariColumn sosariContactColumn">
            <div className="sosariColumnTitle">
              <span className="sosariColumnIcon">
                <IconMail />
              </span>

              <div>
                <h4>GET IN TOUCH</h4>
                <span className="sosariTitleLine" />
              </div>
            </div>

            <div className="sosariContactInfo">
              <div className="sosariInfoItem">
                <span className="sosariInfoIcon">
                  <IconPin />
                </span>
                <div>
                  <strong>Location</strong>
                  <span>Mogadishu, Somalia</span>
                </div>
              </div>

              <div className="sosariInfoItem">
                <span className="sosariInfoIcon">
                  <IconMail />
                </span>
                <div>
                  <strong>Email Us</strong>
                  <a href={EMAIL_LINK}>info@sosari.so</a>
                </div>
              </div>

              <div className="sosariInfoItem">
                <span className="sosariInfoIcon sosariPhoneIcon">☎</span>
                <div>
                  <strong>Call Us</strong>
                  <a href="tel:+252612880114">+252 61 288 0114</a>
                </div>
              </div>
            </div>

            <div className="sosariStrongSomalia">
              <span>DATA FOR PEOPLE</span>
              <span>A STRONGER SOMALIA</span>
            </div>
          </section>
        </div>

        {/* BOTTOM BAR */}
        <div className="sosariBottomBar">
          <div className="sosariBottomInner">
            <p>
              © {new Date().getFullYear()} Somali Statistics and Research
              Institute (SOSARI). All rights reserved.
            </p>

            <div className="sosariBottomLinks">
              <Link to="/privacy">Privacy Policy</Link>
              <span>•</span>
              <Link to="/research-ethics">Research Ethics</Link>
              <span>•</span>
              <Link to="/safeguarding">Safeguarding</Link>
              <span>•</span>
              <Link to="/accessibility">Accessibility</Link>
            </div>


            {/* Correct Somali flag: blue field + centered white five-point star */}
            <div className="sosariFlag" aria-label="Somalia flag" title="Somalia">
              <span>★</span>
            </div>

            <Link to="/admin/login" className="sosariAdminButton">
              Admin
            </Link>

            <button
              type="button"
              className="sosariTopButton"
              aria-label="Back to top"
              onClick={() =>
                window.scrollTo({ top: 0, behavior: "smooth" })
              }
            >
              ↑
            </button>
          </div>
        </div>
      </footer>

      {/* CONTACT MODAL */}
      {contactOpen && (
        <div
          className="sosariContactOverlay"
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) closeContact();
          }}
        >
          <div
            className="sosariContactModal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="sosari-contact-title"
          >
            <button
              type="button"
              className="sosariModalClose"
              onClick={closeContact}
              aria-label="Close contact panel"
            >
              ×
            </button>

            <div className="sosariModalFlag">
              <span>★</span>
            </div>

            <p className="sosariModalEyebrow">SOSARI</p>
            <h2 id="sosari-contact-title">Get in Touch</h2>
            <p className="sosariModalText">
              Contact Somali Statistics and Research Institute through your
              preferred channel.
            </p>

            <div className="sosariSocialGrid">
              <a
                href={WHATSAPP_LINK}
                target="_blank"
                rel="noopener noreferrer"
                className="sosariSocialCard whatsapp"
              >
                <span>
                  <IconWhatsApp />
                </span>
                <div>
                  <strong>WhatsApp</strong>
                  <small>+252 61 288 0114</small>
                </div>
              </a>

              <a
                href={FACEBOOK_LINK}
                target="_blank"
                rel="noopener noreferrer"
                className="sosariSocialCard facebook"
              >
                <span>
                  <IconFacebook />
                </span>
                <div>
                  <strong>Facebook</strong>
                  <small>Follow SOSARI</small>
                </div>
              </a>

              <a
                href={LINKEDIN_LINK}
                target="_blank"
                rel="noopener noreferrer"
                className="sosariSocialCard linkedin"
              >
                <span>
                  <IconLinkedIn />
                </span>
                <div>
                  <strong>LinkedIn</strong>
                  <small>SOSARI Institute</small>
                </div>
              </a>

              <a
                href={INSTAGRAM_LINK}
                target="_blank"
                rel="noopener noreferrer"
                className="sosariSocialCard instagram"
                onClick={(event) => {
                  if (INSTAGRAM_LINK === "#") event.preventDefault();
                }}
              >
                <span className="sosariInstagramIcon">◎</span>
                <div>
                  <strong>Instagram</strong>
                  <small>Follow SOSARI</small>
                </div>
              </a>

              <a
                href={EMAIL_LINK}
                className="sosariSocialCard email"
              >
                <span>
                  <IconMail />
                </span>
                <div>
                  <strong>Email</strong>
                  <small>info@sosari.so</small>
                </div>
              </a>
            </div>

            <div className="sosariModalPhone">
              <span>☎</span>
              <a href="tel:+252612880114">+252 61 288 0114</a>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .sosariFooter {
          position: relative;
          overflow: hidden;
          color: #fff;
          background:
            radial-gradient(circle at 88% 12%, rgba(66, 177, 255, .30), transparent 25%),
            linear-gradient(135deg, #063b78 0%, #0757a4 45%, #006bc8 100%);
          font-family: inherit;
        }

        .sosariFooterGlow {
          position: absolute;
          inset: auto -10% -45% 25%;
          height: 520px;
          background: radial-gradient(ellipse, rgba(50, 181, 255, .22), transparent 67%);
          pointer-events: none;
        }

        .sosariFooterDots {
          position: absolute;
          top: 0;
          right: 0;
          width: 360px;
          height: 100%;
          opacity: .18;
          background-image: radial-gradient(#fff 1.5px, transparent 1.5px);
          background-size: 22px 22px;
          mask-image: linear-gradient(to left, #000, transparent);
          pointer-events: none;
        }

        .sosariFooterWave {
          position: absolute;
          left: -5%;
          width: 110%;
          height: 130px;
          border-radius: 50%;
          pointer-events: none;
        }

        .sosariFooterWaveOne {
          bottom: 45px;
          background: rgba(0, 94, 177, .25);
          transform: rotate(-3deg);
        }

        .sosariFooterWaveTwo {
          bottom: -100px;
          background: rgba(0, 46, 105, .24);
          transform: rotate(3deg);
        }

        .sosariFooterInner {
          position: relative;
          z-index: 2;
          width: min(1500px, calc(100% - 70px));
          margin: 0 auto;
          padding: 38px 0 42px;
          display: grid;
          grid-template-columns: 1.35fr repeat(3, 1fr) 1.15fr;
          gap: 0;
        }

        .sosariBrand,
        .sosariColumn {
          min-width: 0;
          padding: 0 24px;
        }

        .sosariBrand {
          padding-left: 0;
        }

        .sosariColumn {
          border-left: 1px solid rgba(255,255,255,.18);
        }

        .sosariLogoBox {
          width: 175px;
          height: 130px;
          display: grid;
          place-items: center;
          padding: 12px;
          border-radius: 16px;
          background: rgba(255,255,255,.97);
          box-shadow: 0 20px 45px rgba(0, 27, 70, .20);
        }

        .sosariLogo {
          width: 100%;
          height: 100%;
          object-fit: contain;
        }

        .sosariBrand h3 {
          max-width: 390px;
          margin: 18px 0 6px;
          font-size: 14px;
          line-height: 1.3;
          font-weight: 800;
          letter-spacing: -.3px;
        }

        .sosariTagline {
          margin: 0;
          color: #dcecff;
          font-size: 10px;
        }

        .sosariTagline span {
          color: #54d6e8;
        }

        .sosariBrandLine {
          width: 48px;
          height: 2px;
          margin: 15px 0 12px;
          border-radius: 5px;
          background: #59d9e9;
        }

        .sosariDescription {
          max-width: 310px;
          margin: 0;
          color: #e5f1ff;
          font-size: 10px;
          line-height: 1.65;
        }

        .sosariContactButton {
          display: flex;
          align-items: center;
          gap: 13px;
          margin-top: 17px;
          padding: 6px 11px 6px 6px;
          min-width: 170px;
          border: 1px solid rgba(255,255,255,.65);
          border-radius: 50px;
          background: linear-gradient(90deg, #fff, #ccecff);
          color: #07519a;
          font: inherit;
          font-weight: 800;
          cursor: pointer;
          box-shadow: 0 12px 30px rgba(0,0,0,.16);
          transition: transform .2s ease, box-shadow .2s ease;
        }

        .sosariContactButton:hover {
          transform: translateY(-2px);
          box-shadow: 0 16px 35px rgba(0,0,0,.22);
        }

        .sosariContactButtonIcon {
          width: 32px;
          height: 32px;
          display: grid;
          place-items: center;
          border-radius: 50%;
          background: #0877d4;
          color: #fff;
        }

        .sosariContactButtonIcon svg {
          width: 20px;
          height: 20px;
        }

        .sosariContactArrow {
          margin-left: auto;
          font-size: 14px;
        }

        .sosariSignature {
          margin-top: 16px;
          color: rgba(255,255,255,.75);
          font-size: 16px;
          font-style: italic;
          letter-spacing: .3px;
        }

        .sosariColumnTitle {
          display: flex;
          align-items: center;
          gap: 15px;
          margin-bottom: 20px;
        }

        .sosariColumnIcon {
          flex: 0 0 42px;
          width: 42px;
          height: 42px;
          display: grid;
          place-items: center;
          border-radius: 50%;
          background: rgba(95,184,255,.30);
          border: 1px solid rgba(255,255,255,.12);
          box-shadow: inset 0 0 0 7px rgba(255,255,255,.03);
        }

        .sosariColumnIcon svg {
          width: 20px;
          height: 20px;
        }

        .sosariColumnTitle h4 {
          margin: 0;
          font-size: 14px;
          line-height: 1.25;
          letter-spacing: .7px;
          font-weight: 850;
        }

        .sosariTitleLine {
          display: block;
          width: 35px;
          height: 2px;
          margin-top: 9px;
          background: #57d9e9;
          border-radius: 5px;
        }

        .sosariLinks {
          display: flex;
          flex-direction: column;
          gap: 11px;
        }

        .sosariLinks a {
          display: flex;
          align-items: center;
          gap: 9px;
          color: #dcecff;
          text-decoration: none;
          font-size: 10px;
          line-height: 1.35;
          transition: color .2s ease, transform .2s ease;
        }

        .sosariLinks a svg {
          width: 14px;
          height: 14px;
          color: #54d8e8;
          flex: 0 0 auto;
        }

        .sosariLinks a:hover {
          color: #fff;
          transform: translateX(4px);
        }

        .sosariContactInfo {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .sosariInfoItem {
          display: flex;
          align-items: flex-start;
          gap: 13px;
        }

        .sosariInfoIcon {
          width: 28px;
          height: 28px;
          flex: 0 0 34px;
          display: grid;
          place-items: center;
          border: 1px solid rgba(255,255,255,.28);
          border-radius: 50%;
          background: rgba(0, 75, 150, .28);
        }

        .sosariInfoIcon svg {
          width: 20px;
          height: 20px;
        }

        .sosariPhoneIcon {
          color: #fff;
          font-size: 16px;
        }

        .sosariInfoItem div {
          display: flex;
          flex-direction: column;
          gap: 4px;
          min-width: 0;
        }

        .sosariInfoItem strong {
          font-size: 10px;
          font-weight: 800;
        }

        .sosariInfoItem span,
        .sosariInfoItem a {
          color: #dcecff;
          font-size: 10px;
          line-height: 1.45;
          text-decoration: none;
        }

        .sosariInfoItem a:hover {
          color: #fff;
          text-decoration: underline;
        }

        .sosariStrongSomalia {
          display: flex;
          flex-direction: column;
          gap: 4px;
          margin-top: 18px;
          padding-top: 14px;
          border-top: 1px solid rgba(255,255,255,.18);
          color: #9de8f2;
          font-size: 10px;
          font-style: italic;
          letter-spacing: 1.7px;
        }

        .sosariBottomBar {
          position: relative;
          z-index: 5;
          border-top: 1px solid rgba(255,255,255,.22);
          background: rgba(0, 43, 91, .48);
          backdrop-filter: blur(8px);
        }

        .sosariBottomInner {
          width: min(1500px, calc(100% - 70px));
          min-height: 54px;
          margin: 0 auto;
          display: flex;
          align-items: center;
          gap: 13px;
        }

        .sosariBottomInner p {
          margin: 0;
          color: #cce4fb;
          font-size: 10px;
          flex: 1;
        }

        .sosariBottomLinks {
          display: flex;
          align-items: center;
          gap: 9px;
          color: #cce4fb;
          font-size: 10px;
          white-space: nowrap;
        }

        .sosariBottomLinks a {
          color: inherit;
          text-decoration: none;
        }

        .sosariBottomLinks a:hover {
          color: #fff;
        }

        .sosariBottomContact {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          border: 0;
          background: transparent;
          color: #fff;
          font: inherit;
          font-size: 10px;
          font-weight: 800;
          cursor: pointer;
          white-space: nowrap;
        }

        .sosariBottomContactIcon {
          width: 28px;
          height: 28px;
          display: grid;
          place-items: center;
          border-radius: 50%;
          background: #1686df;
        }

        .sosariFlag {
          width: 40px;
          height: 28px;
          display: grid;
          place-items: center;
          background: #4189dd;
          box-shadow: 0 5px 15px rgba(0,0,0,.15);
        }

        .sosariFlag span {
          color: #fff;
          font-size: 16px;
          line-height: 1;
          text-shadow: 0 1px 2px rgba(0,0,0,.15);
        }

        .sosariAdminButton {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          padding: 11px 26px;
          border-radius: 50px;
          background: linear-gradient(90deg, var(--orange), var(--orange2));
          color: #fff;
          font-weight: 900;
          font-size: 14px;
          letter-spacing: .3px;
          text-decoration: none;
          white-space: nowrap;
          box-shadow: 0 10px 26px rgba(0,0,0,.22);
          transition: transform .2s ease, box-shadow .2s ease;
        }

        .sosariAdminButton:hover {
          transform: translateY(-2px);
          box-shadow: 0 14px 32px rgba(0,0,0,.28);
          color: #fff;
        }

        .sosariTopButton {
          width: 28px;
          height: 28px;
          border: 1px solid rgba(255,255,255,.28);
          border-radius: 50%;
          background: transparent;
          color: #fff;
          cursor: pointer;
          font-size: 14px;
        }

        .sosariTopButton:hover {
          background: rgba(255,255,255,.12);
        }

        /* CONTACT MODAL */
        .sosariContactOverlay {
          position: fixed;
          inset: 0;
          z-index: 9999;
          display: grid;
          place-items: center;
          padding: 20px;
          background: rgba(1, 21, 49, .72);
          backdrop-filter: blur(8px);
        }

        .sosariContactModal {
          position: relative;
          width: min(560px, 100%);
          padding: 34px;
          border: 1px solid rgba(255,255,255,.7);
          border-radius: 28px;
          color: #12375d;
          background: #fff;
          box-shadow: 0 30px 100px rgba(0,0,0,.35);
          animation: sosariModalIn .22s ease-out;
        }

        @keyframes sosariModalIn {
          from {
            opacity: 0;
            transform: translateY(14px) scale(.98);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        .sosariModalClose {
          position: absolute;
          top: 17px;
          right: 17px;
          width: 38px;
          height: 38px;
          border: 0;
          border-radius: 50%;
          background: #eef6ff;
          color: #0b559d;
          font-size: 16px;
          cursor: pointer;
        }

        .sosariModalFlag {
          width: 58px;
          height: 39px;
          display: grid;
          place-items: center;
          margin-bottom: 18px;
          border-radius: 7px;
          background: #4189dd;
        }

        .sosariModalFlag span {
          color: #fff;
          font-size: 14px;
        }

        .sosariModalEyebrow {
          margin: 0 0 5px;
          color: #0877d4;
          font-size: 10px;
          font-weight: 900;
          letter-spacing: 2px;
        }

        .sosariContactModal h2 {
          margin: 0;
          color: #073f79;
          font-size: 30px;
        }

        .sosariModalText {
          margin: 9px 0 22px;
          color: #60758c;
          font-size: 10px;
          line-height: 1.6;
        }

        .sosariSocialGrid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 12px;
        }

        .sosariSocialCard {
          display: flex;
          align-items: center;
          gap: 12px;
          min-height: 54px;
          padding: 12px;
          border: 1px solid #e0ebf6;
          border-radius: 17px;
          background: #f8fbff;
          color: #173e65;
          text-decoration: none;
          transition: transform .2s ease, box-shadow .2s ease, border-color .2s ease;
        }

        .sosariSocialCard:hover {
          transform: translateY(-2px);
          border-color: #8bc9f4;
          box-shadow: 0 10px 24px rgba(4, 72, 135, .12);
        }

        .sosariSocialCard > span {
          width: 45px;
          height: 45px;
          flex: 0 0 45px;
          display: grid;
          place-items: center;
          border-radius: 13px;
          background: #eaf5ff;
          color: #0877d4;
        }

        .sosariSocialCard > span svg {
          width: 23px;
          height: 23px;
        }

        .sosariSocialCard div {
          display: flex;
          flex-direction: column;
          gap: 3px;
          min-width: 0;
        }

        .sosariSocialCard strong {
          font-size: 10px;
        }

        .sosariSocialCard small {
          overflow: hidden;
          color: #75899e;
          font-size: 10px;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .sosariSocialCard.whatsapp > span {
          color: #1aad62;
          background: #e8fbf1;
        }

        .sosariSocialCard.facebook > span {
          color: #1877f2;
          background: #eaf2ff;
        }

        .sosariSocialCard.linkedin > span {
          color: #0a66c2;
          background: #e8f3ff;
        }

        .sosariSocialCard.instagram > span {
          color: #c13584;
          background: #fff0f7;
        }

        .sosariInstagramIcon {
          font-size: 31px;
          font-weight: 300;
          line-height: 1;
        }

        .sosariSocialCard.email > span {
          color: #0877d4;
        }

        .sosariModalPhone {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          margin-top: 18px;
          padding-top: 17px;
          border-top: 1px solid #e6eef6;
          color: #0877d4;
          font-size: 10px;
          font-weight: 800;
        }

        .sosariModalPhone a {
          color: inherit;
          text-decoration: none;
        }

        @media (max-width: 1250px) {
          .sosariFooterInner {
            grid-template-columns: 1.25fr repeat(3, 1fr);
          }

          .sosariContactColumn {
            grid-column: 2 / -1;
            margin-top: 45px;
            padding-top: 35px;
            border-top: 1px solid rgba(255,255,255,.18);
            border-left: 0;
          }

          .sosariContactInfo {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
          }

          .sosariStrongSomalia {
            max-width: 300px;
          }

          .sosariBottomInner {
            flex-wrap: wrap;
            padding: 17px 0;
          }
        }

        @media (max-width: 900px) {
          .sosariFooterInner {
            width: min(100% - 40px, 680px);
            grid-template-columns: repeat(2, 1fr);
            row-gap: 45px;
            padding: 45px 0;
          }

          .sosariBrand {
            grid-column: 1 / -1;
            padding-right: 0;
          }

          .sosariColumn {
            padding: 0 20px;
          }

          .sosariColumn:nth-of-type(2) {
            border-left: 0;
          }

          .sosariContactColumn {
            grid-column: 1 / -1;
            margin-top: 0;
            padding-top: 0;
            border-top: 0;
            border-left: 0;
          }

          .sosariContactInfo {
            grid-template-columns: 1fr;
          }

          .sosariBottomInner {
            width: calc(100% - 40px);
          }

          .sosariBottomLinks {
            order: 4;
            width: 100%;
            justify-content: center;
            flex-wrap: wrap;
          }
        }

        @media (max-width: 600px) {
          .sosariFooterInner {
            grid-template-columns: 1fr;
          }

          .sosariBrand,
          .sosariColumn {
            grid-column: auto;
            padding: 0;
            border-left: 0;
          }

          .sosariLogoBox {
            width: 210px;
            height: 155px;
          }

          .sosariBrand h3 {
            font-size: 16px;
          }

          .sosariSocialGrid {
            grid-template-columns: 1fr;
          }

          .sosariContactModal {
            padding: 28px 18px 22px;
            border-radius: 16px;
          }

          .sosariBottomInner {
            justify-content: center;
          }

          .sosariBottomInner p {
            flex: auto;
            width: 100%;
            text-align: center;
          }

          .sosariBottomContact {
            margin-left: auto;
          }

          .sosariFlag {
            margin-right: auto;
          }
        }

        /* Compact desktop sizing */
        .sosariFooterInner {
          width: min(1500px, calc(100% - 70px));
          padding: 38px 0 42px;
        }

        .sosariBrand,
        .sosariColumn {
          padding-left: 24px;
          padding-right: 24px;
        }

        .sosariBrand {
          padding-left: 0;
        }

        .sosariLogoBox {
          width: 175px;
          height: 130px;
          padding: 12px;
          border-radius: 16px;
        }

        .sosariBrand h3 {
          max-width: 310px;
          margin: 18px 0 6px;
          font-size: 17px;
          line-height: 1.25;
        }

        .sosariTagline {
          font-size: 13px;
        }

        .sosariBrandLine {
          width: 48px;
          height: 2px;
          margin: 15px 0 12px;
        }

        .sosariDescription {
          max-width: 310px;
          font-size: 12px;
          line-height: 1.5;
        }

        .sosariContactButton {
          margin-top: 17px;
          min-width: 170px;
          padding: 6px 11px 6px 6px;
        }

        .sosariContactButtonIcon {
          width: 32px;
          height: 32px;
        }

        .sosariColumnTitle {
          gap: 11px;
          margin-bottom: 20px;
        }

        .sosariColumnIcon {
          flex-basis: 42px;
          width: 42px;
          height: 42px;
        }

        .sosariColumnIcon svg {
          width: 20px;
          height: 20px;
        }

        .sosariColumnTitle h4 {
          font-size: 14px;
        }

        .sosariTitleLine {
          width: 28px;
          height: 2px;
          margin-top: 7px;
        }

        .sosariLinks {
          gap: 11px;
        }

        .sosariLinks a {
          font-size: 12px;
        }

        .sosariContactInfo {
          gap: 16px;
        }

        .sosariInfoItem {
          gap: 10px;
        }

        .sosariInfoIcon {
          width: 34px;
          height: 34px;
          flex-basis: 34px;
        }

        .sosariInfoIcon svg {
          width: 17px;
          height: 17px;
        }

        .sosariInfoItem strong {
          font-size: 11px;
        }

        .sosariInfoItem span,
        .sosariInfoItem a {
          font-size: 11px;
        }

        .sosariStrongSomalia {
          margin-top: 18px;
          padding-top: 14px;
          font-size: 9px;
          letter-spacing: 1.7px;
        }

        .sosariBottomInner {
          width: min(1500px, calc(100% - 70px));
          min-height: 58px;
          gap: 13px;
        }

        .sosariBottomInner p {
          font-size: 10px;
        }

        .sosariBottomLinks {
          gap: 7px;
          font-size: 9px;
        }

        .sosariBottomContact {
          font-size: 10px;
        }

        .sosariBottomContactIcon {
          width: 28px;
          height: 28px;
        }

        .sosariFlag {
          width: 40px;
          height: 28px;
        }

        .sosariFlag span {
          font-size: 14px;
        }

        .sosariTopButton {
          width: 28px;
          height: 28px;
          font-size: 14px;
        }

        /* Keep the modal readable even though the footer itself is compact. */
        .sosariContactModal h2 {
          font-size: 30px;
        }

        @media (max-width: 900px) {
          .sosariFooterInner,
          .sosariBottomInner {
            width: calc(100% - 40px);
          }
        }


        /* FINAL LOGO FIX
           Keep the SOSARI logo compact and completely inside its white box.
           The title below must never be covered by the image. */
        .sosariBrand {
          position: relative;
          overflow: visible;
        }

        .sosariLogoBox {
          position: relative;
          width: 175px;
          height: 120px;
          margin: 0;
          padding: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
          box-sizing: border-box;
          border-radius: 16px;
        }

        .sosariLogo {
          display: block;
          width: auto;
          height: auto;
          max-width: 100%;
          max-height: 100%;
          object-fit: contain;
          object-position: center;
          margin: 0;
        }

        .sosariBrand h3 {
          position: relative;
          z-index: 2;
          width: 100%;
          max-width: 310px;
          margin: 14px 0 6px;
          font-size: 17px;
          line-height: 1.28;
          overflow: visible;
        }

        @media (max-width: 600px) {
          .sosariLogoBox {
            width: 190px;
            height: 135px;
          }

          .sosariBrand h3 {
            max-width: 100%;
            margin-top: 14px;
            font-size: 16px;
          }
        }

      `}</style>
    </>
  );
}