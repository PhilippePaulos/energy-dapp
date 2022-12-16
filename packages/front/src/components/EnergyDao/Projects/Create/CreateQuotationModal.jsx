import FileUploadIcon from '@mui/icons-material/FileUpload'
import { Box, FormControl, FormHelperText, Typography } from "@mui/material"
import { useState } from "react"
import { useSigner } from 'wagmi'
import { formatIpfsLink, isAllDefined, uploadIpfsFile } from '../../../../common/helpers/eth'
import { useProfile } from "../../../../contexts/DaoContext"
import ButtonUI from "../../../ui/button"
import CenteredModal from "../../../ui/CenteredModal"
import CircularIndeterminate from "../../../ui/CircularIndeterminate"
import TextFieldUI from "../../../ui/text-field"

function CreateQuotationModal(props) {
    const { open, setOpen, project } = props
    const [isLoading, setIsLoading] = useState(false)
    const { state: { contracts: { EnergyDao, EEDToken }, allowance, fees } } = useProfile()
    const { data: signer } = useSigner()

    const [state, setState] = useState({
        description: "",
        devis: "",
        price: "",
        nbCee: ""
    })

    const [error, setError] = useState({
        isError: false,
        errorMsg: ""
    })

    const handleChange = (event) => {
        setState({ ...state, [event.target.name]: event.target.value })
    }

    const handleUploadFile = (event) => {
        setState({ ...state, [event.target.name]: event.target.files[0] })

    }

    const onSubmit = async () => {
        if (isAllDefined(state)) {
            setError((error) => ({ ...error, isError: false }))
            setIsLoading(true)

            if (allowance < fees) {
                await EEDToken.connect(signer).approve(EnergyDao.address, fees)
            }

            // upload files to IPFS
            const hash = await uploadIpfsFile(state.devis)

            await EnergyDao.connect(signer).proposeQuotation(project.id, state.description,
                formatIpfsLink(hash), state.price, state.nbCee)
            setIsLoading(false)
            setOpen(false)
        } else {
            setError({ isError: true, errorMsg: "Veuillez renseigner tous les champs" })
        }
    }

    return (
        <>
            <CenteredModal
                open={open}
                onClose={() => setOpen(false)}>
                <Box className="bg-gray-900" p={2} borderRadius={2}>
                    <FormControl sx={{ gap: "5px" }}>
                        <TextFieldUI id="quotation-description" label="Description" name="description" value={state.description} onChange={handleChange} />
                        <TextFieldUI id="quotation-price" label="Prix (€)" name="price" value={state.price} onChange={handleChange} />
                        <TextFieldUI id="quotation-nbCee" label="Estimation CEE émis" name="nbCee" value={state.nbCee} onChange={handleChange} />
                        <Box sx={{ display: "flex", gap: "5px", alignItems: "center", marginBottom: "10px" }}>
                            <ButtonUI variant="contained" component="label" htmlFor="devis-upload">
                                devis<FileUploadIcon />
                            </ButtonUI>
                            {state.devis && <><Typography>{state.devis.name}</Typography></>}
                            <input hidden name="devis" accept="*" type="file" id="devis-upload" onChange={(e) => handleUploadFile(e)} />
                        </Box>
                        <ButtonUI variant="contained" component="label" onClick={() => onSubmit()}>
                            Soumettre
                        </ButtonUI>
                        {error.isError && <FormHelperText error={true} disabled={true}> {error.errorMsg} </FormHelperText>}
                    </FormControl>
                    <CircularIndeterminate loading={isLoading} />
                </Box>
            </CenteredModal>
        </>
    )
}

export default CreateQuotationModal