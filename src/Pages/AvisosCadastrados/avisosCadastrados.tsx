"use client"

import { useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { FileText, Download, Image as ImageIcon } from "lucide-react"
import NavBarComponent from "@/components/NavBarComponent/NavBarComponent"
import { supabase } from "@/lib/supabase"
import Loading from "components/Loading/Loading"

type Aviso = {
  id: number
  professor_id: { nome: string, perfil: string }[] // Espera-se um único professor
  descricao: string
  arquivos: string // Deve ser uma URL de arquivo
  imagem: string // Deve ser uma URL de imagem
  created_at: string // Deixe como string pois vem do banco de dados no formato ISO
}

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  exit: { opacity: 0, y: -20, transition: { duration: 0.5 } }
}

export default function AvisosCadastrados() {
  const [avisos, setAvisos] = useState<Aviso[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchAvisos = async () => {
      try {
        const { data, error } = await supabase
          .from('Avisos')
          .select(`id, professor_id (nome,perfil), descricao, imagem, arquivos, created_at`)
          .order('created_at', { ascending: false }) // Ordena pela data de criação em ordem decrescente
  
        if (error) {
          console.log('Erro', error)
        } else {
          setAvisos(data)
        }
      } catch (err) {
        console.log(err)
      } finally {
        setIsLoading(false)
      }
    }
    fetchAvisos()
  }, [])
  
  

  return (
    <div className="flex h-screen bg-green-50 overflow-y-hidden">
      
      <div className="max-sm:w-3">
        <NavBarComponent />
      </div>
      <div className="flex-grow bg-green-50 overflow-auto">
        {/* <header className="bg-green-50 p-4 text-green-600">
          <h1 className="text-2xl font-bold text-center">Avisos e Materiais</h1>
        </header> */}
        {isLoading && (<Loading/>)}
        <ScrollArea className="h-full">
          <div className="bg-green-50 pl-10 max-sm:pr-5 pt-8">
            <AnimatePresence>
              {avisos.map((aviso: any) => (
                <motion.div
                  key={aviso.id}
                  variants={fadeInUp}
                  transition={{ duration: 0.3 }}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  layout
                  className="mb-6"
                >
                  <Card className="shadow-lg overflow-hidden max-w-6xl">
                    <CardHeader className="bg-gradient-to-r from-green-600 to-green-500">
                      <div className="flex items-center space-x-4">
                        <Avatar>
                          {aviso.professor_id && aviso.professor_id.perfil ? (
                            <AvatarImage src={aviso.professor_id.perfil}></AvatarImage>
                          ) : (
                            <AvatarFallback>
                              {aviso.professor_id ? aviso.professor_id.nome.charAt(0) : 'P'}
                            </AvatarFallback>
                          )}
                        </Avatar>
                        <div>
                          <CardTitle className="text-white">{aviso.professor_id ? `Professor ${aviso.professor_id.nome}` : "Professor Desconhecido"}</CardTitle>
                          <CardDescription className="text-green-100">
                            {/* Formatando a data com date-fns */}
                            <span>{format(new Date(aviso.created_at), "dd/MM/yyyy HH:mm", { locale: ptBR })}</span>
                          </CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-4">
                      <p className="text-gray-700 mb-4">{aviso.descricao}</p>

                      {aviso.imagem && Array.isArray(aviso.imagem) && aviso.imagem.length > 0 && (
                      <div className="mb-4">
                        <h3 className="font-semibold text-green-700 mb-2">Imagens:</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                          {aviso.imagem.map((url: string, index: number) => (
                            <div key={index} className="relative aspect-video">
                              <img
                                src={url}
                                alt={`Imagem ${index + 1} do aviso`}
                                className="rounded-md object-cover"
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {aviso.arquivos && (
                      <div>
                        <h3 className="font-semibold text-green-700 mb-2">Arquivo disponível:</h3>
                        <div className="flex items-center justify-between bg-green-50 p-2 rounded-md">
                          <div className="flex items-center space-x-2">
                            <FileText className="text-green-600" size={20} />
                            <span className="text-sm text-gray-700">Arquivo</span>
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-green-600 hover:text-green-700 hover:bg-green-100"
                            onClick={() => window.open(aviso.arquivos, '_blank')}
                          >
                            <Download size={16} className="mr-1" />
                            Baixar
                          </Button>
                        </div>
                      </div>
                    )}

                    </CardContent>
                    <CardFooter className="bg-green-50 flex justify-between">
                      <Badge variant="outline" className="text-green-600 border-green-600">
                        {aviso.arquivos ? "1 arquivo" : "Sem materiais"}
                      </Badge>
                      {aviso.imagem && (
                        <Badge variant="outline" className="text-green-600 border-green-600">
                          <ImageIcon size={16} className="mr-1" />
                          1 imagem
                        </Badge>
                      )}
                    </CardFooter>
                  </Card>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </ScrollArea>
      </div>
    </div>
  )
}
