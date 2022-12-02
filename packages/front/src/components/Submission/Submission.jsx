import { Box, Button, FormControl, FormHelperText, Input, InputLabel, styled, TextField } from "@mui/material";
import { theme } from "../theme";
import ButtonUI from "../ui/button";
import TextFieldUI from "../ui/text-field";

function Submission() {
    return (
        <Box>
            <FormControl sx={{gap:"5px"}}>
                <TextFieldUI id="project-name" label="Name" />
                <TextFieldUI id="project-budget" label="Budget ($)" />
                <TextFieldUI sx={{width:"700px"}} id="project-description" label="Description" multiline rows={4}/>
                <ButtonUI variant="contained" component="label">
                    Upload
                    <input hidden accept="*" multiple type="file" />
                </ButtonUI>
            </FormControl>
        </Box>

    )
}

export default Submission;