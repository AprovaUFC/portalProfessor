import React from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../ui/dialog'
import { Label } from '../ui/label'
import { Input } from '../ui/input'
import { Button } from '../ui/button'

interface ModalForgotPasswordProps{
    forgotPasswordModal: boolean,
    setForgotPasswordModal: (value: boolean)=> void,
    handleForgotPassword: (value: React.FormEvent<HTMLFormElement>) => void,
    email: string,
    setEmail: (value: string) => void,
    resetMessage: string

}

const ModalForgotPassword = (props: ModalForgotPasswordProps) => {
  return (
    <Dialog open={props.forgotPasswordModal} onOpenChange={props.setForgotPasswordModal}>
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Recuperar Senha</DialogTitle>
        <DialogDescription>
          Insira seu email para receber instruções de redefinição de senha.
        </DialogDescription>
      </DialogHeader>
      <form onSubmit={props.handleForgotPassword} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="reset-email">Email</Label>
          <Input
            id="reset-email"
            type="email"
            value={props.email}
            onChange={(e) => props.setEmail(e.target.value)}
            required
            className="border-green-300 focus:border-green-500 focus:ring-green-500"
          />
        </div>
        <Button type="submit" className="w-full bg-green-600 hover:bg-green-700">Enviar Email de Recuperação</Button>
      </form>
      {props.resetMessage && (
        <p className="mt-4 text-green-500 text-sm">{props.resetMessage}</p>
      )}
    </DialogContent>
  </Dialog>
  )
}

export default ModalForgotPassword