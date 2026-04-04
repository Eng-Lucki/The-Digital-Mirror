from services.color_analysis import (
    hex_to_hsl, hsl_to_hex, hue_to_color_name,
    get_harmonies, generate_suggestions
)

def test_hex_to_hsl_red():
    h, s, l = hex_to_hsl("#ff0000")
    assert round(h) == 0
    assert round(s) == 100
    assert round(l) == 50

def test_hsl_to_hex_blue():
    result = hsl_to_hex(240, 100, 50)
    assert result == "#0000ff"

def test_complementary_is_opposite_hue():
    harmonies = get_harmonies("#ff0000")   # red = hue 0
    comp_h, _, _ = hex_to_hsl(harmonies["complementary"])
    assert round(comp_h) == 180            # cyan

def test_harmonies_returns_correct_keys():
    h = get_harmonies("#3a5fa0")
    assert "complementary" in h
    assert "analogous" in h
    assert "triadic" in h
    assert len(h["analogous"]) == 2
    assert len(h["triadic"]) == 2

def test_hue_to_color_name_red():
    assert hue_to_color_name(5) == "red"
    assert hue_to_color_name(350) == "red"

def test_hue_to_color_name_blue():
    assert hue_to_color_name(220) == "blue"

def test_generate_suggestions_returns_five_swatches():
    result = generate_suggestions(["#3a5fa0"])
    assert len(result["swatches"]) == 5
    assert all(s.startswith("#") for s in result["swatches"])

def test_generate_suggestions_returns_three_text_items():
    result = generate_suggestions(["#3a5fa0"])
    assert len(result["suggestions"]) == 3

def test_generate_suggestions_empty_input():
    result = generate_suggestions([])
    assert result == {"swatches": [], "suggestions": []}
