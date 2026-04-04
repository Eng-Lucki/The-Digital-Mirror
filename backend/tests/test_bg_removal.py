import io
from PIL import Image
from services.bg_removal import remove_background


def _make_png(width=50, height=50, color=(200, 100, 50)) -> bytes:
    img = Image.new("RGB", (width, height), color=color)
    buf = io.BytesIO()
    img.save(buf, format="PNG")
    return buf.getvalue()


def test_remove_background_returns_rgba_png():
    result = remove_background(_make_png())
    output = Image.open(io.BytesIO(result))
    assert output.mode == "RGBA"


def test_remove_background_preserves_size():
    result = remove_background(_make_png(60, 80))
    output = Image.open(io.BytesIO(result))
    assert output.size == (60, 80)
