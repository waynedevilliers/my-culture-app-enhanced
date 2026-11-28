# Certificate design

The certificate is Christian's LaTeX design (`../certificate-latex/`) rebuilt
in HTML/CSS, so it renders on Vercel without a TeX installation.

- `latex-vs-html.png`: his PDF (left) next to the HTML version (right) with
  the same texts.
- `variants.png`: German/English, the four colour presets, one to three
  signatures, with and without logo or addition.

How it is built (`src/components/certificate/CertificateDesign.tsx`):

- Frame and corner ornaments are the vector shapes from his PDF
  (`public/certificate/frame.svg`), drawn as a mask in the chosen colour.
- The background is his tile (`public/certificate/background-tile.png`),
  4 cm x 2 cm as in `\TileWallPaper{4cm}{2cm}`.
- Texts use CMU Serif (Computer Modern, SIL Open Font License,
  `src/fonts/cmu-serif/OFL.txt`) at his positions and sizes.
- All sizes are in his PDF's points and scale with the width, for the
  dashboard preview, the recipient page and printing.

`certificate-latex/certificate.tex` stays as the source for a later LaTeX
engine (pdflatex on a separate server).
