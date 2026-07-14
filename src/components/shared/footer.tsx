import React from 'react';
import { Atom, Globe, ExternalLink, Mail } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-[#0B2A4A] text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Atom className="h-6 w-6 text-[#00A3E0]" />
              <span className="text-lg font-bold">AtomPath</span>
            </div>
            <p className="text-white/60 text-sm leading-relaxed">
              Платформа устойчивой занятости для ядерных регионов. У каждого временного строительного навыка есть второй карьерный путь.
            </p>
          </div>

          {/* Partners */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Партнеры</h4>
            <ul className="space-y-2">
              {['Росатом', 'Альянс технических вузов', 'Региональные учебные центры', 'Министерство занятости'].map(
                (partner) => (
                  <li key={partner}>
                    <a href="#" className="text-white/60 hover:text-white text-sm transition-colors">
                      {partner}
                    </a>
                  </li>
                )
              )}
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Ресурсы</h4>
            <ul className="space-y-2">
              {['Оценка карьеры', 'Программы обучения', 'Прогноз вакансий', 'Истории успеха'].map(
                (resource) => (
                  <li key={resource}>
                    <a href="#" className="text-white/60 hover:text-white text-sm transition-colors">
                      {resource}
                    </a>
                  </li>
                )
              )}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Контакты</h4>
            <ul className="space-y-2 text-sm text-white/60">
              <li className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                contact@atompath.com
              </li>
              <li>+7 (800) 123-4567</li>
            </ul>
            <div className="flex items-center gap-3 mt-4">
              <a href="#" className="text-white/60 hover:text-white transition-colors">
                <Globe className="h-5 w-5" />
              </a>
              <a href="#" className="text-white/60 hover:text-white transition-colors">
                <ExternalLink className="h-5 w-5" />
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-white/10 mt-12 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-white/40 text-sm">© 2025 AtomPath. Все права защищены.</p>
          <div className="flex items-center gap-4 text-sm text-white/40">
            <a href="#" className="hover:text-white transition-colors">Политика конфиденциальности</a>
            <span>·</span>
            <a href="#" className="hover:text-white transition-colors">Условия использования</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
