import { BrowserRouter as Router, Navigate, Route, Routes } from 'react-router-dom'
import DisplayCraftsman from "../EnergyDao/Craftsman/Display/DisplayCraftsman"
import { Home } from "../EnergyDao/Home"
import { Ico } from "../EnergyDao/Ico"
import { DisplayProjects } from "../EnergyDao/Projects/Display"

function DaoRouter({ isConnected }) {

    if (isConnected) {
        return (
            <Router>
                <Routes>
                    <Route exact path="/" element={<Home />} />
                    <Route exact path="/ico" element={<Ico />} />
                    <Route exact path="/projects-display" element={<DisplayProjects />} />
                    <Route exact path="/craftsman-display" element={<DisplayCraftsman />} />
                </Routes>
            </Router>
        )
    }
    else {
        <Router>
            <Routes>
                <Route exact path="/" element={<Home />} />
                <Route exact path="/ico" element={<Navigate replace to="/" />} />
                <Route exact path="/projects-display" element={<Navigate replace to="/" />} />
                <Route exact path="/craftsman-display" element={<Navigate replace to="/" />} />
            </Routes>
        </Router>
    }
}

export default DaoRouter