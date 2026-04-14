'use client'

type ToastProps = {
  message: string
  type: 'success' | 'error'
}

export default function Toast({ message, type }: ToastProps) {
  return (
    <div
      className={`fixed top-5 right-5 px-4 py-2 rounded shadow text-white z-50
        ${type === 'success' ? 'bg-green-500' : 'bg-red-500'}`}
    >
      {message}
    </div>
  )
}