import { getGtmContainerId } from "./config";
import {
  ANALYTICS_CONSENT_STORAGE_KEY,
  ANALYTICS_CONSENT_VERSION,
} from "./consent";

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

  return `(function(w,d,i){w.dataLayer=w.dataLayer||[];if(d.getElementById("google-tag-manager"))return;w.dataLayer.push({"gtm.start":new Date().getTime(),event:"gtm.js"});var script=d.createElement("script");script.id="google-tag-manager";script.async=true;script.src="https://www.googletagmanager.com/gtm.js?id="+i;(d.head||d.documentElement).appendChild(script);})(window,document,${JSON.stringify(containerId)});`;
}
