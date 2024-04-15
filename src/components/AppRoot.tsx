import { Paper, styled } from "@mui/material";
import { maxHeight, minHeight } from "@mui/system";
import * as React from "react";
import { colorTheme } from "./common/color/colorTheme";
import { HomeComponent } from "./HomeComponent";
import { useSpring, animated, config } from "react-spring";

const background = require("../assets/background.JPG");

export const AppRootContainer = styled("div")({
  display: "flex",
  flex: 1,
  justifyContent: "center",
  alignItems: "center",
  minHeight: "100vh",
  minWidth: "100vw",

  backgroundImage: "url(" + background + ")",
  backgroundPosition: "center",
  backgroundSize: "cover",
  backgroundRepeat: "no-repeat",
});

export const AppRoot = () => {
  const animatedProps = useSpring({
    to: { opacity: 1 },
    from: { opacity: 0 },
    delay: 250,
    config: config.molasses,
  });

  return (
    <AppRootContainer>
      <animated.div style={animatedProps}>
        <Paper
          elevation={8}
          style={{
            display: "flex",
            flex: 1,
            justifyContent: "center",
            minHeight: "90vh",
            width: "90vw",
            maxWidth: 900,
            marginLeft: 20,
            marginRight: 20,
            marginTop: 80, 
            marginBottom: 80,
            backgroundColor: colorTheme.offwhiteBackground,
          }}
        >
          <HomeComponent />
        </Paper>
      </animated.div>
    </AppRootContainer>
  );
};
