import PaginaGerenciarAtividades from '@/Pages/Atividades/geren_atividades';
import PaginaAviso from '@/Pages/Avisos/Avisos';
import AvisosCadastrados from '@/Pages/AvisosCadastrados/avisosCadastrados';
import PaginaGerenciarCadastros from '@/Pages/Geren_Cadastro/gerenc_cadastros';
import PaginaNotas from '@/Pages/Notas/notas';
import PerfilProfessor from '@/Pages/Perfil/perfil';
import AuthComponent from 'components/AuthComponent/AuthComponent';


import PrivateRoute from 'components/PrivateRoute/PrivateRoute';
import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';




const App: React.FC = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<AuthComponent />} />
        <Route path='/avisos-cadastrados' element={
          <PrivateRoute>
            <AvisosCadastrados/>
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
        <Route path='/atividades' element={
          <PrivateRoute>
            <PaginaGerenciarAtividades/>
          </PrivateRoute>
        }></Route>
        <Route path='/notas' element={
          <PrivateRoute>
            <PaginaNotas/>
          </PrivateRoute>
        }></Route>
        <Route path='/perfil' element={
          <PrivateRoute>
            <PerfilProfessor/>
          </PrivateRoute>
        }></Route>
      </Routes>
    </Router>
  );
};

export default App;
