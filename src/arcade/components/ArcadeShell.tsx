import { useEffect, useState, type ReactNode } from 'react';
import { useArcadeTheme, useDental, useKitMessages, useLang } from '../hooks';
import { applyUrlPrefs, cleanPrefParamsFromUrl, withPrefs } from '../prefs';
import { ARCADE_AUTHOR, ARCADE_GAMES, ARCADE_PORTAL_URL, ARCADE_REPO_URL, gameInfo, gameName } from '../registry';
import { ARCADE_KEYS, isKey, shouldIgnoreKey } from '../keyboard';
import type { ArcadeGameId } from '../types';
import { Tooth } from './DentalIcons';
import { LangMenu } from './LangMenu';

/**
 * Page chrome for a game running on its own (outside the portal): the same
 * brand bar, language, dental mode and theme toggles and typography as
 * Zoltan's Arcade, plus links to the sibling games and the portal.
 */
export function ArcadeShell({ gameId, children }: { gameId: ArcadeGameId; children: ReactNode }) {
  // `?lang=` / `?dental=` hand-off, applied once before any hook below reads the prefs.
  // Silent: it persists the values (or keeps them in memory) and updates <html>, but
  // emits no event, so nothing can re-render another component during this render.
  // Then the params leave the address bar, so a reload cannot undo a later switch.
  useState(() => {
    applyUrlPrefs(undefined, { silent: true });
    cleanPrefParamsFromUrl();
    return true;
  });
  const game = gameInfo(gameId);
  const [theme, , toggleTheme] = useArcadeTheme();
  const [lang, setLang] = useLang();
  const [dental, setDental] = useDental();
  const t = useKitMessages();
  const name = gameName(gameId, lang);
  const portalHref = withPrefs(ARCADE_PORTAL_URL, { lang, dental });

  useEffect(() => {
    document.title = `${name} · Zoltan's Arcade`;
  }, [name]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (shouldIgnoreKey(e)) return;
      if (isKey(e, ARCADE_KEYS.theme)) toggleTheme();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [toggleTheme]);

  const [partBefore, partAfter = ''] = t('partOf').split('{link}');

  return (
    <div className="arc-page" style={{ ['--game-color' as string]: `var(${game.colorVar})` }}>
      <header className="arc-topbar">
        <a className="arc-brand" href={portalHref} title={t('openArcade')}>
          <span className="arc-brand__logo" aria-hidden="true">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <rect x="3" y="7" width="18" height="11" rx="4" />
              <path d="M8 11v3M6.5 12.5h3M15 12h.01M17.5 13.5h.01" />
            </svg>
          </span>
          <span className="arc-brand__text">
            <strong>Zoltan&apos;s Arcade</strong>
            <span>{name}</span>
          </span>
        </a>

        <nav className="arc-topbar__nav" aria-label={t('otherGames')}>
          <details className="arc-menu">
            <summary className="arc-btn arc-btn--ghost">{t('moreGames')}</summary>
            <ul className="arc-menu__list">
              {ARCADE_GAMES.filter((g) => g.id !== gameId).map((g) => (
                <li key={g.id}>
                  <a href={g.repo} target="_blank" rel="noreferrer" style={{ ['--game-color' as string]: `var(${g.colorVar})` }}>
                    <span className="arc-menu__swatch" aria-hidden="true" />
                    {gameName(g.id, lang)}
                    <small>{g.tag}</small>
                  </a>
                </li>
              ))}
            </ul>
          </details>
          <a className="arc-btn arc-btn--ghost" href={portalHref}>
            {t('playAll')}
          </a>
          <button
            type="button"
            className={`arc-dental-toggle${dental ? ' arc-dental-toggle--on' : ''}`}
            aria-pressed={dental}
            aria-label={t('dental')}
            onClick={() => setDental(!dental)}
            title={t('dentalDesc')}
          >
            <span className="arc-dental-toggle__icon" aria-hidden="true">
              <Tooth size={18} />
              {dental && (
                <svg className="arc-dental-toggle__check" width="10" height="10" viewBox="0 0 10 10">
                  <path d="M1.5 5.2 4 7.6 8.6 2.4" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              )}
            </span>
            <span className="arc-dental-toggle__label">{t('dental')}</span>
          </button>
          <LangMenu lang={lang} onPick={setLang} label={t('language')} />
          <button
            type="button"
            className="arc-icon-btn"
            onClick={toggleTheme}
            aria-label={theme === 'dark' ? t('switchToLight') : t('switchToDark')}
            title={t('toggleTheme')}
          >
            {theme === 'dark' ? (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
                <circle cx="12" cy="12" r="4" />
                <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
              </svg>
            ) : (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round">
                <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" />
              </svg>
            )}
          </button>
        </nav>
      </header>

      <main className="arc-page__main">{children}</main>

      <footer className="arc-footer">
        <a href={game.repo} target="_blank" rel="noreferrer">
          {t('onGitHub', { name })}
        </a>
        <span aria-hidden="true">·</span>
        <span>
          {partBefore}
          <a href={ARCADE_REPO_URL} target="_blank" rel="noreferrer">
            Arcade-Game-Center
          </a>
          {partAfter}
        </span>
        <span aria-hidden="true">·</span>
        <span>{t('license', { author: ARCADE_AUTHOR })}</span>
      </footer>
    </div>
  );
}
