import { getGtmContainerId } from "./config";
import {
  ANALYTICS_CONSENT_STORAGE_KEY,
  ANALYTICS_CONSENT_VERSION,
} from "./consent";

export const GTM_MIN_REQUEST_TIME_MS = 4000;
export const GTM_LCP_BUFFER_MS = 1000;

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

  return `(function(w,d,i){w.dataLayer=w.dataLayer||[];w.dataLayer.push({"gtm.start":new Date().getTime(),event:"gtm.js"});var timer=0,lastLcp=0,loaded=false,stopped=false;function eligibleAt(){return Math.max(${GTM_MIN_REQUEST_TIME_MS},lastLcp+${GTM_LCP_BUFFER_MS});}function load(){if(loaded||stopped)return;if(d.getElementById("google-tag-manager")){stopped=true;return;}if(w.performance.now()<eligibleAt()){schedule();return;}var script=d.createElement("script");script.id="google-tag-manager";script.async=true;script.src="https://www.googletagmanager.com/gtm.js?id="+i;script.setAttribute("data-orange-loaded-at",String(w.performance.now()));loaded=true;(d.head||d.documentElement).appendChild(script);}function schedule(){if(loaded||stopped)return;w.clearTimeout(timer);timer=w.setTimeout(load,Math.max(0,Math.ceil(eligibleAt()-w.performance.now())));}if(w.PerformanceObserver){try{var observer=new w.PerformanceObserver(function(list){var entries=list.getEntries();for(var index=0;index<entries.length;index+=1){lastLcp=Math.max(lastLcp,entries[index].startTime||0);}schedule();});observer.observe({type:"largest-contentful-paint",buffered:true});}catch(error){}}schedule();})(window,document,${JSON.stringify(containerId)});`;
}
