import { useWallet } from "../../contexts/AppContext";

function Welcome() {

    const {state: {contract}} = useWallet()

    const handleClick = async() => {
        const owner = await contract.owner()
        console.log(owner)
    }
    const owner = 0
    return (
        <button onClick={handleClick}>Click {owner}</button>
    )
}

export default Welcome
