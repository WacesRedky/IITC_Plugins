// ==UserScript==
// @id liveUrl
// @name IITC Plugin: Live URL
// @category Tweaks
// @version 0.1.1
// @namespace https://github.com/WacesRedky/IITC_Plugins/raw/master/iitc-plugin-live-url.user.js
// @description Refresh URL in browser on drag and zoom map
// @downloadURL https://github.com/WacesRedky/IITC_Plugins/raw/master/iitc-plugin-live-url.user.js
// @updateURL   https://github.com/WacesRedky/IITC_Plugins/raw/master/iitc-plugin-live-url.user.js
// @author WacesRedky
// @include        https://www.ingress.com/intel*
// @include        http://www.ingress.com/intel*
// @include        https://ingress.com/intel*
// @include        http://ingress.com/intel*
// @match          https://www.ingress.com/intel*
// @match          http://www.ingress.com/intel*
// @match          https://ingress.com/intel*
// @match          http://ingress.com/intel*
// @grant          none
// ==/UserScript==

// Wrapper function that will be stringified and injected
// into the document. Because of this, normal closure rules
// do not apply here.
function wrapper(plugin_info) {
  // Make sure that window.plugin exists. IITC defines it as a no-op function,
  // and other plugins assume the same.
  if (typeof window.plugin !== 'function') window.plugin = function() {};

  // Use own namespace for plugin
  window.plugin.liveUrl = function() {};

  // Name of the IITC build for first-party plugins
  plugin_info.buildName = 'liveUrl';

  // Datetime-derived version of the plugin
  plugin_info.dateTimeVersion = '20170321232800';

  // ID/name of the plugin
  plugin_info.pluginId = 'liveUrl';

  // The entry point for this plugin.
  function setup() {
    window.map.on('moveend', window.plugin.liveUrl.refreshUrl);
    window.addHook('portalDetailLoaded', window.plugin.liveUrl.refreshUrl);
  };

  window.plugin.liveUrl.refreshUrl = function() {
    var center = window.map.getCenter();
    var url = 'intel?';
    url += 'll='+center.lat.toFixed(5)+','+center.lng.toFixed(5);
    url += '&z='+window.map.getZoom();
    if (window.selectedPortal) {
        var portal = window.portalDetail.get(window.selectedPortal);
        url += '&pll='+portal.latE6/1e6+','+portal.lngE6/1e6;
    }
    history.pushState(center.toString(), document.title, url);
  };

  // Add an info property for IITC's plugin system
  setup.info = plugin_info;

  // Make sure window.bootPlugins exists and is an array
  if (!window.bootPlugins) window.bootPlugins = [];
  // Add our startup hook
  window.bootPlugins.push(setup);
  // If IITC has already booted, immediately run the 'setup' function
  if (window.iitcLoaded && typeof setup === 'function') setup();
}


// Create a script element to hold our content script
var script = document.createElement('script');
var info = {};

// GM_info is defined by the assorted monkey-themed browser extensions
// and holds information parsed from the script header.
if (typeof GM_info !== 'undefined' && GM_info && GM_info.script) {
  info.script = {
    version: GM_info.script.version,
    name: GM_info.script.name,
    description: GM_info.script.description
  };
}

// Create a text node and our IIFE inside of it
var textContent = document.createTextNode('(' + wrapper + ')(' + JSON.stringify(info) + ')');
// Add some content to the script element
script.appendChild(textContent);
// Finally, inject it... wherever.
(document.body || document.head || document.documentElement).appendChild(script);
