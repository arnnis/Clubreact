export interface Theme {
  name: string;
  bg: string;
  bg2: string;
  fg: string;
  fg2: string;
}

const defaultTheme: Theme = {
  name: "defaultTheme",
  bg: "#f2efe4",
  bg2: "#FEFCFF",
  fg: "#454245",
  fg2: "#9c9c9c",
};

const nightTheme: Theme = {
  name: "nightTheme",
  bg: "#16171C",
  bg2: "#202126",
  fg: "#eee",
  fg2: "#ccc",
};

export const themes = {
  defaultTheme,
  nightTheme,
};
