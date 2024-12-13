import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../ui/dialog'

interface ModalSignUpProps{
    showModal: boolean,
    setShowModal: (value: boolean) => void
}

const ModalSignUp = (props: ModalSignUpProps) => {
  return (
    <Dialog open={props.showModal} onOpenChange={props.setShowModal}>
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Cadastro Realizado!</DialogTitle>
          <DialogDescription>
            Verifique a caixa de mensagens do email inserido no cadastro para confirmar o email.
          </DialogDescription>
      </DialogHeader>
    </DialogContent>
  </Dialog>

  )
}

export default ModalSignUp