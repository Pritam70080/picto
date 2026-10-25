import { AuthForm } from '@/components/auth/auth-form'
import { CardDescription, CardTitle } from '@/components/ui/card'
import React from 'react'

const SignUpPage = () => {
  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <CardTitle className="text-lg">Create account</CardTitle>
        <CardDescription>Start organizing your photos in one place</CardDescription>
      </div>
      <AuthForm mode="signup" />
    </div>
  )
}

export default SignUpPage