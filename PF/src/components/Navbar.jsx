import { NavLink } from "react-router-dom"

const Navbar = () => {
  return (
    <header className="header">
        <NavLink to="/" className="w-10 h-10 rounded-lg bg-white items-center justify-center flex font-bold shadow-md">
        <p className="blue-gradient_text">AS</p>
        </NavLink>
        <nav className="flex text-lg gap-7 font-large">
          <NavLink to="/about" className={({ isActive })=> isActive ?
          'text-blue-500' : 'text-white'}>
            About
          </NavLink>
                    <NavLink to="/projects" className={({ isActive })=> isActive ?
          'text-blue-500' : 'text-white'}>
            Projects
          </NavLink>
        </nav>
    </header>
  )
}

export default Navbar