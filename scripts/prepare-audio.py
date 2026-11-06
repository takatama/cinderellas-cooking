#!/usr/bin/env python3
"""Acquire reviewed candidates into an ignored cache; never modify the game.

No network activity without --download. urllib preserves the environment proxy.
ffprobe must verify the media before a file or its provenance is accepted.
"""
import argparse
from datetime import datetime, timezone
import hashlib
import json
from pathlib import Path
import shutil
import subprocess
import tempfile
import urllib.request

ROOT = Path(__file__).resolve().parents[1]
CACHE = ROOT / ".audio-cache"
MAX_BYTES = 16 * 1024 * 1024


def verify(path):
    result = subprocess.run(
        ["ffprobe", "-v", "error", "-show_entries",
         "format=duration:stream=codec_type,codec_name,sample_rate,channels",
         "-of", "json", str(path)],
        check=True, capture_output=True, text=True, timeout=30,
    )
    info = json.loads(result.stdout)
    streams = info.get("streams", [])
    if (len(streams) != 1 or streams[0].get("codec_type") != "audio"
            or streams[0].get("codec_name") != "mp3"
            or float(info.get("format", {}).get("duration", 0)) <= 0):
        raise ValueError("Expected one MP3 audio stream with a positive duration")
    return info


def prepare(source, import_path=None):
    CACHE.mkdir(exist_ok=True)
    destination = CACHE / (source["id"] + ".mp3")
    record_path = CACHE / (source["id"] + ".json")
    if destination.exists() or record_path.exists():
        raise ValueError("Already prepared; keep the existing original and record")
    with tempfile.TemporaryDirectory(dir=CACHE) as scratch:
        pending = Path(scratch) / "pending.mp3"
        final_url = None
        if import_path:
            if not 0 < import_path.stat().st_size <= MAX_BYTES:
                raise ValueError("Input must be between 1 byte and 16 MiB")
            shutil.copyfile(import_path, pending)
        else:
            url = source.get("download")
            if not url:
                raise ValueError("No verified download URL; use the official page")
            # Do not replace proxy settings or retry a policy denial elsewhere.
            with urllib.request.urlopen(url, timeout=20) as response:
                final_url = response.geturl()
                data = response.read(MAX_BYTES + 1)
            if not 0 < len(data) <= MAX_BYTES:
                raise ValueError("Response must be between 1 byte and 16 MiB")
            pending.write_bytes(data)
        media = verify(pending)
        record = {
            "source": source,
            "acquiredAt": datetime.now(timezone.utc).isoformat(),
            "method": "local-import" if import_path else "official-download",
            "resolvedDownloadUrl": final_url,
            "sha256": hashlib.sha256(pending.read_bytes()).hexdigest(),
            "bytes": pending.stat().st_size,
            "media": media,
            "changes": [],
            "listened": False,
            "adopted": False,
            "note": "Local import alone does not verify provenance or original-game identity.",
        }
        pending.replace(destination)
        record_path.write_text(json.dumps(record, ensure_ascii=False, indent=2) + "\n")
    print(f"Prepared {destination}; listening and adoption review pending")


def main():
    sources = json.loads((ROOT / "content/audio-sources.json").read_text())["sources"]
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("id", nargs="?", choices=[s["id"] for s in sources])
    action = parser.add_mutually_exclusive_group()
    action.add_argument("--download", action="store_true")
    action.add_argument("--import-file", type=Path)
    args = parser.parse_args()
    if not args.id:
        if args.download or args.import_file:
            parser.error("Specify one candidate ID")
        for source in sources:
            print(f'{source["id"]:12} {source["title"]}\n             {source["page"]}')
        return
    source = next(s for s in sources if s["id"] == args.id)
    if not args.download and not args.import_file:
        print(json.dumps(source, ensure_ascii=False, indent=2))
        return
    if not shutil.which("ffprobe"):
        parser.error("ffprobe is required to reject invalid media")
    try:
        prepare(source, args.import_file)
    except (OSError, ValueError, subprocess.SubprocessError) as error:
        parser.exit(1, f"Audio preparation failed: {error}\n")


if __name__ == "__main__":
    main()
