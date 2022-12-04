import { styled, TextField } from "@mui/material"
import { theme } from "../../theme"

const TextFieldUI = styled(TextField)({
    '& .MuiInputBase-input': {
        color: theme.palette.text.primary,
    },
    '& label': {
        color: theme.palette.text.primary,
    },
    '& label.Mui-focused': {
        color: theme.palette.text.primary,
    },
    '& .MuiInput-underline:after': {
        borderBottomColor: theme.palette.text.primary,
    },
    '& .MuiOutlinedInput-root': {
        '& fieldset': {
            borderColor: theme.palette.secondary.main
        },
        '&:hover fieldset': {
            borderColor: theme.palette.text.primary,
        },
        '&.Mui-focused fieldset': {
            borderColor: theme.palette.text.primary,
        },
    },
    '& .MuiList-root':{
        backgroundColor: "red"
    }
})

export default TextFieldUI