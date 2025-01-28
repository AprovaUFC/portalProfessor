"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { toast, ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import NavBarComponent from "@/components/NavBarComponent/NavBarComponent"
import { Pencil, Trash2 } from "lucide-react"
import { supabase } from "@/lib/supabase"

type Aula = {
  id: string
  dia: string
  horario: string
  disciplina: string
  sala: string
}

const diasSemana = ["Segunda", "Terça", "Quarta", "Quinta", "Sexta"]
const horarios = ["18:00", "19:00", "20:00", "21:00"]

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.3 }
}

export default function PaginaAjusteHorarios() {
  const [aulas, setAulas] = useState<Aula[]>([])
  const [aulaEmEdicao, setAulaEmEdicao] = useState<Aula | null>(null)
  const [aulaEmRemocao,setAulaEmRemocao] = useState<Aula | null>(null)
  const [dialogoAberto, setDialogoAberto] = useState(false)
  const [removeDialog,setRemoveDialog] = useState(false)

  const adicionarOuEditarAula = async (aula: Aula) => {
    if (aulaEmEdicao) {
      const { error } = await supabase
        .from('Horario')
        .update({
          dia: aula.dia,
          horario: aula.horario,
          sala: aula.sala,
          disciplina: aula.disciplina,
        })
        .eq('id', aulaEmEdicao.id)
        .select('*'); // Retorna os dados atualizados
  
      if (error) {
        console.error('Erro ao atualizar aula:', error);
        toast.error('Erro ao atualizar aula!');
        return;
      }
  
      // Atualiza o estado local, substituindo a aula antiga pela nova
      setAulas(aulas.map(a => a.id === aulaEmEdicao.id ? aula : a));
  
      toast.success('Aula atualizada com sucesso!');
    } else {
      const novaAula = { ...aula, id: Date.now().toString() }
      setAulas([...aulas, novaAula]);
      toast.success("Aula adicionada com sucesso!");
    }
    setDialogoAberto(false);
    setAulaEmEdicao(null);
  }
  

  const removerAula = async () => {
    if (aulaEmRemocao) {
        const { error } = await supabase
            .from('Horario')
            .delete()
            .eq('id', aulaEmRemocao.id); // Remove a aula com o ID correto

        if (error) {
            console.error('Erro ao remover horario', error);
            toast.error('Erro ao remover horario');
            return;
        }

        // Atualiza o estado removendo a aula deletada
        setAulas(aulas.filter(a => a.id !== aulaEmRemocao.id)); // Corrigido para comparar corretamente os IDs
        toast.info("Aula removida com sucesso!");
    }
};


  const verificarConflito = (aula: Aula) => {
    return aulas.some(a => 
      a.id !== aula.id && a.dia === aula.dia && a.horario === aula.horario
    )
  }

  useEffect(()=>{

      const fetchHorarios = async () => {
        const {data:aulas,error:aulasError} = await supabase.from('Horario').select('dia,horario,sala,disciplina,id')

        if(aulasError){
            console.error('Erro ao buscar horarios',aulasError)
            return
        }
        setAulas(aulas)
        console.log(aulas)
      }

    fetchHorarios()

  },[])

 

  const salvarHorarios = async () => {
    if (!aulas || aulas.length === 0) {
        toast.error('Nenhum horário para salvar!');
        return;
    }

    // Usar Promise.all para processar todos os horários simultaneamente
    const resultados = await Promise.all(
        aulas.map(async (aula) => {
            // Verificar se o horário já existe
            const { data: horariosExistentes, error: consultaError } = await supabase
                .from('Horario')
                .select('*')
                .eq('dia', aula.dia)
                .eq('horario', aula.horario)
                .eq('sala', aula.sala)
                .limit(1);

            if (consultaError) {
                console.error(`Erro ao verificar horário (${aula.dia}, ${aula.horario}):`, consultaError);
                return { sucesso: false, aula, error: consultaError };
            }

            if (horariosExistentes && horariosExistentes.length > 0) {
                
                
                return { sucesso: false, aula, error: 'Horário já cadastrado' };
            }

            // Inserir o novo horário no banco de dados
            const { error: insercaoError } = await supabase
                .from('Horario')
                .insert([
                    {
                        dia: aula.dia,
                        horario: aula.horario,
                        sala: aula.sala,
                        disciplina: aula.disciplina,
                    }
                ]);

            if (insercaoError) {
                console.error(`Erro ao salvar horário (${aula.dia}, ${aula.horario}):`, insercaoError);
                return { sucesso: false, aula, error: insercaoError };
            }

            return { sucesso: true, aula };
        })
    );

    // Processar resultados
    const horariosComErro = resultados.filter((res) => !res.sucesso);
    const horariosSalvos = resultados.filter((res) => res.sucesso);

    if (horariosComErro.length > 0) {
        console.error('Alguns horários não foram salvos:', horariosComErro);
        
    }

    if (horariosSalvos.length > 0) {
        console.log('Horários salvos:', horariosSalvos);
        toast.success(`${horariosSalvos.length} horário(s) salvo(s) com sucesso!`);
    }
};


  console.log(aulaEmEdicao)
  //console.log(aulas)
  const renderGradeHorarios = () => (
    <div className="overflow-x-auto">
      <div className="min-w-[600px]">
        <div className="grid grid-cols-6 gap-4 mb-4">
          <div className="font-bold">Horário</div>
          {diasSemana.map(dia => (
            <div key={dia} className="font-bold">{dia}</div>
          ))}
        </div>
        {horarios.map(horario => (
          <div key={horario} className="grid grid-cols-6 gap-4 mb-2">
            <div className="flex items-center">{horario}</div>
            {diasSemana.map(dia => {
              const aulaAtual = aulas.find(a => a.dia === dia && a.horario === horario)
              return (
                <div key={`${dia}-${horario}`} className="relative">
                  {aulaAtual ? (
                    <div className="bg-green-100 p-2 rounded text-sm">
                      <p className="font-bold">{aulaAtual.disciplina}</p>
                      <p>Sala {aulaAtual.sala}</p>
                      <div className="flex">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setAulaEmEdicao(aulaAtual)
                            console.log(aulaEmEdicao?.id)
                            setDialogoAberto(true)
                          }}
                          className="flex hover:bg-green-400"
                        >
                          <Pencil size={16} />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setAulaEmRemocao(aulaAtual)
                            setRemoveDialog(true)
                            
                        }}
                          className="flex hover:bg-red-400 m-0"
                        >
                          <Trash2 size={16} m-0/>
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <Button
                      variant="outline"
                      className="w-full h-full"
                      onClick={() => {
                        setAulaEmEdicao(null)
                        setDialogoAberto(true)
                      }}
                    >
                      +
                    </Button>
                  )}
                </div>
              )
            })}
          </div>
        ))}
      </div>
    </div>
  )

  const renderAcordeaoHorarios = () => (
    <Accordion type="single" collapsible className="w-full">
      {diasSemana.map(dia => (
        <AccordionItem key={dia} value={dia}>
          <AccordionTrigger>{dia}</AccordionTrigger>
          <AccordionContent>
            {horarios.map(horario => {
              const aulaAtual = aulas.find(a => a.dia === dia && a.horario === horario)
              return (
                <div key={`${dia}-${horario}`} className="mb-2 p-2 border rounded">
                  <div className="font-bold">{horario}</div>
                  {aulaAtual ? (
                    <div className="bg-green-100 p-2 rounded text-sm mt-1">
                      <p className="font-bold">{aulaAtual.disciplina}</p>
                      <p>Sala {aulaAtual.sala}</p>
                      <div className="mt-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="mr-2"
                          onClick={() => {
                            setAulaEmEdicao(aulaAtual)
                            setDialogoAberto(true)
                          }}
                        >
                          Editar
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => removerAula()}
                        >
                          Remover
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <Button
                      variant="outline"
                      className="w-full mt-1"
                      onClick={() => {
                        setAulaEmEdicao(null)
                        setDialogoAberto(true)
                      }}
                    >
                      Adicionar Aula
                    </Button>
                  )}
                </div>
              )
            })}
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  )

  return (
    <div className="min-h-screen flex bg-green-50">
        <NavBarComponent/>
      <motion.div
        className="max-w-6xl mx-auto w-screen pt-7 max-sm:m-6"
        initial="initial"
        animate="animate"
        variants={fadeInUp}
      >
        <Card className="w-full">
          <CardHeader className="bg-gradient-to-r from-green-600 to-green-500">
            <CardTitle className="text-2xl text-white text-center">Ajuste de Horários de Aula</CardTitle>
            <CardDescription className="text-green-100 text-center">
              Gerencie os horários semanais das aulas
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="hidden md:block">
              {renderGradeHorarios()}
            </div>
            <div className="md:hidden">
              {renderAcordeaoHorarios()}
            </div>
            <Dialog open={dialogoAberto} onOpenChange={setDialogoAberto}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>{aulaEmEdicao ? "Editar Aula" : "Adicionar Aula"}</DialogTitle>
                  <DialogDescription>
                    Preencha os detalhes da aula abaixo
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={(e) => {
                  e.preventDefault()
                  const formData = new FormData(e.currentTarget)
                  const novaAula: Aula = {
                    id: aulaEmEdicao?.id || "",
                    dia: formData.get("dia") as string,
                    horario: formData.get("horario") as string,
                    disciplina: formData.get("disciplina") as string,
                    
                    sala: formData.get("sala") as string,
                  }
                  if (verificarConflito(novaAula)) {
                    toast.error("Conflito de horário detectado!")
                    return
                  }
                  adicionarOuEditarAula(novaAula)
                }}>
                  <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="dia">Dia da Semana</Label>
                        <Select name="dia" defaultValue={aulaEmEdicao?.dia || ""}>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione o dia" />
                          </SelectTrigger>
                          <SelectContent>
                            {diasSemana.map(dia => (
                              <SelectItem key={dia} value={dia}>{dia}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="horario">Horário</Label>
                        <Select name="horario" defaultValue={aulaEmEdicao?.horario || ""}>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione o horário" />
                          </SelectTrigger>
                          <SelectContent>
                            {horarios.map(horario => (
                              <SelectItem key={horario} value={horario}>{horario}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="disciplina">Disciplina</Label>
                      <Input
                        id="disciplina"
                        name="disciplina"
                        defaultValue={aulaEmEdicao?.disciplina || ""}
                        required
                      />
                    </div>

                    <div>
                      <Label htmlFor="sala">Sala</Label>
                      <Input
                        id="sala"
                        name="sala"
                        defaultValue={aulaEmEdicao?.sala || ""}
                        required
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button type="submit">Salvar</Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
            <Dialog open={removeDialog} onOpenChange={setRemoveDialog}>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Confirmar Remoção</DialogTitle>
                  <DialogDescription>Deseja realmente remover o horário?</DialogDescription>
                </DialogHeader>
                <DialogFooter>
                  <Button variant="secondary" onClick={()=>{setRemoveDialog(false)}}>
                    Cancelar
                  </Button>
                  <Button variant="destructive" onClick={()=>{
                    removerAula()
                    setRemoveDialog(false)
                    }}>
                    Remover
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
            <Button className="mt-4 w-full" onClick={salvarHorarios}>
              Salvar Todos os Horários
            </Button>
          </CardContent>
        </Card>
      </motion.div>
      <ToastContainer position="bottom-right" autoClose={3000} />
    </div>
  
  )
}