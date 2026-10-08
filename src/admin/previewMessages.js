// postMessage protocol between the admin (parent) and the /admin/live-preview iframe. Same origin
// only. Only page content and editor events are exchanged; never credentials or admin data.
//   iframe -> parent  { type: PREVIEW_READY }
//   parent -> iframe  { type: PREVIEW_CONTENT, pageId, templateId, content, selectedField, selectedLabel }
//   iframe -> parent  { type: FIELD_SELECTED, field, tagName, textField? }
export const PREVIEW_READY = 'cms-preview-ready'
export const PREVIEW_CONTENT = 'cms-preview-content'
export const FIELD_SELECTED = 'cms-field-selected'

export const PREVIEW_ROUTE = '/admin/live-preview'

// The preview's viewport width: a real desktop width (above the site's 66rem / 1056px breakpoint),
// shrunk only to fit the editor canvas. The editor shows the desktop layout only.
export const PREVIEW_WIDTH = 1440
