import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs'
import { Button } from '../ui/button'
import { supabase } from '@/lib/supabase'
import { useNavigate } from 'react-router-dom'
import Loading from '../Loading/Loading'
import LoginSection from '../LoginSection/LoginSection'
import SignUpSection from '../SignUpSection/SignUpSection'
import ModalSignUp from '../ModalSignUp/ModalSignUp'
import ModalForgotPassword from '../ModalForgotPassword/ModalForgotPassword'



const AuthComponent = () => {

    const [isLoading,setIsLoading] = useState(false)
    const [password, setPassword] = useState("")
    const [isChecked,setIsChecked] = useState(false)
    const [email, setEmail] = useState("")
    const [name, setName] = useState("")
    const [loginError,setLoginError] = useState('')
    const [registerError,setRegisterError] = useState('')
    const [showModal,setShowModal] = useState(false)
    const [forgotPasswordModal, setForgotPasswordModal] = useState(false);
    const [resetMessage, setResetMessage] = useState('');
    const navigate = useNavigate();

    const handleCheckboxChange = (checked: boolean) => {
      setIsChecked(checked);
    };

    const handleForgotPassword = async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      setResetMessage('');
    
      const { error } = await supabase.auth.resetPasswordForEmail(email);
      if (error) {
        setResetMessage('Erro ao tentar recuperar senha. Verifique o email inserido.');
      } else {
        setResetMessage('Um email de recuperação foi enviado. Por favor, verifique sua caixa de entrada.');
      }
    };
    
    
    const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      setLoginError(''); // Reseta o erro ao tentar login novamente

      try {
        // Autenticação do usuário
        const { data: { user }, error: authError } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        // Verifica se ocorreu um erro de autenticação
        if (authError || !user) {
            setLoginError('Email ou senha inválido.'); // Mensagem de erro clara para o usuário
            return;
        }

        // Busca o perfil do usuário após login
          const { data: userProfile, error: profileError }:any = await supabase
              .from('Professor') // Substitua pelo nome correto da tabela de perfis
              .select('is_Professor, termAccepted')
              .eq('email', user.email)
              .single();
          // Verifica se houve erro ao buscar o perfil ou se o usuário não é um professor
          if (profileError || userProfile?.is_Professor === false) {
              await supabase.auth.signOut();
              setLoginError('Acesso negado. Somente professores podem fazer login.');
              return;
          }else if(userProfile?.termAccepted === false){
            await supabase.auth.signOut();
            setLoginError('Acesso negado. o usuário não aceitou os termos de uso');
            return;
          }
          
          // Login bem-sucedido e é professor
          navigate('/avisos-cadastrados'); // Redireciona para a página principal
      } catch (err) {
          console.error('Erro ao fazer login:', err);
          setLoginError('Erro ao fazer login. Tente novamente.'); // Em caso de erro inesperado
      }
     };


     const handleRegister = async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      setIsLoading(true);
  
      const { data: existingUserData, error: existingUserError } = await supabase
          .from('Professor')
          .select('email')
          .eq('email', email);
  
      if (existingUserError) {
          setIsLoading(false);
          console.error('Erro ao verificar se o email já existe:', existingUserError.message);
          return;
      }
  
      if (existingUserData && existingUserData.length > 0) {
          setIsLoading(false);
          setRegisterError('Email já cadastrado. Tente efetuar login.');
          return;
      }
  
      // Insere primeiro na tabela 'Professor' para obter o ID gerado
      const { data: professorData, error: insertError } = await supabase
          .from('Professor')
          .insert([{
              nome: name,
              email: email,
              
              termAccepted: isChecked
              
          }])
          .select('id')
          .single(); // Retorna o ID do novo registro
          
      if (insertError || !professorData) {
          setIsLoading(false);
          console.error('Erro ao inserir dados na tabela Professor:', insertError?.message);
          return;
      }
  
      const professorId = professorData.id;
  
      // Registra o usuário no Supabase Auth usando o ID gerado
      const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
              data: {
                  nome: name,
                  professor_id: professorId,  // Adiciona o ID da tabela Professor ao perfil do usuário no Auth
              },
          },
      });
  
      setIsLoading(false);

      if (error) {
          console.error('Erro ao cadastrar no Supabase Auth:', error.message);
      } else {
          console.log('Usuário registrado com sucesso e ID da tabela Professor incluído no Auth');
          setShowModal(true);
      }
  };
  
  return (
    <div className="flex items-center justify-center min-h-screen bg-green-50 max-sm:p-6">
    <Card className="w-[400px]">
      <CardHeader className="bg-green-600 text-white rounded-t-lg">
        <CardTitle>Portal do Professor</CardTitle>
        <CardDescription className="text-green-100">Faça login ou cadastre-se para acessar o portal</CardDescription>
      </CardHeader>
      <CardContent className="pt-6">
        <Tabs defaultValue="login" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="login">Login</TabsTrigger>
            <TabsTrigger value="register">Cadastro</TabsTrigger>
          </TabsList>
          <TabsContent value="login">
            <form onSubmit={handleLogin} className="space-y-4">
              <LoginSection
                email={email}
                setEmail={setEmail}
                password={password}
                setPassword={setPassword}
                loginError={loginError}
              />         
              <Button type="button" variant="link" onClick={() => setForgotPasswordModal(true)} className="mt-2 w-full self-center">
                Esqueceu sua senha?
              </Button>

            </form>
          </TabsContent>
          <TabsContent value="register">
            <form onSubmit={handleRegister} className="space-y-4">
              <SignUpSection
                email={email}
                setEmail={setEmail}
                name={name}
                setName={setName}
                password={password}
                setPassword={setPassword}
                isChecked={isChecked}
                handleCheckboxChange={handleCheckboxChange}
                registerError={registerError}
              />
            </form>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
    
    <ModalSignUp
      showModal={showModal}
      setShowModal={setShowModal}
    />
    <ModalForgotPassword
      forgotPasswordModal={forgotPasswordModal}
      setForgotPasswordModal={setForgotPasswordModal}
      handleForgotPassword={handleForgotPassword}
      email={email}
      setEmail={setEmail}
      resetMessage={resetMessage}
    />
 
    {isLoading && (<Loading/>)}
  </div>
  )
}

export default AuthComponent
