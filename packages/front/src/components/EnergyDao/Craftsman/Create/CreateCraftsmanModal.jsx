import InsertDriveFileOutlinedIcon from '@mui/icons-material/InsertDriveFileOutlined';
import UploadFileOutlinedIcon from '@mui/icons-material/UploadFileOutlined';
import { Box, FormControl, Typography } from "@mui/material";
import { useState } from "react";
import { useConnect, useSigner } from 'wagmi';
import { formatIpfsLink, isAllDefined, uploadIpfsFile } from "../../../../common/helpers/eth";
import { useProfile } from '../../../../contexts/DaoContext';
import ButtonUI from "../../../ui/button";
import CenteredModal from "../../../ui/CenteredModal";
import TextFieldUI from "../../../ui/text-field";
import CircularIndeterminate from "../../../ui/CircularIndeterminate"

function CreateCraftsmanModal(props) {

    const { open, setOpen, fetchCraftsman } = props

    const { data: signer } = useSigner()

    const [values, setValues] = useState({
        name: "",
        certification: "",
        address: ""
    })

    const { state: { contracts: { EnergyDao } } } = useProfile()

    const [isLoading, setIsLoading] = useState(false)

    const handleChange = (e) => {
        setValues({ ...values, [e.target.name]: e.target.value })
    }

    const handleselectedFile = (e) => {
        setValues({ ...values, [e.target.name]: e.target.files[0] })
    }

    const onSubmit = async () => {
        if (isAllDefined(values)) {
            try {
                setIsLoading(true)
                const hash = await uploadIpfsFile(values.certification)
                await EnergyDao.connect(signer).registerCraftsman(values.name, values.address, formatIpfsLink(hash))
                fetchCraftsman()
                setIsLoading(false)
                setOpen(false)
            }
            catch (error) {
                console.log(error)
            }
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
                <CircularIndeterminate loading={isLoading} />

            </Box>

        </CenteredModal>
    )
}

export default CreateCraftsmanModal