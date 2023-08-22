"use client";

import { Icons } from "@components/common";
import { DiscordLogo, GithubLogo, TwitterLogo } from "@phosphor-icons/react";

const Footer = () => {
  return (
    <footer>
      <div className="footer-inner">
        <div className="content">
          <div className="footer-block">
            <div className="footer-block-header">
              <div className="inner">
                <div className="app-logo">
                  <Icons.AppLogo size={23} />
                </div>
              </div>
            </div>

            <div className="mailing">
              <h3>
                Subscribe to our mailing list for the latest feature releases!
              </h3>

              <div className="mailing-input">
                <input type="text" placeholder="Enter your email address" />
                <button className="btn btn-primary">Subscribe</button>
              </div>
            </div>

            <div className="socials">
              {[
                {
                  icon: <TwitterLogo size={18} weight="fill" />,
                  url: "#",
                },
                {
                  icon: <GithubLogo size={18} weight="fill" />,
                  url: "#",
                },
                {
                  icon: <DiscordLogo size={18} weight="fill" />,
                  url: "#",
                },
                {
                  icon: <Icons.XRPL size={18} />,
                  url: "#",
                },
              ].map((item, index) => {
                return (
                  <a
                    key={index}
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {item.icon}
                  </a>
                );
              })}
            </div>
          </div>

          <div className="footer-block">
            <div className="footer-block-header">
              <div className="inner" />
            </div>

            <div className="external-links">
              <div className="links">
                <div className="header">Menu</div>
                <ul>
                  {["Collections", "Auctions", "Marketplace", "Rewards"].map(
                    (item, index) => {
                      return (
                        <li key={index}>
                          <a href="#">{item}</a>
                        </li>
                      );
                    }
                  )}
                </ul>
              </div>

              <div className="links">
                <div className="header">Developers</div>
                <ul>
                  {[
                    "What is XRPL?",
                    "Tutorials",
                    "API Reference",
                    "Dev Discord",
                  ].map((item, index) => {
                    return (
                      <li key={index}>
                        <a href="#">{item}</a>
                      </li>
                    );
                  })}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="footer-bottom">
        <div className="footer-bottom__content">
          <div>
            <p>2023 © Xuptimart</p>
          </div>
          <div>
            <p>Made with ❤️ by&nbsp;</p>
            <a href="https://alphaglitch.dev" target="_blank">
              Kester
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
