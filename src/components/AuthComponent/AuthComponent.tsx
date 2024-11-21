import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs'
import { Label } from '../ui/label'
import { Input } from '../ui/input'
import { Button } from '../ui/button'
import { supabase } from '@/lib/supabase'
import { useNavigate } from 'react-router-dom'
import Loading from '../Loading/Loading'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../ui/dialog'



const AuthComponent = () => {

    const [isLoading,setIsLoading] = useState(false)
    const [password, setPassword] = useState("")
    const [email, setEmail] = useState("")
    const [name, setName] = useState("")
    const [matricula, setMatricula] = useState("")
    const [loginError,setLoginError] = useState('')
    const [registerError,setRegisterError] = useState('')
    const [showModal,setShowModal] = useState(false)
    const [forgotPasswordModal, setForgotPasswordModal] = useState(false);
    const [resetMessage, setResetMessage] = useState('');
    const navigate = useNavigate();


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
              .select('is_Professor')
              .eq('email', user.email)
              .single();
          // Verifica se houve erro ao buscar o perfil ou se o usuário não é um professor
          if (profileError || userProfile?.is_Professor === false) {
              await supabase.auth.signOut();
              setLoginError('Acesso negado. Somente professores podem fazer login.');
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
              matricula: matricula,
              
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
  

    if(isLoading){
        return <Loading/>
    }

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
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="border-green-300 focus:border-green-500 focus:ring-green-500"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Senha</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="border-green-300 focus:border-green-500 focus:ring-green-500"
                />
              </div>
              <Button type="submit" className="w-full bg-green-600 hover:bg-green-700">Entrar</Button>
              <Button type="button" variant="link" onClick={() => setForgotPasswordModal(true)} className="mt-2 w-full self-center">
                Esqueceu sua senha?
              </Button>

                {/* Exibe a mensagem de erro se houver */}
                {loginError && (
                    <p className="text-red-500 text-sm">
                        {loginError}
                    </p>
                )}
                {registerError && (
                    <p className='text-red-500 text-sm'>
                        {registerError}
                    </p>
                )}
            </form>
          </TabsContent>
          <TabsContent value="register">
            <form onSubmit={handleRegister} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nome Completo</Label>
                <Input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="border-green-300 focus:border-green-500 focus:ring-green-500"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">E-mail</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="border-green-300 focus:border-green-500 focus:ring-green-500"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="newPassword">Senha</Label>
                <Input
                  id="newPassword"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="border-green-300 focus:border-green-500 focus:ring-green-500"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="matricula">Matrícula</Label>
                <Input
                  id="matricula"
                  type="text"
                  value={matricula}
                  onChange={(e) => setMatricula(e.target.value)}
                  required
                  className="border-green-300 focus:border-green-500 focus:ring-green-500"
                />
              </div>
              <Button type="submit" className="w-full bg-green-600 hover:bg-green-700">Cadastrar</Button>
            </form>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
    
    <Dialog open={showModal} onOpenChange={setShowModal}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Cadastro Realizado!</DialogTitle>
            <DialogDescription>
              Verifique a caixa de mensagens do email inserido no cadastro para confirmar o email.
            </DialogDescription>
        </DialogHeader>
      </DialogContent>
    </Dialog>

    <Dialog open={forgotPasswordModal} onOpenChange={setForgotPasswordModal}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Recuperar Senha</DialogTitle>
          <DialogDescription>
            Insira seu email para receber instruções de redefinição de senha.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleForgotPassword} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="reset-email">Email</Label>
            <Input
              id="reset-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="border-green-300 focus:border-green-500 focus:ring-green-500"
            />
          </div>
          <Button type="submit" className="w-full bg-green-600 hover:bg-green-700">Enviar Email de Recuperação</Button>
        </form>
        {resetMessage && (
          <p className="mt-4 text-green-500 text-sm">{resetMessage}</p>
        )}
      </DialogContent>
    </Dialog>

    
  </div>
  )
}

export default AuthComponent
