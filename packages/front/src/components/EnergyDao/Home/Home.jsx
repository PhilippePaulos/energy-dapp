import { useCallback, useEffect, useState } from "react";
import { useAccount } from "wagmi";
import { useProfile } from "../../../contexts/DaoContext";
import DisplayCraftsman from "../Craftsman/Display/DisplayCraftsman";
import DisplayProjects from "../Projects/Display/DisplayProjects";

function Home() {

    const { profile: { contracts: { EnergyDao } } } = useProfile()
    const {address} = useAccount()

    const [isCraftsman, setIsCraftsman] = useState(false)

    const fetchCraftsman = useCallback(async() => {
        const addr = await EnergyDao.craftsmans(address)
        setIsCraftsman(addr.craftsmanAddr === address)
    }, [EnergyDao])

    useEffect(() => {
        fetchCraftsman()
    }, [fetchCraftsman])

    return (
        <>
            <DisplayProjects/>
            <DisplayCraftsman isCraftsman={isCraftsman}/>
        </>
    )

}

export default Home