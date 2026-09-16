(function initializeScl90ReportExport(global, factory) {
  "use strict";
  const api = factory();
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  if (global) global.Scl90ReportExport = api;
})(typeof globalThis !== "undefined" ? globalThis : this, function createScl90ReportExport() {
  "use strict";
  const DEFAULT_LIMITS = Object.freeze({ preferredScale: 2, minimumScale: 0.5, maxDimension: 16384, maxArea: 16000000 });
  const EXCLUDE_SELECTORS = Object.freeze([".report-actions", ".preview-toast", ".export-exclude", "[data-export-exclude]"]);
  function fail(code, message) { const error=new Error(message);error.code=code;throw error; }
  function calculateScale(input) {
    const values={...DEFAULT_LIMITS,...input};const width=Number(values.reportWidth);const height=Number(values.reportHeight);const preferred=Number(values.preferredScale);const minimum=Number(values.minimumScale);const maxDimension=Number(values.maxDimension);const maxArea=Number(values.maxArea);
    if(![width,height,preferred,minimum,maxDimension,maxArea].every(Number.isFinite)||width<=0||height<=0||preferred<=0||minimum<=0||minimum>preferred||maxDimension<=0||maxArea<=0)fail("INVALID_EXPORT_DIMENSIONS","Invalid report export dimensions.");
    const scaleByDimension=Math.min(maxDimension/width,maxDimension/height);const scaleByArea=Math.sqrt(maxArea/(width*height));const safeScale=Math.min(preferred,scaleByDimension,scaleByArea);const finalScale=Math.floor(safeScale*1000)/1000;
    if(finalScale<minimum)fail("EXPORT_TOO_LARGE","Report is too large for a safe complete PNG export.");
    const estimatedCanvasWidth=Math.ceil(width*finalScale);const estimatedCanvasHeight=Math.ceil(height*finalScale);const estimatedCanvasArea=estimatedCanvasWidth*estimatedCanvasHeight;
    if(estimatedCanvasWidth>maxDimension||estimatedCanvasHeight>maxDimension||estimatedCanvasArea>maxArea)fail("EXPORT_LIMIT_EXCEEDED","Calculated canvas exceeds safe export limits.");
    return Object.freeze({ reportWidth:width, reportHeight:height, preferredScale:preferred, safeScale, finalScale, estimatedCanvasWidth, estimatedCanvasHeight, estimatedCanvasArea, maxDimension, maxArea, reduced:finalScale<preferred });
  }
  function createLock() {
    let active=false;
    return Object.freeze({ get active(){return active;}, async run(task){if(active)fail("EXPORT_IN_PROGRESS","A report export is already in progress.");active=true;try{return await task();}finally{active=false;}} });
  }
  function pad(value){return String(value).padStart(2,"0");}
  function buildFilename(date) { const d=date instanceof Date?date:new Date(date);if(Number.isNaN(d.getTime()))fail("INVALID_EXPORT_DATE","Invalid report export date.");return `scl90-report-${d.getFullYear()}${pad(d.getMonth()+1)}${pad(d.getDate())}-${pad(d.getHours())}${pad(d.getMinutes())}.png`; }
  function shouldExclude(element){return Boolean(element&&typeof element.matches==="function"&&EXCLUDE_SELECTORS.some(selector=>element.matches(selector)));}
  function canvasToBlob(canvas){return new Promise((resolve,reject)=>{if(!canvas||typeof canvas.toBlob!=="function")return reject(Object.assign(new Error("Canvas Blob export is unavailable."),{code:"BLOB_UNAVAILABLE"}));canvas.toBlob(blob=>blob?resolve(blob):reject(Object.assign(new Error("Canvas returned an empty PNG Blob."),{code:"EMPTY_BLOB"})),"image/png");});}
  async function createPng(options) {
    const root=options.root;const document=options.document;const window=options.window;const renderer=options.html2canvas;
    if(!root||!document||!window||typeof renderer!=="function")fail("EXPORT_UNAVAILABLE","Report export is unavailable.");
    if(document.fonts&&document.fonts.ready)await document.fonts.ready;
    root.classList.add("scl90-export-mode");document.documentElement.classList.add("scl90-export-active");
    try{
      const rect=root.getBoundingClientRect();const reportWidth=Math.ceil(Math.max(rect.width,root.scrollWidth));const reportHeight=Math.ceil(Math.max(rect.height,root.scrollHeight));const preferredScale=Math.min(Number(options.preferredScale)||DEFAULT_LIMITS.preferredScale,2);
      const plan=calculateScale({...options.limits,reportWidth,reportHeight,preferredScale});
      const canvas=await renderer(root,{scale:plan.finalScale,backgroundColor:"#f1f2f6",useCORS:true,logging:false,width:reportWidth,height:reportHeight,scrollX:0,scrollY:0,windowWidth:reportWidth,ignoreElements:shouldExclude});
      if(!canvas||canvas.width<1||canvas.height<1||canvas.width>plan.maxDimension||canvas.height>plan.maxDimension||canvas.width*canvas.height>plan.maxArea)fail("INVALID_CANVAS","Generated canvas is empty or outside safe limits.");
      const blob=await canvasToBlob(canvas);return Object.freeze({blob,canvasWidth:canvas.width,canvasHeight:canvas.height,blobSize:blob.size,filename:buildFilename(options.now||new Date()),plan});
    }finally{root.classList.remove("scl90-export-mode");document.documentElement.classList.remove("scl90-export-active");}
  }
  async function downloadPng(options) {
    const result=await createPng(options);const url=options.window.URL.createObjectURL(result.blob);const link=options.document.createElement("a");link.href=url;link.download=result.filename;link.hidden=true;options.document.body.appendChild(link);
    try{link.click();}finally{link.remove();options.window.setTimeout(()=>options.window.URL.revokeObjectURL(url),1000);}
    return result;
  }
  function install(options) {
    const button=options.button;const lock=createLock();const normalText=button.textContent;
    async function handle(){try{await lock.run(async()=>{button.disabled=true;button.dataset.exportState="generating";button.textContent="正在生成报告图片…";const result=await downloadPng(options);button.dataset.exportState="success";button.textContent="报告图片已生成";if(options.onSuccess)options.onSuccess(result);});}catch(error){button.dataset.exportState=error.code==="EXPORT_IN_PROGRESS"?"generating":"failure";button.textContent=error.code==="EXPORT_IN_PROGRESS"?"正在生成报告图片…":"生成失败，请重试";if(error.code!=="EXPORT_IN_PROGRESS"&&options.onError)options.onError(error);}finally{if(!lock.active){button.disabled=false;options.window.setTimeout(()=>{if(!lock.active){button.dataset.exportState="normal";button.textContent=normalText;}},2400);}}}
    button.dataset.exportState="normal";button.addEventListener("click",handle);return Object.freeze({handle,lock});
  }
  return Object.freeze({ DEFAULT_LIMITS, EXCLUDE_SELECTORS, calculateScale, createLock, buildFilename, shouldExclude, canvasToBlob, createPng, downloadPng, install });
});
