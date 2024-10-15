"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Check, X, Search, Eye, ChevronDown, ChevronUp } from "lucide-react"
import { toast, ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import { supabase } from "@/lib/supabase"
import NavBarComponent from "@/components/NavBarComponent/NavBarComponent"
import Loading from "@/components/Loading/Loading"

type StatusCadastro = "PENDENTE" | "APROVADO" | "LISTA DE ESPERA"

type Cadastro = {
  id: number
  name: string
  email: string
  created_at: string
  Status: StatusCadastro
  perfil: string
}

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
  
}

export default function PaginaGerenciarCadastros() {
  const [cadastros, setCadastros] = useState<Cadastro[]>([])
  const [busca, setBusca] = useState("")
  const [paginaAtual, setPaginaAtual] = useState(1)
  const [pdfSelecionado, setPdfSelecionado] = useState<string | null>(null)
  const [expandedRow, setExpandedRow] = useState<number | null>(null)
  const itensPorPagina = 5
  const [isLoading,setIsLoading] = useState(true)
  

  const cadastrosFiltrados = cadastros.filter(cadastro =>
    cadastro.name.toLowerCase().includes(busca.toLowerCase()) ||
    cadastro.email.toLowerCase().includes(busca.toLowerCase())
  )

  const totalPaginas = Math.ceil(cadastrosFiltrados.length / itensPorPagina)
  const indiceInicial = (paginaAtual - 1) * itensPorPagina
  const cadastrosPaginados = cadastrosFiltrados.slice(indiceInicial, indiceInicial + itensPorPagina)

  const atualizarStatus = async(id: number, novoStatus: StatusCadastro) => {
    // Atualiza o estado local imediatamente para feedback rápido
    setCadastros(cadastros.map(cadastro =>
      cadastro.id === id ? { ...cadastro, Status: novoStatus } : cadastro
    ))
  
    // Exibe notificação de status alterado enquanto espera a resposta
    toast.info(`Atualizando o status para ${novoStatus}...`)
  
    try {
      // Envia a atualização para o Supabase
      const { error } = await supabase
        .from('Aluno') // Nome da tabela no Supabase
        .update({ Status: novoStatus }) // Define o novo status
        .eq('id', id); // Condição para garantir que só o registro com o ID correto será atualizado
  
      if (error) {
        throw error;
      }
  
      // Notifica o usuário que a atualização foi bem-sucedida
      toast.success(`Status do cadastro atualizado para ${novoStatus}`);
      console.log(`Status atualizado para: ${novoStatus}`);
    } catch (error) {
      console.error('Erro ao atualizar o status:', error);
      toast.error('Erro ao atualizar o status. Tente novamente.');
      // Reverte a alteração local caso haja erro
      setCadastros(cadastros.map(cadastro =>
        cadastro.id === id ? { ...cadastro, Status: "PENDENTE" } : cadastro
      ))
    }
  }
  

  const visualizarPDF = (url: string) => {
    setPdfSelecionado(url)
    toast.info("Visualizando documento PDF")
  }

  const toggleExpandedRow = (id: number) => {
    setExpandedRow(expandedRow === id ? null : id)
  }

  useEffect(()=>{
    const fecthAluno = async () =>{
        try{
            const {data,error} = await supabase.from('Aluno').select('id,name,created_at,email,perfil,Status')
            if (error){
                console.log(error)
            }else{
                console.log(data)
                setCadastros(data)
            }
        }catch(err){
            console.log(err)
        }finally{
            setIsLoading(false)
        }
    }
    fecthAluno()
  },[])

  return (
    <div className="flex min-h-screen bg-gradient-to-b from-green-50 to-white ">
        <NavBarComponent/>
      <motion.div
        className="max-w-6xl max-sm:p-4 mx-auto pt-10"
        initial="initial"
        animate="animate"
        variants={fadeInUp}
        transition={{duration:0.3}}
      >
        <Card className="w-full ">
          <CardHeader className="bg-gradient-to-r from-green-600 to-green-500">
            {/* Responsividade no título e descrição do Card */}
            <CardTitle className="text-xl md:text-2xl text-white text-center">Gerenciar Cadastros</CardTitle>
            <CardDescription className="text-green-100 text-center text-sm md:text-base">
              Aprove ou coloque cadastros na lista de espera após analisar os documentos
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="mb-4 relative">
              <Label htmlFor="busca" className="sr-only">Buscar cadastros</Label>
              <Input
                id="busca"
                type="text"
                placeholder="Buscar por nome ou email"
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
                className="pl-10"
              />
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            </div>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    {/* Cabeçalho da tabela responsivo */}
                    <TableHead className="hidden md:table-cell">Nome</TableHead>
                    <TableHead className="hidden md:table-cell">Email</TableHead>
                    <TableHead className="hidden md:table-cell">Data de Cadastro</TableHead>
                    <TableHead className="hidden md:table-cell">Documento</TableHead>
                    <TableHead className="hidden md:table-cell">Status</TableHead>
                    <TableHead className="hidden md:table-cell">Ações</TableHead>
                    <TableHead className="md:hidden">Detalhes do Aluno</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <AnimatePresence>
                    {cadastrosPaginados.map((cadastro) => (
                      <>
                        <motion.tr
                          key={cadastro.id}
                          variants={fadeInUp}
                          transition={{duration:0.3}}
                          initial="initial"
                          animate="animate"
                          exit="exit"
                          layout
                        >
                          {/* Células da tabela responsivas */}
                          <TableCell className="hidden md:table-cell">{cadastro.name}</TableCell>
                          <TableCell className="hidden md:table-cell">{cadastro.email}</TableCell>
                          <TableCell className="hidden md:table-cell">{new Date(cadastro.created_at).toLocaleDateString('pt-BR')}</TableCell>
                          <TableCell className="hidden md:table-cell">
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="bg-blue-100 text-blue-700 hover:bg-blue-200"
                                  onClick={() => visualizarPDF(cadastro.perfil)}
                                >
                                  <Eye size={16} className="mr-1" /> Visualizar PDF
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="max-w-4xl max-h-[80vh]">
                                <DialogHeader>
                                  <DialogTitle>Documento de {cadastro.name}</DialogTitle>
                                  <DialogDescription>Analisando o documento PDF enviado pelo aluno</DialogDescription>
                                </DialogHeader>
                                <div className="mt-4 h-full">
                                  <iframe
                                    src={pdfSelecionado || undefined}
                                    className="w-full h-[60vh]"
                                    title={`Documento de ${cadastro.name}`}
                                  />
                                </div>
                              </DialogContent>
                            </Dialog>
                          </TableCell>
                          <TableCell className="hidden md:table-cell">
                            <Select
                              value={cadastro.Status}
                              onValueChange={(value: StatusCadastro) => atualizarStatus(cadastro.id, value)}
                            >
                              <SelectTrigger className="w-[180px]">
                                <SelectValue placeholder="Selecione o status" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="APROVADO">APROVADO</SelectItem>
                                <SelectItem value="LISTA DE ESPERA">LISTA DE ESPERA</SelectItem>
                                <SelectItem value="PENDENTE">PENDENTE</SelectItem>
                              </SelectContent>
                            </Select>
                          </TableCell>
                          <TableCell className="hidden md:table-cell">
                            <div className="flex space-x-2">
                              <Button
                                size="sm"
                                variant="outline"
                                className="bg-green-100 text-green-700 hover:bg-green-200"
                                onClick={() => atualizarStatus(cadastro.id, "APROVADO")}
                              >
                                <Check size={16} className="mr-1" /> Aprovar
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                className="bg-yellow-100 text-yellow-700 hover:bg-yellow-200"
                                onClick={() => atualizarStatus(cadastro.id, "LISTA DE ESPERA")}
                              >
                                <X size={16} className="mr-1" /> Lista de Espera
                              </Button>
                            </div>
                          </TableCell>
                          {/* Ações responsivas no modo mobile */}
                          <TableCell className="md:hidden">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => toggleExpandedRow(cadastro.id)}
                              className="w-full justify-between"
                            >
                              <span className="font-medium text-left flex-grow">{cadastro.name}</span>
                              {expandedRow === cadastro.id ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                            </Button>
                          </TableCell>
                        </motion.tr>
                        {/* Exibir detalhes em tela menor */}
                        {expandedRow === cadastro.id && (
                          <motion.tr
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.3 }}
                            className="md:hidden"
                          >
                            <TableCell colSpan={6}>
                              <div className="py-2 space-y-2">
                                <p><strong>Email:</strong> {cadastro.email}</p>
                                <p><strong>Data de Cadastro:</strong> {new Date(cadastro.created_at).toLocaleDateString('pt-BR')}</p>
                                <div>
                                  <strong>Documento:</strong>
                                  <Dialog>
                                    <DialogTrigger asChild>
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        className="bg-blue-100 text-blue-700 hover:bg-blue-200 ml-2"
                                        onClick={() => visualizarPDF(cadastro.perfil)}
                                      >
                                        <Eye size={16} className="mr-1" /> Visualizar PDF
                                      </Button>
                                    </DialogTrigger>
                                    <DialogContent className="max-w-full max-h-[80vh] w-[90vw]">
                                      <DialogHeader>
                                        <DialogTitle>Documento de {cadastro.name}</DialogTitle>
                                        <DialogDescription>Analisando o documento PDF enviado pelo aluno</DialogDescription>
                                      </DialogHeader>
                                      <div className="mt-4 h-full">
                                        <iframe
                                          src={pdfSelecionado || undefined}
                                          className="w-full h-[60vh]"
                                          title={`Documento de ${cadastro.name}`}
                                        />
                                      </div>
                                    </DialogContent>
                                  </Dialog>
                                </div>
                                <div>
                                  <strong>Status:</strong>
                                  <Select
                                    value={cadastro.Status}
                                    onValueChange={(value: StatusCadastro) => atualizarStatus(cadastro.id, value)}
                                  >
                                    <SelectTrigger className="w-full mt-1">
                                      <SelectValue placeholder="Selecione o status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="APROVADO">APROVADO</SelectItem>
                                      <SelectItem value="LISTA DE ESPERA">LISTA DE ESPERA</SelectItem>
                                      <SelectItem value="PENDENTE">PENDENTE</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </div>
                              </div>
                            </TableCell>
                          </motion.tr>
                        )}
                      </>
                    ))}
                  </AnimatePresence>
                </TableBody>
              </Table>
            </div>
            <Pagination className="mt-4">
                <PaginationContent>
                    <PaginationItem>
                    {/* PaginationPrevious - desabilitado se na primeira página */}
                    <PaginationPrevious
                        onClick={() => paginaAtual > 1 && setPaginaAtual(paginaAtual - 1)} // Apenas permite clicar se não for a primeira página
                        className={paginaAtual === 1 ? 'pointer-events-none cursor-not-allowed opacity-50' : ''} // Aplica classes de desabilitado
                         // Desativa o botão se for a primeira página
                    />
                    </PaginationItem>

                    {[...Array(totalPaginas)].map((_, index) => (
                    <PaginationItem key={index}>
                        {(() => {
                        const isDisabled = paginaAtual === index + 1;
                        return (
                            <PaginationLink
                            onClick={() => !isDisabled && setPaginaAtual(index + 1)}
                            isActive={paginaAtual === index + 1}
                            className={isDisabled ? 'cursor-not-allowed pointer-events-none opacity-50' : ''}
                            >
                            {index + 1}
                            </PaginationLink>
                        );
                        })()}
                    </PaginationItem>
                    ))}

                    <PaginationItem>
                    {/* PaginationNext - desabilitado se na última página */}
                    <PaginationNext
                        onClick={() => paginaAtual < totalPaginas && setPaginaAtual(paginaAtual + 1)} // Apenas permite clicar se não for a última página
                        className={paginaAtual === totalPaginas ? 'pointer-events-none cursor-not-allowed opacity-50' : ''} // Aplica classes de desabilitado
                         // Desativa o botão se for a última página
                    />
                    </PaginationItem>
                </PaginationContent>
                </Pagination>


          </CardContent>
        </Card>
      </motion.div>
      <ToastContainer position="bottom-right" autoClose={3000} />
      {isLoading && (<Loading/>)}
    </div>
  )
}
