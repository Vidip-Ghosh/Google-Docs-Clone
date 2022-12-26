import React,{useState,useEffect} from "react";
import TextEditor from "./TextEditor";
import {BrowserRouter as Router,Routes, Route, Navigate} from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';
import color from './color.css';

function App(){
  const [theme,setTheme] = useState('light');
  const ToggleTheme = () =>{
    if(theme==='light')
    {
      setTheme('dark');
    }
    else
    {
      setTheme('light');
    }
  };
  useEffect(()=>{
    document.body.className = theme;
  },[theme]);
  return (
    <div className={`App ${theme}`}>
      <Router>
      <Routes>
        <Route path='/'
          element = {<Navigate to={`/documents/${uuidv4()}`}/>} 
        />
        <Route path='/documents/:id'
          element = {<TextEditor/>}
        />
      </Routes>
    </Router>
    <div className="toggle">
        <button onClick={ToggleTheme}>Toggle Theme</button>
    </div>
    </div>
  )
}
export default App;