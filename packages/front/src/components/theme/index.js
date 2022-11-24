import { createTheme } from "@mui/material";

export const theme = createTheme({
    palette: {
        background: {
            default: "#09162E"
        },
        text: {
            primary: "#ffffff",
        },
        primary: {
            main: "#211f24",
        },
        secondary: {
            main: "#929fe4",
        },
        action: {
            main: "#0b0d22"
        }
    },
    typography: {
        fontFamily: "Inter, Arial, sans-serif",
    }
})