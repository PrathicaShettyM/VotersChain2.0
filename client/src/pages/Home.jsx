import { Link } from 'react-router-dom';

export default function Home(){
    return(
        <div className='text-center mt-10'>
            <h1 className='text-4xl font-bold'>Welcome to VotersChain 2.0 </h1>
            <nav className='mt-5 space-x-4'>
                <Link to='/login' className='bg-blue-500 text-white px-4 py-2 rounded'>Login</Link>
                <Link to='/register' className='bg-blue-500 text-white px-4 py-2 rounded'>Register</Link>
            </nav>
        </div>
    );
}