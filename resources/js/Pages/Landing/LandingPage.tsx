import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router";
import { useWashData } from "../../context/WashDataContext";
import { useAuth } from "../../context/AuthContext";
import { WASH_CLUSTER_MEMBERS } from "../../data/washClusterMembers";
import PublicLayout from "../../layout/PublicLayout";

/* ─── Colour Palette ─────────────────────────────────────────────── */
const T = {
  tealDarkest: "#061B20",
  tealDeep:    "#0B3C46",
  teal:        "#12707E",
  tealMedium:  "#1D8A99",
  tealLight:   "#4EAAB6",
  tealSoft:    "#E4F2F1",
  tealSubtle:  "#F0F7F6",
  clay:        "#C1722F",
  clayHover:   "#A75D22",
  claySoft:    "#FDF1E6",
  sand:        "#F7F4EE",
  green:       "#2E7D47",
  greenSoft:   "#E6F4EA",
  line:        "#E1E6E2",
  lineDark:    "#D0D8D4",
  ink:         "#132327",
  inkMuted:    "#485B60",
  inkLight:    "#728489",
  white:       "#FFFFFF",
  bgSubtle:    "#F8FAFA",
};

/* ─── Standard Typography Token ──────────────────────────────────── */
const FONT_PRIMARY = "'Outfit', 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif";
const FONT_MONO = "'Inter', 'Roboto', -apple-system, BlinkMacSystemFont, Arial, sans-serif";

/* ─── Number Formatter ─────────────────────────────────────────── */
function fmtNum(n: number): string {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + "M";
  if (n >= 1_000) return (n / 1_000).toFixed(1) + "K";
  return String(n);
}

/* ─── SVG Icons ─────────────────────────────────────────────────── */
const IcoArrowRight = ({ size = 18 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M5 12h14M12 5l7 7-7 7" />
  </svg>
);

const IcoCheck = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

const IcoWaterDrop = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z" />
  </svg>
);

const IcoUsers = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" />
    <path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
);

const IcoMapPin = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 1 1 18 0z" /><circle cx="12" cy="10" r="3" />
  </svg>
);

const IcoCalendar = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
  </svg>
);

const IcoHeart = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
  </svg>
);

const IcoDocument = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" />
  </svg>
);

/* ─── Animated Counter Hook (Cubic Ease-Out) ─────────────────────── */
function useAnimatedCounter(target: number, isVisible: boolean, duration = 1800) {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    if (!isVisible) return;
    let startTimestamp: number | null = null;
    let rafId: number;

    const step = (now: number) => {
      if (!startTimestamp) startTimestamp = now;
      const elapsed = now - startTimestamp;
      const progress = Math.min(elapsed / duration, 1);
      const easeOut = 1 - Math.pow(1 - progress, 3);
      setCurrent(Math.round(easeOut * target));

      if (progress < 1) {
        rafId = requestAnimationFrame(step);
      } else {
        setCurrent(target);
      }
    };

    rafId = requestAnimationFrame(step);
    return () => cancelAnimationFrame(rafId);
  }, [target, isVisible, duration]);

  return current;
}

/* ─── Animated Stat Metric Card ───────────────────────────────────── */
function StatCard({
  label,
  targetValue,
  icon,
  accent,
  accentSoft,
  gradient,
  tag,
  subtext,
  isVisible,
}: {
  label: string;
  targetValue: number;
  icon: React.ReactNode;
  accent: string;
  accentSoft: string;
  gradient: string;
  tag: string;
  subtext: string;
  isVisible: boolean;
}) {
  const [hovered, setHovered] = useState(false);
  const animatedValue = useAnimatedCounter(targetValue, isVisible, 1800);
  const displayValue = fmtNum(animatedValue);

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: T.white,
        border: `1.5px solid ${hovered ? accent : T.line}`,
        borderRadius: 14,
        padding: "20px 18px 18px",
        position: "relative",
        overflow: "hidden",
        boxShadow: hovered
          ? `0 10px 24px -4px ${accent}25, 0 4px 10px rgba(11, 60, 70, 0.05)`
          : "0 2px 8px rgba(11, 60, 70, 0.03)",
        transform: hovered ? "translateY(-3px)" : "translateY(0)",
        transition: "all 0.22s cubic-bezier(0.16, 1, 0.3, 1)",
        cursor: "default",
      }}
    >
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: 3,
          background: gradient,
        }}
      />

      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
        <div
          style={{
            width: 40,
            height: 40,
            borderRadius: 10,
            background: accentSoft,
            color: accent,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            transition: "transform 0.2s ease",
            transform: hovered ? "scale(1.06)" : "scale(1)",
          }}
        >
          {icon}
        </div>
        <span
          style={{
            fontFamily: FONT_MONO,
            fontSize: 11,
            fontWeight: 700,
            color: accent,
            background: accentSoft,
            padding: "3px 8px",
            borderRadius: 12,
            letterSpacing: "0.04em",
            textTransform: "uppercase",
            border: `1px solid ${accent}25`,
          }}
        >
          {tag}
        </span>
      </div>

      <div
        style={{
          fontSize: 12.5,
          textTransform: "uppercase",
          letterSpacing: "0.05em",
          color: T.inkMuted,
          fontWeight: 700,
          fontFamily: FONT_PRIMARY,
          marginTop: 14,
          marginBottom: 4,
        }}
      >
        {label}
      </div>

      <div
        style={{
          fontFamily: FONT_PRIMARY,
          fontSize: "clamp(30px, 2.8vw, 38px)",
          fontWeight: 800,
          color: hovered ? accent : T.tealDeep,
          lineHeight: 1.15,
          letterSpacing: "-0.4px",
          transition: "color 0.2s ease",
          display: "flex",
          alignItems: "baseline",
          gap: 4,
        }}
      >
        <span>{displayValue}</span>
        {isVisible && (
          <span
            style={{
              width: 6,
              height: 6,
              borderRadius: "50%",
              background: accent,
              display: "inline-block",
              marginLeft: 2,
              opacity: 0.85,
            }}
          />
        )}
      </div>

      <div
        style={{
          fontSize: 12.5,
          color: T.inkLight,
          marginTop: 6,
          lineHeight: 1.4,
          fontFamily: FONT_PRIMARY,
          display: "flex",
          alignItems: "center",
          gap: 6,
        }}
      >
        <span
          style={{
            width: 5,
            height: 5,
            borderRadius: "50%",
            background: accent,
            display: "inline-block",
            flexShrink: 0,
          }}
        />
        <span>{subtext}</span>
      </div>
    </div>
  );
}

/* ─── Main Landing Page Component ────────────────────────────────── */
export default function LandingPage() {
  const navigate = useNavigate();
  const { stats, reportingConfig, resources } = useWashData();
  const { isAuthenticated } = useAuth();

  const statsRef = useRef<HTMLDivElement>(null);
  const [statsVisible, setStatsVisible] = useState(false);

  const [windowWidth, setWindowWidth] = useState(() =>
    typeof window !== "undefined" ? window.innerWidth : 1200
  );

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const isMobile = windowWidth < 640;

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setStatsVisible(true);
        }
      },
      { threshold: 0.15 }
    );

    if (statsRef.current) {
      observer.observe(statsRef.current);
    }
    return () => observer.disconnect();
  }, []);

  const handleAction = (path: string) => {
    navigate(path);
  };

  const deadline = reportingConfig.deadlineDate
    ? new Date(reportingConfig.deadlineDate).toLocaleDateString("en-GB", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : "End of Month";

  return (
    <div style={{ background: T.white, color: T.ink, fontFamily: FONT_PRIMARY, width: "100%", maxWidth: "100%", overflowX: "clip", boxSizing: "border-box" }}>

      {/* ══════════════════════════════════════════════════════════════════
          1. HERO SECTION (Spacious & High-Impact First View)
      ══════════════════════════════════════════════════════════════════ */}
      <section id="overview" style={{
        position: "relative",
        background: "linear-gradient(135deg, rgba(4, 20, 24, 0.90) 0%, rgba(8, 45, 53, 0.86) 50%, rgba(4, 20, 24, 0.92) 100%), url('/images/wash_hero_bg.jpg') center/cover no-repeat",
        color: T.white,
        padding: isMobile ? "90px 20px 96px" : "150px 32px 160px",
        overflow: "hidden",
        width: "100%",
        minHeight: isMobile ? "auto" : 560,
        display: "flex",
        alignItems: "center",
      }}>
        <div style={{ position: "absolute", top: -60, right: -60, width: 320, height: 320, borderRadius: "50%", background: "radial-gradient(circle, rgba(255,255,255,0.08) 0%, transparent 70%)", pointerEvents: "none" }} />
        <div style={{ position: "absolute", bottom: -80, left: -40, width: 280, height: 280, borderRadius: "50%", background: "radial-gradient(circle, rgba(29,138,153,0.2) 0%, transparent 70%)", pointerEvents: "none" }} />

        <div style={{ maxWidth: 1360, width: "100%", margin: "0 auto", position: "relative", zIndex: 1 }}>
          <div style={{ maxWidth: 960 }}>

            {/* Main Headline */}
            <h1 style={{
              fontFamily: FONT_PRIMARY,
              fontSize: "clamp(26px, 3.4vw, 40px)",
              fontWeight: 800,
              lineHeight: 1.25,
              letterSpacing: "-0.4px",
              margin: "0 0 14px",
              color: T.white,
            }}>
              One Unified Platform for Humanitarian WASH Response in North East Nigeria.
            </h1>

            {/* Description Subtitle */}
            <p style={{
              fontFamily: FONT_PRIMARY,
              fontSize: "clamp(14px, 1.4vw, 16.5px)",
              lineHeight: 1.6,
              color: "#D6F0ED",
              margin: "0 0 24px",
              maxWidth: 820,
              fontWeight: 400,
            }}>
              Empowering over 40 accredited humanitarian partners to record, visualize, and analyze
              life-saving Water, Sanitation, and Hygiene activities across Borno, Adamawa, and Yobe states.
            </p>

            {/* Primary Action Buttons (FontAwesome Vector Icons) */}
            <div style={{
              display: "flex",
              gap: isMobile ? 12 : 14,
              flexDirection: isMobile ? "column" : "row",
              alignItems: isMobile ? "stretch" : "center",
              width: "100%",
              maxWidth: isMobile ? "100%" : "none",
            }}>
              <button
                id="hero-submit-btn"
                onClick={() => handleAction("/submit-report")}
                style={{
                  background: T.clay,
                  color: T.white,
                  border: "none",
                  borderRadius: 8,
                  padding: isMobile ? "11px 18px" : "13px 24px",
                  fontSize: isMobile ? 14 : 14.5,
                  fontWeight: 700,
                  cursor: "pointer",
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 9,
                  width: isMobile ? "100%" : "auto",
                  boxSizing: "border-box",
                  fontFamily: FONT_PRIMARY,
                  boxShadow: "0 4px 16px rgba(193, 114, 47, 0.4)",
                  transition: "all .15s",
                }}
                onMouseEnter={e => (e.currentTarget.style.background = T.clayHover)}
                onMouseLeave={e => (e.currentTarget.style.background = T.clay)}
              >
                <i className="fa-solid fa-file-pen" style={{ fontSize: 16 }}></i>
                <span>Submit Monthly 5W Report</span>
                <i className="fa-solid fa-arrow-right" style={{ fontSize: 13 }}></i>
              </button>

              <button
                id="hero-coverage-btn"
                onClick={() => handleAction("/coverage-dashboard")}
                style={{
                  background: "rgba(255, 255, 255, 0.14)",
                  color: T.white,
                  border: "1.5px solid rgba(255, 255, 255, 0.35)",
                  borderRadius: 8,
                  padding: isMobile ? "11px 18px" : "13px 22px",
                  fontSize: isMobile ? 14 : 14.5,
                  fontWeight: 600,
                  cursor: "pointer",
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 9,
                  width: isMobile ? "100%" : "auto",
                  boxSizing: "border-box",
                  fontFamily: FONT_PRIMARY,
                  backdropFilter: "blur(4px)",
                  transition: "background .15s",
                }}
                onMouseEnter={e => (e.currentTarget.style.background = "rgba(255, 255, 255, 0.24)")}
                onMouseLeave={e => (e.currentTarget.style.background = "rgba(255, 255, 255, 0.14)")}
              >
                <i className="fa-solid fa-chart-pie" style={{ fontSize: 16 }}></i>
                <span>Explore Coverage Dashboard</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════
          2. THE 5W METHODOLOGY & STATS SECTION (Compact Spacing)
      ══════════════════════════════════════════════════════════════════ */}
      <section id="5w-framework" style={{
        padding: isMobile ? "36px 16px 44px" : "48px 24px 54px",
        background: T.bgSubtle,
        borderBottom: `1px solid ${T.line}`,
        width: "100%",
      }}>
        <div style={{ maxWidth: 1360, margin: "0 auto" }}>

          {/* 4 STATS CARDS */}
          <div
            ref={statsRef}
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
              gap: 16,
              marginBottom: 36,
            }}
          >
            <StatCard
              label="Reports On Record"
              targetValue={stats.totalReports}
              isVisible={statsVisible}
              icon={<IcoDocument />}
              accent={T.teal}
              accentSoft={T.tealSoft}
              gradient="linear-gradient(135deg, #12707E 0%, #1D8A99 100%)"
              tag="Verified 5W"
              subtext="Validated monthly submissions"
            />
            <StatCard
              label="Beneficiaries Reached"
              targetValue={stats.totalBeneficiaries}
              isVisible={statsVisible}
              icon={<IcoHeart />}
              accent={T.clay}
              accentSoft={T.claySoft}
              gradient="linear-gradient(135deg, #C1722F 0%, #D8823E 100%)"
              tag="Individuals Served"
              subtext="Host & IDP community individuals"
            />
            <StatCard
              label="Reporting Partners"
              targetValue={stats.totalPartners}
              isVisible={statsVisible}
              icon={<IcoUsers />}
              accent={T.tealMedium}
              accentSoft="#E0F2F1"
              gradient="linear-gradient(135deg, #1D8A99 0%, #4EAAB6 100%)"
              tag="Accredited Leads"
              subtext="Active UN, INGO & NGO agencies"
            />
            <StatCard
              label="LGAs Actively Covered"
              targetValue={stats.totalLgas}
              isVisible={statsVisible}
              icon={<IcoMapPin />}
              accent={T.green}
              accentSoft={T.greenSoft}
              gradient="linear-gradient(135deg, #2E7D47 0%, #3F9A5F 100%)"
              tag="Priority LGAs"
              subtext="Targeted local government areas"
            />
          </div>

          <div style={{ textAlign: "center", maxWidth: 740, margin: "0 auto 36px" }}>
            <div style={{
              fontFamily: FONT_MONO,
              fontSize: 12.5,
              fontWeight: 700,
              color: T.teal,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              marginBottom: 8,
            }}>
              Inter-Agency Information Management
            </div>
            <h2 style={{
              fontFamily: FONT_PRIMARY,
              fontSize: "clamp(26px, 3.4vw, 36px)",
              fontWeight: 800,
              color: T.tealDeep,
              margin: "0 0 10px",
              lineHeight: 1.18,
            }}>
              How the 5W Framework Operates
            </h2>
            <p style={{ fontSize: 15.5, color: T.inkMuted, lineHeight: 1.55, margin: 0, fontFamily: FONT_PRIMARY }}>
              The 5W matrix ensures accountability, prevents overlap, and directs emergency resources to the most vulnerable individuals.
            </p>
          </div>

          {/* 5W Step Cards */}
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
            gap: 16,
          }}>
            {[
              { num: "01", code: "WHO", title: "The Lead & Partner", desc: "Accredited humanitarian agency, implementing NGO, donor, and operational focal point.", icon: <IcoUsers />, accent: T.teal },
              { num: "02", code: "WHAT", title: "The Intervention", desc: "Specific sector activity: water supply construction, latrine desludging, or hygiene kit distribution.", icon: <IcoWaterDrop />, accent: T.tealMedium },
              { num: "03", code: "WHERE", title: "The Exact Location", desc: "State, LGA, ward, IDP camp or host community, with validated GPS coordinates.", icon: <IcoMapPin />, accent: T.clay },
              { num: "04", code: "WHEN", title: "Implementation Period", desc: "Active monthly cycle, project start and completion dates, and continuous activity status.", icon: <IcoCalendar />, accent: T.green },
              { num: "05", code: "FOR WHOM", title: "The Beneficiaries", desc: "Target population: IDPs, returnees, host communities with disaggregated sex and age indicators.", icon: <IcoHeart />, accent: "#7E3A9E" },
            ].map(step => (
              <div
                key={step.code}
                style={{
                  background: T.white,
                  border: `1.5px solid ${T.line}`,
                  borderRadius: 14,
                  padding: "22px 18px",
                  position: "relative",
                  overflow: "hidden",
                  transition: "transform .2s, box-shadow .2s, border-color .2s",
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.transform = "translateY(-3px)";
                  e.currentTarget.style.boxShadow = "0 10px 24px rgba(11, 60, 70, 0.08)";
                  e.currentTarget.style.borderColor = step.accent;
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow = "none";
                  e.currentTarget.style.borderColor = T.line;
                }}
              >
                <div style={{ position: "absolute", top: 10, right: 14, fontFamily: FONT_PRIMARY, fontSize: 44, fontWeight: 800, color: "#EFF3F2", userSelect: "none", lineHeight: 1 }}>
                  {step.num}
                </div>
                <div style={{ color: step.accent, marginBottom: 12 }}>{step.icon}</div>
                <div style={{ fontFamily: FONT_MONO, fontSize: 12, fontWeight: 700, color: step.accent, letterSpacing: "0.06em", marginBottom: 6 }}>
                  {step.num} · {step.code}
                </div>
                <h3 style={{ fontFamily: FONT_PRIMARY, fontSize: 17.5, fontWeight: 700, color: T.tealDeep, margin: "0 0 8px" }}>
                  {step.title}
                </h3>
                <p style={{ fontSize: 13.5, color: T.inkMuted, lineHeight: 1.5, margin: 0, position: "relative", zIndex: 1, fontFamily: FONT_PRIMARY }}>
                  {step.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════
          3. EMERGENCY ALERTS & OUTBREAK SURVEILLANCE HUB (Fixed Background)
      ══════════════════════════════════════════════════════════════════ */}
      <section id="emergency-alerts" style={{
        position: "relative",
        background: "linear-gradient(135deg, rgba(6, 27, 32, 0.92) 0%, rgba(11, 60, 70, 0.88) 50%, rgba(6, 27, 32, 0.94) 100%), url('/images/wash_hero_bg.jpg') center/cover fixed no-repeat",
        color: T.white,
        padding: isMobile ? "40px 16px" : "52px 24px",
        borderTop: `1px solid rgba(255,255,255,0.1)`,
        borderBottom: `1px solid rgba(255,255,255,0.1)`,
        width: "100%",
        overflow: "hidden",
      }}>
        <div style={{ maxWidth: 1360, margin: "0 auto", position: "relative", zIndex: 1 }}>
          <div style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: 24,
          }}>
            <div style={{ maxWidth: 780 }}>
              <div style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                padding: "4px 12px",
                borderRadius: 20,
                background: "rgba(193, 114, 47, 0.25)",
                border: "1px solid rgba(193, 114, 47, 0.5)",
                color: "#F4A261",
                fontSize: 11.5,
                fontWeight: 700,
                letterSpacing: "0.06em",
                textTransform: "uppercase",
                fontFamily: FONT_MONO,
                marginBottom: 12,
              }}>
                <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#E76F51" }} />
                Emergency Operations Desk
              </div>
              <h2 style={{
                fontFamily: FONT_PRIMARY,
                fontSize: "clamp(24px, 3.2vw, 36px)",
                fontWeight: 800,
                color: T.white,
                margin: "0 0 10px",
                lineHeight: 1.2,
                letterSpacing: "-0.4px",
              }}>
                Emergency Alerts &amp; Outbreak Surveillance Hub
              </h2>
              <p style={{
                fontSize: "clamp(14px, 1.4vw, 16px)",
                color: "#D6F0ED",
                lineHeight: 1.6,
                margin: 0,
                fontFamily: FONT_PRIMARY,
              }}>
                Active outbreak monitoring, hydrological flood risks, and rapid response mechanism (RRM) triggers across Borno, Adamawa, and Yobe states.
              </p>
            </div>

            {/* 24/7 Outbreak Desk Hotline Pod */}
            <div style={{
              background: "rgba(255, 255, 255, 0.12)",
              border: "1.5px solid rgba(255, 255, 255, 0.28)",
              borderRadius: 14,
              padding: "18px 24px",
              display: "flex",
              alignItems: "center",
              gap: 16,
              backdropFilter: "blur(10px)",
              boxShadow: "0 8px 24px rgba(0,0,0,0.25)",
              flexShrink: 0,
            }}>
              <div style={{
                width: 48,
                height: 48,
                borderRadius: 12,
                background: "rgba(231, 111, 81, 0.3)",
                color: "#F4A261",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 22,
                flexShrink: 0,
              }}>
                <i className="fa-solid fa-phone-volume"></i>
              </div>
              <div>
                <div style={{
                  fontSize: 11.5,
                  fontFamily: FONT_MONO,
                  textTransform: "uppercase",
                  color: "#BCE3DF",
                  letterSpacing: "0.06em",
                  fontWeight: 700,
                }}>
                  24/7 Outbreak Desk Hotline
                </div>
                <a
                  href="tel:+23480092744357"
                  style={{
                    fontSize: "clamp(18px, 1.8vw, 22px)",
                    fontWeight: 800,
                    color: T.white,
                    fontFamily: FONT_MONO,
                    textDecoration: "none",
                    display: "block",
                    marginTop: 3,
                    letterSpacing: "0.02em",
                  }}
                >
                  +234 (0) 800-WASH-HELP
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════
          4. CORE STRATEGIC PILLARS SECTION (Compact)
      ══════════════════════════════════════════════════════════════════ */}
      <section id="pillars" style={{
        padding: isMobile ? "38px 16px 44px" : "50px 24px 54px",
        background: T.tealSubtle,
        borderBottom: `1px solid ${T.line}`,
        width: "100%",
      }}>
        <div style={{ maxWidth: 1360, margin: "0 auto" }}>
          <div style={{ textAlign: "center", maxWidth: 740, margin: "0 auto 32px" }}>
            <div style={{
              fontFamily: FONT_MONO,
              fontSize: 12.5,
              fontWeight: 700,
              color: T.teal,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              marginBottom: 8,
            }}>
              Strategic Humanitarian Objectives
            </div>
            <h2 style={{
              fontFamily: FONT_PRIMARY,
              fontSize: "clamp(26px, 3.2vw, 36px)",
              fontWeight: 800,
              color: T.tealDeep,
              margin: "0 0 10px",
              lineHeight: 1.2,
            }}>
              Four Core Pillars of Sector Delivery
            </h2>
            <p style={{ fontSize: 15.5, color: T.inkMuted, lineHeight: 1.55, margin: 0, fontFamily: FONT_PRIMARY }}>
              All 5W activity reports align with one of the four sector operational pillars defined under the Humanitarian Response Plan (HRP).
            </p>
          </div>

          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 260px), 1fr))",
            gap: 18,
          }}>
            {[
              {
                title: "1. Water Supply Infrastructure",
                color: T.teal,
                bg: T.white,
                desc: "Construction, solarization, and operation of motorized boreholes, emergency water trucking, and FRC chlorination monitoring.",
                points: ["Solar Borehole Pumping", "Chlorination Monitoring", "Emergency Water Trucking"],
              },
              {
                title: "2. Emergency & Dignified Sanitation",
                color: T.green,
                bg: T.white,
                desc: "Gender-segregated emergency and semi-permanent latrines, accessible facilities, camp desludging, and solid waste disposal.",
                points: ["Gender-Segregated Latrines", "Regular Camp Desludging", "Solid Waste Management"],
              },
              {
                title: "3. Hygiene & Disease Prevention",
                color: T.clay,
                bg: T.white,
                desc: "House-to-house hygiene sensitization, cholera awareness, standard hygiene kit distribution, and menstrual hygiene support.",
                points: ["Standard Hygiene Kits", "Cholera Early Warning", "Menstrual Hygiene Support"],
              },
              {
                title: "4. Institutional WASH Services",
                color: "#6D28D9",
                bg: T.white,
                desc: "WASH facilities in Primary Health Centers (PHCs), Cholera Treatment Units (CTUs), emergency schools, and nutrition centers.",
                points: ["Health Clinic WASH", "Temporary Learning Spaces", "Nutrition Center Points"],
              },
            ].map(pillar => (
              <div
                key={pillar.title}
                style={{
                  background: pillar.bg,
                  border: `1.5px solid ${T.line}`,
                  borderRadius: 14,
                  padding: "22px 18px",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.03)",
                }}
              >
                <div style={{
                  display: "inline-block",
                  width: 10,
                  height: 10,
                  borderRadius: "50%",
                  background: pillar.color,
                  marginBottom: 10,
                }} />

                <h3 style={{
                  fontFamily: FONT_PRIMARY,
                  fontSize: 17.5,
                  fontWeight: 700,
                  color: T.tealDeep,
                  margin: "0 0 8px",
                }}>
                  {pillar.title}
                </h3>

                <p style={{ fontSize: 13.5, color: T.inkMuted, lineHeight: 1.55, margin: "0 0 16px", fontFamily: FONT_PRIMARY }}>
                  {pillar.desc}
                </p>

                <div style={{ borderTop: `1px solid ${T.line}`, paddingTop: 12 }}>
                  {pillar.points.map(pt => (
                    <div key={pt} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, color: T.ink, marginBottom: 6, fontFamily: FONT_PRIMARY }}>
                      <span style={{ color: pillar.color }}><IcoCheck /></span>
                      <span>{pt}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════
          5. KEY RESOURCES & TECHNICAL GUIDANCE (Clean NGO Standard)
      ══════════════════════════════════════════════════════════════════ */}
      <section id="resource-centre" style={{
        padding: isMobile ? "38px 16px 44px" : "50px 24px 54px",
        background: T.white,
        borderBottom: `1px solid ${T.line}`,
        width: "100%",
      }}>
        <div style={{ maxWidth: 1360, margin: "0 auto" }}>
          
          <div style={{ textAlign: "center", maxWidth: 740, margin: "0 auto 34px" }}>
            <h2 style={{
              fontFamily: FONT_PRIMARY,
              fontSize: "clamp(24px, 3vw, 34px)",
              fontWeight: 800,
              color: T.tealDeep,
              margin: "0 0 10px",
              lineHeight: 1.25,
              letterSpacing: "-0.3px",
            }}>
              Resource Centre &amp; Technical Guidance
            </h2>
            <p style={{ fontSize: 15, color: T.inkMuted, lineHeight: 1.6, margin: 0, fontFamily: FONT_PRIMARY }}>
              Official reference materials, operational SOPs, SPHERE standards, and reporting dictionaries for humanitarian WASH delivery in North East Nigeria.
            </p>
          </div>

          {/* Downloadable Materials Grid (Loaded dynamically from DB) */}
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 340px), 1fr))",
            gap: 20,
          }}>
            {((resources && resources.length > 0 ? resources : []).filter(r => r.is_published !== false && r.isPublished !== false)).map(item => {
              const badgeColor = item.badge_color || item.badgeColor || "#12707E";
              const desc = item.description || (item as any).desc || "";
              const fileName = item.file_name || item.fileName || "document.pdf";
              const highlightsList = Array.isArray(item.highlights) ? item.highlights : [];

              return (
              <div
                key={item.id}
                style={{
                  background: T.white,
                  border: "1px solid #E2E8F0",
                  borderRadius: 10,
                  padding: "20px",
                  display: "flex",
                  flexDirection: "column",
                  transition: "all 0.2s ease",
                  boxShadow: "0 1px 4px rgba(0, 0, 0, 0.04)",
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.transform = "translateY(-2px)";
                  e.currentTarget.style.boxShadow = "0 8px 20px rgba(11, 60, 70, 0.07)";
                  e.currentTarget.style.borderColor = "#CBD5E1";
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow = "0 1px 4px rgba(0, 0, 0, 0.04)";
                  e.currentTarget.style.borderColor = "#E2E8F0";
                }}
              >
                {/* Meta header */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8, marginBottom: 12 }}>
                  <span style={{
                    fontSize: 11.5,
                    fontFamily: FONT_MONO,
                    fontWeight: 700,
                    color: badgeColor,
                    letterSpacing: "0.02em",
                  }}>
                    {item.category}
                  </span>
                  <span style={{
                    background: "#F1F5F9",
                    color: "#475569",
                    padding: "2px 8px",
                    borderRadius: 4,
                    fontSize: 11,
                    fontFamily: FONT_MONO,
                    fontWeight: 600,
                  }}>
                    {item.format} · {item.size}
                  </span>
                </div>

                {/* Title */}
                <h3 style={{
                  fontFamily: FONT_PRIMARY,
                  fontSize: 16.5,
                  fontWeight: 700,
                  color: T.tealDeep,
                  margin: "0 0 8px",
                  lineHeight: 1.35,
                }}>
                  {item.title}
                </h3>

                {/* Description */}
                <p style={{
                  fontSize: 13.5,
                  color: "#475569",
                  lineHeight: 1.55,
                  margin: "0 0 14px",
                  flex: 1,
                  fontFamily: FONT_PRIMARY,
                }}>
                  {desc}
                </p>

                {/* Highlights */}
                {highlightsList.length > 0 && (
                  <div style={{
                    background: "#F8FAFC",
                    border: "1px solid #EEF2F6",
                    borderRadius: 6,
                    padding: "8px 10px",
                    marginBottom: 16,
                    display: "flex",
                    flexWrap: "wrap",
                    gap: 6,
                  }}>
                    {highlightsList.map((hl, i) => (
                      <span key={i} style={{
                        fontSize: 11.5,
                        color: "#334155",
                        fontWeight: 500,
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 4,
                      }}>
                        <i className="fa-solid fa-check" style={{ color: badgeColor, fontSize: 10 }}></i>
                        {hl}
                      </span>
                    ))}
                  </div>
                )}

                {/* Download CTA */}
                <a
                  href={`#download-${item.id}`}
                  onClick={(e) => {
                    e.preventDefault();
                    if (typeof fetch !== "undefined") {
                      fetch(`/api/resources/${item.id}/download`).catch(() => {});
                    }
                    const blob = new Blob([`WASH Sector North East Nigeria - Technical Document: ${item.title}\nCategory: ${item.category}\nFormat: ${item.format}\nEdition: 2026 Cycle\nContact: im@washsector-ne.org / coordinator@washsector-ne.org`], { type: "text/plain" });
                    const url = URL.createObjectURL(blob);
                    const link = document.createElement("a");
                    link.href = url;
                    link.download = fileName;
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                    URL.revokeObjectURL(url);
                  }}
                  style={{
                    background: "#F8FAFC",
                    border: "1px solid #CBD5E1",
                    color: T.tealDeep,
                    padding: "9px 14px",
                    borderRadius: 6,
                    fontSize: 13,
                    fontWeight: 700,
                    cursor: "pointer",
                    textDecoration: "none",
                    fontFamily: FONT_PRIMARY,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 7,
                    transition: "all 0.15s ease",
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.background = T.tealDeep;
                    e.currentTarget.style.color = T.white;
                    e.currentTarget.style.borderColor = T.tealDeep;
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.background = "#F8FAFC";
                    e.currentTarget.style.color = T.tealDeep;
                    e.currentTarget.style.borderColor = "#CBD5E1";
                  }}
                >
                  <i className="fa-solid fa-arrow-down-to-bracket" style={{ fontSize: 13 }}></i>
                  Download ({item.size})
                </a>
              </div>
            );
            })}
          </div>

        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════
          6. ROLE-BASED ACCESS PATHWAYS / SECONDARY NAVIGATION (High Profile NGO Standard)
      ══════════════════════════════════════════════════════════════════ */}
      <section id="user-profiles" style={{
        padding: isMobile ? "38px 16px 44px" : "52px 24px 56px",
        background: "#F8FAFC",
        borderBottom: `1px solid ${T.line}`,
        width: "100%",
      }}>
        <div style={{ maxWidth: 1360, margin: "0 auto" }}>
          <div style={{ textAlign: "center", maxWidth: 740, margin: "0 auto 34px" }}>
            <div style={{
              fontFamily: FONT_MONO,
              fontSize: 12,
              fontWeight: 700,
              color: T.teal,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              marginBottom: 8,
            }}>
              Role-Based Access Pathways
            </div>
            <h2 style={{
              fontFamily: FONT_PRIMARY,
              fontSize: "clamp(24px, 3vw, 34px)",
              fontWeight: 800,
              color: T.tealDeep,
              margin: "0 0 10px",
              lineHeight: 1.25,
              letterSpacing: "-0.3px",
            }}>
              Secondary Navigation by User Profile
            </h2>
            <p style={{ fontSize: 15, color: T.inkMuted, lineHeight: 1.6, margin: 0, fontFamily: FONT_PRIMARY }}>
              Tailored directories designed specifically for implementing partners, donors, information managers, and government authorities.
            </p>
          </div>

          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 280px), 1fr))",
            gap: 20,
          }}>

            {/* Profile 1: Implementing Partners */}
            <div style={{
              background: T.white,
              border: "1px solid #E2E8F0",
              borderTop: `3.5px solid ${T.teal}`,
              borderRadius: "0 0 10px 10px",
              padding: "22px 20px 20px",
              display: "flex",
              flexDirection: "column",
              boxShadow: "0 2px 8px rgba(0, 0, 0, 0.04)",
              transition: "transform 0.2s ease, box-shadow 0.2s ease",
            }}
            onMouseEnter={e => {
              e.currentTarget.style.transform = "translateY(-2px)";
              e.currentTarget.style.boxShadow = "0 8px 20px rgba(11, 60, 70, 0.07)";
            }}
            onMouseLeave={e => {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow = "0 2px 8px rgba(0, 0, 0, 0.04)";
            }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
                <div style={{ width: 40, height: 40, borderRadius: 8, background: T.tealSoft, color: T.teal, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, flexShrink: 0 }}>
                  <i className="fa-solid fa-handshake"></i>
                </div>
                <div>
                  <h3 style={{ fontFamily: FONT_PRIMARY, fontSize: 17, fontWeight: 700, color: T.tealDeep, margin: 0, lineHeight: 1.25 }}>
                    Implementing Partners
                  </h3>
                  <span style={{ fontSize: 11, fontFamily: FONT_MONO, color: T.teal, fontWeight: 700, letterSpacing: "0.02em" }}>UN · INGOs · National NGOs</span>
                </div>
              </div>

              <p style={{ fontSize: 13, color: "#475569", lineHeight: 1.5, margin: "0 0 16px", fontFamily: FONT_PRIMARY }}>
                Access submission portals, indicator reporting guidelines, and coordination tools.
              </p>

              <div style={{ display: "flex", flexDirection: "column", gap: 6, marginTop: "auto" }}>
                {[
                  { label: "Submit Monthly 5W Report", path: "/submit-report" },
                  { label: "5W Indicator Guidance & Rules", path: "/submit-report" },
                  { label: "Partner Response Directory", path: "/coverage-dashboard" },
                  { label: "Submissions Queue & Quality", path: "/coverage-dashboard" },
                  { label: "Partner Sign In Portal", path: "/signin" },
                ].map(link => (
                  <button
                    key={link.label}
                    onClick={() => handleAction(link.path)}
                    style={{
                      background: "#F8FAFC",
                      border: "1px solid #EEF2F6",
                      borderRadius: 6,
                      padding: "9px 12px",
                      fontSize: 13.5,
                      fontWeight: 600,
                      color: T.tealDeep,
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      textAlign: "left",
                      fontFamily: FONT_PRIMARY,
                      transition: "all 0.15s ease",
                    }}
                    onMouseEnter={e => {
                      e.currentTarget.style.background = T.tealSoft;
                      e.currentTarget.style.borderColor = T.teal;
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.background = "#F8FAFC";
                      e.currentTarget.style.borderColor = "#EEF2F6";
                    }}
                  >
                    <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <i className="fa-solid fa-arrow-right" style={{ color: T.teal, fontSize: 11.5, flexShrink: 0 }} />
                      {link.label}
                    </span>
                    <i className="fa-solid fa-chevron-right" style={{ fontSize: 9.5, color: "#94A3B8" }}></i>
                  </button>
                ))}
              </div>
            </div>

            {/* Profile 2: Donors & Strategic Leads */}
            <div style={{
              background: T.white,
              border: "1px solid #E2E8F0",
              borderTop: `3.5px solid ${T.clay}`,
              borderRadius: "0 0 10px 10px",
              padding: "22px 20px 20px",
              display: "flex",
              flexDirection: "column",
              boxShadow: "0 2px 8px rgba(0, 0, 0, 0.04)",
              transition: "transform 0.2s ease, box-shadow 0.2s ease",
            }}
            onMouseEnter={e => {
              e.currentTarget.style.transform = "translateY(-2px)";
              e.currentTarget.style.boxShadow = "0 8px 20px rgba(11, 60, 70, 0.07)";
            }}
            onMouseLeave={e => {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow = "0 2px 8px rgba(0, 0, 0, 0.04)";
            }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
                <div style={{ width: 40, height: 40, borderRadius: 8, background: T.claySoft, color: T.clay, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, flexShrink: 0 }}>
                  <i className="fa-solid fa-sack-dollar"></i>
                </div>
                <div>
                  <h3 style={{ fontFamily: FONT_PRIMARY, fontSize: 17, fontWeight: 700, color: T.tealDeep, margin: 0, lineHeight: 1.25 }}>
                    Donors &amp; Strategic Leads
                  </h3>
                  <span style={{ fontSize: 11, fontFamily: FONT_MONO, color: T.clay, fontWeight: 700, letterSpacing: "0.02em" }}>ECHO · BHA · FCDO · CERF</span>
                </div>
              </div>

              <p style={{ fontSize: 13, color: "#475569", lineHeight: 1.5, margin: "0 0 16px", fontFamily: FONT_PRIMARY }}>
                Inspect inter-agency coverage maps, funding gaps, and live reach statistics.
              </p>

              <div style={{ display: "flex", flexDirection: "column", gap: 6, marginTop: "auto" }}>
                {[
                  { label: "Response Coverage Dashboard", path: "/coverage-dashboard" },
                  { label: "Beneficiary Reach Matrix", path: "/coverage-dashboard" },
                  { label: "Priority LGA Severity Index", path: "/coverage-dashboard" },
                  { label: "Humanitarian Bulletins & SITREPs", path: "/coverage-dashboard" },
                  { label: "Live HDX Data Exchange Feed", path: "/coverage-dashboard" },
                ].map(link => (
                  <button
                    key={link.label}
                    onClick={() => handleAction(link.path)}
                    style={{
                      background: "#F8FAFC",
                      border: "1px solid #EEF2F6",
                      borderRadius: 6,
                      padding: "9px 12px",
                      fontSize: 13.5,
                      fontWeight: 600,
                      color: T.tealDeep,
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      textAlign: "left",
                      fontFamily: FONT_PRIMARY,
                      transition: "all 0.15s ease",
                    }}
                    onMouseEnter={e => {
                      e.currentTarget.style.background = T.claySoft;
                      e.currentTarget.style.borderColor = T.clay;
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.background = "#F8FAFC";
                      e.currentTarget.style.borderColor = "#EEF2F6";
                    }}
                  >
                    <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <i className="fa-solid fa-arrow-right" style={{ color: T.clay, fontSize: 11.5, flexShrink: 0 }} />
                      {link.label}
                    </span>
                    <i className="fa-solid fa-chevron-right" style={{ fontSize: 9.5, color: "#94A3B8" }}></i>
                  </button>
                ))}
              </div>
            </div>

            {/* Profile 3: IM / Cluster Team */}
            <div style={{
              background: T.white,
              border: "1px solid #E2E8F0",
              borderTop: "3.5px solid #6D28D9",
              borderRadius: "0 0 10px 10px",
              padding: "22px 20px 20px",
              display: "flex",
              flexDirection: "column",
              boxShadow: "0 2px 8px rgba(0, 0, 0, 0.04)",
              transition: "transform 0.2s ease, box-shadow 0.2s ease",
            }}
            onMouseEnter={e => {
              e.currentTarget.style.transform = "translateY(-2px)";
              e.currentTarget.style.boxShadow = "0 8px 20px rgba(11, 60, 70, 0.07)";
            }}
            onMouseLeave={e => {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow = "0 2px 8px rgba(0, 0, 0, 0.04)";
            }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
                <div style={{ width: 40, height: 40, borderRadius: 8, background: "#EDE9FE", color: "#6D28D9", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, flexShrink: 0 }}>
                  <i className="fa-solid fa-server"></i>
                </div>
                <div>
                  <h3 style={{ fontFamily: FONT_PRIMARY, fontSize: 17, fontWeight: 700, color: T.tealDeep, margin: 0, lineHeight: 1.25 }}>
                    IM / Cluster Team
                  </h3>
                  <span style={{ fontSize: 11, fontFamily: FONT_MONO, color: "#6D28D9", fontWeight: 700, letterSpacing: "0.02em" }}>Secretariat · IMO · QA</span>
                </div>
              </div>

              <p style={{ fontSize: 13, color: "#475569", lineHeight: 1.5, margin: "0 0 16px", fontFamily: FONT_PRIMARY }}>
                Sector data governance, quality validation, Power BI feeds, and freeze controls.
              </p>

              <div style={{ display: "flex", flexDirection: "column", gap: 6, marginTop: "auto" }}>
                {[
                  { label: "Sector Governance Console", path: "/admin/dashboard" },
                  { label: "5W Data Quality Assurance", path: "/admin/dashboard" },
                  { label: "Power BI OData & GIS Feeds", path: "/admin/powerbi" },
                  { label: "Reporting Deadlines & Freeze", path: "/admin/settings" },
                  { label: "Partner Agency User Manager", path: "/admin/users" },
                ].map(link => (
                  <button
                    key={link.label}
                    onClick={() => handleAction(link.path)}
                    style={{
                      background: "#F8FAFC",
                      border: "1px solid #EEF2F6",
                      borderRadius: 6,
                      padding: "9px 12px",
                      fontSize: 13.5,
                      fontWeight: 600,
                      color: T.tealDeep,
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      textAlign: "left",
                      fontFamily: FONT_PRIMARY,
                      transition: "all 0.15s ease",
                    }}
                    onMouseEnter={e => {
                      e.currentTarget.style.background = "#F3E8FF";
                      e.currentTarget.style.borderColor = "#6D28D9";
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.background = "#F8FAFC";
                      e.currentTarget.style.borderColor = "#EEF2F6";
                    }}
                  >
                    <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <i className="fa-solid fa-arrow-right" style={{ color: "#6D28D9", fontSize: 11.5, flexShrink: 0 }} />
                      {link.label}
                    </span>
                    <i className="fa-solid fa-chevron-right" style={{ fontSize: 9.5, color: "#94A3B8" }}></i>
                  </button>
                ))}
              </div>
            </div>

            {/* Profile 4: Government Stakeholders */}
            <div style={{
              background: T.white,
              border: "1px solid #E2E8F0",
              borderTop: `3.5px solid ${T.green}`,
              borderRadius: "0 0 10px 10px",
              padding: "22px 20px 20px",
              display: "flex",
              flexDirection: "column",
              boxShadow: "0 2px 8px rgba(0, 0, 0, 0.04)",
              transition: "transform 0.2s ease, box-shadow 0.2s ease",
            }}
            onMouseEnter={e => {
              e.currentTarget.style.transform = "translateY(-2px)";
              e.currentTarget.style.boxShadow = "0 8px 20px rgba(11, 60, 70, 0.07)";
            }}
            onMouseLeave={e => {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow = "0 2px 8px rgba(0, 0, 0, 0.04)";
            }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
                <div style={{ width: 40, height: 40, borderRadius: 8, background: T.greenSoft, color: T.green, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, flexShrink: 0 }}>
                  <i className="fa-solid fa-building-columns"></i>
                </div>
                <div>
                  <h3 style={{ fontFamily: FONT_PRIMARY, fontSize: 17, fontWeight: 700, color: T.tealDeep, margin: 0, lineHeight: 1.25 }}>
                    Government Stakeholders
                  </h3>
                  <span style={{ fontSize: 11, fontFamily: FONT_MONO, color: T.green, fontWeight: 700, letterSpacing: "0.02em" }}>RUWASSA · State Water Boards</span>
                </div>
              </div>

              <p style={{ fontSize: 13, color: "#475569", lineHeight: 1.5, margin: "0 0 16px", fontFamily: FONT_PRIMARY }}>
                State rural water authorities, Ministry of Water Resources, and outbreak taskforces.
              </p>

              <div style={{ display: "flex", flexDirection: "column", gap: 6, marginTop: "auto" }}>
                {[
                  { label: "Borno State RUWASSA & Water Board", path: "/coverage-dashboard" },
                  { label: "Adamawa & Yobe Rural Water Agencies", path: "/coverage-dashboard" },
                  { label: "State Cholera & Outbreak Taskforces", path: "/coverage-dashboard" },
                  { label: "Environmental Health & Sanitation", path: "/coverage-dashboard" },
                  { label: "National Joint Sector Review Matrix", path: "/coverage-dashboard" },
                ].map(link => (
                  <button
                    key={link.label}
                    onClick={() => handleAction(link.path)}
                    style={{
                      background: "#F8FAFC",
                      border: "1px solid #EEF2F6",
                      borderRadius: 6,
                      padding: "9px 12px",
                      fontSize: 13.5,
                      fontWeight: 600,
                      color: T.tealDeep,
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      textAlign: "left",
                      fontFamily: FONT_PRIMARY,
                      transition: "all 0.15s ease",
                    }}
                    onMouseEnter={e => {
                      e.currentTarget.style.background = T.greenSoft;
                      e.currentTarget.style.borderColor = T.green;
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.background = "#F8FAFC";
                      e.currentTarget.style.borderColor = "#EEF2F6";
                    }}
                  >
                    <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <i className="fa-solid fa-arrow-right" style={{ color: T.green, fontSize: 11.5, flexShrink: 0 }} />
                      {link.label}
                    </span>
                    <i className="fa-solid fa-chevron-right" style={{ fontSize: 9.5, color: "#94A3B8" }}></i>
                  </button>
                ))}
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════
          7. SECTOR GOVERNANCE & REPORTING CADENCE (Compact)
      ══════════════════════════════════════════════════════════════════ */}
      <section id="governance-cadence" style={{
        padding: isMobile ? "38px 16px 44px" : "50px 24px 54px",
        background: T.white,
        borderBottom: `1px solid ${T.line}`,
        width: "100%",
      }}>
        <div style={{ maxWidth: 1360, margin: "0 auto" }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 320px), 1fr))", gap: 24 }}>

            {/* Left: Reporting Rules */}
            <div style={{ background: T.bgSubtle, border: `1.5px solid ${T.line}`, borderRadius: 14, padding: "26px 22px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
                <span style={{ color: T.teal }}><IcoDocument /></span>
                <h3 style={{ fontFamily: FONT_PRIMARY, fontSize: 20, fontWeight: 700, color: T.tealDeep, margin: 0 }}>
                  Reporting Cadence &amp; Rules
                </h3>
              </div>

              <p style={{ fontSize: 14, color: T.inkMuted, lineHeight: 1.55, marginBottom: 18, fontFamily: FONT_PRIMARY }}>
                Every accredited organization operating in Borno, Adamawa, or Yobe is required to submit monthly 5W returns:
              </p>

              <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 20 }}>
                {[
                  { title: "Submission Timetable", text: `Reports strictly due by the last working day of each month. Next deadline: ${deadline}.` },
                  { title: "Granular Site Reporting", text: "Submit separate entries for every specific settlement, ward, and IDP camp." },
                  { title: "Monthly Beneficiary Count", text: "Indicate unique individuals reached in the reporting month, not cumulative annual totals." },
                  { title: "Technical Validation", text: "IM team verifies coordinates against official administrative boundaries before going live." },
                ].map(rule => (
                  <div key={rule.title} style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                    <span style={{ color: T.green, marginTop: 2 }}><IcoCheck /></span>
                    <div>
                      <div style={{ fontSize: 13.5, fontWeight: 700, color: T.tealDeep, fontFamily: FONT_PRIMARY }}>{rule.title}</div>
                      <div style={{ fontSize: 13, color: T.inkMuted, lineHeight: 1.45, fontFamily: FONT_PRIMARY }}>{rule.text}</div>
                    </div>
                  </div>
                ))}
              </div>

              <div style={{ borderTop: `1px solid ${T.line}`, paddingTop: 16 }}>
                <button
                  onClick={() => handleAction("/submit-report")}
                  style={{
                    background: T.clay,
                    color: T.white,
                    border: "none",
                    borderRadius: 6,
                    padding: "9px 18px",
                    fontSize: 13.5,
                    fontWeight: 600,
                    cursor: "pointer",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 6,
                    fontFamily: FONT_PRIMARY,
                  }}
                >
                  Open 5W Submission Form <IcoArrowRight size={14} />
                </button>
              </div>
            </div>

            {/* Right: Coordination Contacts */}
            <div style={{ background: T.bgSubtle, border: `1.5px solid ${T.line}`, borderRadius: 14, padding: "26px 22px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
                <span style={{ color: T.teal }}><IcoUsers /></span>
                <h3 style={{ fontFamily: FONT_PRIMARY, fontSize: 20, fontWeight: 700, color: T.tealDeep, margin: 0 }}>
                  Coordination Hubs &amp; Contacts
                </h3>
              </div>

              <p style={{ fontSize: 14, color: T.inkMuted, lineHeight: 1.55, marginBottom: 18, fontFamily: FONT_PRIMARY }}>
                Reach out to sector focal points for technical assistance or coordination meeting agendas:
              </p>

              <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 20 }}>
                {[
                  { role: "National Sector Lead Agency", contact: "Federal Ministry of Water Resources & UNICEF", type: "lead" },
                  { role: "Sector Coordinator (Maiduguri)", contact: "coordinator@washsector-ne.org", type: "email" },
                  { role: "Information Management Officer (IMO)", contact: "im@washsector-ne.org", type: "email" },
                  { role: "Reporting Helpdesk Hotline", contact: "+234 (0) 800-WASH-HELP", type: "phone" },
                  { role: "Bi-weekly Coordination Meeting", contact: "Every Alternate Tuesday · 10:00 AM (Hybrid)", type: "cal" },
                ].map(c => (
                  <div key={c.role} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: `1px solid ${T.line}`, paddingBottom: 8 }}>
                    <span style={{ fontSize: 13, color: T.inkMuted, fontFamily: FONT_PRIMARY }}>{c.role}</span>
                    <span style={{ fontSize: 13, fontWeight: 600, color: T.tealDeep, fontFamily: c.type === "email" ? FONT_MONO : FONT_PRIMARY }}>
                      {c.type === "email" ? (
                        <a href={`mailto:${c.contact}`} style={{ color: T.teal, textDecoration: "none" }}>{c.contact}</a>
                      ) : (
                        c.contact
                      )}
                    </span>
                  </div>
                ))}
              </div>

              <div style={{ borderTop: `1px solid ${T.line}`, paddingTop: 16 }}>
                <div style={{ fontSize: 11.5, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: T.inkMuted, marginBottom: 8, fontFamily: FONT_PRIMARY }}>
                  Quick Navigation:
                </div>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  <button onClick={() => handleAction("/submit-report")} style={{ background: T.white, border: `1px solid ${T.line}`, padding: "6px 12px", borderRadius: 6, fontSize: 12.5, fontWeight: 600, color: T.tealDeep, cursor: "pointer", fontFamily: FONT_PRIMARY }}>
                    Submit 5W Report
                  </button>
                  <button onClick={() => handleAction("/coverage-dashboard")} style={{ background: T.white, border: `1px solid ${T.line}`, padding: "6px 12px", borderRadius: 6, fontSize: 12.5, fontWeight: 600, color: T.tealDeep, cursor: "pointer", fontFamily: FONT_PRIMARY }}>
                    Coverage Metrics
                  </button>
                  <button onClick={() => handleAction("/signin")} style={{ background: T.white, border: `1px solid ${T.line}`, padding: "6px 12px", borderRadius: 6, fontSize: 12.5, fontWeight: 600, color: T.tealDeep, cursor: "pointer", fontFamily: FONT_PRIMARY }}>
                    Partner Portal
                  </button>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════
          8. OPERATIONAL & IMPLEMENTING PARTNERS MARQUEE (Compact)
      ══════════════════════════════════════════════════════════════════ */}
      <section
        id="partners"
        style={{
          background: "#FFFFFF",
          borderTop: `1px solid ${T.line}`,
          borderBottom: `1px solid ${T.line}`,
          padding: isMobile ? "32px 0 28px" : "40px 0 36px",
          width: "100%",
          overflow: "hidden",
          position: "relative",
        }}
      >
        <div style={{ maxWidth: 1280, margin: "0 auto", padding: "0 24px 18px", textAlign: "center" }}>
          <div style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            padding: "4px 12px",
            borderRadius: 20,
            background: "#E4F0EF",
            border: "1px solid #CFE5E2",
            color: T.tealDeep,
            fontSize: 11.5,
            fontWeight: 700,
            letterSpacing: "0.05em",
            textTransform: "uppercase",
            fontFamily: FONT_PRIMARY,
            marginBottom: 8,
          }}>
            <i className="fa-solid fa-handshake" style={{ color: T.teal }}></i>
            Inter-Agency Consortium
          </div>
          <h2 style={{
            fontFamily: FONT_PRIMARY,
            fontSize: "clamp(24px, 2.8vw, 32px)",
            fontWeight: 800,
            color: T.tealDeep,
            margin: "0 0 8px",
            letterSpacing: "-0.4px",
          }}>
            Operational &amp; Implementing Partners
          </h2>
          <p style={{
            fontFamily: FONT_PRIMARY,
            fontSize: 14.5,
            color: T.inkMuted,
            maxWidth: 680,
            margin: "0 auto",
            lineHeight: 1.5,
          }}>
            Over 40 accredited United Nations agencies, international non-governmental organizations, and national civil society organizations.
          </p>
        </div>

        {/* Continuous Step-Scrolling Logo Showcase */}
        <div style={{
          position: "relative",
          width: "100%",
          overflow: "hidden",
          padding: "10px 0 16px",
        }}>
          <div style={{
            position: "absolute",
            top: 0,
            left: 0,
            bottom: 0,
            width: 100,
            background: "linear-gradient(to right, rgba(255,255,255,1), rgba(255,255,255,0))",
            zIndex: 3,
            pointerEvents: "none",
          }} />
          <div style={{
            position: "absolute",
            top: 0,
            right: 0,
            bottom: 0,
            width: 100,
            background: "linear-gradient(to left, rgba(255,255,255,1), rgba(255,255,255,0))",
            zIndex: 3,
            pointerEvents: "none",
          }} />

          <div className="partner-marquee-track" style={{ gap: 16, paddingLeft: 16 }}>
            {[...WASH_CLUSTER_MEMBERS, ...WASH_CLUSTER_MEMBERS].map((p, idx) => (
              <div
                key={`${p.name}-${idx}`}
                style={{
                  minWidth: 210,
                  maxWidth: 230,
                  background: "#FAFCFC",
                  border: "1.5px solid #E2EAE7",
                  borderRadius: 10,
                  padding: "14px 12px",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  textAlign: "center",
                  boxShadow: "0 2px 6px rgba(11, 60, 70, 0.03)",
                  transition: "all 0.2s ease",
                  flexShrink: 0,
                  cursor: "default",
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.transform = "translateY(-3px)";
                  e.currentTarget.style.boxShadow = "0 6px 14px rgba(11, 60, 70, 0.1)";
                  e.currentTarget.style.borderColor = "#12707E";
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow = "0 2px 6px rgba(11, 60, 70, 0.03)";
                  e.currentTarget.style.borderColor = "#E2EAE7";
                }}
              >
                <div style={{
                  height: 44,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: 8,
                  padding: "3px 6px",
                  background: "#FFFFFF",
                  borderRadius: 6,
                  border: "1px solid #EEF3F1",
                  width: "100%",
                }}>
                  <img
                    src={p.logo}
                    alt={p.name}
                    style={{
                      maxHeight: 36,
                      maxWidth: 140,
                      objectFit: "contain",
                    }}
                    onError={e => {
                      (e.currentTarget as HTMLElement).style.display = "none";
                    }}
                  />
                </div>
                <div style={{
                  fontFamily: FONT_PRIMARY,
                  fontSize: 13,
                  fontWeight: 700,
                  color: T.tealDeep,
                  marginBottom: 3,
                  minHeight: 34,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}>
                  {p.name}
                </div>
                <span style={{
                  display: "inline-block",
                  padding: "2px 7px",
                  borderRadius: 10,
                  fontSize: 10,
                  fontWeight: 600,
                  background: p.category === "UN Agency" ? "#E4F0EF" : "#F5F3EF",
                  color: p.category === "UN Agency" ? T.teal : "#7A5A35",
                  border: `1px solid ${p.category === "UN Agency" ? "#CFE5E2" : "#E8DFC8"}`,
                  fontFamily: FONT_PRIMARY,
                }}>
                  {p.category || "Global WASH Member"}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div style={{ textAlign: "center", marginTop: 14 }}>
          <button
            onClick={() => handleAction("/coverage-dashboard")}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              background: T.white,
              border: `1.5px solid ${T.teal}`,
              color: T.teal,
              padding: "8px 18px",
              borderRadius: 6,
              fontSize: 13,
              fontWeight: 700,
              cursor: "pointer",
              fontFamily: FONT_PRIMARY,
              transition: "all 0.15s ease",
            }}
            onMouseEnter={e => {
              e.currentTarget.style.background = T.teal;
              e.currentTarget.style.color = T.white;
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = T.white;
              e.currentTarget.style.color = T.teal;
            }}
          >
            <i className="fa-solid fa-chart-pie"></i>
            Explore Response Coverage Dashboard
            <i className="fa-solid fa-arrow-right" style={{ fontSize: 10 }}></i>
          </button>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════
          9. FULL-WIDTH CALL TO ACTION BANNER (Compact)
      ══════════════════════════════════════════════════════════════════ */}
      <section style={{
        background: "linear-gradient(135deg, #0B3C46 0%, #12707E 100%)",
        color: T.white,
        padding: isMobile ? "40px 16px" : "52px 24px",
        textAlign: "center",
        width: "100%",
        position: "relative",
      }}>
        <div style={{ maxWidth: 880, margin: "0 auto" }}>
          <h2 style={{
            fontFamily: FONT_PRIMARY,
            fontSize: "clamp(26px, 3.4vw, 38px)",
            fontWeight: 800,
            margin: "0 0 12px",
            lineHeight: 1.2,
          }}>
            Are You Delivering Life-Saving WASH Activities in the North East?
          </h2>

          <p style={{
            fontSize: 15.5,
            color: "#D6F0ED",
            lineHeight: 1.55,
            margin: "0 auto 26px",
            maxWidth: 720,
            fontFamily: FONT_PRIMARY,
          }}>
            Make sure your interventions are reflected in inter-agency coverage maps, sector bulletins,
            and donor humanitarian funding overviews.
          </p>

          <div style={{
            display: "flex",
            gap: isMobile ? 10 : 14,
            justifyContent: "center",
            flexDirection: isMobile ? "column" : "row",
            alignItems: isMobile ? "stretch" : "center",
            width: "100%",
            maxWidth: isMobile ? "100%" : "none",
          }}>
            <button
              id="cta-submit-btn"
              onClick={() => handleAction("/submit-report")}
              style={{
                background: T.clay,
                color: T.white,
                border: "none",
                borderRadius: 8,
                padding: isMobile ? "11px 18px" : "13px 28px",
                fontSize: isMobile ? 14 : 15,
                fontWeight: 700,
                cursor: "pointer",
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
                width: isMobile ? "100%" : "auto",
                boxSizing: "border-box",
                fontFamily: FONT_PRIMARY,
                boxShadow: "0 4px 18px rgba(0,0,0,0.22)",
              }}
              onMouseEnter={e => (e.currentTarget.style.background = T.clayHover)}
              onMouseLeave={e => (e.currentTarget.style.background = T.clay)}
            >
              Submit Your 5W Data Now <IcoArrowRight size={16} />
            </button>

            {isAuthenticated ? (
              <button
                onClick={() => navigate("/dashboard")}
                style={{
                  background: "rgba(255,255,255,0.18)",
                  color: T.white,
                  border: "1.5px solid rgba(255,255,255,0.4)",
                  borderRadius: 8,
                  padding: isMobile ? "11px 18px" : "13px 24px",
                  fontSize: isMobile ? 14 : 15,
                  fontWeight: 600,
                  cursor: "pointer",
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: isMobile ? "100%" : "auto",
                  boxSizing: "border-box",
                  fontFamily: FONT_PRIMARY,
                }}
              >
                Access Coordinator Dashboard
              </button>
            ) : (
              <button
                onClick={() => navigate("/signin")}
                style={{
                  background: "rgba(255,255,255,0.18)",
                  color: T.white,
                  border: "1.5px solid rgba(255,255,255,0.4)",
                  borderRadius: 10,
                  padding: isMobile ? "11px 18px" : "13px 24px",
                  fontSize: isMobile ? 14 : 15,
                  fontWeight: 600,
                  cursor: "pointer",
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: isMobile ? "100%" : "auto",
                  boxSizing: "border-box",
                  fontFamily: FONT_PRIMARY,
                }}
              >
                Partner Login Portal
              </button>
            )}
          </div>
        </div>
      </section>

    </div>
  );
}

LandingPage.layout = (page: any) => <PublicLayout>{page}</PublicLayout>;
