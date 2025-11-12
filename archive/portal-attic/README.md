# Portal Attic

Legacy portal artifacts that no longer ship with the live build live here. Each item moved out of `src/portal` is documented so you can review and decide what to do next.

| Item | Source Path | Notes |
| --- | --- | --- |
| `css-only/Errl_Portal_Scaffold.html` | `src/portal/css-only/Errl_Portal_Scaffold.html` | First-pass static mock without JS. Nothing references it anymore, so it was moved out of the runtime tree. Keep for historical reference or delete after review. |
| `pin-widget-edit/` | `src/portal/pages/studio/pin-widget/_edit_ErrlPin.Widget/` | Working directory that contains partial edits + macOS resource files. The production designer uses `ErrlPin.Widget/` so this edit sandbox is safe to archive. |
| `ErrlPin.Widget.zip` | `src/portal/pages/studio/pin-widget/ErrlPin.Widget.zip` | Zipped export of the designer. Build consumes the unzipped folder instead. Remove after verifying no external automations read this zip. |
| `ErrlPin.Widget.bak.zip` | same as above | Extra backup of the widget bundle; redundant with the live source. |
| `asset-builder.zip` | `src/portal/pages/studio/asset-builder.zip` | Old tool for combining assets. No current entry points load it (confirmed via `rg`). Keep here until we rebuild the asset builder. |
| `errl-painted-2-svg.txt` | `src/portal/pages/studio/pin-widget/errl-painted-2-svg.txt` | Raw SVG dump used during pin-widget experiments. Move back only if the designer needs to re-import it. |

Feel free to delete the files above once you no longer need them.
