import React from 'react'
import Button from './Button'

export default function RegisterForm() {
  return (
    <form className="max-w-md mx-auto bg-white p-6 rounded-md shadow-sm">
      <h2 className="text-xl font-semibold mb-4">Create an account</h2>
      <label className="block mb-2">
        <span className="text-sm">Name</span>
        <input className="mt-1 block w-full border rounded px-3 py-2" type="text" />
      </label>
      <label className="block mb-2">
        <span className="text-sm">Email</span>
        <input className="mt-1 block w-full border rounded px-3 py-2" type="email" />
      </label>
      <label className="block mb-4">
        <span className="text-sm">Password</span>
        <input className="mt-1 block w-full border rounded px-3 py-2" type="password" />
      </label>
      <Button variant="primary">Register</Button>
    </form>
  )
}
