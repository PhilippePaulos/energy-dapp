import InsertDriveFileOutlinedIcon from '@mui/icons-material/InsertDriveFileOutlined';
import { Box, FormControl, MenuItem, Typography } from "@mui/material";
import { useState } from "react";
import { uploadIpfsFile } from '../../../helpers/eth';
import ButtonUI from "../../ui/button";
import CenteredModal from "../../ui/CenteredModal";
import TextFieldUI from "../../ui/text-field";

function CreateProjectModal(props) {
    const { open, setOpen } = props

    const [pictures, setPictures] = useState([])
    const [planFile, setPlanFile] = useState("")
    const [diagnosticFile, setDiagnosticFile] = useState("")
    const [secteur, setSecteur] = useState(0)

    const handleChangeSecteur = (event) => {
        setSecteur(event.target.value);
    };

    const handleUploadFiles = files => {
        const uploaded = [...pictures]
        files.some((file) => {
            if (uploaded.findIndex((f) => f.name === file.name) === -1) {
                uploaded.push(file)
            }
        })
        setPictures(uploaded)
    }

    const handleFileEvent = (e, type) => {
        if (type == "diagnostic") {
            setDiagnosticFile(e.target.files[0])
        } else if (type == "plan") {
            setPlanFile(e.target.files[0])
        }
        else {
            handleUploadFiles(Array.prototype.slice.call(e.target.files))
        }

    }

    const onSubmit = async () => {
        const diagnosticHash = await uploadIpfsFile(diagnosticFile)
        const planHash = uploadIpfsFile(planFile)
        const promises = pictures.map((picture) => uploadIpfsFile(picture))
        const picturesHashes = await Promise.all(promises)
        //TODO call contract
    }

    return (
        <CenteredModal
            open={open}
            onClose={e => setOpen(false)}>
            <Box className="bg-gray-900" p={2} borderRadius={2}>
                <FormControl sx={{ gap: "5px" }}>
                    <Box sx={{ display: "flex", gap: "5px" }}>
                        <TextFieldUI id="project-name" label="Nom" className="flex1" />
                        <TextFieldUI id="project-budget" label="Budget (€)" className="flex1" />
                    </Box>
                    <TextFieldUI
                        select
                        id="project-secteur"
                        label="Secteur"
                        value={secteur}
                        onChange={handleChangeSecteur}
                    >
                        <MenuItem value={0}>Industrie</MenuItem>
                        <MenuItem value={1}>Résidentiel</MenuItem>
                        <MenuItem value={2}>Tertiaire</MenuItem>
                    </TextFieldUI>
                    <TextFieldUI id="project-departement" label="Departement" />
                    <TextFieldUI id="project-description" label="Description" multiline rows={4} />

                    <Box sx={{ display: "flex", gap: "5px", alignItems: "center" }}>
                        <ButtonUI variant="contained" component="label" htmlFor="file-upload">
                            pictures
                        </ButtonUI>
                        {pictures.map(file => (
                            <Typography key={file.name}>
                                {file.name}
                            </Typography>
                        ))}
                        <input hidden onChange={(e) => handleFileEvent(e, "pictures")} accept="*" multiple type="file" id="file-upload" />
                    </Box>

                    <Box sx={{ display: "flex", gap: "5px", alignItems: "center" }}>
                        <ButtonUI variant="contained" component="label" htmlFor="diagnostic-upload">
                            Diagnostic
                        </ButtonUI>
                        {diagnosticFile && <><InsertDriveFileOutlinedIcon /><Typography>{diagnosticFile.name}</Typography></>}
                        <input hidden accept="*" type="file" id="diagnostic-upload" onChange={(e) => handleFileEvent(e, "diagnostic")} />
                    </Box>

                    <Box sx={{ display: "flex", gap: "5px", alignItems: "center" }}>
                        <ButtonUI variant="contained" component="label" htmlFor="plan-upload">
                            certification
                        </ButtonUI>
                        {planFile && <><InsertDriveFileOutlinedIcon /><Typography>{planFile.name}</Typography></>}
                        <input hidden accept="*" type="file" id="plan-upload" onChange={(e) => handleFileEvent(e, "plan")} />
                    </Box>

                    <ButtonUI variant="contained" component="label" onClick={onSubmit}>
                        Create project
                    </ButtonUI>
                    
                </FormControl>
            </Box>


        </CenteredModal>
    )
}

export default CreateProjectModal;