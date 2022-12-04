import InsertDriveFileOutlinedIcon from '@mui/icons-material/InsertDriveFileOutlined';
import UploadFileOutlinedIcon from '@mui/icons-material/UploadFileOutlined';
import { Box, FormControl, Typography } from "@mui/material";
import { useState } from "react";
import { uploadIpfsFile } from "../../../helpers/eth";
import ButtonUI from "../../ui/button";
import CenteredModal from "../../ui/CenteredModal";
import TextFieldUI from "../../ui/text-field";

function CreateCraftsmanModal(props) {

    const { open, setOpen } = props
    const [selectedFile, setSelectedFile] = useState("")

    const handleselectedFile = (e) => {
        setSelectedFile(e.target.files[0])
    }

    const onSubmit = async () => {
        console.log("submit");
        try {
            const hash = await uploadIpfsFile(selectedFile)
            console.log(hash);
        }
        catch (error) {
            console.log("Error sending File to IPFS: ")
            console.log(error)
        }
    }

    return (
        <CenteredModal
            open={open}
            onClose={() => setOpen(false)}>
            <Box
                className="bg-gray-900"
                p={2}
                borderRadius={2}>
                <FormControl sx={{ gap: "5px" }} onSubmit={onSubmit}>
                    <TextFieldUI id="craftsman-name" label="Name" />
                    <TextFieldUI sx={{ width: "700px" }} id="craftsman-description" label="Description" multiline rows={4} />
                    <Box sx={{ display: "flex", gap: "5px", alignItems: "center" }}>
                        <ButtonUI variant="contained" component="label" htmlFor="file-upload">
                            <UploadFileOutlinedIcon />
                            certification
                        </ButtonUI>
                        {selectedFile && <><InsertDriveFileOutlinedIcon /><Typography>{selectedFile.name}</Typography></>}
                        <input hidden accept="*" type="file" id="file-upload" onChange={handleselectedFile} />
                    </Box>
                    <ButtonUI variant="contained" component="label" onClick={onSubmit}>
                        Candidater
                    </ButtonUI>
                </FormControl>
            </Box>
        </CenteredModal>
    )
}

export default CreateCraftsmanModal