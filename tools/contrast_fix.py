"""The approved text-contrast edit, expressed as exact string replacements.

Older baseline commits are compared with today's pages in several regression
tests. Those tests must keep failing for any *unapproved* style change, so
instead of loosening them, the baseline is passed through this module first: it
applies only the contrast edit (darker orange for text, three near-invisible
labels in dark ink, 10-11px text raised to 11-12px). Everything else must
still match the baseline byte for byte.
"""
from __future__ import annotations

TOKENS_OLD = ':root{--ink:#111827;--cream:#fffaf0;--orange:#ff6b35;'
TOKENS_NEW = TOKENS_OLD + '--orange-text:#b84d26;--orange-text-lg:#e05e2f;--orange-on-yellow:#9e4221;'
DARK_OLD = 'html[data-theme=dark]{--ink:#f5f2ea;--cream:#14151a;--muted:#a8adba;--line:#30333d;--card:#1d1f26}'
DARK_NEW = DARK_OLD[:-1] + ';--orange-text:#ff6b35;--orange-text-lg:#ff6b35;--orange-on-yellow:#9e4221}'
LOGO_OLD = '.logo b,.eyebrow{color:var(--orange)}'
HOVER_OLD = '.links a:hover{color:var(--orange)}'
HOVER_NEW = '.links a:hover{color:var(--orange-text)}'

HOME = [
    (TOKENS_OLD, TOKENS_NEW), (DARK_OLD, DARK_NEW),
    (LOGO_OLD, '.logo b{color:var(--orange-text-lg)}.eyebrow{color:var(--orange-text)}'
               '.studio-feature .eyebrow{color:var(--orange-on-yellow)}.cta-box .eyebrow{color:#111827}'
               '.project:first-child{--orange-text-lg:#e05e2f}'),
    (HOVER_OLD, HOVER_NEW),
    ('h1 span{color:var(--orange)}', 'h1 span{color:var(--orange-text-lg)}'),
    ('.project h3 em{font-style:normal;color:var(--orange)}', '.project h3 em{font-style:normal;color:var(--orange-text-lg)}'),
    ('.section-break span{color:var(--orange);', '.section-break span{color:var(--orange-text-lg);'),
    ('font-style:normal;color:var(--orange)}', 'font-style:normal;color:#111827}'),
    ('.maker-credit{color:var(--orange);', '.maker-credit{color:var(--orange-text);'),
    ('.announce{font-size:11px;padding:9px 12px}', '.announce{font-size:12px;padding:9px 12px}'),
    ('.email-hero span{font-size:11px;', '.email-hero span{font-size:12px;'),
    ('.insta-link .insta-kicker{font-size:10px;', '.insta-link .insta-kicker{font-size:11px;'),
    ('.field label{display:block;font-size:11px;', '.field label{display:block;font-size:12px;'),
    ('.copy-email-btn{padding:7px 11px;font-size:11px}', '.copy-email-btn{padding:9px 13px;font-size:12px}'),
]

SUBPAGE = [
    (TOKENS_OLD, TOKENS_NEW), (DARK_OLD, DARK_NEW),
    (LOGO_OLD, '.logo b{color:var(--orange-text-lg)}.eyebrow{color:var(--orange-text)}.offer-box .eyebrow{color:#111827}'),
    (HOVER_OLD, HOVER_NEW),
    ('.count b{display:block;color:var(--orange);', '.count b{display:block;color:var(--orange-text-lg);'),
    ('.case h2 span{color:var(--orange)}', '.case h2 span{color:var(--orange-text-lg)}'),
    ('.frame-note a{color:var(--orange);', '.frame-note a{color:var(--orange-text);'),
    ('.policy p a:hover{color:var(--orange)}', '.policy p a:hover{color:var(--orange-text)}'),
    ('.eyebrow{font-size:11px;', '.eyebrow{font-size:12px;'),
    ('.count span{font-size:11px;', '.count span{font-size:12px;'),
    ('padding:7px 13px;font-size:11px;font-weight:900}', 'padding:7px 13px;font-size:12px;font-weight:900}'),
    ('color:var(--muted);font-size:11px}', 'color:var(--muted);font-size:12px}'),
]

I18N_CSS = [
    ('.nav-instagram:hover { color: var(--orange); }', '.nav-instagram:hover { color: var(--orange-text); }'),
    ('.privacy-link:hover { color: var(--orange); }', '.privacy-link:hover { color: var(--orange-text); }'),
]


def contrast_baseline(text: str, path: str) -> str:
    """Return a baseline HTML/CSS file with only the approved contrast edit applied."""
    if path.endswith('i18n.css'):
        pairs = I18N_CSS
    elif path.endswith('.html'):
        pairs = SUBPAGE if '.case h2 span' in text else HOME
    else:
        return text
    for old, new in pairs:
        text = text.replace(old, new)
    return text
