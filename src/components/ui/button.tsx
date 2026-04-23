'use client'

import { useFormStatus } from 'react-dom'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'ghost'
  loading?: boolean
}

export function Button({ variant = 'primary', loading, children, className = '', ...props }: ButtonProps) {
  const base = 'w-full h-12 rounded-lg font-display font-bold text-sm tracking-wide transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed'

  const variants = {
    primary: 'bg-green text-void hover:brightness-110 active:scale-[0.98]',
    ghost: 'bg-transparent text-slate border border-surface hover:border-slate',
  }

  return (
    <button
      className={`${base} ${variants[variant]} ${className}`}
      disabled={loading || props.disabled}
      {...props}
    >
      {loading ? <span className="opacity-60">Aguarde...</span> : children}
    </button>
  )
}

export function SubmitButton({ children, ...props }: Omit<ButtonProps, 'loading'>) {
  const { pending } = useFormStatus()
  return <Button loading={pending} {...props}>{children}</Button>
}
