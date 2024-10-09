import Home from '@/components/portalProfessor';
import PaginaAviso from '@/Pages/Avisos/Avisos';
import PaginaGerenciarCadastros from '@/Pages/Geren_Cadastro/gerenc_cadastros';
import AuthComponent from 'components/AuthComponent/AuthComponent';


import PrivateRoute from 'components/PrivateRoute/PrivateRoute';
import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';




const App: React.FC = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<AuthComponent />} />
        <Route path='/home' element={
          <PrivateRoute>
            <Home/>
          </PrivateRoute>
        }></Route>
        <Route path='/avisos' element={
          <PrivateRoute>
            <PaginaAviso/>
          </PrivateRoute>
        }></Route>
        <Route path='/cadastros' element={
          <PrivateRoute>
            <PaginaGerenciarCadastros/>
          </PrivateRoute>
        }></Route>
      </Routes>
    </Router>
  );
};

export default App;
