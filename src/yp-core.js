let Doc = document

function createEl(tag, attrs, app) {
	var el=Doc.createElement(tag)
	attrs && addAttrs(el, attrs)
	app && app.appendChild(el)
	return el
}

function createSvgEl(tag, attrs, app) {
	var el=Doc.createElementNS('http://www.w3.org/2000/svg', tag)
	attrs && addAttrs(el, attrs)
	app && app.appendChild(el)
	return el
}

function addAttrs(el, attrs) {
	for(var k in attrs) el.setAttribute(k=='c' ? 'class' : k, attrs[k])
}

/**
 * @param  {string} qs
 * @param  {Element=} ctx
 * @return {NodeList}
 */
function getEls(qs, ctx) {
	var c=ctx || Doc
	return c.querySelectorAll(qs)
}

/**
 * @param  {Element} el     Start element
 * @param  {string} sel 	Selector to search in parents
 * @return {Node|null}   First parent node matching to selector sel
 */
function findParentMatch(el, sel) {
	var curEl = el
	while(curEl && !curEl.parentNode.querySelector(sel)) curEl=curEl.parentNode
	return curEl
}

export {
	getEls,
	addAttrs,
	createEl,
	createSvgEl,
	findParentMatch
};