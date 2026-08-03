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
w.gtag("set","allow_ad_personalization_signals",false);
w.gtag("set","ads_data_redaction",true);
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
w.__orangeAnalyticsBootstrap=status;
})(window);`;
}

export function buildGtmBootstrap(id: string): string {
  const containerId = getGtmContainerId(id);
  if (!containerId) throw new Error("Invalid GTM container ID");

  return `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({"gtm.start":new Date().getTime(),event:"gtm.js"});var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!=="dataLayer"?"&l="+l:"";j.async=true;j.src="https://www.googletagmanager.com/gtm.js?id="+i+dl;f.parentNode.insertBefore(j,f);})(window,document,"script","dataLayer",${JSON.stringify(containerId)});`;
}
