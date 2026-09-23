import { useState } from 'react'
import heroImg from './assets/hero.png'
import reactLogo from './assets/react.svg'
import viteLogo from './assets/vite.svg'
import {Route ,Routes} from "react-router"
import Atri from "../Pages/home"
import Signup from '../Pages/signup'
import Login from '../Pages/login'
import Songs from '../Pages/songs'
import './App.css'

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
<Routes>
  <Route path='/' element={<Atri/>}/>
  <Route path='/api/signup' element={<Signup/>}/>
  <Route path='/api/login' element={<Login/>}/>
  <Route path='/songs' element={<Songs/>}/>
  
</Routes>
    </>
  )
}

export default App
