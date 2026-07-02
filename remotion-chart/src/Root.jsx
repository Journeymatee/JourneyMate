import {Composition} from "remotion";
import {FiveBarChart, fiveBarChartData} from "./FiveBarChart";

export const RemotionRoot = () => {
  return (
    <Composition
      id="FiveBarChart"
      component={FiveBarChart}
      durationInFrames={180}
      fps={30}
      width={1280}
      height={720}
      defaultProps={{
        title: "Quarterly Travel Interest",
        subtitle: "Animated demand snapshot across five booking channels",
        data: fiveBarChartData,
      }}
    />
  );
};
