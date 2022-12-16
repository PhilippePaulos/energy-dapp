import DisplayCraftsman from "../Craftsman/Display/DisplayCraftsman";
import DisplayProjects from "../Projects/Display/DisplayProjects";

function Home() {
    console.log("coucou");
    return (
        <>
            <DisplayProjects/>
            <DisplayCraftsman />
        </>
    )

}

export default Home