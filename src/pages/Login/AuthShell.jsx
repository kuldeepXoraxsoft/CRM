import "./Login.css";

import { useOrganization } from "../../context/OrganizationContext";

// Same left/right layout as the Login page, so all auth pages look consistent
export default function AuthShell({ title, subtitle, children }) {
  const { companyName: APP_NAME, logoUrl } = useOrganization();

  return (
    <div className="login-page">
      <aside className="login-brand">
        <div className="brand-row">
          <img src={logoUrl} alt="" className="brand-logo" />
          <span className="brand-name">{APP_NAME}</span>
        </div>

        <div className="brand-copy">
          <p className="brand-kicker">Customer Relationship Platform</p>
          <h2 className="brand-heading">
            Manage leads, accounts and tasks in one place.
          </h2>
        </div>

        <div className="brand-showcase">
          <picture>
            <source srcSet="/login-showcase.webp" type="image/webp" />
            <img
              src="/login-showcase.png"
              alt="CRM dashboard showing leads, accounts and tasks"
              loading="eager"
              draggable={false}
            />
          </picture>
        </div>
      </aside>

      <main className="login-main">
        <div className="login-wrap">
          <div className="brand-row brand-row-mobile">
            <img src={logoUrl} alt="" className="brand-logo" />
            <span className="brand-name">{APP_NAME}</span>
          </div>

          <div className="login-card">
            <div className="login-head">
              <h1 className="login-title">{title}</h1>
              {subtitle && <p className="login-subtitle">{subtitle}</p>}
            </div>

            {children}
          </div>

          <p className="login-footnote">Secure access to your {APP_NAME} workspace</p>
        </div>
      </main>
    </div>
  );
}