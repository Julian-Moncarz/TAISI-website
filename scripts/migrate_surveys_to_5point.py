#!/usr/bin/env python3
"""
Migrate round-1 survey data from 1-10 to 1-5 labeled Likert, and shrink the
Airtable rating fields from max=10 to max=5.

Mapping curves (per Julian's "7 is neutral, 6 is neutral too" guidance):
  Curve A (attitude: recommend / field-fit / belonging / self-efficacy)
    1-3 -> 1   4-5 -> 2   6-7 -> 3   8 -> 4   9-10 -> 5
  Curve B (knowledge x4 / career clarity)
    1-2 -> 1   3-4 -> 2   5-6 -> 3   7-8 -> 4   9-10 -> 5

Usage:
  python3 migrate_surveys_to_5point.py            # dry run (no writes)
  python3 migrate_surveys_to_5point.py --apply    # back up, rescale, delete tests, shrink fields
"""
import json
import sys
import time
import urllib.request
import urllib.error

import os
PAT = os.environ["AIRTABLE_PAT"]
BASE = "appVfG77MoQbG3bgi"
BACKUP = "/Users/julianmoncarz/TAISI/survey_5point_migration_backup.json"

APPLY = "--apply" in sys.argv


def curve_a(v):
    if v <= 3: return 1
    if v <= 5: return 2
    if v <= 7: return 3
    if v == 8: return 4
    return 5


def curve_b(v):
    if v <= 2: return 1
    if v <= 4: return 2
    if v <= 6: return 3
    if v <= 8: return 4
    return 5


# field_id -> curve, per table
INTAKE = "tblVi3jowYcdbu4bj"
PULSE = "tblR1zpLyNl0uvnrB"
EXIT = "tblRtd6U9JlpU4rNi"
FOLLOWUP = "tbl3dpgcnDBjrtMOg"

INTAKE_FIELDS = {
    "fldP7E73Mki9WCc00": curve_b,  # knowledge AIS
    "fld2rjLXJkUVMhhYx": curve_b,  # knowledge Evals
    "fldDo5zEe96L3ZfAV": curve_b,  # knowledge FT
    "fldDBnkLTc6aODEW6": curve_b,  # knowledge Mech
    "fldwJXCA4mYlY4oYn": curve_a,  # field-fit
    "fld10rSnl4aq2p3qq": curve_b,  # career clarity
    "fldgteHR2Sjrun6Ke": curve_a,  # belonging
    "fld0v0l3NDx1q1Yak": curve_a,  # self-efficacy
}
PULSE_FIELDS = {
    "fldDOROuBb2Yzjm4P": curve_a,  # Day NPS
}

# All rating fields whose max should become 5 (4 tables).
SHRINK = {
    INTAKE: list(INTAKE_FIELDS.keys()),
    PULSE: list(PULSE_FIELDS.keys()),
    EXIT: [
        "flddUpfzMyqTJgOKZ", "fldp6ejLuiQbsC0F9", "fldltFhHUQo6t7wQP",
        "fldzvXo1zBjxB6rYX", "fldCwk2uaM4Ag0SI5", "fld59nbtqDxxzH8Fc",
        "fldkzPdwQ6FbNQnf2", "fld4DovzFzpiWtwKu", "fldb7yg8Z6icrk9Fc",
    ],
    FOLLOWUP: [
        "fldB3yJ8Cari2MERt", "fldwfreehDwlkB2zA",
        "fldkB9VgX6x8XPKBZ", "fldBtQl9CARui4yz2",
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

    intake = fetch_all(INTAKE)
    pulse = fetch_all(PULSE)
    exit_rows = fetch_all(EXIT)
    followup = fetch_all(FOLLOWUP)

    backup = {
        "intake": [{"id": r["id"], "fields": r["fields"]} for r in intake],
        "pulse": [{"id": r["id"], "fields": r["fields"]} for r in pulse],
        "exit": [{"id": r["id"], "fields": r["fields"]} for r in exit_rows],
        "followup": [{"id": r["id"], "fields": r["fields"]} for r in followup],
    }
    if APPLY:
        with open(BACKUP, "w") as f:
            json.dump(backup, f, indent=2)
        print(f"Backed up raw data -> {BACKUP}\n")

    # Build rescale patches
    def patches_for(rows, fieldmap):
        ps = []
        for r in rows:
            new = {}
            for fid, fn in fieldmap.items():
                v = r["fields"].get(fid)
                if isinstance(v, (int, float)):
                    nv = fn(int(v))
                    if nv != v:
                        new[fid] = nv
                    else:
                        new[fid] = nv  # still write to be explicit
            if new:
                ps.append((r["id"], new, {fid: r["fields"].get(fid) for fid in fieldmap}))
        return ps

    intake_patches = patches_for(intake, INTAKE_FIELDS)
    pulse_patches = patches_for(pulse, PULSE_FIELDS)

    print(f"Intake rows to rescale: {len(intake_patches)}")
    for rid, new, old in intake_patches[:3]:
        print(f"  {rid}: { {k: (old[k], new[k]) for k in new} }")
    print(f"Pulse rows to rescale: {len(pulse_patches)}")
    for rid, new, old in pulse_patches[:3]:
        print(f"  {rid}: { {k: (old[k], new[k]) for k in new} }")

    # Identify test rows (exit/followup) to delete
    print(f"\nExit rows (delete as tests): {len(exit_rows)} -> {[r['id'] for r in exit_rows]}")
    print(f"Followup rows (delete as tests): {len(followup)} -> {[r['id'] for r in followup]}")

    if not APPLY:
        print("\nDry run only. Re-run with --apply to execute.")
        return

    # 1. Rescale intake + pulse (batch PATCH, 10 per request)
    def batch_patch(table, patches):
        recs = [{"id": rid, "fields": new} for rid, new, _ in patches]
        for i in range(0, len(recs), 10):
            st, data = req("PATCH", f"https://api.airtable.com/v0/{BASE}/{table}",
                           {"records": recs[i:i + 10]})
            print(f"  PATCH {table} [{i}:{i+10}] -> {st}")
            if st != 200:
                raise SystemExit(f"PATCH failed: {data}")
            time.sleep(0.25)

    print("\nRescaling intake...")
    batch_patch(INTAKE, intake_patches)
    print("Rescaling pulse...")
    batch_patch(PULSE, pulse_patches)

    # 2. Delete test rows in exit/followup
    def delete_rows(table, rows):
        for r in rows:
            st, data = req("DELETE", f"https://api.airtable.com/v0/{BASE}/{table}/{r['id']}")
            print(f"  DELETE {table}/{r['id']} -> {st}")
            time.sleep(0.2)

    print("\nDeleting exit test rows...")
    delete_rows(EXIT, exit_rows)
    print("Deleting followup test rows...")
    delete_rows(FOLLOWUP, followup)

    # 3. Shrink rating field max -> 5
    print("\nShrinking rating fields to max=5...")
    for table, fids in SHRINK.items():
        # fetch current field options to preserve icon/color
        st, meta = req("GET", f"https://api.airtable.com/v0/meta/bases/{BASE}/tables")
        if st != 200:
            raise SystemExit(f"meta read failed: {st} {meta}")
        tbl = next(t for t in meta["tables"] if t["id"] == table)
        opts_by_id = {fl["id"]: fl.get("options", {}) for fl in tbl["fields"]}
        for fid in fids:
            cur = opts_by_id.get(fid, {})
            new_opts = {"max": 5, "icon": cur.get("icon", "star"), "color": cur.get("color", "yellowBright")}
            st, data = req(
                "PATCH",
                f"https://api.airtable.com/v0/meta/bases/{BASE}/tables/{table}/fields/{fid}",
                {"options": new_opts},
            )
            print(f"  {table}/{fid} max->5 : {st}" + ("" if st == 200 else f"  {data}"))
            time.sleep(0.3)

    print("\nDone.")


if __name__ == "__main__":
    main()
