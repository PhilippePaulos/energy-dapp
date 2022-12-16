import InsertDriveFileOutlinedIcon from '@mui/icons-material/InsertDriveFileOutlined'
import UploadFileOutlinedIcon from '@mui/icons-material/UploadFileOutlined'
import { Box, FormControl, FormHelperText, Typography } from "@mui/material"
import { useState } from "react"
import { useSigner } from 'wagmi'
import { formatIpfsLink, isAllDefined, uploadIpfsFile } from "../../../../common/helpers/eth"
import { useProfile } from '../../../../contexts/DaoContext'
import ButtonUI from "../../../ui/button"
import CenteredModal from "../../../ui/CenteredModal"
import CircularIndeterminate from "../../../ui/CircularIndeterminate"
import TextFieldUI from "../../../ui/text-field"

function CreateCraftsmanModal(props) {

    const { open, setOpen, fetchCraftsman } = props

    const { data: signer } = useSigner()

    const [state, setState] = useState({
        name: "",
        certification: "",
        address: "",
    })

    const [error, setError] = useState({
        isError: false,
        errorMsg: ""
    })

    const { state: { contracts: { EnergyDao } } } = useProfile()

    const [isLoading, setIsLoading] = useState(false)

    const handleChange = (e) => {
        setState({ ...state, [e.target.name]: e.target.value })
    }

    const handleselectedFile = (e) => {
        setState({ ...state, [e.target.name]: e.target.files[0] })
    }

    const onSubmit = async () => {
        if (isAllDefined(state)) {
            setError({ isError: false })

            try {
                setIsLoading(true)

                const hash = await uploadIpfsFile(state.certification)

                await EnergyDao.connect(signer).registerCraftsman(state.name, state.address, formatIpfsLink(hash))
                fetchCraftsman()
                setIsLoading(false)
                setOpen(false)
            }
            catch (error) {
                console.log(error)
            }
        } else {
            setError({ isError: true, errorMsg: "Veuillez renseigner tous les champs" })
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
                    <TextFieldUI sx={{ width: "500px" }} id="craftsman-description" label="Addresse" name="address"
                        multiline rows={2} onChange={(e) => handleChange(e)} />
                    <Box sx={{ display: "flex", gap: "5px", alignItems: "center" }}>
                        <ButtonUI variant="contained" component="label" htmlFor="file-upload">
                            <UploadFileOutlinedIcon />
                            certification
                        </ButtonUI>
                        {state.certification && <><InsertDriveFileOutlinedIcon /><Typography>{state.certification.name}</Typography></>}
                        <input hidden name="certification" accept="*" type="file" id="file-upload" onChange={handleselectedFile} />
                    </Box>
                    <ButtonUI variant="contained" component="label" onClick={onSubmit}>
                        Candidater
                    </ButtonUI>
                    {error.isError && <FormHelperText error={true} disabled={true}> {error.errorMsg} </FormHelperText>}
                </FormControl>
                <CircularIndeterminate loading={isLoading} />
            </Box>

        </CenteredModal>
    )
}

export default CreateCraftsmanModal