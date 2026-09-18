import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
import { test } from "node:test";

const root = path.resolve(import.meta.dirname, "../..");
const read = name => fs.readFileSync(path.join(root, name), "utf8");
function route(search, hash = "") {
  let target = null;
  vm.runInNewContext(read("js/platform/frontdoor.js"), { URLSearchParams, window: { location: { search, hash, replace: value => { target = value; } } } });
  return target;
}
test("plain home stays a platform page even with unrelated queries", () => {
  assert.equal(route(""), null);
  assert.equal(route("?utm_source=sample"), null);
});
test("old token URLs preserve exact token query, extra parameters and fragment", () => {
  assert.equal(route("?token=a%2Bb&from=old", "#report"), "/villain.html?token=a%2Bb&from=old#report");
  assert.equal(route("?token="), "/villain.html?token=");
  assert.equal(route("?token=scl-token&test=scl90"), "/villain.html?token=scl-token&test=scl90");
  assert.equal(route("?test=villain"), "/villain.html?test=villain");
});

// Small DOM model for public catalog behavior; production JS is executed unchanged.
class Node {
  constructor(tag = "div") { this.tag = tag; this.children = []; this.textContent = ""; }
  append(...nodes) { this.children.push(...nodes); }
  replaceChildren(...nodes) { this.children = nodes; }
}
function render(definitions, search = "") {
  const nodes = { "product-list": new Node(), "product-detail": new Node() };
  const document = { getElementById: id => nodes[id] || null, querySelector: () => null, addEventListener() {}, createElement: tag => new Node(tag) };
  const registry = definitions && { list: () => definitions, get: id => definitions.find(item => item.test_id === id) };
  vm.runInNewContext(read("js/platform/site.js"), { document, TestRegistry: registry, URLSearchParams, window: { location: { search } } });
  return nodes;
}
function text(node) { return [node.textContent, ...node.children.map(text)].join(" "); }
const product = { test_id:"new-product", name:"Future product", enabled:true, publicAccessPath:"/access.html?test=new-product" };
test("catalog auto-discovers future products and excludes disabled or unlisted products", () => {
  const nodes = render([product, {...product, test_id:"off",enabled:false}, {...product,test_id:"hidden",listed:false}]);
  assert.equal(nodes["product-list"].children.length, 1);
  assert.match(text(nodes["product-list"]), /Future product/);
});
test("empty and unavailable registries show useful states", () => {
  assert.match(text(render([])["product-list"]), /暂无开放/);
  assert.match(text(render(null)["product-list"]), /暂时无法加载/);
});
test("unknown and hidden product details fail closed", () => {
  assert.match(text(render([product],"?test=unknown")["product-detail"]), /没有找到/);
  assert.match(text(render([{...product,listed:false}],"?test=new-product")["product-detail"]), /没有找到/);
});
test("disabled detail never offers public start, but acknowledges existing links", () => {
  assert.match(text(render([{...product,enabled:false}],"?test=new-product")["product-detail"]), /暂未开放/);
  assert.doesNotMatch(text(render([{...product,enabled:false}],"?test=new-product")["product-detail"]), /使用公共授权码/);
});
test("public authorization follows product launch path only after successful verification", async () => {
  for (const [id, target] of [["villain", "/villain.html"],["scl90","/scl90/"]]) {
    const nodes = Object.fromEntries(["accessCodeInput","enterTestBtn","accessStatusText","accessTitle"].map(key=>[key,{value:"OPEN",addEventListener(){}}]));
    const definition = {test_id:id,name:id,enabled:true,entryPath:id==="villain"?"/":"/scl90/",...(id==="villain"?{launchPath:"/villain.html"}:{})};
    const location = {search:`?test=${id}`,href:null};
    const sandbox = {document:{getElementById:key=>nodes[key]},window:{location},URLSearchParams,TestRegistry:{get:()=>definition},sessionStorage:{setItem(){}},fetch:async()=>({ok:true,json:async()=>({success:true})})};
    vm.runInNewContext(read("js/access.js"), sandbox);
    await nodes.enterTestBtn.onclick();
    assert.equal(location.href,target);
    location.href=null;
    sandbox.fetch=async()=>({ok:false,json:async()=>({success:false,message:"公共通道关闭"})});
    await nodes.enterTestBtn.onclick();
    assert.equal(location.href,null);
    assert.match(nodes.accessStatusText.textContent,/公共通道关闭/);
  }
});
test("public pages have all local script/style dependencies and no product Runtime on home", () => {
  for (const file of ["index.html","test.html","access.html","villain.html"]) {
    for (const match of read(file).matchAll(/(?:src|href)="([^"?#]+\.(?:js|css))"/g)) {
      assert.ok(fs.existsSync(path.join(root,match[1].replace(/^\//,""))),`${file}: ${match[1]}`);
    }
  }
  assert.doesNotMatch(read("index.html"),/src="[^\"]*(?:js\/app.js|runtime.js)"/);
  assert.match(read("villain.html"),/src="js\/app.js"/);
});
