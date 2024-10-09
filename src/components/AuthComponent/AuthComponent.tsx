import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs'
import { Label } from '../ui/label'
import { Input } from '../ui/input'
import { Button } from '../ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select'
import { supabase } from '@/lib/supabase'
import { useNavigate } from 'react-router-dom'
import Loading from '../Loading/Loading'

type AreaEscolhida = "Matemática" | "Redação" | "História" | "Física"


const AuthComponent = () => {

    const [isLoading,setIsLoading] = useState(false)
    const [password, setPassword] = useState("")
    const [email, setEmail] = useState("")
    const [name, setName] = useState("")
    const [matricula, setMatricula] = useState("")
    const [areaEscolhida, setAreaEscolhida] = useState<AreaEscolhida | "">("")
    const [loginError,setLoginError] = useState('')
    const [registerError,setRegisterError] = useState('')
    const navigate = useNavigate();

    const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoginError(''); // Reseta o erro ao tentar login novamente
    
        try {
            const { data: { user }, error: authError } = await supabase.auth.signInWithPassword({
                email,
                password,
            });
    
            // Verifica se ocorreu um erro de autenticação
            if (authError || !user) {
                setLoginError('Email ou senha inválido.'); // Mensagem de erro mais clara para o usuário
                return;
            }
    
            // Login bem-sucedido
            console.log('Login bem-sucedido', user);
            navigate('/home'); // Redireciona para a página principal
        } catch (err) {
            console.error('Erro ao fazer login:', err);
            setLoginError('Erro ao fazer login. Tente novamente.'); // Em caso de erro inesperado
        }
    };


    const handleRegister = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsLoading(true);  // Inicia o estado de carregamento
        
        // Verifica se o email já existe na tabela 'Aluno' antes de tentar cadastrar o usuário
        const { data: existingUserData, error: existingUserError } = await supabase
            .from('Aluno')
            .select('email')
            .eq('email', email);
    
        if (existingUserError) {
            setIsLoading(false);
            console.error('Erro ao verificar se o email já existe:', existingUserError.message);
            return;
        }
    
        if (existingUserData && existingUserData.length > 0) {
            setIsLoading(false);
            setRegisterError('Email ja cadastrado, tente efetuar ou login');
            console.error('Erro: Email já está cadastrado na tabela de alunos.');
            // alert('O email fornecido já está cadastrado. Tente fazer login ou usar outro email.');
            return; // Interrompe a execução se o email já estiver na tabela
        }
    
        // Se o email não estiver registrado, tenta registrar o usuário no Supabase
        const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: {
                    nome: name,  // Adiciona o nome completo ao perfil do usuário
                },
            },
        });
    
        if (error) {
            setIsLoading(false);  // Finaliza o estado de carregamento em caso de erro
    
            // Verifica se o erro é devido ao email já estar registrado no auth
            if (error.message.includes('already registered')) {
                console.error('Erro: Email já está registrado no Supabase Auth.');
                // alert('O email fornecido já está cadastrado no sistema. Tente fazer login ou usar outro email.');
            } else {
                console.error('Erro ao cadastrar:', error.message);
            }
            return; // Interrompe a execução da função se houver erro
        }
    
        // Se o cadastro for bem-sucedido, insira o usuário na tabela 'aluno'
        const user = data?.user;
        if (!user) {
            setIsLoading(false);  // Finaliza o estado de carregamento em caso de erro
            console.error('Erro: Usuário não foi criado corretamente.');
            return;
        }
        
        console.log(user);
    
        // Aqui vamos adicionar os dados do usuário na tabela 'aluno'
        const { error: insertError } = await supabase
            .from('Professor')
            .insert([
                {
                    nome: name,
                    email: user.email,
                    matricula: matricula
                    
                },
            ]);
    
        setIsLoading(false);  // Finaliza o estado de carregamento após a inserção dos dados
    
        if (insertError) {
            console.error('Erro ao inserir dados na tabela aluno:', insertError.message);
        } else {
            console.log('Usuário registrado com sucesso e inserido na tabela Professor');
            
        }
    };

    if(isLoading){
        return <Loading/>
    }

  return (
    <div className="flex items-center justify-center min-h-screen bg-green-50">
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
                <Label htmlFor="username">Usuário</Label>
                <Input
                  id="username"
                  type="text"
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
              <div className="space-y-2">
                <Label htmlFor="areaEscolhida">Área Escolhida</Label>
                <Select onValueChange={(value: string) => setAreaEscolhida(value as AreaEscolhida)} value={areaEscolhida}>
                  <SelectTrigger className="border-green-300 focus:border-green-500 focus:ring-green-500">
                    <SelectValue placeholder="Selecione a área" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Matemática">Matemática</SelectItem>
                    <SelectItem value="Redação">Redação</SelectItem>
                    <SelectItem value="História">História</SelectItem>
                    <SelectItem value="Física">Física</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button type="submit" className="w-full bg-green-600 hover:bg-green-700">Cadastrar</Button>
            </form>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  </div>
  )
}

export default AuthComponent