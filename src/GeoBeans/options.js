var olx;

/**
 * Object literal with config options for the map.
 * @typedef {{
 *     pixelRatio: (number|undefined),
 *     logo: (boolean|string|Element|undefined)}
 */
olx.MapOptions;

/**
 * The ratio between physical pixels and device-independent pixels (dips) on the
 * device. If `undefined` then it gets set by using `window.devicePixelRatio`.
 * @type {number|undefined}
 * @api
 */
olx.MapOptions.prototype.pixelRatio;

/**
 * The map logo. A logo to be displayed on the map at all times. If a string is
 * provided, it will be set as the image source of the logo. If an object is
 * provided, the `src` property should be the URL for an image and the `href`
 * property should be a URL for creating a link. If an element is provided,
 * the element will be used. To disable the map logo, set the option to
 * `false`. By default, the OpenLayers 3 logo is shown.
 * @type {boolean|string|Element|undefined}
 * @api stable
 */
olx.MapOptions.prototype.logo;