import { Label } from '../ui/label'
import { Input } from '../ui/input'
import { Button } from '../ui/button'
import { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

interface LoginSectionProps{
    email: string,
    setEmail: (value: string) => void,
    password: string,
    setPassword: (value:string)=> void,
    loginError: string,

}

const LoginSection = (props: LoginSectionProps) => {
    const [showPassword, setShowPassword] = useState(false);
  return (
    <>
        <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
            id="email"
            type="email"
            value={props.email}
            onChange={(e) => props.setEmail(e.target.value)}
            required
            className="border-green-300 focus:border-green-500 focus:ring-green-500"
        />
    </div>
    <div className="space-y-2 relative">
        <Label htmlFor="password">Senha</Label>
        <div className="relative">
          <Input
            id="password"
            type={showPassword ? "text" : "password"}
            value={props.password}
            onChange={(e) => props.setPassword(e.target.value)}
            required
            className="border-green-300 focus:border-green-500 focus:ring-green-500 pr-10"
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
    {/* Exibe a mensagem de erro se houver */}
    {props.loginError && (
        <p className="text-red-500 text-sm">
            {props.loginError}
        </p>
        )}
    <Button type="submit" className="w-full bg-green-600 hover:bg-green-700">Entrar</Button>
  </>
  )
}

export default LoginSection