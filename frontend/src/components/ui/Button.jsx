import { useState } from 'react'
import { X } from 'lucide-react'
import { clsx } from 'clsx'
 
// ─── Button ───────────────────────────────────────────────────────────────────
export function Button({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  onClick,
  className,
  icon: Icon,
}) {
  const sizes = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base',
  }
 
  const base = `inline-flex items-center gap-2 font-semibold rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed relative overflow-hidden`
 
  const variants = {
    primary: {
      background: 'linear-gradient(135deg, #FF6B00, #FF8C38)',
      color: '#fff',
      border: 'none',
    },
    secondary: {
      background: 'transparent',
      color: '#F0F0FF',
      border: '1px solid #2A2A3A',
    },
    purple: {
      background: 'linear-gradient(135deg, #7B2FBE, #9B4FDE)',
      color: '#fff',
      border: 'none',
    },
    ghost: {
      background: 'transparent',
      color: '#6B6B8A',
      border: 'none',
    },
    danger: {
      background: 'transparent',
      color: '#EF4444',
      border: '1px solid rgba(239,68,68,0.3)',
    },
  }
 
  return (
    <button
      onClick={onClick}
      disabled={disabled || loading}
      className={clsx(base, sizes[size], className)}
      style={{
        ...variants[variant],
        fontFamily: 'Syne, sans-serif',
      }}
      onMouseEnter={(e) => {
        if (variant === 'primary') {
          e.currentTarget.style.boxShadow = '0 8px 24px rgba(255,107,0,0.4)'
          e.currentTarget.style.transform = 'translateY(-1px)'
        } else if (variant === 'secondary') {
          e.currentTarget.style.borderColor = '#FF6B00'
          e.currentTarget.style.color = '#FF6B00'
        } else if (variant === 'purple') {
          e.currentTarget.style.boxShadow = '0 8px 24px rgba(123,47,190,0.4)'
          e.currentTarget.style.transform = 'translateY(-1px)'
        }
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.boxShadow = 'none'
        e.currentTarget.style.transform = 'translateY(0)'
        if (variant === 'secondary') {
          e.currentTarget.style.borderColor = '#2A2A3A'
          e.currentTarget.style.color = '#F0F0FF'
        }
      }}
    >
      {loading ? (
        <span
          className="w-4 h-4 border-2 rounded-full animate-spin flex-shrink-0"
          style={{ borderColor: 'currentColor', borderTopColor: 'transparent' }}
        />
      ) : Icon ? (
        <Icon size={size === 'sm' ? 13 : size === 'lg' ? 18 : 15} />
      ) : null}
      {children}
    </button>
  )
}
 
// ─── Toggle ───────────────────────────────────────────────────────────────────
export function Toggle({ checked, onChange, label }) {
  return (
    <label className="flex items-center gap-3 cursor-pointer">
      <div className="relative">
        <input
          type="checkbox"
          className="sr-only"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
        />
        <div
          className="w-11 h-6 rounded-full transition-all duration-300"
          style={{ background: checked ? '#FF6B00' : '#2A2A3A' }}
        />
        <div
          className="absolute top-0.5 w-5 h-5 rounded-full transition-all duration-300"
          style={{
            background: '#F0F0FF',
            left: checked ? '22px' : '2px',
            boxShadow: '0 2px 4px rgba(0,0,0,0.3)',
          }}
        />
      </div>
      {label && (
        <span className="text-sm" style={{ color: '#F0F0FF', fontFamily: 'DM Sans, sans-serif' }}>
          {label}
        </span>
      )}
    </label>
  )
}
 
// ─── Badge ────────────────────────────────────────────────────────────────────
export function Badge({ children, variant = 'orange' }) {
  const variants = {
    orange: { background: 'rgba(255,107,0,0.15)', color: '#FF6B00' },
    purple: { background: 'rgba(123,47,190,0.15)', color: '#9B4FDE' },
    green: { background: 'rgba(34,197,94,0.15)', color: '#22C55E' },
    red: { background: 'rgba(239,68,68,0.15)', color: '#EF4444' },
    muted: { background: 'rgba(107,107,138,0.15)', color: '#6B6B8A' },
  }
 
  return (
    <span
      className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold"
      style={{ ...variants[variant], fontFamily: 'Syne, sans-serif' }}
    >
      {children}
    </span>
  )
}
 
// ─── Slider ───────────────────────────────────────────────────────────────────
export function Slider({ value, onChange, min = 0, max = 100, step = 1, label }) {
  return (
    <div className="space-y-2">
      {label && (
        <div className="flex justify-between">
          <span className="text-sm" style={{ color: '#6B6B8A' }}>{label}</span>
          <span className="text-sm font-semibold" style={{ color: '#FF6B00' }}>{value}</span>
        </div>
      )}
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full h-2 rounded-lg appearance-none cursor-pointer"
        style={{
          background: `linear-gradient(to right, #FF6B00 0%, #FF6B00 ${((value - min) / (max - min)) * 100}%, #2A2A3A ${((value - min) / (max - min)) * 100}%, #2A2A3A 100%)`,
        }}
      />
    </div>
  )
}
 
// ─── Modal ────────────────────────────────────────────────────────────────────
export function Modal({ open, onClose, title, children, size = 'md' }) {
  if (!open) return null
 
  const sizes = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
  }
 
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in"
      style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)' }}
      onClick={onClose}
    >
      <div
        className={`w-full ${sizes[size]} rounded-2xl animate-slide-up`}
        style={{
          background: '#1A1A26',
          border: '1px solid #2A2A3A',
          boxShadow: '0 24px 80px rgba(0,0,0,0.6)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          className="flex items-center justify-between p-5"
          style={{ borderBottom: '1px solid #2A2A3A' }}
        >
          <h3
            className="text-lg font-bold"
            style={{ fontFamily: 'Syne, sans-serif', color: '#F0F0FF' }}
          >
            {title}
          </h3>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg transition-colors"
            style={{ color: '#6B6B8A' }}
            onMouseEnter={(e) => (e.currentTarget.style.color = '#F0F0FF')}
            onMouseLeave={(e) => (e.currentTarget.style.color = '#6B6B8A')}
          >
            <X size={18} />
          </button>
        </div>
        <div className="p-5">{children}</div>
      </div>
    </div>
  )
}
 
// ─── Input ────────────────────────────────────────────────────────────────────
export function Input({ label, placeholder, value, onChange, type = 'text', icon: Icon }) {
  return (
    <div className="space-y-1.5">
      {label && (
        <label
          className="text-xs font-semibold uppercase tracking-wider"
          style={{ color: '#6B6B8A', fontFamily: 'Syne, sans-serif' }}
        >
          {label}
        </label>
      )}
      <div className="relative">
        {Icon && (
          <Icon
            size={15}
            className="absolute left-3 top-1/2 -translate-y-1/2"
            style={{ color: '#6B6B8A' }}
          />
        )}
        <input
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full rounded-lg text-sm outline-none transition-all"
          style={{
            background: '#12121A',
            border: '1px solid #2A2A3A',
            color: '#F0F0FF',
            padding: Icon ? '10px 12px 10px 36px' : '10px 12px',
            fontFamily: 'DM Sans, sans-serif',
          }}
          onFocus={(e) => (e.currentTarget.style.borderColor = '#FF6B00')}
          onBlur={(e) => (e.currentTarget.style.borderColor = '#2A2A3A')}
        />
      </div>
    </div>
  )
}
 