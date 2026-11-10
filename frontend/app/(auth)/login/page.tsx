import { AuthForm } from '@/components/auth/auth-form'
import { CardDescription, CardTitle } from '@/components/ui/card'
import React from 'react'

const LoginPage = () => {
  return (
    <div className="flex min-h-0 flex-1 flex-col gap-3 [@media(max-height:600px)]:gap-2 [@media(max-height:440px)]:gap-1">
      <div className="space-y-1">
        <CardTitle className="text-lg [@media(max-height:440px)]:hidden">Sign in</CardTitle>
        <CardDescription className="[@media(max-height:520px)]:hidden">Enter your credentials to continue</CardDescription>
      </div>
      <AuthForm mode="login" />
    </div>
  )
}

export default LoginPage