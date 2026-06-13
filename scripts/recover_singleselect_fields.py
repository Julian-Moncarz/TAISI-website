#!/usr/bin/env python3
"""
Recovery: a partial run created 16 singleSelect fields with the wrong middle
label ("Neither agree nor disagree"). Airtable can't edit field options or delete
fields via API, so this:
  1. renames any existing singleSelect field that holds a question text out of the
     way (prefix "zzz dup ..."), freeing the name,
  2. creates a fresh, correct singleSelect field per question (middle = "Neutral"),
  3. migrates intake + pulse numeric data into the fresh fields (number -> label),
  4. renames the old star rating fields to "zzz star ..." so all junk is bulk-
     deletable in the Airtable UI by the "zzz" prefix,
  5. prints the fresh field-id map for website/src/lib/survey.ts.

  python3 recover_singleselect_fields.py            # dry run
  python3 recover_singleselect_fields.py --apply
"""
import json
import sys
import time
import urllib.request
import urllib.error

import os
PAT = os.environ["AIRTABLE_PAT"]
BASE = "appVfG77MoQbG3bgi"
OUT = "/Users/julianmoncarz/TAISI/singleselect_field_map.json"
APPLY = "--apply" in sys.argv

AGREEMENT = [
    "Strongly disagree",
    "Slightly disagree",
    "Neutral",
    "Slightly agree",
    "Strongly agree",
]

INTAKE = "tblVi3jowYcdbu4bj"
PULSE = "tblR1zpLyNl0uvnrB"
EXIT = "tblRtd6U9JlpU4rNi"
FOLLOWUP = "tbl3dpgcnDBjrtMOg"
SHORT = {INTAKE: "intake", PULSE: "pulse", EXIT: "exit", FOLLOWUP: "followup"}

FIELDS = {
    INTAKE: [
        ("knowledgeAis", "fldP7E73Mki9WCc00", "I have a solid understanding of AI safety / alignment."),
        ("knowledgeEvals", "fld2rjLXJkUVMhhYx", "I have a solid understanding of AI evaluations."),
        ("knowledgeFt", "fldDo5zEe96L3ZfAV", "I have a solid understanding of fine-tuning / RLHF."),
        ("knowledgeMech", "fldDBnkLTc6aODEW6", "I have a solid understanding of mechanistic interpretability."),
        ("fieldFit", "fldwJXCA4mYlY4oYn", "I'm confident that AI safety is the right field for me."),
        ("careerClarity", "fld10rSnl4aq2p3qq", "I have a clear sense of how I would actually pursue a career in AI safety from where I am today."),
        ("belonging", "fldgteHR2Sjrun6Ke", "I feel like I belong in the AI safety community."),
        ("selfEfficacy", "fld0v0l3NDx1q1Yak", "I could contribute to a real AI safety project today."),
    ],
    PULSE: [
        ("dayNps", "fldDOROuBb2Yzjm4P", "I would recommend today to a friend interested in AI safety."),
    ],
    EXIT: [
        ("knowledgeAis", "flddUpfzMyqTJgOKZ", "I have a solid understanding of AI safety / alignment."),
        ("knowledgeEvals", "fldp6ejLuiQbsC0F9", "I have a solid understanding of AI evaluations."),
        ("knowledgeFt", "fldltFhHUQo6t7wQP", "I have a solid understanding of fine-tuning / RLHF."),
        ("knowledgeMech", "fldzvXo1zBjxB6rYX", "I have a solid understanding of mechanistic interpretability."),
        ("fieldFit", "fldCwk2uaM4Ag0SI5", "I'm confident that AI safety is the right field for me."),
        ("careerClarity", "fld59nbtqDxxzH8Fc", "I have a clear sense of how I would actually pursue a career in AI safety from where I am today."),
        ("belonging", "fldkzPdwQ6FbNQnf2", "I feel like I belong in the AI safety community."),
        ("selfEfficacy", "fld4DovzFzpiWtwKu", "I could contribute to a real AI safety project today."),
        ("programNps", "fldb7yg8Z6icrk9Fc", "I would recommend this program to a friend interested in AI safety."),
    ],
    FOLLOWUP: [
        ("fieldFit", "fldB3yJ8Cari2MERt", "I'm confident that AI safety is the right field for me."),
        ("careerClarity", "fldwfreehDwlkB2zA", "I have a clear sense of how I would actually pursue a career in AI safety from where I am today."),
        ("belonging", "fldkB9VgX6x8XPKBZ", "I feel like I belong in the AI safety community."),
        ("selfEfficacy", "fldBtQl9CARui4yz2", "I could contribute to a real AI safety project today."),
    ],
}


def req(method, url, body=None):
    data = json.dumps(body).encode() if body is not None else None
    r = urllib.request.Request(url, data=data, method=method)
    r.add_header("Authorization", f"Bearer {PAT}")
    r.add_header("Content-Type", "application/json")
    try:
        with urllib.request.urlopen(r) as resp:
            return resp.status, json.loads(resp.read().decode() or "{}")
    except urllib.error.HTTPError as e:
        return e.code, {"error": e.read().decode()}


def get_tables():
    st, d = req("GET", f"https://api.airtable.com/v0/meta/bases/{BASE}/tables")
    if st != 200:
        raise SystemExit(f"meta read failed: {st} {d}")
    return d["tables"]


def fetch_all(table):
    out, offset = [], None
    while True:
        url = f"https://api.airtable.com/v0/{BASE}/{table}?pageSize=100&returnFieldsByFieldId=true"
        if offset:
            url += f"&offset={offset}"
        st, data = req("GET", url)
        if st != 200:
            raise SystemExit(f"fetch {table} failed: {st} {data}")
        out.extend(data["records"])
        offset = data.get("offset")
        if not offset:
            break
    return out


def rename_field(table, fid, name):
    st, d = req("PATCH", f"https://api.airtable.com/v0/meta/bases/{BASE}/tables/{table}/fields/{fid}", {"name": name})
    return st, d


def main():
    print(f"=== {'APPLY' if APPLY else 'DRY RUN'} ===\n")
    tables = get_tables()
    by_id = {t["id"]: t for t in tables}

    # 1. Rename orphan singleSelect fields holding a question name.
    print("Step 1: free up question names (rename orphan singleSelects)")
    for table, items in FIELDS.items():
        flds = by_id[table]["fields"]
        for key, _star, question in items:
            orphan = next(
                (f for f in flds if f["name"] == question and f["type"] == "singleSelect"),
                None,
            )
            if orphan:
                tag = f"zzz dup {SHORT[table]} {key}"
                print(f"   rename orphan {orphan['id']} -> '{tag}'")
                if APPLY:
                    st, d = rename_field(table, orphan["id"], tag)
                    if st != 200:
                        raise SystemExit(f"rename orphan failed: {st} {d}")
                    time.sleep(0.25)

    # 2. Create fresh singleSelect fields.
    print("\nStep 2: create fresh singleSelect fields (middle = Neutral)")
    new_map = {SHORT[t]: {} for t in FIELDS}
    for table, items in FIELDS.items():
        for key, _star, question in items:
            print(f"   [{SHORT[table]}] create {key}: {question[:45]!r}")
            if APPLY:
                st, d = req(
                    "POST",
                    f"https://api.airtable.com/v0/meta/bases/{BASE}/tables/{table}/fields",
                    {"name": question, "type": "singleSelect",
                     "options": {"choices": [{"name": c} for c in AGREEMENT]}},
                )
                if st != 200:
                    raise SystemExit(f"create failed ({key}): {st} {d}")
                new_map[SHORT[table]][key] = d["id"]
                time.sleep(0.3)

    if not APPLY:
        print("\nDry run only. Re-run with --apply.")
        return

    with open(OUT, "w") as f:
        json.dump(new_map, f, indent=2)
    print(f"\nFresh field map -> {OUT}")

    # 3. Migrate intake + pulse data (read old star numeric -> write label).
    print("\nStep 3: migrate intake + pulse data")
    for table in (INTAKE, PULSE):
        rows = fetch_all(table)
        patches = []
        for r in rows:
            nf = {}
            for key, star_id, _q in FIELDS[table]:
                v = r["fields"].get(star_id)
                if isinstance(v, (int, float)) and 1 <= int(v) <= 5:
                    nf[new_map[SHORT[table]][key]] = AGREEMENT[int(v) - 1]
            if nf:
                patches.append({"id": r["id"], "fields": nf})
        for i in range(0, len(patches), 10):
            st, d = req("PATCH", f"https://api.airtable.com/v0/{BASE}/{table}", {"records": patches[i:i + 10]})
            print(f"   migrate {SHORT[table]} [{i}:{i+10}] -> {st}")
            if st != 200:
                raise SystemExit(f"migrate failed: {d}")
            time.sleep(0.25)

    print("\nDone. Fresh field map:")
    print(json.dumps(new_map, indent=2))
    print(
        "\nLeftover to clean up in the Airtable UI (optional):"
        "\n  - fields named 'zzz dup ...' (16 empty partial fields) -> delete"
        "\n  - the old star 'rating' fields -> they still hold the numeric 1-5"
        "\n    data as a backup; delete them whenever you no longer want it."
    )


if __name__ == "__main__":
    main()
