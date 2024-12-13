import { Label } from '../ui/label'
import { Input } from '../ui/input'
import { Button } from '../ui/button'

interface LoginSectionProps{
    email: string,
    setEmail: (value: string) => void,
    password: string,
    setPassword: (value:string)=> void,
    loginError: string,

}

const LoginSection = (props: LoginSectionProps) => {
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
    <div className="space-y-2">
        <Label htmlFor="password">Senha</Label>
        <Input
        id="password"
        type="password"
        value={props.password}
        onChange={(e) => props.setPassword(e.target.value)}
        required
        className="border-green-300 focus:border-green-500 focus:ring-green-500"
        />
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