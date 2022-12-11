import { Box, FormControl, MenuItem, Typography } from "@mui/material";
import { useState } from "react";
import { useAccount, useContractWrite, useNetwork, usePrepareContractWrite, useWaitForTransaction } from 'wagmi';
import { getContractDescription, uploadIpfsFile } from '../../../../common/helpers/eth';
import ButtonUI from "../../../ui/button";
import CenteredModal from "../../../ui/CenteredModal";
import CircularIndeterminate from "../../../ui/CircularIndeterminate";
import TextFieldUI from "../../../ui/text-field";


function CreateProjectModal(props) {
    const { open, setOpen } = props
    const { address } = useAccount()
    const [prepare, setPrepare] = useState(false)
    const [loadingIpfs, setLoadingIpfs] = useState(false)

    const [values, setValues] = useState({
        name: "",
        description: "",
        department: "",
        sector: "",
        plan: "",
        diagnostic: "",
        pictures: [],
        planHash: "",
        diagnosticHash: "",
        picturesHash: [],
    })

    const { chain } = useNetwork()
    const { abi, addr } = getContractDescription('EnergyDao', chain.id)

    const { config } = usePrepareContractWrite({
        address: addr,
        abi: abi,
        functionName: 'addProject',
        args: [values.name, values.description, values.department, values.sector,
        values.picturesHash, values.diagnosticHash, values.planHash],
        overrides: {
            from: address,
            // value: ethers.utils.parseEther('5'),
        },
        enabled: prepare,
    })

    const { data, write } = useContractWrite(config)
    const { isLoading } = useWaitForTransaction({
        hash: data?.hash,
      })

    const handleChange = (event) => {
        setValues({ ...values, [event.target.name]: event.target.value });
        console.log(values);
    };

    const handleUploadFile = (event) => {
        setValues({ ...values, [event.target.name]: event.target.files[0] })

    }

    const handleUploadFiles = (event) => {
        const uploaded = values.pictures
        const files = Array.prototype.slice.call(event.target.files)
        files.forEach((file) => {
            if (uploaded.findIndex((f) => f.name === file.name) === -1) {
                uploaded.push(file)
            }
        })
        setValues({ ...values, [event.target.name]: uploaded })
    }

    const onSubmit = async () => {
        console.log("submit");
        if (values.name !== "" && values.sector !== "" && values.department !== "" && values.description !== "" &&
            values.diagnostic !== "" && values.plan !== "" && values.pictures.length > 0) {
            // upload files to IPFS
            setPrepare(true)
            setLoadingIpfs(true)

            let hash = await uploadIpfsFile(values.diagnostic)
            setValues({ ...values, diagnosticHash: hash })

            hash = await uploadIpfsFile(values.plan)
            setValues({ ...values, planHash: hash })

            const promises = values.pictures.map((picture) => uploadIpfsFile(picture))
            setValues({ ...values, picturesHash: await Promise.all(promises) })
            setLoadingIpfs(false)
            write?.()
        }
    }

    return (
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
                        {values.pictures.map(file => (
                            <Typography key={file.name}>
                                {file.name}
                            </Typography>
                        ))}
                        <input hidden name="pictures" onChange={(e) => handleUploadFiles(e)} accept="*" multiple type="file" id="file-upload" />
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
                    <ButtonUI variant="contained" component="label" onClick={onSubmit}>
                        Create project
                    </ButtonUI>
                </FormControl>
                <CircularIndeterminate loading={loadingIpfs || isLoading} />
            </Box>
        </CenteredModal>

    )
}

export default CreateProjectModal;