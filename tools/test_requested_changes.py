#!/usr/bin/env python3
"""Static regression checks for the requested pricing/contact-form changes.

Run from the repository root (or from any directory):
    python3 -m unittest tools.test_requested_changes -v

The reference is always the committed baseline b66e3c8; no build or network
operation is performed by this module.
"""
from __future__ import annotations

import json
import re
import subprocess
import unittest
from pathlib import Path
from typing import Iterable

from bs4 import BeautifulSoup

ROOT = Path(__file__).resolve().parents[1]
BASELINE = "b66e3c8"
LOCALES = ("en", "ar", "fr", "hi")
HOME_PAGES = ("index.html", "ar/index.html", "fr/index.html", "hi/index.html")
WORK_PAGES = ("works.html", "ar/works.html", "fr/works.html", "hi/works.html")
PLAN_KEYS = (
    "homeText60", "homeText68", "homeText76",
    "homeText84", "homeText92", "homeText100",
)
CTA_KEYS = (
    "homeText67", "homeText75", "homeText83",
    "homeText91", "homeText99", "homeText107",
)
PLAN_VALUES = (
    "monthly_essential", "monthly_pro_max", "monthly_custom",
    "once_essential", "once_pro_max", "once_custom",
)
# These are the only old catalog entries deliberately removed.
REMOVED_KEYS = {
    "option_m_under_40", "option_m_40_60",
    "option_once_130_180", "option_once_180_300",
}
NEW_KEYS = {
    "existingSiteLabel", "existingSiteHint", "placeholder_existingWebsite",
    "planMonthlyEssential", "planMonthlyProMax", "planMonthlyCustom",
    "planOnceEssential", "planOnceProMax", "planOnceCustom",
}
CHANGED_KEYS = {
    "homeText68", "homeText75", "homeText76", "homeText83",
    "homeText92", "homeText99", "homeText100", "homeText107", "homeText154",
    *NEW_KEYS,
    *REMOVED_KEYS,
}


def git_baseline(path: str) -> str:
    return subprocess.check_output(
        ["git", "show", f"{BASELINE}:{path}"], cwd=ROOT, text=True
    )


def read_current(path: str) -> str:
    return (ROOT / path).read_text(encoding="utf-8")


def soup(text: str) -> BeautifulSoup:
    return BeautifulSoup(text, "html.parser")


def attrs_without(tag, *excluded: str) -> dict:
    return {k: v for k, v in tag.attrs.items() if k not in excluded}


def js_catalog(text: str) -> dict[str, dict[str, str]]:
    """Parse the JSON-shaped locale object without executing site JavaScript."""
    match = re.search(r"window\.ARH_LOCALES\s*=\s*(\{.*?\})\s*;?\s*$", text, re.S)
    if not match:
        raise AssertionError("assets/home-locales.js has no parseable ARH_LOCALES object")
    return json.loads(match.group(1))


def catalog_current() -> dict[str, dict[str, str]]:
    return js_catalog(read_current("assets/home-locales.js"))


def catalog_baseline() -> dict[str, dict[str, str]]:
    return js_catalog(git_baseline("assets/home-locales.js"))


def normalized_text(tag) -> str:
    return " ".join(tag.get_text(" ", strip=True).split())


class RequestedChangesRegression(unittest.TestCase):
    maxDiff = None

    def test_all_four_home_documents_are_built(self):
        """A missing generated page is a clear not-ready failure, not a skip."""
        for path in HOME_PAGES:
            self.assertTrue((ROOT / path).is_file(), f"generated page not ready: {path}")
            self.assertIn("<html", read_current(path).lower(), f"not HTML: {path}")

    def test_pricing_headings_order_and_catalog_values(self):
        catalogs = catalog_current()
        for path, locale in zip(HOME_PAGES, LOCALES):
            doc = soup(read_current(path))
            headings = doc.select(".plans .plan h3")
            self.assertEqual(len(headings), 6, path)
            self.assertEqual([h.get("data-i18n") for h in headings], list(PLAN_KEYS), path)
            renamed = {"en": ("Pro Max", "Custom"), "ar": ("برو ماكس", "مخصص"),
                       "fr": ("Pro Max", "Sur mesure"), "hi": ("प्रो मैक्स", "कस्टम")}
            middle, top = renamed[locale]
            self.assertEqual([normalized_text(headings[i]) for i in (1, 4)], [middle, middle], path)
            self.assertEqual([normalized_text(headings[i]) for i in (2, 5)], [top, top], path)
            self.assertEqual(
                [normalized_text(h) for h in headings],
                [re.sub(r"<[^>]+>", "", catalogs[locale][k]).strip() for k in PLAN_KEYS],
                path,
            )

    def test_prices_and_features_are_identical_to_baseline(self):
        for path in HOME_PAGES:
            current, baseline = soup(read_current(path)), soup(git_baseline(path))
            self.assertEqual(
                [x.decode_contents() for x in current.select(".plans .price")],
                [x.decode_contents() for x in baseline.select(".plans .price")], path,
            )
            self.assertEqual(
                [[x.decode_contents() for x in p.select("li")] for p in current.select(".plans .plan")],
                [[x.decode_contents() for x in p.select("li")] for p in baseline.select(".plans .plan")], path,
            )

    def test_six_ctas_have_required_plan_values_and_preserve_href_class(self):
        catalogs = catalog_current()
        for path in HOME_PAGES:
            locale = LOCALES[HOME_PAGES.index(path)]
            current, baseline = soup(read_current(path)), soup(git_baseline(path))
            buttons, old_buttons = current.select(".plans .plan .btn"), baseline.select(".plans .plan .btn")
            self.assertEqual(len(buttons), 6, path)
            self.assertEqual([b.get("data-plan") for b in buttons], list(PLAN_VALUES), path)
            self.assertEqual([(b.get("href"), b.get("class")) for b in buttons],
                             [(b.get("href"), b.get("class")) for b in old_buttons], path)
            self.assertEqual([b.get("data-i18n") for b in buttons], list(CTA_KEYS), path)
            self.assertEqual(
                [normalized_text(b) for b in buttons],
                [re.sub(r"<[^>]+>", "", catalogs[locale][k]).strip() for k in CTA_KEYS],
                path,
            )

    def test_form_budget_options_and_localized_keys(self):
        catalogs = catalog_current()
        expected_values = list(PLAN_VALUES) + ["unsure"]
        for path, locale in zip(HOME_PAGES, LOCALES):
            doc = soup(read_current(path))
            budget = doc.select_one("#budget")
            self.assertIsNotNone(budget, path)
            label = doc.select_one('label[for="budget"]')
            self.assertIsNotNone(label, path)
            self.assertEqual(label.get("data-i18n"), "homeText154", path)
            options = budget.select("option")
            self.assertEqual([o.get("value") for o in options], expected_values, path)
            self.assertEqual([o.get("data-i18n") for o in options], [
                "planMonthlyEssential", "planMonthlyProMax", "planMonthlyCustom",
                "planOnceEssential", "planOnceProMax", "planOnceCustom", "option_unsure",
            ], path)
            for key in ("homeText154", "planMonthlyEssential", "planMonthlyProMax",
                        "planMonthlyCustom", "planOnceEssential", "planOnceProMax",
                        "planOnceCustom", "option_unsure"):
                self.assertIn(key, catalogs[locale], f"{locale}: {key}")

    def test_existing_website_field_and_project_controls(self):
        for path in HOME_PAGES:
            doc = soup(read_current(path))
            field = doc.select_one("#existingWebsiteField")
            self.assertIsNotNone(field, path)
            self.assertIn("field", field.get("class", []), path)
            self.assertTrue(field.has_attr("hidden"), path)
            inp = doc.select_one("#existingWebsite")
            self.assertIsNotNone(inp, path)
            self.assertTrue(inp.has_attr("disabled"), path)
            self.assertEqual({k: inp.get(k) for k in ("name", "type", "inputmode", "autocomplete", "dir", "aria-describedby")}, {
                "name": "existing_website", "type": "url", "inputmode": "url",
                "autocomplete": "url", "dir": "ltr",
                "aria-describedby": "existingWebsiteHint",
            }, path)
            for value in ("https://example.com", "http://example.com", "HTTPS://example.com"):
                self.assertIsNotNone(re.fullmatch(inp["pattern"], value), (path, value))
            for value in ("ftp://example.com", "example.com", "javascript:alert(1)"):
                self.assertIsNone(re.fullmatch(inp["pattern"], value), (path, value))
            label = doc.select_one('label[for="existingWebsite"]')
            self.assertIsNotNone(label, path)
            self.assertEqual(label.get("data-i18n"), "existingSiteLabel", path)
            hint = doc.select_one("#existingWebsiteHint")
            self.assertIsNotNone(hint, path)
            self.assertEqual(hint.get("data-i18n"), "existingSiteHint", path)
            project = doc.select_one("#projectType")
            self.assertIsNotNone(project, path)
            self.assertEqual(project.get("aria-controls"), "existingWebsiteField", path)

    def test_contact_script_is_deferred_on_all_home_pages(self):
        for path in HOME_PAGES:
            doc = soup(read_current(path))
            scripts = [s for s in doc.select('script[src="assets/contact-form.js"], script[src="/assets/contact-form.js"]')]
            self.assertEqual(len(scripts), 1, path)
            self.assertTrue(scripts[0].has_attr("defer"), path)

    def test_form_contract_and_preexisting_control_attributes_remain(self):
        for path in HOME_PAGES:
            current, baseline = soup(read_current(path)), soup(git_baseline(path))
            cf, bf = current.select_one("form#contactForm"), baseline.select_one("form#contactForm")
            self.assertEqual((cf.get("action"), cf.get("method")), (bf.get("action"), bf.get("method")), path)
            def hidden(f):
                return [(x.name, x.attrs) for x in f.select('input[type="hidden"]')]
            self.assertEqual(hidden(cf), hidden(bf), path)
            self.assertEqual(current.select_one('button[type="submit"]').attrs,
                             baseline.select_one('button[type="submit"]').attrs, path)
            for cid in ("name", "email", "projectType", "budget", "promoCode", "message"):
                now, old = current.select_one(f"#{cid}"), baseline.select_one(f"#{cid}")
                self.assertEqual(attrs_without(now, "aria-controls"), attrs_without(old, "aria-controls"), f"{path} #{cid}")

    def test_catalog_diff_is_allowlisted(self):
        old, new = catalog_baseline(), catalog_current()
        self.assertEqual(set(old), set(new))
        for locale in LOCALES:
            old_keys, new_keys = set(old[locale]), set(new[locale])
            self.assertEqual(old_keys - new_keys, REMOVED_KEYS, locale)
            self.assertEqual(new_keys - old_keys, NEW_KEYS, locale)
            for key in old_keys & new_keys:
                if key not in CHANGED_KEYS:
                    self.assertEqual(new[locale][key], old[locale][key], f"{locale}.{key}")

    def test_stylesheets_and_works_pages_are_byte_for_byte_baseline(self):
        for path in WORK_PAGES:
            self.assertEqual(read_current(path), git_baseline(path), path)
        self.assertEqual(read_current("assets/i18n.css"), git_baseline("assets/i18n.css"))
        for path in HOME_PAGES:
            now, old = soup(read_current(path)), soup(git_baseline(path))
            self.assertEqual([x.decode_contents() for x in now.select("style")],
                             [x.decode_contents() for x in old.select("style")], path)

    def test_metadata_and_jsonld_are_unchanged_on_all_eight_pages(self):
        for path in (*HOME_PAGES, *WORK_PAGES):
            now, old = soup(read_current(path)), soup(git_baseline(path))
            self.assertEqual([str(x) for x in now.select("head meta, head link[rel=canonical]")],
                             [str(x) for x in old.select("head meta, head link[rel=canonical]")], path)
            self.assertEqual([x.decode_contents() for x in now.select('script[type="application/ld+json"]')],
                             [x.decode_contents() for x in old.select('script[type="application/ld+json"]')], path)


if __name__ == "__main__":
    unittest.main()
