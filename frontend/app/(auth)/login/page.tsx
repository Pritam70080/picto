import { AuthForm } from '@/components/auth/auth-form'
import { CardDescription, CardTitle } from '@/components/ui/card'
import React from 'react'

const LoginPage = () => {
  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <CardTitle className="text-lg">Sign in</CardTitle>
        <CardDescription>Enter your credentials to continue</CardDescription>
      </div>
      <AuthForm mode="login" />
    </div>
  )
}

export default LoginPage