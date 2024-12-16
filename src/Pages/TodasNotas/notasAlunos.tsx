"use client"

import { useState, useMemo, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination"
import { Search, ChevronDown, ChevronUp } from "lucide-react"
import { supabase } from "@/lib/supabase"
import NavBarComponent from "@/components/NavBarComponent/NavBarComponent"
import Loading from "@/components/Loading/Loading"

type Nota = {
  disciplina: string
  valor: number
}


type Aluno = {
  aluno_id: number
  nome: string
  notas: Nota[]
}

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
  transition: { duration: 0.3 }
}

export default function NotasAlunos() {
  const [alunos, setAlunos] = useState<Aluno[]>([])
  const [busca, setBusca] = useState("")
  const [paginaAtual, setPaginaAtual] = useState(1)
  const [ordenacao, setOrdenacao] = useState<{ campo: 'nome' | 'media', direcao: 'asc' | 'desc' }>({ campo: 'nome', direcao: 'asc' })
  const itensPorPagina = 5
  const [isLoading,setIsLoading] = useState(true)

  const calcularMedia = (notas: Nota[]) => {
    const soma = notas.reduce((acc, nota) => acc + nota.valor, 0)
    return (soma / notas.length).toFixed(2)
  }

  const alunosFiltradosEOrdenados = useMemo(() => {
    return alunos
      .filter(aluno => aluno.nome.toLowerCase().includes(busca.toLowerCase()))
      .sort((a, b) => {
        if (ordenacao.campo === 'nome') {
          return ordenacao.direcao === 'asc'
            ? a.nome.localeCompare(b.nome)
            : b.nome.localeCompare(a.nome)
        } else {
          const mediaA = parseFloat(calcularMedia(a.notas))
          const mediaB = parseFloat(calcularMedia(b.notas))
          return ordenacao.direcao === 'asc' ? mediaA - mediaB : mediaB - mediaA
        }
      })
  }, [alunos, busca, ordenacao])

  const totalPaginas = Math.ceil(alunosFiltradosEOrdenados.length / itensPorPagina)
  const indiceInicial = (paginaAtual - 1) * itensPorPagina
  const alunosPaginados = alunosFiltradosEOrdenados.slice(indiceInicial, indiceInicial + itensPorPagina)

  const alternarOrdenacao = (campo: 'nome' | 'media') => {
    setOrdenacao(prev => ({
      campo,
      direcao: prev.campo === campo && prev.direcao === 'asc' ? 'desc' : 'asc'
    }))
  }

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true); // Ativa o estado de carregamento
  
      // 1ª Requisição: Buscar os dados de notas com aluno_id e atividade_id
      const { data: notasData, error: notasError } = await supabase
        .from("Nota")
        .select("aluno_id, nota, atividade_id");
  
      if (notasError) {
        console.error("Erro ao buscar as notas: ", notasError);
        setIsLoading(false);
        return;
      }
  
      if (!notasData || notasData.length === 0) {
        console.warn("Nenhum dado encontrado.");
        setIsLoading(false);
        return;
      }
  
  
      // 2ª Requisição: Buscar dados dos alunos usando aluno_id
      const alunoIds = [...new Set(notasData.map((item) => item.aluno_id))];
  
      const { data: alunosData, error: alunosError } = await supabase
        .from("Aluno")
        .select("id, name")
        .in("id", alunoIds);
  
      if (alunosError) {
        console.error("Erro ao buscar dados dos alunos: ", alunosError);
        setIsLoading(false);
        return;
      }
  
  
      // 3ª Requisição: Buscar dados das atividades usando atividade_id
      const atividadeIds = [
        ...new Set(notasData.map((item) => item.atividade_id)),
      ];
  
      const { data: atividadesData, error: atividadesError } = await supabase
        .from("Atividade")
        .select("id, titulo")
        .in("id", atividadeIds);
  
      if (atividadesError) {
        console.error("Erro ao buscar dados das atividades: ", atividadesError);
        setIsLoading(false);
        return;
      }
  
  
      // Agrupando dados (combinação de notas, alunos e atividades)
      const dadosAgrupados = notasData.reduce((acc: Aluno[], notaItem) => {
        const aluno = alunosData.find((a) => a.id === notaItem.aluno_id);
        const atividade = atividadesData.find((a) => a.id === notaItem.atividade_id);
  
        if (aluno && atividade) {
          const alunoExistente = acc.find((item) => item.aluno_id === aluno.id);
  
          if (alunoExistente) {
            alunoExistente.notas.push({
              disciplina: atividade.titulo || "Desconhecida",
              valor: notaItem.nota,
            });
          } else {
            acc.push({
              aluno_id: aluno.id,
              nome: aluno.name || "Desconhecido",
              notas: [
                {
                  disciplina: atividade.titulo || "Desconhecida",
                  valor: notaItem.nota,
                },
              ],
            });
          }
        }
  
        return acc;
      }, []);
  
      // Atualiza o estado
      setAlunos(dadosAgrupados);
      setIsLoading(false);
    };
  
    fetchData();
  }, []);
  
  
  
  
  

  return (
    <div className="flex w-full bg-green-50 absolute">
        <NavBarComponent/>
    <div className="min-h-screen mx-auto max-sm:w-full w-10/12 p-4 bg-green-50 overflow-hidden">
      <motion.div
        className="max-w-3xl mx-auto w-full "
        initial="initial"
        animate="animate"
        variants={fadeInUp}
      >
        <Card className="w-full">
          <CardHeader className="bg-gradient-to-r from-green-600 to-green-500">
            <CardTitle className="text-2xl text-white text-center">Lista de Alunos e Notas</CardTitle>
            <CardDescription className="text-green-100 text-center">
              Visualize e gerencie as notas dos alunos
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="mb-4 relative">
              <Label htmlFor="busca" className="sr-only">Buscar alunos</Label>
              <Input
                id="busca"
                type="text"
                placeholder="Buscar por nome do aluno"
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
                    <TableHead className="cursor-pointer" onClick={() => alternarOrdenacao('nome')}>
                      Nome do Aluno
                      {ordenacao.campo === 'nome' && (
                        ordenacao.direcao === 'asc' ? <ChevronUp className="inline ml-1" size={16} /> : <ChevronDown className="inline ml-1" size={16} />
                      )}
                    </TableHead>
                    <TableHead className="cursor-pointer" onClick={() => alternarOrdenacao('media')}>
                      Média Geral
                      {ordenacao.campo === 'media' && (
                        ordenacao.direcao === 'asc' ? <ChevronUp className="inline ml-1" size={16} /> : <ChevronDown className="inline ml-1" size={16} />
                      )}
                    </TableHead>
                    <TableHead>Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <AnimatePresence>
                    {alunosPaginados.map((aluno) => (
                      <motion.tr
                        key={aluno.aluno_id}
                        variants={fadeInUp}
                        initial="initial"
                        animate="animate"
                        exit="exit"
                        layout
                      >
                        <TableCell>{aluno.nome}</TableCell>
                        <TableCell>{calcularMedia(aluno.notas)}</TableCell>
                        <TableCell>
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button variant="outline" size="sm">Ver Notas</Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Notas de {aluno.nome}</DialogTitle>
                                <DialogDescription>
                                  Detalhes das notas por disciplina
                                </DialogDescription>
                              </DialogHeader>
                              <Table>
                                <TableHeader>
                                  <TableRow>
                                    <TableHead>Disciplina</TableHead>
                                    <TableHead>Nota</TableHead>
                                  </TableRow>
                                </TableHeader>
                                <TableBody>
                                  {aluno.notas.map((nota, index) => (
                                    <TableRow key={index}>
                                      <TableCell>{nota.disciplina}</TableCell>
                                      <TableCell>{nota.valor}</TableCell>
                                    </TableRow>
                                  ))}
                                </TableBody>
                              </Table>
                            </DialogContent>
                          </Dialog>
                        </TableCell>
                      </motion.tr>
                    ))}
                  </AnimatePresence>
                </TableBody>
              </Table>
            </div>
            <Pagination className="mt-4">
              <PaginationContent>
                <PaginationItem>
                <PaginationPrevious
                    onClick={() => {
                        if (paginaAtual > 1) setPaginaAtual(prev => prev - 1);
                    }}
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
                    onClick={() => {
                        if (paginaAtual < totalPaginas) setPaginaAtual(prev => prev + 1);
                    }}
                    />

                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </CardContent>
        </Card>
      </motion.div>
    </div>
    {isLoading && (<Loading/>)}
    </div>
  )
}
