load("render.star", "render")
load("encoding/json.star", "json")
load("encoding/base64.star", "base64")

DOG_ICON = base64.decode("""
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
""")

font = "tom-thumb"

def main(config):
  if (config["data"]):
    last_fed_info = json.decode(config["data"])
  else:
    return render.Root(
      delay = 500,
      child = render.Column(
        children = render.Text(
          content = "No Feed The Dog Data",
          font = font,
        ),
        main_align = "space_around",
        expanded = True,
      ),
    )

  fed_today_count = last_fed_info["fedTodayCount"]
  last_fed = last_fed_info["lastFed"]

  fed_text = [
    render.Text(
      content = "Fed: " + str(fed_today_count),
      font = font,
    ),
    render.Text(
      content = "Last:",
      font = font,
    ),
    render.Marquee(
      width = 32,
      child = render.Text(
        content = last_fed,
        font = font,
      ),
    ),
    
  ]

  return render.Root(
    delay = 500,
    child = render.Row(
      children = [
        render.Image(
          src = DOG_ICON,
          height = 32,
        ),
        render.Column(
          children = fed_text,
          main_align = "space_around",
          expanded = True,
        ),
      ],
      main_align = "space_around",
      expanded = True,
    ),
  )
