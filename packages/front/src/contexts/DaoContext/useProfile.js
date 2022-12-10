import { useContext } from "react";
import DaoContext from "./DaoContext";

const useProfile = () => useContext(DaoContext);

export default useProfile;
