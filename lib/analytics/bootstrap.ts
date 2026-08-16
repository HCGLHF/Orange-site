import { getGtmContainerId } from "./config";
import {
  ANALYTICS_CONSENT_STORAGE_KEY,
  ANALYTICS_CONSENT_VERSION,
} from "./consent";

export const GTM_MIN_REQUEST_TIME_MS = 4000;
export const GTM_LCP_BUFFER_MS = 1000;
export const GTM_MAX_REQUEST_TIME_MS = 8000;

export function buildAnalyticsHeadScript(): string {
  const storageKey = JSON.stringify(ANALYTICS_CONSENT_STORAGE_KEY);
  const version = JSON.stringify(ANALYTICS_CONSENT_VERSION);

  return `(function(w){
w.dataLayer=w.dataLayer||[];
w.gtag=function(){w.dataLayer.push(arguments);};
w.gtag("consent","default",{analytics_storage:"denied",ad_storage:"denied",ad_user_data:"denied",ad_personalization:"denied"});
var status={choice:null,error:null};
try{
var raw=w.localStorage.getItem(${storageKey});
if(raw!==null){
try{
var saved=JSON.parse(raw);
var keys=saved&&typeof saved==="object"&&!Array.isArray(saved)?Object.keys(saved):[];
if(keys.length===2&&keys.indexOf("version")!==-1&&keys.indexOf("analytics")!==-1&&saved.version===${version}&&(saved.analytics==="granted"||saved.analytics==="denied")){
status.choice=saved.analytics;
w.gtag("consent","update",{analytics_storage:saved.analytics,ad_storage:"denied",ad_user_data:"denied",ad_personalization:"denied"});
}else{status.error="invalid_value";}
}catch(e){status.error="invalid_value";}
}
}catch(e){status.error="storage_unavailable";}
w.gtag("set","allow_ad_personalization_signals",false);
w.gtag("set","ads_data_redaction",true);
w.__orangeAnalyticsBootstrap=status;
})(window);`;
}

export function buildGtmBootstrap(id: string): string {
  const containerId = getGtmContainerId(id);
  if (!containerId) throw new Error("Invalid GTM container ID");

  return `(function(w,d,i){w.dataLayer=w.dataLayer||[];w.dataLayer.push({"gtm.start":new Date().getTime(),event:"gtm.js"});var timer=0,lastLcp=0,loaded=false,terminal=false,finalized=false,everVisible=d.visibilityState!=="hidden",deadline=everVisible?w.performance.now()+${GTM_MAX_REQUEST_TIME_MS}:0,observer=null;function eligibleAt(){return Math.max(${GTM_MIN_REQUEST_TIME_MS},lastLcp+${GTM_LCP_BUFFER_MS});}function finish(){if(terminal)return;terminal=true;w.clearTimeout(timer);if(observer&&observer.disconnect)observer.disconnect();w.removeEventListener("pointerdown",finalize,true);w.removeEventListener("keydown",finalize,true);w.removeEventListener("touchstart",finalize,true);w.removeEventListener("pagehide",finalize,true);d.removeEventListener("visibilitychange",visibilityChange);}function load(){if(terminal||loaded)return;if(d.getElementById("google-tag-manager")){finish();return;}var now=w.performance.now();if(!finalized&&(!deadline||now<deadline)){schedule();return;}if(finalized&&now<eligibleAt()){schedule();return;}var script=d.createElement("script");script.id="google-tag-manager";script.async=true;script.src="https://www.googletagmanager.com/gtm.js?id="+i;script.setAttribute("data-orange-loaded-at",String(w.performance.now()));loaded=true;finish();(d.head||d.documentElement).appendChild(script);}function schedule(){if(terminal||loaded)return;w.clearTimeout(timer);var target=finalized?eligibleAt():deadline;if(!target)return;timer=w.setTimeout(load,Math.max(0,Math.ceil(target-w.performance.now())));}function finalize(){if(terminal||finalized)return;finalized=true;schedule();}function visibilityChange(){if(d.visibilityState==="visible"){if(!everVisible){everVisible=true;deadline=w.performance.now()+${GTM_MAX_REQUEST_TIME_MS};schedule();}}else if(everVisible){finalize();}}w.addEventListener("pointerdown",finalize,{capture:true,once:true,passive:true});w.addEventListener("keydown",finalize,{capture:true,once:true,passive:true});w.addEventListener("touchstart",finalize,{capture:true,once:true,passive:true});w.addEventListener("pagehide",finalize,{capture:true,once:true,passive:true});d.addEventListener("visibilitychange",visibilityChange);if(w.PerformanceObserver){try{observer=new w.PerformanceObserver(function(list){var entries=list.getEntries();for(var index=0;index<entries.length;index+=1){lastLcp=Math.max(lastLcp,entries[index].startTime||0);}schedule();});observer.observe({type:"largest-contentful-paint",buffered:true});}catch(error){}}schedule();})(window,document,${JSON.stringify(containerId)});`;
}
