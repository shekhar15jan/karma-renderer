# Technology icon reference

Brand marks used in video frames. A script references a technology by slug and the
renderer draws its real mark — no approximations, no text badges.

## How a script uses one

```json
{ "id": "orders", "type": "tech-node", "label": "Order Service",
  "data": { "tech": "spring-boot", "sublabel": "REST API" } }
```

`data.tech` also works on any existing node or card component, so an
`api-gateway` node can carry the Kong mark, or a `stat-card` the NVIDIA mark.

Slugs, aliases and categories live in `manifest.json`. Aliases are forgiving —
`k8s`, `kube`, `Kubernetes` and `kubernetes` all resolve to the same mark.

## Resolution order

1. **`<slug>.svg` in this directory** — used verbatim, keeping its own colours.
   This is the layer you control.
2. **`simple-icons`** — the `si` key in the manifest. ~3,400 brands, CC0 paths,
   single-colour silhouettes that get tinted with the brand hex.
3. **Neither** — the widget falls back to a brand-coloured monogram chip, which
   reads as deliberate rather than broken.

## Adding an official logo

Drop the vendor's press-kit SVG in here named after the slug:

```
assets/icon-reference/aws.svg
assets/icon-reference/openai.svg
```

Then regenerate:

```bash
npm run build:icons
```

Multi-colour and multi-path SVGs are preserved exactly — the generator keeps the
`viewBox` and inner markup untouched, and marks the icon non-tintable so its own
colours survive.

### Currently awaiting a local SVG

These are absent from `simple-icons` because the trademark holders asked to be
removed. They render as monogram chips until you supply the official asset:

| Slug | Source |
| --- | --- |
| `aws` | Amazon Press Center brand assets |
| `azure` | Microsoft brand resource center |
| `s3`, `ec2`, `dynamodb` | AWS Architecture Icons pack |
| `openai` | OpenAI brand guidelines page |

## A note on usage

Using a product's logo to identify that product in an educational video is
ordinary nominative use, but each vendor publishes brand guidelines covering
spacing, recolouring and distortion. The renderer never recolours an override
SVG or changes its aspect ratio, which keeps it compliant by default — so prefer
adding the official file here over letting a silhouette stand in.
