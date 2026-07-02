import {
  AbsoluteFill,
  Easing,
  interpolate,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";

export const fiveBarChartData = [
  {label: "Flights", value: 92, color: "#ff6b6b"},
  {label: "Hotels", value: 81, color: "#ffd166"},
  {label: "Rail", value: 74, color: "#4ecdc4"},
  {label: "Road Trips", value: 63, color: "#5fa8ff"},
  {label: "Experiences", value: 88, color: "#c77dff"},
];

const chartHeight = 360;
const maxValue = Math.max(...fiveBarChartData.map((item) => item.value));

const entrance = (frame, start, duration) =>
  interpolate(frame, [start, start + duration], [0, 1], {
    easing: Easing.bezier(0.16, 1, 0.3, 1),
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

export const FiveBarChart = ({
  title = "Quarterly Travel Interest",
  subtitle = "Animated demand snapshot across five booking channels",
  data = fiveBarChartData,
}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();

  const intro = entrance(frame, 0, fps);
  const cardReveal = entrance(frame, fps * 0.35, fps);
  const footerReveal = entrance(frame, fps * 2.4, fps * 0.7);
  const ambientShift = interpolate(frame, [0, 180], [0, 1], {
    easing: Easing.inOut(Easing.sin),
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill
      style={{
        background:
          "radial-gradient(circle at top left, rgba(95, 168, 255, 0.24), transparent 30%), radial-gradient(circle at 85% 20%, rgba(199, 125, 255, 0.24), transparent 28%), linear-gradient(135deg, #06131f 0%, #10233d 52%, #08111c 100%)",
        color: "#f7fbff",
        fontFamily: '"Avenir Next", "Segoe UI", sans-serif',
        overflow: "hidden",
      }}
    >
      <div
        style={{
          position: "absolute",
          top: -120,
          right: -80,
          width: 280,
          height: 280,
          borderRadius: 999,
          background: "rgba(255, 209, 102, 0.12)",
          filter: "blur(8px)",
          transform: `translateY(${interpolate(ambientShift, [0, 1], [0, 26])}px)`,
        }}
      />
      <div
        style={{
          position: "absolute",
          bottom: -120,
          left: -60,
          width: 300,
          height: 300,
          borderRadius: 999,
          background: "rgba(78, 205, 196, 0.14)",
          filter: "blur(10px)",
          transform: `translateY(${interpolate(ambientShift, [0, 1], [20, -12])}px)`,
        }}
      />

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 30,
          padding: "58px 64px",
          height: "100%",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 12,
            opacity: intro,
            transform: `translateY(${interpolate(intro, [0, 1], [22, 0])}px)`,
          }}
        >
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 10,
              borderRadius: 999,
              background: "rgba(255, 255, 255, 0.1)",
              color: "#d8f2ff",
              padding: "10px 16px",
              fontSize: 16,
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              width: "fit-content",
            }}
          >
            Live travel pulse
          </div>
          <div style={{fontSize: 52, fontWeight: 700, letterSpacing: "-0.04em"}}>
            {title}
          </div>
          <div style={{fontSize: 22, color: "rgba(236, 245, 255, 0.72)"}}>
            {subtitle}
          </div>
        </div>

        <div
          style={{
            position: "relative",
            flex: 1,
            borderRadius: 34,
            background: "rgba(8, 17, 28, 0.54)",
            border: "1px solid rgba(255, 255, 255, 0.08)",
            boxShadow: "0 26px 90px rgba(0, 0, 0, 0.34)",
            padding: "42px 34px 28px",
            opacity: cardReveal,
            transform: `translateY(${interpolate(cardReveal, [0, 1], [26, 0])}px)`,
            overflow: "hidden",
          }}
        >
          {[0, 1, 2, 3].map((line) => (
            <div
              key={line}
              style={{
                position: "absolute",
                left: 34,
                right: 34,
                bottom: 84 + line * 90,
                borderTop: "1px solid rgba(255, 255, 255, 0.09)",
              }}
            />
          ))}

          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-end",
              gap: 20,
              height: "100%",
            }}
          >
            {data.map((item, index) => {
              const reveal = entrance(frame, fps * 0.8 + index * 7, fps * 0.7);
              const labelReveal = entrance(frame, fps * 1.15 + index * 6, fps * 0.5);
              const targetHeight = (item.value / maxValue) * chartHeight;
              const barHeight = interpolate(
                reveal,
                [0, 0.82, 1],
                [0, targetHeight * 1.06, targetHeight],
                {
                  extrapolateLeft: "clamp",
                  extrapolateRight: "clamp",
                },
              );
              const valueLift = interpolate(labelReveal, [0, 1], [12, 0], {
                extrapolateLeft: "clamp",
                extrapolateRight: "clamp",
              });
              const shimmer = interpolate(frame, [index * 8, 90 + index * 8], [0.78, 1], {
                easing: Easing.inOut(Easing.sin),
                extrapolateLeft: "clamp",
                extrapolateRight: "clamp",
              });

              return (
                <div
                  key={item.label}
                  style={{
                    display: "flex",
                    flex: 1,
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "flex-end",
                    gap: 16,
                    height: "100%",
                  }}
                >
                  <div
                    style={{
                      opacity: labelReveal,
                      transform: `translateY(${valueLift}px)`,
                      padding: "10px 14px",
                      borderRadius: 999,
                      background: "rgba(255, 255, 255, 0.1)",
                      color: "#ffffff",
                      fontFamily: '"JetBrains Mono", "SFMono-Regular", monospace',
                      fontSize: 20,
                      fontWeight: 700,
                      letterSpacing: "-0.03em",
                    }}
                  >
                    {item.value}
                  </div>
                  <div
                    style={{
                      width: "100%",
                      maxWidth: 150,
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "flex-end",
                      height: chartHeight + 6,
                    }}
                  >
                    <div
                      style={{
                        width: "100%",
                        height: barHeight,
                        minHeight: barHeight > 0 ? 18 : 0,
                        borderRadius: "28px 28px 10px 10px",
                        background: `linear-gradient(180deg, ${item.color} 0%, rgba(255, 255, 255, 0.16) 100%)`,
                        boxShadow: `0 22px 45px ${item.color}33`,
                        opacity: shimmer,
                        position: "relative",
                        overflow: "hidden",
                      }}
                    >
                      <div
                        style={{
                          position: "absolute",
                          inset: 0,
                          background:
                            "linear-gradient(180deg, rgba(255, 255, 255, 0.26) 0%, rgba(255, 255, 255, 0) 45%)",
                        }}
                      />
                    </div>
                  </div>
                  <div
                    style={{
                      opacity: labelReveal,
                      color: "rgba(240, 247, 255, 0.78)",
                      fontSize: 18,
                      fontWeight: 600,
                      textAlign: "center",
                    }}
                  >
                    {item.label}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            opacity: footerReveal,
            transform: `translateY(${interpolate(footerReveal, [0, 1], [18, 0])}px)`,
          }}
        >
          <div style={{fontSize: 18, color: "rgba(236, 245, 255, 0.66)"}}>
            Staggered entrances are driven entirely by Remotion frames and easing curves.
          </div>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 12,
              borderRadius: 999,
              background: "rgba(255, 255, 255, 0.1)",
              padding: "12px 18px",
              fontFamily: '"JetBrains Mono", "SFMono-Regular", monospace',
              fontSize: 18,
              color: "#d8f2ff",
            }}
          >
            5 bars • 6 sec • 30 fps
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};
