import { useState, useRef, useEffect } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { AlertCircle, FileText, X } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Input } from "@/components/ui/input"
import NavBarComponent from "@/components/NavBarComponent/NavBarComponent"
import { supabase } from "@/lib/supabase"
import Loading from "@/components/Loading/Loading"

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
  transition: { duration: 0.3 }
}

type Arquivo = {
  nome: string
  tipo: "imagem" | "documento"
  url: string
  arquivo: File
}

export default function PaginaAviso() {
  const [conteudo, setConteudo] = useState("")
  const [arquivos, setArquivos] = useState<Arquivo[]>([])
  const [mensagem, setMensagem] = useState<{ tipo: "sucesso" | "erro"; texto: string } | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [professor_id,setProfessor_id] = useState<number>()
  const [isLoading,setIsLoading] = useState(true)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      // Substitui o arquivo existente com o novo
      const file = files[0];
      const tipo: "imagem" | "documento" = file.type.startsWith("image/") ? "imagem" : "documento";
  
      const novoArquivo: Arquivo = {
        
        nome: file.name,
        tipo: tipo,
        url: URL.createObjectURL(file),
        arquivo: file,
      };
  
      setArquivos([novoArquivo]); // Substitui o array de arquivos com o novo arquivo
    }
  };
  

  const removerArquivo = (index: number) => {
    const novosArquivos = [...arquivos];
    URL.revokeObjectURL(novosArquivos[index].url);
    novosArquivos.splice(index, 1);
    setArquivos(novosArquivos);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
  
    if (!conteudo.trim()) {
      setMensagem({ tipo: "erro", texto: "Por favor, adicione uma descrição para o aviso." });
      return;
    }
  
    try {
      let imagemUrl = "";
      let arquivoUrl = "";
      setIsLoading(true);
  
      // Upload dos arquivos
      if (arquivos && arquivos.length > 0) {
        const arquivo = arquivos[0];
        const uniqueFileName = `${arquivo.nome}`;
        const { data, error } = await supabase.storage
          .from("arq_avisos")
          .upload(uniqueFileName, arquivo.arquivo);
  
        if (error) throw error;
  
        if (data) {
          const { data: publicURL } = supabase.storage
            .from("arq_avisos")
            .getPublicUrl(uniqueFileName);
  
          if (publicURL?.publicUrl) {
            if (arquivo.tipo === "imagem") {
              imagemUrl = publicURL.publicUrl;
            } else {
              arquivoUrl = publicURL.publicUrl;
            }
          }
        }
      }
  
      // Inserir o aviso no Supabase com as URLs das imagens e arquivos
      const { error } = await supabase.from("Avisos").insert({
        descricao: conteudo,
        imagem: imagemUrl || null, // Apenas uma URL de imagem ou null
        arquivos: arquivoUrl || null, // Apenas uma URL de arquivo ou null
        professor_id: professor_id,
      });
  
      if (error) throw error;
  
      setMensagem({ tipo: "sucesso", texto: "Aviso publicado com sucesso!" });
  
      // Limpar o formulário
      setConteudo("");
      setArquivos([]);
    } catch (error) {
      console.error("Erro ao enviar o aviso:", error);
      setMensagem({ tipo: "erro", texto: "Erro ao publicar o aviso. Tente novamente." });
    } finally {
      setIsLoading(false);
    }
  };
  
  
  
  
  useEffect(() => {
    const fetchProfessor = async () => {
      try {
        // Obtém o usuário logado
        const { data: { user }, error: userError } = await supabase.auth.getUser();
  
        if (userError) {
          console.log(userError);
          return;
        }
  
        // Pega o email do usuário logado
        const userEmail = user?.email;
  
        // Busca o ID do professor baseado no email
        const { data, error } = await supabase
          .from("Professor")
          .select('id') // Seleciona apenas o ID do professor
          .eq("email", userEmail)
          .single(); // Utiliza single para garantir que um único registro será retornado
  
        if (error) {
          console.log(error);
          return;
        }
  
        // Verifica se encontrou algum ID e seta o estado professor_id
        if (data && data.id) {
          setProfessor_id(data.id); // Armazena o ID do professor no estado
          
        }
  
      } catch (err) {
        console.error("Erro ao buscar o professor:", err);
      }finally{
        setIsLoading(false)
      }
    };
  
    fetchProfessor();
  }, []); 
  

  return (
    <div className="flex h-screen  bg-green-50 max-sm:p-2">
      
      <NavBarComponent/>
      
      <div className="min-h-screen mx-auto bg-green-50  p-4 overflow-auto">
      <motion.div
        className=" max-w-2xl mx-auto pt-10 rounded-3xl  "
        initial="initial"
        animate="animate"
        variants={fadeInUp}
      >
        
        <Card className=" w-full max-w-lg mx-auto rounded-lg " >
        
          <CardHeader className="bg-gradient-to-r from-green-600 to-green-500 rounded-t-lg">
            <CardTitle className="text-2xl text-white text-center">Inserir Novo Aviso</CardTitle>
            <CardDescription className="text-green-100 text-center">
              Crie um novo aviso para os alunos
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
          
            <form onSubmit={handleSubmit}>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="conteudo">Descrição do Aviso</Label>
                  <Textarea
                    id="conteudo"
                    value={conteudo}
                    onChange={(e) => setConteudo(e.target.value)}
                    placeholder="Digite a descrição do aviso"
                    rows={5}
                    className="resize-none"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Anexos</Label>
                  <div className="flex items-center space-x-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => fileInputRef.current?.click()}
                      className="bg-green-100 text-green-700 hover:bg-green-200"
                    >
                      Adicionar Arquivo
                    </Button>
                    <Input
                      type="file"
                      ref={fileInputRef}
                      className="hidden"
                      onChange={handleFileChange}
                      accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx"
                    />

                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mt-4">
                    {arquivos.map((arquivo, index) => (
                      <div key={index} className="relative bg-white p-2 rounded-md shadow">
                        {arquivo.tipo === "imagem" ? (
                          <div className="relative aspect-video">
                          <img
                            src={arquivo.url}
                            alt={arquivo.nome}
                            className="rounded-md object-cover"
                          />
                          </div>
                        ) : (
                          <div className="flex items-center space-x-2">
                            <FileText className="text-green-600" size={24} />
                            <span className="text-sm truncate">{arquivo.nome}</span>
                          </div>
                        )}
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="absolute top-1 right-1 text-red-500 hover:text-red-700"
                          onClick={() => removerArquivo(index)}
                        >
                          <X size={16} />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <Button type="submit" className="w-full mt-6 bg-green-600 hover:bg-green-700">
                Publicar Aviso
              </Button>
            </form>
          </CardContent>
          <CardFooter>
            {mensagem && (
              <motion.div
                className="w-full"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                <Alert variant={mensagem.tipo === "sucesso" ? "default" : "destructive"}>
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>
                    {mensagem.tipo === "sucesso" ? "Sucesso!" : "Erro"}
                  </AlertTitle>
                  <AlertDescription>{mensagem.texto}</AlertDescription>
                </Alert>
              </motion.div>
            )}
          </CardFooter>
        </Card>
        <div className="w-screen max-w-full">
        
        </div>
      </motion.div>
      {isLoading && (<Loading/>)}
      </div>
    </div>
  )
}