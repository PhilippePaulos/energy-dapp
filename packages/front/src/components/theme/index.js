import { createTheme } from "@mui/material";

export const theme = createTheme({
    palette: {
        background: {
            default: "rgb(17 24 39)",
            grid: "rgb(14, 28, 55)",
            pop:  "rgb(32, 46, 73)"
        },
        text: {
            primary: "#ffffff",
            // secondary: "#f3f4f6"
        },
        primary: {
            main: "#211f24",
        },
        secondary: {
            main: "#6b7280",
        },
        action: {
            main: "#ffffff",
            secondary: "rgb(17 24 39)"
        },
        error: {
            main: "#ef4444"
        },
        border: {
            main: "#6f6f6f"
        },
        hover: {
            main: "#6b7280"
        }
    },
    typography: {
        fontFamily: "Inter, Arial, sans-serif",
        p: {
            fontSize: "13px"
        }
    }
})