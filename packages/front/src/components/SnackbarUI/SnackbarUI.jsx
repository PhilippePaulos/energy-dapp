import { Alert, Snackbar } from "@mui/material"

function SnackbarUI({msg, open, setOpen}) {

    return (
        <Snackbar open={open} autoHideDuration={6000} onClose={() => setOpen(false)} anchorOrigin={{ vertical: 'top', horizontal: 'left' }}>
            <Alert onClose={() => setOpen(false)} severity="success" sx={{ width: '100%' }}>
                {msg}
            </Alert>
        </Snackbar>
    )
}

export default SnackbarUI