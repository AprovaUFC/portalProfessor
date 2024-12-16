"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { toast, ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import InputMask from 'react-input-mask'
import NavBarComponent from "@/components/NavBarComponent/NavBarComponent"
import { supabase } from "@/lib/supabase"
import Loading from "@/components/Loading/Loading"

type Atividade = {
  titulo: string
  descricao: string
  dataLimite: string
  dataDisponivel: string
  arquivo: string
  status: string
}

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5 }
}

const staggerChildren = {
  animate: {
    transition: {
      staggerChildren: 0.1
    }
  }
}

export default function PaginaGerenciarAtividades() {
  const [atividade, setAtividade] = useState<Atividade>({
    titulo: "",
    descricao: "",
    dataLimite: "",
    dataDisponivel: "",
    arquivo: "",
    status:""

  })
  const [isLoading,setIsLoading] = useState(false)

  useEffect(() => {
    toast.info("Bem-vindo à página de criação de atividades!", {
      position: "top-right",
      autoClose: 3000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
    })


  }, [])
  

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setAtividade(prev => ({ ...prev, [name]: value }))
  }

  const validateDate = (date: string): boolean => {
    const regex = /^(0[1-9]|[12][0-9]|3[01])\/(0[1-9]|1[012])\/(19|20)\d\d$/
    return regex.test(date)
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    setIsLoading(true)
    e.preventDefault();
    const [diaDisponivel, mesDisponivel, anoDisponivel] = atividade.dataDisponivel.split('/')
    const [dia, mes, ano] = atividade.dataLimite.split('/')
    const dataDisponivel = new Date(`${anoDisponivel}-${mesDisponivel}-${diaDisponivel}`)
    const dataLimite = new Date(`${ano}-${mes}-${dia}`) 
    const dataAtual = new Date()
    if (!validateDate(atividade.dataLimite) || !validateDate(atividade.dataDisponivel)) {
      toast.error("Por favor, insira as datas no formato dd/mm/aaaa");
      setIsLoading(false)
      return;
    }else if(dataLimite < dataDisponivel && dataDisponivel < dataAtual){
      toast.error('Por favor, insira datas compativeis ')
      setIsLoading(false)
      return;
    }
    // console.log("Atividade criada:", atividade);
    toast.success("Atividade criada com sucesso!");
    setAtividade({
      titulo: "",
      descricao: "",
      dataLimite: "",
      dataDisponivel: "",
      arquivo: "",
      status: ""
    });
    try{const { data, error } = await supabase.from('Atividade').insert(atividade);
    if (error) {
      toast.error("Erro ao criar atividade: " + error.message);
      console.log(data)
    } else {
      toast.success("Atividade salva no banco de dados com sucesso!");
    }
    }catch(err){
        console.log(err)
        
    }finally{
        setIsLoading(false)
    }
  };

  return (
    <div className="flex bg-green-50">
        <NavBarComponent/>
    <div className="min-h-screen mx-auto  p-4">
    
      <motion.div
        className="max-w-2xl mx-auto"
        initial="initial"
        animate="animate"
        variants={fadeInUp}
      >
        <Card className="w-full">
          <CardHeader className="bg-gradient-to-r from-green-600 to-green-500">
            <CardTitle className="text-2xl text-white text-center">Criar Nova Atividade</CardTitle>
            <CardDescription className="text-green-100 text-center">
              Adicione uma nova atividade para os alunos
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <motion.form onSubmit={handleSubmit} className="space-y-4" variants={staggerChildren}>
              <motion.div className="space-y-2" variants={fadeInUp}>
                <Label htmlFor="titulo">Título da Atividade</Label>
                <input
                  id="titulo"
                  name="titulo"
                  value={atividade.titulo}
                  onChange={handleInputChange}
                  placeholder="Digite o título da atividade"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                />
              </motion.div>
              <motion.div className="space-y-2" variants={fadeInUp}>
                <Label htmlFor="descricao">Descrição</Label>
                <Textarea
                  id="descricao"
                  name="descricao"
                  value={atividade.descricao}
                  onChange={handleInputChange}
                  placeholder="Descreva a atividade"
                  required
                />
              </motion.div>
              <motion.div className="space-y-2" variants={fadeInUp}>
                <Label htmlFor="dataDisponivel">Data Disponível</Label>
                <InputMask
                  mask="99/99/9999"
                  id="dataDisponivel"
                  name="dataDisponivel"
                  value={atividade.dataDisponivel}
                  onChange={handleInputChange}
                  placeholder="dd/mm/aaaa"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                />
                <p className="text-sm text-muted-foreground">
                  Esta é a data em que a atividade ficará visível para os alunos.
                </p>
              </motion.div>
              <motion.div className="space-y-2" variants={fadeInUp}>
                <Label htmlFor="dataLimite">Data de Entrega</Label>
                <InputMask
                  mask="99/99/9999"
                  id="dataLimite"
                  name="dataLimite"
                  value={atividade.dataLimite}
                  onChange={handleInputChange}
                  placeholder="dd/mm/aaaa"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                />
              </motion.div>
              <motion.div variants={fadeInUp}>
                <Button type="submit" className="w-full bg-green-600 hover:bg-green-700">
                  Criar Atividade
                </Button>
              </motion.div>
            </motion.form>
          </CardContent>
          
        </Card>
      </motion.div>
      <ToastContainer position="bottom-right" autoClose={3000} />
      {isLoading && (<Loading/>)}
    </div>
    </div>
  )
}