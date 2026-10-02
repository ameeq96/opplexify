import { TEMPLATE_ASSET_BASE as A, templateCssFiles, withAssetVersion } from "./templateAssets";

/**
 * Server-rendered template styles.
 *
 * Only Bootstrap and the core theme participate in first paint. Plugin styles
 * remain print-only until DigitalAgencyRuntime enables them after hydration.
 */
const BLOCKING_CSS = new Set<string>(["bootstrap.min.css", "style.css"]);

export function TemplateAssetLinks() {
  const blockingCss = templateCssFiles.filter((file) => BLOCKING_CSS.has(file));
  const deferredCss = templateCssFiles.filter((file) => !BLOCKING_CSS.has(file));

  return (
    <>
      {blockingCss.map((file) => (
        <link key={file} rel="stylesheet" href={withAssetVersion(`${A}/css/${file}`)} />
      ))}
      {deferredCss.map((file) => (
        <link
          key={file}
          rel="stylesheet"
          href={withAssetVersion(`${A}/css/${file}`)}
          media="print"
          data-defer=""
        />
      ))}
      <noscript>
        {deferredCss.map((file) => (
          <link key={`ns-${file}`} rel="stylesheet" href={withAssetVersion(`${A}/css/${file}`)} />
        ))}
      </noscript>
    </>
  );
}
