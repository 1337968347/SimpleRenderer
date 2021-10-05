const NAMESPACE = 'app';
const BUILD = /* app */ { allRenderFn: true, appendChildSlotFix: false, asyncLoading: true, asyncQueue: false, attachStyles: true, cloneNodeFix: false, cmpDidLoad: false, cmpDidRender: false, cmpDidUnload: false, cmpDidUpdate: false, cmpShouldUpdate: false, cmpWillLoad: false, cmpWillRender: false, cmpWillUpdate: false, connectedCallback: false, constructableCSS: false, cssAnnotations: true, cssVarShim: false, devTools: true, disconnectedCallback: false, dynamicImportShim: false, element: false, event: false, hasRenderFn: false, hostListener: false, hostListenerTarget: false, hostListenerTargetBody: false, hostListenerTargetDocument: false, hostListenerTargetParent: false, hostListenerTargetWindow: false, hotModuleReplacement: true, hydrateClientSide: false, hydrateServerSide: false, hydratedAttribute: false, hydratedClass: true, initializeNextTick: false, invisiblePrehydration: true, isDebug: false, isDev: true, isTesting: false, lazyLoad: true, lifecycle: false, lifecycleDOMEvents: false, member: true, method: false, mode: false, observeAttribute: false, profile: true, prop: false, propBoolean: false, propMutable: false, propNumber: false, propString: false, reflect: false, safari10: false, scoped: false, scopedSlotTextContentFix: false, scriptDataOpts: false, shadowDelegatesFocus: false, shadowDom: false, shadowDomShim: false, slot: false, slotChildNodesFix: false, slotRelocation: false, state: false, style: false, svg: false, taskQueue: true, transformTagName: false, updatable: true, vdomAttribute: false, vdomClass: false, vdomFunctional: false, vdomKey: false, vdomListener: false, vdomPropOrAttr: false, vdomRef: false, vdomRender: false, vdomStyle: false, vdomText: false, vdomXlink: false, watchCallback: false };
const Env = /* app */ {};

let scopeId;
let contentRef;
let hostTagName;
let customError;
let i = 0;
let useNativeShadowDom = false;
let checkSlotFallbackVisibility = false;
let checkSlotRelocate = false;
let isSvgMode = false;
let renderingRef = null;
let queueCongestion = 0;
let queuePending = false;
const win = typeof window !== 'undefined' ? window : {};
const CSS = BUILD.cssVarShim ? win.CSS : null;
const doc = win.document || { head: {} };
const H = (win.HTMLElement || class {
});
const plt = {
    $flags$: 0,
    $resourcesUrl$: '',
    jmp: (h) => h(),
    raf: (h) => requestAnimationFrame(h),
    ael: (el, eventName, listener, opts) => el.addEventListener(eventName, listener, opts),
    rel: (el, eventName, listener, opts) => el.removeEventListener(eventName, listener, opts),
    ce: (eventName, opts) => new CustomEvent(eventName, opts),
};
const setPlatformHelpers = (helpers) => {
    Object.assign(plt, helpers);
};
const supportsShadow = BUILD.shadowDomShim && BUILD.shadowDom
    ? /*@__PURE__*/ (() => (doc.head.attachShadow + '').indexOf('[native') > -1)()
    : true;
const supportsListenerOptions = /*@__PURE__*/ (() => {
    let supportsListenerOptions = false;
    try {
        doc.addEventListener('e', null, Object.defineProperty({}, 'passive', {
            get() {
                supportsListenerOptions = true;
            },
        }));
    }
    catch (e) { }
    return supportsListenerOptions;
})();
const promiseResolve = (v) => Promise.resolve(v);
const supportsConstructibleStylesheets = BUILD.constructableCSS
    ? /*@__PURE__*/ (() => {
        try {
            new CSSStyleSheet();
            return typeof new CSSStyleSheet().replace === 'function';
        }
        catch (e) { }
        return false;
    })()
    : false;
const Context = {};
const addHostEventListeners = (elm, hostRef, listeners, attachParentListeners) => {
    if (BUILD.hostListener && listeners) {
        // this is called immediately within the element's constructor
        // initialize our event listeners on the host element
        // we do this now so that we can listen to events that may
        // have fired even before the instance is ready
        if (BUILD.hostListenerTargetParent) {
            // this component may have event listeners that should be attached to the parent
            if (attachParentListeners) {
                // this is being ran from within the connectedCallback
                // which is important so that we know the host element actually has a parent element
                // filter out the listeners to only have the ones that ARE being attached to the parent
                listeners = listeners.filter(([flags]) => flags & 32 /* TargetParent */);
            }
            else {
                // this is being ran from within the component constructor
                // everything BUT the parent element listeners should be attached at this time
                // filter out the listeners that are NOT being attached to the parent
                listeners = listeners.filter(([flags]) => !(flags & 32 /* TargetParent */));
            }
        }
        listeners.map(([flags, name, method]) => {
            const target = BUILD.hostListenerTarget ? getHostListenerTarget(elm, flags) : elm;
            const handler = hostListenerProxy(hostRef, method);
            const opts = hostListenerOpts(flags);
            plt.ael(target, name, handler, opts);
            (hostRef.$rmListeners$ = hostRef.$rmListeners$ || []).push(() => plt.rel(target, name, handler, opts));
        });
    }
};
const hostListenerProxy = (hostRef, methodName) => (ev) => {
    try {
        if (BUILD.lazyLoad) {
            if (hostRef.$flags$ & 256 /* isListenReady */) {
                // instance is ready, let's call it's member method for this event
                hostRef.$lazyInstance$[methodName](ev);
            }
            else {
                (hostRef.$queuedListeners$ = hostRef.$queuedListeners$ || []).push([methodName, ev]);
            }
        }
        else {
            hostRef.$hostElement$[methodName](ev);
        }
    }
    catch (e) {
        consoleError(e);
    }
};
const getHostListenerTarget = (elm, flags) => {
    if (BUILD.hostListenerTargetDocument && flags & 4 /* TargetDocument */)
        return doc;
    if (BUILD.hostListenerTargetWindow && flags & 8 /* TargetWindow */)
        return win;
    if (BUILD.hostListenerTargetBody && flags & 16 /* TargetBody */)
        return doc.body;
    if (BUILD.hostListenerTargetParent && flags & 32 /* TargetParent */)
        return elm.parentElement;
    return elm;
};
// prettier-ignore
const hostListenerOpts = (flags) => supportsListenerOptions
    ? ({
        passive: (flags & 1 /* Passive */) !== 0,
        capture: (flags & 2 /* Capture */) !== 0,
    })
    : (flags & 2 /* Capture */) !== 0;
const CONTENT_REF_ID = 'r';
const ORG_LOCATION_ID = 'o';
const SLOT_NODE_ID = 's';
const TEXT_NODE_ID = 't';
const HYDRATE_ID = 's-id';
const HYDRATED_STYLE_ID = 'sty-id';
const HYDRATE_CHILD_ID = 'c-id';
const HYDRATED_CSS = '{visibility:hidden}.hydrated{visibility:inherit}';
const XLINK_NS = 'http://www.w3.org/1999/xlink';
const createTime = (fnName, tagName = '') => {
    if (BUILD.profile && performance.mark) {
        const key = `st:${fnName}:${tagName}:${i++}`;
        // Start
        performance.mark(key);
        // End
        return () => performance.measure(`[Stencil] ${fnName}() <${tagName}>`, key);
    }
    else {
        return () => {
            return;
        };
    }
};
const uniqueTime = (key, measureText) => {
    if (BUILD.profile && performance.mark) {
        if (performance.getEntriesByName(key).length === 0) {
            performance.mark(key);
        }
        return () => {
            if (performance.getEntriesByName(measureText).length === 0) {
                performance.measure(measureText, key);
            }
        };
    }
    else {
        return () => {
            return;
        };
    }
};
const inspect = (ref) => {
    const hostRef = getHostRef(ref);
    if (!hostRef) {
        return undefined;
    }
    const flags = hostRef.$flags$;
    const hostElement = hostRef.$hostElement$;
    return {
        renderCount: hostRef.$renderCount$,
        flags: {
            hasRendered: !!(flags & 2 /* hasRendered */),
            hasConnected: !!(flags & 1 /* hasConnected */),
            isWaitingForChildren: !!(flags & 4 /* isWaitingForChildren */),
            isConstructingInstance: !!(flags & 8 /* isConstructingInstance */),
            isQueuedForUpdate: !!(flags & 16 /* isQueuedForUpdate */),
            hasInitializedComponent: !!(flags & 32 /* hasInitializedComponent */),
            hasLoadedComponent: !!(flags & 64 /* hasLoadedComponent */),
            isWatchReady: !!(flags & 128 /* isWatchReady */),
            isListenReady: !!(flags & 256 /* isListenReady */),
            needsRerender: !!(flags & 512 /* needsRerender */),
        },
        instanceValues: hostRef.$instanceValues$,
        ancestorComponent: hostRef.$ancestorComponent$,
        hostElement,
        lazyInstance: hostRef.$lazyInstance$,
        vnode: hostRef.$vnode$,
        modeName: hostRef.$modeName$,
        onReadyPromise: hostRef.$onReadyPromise$,
        onReadyResolve: hostRef.$onReadyResolve$,
        onInstancePromise: hostRef.$onInstancePromise$,
        onInstanceResolve: hostRef.$onInstanceResolve$,
        onRenderResolve: hostRef.$onRenderResolve$,
        queuedListeners: hostRef.$queuedListeners$,
        rmListeners: hostRef.$rmListeners$,
        ['s-id']: hostElement['s-id'],
        ['s-cr']: hostElement['s-cr'],
        ['s-lr']: hostElement['s-lr'],
        ['s-p']: hostElement['s-p'],
        ['s-rc']: hostElement['s-rc'],
        ['s-sc']: hostElement['s-sc'],
    };
};
const installDevTools = () => {
    if (BUILD.devTools) {
        const stencil = (win.stencil = win.stencil || {});
        const originalInspect = stencil.inspect;
        stencil.inspect = (ref) => {
            let result = inspect(ref);
            if (!result && typeof originalInspect === 'function') {
                result = originalInspect(ref);
            }
            return result;
        };
    }
};
const rootAppliedStyles = new WeakMap();
const registerStyle = (scopeId, cssText, allowCS) => {
    let style = styles.get(scopeId);
    if (supportsConstructibleStylesheets && allowCS) {
        style = (style || new CSSStyleSheet());
        style.replace(cssText);
    }
    else {
        style = cssText;
    }
    styles.set(scopeId, style);
};
const addStyle = (styleContainerNode, cmpMeta, mode, hostElm) => {
    let scopeId = getScopeId(cmpMeta, mode);
    let style = styles.get(scopeId);
    if (!BUILD.attachStyles) {
        return scopeId;
    }
    // if an element is NOT connected then getRootNode() will return the wrong root node
    // so the fallback is to always use the document for the root node in those cases
    styleContainerNode = styleContainerNode.nodeType === 11 /* DocumentFragment */ ? styleContainerNode : doc;
    if (style) {
        if (typeof style === 'string') {
            styleContainerNode = styleContainerNode.head || styleContainerNode;
            let appliedStyles = rootAppliedStyles.get(styleContainerNode);
            let styleElm;
            if (!appliedStyles) {
                rootAppliedStyles.set(styleContainerNode, (appliedStyles = new Set()));
            }
            if (!appliedStyles.has(scopeId)) {
                if (BUILD.hydrateClientSide &&
                    styleContainerNode.host &&
                    (styleElm = styleContainerNode.querySelector(`[${HYDRATED_STYLE_ID}="${scopeId}"]`))) {
                    // This is only happening on native shadow-dom, do not needs CSS var shim
                    styleElm.innerHTML = style;
                }
                else {
                    if (BUILD.cssVarShim && plt.$cssShim$) {
                        styleElm = plt.$cssShim$.createHostStyle(hostElm, scopeId, style, !!(cmpMeta.$flags$ & 10 /* needsScopedEncapsulation */));
                        const newScopeId = styleElm['s-sc'];
                        if (newScopeId) {
                            scopeId = newScopeId;
                            // we don't want to add this styleID to the appliedStyles Set
                            // since the cssVarShim might need to apply several different
                            // stylesheets for the same component
                            appliedStyles = null;
                        }
                    }
                    else {
                        styleElm = doc.createElement('style');
                        styleElm.innerHTML = style;
                    }
                    if (BUILD.hydrateServerSide || BUILD.hotModuleReplacement) {
                        styleElm.setAttribute(HYDRATED_STYLE_ID, scopeId);
                    }
                    styleContainerNode.insertBefore(styleElm, styleContainerNode.querySelector('link'));
                }
                if (appliedStyles) {
                    appliedStyles.add(scopeId);
                }
            }
        }
        else if (BUILD.constructableCSS && !styleContainerNode.adoptedStyleSheets.includes(style)) {
            styleContainerNode.adoptedStyleSheets = [...styleContainerNode.adoptedStyleSheets, style];
        }
    }
    return scopeId;
};
const attachStyles = (hostRef) => {
    const cmpMeta = hostRef.$cmpMeta$;
    const elm = hostRef.$hostElement$;
    const flags = cmpMeta.$flags$;
    const endAttachStyles = createTime('attachStyles', cmpMeta.$tagName$);
    const scopeId = addStyle(BUILD.shadowDom && supportsShadow && elm.shadowRoot ? elm.shadowRoot : elm.getRootNode(), cmpMeta, hostRef.$modeName$, elm);
    if ((BUILD.shadowDom || BUILD.scoped) && BUILD.cssAnnotations && flags & 10 /* needsScopedEncapsulation */) {
        // only required when we're NOT using native shadow dom (slot)
        // or this browser doesn't support native shadow dom
        // and this host element was NOT created with SSR
        // let's pick out the inner content for slot projection
        // create a node to represent where the original
        // content was first placed, which is useful later on
        // DOM WRITE!!
        elm['s-sc'] = scopeId;
        elm.classList.add(scopeId + '-h');
        if (BUILD.scoped && flags & 2 /* scopedCssEncapsulation */) {
            elm.classList.add(scopeId + '-s');
        }
    }
    endAttachStyles();
};
const getScopeId = (cmp, mode) => 'sc-' + (BUILD.mode && mode && cmp.$flags$ & 32 /* hasMode */ ? cmp.$tagName$ + '-' + mode : cmp.$tagName$);
const convertScopedToShadow = (css) => css.replace(/\/\*!@([^\/]+)\*\/[^\{]+\{/g, '$1{');
// Private
const computeMode = (elm) => modeResolutionChain.map((h) => h(elm)).find((m) => !!m);
// Public
const setMode = (handler) => modeResolutionChain.push(handler);
const getMode = (ref) => getHostRef(ref).$modeName$;
/**
 * Default style mode id
 */
/**
 * Reusable empty obj/array
 * Don't add values to these!!
 */
const EMPTY_OBJ = {};
/**
 * Namespaces
 */
const SVG_NS = 'http://www.w3.org/2000/svg';
const HTML_NS = 'http://www.w3.org/1999/xhtml';
const isDef = (v) => v != null;
const isComplexType = (o) => {
    // https://jsperf.com/typeof-fn-object/5
    o = typeof o;
    return o === 'object' || o === 'function';
};
/**
 * Production h() function based on Preact by
 * Jason Miller (@developit)
 * Licensed under the MIT License
 * https://github.com/developit/preact/blob/master/LICENSE
 *
 * Modified for Stencil's compiler and vdom
 */
// const stack: any[] = [];
// export function h(nodeName: string | d.FunctionalComponent, vnodeData: d.PropsType, child?: d.ChildType): d.VNode;
// export function h(nodeName: string | d.FunctionalComponent, vnodeData: d.PropsType, ...children: d.ChildType[]): d.VNode;
const h = (nodeName, vnodeData, ...children) => {
    let child = null;
    let key = null;
    let slotName = null;
    let simple = false;
    let lastSimple = false;
    let vNodeChildren = [];
    const walk = (c) => {
        for (let i = 0; i < c.length; i++) {
            child = c[i];
            if (Array.isArray(child)) {
                walk(child);
            }
            else if (child != null && typeof child !== 'boolean') {
                if ((simple = typeof nodeName !== 'function' && !isComplexType(child))) {
                    child = String(child);
                }
                else if (BUILD.isDev && typeof nodeName !== 'function' && child.$flags$ === undefined) {
                    consoleDevError(`vNode passed as children has unexpected type.
Make sure it's using the correct h() function.
Empty objects can also be the cause, look for JSX comments that became objects.`);
                }
                if (simple && lastSimple) {
                    // If the previous child was simple (string), we merge both
                    vNodeChildren[vNodeChildren.length - 1].$text$ += child;
                }
                else {
                    // Append a new vNode, if it's text, we create a text vNode
                    vNodeChildren.push(simple ? newVNode(null, child) : child);
                }
                lastSimple = simple;
            }
        }
    };
    walk(children);
    if (vnodeData) {
        if (BUILD.isDev && nodeName === 'input') {
            validateInputProperties(vnodeData);
        }
        // normalize class / classname attributes
        if (BUILD.vdomKey && vnodeData.key) {
            key = vnodeData.key;
        }
        if (BUILD.slotRelocation && vnodeData.name) {
            slotName = vnodeData.name;
        }
        if (BUILD.vdomClass) {
            const classData = vnodeData.className || vnodeData.class;
            if (classData) {
                vnodeData.class =
                    typeof classData !== 'object'
                        ? classData
                        : Object.keys(classData)
                            .filter((k) => classData[k])
                            .join(' ');
            }
        }
    }
    if (BUILD.isDev && vNodeChildren.some(isHost)) {
        consoleDevError(`The <Host> must be the single root component. Make sure:
- You are NOT using hostData() and <Host> in the same component.
- <Host> is used once, and it's the single root component of the render() function.`);
    }
    if (BUILD.vdomFunctional && typeof nodeName === 'function') {
        // nodeName is a functional component
        return nodeName(vnodeData === null ? {} : vnodeData, vNodeChildren, vdomFnUtils);
    }
    const vnode = newVNode(nodeName, null);
    vnode.$attrs$ = vnodeData;
    if (vNodeChildren.length > 0) {
        vnode.$children$ = vNodeChildren;
    }
    if (BUILD.vdomKey) {
        vnode.$key$ = key;
    }
    if (BUILD.slotRelocation) {
        vnode.$name$ = slotName;
    }
    return vnode;
};
const newVNode = (tag, text) => {
    const vnode = {
        $flags$: 0,
        $tag$: tag,
        $text$: text,
        $elm$: null,
        $children$: null,
    };
    if (BUILD.vdomAttribute) {
        vnode.$attrs$ = null;
    }
    if (BUILD.vdomKey) {
        vnode.$key$ = null;
    }
    if (BUILD.slotRelocation) {
        vnode.$name$ = null;
    }
    return vnode;
};
const Host = {};
const isHost = (node) => node && node.$tag$ === Host;
const vdomFnUtils = {
    forEach: (children, cb) => children.map(convertToPublic).forEach(cb),
    map: (children, cb) => children.map(convertToPublic).map(cb).map(convertToPrivate),
};
const convertToPublic = (node) => ({
    vattrs: node.$attrs$,
    vchildren: node.$children$,
    vkey: node.$key$,
    vname: node.$name$,
    vtag: node.$tag$,
    vtext: node.$text$,
});
const convertToPrivate = (node) => {
    if (typeof node.vtag === 'function') {
        const vnodeData = Object.assign({}, node.vattrs);
        if (node.vkey) {
            vnodeData.key = node.vkey;
        }
        if (node.vname) {
            vnodeData.name = node.vname;
        }
        return h(node.vtag, vnodeData, ...(node.vchildren || []));
    }
    const vnode = newVNode(node.vtag, node.vtext);
    vnode.$attrs$ = node.vattrs;
    vnode.$children$ = node.vchildren;
    vnode.$key$ = node.vkey;
    vnode.$name$ = node.vname;
    return vnode;
};
const validateInputProperties = (vnodeData) => {
    const props = Object.keys(vnodeData);
    const typeIndex = props.indexOf('type');
    const minIndex = props.indexOf('min');
    const maxIndex = props.indexOf('max');
    const stepIndex = props.indexOf('min');
    const value = props.indexOf('value');
    if (value === -1) {
        return;
    }
    if (value < typeIndex || value < minIndex || value < maxIndex || value < stepIndex) {
        consoleDevWarn(`The "value" prop of <input> should be set after "min", "max", "type" and "step"`);
    }
};
/**
 * Production setAccessor() function based on Preact by
 * Jason Miller (@developit)
 * Licensed under the MIT License
 * https://github.com/developit/preact/blob/master/LICENSE
 *
 * Modified for Stencil's compiler and vdom
 */
const setAccessor = (elm, memberName, oldValue, newValue, isSvg, flags) => {
    if (oldValue !== newValue) {
        let isProp = isMemberInElement(elm, memberName);
        let ln = memberName.toLowerCase();
        if (BUILD.vdomClass && memberName === 'class') {
            const classList = elm.classList;
            const oldClasses = parseClassList(oldValue);
            const newClasses = parseClassList(newValue);
            classList.remove(...oldClasses.filter((c) => c && !newClasses.includes(c)));
            classList.add(...newClasses.filter((c) => c && !oldClasses.includes(c)));
        }
        else if (BUILD.vdomStyle && memberName === 'style') {
            // update style attribute, css properties and values
            if (BUILD.updatable) {
                for (const prop in oldValue) {
                    if (!newValue || newValue[prop] == null) {
                        if (!BUILD.hydrateServerSide && prop.includes('-')) {
                            elm.style.removeProperty(prop);
                        }
                        else {
                            elm.style[prop] = '';
                        }
                    }
                }
            }
            for (const prop in newValue) {
                if (!oldValue || newValue[prop] !== oldValue[prop]) {
                    if (!BUILD.hydrateServerSide && prop.includes('-')) {
                        elm.style.setProperty(prop, newValue[prop]);
                    }
                    else {
                        elm.style[prop] = newValue[prop];
                    }
                }
            }
        }
        else if (BUILD.vdomKey && memberName === 'key')
            ;
        else if (BUILD.vdomRef && memberName === 'ref') {
            // minifier will clean this up
            if (newValue) {
                newValue(elm);
            }
        }
        else if (BUILD.vdomListener &&
            (BUILD.lazyLoad ? !isProp : !elm.__lookupSetter__(memberName)) &&
            memberName[0] === 'o' &&
            memberName[1] === 'n') {
            // Event Handlers
            // so if the member name starts with "on" and the 3rd characters is
            // a capital letter, and it's not already a member on the element,
            // then we're assuming it's an event listener
            if (memberName[2] === '-') {
                // on- prefixed events
                // allows to be explicit about the dom event to listen without any magic
                // under the hood:
                // <my-cmp on-click> // listens for "click"
                // <my-cmp on-Click> // listens for "Click"
                // <my-cmp on-ionChange> // listens for "ionChange"
                // <my-cmp on-EVENTS> // listens for "EVENTS"
                memberName = memberName.slice(3);
            }
            else if (isMemberInElement(win, ln)) {
                // standard event
                // the JSX attribute could have been "onMouseOver" and the
                // member name "onmouseover" is on the window's prototype
                // so let's add the listener "mouseover", which is all lowercased
                memberName = ln.slice(2);
            }
            else {
                // custom event
                // the JSX attribute could have been "onMyCustomEvent"
                // so let's trim off the "on" prefix and lowercase the first character
                // and add the listener "myCustomEvent"
                // except for the first character, we keep the event name case
                memberName = ln[2] + memberName.slice(3);
            }
            if (oldValue) {
                plt.rel(elm, memberName, oldValue, false);
            }
            if (newValue) {
                plt.ael(elm, memberName, newValue, false);
            }
        }
        else if (BUILD.vdomPropOrAttr) {
            // Set property if it exists and it's not a SVG
            const isComplex = isComplexType(newValue);
            if ((isProp || (isComplex && newValue !== null)) && !isSvg) {
                try {
                    if (!elm.tagName.includes('-')) {
                        let n = newValue == null ? '' : newValue;
                        // Workaround for Safari, moving the <input> caret when re-assigning the same valued
                        if (memberName === 'list') {
                            isProp = false;
                            // tslint:disable-next-line: triple-equals
                        }
                        else if (oldValue == null || elm[memberName] != n) {
                            elm[memberName] = n;
                        }
                    }
                    else {
                        elm[memberName] = newValue;
                    }
                }
                catch (e) { }
            }
            /**
             * Need to manually update attribute if:
             * - memberName is not an attribute
             * - if we are rendering the host element in order to reflect attribute
             * - if it's a SVG, since properties might not work in <svg>
             * - if the newValue is null/undefined or 'false'.
             */
            let xlink = false;
            if (BUILD.vdomXlink) {
                if (ln !== (ln = ln.replace(/^xlink\:?/, ''))) {
                    memberName = ln;
                    xlink = true;
                }
            }
            if (newValue == null || newValue === false) {
                if (newValue !== false || elm.getAttribute(memberName) === '') {
                    if (BUILD.vdomXlink && xlink) {
                        elm.removeAttributeNS(XLINK_NS, memberName);
                    }
                    else {
                        elm.removeAttribute(memberName);
                    }
                }
            }
            else if ((!isProp || flags & 4 /* isHost */ || isSvg) && !isComplex) {
                newValue = newValue === true ? '' : newValue;
                if (BUILD.vdomXlink && xlink) {
                    elm.setAttributeNS(XLINK_NS, memberName, newValue);
                }
                else {
                    elm.setAttribute(memberName, newValue);
                }
            }
        }
    }
};
const parseClassListRegex = /\s/;
const parseClassList = (value) => (!value ? [] : value.split(parseClassListRegex));
const updateElement = (oldVnode, newVnode, isSvgMode, memberName) => {
    // if the element passed in is a shadow root, which is a document fragment
    // then we want to be adding attrs/props to the shadow root's "host" element
    // if it's not a shadow root, then we add attrs/props to the same element
    const elm = newVnode.$elm$.nodeType === 11 /* DocumentFragment */ && newVnode.$elm$.host
        ? newVnode.$elm$.host
        : newVnode.$elm$;
    const oldVnodeAttrs = (oldVnode && oldVnode.$attrs$) || EMPTY_OBJ;
    const newVnodeAttrs = newVnode.$attrs$ || EMPTY_OBJ;
    if (BUILD.updatable) {
        // remove attributes no longer present on the vnode by setting them to undefined
        for (memberName in oldVnodeAttrs) {
            if (!(memberName in newVnodeAttrs)) {
                setAccessor(elm, memberName, oldVnodeAttrs[memberName], undefined, isSvgMode, newVnode.$flags$);
            }
        }
    }
    // add new & update changed attributes
    for (memberName in newVnodeAttrs) {
        setAccessor(elm, memberName, oldVnodeAttrs[memberName], newVnodeAttrs[memberName], isSvgMode, newVnode.$flags$);
    }
};
const createElm = (oldParentVNode, newParentVNode, childIndex, parentElm) => {
    // tslint:disable-next-line: prefer-const
    let newVNode = newParentVNode.$children$[childIndex];
    let i = 0;
    let elm;
    let childNode;
    let oldVNode;
    if (BUILD.slotRelocation && !useNativeShadowDom) {
        // remember for later we need to check to relocate nodes
        checkSlotRelocate = true;
        if (newVNode.$tag$ === 'slot') {
            if (scopeId) {
                // scoped css needs to add its scoped id to the parent element
                parentElm.classList.add(scopeId + '-s');
            }
            newVNode.$flags$ |= newVNode.$children$
                ? // slot element has fallback content
                    2 /* isSlotFallback */
                : // slot element does not have fallback content
                    1 /* isSlotReference */;
        }
    }
    if (BUILD.isDev && newVNode.$elm$) {
        consoleDevError(`The JSX ${newVNode.$text$ !== null ? `"${newVNode.$text$}" text` : `"${newVNode.$tag$}" element`} node should not be shared within the same renderer. The renderer caches element lookups in order to improve performance. However, a side effect from this is that the exact same JSX node should not be reused. For more information please see https://stenciljs.com/docs/templating-jsx#avoid-shared-jsx-nodes`);
    }
    if (BUILD.vdomText && newVNode.$text$ !== null) {
        // create text node
        elm = newVNode.$elm$ = doc.createTextNode(newVNode.$text$);
    }
    else if (BUILD.slotRelocation && newVNode.$flags$ & 1 /* isSlotReference */) {
        // create a slot reference node
        elm = newVNode.$elm$ =
            BUILD.isDebug || BUILD.hydrateServerSide ? slotReferenceDebugNode(newVNode) : doc.createTextNode('');
    }
    else {
        if (BUILD.svg && !isSvgMode) {
            isSvgMode = newVNode.$tag$ === 'svg';
        }
        // create element
        elm = newVNode.$elm$ = (BUILD.svg
            ? doc.createElementNS(isSvgMode ? SVG_NS : HTML_NS, BUILD.slotRelocation && newVNode.$flags$ & 2 /* isSlotFallback */
                ? 'slot-fb'
                : newVNode.$tag$)
            : doc.createElement(BUILD.slotRelocation && newVNode.$flags$ & 2 /* isSlotFallback */
                ? 'slot-fb'
                : newVNode.$tag$));
        if (BUILD.svg && isSvgMode && newVNode.$tag$ === 'foreignObject') {
            isSvgMode = false;
        }
        // add css classes, attrs, props, listeners, etc.
        if (BUILD.vdomAttribute) {
            updateElement(null, newVNode, isSvgMode);
        }
        if ((BUILD.shadowDom || BUILD.scoped) && isDef(scopeId) && elm['s-si'] !== scopeId) {
            // if there is a scopeId and this is the initial render
            // then let's add the scopeId as a css class
            elm.classList.add((elm['s-si'] = scopeId));
        }
        if (newVNode.$children$) {
            for (i = 0; i < newVNode.$children$.length; ++i) {
                // create the node
                childNode = createElm(oldParentVNode, newVNode, i, elm);
                // return node could have been null
                if (childNode) {
                    // append our new node
                    elm.appendChild(childNode);
                }
            }
        }
        if (BUILD.svg) {
            if (newVNode.$tag$ === 'svg') {
                // Only reset the SVG context when we're exiting <svg> element
                isSvgMode = false;
            }
            else if (elm.tagName === 'foreignObject') {
                // Reenter SVG context when we're exiting <foreignObject> element
                isSvgMode = true;
            }
        }
    }
    if (BUILD.slotRelocation) {
        elm['s-hn'] = hostTagName;
        if (newVNode.$flags$ & (2 /* isSlotFallback */ | 1 /* isSlotReference */)) {
            // remember the content reference comment
            elm['s-sr'] = true;
            // remember the content reference comment
            elm['s-cr'] = contentRef;
            // remember the slot name, or empty string for default slot
            elm['s-sn'] = newVNode.$name$ || '';
            // check if we've got an old vnode for this slot
            oldVNode = oldParentVNode && oldParentVNode.$children$ && oldParentVNode.$children$[childIndex];
            if (oldVNode && oldVNode.$tag$ === newVNode.$tag$ && oldParentVNode.$elm$) {
                // we've got an old slot vnode and the wrapper is being replaced
                // so let's move the old slot content back to it's original location
                putBackInOriginalLocation(oldParentVNode.$elm$, false);
            }
        }
    }
    return elm;
};
const putBackInOriginalLocation = (parentElm, recursive) => {
    plt.$flags$ |= 1 /* isTmpDisconnected */;
    const oldSlotChildNodes = parentElm.childNodes;
    for (let i = oldSlotChildNodes.length - 1; i >= 0; i--) {
        const childNode = oldSlotChildNodes[i];
        if (childNode['s-hn'] !== hostTagName && childNode['s-ol']) {
            // // this child node in the old element is from another component
            // // remove this node from the old slot's parent
            // childNode.remove();
            // and relocate it back to it's original location
            parentReferenceNode(childNode).insertBefore(childNode, referenceNode(childNode));
            // remove the old original location comment entirely
            // later on the patch function will know what to do
            // and move this to the correct spot in need be
            childNode['s-ol'].remove();
            childNode['s-ol'] = undefined;
            checkSlotRelocate = true;
        }
        if (recursive) {
            putBackInOriginalLocation(childNode, recursive);
        }
    }
    plt.$flags$ &= ~1 /* isTmpDisconnected */;
};
const addVnodes = (parentElm, before, parentVNode, vnodes, startIdx, endIdx) => {
    let containerElm = ((BUILD.slotRelocation && parentElm['s-cr'] && parentElm['s-cr'].parentNode) || parentElm);
    let childNode;
    if (BUILD.shadowDom && containerElm.shadowRoot && containerElm.tagName === hostTagName) {
        containerElm = containerElm.shadowRoot;
    }
    for (; startIdx <= endIdx; ++startIdx) {
        if (vnodes[startIdx]) {
            childNode = createElm(null, parentVNode, startIdx, parentElm);
            if (childNode) {
                vnodes[startIdx].$elm$ = childNode;
                containerElm.insertBefore(childNode, BUILD.slotRelocation ? referenceNode(before) : before);
            }
        }
    }
};
const removeVnodes = (vnodes, startIdx, endIdx, vnode, elm) => {
    for (; startIdx <= endIdx; ++startIdx) {
        if ((vnode = vnodes[startIdx])) {
            elm = vnode.$elm$;
            callNodeRefs(vnode);
            if (BUILD.slotRelocation) {
                // we're removing this element
                // so it's possible we need to show slot fallback content now
                checkSlotFallbackVisibility = true;
                if (elm['s-ol']) {
                    // remove the original location comment
                    elm['s-ol'].remove();
                }
                else {
                    // it's possible that child nodes of the node
                    // that's being removed are slot nodes
                    putBackInOriginalLocation(elm, true);
                }
            }
            // remove the vnode's element from the dom
            elm.remove();
        }
    }
};
const updateChildren = (parentElm, oldCh, newVNode, newCh) => {
    let oldStartIdx = 0;
    let newStartIdx = 0;
    let idxInOld = 0;
    let i = 0;
    let oldEndIdx = oldCh.length - 1;
    let oldStartVnode = oldCh[0];
    let oldEndVnode = oldCh[oldEndIdx];
    let newEndIdx = newCh.length - 1;
    let newStartVnode = newCh[0];
    let newEndVnode = newCh[newEndIdx];
    let node;
    let elmToMove;
    while (oldStartIdx <= oldEndIdx && newStartIdx <= newEndIdx) {
        if (oldStartVnode == null) {
            // Vnode might have been moved left
            oldStartVnode = oldCh[++oldStartIdx];
        }
        else if (oldEndVnode == null) {
            oldEndVnode = oldCh[--oldEndIdx];
        }
        else if (newStartVnode == null) {
            newStartVnode = newCh[++newStartIdx];
        }
        else if (newEndVnode == null) {
            newEndVnode = newCh[--newEndIdx];
        }
        else if (isSameVnode(oldStartVnode, newStartVnode)) {
            patch(oldStartVnode, newStartVnode);
            oldStartVnode = oldCh[++oldStartIdx];
            newStartVnode = newCh[++newStartIdx];
        }
        else if (isSameVnode(oldEndVnode, newEndVnode)) {
            patch(oldEndVnode, newEndVnode);
            oldEndVnode = oldCh[--oldEndIdx];
            newEndVnode = newCh[--newEndIdx];
        }
        else if (isSameVnode(oldStartVnode, newEndVnode)) {
            // Vnode moved right
            if (BUILD.slotRelocation && (oldStartVnode.$tag$ === 'slot' || newEndVnode.$tag$ === 'slot')) {
                putBackInOriginalLocation(oldStartVnode.$elm$.parentNode, false);
            }
            patch(oldStartVnode, newEndVnode);
            parentElm.insertBefore(oldStartVnode.$elm$, oldEndVnode.$elm$.nextSibling);
            oldStartVnode = oldCh[++oldStartIdx];
            newEndVnode = newCh[--newEndIdx];
        }
        else if (isSameVnode(oldEndVnode, newStartVnode)) {
            // Vnode moved left
            if (BUILD.slotRelocation && (oldStartVnode.$tag$ === 'slot' || newEndVnode.$tag$ === 'slot')) {
                putBackInOriginalLocation(oldEndVnode.$elm$.parentNode, false);
            }
            patch(oldEndVnode, newStartVnode);
            parentElm.insertBefore(oldEndVnode.$elm$, oldStartVnode.$elm$);
            oldEndVnode = oldCh[--oldEndIdx];
            newStartVnode = newCh[++newStartIdx];
        }
        else {
            // createKeyToOldIdx
            idxInOld = -1;
            if (BUILD.vdomKey) {
                for (i = oldStartIdx; i <= oldEndIdx; ++i) {
                    if (oldCh[i] && oldCh[i].$key$ !== null && oldCh[i].$key$ === newStartVnode.$key$) {
                        idxInOld = i;
                        break;
                    }
                }
            }
            if (BUILD.vdomKey && idxInOld >= 0) {
                elmToMove = oldCh[idxInOld];
                if (elmToMove.$tag$ !== newStartVnode.$tag$) {
                    node = createElm(oldCh && oldCh[newStartIdx], newVNode, idxInOld, parentElm);
                }
                else {
                    patch(elmToMove, newStartVnode);
                    oldCh[idxInOld] = undefined;
                    node = elmToMove.$elm$;
                }
                newStartVnode = newCh[++newStartIdx];
            }
            else {
                // new element
                node = createElm(oldCh && oldCh[newStartIdx], newVNode, newStartIdx, parentElm);
                newStartVnode = newCh[++newStartIdx];
            }
            if (node) {
                if (BUILD.slotRelocation) {
                    parentReferenceNode(oldStartVnode.$elm$).insertBefore(node, referenceNode(oldStartVnode.$elm$));
                }
                else {
                    oldStartVnode.$elm$.parentNode.insertBefore(node, oldStartVnode.$elm$);
                }
            }
        }
    }
    if (oldStartIdx > oldEndIdx) {
        addVnodes(parentElm, newCh[newEndIdx + 1] == null ? null : newCh[newEndIdx + 1].$elm$, newVNode, newCh, newStartIdx, newEndIdx);
    }
    else if (BUILD.updatable && newStartIdx > newEndIdx) {
        removeVnodes(oldCh, oldStartIdx, oldEndIdx);
    }
};
const isSameVnode = (vnode1, vnode2) => {
    // compare if two vnode to see if they're "technically" the same
    // need to have the same element tag, and same key to be the same
    if (vnode1.$tag$ === vnode2.$tag$) {
        if (BUILD.slotRelocation && vnode1.$tag$ === 'slot') {
            return vnode1.$name$ === vnode2.$name$;
        }
        if (BUILD.vdomKey) {
            return vnode1.$key$ === vnode2.$key$;
        }
        return true;
    }
    return false;
};
const referenceNode = (node) => {
    // this node was relocated to a new location in the dom
    // because of some other component's slot
    // but we still have an html comment in place of where
    // it's original location was according to it's original vdom
    return (node && node['s-ol']) || node;
};
const parentReferenceNode = (node) => (node['s-ol'] ? node['s-ol'] : node).parentNode;
const patch = (oldVNode, newVNode) => {
    const elm = (newVNode.$elm$ = oldVNode.$elm$);
    const oldChildren = oldVNode.$children$;
    const newChildren = newVNode.$children$;
    const tag = newVNode.$tag$;
    const text = newVNode.$text$;
    let defaultHolder;
    if (!BUILD.vdomText || text === null) {
        if (BUILD.svg) {
            // test if we're rendering an svg element, or still rendering nodes inside of one
            // only add this to the when the compiler sees we're using an svg somewhere
            isSvgMode = tag === 'svg' ? true : tag === 'foreignObject' ? false : isSvgMode;
        }
        // element node
        if (BUILD.vdomAttribute || BUILD.reflect) {
            if (BUILD.slot && tag === 'slot')
                ;
            else {
                // either this is the first render of an element OR it's an update
                // AND we already know it's possible it could have changed
                // this updates the element's css classes, attrs, props, listeners, etc.
                updateElement(oldVNode, newVNode, isSvgMode);
            }
        }
        if (BUILD.updatable && oldChildren !== null && newChildren !== null) {
            // looks like there's child vnodes for both the old and new vnodes
            updateChildren(elm, oldChildren, newVNode, newChildren);
        }
        else if (newChildren !== null) {
            // no old child vnodes, but there are new child vnodes to add
            if (BUILD.updatable && BUILD.vdomText && oldVNode.$text$ !== null) {
                // the old vnode was text, so be sure to clear it out
                elm.textContent = '';
            }
            // add the new vnode children
            addVnodes(elm, null, newVNode, newChildren, 0, newChildren.length - 1);
        }
        else if (BUILD.updatable && oldChildren !== null) {
            // no new child vnodes, but there are old child vnodes to remove
            removeVnodes(oldChildren, 0, oldChildren.length - 1);
        }
        if (BUILD.svg && isSvgMode && tag === 'svg') {
            isSvgMode = false;
        }
    }
    else if (BUILD.vdomText && BUILD.slotRelocation && (defaultHolder = elm['s-cr'])) {
        // this element has slotted content
        defaultHolder.parentNode.textContent = text;
    }
    else if (BUILD.vdomText && oldVNode.$text$ !== text) {
        // update the text content for the text only vnode
        // and also only if the text is different than before
        elm.data = text;
    }
};
const updateFallbackSlotVisibility = (elm) => {
    // tslint:disable-next-line: prefer-const
    let childNodes = elm.childNodes;
    let childNode;
    let i;
    let ilen;
    let j;
    let slotNameAttr;
    let nodeType;
    for (i = 0, ilen = childNodes.length; i < ilen; i++) {
        childNode = childNodes[i];
        if (childNode.nodeType === 1 /* ElementNode */) {
            if (childNode['s-sr']) {
                // this is a slot fallback node
                // get the slot name for this slot reference node
                slotNameAttr = childNode['s-sn'];
                // by default always show a fallback slot node
                // then hide it if there are other slots in the light dom
                childNode.hidden = false;
                for (j = 0; j < ilen; j++) {
                    nodeType = childNodes[j].nodeType;
                    if (childNodes[j]['s-hn'] !== childNode['s-hn'] || slotNameAttr !== '') {
                        // this sibling node is from a different component OR is a named fallback slot node
                        if (nodeType === 1 /* ElementNode */ && slotNameAttr === childNodes[j].getAttribute('slot')) {
                            childNode.hidden = true;
                            break;
                        }
                    }
                    else {
                        // this is a default fallback slot node
                        // any element or text node (with content)
                        // should hide the default fallback slot node
                        if (nodeType === 1 /* ElementNode */ ||
                            (nodeType === 3 /* TextNode */ && childNodes[j].textContent.trim() !== '')) {
                            childNode.hidden = true;
                            break;
                        }
                    }
                }
            }
            // keep drilling down
            updateFallbackSlotVisibility(childNode);
        }
    }
};
const relocateNodes = [];
const relocateSlotContent = (elm) => {
    // tslint:disable-next-line: prefer-const
    let childNode;
    let node;
    let hostContentNodes;
    let slotNameAttr;
    let relocateNodeData;
    let j;
    let i = 0;
    let childNodes = elm.childNodes;
    let ilen = childNodes.length;
    for (; i < ilen; i++) {
        childNode = childNodes[i];
        if (childNode['s-sr'] && (node = childNode['s-cr']) && node.parentNode) {
            // first got the content reference comment node
            // then we got it's parent, which is where all the host content is in now
            hostContentNodes = node.parentNode.childNodes;
            slotNameAttr = childNode['s-sn'];
            for (j = hostContentNodes.length - 1; j >= 0; j--) {
                node = hostContentNodes[j];
                if (!node['s-cn'] && !node['s-nr'] && node['s-hn'] !== childNode['s-hn']) {
                    // let's do some relocating to its new home
                    // but never relocate a content reference node
                    // that is suppose to always represent the original content location
                    if (isNodeLocatedInSlot(node, slotNameAttr)) {
                        // it's possible we've already decided to relocate this node
                        relocateNodeData = relocateNodes.find((r) => r.$nodeToRelocate$ === node);
                        // made some changes to slots
                        // let's make sure we also double check
                        // fallbacks are correctly hidden or shown
                        checkSlotFallbackVisibility = true;
                        node['s-sn'] = node['s-sn'] || slotNameAttr;
                        if (relocateNodeData) {
                            // previously we never found a slot home for this node
                            // but turns out we did, so let's remember it now
                            relocateNodeData.$slotRefNode$ = childNode;
                        }
                        else {
                            // add to our list of nodes to relocate
                            relocateNodes.push({
                                $slotRefNode$: childNode,
                                $nodeToRelocate$: node,
                            });
                        }
                        if (node['s-sr']) {
                            relocateNodes.map((relocateNode) => {
                                if (isNodeLocatedInSlot(relocateNode.$nodeToRelocate$, node['s-sn'])) {
                                    relocateNodeData = relocateNodes.find((r) => r.$nodeToRelocate$ === node);
                                    if (relocateNodeData && !relocateNode.$slotRefNode$) {
                                        relocateNode.$slotRefNode$ = relocateNodeData.$slotRefNode$;
                                    }
                                }
                            });
                        }
                    }
                    else if (!relocateNodes.some((r) => r.$nodeToRelocate$ === node)) {
                        // so far this element does not have a slot home, not setting slotRefNode on purpose
                        // if we never find a home for this element then we'll need to hide it
                        relocateNodes.push({
                            $nodeToRelocate$: node,
                        });
                    }
                }
            }
        }
        if (childNode.nodeType === 1 /* ElementNode */) {
            relocateSlotContent(childNode);
        }
    }
};
const isNodeLocatedInSlot = (nodeToRelocate, slotNameAttr) => {
    if (nodeToRelocate.nodeType === 1 /* ElementNode */) {
        if (nodeToRelocate.getAttribute('slot') === null && slotNameAttr === '') {
            return true;
        }
        if (nodeToRelocate.getAttribute('slot') === slotNameAttr) {
            return true;
        }
        return false;
    }
    if (nodeToRelocate['s-sn'] === slotNameAttr) {
        return true;
    }
    return slotNameAttr === '';
};
const callNodeRefs = (vNode) => {
    if (BUILD.vdomRef) {
        vNode.$attrs$ && vNode.$attrs$.ref && vNode.$attrs$.ref(null);
        vNode.$children$ && vNode.$children$.map(callNodeRefs);
    }
};
const renderVdom = (hostRef, renderFnResults) => {
    const hostElm = hostRef.$hostElement$;
    const cmpMeta = hostRef.$cmpMeta$;
    const oldVNode = hostRef.$vnode$ || newVNode(null, null);
    const rootVnode = isHost(renderFnResults) ? renderFnResults : h(null, null, renderFnResults);
    hostTagName = hostElm.tagName;
    // <Host> runtime check
    if (BUILD.isDev && Array.isArray(renderFnResults) && renderFnResults.some(isHost)) {
        throw new Error(`The <Host> must be the single root component.
Looks like the render() function of "${hostTagName.toLowerCase()}" is returning an array that contains the <Host>.

The render() function should look like this instead:

render() {
  // Do not return an array
  return (
    <Host>{content}</Host>
  );
}
  `);
    }
    if (BUILD.reflect && cmpMeta.$attrsToReflect$) {
        rootVnode.$attrs$ = rootVnode.$attrs$ || {};
        cmpMeta.$attrsToReflect$.map(([propName, attribute]) => (rootVnode.$attrs$[attribute] = hostElm[propName]));
    }
    rootVnode.$tag$ = null;
    rootVnode.$flags$ |= 4 /* isHost */;
    hostRef.$vnode$ = rootVnode;
    rootVnode.$elm$ = oldVNode.$elm$ = (BUILD.shadowDom ? hostElm.shadowRoot || hostElm : hostElm);
    if (BUILD.scoped || BUILD.shadowDom) {
        scopeId = hostElm['s-sc'];
    }
    if (BUILD.slotRelocation) {
        contentRef = hostElm['s-cr'];
        useNativeShadowDom = supportsShadow && (cmpMeta.$flags$ & 1 /* shadowDomEncapsulation */) !== 0;
        // always reset
        checkSlotFallbackVisibility = false;
    }
    // synchronous patch
    patch(oldVNode, rootVnode);
    if (BUILD.slotRelocation) {
        // while we're moving nodes around existing nodes, temporarily disable
        // the disconnectCallback from working
        plt.$flags$ |= 1 /* isTmpDisconnected */;
        if (checkSlotRelocate) {
            relocateSlotContent(rootVnode.$elm$);
            let relocateData;
            let nodeToRelocate;
            let orgLocationNode;
            let parentNodeRef;
            let insertBeforeNode;
            let refNode;
            let i = 0;
            for (; i < relocateNodes.length; i++) {
                relocateData = relocateNodes[i];
                nodeToRelocate = relocateData.$nodeToRelocate$;
                if (!nodeToRelocate['s-ol']) {
                    // add a reference node marking this node's original location
                    // keep a reference to this node for later lookups
                    orgLocationNode =
                        BUILD.isDebug || BUILD.hydrateServerSide
                            ? originalLocationDebugNode(nodeToRelocate)
                            : doc.createTextNode('');
                    orgLocationNode['s-nr'] = nodeToRelocate;
                    nodeToRelocate.parentNode.insertBefore((nodeToRelocate['s-ol'] = orgLocationNode), nodeToRelocate);
                }
            }
            for (i = 0; i < relocateNodes.length; i++) {
                relocateData = relocateNodes[i];
                nodeToRelocate = relocateData.$nodeToRelocate$;
                if (relocateData.$slotRefNode$) {
                    // by default we're just going to insert it directly
                    // after the slot reference node
                    parentNodeRef = relocateData.$slotRefNode$.parentNode;
                    insertBeforeNode = relocateData.$slotRefNode$.nextSibling;
                    orgLocationNode = nodeToRelocate['s-ol'];
                    while ((orgLocationNode = orgLocationNode.previousSibling)) {
                        refNode = orgLocationNode['s-nr'];
                        if (refNode && refNode['s-sn'] === nodeToRelocate['s-sn'] && parentNodeRef === refNode.parentNode) {
                            refNode = refNode.nextSibling;
                            if (!refNode || !refNode['s-nr']) {
                                insertBeforeNode = refNode;
                                break;
                            }
                        }
                    }
                    if ((!insertBeforeNode && parentNodeRef !== nodeToRelocate.parentNode) ||
                        nodeToRelocate.nextSibling !== insertBeforeNode) {
                        // we've checked that it's worth while to relocate
                        // since that the node to relocate
                        // has a different next sibling or parent relocated
                        if (nodeToRelocate !== insertBeforeNode) {
                            if (!nodeToRelocate['s-hn'] && nodeToRelocate['s-ol']) {
                                // probably a component in the index.html that doesn't have it's hostname set
                                nodeToRelocate['s-hn'] = nodeToRelocate['s-ol'].parentNode.nodeName;
                            }
                            // add it back to the dom but in its new home
                            parentNodeRef.insertBefore(nodeToRelocate, insertBeforeNode);
                        }
                    }
                }
                else {
                    // this node doesn't have a slot home to go to, so let's hide it
                    if (nodeToRelocate.nodeType === 1 /* ElementNode */) {
                        nodeToRelocate.hidden = true;
                    }
                }
            }
        }
        if (checkSlotFallbackVisibility) {
            updateFallbackSlotVisibility(rootVnode.$elm$);
        }
        // done moving nodes around
        // allow the disconnect callback to work again
        plt.$flags$ &= ~1 /* isTmpDisconnected */;
        // always reset
        relocateNodes.length = 0;
    }
};
// slot comment debug nodes only created with the `--debug` flag
// otherwise these nodes are text nodes w/out content
const slotReferenceDebugNode = (slotVNode) => doc.createComment(`<slot${slotVNode.$name$ ? ' name="' + slotVNode.$name$ + '"' : ''}> (host=${hostTagName.toLowerCase()})`);
const originalLocationDebugNode = (nodeToRelocate) => doc.createComment(`org-location for ` +
    (nodeToRelocate.localName
        ? `<${nodeToRelocate.localName}> (host=${nodeToRelocate['s-hn']})`
        : `[${nodeToRelocate.textContent}]`));
const getElement = (ref) => (BUILD.lazyLoad ? getHostRef(ref).$hostElement$ : ref);
const createEvent = (ref, name, flags) => {
    const elm = getElement(ref);
    return {
        emit: (detail) => {
            if (BUILD.isDev && !elm.isConnected) {
                consoleDevWarn(`The "${name}" event was emitted, but the dispatcher node is no longer connected to the dom.`);
            }
            return emitEvent(elm, name, {
                bubbles: !!(flags & 4 /* Bubbles */),
                composed: !!(flags & 2 /* Composed */),
                cancelable: !!(flags & 1 /* Cancellable */),
                detail,
            });
        },
    };
};
/**
 * Helper function to create & dispatch a custom Event on a provided target
 * @param elm the target of the Event
 * @param name the name to give the custom Event
 * @param opts options for configuring a custom Event
 * @returns the custom Event
 */
const emitEvent = (elm, name, opts) => {
    const ev = plt.ce(name, opts);
    elm.dispatchEvent(ev);
    return ev;
};
const attachToAncestor = (hostRef, ancestorComponent) => {
    if (BUILD.asyncLoading && ancestorComponent && !hostRef.$onRenderResolve$ && ancestorComponent['s-p']) {
        ancestorComponent['s-p'].push(new Promise((r) => (hostRef.$onRenderResolve$ = r)));
    }
};
const scheduleUpdate = (hostRef, isInitialLoad) => {
    if (BUILD.taskQueue && BUILD.updatable) {
        hostRef.$flags$ |= 16 /* isQueuedForUpdate */;
    }
    if (BUILD.asyncLoading && hostRef.$flags$ & 4 /* isWaitingForChildren */) {
        hostRef.$flags$ |= 512 /* needsRerender */;
        return;
    }
    attachToAncestor(hostRef, hostRef.$ancestorComponent$);
    // there is no ancestor component or the ancestor component
    // has already fired off its lifecycle update then
    // fire off the initial update
    const dispatch = () => dispatchHooks(hostRef, isInitialLoad);
    return BUILD.taskQueue ? writeTask(dispatch) : dispatch();
};
const dispatchHooks = (hostRef, isInitialLoad) => {
    const elm = hostRef.$hostElement$;
    const endSchedule = createTime('scheduleUpdate', hostRef.$cmpMeta$.$tagName$);
    const instance = BUILD.lazyLoad ? hostRef.$lazyInstance$ : elm;
    let promise;
    if (isInitialLoad) {
        if (BUILD.lazyLoad && BUILD.hostListener) {
            hostRef.$flags$ |= 256 /* isListenReady */;
            if (hostRef.$queuedListeners$) {
                hostRef.$queuedListeners$.map(([methodName, event]) => safeCall(instance, methodName, event));
                hostRef.$queuedListeners$ = null;
            }
        }
        emitLifecycleEvent(elm, 'componentWillLoad');
        if (BUILD.cmpWillLoad) {
            promise = safeCall(instance, 'componentWillLoad');
        }
    }
    else {
        emitLifecycleEvent(elm, 'componentWillUpdate');
        if (BUILD.cmpWillUpdate) {
            promise = safeCall(instance, 'componentWillUpdate');
        }
    }
    emitLifecycleEvent(elm, 'componentWillRender');
    if (BUILD.cmpWillRender) {
        promise = then(promise, () => safeCall(instance, 'componentWillRender'));
    }
    endSchedule();
    return then(promise, () => updateComponent(hostRef, instance, isInitialLoad));
};
const updateComponent = async (hostRef, instance, isInitialLoad) => {
    // updateComponent
    const elm = hostRef.$hostElement$;
    const endUpdate = createTime('update', hostRef.$cmpMeta$.$tagName$);
    const rc = elm['s-rc'];
    if (BUILD.style && isInitialLoad) {
        // DOM WRITE!
        attachStyles(hostRef);
    }
    const endRender = createTime('render', hostRef.$cmpMeta$.$tagName$);
    if (BUILD.isDev) {
        hostRef.$flags$ |= 1024 /* devOnRender */;
    }
    if (BUILD.hydrateServerSide) {
        await callRender(hostRef, instance, elm);
    }
    else {
        callRender(hostRef, instance, elm);
    }
    if (BUILD.cssVarShim && plt.$cssShim$) {
        plt.$cssShim$.updateHost(elm);
    }
    if (BUILD.isDev) {
        hostRef.$renderCount$++;
        hostRef.$flags$ &= ~1024 /* devOnRender */;
    }
    if (BUILD.hydrateServerSide) {
        try {
            // manually connected child components during server-side hydrate
            serverSideConnected(elm);
            if (isInitialLoad) {
                // using only during server-side hydrate
                if (hostRef.$cmpMeta$.$flags$ & 1 /* shadowDomEncapsulation */) {
                    elm['s-en'] = '';
                }
                else if (hostRef.$cmpMeta$.$flags$ & 2 /* scopedCssEncapsulation */) {
                    elm['s-en'] = 'c';
                }
            }
        }
        catch (e) {
            consoleError(e, elm);
        }
    }
    if (BUILD.asyncLoading && rc) {
        // ok, so turns out there are some child host elements
        // waiting on this parent element to load
        // let's fire off all update callbacks waiting
        rc.map((cb) => cb());
        elm['s-rc'] = undefined;
    }
    endRender();
    endUpdate();
    if (BUILD.asyncLoading) {
        const childrenPromises = elm['s-p'];
        const postUpdate = () => postUpdateComponent(hostRef);
        if (childrenPromises.length === 0) {
            postUpdate();
        }
        else {
            Promise.all(childrenPromises).then(postUpdate);
            hostRef.$flags$ |= 4 /* isWaitingForChildren */;
            childrenPromises.length = 0;
        }
    }
    else {
        postUpdateComponent(hostRef);
    }
};
const callRender = (hostRef, instance, elm) => {
    // in order for bundlers to correctly treeshake the BUILD object
    // we need to ensure BUILD is not deoptimized within a try/catch
    // https://rollupjs.org/guide/en/#treeshake tryCatchDeoptimization
    const allRenderFn = BUILD.allRenderFn ? true : false;
    const lazyLoad = BUILD.lazyLoad ? true : false;
    const taskQueue = BUILD.taskQueue ? true : false;
    const updatable = BUILD.updatable ? true : false;
    try {
        renderingRef = instance;
        instance = allRenderFn ? instance.render() : instance.render && instance.render();
        if (updatable && taskQueue) {
            hostRef.$flags$ &= ~16 /* isQueuedForUpdate */;
        }
        if (updatable || lazyLoad) {
            hostRef.$flags$ |= 2 /* hasRendered */;
        }
        if (BUILD.hasRenderFn || BUILD.reflect) {
            if (BUILD.vdomRender || BUILD.reflect) {
                // looks like we've got child nodes to render into this host element
                // or we need to update the css class/attrs on the host element
                // DOM WRITE!
                if (BUILD.hydrateServerSide) {
                    return Promise.resolve(instance).then((value) => renderVdom(hostRef, value));
                }
                else {
                    renderVdom(hostRef, instance);
                }
            }
            else {
                elm.textContent = instance;
            }
        }
    }
    catch (e) {
        consoleError(e, hostRef.$hostElement$);
    }
    renderingRef = null;
    return null;
};
const getRenderingRef = () => renderingRef;
const postUpdateComponent = (hostRef) => {
    const tagName = hostRef.$cmpMeta$.$tagName$;
    const elm = hostRef.$hostElement$;
    const endPostUpdate = createTime('postUpdate', tagName);
    const instance = BUILD.lazyLoad ? hostRef.$lazyInstance$ : elm;
    const ancestorComponent = hostRef.$ancestorComponent$;
    if (BUILD.cmpDidRender) {
        if (BUILD.isDev) {
            hostRef.$flags$ |= 1024 /* devOnRender */;
        }
        safeCall(instance, 'componentDidRender');
        if (BUILD.isDev) {
            hostRef.$flags$ &= ~1024 /* devOnRender */;
        }
    }
    emitLifecycleEvent(elm, 'componentDidRender');
    if (!(hostRef.$flags$ & 64 /* hasLoadedComponent */)) {
        hostRef.$flags$ |= 64 /* hasLoadedComponent */;
        if (BUILD.asyncLoading && BUILD.cssAnnotations) {
            // DOM WRITE!
            addHydratedFlag(elm);
        }
        if (BUILD.cmpDidLoad) {
            if (BUILD.isDev) {
                hostRef.$flags$ |= 2048 /* devOnDidLoad */;
            }
            safeCall(instance, 'componentDidLoad');
            if (BUILD.isDev) {
                hostRef.$flags$ &= ~2048 /* devOnDidLoad */;
            }
        }
        emitLifecycleEvent(elm, 'componentDidLoad');
        endPostUpdate();
        if (BUILD.asyncLoading) {
            hostRef.$onReadyResolve$(elm);
            if (!ancestorComponent) {
                appDidLoad(tagName);
            }
        }
    }
    else {
        if (BUILD.cmpDidUpdate) {
            // we've already loaded this component
            // fire off the user's componentDidUpdate method (if one was provided)
            // componentDidUpdate runs AFTER render() has been called
            // and all child components have finished updating
            if (BUILD.isDev) {
                hostRef.$flags$ |= 1024 /* devOnRender */;
            }
            safeCall(instance, 'componentDidUpdate');
            if (BUILD.isDev) {
                hostRef.$flags$ &= ~1024 /* devOnRender */;
            }
        }
        emitLifecycleEvent(elm, 'componentDidUpdate');
        endPostUpdate();
    }
    if (BUILD.hotModuleReplacement) {
        elm['s-hmr-load'] && elm['s-hmr-load']();
    }
    if (BUILD.method && BUILD.lazyLoad) {
        hostRef.$onInstanceResolve$(elm);
    }
    // load events fire from bottom to top
    // the deepest elements load first then bubbles up
    if (BUILD.asyncLoading) {
        if (hostRef.$onRenderResolve$) {
            hostRef.$onRenderResolve$();
            hostRef.$onRenderResolve$ = undefined;
        }
        if (hostRef.$flags$ & 512 /* needsRerender */) {
            nextTick(() => scheduleUpdate(hostRef, false));
        }
        hostRef.$flags$ &= ~(4 /* isWaitingForChildren */ | 512 /* needsRerender */);
    }
    // ( •_•)
    // ( •_•)>⌐■-■
    // (⌐■_■)
};
const forceUpdate = (ref) => {
    if (BUILD.updatable) {
        const hostRef = getHostRef(ref);
        const isConnected = hostRef.$hostElement$.isConnected;
        if (isConnected &&
            (hostRef.$flags$ & (2 /* hasRendered */ | 16 /* isQueuedForUpdate */)) === 2 /* hasRendered */) {
            scheduleUpdate(hostRef, false);
        }
        // Returns "true" when the forced update was successfully scheduled
        return isConnected;
    }
    return false;
};
const appDidLoad = (who) => {
    // on appload
    // we have finish the first big initial render
    if (BUILD.cssAnnotations) {
        addHydratedFlag(doc.documentElement);
    }
    if (BUILD.asyncQueue) {
        plt.$flags$ |= 2 /* appLoaded */;
    }
    nextTick(() => emitEvent(win, 'appload', { detail: { namespace: NAMESPACE } }));
    if (BUILD.profile && performance.measure) {
        performance.measure(`[Stencil] ${NAMESPACE} initial load (by ${who})`, 'st:app:start');
    }
};
const safeCall = (instance, method, arg) => {
    if (instance && instance[method]) {
        try {
            return instance[method](arg);
        }
        catch (e) {
            consoleError(e);
        }
    }
    return undefined;
};
const then = (promise, thenFn) => {
    return promise && promise.then ? promise.then(thenFn) : thenFn();
};
const emitLifecycleEvent = (elm, lifecycleName) => {
    if (BUILD.lifecycleDOMEvents) {
        emitEvent(elm, 'stencil_' + lifecycleName, {
            bubbles: true,
            composed: true,
            detail: {
                namespace: NAMESPACE,
            },
        });
    }
};
const addHydratedFlag = (elm) => BUILD.hydratedClass
    ? elm.classList.add('hydrated')
    : BUILD.hydratedAttribute
        ? elm.setAttribute('hydrated', '')
        : undefined;
const serverSideConnected = (elm) => {
    const children = elm.children;
    if (children != null) {
        for (let i = 0, ii = children.length; i < ii; i++) {
            const childElm = children[i];
            if (typeof childElm.connectedCallback === 'function') {
                childElm.connectedCallback();
            }
            serverSideConnected(childElm);
        }
    }
};
const initializeClientHydrate = (hostElm, tagName, hostId, hostRef) => {
    const endHydrate = createTime('hydrateClient', tagName);
    const shadowRoot = hostElm.shadowRoot;
    const childRenderNodes = [];
    const slotNodes = [];
    const shadowRootNodes = BUILD.shadowDom && shadowRoot ? [] : null;
    const vnode = (hostRef.$vnode$ = newVNode(tagName, null));
    if (!plt.$orgLocNodes$) {
        initializeDocumentHydrate(doc.body, (plt.$orgLocNodes$ = new Map()));
    }
    hostElm[HYDRATE_ID] = hostId;
    hostElm.removeAttribute(HYDRATE_ID);
    clientHydrate(vnode, childRenderNodes, slotNodes, shadowRootNodes, hostElm, hostElm, hostId);
    childRenderNodes.map((c) => {
        const orgLocationId = c.$hostId$ + '.' + c.$nodeId$;
        const orgLocationNode = plt.$orgLocNodes$.get(orgLocationId);
        const node = c.$elm$;
        if (orgLocationNode && supportsShadow && orgLocationNode['s-en'] === '') {
            orgLocationNode.parentNode.insertBefore(node, orgLocationNode.nextSibling);
        }
        if (!shadowRoot) {
            node['s-hn'] = tagName;
            if (orgLocationNode) {
                node['s-ol'] = orgLocationNode;
                node['s-ol']['s-nr'] = node;
            }
        }
        plt.$orgLocNodes$.delete(orgLocationId);
    });
    if (BUILD.shadowDom && shadowRoot) {
        shadowRootNodes.map((shadowRootNode) => {
            if (shadowRootNode) {
                shadowRoot.appendChild(shadowRootNode);
            }
        });
    }
    endHydrate();
};
const clientHydrate = (parentVNode, childRenderNodes, slotNodes, shadowRootNodes, hostElm, node, hostId) => {
    let childNodeType;
    let childIdSplt;
    let childVNode;
    let i;
    if (node.nodeType === 1 /* ElementNode */) {
        childNodeType = node.getAttribute(HYDRATE_CHILD_ID);
        if (childNodeType) {
            // got the node data from the element's attribute
            // `${hostId}.${nodeId}.${depth}.${index}`
            childIdSplt = childNodeType.split('.');
            if (childIdSplt[0] === hostId || childIdSplt[0] === '0') {
                childVNode = {
                    $flags$: 0,
                    $hostId$: childIdSplt[0],
                    $nodeId$: childIdSplt[1],
                    $depth$: childIdSplt[2],
                    $index$: childIdSplt[3],
                    $tag$: node.tagName.toLowerCase(),
                    $elm$: node,
                    $attrs$: null,
                    $children$: null,
                    $key$: null,
                    $name$: null,
                    $text$: null,
                };
                childRenderNodes.push(childVNode);
                node.removeAttribute(HYDRATE_CHILD_ID);
                // this is a new child vnode
                // so ensure its parent vnode has the vchildren array
                if (!parentVNode.$children$) {
                    parentVNode.$children$ = [];
                }
                // add our child vnode to a specific index of the vnode's children
                parentVNode.$children$[childVNode.$index$] = childVNode;
                // this is now the new parent vnode for all the next child checks
                parentVNode = childVNode;
                if (shadowRootNodes && childVNode.$depth$ === '0') {
                    shadowRootNodes[childVNode.$index$] = childVNode.$elm$;
                }
            }
        }
        // recursively drill down, end to start so we can remove nodes
        for (i = node.childNodes.length - 1; i >= 0; i--) {
            clientHydrate(parentVNode, childRenderNodes, slotNodes, shadowRootNodes, hostElm, node.childNodes[i], hostId);
        }
        if (node.shadowRoot) {
            // keep drilling down through the shadow root nodes
            for (i = node.shadowRoot.childNodes.length - 1; i >= 0; i--) {
                clientHydrate(parentVNode, childRenderNodes, slotNodes, shadowRootNodes, hostElm, node.shadowRoot.childNodes[i], hostId);
            }
        }
    }
    else if (node.nodeType === 8 /* CommentNode */) {
        // `${COMMENT_TYPE}.${hostId}.${nodeId}.${depth}.${index}`
        childIdSplt = node.nodeValue.split('.');
        if (childIdSplt[1] === hostId || childIdSplt[1] === '0') {
            // comment node for either the host id or a 0 host id
            childNodeType = childIdSplt[0];
            childVNode = {
                $flags$: 0,
                $hostId$: childIdSplt[1],
                $nodeId$: childIdSplt[2],
                $depth$: childIdSplt[3],
                $index$: childIdSplt[4],
                $elm$: node,
                $attrs$: null,
                $children$: null,
                $key$: null,
                $name$: null,
                $tag$: null,
                $text$: null,
            };
            if (childNodeType === TEXT_NODE_ID) {
                childVNode.$elm$ = node.nextSibling;
                if (childVNode.$elm$ && childVNode.$elm$.nodeType === 3 /* TextNode */) {
                    childVNode.$text$ = childVNode.$elm$.textContent;
                    childRenderNodes.push(childVNode);
                    // remove the text comment since it's no longer needed
                    node.remove();
                    if (!parentVNode.$children$) {
                        parentVNode.$children$ = [];
                    }
                    parentVNode.$children$[childVNode.$index$] = childVNode;
                    if (shadowRootNodes && childVNode.$depth$ === '0') {
                        shadowRootNodes[childVNode.$index$] = childVNode.$elm$;
                    }
                }
            }
            else if (childVNode.$hostId$ === hostId) {
                // this comment node is specifcally for this host id
                if (childNodeType === SLOT_NODE_ID) {
                    // `${SLOT_NODE_ID}.${hostId}.${nodeId}.${depth}.${index}.${slotName}`;
                    childVNode.$tag$ = 'slot';
                    if (childIdSplt[5]) {
                        node['s-sn'] = childVNode.$name$ = childIdSplt[5];
                    }
                    else {
                        node['s-sn'] = '';
                    }
                    node['s-sr'] = true;
                    if (BUILD.shadowDom && shadowRootNodes) {
                        // browser support shadowRoot and this is a shadow dom component
                        // create an actual slot element
                        childVNode.$elm$ = doc.createElement(childVNode.$tag$);
                        if (childVNode.$name$) {
                            // add the slot name attribute
                            childVNode.$elm$.setAttribute('name', childVNode.$name$);
                        }
                        // insert the new slot element before the slot comment
                        node.parentNode.insertBefore(childVNode.$elm$, node);
                        // remove the slot comment since it's not needed for shadow
                        node.remove();
                        if (childVNode.$depth$ === '0') {
                            shadowRootNodes[childVNode.$index$] = childVNode.$elm$;
                        }
                    }
                    slotNodes.push(childVNode);
                    if (!parentVNode.$children$) {
                        parentVNode.$children$ = [];
                    }
                    parentVNode.$children$[childVNode.$index$] = childVNode;
                }
                else if (childNodeType === CONTENT_REF_ID) {
                    // `${CONTENT_REF_ID}.${hostId}`;
                    if (BUILD.shadowDom && shadowRootNodes) {
                        // remove the content ref comment since it's not needed for shadow
                        node.remove();
                    }
                    else if (BUILD.slotRelocation) {
                        hostElm['s-cr'] = node;
                        node['s-cn'] = true;
                    }
                }
            }
        }
    }
    else if (parentVNode && parentVNode.$tag$ === 'style') {
        const vnode = newVNode(null, node.textContent);
        vnode.$elm$ = node;
        vnode.$index$ = '0';
        parentVNode.$children$ = [vnode];
    }
};
const initializeDocumentHydrate = (node, orgLocNodes) => {
    if (node.nodeType === 1 /* ElementNode */) {
        let i = 0;
        for (; i < node.childNodes.length; i++) {
            initializeDocumentHydrate(node.childNodes[i], orgLocNodes);
        }
        if (node.shadowRoot) {
            for (i = 0; i < node.shadowRoot.childNodes.length; i++) {
                initializeDocumentHydrate(node.shadowRoot.childNodes[i], orgLocNodes);
            }
        }
    }
    else if (node.nodeType === 8 /* CommentNode */) {
        const childIdSplt = node.nodeValue.split('.');
        if (childIdSplt[0] === ORG_LOCATION_ID) {
            orgLocNodes.set(childIdSplt[1] + '.' + childIdSplt[2], node);
            node.nodeValue = '';
            // useful to know if the original location is
            // the root light-dom of a shadow dom component
            node['s-en'] = childIdSplt[3];
        }
    }
};
const parsePropertyValue = (propValue, propType) => {
    // ensure this value is of the correct prop type
    if (propValue != null && !isComplexType(propValue)) {
        if (BUILD.propBoolean && propType & 4 /* Boolean */) {
            // per the HTML spec, any string value means it is a boolean true value
            // but we'll cheat here and say that the string "false" is the boolean false
            return propValue === 'false' ? false : propValue === '' || !!propValue;
        }
        if (BUILD.propNumber && propType & 2 /* Number */) {
            // force it to be a number
            return parseFloat(propValue);
        }
        if (BUILD.propString && propType & 1 /* String */) {
            // could have been passed as a number or boolean
            // but we still want it as a string
            return String(propValue);
        }
        // redundant return here for better minification
        return propValue;
    }
    // not sure exactly what type we want
    // so no need to change to a different type
    return propValue;
};
const getValue = (ref, propName) => getHostRef(ref).$instanceValues$.get(propName);
const setValue = (ref, propName, newVal, cmpMeta) => {
    // check our new property value against our internal value
    const hostRef = getHostRef(ref);
    const elm = BUILD.lazyLoad ? hostRef.$hostElement$ : ref;
    const oldVal = hostRef.$instanceValues$.get(propName);
    const flags = hostRef.$flags$;
    const instance = BUILD.lazyLoad ? hostRef.$lazyInstance$ : elm;
    newVal = parsePropertyValue(newVal, cmpMeta.$members$[propName][0]);
    if ((!BUILD.lazyLoad || !(flags & 8 /* isConstructingInstance */) || oldVal === undefined) && newVal !== oldVal) {
        // gadzooks! the property's value has changed!!
        // set our new value!
        hostRef.$instanceValues$.set(propName, newVal);
        if (BUILD.isDev) {
            if (hostRef.$flags$ & 1024 /* devOnRender */) {
                consoleDevWarn(`The state/prop "${propName}" changed during rendering. This can potentially lead to infinite-loops and other bugs.`, '\nElement', elm, '\nNew value', newVal, '\nOld value', oldVal);
            }
            else if (hostRef.$flags$ & 2048 /* devOnDidLoad */) {
                consoleDevWarn(`The state/prop "${propName}" changed during "componentDidLoad()", this triggers extra re-renders, try to setup on "componentWillLoad()"`, '\nElement', elm, '\nNew value', newVal, '\nOld value', oldVal);
            }
        }
        if (!BUILD.lazyLoad || instance) {
            // get an array of method names of watch functions to call
            if (BUILD.watchCallback && cmpMeta.$watchers$ && flags & 128 /* isWatchReady */) {
                const watchMethods = cmpMeta.$watchers$[propName];
                if (watchMethods) {
                    // this instance is watching for when this property changed
                    watchMethods.map((watchMethodName) => {
                        try {
                            // fire off each of the watch methods that are watching this property
                            instance[watchMethodName](newVal, oldVal, propName);
                        }
                        catch (e) {
                            consoleError(e, elm);
                        }
                    });
                }
            }
            if (BUILD.updatable &&
                (flags & (2 /* hasRendered */ | 16 /* isQueuedForUpdate */)) === 2 /* hasRendered */) {
                if (BUILD.cmpShouldUpdate && instance.componentShouldUpdate) {
                    if (instance.componentShouldUpdate(newVal, oldVal, propName) === false) {
                        return;
                    }
                }
                // looks like this value actually changed, so we've got work to do!
                // but only if we've already rendered, otherwise just chill out
                // queue that we need to do an update, but don't worry about queuing
                // up millions cuz this function ensures it only runs once
                scheduleUpdate(hostRef, false);
            }
        }
    }
};
const proxyComponent = (Cstr, cmpMeta, flags) => {
    if (BUILD.member && cmpMeta.$members$) {
        if (BUILD.watchCallback && Cstr.watchers) {
            cmpMeta.$watchers$ = Cstr.watchers;
        }
        // It's better to have a const than two Object.entries()
        const members = Object.entries(cmpMeta.$members$);
        const prototype = Cstr.prototype;
        members.map(([memberName, [memberFlags]]) => {
            if ((BUILD.prop || BUILD.state) &&
                (memberFlags & 31 /* Prop */ ||
                    ((!BUILD.lazyLoad || flags & 2 /* proxyState */) && memberFlags & 32 /* State */))) {
                // proxyComponent - prop
                Object.defineProperty(prototype, memberName, {
                    get() {
                        // proxyComponent, get value
                        return getValue(this, memberName);
                    },
                    set(newValue) {
                        // only during dev time
                        if (BUILD.isDev) {
                            const ref = getHostRef(this);
                            if (
                            // we are proxying the instance (not element)
                            (flags & 1 /* isElementConstructor */) === 0 &&
                                // the element is not constructing
                                (ref.$flags$ & 8 /* isConstructingInstance */) === 0 &&
                                // the member is a prop
                                (memberFlags & 31 /* Prop */) !== 0 &&
                                // the member is not mutable
                                (memberFlags & 1024 /* Mutable */) === 0) {
                                consoleDevWarn(`@Prop() "${memberName}" on <${cmpMeta.$tagName$}> is immutable but was modified from within the component.\nMore information: https://stenciljs.com/docs/properties#prop-mutability`);
                            }
                        }
                        // proxyComponent, set value
                        setValue(this, memberName, newValue, cmpMeta);
                    },
                    configurable: true,
                    enumerable: true,
                });
            }
            else if (BUILD.lazyLoad &&
                BUILD.method &&
                flags & 1 /* isElementConstructor */ &&
                memberFlags & 64 /* Method */) {
                // proxyComponent - method
                Object.defineProperty(prototype, memberName, {
                    value(...args) {
                        const ref = getHostRef(this);
                        return ref.$onInstancePromise$.then(() => ref.$lazyInstance$[memberName](...args));
                    },
                });
            }
        });
        if (BUILD.observeAttribute && (!BUILD.lazyLoad || flags & 1 /* isElementConstructor */)) {
            const attrNameToPropName = new Map();
            prototype.attributeChangedCallback = function (attrName, _oldValue, newValue) {
                plt.jmp(() => {
                    const propName = attrNameToPropName.get(attrName);
                    //  In a webcomponent lifecyle the attributeChangedCallback runs prior to connectedCallback
                    //  in the case where an attribute was set inline.
                    //  ```html
                    //    <my-component some-attribute="some-value"></my-component>
                    //  ```
                    //
                    //  There is an edge case where a developer sets the attribute inline on a custom element and then programatically
                    //  changes it before it has been upgraded as shown below:
                    //
                    //  ```html
                    //    <!-- this component has _not_ been upgraded yet -->
                    //    <my-component id="test" some-attribute="some-value"></my-component>
                    //    <script>
                    //      // grab non-upgraded component
                    //      el = document.querySelector("#test");
                    //      el.someAttribute = "another-value";
                    //      // upgrade component
                    //      cutsomElements.define('my-component', MyComponent);
                    //    </script>
                    //  ```
                    //  In this case if we do not unshadow here and use the value of the shadowing property, attributeChangedCallback
                    //  will be called with `newValue = "some-value"` and will set the shadowed property (this.someAttribute = "another-value")
                    //  to the value that was set inline i.e. "some-value" from above example. When
                    //  the connectedCallback attempts to unshadow it will use "some-value" as the intial value rather than "another-value"
                    //
                    //  The case where the attribute was NOT set inline but was not set programmatically shall be handled/unshadowed
                    //  by connectedCallback as this attributeChangedCallback will not fire.
                    //
                    //  https://developers.google.com/web/fundamentals/web-components/best-practices#lazy-properties
                    //
                    //  TODO(STENCIL-16) we should think about whether or not we actually want to be reflecting the attributes to
                    //  properties here given that this goes against best practices outlined here
                    //  https://developers.google.com/web/fundamentals/web-components/best-practices#avoid-reentrancy
                    if (this.hasOwnProperty(propName)) {
                        newValue = this[propName];
                        delete this[propName];
                    }
                    this[propName] = newValue === null && typeof this[propName] === 'boolean' ? false : newValue;
                });
            };
            // create an array of attributes to observe
            // and also create a map of html attribute name to js property name
            Cstr.observedAttributes = members
                .filter(([_, m]) => m[0] & 15 /* HasAttribute */) // filter to only keep props that should match attributes
                .map(([propName, m]) => {
                const attrName = m[1] || propName;
                attrNameToPropName.set(attrName, propName);
                if (BUILD.reflect && m[0] & 512 /* ReflectAttr */) {
                    cmpMeta.$attrsToReflect$.push([propName, attrName]);
                }
                return attrName;
            });
        }
    }
    return Cstr;
};
const initializeComponent = async (elm, hostRef, cmpMeta, hmrVersionId, Cstr) => {
    // initializeComponent
    if ((BUILD.lazyLoad || BUILD.hydrateServerSide || BUILD.style) &&
        (hostRef.$flags$ & 32 /* hasInitializedComponent */) === 0) {
        if (BUILD.lazyLoad || BUILD.hydrateClientSide) {
            // we haven't initialized this element yet
            hostRef.$flags$ |= 32 /* hasInitializedComponent */;
            // lazy loaded components
            // request the component's implementation to be
            // wired up with the host element
            Cstr = loadModule(cmpMeta, hostRef, hmrVersionId);
            if (Cstr.then) {
                // Await creates a micro-task avoid if possible
                const endLoad = uniqueTime(`st:load:${cmpMeta.$tagName$}:${hostRef.$modeName$}`, `[Stencil] Load module for <${cmpMeta.$tagName$}>`);
                Cstr = await Cstr;
                endLoad();
            }
            if ((BUILD.isDev || BUILD.isDebug) && !Cstr) {
                throw new Error(`Constructor for "${cmpMeta.$tagName$}#${hostRef.$modeName$}" was not found`);
            }
            if (BUILD.member && !Cstr.isProxied) {
                // we've never proxied this Constructor before
                // let's add the getters/setters to its prototype before
                // the first time we create an instance of the implementation
                if (BUILD.watchCallback) {
                    cmpMeta.$watchers$ = Cstr.watchers;
                }
                proxyComponent(Cstr, cmpMeta, 2 /* proxyState */);
                Cstr.isProxied = true;
            }
            const endNewInstance = createTime('createInstance', cmpMeta.$tagName$);
            // ok, time to construct the instance
            // but let's keep track of when we start and stop
            // so that the getters/setters don't incorrectly step on data
            if (BUILD.member) {
                hostRef.$flags$ |= 8 /* isConstructingInstance */;
            }
            // construct the lazy-loaded component implementation
            // passing the hostRef is very important during
            // construction in order to directly wire together the
            // host element and the lazy-loaded instance
            try {
                new Cstr(hostRef);
            }
            catch (e) {
                consoleError(e);
            }
            if (BUILD.member) {
                hostRef.$flags$ &= ~8 /* isConstructingInstance */;
            }
            if (BUILD.watchCallback) {
                hostRef.$flags$ |= 128 /* isWatchReady */;
            }
            endNewInstance();
            fireConnectedCallback(hostRef.$lazyInstance$);
        }
        else {
            // sync constructor component
            Cstr = elm.constructor;
            hostRef.$flags$ |= 32 /* hasInitializedComponent */;
            // wait for the CustomElementRegistry to mark the component as ready before setting `isWatchReady`. Otherwise,
            // watchers may fire prematurely if `customElements.get()`/`customElements.whenDefined()` resolves _before_
            // Stencil has completed instantiating the component.
            customElements.whenDefined(cmpMeta.$tagName$).then(() => (hostRef.$flags$ |= 128 /* isWatchReady */));
        }
        if (BUILD.style && Cstr.style) {
            // this component has styles but we haven't registered them yet
            let style = Cstr.style;
            if (BUILD.mode && typeof style !== 'string') {
                style = style[(hostRef.$modeName$ = computeMode(elm))];
                if (BUILD.hydrateServerSide && hostRef.$modeName$) {
                    elm.setAttribute('s-mode', hostRef.$modeName$);
                }
            }
            const scopeId = getScopeId(cmpMeta, hostRef.$modeName$);
            if (!styles.has(scopeId)) {
                const endRegisterStyles = createTime('registerStyles', cmpMeta.$tagName$);
                if (!BUILD.hydrateServerSide &&
                    BUILD.shadowDom &&
                    BUILD.shadowDomShim &&
                    cmpMeta.$flags$ & 8 /* needsShadowDomShim */) {
                    style = await import('./shadow-css-cde050bc.js').then((m) => m.scopeCss(style, scopeId, false));
                }
                registerStyle(scopeId, style, !!(cmpMeta.$flags$ & 1 /* shadowDomEncapsulation */));
                endRegisterStyles();
            }
        }
    }
    // we've successfully created a lazy instance
    const ancestorComponent = hostRef.$ancestorComponent$;
    const schedule = () => scheduleUpdate(hostRef, true);
    if (BUILD.asyncLoading && ancestorComponent && ancestorComponent['s-rc']) {
        // this is the intial load and this component it has an ancestor component
        // but the ancestor component has NOT fired its will update lifecycle yet
        // so let's just cool our jets and wait for the ancestor to continue first
        // this will get fired off when the ancestor component
        // finally gets around to rendering its lazy self
        // fire off the initial update
        ancestorComponent['s-rc'].push(schedule);
    }
    else {
        schedule();
    }
};
const fireConnectedCallback = (instance) => {
    if (BUILD.lazyLoad && BUILD.connectedCallback) {
        safeCall(instance, 'connectedCallback');
    }
};
const connectedCallback = (elm) => {
    if ((plt.$flags$ & 1 /* isTmpDisconnected */) === 0) {
        const hostRef = getHostRef(elm);
        const cmpMeta = hostRef.$cmpMeta$;
        const endConnected = createTime('connectedCallback', cmpMeta.$tagName$);
        if (BUILD.hostListenerTargetParent) {
            // only run if we have listeners being attached to a parent
            addHostEventListeners(elm, hostRef, cmpMeta.$listeners$, true);
        }
        if (!(hostRef.$flags$ & 1 /* hasConnected */)) {
            // first time this component has connected
            hostRef.$flags$ |= 1 /* hasConnected */;
            let hostId;
            if (BUILD.hydrateClientSide) {
                hostId = elm.getAttribute(HYDRATE_ID);
                if (hostId) {
                    if (BUILD.shadowDom && supportsShadow && cmpMeta.$flags$ & 1 /* shadowDomEncapsulation */) {
                        const scopeId = BUILD.mode
                            ? addStyle(elm.shadowRoot, cmpMeta, elm.getAttribute('s-mode'))
                            : addStyle(elm.shadowRoot, cmpMeta);
                        elm.classList.remove(scopeId + '-h', scopeId + '-s');
                    }
                    initializeClientHydrate(elm, cmpMeta.$tagName$, hostId, hostRef);
                }
            }
            if (BUILD.slotRelocation && !hostId) {
                // initUpdate
                // if the slot polyfill is required we'll need to put some nodes
                // in here to act as original content anchors as we move nodes around
                // host element has been connected to the DOM
                if (BUILD.hydrateServerSide ||
                    ((BUILD.slot || BUILD.shadowDom) &&
                        cmpMeta.$flags$ & (4 /* hasSlotRelocation */ | 8 /* needsShadowDomShim */))) {
                    setContentReference(elm);
                }
            }
            if (BUILD.asyncLoading) {
                // find the first ancestor component (if there is one) and register
                // this component as one of the actively loading child components for its ancestor
                let ancestorComponent = elm;
                while ((ancestorComponent = ancestorComponent.parentNode || ancestorComponent.host)) {
                    // climb up the ancestors looking for the first
                    // component that hasn't finished its lifecycle update yet
                    if ((BUILD.hydrateClientSide &&
                        ancestorComponent.nodeType === 1 /* ElementNode */ &&
                        ancestorComponent.hasAttribute('s-id') &&
                        ancestorComponent['s-p']) ||
                        ancestorComponent['s-p']) {
                        // we found this components first ancestor component
                        // keep a reference to this component's ancestor component
                        attachToAncestor(hostRef, (hostRef.$ancestorComponent$ = ancestorComponent));
                        break;
                    }
                }
            }
            // Lazy properties
            // https://developers.google.com/web/fundamentals/web-components/best-practices#lazy-properties
            if (BUILD.prop && !BUILD.hydrateServerSide && cmpMeta.$members$) {
                Object.entries(cmpMeta.$members$).map(([memberName, [memberFlags]]) => {
                    if (memberFlags & 31 /* Prop */ && elm.hasOwnProperty(memberName)) {
                        const value = elm[memberName];
                        delete elm[memberName];
                        elm[memberName] = value;
                    }
                });
            }
            if (BUILD.initializeNextTick) {
                // connectedCallback, taskQueue, initialLoad
                // angular sets attribute AFTER connectCallback
                // https://github.com/angular/angular/issues/18909
                // https://github.com/angular/angular/issues/19940
                nextTick(() => initializeComponent(elm, hostRef, cmpMeta));
            }
            else {
                initializeComponent(elm, hostRef, cmpMeta);
            }
        }
        else {
            // not the first time this has connected
            // reattach any event listeners to the host
            // since they would have been removed when disconnected
            addHostEventListeners(elm, hostRef, cmpMeta.$listeners$, false);
            // fire off connectedCallback() on component instance
            fireConnectedCallback(hostRef.$lazyInstance$);
        }
        endConnected();
    }
};
const setContentReference = (elm) => {
    // only required when we're NOT using native shadow dom (slot)
    // or this browser doesn't support native shadow dom
    // and this host element was NOT created with SSR
    // let's pick out the inner content for slot projection
    // create a node to represent where the original
    // content was first placed, which is useful later on
    const contentRefElm = (elm['s-cr'] = doc.createComment(BUILD.isDebug ? `content-ref (host=${elm.localName})` : ''));
    contentRefElm['s-cn'] = true;
    elm.insertBefore(contentRefElm, elm.firstChild);
};
const disconnectedCallback = (elm) => {
    if ((plt.$flags$ & 1 /* isTmpDisconnected */) === 0) {
        const hostRef = getHostRef(elm);
        const instance = BUILD.lazyLoad ? hostRef.$lazyInstance$ : elm;
        if (BUILD.hostListener) {
            if (hostRef.$rmListeners$) {
                hostRef.$rmListeners$.map((rmListener) => rmListener());
                hostRef.$rmListeners$ = undefined;
            }
        }
        // clear CSS var-shim tracking
        if (BUILD.cssVarShim && plt.$cssShim$) {
            plt.$cssShim$.removeHost(elm);
        }
        if (BUILD.lazyLoad && BUILD.disconnectedCallback) {
            safeCall(instance, 'disconnectedCallback');
        }
        if (BUILD.cmpDidUnload) {
            safeCall(instance, 'componentDidUnload');
        }
    }
};
const defineCustomElement = (Cstr, compactMeta) => {
    customElements.define(compactMeta[1], proxyCustomElement(Cstr, compactMeta));
};
const proxyCustomElement = (Cstr, compactMeta) => {
    const cmpMeta = {
        $flags$: compactMeta[0],
        $tagName$: compactMeta[1],
    };
    if (BUILD.member) {
        cmpMeta.$members$ = compactMeta[2];
    }
    if (BUILD.hostListener) {
        cmpMeta.$listeners$ = compactMeta[3];
    }
    if (BUILD.watchCallback) {
        cmpMeta.$watchers$ = Cstr.$watchers$;
    }
    if (BUILD.reflect) {
        cmpMeta.$attrsToReflect$ = [];
    }
    if (BUILD.shadowDom && !supportsShadow && cmpMeta.$flags$ & 1 /* shadowDomEncapsulation */) {
        cmpMeta.$flags$ |= 8 /* needsShadowDomShim */;
    }
    const originalConnectedCallback = Cstr.prototype.connectedCallback;
    const originalDisconnectedCallback = Cstr.prototype.disconnectedCallback;
    Object.assign(Cstr.prototype, {
        __registerHost() {
            registerHost(this, cmpMeta);
        },
        connectedCallback() {
            connectedCallback(this);
            if (BUILD.connectedCallback && originalConnectedCallback) {
                originalConnectedCallback.call(this);
            }
        },
        disconnectedCallback() {
            disconnectedCallback(this);
            if (BUILD.disconnectedCallback && originalDisconnectedCallback) {
                originalDisconnectedCallback.call(this);
            }
        },
    });
    Cstr.is = cmpMeta.$tagName$;
    return proxyComponent(Cstr, cmpMeta, 1 /* isElementConstructor */ | 2 /* proxyState */);
};
const forceModeUpdate = (elm) => {
    if (BUILD.style && BUILD.mode && !BUILD.lazyLoad) {
        const mode = computeMode(elm);
        const hostRef = getHostRef(elm);
        if (hostRef.$modeName$ !== mode) {
            const cmpMeta = hostRef.$cmpMeta$;
            const oldScopeId = elm['s-sc'];
            const scopeId = getScopeId(cmpMeta, mode);
            const style = elm.constructor.style[mode];
            const flags = cmpMeta.$flags$;
            if (style) {
                if (!styles.has(scopeId)) {
                    registerStyle(scopeId, style, !!(flags & 1 /* shadowDomEncapsulation */));
                }
                hostRef.$modeName$ = mode;
                elm.classList.remove(oldScopeId + '-h', oldScopeId + '-s');
                attachStyles(hostRef);
                forceUpdate(elm);
            }
        }
    }
};
const attachShadow = (el) => {
    if (supportsShadow) {
        el.attachShadow({ mode: 'open' });
    }
    else {
        el.shadowRoot = el;
    }
};
const hmrStart = (elm, cmpMeta, hmrVersionId) => {
    // ¯\_(ツ)_/¯
    const hostRef = getHostRef(elm);
    // reset state flags to only have been connected
    hostRef.$flags$ = 1 /* hasConnected */;
    // TODO
    // detatch any event listeners that may have been added
    // because we're not passing an exact event name it'll
    // remove all of this element's event, which is good
    // create a callback for when this component finishes hmr
    elm['s-hmr-load'] = () => {
        // finished hmr for this element
        delete elm['s-hmr-load'];
    };
    // re-initialize the component
    initializeComponent(elm, hostRef, cmpMeta, hmrVersionId);
};
const patchCloneNode = (HostElementPrototype) => {
    const orgCloneNode = HostElementPrototype.cloneNode;
    HostElementPrototype.cloneNode = function (deep) {
        const srcNode = this;
        const isShadowDom = BUILD.shadowDom ? srcNode.shadowRoot && supportsShadow : false;
        const clonedNode = orgCloneNode.call(srcNode, isShadowDom ? deep : false);
        if (BUILD.slot && !isShadowDom && deep) {
            let i = 0;
            let slotted, nonStencilNode;
            let stencilPrivates = [
                's-id',
                's-cr',
                's-lr',
                's-rc',
                's-sc',
                's-p',
                's-cn',
                's-sr',
                's-sn',
                's-hn',
                's-ol',
                's-nr',
                's-si',
            ];
            for (; i < srcNode.childNodes.length; i++) {
                slotted = srcNode.childNodes[i]['s-nr'];
                nonStencilNode = stencilPrivates.every((privateField) => !srcNode.childNodes[i][privateField]);
                if (slotted) {
                    if (BUILD.appendChildSlotFix && clonedNode.__appendChild) {
                        clonedNode.__appendChild(slotted.cloneNode(true));
                    }
                    else {
                        clonedNode.appendChild(slotted.cloneNode(true));
                    }
                }
                if (nonStencilNode) {
                    clonedNode.appendChild(srcNode.childNodes[i].cloneNode(true));
                }
            }
        }
        return clonedNode;
    };
};
const patchSlotAppendChild = (HostElementPrototype) => {
    HostElementPrototype.__appendChild = HostElementPrototype.appendChild;
    HostElementPrototype.appendChild = function (newChild) {
        const slotName = (newChild['s-sn'] = getSlotName(newChild));
        const slotNode = getHostSlotNode(this.childNodes, slotName);
        if (slotNode) {
            const slotChildNodes = getHostSlotChildNodes(slotNode, slotName);
            const appendAfter = slotChildNodes[slotChildNodes.length - 1];
            return appendAfter.parentNode.insertBefore(newChild, appendAfter.nextSibling);
        }
        return this.__appendChild(newChild);
    };
};
/**
 * Patches the text content of an unnamed slotted node inside a scoped component
 * @param hostElementPrototype the `Element` to be patched
 * @param cmpMeta component runtime metadata used to determine if the component should be patched or not
 */
const patchTextContent = (hostElementPrototype, cmpMeta) => {
    if (BUILD.scoped && cmpMeta.$flags$ & 2 /* scopedCssEncapsulation */) {
        const descriptor = Object.getOwnPropertyDescriptor(Node.prototype, 'textContent');
        Object.defineProperty(hostElementPrototype, '__textContent', descriptor);
        Object.defineProperty(hostElementPrototype, 'textContent', {
            get() {
                var _a;
                // get the 'default slot', which would be the first slot in a shadow tree (if we were using one), whose name is
                // the empty string
                const slotNode = getHostSlotNode(this.childNodes, '');
                // when a slot node is found, the textContent _may_ be found in the next sibling (text) node, depending on how
                // nodes were reordered during the vdom render. first try to get the text content from the sibling.
                if (((_a = slotNode === null || slotNode === void 0 ? void 0 : slotNode.nextSibling) === null || _a === void 0 ? void 0 : _a.nodeType) === 3 /* TEXT_NODE */) {
                    return slotNode.nextSibling.textContent;
                }
                else if (slotNode) {
                    return slotNode.textContent;
                }
                else {
                    // fallback to the original implementation
                    return this.__textContent;
                }
            },
            set(value) {
                var _a;
                // get the 'default slot', which would be the first slot in a shadow tree (if we were using one), whose name is
                // the empty string
                const slotNode = getHostSlotNode(this.childNodes, '');
                // when a slot node is found, the textContent _may_ need to be placed in the next sibling (text) node,
                // depending on how nodes were reordered during the vdom render. first try to set the text content on the
                // sibling.
                if (((_a = slotNode === null || slotNode === void 0 ? void 0 : slotNode.nextSibling) === null || _a === void 0 ? void 0 : _a.nodeType) === 3 /* TEXT_NODE */) {
                    slotNode.nextSibling.textContent = value;
                }
                else if (slotNode) {
                    slotNode.textContent = value;
                }
                else {
                    // we couldn't find a slot, but that doesn't mean that there isn't one. if this check ran before the DOM
                    // loaded, we could have missed it. check for a content reference element on the scoped component and insert
                    // it there
                    this.__textContent = value;
                    const contentRefElm = this['s-cr'];
                    if (contentRefElm) {
                        this.insertBefore(contentRefElm, this.firstChild);
                    }
                }
            },
        });
    }
};
const patchChildSlotNodes = (elm, cmpMeta) => {
    class FakeNodeList extends Array {
        item(n) {
            return this[n];
        }
    }
    if (cmpMeta.$flags$ & 8 /* needsShadowDomShim */) {
        const childNodesFn = elm.__lookupGetter__('childNodes');
        Object.defineProperty(elm, 'children', {
            get() {
                return this.childNodes.map((n) => n.nodeType === 1);
            },
        });
        Object.defineProperty(elm, 'childElementCount', {
            get() {
                return elm.children.length;
            },
        });
        Object.defineProperty(elm, 'childNodes', {
            get() {
                const childNodes = childNodesFn.call(this);
                if ((plt.$flags$ & 1 /* isTmpDisconnected */) === 0 &&
                    getHostRef(this).$flags$ & 2 /* hasRendered */) {
                    const result = new FakeNodeList();
                    for (let i = 0; i < childNodes.length; i++) {
                        const slot = childNodes[i]['s-nr'];
                        if (slot) {
                            result.push(slot);
                        }
                    }
                    return result;
                }
                return FakeNodeList.from(childNodes);
            },
        });
    }
};
const getSlotName = (node) => node['s-sn'] || (node.nodeType === 1 && node.getAttribute('slot')) || '';
/**
 * Recursively searches a series of child nodes for a slot with the provided name.
 * @param childNodes the nodes to search for a slot with a specific name.
 * @param slotName the name of the slot to match on.
 * @returns a reference to the slot node that matches the provided name, `null` otherwise
 */
const getHostSlotNode = (childNodes, slotName) => {
    let i = 0;
    let childNode;
    for (; i < childNodes.length; i++) {
        childNode = childNodes[i];
        if (childNode['s-sr'] && childNode['s-sn'] === slotName) {
            return childNode;
        }
        childNode = getHostSlotNode(childNode.childNodes, slotName);
        if (childNode) {
            return childNode;
        }
    }
    return null;
};
const getHostSlotChildNodes = (n, slotName) => {
    const childNodes = [n];
    while ((n = n.nextSibling) && n['s-sn'] === slotName) {
        childNodes.push(n);
    }
    return childNodes;
};
const bootstrapLazy = (lazyBundles, options = {}) => {
    if (BUILD.profile && performance.mark) {
        performance.mark('st:app:start');
    }
    installDevTools();
    const endBootstrap = createTime('bootstrapLazy');
    const cmpTags = [];
    const exclude = options.exclude || [];
    const customElements = win.customElements;
    const head = doc.head;
    const metaCharset = /*@__PURE__*/ head.querySelector('meta[charset]');
    const visibilityStyle = /*@__PURE__*/ doc.createElement('style');
    const deferredConnectedCallbacks = [];
    const styles = /*@__PURE__*/ doc.querySelectorAll(`[${HYDRATED_STYLE_ID}]`);
    let appLoadFallback;
    let isBootstrapping = true;
    let i = 0;
    Object.assign(plt, options);
    plt.$resourcesUrl$ = new URL(options.resourcesUrl || './', doc.baseURI).href;
    if (BUILD.asyncQueue) {
        if (options.syncQueue) {
            plt.$flags$ |= 4 /* queueSync */;
        }
    }
    if (BUILD.hydrateClientSide) {
        // If the app is already hydrated there is not point to disable the
        // async queue. This will improve the first input delay
        plt.$flags$ |= 2 /* appLoaded */;
    }
    if (BUILD.hydrateClientSide && BUILD.shadowDom) {
        for (; i < styles.length; i++) {
            registerStyle(styles[i].getAttribute(HYDRATED_STYLE_ID), convertScopedToShadow(styles[i].innerHTML), true);
        }
    }
    lazyBundles.map((lazyBundle) => lazyBundle[1].map((compactMeta) => {
        const cmpMeta = {
            $flags$: compactMeta[0],
            $tagName$: compactMeta[1],
            $members$: compactMeta[2],
            $listeners$: compactMeta[3],
        };
        if (BUILD.member) {
            cmpMeta.$members$ = compactMeta[2];
        }
        if (BUILD.hostListener) {
            cmpMeta.$listeners$ = compactMeta[3];
        }
        if (BUILD.reflect) {
            cmpMeta.$attrsToReflect$ = [];
        }
        if (BUILD.watchCallback) {
            cmpMeta.$watchers$ = {};
        }
        if (BUILD.shadowDom && !supportsShadow && cmpMeta.$flags$ & 1 /* shadowDomEncapsulation */) {
            cmpMeta.$flags$ |= 8 /* needsShadowDomShim */;
        }
        const tagName = BUILD.transformTagName && options.transformTagName
            ? options.transformTagName(cmpMeta.$tagName$)
            : cmpMeta.$tagName$;
        const HostElement = class extends HTMLElement {
            // StencilLazyHost
            constructor(self) {
                // @ts-ignore
                super(self);
                self = this;
                registerHost(self, cmpMeta);
                if (BUILD.shadowDom && cmpMeta.$flags$ & 1 /* shadowDomEncapsulation */) {
                    // this component is using shadow dom
                    // and this browser supports shadow dom
                    // add the read-only property "shadowRoot" to the host element
                    // adding the shadow root build conditionals to minimize runtime
                    if (supportsShadow) {
                        if (BUILD.shadowDelegatesFocus) {
                            self.attachShadow({
                                mode: 'open',
                                delegatesFocus: !!(cmpMeta.$flags$ & 16 /* shadowDelegatesFocus */),
                            });
                        }
                        else {
                            self.attachShadow({ mode: 'open' });
                        }
                    }
                    else if (!BUILD.hydrateServerSide && !('shadowRoot' in self)) {
                        self.shadowRoot = self;
                    }
                }
                if (BUILD.slotChildNodesFix) {
                    patchChildSlotNodes(self, cmpMeta);
                }
            }
            connectedCallback() {
                if (appLoadFallback) {
                    clearTimeout(appLoadFallback);
                    appLoadFallback = null;
                }
                if (isBootstrapping) {
                    // connectedCallback will be processed once all components have been registered
                    deferredConnectedCallbacks.push(this);
                }
                else {
                    plt.jmp(() => connectedCallback(this));
                }
            }
            disconnectedCallback() {
                plt.jmp(() => disconnectedCallback(this));
            }
            componentOnReady() {
                return getHostRef(this).$onReadyPromise$;
            }
        };
        if (BUILD.cloneNodeFix) {
            patchCloneNode(HostElement.prototype);
        }
        if (BUILD.appendChildSlotFix) {
            patchSlotAppendChild(HostElement.prototype);
        }
        if (BUILD.hotModuleReplacement) {
            HostElement.prototype['s-hmr'] = function (hmrVersionId) {
                hmrStart(this, cmpMeta, hmrVersionId);
            };
        }
        if (BUILD.scopedSlotTextContentFix) {
            patchTextContent(HostElement.prototype, cmpMeta);
        }
        cmpMeta.$lazyBundleId$ = lazyBundle[0];
        if (!exclude.includes(tagName) && !customElements.get(tagName)) {
            cmpTags.push(tagName);
            customElements.define(tagName, proxyComponent(HostElement, cmpMeta, 1 /* isElementConstructor */));
        }
    }));
    if (BUILD.invisiblePrehydration && (BUILD.hydratedClass || BUILD.hydratedAttribute)) {
        visibilityStyle.innerHTML = cmpTags + HYDRATED_CSS;
        visibilityStyle.setAttribute('data-styles', '');
        head.insertBefore(visibilityStyle, metaCharset ? metaCharset.nextSibling : head.firstChild);
    }
    // Process deferred connectedCallbacks now all components have been registered
    isBootstrapping = false;
    if (deferredConnectedCallbacks.length) {
        deferredConnectedCallbacks.map((host) => host.connectedCallback());
    }
    else {
        if (BUILD.profile) {
            plt.jmp(() => (appLoadFallback = setTimeout(appDidLoad, 30, 'timeout')));
        }
        else {
            plt.jmp(() => (appLoadFallback = setTimeout(appDidLoad, 30)));
        }
    }
    // Fallback appLoad event
    endBootstrap();
};
const getAssetPath = (path) => {
    const assetUrl = new URL(path, plt.$resourcesUrl$);
    return assetUrl.origin !== win.location.origin ? assetUrl.href : assetUrl.pathname;
};
const setAssetPath = (path) => (plt.$resourcesUrl$ = path);
const getConnect = (_ref, tagName) => {
    const componentOnReady = () => {
        let elm = doc.querySelector(tagName);
        if (!elm) {
            elm = doc.createElement(tagName);
            doc.body.appendChild(elm);
        }
        return typeof elm.componentOnReady === 'function' ? elm.componentOnReady() : Promise.resolve(elm);
    };
    const create = (...args) => {
        return componentOnReady().then((el) => el.create(...args));
    };
    return {
        create,
        componentOnReady,
    };
};
const getContext = (_elm, context) => {
    if (context in Context) {
        return Context[context];
    }
    else if (context === 'window') {
        return win;
    }
    else if (context === 'document') {
        return doc;
    }
    else if (context === 'isServer' || context === 'isPrerender') {
        return BUILD.hydrateServerSide ? true : false;
    }
    else if (context === 'isClient') {
        return BUILD.hydrateServerSide ? false : true;
    }
    else if (context === 'resourcesUrl' || context === 'publicPath') {
        return getAssetPath('.');
    }
    else if (context === 'queue') {
        return {
            write: writeTask,
            read: readTask,
            tick: {
                then(cb) {
                    return nextTick(cb);
                },
            },
        };
    }
    return undefined;
};
const insertVdomAnnotations = (doc, staticComponents) => {
    if (doc != null) {
        const docData = {
            hostIds: 0,
            rootLevelIds: 0,
            staticComponents: new Set(staticComponents),
        };
        const orgLocationNodes = [];
        parseVNodeAnnotations(doc, doc.body, docData, orgLocationNodes);
        orgLocationNodes.forEach((orgLocationNode) => {
            if (orgLocationNode != null) {
                const nodeRef = orgLocationNode['s-nr'];
                let hostId = nodeRef['s-host-id'];
                let nodeId = nodeRef['s-node-id'];
                let childId = `${hostId}.${nodeId}`;
                if (hostId == null) {
                    hostId = 0;
                    docData.rootLevelIds++;
                    nodeId = docData.rootLevelIds;
                    childId = `${hostId}.${nodeId}`;
                    if (nodeRef.nodeType === 1 /* ElementNode */) {
                        nodeRef.setAttribute(HYDRATE_CHILD_ID, childId);
                    }
                    else if (nodeRef.nodeType === 3 /* TextNode */) {
                        if (hostId === 0) {
                            const textContent = nodeRef.nodeValue.trim();
                            if (textContent === '') {
                                // useless whitespace node at the document root
                                orgLocationNode.remove();
                                return;
                            }
                        }
                        const commentBeforeTextNode = doc.createComment(childId);
                        commentBeforeTextNode.nodeValue = `${TEXT_NODE_ID}.${childId}`;
                        nodeRef.parentNode.insertBefore(commentBeforeTextNode, nodeRef);
                    }
                }
                let orgLocationNodeId = `${ORG_LOCATION_ID}.${childId}`;
                const orgLocationParentNode = orgLocationNode.parentElement;
                if (orgLocationParentNode) {
                    if (orgLocationParentNode['s-en'] === '') {
                        // ending with a "." means that the parent element
                        // of this node's original location is a SHADOW dom element
                        // and this node is apart of the root level light dom
                        orgLocationNodeId += `.`;
                    }
                    else if (orgLocationParentNode['s-en'] === 'c') {
                        // ending with a ".c" means that the parent element
                        // of this node's original location is a SCOPED element
                        // and this node is apart of the root level light dom
                        orgLocationNodeId += `.c`;
                    }
                }
                orgLocationNode.nodeValue = orgLocationNodeId;
            }
        });
    }
};
const parseVNodeAnnotations = (doc, node, docData, orgLocationNodes) => {
    if (node == null) {
        return;
    }
    if (node['s-nr'] != null) {
        orgLocationNodes.push(node);
    }
    if (node.nodeType === 1 /* ElementNode */) {
        node.childNodes.forEach((childNode) => {
            const hostRef = getHostRef(childNode);
            if (hostRef != null && !docData.staticComponents.has(childNode.nodeName.toLowerCase())) {
                const cmpData = {
                    nodeIds: 0,
                };
                insertVNodeAnnotations(doc, childNode, hostRef.$vnode$, docData, cmpData);
            }
            parseVNodeAnnotations(doc, childNode, docData, orgLocationNodes);
        });
    }
};
const insertVNodeAnnotations = (doc, hostElm, vnode, docData, cmpData) => {
    if (vnode != null) {
        const hostId = ++docData.hostIds;
        hostElm.setAttribute(HYDRATE_ID, hostId);
        if (hostElm['s-cr'] != null) {
            hostElm['s-cr'].nodeValue = `${CONTENT_REF_ID}.${hostId}`;
        }
        if (vnode.$children$ != null) {
            const depth = 0;
            vnode.$children$.forEach((vnodeChild, index) => {
                insertChildVNodeAnnotations(doc, vnodeChild, cmpData, hostId, depth, index);
            });
        }
        if (hostElm && vnode && vnode.$elm$ && !hostElm.hasAttribute('c-id')) {
            const parent = hostElm.parentElement;
            if (parent && parent.childNodes) {
                const parentChildNodes = Array.from(parent.childNodes);
                const comment = parentChildNodes.find((node) => node.nodeType === 8 /* CommentNode */ && node['s-sr']);
                if (comment) {
                    const index = parentChildNodes.indexOf(hostElm) - 1;
                    vnode.$elm$.setAttribute(HYDRATE_CHILD_ID, `${comment['s-host-id']}.${comment['s-node-id']}.0.${index}`);
                }
            }
        }
    }
};
const insertChildVNodeAnnotations = (doc, vnodeChild, cmpData, hostId, depth, index) => {
    const childElm = vnodeChild.$elm$;
    if (childElm == null) {
        return;
    }
    const nodeId = cmpData.nodeIds++;
    const childId = `${hostId}.${nodeId}.${depth}.${index}`;
    childElm['s-host-id'] = hostId;
    childElm['s-node-id'] = nodeId;
    if (childElm.nodeType === 1 /* ElementNode */) {
        childElm.setAttribute(HYDRATE_CHILD_ID, childId);
    }
    else if (childElm.nodeType === 3 /* TextNode */) {
        const parentNode = childElm.parentNode;
        const nodeName = parentNode.nodeName;
        if (nodeName !== 'STYLE' && nodeName !== 'SCRIPT') {
            const textNodeId = `${TEXT_NODE_ID}.${childId}`;
            const commentBeforeTextNode = doc.createComment(textNodeId);
            parentNode.insertBefore(commentBeforeTextNode, childElm);
        }
    }
    else if (childElm.nodeType === 8 /* CommentNode */) {
        if (childElm['s-sr']) {
            const slotName = childElm['s-sn'] || '';
            const slotNodeId = `${SLOT_NODE_ID}.${childId}.${slotName}`;
            childElm.nodeValue = slotNodeId;
        }
    }
    if (vnodeChild.$children$ != null) {
        const childDepth = depth + 1;
        vnodeChild.$children$.forEach((vnode, index) => {
            insertChildVNodeAnnotations(doc, vnode, cmpData, hostId, childDepth, index);
        });
    }
};
const setPlatformOptions = (opts) => Object.assign(plt, opts);
const Fragment = (_, children) => children;
const hostRefs = new WeakMap();
const getHostRef = (ref) => hostRefs.get(ref);
const registerInstance = (lazyInstance, hostRef) => hostRefs.set((hostRef.$lazyInstance$ = lazyInstance), hostRef);
const registerHost = (elm, cmpMeta) => {
    const hostRef = {
        $flags$: 0,
        $hostElement$: elm,
        $cmpMeta$: cmpMeta,
        $instanceValues$: new Map(),
    };
    if (BUILD.isDev) {
        hostRef.$renderCount$ = 0;
    }
    if (BUILD.method && BUILD.lazyLoad) {
        hostRef.$onInstancePromise$ = new Promise((r) => (hostRef.$onInstanceResolve$ = r));
    }
    if (BUILD.asyncLoading) {
        hostRef.$onReadyPromise$ = new Promise((r) => (hostRef.$onReadyResolve$ = r));
        elm['s-p'] = [];
        elm['s-rc'] = [];
    }
    addHostEventListeners(elm, hostRef, cmpMeta.$listeners$, false);
    return hostRefs.set(elm, hostRef);
};
const isMemberInElement = (elm, memberName) => memberName in elm;
const consoleError = (e, el) => (customError || console.error)(e, el);
const STENCIL_DEV_MODE = BUILD.isTesting
    ? ['STENCIL:'] // E2E testing
    : [
        '%cstencil',
        'color: white;background:#4c47ff;font-weight: bold; font-size:10px; padding:2px 6px; border-radius: 5px',
    ];
const consoleDevError = (...m) => console.error(...STENCIL_DEV_MODE, ...m);
const consoleDevWarn = (...m) => console.warn(...STENCIL_DEV_MODE, ...m);
const consoleDevInfo = (...m) => console.info(...STENCIL_DEV_MODE, ...m);
const setErrorHandler = (handler) => (customError = handler);
const cmpModules = /*@__PURE__*/ new Map();
const loadModule = (cmpMeta, hostRef, hmrVersionId) => {
    // loadModuleImport
    const exportName = cmpMeta.$tagName$.replace(/-/g, '_');
    const bundleId = cmpMeta.$lazyBundleId$;
    if (BUILD.isDev && typeof bundleId !== 'string') {
        consoleDevError(`Trying to lazily load component <${cmpMeta.$tagName$}> with style mode "${hostRef.$modeName$}", but it does not exist.`);
        return undefined;
    }
    const module = !BUILD.hotModuleReplacement ? cmpModules.get(bundleId) : false;
    if (module) {
        return module[exportName];
    }
    return import(
    /* webpackInclude: /\.entry\.js$/ */
    /* webpackExclude: /\.system\.entry\.js$/ */
    /* webpackMode: "lazy" */
    `./${bundleId}.entry.js${BUILD.hotModuleReplacement && hmrVersionId ? '?s-hmr=' + hmrVersionId : ''}`).then((importedModule) => {
        if (!BUILD.hotModuleReplacement) {
            cmpModules.set(bundleId, importedModule);
        }
        return importedModule[exportName];
    }, consoleError);
};
const styles = new Map();
const modeResolutionChain = [];
const queueDomReads = [];
const queueDomWrites = [];
const queueDomWritesLow = [];
const queueTask = (queue, write) => (cb) => {
    queue.push(cb);
    if (!queuePending) {
        queuePending = true;
        if (write && plt.$flags$ & 4 /* queueSync */) {
            nextTick(flush);
        }
        else {
            plt.raf(flush);
        }
    }
};
const consume = (queue) => {
    for (let i = 0; i < queue.length; i++) {
        try {
            queue[i](performance.now());
        }
        catch (e) {
            consoleError(e);
        }
    }
    queue.length = 0;
};
const consumeTimeout = (queue, timeout) => {
    let i = 0;
    let ts = 0;
    while (i < queue.length && (ts = performance.now()) < timeout) {
        try {
            queue[i++](ts);
        }
        catch (e) {
            consoleError(e);
        }
    }
    if (i === queue.length) {
        queue.length = 0;
    }
    else if (i !== 0) {
        queue.splice(0, i);
    }
};
const flush = () => {
    if (BUILD.asyncQueue) {
        queueCongestion++;
    }
    // always force a bunch of medium callbacks to run, but still have
    // a throttle on how many can run in a certain time
    // DOM READS!!!
    consume(queueDomReads);
    // DOM WRITES!!!
    if (BUILD.asyncQueue) {
        const timeout = (plt.$flags$ & 6 /* queueMask */) === 2 /* appLoaded */
            ? performance.now() + 14 * Math.ceil(queueCongestion * (1.0 / 10.0))
            : Infinity;
        consumeTimeout(queueDomWrites, timeout);
        consumeTimeout(queueDomWritesLow, timeout);
        if (queueDomWrites.length > 0) {
            queueDomWritesLow.push(...queueDomWrites);
            queueDomWrites.length = 0;
        }
        if ((queuePending = queueDomReads.length + queueDomWrites.length + queueDomWritesLow.length > 0)) {
            // still more to do yet, but we've run out of time
            // let's let this thing cool off and try again in the next tick
            plt.raf(flush);
        }
        else {
            queueCongestion = 0;
        }
    }
    else {
        consume(queueDomWrites);
        if ((queuePending = queueDomReads.length > 0)) {
            // still more to do yet, but we've run out of time
            // let's let this thing cool off and try again in the next tick
            plt.raf(flush);
        }
    }
};
const nextTick = /*@__PURE__*/ (cb) => promiseResolve().then(cb);
const readTask = /*@__PURE__*/ queueTask(queueDomReads, false);
const writeTask = /*@__PURE__*/ queueTask(queueDomWrites, true);
const Build = {
    isDev: BUILD.isDev ? true : false,
    isBrowser: true,
    isServer: false,
    isTesting: BUILD.isTesting ? true : false,
};

let globalGL;
const getGL = (canvas) => {
  if (!globalGL) {
    if (!canvas)
      canvas = document.querySelector('canvas');
    if (!canvas)
      return null;
    globalGL = canvas.getContext('webgl2', { xrCompatible: true });
    globalGL.enable(globalGL.DEPTH_TEST);
    globalGL.enable(globalGL.CULL_FACE);
  }
  return globalGL;
};
class Texture2D {
  constructor(image) {
    this.unit = -1;
    this.image = image;
    this.gl = getGL();
    this.texture = this.gl.createTexture();
    this.bindTexture();
    const gl = this.gl;
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
    gl.generateMipmap(gl.TEXTURE_2D);
  }
  bindTexture(unit) {
    if (unit !== undefined) {
      this.gl.activeTexture(this.gl.TEXTURE0 + unit);
      this.unit = unit;
    }
    this.gl.bindTexture(this.gl.TEXTURE_2D, this.texture);
  }
  unbindTexture() {
    this.gl.activeTexture(this.gl.TEXTURE0 + this.unit);
    this.gl.bindTexture(this.gl.TEXTURE_2D, null);
  }
  uniform(location) {
    this.gl.uniform1i(location, this.unit);
  }
}
class FrameBufferObject {
  constructor(width, height, format) {
    this.gl = getGL();
    this.unit = -1;
    this.width = width;
    this.height = height;
    const gl = this.gl;
    // FBO 对帧缓存进行操作
    this.frameBuffer = gl.createFramebuffer();
    gl.bindFramebuffer(gl.FRAMEBUFFER, this.frameBuffer);
    this.texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, this.texture);
    // 创建一个空的纹理
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, width, height, 0, gl.RGBA, format || gl.UNSIGNED_BYTE, null);
    gl.generateMipmap(gl.TEXTURE_2D);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    // 存储数据，例如图像，或者可以是渲染操作的源或目标。
    this.depth = gl.createRenderbuffer();
    gl.bindRenderbuffer(gl.RENDERBUFFER, this.depth);
    // 创建并初始化渲染缓冲区对象的数据存储。
    gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT16, width, height);
    // 将纹理对象关联到FBO
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, this.texture, 0);
    gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.RENDERBUFFER, this.depth);
    gl.bindTexture(gl.TEXTURE_2D, null);
    gl.bindRenderbuffer(gl.RENDERBUFFER, null);
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
  }
  bind() {
    this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, this.frameBuffer);
    this.gl.viewport(0, 0, this.width, this.height);
  }
  unbind() {
    this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, null);
  }
  bindTexture(unit) {
    if (unit !== undefined) {
      this.gl.activeTexture(this.gl.TEXTURE0 + unit);
      this.unit = unit;
    }
    this.gl.bindTexture(this.gl.TEXTURE_2D, this.texture);
  }
  unbindTexture() {
    this.gl.activeTexture(this.gl.TEXTURE0 + this.unit);
    this.gl.bindTexture(this.gl.TEXTURE_2D, null);
  }
  uniform(location) {
    this.gl.uniform1i(location, this.unit);
  }
}
/**
 * 创建一个存储对象。可以在场景图遍历的过程中动态bind
 */
class BufferObject {
  constructor() {
    this.gl = getGL();
    this.buffer = this.gl.createBuffer();
  }
  initBufferData(location, vertexData) {
    this.bind();
    this.location = location;
    this.length = vertexData.length;
    this.gl.bufferData(this.gl.ARRAY_BUFFER, vertexData, this.gl.STATIC_DRAW);
    this.unbind();
  }
  bind() {
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.buffer);
    const stride = 0;
    const offset = 0;
    const normalized = false;
    this.gl.vertexAttribPointer(this.location, 3, this.gl.FLOAT, normalized, stride, offset);
    this.gl.enableVertexAttribArray(this.location);
  }
  unbind() {
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, null);
  }
}
class VertexBufferObject extends BufferObject {
  constructor() {
    super();
  }
  drawTriangles() {
    this.gl.drawArrays(this.gl.TRIANGLES, 0, this.length / 3);
  }
}
const setCanvasFullScreen = (canvas, scene) => {
  const onResize = () => {
    canvas.width = scene.viewportWidth = window.innerWidth;
    canvas.height = scene.viewportHeight = window.innerHeight;
    scene.draw();
  };
  window.addEventListener('resize', onResize, false);
  onResize();
};

const createGlValue = (set, value) => {
  const setValue = (value) => {
    const uniform = location => {
      set(location, value);
    };
    return { uniform, value };
  };
  return setValue(value);
};
const gl = getGL();
const Mat4 = value => {
  return createGlValue((location) => {
    gl.uniformMatrix4fv(location, false, value);
  }, value);
};
const Mat3 = value => {
  return createGlValue((location) => {
    gl.uniformMatrix3fv(location, false, value);
  }, value);
};
const Vec3 = value => {
  return createGlValue((location) => {
    gl.uniform3fv(location, value);
  }, value);
};
const Vec4 = value => {
  return createGlValue((location) => {
    gl.uniform4fv(location, value);
  }, value);
};
const Int = value => {
  return createGlValue((location) => {
    gl.uniform1i(location, value);
  }, value);
};

/*
 * glMatrix.js - High performance matrix and vector operations for WebGL
 * version 0.9.6
 */
/*
 * Copyright (c) 2011 Brandon Jones
 *
 * This software is provided 'as-is', without any express or implied
 * warranty. In no event will the authors be held liable for any damages
 * arising from the use of this software.
 *
 * Permission is granted to anyone to use this software for any purpose,
 * including commercial applications, and to alter it and redistribute it
 * freely, subject to the following restrictions:
 *
 *    1. The origin of this software must not be misrepresented; you must not
 *    claim that you wrote the original software. If you use this software
 *    in a product, an acknowledgment in the product documentation would be
 *    appreciated but is not required.
 *
 *    2. Altered source versions must be plainly marked as such, and must not
 *    be misrepresented as being the original software.
 *
 *    3. This notice may not be removed or altered from any source
 *    distribution.
 */
/*
 * vec3 - 3 Dimensional Vector
 */
const vec3 = {
  /*
   * vec3.create
   * Creates a new instance of a vec3 using the default array type
   * Any javascript array containing at least 3 numeric elements can serve as a vec3
   *
   * Params:
   * vec - Optional, vec3 containing values to initialize with
   *
   * Returns:
   * New vec3
   */
  create: function (vec) {
    var dest = new Float32Array(3);
    if (vec) {
      dest[0] = vec[0];
      dest[1] = vec[1];
      dest[2] = vec[2];
    }
    return dest;
  },
  /*
   * vec3.set
   * Copies the values of one vec3 to another
   *
   * Params:
   * vec - vec3 containing values to copy
   * dest - vec3 receiving copied values
   *
   * Returns:
   * dest
   */
  set: function (vec, dest) {
    dest[0] = vec[0];
    dest[1] = vec[1];
    dest[2] = vec[2];
    return dest;
  },
  /*
   * vec3.add
   * Performs a vector addition
   *
   * Params:
   * vec - vec3, first operand
   * vec2 - vec3, second operand
   * dest - Optional, vec3 receiving operation result. If not specified result is written to vec
   *
   * Returns:
   * dest if specified, vec otherwise
   */
  add: function (vec, vec2, dest) {
    if (!dest || vec == dest) {
      vec[0] += vec2[0];
      vec[1] += vec2[1];
      vec[2] += vec2[2];
      return vec;
    }
    dest[0] = vec[0] + vec2[0];
    dest[1] = vec[1] + vec2[1];
    dest[2] = vec[2] + vec2[2];
    return dest;
  },
  /*
   * vec3.subtract
   * Performs a vector subtraction
   *
   * Params:
   * vec - vec3, first operand
   * vec2 - vec3, second operand
   * dest - Optional, vec3 receiving operation result. If not specified result is written to vec
   *
   * Returns:
   * dest if specified, vec otherwise
   */
  subtract: function (vec, vec2, dest) {
    if (!dest || vec == dest) {
      vec[0] -= vec2[0];
      vec[1] -= vec2[1];
      vec[2] -= vec2[2];
      return vec;
    }
    dest[0] = vec[0] - vec2[0];
    dest[1] = vec[1] - vec2[1];
    dest[2] = vec[2] - vec2[2];
    return dest;
  },
  /*
   * vec3.negate
   * Negates the components of a vec3
   *
   * Params:
   * vec - vec3 to negate
   * dest - Optional, vec3 receiving operation result. If not specified result is written to vec
   *
   * Returns:
   * dest if specified, vec otherwise
   */
  negate: function (vec, dest) {
    if (!dest) {
      dest = vec;
    }
    dest[0] = -vec[0];
    dest[1] = -vec[1];
    dest[2] = -vec[2];
    return dest;
  },
  /*
   * vec3.scale
   * Multiplies the components of a vec3 by a scalar value
   *
   * Params:
   * vec - vec3 to scale
   * val - Numeric value to scale by
   * dest - Optional, vec3 receiving operation result. If not specified result is written to vec
   *
   * Returns:
   * dest if specified, vec otherwise
   */
  scale: function (vec, val, dest) {
    if (!dest || vec == dest) {
      vec[0] *= val;
      vec[1] *= val;
      vec[2] *= val;
      return vec;
    }
    dest[0] = vec[0] * val;
    dest[1] = vec[1] * val;
    dest[2] = vec[2] * val;
    return dest;
  },
  /*
   * vec3.normalize
   * Generates a unit vector of the same direction as the provided vec3
   * If vector length is 0, returns [0, 0, 0]
   *
   * Params:
   * vec - vec3 to normalize
   * dest - Optional, vec3 receiving operation result. If not specified result is written to vec
   *
   * Returns:
   * dest if specified, vec otherwise
   */
  normalize: function (vec, dest) {
    if (!dest) {
      dest = vec;
    }
    var x = vec[0], y = vec[1], z = vec[2];
    var len = Math.sqrt(x * x + y * y + z * z);
    if (!len) {
      dest[0] = 0;
      dest[1] = 0;
      dest[2] = 0;
      return dest;
    }
    else if (len == 1) {
      dest[0] = x;
      dest[1] = y;
      dest[2] = z;
      return dest;
    }
    len = 1 / len;
    dest[0] = x * len;
    dest[1] = y * len;
    dest[2] = z * len;
    return dest;
  },
  /*
   * vec3.cross
   * Generates the cross product of two vec3s
   *
   * Params:
   * vec - vec3, first operand
   * vec2 - vec3, second operand
   * dest - Optional, vec3 receiving operation result. If not specified result is written to vec
   *
   * Returns:
   * dest if specified, vec otherwise
   */
  cross: function (vec, vec2, dest) {
    if (!dest) {
      dest = vec;
    }
    var x = vec[0], y = vec[1], z = vec[2];
    var x2 = vec2[0], y2 = vec2[1], z2 = vec2[2];
    dest[0] = y * z2 - z * y2;
    dest[1] = z * x2 - x * z2;
    dest[2] = x * y2 - y * x2;
    return dest;
  },
  /*
   * vec3.length
   * Caclulates the length of a vec3
   *
   * Params:
   * vec - vec3 to calculate length of
   *
   * Returns:
   * Length of vec
   */
  length: function (vec) {
    var x = vec[0], y = vec[1], z = vec[2];
    return Math.sqrt(x * x + y * y + z * z);
  },
  /*
   * vec3.dot
   * Caclulates the dot product of two vec3s
   *
   * Params:
   * vec - vec3, first operand
   * vec2 - vec3, second operand
   *
   * Returns:
   * Dot product of vec and vec2
   */
  dot: function (vec, vec2) {
    return vec[0] * vec2[0] + vec[1] * vec2[1] + vec[2] * vec2[2];
  },
  /*
   * vec3.direction
   * Generates a unit vector pointing from one vector to another
   *
   * Params:
   * vec - origin vec3
   * vec2 - vec3 to point to
   * dest - Optional, vec3 receiving operation result. If not specified result is written to vec
   *
   * Returns:
   * dest if specified, vec otherwise
   */
  direction: function (vec, vec2, dest) {
    if (!dest) {
      dest = vec;
    }
    var x = vec[0] - vec2[0];
    var y = vec[1] - vec2[1];
    var z = vec[2] - vec2[2];
    var len = Math.sqrt(x * x + y * y + z * z);
    if (!len) {
      dest[0] = 0;
      dest[1] = 0;
      dest[2] = 0;
      return dest;
    }
    len = 1 / len;
    dest[0] = x * len;
    dest[1] = y * len;
    dest[2] = z * len;
    return dest;
  },
  /*
   * vec3.lerp
   * Performs a linear interpolation between two vec3
   * 线性插值
   *
   * Params:
   * vec - vec3, first vector
   * vec2 - vec3, second vector
   * lerp - interpolation amount between the two inputs
   * dest - Optional, vec3 receiving operation result. If not specified result is written to vec
   *
   * Returns:
   * dest if specified, vec otherwise
   */
  lerp: function (vec, vec2, lerp, dest) {
    if (!dest) {
      dest = vec;
    }
    dest[0] = vec[0] + lerp * (vec2[0] - vec[0]);
    dest[1] = vec[1] + lerp * (vec2[1] - vec[1]);
    dest[2] = vec[2] + lerp * (vec2[2] - vec[2]);
    return dest;
  },
  /*
   * vec3.str
   * Returns a string representation of a vector
   *
   * Params:
   * vec - vec3 to represent as a string
   *
   * Returns:
   * string representation of vec
   */
  str: function (vec) {
    return '[' + vec[0] + ', ' + vec[1] + ', ' + vec[2] + ']';
  },
};
/*
 * mat3 - 3x3 Matrix
 */
const mat3 = {
  /*
   * mat3.create
   * Creates a new instance of a mat3 using the default array type
   * Any javascript array containing at least 9 numeric elements can serve as a mat3
   *
   * Params:
   * mat - Optional, mat3 containing values to initialize with
   *
   * Returns:
   * New mat3
   */
  create: function (mat) {
    var dest = new Float32Array(9);
    if (mat) {
      dest[0] = mat[0];
      dest[1] = mat[1];
      dest[2] = mat[2];
      dest[3] = mat[3];
      dest[4] = mat[4];
      dest[5] = mat[5];
      dest[6] = mat[6];
      dest[7] = mat[7];
      dest[8] = mat[8];
    }
    return dest;
  },
  /*
   * mat3.set
   * Copies the values of one mat3 to another
   *
   * Params:
   * mat - mat3 containing values to copy
   * dest - mat3 receiving copied values
   *
   * Returns:
   * dest
   */
  set: function (mat, dest) {
    dest[0] = mat[0];
    dest[1] = mat[1];
    dest[2] = mat[2];
    dest[3] = mat[3];
    dest[4] = mat[4];
    dest[5] = mat[5];
    dest[6] = mat[6];
    dest[7] = mat[7];
    dest[8] = mat[8];
    return dest;
  },
  /*
   * mat3.identity
   * Sets a mat3 to an identity matrix
   *
   * Params:
   * dest - mat3 to set
   *
   * Returns:
   * dest
   */
  identity: function (dest) {
    dest[0] = 1;
    dest[1] = 0;
    dest[2] = 0;
    dest[3] = 0;
    dest[4] = 1;
    dest[5] = 0;
    dest[6] = 0;
    dest[7] = 0;
    dest[8] = 1;
    return dest;
  },
  /*
   * mat4.transpose
   * Transposes a mat3 (flips the values over the diagonal)
   *
   * Params:
   * mat - mat3 to transpose
   * dest - Optional, mat3 receiving transposed values. If not specified result is written to mat
   *
   * Returns:
   * dest is specified, mat otherwise
   */
  transpose: function (mat, dest) {
    // If we are transposing ourselves we can skip a few steps but have to cache some values
    if (!dest || mat == dest) {
      var a01 = mat[1], a02 = mat[2];
      var a12 = mat[5];
      mat[1] = mat[3];
      mat[2] = mat[6];
      mat[3] = a01;
      mat[5] = mat[7];
      mat[6] = a02;
      mat[7] = a12;
      return mat;
    }
    dest[0] = mat[0];
    dest[1] = mat[3];
    dest[2] = mat[6];
    dest[3] = mat[1];
    dest[4] = mat[4];
    dest[5] = mat[7];
    dest[6] = mat[2];
    dest[7] = mat[5];
    dest[8] = mat[8];
    return dest;
  },
  /*
   * mat3.toMat4
   * Copies the elements of a mat3 into the upper 3x3 elements of a mat4
   *
   * Params:
   * mat - mat3 containing values to copy
   * dest - Optional, mat4 receiving copied values
   *
   * Returns:
   * dest if specified, a new mat4 otherwise
   */
  toMat4: function (mat, dest) {
    if (!dest) {
      dest = mat4.create();
    }
    dest[0] = mat[0];
    dest[1] = mat[1];
    dest[2] = mat[2];
    dest[3] = 0;
    dest[4] = mat[3];
    dest[5] = mat[4];
    dest[6] = mat[5];
    dest[7] = 0;
    dest[8] = mat[6];
    dest[9] = mat[7];
    dest[10] = mat[8];
    dest[11] = 0;
    dest[12] = 0;
    dest[13] = 0;
    dest[14] = 0;
    dest[15] = 1;
    return dest;
  },
  /*
   * mat3.str
   * Returns a string representation of a mat3
   *
   * Params:
   * mat - mat3 to represent as a string
   *
   * Returns:
   * string representation of mat
   */
  str: function (mat) {
    return '[' + mat[0] + ', ' + mat[1] + ', ' + mat[2] + ', ' + mat[3] + ', ' + mat[4] + ', ' + mat[5] + ', ' + mat[6] + ', ' + mat[7] + ', ' + mat[8] + ']';
  },
};
/*
 * mat4 - 4x4 Matrix
 */
const mat4 = {
  /*
   * mat4.create
   * Creates a new instance of a mat4 using the default array type
   * Any javascript array containing at least 16 numeric elements can serve as a mat4
   *
   * Params:
   * mat - Optional, mat4 containing values to initialize with
   *
   * Returns:
   * New mat4
   */
  create: function (mat) {
    var dest = new Float32Array(16);
    if (mat) {
      dest[0] = mat[0];
      dest[1] = mat[1];
      dest[2] = mat[2];
      dest[3] = mat[3];
      dest[4] = mat[4];
      dest[5] = mat[5];
      dest[6] = mat[6];
      dest[7] = mat[7];
      dest[8] = mat[8];
      dest[9] = mat[9];
      dest[10] = mat[10];
      dest[11] = mat[11];
      dest[12] = mat[12];
      dest[13] = mat[13];
      dest[14] = mat[14];
      dest[15] = mat[15];
    }
    return dest;
  },
  /*
   * mat4.set
   * Copies the values of one mat4 to another
   *
   * Params:
   * mat - mat4 containing values to copy
   * dest - mat4 receiving copied values
   *
   * Returns:
   * dest
   */
  set: function (mat, dest) {
    dest[0] = mat[0];
    dest[1] = mat[1];
    dest[2] = mat[2];
    dest[3] = mat[3];
    dest[4] = mat[4];
    dest[5] = mat[5];
    dest[6] = mat[6];
    dest[7] = mat[7];
    dest[8] = mat[8];
    dest[9] = mat[9];
    dest[10] = mat[10];
    dest[11] = mat[11];
    dest[12] = mat[12];
    dest[13] = mat[13];
    dest[14] = mat[14];
    dest[15] = mat[15];
    return dest;
  },
  /*
   * mat4.identity
   * Sets a mat4 to an identity matrix
   *
   * Params:
   * dest - mat4 to set
   *
   * Returns:
   * dest
   */
  identity: function (dest) {
    dest[0] = 1;
    dest[1] = 0;
    dest[2] = 0;
    dest[3] = 0;
    dest[4] = 0;
    dest[5] = 1;
    dest[6] = 0;
    dest[7] = 0;
    dest[8] = 0;
    dest[9] = 0;
    dest[10] = 1;
    dest[11] = 0;
    dest[12] = 0;
    dest[13] = 0;
    dest[14] = 0;
    dest[15] = 1;
    return dest;
  },
  /*
   * mat4.transpose
   * Transposes a mat4 (flips the values over the diagonal)
   *
   * Params:
   * mat - mat4 to transpose
   * dest - Optional, mat4 receiving transposed values. If not specified result is written to mat
   *
   * Returns:
   * dest is specified, mat otherwise
   */
  transpose: function (mat, dest) {
    // If we are transposing ourselves we can skip a few steps but have to cache some values
    if (!dest || mat == dest) {
      var a01 = mat[1], a02 = mat[2], a03 = mat[3];
      var a12 = mat[6], a13 = mat[7];
      var a23 = mat[11];
      mat[1] = mat[4];
      mat[2] = mat[8];
      mat[3] = mat[12];
      mat[4] = a01;
      mat[6] = mat[9];
      mat[7] = mat[13];
      mat[8] = a02;
      mat[9] = a12;
      mat[11] = mat[14];
      mat[12] = a03;
      mat[13] = a13;
      mat[14] = a23;
      return mat;
    }
    dest[0] = mat[0];
    dest[1] = mat[4];
    dest[2] = mat[8];
    dest[3] = mat[12];
    dest[4] = mat[1];
    dest[5] = mat[5];
    dest[6] = mat[9];
    dest[7] = mat[13];
    dest[8] = mat[2];
    dest[9] = mat[6];
    dest[10] = mat[10];
    dest[11] = mat[14];
    dest[12] = mat[3];
    dest[13] = mat[7];
    dest[14] = mat[11];
    dest[15] = mat[15];
    return dest;
  },
  /*
   * mat4.determinant
   * Calculates the determinant of a mat4
   *
   * Params:
   * mat - mat4 to calculate determinant of
   *
   * Returns:
   * determinant of mat
   */
  determinant: function (mat) {
    // Cache the matrix values (makes for huge speed increases!)
    var a00 = mat[0], a01 = mat[1], a02 = mat[2], a03 = mat[3];
    var a10 = mat[4], a11 = mat[5], a12 = mat[6], a13 = mat[7];
    var a20 = mat[8], a21 = mat[9], a22 = mat[10], a23 = mat[11];
    var a30 = mat[12], a31 = mat[13], a32 = mat[14], a33 = mat[15];
    return (a30 * a21 * a12 * a03 -
      a20 * a31 * a12 * a03 -
      a30 * a11 * a22 * a03 +
      a10 * a31 * a22 * a03 +
      a20 * a11 * a32 * a03 -
      a10 * a21 * a32 * a03 -
      a30 * a21 * a02 * a13 +
      a20 * a31 * a02 * a13 +
      a30 * a01 * a22 * a13 -
      a00 * a31 * a22 * a13 -
      a20 * a01 * a32 * a13 +
      a00 * a21 * a32 * a13 +
      a30 * a11 * a02 * a23 -
      a10 * a31 * a02 * a23 -
      a30 * a01 * a12 * a23 +
      a00 * a31 * a12 * a23 +
      a10 * a01 * a32 * a23 -
      a00 * a11 * a32 * a23 -
      a20 * a11 * a02 * a33 +
      a10 * a21 * a02 * a33 +
      a20 * a01 * a12 * a33 -
      a00 * a21 * a12 * a33 -
      a10 * a01 * a22 * a33 +
      a00 * a11 * a22 * a33);
  },
  /*
   * mat4.inverse
   * Calculates the inverse matrix of a mat4
   *
   * Params:
   * mat - mat4 to calculate inverse of
   * dest - Optional, mat4 receiving inverse matrix. If not specified result is written to mat
   *
   * Returns:
   * dest is specified, mat otherwise
   */
  inverse: function (mat, dest) {
    if (!dest) {
      dest = mat;
    }
    // Cache the matrix values (makes for huge speed increases!)
    var a00 = mat[0], a01 = mat[1], a02 = mat[2], a03 = mat[3];
    var a10 = mat[4], a11 = mat[5], a12 = mat[6], a13 = mat[7];
    var a20 = mat[8], a21 = mat[9], a22 = mat[10], a23 = mat[11];
    var a30 = mat[12], a31 = mat[13], a32 = mat[14], a33 = mat[15];
    var b00 = a00 * a11 - a01 * a10;
    var b01 = a00 * a12 - a02 * a10;
    var b02 = a00 * a13 - a03 * a10;
    var b03 = a01 * a12 - a02 * a11;
    var b04 = a01 * a13 - a03 * a11;
    var b05 = a02 * a13 - a03 * a12;
    var b06 = a20 * a31 - a21 * a30;
    var b07 = a20 * a32 - a22 * a30;
    var b08 = a20 * a33 - a23 * a30;
    var b09 = a21 * a32 - a22 * a31;
    var b10 = a21 * a33 - a23 * a31;
    var b11 = a22 * a33 - a23 * a32;
    // Calculate the determinant (inlined to avoid double-caching)
    var invDet = 1 / (b00 * b11 - b01 * b10 + b02 * b09 + b03 * b08 - b04 * b07 + b05 * b06);
    dest[0] = (a11 * b11 - a12 * b10 + a13 * b09) * invDet;
    dest[1] = (-a01 * b11 + a02 * b10 - a03 * b09) * invDet;
    dest[2] = (a31 * b05 - a32 * b04 + a33 * b03) * invDet;
    dest[3] = (-a21 * b05 + a22 * b04 - a23 * b03) * invDet;
    dest[4] = (-a10 * b11 + a12 * b08 - a13 * b07) * invDet;
    dest[5] = (a00 * b11 - a02 * b08 + a03 * b07) * invDet;
    dest[6] = (-a30 * b05 + a32 * b02 - a33 * b01) * invDet;
    dest[7] = (a20 * b05 - a22 * b02 + a23 * b01) * invDet;
    dest[8] = (a10 * b10 - a11 * b08 + a13 * b06) * invDet;
    dest[9] = (-a00 * b10 + a01 * b08 - a03 * b06) * invDet;
    dest[10] = (a30 * b04 - a31 * b02 + a33 * b00) * invDet;
    dest[11] = (-a20 * b04 + a21 * b02 - a23 * b00) * invDet;
    dest[12] = (-a10 * b09 + a11 * b07 - a12 * b06) * invDet;
    dest[13] = (a00 * b09 - a01 * b07 + a02 * b06) * invDet;
    dest[14] = (-a30 * b03 + a31 * b01 - a32 * b00) * invDet;
    dest[15] = (a20 * b03 - a21 * b01 + a22 * b00) * invDet;
    return dest;
  },
  /*
   * mat4.toRotationMat
   * Copies the upper 3x3 elements of a mat4 into another mat4
   *
   * Params:
   * mat - mat4 containing values to copy
   * dest - Optional, mat4 receiving copied values
   *
   * Returns:
   * dest is specified, a new mat4 otherwise
   */
  toRotationMat: function (mat, dest) {
    if (!dest) {
      dest = mat4.create();
    }
    dest[0] = mat[0];
    dest[1] = mat[1];
    dest[2] = mat[2];
    dest[3] = mat[3];
    dest[4] = mat[4];
    dest[5] = mat[5];
    dest[6] = mat[6];
    dest[7] = mat[7];
    dest[8] = mat[8];
    dest[9] = mat[9];
    dest[10] = mat[10];
    dest[11] = mat[11];
    dest[12] = 0;
    dest[13] = 0;
    dest[14] = 0;
    dest[15] = 1;
    return dest;
  },
  /*
   * mat4.toMat3
   * Copies the upper 3x3 elements of a mat4 into a mat3
   *
   * Params:
   * mat - mat4 containing values to copy
   * dest - Optional, mat3 receiving copied values
   *
   * Returns:
   * dest is specified, a new mat3 otherwise
   */
  toMat3: function (mat, dest) {
    if (!dest) {
      dest = mat3.create();
    }
    dest[0] = mat[0];
    dest[1] = mat[1];
    dest[2] = mat[2];
    dest[3] = mat[4];
    dest[4] = mat[5];
    dest[5] = mat[6];
    dest[6] = mat[8];
    dest[7] = mat[9];
    dest[8] = mat[10];
    return dest;
  },
  /*
   * mat4.toInverseMat3
   * Calculates the inverse of the upper 3x3 elements of a mat4 and copies the result into a mat3
   * The resulting matrix is useful for calculating transformed normals
   *
   * Params:
   * mat - mat4 containing values to invert and copy
   * dest - Optional, mat3 receiving values
   *
   * Returns:
   * dest is specified, a new mat3 otherwise
   */
  toInverseMat3: function (mat, dest) {
    // Cache the matrix values (makes for huge speed increases!)
    var a00 = mat[0], a01 = mat[1], a02 = mat[2];
    var a10 = mat[4], a11 = mat[5], a12 = mat[6];
    var a20 = mat[8], a21 = mat[9], a22 = mat[10];
    var b01 = a22 * a11 - a12 * a21;
    var b11 = -a22 * a10 + a12 * a20;
    var b21 = a21 * a10 - a11 * a20;
    var d = a00 * b01 + a01 * b11 + a02 * b21;
    if (!d) {
      return null;
    }
    var id = 1 / d;
    if (!dest) {
      dest = mat3.create();
    }
    dest[0] = b01 * id;
    dest[1] = (-a22 * a01 + a02 * a21) * id;
    dest[2] = (a12 * a01 - a02 * a11) * id;
    dest[3] = b11 * id;
    dest[4] = (a22 * a00 - a02 * a20) * id;
    dest[5] = (-a12 * a00 + a02 * a10) * id;
    dest[6] = b21 * id;
    dest[7] = (-a21 * a00 + a01 * a20) * id;
    dest[8] = (a11 * a00 - a01 * a10) * id;
    return dest;
  },
  /*
   * mat4.multiply
   * Performs a matrix multiplication
   *
   * Params:
   * mat - mat4, first operand
   * mat2 - mat4, second operand
   * dest - Optional, mat4 receiving operation result. If not specified result is written to mat
   *
   * Returns:
   * dest if specified, mat otherwise
   */
  multiply: function (mat, mat2, dest) {
    if (!dest) {
      dest = mat;
    }
    // Cache the matrix values (makes for huge speed increases!)
    var a00 = mat[0], a01 = mat[1], a02 = mat[2], a03 = mat[3];
    var a10 = mat[4], a11 = mat[5], a12 = mat[6], a13 = mat[7];
    var a20 = mat[8], a21 = mat[9], a22 = mat[10], a23 = mat[11];
    var a30 = mat[12], a31 = mat[13], a32 = mat[14], a33 = mat[15];
    var b00 = mat2[0], b01 = mat2[1], b02 = mat2[2], b03 = mat2[3];
    var b10 = mat2[4], b11 = mat2[5], b12 = mat2[6], b13 = mat2[7];
    var b20 = mat2[8], b21 = mat2[9], b22 = mat2[10], b23 = mat2[11];
    var b30 = mat2[12], b31 = mat2[13], b32 = mat2[14], b33 = mat2[15];
    dest[0] = b00 * a00 + b01 * a10 + b02 * a20 + b03 * a30;
    dest[1] = b00 * a01 + b01 * a11 + b02 * a21 + b03 * a31;
    dest[2] = b00 * a02 + b01 * a12 + b02 * a22 + b03 * a32;
    dest[3] = b00 * a03 + b01 * a13 + b02 * a23 + b03 * a33;
    dest[4] = b10 * a00 + b11 * a10 + b12 * a20 + b13 * a30;
    dest[5] = b10 * a01 + b11 * a11 + b12 * a21 + b13 * a31;
    dest[6] = b10 * a02 + b11 * a12 + b12 * a22 + b13 * a32;
    dest[7] = b10 * a03 + b11 * a13 + b12 * a23 + b13 * a33;
    dest[8] = b20 * a00 + b21 * a10 + b22 * a20 + b23 * a30;
    dest[9] = b20 * a01 + b21 * a11 + b22 * a21 + b23 * a31;
    dest[10] = b20 * a02 + b21 * a12 + b22 * a22 + b23 * a32;
    dest[11] = b20 * a03 + b21 * a13 + b22 * a23 + b23 * a33;
    dest[12] = b30 * a00 + b31 * a10 + b32 * a20 + b33 * a30;
    dest[13] = b30 * a01 + b31 * a11 + b32 * a21 + b33 * a31;
    dest[14] = b30 * a02 + b31 * a12 + b32 * a22 + b33 * a32;
    dest[15] = b30 * a03 + b31 * a13 + b32 * a23 + b33 * a33;
    return dest;
  },
  /*
   * mat4.multiplyVec3
   * Transforms a vec3 with the given matrix
   * 4th vector component is implicitly '1'
   *
   * Params:
   * mat - mat4 to transform the vector with
   * vec - vec3 to transform
   * dest - Optional, vec3 receiving operation result. If not specified result is written to vec
   *
   * Returns:
   * dest if specified, vec otherwise
   */
  multiplyVec3: function (mat, vec, dest) {
    if (!dest) {
      dest = vec;
    }
    var x = vec[0], y = vec[1], z = vec[2];
    dest[0] = mat[0] * x + mat[4] * y + mat[8] * z + mat[12];
    dest[1] = mat[1] * x + mat[5] * y + mat[9] * z + mat[13];
    dest[2] = mat[2] * x + mat[6] * y + mat[10] * z + mat[14];
    return dest;
  },
  /*
   * mat4.multiplyVec4
   * Transforms a vec4 with the given matrix
   *
   * Params:
   * mat - mat4 to transform the vector with
   * vec - vec4 to transform
   * dest - Optional, vec4 receiving operation result. If not specified result is written to vec
   *
   * Returns:
   * dest if specified, vec otherwise
   */
  multiplyVec4: function (mat, vec, dest) {
    if (!dest) {
      dest = vec;
    }
    var x = vec[0], y = vec[1], z = vec[2], w = vec[3];
    dest[0] = mat[0] * x + mat[4] * y + mat[8] * z + mat[12] * w;
    dest[1] = mat[1] * x + mat[5] * y + mat[9] * z + mat[13] * w;
    dest[2] = mat[2] * x + mat[6] * y + mat[10] * z + mat[14] * w;
    dest[3] = mat[3] * x + mat[7] * y + mat[11] * z + mat[15] * w;
    return dest;
  },
  /*
   * mat4.translate
   * Translates a matrix by the given vector
   *
   * Params:
   * mat - mat4 to translate
   * vec - vec3 specifying the translation
   * dest - Optional, mat4 receiving operation result. If not specified result is written to mat
   *
   * Returns:
   * dest if specified, mat otherwise
   */
  translate: function (mat, vec, dest) {
    var x = vec[0], y = vec[1], z = vec[2];
    if (!dest || mat == dest) {
      mat[12] = mat[0] * x + mat[4] * y + mat[8] * z + mat[12];
      mat[13] = mat[1] * x + mat[5] * y + mat[9] * z + mat[13];
      mat[14] = mat[2] * x + mat[6] * y + mat[10] * z + mat[14];
      mat[15] = mat[3] * x + mat[7] * y + mat[11] * z + mat[15];
      return mat;
    }
    var a00 = mat[0], a01 = mat[1], a02 = mat[2], a03 = mat[3];
    var a10 = mat[4], a11 = mat[5], a12 = mat[6], a13 = mat[7];
    var a20 = mat[8], a21 = mat[9], a22 = mat[10], a23 = mat[11];
    dest[0] = a00;
    dest[1] = a01;
    dest[2] = a02;
    dest[3] = a03;
    dest[4] = a10;
    dest[5] = a11;
    dest[6] = a12;
    dest[7] = a13;
    dest[8] = a20;
    dest[9] = a21;
    dest[10] = a22;
    dest[11] = a23;
    dest[12] = a00 * x + a10 * y + a20 * z + mat[12];
    dest[13] = a01 * x + a11 * y + a21 * z + mat[13];
    dest[14] = a02 * x + a12 * y + a22 * z + mat[14];
    dest[15] = a03 * x + a13 * y + a23 * z + mat[15];
    return dest;
  },
  /*
   * mat4.scale
   * Scales a matrix by the given vector
   *
   * Params:
   * mat - mat4 to scale
   * vec - vec3 specifying the scale for each axis
   * dest - Optional, mat4 receiving operation result. If not specified result is written to mat
   *
   * Returns:
   * dest if specified, mat otherwise
   */
  scale: function (mat, vec, dest) {
    var x = vec[0], y = vec[1], z = vec[2];
    if (!dest || mat == dest) {
      mat[0] *= x;
      mat[1] *= x;
      mat[2] *= x;
      mat[3] *= x;
      mat[4] *= y;
      mat[5] *= y;
      mat[6] *= y;
      mat[7] *= y;
      mat[8] *= z;
      mat[9] *= z;
      mat[10] *= z;
      mat[11] *= z;
      return mat;
    }
    dest[0] = mat[0] * x;
    dest[1] = mat[1] * x;
    dest[2] = mat[2] * x;
    dest[3] = mat[3] * x;
    dest[4] = mat[4] * y;
    dest[5] = mat[5] * y;
    dest[6] = mat[6] * y;
    dest[7] = mat[7] * y;
    dest[8] = mat[8] * z;
    dest[9] = mat[9] * z;
    dest[10] = mat[10] * z;
    dest[11] = mat[11] * z;
    dest[12] = mat[12];
    dest[13] = mat[13];
    dest[14] = mat[14];
    dest[15] = mat[15];
    return dest;
  },
  /*
   * mat4.rotate
   * Rotates a matrix by the given angle around the specified axis
   * If rotating around a primary axis (X,Y,Z) one of the specialized rotation functions should be used instead for performance
   *
   * Params:
   * mat - mat4 to rotate
   * angle - angle (in radians) to rotate
   * axis - vec3 representing the axis to rotate around
   * dest - Optional, mat4 receiving operation result. If not specified result is written to mat
   *
   * Returns:
   * dest if specified, mat otherwise
   */
  rotate: function (mat, angle, axis, dest) {
    var x = axis[0], y = axis[1], z = axis[2];
    var len = Math.sqrt(x * x + y * y + z * z);
    if (!len) {
      return null;
    }
    if (len != 1) {
      len = 1 / len;
      x *= len;
      y *= len;
      z *= len;
    }
    var s = Math.sin(angle);
    var c = Math.cos(angle);
    var t = 1 - c;
    // Cache the matrix values (makes for huge speed increases!)
    var a00 = mat[0], a01 = mat[1], a02 = mat[2], a03 = mat[3];
    var a10 = mat[4], a11 = mat[5], a12 = mat[6], a13 = mat[7];
    var a20 = mat[8], a21 = mat[9], a22 = mat[10], a23 = mat[11];
    // 旋转矩阵
    // Construct the elements of the rotation matrix
    var b00 = x * x * t + c, b01 = y * x * t + z * s, b02 = z * x * t - y * s;
    var b10 = x * y * t - z * s, b11 = y * y * t + c, b12 = z * y * t + x * s;
    var b20 = x * z * t + y * s, b21 = y * z * t - x * s, b22 = z * z * t + c;
    if (!dest) {
      dest = mat;
    }
    else if (mat != dest) {
      // If the source and destination differ, copy the unchanged last row
      dest[12] = mat[12];
      dest[13] = mat[13];
      dest[14] = mat[14];
      dest[15] = mat[15];
    }
    // Perform rotation-specific matrix multiplication
    dest[0] = a00 * b00 + a10 * b01 + a20 * b02;
    dest[1] = a01 * b00 + a11 * b01 + a21 * b02;
    dest[2] = a02 * b00 + a12 * b01 + a22 * b02;
    dest[3] = a03 * b00 + a13 * b01 + a23 * b02;
    dest[4] = a00 * b10 + a10 * b11 + a20 * b12;
    dest[5] = a01 * b10 + a11 * b11 + a21 * b12;
    dest[6] = a02 * b10 + a12 * b11 + a22 * b12;
    dest[7] = a03 * b10 + a13 * b11 + a23 * b12;
    dest[8] = a00 * b20 + a10 * b21 + a20 * b22;
    dest[9] = a01 * b20 + a11 * b21 + a21 * b22;
    dest[10] = a02 * b20 + a12 * b21 + a22 * b22;
    dest[11] = a03 * b20 + a13 * b21 + a23 * b22;
    return dest;
  },
  /*
   * mat4.rotateX
   * Rotates a matrix by the given angle around the X axis
   *
   * Params:
   * mat - mat4 to rotate
   * angle - angle (in radians) to rotate
   * dest - Optional, mat4 receiving operation result. If not specified result is written to mat
   *
   * Returns:
   * dest if specified, mat otherwise
   */
  rotateX: function (mat, angle, dest) {
    var s = Math.sin(angle);
    var c = Math.cos(angle);
    // Cache the matrix values (makes for huge speed increases!)
    var a10 = mat[4], a11 = mat[5], a12 = mat[6], a13 = mat[7];
    var a20 = mat[8], a21 = mat[9], a22 = mat[10], a23 = mat[11];
    if (!dest) {
      dest = mat;
    }
    else if (mat != dest) {
      // If the source and destination differ, copy the unchanged rows
      dest[0] = mat[0];
      dest[1] = mat[1];
      dest[2] = mat[2];
      dest[3] = mat[3];
      dest[12] = mat[12];
      dest[13] = mat[13];
      dest[14] = mat[14];
      dest[15] = mat[15];
    }
    // Perform axis-specific matrix multiplication
    dest[4] = a10 * c + a20 * s;
    dest[5] = a11 * c + a21 * s;
    dest[6] = a12 * c + a22 * s;
    dest[7] = a13 * c + a23 * s;
    dest[8] = a10 * -s + a20 * c;
    dest[9] = a11 * -s + a21 * c;
    dest[10] = a12 * -s + a22 * c;
    dest[11] = a13 * -s + a23 * c;
    return dest;
  },
  /*
   * mat4.rotateY
   * Rotates a matrix by the given angle around the Y axis
   *
   * Params:
   * mat - mat4 to rotate
   * angle - angle (in radians) to rotate
   * dest - Optional, mat4 receiving operation result. If not specified result is written to mat
   *
   * Returns:
   * dest if specified, mat otherwise
   */
  rotateY: function (mat, angle, dest) {
    var s = Math.sin(angle);
    var c = Math.cos(angle);
    // Cache the matrix values (makes for huge speed increases!)
    var a00 = mat[0], a01 = mat[1], a02 = mat[2], a03 = mat[3];
    var a20 = mat[8], a21 = mat[9], a22 = mat[10], a23 = mat[11];
    if (!dest) {
      dest = mat;
    }
    else if (mat != dest) {
      // If the source and destination differ, copy the unchanged rows
      dest[4] = mat[4];
      dest[5] = mat[5];
      dest[6] = mat[6];
      dest[7] = mat[7];
      dest[12] = mat[12];
      dest[13] = mat[13];
      dest[14] = mat[14];
      dest[15] = mat[15];
    }
    // Perform axis-specific matrix multiplication
    dest[0] = a00 * c + a20 * -s;
    dest[1] = a01 * c + a21 * -s;
    dest[2] = a02 * c + a22 * -s;
    dest[3] = a03 * c + a23 * -s;
    dest[8] = a00 * s + a20 * c;
    dest[9] = a01 * s + a21 * c;
    dest[10] = a02 * s + a22 * c;
    dest[11] = a03 * s + a23 * c;
    return dest;
  },
  /*
   * mat4.rotateZ
   * Rotates a matrix by the given angle around the Z axis
   *
   * Params:
   * mat - mat4 to rotate
   * angle - angle (in radians) to rotate
   * dest - Optional, mat4 receiving operation result. If not specified result is written to mat
   *
   * Returns:
   * dest if specified, mat otherwise
   */
  rotateZ: function (mat, angle, dest) {
    var s = Math.sin(angle);
    var c = Math.cos(angle);
    // Cache the matrix values (makes for huge speed increases!)
    var a00 = mat[0], a01 = mat[1], a02 = mat[2], a03 = mat[3];
    var a10 = mat[4], a11 = mat[5], a12 = mat[6], a13 = mat[7];
    if (!dest) {
      dest = mat;
    }
    else if (mat != dest) {
      // If the source and destination differ, copy the unchanged last row
      dest[8] = mat[8];
      dest[9] = mat[9];
      dest[10] = mat[10];
      dest[11] = mat[11];
      dest[12] = mat[12];
      dest[13] = mat[13];
      dest[14] = mat[14];
      dest[15] = mat[15];
    }
    // Perform axis-specific matrix multiplication
    dest[0] = a00 * c + a10 * s;
    dest[1] = a01 * c + a11 * s;
    dest[2] = a02 * c + a12 * s;
    dest[3] = a03 * c + a13 * s;
    dest[4] = a00 * -s + a10 * c;
    dest[5] = a01 * -s + a11 * c;
    dest[6] = a02 * -s + a12 * c;
    dest[7] = a03 * -s + a13 * c;
    return dest;
  },
  /*
   * mat4.frustum
   * Generates a frustum matrix with the given bounds
   *
   * Params:
   * left, right - scalar, left and right bounds of the frustum
   * bottom, top - scalar, bottom and top bounds of the frustum
   * near, far - scalar, near and far bounds of the frustum
   * dest - Optional, mat4 frustum matrix will be written into
   *
   * Returns:
   * dest if specified, a new mat4 otherwise
   */
  frustum: function (left, right, bottom, top, near, far, dest) {
    if (!dest) {
      dest = mat4.create();
    }
    var rl = right - left;
    var tb = top - bottom;
    var fn = far - near;
    dest[0] = (near * 2) / rl;
    dest[1] = 0;
    dest[2] = 0;
    dest[3] = 0;
    dest[4] = 0;
    dest[5] = (near * 2) / tb;
    dest[6] = 0;
    dest[7] = 0;
    dest[8] = (right + left) / rl;
    dest[9] = (top + bottom) / tb;
    dest[10] = -(far + near) / fn;
    dest[11] = -1;
    dest[12] = 0;
    dest[13] = 0;
    dest[14] = -(far * near * 2) / fn;
    dest[15] = 0;
    return dest;
  },
  /*
   * mat4.perspective
   * Generates a perspective projection matrix with the given bounds
   *
   * Params:
   * fovy - scalar, vertical field of view
   * aspect - scalar, aspect ratio. typically viewport width/height
   * near, far - scalar, near and far bounds of the frustum
   * dest - Optional, mat4 frustum matrix will be written into
   *
   * Returns:
   * dest if specified, a new mat4 otherwise
   */
  perspective: function (fovy, aspect, near, far, dest) {
    var top = near * Math.tan((fovy * Math.PI) / 360.0);
    var right = top * aspect;
    return mat4.frustum(-right, right, -top, top, near, far, dest);
  },
  /*
   * mat4.ortho 正交矩阵
   * Generates a orthogonal projection matrix with the given bounds
   *
   * Params:
   * left, right - scalar, left and right bounds of the frustum
   * bottom, top - scalar, bottom and top bounds of the frustum
   * near, far - scalar, near and far bounds of the frustum
   * dest - Optional, mat4 frustum matrix will be written into
   *
   * Returns:
   * dest if specified, a new mat4 otherwise
   */
  ortho: function (left, right, bottom, top, near, far, dest) {
    if (!dest) {
      dest = mat4.create();
    }
    var rl = right - left;
    var tb = top - bottom;
    var fn = far - near;
    dest[0] = 2 / rl;
    dest[1] = 0;
    dest[2] = 0;
    dest[3] = 0;
    dest[4] = 0;
    dest[5] = 2 / tb;
    dest[6] = 0;
    dest[7] = 0;
    dest[8] = 0;
    dest[9] = 0;
    dest[10] = -2 / fn;
    dest[11] = 0;
    dest[12] = -(left + right) / rl;
    dest[13] = -(top + bottom) / tb;
    dest[14] = -(far + near) / fn;
    dest[15] = 1;
    return dest;
  },
  /*
   * mat4.ortho
   * Generates a look-at matrix with the given eye position, focal point, and up axis
   *
   * Params:
   * eye - vec3, position of the viewer
   * center - vec3, point the viewer is looking at
   * up - vec3 pointing "up"
   * dest - Optional, mat4 frustum matrix will be written into
   *
   * Returns:
   * dest if specified, a new mat4 otherwise
   */
  lookAt: function (eye, center, up, dest) {
    if (!dest) {
      dest = mat4.create();
    }
    var eyex = eye[0], eyey = eye[1], eyez = eye[2], upx = up[0], upy = up[1], upz = up[2], centerx = center[0], centery = center[1], centerz = center[2];
    if (eyex == centerx && eyey == centery && eyez == centerz) {
      return mat4.identity(dest);
    }
    var z0, z1, z2, x0, x1, x2, y0, y1, y2, len;
    //vec3.direction(eye, center, z);
    z0 = eyex - center[0];
    z1 = eyey - center[1];
    z2 = eyez - center[2];
    // normalize (no check needed for 0 because of early return)
    len = 1 / Math.sqrt(z0 * z0 + z1 * z1 + z2 * z2);
    z0 *= len;
    z1 *= len;
    z2 *= len;
    //vec3.normalize(vec3.cross(up, z, x));
    x0 = upy * z2 - upz * z1;
    x1 = upz * z0 - upx * z2;
    x2 = upx * z1 - upy * z0;
    len = Math.sqrt(x0 * x0 + x1 * x1 + x2 * x2);
    if (!len) {
      x0 = 0;
      x1 = 0;
      x2 = 0;
    }
    else {
      len = 1 / len;
      x0 *= len;
      x1 *= len;
      x2 *= len;
    }
    //vec3.normalize(vec3.cross(z, x, y));
    y0 = z1 * x2 - z2 * x1;
    y1 = z2 * x0 - z0 * x2;
    y2 = z0 * x1 - z1 * x0;
    len = Math.sqrt(y0 * y0 + y1 * y1 + y2 * y2);
    if (!len) {
      y0 = 0;
      y1 = 0;
      y2 = 0;
    }
    else {
      len = 1 / len;
      y0 *= len;
      y1 *= len;
      y2 *= len;
    }
    dest[0] = x0;
    dest[1] = y0;
    dest[2] = z0;
    dest[3] = 0;
    dest[4] = x1;
    dest[5] = y1;
    dest[6] = z1;
    dest[7] = 0;
    dest[8] = x2;
    dest[9] = y2;
    dest[10] = z2;
    dest[11] = 0;
    dest[12] = -(x0 * eyex + x1 * eyey + x2 * eyez);
    dest[13] = -(y0 * eyex + y1 * eyey + y2 * eyez);
    dest[14] = -(z0 * eyex + z1 * eyey + z2 * eyez);
    dest[15] = 1;
    return dest;
  },
  /*
   * mat4.str
   * Returns a string representation of a mat4
   *
   * Params:
   * mat - mat4 to represent as a string
   *
   * Returns:
   * string representation of mat
   */
  str: function (mat) {
    return ('[' +
      mat[0] +
      ', ' +
      mat[1] +
      ', ' +
      mat[2] +
      ', ' +
      mat[3] +
      ', ' +
      mat[4] +
      ', ' +
      mat[5] +
      ', ' +
      mat[6] +
      ', ' +
      mat[7] +
      ', ' +
      mat[8] +
      ', ' +
      mat[9] +
      ', ' +
      mat[10] +
      ', ' +
      mat[11] +
      ', ' +
      mat[12] +
      ', ' +
      mat[13] +
      ', ' +
      mat[14] +
      ', ' +
      mat[15] +
      ']');
  },
};
/*
 * quat4 - Quaternions 四元数
 */
const quat4 = {
  /*
   * quat4.create
   * Creates a new instance of a quat4 using the default array type
   * Any javascript array containing at least 4 numeric elements can serve as a quat4
   *
   * Params:
   * quat - Optional, quat4 containing values to initialize with
   *
   * Returns:
   * New quat4
   */
  create: function (quat) {
    var dest = new Float32Array(4);
    if (quat) {
      dest[0] = quat[0];
      dest[1] = quat[1];
      dest[2] = quat[2];
      dest[3] = quat[3];
    }
    return dest;
  },
  /*
   * quat4.set
   * Copies the values of one quat4 to another
   *
   * Params:
   * quat - quat4 containing values to copy
   * dest - quat4 receiving copied values
   *
   * Returns:
   * dest
   */
  set: function (quat, dest) {
    dest[0] = quat[0];
    dest[1] = quat[1];
    dest[2] = quat[2];
    dest[3] = quat[3];
    return dest;
  },
  /*
   * quat4.calculateW
   * Calculates the W component of a quat4 from the X, Y, and Z components.
   * Assumes that quaternion is 1 unit in length.
   * Any existing W component will be ignored.
   *
   * Params:
   * quat - quat4 to calculate W component of
   * dest - Optional, quat4 receiving calculated values. If not specified result is written to quat
   *
   * Returns:
   * dest if specified, quat otherwise
   */
  calculateW: function (quat, dest) {
    var x = quat[0], y = quat[1], z = quat[2];
    if (!dest || quat == dest) {
      quat[3] = -Math.sqrt(Math.abs(1.0 - x * x - y * y - z * z));
      return quat;
    }
    dest[0] = x;
    dest[1] = y;
    dest[2] = z;
    dest[3] = -Math.sqrt(Math.abs(1.0 - x * x - y * y - z * z));
    return dest;
  },
  /*
   * quat4.inverse
   * Calculates the inverse of a quat4
   *
   * Params:
   * quat - quat4 to calculate inverse of
   * dest - Optional, quat4 receiving inverse values. If not specified result is written to quat
   *
   * Returns:
   * dest if specified, quat otherwise
   */
  inverse: function (quat, dest) {
    if (!dest || quat == dest) {
      quat[0] *= -1;
      quat[1] *= -1;
      quat[2] *= -1;
      return quat;
    }
    dest[0] = -quat[0];
    dest[1] = -quat[1];
    dest[2] = -quat[2];
    dest[3] = quat[3];
    return dest;
  },
  /*
   * quat4.length
   * Calculates the length of a quat4
   *
   * Params:
   * quat - quat4 to calculate length of
   *
   * Returns:
   * Length of quat
   */
  length: function (quat) {
    var x = quat[0], y = quat[1], z = quat[2], w = quat[3];
    return Math.sqrt(x * x + y * y + z * z + w * w);
  },
  /*
   * quat4.normalize
   * Generates a unit quaternion of the same direction as the provided quat4
   * If quaternion length is 0, returns [0, 0, 0, 0]
   *
   * Params:
   * quat - quat4 to normalize
   * dest - Optional, quat4 receiving operation result. If not specified result is written to quat
   *
   * Returns:
   * dest if specified, quat otherwise
   */
  normalize: function (quat, dest) {
    if (!dest) {
      dest = quat;
    }
    var x = quat[0], y = quat[1], z = quat[2], w = quat[3];
    var len = Math.sqrt(x * x + y * y + z * z + w * w);
    if (len == 0) {
      dest[0] = 0;
      dest[1] = 0;
      dest[2] = 0;
      dest[3] = 0;
      return dest;
    }
    len = 1 / len;
    dest[0] = x * len;
    dest[1] = y * len;
    dest[2] = z * len;
    dest[3] = w * len;
    return dest;
  },
  /*
   * quat4.multiply
   * Performs a quaternion multiplication
   *
   * Params:
   * quat - quat4, first operand
   * quat2 - quat4, second operand
   * dest - Optional, quat4 receiving operation result. If not specified result is written to quat
   *
   * Returns:
   * dest if specified, quat otherwise
   */
  multiply: function (quat, quat2, dest) {
    if (!dest) {
      dest = quat;
    }
    var qax = quat[0], qay = quat[1], qaz = quat[2], qaw = quat[3];
    var qbx = quat2[0], qby = quat2[1], qbz = quat2[2], qbw = quat2[3];
    dest[0] = qax * qbw + qaw * qbx + qay * qbz - qaz * qby;
    dest[1] = qay * qbw + qaw * qby + qaz * qbx - qax * qbz;
    dest[2] = qaz * qbw + qaw * qbz + qax * qby - qay * qbx;
    dest[3] = qaw * qbw - qax * qbx - qay * qby - qaz * qbz;
    return dest;
  },
  /*
   * quat4.multiplyVec3
   * Transforms a vec3 with the given quaternion
   *
   * Params:
   * quat - quat4 to transform the vector with
   * vec - vec3 to transform
   * dest - Optional, vec3 receiving operation result. If not specified result is written to vec
   *
   * Returns:
   * dest if specified, vec otherwise
   */
  multiplyVec3: function (quat, vec, dest) {
    if (!dest) {
      dest = vec;
    }
    var x = vec[0], y = vec[1], z = vec[2];
    var qx = quat[0], qy = quat[1], qz = quat[2], qw = quat[3];
    // calculate quat * vec
    var ix = qw * x + qy * z - qz * y;
    var iy = qw * y + qz * x - qx * z;
    var iz = qw * z + qx * y - qy * x;
    var iw = -qx * x - qy * y - qz * z;
    // calculate result * inverse quat
    dest[0] = ix * qw + iw * -qx + iy * -qz - iz * -qy;
    dest[1] = iy * qw + iw * -qy + iz * -qx - ix * -qz;
    dest[2] = iz * qw + iw * -qz + ix * -qy - iy * -qx;
    return dest;
  },
  /*
   * quat4.toMat3
   * Calculates a 3x3 matrix from the given quat4
   *
   * Params:
   * quat - quat4 to create matrix from
   * dest - Optional, mat3 receiving operation result
   *
   * Returns:
   * dest if specified, a new mat3 otherwise
   */
  toMat3: function (quat, dest) {
    if (!dest) {
      dest = mat3.create();
    }
    var x = quat[0], y = quat[1], z = quat[2], w = quat[3];
    var x2 = x + x;
    var y2 = y + y;
    var z2 = z + z;
    var xx = x * x2;
    var xy = x * y2;
    var xz = x * z2;
    var yy = y * y2;
    var yz = y * z2;
    var zz = z * z2;
    var wx = w * x2;
    var wy = w * y2;
    var wz = w * z2;
    dest[0] = 1 - (yy + zz);
    dest[1] = xy - wz;
    dest[2] = xz + wy;
    dest[3] = xy + wz;
    dest[4] = 1 - (xx + zz);
    dest[5] = yz - wx;
    dest[6] = xz - wy;
    dest[7] = yz + wx;
    dest[8] = 1 - (xx + yy);
    return dest;
  },
  /*
   * quat4.toMat4
   * Calculates a 4x4 matrix from the given quat4
   *
   * Params:
   * quat - quat4 to create matrix from
   * dest - Optional, mat4 receiving operation result
   *
   * Returns:
   * dest if specified, a new mat4 otherwise
   */
  toMat4: function (quat, dest) {
    if (!dest) {
      dest = mat4.create();
    }
    var x = quat[0], y = quat[1], z = quat[2], w = quat[3];
    var x2 = x + x;
    var y2 = y + y;
    var z2 = z + z;
    var xx = x * x2;
    var xy = x * y2;
    var xz = x * z2;
    var yy = y * y2;
    var yz = y * z2;
    var zz = z * z2;
    var wx = w * x2;
    var wy = w * y2;
    var wz = w * z2;
    dest[0] = 1 - (yy + zz);
    dest[1] = xy - wz;
    dest[2] = xz + wy;
    dest[3] = 0;
    dest[4] = xy + wz;
    dest[5] = 1 - (xx + zz);
    dest[6] = yz - wx;
    dest[7] = 0;
    dest[8] = xz - wy;
    dest[9] = yz + wx;
    dest[10] = 1 - (xx + yy);
    dest[11] = 0;
    dest[12] = 0;
    dest[13] = 0;
    dest[14] = 0;
    dest[15] = 1;
    return dest;
  },
  /*
   * quat4.slerp
   * Performs a spherical linear interpolation between two quat4
   *
   * Params:
   * quat - quat4, first quaternion
   * quat2 - quat4, second quaternion
   * slerp - interpolation amount between the two inputs
   * dest - Optional, quat4 receiving operation result. If not specified result is written to quat
   *
   * Returns:
   * dest if specified, quat otherwise
   */
  slerp: function (quat, quat2, slerp, dest) {
    if (!dest) {
      dest = quat;
    }
    var cosHalfTheta = quat[0] * quat2[0] + quat[1] * quat2[1] + quat[2] * quat2[2] + quat[3] * quat2[3];
    if (Math.abs(cosHalfTheta) >= 1.0) {
      if (dest != quat) {
        dest[0] = quat[0];
        dest[1] = quat[1];
        dest[2] = quat[2];
        dest[3] = quat[3];
      }
      return dest;
    }
    var halfTheta = Math.acos(cosHalfTheta);
    var sinHalfTheta = Math.sqrt(1.0 - cosHalfTheta * cosHalfTheta);
    if (Math.abs(sinHalfTheta) < 0.001) {
      dest[0] = quat[0] * 0.5 + quat2[0] * 0.5;
      dest[1] = quat[1] * 0.5 + quat2[1] * 0.5;
      dest[2] = quat[2] * 0.5 + quat2[2] * 0.5;
      dest[3] = quat[3] * 0.5 + quat2[3] * 0.5;
      return dest;
    }
    var ratioA = Math.sin((1 - slerp) * halfTheta) / sinHalfTheta;
    var ratioB = Math.sin(slerp * halfTheta) / sinHalfTheta;
    dest[0] = quat[0] * ratioA + quat2[0] * ratioB;
    dest[1] = quat[1] * ratioA + quat2[1] * ratioB;
    dest[2] = quat[2] * ratioA + quat2[2] * ratioB;
    dest[3] = quat[3] * ratioA + quat2[3] * ratioB;
    return dest;
  },
  /*
   * quat4.str
   * Returns a string representation of a quaternion
   *
   * Params:
   * quat - quat4 to represent as a string
   *
   * Returns:
   * string representation of quat
   */
  str: function (quat) {
    return '[' + quat[0] + ', ' + quat[1] + ', ' + quat[2] + ', ' + quat[3] + ']';
  },
};
const vec4 = {
  /*
   * vec4.create
   * Creates a new instance of a vec3 using the default array type
   * Any javascript array containing at least 3 numeric elements can serve as a vec3
   *
   * Params:
   * vec - Optional, vec3 or 4 containing values to initialize with
   * w - Optional w component used to initialize the vec4, required when a vec3 is provided
   *
   * Returns  :
   * New vec4
   */
  create: function (vec, w) {
    var dest = new Float32Array(4);
    if (vec) {
      dest[0] = vec[0];
      dest[1] = vec[1];
      dest[2] = vec[2];
      if (vec.length > 3) {
        dest[3] = vec[3];
      }
      else {
        dest[3] = w;
      }
    }
    return dest;
  },
  /*
   * vec4.scale
   * Multiplies the components of a vec4 by a scalar value
   *
   * Params:
   * vec - vec4 to scale
   * val - Numeric value to scale by
   * dest - Optional, vec4 receiving operation result. If not specified result is written to vec
   *
   * Returns:
   * dest if specified, vec otherwise
   */
  scale: function (vec, val, dest) {
    if (!dest || vec == dest) {
      vec[0] *= val;
      vec[1] *= val;
      vec[2] *= val;
      vec[3] *= val;
      return vec;
    }
    dest[0] = vec[0] * val;
    dest[1] = vec[1] * val;
    dest[2] = vec[2] * val;
    dest[3] = vec[3] * val;
    return dest;
  },
};

class Node$1 {
  constructor(childrenP = []) {
    this.children = [];
    this.children = childrenP;
  }
  visit(scene) {
    this.enter(scene);
    for (let i = 0; i < this.children.length; i++) {
      this.children[i].visit(scene);
    }
    this.exit(scene);
  }
  // overwrite
  exit(_scene) {
    // console.log(scene);
  }
  append(child) {
    this.children.push(child);
  }
  // overwrite
  enter(_scene) {
    // console.log(scene);
  }
}
class Graph {
  constructor() {
    this.uniforms = {};
    this.shaders = [];
    this.viewportWidth = 640;
    this.viewportHeight = 480;
    this.textureUnit = 0;
    this.gl = getGL();
    this.root = new Node$1();
  }
  draw() {
    this.gl.viewport(0, 0, this.viewportWidth, this.viewportHeight);
    this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);
    this.root.visit(this);
  }
  pushUniforms() {
    this.uniforms = Object.create(this.uniforms);
  }
  popUniforms() {
    this.uniforms = Object.getPrototypeOf(this.uniforms);
  }
  pushTextura() {
    return this.textureUnit++;
  }
  popTextura() {
    this.textureUnit--;
  }
  pushShader(shader) {
    this.shaders.push(shader);
  }
  popShader() {
    this.shaders.pop();
  }
  getShader() {
    return this.shaders[this.shaders.length - 1];
  }
}
// 渲染场景到FrameBufferObject上
class RenderTarget extends Node$1 {
  constructor(fbo, children) {
    super();
    this.children = [];
    this.fbo = fbo;
    this.children = children;
  }
  enter(scene) {
    this.fbo.bind();
    scene.gl.clear(scene.gl.COLOR_BUFFER_BIT | scene.gl.DEPTH_BUFFER_BIT);
  }
  exit(scene) {
    this.fbo.unbind();
    scene.gl.viewport(0, 0, scene.viewportWidth, scene.viewportHeight);
  }
}
class Material extends Node$1 {
  constructor(shader, uniforms, children) {
    super();
    this.children = [];
    this.shader = shader;
    this.uniforms = uniforms;
    this.children = children;
  }
  enter(scene) {
    scene.pushShader(this.shader);
    this.shader.use();
    Uniforms.prototype.enter.call(this, scene);
  }
  exit(scene) {
    scene.popShader();
    Uniforms.prototype.exit.call(this, scene);
  }
}
class Camera extends Node$1 {
  constructor(children) {
    super();
    this.children = [];
    this.pitch = 0.0;
    this.yaw = 0.0;
    this.near = 0.5;
    this.far = 5000;
    this.fov = 50;
    this.children = children;
    this.gl = getGL();
    this.position = vec3.create([0, 0, 0]);
  }
  enter(scene) {
    scene.pushUniforms();
    const project = this.getProjection(scene);
    const wordView = this.getWorldView();
    // modeView Project ;
    // not most valuable player
    const mvp = mat4.create();
    mat4.multiply(project, wordView, mvp);
    scene.uniforms.projection = Mat4(mvp);
    scene.uniforms.eye = Vec3(this.position);
  }
  exit(scene) {
    scene.popUniforms();
  }
  project(point, scene) {
    const mvp = mat4.create();
    mat4.multiply(this.getProjection(scene), this.getWorldView(), mvp);
    const projected = mat4.multiplyVec4(mvp, point, vec4.create());
    vec4.scale(projected, 1 / projected[3]);
    return projected;
  }
  getInverseRotation() {
    return mat3.toMat4(mat4.toInverseMat3(this.getWorldView()));
  }
  // project
  getProjection(scene) {
    return mat4.perspective(this.fov, scene.viewportWidth / scene.viewportHeight, this.near, this.far);
  }
  // ModelView
  getWorldView() {
    // 先平移到标架原点， 然后再旋转
    const matrix = mat4.identity(mat4.create());
    mat4.rotateX(matrix, this.pitch);
    mat4.rotateY(matrix, this.yaw);
    mat4.translate(matrix, vec3.negate(this.position, vec3.create()));
    return matrix;
  }
}
class SimpleMesh extends Node$1 {
  constructor() {
    super();
  }
  visit(scene) {
    const shader = scene.getShader();
    shader.uniforms(scene.uniforms);
    const attributes = shader.attributes;
    for (const name of Object.keys(attributes)) {
      const bufferObject = attributes[name];
      bufferObject.bind();
      if (bufferObject instanceof VertexBufferObject) {
        bufferObject.drawTriangles();
      }
    }
    for (const name of Object.keys(attributes)) {
      const bufferObject = attributes[name];
      bufferObject.unbind();
    }
  }
}
class Transform extends Node$1 {
  constructor(children) {
    super();
    this.children = [];
    this.wordMatrix = mat4.create();
    this.aux = mat4.create();
    this.children = children;
    mat4.identity(this.wordMatrix);
  }
  enter(scene) {
    scene.pushUniforms();
    if (scene.uniforms.modelTransform) {
      mat4.multiply(scene.uniforms.modelTransform.value, this.wordMatrix, this.aux);
      scene.uniforms.modelTransform = Mat4(this.aux);
    }
    else {
      scene.uniforms.modelTransform = Mat4(this.wordMatrix);
    }
  }
  exit(scene) {
    scene.popUniforms();
  }
}
class Mirror extends Transform {
  constructor(children) {
    super(children);
  }
  enter(scene) {
    scene.gl.cullFace(scene.gl.FRONT);
    super.enter.call(this, scene);
  }
  exit(scene) {
    scene.gl.cullFace(scene.gl.BACK);
    super.exit.call(this, scene);
  }
}
class CameraFixUniform extends Transform {
  constructor(children) {
    super(children);
    this.wordMatrix = mat4.create();
    this.children = children;
  }
  enter(scene) {
    scene.pushUniforms();
    // 相机标架
    const cameraModelView = mat4.inverse(this.camera.getWorldView());
    const aux = mat4.create();
    mat4.multiply(cameraModelView, this.wordMatrix, aux);
    scene.uniforms.modelTransform = Mat4(aux);
  }
  exit(scene) {
    scene.popUniforms();
  }
}
class Uniforms extends Node$1 {
  constructor(uniforms, children) {
    super();
    this.uniforms = uniforms;
    this.children = children;
  }
  enter(scene) {
    scene.pushUniforms();
    for (let uniform in this.uniforms) {
      const value = this.uniforms[uniform];
      if (value instanceof Texture2D || value instanceof FrameBufferObject) {
        value.bindTexture(scene.pushTextura());
      }
      // 把this.uniform 绑定到Scene的uniform属性上去
      scene.uniforms[uniform] = value;
    }
  }
  exit(scene) {
    for (let uniform in this.uniforms) {
      const value = this.uniforms[uniform];
      if (value instanceof Texture2D || value instanceof FrameBufferObject) {
        value.unbindTexture();
        scene.popTextura();
      }
    }
    scene.popUniforms();
  }
}
class PostProcess extends Node$1 {
  constructor(shader, uniforms) {
    super();
    shader.setAttribBufferData('position', new Float32Array([-1, 1, 0, -1, -1, 0, 1, -1, 0, -1, 1, 0, 1, -1, 0, 1, 1, 0]));
    const mesh = new SimpleMesh();
    const material = new Material(shader, uniforms, [mesh]);
    this.children = [material];
  }
}
class Skybox extends Node$1 {
  constructor(shader, uniforms) {
    super();
    shader.setAttribBufferData('position', new Float32Array([
      // back
      1, 1, 1, 1, -1, 1, -1, -1, 1, 1, 1, 1, -1, -1, 1, -1, 1, 1,
      // front
      -1, 1, -1, -1, -1, -1, 1, 1, -1, 1, 1, -1, -1, -1, -1, 1, -1, -1,
      // left
      -1, 1, 1, -1, -1, -1, -1, 1, -1, -1, 1, 1, -1, -1, 1, -1, -1, -1,
      // right
      1, 1, 1, 1, 1, -1, 1, -1, -1, 1, 1, 1, 1, -1, -1, 1, -1, 1,
      // top
      1, 1, 1, -1, 1, 1, -1, 1, -1, 1, 1, -1, 1, 1, 1, -1, 1, -1,
      // bottom
      -1, -1, -1, -1, -1, 1, 1, -1, 1, -1, -1, -1, 1, -1, 1, 1, -1, -1,
    ]));
    const mesh = new SimpleMesh();
    const material = new Material(shader, uniforms, [mesh]);
    this.children = [material];
  }
}

const createClock = () => {
  let isRunning = false;
  let nowT;
  let timeId = null;
  let webXRSession;
  let onTick = undefined;
  let XRWebGLLayer = window.XRWebGLLayer;
  const start = async (gl) => {
    if (isRunning)
      return;
    isRunning = true;
    nowT = new Date().getTime();
    let loopFunc;
    let navigator = window.navigator;
    const f = () => {
      if (isRunning) {
        tick();
        loopFunc(f);
      }
    };
    // webXR支持
    if (navigator.xr && (await navigator.xr.isSessionSupported('inline'))) {
      // await (gl as any).makeXRCompatible();
      navigator.xr.requestSession('inline').then(async (xr) => {
        webXRSession = xr;
        webXRSession.updateRenderState({
          baseLayer: new XRWebGLLayer(webXRSession, gl),
        });
        loopFunc = webXRSession.requestAnimationFrame.bind(webXRSession);
        loopFunc(f);
      });
      return;
    }
    // 定时器
    const intervalRequest = func => {
      timeId = setTimeout(func, 16);
    };
    loopFunc = window.requestAnimationFrame || intervalRequest;
    loopFunc(f);
  };
  const stop = () => {
    isRunning = false;
    if (timeId) {
      clearInterval(timeId);
      timeId = null;
    }
    if (webXRSession) {
      webXRSession.end();
      webXRSession = undefined;
    }
  };
  const tick = () => {
    const t = nowT;
    nowT = new Date().getTime();
    const gl = getGL();
    console.log(1);
    gl.bindFramebuffer(gl.FRAMEBUFFER, XRWebGLLayer.framebuffer);
    onTick && onTick((nowT - t) / 1000);
  };
  const setOnTick = _onTick => {
    onTick = _onTick;
  };
  return {
    start,
    stop,
    setOnTick,
  };
};

/**
 * 创建一个Shader
 * @param gl
 * @param shaderType
 * @param source
 * @returns
 */
const makeShader = (gl, shaderType, source) => {
  const shader = gl.createShader(shaderType);
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    console.warn(gl.getShaderInfoLog(shader), shaderType, source);
    throw 'Compiler exception: "' + gl.getShaderInfoLog(shader) + '"';
  }
  return shader;
};
/**
 * 创建一个WebGLProgram
 * @param gl
 * @param vertexSource
 * @param fragmentSource
 * @returns
 */
const makeProgram = (gl, vertexSource, fragmentSource) => {
  const vertexShader = makeShader(gl, gl.VERTEX_SHADER, vertexSource);
  const fragmentShader = makeShader(gl, gl.FRAGMENT_SHADER, fragmentSource);
  const program = gl.createProgram();
  gl.attachShader(program, vertexShader);
  gl.attachShader(program, fragmentShader);
  gl.linkProgram(program);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    throw 'Linker exception: ' + gl.getProgramInfoLog(program);
  }
  return program;
};
/**
 * 创建一个shader
 * @param gl
 * @param vertexSource
 * @param fragmentSource
 * @returns
 */
class Shader {
  constructor(vertexSource, fragmentSource) {
    this.attributes = {};
    this.uniformLocations = {};
    this.gl = getGL();
    this.program = makeProgram(this.gl, vertexSource, fragmentSource);
  }
  use() {
    this.gl.useProgram(this.program);
  }
  uniforms(values) {
    for (let name in values) {
      const value = values[name];
      let location;
      if (this.uniformLocations[name] !== undefined) {
        location = this.uniformLocations[name];
      }
      else {
        location = this.gl.getUniformLocation(this.program, name);
        this.uniformLocations[name] = location;
      }
      // 着色器中没有用到这个变量
      if (location === null) {
        continue;
      }
      if (typeof value === 'number') {
        this.gl.uniform1f(location, value);
      }
      else {
        value.uniform(location);
      }
    }
  }
  /**
   * 初始化设置attribute 数据时使用
   */
  setAttribBufferData(name, vertexData) {
    this.use();
    const bufferObject = name == 'position' ? new VertexBufferObject() : new BufferObject();
    this.attributes[name] = bufferObject;
    const location = this.getAttribLocation(name);
    bufferObject.initBufferData(location, vertexData);
  }
  getAttribLocation(name) {
    const location = this.gl.getAttribLocation(this.program, name);
    if (location < 0)
      throw 'attribute not found';
    return location;
  }
}
class ShaderManager {
  constructor(resources) {
    this.shaders = {};
    this.prefix = 'shaders/';
    this.importExpression = /\/\/\/\s*import "([^"]+)"/g;
    this.gl = getGL();
    this.resources = resources;
  }
  get(vertex, frag) {
    if (!frag) {
      frag = vertex + '.frag';
      vertex = vertex + '.vertex';
    }
    const key = `${vertex}-${frag}`;
    if (!(key in this.resources)) {
      this.shaders[key] = new Shader(this.getSource(vertex), this.getSource(frag));
    }
    return this.shaders[key];
  }
  getSource(shaderPath) {
    const name = this._getSourceName(shaderPath);
    const path = this.prefix + name;
    const shaderSourceStr = this.resources[path];
    if (shaderSourceStr == undefined) {
      throw new Error(`cant found ${shaderPath} Source`);
    }
    return shaderSourceStr.replace(this.importExpression, (_, name) => {
      return this.getSource(name);
    });
  }
  _getSourceName(name) {
    const nameArr = name.split('/');
    return nameArr[nameArr.length - 1];
  }
}

class Loader {
  constructor(rootPath) {
    this.resources = {};
    this.pendingStatus = {
      total: 0,
      pending: 0,
      failed: 0,
    };
    this.loadImage = (src) => {
      const imageEl = document.createElement('img');
      imageEl.src = this.rootPath + src;
      imageEl.onload = () => {
        this.success(src, imageEl);
      };
      imageEl.onerror = () => {
        this.error(src, imageEl);
      };
    };
    this.loadJSON = (src) => {
      fetch(this.rootPath + src)
        .then(async (res) => {
        return res.json();
      })
        .then(json => this.success(src, json))
        .catch(e => {
        this.error(src, e);
      });
    };
    this.loadData = (src) => {
      fetch(this.rootPath + src)
        .then(async (res) => {
        return res.text();
      })
        .then(text => {
        this.success(src, text);
      })
        .catch(e => {
        this.error(src, e);
      });
    };
    this.success = (src, data) => {
      this.resources[src] = data;
      this.pendingStatus.pending--;
      this.pendingStatus.pending === 0 && this.onRendy && this.onRendy();
    };
    this.error = (src, err) => {
      this.pendingStatus.pending--;
      this.pendingStatus.failed++;
      this.resources[src] = null;
      if (typeof err !== 'string') {
        err.path = src;
      }
      throw err;
    };
    this.rootPath = rootPath;
  }
  load(resources) {
    for (let i = 0; i < resources.length; i++) {
      const path = resources[i];
      if (path in resources) {
        continue;
      }
      this.pendingStatus.pending++;
      this.pendingStatus.total++;
      if (/\.(jpe?g|gif|png)$/.test(path)) {
        this.loadImage(path);
        continue;
      }
      if (/\.json$/.test(path)) {
        this.loadJSON(path);
        continue;
      }
      this.loadData(path);
    }
    setTimeout(() => {
      this.pendingStatus.pending === 0 && this.onRendy && this.onRendy();
    }, 1);
  }
  setOnRendy(onRendy) {
    this.onRendy = onRendy;
  }
}

// 采样
const gird = (size) => {
  const buffer = new Float32Array(size * size * 6 * 3);
  let i = 0;
  for (var y = 0; y < size; y++) {
    for (var x = 0; x < size; x++) {
      buffer[i++] = x / size;
      buffer[i++] = 0;
      buffer[i++] = y / size;
      buffer[i++] = x / size;
      buffer[i++] = 0;
      buffer[i++] = (y + 1) / size;
      buffer[i++] = (x + 1) / size;
      buffer[i++] = 0;
      buffer[i++] = (y + 1) / size;
      buffer[i++] = x / size;
      buffer[i++] = 0;
      buffer[i++] = y / size;
      buffer[i++] = (x + 1) / size;
      buffer[i++] = 0;
      buffer[i++] = (y + 1) / size;
      buffer[i++] = (x + 1) / size;
      buffer[i++] = 0;
      buffer[i++] = y / size;
    }
  }
  return buffer;
};
// 解析Obj格式
const parseObj = (text) => {
  // because indices are base 1 let's just fill in the 0th data
  const objPositions = [[0, 0, 0]];
  const objTexcoords = [[0, 0]];
  const objNormals = [[0, 0, 0]];
  // same order as `f` indices
  const objVertexData = [objPositions, objTexcoords, objNormals];
  // same order as `f` indices
  let webglVertexData = [
    [],
    [],
    [], // normals
  ];
  function addVertex(vert) {
    const ptn = vert.split('/');
    ptn.forEach((objIndexStr, i) => {
      if (!objIndexStr) {
        return;
      }
      const objIndex = parseInt(objIndexStr);
      const index = objIndex + (objIndex >= 0 ? 0 : objVertexData[i].length);
      webglVertexData[i].push(...objVertexData[i][index]);
    });
  }
  const keywords = {
    v(parts) {
      objPositions.push(parts.map(parseFloat));
    },
    vn(parts) {
      objNormals.push(parts.map(parseFloat));
    },
    vt(parts) {
      // should check for missing v and extra w?
      objTexcoords.push(parts.map(parseFloat));
    },
    f(parts) {
      const numTriangles = parts.length - 2;
      for (let tri = 0; tri < numTriangles; ++tri) {
        addVertex(parts[0]);
        addVertex(parts[tri + 1]);
        addVertex(parts[tri + 2]);
      }
    },
  };
  const keywordRE = /(\w*)(?: )*(.*)/;
  const lines = text.split('\n');
  for (let lineNo = 0; lineNo < lines.length; ++lineNo) {
    const line = lines[lineNo].trim();
    if (line === '' || line.startsWith('#')) {
      continue;
    }
    const m = keywordRE.exec(line);
    if (!m) {
      continue;
    }
    const [, keyword, unparsedArgs] = m;
    const parts = line.split(/\s+/).slice(1);
    const handler = keywords[keyword];
    if (!handler) {
      // console.warn('unhandled keyword:', keyword); // eslint-disable-line no-console
      continue;
    }
    handler(parts, unparsedArgs);
  }
  return {
    position: webglVertexData[0],
    texcoord: webglVertexData[1],
    normal: webglVertexData[2],
  };
};

class CameraController {
  constructor(input, camera) {
    this.input = input;
    this.camera = camera;
  }
  tick() {
    const { x, y } = this.input.getOffsetFromElementCenter();
    this.camera.yaw += x * 0.00008;
    this.camera.pitch += y * 0.00008;
    const inverseRotation = this.camera.getInverseRotation();
    const direction = vec3.create();
    if (this.input.keys.W) {
      direction[2] = -1;
    }
    else if (this.input.keys.S) {
      direction[2] = 1;
    }
    if (this.input.keys.A) {
      direction[0] = -1;
    }
    else if (this.input.keys.D) {
      direction[0] = 1;
    }
    vec3.scale(vec3.normalize(direction), 1.0);
    // 先获取方向, 然后在这个方向上平移
    mat4.multiplyVec3(inverseRotation, direction);
    vec3.add(this.camera.position, direction);
  }
}

const KEYNAME = {
  32: 'SPACE',
  13: 'ENTER',
  9: 'TAB',
  8: 'BACKSPACE',
  16: 'SHIFT',
  17: 'CTRL',
  18: 'ALT',
  20: 'CAPS_LOCK',
  144: 'NUM_LOCK',
  145: 'SCROLL_LOCK',
  37: 'LEFT',
  38: 'UP',
  39: 'RIGHT',
  40: 'DOWN',
  33: 'PAGE_UP',
  34: 'PAGE_DOWN',
  36: 'HOME',
  35: 'END',
  45: 'INSERT',
  46: 'DELETE',
  27: 'ESCAPE',
  19: 'PAUSE',
};
const clamp = (a, b, c) => {
  return a < b ? b : a > c ? c : a;
};
const pointerCoord = (ev) => {
  // get X coordinates for either a mouse click
  // or a touch depending on the given event
  if (ev) {
    const changedTouches = ev.changedTouches;
    if (changedTouches && changedTouches.length > 0) {
      const touch = changedTouches[0];
      return { x: touch.clientX, y: touch.clientY };
    }
    if (ev.pageX !== undefined) {
      return { x: ev.pageX, y: ev.pageY };
    }
  }
  return { x: 0, y: 0 };
};
class InputHandler {
  constructor(element) {
    this.keys = {};
    this.offset = { x: 0, y: 0 };
    this.mouse = { down: false, x: 0, y: 0 };
    this.onClick = undefined;
    this.onKeyUp = undefined;
    this.onKeyDown = undefined;
    this.width = 0;
    this.height = 0;
    this.hasFocus = true;
    this.element = undefined;
    this.focus = () => {
      if (!this.hasFocus) {
        this.hasFocus = true;
        this.reset();
      }
    };
    this.blur = () => {
      this.hasFocus = false;
      this.reset();
    };
    this.mouseMove = (pageX, pageY) => {
      if (!this.mouse.down)
        return;
      this.mouse.x = clamp(pageX - this.offset.x, 0, this.element.width);
      this.mouse.y = clamp(pageY - this.offset.y, 0, this.element.height);
    };
    this.mouseDown = (pageX, pageY) => {
      this.mouse.down = true;
      this.mouse.x = clamp(pageX - this.offset.x, 0, this.element.width);
      this.mouse.y = clamp(pageY - this.offset.y, 0, this.element.height);
    };
    this.mouseUp = () => {
      this.mouse.down = false;
      if (this.hasFocus && this.onClick) {
        this.onClick(this.mouse.x, this.mouse.y);
      }
    };
    this.keyDown = (key) => {
      const keyName = this.getKeyName(key);
      const wasKeyDown = this.keys[keyName];
      this.keys[keyName] = true;
      if (this.onKeyDown && !wasKeyDown) {
        this.onKeyDown(keyName);
      }
      return this.hasFocus;
    };
    this.keyUp = (key) => {
      var name = this.getKeyName(key);
      this.keys[name] = false;
      if (this.onKeyUp) {
        this.onKeyUp(name);
      }
      return this.hasFocus;
    };
    this.reset = () => {
      this.keys = {};
      for (let i = 65; i < 128; i++) {
        this.keys[String.fromCharCode(i)] = false;
      }
      for (let i in KEYNAME) {
        this.keys[KEYNAME[i]] = false;
      }
      this.mouse = { down: false, x: 0, y: 0 };
    };
    this.getKeyName = (key) => {
      return KEYNAME[key] || String.fromCharCode(key);
    };
    this.element = element;
    this.bind(element);
    this.reset();
  }
  bind(element) {
    if (!element)
      return;
    this.element = element;
    const elementRect = element.getBoundingClientRect();
    this.offset = { x: elementRect.left, y: elementRect.top };
    // 绑定监听事件
    document.onkeydown = e => this.keyDown(e.keyCode);
    document.onkeyup = e => this.keyUp(e.keyCode);
    window.onclick = e => {
      if (e.target === element) {
        focus();
      }
      else {
        blur();
      }
    };
    this.element.onmousedown = e => {
      const { x, y } = pointerCoord(e);
      this.mouseDown(x, y);
    };
    this.element.ontouchstart = e => {
      const { x, y } = pointerCoord(e);
      this.mouseDown(x, y);
    };
    document.ontouchmove = e => {
      const { x, y } = pointerCoord(e);
      this.mouseMove(x, y);
    };
    document.onmousemove = e => {
      const { x, y } = pointerCoord(e);
      this.mouseMove(x, y);
    };
    document.ontouchend = this.mouseUp;
    document.ontouchcancel = this.mouseUp;
    document.onmouseup = this.mouseUp;
  }
  // 获取鼠标点击点距离元素中心的距离
  getOffsetFromElementCenter() {
    if (!this.element) {
      return { x: 0, y: 0 };
    }
    if (this.mouse.down) {
      return { x: this.mouse.x - this.element.width * 0.5, y: this.mouse.y - this.element.height * 0.5 };
    }
    return { x: 0, y: 0 };
  }
}

const query = new URLSearchParams(location.search);
const scale = parseFloat(query.get('d')) || 0.5;
// 网格密度
const GRID_RESOLUTION = 512 * scale * scale, 
// 世界缩放
GRID_SIZE = 512, FAR_AWAY = 5000;
const cameraLocation = new Float32Array([0, 10, 220]);
const appGlobalScript = async () => {
  const canvasEl = document.querySelector('canvas');
  const inputHandler = new InputHandler(canvasEl);
  const clock = createClock();
  const loader = new Loader('./assets/');
  loader.load([
    'shaders/sun.glsl',
    'shaders/transform.glsl',
    'shaders/water.vert',
    'shaders/water.frag',
    'heightmap.png',
    'normalnoise.png',
    'snow.png',
    'occlusion.png',
    'shaders/terrain.vert',
    'shaders/terrain.frag',
    'shaders/screen.vert',
    'shaders/screen.frag',
    'shaders/sky.vert',
    'shaders/sky.frag',
    'shaders/plane.vert',
    'shaders/plane.frag',
    'shaders/brightpass.frag',
    'shaders/vblur.frag',
    'shaders/hblur.frag',
    'obj/seahawk.obj',
  ]);
  let cameraController;
  let sceneGraph;
  let gl;
  const globaluniform = {
    sunColor: Vec3([1.0, 1.0, 1.0]),
    sunDirection: Vec3(vec3.normalize(new Float32Array([0.0, 0.4, -1.0]))),
    skyColor: Vec3([0.1, 0.15, 0.45]),
    clip: 1000,
    time: 0.0,
  };
  const prepareScence = () => {
    gl = getGL();
    sceneGraph = new Graph();
    gl.clearColor(1.0, 1.0, 1.0, FAR_AWAY);
    const shaderManager = new ShaderManager(loader.resources);
    const heightText2D = new Texture2D(loader.resources['heightmap.png']);
    const waterText2D = new Texture2D(loader.resources['normalnoise.png']);
    const snowText2D = new Texture2D(loader.resources['snow.png']);
    const occlusionText2D = new Texture2D(loader.resources['occlusion.png']);
    const { position, normal } = parseObj(loader.resources['obj/seahawk.obj']);
    // 着色器
    const mountainShader = shaderManager.get('terrain.vert', 'terrain.frag');
    const waterShader = shaderManager.get('water.vert', 'water.frag');
    const postShader = shaderManager.get('screen.vert', 'screen.frag');
    const skyShader = shaderManager.get('sky.vert', 'sky.frag');
    const planeShader = shaderManager.get('plane.vert', 'plane.frag');
    const brightpassShader = shaderManager.get('screen.vert', 'brightpass.frag');
    const vblurShader = shaderManager.get('screen.vert', 'vblur.frag');
    const hblurShader = shaderManager.get('screen.vert', 'hblur.frag');
    // 顶点数据
    mountainShader.setAttribBufferData('position', gird(GRID_RESOLUTION));
    waterShader.setAttribBufferData('position', gird(100));
    planeShader.setAttribBufferData('position', new Float32Array(position));
    planeShader.setAttribBufferData('vNormal', new Float32Array(normal));
    // 视口固定矩阵
    const fixModelView = mat4.identity(mat4.create());
    mat4.rotateY(fixModelView, Math.PI);
    const offset = new Float32Array([0, -3, 10]);
    // 然后缩放的基础上z坐标向前移动 10（右手坐标）
    mat4.translate(fixModelView, offset);
    // 飞机先缩放 100倍
    mat4.scale(fixModelView, new Float32Array([0.01, 0.01, 0.01]));
    const mountainTransform = new Transform([new SimpleMesh()]);
    const waterTransform = new Transform([new SimpleMesh()]);
    const planeTransform = new CameraFixUniform([new SimpleMesh()]);
    const plane = new Material(planeShader, { color: Vec3([0.2, 0.2, 0.7]) }, [planeTransform]);
    const mountain = new Material(mountainShader, {
      heightmap: heightText2D,
      snowTexture: snowText2D,
      occlusionmap: occlusionText2D,
      snowColor: Vec3([0.9, 0.9, 0.9]),
      groundColor: Vec3([0.5, 0.5, 0.5]),
    }, [mountainTransform]);
    const sky = new Transform([new Skybox(skyShader, { horizonColor: Vec3([0.3, 0.6, 1.2]) })]);
    // 倒影
    const flipTransform = new Mirror([mountain, sky]);
    // 水底的山
    const mountainDepthFbo = new FrameBufferObject(1024 * scale, 512 * scale);
    // 水面的倒影
    const reflectionFBO = new FrameBufferObject(1024 * scale, 1024 * scale);
    // 将所有的东西渲染到图片上，可以用来后处理
    const combinedFBO = new FrameBufferObject(2048 * scale, 1024 * scale);
    const bloomFbo0 = new FrameBufferObject(512 * scale, 256 * scale);
    const bloomFbo1 = new FrameBufferObject(512 * scale, 256 * scale);
    const mountainDepthTarget = new RenderTarget(mountainDepthFbo, [new Uniforms({ clip: 0.0 }, [mountain])]);
    // 先把山的倒影画到帧缓存中
    const reflectionTarget = new RenderTarget(reflectionFBO, [new Uniforms({ clip: 0.0 }, [flipTransform])]);
    // 然后用山的倒影生成的纹理 画水面
    const water = new Material(waterShader, { color: Vec3([0.7, 0.7, 0.9]), waterNoise: waterText2D, reflection: reflectionFBO, refraction: mountainDepthFbo }, [waterTransform]);
    const combinedTarget = new RenderTarget(combinedFBO, [plane, mountain, water, sky]);
    // 离屏渲染
    // 原始图像
    const brightpass = new RenderTarget(bloomFbo0, [new PostProcess(brightpassShader, { texture: combinedFBO })]);
    // 水平卷积处理
    const hblurpass = new RenderTarget(bloomFbo1, [new PostProcess(hblurShader, { texture: bloomFbo0 })]);
    // 竖直卷积处理
    const vblurpass = new RenderTarget(bloomFbo0, [new PostProcess(vblurShader, { texture: bloomFbo1 })]);
    const bloom = new Node$1([brightpass, hblurpass, vblurpass]);
    // 开放场景图数据传输
    // Scene.Graph 场景
    // Scene.Camera  根据相机的位置获取MVP：ModelView Projection
    // Scene.Uniforms 传输uniform变量|纹理
    // Scene.Material 绑定着色器 && 传递Uniform变量|纹理
    // Scene.Transform 生成世界缩放平移矩阵
    // Scene.SimpleMesh 绑定好着色器，传好变量后，并且绘制顶点
    // Scene.RenderTarget 将渲染的内容 渲染到图片上
    // VertexBufferObject 顶点相关数据
    // Scene.PostProcess 将生成的纹理进行后处理操作。将渲染生成的图片当成纹理，渲染到一个正方形上。
    // can be optimized with a z only shader
    // 先画山的倒影， 然后画山 画水
    const camera = new Camera([
      new Uniforms(globaluniform, [mountainDepthTarget, reflectionTarget, combinedTarget]),
    ]);
    const postprocess = new PostProcess(postShader, { texture: combinedFBO, bloom: bloomFbo0 });
    cameraController = new CameraController(inputHandler, camera);
    sceneGraph.root.append(camera);
    sceneGraph.root.append(bloom);
    sceneGraph.root.append(postprocess);
    camera.position = cameraLocation;
    camera.far = FAR_AWAY * 2;
    // 把世界坐标 从 0-1 变成 0- MESHNUM
    // 并且 把坐标原点移到中心
    mat4.translate(mountainTransform.wordMatrix, new Float32Array([-0.5 * GRID_SIZE, -40, -0.5 * GRID_SIZE]));
    mat4.scale(mountainTransform.wordMatrix, new Float32Array([GRID_SIZE, 100, GRID_SIZE]));
    // 倒影
    mat4.scale(flipTransform.wordMatrix, new Float32Array([1.0, -1.0, 1.0]));
    mat4.translate(waterTransform.wordMatrix, new Float32Array([-0.5 * FAR_AWAY, 0, -0.5 * FAR_AWAY]));
    mat4.scale(waterTransform.wordMatrix, new Float32Array([FAR_AWAY, 1, FAR_AWAY]));
    mat4.translate(sky.wordMatrix, [0, -200, 0]);
    mat4.scale(sky.wordMatrix, new Float32Array([FAR_AWAY, FAR_AWAY, FAR_AWAY]));
    // 然后乘以 摄像机的齐次坐标
    planeTransform.camera = camera;
    planeTransform.wordMatrix = fixModelView;
    camera.far = FAR_AWAY * 2;
    setCanvasFullScreen(canvasEl, sceneGraph);
  };
  loader.setOnRendy(() => {
    prepareScence();
    clock.setOnTick(t => {
      globaluniform.time += t;
      cameraController.tick();
      sceneGraph.draw();
    });
    document.querySelector('button').onclick = () => {
      clock.start(gl);
    };
  });
};

const globalScripts = appGlobalScript;

export { BUILD as B, CSS as C, H, NAMESPACE as N, promiseResolve as a, bootstrapLazy as b, consoleDevInfo as c, doc as d, globalScripts as g, plt as p, win as w };
