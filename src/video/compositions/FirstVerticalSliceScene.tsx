import React from "react";
import { Easing, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { MobileApp } from "../../components/v2/MobileApp";
import { PaymentRequestPacket } from "../../components/v2/PaymentRequestPacket";
import { ApiGatewayRich } from "../../components/v2/ApiGatewayRich";
import { FIRST_SLICE_SHOTS, shotAt, primaryFocusAt } from "../shot/ShotPlan";

export const FirstVerticalSliceScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  const shot = shotAt(t);
  const focus = primaryFocusAt(t);

  // Camera choreography — shot-based, semantic, smooth
  const e = Easing.out(Easing.cubic);
  const eInOut = Easing.inOut(Easing.cubic);
  let camScale = 1, camX = 0;
  if (t < 1.5) { camScale = 0.95; camX = 0; } // ESTABLISH wide
  else if (t < 3.0) { const p = (t - 1.5) / 1.5; camScale = interpolate(e(p), [0, 1], [0.95, 1.18]); camX = interpolate(e(p), [0, 1], [0, -170]); } // FOCUS mobile
  else if (t < 4.0) { camScale = 1.18; camX = -170; } // PAY ACTION close
  else if (t < 4.5) { camScale = 1.12; camX = -80; } // REQUEST CREATION medium
  else if (t < 6.5) { // FOLLOW request — camera tracks packet X
    const p = (t - 4.5) / 2.0; // travel 2s
    const eased = eInOut(p);
    // Packet travels -260 → 260, camera follows its X (centered)
    const packetX = -260 + 520 * eased;
    camX = interpolate(packetX, [-260, 260], [-80, 160]);
    camScale = 1.02;
  } else if (t < 7.2) { const p = (t - 6.5) / 0.7; camScale = interpolate(e(p), [0, 1], [1.02, 1]); camX = interpolate(e(p), [0, 1], [160, 140]); } // GATEWAY ARRIVAL settle
  else if (t < 10.5) { const p = (t - 7.2) / 3.3; camScale = interpolate(e(p), [0, 1], [1, 1.06]); camX = 140; } // PUSH_IN gateway
  else { camScale = 0.98; camX = 0; } // RESOLVE pull out

  // Interaction & choreography
  const highlightPay = t >= 2.4 && t < 3.8;
  const tapped = t >= 3.25 && t < 3.55;
  const created = t >= 4.0;
  const travelP = created ? Math.max(0, Math.min(1, (t - 4.5) / 2.0)) : 0;
  const travelVisible = created && t >= 4.5 && t < 6.7;
  const startX = -260, endX = 260;
  const packetX = startX + (endX - startX) * Easing.out(Easing.cubic)(travelP);
  const packetY = -12 + Math.sin(travelP * Math.PI) * -10;
  const gatewayStage = t < 4.8 ? 0 : t < 5.8 ? 1 : t < 7.0 ? 2 : t < 8.2 ? 3 : 4;
  const gatewayHighlight = t >= 6.5;

  return (
    <div style={{ width: "100%", height: "100%", background: "#0B0F17", overflow: "hidden", position: "relative", fontFamily: "Inter, system-ui, sans-serif" }}>
      <div style={{ position: "absolute", inset: 0, background: "radial-gradient(900px 500px at 18% 22%, rgba(6,182,212,0.05), transparent), radial-gradient(700px 400px at 82% 78%, rgba(139,92,246,0.05), transparent)" }} />
      <div style={{ position: "absolute", inset: 0, opacity: 0.2, backgroundImage: "radial-gradient(circle at 1px 1px, #64748B 1px, transparent 0)", backgroundSize: "26px 26px" }} />
      <div
        style={{
          position: "absolute",
          inset: 64, // 64px minimum padding safe zone on all edges
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 70,
          transform: `scale(${camScale}) translate(${camX}px, 0px)`,
          transformOrigin: "center center",
          willChange: "transform",
        }}
      >
        {/* Mobile App — primary in shots 2-4 */}
        <div style={{ opacity: focus === "gateway" ? 0.78 : 1, transform: `scale(${focus === "mobile" ? 1.06 : focus === "system" ? 1 : 0.94})`, filter: focus === "mobile" ? "drop-shadow(0 28px 50px rgba(0,0,0,0.16))" : "drop-shadow(0 14px 28px rgba(0,0,0,0.08))", transition: "all 0.35s cubic-bezier(0.16,1,0.3,1)", zIndex: focus === "mobile" ? 3 : 1 }}>
          <MobileApp highlightPay={highlightPay} tapped={tapped} />
        </div>
        {/* Request path — spatial composition, trail */}
        <div style={{ width: 200, height: 340, position: "relative", display: "flex", alignItems: "center", justifyContent: "center", opacity: focus === "request" ? 1 : 0.75 }}>
          {/* Path line */}
          <div style={{ position: "absolute", top: "50%", left: 0, right: 0, height: 2, background: travelVisible ? "linear-gradient(90deg, #e2e8f0 0%, #6366f1 45%, #0ea5e9 100%)" : "linear-gradient(90deg, #e2e8f0, #cbd5e1)", borderRadius: 1, opacity: 0.9 }} />
          {/* Direction chevrons during travel */}
          {travelVisible && (
            <div style={{ position: "absolute", top: "50%", left: "50%", width: 100, height: 2, marginLeft: -50, marginTop: -1, display: "flex", justifyContent: "space-between", opacity: 0.5 }}>
              <span style={{ color: "#6366f1", fontSize: 10 }}>›</span><span style={{ color: "#6366f1", fontSize: 10 }}>›</span><span style={{ color: "#0ea5e9", fontSize: 10 }}>›</span>
            </div>
          )}
          <div style={{ position: "absolute", left: packetX - startX, top: `calc(50% + ${packetY}px)`, transform: "translate(-50%, -50%)", zIndex: 4, opacity: travelVisible ? 1 : 0, transition: "opacity 0.15s" }}>
            <PaymentRequestPacket progress={travelP} visible={travelVisible} />
          </div>
        </div>
        {/* API Gateway — rich, progressive */}
        <div style={{ opacity: focus === "mobile" ? 0.8 : 1, transform: `scale(${focus === "gateway" ? 1.05 : 0.97})`, filter: focus === "gateway" ? "drop-shadow(0 22px 44px rgba(99,102,241,0.16))" : "drop-shadow(0 10px 18px rgba(0,0,0,0.06))", transition: "all 0.35s cubic-bezier(0.16,1,0.3,1)", zIndex: focus === "gateway" ? 3 : 1 }}>
          <ApiGatewayRich stage={gatewayStage} highlight={gatewayHighlight} />
        </div>
      </div>
      <div style={{ position: "absolute", inset: 0, pointerEvents: "none", boxShadow: "inset 0 0 100px rgba(15,23,42,0.05)" }} />
      {/* No debug hierarchy indicator in production — removed per §8 */}
    </div>
  );
};
