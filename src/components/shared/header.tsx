'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Atom, Menu, X, Bell } from 'lucide-react';
import { Button } from '../ui/button';
import { navLinks } from '@/lib/data';

interface HeaderProps {
  variant?: 'landing' | 'dashboard';
}

export function Header({ variant = 'landing' }: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 right-0 bg-white/95 backdrop-blur-sm border-b border-[#0B2A4A]/8 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <Atom className="h-7 w-7 text-[#00A3E0]" />
            <span className="text-xl font-bold text-[#0B2A4A]">AtomPath</span>
          </Link>

          {variant === 'landing' ? (
            <>
              {/* Desktop Navigation */}
              <nav className="hidden md:flex items-center gap-8">
                {navLinks.map((link) => (
                  <a
                    key={link.href}
                    href={link.href}
                    className="text-[#1F2933]/70 hover:text-[#0B2A4A] text-sm font-medium transition-colors"
                  >
                    {link.label}
                  </a>
                ))}
              </nav>

              {/* Desktop CTA */}
              <div className="hidden md:flex items-center gap-4">
                <Link href="/login" className="text-sm font-medium text-[#1F2933]/70 hover:text-[#0B2A4A] transition-colors">
                  Войти
                </Link>
                <Link href="/dashboard">
                  <Button variant="primary" size="sm">
                    Пройти оценку
                  </Button>
                </Link>
              </div>

              {/* Mobile Menu Button */}
              <button
                className="md:hidden p-2 text-[#1F2933] hover:bg-[#F4F7FA] rounded-lg transition-colors"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                aria-label="Переключить меню"
              >
                {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </>
          ) : (
            /* Dashboard Header Right */
            <div className="flex items-center gap-4">
              <button className="relative p-2 text-[#1F2933]/60 hover:text-[#0B2A4A] hover:bg-[#F4F7FA] rounded-lg transition-colors">
                <Bell className="h-5 w-5" />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#00A3E0] rounded-full" />
              </button>
              <div className="w-9 h-9 rounded-full bg-[#00A3E0] flex items-center justify-center text-white text-sm font-medium">
                AP
              </div>
            </div>
          )}
        </div>

        {/* Mobile Menu */}
        {variant === 'landing' && mobileMenuOpen && (
          <div className="md:hidden border-t border-[#0B2A4A]/8 py-4 space-y-3">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="block px-3 py-2 text-[#1F2933]/70 hover:text-[#0B2A4A] text-sm font-medium transition-colors rounded-lg hover:bg-[#F4F7FA]"
                onClick={() => setMobileMenuOpen(false)}
              >
                {link.label}
              </a>
            ))}
            <div className="px-3 pt-2 space-y-2">
              <Link href="/login" className="block text-center text-sm font-medium text-[#1F2933]/70 py-2 hover:bg-[#F4F7FA] rounded-lg" onClick={() => setMobileMenuOpen(false)}>
                Войти
              </Link>
              <Link href="/dashboard" onClick={() => setMobileMenuOpen(false)}>
                <Button variant="primary" size="sm" className="w-full">
                  Пройти оценку
                </Button>
              </Link>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
