import { AppBar, Button, Grid, Link, Toolbar, Typography } from "@mui/material"
import { Box } from "@mui/system"
import { theme } from "../theme"

function Navbar(){
    return(
        <AppBar position="sticky" style={{ borderBottom: "none", backgroundColor: theme.palette.background.default}}>
            <Toolbar>
                    <Grid container
                        justifyContent="space-between"
                        sx={{ mx: "auto", maxWidth: "1250px", display: "flex"}}
                    >
                        <Box>
                            <Typography variant="h4">Energy</Typography>
                        </Box>
                        {/* <Box sx={{display: "flex", gap:"10px"}}> */}

                        <Box display="flex" gap={2} alignItems="center">
                            <Link href="#" color="inherit" underline="none">Whitepaper</Link>
                            <Button variant="contained">Connect</Button>
                        </Box>
                    </Grid>

                </Toolbar>
        </AppBar>
    )
}

export default Navbar