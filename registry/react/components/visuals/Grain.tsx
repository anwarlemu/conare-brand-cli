// The website's grain (home.css .footer-grain): the brand texture tiled at 12% of the panel, laid over a dark or red
// ground at 30%. Decorative; put it first inside a `relative` panel.
export function Grain() {
  return (
    <>
      <style href="ds-grain" precedence="ds">{css}</style>
      <span data-ds="grain" aria-hidden="true" className="ds-grain pointer-events-none absolute inset-0 opacity-30" />
    </>
  )
}

export default Grain

const css = `
.ds-grain { background-image: url("/conare-ds/textures/grain.webp"); background-size: 12% auto; background-repeat: repeat; }
`
