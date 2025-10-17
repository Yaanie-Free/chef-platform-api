import React from 'react'
import Button from './Button'

export default function LoginForm() {
  return (
    <form className="max-w-md mx-auto bg-white p-6 rounded-md shadow-sm">
      <h2 className="text-xl font-semibold mb-4">Login</h2>
      <label className="block mb-2">
        <span className="text-sm">Email</span>
        <input className="mt-1 block w-full border rounded px-3 py-2" type="email" />
      </label>
      <label className="block mb-4">
        <span className="text-sm">Password</span>
        <input className="mt-1 block w-full border rounded px-3 py-2" type="password" />
      </label>
      <Button type="submit">Sign in</Button>
    </form>
  )
}
