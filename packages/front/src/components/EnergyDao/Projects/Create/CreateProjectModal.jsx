import { Box, FormControl, MenuItem, Typography } from "@mui/material";
import { useState } from "react";
import { useSigner } from 'wagmi';
import { formatIpfsLink, getEthValue, isAllDefined, uploadIpfsFile } from '../../../../common/helpers/eth';
import { useProfile } from "../../../../contexts/DaoContext";
import ButtonUI from "../../../ui/button";
import CenteredModal from "../../../ui/CenteredModal";
import CircularIndeterminate from "../../../ui/CircularIndeterminate";
import TextFieldUI from "../../../ui/text-field";
import { FormHelperText } from '@mui/material';

function CreateProjectModal(props) {
    const { open, setOpen } = props
    const [isLoading, setIsLoading] = useState(false)
    const { state: { contracts: { EnergyDao, EEDToken }, lock, fees, balance, allowance } } = useProfile()
    const { data: signer } = useSigner()

    const [state, setState] = useState({
        name: "",
        description: "",
        department: "",
        sector: "",
        plan: "",
        diagnostic: "",
        pictures: ""
    })

    const [error, setError] = useState({
        isError: false,
        errorMsg: ""
    })

    const handleChange = (event) => {
        setState({ ...state, [event.target.name]: event.target.value });
    };

    const handleUploadFile = (event) => {
        setState({ ...state, [event.target.name]: event.target.files[0] })

    }

    const onSubmit = async () => {
        if (balance.lte(lock)) {
            setError((error) => (
                {
                    ...error,
                    isError: true,
                    errorMsg: `Vous n'avez pas assez de tokens. ${getEthValue(lock.add(fees))} EED sont nécessaires pour créer un projet.`
                }
            ))

        }
        else if (isAllDefined(state)) {

            setError((s) => ({ ...s, isError: false }))
            setIsLoading(true)

            if (allowance < fees) {
                await EEDToken.connect(signer).approve(EnergyDao.address, fees)
            }

            // upload files to IPFS
            const hashDiagnostic = await uploadIpfsFile(state.diagnostic).then((link) => formatIpfsLink(link))

            const hashPlan = await uploadIpfsFile(state.plan).then((link) => formatIpfsLink(link))

            const hashPictures = await uploadIpfsFile(state.pictures).then((link) => formatIpfsLink(link))

            await EnergyDao.connect(signer).addProject(state.name, state.description, state.department,
                state.sector, hashPictures, hashDiagnostic, hashPlan, { value: fees })

            setIsLoading(false)
        }
        else {
            setError((error) => ({...error, isError: true, errorMsg: "Veuillez renseigner tous les champs." }))
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
                            <TextFieldUI id="project-name" name="name" label="Nom" className="flex1" value={state.name} onChange={handleChange} />
                        </Box>
                        <TextFieldUI
                            select
                            id="project-secteur"
                            name="sector"
                            label="Secteur"
                            value={state.sector}
                            onChange={handleChange}
                        >
                            <MenuItem value={0}>Industrie</MenuItem>
                            <MenuItem value={1}>Résidentiel</MenuItem>
                            <MenuItem value={2}>Tertiaire</MenuItem>
                        </TextFieldUI>
                        <TextFieldUI id="project-departement" label="Departement" name="department" value={state.department} onChange={handleChange} />
                        <TextFieldUI id="project-description" label="Description" multiline rows={4} name="description" value={state.description} onChange={handleChange} />

                        <Box sx={{ display: "flex", gap: "5px", alignItems: "center" }}>
                            <ButtonUI variant="contained" component="label" htmlFor="file-upload">
                                Photos
                            </ButtonUI>
                            {state.pictures && <Typography >{state.pictures.name}</Typography>}
                            <input hidden name="pictures" onChange={(e) => handleUploadFile(e)} accept="*" multiple type="file" id="file-upload" />
                        </Box>

                        <Box sx={{ display: "flex", gap: "5px", alignItems: "center" }}>
                            <ButtonUI variant="contained" component="label" htmlFor="diagnostic-upload">
                                DPE
                            </ButtonUI>
                            {state.diagnostic && <><Typography>{state.diagnostic.name}</Typography></>}
                            <input hidden name="diagnostic" accept="*" type="file" id="diagnostic-upload" onChange={(e) => handleUploadFile(e)} />
                        </Box>

                        <Box sx={{ display: "flex", gap: "5px", alignItems: "center" }}>
                            <ButtonUI variant="contained" component="label" htmlFor="plan-upload">
                                Plan
                            </ButtonUI>
                            {state.plan && <><Typography>{state.plan.name}</Typography></>}
                            <input hidden name="plan" accept="*" type="file" id="plan-upload" onChange={(e) => handleUploadFile(e)} />
                        </Box>
                        <ButtonUI variant="contained" component="label" onClick={() => onSubmit()}>
                            Create project
                        </ButtonUI>
                        {error.isError && <FormHelperText error={true} disabled={true}> {error.errorMsg} </FormHelperText>}
                    </FormControl>
                    <CircularIndeterminate loading={isLoading} />
                </Box>
            </CenteredModal>
        </>

    )
}

export default CreateProjectModal;