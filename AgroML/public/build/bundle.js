
(function(l, r) { if (!l || l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (self.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.getElementsByTagName('head')[0].appendChild(r) })(self.document);
var app = (function (exports) {
    'use strict';

    function noop() { }
    const identity = x => x;
    function add_location(element, file, line, column, char) {
        element.__svelte_meta = {
            loc: { file, line, column, char }
        };
    }
    function run(fn) {
        return fn();
    }
    function blank_object() {
        return Object.create(null);
    }
    function run_all(fns) {
        fns.forEach(run);
    }
    function is_function(thing) {
        return typeof thing === 'function';
    }
    function safe_not_equal(a, b) {
        return a != a ? b == b : a !== b || ((a && typeof a === 'object') || typeof a === 'function');
    }
    let src_url_equal_anchor;
    function src_url_equal(element_src, url) {
        if (!src_url_equal_anchor) {
            src_url_equal_anchor = document.createElement('a');
        }
        src_url_equal_anchor.href = url;
        return element_src === src_url_equal_anchor.href;
    }
    function is_empty(obj) {
        return Object.keys(obj).length === 0;
    }
    function validate_store(store, name) {
        if (store != null && typeof store.subscribe !== 'function') {
            throw new Error(`'${name}' is not a store with a 'subscribe' method`);
        }
    }
    function subscribe(store, ...callbacks) {
        if (store == null) {
            return noop;
        }
        const unsub = store.subscribe(...callbacks);
        return unsub.unsubscribe ? () => unsub.unsubscribe() : unsub;
    }
    function component_subscribe(component, store, callback) {
        component.$$.on_destroy.push(subscribe(store, callback));
    }
    function null_to_empty(value) {
        return value == null ? '' : value;
    }
    function set_store_value(store, ret, value = ret) {
        store.set(value);
        return ret;
    }

    const is_client = typeof window !== 'undefined';
    let now = is_client
        ? () => window.performance.now()
        : () => Date.now();
    let raf = is_client ? cb => requestAnimationFrame(cb) : noop;

    const tasks = new Set();
    function run_tasks(now) {
        tasks.forEach(task => {
            if (!task.c(now)) {
                tasks.delete(task);
                task.f();
            }
        });
        if (tasks.size !== 0)
            raf(run_tasks);
    }
    /**
     * Creates a new task that runs on each raf frame
     * until it returns a falsy value or is aborted
     */
    function loop(callback) {
        let task;
        if (tasks.size === 0)
            raf(run_tasks);
        return {
            promise: new Promise(fulfill => {
                tasks.add(task = { c: callback, f: fulfill });
            }),
            abort() {
                tasks.delete(task);
            }
        };
    }
    function append(target, node) {
        target.appendChild(node);
    }
    function get_root_for_node(node) {
        if (!node)
            return document;
        return (node.getRootNode ? node.getRootNode() : node.ownerDocument); // check for getRootNode because IE is still supported
    }
    function get_root_for_styles(node) {
        const root = get_root_for_node(node);
        return root.host ? root : root;
    }
    function append_empty_stylesheet(node) {
        const style_element = element('style');
        append_stylesheet(get_root_for_styles(node), style_element);
        return style_element;
    }
    function append_stylesheet(node, style) {
        append(node.head || node, style);
    }
    function insert(target, node, anchor) {
        target.insertBefore(node, anchor || null);
    }
    function detach(node) {
        node.parentNode.removeChild(node);
    }
    function element(name) {
        return document.createElement(name);
    }
    function text(data) {
        return document.createTextNode(data);
    }
    function space() {
        return text(' ');
    }
    function empty() {
        return text('');
    }
    function listen(node, event, handler, options) {
        node.addEventListener(event, handler, options);
        return () => node.removeEventListener(event, handler, options);
    }
    function attr(node, attribute, value) {
        if (value == null)
            node.removeAttribute(attribute);
        else if (node.getAttribute(attribute) !== value)
            node.setAttribute(attribute, value);
    }
    function to_number(value) {
        return value === '' ? null : +value;
    }
    function children(element) {
        return Array.from(element.childNodes);
    }
    function set_input_value(input, value) {
        input.value = value == null ? '' : value;
    }
    function set_style(node, key, value, important) {
        node.style.setProperty(key, value, important ? 'important' : '');
    }
    function select_option(select, value) {
        for (let i = 0; i < select.options.length; i += 1) {
            const option = select.options[i];
            if (option.__value === value) {
                option.selected = true;
                return;
            }
        }
    }
    function select_value(select) {
        const selected_option = select.querySelector(':checked') || select.options[0];
        return selected_option && selected_option.__value;
    }
    function custom_event(type, detail, bubbles = false) {
        const e = document.createEvent('CustomEvent');
        e.initCustomEvent(type, bubbles, false, detail);
        return e;
    }

    const active_docs = new Set();
    let active = 0;
    // https://github.com/darkskyapp/string-hash/blob/master/index.js
    function hash(str) {
        let hash = 5381;
        let i = str.length;
        while (i--)
            hash = ((hash << 5) - hash) ^ str.charCodeAt(i);
        return hash >>> 0;
    }
    function create_rule(node, a, b, duration, delay, ease, fn, uid = 0) {
        const step = 16.666 / duration;
        let keyframes = '{\n';
        for (let p = 0; p <= 1; p += step) {
            const t = a + (b - a) * ease(p);
            keyframes += p * 100 + `%{${fn(t, 1 - t)}}\n`;
        }
        const rule = keyframes + `100% {${fn(b, 1 - b)}}\n}`;
        const name = `__svelte_${hash(rule)}_${uid}`;
        const doc = get_root_for_node(node);
        active_docs.add(doc);
        const stylesheet = doc.__svelte_stylesheet || (doc.__svelte_stylesheet = append_empty_stylesheet(node).sheet);
        const current_rules = doc.__svelte_rules || (doc.__svelte_rules = {});
        if (!current_rules[name]) {
            current_rules[name] = true;
            stylesheet.insertRule(`@keyframes ${name} ${rule}`, stylesheet.cssRules.length);
        }
        const animation = node.style.animation || '';
        node.style.animation = `${animation ? `${animation}, ` : ''}${name} ${duration}ms linear ${delay}ms 1 both`;
        active += 1;
        return name;
    }
    function delete_rule(node, name) {
        const previous = (node.style.animation || '').split(', ');
        const next = previous.filter(name
            ? anim => anim.indexOf(name) < 0 // remove specific animation
            : anim => anim.indexOf('__svelte') === -1 // remove all Svelte animations
        );
        const deleted = previous.length - next.length;
        if (deleted) {
            node.style.animation = next.join(', ');
            active -= deleted;
            if (!active)
                clear_rules();
        }
    }
    function clear_rules() {
        raf(() => {
            if (active)
                return;
            active_docs.forEach(doc => {
                const stylesheet = doc.__svelte_stylesheet;
                let i = stylesheet.cssRules.length;
                while (i--)
                    stylesheet.deleteRule(i);
                doc.__svelte_rules = {};
            });
            active_docs.clear();
        });
    }

    let current_component;
    function set_current_component(component) {
        current_component = component;
    }

    const dirty_components = [];
    const binding_callbacks = [];
    const render_callbacks = [];
    const flush_callbacks = [];
    const resolved_promise = Promise.resolve();
    let update_scheduled = false;
    function schedule_update() {
        if (!update_scheduled) {
            update_scheduled = true;
            resolved_promise.then(flush);
        }
    }
    function add_render_callback(fn) {
        render_callbacks.push(fn);
    }
    let flushing = false;
    const seen_callbacks = new Set();
    function flush() {
        if (flushing)
            return;
        flushing = true;
        do {
            // first, call beforeUpdate functions
            // and update components
            for (let i = 0; i < dirty_components.length; i += 1) {
                const component = dirty_components[i];
                set_current_component(component);
                update(component.$$);
            }
            set_current_component(null);
            dirty_components.length = 0;
            while (binding_callbacks.length)
                binding_callbacks.pop()();
            // then, once components are updated, call
            // afterUpdate functions. This may cause
            // subsequent updates...
            for (let i = 0; i < render_callbacks.length; i += 1) {
                const callback = render_callbacks[i];
                if (!seen_callbacks.has(callback)) {
                    // ...so guard against infinite loops
                    seen_callbacks.add(callback);
                    callback();
                }
            }
            render_callbacks.length = 0;
        } while (dirty_components.length);
        while (flush_callbacks.length) {
            flush_callbacks.pop()();
        }
        update_scheduled = false;
        flushing = false;
        seen_callbacks.clear();
    }
    function update($$) {
        if ($$.fragment !== null) {
            $$.update();
            run_all($$.before_update);
            const dirty = $$.dirty;
            $$.dirty = [-1];
            $$.fragment && $$.fragment.p($$.ctx, dirty);
            $$.after_update.forEach(add_render_callback);
        }
    }

    let promise;
    function wait() {
        if (!promise) {
            promise = Promise.resolve();
            promise.then(() => {
                promise = null;
            });
        }
        return promise;
    }
    function dispatch(node, direction, kind) {
        node.dispatchEvent(custom_event(`${direction ? 'intro' : 'outro'}${kind}`));
    }
    const outroing = new Set();
    let outros;
    function group_outros() {
        outros = {
            r: 0,
            c: [],
            p: outros // parent group
        };
    }
    function check_outros() {
        if (!outros.r) {
            run_all(outros.c);
        }
        outros = outros.p;
    }
    function transition_in(block, local) {
        if (block && block.i) {
            outroing.delete(block);
            block.i(local);
        }
    }
    function transition_out(block, local, detach, callback) {
        if (block && block.o) {
            if (outroing.has(block))
                return;
            outroing.add(block);
            outros.c.push(() => {
                outroing.delete(block);
                if (callback) {
                    if (detach)
                        block.d(1);
                    callback();
                }
            });
            block.o(local);
        }
    }
    const null_transition = { duration: 0 };
    function create_in_transition(node, fn, params) {
        let config = fn(node, params);
        let running = false;
        let animation_name;
        let task;
        let uid = 0;
        function cleanup() {
            if (animation_name)
                delete_rule(node, animation_name);
        }
        function go() {
            const { delay = 0, duration = 300, easing = identity, tick = noop, css } = config || null_transition;
            if (css)
                animation_name = create_rule(node, 0, 1, duration, delay, easing, css, uid++);
            tick(0, 1);
            const start_time = now() + delay;
            const end_time = start_time + duration;
            if (task)
                task.abort();
            running = true;
            add_render_callback(() => dispatch(node, true, 'start'));
            task = loop(now => {
                if (running) {
                    if (now >= end_time) {
                        tick(1, 0);
                        dispatch(node, true, 'end');
                        cleanup();
                        return running = false;
                    }
                    if (now >= start_time) {
                        const t = easing((now - start_time) / duration);
                        tick(t, 1 - t);
                    }
                }
                return running;
            });
        }
        let started = false;
        return {
            start() {
                if (started)
                    return;
                delete_rule(node);
                if (is_function(config)) {
                    config = config();
                    wait().then(go);
                }
                else {
                    go();
                }
            },
            invalidate() {
                started = false;
            },
            end() {
                if (running) {
                    cleanup();
                    running = false;
                }
            }
        };
    }
    function create_out_transition(node, fn, params) {
        let config = fn(node, params);
        let running = true;
        let animation_name;
        const group = outros;
        group.r += 1;
        function go() {
            const { delay = 0, duration = 300, easing = identity, tick = noop, css } = config || null_transition;
            if (css)
                animation_name = create_rule(node, 1, 0, duration, delay, easing, css);
            const start_time = now() + delay;
            const end_time = start_time + duration;
            add_render_callback(() => dispatch(node, false, 'start'));
            loop(now => {
                if (running) {
                    if (now >= end_time) {
                        tick(0, 1);
                        dispatch(node, false, 'end');
                        if (!--group.r) {
                            // this will result in `end()` being called,
                            // so we don't need to clean up here
                            run_all(group.c);
                        }
                        return false;
                    }
                    if (now >= start_time) {
                        const t = easing((now - start_time) / duration);
                        tick(1 - t, t);
                    }
                }
                return running;
            });
        }
        if (is_function(config)) {
            wait().then(() => {
                // @ts-ignore
                config = config();
                go();
            });
        }
        else {
            go();
        }
        return {
            end(reset) {
                if (reset && config.tick) {
                    config.tick(1, 0);
                }
                if (running) {
                    if (animation_name)
                        delete_rule(node, animation_name);
                    running = false;
                }
            }
        };
    }
    function create_bidirectional_transition(node, fn, params, intro) {
        let config = fn(node, params);
        let t = intro ? 0 : 1;
        let running_program = null;
        let pending_program = null;
        let animation_name = null;
        function clear_animation() {
            if (animation_name)
                delete_rule(node, animation_name);
        }
        function init(program, duration) {
            const d = (program.b - t);
            duration *= Math.abs(d);
            return {
                a: t,
                b: program.b,
                d,
                duration,
                start: program.start,
                end: program.start + duration,
                group: program.group
            };
        }
        function go(b) {
            const { delay = 0, duration = 300, easing = identity, tick = noop, css } = config || null_transition;
            const program = {
                start: now() + delay,
                b
            };
            if (!b) {
                // @ts-ignore todo: improve typings
                program.group = outros;
                outros.r += 1;
            }
            if (running_program || pending_program) {
                pending_program = program;
            }
            else {
                // if this is an intro, and there's a delay, we need to do
                // an initial tick and/or apply CSS animation immediately
                if (css) {
                    clear_animation();
                    animation_name = create_rule(node, t, b, duration, delay, easing, css);
                }
                if (b)
                    tick(0, 1);
                running_program = init(program, duration);
                add_render_callback(() => dispatch(node, b, 'start'));
                loop(now => {
                    if (pending_program && now > pending_program.start) {
                        running_program = init(pending_program, duration);
                        pending_program = null;
                        dispatch(node, running_program.b, 'start');
                        if (css) {
                            clear_animation();
                            animation_name = create_rule(node, t, running_program.b, running_program.duration, 0, easing, config.css);
                        }
                    }
                    if (running_program) {
                        if (now >= running_program.end) {
                            tick(t = running_program.b, 1 - t);
                            dispatch(node, running_program.b, 'end');
                            if (!pending_program) {
                                // we're done
                                if (running_program.b) {
                                    // intro — we can tidy up immediately
                                    clear_animation();
                                }
                                else {
                                    // outro — needs to be coordinated
                                    if (!--running_program.group.r)
                                        run_all(running_program.group.c);
                                }
                            }
                            running_program = null;
                        }
                        else if (now >= running_program.start) {
                            const p = now - running_program.start;
                            t = running_program.a + running_program.d * easing(p / running_program.duration);
                            tick(t, 1 - t);
                        }
                    }
                    return !!(running_program || pending_program);
                });
            }
        }
        return {
            run(b) {
                if (is_function(config)) {
                    wait().then(() => {
                        // @ts-ignore
                        config = config();
                        go(b);
                    });
                }
                else {
                    go(b);
                }
            },
            end() {
                clear_animation();
                running_program = pending_program = null;
            }
        };
    }

    const globals = (typeof window !== 'undefined'
        ? window
        : typeof globalThis !== 'undefined'
            ? globalThis
            : global);

    function bind(component, name, callback) {
        const index = component.$$.props[name];
        if (index !== undefined) {
            component.$$.bound[index] = callback;
            callback(component.$$.ctx[index]);
        }
    }
    function create_component(block) {
        block && block.c();
    }
    function mount_component(component, target, anchor, customElement) {
        const { fragment, on_mount, on_destroy, after_update } = component.$$;
        fragment && fragment.m(target, anchor);
        if (!customElement) {
            // onMount happens before the initial afterUpdate
            add_render_callback(() => {
                const new_on_destroy = on_mount.map(run).filter(is_function);
                if (on_destroy) {
                    on_destroy.push(...new_on_destroy);
                }
                else {
                    // Edge case - component was destroyed immediately,
                    // most likely as a result of a binding initialising
                    run_all(new_on_destroy);
                }
                component.$$.on_mount = [];
            });
        }
        after_update.forEach(add_render_callback);
    }
    function destroy_component(component, detaching) {
        const $$ = component.$$;
        if ($$.fragment !== null) {
            run_all($$.on_destroy);
            $$.fragment && $$.fragment.d(detaching);
            // TODO null out other refs, including component.$$ (but need to
            // preserve final state?)
            $$.on_destroy = $$.fragment = null;
            $$.ctx = [];
        }
    }
    function make_dirty(component, i) {
        if (component.$$.dirty[0] === -1) {
            dirty_components.push(component);
            schedule_update();
            component.$$.dirty.fill(0);
        }
        component.$$.dirty[(i / 31) | 0] |= (1 << (i % 31));
    }
    function init(component, options, instance, create_fragment, not_equal, props, append_styles, dirty = [-1]) {
        const parent_component = current_component;
        set_current_component(component);
        const $$ = component.$$ = {
            fragment: null,
            ctx: null,
            // state
            props,
            update: noop,
            not_equal,
            bound: blank_object(),
            // lifecycle
            on_mount: [],
            on_destroy: [],
            on_disconnect: [],
            before_update: [],
            after_update: [],
            context: new Map(parent_component ? parent_component.$$.context : options.context || []),
            // everything else
            callbacks: blank_object(),
            dirty,
            skip_bound: false,
            root: options.target || parent_component.$$.root
        };
        append_styles && append_styles($$.root);
        let ready = false;
        $$.ctx = instance
            ? instance(component, options.props || {}, (i, ret, ...rest) => {
                const value = rest.length ? rest[0] : ret;
                if ($$.ctx && not_equal($$.ctx[i], $$.ctx[i] = value)) {
                    if (!$$.skip_bound && $$.bound[i])
                        $$.bound[i](value);
                    if (ready)
                        make_dirty(component, i);
                }
                return ret;
            })
            : [];
        $$.update();
        ready = true;
        run_all($$.before_update);
        // `false` as a special case of no DOM component
        $$.fragment = create_fragment ? create_fragment($$.ctx) : false;
        if (options.target) {
            if (options.hydrate) {
                const nodes = children(options.target);
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.l(nodes);
                nodes.forEach(detach);
            }
            else {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.c();
            }
            if (options.intro)
                transition_in(component.$$.fragment);
            mount_component(component, options.target, options.anchor, options.customElement);
            flush();
        }
        set_current_component(parent_component);
    }
    /**
     * Base class for Svelte components. Used when dev=false.
     */
    class SvelteComponent {
        $destroy() {
            destroy_component(this, 1);
            this.$destroy = noop;
        }
        $on(type, callback) {
            const callbacks = (this.$$.callbacks[type] || (this.$$.callbacks[type] = []));
            callbacks.push(callback);
            return () => {
                const index = callbacks.indexOf(callback);
                if (index !== -1)
                    callbacks.splice(index, 1);
            };
        }
        $set($$props) {
            if (this.$$set && !is_empty($$props)) {
                this.$$.skip_bound = true;
                this.$$set($$props);
                this.$$.skip_bound = false;
            }
        }
    }

    function dispatch_dev(type, detail) {
        document.dispatchEvent(custom_event(type, Object.assign({ version: '3.40.1' }, detail), true));
    }
    function append_dev(target, node) {
        dispatch_dev('SvelteDOMInsert', { target, node });
        append(target, node);
    }
    function insert_dev(target, node, anchor) {
        dispatch_dev('SvelteDOMInsert', { target, node, anchor });
        insert(target, node, anchor);
    }
    function detach_dev(node) {
        dispatch_dev('SvelteDOMRemove', { node });
        detach(node);
    }
    function listen_dev(node, event, handler, options, has_prevent_default, has_stop_propagation) {
        const modifiers = options === true ? ['capture'] : options ? Array.from(Object.keys(options)) : [];
        if (has_prevent_default)
            modifiers.push('preventDefault');
        if (has_stop_propagation)
            modifiers.push('stopPropagation');
        dispatch_dev('SvelteDOMAddEventListener', { node, event, handler, modifiers });
        const dispose = listen(node, event, handler, options);
        return () => {
            dispatch_dev('SvelteDOMRemoveEventListener', { node, event, handler, modifiers });
            dispose();
        };
    }
    function attr_dev(node, attribute, value) {
        attr(node, attribute, value);
        if (value == null)
            dispatch_dev('SvelteDOMRemoveAttribute', { node, attribute });
        else
            dispatch_dev('SvelteDOMSetAttribute', { node, attribute, value });
    }
    function set_data_dev(text, data) {
        data = '' + data;
        if (text.wholeText === data)
            return;
        dispatch_dev('SvelteDOMSetData', { node: text, data });
        text.data = data;
    }
    function validate_slots(name, slot, keys) {
        for (const slot_key of Object.keys(slot)) {
            if (!~keys.indexOf(slot_key)) {
                console.warn(`<${name}> received an unexpected slot "${slot_key}".`);
            }
        }
    }
    /**
     * Base class for Svelte components with some minor dev-enhancements. Used when dev=true.
     */
    class SvelteComponentDev extends SvelteComponent {
        constructor(options) {
            if (!options || (!options.target && !options.$$inline)) {
                throw new Error("'target' is a required option");
            }
            super();
        }
        $destroy() {
            super.$destroy();
            this.$destroy = () => {
                console.warn('Component was already destroyed'); // eslint-disable-line no-console
            };
        }
        $capture_state() { }
        $inject_state() { }
    }

    function cubicOut(t) {
        const f = t - 1.0;
        return f * f * f + 1.0;
    }

    function fade(node, { delay = 0, duration = 400, easing = identity } = {}) {
        const o = +getComputedStyle(node).opacity;
        return {
            delay,
            duration,
            easing,
            css: t => `opacity: ${t * o}`
        };
    }
    function fly(node, { delay = 0, duration = 400, easing = cubicOut, x = 0, y = 0, opacity = 0 } = {}) {
        const style = getComputedStyle(node);
        const target_opacity = +style.opacity;
        const transform = style.transform === 'none' ? '' : style.transform;
        const od = target_opacity * (1 - opacity);
        return {
            delay,
            duration,
            easing,
            css: (t, u) => `
			transform: ${transform} translate(${(1 - t) * x}px, ${(1 - t) * y}px);
			opacity: ${target_opacity - (od * u)}`
        };
    }
    function slide(node, { delay = 0, duration = 400, easing = cubicOut } = {}) {
        const style = getComputedStyle(node);
        const opacity = +style.opacity;
        const height = parseFloat(style.height);
        const padding_top = parseFloat(style.paddingTop);
        const padding_bottom = parseFloat(style.paddingBottom);
        const margin_top = parseFloat(style.marginTop);
        const margin_bottom = parseFloat(style.marginBottom);
        const border_top_width = parseFloat(style.borderTopWidth);
        const border_bottom_width = parseFloat(style.borderBottomWidth);
        return {
            delay,
            duration,
            easing,
            css: t => 'overflow: hidden;' +
                `opacity: ${Math.min(t * 20, 1) * opacity};` +
                `height: ${t * height}px;` +
                `padding-top: ${t * padding_top}px;` +
                `padding-bottom: ${t * padding_bottom}px;` +
                `margin-top: ${t * margin_top}px;` +
                `margin-bottom: ${t * margin_bottom}px;` +
                `border-top-width: ${t * border_top_width}px;` +
                `border-bottom-width: ${t * border_bottom_width}px;`
        };
    }
    function scale(node, { delay = 0, duration = 400, easing = cubicOut, start = 0, opacity = 0 } = {}) {
        const style = getComputedStyle(node);
        const target_opacity = +style.opacity;
        const transform = style.transform === 'none' ? '' : style.transform;
        const sd = 1 - start;
        const od = target_opacity * (1 - opacity);
        return {
            delay,
            duration,
            easing,
            css: (_t, u) => `
			transform: ${transform} scale(${1 - (sd * u)});
			opacity: ${target_opacity - (od * u)}
		`
        };
    }

    var commonjsGlobal = typeof globalThis !== 'undefined' ? globalThis : typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : {};

    function createCommonjsModule(fn) {
      var module = { exports: {} };
    	return fn(module, module.exports), module.exports;
    }

    var page = createCommonjsModule(function (module, exports) {
    (function (global, factory) {
    	module.exports = factory() ;
    }(commonjsGlobal, (function () {
    var isarray = Array.isArray || function (arr) {
      return Object.prototype.toString.call(arr) == '[object Array]';
    };

    /**
     * Expose `pathToRegexp`.
     */
    var pathToRegexp_1 = pathToRegexp;
    var parse_1 = parse;
    var compile_1 = compile;
    var tokensToFunction_1 = tokensToFunction;
    var tokensToRegExp_1 = tokensToRegExp;

    /**
     * The main path matching regexp utility.
     *
     * @type {RegExp}
     */
    var PATH_REGEXP = new RegExp([
      // Match escaped characters that would otherwise appear in future matches.
      // This allows the user to escape special characters that won't transform.
      '(\\\\.)',
      // Match Express-style parameters and un-named parameters with a prefix
      // and optional suffixes. Matches appear as:
      //
      // "/:test(\\d+)?" => ["/", "test", "\d+", undefined, "?", undefined]
      // "/route(\\d+)"  => [undefined, undefined, undefined, "\d+", undefined, undefined]
      // "/*"            => ["/", undefined, undefined, undefined, undefined, "*"]
      '([\\/.])?(?:(?:\\:(\\w+)(?:\\(((?:\\\\.|[^()])+)\\))?|\\(((?:\\\\.|[^()])+)\\))([+*?])?|(\\*))'
    ].join('|'), 'g');

    /**
     * Parse a string for the raw tokens.
     *
     * @param  {String} str
     * @return {Array}
     */
    function parse (str) {
      var tokens = [];
      var key = 0;
      var index = 0;
      var path = '';
      var res;

      while ((res = PATH_REGEXP.exec(str)) != null) {
        var m = res[0];
        var escaped = res[1];
        var offset = res.index;
        path += str.slice(index, offset);
        index = offset + m.length;

        // Ignore already escaped sequences.
        if (escaped) {
          path += escaped[1];
          continue
        }

        // Push the current path onto the tokens.
        if (path) {
          tokens.push(path);
          path = '';
        }

        var prefix = res[2];
        var name = res[3];
        var capture = res[4];
        var group = res[5];
        var suffix = res[6];
        var asterisk = res[7];

        var repeat = suffix === '+' || suffix === '*';
        var optional = suffix === '?' || suffix === '*';
        var delimiter = prefix || '/';
        var pattern = capture || group || (asterisk ? '.*' : '[^' + delimiter + ']+?');

        tokens.push({
          name: name || key++,
          prefix: prefix || '',
          delimiter: delimiter,
          optional: optional,
          repeat: repeat,
          pattern: escapeGroup(pattern)
        });
      }

      // Match any characters still remaining.
      if (index < str.length) {
        path += str.substr(index);
      }

      // If the path exists, push it onto the end.
      if (path) {
        tokens.push(path);
      }

      return tokens
    }

    /**
     * Compile a string to a template function for the path.
     *
     * @param  {String}   str
     * @return {Function}
     */
    function compile (str) {
      return tokensToFunction(parse(str))
    }

    /**
     * Expose a method for transforming tokens into the path function.
     */
    function tokensToFunction (tokens) {
      // Compile all the tokens into regexps.
      var matches = new Array(tokens.length);

      // Compile all the patterns before compilation.
      for (var i = 0; i < tokens.length; i++) {
        if (typeof tokens[i] === 'object') {
          matches[i] = new RegExp('^' + tokens[i].pattern + '$');
        }
      }

      return function (obj) {
        var path = '';
        var data = obj || {};

        for (var i = 0; i < tokens.length; i++) {
          var token = tokens[i];

          if (typeof token === 'string') {
            path += token;

            continue
          }

          var value = data[token.name];
          var segment;

          if (value == null) {
            if (token.optional) {
              continue
            } else {
              throw new TypeError('Expected "' + token.name + '" to be defined')
            }
          }

          if (isarray(value)) {
            if (!token.repeat) {
              throw new TypeError('Expected "' + token.name + '" to not repeat, but received "' + value + '"')
            }

            if (value.length === 0) {
              if (token.optional) {
                continue
              } else {
                throw new TypeError('Expected "' + token.name + '" to not be empty')
              }
            }

            for (var j = 0; j < value.length; j++) {
              segment = encodeURIComponent(value[j]);

              if (!matches[i].test(segment)) {
                throw new TypeError('Expected all "' + token.name + '" to match "' + token.pattern + '", but received "' + segment + '"')
              }

              path += (j === 0 ? token.prefix : token.delimiter) + segment;
            }

            continue
          }

          segment = encodeURIComponent(value);

          if (!matches[i].test(segment)) {
            throw new TypeError('Expected "' + token.name + '" to match "' + token.pattern + '", but received "' + segment + '"')
          }

          path += token.prefix + segment;
        }

        return path
      }
    }

    /**
     * Escape a regular expression string.
     *
     * @param  {String} str
     * @return {String}
     */
    function escapeString (str) {
      return str.replace(/([.+*?=^!:${}()[\]|\/])/g, '\\$1')
    }

    /**
     * Escape the capturing group by escaping special characters and meaning.
     *
     * @param  {String} group
     * @return {String}
     */
    function escapeGroup (group) {
      return group.replace(/([=!:$\/()])/g, '\\$1')
    }

    /**
     * Attach the keys as a property of the regexp.
     *
     * @param  {RegExp} re
     * @param  {Array}  keys
     * @return {RegExp}
     */
    function attachKeys (re, keys) {
      re.keys = keys;
      return re
    }

    /**
     * Get the flags for a regexp from the options.
     *
     * @param  {Object} options
     * @return {String}
     */
    function flags (options) {
      return options.sensitive ? '' : 'i'
    }

    /**
     * Pull out keys from a regexp.
     *
     * @param  {RegExp} path
     * @param  {Array}  keys
     * @return {RegExp}
     */
    function regexpToRegexp (path, keys) {
      // Use a negative lookahead to match only capturing groups.
      var groups = path.source.match(/\((?!\?)/g);

      if (groups) {
        for (var i = 0; i < groups.length; i++) {
          keys.push({
            name: i,
            prefix: null,
            delimiter: null,
            optional: false,
            repeat: false,
            pattern: null
          });
        }
      }

      return attachKeys(path, keys)
    }

    /**
     * Transform an array into a regexp.
     *
     * @param  {Array}  path
     * @param  {Array}  keys
     * @param  {Object} options
     * @return {RegExp}
     */
    function arrayToRegexp (path, keys, options) {
      var parts = [];

      for (var i = 0; i < path.length; i++) {
        parts.push(pathToRegexp(path[i], keys, options).source);
      }

      var regexp = new RegExp('(?:' + parts.join('|') + ')', flags(options));

      return attachKeys(regexp, keys)
    }

    /**
     * Create a path regexp from string input.
     *
     * @param  {String} path
     * @param  {Array}  keys
     * @param  {Object} options
     * @return {RegExp}
     */
    function stringToRegexp (path, keys, options) {
      var tokens = parse(path);
      var re = tokensToRegExp(tokens, options);

      // Attach keys back to the regexp.
      for (var i = 0; i < tokens.length; i++) {
        if (typeof tokens[i] !== 'string') {
          keys.push(tokens[i]);
        }
      }

      return attachKeys(re, keys)
    }

    /**
     * Expose a function for taking tokens and returning a RegExp.
     *
     * @param  {Array}  tokens
     * @param  {Array}  keys
     * @param  {Object} options
     * @return {RegExp}
     */
    function tokensToRegExp (tokens, options) {
      options = options || {};

      var strict = options.strict;
      var end = options.end !== false;
      var route = '';
      var lastToken = tokens[tokens.length - 1];
      var endsWithSlash = typeof lastToken === 'string' && /\/$/.test(lastToken);

      // Iterate over the tokens and create our regexp string.
      for (var i = 0; i < tokens.length; i++) {
        var token = tokens[i];

        if (typeof token === 'string') {
          route += escapeString(token);
        } else {
          var prefix = escapeString(token.prefix);
          var capture = token.pattern;

          if (token.repeat) {
            capture += '(?:' + prefix + capture + ')*';
          }

          if (token.optional) {
            if (prefix) {
              capture = '(?:' + prefix + '(' + capture + '))?';
            } else {
              capture = '(' + capture + ')?';
            }
          } else {
            capture = prefix + '(' + capture + ')';
          }

          route += capture;
        }
      }

      // In non-strict mode we allow a slash at the end of match. If the path to
      // match already ends with a slash, we remove it for consistency. The slash
      // is valid at the end of a path match, not in the middle. This is important
      // in non-ending mode, where "/test/" shouldn't match "/test//route".
      if (!strict) {
        route = (endsWithSlash ? route.slice(0, -2) : route) + '(?:\\/(?=$))?';
      }

      if (end) {
        route += '$';
      } else {
        // In non-ending mode, we need the capturing groups to match as much as
        // possible by using a positive lookahead to the end or next path segment.
        route += strict && endsWithSlash ? '' : '(?=\\/|$)';
      }

      return new RegExp('^' + route, flags(options))
    }

    /**
     * Normalize the given path string, returning a regular expression.
     *
     * An empty array can be passed in for the keys, which will hold the
     * placeholder key descriptions. For example, using `/user/:id`, `keys` will
     * contain `[{ name: 'id', delimiter: '/', optional: false, repeat: false }]`.
     *
     * @param  {(String|RegExp|Array)} path
     * @param  {Array}                 [keys]
     * @param  {Object}                [options]
     * @return {RegExp}
     */
    function pathToRegexp (path, keys, options) {
      keys = keys || [];

      if (!isarray(keys)) {
        options = keys;
        keys = [];
      } else if (!options) {
        options = {};
      }

      if (path instanceof RegExp) {
        return regexpToRegexp(path, keys)
      }

      if (isarray(path)) {
        return arrayToRegexp(path, keys, options)
      }

      return stringToRegexp(path, keys, options)
    }

    pathToRegexp_1.parse = parse_1;
    pathToRegexp_1.compile = compile_1;
    pathToRegexp_1.tokensToFunction = tokensToFunction_1;
    pathToRegexp_1.tokensToRegExp = tokensToRegExp_1;

    /**
       * Module dependencies.
       */

      

      /**
       * Short-cuts for global-object checks
       */

      var hasDocument = ('undefined' !== typeof document);
      var hasWindow = ('undefined' !== typeof window);
      var hasHistory = ('undefined' !== typeof history);
      var hasProcess = typeof process !== 'undefined';

      /**
       * Detect click event
       */
      var clickEvent = hasDocument && document.ontouchstart ? 'touchstart' : 'click';

      /**
       * To work properly with the URL
       * history.location generated polyfill in https://github.com/devote/HTML5-History-API
       */

      var isLocation = hasWindow && !!(window.history.location || window.location);

      /**
       * The page instance
       * @api private
       */
      function Page() {
        // public things
        this.callbacks = [];
        this.exits = [];
        this.current = '';
        this.len = 0;

        // private things
        this._decodeURLComponents = true;
        this._base = '';
        this._strict = false;
        this._running = false;
        this._hashbang = false;

        // bound functions
        this.clickHandler = this.clickHandler.bind(this);
        this._onpopstate = this._onpopstate.bind(this);
      }

      /**
       * Configure the instance of page. This can be called multiple times.
       *
       * @param {Object} options
       * @api public
       */

      Page.prototype.configure = function(options) {
        var opts = options || {};

        this._window = opts.window || (hasWindow && window);
        this._decodeURLComponents = opts.decodeURLComponents !== false;
        this._popstate = opts.popstate !== false && hasWindow;
        this._click = opts.click !== false && hasDocument;
        this._hashbang = !!opts.hashbang;

        var _window = this._window;
        if(this._popstate) {
          _window.addEventListener('popstate', this._onpopstate, false);
        } else if(hasWindow) {
          _window.removeEventListener('popstate', this._onpopstate, false);
        }

        if (this._click) {
          _window.document.addEventListener(clickEvent, this.clickHandler, false);
        } else if(hasDocument) {
          _window.document.removeEventListener(clickEvent, this.clickHandler, false);
        }

        if(this._hashbang && hasWindow && !hasHistory) {
          _window.addEventListener('hashchange', this._onpopstate, false);
        } else if(hasWindow) {
          _window.removeEventListener('hashchange', this._onpopstate, false);
        }
      };

      /**
       * Get or set basepath to `path`.
       *
       * @param {string} path
       * @api public
       */

      Page.prototype.base = function(path) {
        if (0 === arguments.length) return this._base;
        this._base = path;
      };

      /**
       * Gets the `base`, which depends on whether we are using History or
       * hashbang routing.

       * @api private
       */
      Page.prototype._getBase = function() {
        var base = this._base;
        if(!!base) return base;
        var loc = hasWindow && this._window && this._window.location;

        if(hasWindow && this._hashbang && loc && loc.protocol === 'file:') {
          base = loc.pathname;
        }

        return base;
      };

      /**
       * Get or set strict path matching to `enable`
       *
       * @param {boolean} enable
       * @api public
       */

      Page.prototype.strict = function(enable) {
        if (0 === arguments.length) return this._strict;
        this._strict = enable;
      };


      /**
       * Bind with the given `options`.
       *
       * Options:
       *
       *    - `click` bind to click events [true]
       *    - `popstate` bind to popstate [true]
       *    - `dispatch` perform initial dispatch [true]
       *
       * @param {Object} options
       * @api public
       */

      Page.prototype.start = function(options) {
        var opts = options || {};
        this.configure(opts);

        if (false === opts.dispatch) return;
        this._running = true;

        var url;
        if(isLocation) {
          var window = this._window;
          var loc = window.location;

          if(this._hashbang && ~loc.hash.indexOf('#!')) {
            url = loc.hash.substr(2) + loc.search;
          } else if (this._hashbang) {
            url = loc.search + loc.hash;
          } else {
            url = loc.pathname + loc.search + loc.hash;
          }
        }

        this.replace(url, null, true, opts.dispatch);
      };

      /**
       * Unbind click and popstate event handlers.
       *
       * @api public
       */

      Page.prototype.stop = function() {
        if (!this._running) return;
        this.current = '';
        this.len = 0;
        this._running = false;

        var window = this._window;
        this._click && window.document.removeEventListener(clickEvent, this.clickHandler, false);
        hasWindow && window.removeEventListener('popstate', this._onpopstate, false);
        hasWindow && window.removeEventListener('hashchange', this._onpopstate, false);
      };

      /**
       * Show `path` with optional `state` object.
       *
       * @param {string} path
       * @param {Object=} state
       * @param {boolean=} dispatch
       * @param {boolean=} push
       * @return {!Context}
       * @api public
       */

      Page.prototype.show = function(path, state, dispatch, push) {
        var ctx = new Context(path, state, this),
          prev = this.prevContext;
        this.prevContext = ctx;
        this.current = ctx.path;
        if (false !== dispatch) this.dispatch(ctx, prev);
        if (false !== ctx.handled && false !== push) ctx.pushState();
        return ctx;
      };

      /**
       * Goes back in the history
       * Back should always let the current route push state and then go back.
       *
       * @param {string} path - fallback path to go back if no more history exists, if undefined defaults to page.base
       * @param {Object=} state
       * @api public
       */

      Page.prototype.back = function(path, state) {
        var page = this;
        if (this.len > 0) {
          var window = this._window;
          // this may need more testing to see if all browsers
          // wait for the next tick to go back in history
          hasHistory && window.history.back();
          this.len--;
        } else if (path) {
          setTimeout(function() {
            page.show(path, state);
          });
        } else {
          setTimeout(function() {
            page.show(page._getBase(), state);
          });
        }
      };

      /**
       * Register route to redirect from one path to other
       * or just redirect to another route
       *
       * @param {string} from - if param 'to' is undefined redirects to 'from'
       * @param {string=} to
       * @api public
       */
      Page.prototype.redirect = function(from, to) {
        var inst = this;

        // Define route from a path to another
        if ('string' === typeof from && 'string' === typeof to) {
          page.call(this, from, function(e) {
            setTimeout(function() {
              inst.replace(/** @type {!string} */ (to));
            }, 0);
          });
        }

        // Wait for the push state and replace it with another
        if ('string' === typeof from && 'undefined' === typeof to) {
          setTimeout(function() {
            inst.replace(from);
          }, 0);
        }
      };

      /**
       * Replace `path` with optional `state` object.
       *
       * @param {string} path
       * @param {Object=} state
       * @param {boolean=} init
       * @param {boolean=} dispatch
       * @return {!Context}
       * @api public
       */


      Page.prototype.replace = function(path, state, init, dispatch) {
        var ctx = new Context(path, state, this),
          prev = this.prevContext;
        this.prevContext = ctx;
        this.current = ctx.path;
        ctx.init = init;
        ctx.save(); // save before dispatching, which may redirect
        if (false !== dispatch) this.dispatch(ctx, prev);
        return ctx;
      };

      /**
       * Dispatch the given `ctx`.
       *
       * @param {Context} ctx
       * @api private
       */

      Page.prototype.dispatch = function(ctx, prev) {
        var i = 0, j = 0, page = this;

        function nextExit() {
          var fn = page.exits[j++];
          if (!fn) return nextEnter();
          fn(prev, nextExit);
        }

        function nextEnter() {
          var fn = page.callbacks[i++];

          if (ctx.path !== page.current) {
            ctx.handled = false;
            return;
          }
          if (!fn) return unhandled.call(page, ctx);
          fn(ctx, nextEnter);
        }

        if (prev) {
          nextExit();
        } else {
          nextEnter();
        }
      };

      /**
       * Register an exit route on `path` with
       * callback `fn()`, which will be called
       * on the previous context when a new
       * page is visited.
       */
      Page.prototype.exit = function(path, fn) {
        if (typeof path === 'function') {
          return this.exit('*', path);
        }

        var route = new Route(path, null, this);
        for (var i = 1; i < arguments.length; ++i) {
          this.exits.push(route.middleware(arguments[i]));
        }
      };

      /**
       * Handle "click" events.
       */

      /* jshint +W054 */
      Page.prototype.clickHandler = function(e) {
        if (1 !== this._which(e)) return;

        if (e.metaKey || e.ctrlKey || e.shiftKey) return;
        if (e.defaultPrevented) return;

        // ensure link
        // use shadow dom when available if not, fall back to composedPath()
        // for browsers that only have shady
        var el = e.target;
        var eventPath = e.path || (e.composedPath ? e.composedPath() : null);

        if(eventPath) {
          for (var i = 0; i < eventPath.length; i++) {
            if (!eventPath[i].nodeName) continue;
            if (eventPath[i].nodeName.toUpperCase() !== 'A') continue;
            if (!eventPath[i].href) continue;

            el = eventPath[i];
            break;
          }
        }

        // continue ensure link
        // el.nodeName for svg links are 'a' instead of 'A'
        while (el && 'A' !== el.nodeName.toUpperCase()) el = el.parentNode;
        if (!el || 'A' !== el.nodeName.toUpperCase()) return;

        // check if link is inside an svg
        // in this case, both href and target are always inside an object
        var svg = (typeof el.href === 'object') && el.href.constructor.name === 'SVGAnimatedString';

        // Ignore if tag has
        // 1. "download" attribute
        // 2. rel="external" attribute
        if (el.hasAttribute('download') || el.getAttribute('rel') === 'external') return;

        // ensure non-hash for the same path
        var link = el.getAttribute('href');
        if(!this._hashbang && this._samePath(el) && (el.hash || '#' === link)) return;

        // Check for mailto: in the href
        if (link && link.indexOf('mailto:') > -1) return;

        // check target
        // svg target is an object and its desired value is in .baseVal property
        if (svg ? el.target.baseVal : el.target) return;

        // x-origin
        // note: svg links that are not relative don't call click events (and skip page.js)
        // consequently, all svg links tested inside page.js are relative and in the same origin
        if (!svg && !this.sameOrigin(el.href)) return;

        // rebuild path
        // There aren't .pathname and .search properties in svg links, so we use href
        // Also, svg href is an object and its desired value is in .baseVal property
        var path = svg ? el.href.baseVal : (el.pathname + el.search + (el.hash || ''));

        path = path[0] !== '/' ? '/' + path : path;

        // strip leading "/[drive letter]:" on NW.js on Windows
        if (hasProcess && path.match(/^\/[a-zA-Z]:\//)) {
          path = path.replace(/^\/[a-zA-Z]:\//, '/');
        }

        // same page
        var orig = path;
        var pageBase = this._getBase();

        if (path.indexOf(pageBase) === 0) {
          path = path.substr(pageBase.length);
        }

        if (this._hashbang) path = path.replace('#!', '');

        if (pageBase && orig === path && (!isLocation || this._window.location.protocol !== 'file:')) {
          return;
        }

        e.preventDefault();
        this.show(orig);
      };

      /**
       * Handle "populate" events.
       * @api private
       */

      Page.prototype._onpopstate = (function () {
        var loaded = false;
        if ( ! hasWindow ) {
          return function () {};
        }
        if (hasDocument && document.readyState === 'complete') {
          loaded = true;
        } else {
          window.addEventListener('load', function() {
            setTimeout(function() {
              loaded = true;
            }, 0);
          });
        }
        return function onpopstate(e) {
          if (!loaded) return;
          var page = this;
          if (e.state) {
            var path = e.state.path;
            page.replace(path, e.state);
          } else if (isLocation) {
            var loc = page._window.location;
            page.show(loc.pathname + loc.search + loc.hash, undefined, undefined, false);
          }
        };
      })();

      /**
       * Event button.
       */
      Page.prototype._which = function(e) {
        e = e || (hasWindow && this._window.event);
        return null == e.which ? e.button : e.which;
      };

      /**
       * Convert to a URL object
       * @api private
       */
      Page.prototype._toURL = function(href) {
        var window = this._window;
        if(typeof URL === 'function' && isLocation) {
          return new URL(href, window.location.toString());
        } else if (hasDocument) {
          var anc = window.document.createElement('a');
          anc.href = href;
          return anc;
        }
      };

      /**
       * Check if `href` is the same origin.
       * @param {string} href
       * @api public
       */
      Page.prototype.sameOrigin = function(href) {
        if(!href || !isLocation) return false;

        var url = this._toURL(href);
        var window = this._window;

        var loc = window.location;

        /*
           When the port is the default http port 80 for http, or 443 for
           https, internet explorer 11 returns an empty string for loc.port,
           so we need to compare loc.port with an empty string if url.port
           is the default port 80 or 443.
           Also the comparition with `port` is changed from `===` to `==` because
           `port` can be a string sometimes. This only applies to ie11.
        */
        return loc.protocol === url.protocol &&
          loc.hostname === url.hostname &&
          (loc.port === url.port || loc.port === '' && (url.port == 80 || url.port == 443)); // jshint ignore:line
      };

      /**
       * @api private
       */
      Page.prototype._samePath = function(url) {
        if(!isLocation) return false;
        var window = this._window;
        var loc = window.location;
        return url.pathname === loc.pathname &&
          url.search === loc.search;
      };

      /**
       * Remove URL encoding from the given `str`.
       * Accommodates whitespace in both x-www-form-urlencoded
       * and regular percent-encoded form.
       *
       * @param {string} val - URL component to decode
       * @api private
       */
      Page.prototype._decodeURLEncodedURIComponent = function(val) {
        if (typeof val !== 'string') { return val; }
        return this._decodeURLComponents ? decodeURIComponent(val.replace(/\+/g, ' ')) : val;
      };

      /**
       * Create a new `page` instance and function
       */
      function createPage() {
        var pageInstance = new Page();

        function pageFn(/* args */) {
          return page.apply(pageInstance, arguments);
        }

        // Copy all of the things over. In 2.0 maybe we use setPrototypeOf
        pageFn.callbacks = pageInstance.callbacks;
        pageFn.exits = pageInstance.exits;
        pageFn.base = pageInstance.base.bind(pageInstance);
        pageFn.strict = pageInstance.strict.bind(pageInstance);
        pageFn.start = pageInstance.start.bind(pageInstance);
        pageFn.stop = pageInstance.stop.bind(pageInstance);
        pageFn.show = pageInstance.show.bind(pageInstance);
        pageFn.back = pageInstance.back.bind(pageInstance);
        pageFn.redirect = pageInstance.redirect.bind(pageInstance);
        pageFn.replace = pageInstance.replace.bind(pageInstance);
        pageFn.dispatch = pageInstance.dispatch.bind(pageInstance);
        pageFn.exit = pageInstance.exit.bind(pageInstance);
        pageFn.configure = pageInstance.configure.bind(pageInstance);
        pageFn.sameOrigin = pageInstance.sameOrigin.bind(pageInstance);
        pageFn.clickHandler = pageInstance.clickHandler.bind(pageInstance);

        pageFn.create = createPage;

        Object.defineProperty(pageFn, 'len', {
          get: function(){
            return pageInstance.len;
          },
          set: function(val) {
            pageInstance.len = val;
          }
        });

        Object.defineProperty(pageFn, 'current', {
          get: function(){
            return pageInstance.current;
          },
          set: function(val) {
            pageInstance.current = val;
          }
        });

        // In 2.0 these can be named exports
        pageFn.Context = Context;
        pageFn.Route = Route;

        return pageFn;
      }

      /**
       * Register `path` with callback `fn()`,
       * or route `path`, or redirection,
       * or `page.start()`.
       *
       *   page(fn);
       *   page('*', fn);
       *   page('/user/:id', load, user);
       *   page('/user/' + user.id, { some: 'thing' });
       *   page('/user/' + user.id);
       *   page('/from', '/to')
       *   page();
       *
       * @param {string|!Function|!Object} path
       * @param {Function=} fn
       * @api public
       */

      function page(path, fn) {
        // <callback>
        if ('function' === typeof path) {
          return page.call(this, '*', path);
        }

        // route <path> to <callback ...>
        if ('function' === typeof fn) {
          var route = new Route(/** @type {string} */ (path), null, this);
          for (var i = 1; i < arguments.length; ++i) {
            this.callbacks.push(route.middleware(arguments[i]));
          }
          // show <path> with [state]
        } else if ('string' === typeof path) {
          this['string' === typeof fn ? 'redirect' : 'show'](path, fn);
          // start [options]
        } else {
          this.start(path);
        }
      }

      /**
       * Unhandled `ctx`. When it's not the initial
       * popstate then redirect. If you wish to handle
       * 404s on your own use `page('*', callback)`.
       *
       * @param {Context} ctx
       * @api private
       */
      function unhandled(ctx) {
        if (ctx.handled) return;
        var current;
        var page = this;
        var window = page._window;

        if (page._hashbang) {
          current = isLocation && this._getBase() + window.location.hash.replace('#!', '');
        } else {
          current = isLocation && window.location.pathname + window.location.search;
        }

        if (current === ctx.canonicalPath) return;
        page.stop();
        ctx.handled = false;
        isLocation && (window.location.href = ctx.canonicalPath);
      }

      /**
       * Escapes RegExp characters in the given string.
       *
       * @param {string} s
       * @api private
       */
      function escapeRegExp(s) {
        return s.replace(/([.+*?=^!:${}()[\]|/\\])/g, '\\$1');
      }

      /**
       * Initialize a new "request" `Context`
       * with the given `path` and optional initial `state`.
       *
       * @constructor
       * @param {string} path
       * @param {Object=} state
       * @api public
       */

      function Context(path, state, pageInstance) {
        var _page = this.page = pageInstance || page;
        var window = _page._window;
        var hashbang = _page._hashbang;

        var pageBase = _page._getBase();
        if ('/' === path[0] && 0 !== path.indexOf(pageBase)) path = pageBase + (hashbang ? '#!' : '') + path;
        var i = path.indexOf('?');

        this.canonicalPath = path;
        var re = new RegExp('^' + escapeRegExp(pageBase));
        this.path = path.replace(re, '') || '/';
        if (hashbang) this.path = this.path.replace('#!', '') || '/';

        this.title = (hasDocument && window.document.title);
        this.state = state || {};
        this.state.path = path;
        this.querystring = ~i ? _page._decodeURLEncodedURIComponent(path.slice(i + 1)) : '';
        this.pathname = _page._decodeURLEncodedURIComponent(~i ? path.slice(0, i) : path);
        this.params = {};

        // fragment
        this.hash = '';
        if (!hashbang) {
          if (!~this.path.indexOf('#')) return;
          var parts = this.path.split('#');
          this.path = this.pathname = parts[0];
          this.hash = _page._decodeURLEncodedURIComponent(parts[1]) || '';
          this.querystring = this.querystring.split('#')[0];
        }
      }

      /**
       * Push state.
       *
       * @api private
       */

      Context.prototype.pushState = function() {
        var page = this.page;
        var window = page._window;
        var hashbang = page._hashbang;

        page.len++;
        if (hasHistory) {
            window.history.pushState(this.state, this.title,
              hashbang && this.path !== '/' ? '#!' + this.path : this.canonicalPath);
        }
      };

      /**
       * Save the context state.
       *
       * @api public
       */

      Context.prototype.save = function() {
        var page = this.page;
        if (hasHistory) {
            page._window.history.replaceState(this.state, this.title,
              page._hashbang && this.path !== '/' ? '#!' + this.path : this.canonicalPath);
        }
      };

      /**
       * Initialize `Route` with the given HTTP `path`,
       * and an array of `callbacks` and `options`.
       *
       * Options:
       *
       *   - `sensitive`    enable case-sensitive routes
       *   - `strict`       enable strict matching for trailing slashes
       *
       * @constructor
       * @param {string} path
       * @param {Object=} options
       * @api private
       */

      function Route(path, options, page) {
        var _page = this.page = page || globalPage;
        var opts = options || {};
        opts.strict = opts.strict || _page._strict;
        this.path = (path === '*') ? '(.*)' : path;
        this.method = 'GET';
        this.regexp = pathToRegexp_1(this.path, this.keys = [], opts);
      }

      /**
       * Return route middleware with
       * the given callback `fn()`.
       *
       * @param {Function} fn
       * @return {Function}
       * @api public
       */

      Route.prototype.middleware = function(fn) {
        var self = this;
        return function(ctx, next) {
          if (self.match(ctx.path, ctx.params)) {
            ctx.routePath = self.path;
            return fn(ctx, next);
          }
          next();
        };
      };

      /**
       * Check if this route matches `path`, if so
       * populate `params`.
       *
       * @param {string} path
       * @param {Object} params
       * @return {boolean}
       * @api private
       */

      Route.prototype.match = function(path, params) {
        var keys = this.keys,
          qsIndex = path.indexOf('?'),
          pathname = ~qsIndex ? path.slice(0, qsIndex) : path,
          m = this.regexp.exec(decodeURIComponent(pathname));

        if (!m) return false;

        delete params[0];

        for (var i = 1, len = m.length; i < len; ++i) {
          var key = keys[i - 1];
          var val = this.page._decodeURLEncodedURIComponent(m[i]);
          if (val !== undefined || !(hasOwnProperty.call(params, key.name))) {
            params[key.name] = val;
          }
        }

        return true;
      };


      /**
       * Module exports.
       */

      var globalPage = createPage();
      var page_js = globalPage;
      var default_1 = globalPage;

    page_js.default = default_1;

    return page_js;

    })));
    });

    const subscriber_queue = [];
    /**
     * Create a `Writable` store that allows both updating and reading by subscription.
     * @param {*=}value initial value
     * @param {StartStopNotifier=}start start and stop notifications for subscriptions
     */
    function writable(value, start = noop) {
        let stop;
        const subscribers = new Set();
        function set(new_value) {
            if (safe_not_equal(value, new_value)) {
                value = new_value;
                if (stop) { // store is ready
                    const run_queue = !subscriber_queue.length;
                    for (const subscriber of subscribers) {
                        subscriber[1]();
                        subscriber_queue.push(subscriber, value);
                    }
                    if (run_queue) {
                        for (let i = 0; i < subscriber_queue.length; i += 2) {
                            subscriber_queue[i][0](subscriber_queue[i + 1]);
                        }
                        subscriber_queue.length = 0;
                    }
                }
            }
        }
        function update(fn) {
            set(fn(value));
        }
        function subscribe(run, invalidate = noop) {
            const subscriber = [run, invalidate];
            subscribers.add(subscriber);
            if (subscribers.size === 1) {
                stop = start(set) || noop;
            }
            run(value);
            return () => {
                subscribers.delete(subscriber);
                if (subscribers.size === 0) {
                    stop();
                    stop = null;
                }
            };
        }
        return { set, update, subscribe };
    }

    const direction = writable(0);

    /* src\Pages\Home.svelte generated by Svelte v3.40.1 */

    const { document: document_1$2, window: window_1$2 } = globals;
    const file$4 = "src\\Pages\\Home.svelte";

    // (72:4) {#if pageContent == 1 && unlocked }
    function create_if_block_1$4(ctx) {
    	let div3;
    	let br0;
    	let h3;
    	let br1;
    	let t1;
    	let a0;
    	let div0;
    	let b0;
    	let t3;
    	let p0;
    	let div0_intro;
    	let t5;
    	let a1;
    	let div1;
    	let b1;
    	let t7;
    	let p1;
    	let div1_intro;
    	let t9;
    	let a2;
    	let div2;
    	let b2;
    	let t11;
    	let p2;
    	let div2_intro;
    	let div3_intro;
    	let div3_outro;
    	let current;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			div3 = element("div");
    			br0 = element("br");
    			h3 = element("h3");
    			h3.textContent = "Our Services";
    			br1 = element("br");
    			t1 = space();
    			a0 = element("a");
    			div0 = element("div");
    			b0 = element("b");
    			b0.textContent = "Crop Prediction";
    			t3 = space();
    			p0 = element("p");
    			p0.textContent = "Recomendation about the type of crops to be cultivated which is best suited for the respective conditions";
    			t5 = space();
    			a1 = element("a");
    			div1 = element("div");
    			b1 = element("b");
    			b1.textContent = "Crop Yield";
    			t7 = space();
    			p1 = element("p");
    			p1.textContent = "Analysis based on previous datasets for maximizing crop yield";
    			t9 = space();
    			a2 = element("a");
    			div2 = element("div");
    			b2 = element("b");
    			b2.textContent = "Plant Disease";
    			t11 = space();
    			p2 = element("p");
    			p2.textContent = "Predicting the name and cause of crop disease and suggestions to cure it";
    			add_location(br0, file$4, 73, 16, 2036);
    			add_location(h3, file$4, 73, 20, 2040);
    			add_location(br1, file$4, 73, 41, 2061);
    			add_location(b0, file$4, 76, 20, 2209);
    			add_location(p0, file$4, 77, 20, 2253);
    			attr_dev(div0, "class", "Panel svelte-1x0755t");
    			add_location(div0, file$4, 75, 16, 2117);
    			attr_dev(a0, "href", "/Crop");
    			attr_dev(a0, "class", "svelte-1x0755t");
    			add_location(a0, file$4, 74, 16, 2083);
    			add_location(b1, file$4, 84, 20, 2624);
    			add_location(p1, file$4, 85, 20, 2663);
    			attr_dev(div1, "class", "Panel svelte-1x0755t");
    			add_location(div1, file$4, 83, 16, 2532);
    			attr_dev(a1, "href", "/CropYield");
    			attr_dev(a1, "class", "svelte-1x0755t");
    			add_location(a1, file$4, 82, 16, 2493);
    			add_location(b2, file$4, 92, 24, 2984);
    			add_location(p2, file$4, 93, 24, 3030);
    			attr_dev(div2, "class", "Panel svelte-1x0755t");
    			add_location(div2, file$4, 91, 20, 2889);
    			attr_dev(a2, "href", "/PlantDisease");
    			attr_dev(a2, "class", "svelte-1x0755t");
    			add_location(a2, file$4, 90, 16, 2843);
    			set_style(div3, "text-align", "left");
    			add_location(div3, file$4, 72, 8, 1858);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div3, anchor);
    			append_dev(div3, br0);
    			append_dev(div3, h3);
    			append_dev(div3, br1);
    			append_dev(div3, t1);
    			append_dev(div3, a0);
    			append_dev(a0, div0);
    			append_dev(div0, b0);
    			append_dev(div0, t3);
    			append_dev(div0, p0);
    			append_dev(div3, t5);
    			append_dev(div3, a1);
    			append_dev(a1, div1);
    			append_dev(div1, b1);
    			append_dev(div1, t7);
    			append_dev(div1, p1);
    			append_dev(div3, t9);
    			append_dev(div3, a2);
    			append_dev(a2, div2);
    			append_dev(div2, b2);
    			append_dev(div2, t11);
    			append_dev(div2, p2);
    			current = true;

    			if (!mounted) {
    				dispose = [
    					listen_dev(div3, "outrostart", /*lock*/ ctx[6], false, false, false),
    					listen_dev(div3, "outroend", /*unlock*/ ctx[7], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    		},
    		i: function intro(local) {
    			if (current) return;

    			if (!div0_intro) {
    				add_render_callback(() => {
    					div0_intro = create_in_transition(div0, slide, {
    						duration: /*slideDuration*/ ctx[3],
    						delay: 500
    					});

    					div0_intro.start();
    				});
    			}

    			if (!div1_intro) {
    				add_render_callback(() => {
    					div1_intro = create_in_transition(div1, slide, {
    						duration: /*slideDuration*/ ctx[3],
    						delay: 600
    					});

    					div1_intro.start();
    				});
    			}

    			if (!div2_intro) {
    				add_render_callback(() => {
    					div2_intro = create_in_transition(div2, slide, {
    						duration: /*slideDuration*/ ctx[3],
    						delay: 700
    					});

    					div2_intro.start();
    				});
    			}

    			add_render_callback(() => {
    				if (div3_outro) div3_outro.end(1);
    				if (!div3_intro) div3_intro = create_in_transition(div3, fade, { duration: 800, delay: 200 });
    				div3_intro.start();
    			});

    			current = true;
    		},
    		o: function outro(local) {
    			if (div3_intro) div3_intro.invalidate();
    			div3_outro = create_out_transition(div3, slide, { duration: 400, delay: 200 });
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div3);
    			if (detaching && div3_outro) div3_outro.end();
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1$4.name,
    		type: "if",
    		source: "(72:4) {#if pageContent == 1 && unlocked }",
    		ctx
    	});

    	return block;
    }

    // (103:4) {#if pageContent == 2 & unlocked}
    function create_if_block$4(ctx) {
    	let div4;
    	let br;
    	let h3;
    	let t1;
    	let div0;
    	let div0_intro;
    	let t3;
    	let div1;
    	let div1_intro;
    	let t5;
    	let div2;
    	let div2_intro;
    	let t7;
    	let div3;
    	let div3_intro;
    	let div4_intro;
    	let div4_outro;
    	let current;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			div4 = element("div");
    			br = element("br");
    			h3 = element("h3");
    			h3.textContent = "Contributors";
    			t1 = space();
    			div0 = element("div");
    			div0.textContent = "Rishi Patel";
    			t3 = space();
    			div1 = element("div");
    			div1.textContent = "Rohan Brahmbhatt";
    			t5 = space();
    			div2 = element("div");
    			div2.textContent = "Varun Khambhata";
    			t7 = space();
    			div3 = element("div");
    			div3.textContent = "Piyush Bagani";
    			add_location(br, file$4, 104, 12, 3485);
    			add_location(h3, file$4, 104, 16, 3489);
    			attr_dev(div0, "class", "List svelte-1x0755t");
    			add_location(div0, file$4, 105, 12, 3524);
    			attr_dev(div1, "class", "List svelte-1x0755t");
    			add_location(div1, file$4, 108, 12, 3656);
    			attr_dev(div2, "class", "List svelte-1x0755t");
    			add_location(div2, file$4, 111, 12, 3794);
    			attr_dev(div3, "class", "List svelte-1x0755t");
    			add_location(div3, file$4, 114, 12, 3938);
    			set_style(div4, "text-align", "left");
    			add_location(div4, file$4, 103, 8, 3312);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div4, anchor);
    			append_dev(div4, br);
    			append_dev(div4, h3);
    			append_dev(div4, t1);
    			append_dev(div4, div0);
    			append_dev(div4, t3);
    			append_dev(div4, div1);
    			append_dev(div4, t5);
    			append_dev(div4, div2);
    			append_dev(div4, t7);
    			append_dev(div4, div3);
    			current = true;

    			if (!mounted) {
    				dispose = [
    					listen_dev(div4, "outrostart", /*lock*/ ctx[6], false, false, false),
    					listen_dev(div4, "outroend", /*unlock*/ ctx[7], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    		},
    		i: function intro(local) {
    			if (current) return;

    			if (!div0_intro) {
    				add_render_callback(() => {
    					div0_intro = create_in_transition(div0, slide, {
    						duration: /*slideDuration*/ ctx[3],
    						delay: 750
    					});

    					div0_intro.start();
    				});
    			}

    			if (!div1_intro) {
    				add_render_callback(() => {
    					div1_intro = create_in_transition(div1, slide, {
    						duration: /*slideDuration*/ ctx[3],
    						delay: 750
    					});

    					div1_intro.start();
    				});
    			}

    			if (!div2_intro) {
    				add_render_callback(() => {
    					div2_intro = create_in_transition(div2, slide, {
    						duration: /*slideDuration*/ ctx[3],
    						delay: 750
    					});

    					div2_intro.start();
    				});
    			}

    			if (!div3_intro) {
    				add_render_callback(() => {
    					div3_intro = create_in_transition(div3, slide, {
    						duration: /*slideDuration*/ ctx[3],
    						delay: 750
    					});

    					div3_intro.start();
    				});
    			}

    			add_render_callback(() => {
    				if (div4_outro) div4_outro.end(1);
    				if (!div4_intro) div4_intro = create_in_transition(div4, fade, { duration: 800, delay: 700 });
    				div4_intro.start();
    			});

    			current = true;
    		},
    		o: function outro(local) {
    			if (div4_intro) div4_intro.invalidate();
    			div4_outro = create_out_transition(div4, slide, { duration: 400, delay: 20 });
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div4);
    			if (detaching && div4_outro) div4_outro.end();
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$4.name,
    		type: "if",
    		source: "(103:4) {#if pageContent == 2 & unlocked}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$4(ctx) {
    	let scrolling = false;

    	let clear_scrolling = () => {
    		scrolling = false;
    	};

    	let scrolling_timeout;
    	let t0;
    	let main;
    	let h1;
    	let h1_intro;
    	let t2;
    	let p;
    	let p_intro;
    	let t4;
    	let t5;
    	let current;
    	let mounted;
    	let dispose;
    	add_render_callback(/*onwindowscroll*/ ctx[8]);
    	let if_block0 = /*pageContent*/ ctx[0] == 1 && /*unlocked*/ ctx[2] && create_if_block_1$4(ctx);
    	let if_block1 = /*pageContent*/ ctx[0] == 2 & /*unlocked*/ ctx[2] && create_if_block$4(ctx);

    	const block = {
    		c: function create() {
    			t0 = space();
    			main = element("main");
    			h1 = element("h1");
    			h1.textContent = "AI driven Agriculture";
    			t2 = space();
    			p = element("p");
    			p.textContent = "We use state of art machine learning and deep learning technlolgies to help your yield in agriculture";
    			t4 = space();
    			if (if_block0) if_block0.c();
    			t5 = space();
    			if (if_block1) if_block1.c();
    			add_location(h1, file$4, 66, 4, 1507);
    			add_location(p, file$4, 67, 4, 1604);
    			attr_dev(main, "class", "svelte-1x0755t");
    			add_location(main, file$4, 65, 0, 1495);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t0, anchor);
    			insert_dev(target, main, anchor);
    			append_dev(main, h1);
    			append_dev(main, t2);
    			append_dev(main, p);
    			append_dev(main, t4);
    			if (if_block0) if_block0.m(main, null);
    			append_dev(main, t5);
    			if (if_block1) if_block1.m(main, null);
    			current = true;

    			if (!mounted) {
    				dispose = [
    					listen_dev(window_1$2, "scroll", () => {
    						scrolling = true;
    						clearTimeout(scrolling_timeout);
    						scrolling_timeout = setTimeout(clear_scrolling, 100);
    						/*onwindowscroll*/ ctx[8]();
    					}),
    					listen_dev(document_1$2.body, "wheel", /*handleMousemove*/ ctx[5], false, false, false),
    					listen_dev(p, "introend", /*nextContent*/ ctx[4], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*Y*/ 2 && !scrolling) {
    				scrolling = true;
    				clearTimeout(scrolling_timeout);
    				scrollTo(window_1$2.pageXOffset, /*Y*/ ctx[1]);
    				scrolling_timeout = setTimeout(clear_scrolling, 100);
    			}

    			if (/*pageContent*/ ctx[0] == 1 && /*unlocked*/ ctx[2]) {
    				if (if_block0) {
    					if_block0.p(ctx, dirty);

    					if (dirty & /*pageContent, unlocked*/ 5) {
    						transition_in(if_block0, 1);
    					}
    				} else {
    					if_block0 = create_if_block_1$4(ctx);
    					if_block0.c();
    					transition_in(if_block0, 1);
    					if_block0.m(main, t5);
    				}
    			} else if (if_block0) {
    				group_outros();

    				transition_out(if_block0, 1, 1, () => {
    					if_block0 = null;
    				});

    				check_outros();
    			}

    			if (/*pageContent*/ ctx[0] == 2 & /*unlocked*/ ctx[2]) {
    				if (if_block1) {
    					if_block1.p(ctx, dirty);

    					if (dirty & /*pageContent, unlocked*/ 5) {
    						transition_in(if_block1, 1);
    					}
    				} else {
    					if_block1 = create_if_block$4(ctx);
    					if_block1.c();
    					transition_in(if_block1, 1);
    					if_block1.m(main, null);
    				}
    			} else if (if_block1) {
    				group_outros();

    				transition_out(if_block1, 1, 1, () => {
    					if_block1 = null;
    				});

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;

    			if (!h1_intro) {
    				add_render_callback(() => {
    					h1_intro = create_in_transition(h1, scale, {
    						duration: 800,
    						delay: 1100,
    						opacity: 0.5,
    						start: 0
    					});

    					h1_intro.start();
    				});
    			}

    			if (!p_intro) {
    				add_render_callback(() => {
    					p_intro = create_in_transition(p, fade, { duration: 200, delay: 1800 });
    					p_intro.start();
    				});
    			}

    			transition_in(if_block0);
    			transition_in(if_block1);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block0);
    			transition_out(if_block1);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(main);
    			if (if_block0) if_block0.d();
    			if (if_block1) if_block1.d();
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$4.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$4($$self, $$props, $$invalidate) {
    	let $direction;
    	validate_store(direction, 'direction');
    	component_subscribe($$self, direction, $$value => $$invalidate(9, $direction = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Home', slots, []);
    	let fadeDelay = 2000;
    	let slideDuration = 600;
    	let totalPageContent = 2;
    	let pageContent = 0;
    	let Y = 0;

    	function checkDirection() {
    		if (totalPageContent == 1) {
    			set_store_value(direction, $direction = 0, $direction);
    			return;
    		}

    		if (pageContent < totalPageContent) set_store_value(direction, $direction = 1, $direction); else set_store_value(direction, $direction = -1, $direction);
    	}

    	function nextContent(event) {
    		if (Math.round(Y) == document.documentElement.scrollHeight - window.innerHeight) if (pageContent < totalPageContent) $$invalidate(0, pageContent++, pageContent);

    		// direction.update(n => 1);
    		checkDirection();
    	}

    	function prevContent() {
    		$$invalidate(0, pageContent--, pageContent);
    		if (pageContent <= 0) $$invalidate(0, pageContent = 1);

    		// direction.update(n => -1);
    		checkDirection();
    	}

    	function handleMousemove(event) {
    		event.preventDefault();
    		if (event.deltaY > 0) nextContent(); else prevContent();
    	}

    	let unlocked = true;

    	function lock() {
    		$$invalidate(2, unlocked = false);
    	}

    	function unlock() {
    		$$invalidate(2, unlocked = true);
    	}

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Home> was created with unknown prop '${key}'`);
    	});

    	function onwindowscroll() {
    		$$invalidate(1, Y = window_1$2.pageYOffset);
    	}

    	$$self.$capture_state = () => ({
    		page,
    		slide,
    		fade,
    		scale,
    		direction,
    		fadeDelay,
    		slideDuration,
    		totalPageContent,
    		pageContent,
    		Y,
    		checkDirection,
    		nextContent,
    		prevContent,
    		handleMousemove,
    		unlocked,
    		lock,
    		unlock,
    		$direction
    	});

    	$$self.$inject_state = $$props => {
    		if ('fadeDelay' in $$props) fadeDelay = $$props.fadeDelay;
    		if ('slideDuration' in $$props) $$invalidate(3, slideDuration = $$props.slideDuration);
    		if ('totalPageContent' in $$props) totalPageContent = $$props.totalPageContent;
    		if ('pageContent' in $$props) $$invalidate(0, pageContent = $$props.pageContent);
    		if ('Y' in $$props) $$invalidate(1, Y = $$props.Y);
    		if ('unlocked' in $$props) $$invalidate(2, unlocked = $$props.unlocked);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		pageContent,
    		Y,
    		unlocked,
    		slideDuration,
    		nextContent,
    		handleMousemove,
    		lock,
    		unlock,
    		onwindowscroll
    	];
    }

    class Home extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$4, create_fragment$4, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Home",
    			options,
    			id: create_fragment$4.name
    		});
    	}
    }

    /* src\Pages\Crop.svelte generated by Svelte v3.40.1 */

    const { Error: Error_1$2 } = globals;
    const file$3 = "src\\Pages\\Crop.svelte";

    // (112:12) {#if currClass =="inp"}
    function create_if_block_3$3(ctx) {
    	let button;
    	let button_transition;
    	let current;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			button = element("button");
    			button.textContent = "Find";
    			attr_dev(button, "class", "inp svelte-16ydpxe");
    			add_location(button, file$3, 112, 16, 4196);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, button, anchor);
    			current = true;

    			if (!mounted) {
    				dispose = listen_dev(button, "click", /*Find*/ ctx[7], false, false, false);
    				mounted = true;
    			}
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;

    			add_render_callback(() => {
    				if (!button_transition) button_transition = create_bidirectional_transition(button, scale, { delay: 460, duration: 400, start: 0 }, true);
    				button_transition.run(1);
    			});

    			current = true;
    		},
    		o: function outro(local) {
    			if (!button_transition) button_transition = create_bidirectional_transition(button, scale, { delay: 460, duration: 400, start: 0 }, false);
    			button_transition.run(0);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(button);
    			if (detaching && button_transition) button_transition.end();
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_3$3.name,
    		type: "if",
    		source: "(112:12) {#if currClass ==\\\"inp\\\"}",
    		ctx
    	});

    	return block;
    }

    // (117:12) {#if incomplete}
    function create_if_block_2$3(ctx) {
    	let div;
    	let div_transition;
    	let current;

    	const block = {
    		c: function create() {
    			div = element("div");
    			div.textContent = "Enter all details";
    			set_style(div, "color", "red");
    			set_style(div, "padding-left", "20px");
    			add_location(div, file$3, 117, 16, 4418);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			current = true;
    		},
    		i: function intro(local) {
    			if (current) return;

    			add_render_callback(() => {
    				if (!div_transition) div_transition = create_bidirectional_transition(div, scale, { duration: 200, start: 0, opacity: 0.1 }, true);
    				div_transition.run(1);
    			});

    			current = true;
    		},
    		o: function outro(local) {
    			if (!div_transition) div_transition = create_bidirectional_transition(div, scale, { duration: 200, start: 0, opacity: 0.1 }, false);
    			div_transition.run(0);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if (detaching && div_transition) div_transition.end();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_2$3.name,
    		type: "if",
    		source: "(117:12) {#if incomplete}",
    		ctx
    	});

    	return block;
    }

    // (120:12) {#if invalid}
    function create_if_block_1$3(ctx) {
    	let div;
    	let div_transition;
    	let current;

    	const block = {
    		c: function create() {
    			div = element("div");
    			div.textContent = "Entered values are invalid";
    			set_style(div, "color", "red");
    			set_style(div, "padding-left", "20px");
    			add_location(div, file$3, 120, 12, 4604);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			current = true;
    		},
    		i: function intro(local) {
    			if (current) return;

    			add_render_callback(() => {
    				if (!div_transition) div_transition = create_bidirectional_transition(div, scale, { duration: 200, start: 0, opacity: 0.1 }, true);
    				div_transition.run(1);
    			});

    			current = true;
    		},
    		o: function outro(local) {
    			if (!div_transition) div_transition = create_bidirectional_transition(div, scale, { duration: 200, start: 0, opacity: 0.1 }, false);
    			div_transition.run(0);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if (detaching && div_transition) div_transition.end();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1$3.name,
    		type: "if",
    		source: "(120:12) {#if invalid}",
    		ctx
    	});

    	return block;
    }

    // (125:8) {#if runML}
    function create_if_block$3(ctx) {
    	let div;
    	let h2;
    	let t0;
    	let t1;
    	let t2;
    	let p;
    	let t3;
    	let div_transition;
    	let current;

    	const block = {
    		c: function create() {
    			div = element("div");
    			h2 = element("h2");
    			t0 = text(/*prediction*/ ctx[3]);
    			t1 = text(" is recommended");
    			t2 = space();
    			p = element("p");
    			t3 = text(/*predictionDesc*/ ctx[4]);
    			attr_dev(h2, "class", "svelte-16ydpxe");
    			add_location(h2, file$3, 126, 12, 4871);
    			attr_dev(p, "class", "svelte-16ydpxe");
    			add_location(p, file$3, 127, 12, 4922);
    			attr_dev(div, "class", "modelWindow svelte-16ydpxe");
    			add_location(div, file$3, 125, 8, 4815);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, h2);
    			append_dev(h2, t0);
    			append_dev(h2, t1);
    			append_dev(div, t2);
    			append_dev(div, p);
    			append_dev(p, t3);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (!current || dirty & /*prediction*/ 8) set_data_dev(t0, /*prediction*/ ctx[3]);
    			if (!current || dirty & /*predictionDesc*/ 16) set_data_dev(t3, /*predictionDesc*/ ctx[4]);
    		},
    		i: function intro(local) {
    			if (current) return;

    			add_render_callback(() => {
    				if (!div_transition) div_transition = create_bidirectional_transition(div, slide, {}, true);
    				div_transition.run(1);
    			});

    			current = true;
    		},
    		o: function outro(local) {
    			if (!div_transition) div_transition = create_bidirectional_transition(div, slide, {}, false);
    			div_transition.run(0);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if (detaching && div_transition) div_transition.end();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$3.name,
    		type: "if",
    		source: "(125:8) {#if runML}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$3(ctx) {
    	let main;
    	let h1;
    	let h1_transition;
    	let t1;
    	let div;
    	let input0;
    	let input0_class_value;
    	let input0_transition;
    	let t2;
    	let br0;
    	let t3;
    	let input1;
    	let input1_class_value;
    	let input1_transition;
    	let t4;
    	let br1;
    	let t5;
    	let input2;
    	let input2_class_value;
    	let input2_transition;
    	let t6;
    	let br2;
    	let t7;
    	let input3;
    	let input3_class_value;
    	let input3_transition;
    	let t8;
    	let br3;
    	let t9;
    	let input4;
    	let input4_class_value;
    	let input4_transition;
    	let t10;
    	let br4;
    	let t11;
    	let input5;
    	let input5_class_value;
    	let input5_transition;
    	let t12;
    	let br5;
    	let t13;
    	let input6;
    	let input6_class_value;
    	let input6_transition;
    	let t14;
    	let br6;
    	let t15;
    	let t16;
    	let t17;
    	let div_intro;
    	let t18;
    	let current;
    	let mounted;
    	let dispose;
    	let if_block0 = /*currClass*/ ctx[1] == "inp" && create_if_block_3$3(ctx);
    	let if_block1 = /*incomplete*/ ctx[5] && create_if_block_2$3(ctx);
    	let if_block2 = /*invalid*/ ctx[6] && create_if_block_1$3(ctx);
    	let if_block3 = /*runML*/ ctx[2] && create_if_block$3(ctx);

    	const block = {
    		c: function create() {
    			main = element("main");
    			h1 = element("h1");
    			h1.textContent = "Crop Prediction";
    			t1 = space();
    			div = element("div");
    			input0 = element("input");
    			t2 = space();
    			br0 = element("br");
    			t3 = space();
    			input1 = element("input");
    			t4 = space();
    			br1 = element("br");
    			t5 = space();
    			input2 = element("input");
    			t6 = space();
    			br2 = element("br");
    			t7 = space();
    			input3 = element("input");
    			t8 = space();
    			br3 = element("br");
    			t9 = space();
    			input4 = element("input");
    			t10 = space();
    			br4 = element("br");
    			t11 = space();
    			input5 = element("input");
    			t12 = space();
    			br5 = element("br");
    			t13 = space();
    			input6 = element("input");
    			t14 = space();
    			br6 = element("br");
    			t15 = space();
    			if (if_block0) if_block0.c();
    			t16 = space();
    			if (if_block1) if_block1.c();
    			t17 = space();
    			if (if_block2) if_block2.c();
    			t18 = space();
    			if (if_block3) if_block3.c();
    			add_location(h1, file$3, 102, 4, 2635);
    			attr_dev(input0, "type", "number");
    			attr_dev(input0, "class", input0_class_value = "" + (null_to_empty(/*currClass*/ ctx[1]) + " svelte-16ydpxe"));
    			attr_dev(input0, "placeholder", "Nitrogen");
    			add_location(input0, file$3, 104, 12, 2847);
    			add_location(br0, file$3, 104, 177, 3012);
    			attr_dev(input1, "type", "number");
    			attr_dev(input1, "class", input1_class_value = "" + (null_to_empty(/*currClass*/ ctx[1]) + " svelte-16ydpxe"));
    			attr_dev(input1, "placeholder", "Phosphorus");
    			add_location(input1, file$3, 105, 12, 3030);
    			add_location(br1, file$3, 105, 179, 3197);
    			attr_dev(input2, "type", "number");
    			attr_dev(input2, "class", input2_class_value = "" + (null_to_empty(/*currClass*/ ctx[1]) + " svelte-16ydpxe"));
    			attr_dev(input2, "placeholder", "Potasium");
    			add_location(input2, file$3, 106, 12, 3215);
    			add_location(br2, file$3, 106, 177, 3380);
    			attr_dev(input3, "type", "text");
    			attr_dev(input3, "class", input3_class_value = "" + (null_to_empty(/*currClass*/ ctx[1]) + " svelte-16ydpxe"));
    			attr_dev(input3, "placeholder", "Temperature");
    			add_location(input3, file$3, 107, 12, 3398);
    			add_location(br3, file$3, 107, 181, 3567);
    			attr_dev(input4, "type", "text");
    			attr_dev(input4, "class", input4_class_value = "" + (null_to_empty(/*currClass*/ ctx[1]) + " svelte-16ydpxe"));
    			attr_dev(input4, "placeholder", "Humidity");
    			add_location(input4, file$3, 108, 12, 3585);
    			add_location(br4, file$3, 108, 177, 3750);
    			attr_dev(input5, "type", "number");
    			attr_dev(input5, "class", input5_class_value = "" + (null_to_empty(/*currClass*/ ctx[1]) + " svelte-16ydpxe"));
    			attr_dev(input5, "placeholder", "pH level");
    			add_location(input5, file$3, 109, 12, 3768);
    			add_location(br5, file$3, 109, 177, 3933);
    			attr_dev(input6, "type", "number");
    			attr_dev(input6, "class", input6_class_value = "" + (null_to_empty(/*currClass*/ ctx[1]) + " svelte-16ydpxe"));
    			attr_dev(input6, "placeholder", "Rainfall (in mm)");
    			add_location(input6, file$3, 110, 12, 3951);
    			add_location(br6, file$3, 110, 190, 4129);
    			set_style(div, "text-align", "left");
    			set_style(div, "width", "30%");
    			set_style(div, "float", "left");
    			add_location(div, file$3, 103, 8, 2736);
    			attr_dev(main, "class", "svelte-16ydpxe");
    			add_location(main, file$3, 101, 0, 2615);
    		},
    		l: function claim(nodes) {
    			throw new Error_1$2("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, main, anchor);
    			append_dev(main, h1);
    			append_dev(main, t1);
    			append_dev(main, div);
    			append_dev(div, input0);
    			set_input_value(input0, /*INPUT*/ ctx[0]['N']);
    			append_dev(div, t2);
    			append_dev(div, br0);
    			append_dev(div, t3);
    			append_dev(div, input1);
    			set_input_value(input1, /*INPUT*/ ctx[0]['P']);
    			append_dev(div, t4);
    			append_dev(div, br1);
    			append_dev(div, t5);
    			append_dev(div, input2);
    			set_input_value(input2, /*INPUT*/ ctx[0]['K']);
    			append_dev(div, t6);
    			append_dev(div, br2);
    			append_dev(div, t7);
    			append_dev(div, input3);
    			set_input_value(input3, /*INPUT*/ ctx[0]['Temp']);
    			append_dev(div, t8);
    			append_dev(div, br3);
    			append_dev(div, t9);
    			append_dev(div, input4);
    			set_input_value(input4, /*INPUT*/ ctx[0]['Hum']);
    			append_dev(div, t10);
    			append_dev(div, br4);
    			append_dev(div, t11);
    			append_dev(div, input5);
    			set_input_value(input5, /*INPUT*/ ctx[0]['pH']);
    			append_dev(div, t12);
    			append_dev(div, br5);
    			append_dev(div, t13);
    			append_dev(div, input6);
    			set_input_value(input6, /*INPUT*/ ctx[0]['Rfall']);
    			append_dev(div, t14);
    			append_dev(div, br6);
    			append_dev(div, t15);
    			if (if_block0) if_block0.m(div, null);
    			append_dev(div, t16);
    			if (if_block1) if_block1.m(div, null);
    			append_dev(div, t17);
    			if (if_block2) if_block2.m(div, null);
    			append_dev(main, t18);
    			if (if_block3) if_block3.m(main, null);
    			current = true;

    			if (!mounted) {
    				dispose = [
    					listen_dev(input0, "input", /*input0_input_handler*/ ctx[9]),
    					listen_dev(input0, "focus", /*Open*/ ctx[8], false, false, false),
    					listen_dev(input1, "input", /*input1_input_handler*/ ctx[10]),
    					listen_dev(input1, "focus", /*Open*/ ctx[8], false, false, false),
    					listen_dev(input2, "input", /*input2_input_handler*/ ctx[11]),
    					listen_dev(input2, "focus", /*Open*/ ctx[8], false, false, false),
    					listen_dev(input3, "input", /*input3_input_handler*/ ctx[12]),
    					listen_dev(input3, "focus", /*Open*/ ctx[8], false, false, false),
    					listen_dev(input4, "input", /*input4_input_handler*/ ctx[13]),
    					listen_dev(input4, "focus", /*Open*/ ctx[8], false, false, false),
    					listen_dev(input5, "input", /*input5_input_handler*/ ctx[14]),
    					listen_dev(input5, "focus", /*Open*/ ctx[8], false, false, false),
    					listen_dev(input6, "input", /*input6_input_handler*/ ctx[15]),
    					listen_dev(input6, "focus", /*Open*/ ctx[8], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (!current || dirty & /*currClass*/ 2 && input0_class_value !== (input0_class_value = "" + (null_to_empty(/*currClass*/ ctx[1]) + " svelte-16ydpxe"))) {
    				attr_dev(input0, "class", input0_class_value);
    			}

    			if (dirty & /*INPUT*/ 1 && to_number(input0.value) !== /*INPUT*/ ctx[0]['N']) {
    				set_input_value(input0, /*INPUT*/ ctx[0]['N']);
    			}

    			if (!current || dirty & /*currClass*/ 2 && input1_class_value !== (input1_class_value = "" + (null_to_empty(/*currClass*/ ctx[1]) + " svelte-16ydpxe"))) {
    				attr_dev(input1, "class", input1_class_value);
    			}

    			if (dirty & /*INPUT*/ 1 && to_number(input1.value) !== /*INPUT*/ ctx[0]['P']) {
    				set_input_value(input1, /*INPUT*/ ctx[0]['P']);
    			}

    			if (!current || dirty & /*currClass*/ 2 && input2_class_value !== (input2_class_value = "" + (null_to_empty(/*currClass*/ ctx[1]) + " svelte-16ydpxe"))) {
    				attr_dev(input2, "class", input2_class_value);
    			}

    			if (dirty & /*INPUT*/ 1 && to_number(input2.value) !== /*INPUT*/ ctx[0]['K']) {
    				set_input_value(input2, /*INPUT*/ ctx[0]['K']);
    			}

    			if (!current || dirty & /*currClass*/ 2 && input3_class_value !== (input3_class_value = "" + (null_to_empty(/*currClass*/ ctx[1]) + " svelte-16ydpxe"))) {
    				attr_dev(input3, "class", input3_class_value);
    			}

    			if (dirty & /*INPUT*/ 1 && input3.value !== /*INPUT*/ ctx[0]['Temp']) {
    				set_input_value(input3, /*INPUT*/ ctx[0]['Temp']);
    			}

    			if (!current || dirty & /*currClass*/ 2 && input4_class_value !== (input4_class_value = "" + (null_to_empty(/*currClass*/ ctx[1]) + " svelte-16ydpxe"))) {
    				attr_dev(input4, "class", input4_class_value);
    			}

    			if (dirty & /*INPUT*/ 1 && input4.value !== /*INPUT*/ ctx[0]['Hum']) {
    				set_input_value(input4, /*INPUT*/ ctx[0]['Hum']);
    			}

    			if (!current || dirty & /*currClass*/ 2 && input5_class_value !== (input5_class_value = "" + (null_to_empty(/*currClass*/ ctx[1]) + " svelte-16ydpxe"))) {
    				attr_dev(input5, "class", input5_class_value);
    			}

    			if (dirty & /*INPUT*/ 1 && to_number(input5.value) !== /*INPUT*/ ctx[0]['pH']) {
    				set_input_value(input5, /*INPUT*/ ctx[0]['pH']);
    			}

    			if (!current || dirty & /*currClass*/ 2 && input6_class_value !== (input6_class_value = "" + (null_to_empty(/*currClass*/ ctx[1]) + " svelte-16ydpxe"))) {
    				attr_dev(input6, "class", input6_class_value);
    			}

    			if (dirty & /*INPUT*/ 1 && to_number(input6.value) !== /*INPUT*/ ctx[0]['Rfall']) {
    				set_input_value(input6, /*INPUT*/ ctx[0]['Rfall']);
    			}

    			if (/*currClass*/ ctx[1] == "inp") {
    				if (if_block0) {
    					if_block0.p(ctx, dirty);

    					if (dirty & /*currClass*/ 2) {
    						transition_in(if_block0, 1);
    					}
    				} else {
    					if_block0 = create_if_block_3$3(ctx);
    					if_block0.c();
    					transition_in(if_block0, 1);
    					if_block0.m(div, t16);
    				}
    			} else if (if_block0) {
    				group_outros();

    				transition_out(if_block0, 1, 1, () => {
    					if_block0 = null;
    				});

    				check_outros();
    			}

    			if (/*incomplete*/ ctx[5]) {
    				if (if_block1) {
    					if (dirty & /*incomplete*/ 32) {
    						transition_in(if_block1, 1);
    					}
    				} else {
    					if_block1 = create_if_block_2$3(ctx);
    					if_block1.c();
    					transition_in(if_block1, 1);
    					if_block1.m(div, t17);
    				}
    			} else if (if_block1) {
    				group_outros();

    				transition_out(if_block1, 1, 1, () => {
    					if_block1 = null;
    				});

    				check_outros();
    			}

    			if (/*invalid*/ ctx[6]) {
    				if (if_block2) {
    					if (dirty & /*invalid*/ 64) {
    						transition_in(if_block2, 1);
    					}
    				} else {
    					if_block2 = create_if_block_1$3(ctx);
    					if_block2.c();
    					transition_in(if_block2, 1);
    					if_block2.m(div, null);
    				}
    			} else if (if_block2) {
    				group_outros();

    				transition_out(if_block2, 1, 1, () => {
    					if_block2 = null;
    				});

    				check_outros();
    			}

    			if (/*runML*/ ctx[2]) {
    				if (if_block3) {
    					if_block3.p(ctx, dirty);

    					if (dirty & /*runML*/ 4) {
    						transition_in(if_block3, 1);
    					}
    				} else {
    					if_block3 = create_if_block$3(ctx);
    					if_block3.c();
    					transition_in(if_block3, 1);
    					if_block3.m(main, null);
    				}
    			} else if (if_block3) {
    				group_outros();

    				transition_out(if_block3, 1, 1, () => {
    					if_block3 = null;
    				});

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;

    			add_render_callback(() => {
    				if (!h1_transition) h1_transition = create_bidirectional_transition(
    					h1,
    					scale,
    					{
    						duration: 800,
    						delay: 50,
    						opacity: 0.5,
    						start: 0
    					},
    					true
    				);

    				h1_transition.run(1);
    			});

    			add_render_callback(() => {
    				if (!input0_transition) input0_transition = create_bidirectional_transition(input0, scale, { delay: 200, duration: 400, start: 0 }, true);
    				input0_transition.run(1);
    			});

    			add_render_callback(() => {
    				if (!input1_transition) input1_transition = create_bidirectional_transition(input1, scale, { delay: 250, duration: 400, start: 0 }, true);
    				input1_transition.run(1);
    			});

    			add_render_callback(() => {
    				if (!input2_transition) input2_transition = create_bidirectional_transition(input2, scale, { delay: 300, duration: 400, start: 0 }, true);
    				input2_transition.run(1);
    			});

    			add_render_callback(() => {
    				if (!input3_transition) input3_transition = create_bidirectional_transition(input3, scale, { delay: 330, duration: 400, start: 0 }, true);
    				input3_transition.run(1);
    			});

    			add_render_callback(() => {
    				if (!input4_transition) input4_transition = create_bidirectional_transition(input4, scale, { delay: 390, duration: 400, start: 0 }, true);
    				input4_transition.run(1);
    			});

    			add_render_callback(() => {
    				if (!input5_transition) input5_transition = create_bidirectional_transition(input5, scale, { delay: 420, duration: 400, start: 0 }, true);
    				input5_transition.run(1);
    			});

    			add_render_callback(() => {
    				if (!input6_transition) input6_transition = create_bidirectional_transition(input6, scale, { delay: 450, duration: 400, start: 0 }, true);
    				input6_transition.run(1);
    			});

    			transition_in(if_block0);
    			transition_in(if_block1);
    			transition_in(if_block2);

    			if (!div_intro) {
    				add_render_callback(() => {
    					div_intro = create_in_transition(div, fade, { duration: 200, delay: 0 });
    					div_intro.start();
    				});
    			}

    			transition_in(if_block3);
    			current = true;
    		},
    		o: function outro(local) {
    			if (!h1_transition) h1_transition = create_bidirectional_transition(
    				h1,
    				scale,
    				{
    					duration: 800,
    					delay: 50,
    					opacity: 0.5,
    					start: 0
    				},
    				false
    			);

    			h1_transition.run(0);
    			if (!input0_transition) input0_transition = create_bidirectional_transition(input0, scale, { delay: 200, duration: 400, start: 0 }, false);
    			input0_transition.run(0);
    			if (!input1_transition) input1_transition = create_bidirectional_transition(input1, scale, { delay: 250, duration: 400, start: 0 }, false);
    			input1_transition.run(0);
    			if (!input2_transition) input2_transition = create_bidirectional_transition(input2, scale, { delay: 300, duration: 400, start: 0 }, false);
    			input2_transition.run(0);
    			if (!input3_transition) input3_transition = create_bidirectional_transition(input3, scale, { delay: 330, duration: 400, start: 0 }, false);
    			input3_transition.run(0);
    			if (!input4_transition) input4_transition = create_bidirectional_transition(input4, scale, { delay: 390, duration: 400, start: 0 }, false);
    			input4_transition.run(0);
    			if (!input5_transition) input5_transition = create_bidirectional_transition(input5, scale, { delay: 420, duration: 400, start: 0 }, false);
    			input5_transition.run(0);
    			if (!input6_transition) input6_transition = create_bidirectional_transition(input6, scale, { delay: 450, duration: 400, start: 0 }, false);
    			input6_transition.run(0);
    			transition_out(if_block0);
    			transition_out(if_block1);
    			transition_out(if_block2);
    			transition_out(if_block3);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(main);
    			if (detaching && h1_transition) h1_transition.end();
    			if (detaching && input0_transition) input0_transition.end();
    			if (detaching && input1_transition) input1_transition.end();
    			if (detaching && input2_transition) input2_transition.end();
    			if (detaching && input3_transition) input3_transition.end();
    			if (detaching && input4_transition) input4_transition.end();
    			if (detaching && input5_transition) input5_transition.end();
    			if (detaching && input6_transition) input6_transition.end();
    			if (if_block0) if_block0.d();
    			if (if_block1) if_block1.d();
    			if (if_block2) if_block2.d();
    			if (if_block3) if_block3.d();
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$3.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$3($$self, $$props, $$invalidate) {
    	let $direction;
    	validate_store(direction, 'direction');
    	component_subscribe($$self, direction, $$value => $$invalidate(16, $direction = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Crop', slots, []);
    	set_store_value(direction, $direction = 0, $direction);

    	let INPUT = {
    		N: null,
    		P: null,
    		K: null,
    		pH: null,
    		Rfall: null,
    		Temp: null,
    		Hum: null
    	};

    	let dsp = "block";
    	let currClass = "inp";
    	let runML = false;
    	let prediction = "";
    	let predictionDesc = "";
    	let incomplete = false, invalid = false;

    	async function fetchPrediction() {
    		let ModelResponse = await fetch('/TriggerModel', {
    			method: "POST",
    			body: JSON.stringify(INPUT),
    			headers: new Headers({ "content-type": "application/json" })
    		});

    		if (!ModelResponse.ok) throw new Error();
    		return await ModelResponse.json();
    	}

    	async function Find() {
    		$$invalidate(6, invalid = false);

    		for (let K in INPUT) {
    			if (INPUT[K] < 0) {
    				$$invalidate(6, invalid = true);
    				return;
    			}

    			if (INPUT[K] == null) {
    				$$invalidate(5, incomplete = true);
    				return;
    			}
    		}

    		$$invalidate(5, incomplete = false);

    		fetchPrediction().then(res => {
    			$$invalidate(3, prediction = res["result"]);
    			$$invalidate(4, predictionDesc = res["desc"]);
    			$$invalidate(1, currClass = "cmptINP");
    			$$invalidate(2, runML = true);
    		}).catch(err => {
    			
    		}); // ERROR - response from server not received
    	} // fetch('/TriggerModel',{method: "POST", body:JSON.stringify(INPUT), headers: new Headers({"content-type": "application/json"})})
    	// .then(function (response) 

    	//     {
    	//         return response.text();
    	//     })
    	// .then(function (text) 
    	//     {
    	//         prediction = text;
    	//     });
    	/*
        const Http = new XMLHttpRequest();
        const url='https://jsonplaceholder.typicode.com/posts';
        // Http.open("GET", url);
        Http.open('POST', url);
        Http.send();
        Http.onreadystatechange = function()
        {
            if(this.readyState == 4 && this.status == 200)
                alert(Http.responseText);
        }
    */
    	function Open() {
    		$$invalidate(1, currClass = "inp");
    		$$invalidate(2, runML = false);
    	}

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Crop> was created with unknown prop '${key}'`);
    	});

    	function input0_input_handler() {
    		INPUT['N'] = to_number(this.value);
    		$$invalidate(0, INPUT);
    	}

    	function input1_input_handler() {
    		INPUT['P'] = to_number(this.value);
    		$$invalidate(0, INPUT);
    	}

    	function input2_input_handler() {
    		INPUT['K'] = to_number(this.value);
    		$$invalidate(0, INPUT);
    	}

    	function input3_input_handler() {
    		INPUT['Temp'] = this.value;
    		$$invalidate(0, INPUT);
    	}

    	function input4_input_handler() {
    		INPUT['Hum'] = this.value;
    		$$invalidate(0, INPUT);
    	}

    	function input5_input_handler() {
    		INPUT['pH'] = to_number(this.value);
    		$$invalidate(0, INPUT);
    	}

    	function input6_input_handler() {
    		INPUT['Rfall'] = to_number(this.value);
    		$$invalidate(0, INPUT);
    	}

    	$$self.$capture_state = () => ({
    		slide,
    		fade,
    		scale,
    		direction,
    		INPUT,
    		dsp,
    		currClass,
    		runML,
    		prediction,
    		predictionDesc,
    		incomplete,
    		invalid,
    		fetchPrediction,
    		Find,
    		Open,
    		$direction
    	});

    	$$self.$inject_state = $$props => {
    		if ('INPUT' in $$props) $$invalidate(0, INPUT = $$props.INPUT);
    		if ('dsp' in $$props) dsp = $$props.dsp;
    		if ('currClass' in $$props) $$invalidate(1, currClass = $$props.currClass);
    		if ('runML' in $$props) $$invalidate(2, runML = $$props.runML);
    		if ('prediction' in $$props) $$invalidate(3, prediction = $$props.prediction);
    		if ('predictionDesc' in $$props) $$invalidate(4, predictionDesc = $$props.predictionDesc);
    		if ('incomplete' in $$props) $$invalidate(5, incomplete = $$props.incomplete);
    		if ('invalid' in $$props) $$invalidate(6, invalid = $$props.invalid);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		INPUT,
    		currClass,
    		runML,
    		prediction,
    		predictionDesc,
    		incomplete,
    		invalid,
    		Find,
    		Open,
    		input0_input_handler,
    		input1_input_handler,
    		input2_input_handler,
    		input3_input_handler,
    		input4_input_handler,
    		input5_input_handler,
    		input6_input_handler
    	];
    }

    class Crop extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$3, create_fragment$3, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Crop",
    			options,
    			id: create_fragment$3.name
    		});
    	}
    }

    /* src\Pages\Disease.svelte generated by Svelte v3.40.1 */

    const { Error: Error_1$1, document: document_1$1, window: window_1$1 } = globals;
    const file$2 = "src\\Pages\\Disease.svelte";

    // (192:4) {#if pageContent == 1  }
    function create_if_block_1$2(ctx) {
    	let div1;
    	let div0;
    	let button;
    	let button_transition;
    	let t1;
    	let div1_intro;
    	let t2;
    	let div3;
    	let label;
    	let div2;
    	let t3;
    	let t4;
    	let img;
    	let img_src_value;
    	let div2_intro;
    	let div2_outro;
    	let div3_intro;
    	let current;
    	let mounted;
    	let dispose;
    	let if_block0 = /*showOUT*/ ctx[1] && create_if_block_4$1(ctx);
    	let if_block1 = /*Scanning*/ ctx[8] && create_if_block_3$2(ctx);
    	let if_block2 = /*isdropped*/ ctx[12] == false && create_if_block_2$2(ctx);

    	const block = {
    		c: function create() {
    			div1 = element("div");
    			div0 = element("div");
    			button = element("button");
    			button.textContent = "Check for disease";
    			t1 = space();
    			if (if_block0) if_block0.c();
    			t2 = space();
    			div3 = element("div");
    			label = element("label");
    			div2 = element("div");
    			if (if_block1) if_block1.c();
    			t3 = space();
    			if (if_block2) if_block2.c();
    			t4 = space();
    			img = element("img");
    			attr_dev(button, "class", "inp svelte-1ivovqy");
    			add_location(button, file$2, 194, 16, 5563);
    			add_location(div0, file$2, 193, 12, 5540);
    			set_style(div1, "text-align", "left");
    			set_style(div1, "width", "30%");
    			set_style(div1, "float", "left");
    			add_location(div1, file$2, 192, 8, 5429);
    			attr_dev(img, "id", "upIMG");
    			if (!src_url_equal(img.src, img_src_value = /*imgSRC*/ ctx[11])) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", "");
    			attr_dev(img, "class", "svelte-1ivovqy");
    			add_location(img, file$2, 220, 20, 6898);
    			attr_dev(div2, "class", "imageWindow svelte-1ivovqy");
    			add_location(div2, file$2, 210, 16, 6295);
    			attr_dev(label, "for", "file-input");
    			add_location(label, file$2, 209, 12, 6253);
    			set_style(div3, "text-align", "left");
    			set_style(div3, "width", "65%");
    			set_style(div3, "float", "left");
    			set_style(div3, "margin-left", "10px");
    			add_location(div3, file$2, 208, 8, 6120);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div1, anchor);
    			append_dev(div1, div0);
    			append_dev(div0, button);
    			append_dev(div1, t1);
    			if (if_block0) if_block0.m(div1, null);
    			insert_dev(target, t2, anchor);
    			insert_dev(target, div3, anchor);
    			append_dev(div3, label);
    			append_dev(label, div2);
    			if (if_block1) if_block1.m(div2, null);
    			append_dev(div2, t3);
    			if (if_block2) if_block2.m(div2, null);
    			append_dev(div2, t4);
    			append_dev(div2, img);
    			current = true;

    			if (!mounted) {
    				dispose = [
    					listen_dev(button, "click", /*CheckForDisease*/ ctx[14], false, false, false),
    					listen_dev(div2, "drop", /*dropHandler*/ ctx[13], false, false, false),
    					listen_dev(div2, "dragover", dragOverHandler, false, false, false),
    					listen_dev(div2, "click", /*BTNbindclick*/ ctx[15], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (/*showOUT*/ ctx[1]) {
    				if (if_block0) {
    					if_block0.p(ctx, dirty);

    					if (dirty & /*showOUT*/ 2) {
    						transition_in(if_block0, 1);
    					}
    				} else {
    					if_block0 = create_if_block_4$1(ctx);
    					if_block0.c();
    					transition_in(if_block0, 1);
    					if_block0.m(div1, null);
    				}
    			} else if (if_block0) {
    				group_outros();

    				transition_out(if_block0, 1, 1, () => {
    					if_block0 = null;
    				});

    				check_outros();
    			}

    			if (/*Scanning*/ ctx[8]) {
    				if (if_block1) {
    					if_block1.p(ctx, dirty);
    				} else {
    					if_block1 = create_if_block_3$2(ctx);
    					if_block1.c();
    					if_block1.m(div2, t3);
    				}
    			} else if (if_block1) {
    				if_block1.d(1);
    				if_block1 = null;
    			}

    			if (/*isdropped*/ ctx[12] == false) {
    				if (if_block2) ; else {
    					if_block2 = create_if_block_2$2(ctx);
    					if_block2.c();
    					if_block2.m(div2, t4);
    				}
    			} else if (if_block2) {
    				if_block2.d(1);
    				if_block2 = null;
    			}

    			if (!current || dirty & /*imgSRC*/ 2048 && !src_url_equal(img.src, img_src_value = /*imgSRC*/ ctx[11])) {
    				attr_dev(img, "src", img_src_value);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;

    			add_render_callback(() => {
    				if (!button_transition) button_transition = create_bidirectional_transition(button, scale, { delay: 200, duration: 400, start: 0 }, true);
    				button_transition.run(1);
    			});

    			transition_in(if_block0);

    			if (!div1_intro) {
    				add_render_callback(() => {
    					div1_intro = create_in_transition(div1, fade, { duration: 200, delay: 200 });
    					div1_intro.start();
    				});
    			}

    			add_render_callback(() => {
    				if (div2_outro) div2_outro.end(1);
    				if (!div2_intro) div2_intro = create_in_transition(div2, slide, { delay: 200 });
    				div2_intro.start();
    			});

    			if (!div3_intro) {
    				add_render_callback(() => {
    					div3_intro = create_in_transition(div3, fade, { duration: 200, delay: 0 });
    					div3_intro.start();
    				});
    			}

    			current = true;
    		},
    		o: function outro(local) {
    			if (!button_transition) button_transition = create_bidirectional_transition(button, scale, { delay: 200, duration: 400, start: 0 }, false);
    			button_transition.run(0);
    			transition_out(if_block0);
    			if (div2_intro) div2_intro.invalidate();
    			div2_outro = create_out_transition(div2, slide, {});
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div1);
    			if (detaching && button_transition) button_transition.end();
    			if (if_block0) if_block0.d();
    			if (detaching) detach_dev(t2);
    			if (detaching) detach_dev(div3);
    			if (if_block1) if_block1.d();
    			if (if_block2) if_block2.d();
    			if (detaching && div2_outro) div2_outro.end();
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1$2.name,
    		type: "if",
    		source: "(192:4) {#if pageContent == 1  }",
    		ctx
    	});

    	return block;
    }

    // (199:12) {#if showOUT}
    function create_if_block_4$1(ctx) {
    	let div;
    	let h20;
    	let t0;
    	let t1_value = /*plntNM_Cond*/ ctx[2][0] + "";
    	let t1;
    	let t2;
    	let h21;
    	let t3;
    	let t4_value = /*plntNM_Cond*/ ctx[2][1] + "";
    	let t4;
    	let t5;
    	let div_transition;
    	let current;

    	const block = {
    		c: function create() {
    			div = element("div");
    			h20 = element("h2");
    			t0 = text("Plant:     ");
    			t1 = text(t1_value);
    			t2 = space();
    			h21 = element("h2");
    			t3 = text("Condition: ");
    			t4 = text(t4_value);
    			t5 = text("\r\n                    Scroll down to know more");
    			add_location(h20, file$2, 200, 20, 5903);
    			add_location(h21, file$2, 201, 20, 5963);
    			attr_dev(div, "class", "modelWindow svelte-1ivovqy");
    			add_location(div, file$2, 199, 16, 5823);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, h20);
    			append_dev(h20, t0);
    			append_dev(h20, t1);
    			append_dev(div, t2);
    			append_dev(div, h21);
    			append_dev(h21, t3);
    			append_dev(h21, t4);
    			append_dev(div, t5);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if ((!current || dirty & /*plntNM_Cond*/ 4) && t1_value !== (t1_value = /*plntNM_Cond*/ ctx[2][0] + "")) set_data_dev(t1, t1_value);
    			if ((!current || dirty & /*plntNM_Cond*/ 4) && t4_value !== (t4_value = /*plntNM_Cond*/ ctx[2][1] + "")) set_data_dev(t4, t4_value);
    		},
    		i: function intro(local) {
    			if (current) return;

    			add_render_callback(() => {
    				if (!div_transition) div_transition = create_bidirectional_transition(div, slide, { delay: 200 }, true);
    				div_transition.run(1);
    			});

    			current = true;
    		},
    		o: function outro(local) {
    			if (!div_transition) div_transition = create_bidirectional_transition(div, slide, { delay: 200 }, false);
    			div_transition.run(0);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if (detaching && div_transition) div_transition.end();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_4$1.name,
    		type: "if",
    		source: "(199:12) {#if showOUT}",
    		ctx
    	});

    	return block;
    }

    // (212:20) {#if Scanning}
    function create_if_block_3$2(ctx) {
    	let div;

    	const block = {
    		c: function create() {
    			div = element("div");
    			attr_dev(div, "id", "ScanLine");
    			set_style(div, "top", /*linePos*/ ctx[7] + "%");
    			attr_dev(div, "class", "svelte-1ivovqy");
    			add_location(div, file$2, 212, 24, 6499);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*linePos*/ 128) {
    				set_style(div, "top", /*linePos*/ ctx[7] + "%");
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_3$2.name,
    		type: "if",
    		source: "(212:20) {#if Scanning}",
    		ctx
    	});

    	return block;
    }

    // (215:20) {#if isdropped == false}
    function create_if_block_2$2(ctx) {
    	let t0;
    	let br0;
    	let br1;
    	let t1;
    	let br2;
    	let t2;
    	let br3;
    	let t3;
    	let br4;
    	let br5;

    	const block = {
    		c: function create() {
    			t0 = text("Drag and drop image here    ");
    			br0 = element("br");
    			br1 = element("br");
    			t1 = text("\r\n                                Or          ");
    			br2 = element("br");
    			t2 = space();
    			br3 = element("br");
    			t3 = text("    \r\n                        Click here to load image         \r\n                        ");
    			br4 = element("br");
    			br5 = element("br");
    			add_location(br0, file$2, 215, 52, 6675);
    			add_location(br1, file$2, 215, 56, 6679);
    			add_location(br2, file$2, 216, 44, 6729);
    			add_location(br3, file$2, 216, 52, 6737);
    			add_location(br4, file$2, 218, 24, 6830);
    			add_location(br5, file$2, 218, 28, 6834);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t0, anchor);
    			insert_dev(target, br0, anchor);
    			insert_dev(target, br1, anchor);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, br2, anchor);
    			insert_dev(target, t2, anchor);
    			insert_dev(target, br3, anchor);
    			insert_dev(target, t3, anchor);
    			insert_dev(target, br4, anchor);
    			insert_dev(target, br5, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(br0);
    			if (detaching) detach_dev(br1);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(br2);
    			if (detaching) detach_dev(t2);
    			if (detaching) detach_dev(br3);
    			if (detaching) detach_dev(t3);
    			if (detaching) detach_dev(br4);
    			if (detaching) detach_dev(br5);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_2$2.name,
    		type: "if",
    		source: "(215:20) {#if isdropped == false}",
    		ctx
    	});

    	return block;
    }

    // (228:4) {#if pageContent == 2}
    function create_if_block$2(ctx) {
    	let div0;
    	let img;
    	let img_src_value;
    	let div0_intro;
    	let div0_outro;
    	let t0;
    	let div4;
    	let div1;
    	let h20;
    	let t1;
    	let div1_intro;
    	let div1_outro;
    	let t2;
    	let div2;
    	let h21;
    	let t4;
    	let p0;
    	let t5;
    	let div2_intro;
    	let div2_outro;
    	let t6;
    	let div3;
    	let h22;
    	let t8;
    	let p1;
    	let t9;
    	let div3_intro;
    	let div3_outro;
    	let current;

    	const block = {
    		c: function create() {
    			div0 = element("div");
    			img = element("img");
    			t0 = space();
    			div4 = element("div");
    			div1 = element("div");
    			h20 = element("h2");
    			t1 = text(/*DISname*/ ctx[3]);
    			t2 = space();
    			div2 = element("div");
    			h21 = element("h2");
    			h21.textContent = "Description";
    			t4 = space();
    			p0 = element("p");
    			t5 = text(/*DISdesc*/ ctx[4]);
    			t6 = space();
    			div3 = element("div");
    			h22 = element("h2");
    			h22.textContent = "Prevention Steps";
    			t8 = space();
    			p1 = element("p");
    			t9 = text(/*DISps*/ ctx[5]);
    			if (!src_url_equal(img.src, img_src_value = /*DISimgURL*/ ctx[6])) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", "[Image not avaliable]");
    			set_style(img, "min-height", "100%");
    			set_style(img, "min-width", "100%");
    			add_location(img, file$2, 229, 12, 7263);
    			attr_dev(div0, "class", "modelWindow svelte-1ivovqy");
    			set_style(div0, "width", "30%");
    			set_style(div0, "height", "420px");
    			set_style(div0, "float", "left");
    			set_style(div0, "padding", "0");
    			set_style(div0, "overflow", "hidden");
    			add_location(div0, file$2, 228, 8, 7112);
    			add_location(h20, file$2, 234, 16, 7554);
    			attr_dev(div1, "class", "modelWindow customMW svelte-1ivovqy");
    			add_location(div1, file$2, 233, 12, 7467);
    			add_location(h21, file$2, 237, 16, 7695);
    			attr_dev(p0, "class", "svelte-1ivovqy");
    			add_location(p0, file$2, 238, 16, 7733);
    			attr_dev(div2, "class", "modelWindow customMW svelte-1ivovqy");
    			add_location(div2, file$2, 236, 12, 7608);
    			add_location(h22, file$2, 241, 16, 7872);
    			attr_dev(p1, "class", "svelte-1ivovqy");
    			add_location(p1, file$2, 242, 16, 7915);
    			attr_dev(div3, "class", "modelWindow customMW svelte-1ivovqy");
    			add_location(div3, file$2, 240, 12, 7785);
    			set_style(div4, "float", "left");
    			set_style(div4, "width", "60%");
    			set_style(div4, "margin-left", "10px");
    			add_location(div4, file$2, 232, 8, 7398);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div0, anchor);
    			append_dev(div0, img);
    			insert_dev(target, t0, anchor);
    			insert_dev(target, div4, anchor);
    			append_dev(div4, div1);
    			append_dev(div1, h20);
    			append_dev(h20, t1);
    			append_dev(div4, t2);
    			append_dev(div4, div2);
    			append_dev(div2, h21);
    			append_dev(div2, t4);
    			append_dev(div2, p0);
    			append_dev(p0, t5);
    			append_dev(div4, t6);
    			append_dev(div4, div3);
    			append_dev(div3, h22);
    			append_dev(div3, t8);
    			append_dev(div3, p1);
    			append_dev(p1, t9);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (!current || dirty & /*DISimgURL*/ 64 && !src_url_equal(img.src, img_src_value = /*DISimgURL*/ ctx[6])) {
    				attr_dev(img, "src", img_src_value);
    			}

    			if (!current || dirty & /*DISname*/ 8) set_data_dev(t1, /*DISname*/ ctx[3]);
    			if (!current || dirty & /*DISdesc*/ 16) set_data_dev(t5, /*DISdesc*/ ctx[4]);
    			if (!current || dirty & /*DISps*/ 32) set_data_dev(t9, /*DISps*/ ctx[5]);
    		},
    		i: function intro(local) {
    			if (current) return;

    			add_render_callback(() => {
    				if (div0_outro) div0_outro.end(1);
    				if (!div0_intro) div0_intro = create_in_transition(div0, scale, { delay: 800 });
    				div0_intro.start();
    			});

    			add_render_callback(() => {
    				if (div1_outro) div1_outro.end(1);
    				if (!div1_intro) div1_intro = create_in_transition(div1, scale, { delay: 850 });
    				div1_intro.start();
    			});

    			add_render_callback(() => {
    				if (div2_outro) div2_outro.end(1);
    				if (!div2_intro) div2_intro = create_in_transition(div2, scale, { delay: 900 });
    				div2_intro.start();
    			});

    			add_render_callback(() => {
    				if (div3_outro) div3_outro.end(1);
    				if (!div3_intro) div3_intro = create_in_transition(div3, scale, { delay: 950 });
    				div3_intro.start();
    			});

    			current = true;
    		},
    		o: function outro(local) {
    			if (div0_intro) div0_intro.invalidate();
    			div0_outro = create_out_transition(div0, scale, {});
    			if (div1_intro) div1_intro.invalidate();
    			div1_outro = create_out_transition(div1, scale, {});
    			if (div2_intro) div2_intro.invalidate();
    			div2_outro = create_out_transition(div2, scale, {});
    			if (div3_intro) div3_intro.invalidate();
    			div3_outro = create_out_transition(div3, scale, {});
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div0);
    			if (detaching && div0_outro) div0_outro.end();
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(div4);
    			if (detaching && div1_outro) div1_outro.end();
    			if (detaching && div2_outro) div2_outro.end();
    			if (detaching && div3_outro) div3_outro.end();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$2.name,
    		type: "if",
    		source: "(228:4) {#if pageContent == 2}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$2(ctx) {
    	let scrolling = false;

    	let clear_scrolling = () => {
    		scrolling = false;
    	};

    	let scrolling_timeout;
    	let t0;
    	let main;
    	let h1;
    	let h1_transition;
    	let t2;
    	let input;
    	let t3;
    	let t4;
    	let current;
    	let mounted;
    	let dispose;
    	add_render_callback(/*onwindowscroll*/ ctx[17]);
    	let if_block0 = /*pageContent*/ ctx[9] == 1 && create_if_block_1$2(ctx);
    	let if_block1 = /*pageContent*/ ctx[9] == 2 && create_if_block$2(ctx);

    	const block = {
    		c: function create() {
    			t0 = space();
    			main = element("main");
    			h1 = element("h1");
    			h1.textContent = "Plant Diesase";
    			t2 = space();
    			input = element("input");
    			t3 = space();
    			if (if_block0) if_block0.c();
    			t4 = space();
    			if (if_block1) if_block1.c();
    			add_location(h1, file$2, 189, 4, 5222);
    			attr_dev(input, "type", "file");
    			attr_dev(input, "id", "OGfileINP");
    			set_style(input, "display", "none");
    			add_location(input, file$2, 190, 4, 5321);
    			attr_dev(main, "class", "svelte-1ivovqy");
    			add_location(main, file$2, 188, 0, 5206);
    		},
    		l: function claim(nodes) {
    			throw new Error_1$1("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t0, anchor);
    			insert_dev(target, main, anchor);
    			append_dev(main, h1);
    			append_dev(main, t2);
    			append_dev(main, input);
    			append_dev(main, t3);
    			if (if_block0) if_block0.m(main, null);
    			append_dev(main, t4);
    			if (if_block1) if_block1.m(main, null);
    			current = true;

    			if (!mounted) {
    				dispose = [
    					listen_dev(window_1$1, "scroll", () => {
    						scrolling = true;
    						clearTimeout(scrolling_timeout);
    						scrolling_timeout = setTimeout(clear_scrolling, 100);
    						/*onwindowscroll*/ ctx[17]();
    					}),
    					listen_dev(document_1$1.body, "wheel", /*handleMousemove*/ ctx[16], false, false, false),
    					listen_dev(input, "change", /*input_change_handler*/ ctx[18])
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*Y*/ 1024 && !scrolling) {
    				scrolling = true;
    				clearTimeout(scrolling_timeout);
    				scrollTo(window_1$1.pageXOffset, /*Y*/ ctx[10]);
    				scrolling_timeout = setTimeout(clear_scrolling, 100);
    			}

    			if (/*pageContent*/ ctx[9] == 1) {
    				if (if_block0) {
    					if_block0.p(ctx, dirty);

    					if (dirty & /*pageContent*/ 512) {
    						transition_in(if_block0, 1);
    					}
    				} else {
    					if_block0 = create_if_block_1$2(ctx);
    					if_block0.c();
    					transition_in(if_block0, 1);
    					if_block0.m(main, t4);
    				}
    			} else if (if_block0) {
    				group_outros();

    				transition_out(if_block0, 1, 1, () => {
    					if_block0 = null;
    				});

    				check_outros();
    			}

    			if (/*pageContent*/ ctx[9] == 2) {
    				if (if_block1) {
    					if_block1.p(ctx, dirty);

    					if (dirty & /*pageContent*/ 512) {
    						transition_in(if_block1, 1);
    					}
    				} else {
    					if_block1 = create_if_block$2(ctx);
    					if_block1.c();
    					transition_in(if_block1, 1);
    					if_block1.m(main, null);
    				}
    			} else if (if_block1) {
    				group_outros();

    				transition_out(if_block1, 1, 1, () => {
    					if_block1 = null;
    				});

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;

    			add_render_callback(() => {
    				if (!h1_transition) h1_transition = create_bidirectional_transition(
    					h1,
    					scale,
    					{
    						duration: 800,
    						delay: 50,
    						opacity: 0.5,
    						start: 0
    					},
    					true
    				);

    				h1_transition.run(1);
    			});

    			transition_in(if_block0);
    			transition_in(if_block1);
    			current = true;
    		},
    		o: function outro(local) {
    			if (!h1_transition) h1_transition = create_bidirectional_transition(
    				h1,
    				scale,
    				{
    					duration: 800,
    					delay: 50,
    					opacity: 0.5,
    					start: 0
    				},
    				false
    			);

    			h1_transition.run(0);
    			transition_out(if_block0);
    			transition_out(if_block1);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(main);
    			if (detaching && h1_transition) h1_transition.end();
    			if (if_block0) if_block0.d();
    			if (if_block1) if_block1.d();
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$2.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function dragOverHandler(event) {
    	event.preventDefault();
    } // alert("drag over");

    function instance$2($$self, $$props, $$invalidate) {
    	let $direction;
    	validate_store(direction, 'direction');
    	component_subscribe($$self, direction, $$value => $$invalidate(21, $direction = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Disease', slots, []);
    	set_store_value(direction, $direction = 0, $direction);
    	let showOUT = false;
    	let files;
    	let DropedFiles;
    	let plntNM_Cond;
    	let DISname;
    	let DISdesc;
    	let DISps;
    	let DISimgURL;
    	let linePos = 0;
    	let Scanning = false;
    	let dir = 0;
    	let totalPageContent = 2;
    	let pageContent = 1;
    	let Y = 0;
    	let unlockSecondPage = false;
    	let imgSRC;
    	let isdropped = false;

    	//by dropping
    	function dropHandler(event) {
    		event.preventDefault();

    		if (event.dataTransfer.items) {
    			// If dropped items aren't files, reject them
    			if (event.dataTransfer.items[0].kind === 'file') {
    				let file = event.dataTransfer.items[0].getAsFile();
    				let extn = file.name.split('.')[1];

    				//allow only jpg or png files
    				if (extn == "jpg" || extn == "png" || extn == "jfif" || extn == "v1" || extn == "JPG") {
    					$$invalidate(11, imgSRC = URL.createObjectURL(file));
    					DropedFiles = file;
    					document.getElementById('OGfileINP').value = '';
    					$$invalidate(12, isdropped = true);
    				}
    			}
    		}
    	}

    	function showScanLine() {
    		if (linePos == 0) $$invalidate(7, linePos = 100); else $$invalidate(7, linePos = 0);
    	} // if(linePos >= 100)
    	//     dir = 1;

    	// if(linePos <= 0)
    	//     dir = 0;
    	// if(dir == 0)
    	//     linePos += 2;
    	// else
    	//     linePos -= 2;
    	async function fetchPrediction() {
    		let fd = new FormData();

    		// fd.append('title', 'Sample Title');        
    		// fd.append('PLANTimage', imgUPfile);     
    		if (document.getElementById('OGfileINP').value == '') fd.append('PLANTimage', DropedFiles); else {
    			fd.append('PLANTimage', files[0]);
    			DropedFiles = null;
    		}

    		let ModelResponse = await fetch('/TriggerNeuralNet', { method: "POST", body: fd });
    		if (!ModelResponse.ok) throw new Error();
    		return await ModelResponse.json();
    	}

    	async function CheckForDisease() {
    		$$invalidate(8, Scanning = true);

    		// showScanLine();
    		var ScanThread = setInterval(showScanLine, 1600);

    		fetchPrediction().then(res => {
    			$$invalidate(3, DISname = res["Name"]);
    			$$invalidate(4, DISdesc = res["Desc"]);
    			$$invalidate(5, DISps = res["Possible Steps"]);
    			$$invalidate(6, DISimgURL = res["img"]);
    			$$invalidate(1, showOUT = true);
    			$$invalidate(2, plntNM_Cond = DISname.split(" : "));
    			$$invalidate(8, Scanning = false);
    			clearInterval(ScanThread);
    			$$invalidate(7, linePos = 0);
    			unlockSecondPage = true;
    			checkDirection();
    		}).catch(err => {
    			
    		}); // ERROR - response from server not received
    	}

    	function BTNbindclick() {
    		document.getElementById('OGfileINP').click();
    		$$invalidate(12, isdropped = true);
    	}

    	function nextContent(event) {
    		if (!unlockSecondPage) return;
    		if (Math.round(Y) == document.documentElement.scrollHeight - window.innerHeight) if (pageContent < totalPageContent) $$invalidate(9, pageContent++, pageContent);

    		// direction.update(n => 1);
    		checkDirection();
    	}

    	function prevContent() {
    		$$invalidate(9, pageContent--, pageContent);
    		if (pageContent <= 0) $$invalidate(9, pageContent = 1);

    		// direction.update(n => -1);        
    		checkDirection();
    	}

    	function handleMousemove(event) {
    		event.preventDefault();
    		if (event.deltaY > 0) nextContent(); else prevContent();
    	}

    	function checkDirection() {
    		if (totalPageContent == 1) {
    			set_store_value(direction, $direction = 0, $direction);
    			return;
    		}

    		if (pageContent < totalPageContent) set_store_value(direction, $direction = 1, $direction); else set_store_value(direction, $direction = -1, $direction);
    	}

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Disease> was created with unknown prop '${key}'`);
    	});

    	function onwindowscroll() {
    		$$invalidate(10, Y = window_1$1.pageYOffset);
    	}

    	function input_change_handler() {
    		files = this.files;
    		$$invalidate(0, files);
    	}

    	$$self.$capture_state = () => ({
    		bind,
    		slide,
    		fade,
    		scale,
    		direction,
    		showOUT,
    		files,
    		DropedFiles,
    		plntNM_Cond,
    		DISname,
    		DISdesc,
    		DISps,
    		DISimgURL,
    		linePos,
    		Scanning,
    		dir,
    		totalPageContent,
    		pageContent,
    		Y,
    		unlockSecondPage,
    		imgSRC,
    		isdropped,
    		dragOverHandler,
    		dropHandler,
    		showScanLine,
    		fetchPrediction,
    		CheckForDisease,
    		BTNbindclick,
    		nextContent,
    		prevContent,
    		handleMousemove,
    		checkDirection,
    		$direction
    	});

    	$$self.$inject_state = $$props => {
    		if ('showOUT' in $$props) $$invalidate(1, showOUT = $$props.showOUT);
    		if ('files' in $$props) $$invalidate(0, files = $$props.files);
    		if ('DropedFiles' in $$props) DropedFiles = $$props.DropedFiles;
    		if ('plntNM_Cond' in $$props) $$invalidate(2, plntNM_Cond = $$props.plntNM_Cond);
    		if ('DISname' in $$props) $$invalidate(3, DISname = $$props.DISname);
    		if ('DISdesc' in $$props) $$invalidate(4, DISdesc = $$props.DISdesc);
    		if ('DISps' in $$props) $$invalidate(5, DISps = $$props.DISps);
    		if ('DISimgURL' in $$props) $$invalidate(6, DISimgURL = $$props.DISimgURL);
    		if ('linePos' in $$props) $$invalidate(7, linePos = $$props.linePos);
    		if ('Scanning' in $$props) $$invalidate(8, Scanning = $$props.Scanning);
    		if ('dir' in $$props) dir = $$props.dir;
    		if ('totalPageContent' in $$props) totalPageContent = $$props.totalPageContent;
    		if ('pageContent' in $$props) $$invalidate(9, pageContent = $$props.pageContent);
    		if ('Y' in $$props) $$invalidate(10, Y = $$props.Y);
    		if ('unlockSecondPage' in $$props) unlockSecondPage = $$props.unlockSecondPage;
    		if ('imgSRC' in $$props) $$invalidate(11, imgSRC = $$props.imgSRC);
    		if ('isdropped' in $$props) $$invalidate(12, isdropped = $$props.isdropped);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*files*/ 1) {
    			//by selection
    			{
    				if (files && files[0]) {
    					$$invalidate(11, imgSRC = URL.createObjectURL(files[0]));
    				}
    			}
    		}
    	};

    	return [
    		files,
    		showOUT,
    		plntNM_Cond,
    		DISname,
    		DISdesc,
    		DISps,
    		DISimgURL,
    		linePos,
    		Scanning,
    		pageContent,
    		Y,
    		imgSRC,
    		isdropped,
    		dropHandler,
    		CheckForDisease,
    		BTNbindclick,
    		handleMousemove,
    		onwindowscroll,
    		input_change_handler
    	];
    }

    class Disease extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$2, create_fragment$2, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Disease",
    			options,
    			id: create_fragment$2.name
    		});
    	}
    }

    /* src\Pages\CropYield.svelte generated by Svelte v3.40.1 */

    const { Error: Error_1, document: document_1, window: window_1 } = globals;
    const file$1 = "src\\Pages\\CropYield.svelte";

    // (153:4) {#if SelSubPage == 0}
    function create_if_block_20(ctx) {
    	let select;
    	let option0;
    	let option1;
    	let option2;
    	let option3;
    	let option4;
    	let option5;
    	let option6;
    	let option7;
    	let option8;
    	let option9;
    	let option10;
    	let select_transition;
    	let t11;
    	let input;
    	let input_transition;
    	let t12;
    	let button;
    	let button_transition;
    	let t14;
    	let br;
    	let t15;
    	let if_block_anchor;
    	let current;
    	let mounted;
    	let dispose;
    	let if_block = /*showYield*/ ctx[13] == true && create_if_block_21(ctx);

    	const block = {
    		c: function create() {
    			select = element("select");
    			option0 = element("option");
    			option0.textContent = "Choose Crop    ";
    			option1 = element("option");
    			option1.textContent = "Paddy";
    			option2 = element("option");
    			option2.textContent = "Jowar";
    			option3 = element("option");
    			option3.textContent = "Bajara";
    			option4 = element("option");
    			option4.textContent = "Maize";
    			option5 = element("option");
    			option5.textContent = "Cotton";
    			option6 = element("option");
    			option6.textContent = "Groundnut";
    			option7 = element("option");
    			option7.textContent = "Soybeans";
    			option8 = element("option");
    			option8.textContent = "Wheat";
    			option9 = element("option");
    			option9.textContent = "Barley";
    			option10 = element("option");
    			option10.textContent = "Gram";
    			t11 = space();
    			input = element("input");
    			t12 = space();
    			button = element("button");
    			button.textContent = "Get Yield";
    			t14 = space();
    			br = element("br");
    			t15 = space();
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    			option0.__value = "    Choose Crop    ";
    			option0.value = option0.__value;
    			add_location(option0, file$1, 154, 8, 4861);
    			option1.__value = "Paddy";
    			option1.value = option1.__value;
    			add_location(option1, file$1, 155, 8, 4909);
    			option2.__value = "Jowar";
    			option2.value = option2.__value;
    			add_location(option2, file$1, 156, 8, 4943);
    			option3.__value = "Bajara";
    			option3.value = option3.__value;
    			add_location(option3, file$1, 157, 8, 4977);
    			option4.__value = "Maize";
    			option4.value = option4.__value;
    			add_location(option4, file$1, 158, 8, 5012);
    			option5.__value = "Cotton";
    			option5.value = option5.__value;
    			add_location(option5, file$1, 159, 8, 5046);
    			option6.__value = "Groundnut";
    			option6.value = option6.__value;
    			add_location(option6, file$1, 160, 8, 5081);
    			option7.__value = "Soybeans";
    			option7.value = option7.__value;
    			add_location(option7, file$1, 161, 8, 5119);
    			option8.__value = "Wheat";
    			option8.value = option8.__value;
    			add_location(option8, file$1, 162, 8, 5156);
    			option9.__value = "Barley";
    			option9.value = option9.__value;
    			add_location(option9, file$1, 163, 8, 5190);
    			option10.__value = "Gram";
    			option10.value = option10.__value;
    			add_location(option10, file$1, 164, 8, 5225);
    			attr_dev(select, "id", "myList");
    			attr_dev(select, "class", "svelte-jor2d9");
    			if (/*SelCrop*/ ctx[11] === void 0) add_render_callback(() => /*select_change_handler*/ ctx[29].call(select));
    			add_location(select, file$1, 153, 4, 4748);
    			attr_dev(input, "type", "number");
    			set_style(input, "width", "220px");
    			attr_dev(input, "placeholder", "Enter Quantity (in Quintal)");
    			attr_dev(input, "class", "svelte-jor2d9");
    			add_location(input, file$1, 167, 8, 5281);
    			set_style(button, "margin-left", "5px");
    			attr_dev(button, "id", "clk");
    			attr_dev(button, "class", "svelte-jor2d9");
    			add_location(button, file$1, 168, 8, 5451);
    			add_location(br, file$1, 169, 8, 5601);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, select, anchor);
    			append_dev(select, option0);
    			append_dev(select, option1);
    			append_dev(select, option2);
    			append_dev(select, option3);
    			append_dev(select, option4);
    			append_dev(select, option5);
    			append_dev(select, option6);
    			append_dev(select, option7);
    			append_dev(select, option8);
    			append_dev(select, option9);
    			append_dev(select, option10);
    			select_option(select, /*SelCrop*/ ctx[11]);
    			insert_dev(target, t11, anchor);
    			insert_dev(target, input, anchor);
    			set_input_value(input, /*quant*/ ctx[12]);
    			insert_dev(target, t12, anchor);
    			insert_dev(target, button, anchor);
    			insert_dev(target, t14, anchor);
    			insert_dev(target, br, anchor);
    			insert_dev(target, t15, anchor);
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    			current = true;

    			if (!mounted) {
    				dispose = [
    					listen_dev(select, "change", /*select_change_handler*/ ctx[29]),
    					listen_dev(input, "input", /*input_input_handler*/ ctx[30]),
    					listen_dev(button, "click", /*FindYield*/ ctx[19], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*SelCrop*/ 2048) {
    				select_option(select, /*SelCrop*/ ctx[11]);
    			}

    			if (dirty[0] & /*quant*/ 4096 && to_number(input.value) !== /*quant*/ ctx[12]) {
    				set_input_value(input, /*quant*/ ctx[12]);
    			}

    			if (/*showYield*/ ctx[13] == true) {
    				if (if_block) {
    					if_block.p(ctx, dirty);

    					if (dirty[0] & /*showYield*/ 8192) {
    						transition_in(if_block, 1);
    					}
    				} else {
    					if_block = create_if_block_21(ctx);
    					if_block.c();
    					transition_in(if_block, 1);
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			} else if (if_block) {
    				group_outros();

    				transition_out(if_block, 1, 1, () => {
    					if_block = null;
    				});

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;

    			add_render_callback(() => {
    				if (!select_transition) select_transition = create_bidirectional_transition(select, scale, { delay: 200, duration: 400, start: 0 }, true);
    				select_transition.run(1);
    			});

    			add_render_callback(() => {
    				if (!input_transition) input_transition = create_bidirectional_transition(input, scale, { delay: 200, duration: 400, start: 0 }, true);
    				input_transition.run(1);
    			});

    			add_render_callback(() => {
    				if (!button_transition) button_transition = create_bidirectional_transition(button, scale, { delay: 200, duration: 400, start: 0 }, true);
    				button_transition.run(1);
    			});

    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			if (!select_transition) select_transition = create_bidirectional_transition(select, scale, { delay: 200, duration: 400, start: 0 }, false);
    			select_transition.run(0);
    			if (!input_transition) input_transition = create_bidirectional_transition(input, scale, { delay: 200, duration: 400, start: 0 }, false);
    			input_transition.run(0);
    			if (!button_transition) button_transition = create_bidirectional_transition(button, scale, { delay: 200, duration: 400, start: 0 }, false);
    			button_transition.run(0);
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(select);
    			if (detaching && select_transition) select_transition.end();
    			if (detaching) detach_dev(t11);
    			if (detaching) detach_dev(input);
    			if (detaching && input_transition) input_transition.end();
    			if (detaching) detach_dev(t12);
    			if (detaching) detach_dev(button);
    			if (detaching && button_transition) button_transition.end();
    			if (detaching) detach_dev(t14);
    			if (detaching) detach_dev(br);
    			if (detaching) detach_dev(t15);
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_20.name,
    		type: "if",
    		source: "(153:4) {#if SelSubPage == 0}",
    		ctx
    	});

    	return block;
    }

    // (171:8) {#if showYield == true}
    function create_if_block_21(ctx) {
    	let div0;
    	let t0;
    	let t1;
    	let div0_transition;
    	let t2;
    	let br0;
    	let t3;
    	let div1;
    	let t4;
    	let t5;
    	let t6;
    	let div1_transition;
    	let t7;
    	let br1;
    	let t8;
    	let div2;
    	let t9;
    	let t10;
    	let t11;
    	let div2_transition;
    	let current;

    	const block = {
    		c: function create() {
    			div0 = element("div");
    			t0 = text("Approximate price of entire harvest: ₹ ");
    			t1 = text(/*xPR*/ ctx[14]);
    			t2 = space();
    			br0 = element("br");
    			t3 = space();
    			div1 = element("div");
    			t4 = text("Total Quantity of water needed: ");
    			t5 = text(/*xWT*/ ctx[15]);
    			t6 = text(" (mm/growth period)");
    			t7 = space();
    			br1 = element("br");
    			t8 = space();
    			div2 = element("div");
    			t9 = text("Approximate Growing period: ");
    			t10 = text(/*xGP*/ ctx[16]);
    			t11 = text(" days");
    			attr_dev(div0, "class", "ViewBox svelte-jor2d9");
    			add_location(div0, file$1, 171, 12, 5652);
    			add_location(br0, file$1, 174, 12, 5786);
    			attr_dev(div1, "class", "ViewBox svelte-jor2d9");
    			add_location(div1, file$1, 175, 12, 5804);
    			add_location(br1, file$1, 178, 12, 5950);
    			attr_dev(div2, "class", "ViewBox svelte-jor2d9");
    			add_location(div2, file$1, 179, 12, 5968);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div0, anchor);
    			append_dev(div0, t0);
    			append_dev(div0, t1);
    			insert_dev(target, t2, anchor);
    			insert_dev(target, br0, anchor);
    			insert_dev(target, t3, anchor);
    			insert_dev(target, div1, anchor);
    			append_dev(div1, t4);
    			append_dev(div1, t5);
    			append_dev(div1, t6);
    			insert_dev(target, t7, anchor);
    			insert_dev(target, br1, anchor);
    			insert_dev(target, t8, anchor);
    			insert_dev(target, div2, anchor);
    			append_dev(div2, t9);
    			append_dev(div2, t10);
    			append_dev(div2, t11);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (!current || dirty[0] & /*xPR*/ 16384) set_data_dev(t1, /*xPR*/ ctx[14]);
    			if (!current || dirty[0] & /*xWT*/ 32768) set_data_dev(t5, /*xWT*/ ctx[15]);
    			if (!current || dirty[0] & /*xGP*/ 65536) set_data_dev(t10, /*xGP*/ ctx[16]);
    		},
    		i: function intro(local) {
    			if (current) return;

    			add_render_callback(() => {
    				if (!div0_transition) div0_transition = create_bidirectional_transition(div0, slide, {}, true);
    				div0_transition.run(1);
    			});

    			add_render_callback(() => {
    				if (!div1_transition) div1_transition = create_bidirectional_transition(div1, slide, {}, true);
    				div1_transition.run(1);
    			});

    			add_render_callback(() => {
    				if (!div2_transition) div2_transition = create_bidirectional_transition(div2, slide, {}, true);
    				div2_transition.run(1);
    			});

    			current = true;
    		},
    		o: function outro(local) {
    			if (!div0_transition) div0_transition = create_bidirectional_transition(div0, slide, {}, false);
    			div0_transition.run(0);
    			if (!div1_transition) div1_transition = create_bidirectional_transition(div1, slide, {}, false);
    			div1_transition.run(0);
    			if (!div2_transition) div2_transition = create_bidirectional_transition(div2, slide, {}, false);
    			div2_transition.run(0);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div0);
    			if (detaching && div0_transition) div0_transition.end();
    			if (detaching) detach_dev(t2);
    			if (detaching) detach_dev(br0);
    			if (detaching) detach_dev(t3);
    			if (detaching) detach_dev(div1);
    			if (detaching && div1_transition) div1_transition.end();
    			if (detaching) detach_dev(t7);
    			if (detaching) detach_dev(br1);
    			if (detaching) detach_dev(t8);
    			if (detaching) detach_dev(div2);
    			if (detaching && div2_transition) div2_transition.end();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_21.name,
    		type: "if",
    		source: "(171:8) {#if showYield == true}",
    		ctx
    	});

    	return block;
    }

    // (186:4) {#if SelSubPage == 1}
    function create_if_block_19(ctx) {
    	let div0;
    	let t0;
    	let br0;
    	let br1;
    	let t1;
    	let div0_transition;
    	let t2;
    	let div1;
    	let t3;
    	let ul0;
    	let li0;
    	let t5;
    	let li1;
    	let t7;
    	let li2;
    	let t9;
    	let li3;
    	let t11;
    	let li4;
    	let t13;
    	let li5;
    	let t15;
    	let li6;
    	let t17;
    	let li7;
    	let t19;
    	let li8;
    	let t21;
    	let li9;
    	let div1_transition;
    	let t23;
    	let div2;
    	let div2_transition;
    	let t25;
    	let div3;
    	let t26;
    	let ul1;
    	let li10;
    	let t28;
    	let li11;
    	let t30;
    	let li12;
    	let t32;
    	let li13;
    	let t34;
    	let li14;
    	let div3_transition;
    	let current;

    	const block = {
    		c: function create() {
    			div0 = element("div");
    			t0 = text("The science of training machines to learn and produce models for future predictions is widely used, and not for nothing. Agriculture plays a critical role in the global economy. With the continuing expansion of the human population, understanding worldwide crop yield is central to addressing food security challenges and reducing the impacts of climate change. \r\n            ");
    			br0 = element("br");
    			br1 = element("br");
    			t1 = text("\r\n            Crop yield prediction is an important agricultural problem. Agricultural yield primarily depends on weather conditions (rain, temperature, etc), pesticides and accurate information about the history of crop yield is an important thing for making decisions related to agricultural risk management and future predictions.");
    			t2 = space();
    			div1 = element("div");
    			t3 = text("In this project the prediction of top 10 most consumed yields all over the world is established by applying machine learning techniques. These corps include: \r\n            ");
    			ul0 = element("ul");
    			li0 = element("li");
    			li0.textContent = "Cassava";
    			t5 = space();
    			li1 = element("li");
    			li1.textContent = "Maize";
    			t7 = space();
    			li2 = element("li");
    			li2.textContent = "Plantains and others";
    			t9 = space();
    			li3 = element("li");
    			li3.textContent = "Potatoes";
    			t11 = space();
    			li4 = element("li");
    			li4.textContent = "Rice, paddy";
    			t13 = space();
    			li5 = element("li");
    			li5.textContent = "Sorghum";
    			t15 = space();
    			li6 = element("li");
    			li6.textContent = "Soybeans";
    			t17 = space();
    			li7 = element("li");
    			li7.textContent = "Sweet potatoes";
    			t19 = space();
    			li8 = element("li");
    			li8.textContent = "Wheat";
    			t21 = space();
    			li9 = element("li");
    			li9.textContent = "Yams";
    			t23 = space();
    			div2 = element("div");
    			div2.textContent = "In the project, machine learning methods are applied to predict crop yield using publicly available data from FAO and World Data Bank. The application of four regression algorithms and comparison of which will render the best results to achieve most accurate yield crops predictions.";
    			t25 = space();
    			div3 = element("div");
    			t26 = text("Regression models used for this project:\r\n            ");
    			ul1 = element("ul");
    			li10 = element("li");
    			li10.textContent = "Gradient Boosting Regressor";
    			t28 = space();
    			li11 = element("li");
    			li11.textContent = "Random Forest Regressor";
    			t30 = space();
    			li12 = element("li");
    			li12.textContent = "SVM";
    			t32 = space();
    			li13 = element("li");
    			li13.textContent = "Decision Tree Regressor";
    			t34 = space();
    			li14 = element("li");
    			li14.textContent = "K Nearest Neighbours";
    			add_location(br0, file$1, 188, 12, 6595);
    			add_location(br1, file$1, 188, 16, 6599);
    			attr_dev(div0, "class", "ViewBox svelte-jor2d9");
    			set_style(div0, "width", "500px");
    			add_location(div0, file$1, 186, 8, 6147);
    			add_location(li0, file$1, 194, 16, 7228);
    			add_location(li1, file$1, 195, 16, 7262);
    			add_location(li2, file$1, 196, 16, 7294);
    			add_location(li3, file$1, 197, 16, 7342);
    			add_location(li4, file$1, 198, 16, 7377);
    			add_location(li5, file$1, 199, 16, 7415);
    			add_location(li6, file$1, 200, 16, 7449);
    			add_location(li7, file$1, 201, 16, 7484);
    			add_location(li8, file$1, 202, 16, 7525);
    			add_location(li9, file$1, 203, 16, 7557);
    			add_location(ul0, file$1, 193, 12, 7206);
    			attr_dev(div1, "class", "ViewBox svelte-jor2d9");
    			set_style(div1, "width", "300px");
    			add_location(div1, file$1, 191, 8, 6962);
    			attr_dev(div2, "class", "ViewBox svelte-jor2d9");
    			set_style(div2, "width", "600px");
    			add_location(div2, file$1, 207, 8, 7617);
    			add_location(li10, file$1, 214, 16, 8147);
    			add_location(li11, file$1, 215, 16, 8201);
    			add_location(li12, file$1, 216, 16, 8251);
    			add_location(li13, file$1, 217, 16, 8281);
    			add_location(li14, file$1, 218, 16, 8331);
    			add_location(ul1, file$1, 213, 12, 8125);
    			attr_dev(div3, "class", "ViewBox svelte-jor2d9");
    			set_style(div3, "width", "300px");
    			add_location(div3, file$1, 211, 8, 7999);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div0, anchor);
    			append_dev(div0, t0);
    			append_dev(div0, br0);
    			append_dev(div0, br1);
    			append_dev(div0, t1);
    			insert_dev(target, t2, anchor);
    			insert_dev(target, div1, anchor);
    			append_dev(div1, t3);
    			append_dev(div1, ul0);
    			append_dev(ul0, li0);
    			append_dev(ul0, t5);
    			append_dev(ul0, li1);
    			append_dev(ul0, t7);
    			append_dev(ul0, li2);
    			append_dev(ul0, t9);
    			append_dev(ul0, li3);
    			append_dev(ul0, t11);
    			append_dev(ul0, li4);
    			append_dev(ul0, t13);
    			append_dev(ul0, li5);
    			append_dev(ul0, t15);
    			append_dev(ul0, li6);
    			append_dev(ul0, t17);
    			append_dev(ul0, li7);
    			append_dev(ul0, t19);
    			append_dev(ul0, li8);
    			append_dev(ul0, t21);
    			append_dev(ul0, li9);
    			insert_dev(target, t23, anchor);
    			insert_dev(target, div2, anchor);
    			insert_dev(target, t25, anchor);
    			insert_dev(target, div3, anchor);
    			append_dev(div3, t26);
    			append_dev(div3, ul1);
    			append_dev(ul1, li10);
    			append_dev(ul1, t28);
    			append_dev(ul1, li11);
    			append_dev(ul1, t30);
    			append_dev(ul1, li12);
    			append_dev(ul1, t32);
    			append_dev(ul1, li13);
    			append_dev(ul1, t34);
    			append_dev(ul1, li14);
    			current = true;
    		},
    		i: function intro(local) {
    			if (current) return;

    			add_render_callback(() => {
    				if (!div0_transition) div0_transition = create_bidirectional_transition(div0, slide, {}, true);
    				div0_transition.run(1);
    			});

    			add_render_callback(() => {
    				if (!div1_transition) div1_transition = create_bidirectional_transition(div1, slide, {}, true);
    				div1_transition.run(1);
    			});

    			add_render_callback(() => {
    				if (!div2_transition) div2_transition = create_bidirectional_transition(div2, slide, {}, true);
    				div2_transition.run(1);
    			});

    			add_render_callback(() => {
    				if (!div3_transition) div3_transition = create_bidirectional_transition(div3, slide, {}, true);
    				div3_transition.run(1);
    			});

    			current = true;
    		},
    		o: function outro(local) {
    			if (!div0_transition) div0_transition = create_bidirectional_transition(div0, slide, {}, false);
    			div0_transition.run(0);
    			if (!div1_transition) div1_transition = create_bidirectional_transition(div1, slide, {}, false);
    			div1_transition.run(0);
    			if (!div2_transition) div2_transition = create_bidirectional_transition(div2, slide, {}, false);
    			div2_transition.run(0);
    			if (!div3_transition) div3_transition = create_bidirectional_transition(div3, slide, {}, false);
    			div3_transition.run(0);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div0);
    			if (detaching && div0_transition) div0_transition.end();
    			if (detaching) detach_dev(t2);
    			if (detaching) detach_dev(div1);
    			if (detaching && div1_transition) div1_transition.end();
    			if (detaching) detach_dev(t23);
    			if (detaching) detach_dev(div2);
    			if (detaching && div2_transition) div2_transition.end();
    			if (detaching) detach_dev(t25);
    			if (detaching) detach_dev(div3);
    			if (detaching && div3_transition) div3_transition.end();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_19.name,
    		type: "if",
    		source: "(186:4) {#if SelSubPage == 1}",
    		ctx
    	});

    	return block;
    }

    // (224:4) {#if SelSubPage == 2}
    function create_if_block_15(ctx) {
    	let t0;
    	let t1;
    	let if_block2_anchor;
    	let current;
    	let if_block0 = /*pageContent*/ ctx[9] == 1 && create_if_block_18(ctx);
    	let if_block1 = /*pageContent*/ ctx[9] == 2 && create_if_block_17(ctx);
    	let if_block2 = /*pageContent*/ ctx[9] == 3 && create_if_block_16(ctx);

    	const block = {
    		c: function create() {
    			if (if_block0) if_block0.c();
    			t0 = space();
    			if (if_block1) if_block1.c();
    			t1 = space();
    			if (if_block2) if_block2.c();
    			if_block2_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if (if_block0) if_block0.m(target, anchor);
    			insert_dev(target, t0, anchor);
    			if (if_block1) if_block1.m(target, anchor);
    			insert_dev(target, t1, anchor);
    			if (if_block2) if_block2.m(target, anchor);
    			insert_dev(target, if_block2_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (/*pageContent*/ ctx[9] == 1) {
    				if (if_block0) {
    					if (dirty[0] & /*pageContent*/ 512) {
    						transition_in(if_block0, 1);
    					}
    				} else {
    					if_block0 = create_if_block_18(ctx);
    					if_block0.c();
    					transition_in(if_block0, 1);
    					if_block0.m(t0.parentNode, t0);
    				}
    			} else if (if_block0) {
    				group_outros();

    				transition_out(if_block0, 1, 1, () => {
    					if_block0 = null;
    				});

    				check_outros();
    			}

    			if (/*pageContent*/ ctx[9] == 2) {
    				if (if_block1) {
    					if (dirty[0] & /*pageContent*/ 512) {
    						transition_in(if_block1, 1);
    					}
    				} else {
    					if_block1 = create_if_block_17(ctx);
    					if_block1.c();
    					transition_in(if_block1, 1);
    					if_block1.m(t1.parentNode, t1);
    				}
    			} else if (if_block1) {
    				group_outros();

    				transition_out(if_block1, 1, 1, () => {
    					if_block1 = null;
    				});

    				check_outros();
    			}

    			if (/*pageContent*/ ctx[9] == 3) {
    				if (if_block2) {
    					if (dirty[0] & /*pageContent*/ 512) {
    						transition_in(if_block2, 1);
    					}
    				} else {
    					if_block2 = create_if_block_16(ctx);
    					if_block2.c();
    					transition_in(if_block2, 1);
    					if_block2.m(if_block2_anchor.parentNode, if_block2_anchor);
    				}
    			} else if (if_block2) {
    				group_outros();

    				transition_out(if_block2, 1, 1, () => {
    					if_block2 = null;
    				});

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block0);
    			transition_in(if_block1);
    			transition_in(if_block2);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block0);
    			transition_out(if_block1);
    			transition_out(if_block2);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (if_block0) if_block0.d(detaching);
    			if (detaching) detach_dev(t0);
    			if (if_block1) if_block1.d(detaching);
    			if (detaching) detach_dev(t1);
    			if (if_block2) if_block2.d(detaching);
    			if (detaching) detach_dev(if_block2_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_15.name,
    		type: "if",
    		source: "(224:4) {#if SelSubPage == 2}",
    		ctx
    	});

    	return block;
    }

    // (225:8) {#if pageContent == 1}
    function create_if_block_18(ctx) {
    	let div0;
    	let b;
    	let t1;
    	let br;
    	let t2;
    	let div0_transition;
    	let t3;
    	let div1;
    	let img0;
    	let img0_src_value;
    	let div1_transition;
    	let t4;
    	let div2;
    	let div2_transition;
    	let t6;
    	let div3;
    	let img1;
    	let img1_src_value;
    	let div3_transition;
    	let t7;
    	let div4;
    	let div4_transition;
    	let current;

    	const block = {
    		c: function create() {
    			div0 = element("div");
    			b = element("b");
    			b.textContent = "Gathering & Cleaning Data";
    			t1 = space();
    			br = element("br");
    			t2 = text("\r\n                Data collection is the process of gathering and measuring information on variables of interest. FAOSTAT provides access to over 3 million time-series and cross sectional data relating to food and agriculture. The FAO data can be found in csv files. FAOSTAT contains data for 200 countries and more than 200 primary products and inputs in its core data set. It offers national and international statistics on food and agriculture. The first thing to get is the crops yield for each country.");
    			t3 = space();
    			div1 = element("div");
    			img0 = element("img");
    			t4 = space();
    			div2 = element("div");
    			div2.textContent = "Now the data looks clean and organized, but dropping some of the columns such as Area Code, Domain, Item Code, etc, won't be of any use to the analysis. Also, renaming Value to hg/ha_yield to make it easier to recognise that this is our crop yields production value. The end result is a four columns dataframe that contains: country, item, year and crops yield corresponds to them.";
    			t6 = space();
    			div3 = element("div");
    			img1 = element("img");
    			t7 = space();
    			div4 = element("div");
    			div4.textContent = "Using describe() function, few things come clear about the dataframe, where it starts at 1961 and ends at 2016, this is all the available data up to date from FAO.";
    			add_location(b, file$1, 226, 16, 8537);
    			add_location(br, file$1, 227, 16, 8587);
    			attr_dev(div0, "class", "ViewBox svelte-jor2d9");
    			add_location(div0, file$1, 225, 12, 8481);
    			if (!src_url_equal(img0.src, img0_src_value = "additional_assets/1.jpg")) attr_dev(img0, "src", img0_src_value);
    			attr_dev(img0, "alt", "");
    			attr_dev(img0, "class", "svelte-jor2d9");
    			add_location(img0, file$1, 231, 16, 9208);
    			attr_dev(div1, "class", "ViewBox svelte-jor2d9");
    			set_style(div1, "width", "600px");
    			add_location(div1, file$1, 230, 12, 9132);
    			attr_dev(div2, "class", "ViewBox svelte-jor2d9");
    			set_style(div2, "width", "200px");
    			add_location(div2, file$1, 233, 12, 9292);
    			if (!src_url_equal(img1.src, img1_src_value = "additional_assets/2.jpg")) attr_dev(img1, "src", img1_src_value);
    			attr_dev(img1, "alt", "");
    			attr_dev(img1, "class", "svelte-jor2d9");
    			add_location(img1, file$1, 237, 16, 9861);
    			attr_dev(div3, "class", "ViewBox svelte-jor2d9");
    			set_style(div3, "width", "350px");
    			add_location(div3, file$1, 236, 12, 9785);
    			attr_dev(div4, "class", "ViewBox svelte-jor2d9");
    			add_location(div4, file$1, 239, 12, 9945);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div0, anchor);
    			append_dev(div0, b);
    			append_dev(div0, t1);
    			append_dev(div0, br);
    			append_dev(div0, t2);
    			insert_dev(target, t3, anchor);
    			insert_dev(target, div1, anchor);
    			append_dev(div1, img0);
    			insert_dev(target, t4, anchor);
    			insert_dev(target, div2, anchor);
    			insert_dev(target, t6, anchor);
    			insert_dev(target, div3, anchor);
    			append_dev(div3, img1);
    			insert_dev(target, t7, anchor);
    			insert_dev(target, div4, anchor);
    			current = true;
    		},
    		i: function intro(local) {
    			if (current) return;

    			add_render_callback(() => {
    				if (!div0_transition) div0_transition = create_bidirectional_transition(div0, slide, {}, true);
    				div0_transition.run(1);
    			});

    			add_render_callback(() => {
    				if (!div1_transition) div1_transition = create_bidirectional_transition(div1, slide, {}, true);
    				div1_transition.run(1);
    			});

    			add_render_callback(() => {
    				if (!div2_transition) div2_transition = create_bidirectional_transition(div2, slide, {}, true);
    				div2_transition.run(1);
    			});

    			add_render_callback(() => {
    				if (!div3_transition) div3_transition = create_bidirectional_transition(div3, slide, {}, true);
    				div3_transition.run(1);
    			});

    			add_render_callback(() => {
    				if (!div4_transition) div4_transition = create_bidirectional_transition(div4, slide, {}, true);
    				div4_transition.run(1);
    			});

    			current = true;
    		},
    		o: function outro(local) {
    			if (!div0_transition) div0_transition = create_bidirectional_transition(div0, slide, {}, false);
    			div0_transition.run(0);
    			if (!div1_transition) div1_transition = create_bidirectional_transition(div1, slide, {}, false);
    			div1_transition.run(0);
    			if (!div2_transition) div2_transition = create_bidirectional_transition(div2, slide, {}, false);
    			div2_transition.run(0);
    			if (!div3_transition) div3_transition = create_bidirectional_transition(div3, slide, {}, false);
    			div3_transition.run(0);
    			if (!div4_transition) div4_transition = create_bidirectional_transition(div4, slide, {}, false);
    			div4_transition.run(0);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div0);
    			if (detaching && div0_transition) div0_transition.end();
    			if (detaching) detach_dev(t3);
    			if (detaching) detach_dev(div1);
    			if (detaching && div1_transition) div1_transition.end();
    			if (detaching) detach_dev(t4);
    			if (detaching) detach_dev(div2);
    			if (detaching && div2_transition) div2_transition.end();
    			if (detaching) detach_dev(t6);
    			if (detaching) detach_dev(div3);
    			if (detaching && div3_transition) div3_transition.end();
    			if (detaching) detach_dev(t7);
    			if (detaching) detach_dev(div4);
    			if (detaching && div4_transition) div4_transition.end();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_18.name,
    		type: "if",
    		source: "(225:8) {#if pageContent == 1}",
    		ctx
    	});

    	return block;
    }

    // (244:8) {#if pageContent == 2}
    function create_if_block_17(ctx) {
    	let div0;
    	let t0;
    	let br0;
    	let br1;
    	let t1;
    	let div0_transition;
    	let t2;
    	let div1;
    	let img;
    	let img_src_value;
    	let div1_transition;
    	let t3;
    	let div2;
    	let div2_transition;
    	let current;

    	const block = {
    		c: function create() {
    			div0 = element("div");
    			t0 = text("Climatic factors include humidity, sunlight and factors involving the climate. Environmental factors refer to soil conditions. In this model two climate and one environmental factors are selected, rain and temperature and pesticides that influence plant growth and development.\r\n                    ");
    			br0 = element("br");
    			br1 = element("br");
    			t1 = text("\r\n                Rain has a dramatic effect on agriculture. For this project rainfall per year information was gathered from the World Data Bank in addition to average temperature for each country.");
    			t2 = space();
    			div1 = element("div");
    			img = element("img");
    			t3 = space();
    			div2 = element("div");
    			div2.textContent = "The final dataframe for average rainfall includes; country, year and average rainfall per year. The dataframe starts from 1985 to 2017, on the other hand, the average temperature data frame includes country, year and average recorded temperature. The temperature dataframe starts at 1743 and ends at 2013.";
    			add_location(br0, file$1, 246, 20, 10602);
    			add_location(br1, file$1, 246, 24, 10606);
    			attr_dev(div0, "class", "ViewBox svelte-jor2d9");
    			add_location(div0, file$1, 244, 12, 10247);
    			if (!src_url_equal(img.src, img_src_value = "additional_assets/3.jpg")) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", "");
    			attr_dev(img, "class", "svelte-jor2d9");
    			add_location(img, file$1, 250, 16, 10917);
    			attr_dev(div1, "class", "ViewBox svelte-jor2d9");
    			attr_dev(div1, "style", "width450px");
    			add_location(div1, file$1, 249, 12, 10842);
    			attr_dev(div2, "class", "ViewBox svelte-jor2d9");
    			set_style(div2, "width", "300px");
    			add_location(div2, file$1, 252, 12, 11001);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div0, anchor);
    			append_dev(div0, t0);
    			append_dev(div0, br0);
    			append_dev(div0, br1);
    			append_dev(div0, t1);
    			insert_dev(target, t2, anchor);
    			insert_dev(target, div1, anchor);
    			append_dev(div1, img);
    			insert_dev(target, t3, anchor);
    			insert_dev(target, div2, anchor);
    			current = true;
    		},
    		i: function intro(local) {
    			if (current) return;

    			add_render_callback(() => {
    				if (!div0_transition) div0_transition = create_bidirectional_transition(div0, slide, {}, true);
    				div0_transition.run(1);
    			});

    			add_render_callback(() => {
    				if (!div1_transition) div1_transition = create_bidirectional_transition(div1, slide, {}, true);
    				div1_transition.run(1);
    			});

    			add_render_callback(() => {
    				if (!div2_transition) div2_transition = create_bidirectional_transition(div2, slide, {}, true);
    				div2_transition.run(1);
    			});

    			current = true;
    		},
    		o: function outro(local) {
    			if (!div0_transition) div0_transition = create_bidirectional_transition(div0, slide, {}, false);
    			div0_transition.run(0);
    			if (!div1_transition) div1_transition = create_bidirectional_transition(div1, slide, {}, false);
    			div1_transition.run(0);
    			if (!div2_transition) div2_transition = create_bidirectional_transition(div2, slide, {}, false);
    			div2_transition.run(0);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div0);
    			if (detaching && div0_transition) div0_transition.end();
    			if (detaching) detach_dev(t2);
    			if (detaching) detach_dev(div1);
    			if (detaching && div1_transition) div1_transition.end();
    			if (detaching) detach_dev(t3);
    			if (detaching) detach_dev(div2);
    			if (detaching && div2_transition) div2_transition.end();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_17.name,
    		type: "if",
    		source: "(244:8) {#if pageContent == 2}",
    		ctx
    	});

    	return block;
    }

    // (258:8) {#if pageContent == 3}
    function create_if_block_16(ctx) {
    	let div0;
    	let div0_transition;
    	let t1;
    	let div1;
    	let img;
    	let img_src_value;
    	let div1_transition;
    	let current;

    	const block = {
    		c: function create() {
    			div0 = element("div");
    			div0.textContent = "Data for pesticides was collected from FAO, it’s noted that it starts in 1990 and ends in 2016. Merging these data frames together, it's expected that the year range will start from 1990 and end in 2013, that is 23 years worth of data.";
    			t1 = space();
    			div1 = element("div");
    			img = element("img");
    			attr_dev(div0, "class", "ViewBox svelte-jor2d9");
    			set_style(div0, "width", "500px");
    			add_location(div0, file$1, 258, 12, 11467);
    			if (!src_url_equal(img.src, img_src_value = "additional_assets/4.jpg")) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", "");
    			attr_dev(img, "class", "svelte-jor2d9");
    			add_location(img, file$1, 262, 16, 11889);
    			attr_dev(div1, "class", "ViewBox svelte-jor2d9");
    			attr_dev(div1, "style", "width450px");
    			add_location(div1, file$1, 261, 12, 11814);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div0, anchor);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, div1, anchor);
    			append_dev(div1, img);
    			current = true;
    		},
    		i: function intro(local) {
    			if (current) return;

    			add_render_callback(() => {
    				if (!div0_transition) div0_transition = create_bidirectional_transition(div0, slide, {}, true);
    				div0_transition.run(1);
    			});

    			add_render_callback(() => {
    				if (!div1_transition) div1_transition = create_bidirectional_transition(div1, slide, {}, true);
    				div1_transition.run(1);
    			});

    			current = true;
    		},
    		o: function outro(local) {
    			if (!div0_transition) div0_transition = create_bidirectional_transition(div0, slide, {}, false);
    			div0_transition.run(0);
    			if (!div1_transition) div1_transition = create_bidirectional_transition(div1, slide, {}, false);
    			div1_transition.run(0);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div0);
    			if (detaching && div0_transition) div0_transition.end();
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(div1);
    			if (detaching && div1_transition) div1_transition.end();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_16.name,
    		type: "if",
    		source: "(258:8) {#if pageContent == 3}",
    		ctx
    	});

    	return block;
    }

    // (268:4) {#if SelSubPage == 3}
    function create_if_block_12(ctx) {
    	let t;
    	let if_block1_anchor;
    	let current;
    	let if_block0 = /*pageContent*/ ctx[9] == 1 && create_if_block_14(ctx);
    	let if_block1 = /*pageContent*/ ctx[9] == 2 && create_if_block_13(ctx);

    	const block = {
    		c: function create() {
    			if (if_block0) if_block0.c();
    			t = space();
    			if (if_block1) if_block1.c();
    			if_block1_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if (if_block0) if_block0.m(target, anchor);
    			insert_dev(target, t, anchor);
    			if (if_block1) if_block1.m(target, anchor);
    			insert_dev(target, if_block1_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (/*pageContent*/ ctx[9] == 1) {
    				if (if_block0) {
    					if (dirty[0] & /*pageContent*/ 512) {
    						transition_in(if_block0, 1);
    					}
    				} else {
    					if_block0 = create_if_block_14(ctx);
    					if_block0.c();
    					transition_in(if_block0, 1);
    					if_block0.m(t.parentNode, t);
    				}
    			} else if (if_block0) {
    				group_outros();

    				transition_out(if_block0, 1, 1, () => {
    					if_block0 = null;
    				});

    				check_outros();
    			}

    			if (/*pageContent*/ ctx[9] == 2) {
    				if (if_block1) {
    					if (dirty[0] & /*pageContent*/ 512) {
    						transition_in(if_block1, 1);
    					}
    				} else {
    					if_block1 = create_if_block_13(ctx);
    					if_block1.c();
    					transition_in(if_block1, 1);
    					if_block1.m(if_block1_anchor.parentNode, if_block1_anchor);
    				}
    			} else if (if_block1) {
    				group_outros();

    				transition_out(if_block1, 1, 1, () => {
    					if_block1 = null;
    				});

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block0);
    			transition_in(if_block1);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block0);
    			transition_out(if_block1);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (if_block0) if_block0.d(detaching);
    			if (detaching) detach_dev(t);
    			if (if_block1) if_block1.d(detaching);
    			if (detaching) detach_dev(if_block1_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_12.name,
    		type: "if",
    		source: "(268:4) {#if SelSubPage == 3}",
    		ctx
    	});

    	return block;
    }

    // (269:8) {#if pageContent == 1}
    function create_if_block_14(ctx) {
    	let div0;
    	let div0_transition;
    	let t1;
    	let div1;
    	let img0;
    	let img0_src_value;
    	let div1_transition;
    	let t2;
    	let div2;
    	let img1;
    	let img1_src_value;
    	let div2_transition;
    	let t3;
    	let div3;
    	let t4;
    	let br0;
    	let br1;
    	let t5;
    	let div3_transition;
    	let current;

    	const block = {
    		c: function create() {
    			div0 = element("div");
    			div0.textContent = "First of all, knowing how many countries there are in the dataframe in addition to what are the highest crop yield countries are relevant to understand. There are 101 countries in the dataframe, with India having the highest crop yield.";
    			t1 = space();
    			div1 = element("div");
    			img0 = element("img");
    			t2 = space();
    			div2 = element("div");
    			img1 = element("img");
    			t3 = space();
    			div3 = element("div");
    			t4 = text("Grouped by the item (crop), India is the highest for production of cassava and potatoes. Potatoes seem to be the dominant crop in the dataset, being the highest in 4 countries. The final dataframe starts from 1990 and ends in 2013, that's 23 years worth of data for 101 countries. \r\n                ");
    			br0 = element("br");
    			br1 = element("br");
    			t5 = text("\r\n                Now, exploring the relationships between the columns of the dataframe, a good way to quickly check correlations among columns is by visualizing the correlation matrix as a heatmap.");
    			attr_dev(div0, "class", "ViewBox svelte-jor2d9");
    			set_style(div0, "width", "500px");
    			add_location(div0, file$1, 269, 12, 12060);
    			if (!src_url_equal(img0.src, img0_src_value = "additional_assets/5.jpg")) attr_dev(img0, "src", img0_src_value);
    			attr_dev(img0, "alt", "");
    			attr_dev(img0, "class", "svelte-jor2d9");
    			add_location(img0, file$1, 273, 16, 12482);
    			attr_dev(div1, "class", "ViewBox svelte-jor2d9");
    			set_style(div1, "width", "400px");
    			add_location(div1, file$1, 272, 12, 12406);
    			if (!src_url_equal(img1.src, img1_src_value = "additional_assets/6.jpg")) attr_dev(img1, "src", img1_src_value);
    			attr_dev(img1, "alt", "");
    			attr_dev(img1, "class", "svelte-jor2d9");
    			add_location(img1, file$1, 276, 16, 12642);
    			attr_dev(div2, "class", "ViewBox svelte-jor2d9");
    			set_style(div2, "width", "500px");
    			add_location(div2, file$1, 275, 12, 12566);
    			add_location(br0, file$1, 280, 16, 13101);
    			add_location(br1, file$1, 280, 20, 13105);
    			attr_dev(div3, "class", "ViewBox svelte-jor2d9");
    			set_style(div3, "width", "500px");
    			add_location(div3, file$1, 278, 12, 12726);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div0, anchor);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, div1, anchor);
    			append_dev(div1, img0);
    			insert_dev(target, t2, anchor);
    			insert_dev(target, div2, anchor);
    			append_dev(div2, img1);
    			insert_dev(target, t3, anchor);
    			insert_dev(target, div3, anchor);
    			append_dev(div3, t4);
    			append_dev(div3, br0);
    			append_dev(div3, br1);
    			append_dev(div3, t5);
    			current = true;
    		},
    		i: function intro(local) {
    			if (current) return;

    			add_render_callback(() => {
    				if (!div0_transition) div0_transition = create_bidirectional_transition(div0, slide, {}, true);
    				div0_transition.run(1);
    			});

    			add_render_callback(() => {
    				if (!div1_transition) div1_transition = create_bidirectional_transition(div1, slide, {}, true);
    				div1_transition.run(1);
    			});

    			add_render_callback(() => {
    				if (!div2_transition) div2_transition = create_bidirectional_transition(div2, slide, {}, true);
    				div2_transition.run(1);
    			});

    			add_render_callback(() => {
    				if (!div3_transition) div3_transition = create_bidirectional_transition(div3, slide, {}, true);
    				div3_transition.run(1);
    			});

    			current = true;
    		},
    		o: function outro(local) {
    			if (!div0_transition) div0_transition = create_bidirectional_transition(div0, slide, {}, false);
    			div0_transition.run(0);
    			if (!div1_transition) div1_transition = create_bidirectional_transition(div1, slide, {}, false);
    			div1_transition.run(0);
    			if (!div2_transition) div2_transition = create_bidirectional_transition(div2, slide, {}, false);
    			div2_transition.run(0);
    			if (!div3_transition) div3_transition = create_bidirectional_transition(div3, slide, {}, false);
    			div3_transition.run(0);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div0);
    			if (detaching && div0_transition) div0_transition.end();
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(div1);
    			if (detaching && div1_transition) div1_transition.end();
    			if (detaching) detach_dev(t2);
    			if (detaching) detach_dev(div2);
    			if (detaching && div2_transition) div2_transition.end();
    			if (detaching) detach_dev(t3);
    			if (detaching) detach_dev(div3);
    			if (detaching && div3_transition) div3_transition.end();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_14.name,
    		type: "if",
    		source: "(269:8) {#if pageContent == 1}",
    		ctx
    	});

    	return block;
    }

    // (285:8) {#if pageContent == 2}
    function create_if_block_13(ctx) {
    	let div0;
    	let img;
    	let img_src_value;
    	let div0_transition;
    	let t0;
    	let div1;
    	let div1_transition;
    	let current;

    	const block = {
    		c: function create() {
    			div0 = element("div");
    			img = element("img");
    			t0 = space();
    			div1 = element("div");
    			div1.textContent = "It is evident from the heatmap above that all of the variables are independent from each, with no correlations.";
    			if (!src_url_equal(img.src, img_src_value = "additional_assets/7.jpg")) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", "");
    			attr_dev(img, "class", "svelte-jor2d9");
    			add_location(img, file$1, 286, 16, 13464);
    			attr_dev(div0, "class", "ViewBox svelte-jor2d9");
    			set_style(div0, "width", "700px");
    			add_location(div0, file$1, 285, 12, 13388);
    			attr_dev(div1, "class", "ViewBox svelte-jor2d9");
    			set_style(div1, "width", "250px");
    			add_location(div1, file$1, 288, 12, 13548);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div0, anchor);
    			append_dev(div0, img);
    			insert_dev(target, t0, anchor);
    			insert_dev(target, div1, anchor);
    			current = true;
    		},
    		i: function intro(local) {
    			if (current) return;

    			add_render_callback(() => {
    				if (!div0_transition) div0_transition = create_bidirectional_transition(div0, slide, {}, true);
    				div0_transition.run(1);
    			});

    			add_render_callback(() => {
    				if (!div1_transition) div1_transition = create_bidirectional_transition(div1, slide, {}, true);
    				div1_transition.run(1);
    			});

    			current = true;
    		},
    		o: function outro(local) {
    			if (!div0_transition) div0_transition = create_bidirectional_transition(div0, slide, {}, false);
    			div0_transition.run(0);
    			if (!div1_transition) div1_transition = create_bidirectional_transition(div1, slide, {}, false);
    			div1_transition.run(0);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div0);
    			if (detaching && div0_transition) div0_transition.end();
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(div1);
    			if (detaching && div1_transition) div1_transition.end();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_13.name,
    		type: "if",
    		source: "(285:8) {#if pageContent == 2}",
    		ctx
    	});

    	return block;
    }

    // (295:4) {#if SelSubPage == 4}
    function create_if_block_9(ctx) {
    	let t;
    	let if_block1_anchor;
    	let current;
    	let if_block0 = /*pageContent*/ ctx[9] == 1 && create_if_block_11(ctx);
    	let if_block1 = /*pageContent*/ ctx[9] == 2 && create_if_block_10(ctx);

    	const block = {
    		c: function create() {
    			if (if_block0) if_block0.c();
    			t = space();
    			if (if_block1) if_block1.c();
    			if_block1_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if (if_block0) if_block0.m(target, anchor);
    			insert_dev(target, t, anchor);
    			if (if_block1) if_block1.m(target, anchor);
    			insert_dev(target, if_block1_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (/*pageContent*/ ctx[9] == 1) {
    				if (if_block0) {
    					if (dirty[0] & /*pageContent*/ 512) {
    						transition_in(if_block0, 1);
    					}
    				} else {
    					if_block0 = create_if_block_11(ctx);
    					if_block0.c();
    					transition_in(if_block0, 1);
    					if_block0.m(t.parentNode, t);
    				}
    			} else if (if_block0) {
    				group_outros();

    				transition_out(if_block0, 1, 1, () => {
    					if_block0 = null;
    				});

    				check_outros();
    			}

    			if (/*pageContent*/ ctx[9] == 2) {
    				if (if_block1) {
    					if (dirty[0] & /*pageContent*/ 512) {
    						transition_in(if_block1, 1);
    					}
    				} else {
    					if_block1 = create_if_block_10(ctx);
    					if_block1.c();
    					transition_in(if_block1, 1);
    					if_block1.m(if_block1_anchor.parentNode, if_block1_anchor);
    				}
    			} else if (if_block1) {
    				group_outros();

    				transition_out(if_block1, 1, 1, () => {
    					if_block1 = null;
    				});

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block0);
    			transition_in(if_block1);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block0);
    			transition_out(if_block1);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (if_block0) if_block0.d(detaching);
    			if (detaching) detach_dev(t);
    			if (if_block1) if_block1.d(detaching);
    			if (detaching) detach_dev(if_block1_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_9.name,
    		type: "if",
    		source: "(295:4) {#if SelSubPage == 4}",
    		ctx
    	});

    	return block;
    }

    // (296:8) {#if pageContent == 1}
    function create_if_block_11(ctx) {
    	let div0;
    	let div0_transition;
    	let t1;
    	let div1;
    	let div1_transition;
    	let t3;
    	let div2;
    	let t4;
    	let br0;
    	let br1;
    	let t5;
    	let div2_transition;
    	let t6;
    	let div3;
    	let img;
    	let img_src_value;
    	let div3_transition;
    	let current;

    	const block = {
    		c: function create() {
    			div0 = element("div");
    			div0.textContent = "Data Preprocessing is a technique that is used to convert the raw data into a clean data set. In other words, whenever the data is gathered from different sources it is collected in raw format which is not feasible for the analysis.";
    			t1 = space();
    			div1 = element("div");
    			div1.textContent = "In the final dataframe there are two categorical columns in the dataframe, categorical data are variables that contain label values rather than numeric values. The number of possible values is often limited to a fixed set, like in this case, items and countries values. Many machine learning algorithms cannot operate on label data directly. They require all input variables and output variables to be numeric.";
    			t3 = space();
    			div2 = element("div");
    			t4 = text("This means that categorical data must be converted to a numerical form. One hot encoding is a process by which categorical variables are converted into a form that could be provided to ML algorithms to do a better job in prediction. For that purpose, One-Hot Encoding will be used to convert these two columns to a one-hot numeric array. \r\n                ");
    			br0 = element("br");
    			br1 = element("br");
    			t5 = text("\r\n                The categorical value represents the numerical value of the entry in the dataset. This encoding will create a binary column for each category and returns a matrix with the results.");
    			t6 = space();
    			div3 = element("div");
    			img = element("img");
    			attr_dev(div0, "class", "ViewBox svelte-jor2d9");
    			set_style(div0, "width", "500px");
    			add_location(div0, file$1, 296, 12, 13860);
    			attr_dev(div1, "class", "ViewBox svelte-jor2d9");
    			set_style(div1, "width", "620px");
    			add_location(div1, file$1, 299, 12, 14202);
    			add_location(br0, file$1, 304, 16, 15154);
    			add_location(br1, file$1, 304, 20, 15158);
    			attr_dev(div2, "class", "ViewBox svelte-jor2d9");
    			set_style(div2, "width", "900px");
    			add_location(div2, file$1, 302, 12, 14722);
    			if (!src_url_equal(img.src, img_src_value = "additional_assets/8.jpg")) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", "");
    			attr_dev(img, "class", "svelte-jor2d9");
    			add_location(img, file$1, 308, 16, 15470);
    			attr_dev(div3, "class", "ViewBox svelte-jor2d9");
    			set_style(div3, "width", "900px");
    			add_location(div3, file$1, 307, 12, 15394);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div0, anchor);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, div1, anchor);
    			insert_dev(target, t3, anchor);
    			insert_dev(target, div2, anchor);
    			append_dev(div2, t4);
    			append_dev(div2, br0);
    			append_dev(div2, br1);
    			append_dev(div2, t5);
    			insert_dev(target, t6, anchor);
    			insert_dev(target, div3, anchor);
    			append_dev(div3, img);
    			current = true;
    		},
    		i: function intro(local) {
    			if (current) return;

    			add_render_callback(() => {
    				if (!div0_transition) div0_transition = create_bidirectional_transition(div0, slide, {}, true);
    				div0_transition.run(1);
    			});

    			add_render_callback(() => {
    				if (!div1_transition) div1_transition = create_bidirectional_transition(div1, slide, {}, true);
    				div1_transition.run(1);
    			});

    			add_render_callback(() => {
    				if (!div2_transition) div2_transition = create_bidirectional_transition(div2, slide, {}, true);
    				div2_transition.run(1);
    			});

    			add_render_callback(() => {
    				if (!div3_transition) div3_transition = create_bidirectional_transition(div3, slide, {}, true);
    				div3_transition.run(1);
    			});

    			current = true;
    		},
    		o: function outro(local) {
    			if (!div0_transition) div0_transition = create_bidirectional_transition(div0, slide, {}, false);
    			div0_transition.run(0);
    			if (!div1_transition) div1_transition = create_bidirectional_transition(div1, slide, {}, false);
    			div1_transition.run(0);
    			if (!div2_transition) div2_transition = create_bidirectional_transition(div2, slide, {}, false);
    			div2_transition.run(0);
    			if (!div3_transition) div3_transition = create_bidirectional_transition(div3, slide, {}, false);
    			div3_transition.run(0);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div0);
    			if (detaching && div0_transition) div0_transition.end();
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(div1);
    			if (detaching && div1_transition) div1_transition.end();
    			if (detaching) detach_dev(t3);
    			if (detaching) detach_dev(div2);
    			if (detaching && div2_transition) div2_transition.end();
    			if (detaching) detach_dev(t6);
    			if (detaching) detach_dev(div3);
    			if (detaching && div3_transition) div3_transition.end();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_11.name,
    		type: "if",
    		source: "(296:8) {#if pageContent == 1}",
    		ctx
    	});

    	return block;
    }

    // (312:8) {#if pageContent == 2}
    function create_if_block_10(ctx) {
    	let div0;
    	let div0_transition;
    	let t1;
    	let div1;
    	let div1_transition;
    	let t3;
    	let div2;
    	let div2_transition;
    	let current;

    	const block = {
    		c: function create() {
    			div0 = element("div");
    			div0.textContent = "The features of the data frame will look like the above with 115 columns. Taking a look at the dataset above, it contains features highly varying in magnitudes, units and range. The features with high magnitudes will weigh in a lot more in the distance calculations than features with low magnitudes.";
    			t1 = space();
    			div1 = element("div");
    			div1.textContent = "To suppress this effect, we need to bring all features to the same level of magnitudes. This can be achieved by scaling with MinMaxScaler.";
    			t3 = space();
    			div2 = element("div");
    			div2.textContent = "The final step on data preprocessing is the training and testing data. The dataset will be split into two datasets, the training dataset and test dataset. The data usually tend to be split inequality because training the model usually requires as many data-points as possible.The common splits are 70/30 or 80/20 for train/test.";
    			attr_dev(div0, "class", "ViewBox svelte-jor2d9");
    			add_location(div0, file$1, 312, 12, 15601);
    			attr_dev(div1, "class", "ViewBox svelte-jor2d9");
    			add_location(div1, file$1, 315, 12, 16003);
    			attr_dev(div2, "class", "ViewBox svelte-jor2d9");
    			add_location(div2, file$1, 318, 12, 16231);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div0, anchor);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, div1, anchor);
    			insert_dev(target, t3, anchor);
    			insert_dev(target, div2, anchor);
    			current = true;
    		},
    		i: function intro(local) {
    			if (current) return;

    			add_render_callback(() => {
    				if (!div0_transition) div0_transition = create_bidirectional_transition(div0, slide, {}, true);
    				div0_transition.run(1);
    			});

    			add_render_callback(() => {
    				if (!div1_transition) div1_transition = create_bidirectional_transition(div1, slide, {}, true);
    				div1_transition.run(1);
    			});

    			add_render_callback(() => {
    				if (!div2_transition) div2_transition = create_bidirectional_transition(div2, slide, {}, true);
    				div2_transition.run(1);
    			});

    			current = true;
    		},
    		o: function outro(local) {
    			if (!div0_transition) div0_transition = create_bidirectional_transition(div0, slide, {}, false);
    			div0_transition.run(0);
    			if (!div1_transition) div1_transition = create_bidirectional_transition(div1, slide, {}, false);
    			div1_transition.run(0);
    			if (!div2_transition) div2_transition = create_bidirectional_transition(div2, slide, {}, false);
    			div2_transition.run(0);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div0);
    			if (detaching && div0_transition) div0_transition.end();
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(div1);
    			if (detaching && div1_transition) div1_transition.end();
    			if (detaching) detach_dev(t3);
    			if (detaching) detach_dev(div2);
    			if (detaching && div2_transition) div2_transition.end();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_10.name,
    		type: "if",
    		source: "(312:8) {#if pageContent == 2}",
    		ctx
    	});

    	return block;
    }

    // (325:4) {#if SelSubPage == 5}
    function create_if_block_6(ctx) {
    	let t;
    	let if_block1_anchor;
    	let current;
    	let if_block0 = /*pageContent*/ ctx[9] == 1 && create_if_block_8(ctx);
    	let if_block1 = /*pageContent*/ ctx[9] == 2 && create_if_block_7(ctx);

    	const block = {
    		c: function create() {
    			if (if_block0) if_block0.c();
    			t = space();
    			if (if_block1) if_block1.c();
    			if_block1_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if (if_block0) if_block0.m(target, anchor);
    			insert_dev(target, t, anchor);
    			if (if_block1) if_block1.m(target, anchor);
    			insert_dev(target, if_block1_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (/*pageContent*/ ctx[9] == 1) {
    				if (if_block0) {
    					if (dirty[0] & /*pageContent*/ 512) {
    						transition_in(if_block0, 1);
    					}
    				} else {
    					if_block0 = create_if_block_8(ctx);
    					if_block0.c();
    					transition_in(if_block0, 1);
    					if_block0.m(t.parentNode, t);
    				}
    			} else if (if_block0) {
    				group_outros();

    				transition_out(if_block0, 1, 1, () => {
    					if_block0 = null;
    				});

    				check_outros();
    			}

    			if (/*pageContent*/ ctx[9] == 2) {
    				if (if_block1) {
    					if (dirty[0] & /*pageContent*/ 512) {
    						transition_in(if_block1, 1);
    					}
    				} else {
    					if_block1 = create_if_block_7(ctx);
    					if_block1.c();
    					transition_in(if_block1, 1);
    					if_block1.m(if_block1_anchor.parentNode, if_block1_anchor);
    				}
    			} else if (if_block1) {
    				group_outros();

    				transition_out(if_block1, 1, 1, () => {
    					if_block1 = null;
    				});

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block0);
    			transition_in(if_block1);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block0);
    			transition_out(if_block1);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (if_block0) if_block0.d(detaching);
    			if (detaching) detach_dev(t);
    			if (if_block1) if_block1.d(detaching);
    			if (detaching) detach_dev(if_block1_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_6.name,
    		type: "if",
    		source: "(325:4) {#if SelSubPage == 5}",
    		ctx
    	});

    	return block;
    }

    // (326:8) {#if pageContent == 1}
    function create_if_block_8(ctx) {
    	let div0;
    	let div0_transition;
    	let t1;
    	let div1;
    	let div1_transition;
    	let t3;
    	let div2;
    	let div2_transition;
    	let t5;
    	let div3;
    	let img;
    	let img_src_value;
    	let div3_transition;
    	let t6;
    	let div4;
    	let div4_transition;
    	let current;

    	const block = {
    		c: function create() {
    			div0 = element("div");
    			div0.textContent = "Before deciding on an algorithm to use, first we need to evaluate, compare and choose the best one that fits this specific dataset.";
    			t1 = space();
    			div1 = element("div");
    			div1.textContent = "Usually, when working on a machine learning problem with a given dataset, we try different models and techniques to solve an optimization problem and fit the most suitable model, that will neither overfit nor underfit the model.";
    			t3 = space();
    			div2 = element("div");
    			div2.textContent = "The evaluation metric is set based on the R^2 (coefficient of determination) regression score function, which will represent the proportion of the variance for items (crops) in the regression model. R^2 score shows how well terms (data points) fit a curve or line.";
    			t5 = space();
    			div3 = element("div");
    			img = element("img");
    			t6 = space();
    			div4 = element("div");
    			div4.textContent = "From results viewed above, Decision Tree Regressor has the highest R^2 score 0f 96%.";
    			attr_dev(div0, "class", "ViewBox svelte-jor2d9");
    			set_style(div0, "width", "300px");
    			add_location(div0, file$1, 326, 12, 16736);
    			attr_dev(div1, "class", "ViewBox svelte-jor2d9");
    			set_style(div1, "width", "600px");
    			add_location(div1, file$1, 329, 12, 16977);
    			attr_dev(div2, "class", "ViewBox svelte-jor2d9");
    			set_style(div2, "width", "400px");
    			add_location(div2, file$1, 332, 12, 17316);
    			if (!src_url_equal(img.src, img_src_value = "additional_assets/9.jpg")) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", "");
    			attr_dev(img, "class", "svelte-jor2d9");
    			add_location(img, file$1, 336, 16, 17766);
    			attr_dev(div3, "class", "ViewBox svelte-jor2d9");
    			set_style(div3, "width", "500px");
    			add_location(div3, file$1, 335, 12, 17690);
    			attr_dev(div4, "class", "ViewBox svelte-jor2d9");
    			add_location(div4, file$1, 338, 12, 17850);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div0, anchor);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, div1, anchor);
    			insert_dev(target, t3, anchor);
    			insert_dev(target, div2, anchor);
    			insert_dev(target, t5, anchor);
    			insert_dev(target, div3, anchor);
    			append_dev(div3, img);
    			insert_dev(target, t6, anchor);
    			insert_dev(target, div4, anchor);
    			current = true;
    		},
    		i: function intro(local) {
    			if (current) return;

    			add_render_callback(() => {
    				if (!div0_transition) div0_transition = create_bidirectional_transition(div0, slide, {}, true);
    				div0_transition.run(1);
    			});

    			add_render_callback(() => {
    				if (!div1_transition) div1_transition = create_bidirectional_transition(div1, slide, {}, true);
    				div1_transition.run(1);
    			});

    			add_render_callback(() => {
    				if (!div2_transition) div2_transition = create_bidirectional_transition(div2, slide, {}, true);
    				div2_transition.run(1);
    			});

    			add_render_callback(() => {
    				if (!div3_transition) div3_transition = create_bidirectional_transition(div3, slide, {}, true);
    				div3_transition.run(1);
    			});

    			add_render_callback(() => {
    				if (!div4_transition) div4_transition = create_bidirectional_transition(div4, slide, {}, true);
    				div4_transition.run(1);
    			});

    			current = true;
    		},
    		o: function outro(local) {
    			if (!div0_transition) div0_transition = create_bidirectional_transition(div0, slide, {}, false);
    			div0_transition.run(0);
    			if (!div1_transition) div1_transition = create_bidirectional_transition(div1, slide, {}, false);
    			div1_transition.run(0);
    			if (!div2_transition) div2_transition = create_bidirectional_transition(div2, slide, {}, false);
    			div2_transition.run(0);
    			if (!div3_transition) div3_transition = create_bidirectional_transition(div3, slide, {}, false);
    			div3_transition.run(0);
    			if (!div4_transition) div4_transition = create_bidirectional_transition(div4, slide, {}, false);
    			div4_transition.run(0);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div0);
    			if (detaching && div0_transition) div0_transition.end();
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(div1);
    			if (detaching && div1_transition) div1_transition.end();
    			if (detaching) detach_dev(t3);
    			if (detaching) detach_dev(div2);
    			if (detaching && div2_transition) div2_transition.end();
    			if (detaching) detach_dev(t5);
    			if (detaching) detach_dev(div3);
    			if (detaching && div3_transition) div3_transition.end();
    			if (detaching) detach_dev(t6);
    			if (detaching) detach_dev(div4);
    			if (detaching && div4_transition) div4_transition.end();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_8.name,
    		type: "if",
    		source: "(326:8) {#if pageContent == 1}",
    		ctx
    	});

    	return block;
    }

    // (343:8) {#if pageContent == 2}
    function create_if_block_7(ctx) {
    	let div0;
    	let div0_transition;
    	let t1;
    	let div1;
    	let img0;
    	let img0_src_value;
    	let div1_transition;
    	let t2;
    	let div2;
    	let img1;
    	let img1_src_value;
    	let div2_transition;
    	let t3;
    	let div3;
    	let div3_transition;
    	let current;

    	const block = {
    		c: function create() {
    			div0 = element("div");
    			div0.textContent = "Here we also calculate Adjusted R^2 , where it also indicates how well terms fit a curve or line, but adjusts for the number of terms in a model. If you add more and more useless variables to a model, adjusted r-squared will decrease. If you add more useful variables, adjusted r-squared will increase. Adjusted R2 will always be less than or equal to R2.";
    			t1 = space();
    			div1 = element("div");
    			img0 = element("img");
    			t2 = space();
    			div2 = element("div");
    			img1 = element("img");
    			t3 = space();
    			div3 = element("div");
    			div3.textContent = "R^2 and adjusted R^2 results respectively for each item.";
    			attr_dev(div0, "class", "ViewBox svelte-jor2d9");
    			add_location(div0, file$1, 343, 12, 18071);
    			if (!src_url_equal(img0.src, img0_src_value = "additional_assets/10.jpg")) attr_dev(img0, "src", img0_src_value);
    			attr_dev(img0, "alt", "");
    			attr_dev(img0, "class", "svelte-jor2d9");
    			add_location(img0, file$1, 347, 16, 18592);
    			attr_dev(div1, "class", "ViewBox svelte-jor2d9");
    			set_style(div1, "width", "400px");
    			add_location(div1, file$1, 346, 12, 18516);
    			if (!src_url_equal(img1.src, img1_src_value = "additional_assets/11.jpg")) attr_dev(img1, "src", img1_src_value);
    			attr_dev(img1, "alt", "");
    			attr_dev(img1, "class", "svelte-jor2d9");
    			add_location(img1, file$1, 350, 16, 18753);
    			attr_dev(div2, "class", "ViewBox svelte-jor2d9");
    			set_style(div2, "width", "400px");
    			add_location(div2, file$1, 349, 12, 18677);
    			attr_dev(div3, "class", "ViewBox svelte-jor2d9");
    			add_location(div3, file$1, 352, 12, 18838);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div0, anchor);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, div1, anchor);
    			append_dev(div1, img0);
    			insert_dev(target, t2, anchor);
    			insert_dev(target, div2, anchor);
    			append_dev(div2, img1);
    			insert_dev(target, t3, anchor);
    			insert_dev(target, div3, anchor);
    			current = true;
    		},
    		i: function intro(local) {
    			if (current) return;

    			add_render_callback(() => {
    				if (!div0_transition) div0_transition = create_bidirectional_transition(div0, slide, {}, true);
    				div0_transition.run(1);
    			});

    			add_render_callback(() => {
    				if (!div1_transition) div1_transition = create_bidirectional_transition(div1, slide, {}, true);
    				div1_transition.run(1);
    			});

    			add_render_callback(() => {
    				if (!div2_transition) div2_transition = create_bidirectional_transition(div2, slide, {}, true);
    				div2_transition.run(1);
    			});

    			add_render_callback(() => {
    				if (!div3_transition) div3_transition = create_bidirectional_transition(div3, slide, {}, true);
    				div3_transition.run(1);
    			});

    			current = true;
    		},
    		o: function outro(local) {
    			if (!div0_transition) div0_transition = create_bidirectional_transition(div0, slide, {}, false);
    			div0_transition.run(0);
    			if (!div1_transition) div1_transition = create_bidirectional_transition(div1, slide, {}, false);
    			div1_transition.run(0);
    			if (!div2_transition) div2_transition = create_bidirectional_transition(div2, slide, {}, false);
    			div2_transition.run(0);
    			if (!div3_transition) div3_transition = create_bidirectional_transition(div3, slide, {}, false);
    			div3_transition.run(0);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div0);
    			if (detaching && div0_transition) div0_transition.end();
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(div1);
    			if (detaching && div1_transition) div1_transition.end();
    			if (detaching) detach_dev(t2);
    			if (detaching) detach_dev(div2);
    			if (detaching && div2_transition) div2_transition.end();
    			if (detaching) detach_dev(t3);
    			if (detaching) detach_dev(div3);
    			if (detaching && div3_transition) div3_transition.end();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_7.name,
    		type: "if",
    		source: "(343:8) {#if pageContent == 2}",
    		ctx
    	});

    	return block;
    }

    // (359:4) {#if SelSubPage == 6}
    function create_if_block_3$1(ctx) {
    	let t;
    	let if_block1_anchor;
    	let current;
    	let if_block0 = /*pageContent*/ ctx[9] == 1 && create_if_block_5(ctx);
    	let if_block1 = /*pageContent*/ ctx[9] == 2 && create_if_block_4(ctx);

    	const block = {
    		c: function create() {
    			if (if_block0) if_block0.c();
    			t = space();
    			if (if_block1) if_block1.c();
    			if_block1_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if (if_block0) if_block0.m(target, anchor);
    			insert_dev(target, t, anchor);
    			if (if_block1) if_block1.m(target, anchor);
    			insert_dev(target, if_block1_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (/*pageContent*/ ctx[9] == 1) {
    				if (if_block0) {
    					if (dirty[0] & /*pageContent*/ 512) {
    						transition_in(if_block0, 1);
    					}
    				} else {
    					if_block0 = create_if_block_5(ctx);
    					if_block0.c();
    					transition_in(if_block0, 1);
    					if_block0.m(t.parentNode, t);
    				}
    			} else if (if_block0) {
    				group_outros();

    				transition_out(if_block0, 1, 1, () => {
    					if_block0 = null;
    				});

    				check_outros();
    			}

    			if (/*pageContent*/ ctx[9] == 2) {
    				if (if_block1) {
    					if (dirty[0] & /*pageContent*/ 512) {
    						transition_in(if_block1, 1);
    					}
    				} else {
    					if_block1 = create_if_block_4(ctx);
    					if_block1.c();
    					transition_in(if_block1, 1);
    					if_block1.m(if_block1_anchor.parentNode, if_block1_anchor);
    				}
    			} else if (if_block1) {
    				group_outros();

    				transition_out(if_block1, 1, 1, () => {
    					if_block1 = null;
    				});

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block0);
    			transition_in(if_block1);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block0);
    			transition_out(if_block1);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (if_block0) if_block0.d(detaching);
    			if (detaching) detach_dev(t);
    			if (if_block1) if_block1.d(detaching);
    			if (detaching) detach_dev(if_block1_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_3$1.name,
    		type: "if",
    		source: "(359:4) {#if SelSubPage == 6}",
    		ctx
    	});

    	return block;
    }

    // (360:8) {#if pageContent == 1}
    function create_if_block_5(ctx) {
    	let div0;
    	let div0_transition;
    	let t1;
    	let div1;
    	let div1_transition;
    	let t3;
    	let div2;
    	let img;
    	let img_src_value;
    	let div2_transition;
    	let current;

    	const block = {
    		c: function create() {
    			div0 = element("div");
    			div0.textContent = "The most common interpretation of r-squared is how well the regression model fits the observed data. For example, an r-squared of 60% reveals that 60% of the data fit the regression model. Generally, a higher r-squared indicates a better fit for the model. From the obtained results, it’s clear that the model fits the data to a very good measure of 96%.";
    			t1 = space();
    			div1 = element("div");
    			div1.textContent = "Feature importance is calculated as the decrease in node impurity weighted by the probability of reaching that node. The node probability can be calculated by the number of samples that reach the node, divided by the total number of samples. The higher the value the more important the feature. Getting the 7 top features importance for the model:";
    			t3 = space();
    			div2 = element("div");
    			img = element("img");
    			attr_dev(div0, "class", "ViewBox svelte-jor2d9");
    			set_style(div0, "width", "500px");
    			add_location(div0, file$1, 360, 12, 19072);
    			attr_dev(div1, "class", "ViewBox svelte-jor2d9");
    			set_style(div1, "width", "500px");
    			add_location(div1, file$1, 363, 12, 19536);
    			if (!src_url_equal(img.src, img_src_value = "additional_assets/12.jpg")) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", "");
    			attr_dev(img, "class", "svelte-jor2d9");
    			add_location(img, file$1, 367, 16, 20069);
    			attr_dev(div2, "class", "ViewBox svelte-jor2d9");
    			set_style(div2, "width", "900px");
    			add_location(div2, file$1, 366, 12, 19993);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div0, anchor);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, div1, anchor);
    			insert_dev(target, t3, anchor);
    			insert_dev(target, div2, anchor);
    			append_dev(div2, img);
    			current = true;
    		},
    		i: function intro(local) {
    			if (current) return;

    			add_render_callback(() => {
    				if (!div0_transition) div0_transition = create_bidirectional_transition(div0, slide, {}, true);
    				div0_transition.run(1);
    			});

    			add_render_callback(() => {
    				if (!div1_transition) div1_transition = create_bidirectional_transition(div1, slide, {}, true);
    				div1_transition.run(1);
    			});

    			add_render_callback(() => {
    				if (!div2_transition) div2_transition = create_bidirectional_transition(div2, slide, {}, true);
    				div2_transition.run(1);
    			});

    			current = true;
    		},
    		o: function outro(local) {
    			if (!div0_transition) div0_transition = create_bidirectional_transition(div0, slide, {}, false);
    			div0_transition.run(0);
    			if (!div1_transition) div1_transition = create_bidirectional_transition(div1, slide, {}, false);
    			div1_transition.run(0);
    			if (!div2_transition) div2_transition = create_bidirectional_transition(div2, slide, {}, false);
    			div2_transition.run(0);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div0);
    			if (detaching && div0_transition) div0_transition.end();
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(div1);
    			if (detaching && div1_transition) div1_transition.end();
    			if (detaching) detach_dev(t3);
    			if (detaching) detach_dev(div2);
    			if (detaching && div2_transition) div2_transition.end();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_5.name,
    		type: "if",
    		source: "(360:8) {#if pageContent == 1}",
    		ctx
    	});

    	return block;
    }

    // (372:8) {#if pageContent == 2}
    function create_if_block_4(ctx) {
    	let div0;
    	let div0_transition;
    	let t1;
    	let div1;
    	let div1_transition;
    	let t3;
    	let div2;
    	let div2_transition;
    	let t5;
    	let div3;
    	let img;
    	let img_src_value;
    	let div3_transition;
    	let current;

    	const block = {
    		c: function create() {
    			div0 = element("div");
    			div0.textContent = "The crop being potatoes has the highest importance in the decision making for the model, where it's the highest crop in the dataset. Cassava too, then as expected we see the effect of pesticides, where it's the third most important feature, and then if the crop is sweet potatoes, we see some of the highest crops in features importance in the dataset.";
    			t1 = space();
    			div1 = element("div");
    			div1.textContent = "If the crop is grown in India, it makes sense since India has the largest crops sum in the dataset. Then comes rainfall and temperature. The first assumption about these features were correct, where they all significantly impact the expected crops yield in the model.";
    			t3 = space();
    			div2 = element("div");
    			div2.textContent = "The boxplot below shows the yield for each item. Potatoes are the highest, Cassava, sweet potatoes and Yams.";
    			t5 = space();
    			div3 = element("div");
    			img = element("img");
    			attr_dev(div0, "class", "ViewBox svelte-jor2d9");
    			set_style(div0, "width", "600px");
    			add_location(div0, file$1, 372, 12, 20203);
    			attr_dev(div1, "class", "ViewBox svelte-jor2d9");
    			set_style(div1, "width", "500px");
    			add_location(div1, file$1, 375, 12, 20666);
    			attr_dev(div2, "class", "ViewBox svelte-jor2d9");
    			add_location(div2, file$1, 378, 12, 21044);
    			if (!src_url_equal(img.src, img_src_value = "additional_assets/13.jpg")) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", "");
    			attr_dev(img, "class", "svelte-jor2d9");
    			add_location(img, file$1, 382, 16, 21318);
    			attr_dev(div3, "class", "ViewBox svelte-jor2d9");
    			set_style(div3, "width", "800px");
    			add_location(div3, file$1, 381, 12, 21242);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div0, anchor);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, div1, anchor);
    			insert_dev(target, t3, anchor);
    			insert_dev(target, div2, anchor);
    			insert_dev(target, t5, anchor);
    			insert_dev(target, div3, anchor);
    			append_dev(div3, img);
    			current = true;
    		},
    		i: function intro(local) {
    			if (current) return;

    			add_render_callback(() => {
    				if (!div0_transition) div0_transition = create_bidirectional_transition(div0, slide, {}, true);
    				div0_transition.run(1);
    			});

    			add_render_callback(() => {
    				if (!div1_transition) div1_transition = create_bidirectional_transition(div1, slide, {}, true);
    				div1_transition.run(1);
    			});

    			add_render_callback(() => {
    				if (!div2_transition) div2_transition = create_bidirectional_transition(div2, slide, {}, true);
    				div2_transition.run(1);
    			});

    			add_render_callback(() => {
    				if (!div3_transition) div3_transition = create_bidirectional_transition(div3, slide, {}, true);
    				div3_transition.run(1);
    			});

    			current = true;
    		},
    		o: function outro(local) {
    			if (!div0_transition) div0_transition = create_bidirectional_transition(div0, slide, {}, false);
    			div0_transition.run(0);
    			if (!div1_transition) div1_transition = create_bidirectional_transition(div1, slide, {}, false);
    			div1_transition.run(0);
    			if (!div2_transition) div2_transition = create_bidirectional_transition(div2, slide, {}, false);
    			div2_transition.run(0);
    			if (!div3_transition) div3_transition = create_bidirectional_transition(div3, slide, {}, false);
    			div3_transition.run(0);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div0);
    			if (detaching && div0_transition) div0_transition.end();
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(div1);
    			if (detaching && div1_transition) div1_transition.end();
    			if (detaching) detach_dev(t3);
    			if (detaching) detach_dev(div2);
    			if (detaching && div2_transition) div2_transition.end();
    			if (detaching) detach_dev(t5);
    			if (detaching) detach_dev(div3);
    			if (detaching && div3_transition) div3_transition.end();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_4.name,
    		type: "if",
    		source: "(372:8) {#if pageContent == 2}",
    		ctx
    	});

    	return block;
    }

    // (388:4) {#if SelSubPage == 7}
    function create_if_block$1(ctx) {
    	let t;
    	let if_block1_anchor;
    	let current;
    	let if_block0 = /*pageContent*/ ctx[9] == 1 && create_if_block_2$1(ctx);
    	let if_block1 = /*pageContent*/ ctx[9] == 2 && create_if_block_1$1(ctx);

    	const block = {
    		c: function create() {
    			if (if_block0) if_block0.c();
    			t = space();
    			if (if_block1) if_block1.c();
    			if_block1_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if (if_block0) if_block0.m(target, anchor);
    			insert_dev(target, t, anchor);
    			if (if_block1) if_block1.m(target, anchor);
    			insert_dev(target, if_block1_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (/*pageContent*/ ctx[9] == 1) {
    				if (if_block0) {
    					if (dirty[0] & /*pageContent*/ 512) {
    						transition_in(if_block0, 1);
    					}
    				} else {
    					if_block0 = create_if_block_2$1(ctx);
    					if_block0.c();
    					transition_in(if_block0, 1);
    					if_block0.m(t.parentNode, t);
    				}
    			} else if (if_block0) {
    				group_outros();

    				transition_out(if_block0, 1, 1, () => {
    					if_block0 = null;
    				});

    				check_outros();
    			}

    			if (/*pageContent*/ ctx[9] == 2) {
    				if (if_block1) {
    					if (dirty[0] & /*pageContent*/ 512) {
    						transition_in(if_block1, 1);
    					}
    				} else {
    					if_block1 = create_if_block_1$1(ctx);
    					if_block1.c();
    					transition_in(if_block1, 1);
    					if_block1.m(if_block1_anchor.parentNode, if_block1_anchor);
    				}
    			} else if (if_block1) {
    				group_outros();

    				transition_out(if_block1, 1, 1, () => {
    					if_block1 = null;
    				});

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block0);
    			transition_in(if_block1);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block0);
    			transition_out(if_block1);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (if_block0) if_block0.d(detaching);
    			if (detaching) detach_dev(t);
    			if (if_block1) if_block1.d(detaching);
    			if (detaching) detach_dev(if_block1_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$1.name,
    		type: "if",
    		source: "(388:4) {#if SelSubPage == 7}",
    		ctx
    	});

    	return block;
    }

    // (389:8) {#if pageContent == 1}
    function create_if_block_2$1(ctx) {
    	let div0;
    	let div0_transition;
    	let t1;
    	let div1;
    	let div1_transition;
    	let t3;
    	let div2;
    	let div2_transition;
    	let current;

    	const block = {
    		c: function create() {
    			div0 = element("div");
    			div0.textContent = "Decision Tree algorithm has become one of the most used machine learning algorithms both in competitions like Kaggle as well as in business environments. Decision Tree can be used both in classification and regression problems.";
    			t1 = space();
    			div1 = element("div");
    			div1.textContent = "A decision tree typically starts with a single node, which branches into possible outcomes. Each of those outcomes leads to additional nodes, which branch off into other possibilities. A decision node, represented by a square, shows a decision to be made, and an end node shows the final outcome of a decision path. A node represents a single input variable (X) and a split point on that variable, assuming the variable is numeric. The leaf nodes (also called terminal nodes) of the tree contain an output variable (y) which is used to make a prediction. Decision trees regression uses mean squared error (MSE) to decide to split a node in two or more sub-nodes.";
    			t3 = space();
    			div2 = element("div");
    			div2.textContent = "The root node is an item potato, which is its most important feature in the model. The model asks if it’s potato then based on that it follows the branch if it’s true or false. The algorithm first will pick a value, and split the data into two subset. For each subset, it will calculate the MSE separately. The tree chooses the value which results in the smallest MSE value up until it reaches a leaf node.";
    			attr_dev(div0, "class", "ViewBox svelte-jor2d9");
    			add_location(div0, file$1, 389, 12, 21490);
    			attr_dev(div1, "class", "ViewBox svelte-jor2d9");
    			add_location(div1, file$1, 392, 12, 21808);
    			attr_dev(div2, "class", "ViewBox svelte-jor2d9");
    			add_location(div2, file$1, 395, 12, 22560);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div0, anchor);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, div1, anchor);
    			insert_dev(target, t3, anchor);
    			insert_dev(target, div2, anchor);
    			current = true;
    		},
    		i: function intro(local) {
    			if (current) return;

    			add_render_callback(() => {
    				if (!div0_transition) div0_transition = create_bidirectional_transition(div0, slide, {}, true);
    				div0_transition.run(1);
    			});

    			add_render_callback(() => {
    				if (!div1_transition) div1_transition = create_bidirectional_transition(div1, slide, {}, true);
    				div1_transition.run(1);
    			});

    			add_render_callback(() => {
    				if (!div2_transition) div2_transition = create_bidirectional_transition(div2, slide, {}, true);
    				div2_transition.run(1);
    			});

    			current = true;
    		},
    		o: function outro(local) {
    			if (!div0_transition) div0_transition = create_bidirectional_transition(div0, slide, {}, false);
    			div0_transition.run(0);
    			if (!div1_transition) div1_transition = create_bidirectional_transition(div1, slide, {}, false);
    			div1_transition.run(0);
    			if (!div2_transition) div2_transition = create_bidirectional_transition(div2, slide, {}, false);
    			div2_transition.run(0);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div0);
    			if (detaching && div0_transition) div0_transition.end();
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(div1);
    			if (detaching && div1_transition) div1_transition.end();
    			if (detaching) detach_dev(t3);
    			if (detaching) detach_dev(div2);
    			if (detaching && div2_transition) div2_transition.end();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_2$1.name,
    		type: "if",
    		source: "(389:8) {#if pageContent == 1}",
    		ctx
    	});

    	return block;
    }

    // (400:8) {#if pageContent == 2}
    function create_if_block_1$1(ctx) {
    	let div0;
    	let img;
    	let img_src_value;
    	let div0_transition;
    	let t0;
    	let div1;
    	let div1_transition;
    	let current;

    	const block = {
    		c: function create() {
    			div0 = element("div");
    			img = element("img");
    			t0 = space();
    			div1 = element("div");
    			div1.textContent = "The figure above shows the goodness of the fit with the predictions visualized as a line. It can be seen that the R Square score is excellent. This means that we have found a good fitting model to predict the crops yield value for a certain country.";
    			if (!src_url_equal(img.src, img_src_value = "additional_assets/14.jpg")) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", "");
    			attr_dev(img, "class", "svelte-jor2d9");
    			add_location(img, file$1, 401, 16, 23180);
    			attr_dev(div0, "class", "ViewBox svelte-jor2d9");
    			set_style(div0, "width", "800px");
    			add_location(div0, file$1, 400, 12, 23104);
    			attr_dev(div1, "class", "ViewBox svelte-jor2d9");
    			set_style(div1, "width", "300px");
    			add_location(div1, file$1, 403, 12, 23265);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div0, anchor);
    			append_dev(div0, img);
    			insert_dev(target, t0, anchor);
    			insert_dev(target, div1, anchor);
    			current = true;
    		},
    		i: function intro(local) {
    			if (current) return;

    			add_render_callback(() => {
    				if (!div0_transition) div0_transition = create_bidirectional_transition(div0, slide, {}, true);
    				div0_transition.run(1);
    			});

    			add_render_callback(() => {
    				if (!div1_transition) div1_transition = create_bidirectional_transition(div1, slide, {}, true);
    				div1_transition.run(1);
    			});

    			current = true;
    		},
    		o: function outro(local) {
    			if (!div0_transition) div0_transition = create_bidirectional_transition(div0, slide, {}, false);
    			div0_transition.run(0);
    			if (!div1_transition) div1_transition = create_bidirectional_transition(div1, slide, {}, false);
    			div1_transition.run(0);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div0);
    			if (detaching && div0_transition) div0_transition.end();
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(div1);
    			if (detaching && div1_transition) div1_transition.end();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1$1.name,
    		type: "if",
    		source: "(400:8) {#if pageContent == 2}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$1(ctx) {
    	let scrolling = false;

    	let clear_scrolling = () => {
    		scrolling = false;
    	};

    	let scrolling_timeout;
    	let t0;
    	let main;
    	let div;
    	let button0;
    	let t1;
    	let button0_class_value;
    	let t2;
    	let button1;
    	let t3;
    	let button1_class_value;
    	let t4;
    	let button2;
    	let t5;
    	let button2_class_value;
    	let t6;
    	let button3;
    	let t7;
    	let button3_class_value;
    	let t8;
    	let button4;
    	let t9;
    	let button4_class_value;
    	let t10;
    	let button5;
    	let t11;
    	let button5_class_value;
    	let t12;
    	let button6;
    	let t13;
    	let button6_class_value;
    	let t14;
    	let button7;
    	let t15;
    	let button7_class_value;
    	let t16;
    	let br0;
    	let t17;
    	let br1;
    	let div_transition;
    	let t18;
    	let t19;
    	let t20;
    	let t21;
    	let t22;
    	let t23;
    	let t24;
    	let t25;
    	let current;
    	let mounted;
    	let dispose;
    	add_render_callback(/*onwindowscroll*/ ctx[20]);
    	let if_block0 = /*SelSubPage*/ ctx[8] == 0 && create_if_block_20(ctx);
    	let if_block1 = /*SelSubPage*/ ctx[8] == 1 && create_if_block_19(ctx);
    	let if_block2 = /*SelSubPage*/ ctx[8] == 2 && create_if_block_15(ctx);
    	let if_block3 = /*SelSubPage*/ ctx[8] == 3 && create_if_block_12(ctx);
    	let if_block4 = /*SelSubPage*/ ctx[8] == 4 && create_if_block_9(ctx);
    	let if_block5 = /*SelSubPage*/ ctx[8] == 5 && create_if_block_6(ctx);
    	let if_block6 = /*SelSubPage*/ ctx[8] == 6 && create_if_block_3$1(ctx);
    	let if_block7 = /*SelSubPage*/ ctx[8] == 7 && create_if_block$1(ctx);

    	const block = {
    		c: function create() {
    			t0 = space();
    			main = element("main");
    			div = element("div");
    			button0 = element("button");
    			t1 = text("Yield");
    			t2 = space();
    			button1 = element("button");
    			t3 = text("Overview");
    			t4 = space();
    			button2 = element("button");
    			t5 = text("Analysis");
    			t6 = space();
    			button3 = element("button");
    			t7 = text("Data Exploration");
    			t8 = space();
    			button4 = element("button");
    			t9 = text("Data Preprocessing");
    			t10 = space();
    			button5 = element("button");
    			t11 = text("Model Comparision & Selection");
    			t12 = space();
    			button6 = element("button");
    			t13 = text("Model Result & Conclusion");
    			t14 = space();
    			button7 = element("button");
    			t15 = text("Conclusion");
    			t16 = space();
    			br0 = element("br");
    			t17 = space();
    			br1 = element("br");
    			t18 = space();
    			if (if_block0) if_block0.c();
    			t19 = space();
    			if (if_block1) if_block1.c();
    			t20 = space();
    			if (if_block2) if_block2.c();
    			t21 = space();
    			if (if_block3) if_block3.c();
    			t22 = space();
    			if (if_block4) if_block4.c();
    			t23 = space();
    			if (if_block5) if_block5.c();
    			t24 = space();
    			if (if_block6) if_block6.c();
    			t25 = space();
    			if (if_block7) if_block7.c();
    			attr_dev(button0, "class", button0_class_value = "BarBtn " + /*S0*/ ctx[0] + " svelte-jor2d9");
    			add_location(button0, file$1, 139, 8, 3866);
    			attr_dev(button1, "class", button1_class_value = "BarBtn " + /*S1*/ ctx[1] + " svelte-jor2d9");
    			add_location(button1, file$1, 140, 8, 3952);
    			attr_dev(button2, "class", button2_class_value = "BarBtn " + /*S2*/ ctx[2] + " svelte-jor2d9");
    			add_location(button2, file$1, 141, 8, 4047);
    			attr_dev(button3, "class", button3_class_value = "BarBtn " + /*S3*/ ctx[3] + " svelte-jor2d9");
    			add_location(button3, file$1, 142, 8, 4142);
    			attr_dev(button4, "class", button4_class_value = "BarBtn " + /*S4*/ ctx[4] + " svelte-jor2d9");
    			add_location(button4, file$1, 143, 8, 4246);
    			attr_dev(button5, "class", button5_class_value = "BarBtn " + /*S5*/ ctx[5] + " svelte-jor2d9");
    			add_location(button5, file$1, 144, 8, 4352);
    			attr_dev(button6, "class", button6_class_value = "BarBtn " + /*S6*/ ctx[6] + " svelte-jor2d9");
    			add_location(button6, file$1, 145, 8, 4468);
    			attr_dev(button7, "class", button7_class_value = "BarBtn " + /*S7*/ ctx[7] + " svelte-jor2d9");
    			add_location(button7, file$1, 146, 8, 4580);
    			add_location(br0, file$1, 147, 8, 4674);
    			add_location(br1, file$1, 148, 8, 4688);
    			add_location(div, file$1, 138, 4, 3776);
    			add_location(main, file$1, 135, 0, 3642);
    		},
    		l: function claim(nodes) {
    			throw new Error_1("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t0, anchor);
    			insert_dev(target, main, anchor);
    			append_dev(main, div);
    			append_dev(div, button0);
    			append_dev(button0, t1);
    			append_dev(div, t2);
    			append_dev(div, button1);
    			append_dev(button1, t3);
    			append_dev(div, t4);
    			append_dev(div, button2);
    			append_dev(button2, t5);
    			append_dev(div, t6);
    			append_dev(div, button3);
    			append_dev(button3, t7);
    			append_dev(div, t8);
    			append_dev(div, button4);
    			append_dev(button4, t9);
    			append_dev(div, t10);
    			append_dev(div, button5);
    			append_dev(button5, t11);
    			append_dev(div, t12);
    			append_dev(div, button6);
    			append_dev(button6, t13);
    			append_dev(div, t14);
    			append_dev(div, button7);
    			append_dev(button7, t15);
    			append_dev(div, t16);
    			append_dev(div, br0);
    			append_dev(div, t17);
    			append_dev(div, br1);
    			append_dev(main, t18);
    			if (if_block0) if_block0.m(main, null);
    			append_dev(main, t19);
    			if (if_block1) if_block1.m(main, null);
    			append_dev(main, t20);
    			if (if_block2) if_block2.m(main, null);
    			append_dev(main, t21);
    			if (if_block3) if_block3.m(main, null);
    			append_dev(main, t22);
    			if (if_block4) if_block4.m(main, null);
    			append_dev(main, t23);
    			if (if_block5) if_block5.m(main, null);
    			append_dev(main, t24);
    			if (if_block6) if_block6.m(main, null);
    			append_dev(main, t25);
    			if (if_block7) if_block7.m(main, null);
    			current = true;

    			if (!mounted) {
    				dispose = [
    					listen_dev(window_1, "scroll", () => {
    						scrolling = true;
    						clearTimeout(scrolling_timeout);
    						scrolling_timeout = setTimeout(clear_scrolling, 100);
    						/*onwindowscroll*/ ctx[20]();
    					}),
    					listen_dev(document_1.body, "wheel", /*handleMousemove*/ ctx[18], false, false, false),
    					listen_dev(button0, "click", /*click_handler*/ ctx[21], false, false, false),
    					listen_dev(button1, "click", /*click_handler_1*/ ctx[22], false, false, false),
    					listen_dev(button2, "click", /*click_handler_2*/ ctx[23], false, false, false),
    					listen_dev(button3, "click", /*click_handler_3*/ ctx[24], false, false, false),
    					listen_dev(button4, "click", /*click_handler_4*/ ctx[25], false, false, false),
    					listen_dev(button5, "click", /*click_handler_5*/ ctx[26], false, false, false),
    					listen_dev(button6, "click", /*click_handler_6*/ ctx[27], false, false, false),
    					listen_dev(button7, "click", /*click_handler_7*/ ctx[28], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*Y*/ 1024 && !scrolling) {
    				scrolling = true;
    				clearTimeout(scrolling_timeout);
    				scrollTo(window_1.pageXOffset, /*Y*/ ctx[10]);
    				scrolling_timeout = setTimeout(clear_scrolling, 100);
    			}

    			if (!current || dirty[0] & /*S0*/ 1 && button0_class_value !== (button0_class_value = "BarBtn " + /*S0*/ ctx[0] + " svelte-jor2d9")) {
    				attr_dev(button0, "class", button0_class_value);
    			}

    			if (!current || dirty[0] & /*S1*/ 2 && button1_class_value !== (button1_class_value = "BarBtn " + /*S1*/ ctx[1] + " svelte-jor2d9")) {
    				attr_dev(button1, "class", button1_class_value);
    			}

    			if (!current || dirty[0] & /*S2*/ 4 && button2_class_value !== (button2_class_value = "BarBtn " + /*S2*/ ctx[2] + " svelte-jor2d9")) {
    				attr_dev(button2, "class", button2_class_value);
    			}

    			if (!current || dirty[0] & /*S3*/ 8 && button3_class_value !== (button3_class_value = "BarBtn " + /*S3*/ ctx[3] + " svelte-jor2d9")) {
    				attr_dev(button3, "class", button3_class_value);
    			}

    			if (!current || dirty[0] & /*S4*/ 16 && button4_class_value !== (button4_class_value = "BarBtn " + /*S4*/ ctx[4] + " svelte-jor2d9")) {
    				attr_dev(button4, "class", button4_class_value);
    			}

    			if (!current || dirty[0] & /*S5*/ 32 && button5_class_value !== (button5_class_value = "BarBtn " + /*S5*/ ctx[5] + " svelte-jor2d9")) {
    				attr_dev(button5, "class", button5_class_value);
    			}

    			if (!current || dirty[0] & /*S6*/ 64 && button6_class_value !== (button6_class_value = "BarBtn " + /*S6*/ ctx[6] + " svelte-jor2d9")) {
    				attr_dev(button6, "class", button6_class_value);
    			}

    			if (!current || dirty[0] & /*S7*/ 128 && button7_class_value !== (button7_class_value = "BarBtn " + /*S7*/ ctx[7] + " svelte-jor2d9")) {
    				attr_dev(button7, "class", button7_class_value);
    			}

    			if (/*SelSubPage*/ ctx[8] == 0) {
    				if (if_block0) {
    					if_block0.p(ctx, dirty);

    					if (dirty[0] & /*SelSubPage*/ 256) {
    						transition_in(if_block0, 1);
    					}
    				} else {
    					if_block0 = create_if_block_20(ctx);
    					if_block0.c();
    					transition_in(if_block0, 1);
    					if_block0.m(main, t19);
    				}
    			} else if (if_block0) {
    				group_outros();

    				transition_out(if_block0, 1, 1, () => {
    					if_block0 = null;
    				});

    				check_outros();
    			}

    			if (/*SelSubPage*/ ctx[8] == 1) {
    				if (if_block1) {
    					if (dirty[0] & /*SelSubPage*/ 256) {
    						transition_in(if_block1, 1);
    					}
    				} else {
    					if_block1 = create_if_block_19(ctx);
    					if_block1.c();
    					transition_in(if_block1, 1);
    					if_block1.m(main, t20);
    				}
    			} else if (if_block1) {
    				group_outros();

    				transition_out(if_block1, 1, 1, () => {
    					if_block1 = null;
    				});

    				check_outros();
    			}

    			if (/*SelSubPage*/ ctx[8] == 2) {
    				if (if_block2) {
    					if_block2.p(ctx, dirty);

    					if (dirty[0] & /*SelSubPage*/ 256) {
    						transition_in(if_block2, 1);
    					}
    				} else {
    					if_block2 = create_if_block_15(ctx);
    					if_block2.c();
    					transition_in(if_block2, 1);
    					if_block2.m(main, t21);
    				}
    			} else if (if_block2) {
    				group_outros();

    				transition_out(if_block2, 1, 1, () => {
    					if_block2 = null;
    				});

    				check_outros();
    			}

    			if (/*SelSubPage*/ ctx[8] == 3) {
    				if (if_block3) {
    					if_block3.p(ctx, dirty);

    					if (dirty[0] & /*SelSubPage*/ 256) {
    						transition_in(if_block3, 1);
    					}
    				} else {
    					if_block3 = create_if_block_12(ctx);
    					if_block3.c();
    					transition_in(if_block3, 1);
    					if_block3.m(main, t22);
    				}
    			} else if (if_block3) {
    				group_outros();

    				transition_out(if_block3, 1, 1, () => {
    					if_block3 = null;
    				});

    				check_outros();
    			}

    			if (/*SelSubPage*/ ctx[8] == 4) {
    				if (if_block4) {
    					if_block4.p(ctx, dirty);

    					if (dirty[0] & /*SelSubPage*/ 256) {
    						transition_in(if_block4, 1);
    					}
    				} else {
    					if_block4 = create_if_block_9(ctx);
    					if_block4.c();
    					transition_in(if_block4, 1);
    					if_block4.m(main, t23);
    				}
    			} else if (if_block4) {
    				group_outros();

    				transition_out(if_block4, 1, 1, () => {
    					if_block4 = null;
    				});

    				check_outros();
    			}

    			if (/*SelSubPage*/ ctx[8] == 5) {
    				if (if_block5) {
    					if_block5.p(ctx, dirty);

    					if (dirty[0] & /*SelSubPage*/ 256) {
    						transition_in(if_block5, 1);
    					}
    				} else {
    					if_block5 = create_if_block_6(ctx);
    					if_block5.c();
    					transition_in(if_block5, 1);
    					if_block5.m(main, t24);
    				}
    			} else if (if_block5) {
    				group_outros();

    				transition_out(if_block5, 1, 1, () => {
    					if_block5 = null;
    				});

    				check_outros();
    			}

    			if (/*SelSubPage*/ ctx[8] == 6) {
    				if (if_block6) {
    					if_block6.p(ctx, dirty);

    					if (dirty[0] & /*SelSubPage*/ 256) {
    						transition_in(if_block6, 1);
    					}
    				} else {
    					if_block6 = create_if_block_3$1(ctx);
    					if_block6.c();
    					transition_in(if_block6, 1);
    					if_block6.m(main, t25);
    				}
    			} else if (if_block6) {
    				group_outros();

    				transition_out(if_block6, 1, 1, () => {
    					if_block6 = null;
    				});

    				check_outros();
    			}

    			if (/*SelSubPage*/ ctx[8] == 7) {
    				if (if_block7) {
    					if_block7.p(ctx, dirty);

    					if (dirty[0] & /*SelSubPage*/ 256) {
    						transition_in(if_block7, 1);
    					}
    				} else {
    					if_block7 = create_if_block$1(ctx);
    					if_block7.c();
    					transition_in(if_block7, 1);
    					if_block7.m(main, null);
    				}
    			} else if (if_block7) {
    				group_outros();

    				transition_out(if_block7, 1, 1, () => {
    					if_block7 = null;
    				});

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;

    			add_render_callback(() => {
    				if (!div_transition) div_transition = create_bidirectional_transition(
    					div,
    					scale,
    					{
    						duration: 800,
    						delay: 50,
    						opacity: 0.5,
    						start: 0
    					},
    					true
    				);

    				div_transition.run(1);
    			});

    			transition_in(if_block0);
    			transition_in(if_block1);
    			transition_in(if_block2);
    			transition_in(if_block3);
    			transition_in(if_block4);
    			transition_in(if_block5);
    			transition_in(if_block6);
    			transition_in(if_block7);
    			current = true;
    		},
    		o: function outro(local) {
    			if (!div_transition) div_transition = create_bidirectional_transition(
    				div,
    				scale,
    				{
    					duration: 800,
    					delay: 50,
    					opacity: 0.5,
    					start: 0
    				},
    				false
    			);

    			div_transition.run(0);
    			transition_out(if_block0);
    			transition_out(if_block1);
    			transition_out(if_block2);
    			transition_out(if_block3);
    			transition_out(if_block4);
    			transition_out(if_block5);
    			transition_out(if_block6);
    			transition_out(if_block7);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(main);
    			if (detaching && div_transition) div_transition.end();
    			if (if_block0) if_block0.d();
    			if (if_block1) if_block1.d();
    			if (if_block2) if_block2.d();
    			if (if_block3) if_block3.d();
    			if (if_block4) if_block4.d();
    			if (if_block5) if_block5.d();
    			if (if_block6) if_block6.d();
    			if (if_block7) if_block7.d();
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$1.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$1($$self, $$props, $$invalidate) {
    	let $direction;
    	validate_store(direction, 'direction');
    	component_subscribe($$self, direction, $$value => $$invalidate(32, $direction = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('CropYield', slots, []);
    	let S0, S1, S2, S3, S4, S5, S6, S7;
    	let SelectionClass = "BarBtnSel";
    	S0 = SelectionClass;
    	let SelSubPage = 0;
    	let totalPageContent = 1;
    	let pageContent = 1;
    	let Y;
    	let SelCrop;
    	let quant;
    	let showYield = false;
    	let xPR, xWT, xGP;

    	function SelectSubPage(p) {
    		$$invalidate(9, pageContent = 1);
    		$$invalidate(8, SelSubPage = p);
    		$$invalidate(0, S0 = $$invalidate(1, S1 = $$invalidate(2, S2 = $$invalidate(3, S3 = $$invalidate(4, S4 = $$invalidate(5, S5 = $$invalidate(6, S6 = $$invalidate(7, S7 = ''))))))));

    		switch (p) {
    			case 0:
    				$$invalidate(0, S0 = SelectionClass);
    				totalPageContent = 1;
    				break;
    			case 1:
    				$$invalidate(1, S1 = SelectionClass);
    				totalPageContent = 1;
    				break;
    			case 2:
    				$$invalidate(2, S2 = SelectionClass);
    				totalPageContent = 3;
    				break;
    			case 3:
    				$$invalidate(3, S3 = SelectionClass);
    				totalPageContent = 2;
    				break;
    			case 4:
    				$$invalidate(4, S4 = SelectionClass);
    				totalPageContent = 2;
    				break;
    			case 5:
    				$$invalidate(5, S5 = SelectionClass);
    				totalPageContent = 2;
    				break;
    			case 6:
    				$$invalidate(6, S6 = SelectionClass);
    				totalPageContent = 2;
    				break;
    			case 7:
    				$$invalidate(7, S7 = SelectionClass);
    				totalPageContent = 2;
    				break;
    		}

    		checkDirection();
    	}

    	function nextContent(event) {
    		if (Math.round(Y) == document.documentElement.scrollHeight - window.innerHeight) if (pageContent < totalPageContent) $$invalidate(9, pageContent++, pageContent);

    		// direction.update(n => 1);
    		checkDirection();
    	}

    	function prevContent() {
    		$$invalidate(9, pageContent--, pageContent);
    		if (pageContent <= 0) $$invalidate(9, pageContent = 1);

    		// direction.update(n => -1);        
    		checkDirection();
    	}

    	function handleMousemove(event) {
    		event.preventDefault();
    		if (event.deltaY > 0) nextContent(); else prevContent();
    	}

    	function checkDirection() {
    		if (totalPageContent == 1) {
    			set_store_value(direction, $direction = 0, $direction);
    			return;
    		}

    		if (pageContent < totalPageContent) set_store_value(direction, $direction = 1, $direction); else set_store_value(direction, $direction = -1, $direction);
    	}

    	async function fetechYield() {
    		let INPUT = { Crop: SelCrop, Quant: quant };

    		let ModelResponse = await fetch('/GetYield', {
    			method: "POST",
    			body: JSON.stringify(INPUT),
    			headers: new Headers({ "content-type": "application/json" })
    		});

    		if (!ModelResponse.ok) throw new Error();
    		return await ModelResponse.json();
    	}

    	async function FindYield() {
    		fetechYield().then(res => {
    			$$invalidate(14, xPR = res['Price']);
    			$$invalidate(15, xWT = res['Water']);
    			$$invalidate(16, xGP = res['GD']);
    			$$invalidate(13, showYield = true);
    		}).catch(err => {
    			
    		});
    	}

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<CropYield> was created with unknown prop '${key}'`);
    	});

    	function onwindowscroll() {
    		$$invalidate(10, Y = window_1.pageYOffset);
    	}

    	const click_handler = () => SelectSubPage(0);
    	const click_handler_1 = () => SelectSubPage(1);
    	const click_handler_2 = () => SelectSubPage(2);
    	const click_handler_3 = () => SelectSubPage(3);
    	const click_handler_4 = () => SelectSubPage(4);
    	const click_handler_5 = () => SelectSubPage(5);
    	const click_handler_6 = () => SelectSubPage(6);
    	const click_handler_7 = () => SelectSubPage(7);

    	function select_change_handler() {
    		SelCrop = select_value(this);
    		$$invalidate(11, SelCrop);
    	}

    	function input_input_handler() {
    		quant = to_number(this.value);
    		$$invalidate(12, quant);
    	}

    	$$self.$capture_state = () => ({
    		page,
    		slide,
    		fade,
    		scale,
    		direction,
    		S0,
    		S1,
    		S2,
    		S3,
    		S4,
    		S5,
    		S6,
    		S7,
    		SelectionClass,
    		SelSubPage,
    		totalPageContent,
    		pageContent,
    		Y,
    		SelCrop,
    		quant,
    		showYield,
    		xPR,
    		xWT,
    		xGP,
    		SelectSubPage,
    		nextContent,
    		prevContent,
    		handleMousemove,
    		checkDirection,
    		fetechYield,
    		FindYield,
    		$direction
    	});

    	$$self.$inject_state = $$props => {
    		if ('S0' in $$props) $$invalidate(0, S0 = $$props.S0);
    		if ('S1' in $$props) $$invalidate(1, S1 = $$props.S1);
    		if ('S2' in $$props) $$invalidate(2, S2 = $$props.S2);
    		if ('S3' in $$props) $$invalidate(3, S3 = $$props.S3);
    		if ('S4' in $$props) $$invalidate(4, S4 = $$props.S4);
    		if ('S5' in $$props) $$invalidate(5, S5 = $$props.S5);
    		if ('S6' in $$props) $$invalidate(6, S6 = $$props.S6);
    		if ('S7' in $$props) $$invalidate(7, S7 = $$props.S7);
    		if ('SelectionClass' in $$props) SelectionClass = $$props.SelectionClass;
    		if ('SelSubPage' in $$props) $$invalidate(8, SelSubPage = $$props.SelSubPage);
    		if ('totalPageContent' in $$props) totalPageContent = $$props.totalPageContent;
    		if ('pageContent' in $$props) $$invalidate(9, pageContent = $$props.pageContent);
    		if ('Y' in $$props) $$invalidate(10, Y = $$props.Y);
    		if ('SelCrop' in $$props) $$invalidate(11, SelCrop = $$props.SelCrop);
    		if ('quant' in $$props) $$invalidate(12, quant = $$props.quant);
    		if ('showYield' in $$props) $$invalidate(13, showYield = $$props.showYield);
    		if ('xPR' in $$props) $$invalidate(14, xPR = $$props.xPR);
    		if ('xWT' in $$props) $$invalidate(15, xWT = $$props.xWT);
    		if ('xGP' in $$props) $$invalidate(16, xGP = $$props.xGP);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		S0,
    		S1,
    		S2,
    		S3,
    		S4,
    		S5,
    		S6,
    		S7,
    		SelSubPage,
    		pageContent,
    		Y,
    		SelCrop,
    		quant,
    		showYield,
    		xPR,
    		xWT,
    		xGP,
    		SelectSubPage,
    		handleMousemove,
    		FindYield,
    		onwindowscroll,
    		click_handler,
    		click_handler_1,
    		click_handler_2,
    		click_handler_3,
    		click_handler_4,
    		click_handler_5,
    		click_handler_6,
    		click_handler_7,
    		select_change_handler,
    		input_input_handler
    	];
    }

    class CropYield extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$1, create_fragment$1, safe_not_equal, {}, null, [-1, -1]);

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "CropYield",
    			options,
    			id: create_fragment$1.name
    		});
    	}
    }

    /* src\App.svelte generated by Svelte v3.40.1 */
    const file = "src\\App.svelte";

    // (36:2) {#if load}
    function create_if_block_3(ctx) {
    	let div1;
    	let a0;
    	let button0;
    	let button0_intro;
    	let t1;
    	let div0;
    	let a1;
    	let button1;
    	let t3;
    	let a2;
    	let button2;
    	let t5;
    	let a3;
    	let button3;
    	let div0_intro;
    	let div1_intro;

    	const block = {
    		c: function create() {
    			div1 = element("div");
    			a0 = element("a");
    			button0 = element("button");
    			button0.textContent = "AgroML";
    			t1 = space();
    			div0 = element("div");
    			a1 = element("a");
    			button1 = element("button");
    			button1.textContent = "Crop prediction";
    			t3 = space();
    			a2 = element("a");
    			button2 = element("button");
    			button2.textContent = "Crop Yield";
    			t5 = space();
    			a3 = element("a");
    			button3 = element("button");
    			button3.textContent = "Plant Disease";
    			attr_dev(button0, "class", "TitleButton svelte-1stjuyz");
    			add_location(button0, file, 38, 5, 1092);
    			attr_dev(a0, "href", "/");
    			add_location(a0, file, 37, 4, 1074);
    			attr_dev(button1, "class", "TitleButton svelte-1stjuyz");
    			add_location(button1, file, 44, 6, 1299);
    			attr_dev(a1, "href", "/Crop");
    			add_location(a1, file, 43, 5, 1272);
    			attr_dev(button2, "class", "TitleButton svelte-1stjuyz");
    			add_location(button2, file, 49, 6, 1414);
    			attr_dev(a2, "href", "/CropYield");
    			add_location(a2, file, 48, 5, 1382);
    			attr_dev(button3, "class", "TitleButton svelte-1stjuyz");
    			add_location(button3, file, 54, 6, 1528);
    			attr_dev(a3, "href", "/PlantDisease");
    			add_location(a3, file, 53, 5, 1493);
    			attr_dev(div0, "id", "Pages");
    			attr_dev(div0, "class", "svelte-1stjuyz");
    			add_location(div0, file, 42, 4, 1209);
    			attr_dev(div1, "id", "Title");
    			attr_dev(div1, "class", "svelte-1stjuyz");
    			add_location(div1, file, 36, 3, 1015);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div1, anchor);
    			append_dev(div1, a0);
    			append_dev(a0, button0);
    			append_dev(div1, t1);
    			append_dev(div1, div0);
    			append_dev(div0, a1);
    			append_dev(a1, button1);
    			append_dev(div0, t3);
    			append_dev(div0, a2);
    			append_dev(a2, button2);
    			append_dev(div0, t5);
    			append_dev(div0, a3);
    			append_dev(a3, button3);
    		},
    		i: function intro(local) {
    			if (!button0_intro) {
    				add_render_callback(() => {
    					button0_intro = create_in_transition(button0, fly, { x: -500, duration: 1200, delay: 600 });
    					button0_intro.start();
    				});
    			}

    			if (!div0_intro) {
    				add_render_callback(() => {
    					div0_intro = create_in_transition(div0, fade, { duration: 1000, delay: 1000 });
    					div0_intro.start();
    				});
    			}

    			if (!div1_intro) {
    				add_render_callback(() => {
    					div1_intro = create_in_transition(div1, fly, { y: -500, duration: 800 });
    					div1_intro.start();
    				});
    			}
    		},
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div1);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_3.name,
    		type: "if",
    		source: "(36:2) {#if load}",
    		ctx
    	});

    	return block;
    }

    // (63:2) {#if switched}
    function create_if_block_2(ctx) {
    	let div;
    	let switch_instance;
    	let current;
    	var switch_value = /*page*/ ctx[1];

    	function switch_props(ctx) {
    		return { $$inline: true };
    	}

    	if (switch_value) {
    		switch_instance = new switch_value(switch_props());
    	}

    	const block = {
    		c: function create() {
    			div = element("div");
    			if (switch_instance) create_component(switch_instance.$$.fragment);
    			attr_dev(div, "id", "Content");
    			attr_dev(div, "class", "svelte-1stjuyz");
    			add_location(div, file, 63, 3, 1656);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);

    			if (switch_instance) {
    				mount_component(switch_instance, div, null);
    			}

    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (switch_value !== (switch_value = /*page*/ ctx[1])) {
    				if (switch_instance) {
    					group_outros();
    					const old_component = switch_instance;

    					transition_out(old_component.$$.fragment, 1, 0, () => {
    						destroy_component(old_component, 1);
    					});

    					check_outros();
    				}

    				if (switch_value) {
    					switch_instance = new switch_value(switch_props());
    					create_component(switch_instance.$$.fragment);
    					transition_in(switch_instance.$$.fragment, 1);
    					mount_component(switch_instance, div, null);
    				} else {
    					switch_instance = null;
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			if (switch_instance) transition_in(switch_instance.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			if (switch_instance) transition_out(switch_instance.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if (switch_instance) destroy_component(switch_instance);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_2.name,
    		type: "if",
    		source: "(63:2) {#if switched}",
    		ctx
    	});

    	return block;
    }

    // (72:28) 
    function create_if_block_1(ctx) {
    	let div;
    	let div_transition;
    	let current;

    	const block = {
    		c: function create() {
    			div = element("div");
    			attr_dev(div, "class", "Arrow svelte-1stjuyz");
    			set_style(div, "bottom", "100px");
    			set_style(div, "background-image", "url('down.png')");
    			add_location(div, file, 72, 3, 1928);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			current = true;
    		},
    		i: function intro(local) {
    			if (current) return;

    			add_render_callback(() => {
    				if (!div_transition) div_transition = create_bidirectional_transition(div, fade, { duration: 800, delay: 100 }, true);
    				div_transition.run(1);
    			});

    			current = true;
    		},
    		o: function outro(local) {
    			if (!div_transition) div_transition = create_bidirectional_transition(div, fade, { duration: 800, delay: 100 }, false);
    			div_transition.run(0);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if (detaching && div_transition) div_transition.end();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1.name,
    		type: "if",
    		source: "(72:28) ",
    		ctx
    	});

    	return block;
    }

    // (69:2) {#if $direction == -1}
    function create_if_block(ctx) {
    	let div;
    	let div_transition;
    	let current;

    	const block = {
    		c: function create() {
    			div = element("div");
    			attr_dev(div, "class", "Arrow svelte-1stjuyz");
    			set_style(div, "top", "200px");
    			set_style(div, "background-image", "url('up.png')");
    			add_location(div, file, 69, 3, 1765);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			current = true;
    		},
    		i: function intro(local) {
    			if (current) return;

    			add_render_callback(() => {
    				if (!div_transition) div_transition = create_bidirectional_transition(div, fade, { duration: 800, delay: 100 }, true);
    				div_transition.run(1);
    			});

    			current = true;
    		},
    		o: function outro(local) {
    			if (!div_transition) div_transition = create_bidirectional_transition(div, fade, { duration: 800, delay: 100 }, false);
    			div_transition.run(0);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if (detaching && div_transition) div_transition.end();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block.name,
    		type: "if",
    		source: "(69:2) {#if $direction == -1}",
    		ctx
    	});

    	return block;
    }

    function create_fragment(ctx) {
    	let div0;
    	let t0;
    	let div1;
    	let t1;
    	let t2;
    	let current_block_type_index;
    	let if_block2;
    	let current;
    	let if_block0 = /*load*/ ctx[0] && create_if_block_3(ctx);
    	let if_block1 = /*switched*/ ctx[2] && create_if_block_2(ctx);
    	const if_block_creators = [create_if_block, create_if_block_1];
    	const if_blocks = [];

    	function select_block_type(ctx, dirty) {
    		if (/*$direction*/ ctx[3] == -1) return 0;
    		if (/*$direction*/ ctx[3] == 1) return 1;
    		return -1;
    	}

    	if (~(current_block_type_index = select_block_type(ctx))) {
    		if_block2 = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    	}

    	const block = {
    		c: function create() {
    			div0 = element("div");
    			t0 = space();
    			div1 = element("div");
    			if (if_block0) if_block0.c();
    			t1 = space();
    			if (if_block1) if_block1.c();
    			t2 = space();
    			if (if_block2) if_block2.c();
    			attr_dev(div0, "id", "backdrop");
    			set_style(div0, "background-image", "url('Dark Gradient 04.png')");
    			attr_dev(div0, "class", "svelte-1stjuyz");
    			add_location(div0, file, 31, 0, 897);
    			attr_dev(div1, "id", "main");
    			attr_dev(div1, "class", "svelte-1stjuyz");
    			add_location(div1, file, 33, 0, 981);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div0, anchor);
    			insert_dev(target, t0, anchor);
    			insert_dev(target, div1, anchor);
    			if (if_block0) if_block0.m(div1, null);
    			append_dev(div1, t1);
    			if (if_block1) if_block1.m(div1, null);
    			append_dev(div1, t2);

    			if (~current_block_type_index) {
    				if_blocks[current_block_type_index].m(div1, null);
    			}

    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (/*load*/ ctx[0]) {
    				if (if_block0) {
    					if (dirty & /*load*/ 1) {
    						transition_in(if_block0, 1);
    					}
    				} else {
    					if_block0 = create_if_block_3(ctx);
    					if_block0.c();
    					transition_in(if_block0, 1);
    					if_block0.m(div1, t1);
    				}
    			} else if (if_block0) {
    				if_block0.d(1);
    				if_block0 = null;
    			}

    			if (/*switched*/ ctx[2]) {
    				if (if_block1) {
    					if_block1.p(ctx, dirty);

    					if (dirty & /*switched*/ 4) {
    						transition_in(if_block1, 1);
    					}
    				} else {
    					if_block1 = create_if_block_2(ctx);
    					if_block1.c();
    					transition_in(if_block1, 1);
    					if_block1.m(div1, t2);
    				}
    			} else if (if_block1) {
    				group_outros();

    				transition_out(if_block1, 1, 1, () => {
    					if_block1 = null;
    				});

    				check_outros();
    			}

    			let previous_block_index = current_block_type_index;
    			current_block_type_index = select_block_type(ctx);

    			if (current_block_type_index !== previous_block_index) {
    				if (if_block2) {
    					group_outros();

    					transition_out(if_blocks[previous_block_index], 1, 1, () => {
    						if_blocks[previous_block_index] = null;
    					});

    					check_outros();
    				}

    				if (~current_block_type_index) {
    					if_block2 = if_blocks[current_block_type_index];

    					if (!if_block2) {
    						if_block2 = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    						if_block2.c();
    					}

    					transition_in(if_block2, 1);
    					if_block2.m(div1, null);
    				} else {
    					if_block2 = null;
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block0);
    			transition_in(if_block1);
    			transition_in(if_block2);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block1);
    			transition_out(if_block2);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div0);
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(div1);
    			if (if_block0) if_block0.d();
    			if (if_block1) if_block1.d();

    			if (~current_block_type_index) {
    				if_blocks[current_block_type_index].d();
    			}
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance($$self, $$props, $$invalidate) {
    	let $direction;
    	validate_store(direction, 'direction');
    	component_subscribe($$self, direction, $$value => $$invalidate(3, $direction = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('App', slots, []);
    	let load = false;

    	function start() {
    		$$invalidate(0, load = true);
    	}

    	setInterval(start);
    	let page$1, switched = false;

    	function switchPage() {
    		$$invalidate(2, switched = true);
    	}

    	page('/', () => {
    		$$invalidate(1, page$1 = Home);
    		$$invalidate(2, switched = false);
    		setTimeout(switchPage, 1000);
    	});

    	page('/Crop', () => {
    		$$invalidate(1, page$1 = Crop);
    		$$invalidate(2, switched = false);
    		setTimeout(switchPage, 1000);
    	});

    	page('/PlantDisease', () => {
    		$$invalidate(1, page$1 = Disease);
    		$$invalidate(2, switched = false);
    		setTimeout(switchPage, 1000);
    	});

    	page('/CropYield', () => {
    		$$invalidate(1, page$1 = CropYield);
    		$$invalidate(2, switched = false);
    		setTimeout(switchPage, 1000);
    	});

    	page.start();
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<App> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({
    		fly,
    		fade,
    		router: page,
    		Home,
    		Crop,
    		Disease,
    		CropYield,
    		direction,
    		bind,
    		element,
    		load,
    		start,
    		page: page$1,
    		switched,
    		switchPage,
    		$direction
    	});

    	$$self.$inject_state = $$props => {
    		if ('load' in $$props) $$invalidate(0, load = $$props.load);
    		if ('page' in $$props) $$invalidate(1, page$1 = $$props.page);
    		if ('switched' in $$props) $$invalidate(2, switched = $$props.switched);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [load, page$1, switched, $direction];
    }

    class App extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance, create_fragment, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "App",
    			options,
    			id: create_fragment.name
    		});
    	}
    }

    const app = new App({
    	target: document.body,
    	props: {
    		name: 'world'
    	}
    });

    exports.app = app;
    exports.default = app;

    Object.defineProperty(exports, '__esModule', { value: true });

    return exports;

}({}));
//# sourceMappingURL=bundle.js.map
