import { Label } from '../ui/label'
import { Input } from '../ui/input'
import { CheckboxWithText } from '../Checkbox/checkboxText'
import { Button } from '../ui/button'
import { Eye, EyeOff } from 'lucide-react'
import { useState } from 'react'

interface SignUpProps{
    email : string,
    setEmail: (value: string) => void,
    name: string,
    setName: (value: string) => void,
    password: string,
    setPassword: (value: string) => void
    isChecked: boolean
    handleCheckboxChange: (value: boolean) => void,
    registerError: string
}

const SignUpSection = (props: SignUpProps) => {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <>
    <div className="space-y-2">
    <Label htmlFor="name">Nome Completo</Label>
    <Input
      id="name"
      type="text"
      value={props.name}
      onChange={(e) => props.setName(e.target.value)}
      required
      className="border-green-300 focus:border-green-500 focus:ring-green-500"
    />
  </div>
  <div className="space-y-2">
    <Label htmlFor="email">E-mail</Label>
    <Input
      id="email"
      type="email"
      value={props.email}
      onChange={(e) => props.setEmail(e.target.value)}
      required
      className="border-green-300 focus:border-green-500 focus:ring-green-500"
    />
  </div>

  <div className="space-y-2">
      <Label htmlFor="newPassword">Senha</Label>
      <div className="relative">
      <Input
        id="newPassword"
        type={showPassword ? "text" : "password"}
        value={props.password}
        onChange={(e) => props.setPassword(e.target.value)}
        required
        className="border-green-300 focus:border-green-500 focus:ring-green-500"
      />
      <button
        type="button"
        onClick={() => setShowPassword((prev) => !prev)}
        className="absolute inset-y-0 right-2 flex items-center text-sm text-gray-500 hover:text-gray-700 focus:outline-none"
        >
        {showPassword ? <Eye/> : <EyeOff/>}
      </button>
      </div>
    </div>

  <CheckboxWithText
    handleCheckboxChange={props.handleCheckboxChange}
    isChecked={props.isChecked}
  />
   {props.registerError && (
    <p className='text-red-500 text-sm'>
        {props.registerError}
    </p>
    )}  
  <Button type="submit" className="w-full bg-green-600 hover:bg-green-700">Cadastrar</Button>
  </>
  )
}

export default SignUpSection