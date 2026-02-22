/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                primary: {
                    DEFAULT: "var(--color-primary)",
                    foreground: "var(--color-primary-foreground)",
                },
                secondary: {
                    DEFAULT: "var(--color-secondary)",
                    foreground: "var(--color-secondary-foreground)",
                },
                accent: {
                    DEFAULT: "var(--color-accent)",
                    foreground: "var(--color-accent-foreground)",
                },
                background: "var(--color-background)",
                foreground: "var(--color-foreground)",
                card: {
                    DEFAULT: "var(--color-card)",
                    foreground: "var(--color-card-foreground)",
                },
                popover: {
                    DEFAULT: "var(--color-popover)",
                    foreground: "var(--color-popover-foreground)",
                },
                muted: {
                    DEFAULT: "var(--color-muted)",
                    foreground: "var(--color-muted-foreground)",
                },
                border: "var(--color-border)",
                input: "var(--color-input)",
                ring: "var(--color-ring)",
                success: {
                    DEFAULT: "var(--color-success)",
                    foreground: "var(--color-success-foreground)",
                },
                warning: {
                    DEFAULT: "var(--color-warning)",
                    foreground: "var(--color-warning-foreground)",
                },
                error: {
                    DEFAULT: "var(--color-error)",
                    foreground: "var(--color-error-foreground)",
                },
                destructive: {
                    DEFAULT: "var(--color-destructive)",
                    foreground: "var(--color-destructive-foreground)",
                },
            },
            fontFamily: {
                heading: ['JetBrains Mono', 'monospace'],
                sans: ['Source Sans 3', 'sans-serif'],
                data: ['IBM Plex Mono', 'monospace'],
            },
            borderRadius: {
                lg: "var(--radius-lg)",
                md: "var(--radius-md)",
                sm: "var(--radius-sm)",
            },
        },
    },
    plugins: [],
}
