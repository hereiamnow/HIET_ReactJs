
// The 'themes' object defines available UI themes for the app.
// Each theme contains keys for background, card, text, primary color, border, input, and button styles.
// Usage: Pass the selected theme object to components for consistent styling.
export const themes = {
    "Humidor Hub": {
        name: "Humidor Hub",
        bg: "bg-gray-900",
        card: "bg-gray-800/50",
        text: "text-white",
        subtleText: "text-gray-400",
        primary: "text-amber-400",
        primaryBg: "bg-amber-500",
        hoverPrimaryBg: "hover:bg-amber-600",
        borderColor: "border-gray-700",
        inputBg: "bg-gray-800",
        ring: "focus:ring-amber-500",
        button: "bg-gray-700 hover:bg-gray-600",
        icon: "",
        drawerBg:"bg-amber-500/40",
        drawerBorderColor:"border-gray-700",
        mapHighlightedCountry: "#fbbf24", // amber-300, matches accent
        mapCigarCountry: "#fde68a",       // amber-200, lighter accent
        mapOtherCountry: "#22223b",       // dark blue-gray, fits dark theme
        mapBorder: "#d1d5db",             // gray-300, visible on dark
        mapHover: "#f59e0b",              // amber-400, strong accent
    },
    "Midnight Blue": {
        name: "Midnight Blue",
        bg: "bg-slate-900",
        card: "bg-slate-800/50",
        text: "text-white",
        subtleText: "text-slate-400",
        primary: "text-sky-400",
        primaryBg: "bg-sky-500",
        hoverPrimaryBg: "hover:bg-sky-600",
        borderColor: "border-slate-700",
        inputBg: "bg-slate-800",
        ring: "focus:ring-sky-500",
        button: "bg-slate-700 hover:bg-slate-600",
        icon: "",
        drawerBg:"bg-gray-800/50",
        drawerBorderColor:"border-gray-700",
        mapHighlightedCountry: "#38bdf8", // sky-400, matches theme accent
        mapCigarCountry: "#7dd3fc",       // sky-300, lighter accent
        mapOtherCountry: "#1e293b",       // slate-800, fits dark blue theme
        mapBorder: "#64748b",             // slate-400, visible on dark
        mapHover: "#0ea5e9",              // sky-600, strong accent
    },
    "Vintage Leather": {
        name: "Vintage Leather",
        bg: "bg-stone-900",
        card: "bg-stone-800/50",
        text: "text-white",
        subtleText: "text-stone-400",
        primary: "text-orange-400",
        primaryBg: "bg-orange-500",
        hoverPrimaryBg: "hover:bg-orange-600",
        borderColor: "border-stone-700",
        inputBg: "bg-stone-800",
        ring: "focus:ring-orange-500",
        button: "bg-stone-700 hover:bg-stone-600",
        icon: "",
        drawerBg:"bg-gray-800/50",
        drawerBorderColor:"border-gray-700",
        mapHighlightedCountry: "#fbbf24", // amber-300, matches accent
        mapCigarCountry: "#fed7aa",       // orange-200, warm lighter accent
        mapOtherCountry: "#3b2f23",       // stone-900, fits leather theme
        mapBorder: "#a78b6c",             // stone-400, visible on dark
        mapHover: "#ea580c",              // orange-600, strong accent
    },
    "Classic Light": {
        name: "Classic Light",
        bg: "bg-gray-50",
        card: "bg-white/80",
        text: "text-gray-900",
        subtleText: "text-gray-600",
        primary: "text-amber-700",
        primaryBg: "bg-amber-600",
        hoverPrimaryBg: "hover:bg-amber-700",
        borderColor: "border-gray-300",
        inputBg: "bg-white",
        ring: "focus:ring-amber-500",
        button: "bg-gray-200 hover:bg-gray-300",
        icon: "",
        drawerBg:"bg-gray-800/50",
        drawerBorderColor:"border-gray-700",
        mapHighlightedCountry: "#f59e0b", // amber-400, matches accent
        mapCigarCountry: "#fde68a",       // amber-200, lighter accent
        mapOtherCountry: "#f3f4f6",       // gray-100, fits light theme
        mapBorder: "#d1d5db",             // gray-300, visible on light
        mapHover: "#d97706",              // amber-700, strong accent
    }
};
