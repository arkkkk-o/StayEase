import { useEffect, useState } from "react";
import "./App.css";
import SiteChrome from "./SiteChrome";
import RoomAmenities from "./RoomAmenities";
import ReservationPage from "./ReservationPage";

import logo from "./assets/logo1.png";
import building from "./assets/building.png";
import pool from "./assets/pool.png";
import spa from "./assets/spa.png";
import bfast from "./assets/bfast.png";
import restau from "./assets/restau.png";
import "./responsive.css";

const API_BASE_URL = "http://localhost/stayease-api/stayease.php";

async function requestApi(action, options = {}) {
  const url = new URL(API_BASE_URL);
  url.searchParams.set("action", action);

  const response = await fetch(url, {
    credentials: "include",
    ...options,
  });

  let data;

  try {
    data = await response.json();
  } catch {
    throw new Error(`The API returned an invalid response (${response.status}).`);
  }

  if (!response.ok || data.success === false) {
    const error = new Error(
      data.error ||
        data.message ||
        `The request failed (${response.status}).`
    );
    error.data = data.data;
    error.errorCode = data.error_code;
    throw error;
  }

  return data.data;
}

function LegalModal({ type, onClose }) {
  const content = {
    privacy: {
      label: "STAYEASE",
      title: "Privacy Policy",
      text: `StayEase values your privacy. Information provided during account creation and reservation is used to manage your StayEase experience, reservations, guest details, and service requests.`,
    },
    terms: {
      label: "STAYEASE",
      title: "Terms & Conditions",
      text: `By using StayEase, you agree to provide accurate reservation information and to follow the policies associated with your selected stay and hotel services.`,
    },
  };

  const item = content[type] || content.privacy;

  return (
    <div
      className="legal-overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby="legal-title"
      onMouseDown={onClose}
    >
      <div
        className="legal-modal"
        onMouseDown={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          className="modal-close"
          onClick={onClose}
          aria-label="Close popup"
        >
          ×
        </button>

        <div className="legal-logo-wrap">
          <img src={logo} alt="StayEase" />
        </div>

        <span className="legal-eyebrow">{item.label}</span>

        <h2 id="legal-title">{item.title}</h2>

        <div className="legal-divider" />

        <p>{item.text}</p>

        <button
          type="button"
          className="primary-button legal-close-button"
          onClick={onClose}
        >
          CLOSE
        </button>
      </div>
    </div>
  );
}

function SiteFooter({
  onBookNow,
  onRooms,
  onOpenLegal,
  goDashboardSection,
}) {
  return (
    <footer className="stayease-footer">
      <div className="footer-main">
        <div className="footer-brand">
          <div className="footer-logo-glow">
            <img src={logo} alt="StayEase" />
          </div>

          <p>A softer way to stay.</p>
        </div>

        <div className="footer-column">
          <span>EXPLORE</span>

          <button
            type="button"
            onClick={() => goDashboardSection("home")}
          >
            Home
          </button>

          <button
            type="button"
            onClick={() => goDashboardSection("amenities")}
          >
            Amenities
          </button>

          <button
            type="button"
            onClick={() => goDashboardSection("about")}
          >
            About
          </button>

          <button
            type="button"
            onClick={() => goDashboardSection("contact")}
          >
            Contact
          </button>
        </div>

        <div className="footer-column">
          <span>STAYEASE</span>

          <button type="button" onClick={onRooms}>
            Rooms & Amenities
          </button>

          <button type="button" onClick={onBookNow}>
            Book Your Stay
          </button>

          <button
            type="button"
            onClick={() => onOpenLegal("privacy")}
          >
            Privacy Policy
          </button>

          <button
            type="button"
            onClick={() => onOpenLegal("terms")}
          >
            Terms & Conditions
          </button>
        </div>
      </div>

      <div className="footer-bottom">
        <p>© 2026 StayEase. All rights reserved.</p>

        <p>A softer way to stay.</p>
      </div>
    </footer>
  );
}

function WelcomePage({ onFinished }) {
  useEffect(() => {
    const timer = setTimeout(onFinished, 3600);

    return () => clearTimeout(timer);
  }, [onFinished]);

  return (
    <div className="welcome-page">
      <div className="welcome-image" />
      <div className="welcome-overlay" />

      <div className="welcome-content">
        <img
          src={logo}
          className="welcome-logo"
          alt="StayEase"
        />

        <p className="welcome-eyebrow">
          WELCOME TO
        </p>

        <h1>StayEase</h1>

        <p className="welcome-tagline">
          A softer way to stay.
        </p>
      </div>
    </div>
  );
}

function EmailVerificationPage({ email, onVerified, onBack }) {
  const [code, setCode] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);

  const verifyCode = async (event) => {
    event.preventDefault();

    if (!/^\d{6}$/.test(code)) {
      setMessage("Enter the 6-digit verification code.");
      return;
    }

    setLoading(true);

    try {
      const data = await requestApi("verify-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code }),
      });

      onVerified(data.user);
    } catch (error) {
      setMessage(error.message);
    } finally {
      setLoading(false);
    }
  };

  const resendCode = async () => {
    setResending(true);
    setMessage("");

    try {
      await requestApi("resend-verification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      setCode("");
      setMessage("A new verification code has been sent.");
    } catch (error) {
      setMessage(error.message);
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card auth-card-wide">
        <div className="auth-visual">
          <div
            className="auth-visual-photo"
            style={{ backgroundImage: `url(${building})` }}
          />
          <div className="auth-visual-shade" />
          <div className="auth-message-visual">
            <span>STAYEASE</span>
            <h2>
              One Last
              <br />
              Step
            </h2>
            <small>
              Verify your email to unlock your StayEase account.
            </small>
          </div>
        </div>

        <div className="auth-form-side">
          <button
            type="button"
            className="auth-back-button"
            onClick={onBack}
          >
            ← BACK TO SIGN IN
          </button>

          <div className="auth-heading">
            <span>EMAIL VERIFICATION</span>
            <h1>Check your inbox.</h1>
            <p>
              Enter the 6-digit code sent to <strong>{email}</strong>.
              The code expires after 10 minutes.
            </p>
          </div>

          <form className="auth-form" onSubmit={verifyCode}>
            <label>
              VERIFICATION CODE
              <input
                type="text"
                inputMode="numeric"
                autoComplete="one-time-code"
                value={code}
                onChange={(event) => {
                  setCode(event.target.value.replace(/\D/g, "").slice(0, 6));
                  setMessage("");
                }}
                placeholder="6-digit code"
                maxLength={6}
                required
                disabled={loading || resending}
              />
            </label>

            {message && (
              <p className="auth-message" role="alert">{message}</p>
            )}

            <button
              type="submit"
              className="primary-button auth-submit"
              disabled={loading || resending}
            >
              {loading ? "VERIFYING..." : "VERIFY EMAIL"}
            </button>
          </form>

          <div className="auth-links">
            <button
              type="button"
              onClick={resendCode}
              disabled={resending || loading}
            >
              {resending ? "Sending..." : "Resend verification code"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function AuthPage({
  onLogin,
  onRequireVerification,
  initialEmail = "",
  initialMessage = "",
}) {
  const [mode, setMode] = useState("login");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(initialMessage);
  const [showPassword, setShowPassword] = useState(false);

  const [form, setForm] = useState({
    name: "",
    email: initialEmail,
    password: "",
    confirmPassword: "",
    otp: "",
    newPassword: "",
  });

  const update = (field, value) => {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));

    setMessage("");
  };

  const submitLogin = async (e) => {
    e.preventDefault();

    if (!form.email || !form.password) {
      setMessage("Please enter your email and password.");
      return;
    }

    setLoading(true);

    try {
      const data = await requestApi("login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: form.email,
          password: form.password,
        }),
      });

      if (data.verificationRequired) {
        onRequireVerification(data.email || form.email);
        return;
      }

      onLogin(data.user);
    } catch (error) {
      if (error.data?.verificationRequired) {
        onRequireVerification(error.data.email || form.email);
        return;
      }
      setMessage(error.message);
    } finally {
      setLoading(false);
    }
  };

  const submitCreate = async (e) => {
    e.preventDefault();

    if (
      !form.name ||
      !form.email ||
      !form.password ||
      !form.confirmPassword
    ) {
      setMessage("Please complete all fields.");
      return;
    }

    if (form.password !== form.confirmPassword) {
      setMessage("Your passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      const data = await requestApi("register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          password: form.password,
          confirmPassword: form.confirmPassword,
        }),
      });

      onRequireVerification(data.email || form.email);
    } catch (error) {
      if (error.data?.verificationRequired) {
        onRequireVerification(error.data.email || form.email);
        return;
      }
      setMessage(error.message);
    } finally {
      setLoading(false);
    }
  };

  const submitForgot = (e) => {
    e.preventDefault();

    if (!form.email) {
      setMessage("Enter the email connected to your account.");
      return;
    }

    const users = JSON.parse(
      localStorage.getItem("stayeaseUsers") || "[]"
    );

    const existing = users.find(
      (user) =>
        user.email.toLowerCase() ===
        form.email.toLowerCase()
    );

    if (!existing) {
      setMessage(
        "No StayEase account was found with that email."
      );
      return;
    }

    const otp = String(
      Math.floor(100000 + Math.random() * 900000)
    );

    sessionStorage.setItem(
      "stayeaseReset",
      JSON.stringify({
        email: form.email,
        otp,
        expires: Date.now() + 10 * 60 * 1000,
      })
    );

    alert(`Your StayEase verification code is ${otp}`);

    setMessage(
      "Verification code sent. Enter it below."
    );
  };

  const verifyReset = (e) => {
    e.preventDefault();

    const saved = JSON.parse(
      sessionStorage.getItem("stayeaseReset") || "null"
    );

    if (
      !saved ||
      saved.email !== form.email ||
      saved.expires < Date.now()
    ) {
      setMessage(
        "Your verification code has expired. Request a new one."
      );
      return;
    }

    if (saved.otp !== form.otp) {
      setMessage("The verification code is incorrect.");
      return;
    }

    if (!form.newPassword) {
      setMessage("Enter your new password.");
      return;
    }

    const users = JSON.parse(
      localStorage.getItem("stayeaseUsers") || "[]"
    );

    const updated = users.map((user) =>
      user.email.toLowerCase() ===
      form.email.toLowerCase()
        ? {
            ...user,
            password: form.newPassword,
          }
        : user
    );

    localStorage.setItem(
      "stayeaseUsers",
      JSON.stringify(updated)
    );

    sessionStorage.removeItem("stayeaseReset");

    setMessage("Password updated successfully.");

    setMode("login");

    setForm((current) => ({
      ...current,
      password: "",
      newPassword: "",
      otp: "",
    }));
  };

  return (
    <div className="auth-page">
      <div
        className={`auth-card ${
          mode !== "login" ? "auth-card-wide" : ""
        }`}
      >
        <div className="auth-visual">
          <div
            className="auth-visual-photo"
            style={{
              backgroundImage: `url(${building})`,
            }}
          />

          <div className="auth-visual-shade" />

          {mode === "login" && (
            <div className="auth-login-visual">
              <img src={logo} alt="StayEase" />
            </div>
          )}

          {mode === "create" && (
            <div className="auth-message-visual">
              <span>STAYEASE</span>

              <h2>
                Your Stay
                <br />
                Starts Here
              </h2>

              <small>
                Keep your reservations and guest details together.
              </small>
            </div>
          )}

          {mode === "forgot" && (
            <div className="auth-message-visual">
              <span>STAYEASE</span>

              <h2>
                Need a
                <br />
                Reset?
              </h2>

              <small>
                Verify your account and choose a new password.
              </small>
            </div>
          )}

        </div>

        <div className="auth-form-side">
          <button
            type="button"
            className="auth-back-button"
            onClick={() => {
              if (mode === "login") {
                window.location.reload();
              } else {
                setMode("login");
                setMessage("");
              }
            }}
          >
            ← BACK
          </button>

          {mode === "login" && (
            <>
              <div className="auth-heading">
                <span>WELCOME BACK</span>

                <h1>Sign in.</h1>

                <p>
                  Return to your StayEase experience and continue
                  where you left off.
                </p>
              </div>

              <form
                className="auth-form"
                onSubmit={submitLogin}
              >
                <label>
                  EMAIL ADDRESS

                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) =>
                      update("email", e.target.value)
                    }
                    placeholder="you@example.com"
                  />
                </label>

                <label>
                  PASSWORD

                  <div className="password-field">
                    <input
                      type={showPassword ? "text" : "password"}
                      value={form.password}
                      onChange={(e) =>
                        update("password", e.target.value)
                      }
                      placeholder="Enter your password"
                    />

                    <button
                      type="button"
                      onClick={() =>
                        setShowPassword((v) => !v)
                      }
                    >
                      {showPassword ? "HIDE" : "SHOW"}
                    </button>
                  </div>
                </label>

                {message && (
                  <p className="auth-message">{message}</p>
                )}

                <button
                  type="submit"
                  className="primary-button auth-submit"
                  disabled={loading}
                >
                  {loading ? "SIGNING IN..." : "SIGN IN"}
                </button>
              </form>

              <div className="auth-links">
                <button
                  type="button"
                  onClick={() => setMode("forgot")}
                >
                  Forgot password?
                </button>

                <button
                  type="button"
                  onClick={() => setMode("create")}
                >
                  Create an account
                </button>
              </div>

              <p className="admin-login-prompt">
                Are you an admin?{" "}
                <button
                  type="button"
                  onClick={() => {
                    window.location.href = "/admin.html?login=true";
                  }}
                >
                  Log in now
                </button>
              </p>
            </>
          )}

          {mode === "create" && (
            <>
              <div className="auth-heading">
                <span>NEW TO STAYEASE?</span>

                <h1>Create your account.</h1>

                <p>
                  Set up your account so your reservations and guest
                  details stay together.
                </p>
              </div>

              <form
                className="auth-form"
                onSubmit={submitCreate}
              >
                <label>
                  FULL NAME

                  <input
                    value={form.name}
                    onChange={(e) =>
                      update("name", e.target.value)
                    }
                    placeholder="Your name"
                  />
                </label>

                <label>
                  EMAIL ADDRESS

                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) =>
                      update("email", e.target.value)
                    }
                    placeholder="you@example.com"
                  />
                </label>

                <label>
                  PASSWORD

                  <div className="password-field">
                    <input
                      type={showPassword ? "text" : "password"}
                      value={form.password}
                      onChange={(e) =>
                        update("password", e.target.value)
                      }
                      placeholder="Create a password"
                    />

                    <button
                      type="button"
                      onClick={() =>
                        setShowPassword((v) => !v)
                      }
                    >
                      {showPassword ? "HIDE" : "SHOW"}
                    </button>
                  </div>
                </label>

                <label>
                  CONFIRM PASSWORD

                  <input
                    type={showPassword ? "text" : "password"}
                    value={form.confirmPassword}
                    onChange={(e) =>
                      update(
                        "confirmPassword",
                        e.target.value
                      )
                    }
                    placeholder="Repeat your password"
                  />
                </label>

                {message && (
                  <p className="auth-message">{message}</p>
                )}

                <button
                  type="submit"
                  className="primary-button auth-submit"
                  disabled={loading}
                >
                  {loading
                    ? "CREATING..."
                    : "CREATE ACCOUNT"}
                </button>
              </form>

              <div className="auth-links">
                <button
                  type="button"
                  onClick={() => setMode("login")}
                >
                  Already have an account?
                </button>
              </div>
            </>
          )}

          {mode === "forgot" && (
            <>
              <div className="auth-heading">
                <span>NEED A RESET?</span>

                <h1>Recover your account.</h1>

                <p>
                  Enter your account email and verify your identity
                  before choosing a new password.
                </p>
              </div>

              <form
                className="auth-form"
                onSubmit={
                  form.otp ? verifyReset : submitForgot
                }
              >
                <label>
                  EMAIL ADDRESS

                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) =>
                      update("email", e.target.value)
                    }
                    placeholder="you@example.com"
                  />
                </label>

                {form.otp && (
                  <>
                    <label>
                      VERIFICATION CODE

                      <input
                        value={form.otp}
                        onChange={(e) =>
                          update("otp", e.target.value)
                        }
                        placeholder="6-digit code"
                        maxLength={6}
                      />
                    </label>

                    <label>
                      NEW PASSWORD

                      <input
                        type="password"
                        value={form.newPassword}
                        onChange={(e) =>
                          update(
                            "newPassword",
                            e.target.value
                          )
                        }
                        placeholder="Create a new password"
                      />
                    </label>
                  </>
                )}

                {message && (
                  <p className="auth-message">{message}</p>
                )}

                <button
                  type="submit"
                  className="primary-button auth-submit"
                >
                  {form.otp
                    ? "RESET PASSWORD"
                    : "SEND CODE"}
                </button>
              </form>

              <div className="auth-links">
                <button
                  type="button"
                  onClick={() => setMode("login")}
                >
                  Return to sign in
                </button>
              </div>
            </>
          )}

        </div>
      </div>
    </div>
  );
}

function Dashboard({
  onBookNow,
  onRooms,
}) {
  return (
    <main className="dashboard-page">
      <section
        className="dashboard-hero"
        id="dashboard-home"
      >
        <div className="dashboard-hero-image" />
        <div className="dashboard-hero-overlay" />

        <div className="dashboard-hero-content">
          <span>A HOTEL MADE FOR SLOWER MOMENTS</span>

          <h1>
            Escape Into
            <em>Elegance</em>
          </h1>

          <p>
            A thoughtfully designed stay where comfort, calm, and
            understated elegance come together.
          </p>

          <button
            type="button"
            className="hero-book-button"
            onClick={onBookNow}
          >
            BOOK YOUR STAY
          </button>
        </div>
      </section>

      <section
        className="experience-section"
        id="dashboard-amenities"
      >
        <div className="section-heading centered">
          <span>THE STAYEASE EXPERIENCE</span>

          <h2>
            Everything you need,
            <br />
            nothing you don't.
          </h2>

          <p>
            From quiet mornings to restful evenings, every part of
            your stay is designed to feel effortless.
          </p>
        </div>

        <div className="experience-grid">
          <article className="experience-card">
            <img src={pool} alt="Swimming Pool" />

            <div>
              <span>01</span>

              <h3>Swimming Pool</h3>

              <p>
                Slow down, cool off, and take a quiet moment for
                yourself.
              </p>
            </div>
          </article>

          <article className="experience-card">
            <img src={spa} alt="Wellness and Spa" />

            <div>
              <span>02</span>

              <h3>Wellness & Spa</h3>

              <p>
                Relaxation spaces created for slower and softer
                moments.
              </p>
            </div>
          </article>

          <article className="experience-card">
            <img
              src={bfast}
              alt="Breakfast and Dining"
            />

            <div>
              <span>03</span>

              <h3>Breakfast & Dining</h3>

              <p>
                Begin your day with thoughtful food and unhurried
                mornings.
              </p>
            </div>
          </article>
        </div>
      </section>

      <section className="dashboard-story">
        <div className="story-image">
          <img
            src={restau}
            alt="StayEase restaurant"
          />
        </div>

        <div className="story-copy">
          <span>A PLACE TO ARRIVE</span>

          <h2>
            Stay a little
            <br />
            <em>longer.</em>
          </h2>

          <p>
            StayEase is created around the simple idea that a hotel
            should feel like a pause from everything else.
          </p>

          <button
            type="button"
            className="outline-button"
            onClick={onRooms}
          >
            PLAN YOUR STAY
          </button>
        </div>
      </section>

      <section
        className="about-section"
        id="dashboard-about"
      >
        <div className="about-content">
          <span>ABOUT STAYEASE</span>

          <h2>A softer way to stay.</h2>

          <p>
            StayEase is designed to make every stay feel effortless,
            comfortable, and welcoming. From choosing your room to
            keeping your reservations together, everything is made
            with your comfort in mind.
          </p>

          <p>
            Whether you are staying for a night, a weekend, or a
            little longer, StayEase gives you a place to slow down
            and feel at home.
          </p>
        </div>
      </section>

      <section
        className="contact-section"
        id="dashboard-contact"
      >
        <div className="contact-content">
          <span>GET IN TOUCH</span>

          <h2>We'd love to hear from you.</h2>

          <p>
            Have a question about your stay, our rooms, or your
            reservation? We're here to help.
          </p>

          <div className="contact-details">
            <div>
              <small>EMAIL</small>
              <p>stayease@gmail.com</p>
            </div>

            <div>
              <small>PHONE</small>
              <p>+63 917 123 4567</p>
            </div>

            <div>
              <small>LOCATION</small>
              <p>NU Dasmarinas</p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

export default function App() {
  const [intro, setIntro] = useState(true);
  const [loggedIn, setLoggedIn] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);
  const [authError, setAuthError] = useState("");
  const [authEmail, setAuthEmail] = useState("");
  const [pendingVerification, setPendingVerification] = useState(null);

  const [page, setPage] = useState("dashboard");

  const [reservationData, setReservationData] =
    useState(null);

  const [modal, setModal] = useState(null);

  const [favorites, setFavorites] = useState(() => {
    try {
      return JSON.parse(
        localStorage.getItem("stayeaseFavorites") || "[]"
      );
    } catch {
      return [];
    }
  });

  useEffect(() => {
    const timer = setTimeout(() => {
      setIntro(false);
    }, 3600);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    let active = true;

    requestApi("auth-status")
      .then((data) => {
        if (!active) return;

        if (data?.authenticated && data.account?.type === "user") {
          localStorage.setItem(
            "stayeaseUser",
            JSON.stringify({
              id: data.account.id,
              name: data.account.name,
              email: data.account.email,
            })
          );
          setLoggedIn(true);
        } else {
          localStorage.removeItem("stayeaseLoggedIn");
          localStorage.removeItem("stayeaseUser");
        }
      })
      .catch((error) => {
        if (active) setAuthError(error.message);
      })
      .finally(() => {
        if (active) setAuthChecked(true);
      });

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    localStorage.setItem(
      "stayeaseFavorites",
      JSON.stringify(favorites)
    );

    window.dispatchEvent(
      new Event("stayeaseFavoritesUpdated")
    );
  }, [favorites]);

  const handleFavoriteToggle = (room) => {
    const roomId =
      typeof room === "object"
        ? room.id
        : room;

    setFavorites((current) => {
      const exists = current.some(
        (item) =>
          (typeof item === "object"
            ? item.id
            : item) === roomId
      );

      if (exists) {
        return current.filter(
          (item) =>
            (typeof item === "object"
              ? item.id
              : item) !== roomId
        );
      }

      return [...current, room];
    });
  };

  const changePage = (nextPage) => {
    window.scrollTo({
      top: 0,
      behavior: "auto",
    });

    setPage(nextPage);
  };

  const openReservation = (data = null) => {
    setReservationData(data);
    changePage("reservation");
  };

  const handleLogout = async () => {
    try {
      await requestApi("logout", { method: "POST" });
    } catch (error) {
      setAuthError(error.message);
    }

    localStorage.removeItem("stayeaseLoggedIn");
    localStorage.removeItem("stayeaseUser");

    setLoggedIn(false);
    setPage("dashboard");
    setIntro(false);
  };

  const goDashboardSection = (section) => {
    if (page !== "dashboard") {
      setPage("dashboard");

      setTimeout(() => {
        document
          .getElementById(`dashboard-${section}`)
          ?.scrollIntoView({
            behavior: "smooth",
          });
      }, 100);

      return;
    }

    document
      .getElementById(`dashboard-${section}`)
      ?.scrollIntoView({
        behavior: "smooth",
      });
  };

  const footerProps = {
    onBookNow: () => openReservation(),
    onRooms: () => changePage("rooms"),
    onOpenLegal: (type) => setModal(type),
    goDashboardSection,
  };

  const handleAuthenticated = (account) => {
    localStorage.setItem(
      "stayeaseUser",
      JSON.stringify({
        id: account.id,
        name: account.name,
        email: account.email,
      })
    );
    setPendingVerification(null);
    setAuthError("");
    setLoggedIn(true);
  };

  if (intro && !loggedIn) {
    return (
      <WelcomePage
        onFinished={() => setIntro(false)}
      />
    );
  }

  if (!authChecked) {
    return (
      <div className="auth-page" role="status">
        Checking your StayEase session...
      </div>
    );
  }

  if (!loggedIn) {
    if (pendingVerification) {
      return (
        <EmailVerificationPage
          email={pendingVerification}
          onVerified={handleAuthenticated}
          onBack={() => setPendingVerification(null)}
        />
      );
    }

    return (
      <AuthPage
        initialMessage={authError}
        initialEmail={authEmail}
        onRequireVerification={(email) => {
          setAuthEmail(email);
          setPendingVerification(email);
          setAuthError("");
        }}
        onLogin={handleAuthenticated}
      />
    );
  }

  if (page === "reservation") {
    return (
      <>
        <div className="app">
          <SiteChrome
            onHome={() => changePage("dashboard")}
            onAmenities={() => changePage("rooms")}
            onAbout={() =>
              goDashboardSection("about")
            }
            onContact={() =>
              goDashboardSection("contact")
            }
            onProfile={() => {}}
            onLogout={handleLogout}
            onRooms={() => changePage("rooms")}
            favoriteCount={favorites.length}
          />

          <ReservationPage
            initialData={reservationData}
            onCreateReservation={(reservation) =>
              requestApi("reservation", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(reservation),
              })
            }
            onBack={() => changePage("rooms")}
            onHome={() => changePage("dashboard")}
            onAmenities={() => changePage("rooms")}
            onAbout={() =>
              goDashboardSection("about")
            }
            onContact={() =>
              goDashboardSection("contact")
            }
            onOpenLegal={(type) =>
              setModal(type)
            }
            onLogout={handleLogout}
            onBookingComplete={() =>
              changePage("dashboard")
            }
            onRooms={() => changePage("rooms")}
          />

          <SiteFooter {...footerProps} />
        </div>

        {modal && (
          <LegalModal
            type={modal}
            onClose={() => setModal(null)}
          />
        )}
      </>
    );
  }

  return (
    <>
      <div className="app">
        <SiteChrome
          onHome={() => changePage("dashboard")}
          onAmenities={() => changePage("rooms")}
          onAbout={() =>
            goDashboardSection("about")
          }
          onContact={() =>
            goDashboardSection("contact")
          }
          onProfile={() => {}}
          onLogout={handleLogout}
          onRooms={() => changePage("rooms")}
          favoriteCount={favorites.length}
        />

        {page === "dashboard" && (
          <>
            <Dashboard
              onBookNow={() => openReservation()}
              onRooms={() => changePage("rooms")}
            />

            <SiteFooter {...footerProps} />
          </>
        )}

        {page === "rooms" && (
          <>
            <RoomAmenities
              onBookNow={openReservation}
              favorites={favorites}
              onFavoriteToggle={handleFavoriteToggle}
            />

            <SiteFooter {...footerProps} />
          </>
        )}
      </div>

      {modal && (
        <LegalModal
          type={modal}
          onClose={() => setModal(null)}
        />
      )}
    </>
  );
}
