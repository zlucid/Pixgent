
(function(l, r) { if (!l || l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (self.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.getElementsByTagName('head')[0].appendChild(r) })(self.document);
var app = (function () {
    'use strict';

    function noop$1() { }
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
    function safe_not_equal$1(a, b) {
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
            return noop$1;
        }
        const unsub = store.subscribe(...callbacks);
        return unsub.unsubscribe ? () => unsub.unsubscribe() : unsub;
    }
    function component_subscribe(component, store, callback) {
        component.$$.on_destroy.push(subscribe(store, callback));
    }
    function append(target, node) {
        target.appendChild(node);
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
    function attr(node, attribute, value) {
        if (value == null)
            node.removeAttribute(attribute);
        else if (node.getAttribute(attribute) !== value)
            node.setAttribute(attribute, value);
    }
    function children(element) {
        return Array.from(element.childNodes);
    }
    function custom_event(type, detail, bubbles = false) {
        const e = document.createEvent('CustomEvent');
        e.initCustomEvent(type, bubbles, false, detail);
        return e;
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
    // flush() calls callbacks in this order:
    // 1. All beforeUpdate callbacks, in order: parents before children
    // 2. All bind:this callbacks, in reverse order: children before parents.
    // 3. All afterUpdate callbacks, in order: parents before children. EXCEPT
    //    for afterUpdates called during the initial onMount, which are called in
    //    reverse order: children before parents.
    // Since callbacks might update component values, which could trigger another
    // call to flush(), the following steps guard against this:
    // 1. During beforeUpdate, any updated components will be added to the
    //    dirty_components array and will cause a reentrant call to flush(). Because
    //    the flush index is kept outside the function, the reentrant call will pick
    //    up where the earlier call left off and go through all dirty components. The
    //    current_component value is saved and restored so that the reentrant call will
    //    not interfere with the "parent" flush() call.
    // 2. bind:this callbacks cannot trigger new flush() calls.
    // 3. During afterUpdate, any updated components will NOT have their afterUpdate
    //    callback called a second time; the seen_callbacks set, outside the flush()
    //    function, guarantees this behavior.
    const seen_callbacks = new Set();
    let flushidx = 0; // Do *not* move this inside the flush() function
    function flush() {
        const saved_component = current_component;
        do {
            // first, call beforeUpdate functions
            // and update components
            while (flushidx < dirty_components.length) {
                const component = dirty_components[flushidx];
                flushidx++;
                set_current_component(component);
                update(component.$$);
            }
            set_current_component(null);
            dirty_components.length = 0;
            flushidx = 0;
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
        seen_callbacks.clear();
        set_current_component(saved_component);
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
    const outroing = new Set();
    function transition_in(block, local) {
        if (block && block.i) {
            outroing.delete(block);
            block.i(local);
        }
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
            update: noop$1,
            not_equal,
            bound: blank_object(),
            // lifecycle
            on_mount: [],
            on_destroy: [],
            on_disconnect: [],
            before_update: [],
            after_update: [],
            context: new Map(options.context || (parent_component ? parent_component.$$.context : [])),
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
            this.$destroy = noop$1;
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
        document.dispatchEvent(custom_event(type, Object.assign({ version: '3.46.4' }, detail), true));
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

    // node_modules/svelte/internal/index.mjs
    function noop() {
    }
    function safe_not_equal(a, b) {
      return a != a ? b == b : a !== b || (a && typeof a === "object" || typeof a === "function");
    }
    Promise.resolve();

    // node_modules/svelte/store/index.mjs
    var subscriber_queue = [];
    function readable(value, start) {
      return {
        subscribe: writable(value, start).subscribe
      };
    }
    function writable(value, start = noop) {
      let stop;
      const subscribers = new Set();
      function set(new_value) {
        if (safe_not_equal(value, new_value)) {
          value = new_value;
          if (stop) {
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
      function subscribe2(run2, invalidate = noop) {
        const subscriber = [run2, invalidate];
        subscribers.add(subscriber);
        if (subscribers.size === 1) {
          stop = start(set) || noop;
        }
        run2(value);
        return () => {
          subscribers.delete(subscriber);
          if (subscribers.size === 0) {
            stop();
            stop = null;
          }
        };
      }
      return { set, update, subscribe: subscribe2 };
    }

    // src/index.ts
    var API_URL = "https://api.lanyard.rest/v1";
    var WS_URL = "wss://api.lanyard.rest/socket";
    var WS_HEARTBEAT = 3e4;
    function useLanyard(id, method) {
      if (!id)
        throw new Error("A Discord user ID must be specified");
      const lanyardData = readable(void 0, (set) => {
        if (method && method.type === "rest") {
          let fetchLanyardData = function() {
            fetch(`${API_URL}/users/${id}`).then((res) => {
              res.json().then((res2) => {
                var _a;
                if (!res2.success)
                  throw new Error(((_a = res2.error) == null ? void 0 : _a.message) || "An unknown error occurred");
                set(res2.data);
              });
            });
          };
          if (!("fetch" in window))
            throw new Error("svelte-lanyard only works clientside");
          fetchLanyardData();
          const interval = setInterval(() => {
            fetchLanyardData();
          }, method.restInterval);
          return function stop() {
            clearInterval(interval);
          };
        } else {
          if (!("WebSocket" in window || "MozWebSocket" in window))
            throw new Error("svelte-lanyard only works clientside");
          const socket = new WebSocket(WS_URL);
          let interval;
          socket.addEventListener("open", () => {
            socket.send(JSON.stringify({
              op: 2,
              d: {
                subscribe_to_id: id
              }
            }));
            interval = setInterval(() => {
              socket.send(JSON.stringify({ op: 3 }));
            }, WS_HEARTBEAT);
          });
          socket.addEventListener("message", ({ data }) => {
            const { op, seq, t, d } = JSON.parse(data);
            if (t === "INIT_STATE" || t === "PRESENCE_UPDATE")
              set(d);
          });
          return function stop() {
            socket.close();
            clearInterval(interval);
          };
        }
      });
      return lanyardData;
    }

    /* src\App.svelte generated by Svelte v3.46.4 */
    const file = "src\\App.svelte";

    // (64:4) {:else}
    function create_else_block(ctx) {
    	let h3;

    	const block = {
    		c: function create() {
    			h3 = element("h3");
    			h3.textContent = "Please wait...";
    			attr_dev(h3, "class", "text-white text-3xl absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2");
    			add_location(h3, file, 64, 1, 3370);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, h3, anchor);
    		},
    		p: noop$1,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(h3);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block.name,
    		type: "else",
    		source: "(64:4) {:else}",
    		ctx
    	});

    	return block;
    }

    // (7:1) {#if $data}
    function create_if_block(ctx) {
    	let div0;
    	let img;
    	let img_src_value;
    	let img_alt_value;
    	let t0;
    	let t1;
    	let t2;
    	let t3;
    	let t4;
    	let div1;
    	let center0;
    	let h20;
    	let t5_value = /*$data*/ ctx[0].discord_user.username + "";
    	let t5;
    	let t6;
    	let span;
    	let t7;
    	let t8_value = /*$data*/ ctx[0].discord_user.discriminator + "";
    	let t8;
    	let t9;
    	let p0;
    	let t11;
    	let div2;
    	let center1;
    	let h21;
    	let t13;
    	let div3;
    	let center2;
    	let p1;
    	let t15;
    	let a0;
    	let t17;
    	let div4;
    	let center3;
    	let h22;
    	let t19;
    	let div5;
    	let center4;
    	let h10;
    	let t21;
    	let p2;
    	let t23;
    	let a1;
    	let t25;
    	let div6;
    	let center5;
    	let h11;
    	let t27;
    	let p3;
    	let t29;
    	let a2;
    	let if_block0 = /*$data*/ ctx[0].discord_status === 'dnd' && create_if_block_4(ctx);
    	let if_block1 = /*$data*/ ctx[0].discord_status === 'online' && create_if_block_3(ctx);
    	let if_block2 = /*$data*/ ctx[0].discord_status === 'idle' && create_if_block_2(ctx);
    	let if_block3 = /*$data*/ ctx[0].discord_status === 'offline' && create_if_block_1(ctx);

    	const block = {
    		c: function create() {
    			div0 = element("div");
    			img = element("img");
    			t0 = space();
    			if (if_block0) if_block0.c();
    			t1 = space();
    			if (if_block1) if_block1.c();
    			t2 = space();
    			if (if_block2) if_block2.c();
    			t3 = space();
    			if (if_block3) if_block3.c();
    			t4 = space();
    			div1 = element("div");
    			center0 = element("center");
    			h20 = element("h2");
    			t5 = text(t5_value);
    			t6 = space();
    			span = element("span");
    			t7 = text("#");
    			t8 = text(t8_value);
    			t9 = space();
    			p0 = element("p");
    			p0.textContent = "Front-end Developer";
    			t11 = space();
    			div2 = element("div");
    			center1 = element("center");
    			h21 = element("h2");
    			h21.textContent = "About me";
    			t13 = space();
    			div3 = element("div");
    			center2 = element("center");
    			p1 = element("p");
    			p1.textContent = "I'm stachy. I am self-taught and front-end developer. I do projects and I share these projects on my Github account. You can check out my Github account by clicking the link below.";
    			t15 = space();
    			a0 = element("a");
    			a0.textContent = "Github ↬";
    			t17 = space();
    			div4 = element("div");
    			center3 = element("center");
    			h22 = element("h2");
    			h22.textContent = "Best Projects";
    			t19 = space();
    			div5 = element("div");
    			center4 = element("center");
    			h10 = element("h1");
    			h10.textContent = "2022 - achyStorage";
    			t21 = space();
    			p2 = element("p");
    			p2.textContent = "It is a simple and plain photo upload site.";
    			t23 = space();
    			a1 = element("a");
    			a1.textContent = "Try it out! ↬";
    			t25 = space();
    			div6 = element("div");
    			center5 = element("center");
    			h11 = element("h1");
    			h11.textContent = "2022 - achyAPI";
    			t27 = space();
    			p3 = element("p");
    			p3.textContent = "Generates random api.";
    			t29 = space();
    			a2 = element("a");
    			a2.textContent = "Try it out! ↬";
    			attr_dev(img, "class", "rounded-full absolute ml-auto mr-auto left-0 right-52 w-30 mt-20");
    			if (!src_url_equal(img.src, img_src_value = "https://cdn.discordapp.com/avatars/" + /*$data*/ ctx[0].discord_user.id + "/" + /*$data*/ ctx[0].discord_user.avatar + ".png")) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", img_alt_value = /*$data*/ ctx[0].discord_user.username);
    			add_location(img, file, 9, 2, 165);
    			add_location(div0, file, 8, 1, 156);
    			attr_dev(span, "class", "opacity-60 absolute text-xl top-1.5");
    			add_location(span, file, 26, 103, 1293);
    			attr_dev(h20, "class", "text-3xl absolute ml-auto mr-auto left-16 right-0 top-32");
    			add_location(h20, file, 26, 3, 1193);
    			attr_dev(p0, "class", "text-sm absolute ml-auto mr-auto left-28 right-0 top-[165px] opacity-70");
    			add_location(p0, file, 27, 3, 1397);
    			add_location(center0, file, 25, 2, 1180);
    			attr_dev(div1, "class", "text-white");
    			add_location(div1, file, 24, 1, 1152);
    			attr_dev(h21, "class", "text-white text-4xl");
    			add_location(h21, file, 33, 3, 1608);
    			add_location(center1, file, 32, 2, 1595);
    			attr_dev(div2, "class", "absolute ml-auto mr-auto left-0 right-40 top-64");
    			add_location(div2, file, 31, 1, 1530);
    			attr_dev(p1, "class", "absolute text-white text-sm left-0 px-2 py-2 top-2");
    			add_location(p1, file, 38, 3, 1823);
    			attr_dev(a0, "href", "https://github.com/st4chy");
    			attr_dev(a0, "class", "absolute text-white text-sm left-5 opacity-70 top-32 underline");
    			add_location(a0, file, 39, 3, 2074);
    			add_location(center2, file, 37, 2, 1810);
    			attr_dev(div3, "class", "w-[350px] h-40 rounded-sm flex-col drop-shadow-lg bg-[#383838] flex absolute ml-auto mr-auto left-0 right-0 top-80");
    			add_location(div3, file, 36, 1, 1678);
    			attr_dev(h22, "class", "text-white text-4xl");
    			add_location(h22, file, 45, 3, 2303);
    			add_location(center3, file, 44, 2, 2290);
    			attr_dev(div4, "class", "absolute ml-auto mr-auto left-0 right-28 top-[550px]");
    			add_location(div4, file, 43, 1, 2220);
    			attr_dev(h10, "class", "absolute text-white text-sm opacity-60 left-5 top-2");
    			add_location(h10, file, 50, 3, 2528);
    			attr_dev(p2, "class", "absolute text-white text-sm left-5 top-10");
    			add_location(p2, file, 51, 3, 2620);
    			attr_dev(a1, "href", "https://achystorage.rick-roll.xyz");
    			attr_dev(a1, "class", "absolute text-white text-sm left-5 opacity-70 top-20 underline");
    			add_location(a1, file, 52, 3, 2725);
    			add_location(center4, file, 49, 2, 2515);
    			attr_dev(div5, "class", "w-[350px] h-28 rounded-sm flex-col drop-shadow-lg bg-[#383838] flex absolute ml-auto mr-auto left-0 right-0 top-[610px]");
    			add_location(div5, file, 48, 1, 2378);
    			attr_dev(h11, "class", "absolute text-white text-sm opacity-60 left-5 top-2");
    			add_location(h11, file, 57, 3, 3032);
    			attr_dev(p3, "class", "absolute text-white text-sm left-5 top-10");
    			add_location(p3, file, 58, 3, 3120);
    			attr_dev(a2, "href", "http://achyapi.rick-roll.xyz");
    			attr_dev(a2, "class", "absolute text-white text-sm left-5 opacity-70 top-20 underline");
    			add_location(a2, file, 59, 3, 3203);
    			add_location(center5, file, 56, 2, 3019);
    			attr_dev(div6, "class", "w-[350px] h-28 rounded-sm flex-col drop-shadow-lg bg-[#383838] flex absolute ml-auto mr-auto left-0 right-0 top-[750px]");
    			add_location(div6, file, 55, 1, 2882);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div0, anchor);
    			append_dev(div0, img);
    			append_dev(div0, t0);
    			if (if_block0) if_block0.m(div0, null);
    			append_dev(div0, t1);
    			if (if_block1) if_block1.m(div0, null);
    			append_dev(div0, t2);
    			if (if_block2) if_block2.m(div0, null);
    			append_dev(div0, t3);
    			if (if_block3) if_block3.m(div0, null);
    			insert_dev(target, t4, anchor);
    			insert_dev(target, div1, anchor);
    			append_dev(div1, center0);
    			append_dev(center0, h20);
    			append_dev(h20, t5);
    			append_dev(h20, t6);
    			append_dev(h20, span);
    			append_dev(span, t7);
    			append_dev(span, t8);
    			append_dev(center0, t9);
    			append_dev(center0, p0);
    			insert_dev(target, t11, anchor);
    			insert_dev(target, div2, anchor);
    			append_dev(div2, center1);
    			append_dev(center1, h21);
    			insert_dev(target, t13, anchor);
    			insert_dev(target, div3, anchor);
    			append_dev(div3, center2);
    			append_dev(center2, p1);
    			append_dev(center2, t15);
    			append_dev(center2, a0);
    			insert_dev(target, t17, anchor);
    			insert_dev(target, div4, anchor);
    			append_dev(div4, center3);
    			append_dev(center3, h22);
    			insert_dev(target, t19, anchor);
    			insert_dev(target, div5, anchor);
    			append_dev(div5, center4);
    			append_dev(center4, h10);
    			append_dev(center4, t21);
    			append_dev(center4, p2);
    			append_dev(center4, t23);
    			append_dev(center4, a1);
    			insert_dev(target, t25, anchor);
    			insert_dev(target, div6, anchor);
    			append_dev(div6, center5);
    			append_dev(center5, h11);
    			append_dev(center5, t27);
    			append_dev(center5, p3);
    			append_dev(center5, t29);
    			append_dev(center5, a2);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*$data*/ 1 && !src_url_equal(img.src, img_src_value = "https://cdn.discordapp.com/avatars/" + /*$data*/ ctx[0].discord_user.id + "/" + /*$data*/ ctx[0].discord_user.avatar + ".png")) {
    				attr_dev(img, "src", img_src_value);
    			}

    			if (dirty & /*$data*/ 1 && img_alt_value !== (img_alt_value = /*$data*/ ctx[0].discord_user.username)) {
    				attr_dev(img, "alt", img_alt_value);
    			}

    			if (/*$data*/ ctx[0].discord_status === 'dnd') {
    				if (if_block0) ; else {
    					if_block0 = create_if_block_4(ctx);
    					if_block0.c();
    					if_block0.m(div0, t1);
    				}
    			} else if (if_block0) {
    				if_block0.d(1);
    				if_block0 = null;
    			}

    			if (/*$data*/ ctx[0].discord_status === 'online') {
    				if (if_block1) ; else {
    					if_block1 = create_if_block_3(ctx);
    					if_block1.c();
    					if_block1.m(div0, t2);
    				}
    			} else if (if_block1) {
    				if_block1.d(1);
    				if_block1 = null;
    			}

    			if (/*$data*/ ctx[0].discord_status === 'idle') {
    				if (if_block2) ; else {
    					if_block2 = create_if_block_2(ctx);
    					if_block2.c();
    					if_block2.m(div0, t3);
    				}
    			} else if (if_block2) {
    				if_block2.d(1);
    				if_block2 = null;
    			}

    			if (/*$data*/ ctx[0].discord_status === 'offline') {
    				if (if_block3) ; else {
    					if_block3 = create_if_block_1(ctx);
    					if_block3.c();
    					if_block3.m(div0, null);
    				}
    			} else if (if_block3) {
    				if_block3.d(1);
    				if_block3 = null;
    			}

    			if (dirty & /*$data*/ 1 && t5_value !== (t5_value = /*$data*/ ctx[0].discord_user.username + "")) set_data_dev(t5, t5_value);
    			if (dirty & /*$data*/ 1 && t8_value !== (t8_value = /*$data*/ ctx[0].discord_user.discriminator + "")) set_data_dev(t8, t8_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div0);
    			if (if_block0) if_block0.d();
    			if (if_block1) if_block1.d();
    			if (if_block2) if_block2.d();
    			if (if_block3) if_block3.d();
    			if (detaching) detach_dev(t4);
    			if (detaching) detach_dev(div1);
    			if (detaching) detach_dev(t11);
    			if (detaching) detach_dev(div2);
    			if (detaching) detach_dev(t13);
    			if (detaching) detach_dev(div3);
    			if (detaching) detach_dev(t17);
    			if (detaching) detach_dev(div4);
    			if (detaching) detach_dev(t19);
    			if (detaching) detach_dev(div5);
    			if (detaching) detach_dev(t25);
    			if (detaching) detach_dev(div6);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block.name,
    		type: "if",
    		source: "(7:1) {#if $data}",
    		ctx
    	});

    	return block;
    }

    // (11:2) {#if $data.discord_status === 'dnd'}
    function create_if_block_4(ctx) {
    	let div;

    	const block = {
    		c: function create() {
    			div = element("div");
    			attr_dev(div, "class", "bg-red-500 rounded-full w-6 h-6 absolute ml-auto mr-auto left-24 right-52 mt-44 border-solid border-[#2A2A2A] border-4");
    			add_location(div, file, 11, 2, 420);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_4.name,
    		type: "if",
    		source: "(11:2) {#if $data.discord_status === 'dnd'}",
    		ctx
    	});

    	return block;
    }

    // (14:2) {#if $data.discord_status === 'online'}
    function create_if_block_3(ctx) {
    	let div;

    	const block = {
    		c: function create() {
    			div = element("div");
    			attr_dev(div, "class", "bg-green-500 rounded-full w-6 h-6 absolute ml-auto mr-auto left-24 right-52 mt-44 border-solid border-[#2A2A2A] border-4");
    			add_location(div, file, 14, 2, 610);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_3.name,
    		type: "if",
    		source: "(14:2) {#if $data.discord_status === 'online'}",
    		ctx
    	});

    	return block;
    }

    // (17:2) {#if $data.discord_status === 'idle'}
    function create_if_block_2(ctx) {
    	let div;

    	const block = {
    		c: function create() {
    			div = element("div");
    			attr_dev(div, "class", "bg-yellow-500 rounded-full w-6 h-6 absolute ml-auto mr-auto left-24 right-52 mt-44 border-solid border-[#2A2A2A] border-4");
    			add_location(div, file, 17, 2, 800);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_2.name,
    		type: "if",
    		source: "(17:2) {#if $data.discord_status === 'idle'}",
    		ctx
    	});

    	return block;
    }

    // (20:2) {#if $data.discord_status === 'offline'}
    function create_if_block_1(ctx) {
    	let div;

    	const block = {
    		c: function create() {
    			div = element("div");
    			attr_dev(div, "class", "bg-gray-500 rounded-full w-6 h-6 absolute ml-auto mr-auto left-24 right-52 mt-44 border-solid border-[#2A2A2A] border-4");
    			add_location(div, file, 20, 2, 994);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1.name,
    		type: "if",
    		source: "(20:2) {#if $data.discord_status === 'offline'}",
    		ctx
    	});

    	return block;
    }

    function create_fragment(ctx) {
    	let main;

    	function select_block_type(ctx, dirty) {
    		if (/*$data*/ ctx[0]) return create_if_block;
    		return create_else_block;
    	}

    	let current_block_type = select_block_type(ctx);
    	let if_block = current_block_type(ctx);

    	const block = {
    		c: function create() {
    			main = element("main");
    			if_block.c();
    			add_location(main, file, 5, 0, 131);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, main, anchor);
    			if_block.m(main, null);
    		},
    		p: function update(ctx, [dirty]) {
    			if (current_block_type === (current_block_type = select_block_type(ctx)) && if_block) {
    				if_block.p(ctx, dirty);
    			} else {
    				if_block.d(1);
    				if_block = current_block_type(ctx);

    				if (if_block) {
    					if_block.c();
    					if_block.m(main, null);
    				}
    			}
    		},
    		i: noop$1,
    		o: noop$1,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(main);
    			if_block.d();
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
    	let $data;
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('App', slots, []);
    	const data = useLanyard("831903326748540928");
    	validate_store(data, 'data');
    	component_subscribe($$self, data, value => $$invalidate(0, $data = value));
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<App> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({ useLanyard, data, $data });
    	return [$data, data];
    }

    class App extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance, create_fragment, safe_not_equal$1, {});

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

    return app;

})();
//# sourceMappingURL=bundle.js.map
