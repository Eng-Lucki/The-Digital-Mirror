import colorsys


def hex_to_hsl(hex_color: str) -> tuple[float, float, float]:
    hex_color = hex_color.lstrip("#")
    r = int(hex_color[0:2], 16) / 255
    g = int(hex_color[2:4], 16) / 255
    b = int(hex_color[4:6], 16) / 255
    h, l, s = colorsys.rgb_to_hls(r, g, b)
    return h * 360, s * 100, l * 100


def hsl_to_hex(h: float, s: float, l: float) -> str:
    r, g, b = colorsys.hls_to_rgb(h / 360, l / 100, s / 100)
    return "#{:02x}{:02x}{:02x}".format(round(r * 255), round(g * 255), round(b * 255))


def hue_to_color_name(hue: float) -> str:
    hue = hue % 360
    if hue < 15 or hue >= 345:
        return "red"
    if hue < 45:
        return "orange"
    if hue < 75:
        return "yellow"
    if hue < 150:
        return "green"
    if hue < 195:
        return "teal"
    if hue < 255:
        return "blue"
    if hue < 285:
        return "indigo"
    if hue < 330:
        return "purple"
    return "pink"


def get_harmonies(hex_color: str) -> dict:
    h, s, l = hex_to_hsl(hex_color)
    return {
        "complementary": hsl_to_hex((h + 180) % 360, s, l),
        "analogous": [
            hsl_to_hex((h + 30) % 360, s, l),
            hsl_to_hex((h - 30) % 360, s, l),
        ],
        "triadic": [
            hsl_to_hex((h + 120) % 360, s, l),
            hsl_to_hex((h + 240) % 360, s, l),
        ],
    }


def generate_suggestions(colors: list[str]) -> dict:
    if not colors:
        return {"swatches": [], "suggestions": []}

    h, s, l = hex_to_hsl(colors[0])
    harmonies = get_harmonies(colors[0])
    primary_name = hue_to_color_name(h)
    comp_name = hue_to_color_name(hex_to_hsl(harmonies["complementary"])[0])
    ana_name = hue_to_color_name(hex_to_hsl(harmonies["analogous"][0])[0])

    return {
        "swatches": [
            harmonies["complementary"],
            *harmonies["analogous"],
            *harmonies["triadic"],
        ],
        "suggestions": [
            f"Your {primary_name} top pairs well with {comp_name} bottoms.",
            f"Try {ana_name} accessories to complement this look.",
            f"A {comp_name} jacket would complete this outfit.",
        ],
    }
