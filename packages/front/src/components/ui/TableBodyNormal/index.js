import { styled, TableBody } from "@mui/material";
import { theme } from "../../theme";

const TableBodyHover = styled(TableBody)({
    '&:last-child td, &:last-child th':{
        border: 0 
    }
});

export default TableBodyHover