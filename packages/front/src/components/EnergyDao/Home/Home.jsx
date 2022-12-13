import { useCallback, useEffect, useState } from "react";
import { useAccount } from "wagmi";
import { useProfile } from "../../../contexts/DaoContext";
import DisplayCraftsman from "../Craftsman/Display/DisplayCraftsman";
import DisplayProjects from "../Projects/Display/DisplayProjects";

function Home() {

    const { state: { contracts: { EnergyDao } }, state } = useProfile()

    return (
        <>
            <DisplayProjects/>
            <DisplayCraftsman />
        </>
    )

}

export default Home