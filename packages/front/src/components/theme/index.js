import { createTheme } from "@mui/material";

export const theme = createTheme({
    palette: {
        background: {
            default: "rgb(17 24 39)"
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
            main: "rgb(59 130 246/1)"
        },
        error: {
            main: "#ef4444"
        }
    },
    typography: {
        fontFamily: "Inter, Arial, sans-serif",
        p: {
            fontSize: "13px"
        }
    }
})