"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog"
import { Search, Check, Eye, ChevronUp, ChevronDown } from "lucide-react"
import { toast, ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import { supabase } from "@/lib/supabase"
import NavBarComponent from "@/components/NavBarComponent/NavBarComponent"
import Loading from "@/components/Loading/Loading"

type Atividade = {
  dataEntrega?: string | ""
  id: number
  titulo: string
  status: string
  arquivo: string
  nota?: number | null
}


type Nota = {
  atividade_id: number
  aluno_id: number
  dataEntrega: string
  nota?: number | undefined | null
}

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.3 }
}

export default function PaginaNotas() {
  const [atividades, setAtividades] = useState<Atividade>()
  const [busca, setBusca] = useState("")
  const [paginaAtual, setPaginaAtual] = useState(1)
  const [pdfSelecionado, setPdfSelecionado] = useState<string | null>(null)
  const [nota, setNota] = useState("")
  const itensPorPagina = 5
  const [isLoading, setIsLoading] = useState(true)
  const [expandedRow, setExpandedRow] = useState<number | null>(null)


  const visualizarPDF = (url: string) => {
    setPdfSelecionado(url)
    toast.info("Visualizando documento PDF")
  }

  useEffect(() => {
    const fetchAtividadesSemNota = async () => {
      try {
        // Busca todas as notas que são null (sem avaliação)
        const { data: notasData, error: notasError } = await supabase
          .from('Nota')
          .select('atividade_id, aluno_id, dataEntrega,nota')
          .is('nota', null)
        
        if (notasError) {
          console.error('Erro ao buscar notas:', notasError)
          return
        }

        const atividadesIds = notasData?.map((nota) => nota.atividade_id)

        // Busca todas as atividades que estão relacionadas às notas com `nota` null
        const { data: atividadesData, error: atividadesError } = await supabase
          .from('Atividade')
          .select('id, titulo, descricao, dataLimite, status, arquivo')
          .in('id', atividadesIds)

        if (atividadesError) {
          console.error('Erro ao buscar atividades:', atividadesError)
          return
        }
        
      
        // Mapeia os dados da atividade para o formato necessário para a tabela
        const atividadesMapeadas: Atividade[] = atividadesData.map((atividade: Atividade) => {
          const notaCorrespondente:Nota[] = notasData.filter((nota) => nota.atividade_id === atividade.id)
          
          return {
            id: atividade.id,
            titulo: atividade.titulo,
            aluno_id: notaCorrespondente.length > 0 ? notaCorrespondente[0].aluno_id : 0,
            dataEntrega: notaCorrespondente.length > 0 ? notaCorrespondente[0].dataEntrega : "",
            status: atividade.status,
            arquivo: atividade.arquivo,
            nota: notaCorrespondente.length > 0 ? notaCorrespondente[0].nota : null
          }
        })
        
        
        setAtividades(atividadesMapeadas[0])
        
      } catch (error) {
        console.error('Erro ao buscar atividades sem nota:', error)
      }finally{
        setIsLoading(false)
      }
    }

    fetchAtividadesSemNota()
  }, [])

  const atividadesFiltradas = atividades && atividades.titulo.toLowerCase().includes(busca.toLowerCase()) ? [atividades] : []
  

  const totalPaginas = Math.ceil(atividadesFiltradas.length / itensPorPagina)
  const indiceInicial = (paginaAtual - 1) * itensPorPagina
  const atividadesPaginadas = atividadesFiltradas.slice(indiceInicial, indiceInicial + itensPorPagina)

  // Função para formatar a data no padrão DD/MM/YYYY
  const formatarData = (data: string) => {
    const date = new Date(data)
    const dia = String(date.getDate()).padStart(2, '0')
    const mes = String(date.getMonth() + 1).padStart(2, '0') // Janeiro é 0
    const ano = date.getFullYear()
    return `${dia}/${mes}/${ano}`
  }

  const atribuirNota = async (id: number, novaNota: string) => {
    if (!novaNota || parseFloat(novaNota) < 0 || parseFloat(novaNota) > 10) {
      toast.error("Por favor, insira uma nota válida entre 0 e 10.")
      return
    }

    try {
      // Atualiza a nota da atividade no Supabase
      const { error: updateError } = await supabase
        .from('Nota')
        .update({ nota: parseFloat(novaNota) })
        .eq('atividade_id', id)

      if (updateError) {
        console.error('Erro ao atualizar a nota:', updateError)
        toast.error("Erro ao atribuir a nota.")
        return
      }

      // Atualiza o status da atividade na interface
      

      toast.success(`Nota ${novaNota} atribuída com sucesso!`)
      setNota("")
    } catch (error) {
      console.error('Erro inesperado ao atribuir a nota:', error)
      toast.error("Erro inesperado ao atribuir a nota.")
    }
  }

  const toggleExpandedRow = (id: number) => {
    setExpandedRow(expandedRow === id ? null : id)
  }

  return (
    <div className="flex bg-green-50">
      <NavBarComponent />
      <div className="min-h-screen bg-gradient-to-b mx-auto p-4 bg-green-50 max-sm:max-w-sm overflow-hidden">
        <motion.div
          className="max-w-6xl mx-auto max-sm:max-w-sm"
          initial="initial"
          animate="animate"
          variants={fadeInUp}
        >
          <Card className="w-full ">
            <CardHeader className="bg-gradient-to-r rounded-t-lg from-green-600 to-green-500">
              <CardTitle className="text-2xl text-white text-center">Atividades Para Avaliar</CardTitle>
              <CardDescription className="text-green-100 text-center">
                Gerencie as atividades pendentes de avaliação
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="mb-4 relative">
                <Label htmlFor="busca" className="sr-only">Buscar atividades</Label>
                <Input
                  id="busca"
                  type="text"
                  placeholder="Buscar por título"
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
                      <TableHead className="hidden md:table-cell">Título</TableHead>
                      <TableHead className="hidden md:table-cell">Data de Entrega</TableHead>
                      <TableHead className="hidden md:table-cell">Status</TableHead>
                      <TableHead className="hidden md:table-cell">Arquivo</TableHead>
                      <TableHead className="hidden md:table-cell">Ação</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {atividadesPaginadas.map((atividade:Atividade) => (
                      <>
                      <TableRow key={atividade.id}>
                        <TableCell className="hidden md:table-cell">{atividade.titulo}</TableCell>
                        <TableCell className="hidden md:table-cell">{atividade.dataEntrega ? formatarData(atividade.dataEntrega) : 'Data não encontrada'}</TableCell>
                        <TableCell className="hidden md:table-cell">{atividade.status}</TableCell>
                        <TableCell className="hidden md:table-cell">
                          <Dialog>
                                <DialogTrigger asChild>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="bg-blue-100 text-blue-700 hover:bg-blue-200"
                                    onClick={() => visualizarPDF(atividade.arquivo)}
                                  >
                                    <Eye size={16} className="mr-1" /> Visualizar PDF
                                  </Button>
                                </DialogTrigger>
                                <DialogContent className="max-w-4xl max-h-[80vh]">
                                  <DialogHeader>
                                    <DialogTitle>Documento de {atividade.titulo}</DialogTitle>
                                    <DialogDescription>Analisando o documento PDF enviado pelo aluno</DialogDescription>
                                  </DialogHeader>
                                  <div className="mt-4 h-full">
                                    <iframe
                                      src={pdfSelecionado || undefined}
                                      className="w-full h-[60vh]"
                                      title={`Documento de ${atividade.titulo}`}
                                    />
                                  </div>
                                </DialogContent>
                              </Dialog>
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button
                                variant="outline"
                                size="sm"
                                className="bg-yellow-100 text-yellow-700 hover:bg-yellow-200"
                                
                              >
                                Atribuir Nota
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Atribuir Nota</DialogTitle>
                                <DialogDescription>
                                  Insira a nota para a atividade "{atividade.titulo}"
                                </DialogDescription>
                              </DialogHeader>
                              <div className="py-4">
                                <Label htmlFor="nota">Nota</Label>
                                <Input
                                  id="nota"
                                  type="number"
                                  min="0"
                                  max="10"
                                  step="0.1"
                                  value={nota}
                                  onChange={(e) => setNota(e.target.value)}
                                  placeholder="Insira a nota (0-10)"
                                />
                              </div>
                              <DialogFooter>
                                <Button
                                  onClick={() => atribuirNota(atividade.id, nota)}
                                  disabled={!nota || parseFloat(nota) < 0 || parseFloat(nota) > 10}
                                >
                                  <Check className="mr-2 h-4 w-4" /> Confirmar Nota
                                </Button>
                              </DialogFooter>
                            </DialogContent>
                          </Dialog>
                        </TableCell>
                      </TableRow>
                          <TableCell className="md:hidden">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => toggleExpandedRow(atividade.id)}
                            className="w-full justify-between"
                          >
                            <span className="font-medium text-left flex-grow">{atividade.titulo}</span>
                            {expandedRow === atividade.id ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                          </Button>
                        </TableCell>
                         {/* Exibir detalhes em tela menor */}
                         {expandedRow === atividade.id && (
                          <motion.tr
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.3 }}
                            className="md:hidden"
                          >
                            <TableCell colSpan={6}>
                              <div className="py-2 space-y-2">
                                <p><strong>Atividade</strong> {atividade.titulo}</p>
                                <p><strong>Data de entrega:</strong> {atividade.dataEntrega? new Date(atividade.dataEntrega).toLocaleDateString('pt-BR') : "Data não encontrada"}</p>
                                <div>
                                  <strong>Documento:</strong>
                                  <Dialog>
                                    <DialogTrigger asChild>
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        className="bg-blue-100 text-blue-700 hover:bg-blue-200 ml-2"
                                        onClick={() => visualizarPDF(atividade.arquivo)}
                                      >
                                        <Eye size={16} className="mr-1" /> Visualizar PDF
                                      </Button>
                                    </DialogTrigger>
                                    <DialogContent className="max-w-full max-h-[80vh] w-[90vw]">
                                      <DialogHeader>
                                        <DialogTitle>Documento de {atividade.titulo}</DialogTitle>
                                        <DialogDescription>Analisando o documento PDF enviado pelo aluno</DialogDescription>
                                      </DialogHeader>
                                      <div className="mt-4 h-full">
                                        <iframe
                                          src={pdfSelecionado || undefined}
                                          className="w-full h-[60vh]"
                                          title={`Documento de ${atividade.titulo}`}
                                        />
                                      </div>
                                    </DialogContent>
                                  </Dialog>
                                </div>
                                <div >
                                <TableCell className="m-0 p-0 pt-4">
                                <strong>Nota: </strong>
                                  <Dialog>
                                    <DialogTrigger asChild>
                                      
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        className="bg-yellow-100 text-yellow-700 hover:bg-yellow-200"
                                        
                                      >
                                        Atribuir Nota
                                      </Button>
                                    </DialogTrigger>
                                    <DialogContent>
                                      <DialogHeader>
                                        <DialogTitle>Atribuir Nota</DialogTitle>
                                        <DialogDescription>
                                          Insira a nota para a atividade "{atividade.titulo}"
                                        </DialogDescription>
                                      </DialogHeader>
                                      <div className="">
                                        <Label htmlFor="nota">Nota</Label>
                                        <Input
                                          id="nota"
                                          type="number"
                                          min="0"
                                          max="10"
                                          step="0.1"
                                          value={nota}
                                          onChange={(e) => setNota(e.target.value)}
                                          placeholder="Insira a nota (0-10)"
                                        />
                                      </div>
                                      <DialogFooter>
                                        <Button
                                          onClick={() => atribuirNota(atividade.id, nota)}
                                          disabled={!nota || parseFloat(nota) < 0 || parseFloat(nota) > 10}
                                        >
                                          <Check className="mr-2 h-4 w-4" /> Confirmar Nota
                                        </Button>
                                      </DialogFooter>
                                    </DialogContent>
                                  </Dialog>
                                </TableCell>
                                  
                                </div>
                              </div>
                            </TableCell>
                          </motion.tr>
                        )}
                      </>
                    ))}
                  </TableBody>
                </Table>
              </div>
              <Pagination className="mt-4">
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                      onClick={() => paginaAtual > 1 && setPaginaAtual(paginaAtual - 1)}
                      className={paginaAtual === 1 ? 'pointer-events-none cursor-not-allowed opacity-50' : ''}
                    />
                  </PaginationItem>
                  {[...Array(totalPaginas)].map((_, index) => (
                    <PaginationItem key={index}>
                      <PaginationLink
                        onClick={() => setPaginaAtual(index + 1)}
                        isActive={paginaAtual === index + 1}
                      >
                        {index + 1}
                      </PaginationLink>
                    </PaginationItem>
                  ))}
                  <PaginationItem>
                    <PaginationNext
                      onClick={() => paginaAtual < totalPaginas && setPaginaAtual(paginaAtual + 1)}
                      className={paginaAtual === totalPaginas ? 'pointer-events-none cursor-not-allowed opacity-50' : ''}
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
    </div>
  )
}
