"use client"

import { SetStateAction, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { BookOpen, GraduationCap, UserCheck, Home, LogOut, User, Menu, PlusCircle, Check, X } from "lucide-react"

type Atividade = {
  id: number
  titulo: string
  descricao: string
  disciplina: string
}

type Aluno = {
  id: number
  nome: string
  email: string
  status: "pendente" | "aprovado" | "rejeitado"
}

type Nota = {
  id: number
  alunoId: number
  alunoNome: string
  disciplina: string
  valor: number
}

type AreaEscolhida = "Matemática" | "Redação" | "História" | "Física"

export default function PortalDoProfessor() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [email, setEmail] = useState("")
  const [name, setName] = useState("")
  const [matricula, setMatricula] = useState("")
  const [areaEscolhida, setAreaEscolhida] = useState<AreaEscolhida | "">("")
  const [isNavOpen, setIsNavOpen] = useState(false)
  const [atividades, setAtividades] = useState<Atividade[]>([])
  const [alunos, setAlunos] = useState<Aluno[]>([
    { id: 1, nome: "João Silva", email: "joao@email.com", status: "pendente" },
    { id: 2, nome: "Maria Santos", email: "maria@email.com", status: "pendente" },
  ])
  const [notas, setNotas] = useState<Nota[]>([])
  const [novaAtividade, setNovaAtividade] = useState({ titulo: "", descricao: "", disciplina: "" })
  const [novaNota, setNovaNota] = useState({ alunoId: 0, disciplina: "", valor: 0 })

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    if (username && password) {
      setIsLoggedIn(true)
    }
  }

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault()
    console.log("Registro:", { name, email, username, password, matricula, areaEscolhida })
    // Aqui você implementaria a lógica de registro
    // Por enquanto, vamos apenas fazer login após o registro
    setIsLoggedIn(true)
  }

  const handleLogout = () => {
    setIsLoggedIn(false)
    setUsername("")
    setPassword("")
    setEmail("")
    setName("")
    setMatricula("")
    setAreaEscolhida("")
  }

  const toggleNav = () => {
    setIsNavOpen(!isNavOpen)
  }

  const handleCadastrarAtividade = (e: React.FormEvent) => {
    e.preventDefault()
    const novaAtividadeComId = { ...novaAtividade, id: atividades.length + 1 }
    setAtividades([...atividades, novaAtividadeComId])
    setNovaAtividade({ titulo: "", descricao: "", disciplina: "" })
  }

  const handleAprovarAluno = (id: number) => {
    setAlunos(alunos.map(aluno => 
      aluno.id === id ? { ...aluno, status: "aprovado" } : aluno
    ))
  }

  const handleRejeitarAluno = (id: number) => {
    setAlunos(alunos.map(aluno => 
      aluno.id === id ? { ...aluno, status: "rejeitado" } : aluno
    ))
  }

  const handleCadastrarNota = (e: React.FormEvent) => {
    e.preventDefault()
    const alunoSelecionado = alunos.find(aluno => aluno.id === novaNota.alunoId)
    if (alunoSelecionado) {
      const novaNoteComId = { 
        ...novaNota, 
        id: notas.length + 1,
        alunoNome: alunoSelecionado.nome
      }
      setNotas([...notas, novaNoteComId])
      setNovaNota({ alunoId: 0, disciplina: "", valor: 0 })
    }
  }

  if (!isLoggedIn) {
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
                      value={username}
                      onChange={(e: { target: { value: SetStateAction<string> } }) => setUsername(e.target.value)}
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
                      onChange={(e: { target: { value: SetStateAction<string> } }) => setPassword(e.target.value)}
                      required
                      className="border-green-300 focus:border-green-500 focus:ring-green-500"
                    />
                  </div>
                  <Button type="submit" className="w-full bg-green-600 hover:bg-green-700">Entrar</Button>
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
                      onChange={(e: { target: { value: SetStateAction<string> } }) => setName(e.target.value)}
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
                      onChange={(e: any) => setEmail(e.target.value)}
                      required
                      className="border-green-300 focus:border-green-500 focus:ring-green-500"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="newUsername">Usuário</Label>
                    <Input
                      id="newUsername"
                      type="text"
                      value={username}
                      onChange={(e: { target: { value: SetStateAction<string> } }) => setUsername(e.target.value)}
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
                      onChange={(e: { target: { value: SetStateAction<string> } }) => setPassword(e.target.value)}
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
                      onChange={(e: { target: { value: SetStateAction<string> } }) => setMatricula(e.target.value)}
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

  return (
    <div className="flex h-screen bg-green-50">
      <Button
        variant="outline"
        size="icon"
        className="fixed top-4 left-4 z-50 lg:hidden"
        onClick={toggleNav}
      >
        <Menu className="h-6 w-6" />
        <span className="sr-only">Toggle navigation menu</span>
      </Button>

      <nav className={`w-64 bg-white shadow-md fixed inset-y-0 left-0 transform ${isNavOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 transition-transform duration-200 ease-in-out lg:relative z-40`}>
        <div className="p-4 bg-green-600">
          <h2 className="text-2xl font-bold text-white">Portal do Professor</h2>
        </div>
        <ul className="space-y-2 p-4">
          <li>
            <Button variant="ghost" className="w-full justify-start text-green-700 hover:bg-green-100 hover:text-green-800">
              <Home className="mr-2 h-4 w-4" />
              Início
            </Button>
          </li>
          <li>
            <Button variant="ghost" className="w-full justify-start text-green-700 hover:bg-green-100 hover:text-green-800">
              <BookOpen className="mr-2 h-4 w-4" />
              Atividades
            </Button>
          </li>
          <li>
            <Button variant="ghost" className="w-full justify-start text-green-700 hover:bg-green-100 hover:text-green-800">
              <UserCheck className="mr-2 h-4 w-4" />
              Aprovar Cadastros
            </Button>
          </li>
          <li>
            <Button variant="ghost" className="w-full justify-start text-green-700 hover:bg-green-100 hover:text-green-800">
              <GraduationCap className="mr-2 h-4 w-4" />
              Notas
            </Button>
          </li>
          <li>
            <Button variant="ghost" className="w-full justify-start text-green-700 hover:bg-green-100 hover:text-green-800">
              <User className="mr-2 h-4 w-4" />
              Perfil
            </Button>
          </li>
        </ul>
        <div className="p-4 mt-auto">
          <Button variant="outline" className="w-full border-green-600 text-green-600 hover:bg-green-50" onClick={handleLogout}>
            <LogOut className="mr-2 h-4 w-4" />
            Sair
          </Button>
        </div>
      </nav>

      {isNavOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
          onClick={() => setIsNavOpen(false)}
        ></div>
      )}

      <main className="flex-1 p-8 bg-transparent overflow-auto lg:ml-64">
        <h1 className="text-3xl font-bold mb-6 text-green-800">Bem-vindo, Professor {name }!</h1>
        <Tabs defaultValue="atividades" className="space-y-4">
          <TabsList className="bg-green-100">
            <TabsTrigger value="atividades" className="data-[state=active]:bg-green-600 data-[state=active]:text-white">Atividades</TabsTrigger>
            <TabsTrigger value="aprovar-cadastros" className="data-[state=active]:bg-green-600 data-[state=active]:text-white">Aprovar Cadastros</TabsTrigger>
            <TabsTrigger value="notas" className="data-[state=active]:bg-green-600 data-[state=active]:text-white">Notas</TabsTrigger>
          </TabsList>
          <TabsContent value="atividades">
            <Card>
              <CardHeader className="bg-green-600 text-white rounded-t-lg">
                <CardTitle>Cadastrar Nova Atividade</CardTitle>
                <CardDescription className="text-green-100">Adicione uma nova atividade para os alunos</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleCadastrarAtividade} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="titulo">Título da Atividade</Label>
                    <Input
                      id="titulo"
                      value={novaAtividade.titulo}
                      onChange={(e: { target: { value: any } }) => setNovaAtividade({...novaAtividade, titulo: e.target.value})}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="descricao">Descrição</Label>
                    <Textarea
                      id="descricao"
                      value={novaAtividade.descricao}
                      onChange={(e: { target: { value: any } }) => setNovaAtividade({...novaAtividade, descricao: e.target.value})}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="disciplina">Disciplina</Label>
                    <Input
                      id="disciplina"
                      value={novaAtividade.disciplina}
                      onChange={(e: { target: { value: any } }) => setNovaAtividade({...novaAtividade, disciplina: e.target.value})}
                      required
                    />
                  </div>
                  <Button type="submit" className="bg-green-600 hover:bg-green-700">
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Cadastrar Atividade
                  </Button>
                </form>
              </CardContent>
            </Card>
            <Card className="mt-6">
              <CardHeader className="bg-green-600 text-white rounded-t-lg">
                <CardTitle>Atividades Cadastradas</CardTitle>
                <CardDescription className="text-green-100">Lista de todas as atividades</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Título</TableHead>
                      <TableHead>Disciplina</TableHead>
                      <TableHead>Descrição</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {atividades.map((atividade) => (
                      <TableRow key={atividade.id}>
                        <TableCell>{atividade.titulo}</TableCell>
                        <TableCell>{atividade.disciplina}</TableCell>
                        <TableCell>{atividade.descricao}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="aprovar-cadastros">
            <Card>
              <CardHeader className="bg-green-600 text-white rounded-t-lg">
                <CardTitle>Aprovar Cadastros de Alunos</CardTitle>
                <CardDescription className="text-green-100">Gerencie os cadastros pendentes</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nome</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {alunos.map((aluno) => (
                      <TableRow key={aluno.id}>
                        <TableCell>{aluno.nome}</TableCell>
                        <TableCell>{aluno.email}</TableCell>
                        <TableCell>{aluno.status}</TableCell>
                        <TableCell>
                          {aluno.status === "pendente" && (
                            <>
                              <Button onClick={() => handleAprovarAluno(aluno.id)} className="mr-2 bg-green-600 hover:bg-green-700">
                                <Check className="mr-2 h-4 w-4" />
                                Aprovar
                              </Button>
                              <Button onClick={() => handleRejeitarAluno(aluno.id)}  className="bg-red-600 hover:bg-red-700">
                                <X className="mr-2 h-4 w-4" />
                                Rejeitar
                              </Button>
                            </>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="notas">
            <Card>
              <CardHeader className="bg-green-600 text-white rounded-t-lg">
                <CardTitle>Cadastrar Notas</CardTitle>
                <CardDescription className="text-green-100">Adicione notas para os alunos</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleCadastrarNota} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="aluno">Aluno</Label>
                    <Select onValueChange={(value: any) => setNovaNota({...novaNota, alunoId: Number(value)})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione um aluno" />
                      </SelectTrigger>
                      <SelectContent>
                        {alunos.filter(aluno => aluno.status === "aprovado").map((aluno) => (
                          <SelectItem key={aluno.id} value={aluno.id.toString()}>{aluno.nome}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="disciplina">Disciplina</Label>
                    <Input
                      id="disciplina"
                      value={novaNota.disciplina}
                      onChange={(e: { target: { value: any } }) => setNovaNota({...novaNota, disciplina: e.target.value})}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="nota">Nota</Label>
                    <Input
                      id="nota"
                      type="number"
                      min="0"
                      max="10"
                      step="0.1"
                      value={novaNota.valor}
                      onChange={(e: { target: { value: any } }) => setNovaNota({...novaNota, valor: Number(e.target.value)})}
                      required
                    />
                  </div>
                  <Button type="submit" className="bg-green-600 hover:bg-green-700">
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Cadastrar Nota
                  </Button>
                </form>
              </CardContent>
            </Card>
            <Card className="mt-6">
              <CardHeader className="bg-green-600 text-white rounded-t-lg">
                <CardTitle>Notas Cadastradas</CardTitle>
                <CardDescription className="text-green-100">Lista de todas as notas</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Aluno</TableHead>
                      <TableHead>Disciplina</TableHead>
                      <TableHead>Nota</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {notas.map((nota) => (
                      <TableRow key={nota.id}>
                        <TableCell>{nota.alunoNome}</TableCell>
                        <TableCell>{nota.disciplina}</TableCell>
                        <TableCell>{nota.valor.toFixed(1)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}