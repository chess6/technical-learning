"""Offline unit tests for the transcript normalization layer.

Run with:  python3 -m pytest scripts/test_fetch_transcripts.py
No network access required — these cover the pure caption-parsing functions.
"""

import importlib.util
import json
import sys
from pathlib import Path

spec = importlib.util.spec_from_file_location(
    "fetch_transcripts", Path(__file__).parent / "fetch-transcripts.py"
)
ft = importlib.util.module_from_spec(spec)
# dataclasses resolves annotations through sys.modules[cls.__module__].
sys.modules["fetch_transcripts"] = ft
spec.loader.exec_module(ft)


def test_normalize_json3_basic():
    raw = json.dumps(
        {
            "events": [
                {"tStartMs": 0, "dDurationMs": 1500, "segs": [{"utf8": "Hello "}, {"utf8": "world"}]},
                {"tStartMs": 2000, "dDurationMs": 1000, "segs": [{"utf8": "again"}]},
                {"tStartMs": 3500, "dDurationMs": 500},  # no segs → dropped
            ]
        }
    )
    segments = ft.normalize_json3(raw)
    assert [s.text for s in segments] == ["Hello world", "again"]
    assert segments[0].start == 0.0
    assert segments[0].duration == 1.5
    assert segments[1].start == 2.0


def test_normalize_vtt_with_hours_and_tags():
    raw = "\n".join(
        [
            "WEBVTT",
            "",
            "00:12.400 --> 00:15.500",
            "First <c>line</c>",
            "",
            "1:02:03.000 --> 1:02:04.250",
            "Second line",
            "continued",
        ]
    )
    segments = ft.normalize_vtt(raw)
    assert segments[0].text == "First line"
    assert segments[0].start == 12.4
    assert abs(segments[0].duration - 3.1) < 1e-9
    assert segments[1].text == "Second line continued"
    assert segments[1].start == 3723.0


def test_dedupe_rolling_merges_repeated_auto_caption_lines():
    segs = [
        ft.Segment(0.0, 2.0, "same line"),
        ft.Segment(1.5, 2.0, "same line"),  # rolling duplicate
        ft.Segment(3.5, 2.0, "next line"),
    ]
    out = ft.dedupe_rolling(segs)
    assert [s.text for s in out] == ["same line", "next line"]
    assert out[0].duration == 3.5  # extended to cover the merged cue


def test_segment_json_shape():
    seg = ft.Segment(start=12.4, duration=3.1, text="...")
    assert seg.as_json() == {"start": 12.4, "duration": 3.1, "text": "..."}


def test_plain_text_paragraph_breaks_on_gaps():
    segs = [
        ft.Segment(0.0, 1.0, "a"),
        ft.Segment(1.2, 1.0, "b"),
        ft.Segment(10.0, 1.0, "c"),  # >4s gap → paragraph break
    ]
    assert ft.to_plain_text(segs) == "a b\n\nc\n"


def test_sanitize_id_rejects_path_traversal():
    import pytest

    with pytest.raises(SystemExit):
        ft.sanitize_id("../../etc/passwd")
