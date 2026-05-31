export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
        serif: ["var(--font-serif)", "serif"]
      },
      colors: {
        suifu: {
          ink: "rgb(var(--color-ink) / <alpha-value>)",
          paper: "rgb(var(--color-paper) / <alpha-value>)",
          primary: "rgb(var(--color-primary) / <alpha-value>)",
          accent: "rgb(var(--color-accent) / <alpha-value>)",
          gold: "rgb(var(--color-gold) / <alpha-value>)",
          bamboo: "rgb(var(--color-bamboo) / <alpha-value>)",
          muted: "rgb(var(--color-muted) / <alpha-value>)",
          night: "rgb(var(--color-night) / <alpha-value>)",
          steam: "rgb(var(--color-steam) / <alpha-value>)"
        }
      },
      borderRadius: {
        brand: "var(--radius-brand)"
      },
      boxShadow: {
        soft: "0 18px 50px rgb(44 58 30 / 0.14)",
        card: "0 12px 34px rgb(44 58 30 / 0.10)",
        insetLine: "inset 0 0 0 1px rgb(67 87 44 / 0.14)"
      },
      animation: {
        steam: "steam var(--motion-slow) ease-in-out infinite",
        shimmer: "shimmer 8s ease-in-out infinite",
        float: "float 7s ease-in-out infinite",
        reveal: "reveal var(--motion-normal) ease both"
      }
    }
  },
  plugins: []
};
