/** EndScreen - YouTube-style end screen with subscribe button and next video. */

import React from "react";
import { AbsoluteFill, useCurrentFrame, interpolate } from "remotion";
import type { Theme } from "../../theme/themes";

interface EndScreenProps {
  theme: Theme;
  channelName?: string;
  videoTitle?: string;
  /** Channel avatar/logo data URI */
  avatar?: string;
  /** Next video recommendation */
  nextVideo?: { title: string; thumbnail?: string; videoId?: string };
  /** Second recommendation */
  secondVideo?: { title: string; thumbnail?: string; videoId?: string };
}

const END_SCREEN_DURATION = 180; // frames at 30fps = 6 seconds

export const EndScreen: React.FC<EndScreenProps> = ({
  theme,
  channelName = "Karma OS",
  videoTitle,
  avatar,
  nextVideo,
  secondVideo,
}) => {
  const frame = useCurrentFrame();
  const progress = frame / END_SCREEN_DURATION;
  
  // Fade in over first 0.5s, stay, fade out last 0.5s
  const fadeIn = interpolate(progress, [0, 0.08], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const fadeOut = interpolate(progress, [0.92, 1], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const opacity = Math.min(fadeIn, fadeOut);

  const slideUp = interpolate(progress, [0, 0.15], [30, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  const transform = `translateY(${slideUp}px)`;

  const containerStyle: React.CSSProperties = {
    opacity,
    transform,
    transition: "opacity 0.3s ease-out, transform 0.5s ease-out",
  };

  return (
    <AbsoluteFill style={containerStyle}>
      <div style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        height: "100%",
        padding: "40px",
        background: `linear-gradient(135deg, ${theme.background} 0%, ${theme.surface} 100%)`,
      }}>
        {/* Channel subscribe section */}
        <div style={{
          display: "flex",
          alignItems: "center",
          gap: "20px",
          marginBottom: "30px",
          padding: "20px 30px",
          background: theme.surface2,
          borderRadius: "16px",
          border: `2px solid ${theme.border}`,
          boxShadow: theme.shadow,
        }}>
          <div style={{
            width: "70px",
            height: "70px",
            borderRadius: "50%",
            background: theme.primary,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "28px",
            fontWeight: "800",
            color: theme.background,
            flexShrink: 0,
          }}>
            {avatar ? (
              <img src={avatar} alt="" style={{ width: "70px", height: "70px", borderRadius: "50%", objectFit: "cover" }} />
            ) : (
              channelName.charAt(0).toUpperCase()
            )}
          </div>
          <div style={{ flex: 1 }}>
            <div style={{
              fontSize: "22px",
              fontWeight: "700",
              color: theme.text,
              marginBottom: "4px",
            }}>
              {channelName}
            </div>
            <div style={{
              fontSize: "14px",
              color: theme.muted,
            }}>
              Subscribe for more technical content
            </div>
          </div>
          <button style={{
            padding: "12px 28px",
            fontSize: "16px",
            fontWeight: "700",
            color: theme.background,
            background: theme.accent,
            border: "none",
            borderRadius: "8px",
            cursor: "pointer",
            boxShadow: `0 4px 12px ${theme.accent}66`,
            transition: "transform 0.2s ease, box-shadow 0.2s ease",
          }}>
            SUBSCRIBE
          </button>
        </div>

        {/* Video recommendations */}
        <div style={{
          display: "flex",
          gap: "24px",
          flexWrap: "wrap",
          justifyContent: "center",
          maxWidth: "1000px",
        }}>
          {nextVideo && (
            <EndScreenVideoCard
              title={nextVideo.title}
              thumbnail={nextVideo.thumbnail}
              theme={theme}
            />
          )}
          {secondVideo && (
            <EndScreenVideoCard
              title={secondVideo.title}
              thumbnail={secondVideo.thumbnail}
              theme={theme}
            />
          )}
          {!nextVideo && !secondVideo && (
            <div style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "16px",
              padding: "30px",
              color: theme.muted,
            }}>
              <div style={{
                fontSize: "18px",
                fontWeight: "600",
                color: theme.text,
              }}>
                Thanks for watching!
              </div>
              <div style={{
                fontSize: "14px",
                textAlign: "center",
                maxWidth: "400px",
              }}>
                {videoTitle ? `You just watched: "${videoTitle}"` : "Check out more videos on our channel."}
              </div>
            </div>
          )}
        </div>
      </div>
    </AbsoluteFill>
  );
};

interface EndScreenVideoCardProps {
  title: string;
  thumbnail?: string;
  theme: Theme;
}

const EndScreenVideoCard: React.FC<EndScreenVideoCardProps> = ({ title, thumbnail, theme }) => {
  return (
    <div style={{
      width: "320px",
      background: theme.surface,
      borderRadius: "12px",
      overflow: "hidden",
      border: `2px solid ${theme.border}`,
      boxShadow: theme.shadow,
      transition: "transform 0.2s ease, box-shadow 0.2s ease",
    }}>
      <div style={{
        width: "100%",
        aspectRatio: "16/9",
        background: thumbnail ? `url(${thumbnail}) center/cover` : theme.surface2,
        position: "relative",
      }}>
        {!thumbnail && (
          <div style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: theme.muted,
            fontSize: "14px",
          }}>
            No thumbnail
          </div>
        )}
        <div style={{
          position: "absolute",
          bottom: "8px",
          right: "8px",
          background: "rgba(0,0,0,0.8)",
          color: "#fff",
          padding: "2px 8px",
          borderRadius: "4px",
          fontSize: "12px",
          fontWeight: "600",
        }}>
          WATCH
        </div>
      </div>
      <div style={{
        padding: "12px 16px",
      }}>
        <div style={{
          fontSize: "15px",
          fontWeight: "600",
          color: theme.text,
          lineHeight: 1.3,
          display: "-webkit-box",
          WebkitLineClamp: 2,
          WebkitBoxOrient: "vertical",
          overflow: "hidden",
        }}>
          {title}
        </div>
      </div>
    </div>
  );
};