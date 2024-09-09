// import { useState } from 'react'
// import reactLogo from './assets/react.svg'
// import rpLogo from './assets/rp_logo.png'
// import viteLogo from '/vite.svg'
import './App.css';
// import axios from 'axios';
import {ChakraProvider, theme} from "@chakra-ui/react";
import {HashRouter, Route, Routes} from "react-router-dom";

import Auth from "./routes/Auth";
import Login from "./routes/Login";
import Home from "./routes/Home";
import Unauthorized from './routes/Unauthorized';
import ProtectedRoute from "./routes/ProtectedRoute";


function App() {
  return (
    <ChakraProvider theme={theme}>
      <HashRouter>
        <Routes>
          <Route path="/auth/" element={<Auth/>}> </Route>
          <Route path="/unauthorized/" element={<Unauthorized/>}/>
          <Route element={<ProtectedRoute/>}>
            <Route path="/home/" element={<Home/>}/>
            <Route path="*"/>
          </Route>
          <Route path="/" element={<Login/>}/>
        </Routes>
      </HashRouter>
    </ChakraProvider>
  );
}

export default App;
