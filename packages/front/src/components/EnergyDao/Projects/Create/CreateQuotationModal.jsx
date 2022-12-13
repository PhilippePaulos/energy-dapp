import FileUploadIcon from '@mui/icons-material/FileUpload';
import { Box, FormControl, Typography } from "@mui/material";
import { useState } from "react";
import { useSigner } from 'wagmi';
import { uploadIpfsFile } from '../../../../common/helpers/eth';
import { useProfile } from "../../../../contexts/DaoContext";
import ButtonUI from "../../../ui/button";
import CenteredModal from "../../../ui/CenteredModal";
import CircularIndeterminate from "../../../ui/CircularIndeterminate";
import TextFieldUI from "../../../ui/text-field";

function CreateQuotationModal(props) {
    const { open, setOpen, project } = props
    const [isLoading, setIsLoading] = useState(false)
    const { state: { contracts: { EnergyDao } } } = useProfile()
    const { data: signer } = useSigner()

    const [values, setValues] = useState({
        description: "",
        devis: "",
        devisHash: "",
        price: "",
        nbCee: ""
    })

    const handleChange = (event) => {
        setValues({ ...values, [event.target.name]: event.target.value });
    };

    const handleUploadFile = (event) => {
        setValues({ ...values, [event.target.name]: event.target.files[0] })

    }

    const onSubmit = async () => {
        if (values.description !== "" && values.devis !== "" && values.price !== "" && values.nbCee !== "") {
            setIsLoading(true)
            // upload files to IPFS
            const hash = await uploadIpfsFile(values.devis)
            await EnergyDao.connect(signer).proposeQuotation(project.id, values.description, hash, values.price, values.nbCee)
            setIsLoading(false)
            setOpen(false)
        }
    }

    return (
        <>
            <CenteredModal
                open={open}
                onClose={() => setOpen(false)}>
                <Box className="bg-gray-900" p={2} borderRadius={2}>
                    <FormControl sx={{ gap: "5px" }}>
                        <TextFieldUI id="quotation-description" label="Description" name="description" value={values.description} onChange={handleChange} />
                        <TextFieldUI id="quotation-price" label="Prix (€)" name="price" value={values.price} onChange={handleChange} />
                        <TextFieldUI id="quotation-nbCee" label="Estimation CEE émis" name="nbCee" value={values.nbCee} onChange={handleChange} />
                        <Box sx={{ display: "flex", gap: "5px", alignItems: "center", marginBottom: "10px" }}>
                            <ButtonUI variant="contained" component="label" htmlFor="devis-upload">
                                devis<FileUploadIcon />
                            </ButtonUI>
                            {values.devis && <><Typography>{values.devis.name}</Typography></>}
                            <input hidden name="devis" accept="*" type="file" id="devis-upload" onChange={(e) => handleUploadFile(e)} />
                        </Box>
                        <ButtonUI variant="contained" component="label" onClick={() => onSubmit()}>
                            Soumettre
                        </ButtonUI>
                    </FormControl>
                    <CircularIndeterminate loading={isLoading} />
                </Box>
            </CenteredModal>
        </>
    )
}

export default CreateQuotationModal;