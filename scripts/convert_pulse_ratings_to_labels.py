#!/usr/bin/env python3
"""
Convert the Pulse Ratings long-format `Rating` star field to a singleSelect that
stores the word label (Poor/Fair/Okay/Good/Loved it, plus the notebook-learning
set Very little..A ton). Airtable can't convert a field type in place, so:
  1. rename the old star "Rating" field -> "zzz star Rating" (frees the name),
  2. create a new singleSelect "Rating" with both label sets as choices,
  3. migrate existing rows: number -> label (by activity),
  4. rename the reason field to reflect the new "2 or less" threshold,
  5. print the new field id for website/src/lib/survey.ts.

  AIRTABLE_PAT=... python3 convert_pulse_ratings_to_labels.py            # dry run
  AIRTABLE_PAT=... python3 convert_pulse_ratings_to_labels.py --apply
"""
import json
import os
import sys
import time
import urllib.request
import urllib.error

PAT = os.environ["AIRTABLE_PAT"]
BASE = "appVfG77MoQbG3bgi"
TABLE = "tbluGvhL0qVJQOMrI"  # Survey - Pulse Ratings
RATING_FIELD = "fldvgaRu19iDKWHMv"
ACTIVITY_FIELD = "fldOZTKJq8NQA6lTm"
REASON_FIELD = "fldm8UIPYf4eL4GLg"
APPLY = "--apply" in sys.argv

NOTEBOOK_ACTIVITY = "Notebook content: how much did you feel you learned from it?"
ACTIVITY_POINTS = ["Poor", "Fair", "Okay", "Good", "Loved it"]
NOTEBOOK_POINTS = ["Very little", "A little", "Some", "A lot", "A ton"]
ALL_CHOICES = ACTIVITY_POINTS + NOTEBOOK_POINTS


def label_for(activity, v):
    pts = NOTEBOOK_POINTS if activity == NOTEBOOK_ACTIVITY else ACTIVITY_POINTS
    return pts[v - 1] if isinstance(v, (int, float)) and 1 <= int(v) <= 5 else None


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


def fetch_all():
    out, offset = [], None
    while True:
        url = f"https://api.airtable.com/v0/{BASE}/{TABLE}?pageSize=100&returnFieldsByFieldId=true"
        if offset:
            url += f"&offset={offset}"
        st, data = req("GET", url)
        if st != 200:
            raise SystemExit(f"fetch failed: {st} {data}")
        out.extend(data["records"])
        offset = data.get("offset")
        if not offset:
            break
    return out


def main():
    print(f"=== {'APPLY' if APPLY else 'DRY RUN'} ===\n")
    rows = fetch_all()
    print(f"Existing rating rows: {len(rows)}")
    sample = [
        (r["fields"].get(ACTIVITY_FIELD), r["fields"].get(RATING_FIELD),
         label_for(r["fields"].get(ACTIVITY_FIELD), r["fields"].get(RATING_FIELD)))
        for r in rows[:5]
    ]
    for a, v, lbl in sample:
        print(f"   {a!r}: {v} -> {lbl}")

    if not APPLY:
        print("\nDry run only. Re-run with --apply.")
        return

    # 1. Rename old star field.
    st, d = req("PATCH", f"https://api.airtable.com/v0/meta/bases/{BASE}/tables/{TABLE}/fields/{RATING_FIELD}",
                {"name": "zzz star Rating"})
    print(f"rename old Rating -> 'zzz star Rating': {st}")
    if st != 200:
        raise SystemExit(d)

    # 2. Create new singleSelect "Rating".
    st, d = req("POST", f"https://api.airtable.com/v0/meta/bases/{BASE}/tables/{TABLE}/fields",
                {"name": "Rating", "type": "singleSelect",
                 "options": {"choices": [{"name": c} for c in ALL_CHOICES]}})
    if st != 200:
        raise SystemExit(f"create failed: {st} {d}")
    new_id = d["id"]
    print(f"created new singleSelect Rating: {new_id}")

    # 3. Migrate rows.
    patches = []
    for r in rows:
        lbl = label_for(r["fields"].get(ACTIVITY_FIELD), r["fields"].get(RATING_FIELD))
        if lbl:
            patches.append({"id": r["id"], "fields": {new_id: lbl}})
    print(f"migrating {len(patches)} rows...")
    for i in range(0, len(patches), 10):
        st, d = req("PATCH", f"https://api.airtable.com/v0/{BASE}/{TABLE}", {"records": patches[i:i + 10]})
        print(f"   [{i}:{i+10}] -> {st}")
        if st != 200:
            raise SystemExit(d)
        time.sleep(0.25)

    # 4. Rename reason field to match the new threshold.
    st, d = req("PATCH", f"https://api.airtable.com/v0/meta/bases/{BASE}/tables/{TABLE}/fields/{REASON_FIELD}",
                {"name": "What they disliked (rated 2 or less)"})
    print(f"rename reason field: {st}")

    print(f"\nDone. New Rating field id: {new_id}")
    print("Update SURVEY.pulseRatings.fields.rating in website/src/lib/survey.ts.")


if __name__ == "__main__":
    main()
