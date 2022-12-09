import InsertDriveFileOutlinedIcon from '@mui/icons-material/InsertDriveFileOutlined';
import UploadFileOutlinedIcon from '@mui/icons-material/UploadFileOutlined';
import { Box, FormControl, Typography } from "@mui/material";
import { useState } from "react";
import { isAllDefined, uploadIpfsFile } from "../../../../common/helpers/eth";
import ButtonUI from "../../../ui/button";
import CenteredModal from "../../../ui/CenteredModal";
import TextFieldUI from "../../../ui/text-field";

function CreateCraftsmanModal(props) {

    const { open, setOpen } = props

    const [values, setValues] = useState({
        name: "",
        certification: "",
        address: ""
    })

    const handleChange = (e) => {
        setValues({ ...values, [e.target.name]: e.target.value })
    }

    const handleselectedFile = (e) => {
        // setValues({ ...values, [event.target.name]: event.target.value });
        setValues({ ...values, [e.target.name]: e.target.files[0] })
    }

    const onSubmit = async () => {
        console.log(values);
        if (isAllDefined(values)) {
            console.log("go");
            try {
                const hash = await uploadIpfsFile(values.certification)
                console.log(hash);
            }
            catch (error) {
                console.log("Error sending File to IPFS: ", error)
            }
        }
        else {
            console.log("not");
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
                    <TextFieldUI id="craftsman-name" label="Name" name="name" onChange={(e) => handleChange(e)} />
                    <TextFieldUI sx={{ width: "500px" }} id="craftsman-description" label="Addresse" name="address" multiline rows={2} onChange={(e) => handleChange(e)} />
                    <Box sx={{ display: "flex", gap: "5px", alignItems: "center" }}>
                        <ButtonUI variant="contained" component="label" htmlFor="file-upload">
                            <UploadFileOutlinedIcon />
                            certification
                        </ButtonUI>
                        {values.certification && <><InsertDriveFileOutlinedIcon /><Typography>{values.certification.name}</Typography></>}
                        <input hidden name="certification" accept="*" type="file" id="file-upload" onChange={handleselectedFile} />
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