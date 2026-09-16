const config = {
  "*": ["prettier --write --ignore-unknown"],
  "*.{js,mjs,ts,jsx,tsx,vue}": ["eslint --max-warnings 0 --no-warn-ignored --fix"],
};

export default config;
