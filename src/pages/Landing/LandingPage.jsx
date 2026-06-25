import { Link, Outlet } from 'react-router-dom';
import logo from '../../assets/images/logo.png';

export const LandingPage = () => {
  return (
    <div> 



        <nav className="flex justify-between items-center w-full max-w-7xl mx-auto px-6  max-md:px-2 border-b border-solid" >
            <div>
                {/* <h1 className="text-4xl">Logo</h1> */}
                <Link to="/">
                          <img src={logo} alt=""  className='size-24' />
                         </Link>
            </div>
            <div className="max-sm:hidden">
                <ul className='flex gap-4 '>
                   <li>
            <Link to="/#features">Features</Link>
          </li>
          <li>
            <Link to="/#how-it-works">How it works</Link>
          </li>
          <li>
            <Link to="/#community">Community</Link>
          </li>
            <li>
            <Link to="/#Join">Join</Link>
          </li>
                </ul>
            </div>
        
            <ul className='flex gap-4'>
                <li className="border-2 border-solid  px-4 py-2 rounded-full ">
                    <Link to="/login">Login</Link>
                </li>
                <li  className="border-2 border-solid  px-4 py-2 rounded-full" >
                    <Link to="/register">Register</Link>
                </li>
            </ul>
        </nav>  
        <main>

            <h3 className= "text-blue-600 mt-6 ">Welcome to the Landing Page</h3>
        </main>
    </div>
  );
}