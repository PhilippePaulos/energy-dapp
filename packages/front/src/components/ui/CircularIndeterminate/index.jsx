import { Box } from "@mui/material";
import CircularProgress from "@mui/material/CircularProgress";

function CircularIndeterminate({ loading }) {
  console.log("coucou");
  console.log(loading);
  return (
    <>
      {
        loading ?
          <Box>
            <CircularProgress
              sx={{
                color: "white",
                position: "fixed",
                left: "50%",
                top: "30%",
                zIndex: "1300",
              }} />
          </Box>
          : null
      }
    </>
  );
}

export default CircularIndeterminate;