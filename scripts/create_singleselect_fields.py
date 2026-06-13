#!/usr/bin/env python3
"""
Replace the 5-point `rating` (star) fields with `singleSelect` fields whose
NAME is the question and whose VALUE is the agreement label ("Agree", etc.).

Airtable can't convert a field's type in place and can't delete fields via API,
so this CREATES new singleSelect fields, migrates existing data into them, and
prints the new field IDs (for website/src/lib/survey.ts). The old star fields
stay until deleted by hand in the Airtable UI.

  python3 create_singleselect_fields.py            # dry run
  python3 create_singleselect_fields.py --apply    # create fields + migrate data
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

# (semantic key, old rating field id, question text) per table.
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

TABLE_NAME = {INTAKE: "intake", PULSE: "pulse", EXIT: "exit", FOLLOWUP: "followup"}


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


def main():
    print(f"=== {'APPLY' if APPLY else 'DRY RUN'} ===\n")
    new_map = {}  # table -> { semanticKey: newFieldId }

    for table, fields in FIELDS.items():
        new_map[TABLE_NAME[table]] = {}
        print(f"[{TABLE_NAME[table]}] {len(fields)} fields")
        for key, old_id, question in fields:
            if not APPLY:
                print(f"   would create singleSelect: {question!r}")
                continue
            st, data = req(
                "POST",
                f"https://api.airtable.com/v0/meta/bases/{BASE}/tables/{table}/fields",
                {
                    "name": question,
                    "type": "singleSelect",
                    "options": {"choices": [{"name": c} for c in AGREEMENT]},
                },
            )
            if st != 200:
                raise SystemExit(f"create field failed ({key}): {st} {data}")
            new_map[TABLE_NAME[table]][key] = data["id"]
            print(f"   created {key}: {data['id']}")
            time.sleep(0.3)

    if not APPLY:
        print("\nDry run only. Re-run with --apply.")
        return

    with open(OUT, "w") as f:
        json.dump(new_map, f, indent=2)
    print(f"\nNew field map -> {OUT}")

    # Migrate existing numeric data (only intake + pulse hold rows).
    def migrate(table):
        rows = fetch_all(table)
        patches = []
        for r in rows:
            new_fields = {}
            for key, old_id, _q in FIELDS[table]:
                v = r["fields"].get(old_id)
                if isinstance(v, (int, float)):
                    iv = int(v)
                    if 1 <= iv <= 5:
                        new_fields[new_map[TABLE_NAME[table]][key]] = AGREEMENT[iv - 1]
            if new_fields:
                patches.append({"id": r["id"], "fields": new_fields})
        for i in range(0, len(patches), 10):
            st, data = req("PATCH", f"https://api.airtable.com/v0/{BASE}/{table}",
                           {"records": patches[i:i + 10]})
            print(f"   migrate {TABLE_NAME[table]} [{i}:{i+10}] -> {st}")
            if st != 200:
                raise SystemExit(f"migrate failed: {data}")
            time.sleep(0.25)
        return len(patches)

    print("\nMigrating data...")
    print(f"   intake rows migrated: {migrate(INTAKE)}")
    print(f"   pulse rows migrated: {migrate(PULSE)}")
    print("   exit/followup: no rows (skipped)")

    print("\nDone. Update website/src/lib/survey.ts with these IDs:")
    print(json.dumps(new_map, indent=2))


if __name__ == "__main__":
    main()
