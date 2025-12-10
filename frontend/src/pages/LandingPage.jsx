import React, {useState} from 'react'
import { useNavigate } from 'react-router-dom';
import Login from './Login';
import Register from './Register';

function LandingPage() {

    const navigate = useNavigate();

    const [register, setRegister] = useState(false);
    const [login, setLogin] = useState(false);

    const openLogin = () => {
        setLogin(true);
        setRegister(false);
    }
    // onLogin={openLogin}

    const openRegister = () => {
        setRegister(true);
        setLogin(false);
    }


    return (
        <div className='flex flex-col items-center inset-0 w-screen min-h-screen'>
            {/* Header kuno */}
            {register && <Register onClose={()=>setRegister(false)} onLogin={openLogin}/>}
            {login && <Login onClose={()=>setLogin(false)} onRegister={openRegister}/>}
            <div className='bg-white max-w-[1200px] min-h-screen px-10 pt-8 '>
                <div className='flex flex-row justify-between'>
                    <span className='font-black text-red-500 text-xl tracking-tighter'>dunzo.</span>
                    <button className='text-gray-900 font-semibold text-sm cursor-pointer hover:underline'
                        button onClick={() => navigate('/login')}>
                        Login
                    </button>
                </div>

                {/* hero */}
                <div className='py-20 border-b border-black'>
                    <span className='font-semibold text-xs tracking-wider text-red-500'
                            style={{ fontFamily: '"Courier New", Courier, monospace' }}>
                        TASK MANAGEMENT. DUNZO EASY.
                    </span>

                    <div className='flex flex-col my-10 gap-2 font-black text-9xl tracking-normal max-sm:text-6xl'>
                        <span>WE'RE</span>
                        <span className=' text-red-500'>DUNZO.</span>
                    </div>

                    <span className='text-gray-700'>
                        A web-app solution for students tired of chaotic group projects.<br/>
                        Assign tasks, track progress, and stop the last-minute panic.
                    </span>

                    <div className='flex flex-row gap-5 mt-10 items-center cursor-pointer hover:underline'>
                        <button className='py-4 px-7 bg-red-500 text-white font-medium cursor-pointer transition duration-300 hover:-translate-y-1'
                            onClick={() => navigate('/register')}>
                            Start Managing
                        </button>

                        <div className='flex flex-row gap-2 items-center cursor-pointer hover:underline'>
                            <a href='#HOWITWORKS' className='font-medium text-sm decoration-none'>See how it Works</a>
                            <i className="fa-solid fa-arrow-right-long text-xs"></i>
                        </div>
                    </div>

                    <div className='flex flex-col mt-10 py-5 gap-5 border-y border-gray-400'>
                        <span className='font-semibold text-xs tracking-wider text-gray-500'
                            style={{ fontFamily: '"Courier New", Courier, monospace' }}>
                            THE STRUGGLE.
                        </span>

                        <div className='flex flex-row gap-15'>
                            <div className='flex flex-col gap-6'>
                                <span className='font-black text-5xl tracking-tighter max-sm:text-3xl'>Why we built this.</span>
                                <span className='text-gray-700'>
                                    You know the drill. You're in a group with people you barely know.<br/>
                                    The deadline is one week away, and only 20% of the work is done.<br/>
                                    Some groupmates ghost you, others wait until the last minute.<br/><br/>
                                    You're left carrying the stress. <strong>Dunzo</strong> fixes this by making<br/> 
                                    collaboration transparent and accountable.
                                </span>
                            </div>

                            <div className='flex flex-col gap-6'>
                                <div className='flex flex-col px-7 py-1 border-l-3 border-red-500'>
                                    <span className='font-black text-4xl tracking-wide max-sm:text-2xl'>
                                        1 WEEK
                                    </span>
                                    <span className='text-gray-700'>
                                        Deadline Warning
                                    </span>
                                </div>

                                <div className='flex flex-col px-7 py-1 border-l-3 border-red-500'>
                                    <span className='font-black text-4xl tracking-wide max-sm:text-2xl'>
                                        20%
                                    </span>
                                    <span className='text-gray-700'>
                                        WORK COMPLETED
                                    </span>
                                </div>

                                <div className='text-sm pt-4 text-gray-700 border-t border-gray-400'>
                                    "Would've been nice if there was some way to manage everyone's <br/>
                                    tasks instead of me babysitting."
                                </div>
                            </div>
                        </div>

                        <div className='flex flex-col'>
                            <span id='HOWITWORKS' className='font-black text-5xl tracking-tight leading-14'>
                                Task Management, <br/>
                                <span className='text-red-500'>Dunzo Easy.</span>
                            </span>

                            <div className='grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-4 mt-10'>
                                <div className='flex flex-col gap-2 p-4 bg-zinc-100'>
                                    <span className='font-semibold text-sm tracking-normal text-gray-900'
                                        style={{ fontFamily: '"Courier New", Courier, monospace' }}>
                                        01
                                    </span>

                                    <span className='text-xl text-gray-900 font-black'>
                                        Assignments
                                    </span>

                                    <span className='text-gray-700'>
                                        Unclear responsibilities? Assign specific tasks to specific members. Everyone knows exactly what they need to do
                                    </span>
                                </div>

                                <div className='flex flex-col gap-2 p-4 bg-zinc-100'>
                                    <span className='font-semibold text-sm tracking-normal text-gray-900'
                                        style={{ fontFamily: '"Courier New", Courier, monospace' }}>
                                        02
                                    </span>

                                    <span className='text-xl text-gray-900 font-black'>
                                        Tracking
                                    </span>

                                    <span className='text-gray-700'>
                                        Stop guessing. Students update their status, and the leader sees the progress in real-time
                                    </span>
                                </div>

                                <div className='flex flex-col gap-2 p-4 bg-zinc-100'>
                                    <span className='font-semibold text-sm tracking-normal text-gray-900'
                                        style={{ fontFamily: '"Courier New", Courier, monospace' }}>
                                        03
                                    </span>

                                    <span className='text-xl text-gray-900 font-black'>
                                        Reminders
                                    </span>

                                    <span className='text-gray-700'>
                                        Missed deadlines are a thing of the past. Smart notifications alert users when a due date is approaching
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className='mt-5 flex flex-col gap-5 '>
                        <span className='font-semibold text-xs tracking-wider text-gray-700'
                            style={{ fontFamily: '"Courier New", Courier, monospace' }}>
                            BSCS F1
                        </span>

                        <span className='font-black text-5xl tracking-tighter max-sm:text-3xl'>The Developers.</span>

                        <div className='grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-3'>

                            <div className='flex flex-row justify-center px-7 py-3 bg-zinc-100 rounded-full'>
                                Jhon Ryan Ledon
                            </div>

                            <div className='flex flex-row justify-center px-7 py-3 bg-zinc-100 rounded-full'>
                                Christian Neil Libron   
                            </div>

                            <div className='flex flex-row justify-center px-7 py-3 bg-zinc-100 rounded-full'>
                                Joseph Victor Novabos  
                            </div>

                            <div className='flex flex-row justify-center px-7 py-3 bg-zinc-100 rounded-full'>
                                John Winston Tabada  
                            </div>

                            <div className='flex flex-row  justify-center  px-7 py-3 bg-zinc-100 rounded-full'>
                                Fateful Verdida  
                            </div>
                        </div>
                    </div>
                    {/* footer */}
                    <div className='flex flex-col items-center justify-center my-6'>
                        <span className='font-black text-red-500 text-xl tracking-tighter'>dunzo.</span>
                        <span className='text-gray-500'>
                            Making teamwork slightly less painful
                        </span>
                        © 2025 Dunzo Project
                    </div>
                </div>
            </div> 
        </div>
    )
}

export default LandingPage;