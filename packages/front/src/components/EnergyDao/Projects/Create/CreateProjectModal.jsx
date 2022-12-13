import { Box, FormControl, MenuItem, Typography } from "@mui/material";
import { useState } from "react";
import { useSigner } from 'wagmi';
import { uploadIpfsFile } from '../../../../common/helpers/eth';
import { useProfile } from "../../../../contexts/DaoContext";
import ButtonUI from "../../../ui/button";
import CenteredModal from "../../../ui/CenteredModal";
import CircularIndeterminate from "../../../ui/CircularIndeterminate";
import TextFieldUI from "../../../ui/text-field";


function CreateProjectModal(props) {
    const { open, setOpen } = props
    const [isLoading, setIsLoading] = useState(false)
    const { state: { contracts: { EnergyDao } } } = useProfile()
    const { data: signer } = useSigner() 

    const [values, setValues] = useState({
        name: "",
        description: "",
        department: "",
        sector: "",
        plan: "",
        diagnostic: "",
        pictures: "",
        planHash: "",
        diagnosticHash: "",
        picturesHash: ""
    })

    const handleChange = (event) => {
        setValues({ ...values, [event.target.name]: event.target.value });
    };

    const handleUploadFile = (event) => {
        setValues({ ...values, [event.target.name]: event.target.files[0] })

    }


    const onSubmit = async () => {
        if (values.name !== "" && values.sector !== "" && values.department !== "" && values.description !== "" &&
            values.diagnostic !== "" && values.plan !== "" && values.pictures !== "") {
            setIsLoading(true)
            // upload files to IPFS
            const hashDiagnostic = await uploadIpfsFile(values.diagnostic)

            const hashPlan = await uploadIpfsFile(values.plan)

            const hashPictures = await uploadIpfsFile(values.pictures)
            
            await EnergyDao.connect(signer).addProject(values.name, values.description, values.department, values.sector, hashPictures, hashDiagnostic, hashPlan)
            setIsLoading(false)
        }
    }

    return (
        <>
            <CenteredModal
                open={open}
                onClose={e => setOpen(false)}>
                <Box className="bg-gray-900" p={2} borderRadius={2}>
                    <FormControl sx={{ gap: "5px" }}>
                        <Box width={"500px"} sx={{ display: "flex", gap: "5px" }}>
                            <TextFieldUI id="project-name" name="name" label="Nom" className="flex1" value={values.name} onChange={handleChange} />
                        </Box>
                        <TextFieldUI
                            select
                            id="project-secteur"
                            name="sector"
                            label="Secteur"
                            value={values.sector}
                            onChange={handleChange}
                        >
                            <MenuItem value={0}>Industrie</MenuItem>
                            <MenuItem value={1}>Résidentiel</MenuItem>
                            <MenuItem value={2}>Tertiaire</MenuItem>
                        </TextFieldUI>
                        <TextFieldUI id="project-departement" label="Departement" name="department" value={values.department} onChange={handleChange} />
                        <TextFieldUI id="project-description" label="Description" multiline rows={4} name="description" value={values.description} onChange={handleChange} />

                        <Box sx={{ display: "flex", gap: "5px", alignItems: "center" }}>
                            <ButtonUI variant="contained" component="label" htmlFor="file-upload">
                                Photos
                            </ButtonUI>
                            {values.pictures && <Typography >{values.pictures.name}</Typography>}
                            <input hidden name="pictures" onChange={(e) => handleUploadFile(e)} accept="*" multiple type="file" id="file-upload" />
                        </Box>

                        <Box sx={{ display: "flex", gap: "5px", alignItems: "center" }}>
                            <ButtonUI variant="contained" component="label" htmlFor="diagnostic-upload">
                                DPE
                            </ButtonUI>
                            {values.diagnostic && <><Typography>{values.diagnostic.name}</Typography></>}
                            <input hidden name="diagnostic" accept="*" type="file" id="diagnostic-upload" onChange={(e) => handleUploadFile(e)} />
                        </Box>

                        <Box sx={{ display: "flex", gap: "5px", alignItems: "center" }}>
                            <ButtonUI variant="contained" component="label" htmlFor="plan-upload">
                                Plan
                            </ButtonUI>
                            {values.plan && <><Typography>{values.plan.name}</Typography></>}
                            <input hidden name="plan" accept="*" type="file" id="plan-upload" onChange={(e) => handleUploadFile(e)} />
                        </Box>
                        <ButtonUI variant="contained" component="label" onClick={() => onSubmit()}>
                            Create project
                        </ButtonUI>
                    </FormControl>
                    <CircularIndeterminate loading={isLoading} />
                </Box>
            </CenteredModal>
        </>

    )
}

export default CreateProjectModal;