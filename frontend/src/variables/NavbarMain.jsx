import React, { useContext } from 'react'
import { NavbarWithMegaMenu } from './OutNavbar';

const NavbarMain = () => {
    const { isAuthenticated} = useContext(AuthContext);
    console.log(isAuthenticated);
  return (
    <div>
        {
            isAuthenticated ? <>
            <ComplexNavbar/>
            </>
            :
            <>
            <Navb/>
            </>
        }
    </div>
  )
}

export default NavbarMain