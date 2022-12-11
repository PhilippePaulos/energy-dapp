import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf'
import { Box, Grid, Table, TableCell, TableHead, TableRow, Typography } from "@mui/material"
import { BigNumber } from "ethers"
import { useEffect } from 'react'
import { ProposalProjectStateCodes, StatusCodes } from "../../../../common/enums"
import { openIpfsLink } from "../../../../common/helpers/eth"
import { useProfile } from '../../../../contexts/DaoContext'
import CenteredModal from "../../../ui/CenteredModal"
import IconHover from '../../../ui/IconHover'
import PdfPicture from "../../../ui/PdfPicture"
import RoundedGrid from "../../../ui/RoundedGrid"
import TableBodyHover from "../../../ui/TableBodyHover"
import TableContainerUI from "../../../ui/TableContainer"


function ProjectDetailsModal(props) {

    const { project, quotations, open, setOpen } = props
    const { profile: { contracts: { EnergyDao } } } = useProfile()


    useEffect(() => {
        
    }, [])

    return (
        <CenteredModal
            open={open}
            onClose={() => setOpen(false)}>
            <Box
                className="bg-gray-900"
                p={2}
                borderRadius={2}>
                <Grid container mb={5} >
                    <RoundedGrid sx={{width: "inherit"}} className="bg-gray-900">
                        <Box className="boxHeader">
                            <Typography variant="h6">Informations</Typography>
                        </Box>
                        <Box className="content">
                            <Box className="line">
                                <Typography variant="b">Nom</Typography>
                                <Typography>{project.name}</Typography>
                            </Box>
                            <Box className="line">
                                <Typography variant="b">Bénéficiaire</Typography>
                                <Typography>{project.beneficiaryAddr}</Typography>
                            </Box>
                            <Box className="line">
                                <Typography variant="b">Description</Typography>
                                <Typography>{project.description}</Typography>
                            </Box>
                            <Box className="line">
                                <Typography variant="b">Department</Typography>
                                <Typography>{project.department}</Typography>
                            </Box>
                            <Box className="line">
                                <Typography variant="b">Photos</Typography>
                                <Typography><PdfPicture onClick={() => openIpfsLink(project.photos)} /></Typography>
                            </Box>
                            <Box className="line">
                                <Typography variant="b">Diagnostic</Typography>
                                <Typography><PdfPicture onClick={() => openIpfsLink(project.diagnostic)} /></Typography>
                            </Box>
                            <Box className="line">
                                <Typography variant="b">Plan</Typography>
                                <Typography><PdfPicture onClick={() => openIpfsLink(project.plan)} /></Typography>
                            </Box>
                            <Box className="line">
                                <Typography variant="b">Status</Typography>
                                <Typography>{ProposalProjectStateCodes[project.state]}</Typography>
                            </Box>

                        </Box>
                    </RoundedGrid>
                </Grid>
                <Grid container >
                    <Grid item xs={12} >
                        <TableContainerUI sx={{ width: '100%', marginBottom: '10px'}} className="bg-gray-900">
                            <Table sx={{ minWidth: 650 }} aria-label="simple table" className="bg-gray-900">
                                <TableHead>
                                    <TableRow>
                                        <TableCell>Artisan</TableCell>
                                        <TableCell align="right">Description</TableCell>
                                        <TableCell align="right">Devis</TableCell>
                                        <TableCell align="right">Prix (€)</TableCell>
                                        <TableCell align="right">CEE émis</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBodyHover>
                                    {quotations.map((row) =>
                                    (

                                        <TableRow
                                            key={row.id}
                                        >
                                            <TableCell component="th" scope="row">{row.craftsmanAddr}</TableCell>
                                            <TableCell align="right">{row.description}</TableCell>
                                            <TableCell align="right"><IconHover><PictureAsPdfIcon onClick={() => openIpfsLink(row.documentHash)} /></IconHover></TableCell>
                                            <TableCell align="right">{BigNumber.from(project.department).toNumber()}</TableCell>
                                            <TableCell align="right">{BigNumber.from(row.nbCee).toNumber()}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBodyHover>
                            </Table>
                        </TableContainerUI>
                    </Grid>
                </Grid>
            </Box>
        </CenteredModal>
    )
}

export default ProjectDetailsModal